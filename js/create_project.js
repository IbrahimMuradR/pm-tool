// CREATE PROJECT PAGE
router.register("create-project", function () {
    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
        <h2>Create New Project</h2>
        <p><strong>Name:</strong></p>
        <input id="new-project-name" class="input" placeholder="Project Name">
        <p class="mt-20"><button class="btn" onclick="createProject()">Create</button></p>`;
});
async function createProject() {
    const name = document.getElementById("new-project-name").value.trim();
    if (!name) return alert("Please enter a project name.");
    if (!activeProgram) return alert("Select or create a Program first.");
    const project = {
        id: generateId("project"), name, manager: "", programId: activeProgram,
        currentGate: "", currentSprint: "", deliverables: [], issues: [],
        changeRequests: [], risks: [], assumptions: [], dependencies: [], benefits: [], lessons: [],
        wbs: [], rbs: { nodes: [] }
    };
    await saveProject(project);
    const program = await loadProgram(activeProgram);
    program.projects = program.projects || [];
    if (!program.projects.includes(project.id)) program.projects.push(project.id);
    await saveProgram(program);
    activeProject = project.id;
    await populateSidebar();
    router.navigate("project-dashboard", project.id);
}
