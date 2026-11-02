const WBS_STATUSES = ["Planned", "Draft", "In Review", "Completed"];

router.register("wbs", async function (projectId, domainId = null) {
    const project = await loadProject(projectId);
    if (!project) {
        document.getElementById("main-view").innerHTML = "<h2>No project selected.</h2>";
        return;
    }
    project.wbs = Array.isArray(project.wbs) ? project.wbs : [];
    const domains = getProjectRbsDomains(project);
    const selected = domains.find(domain => domain.id === domainId) || domains[0] || null;
    if (!selected) {
        document.getElementById("main-view").innerHTML = `<button class="btn back-btn" onclick="goBack()">← Back</button><h2>Work Breakdown</h2><p>Create a domain in Resource Breakdown before adding Work Breakdown rows.</p>`;
        return;
    }
    await renderWbsPage(project, selected.id);
});

function getProjectRbsNodes(project) {
    if (Array.isArray(project.rbs)) return project.rbs;
    if (Array.isArray(project.rbs?.nodes)) return project.rbs.nodes;
    const view = (project.rbs?.views || []).find(item => item.id === project.rbs.defaultViewId) || (project.rbs?.views || [])[0];
    return view?.nodes || [];
}

function getProjectRbsDomains(project) {
    const nodes = getProjectRbsNodes(project);
    const byId = new Map(nodes.map(node => [node.id, node]));
    return nodes.filter(node => node.ownsDomain || node.type === "domain").map(node => {
        const names = [];
        let current = node;
        const seen = new Set();
        while (current && !seen.has(current.id)) {
            seen.add(current.id);
            if (current.ownsDomain || current.type === "domain") names.unshift(current.domain || current.label || "Untitled Domain");
            current = byId.get(current.parentId);
        }
        return { id: node.id, name: node.domain || node.label || "Untitled Domain", path: names.join(" > ") };
    });
}

function getProjectRbsResources(project) {
    const nodes = getProjectRbsNodes(project);
    return [...new Set(nodes.filter(node => !(node.type === "domain") && (node.name || node.title || node.label)).map(node => {
        const name = String(node.name || "").trim();
        const role = String(node.title || node.label || "").trim();
        return name && role ? `${name} (${role})` : name || role;
    }).filter(Boolean))].sort();
}

