router.register("create-project", function () {
    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
        <h2>Create New Project</h2>

        <p><strong>Name:</strong></p>
        <input id="new-project-name" class="input" placeholder="Project Name">

        <p class="mt-20">
            <button class="btn" onclick="createProject()">Create</button>
        </p>
    `;
});

async function createProject() {
    const name = document.getElementById("new-project-name").value.trim();
    if (!name) return alert("Please enter a project name.");

    if (!activeProgram) {
        alert("Select or create a Program first.");
        return;
    }

    const project = {
        id: generateId("pj"),
        name,
        manager: "",
        programId: activeProgram,
        wbs: [],
        rbs: { views: [], defaultViewId: null, currentViewId: null }
    };

    await saveProject(project);

    const program = await loadProgram(activeProgram);
    program.projects.push(project.id);
    await saveProgram(program);

    activeProject = project.id;
    populateSidebar();

    router.navigate("project-dashboard", project.id);
}
