router.register("program-dashboard", async function (programId) {
    const program = await loadProgram(programId);
    if (!program) {
        document.getElementById("main-view").innerHTML = "<h2>No program selected.</h2>";
        return;
    }

    program.projects = Array.isArray(program.projects) ? program.projects : [];

    const [metrics, allProjects] = await Promise.all([
        computeProgramDashboard(program),
        loadAllProjects()
    ]);

    const linkedIds = new Set(program.projects);
    const availableProjects = allProjects.filter(project => !linkedIds.has(project.id));

    const projectOptions = availableProjects.map(project =>
        `<option value="${escapeProgramDashboardHtml(project.id)}">${escapeProgramDashboardHtml(project.name || "Untitled Project")}</option>`
    ).join("");

    const rows = metrics.projectSummaries.map(project => `
        <tr>
            <td><button type="button" class="link-button" onclick="loadProjectUI('${escapeProgramDashboardHtml(project.id)}')">${escapeProgramDashboardHtml(project.name)}</button></td>
            <td>${escapeProgramDashboardHtml(project.rag)}</td>
            <td>${Number(project.costVariance || 0).toFixed(1)}%</td>
            <td>${Number(project.scheduleVariance || 0).toFixed(1)}%</td>
            <td>${Number(project.highIssues || 0)}</td>
            <td><button type="button" class="btn btn-danger" onclick="unlinkProjectFromProgram('${escapeProgramDashboardHtml(program.id)}','${escapeProgramDashboardHtml(project.id)}')">Remove</button></td>
        </tr>
    `).join("");

    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
        <button class="btn" onclick="openCreateProjectFromProgram()">+ Create Project</button>
        <h2>Program Dashboard: ${escapeProgramDashboardHtml(program.name)}</h2>

        <div class="dashboard-grid program-dashboard-cards">
            <div class="widget"><h3>Overall status</h3><p>${escapeProgramDashboardHtml(metrics.programRag)}</p></div>
            <div class="widget"><h3>Cost variance</h3><p>${Number(metrics.programCostVariance || 0).toFixed(1)}%</p></div>
            <div class="widget"><h3>Schedule variance</h3><p>${Number(metrics.programScheduleVariance || 0).toFixed(1)}%</p></div>
        </div>

        <section class="program-project-linker">
            <h3>Link an Existing Project</h3>
            <div class="program-link-controls">
                <select id="program-project-select" ${availableProjects.length ? "" : "disabled"}>
                    <option value="">${availableProjects.length ? "Select an existing project" : "No available projects"}</option>
                    ${projectOptions}
                </select>
                <button type="button" class="btn btn-primary" onclick="linkExistingProjectToProgram('${escapeProgramDashboardHtml(program.id)}')" ${availableProjects.length ? "" : "disabled"}>Add Project</button>
            </div>
        </section>

        <div class="program-project-summary">
            <h3>Project Summary</h3>
            <table>
                <tr><th>Project</th><th>RAG</th><th>Cost variance</th><th>Schedule variance</th><th>Critical issues</th><th>Actions</th></tr>
                ${rows || "<tr><td colspan='6'>No projects linked.</td></tr>"}
            </table>
        </div>
    `;
});

async function linkExistingProjectToProgram(programId) {
    const select = document.getElementById("program-project-select");
    const projectId = select && select.value;
    if (!projectId) return alert("Select a project first.");

    const [program, project] = await Promise.all([
        loadProgram(programId),
        loadProject(projectId)
    ]);
    if (!program || !project) return alert("The selected project could not be loaded.");

    const previousProgramId = project.programId || null;
    if (previousProgramId && previousProgramId !== programId) {
        const previousProgram = await loadProgram(previousProgramId);
        if (previousProgram) {
            previousProgram.projects = (previousProgram.projects || []).filter(id => id !== projectId);
            previousProgram.updatedAt = Date.now();
            await saveProgram(previousProgram);
        }
    }

    program.projects = Array.isArray(program.projects) ? program.projects : [];
    if (!program.projects.includes(projectId)) program.projects.push(projectId);
    program.updatedAt = Date.now();
    project.programId = programId;
    project.updatedAt = Date.now();

    await Promise.all([saveProgram(program), saveProject(project)]);
    await populateSidebar();
    router.navigate("program-dashboard", programId);
}

async function unlinkProjectFromProgram(programId, projectId) {
    const [program, project] = await Promise.all([
        loadProgram(programId),
        loadProject(projectId)
    ]);
    if (!program) return;
    const name = project ? project.name : "this project";
    if (!confirm(`Remove "${name}" from this Program? The project itself will not be deleted.`)) return;

    program.projects = (program.projects || []).filter(id => id !== projectId);
    program.updatedAt = Date.now();
    if (project && project.programId === programId) {
        project.programId = null;
        project.updatedAt = Date.now();
        await saveProject(project);
    }
    await saveProgram(program);
    if (window.activeProject === projectId) window.activeProject = null;
    await populateSidebar();
    router.navigate("program-dashboard", programId);
}

function escapeProgramDashboardHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}