async function getProjectMilestoneOptions(project) {
    const options = [];
    if (Array.isArray(project.milestoneTypes)) {
        options.push(...project.milestoneTypes.flatMap(type => (type.rows || []).map(row => ({
            value: row.id,
            label: `Project - ${type.name}: ${row.name || "Untitled"}${row.dueDate ? ` (${row.dueDate})` : ""}`
        }))));
    }
    if (!project.programId) return options;
    const program = await loadProgram(project.programId);
    if (!program) return options;
    if (Array.isArray(program.milestoneTypes)) {
        options.push(...program.milestoneTypes.flatMap(type => (type.rows || []).map(row => ({
            value: row.id,
            label: `Program - ${type.name}: ${row.name || "Untitled"}${row.dueDate ? ` (${row.dueDate})` : ""}`
        }))));
    }
    return options;
}async function renderWbsPage(project, domainId) {
    const domains = getProjectRbsDomains(project);
    const domain = domains.find(item => item.id === domainId);
    if (!domain) return router.navigate("wbs", project.id);
    const resources = getProjectRbsResources(project);
    const milestoneOptions = await getProjectMilestoneOptions(project);
    const allRows = project.wbs || [];
    const rows = allRows.filter(row => row.domainId === domainId);
    const container = document.getElementById("main-view");
    container.innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
        <h2>Work Breakdown: ${wbsEscape(domain.path)}</h2>
        <div class="table-actions"><button class="btn btn-primary" id="wbs-add-row-btn">Add Row (+)</button></div>
        <div class="wbs-table-wrap"><table class="wbs-domain-table"><thead><tr>
            <th>Work Product</th><th>Responsible</th><th>Start Date</th><th>Planned Due Date</th><th>Actual Due Date</th><th>Applicable Milestone</th><th>Storage Location</th><th>Status</th><th>Prerequisite</th><th>Actions</th>
        </tr></thead><tbody>${rows.length ? rows.map((row,index) => renderWbsRow(row,index,rows,allRows,resources,milestoneOptions)).join("") : '<tr class="wbs-empty"><td colspan="10">No work products in this domain. Select Add Row (+) to begin.</td></tr>'}</tbody></table></div>`;
    document.getElementById("wbs-add-row-btn").onclick = async () => {
        allRows.push({ id: generateId("wbs"), domainId, domain: domain.path, workProduct:"", responsible:"", startDate:"", plannedDate:"", actualDate:"", milestone:"", storageLocation:"", status:"Planned", prerequisite:null });
        project.wbs = allRows; await saveProject(project); await renderWbsPage(project,domainId);
    };
    wireWbsTable(project,domainId);
}

function renderWbsRow(row,index,domainRows,allRows,resources,milestones) {
    const otherProducts = allRows.filter(item => item.id !== row.id && String(item.workProduct || "").trim());
    return `<tr class="wbs-row" data-row-id="${row.id}">
        <td><input class="wbs-work-product" value="${wbsEscape(row.workProduct || "")}" placeholder="Enter work product"></td>
        <td><select class="wbs-responsible"><option value="">Select resource</option>${resources.map(resource => `<option ${row.responsible===resource?"selected":""}>${wbsEscape(resource)}</option>`).join("")}</select></td>
        <td><input class="wbs-start-date" type="date" value="${wbsEscape(row.startDate || "")}"></td>
        <td><input class="wbs-planned-date" type="date" value="${wbsEscape(row.plannedDate || "")}"></td>
        <td><input class="wbs-actual-date" type="date" value="${wbsEscape(row.actualDate || "")}"></td>
        <td><select class="wbs-milestone"><option value="">None</option>${milestones.map(item => `<option value="${item.value}" ${row.milestone===item.value?"selected":""}>${wbsEscape(item.label)}</option>`).join("")}</select></td>
        <td><input class="wbs-storage" value="${wbsEscape(row.storageLocation || "")}" placeholder="Enter storage location"></td>
        <td><select class="wbs-status">${WBS_STATUSES.map(status => `<option ${row.status===status?"selected":""}>${status}</option>`).join("")}</select></td>
        <td><select class="wbs-prerequisite"><option value="">None</option>${otherProducts.map(item => `<option value="${item.id}" ${row.prerequisite===item.id?"selected":""}>${wbsEscape(item.workProduct)}</option>`).join("")}</select></td>
        <td class="wbs-actions"><button class="btn wbs-up" title="Move up" ${index===0?"disabled":""}>↑</button><button class="btn wbs-down" title="Move down" ${index===domainRows.length-1?"disabled":""}>↓</button><button class="btn btn-danger wbs-delete" title="Delete">Delete</button></td>
    </tr>`;
}

function wireWbsTable(project,domainId) {
    const table = document.querySelector(".wbs-domain-table");
    if (!table) return;
    const saveField = async (element,field) => {
        const row = project.wbs.find(item => item.id === element.closest("tr").dataset.rowId); if (!row) return;
        row[field] = element.value || (field === "prerequisite" ? null : ""); row.updatedAt = Date.now(); await saveProject(project);
    };
    const bindings = { ".wbs-work-product":"workProduct", ".wbs-responsible":"responsible", ".wbs-start-date":"startDate", ".wbs-planned-date":"plannedDate", ".wbs-actual-date":"actualDate", ".wbs-milestone":"milestone", ".wbs-storage":"storageLocation", ".wbs-status":"status", ".wbs-prerequisite":"prerequisite" };
    Object.entries(bindings).forEach(([selector,field]) => table.querySelectorAll(selector).forEach(element => { element.onchange = () => saveField(element,field); element.onblur = () => saveField(element,field); }));
    table.querySelectorAll(".wbs-delete").forEach(button => button.onclick = async () => {
        const id=button.closest("tr").dataset.rowId; const row=project.wbs.find(item=>item.id===id); if(!row) return;
        if(!confirm(`Delete the work product "${row.workProduct || "Untitled"}"?`)) return;
        project.wbs=project.wbs.filter(item=>item.id!==id); project.wbs.forEach(item=>{if(item.prerequisite===id)item.prerequisite=null;}); await saveProject(project); await renderWbsPage(project,domainId);
    });
    const move = async (button,direction) => {
        const id=button.closest("tr").dataset.rowId, globalIndex=project.wbs.findIndex(item=>item.id===id), domainRows=project.wbs.filter(item=>item.domainId===domainId), localIndex=domainRows.findIndex(item=>item.id===id), target=domainRows[localIndex+direction]; if(!target)return;
        const targetGlobal=project.wbs.findIndex(item=>item.id===target.id); [project.wbs[globalIndex],project.wbs[targetGlobal]]=[project.wbs[targetGlobal],project.wbs[globalIndex]]; await saveProject(project); await renderWbsPage(project,domainId);
    };
    table.querySelectorAll(".wbs-up").forEach(button=>button.onclick=()=>move(button,-1)); table.querySelectorAll(".wbs-down").forEach(button=>button.onclick=()=>move(button,1));
}

function wbsEscape(value) { return String(value ?? "").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]); }
