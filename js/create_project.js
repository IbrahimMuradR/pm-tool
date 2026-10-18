// ===============================
// CREATE PROJECT PAGE
// ===============================

router.register("create-project", function () {
    document.getElementById("main-view").innerHTML = `
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
    if (!name) {
        alert("Please enter a project name.");
        return;
    }

    const project = {
        id: generateId("project"),
        name,
        manager: "",
        currentGate: "",
        currentSprint: "",
        deliverables: [],
        issues: [],
        changeRequests: [],
        wbs: [],
        rbs: { views: [], defaultViewId: null, currentViewId: null }
    };

    await saveProject(project);

    window.activeProject = project.id;
    populateSidebar();

    router.navigate("project-dashboard", project.id);
}
