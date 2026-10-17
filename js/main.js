// ===============================
// MAIN APPLICATION CONTROLLER
// ===============================

// Global state
let activeProgram = null;
let activeProject = null;

// -------------------------------
// Initialize App
// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await initDB();                 // From storage.js
    await loadTemplatesIntoDB();    // From storage.js

    await refreshProgramList();     // Populate sidebar
    console.log("PM Tool initialized.");
});

// ===============================
// PROGRAM MANAGEMENT
// ===============================

// Create a new Program
async function createNewProgramUI() {
    const name = prompt("Enter Program Name:");
    if (!name) return;

    const manager = prompt("Enter Program Manager:");
    const soId = prompt("Enter Strategic Objective ID (optional):");

    const program = await createNewProgram(name, manager, soId);
    activeProgram = program.id;

    await refreshProgramList();
    await refreshProjectList(program.id);

    alert("Program created successfully.");
}

// Load a Program
async function loadProgramUI(programId) {
    const program = await loadProgram(programId);
    if (!program) {
        alert("Program not found.");
        return;
    }

    activeProgram = programId;
    activeProject = null;

    await refreshProjectList(programId);
    router.navigate("program-dashboard", programId);

    console.log("Loaded Program:", programId);
}

// Save current Program
async function saveProgramUI() {
    if (!activeProgram) {
        alert("No active program.");
        return;
    }

    const program = await loadProgram(activeProgram);
    await saveProgram(program);

    alert("Program saved.");
}

// ===============================
// PROJECT MANAGEMENT
// ===============================

// Create a new Project
async function createNewProjectUI() {
    if (!activeProgram) {
        alert("Select a Program first.");
        return;
    }

    const name = prompt("Enter Project Name:");
    if (!name) return;

    const manager = prompt("Enter Project Manager:");

    const project = await createNewProject(activeProgram, name, manager);
    activeProject = project.id;

    await refreshProjectList(activeProgram);

    alert("Project created successfully.");
}

// Load a Project
async function loadProjectUI(projectId) {
    const project = await loadProject(projectId);
    if (!project) {
        alert("Project not found.");
        return;
    }

    activeProject = projectId;
    router.navigate("project-dashboard", projectId);

    console.log("Loaded Project:", projectId);
}

// Save current Project
async function saveProjectUI() {
    if (!activeProject) {
        alert("No active project.");
        return;
    }

    const project = await loadProject(activeProject);
    await saveProject(project);

    alert("Project saved.");
}

// ===============================
// SIDEBAR LISTS
// ===============================

// Refresh Program List in Sidebar
async function refreshProgramList() {
    const programs = await loadAllPrograms();
    const sidebar = document.getElementById("program-list");

    sidebar.innerHTML = "";

    programs.forEach(p => {
        const item = document.createElement("div");
        item.className = "sidebar-item";
        item.textContent = p.name;
        item.onclick = () => loadProgramUI(p.id);
        sidebar.appendChild(item);
    });
}

// Refresh Project List in Sidebar
async function refreshProjectList(programId) {
    const program = await loadProgram(programId);
    const sidebar = document.getElementById("project-list");

    sidebar.innerHTML = "";

    if (!program || !program.projects) return;

    for (const projectId of program.projects) {
        const project = await loadProject(projectId);

        const item = document.createElement("div");
        item.className = "sidebar-item";
        item.textContent = project.name;
        item.onclick = () => loadProjectUI(project.id);
        sidebar.appendChild(item);
    }
}
