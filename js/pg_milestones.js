router.register("program-milestones", async function (programId) {
    const program = await loadProgram(programId);
    if (!program) return document.getElementById("main-view").innerHTML = "<h2>No program selected.</h2>";
    normaliseMilestoneTypes(program);
    await saveProgram(program);
    renderMilestonesPage(program);
});

function normaliseMilestoneTypes(program) {
    if (Array.isArray(program.milestoneTypes)) return;
    const legacy = Array.isArray(program.milestones) ? program.milestones : [];
    program.milestoneTypes = legacy.length ? [{ id:generateId("milestone-type"), name:"Milestones", rows:legacy.map(item=>({ id:item.id||generateId("milestone"), name:item.name||"", dueDate:item.dueDate||"" })) }] : [];
}

function renderMilestonesPage(program) {
    const tables = program.milestoneTypes.map(type => `
        <section class="milestone-type-card" data-type-id="${type.id}"><h3>${milestoneEscape(type.name)}</h3>
        <div class="milestone-table-wrap"><table class="milestone-type-table"><thead><tr><th>${milestoneEscape(type.name)}</th><th>Due Date</th><th>Action</th></tr></thead><tbody>
        ${(type.rows||[]).length ? type.rows.map(row=>`<tr data-row-id="${row.id}"><td><input class="milestone-name" value="${milestoneEscape(row.name||"")}" placeholder="Enter milestone"></td><td><input class="milestone-date" type="date" value="${milestoneEscape(row.dueDate||"")}"></td><td class="milestone-actions"><button class="btn milestone-add-row">Add</button><button class="btn btn-danger milestone-delete-row">Delete</button></td></tr>`).join("") : `<tr class="milestone-empty"><td colspan="3"><button class="btn milestone-add-row">Add first row</button></td></tr>`}
        </tbody></table></div></section>`).join("");
    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button><h2>Program Milestones: ${milestoneEscape(program.name)}</h2>
        <div class="milestone-toolbar"><button class="btn btn-primary" id="create-milestone-type">Create New Milestone Type (+)</button><button class="btn" id="delete-milestone-type">Delete Milestone Type</button></div>
        <div class="milestone-types-grid">${tables || '<p>No milestone types created yet.</p>'}</div>`;
    document.getElementById("create-milestone-type").onclick=()=>createMilestoneType(program);
    document.getElementById("delete-milestone-type").onclick=()=>openDeleteMilestoneType(program);
    wireMilestoneTables(program);
}

function createMilestoneType(program) {
    const name=prompt("New Milestone Type:"); if(name===null)return; const clean=name.trim(); if(!clean)return alert("Enter a milestone type name.");
    if(program.milestoneTypes.some(type=>type.name.toLowerCase()===clean.toLowerCase()))return alert("That milestone type already exists.");
    program.milestoneTypes.push({id:generateId("milestone-type"),name:clean,rows:[]}); saveProgram(program).then(()=>renderMilestonesPage(program));
}

function openDeleteMilestoneType(program) {
    if(!program.milestoneTypes.length)return alert("No milestone types are available to delete.");
    const bg=document.createElement("div"); bg.className="milestone-dialog-bg"; bg.innerHTML=`<form class="milestone-dialog"><h3>Delete Milestone Type</h3><label>Select milestone type<select id="delete-milestone-select">${program.milestoneTypes.map(type=>`<option value="${type.id}">${milestoneEscape(type.name)}</option>`).join("")}</select></label><div class="milestone-dialog-actions"><button type="button" class="btn" id="milestone-dialog-cancel">Cancel</button><button class="btn btn-danger">Delete</button></div></form>`; document.body.appendChild(bg);
    const close=()=>bg.remove(); document.getElementById("milestone-dialog-cancel").onclick=close; bg.onclick=e=>{if(e.target===bg)close();};
    bg.querySelector("form").onsubmit=async event=>{event.preventDefault(); const id=document.getElementById("delete-milestone-select").value, type=program.milestoneTypes.find(item=>item.id===id); if(!type)return close();
        const used=await milestoneTypeIsUsed(program,type); if(used)return alert("This milestone type or one of its milestone values is being used in planning and cannot be deleted.");
        if(!confirm(`Delete the milestone type "${type.name}"?`))return; program.milestoneTypes=program.milestoneTypes.filter(item=>item.id!==id); await saveProgram(program); close(); renderMilestonesPage(program); };
}

async function milestoneTypeIsUsed(program,type) {
    const ids=new Set((type.rows||[]).map(row=>row.id));
    for(const projectId of program.projects||[]) { const project=await loadProject(projectId); if(!project)continue;
        if((project.wbs||[]).some(row=>ids.has(row.milestone)))return true;
        if((project.deliverables||[]).some(item=>ids.has(item.milestone)||item.milestone===type.name))return true;
        if(project.currentGate===type.name||project.currentSprint===type.name)return true;
    }
    return false;
}

function wireMilestoneTables(program) {
    document.querySelectorAll(".milestone-type-card").forEach(card=>{
        const type=program.milestoneTypes.find(item=>item.id===card.dataset.typeId); if(!type)return;
        card.querySelectorAll(".milestone-add-row").forEach(button=>button.onclick=async()=>{type.rows.push({id:generateId("milestone"),name:"",dueDate:""});await saveProgram(program);renderMilestonesPage(program);});
        card.querySelectorAll("tr[data-row-id]").forEach(tr=>{const row=type.rows.find(item=>item.id===tr.dataset.rowId); if(!row)return;
            tr.querySelector(".milestone-name").onchange=async e=>{row.name=e.target.value.trim();await saveProgram(program);}; tr.querySelector(".milestone-date").onchange=async e=>{row.dueDate=e.target.value;await saveProgram(program);};
            tr.querySelector(".milestone-delete-row").onclick=async()=>{if(await milestoneRowIsUsed(program,row.id))return alert("This milestone is being used in planning and cannot be deleted.");if(!confirm(`Delete the milestone "${row.name||"Untitled"}"?`))return;type.rows=type.rows.filter(item=>item.id!==row.id);await saveProgram(program);renderMilestonesPage(program);};
        });
    });
}
async function milestoneRowIsUsed(program,id){for(const projectId of program.projects||[]){const p=await loadProject(projectId);if(p&&(p.wbs||[]).some(row=>row.milestone===id))return true;}return false;}
function milestoneEscape(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);}
