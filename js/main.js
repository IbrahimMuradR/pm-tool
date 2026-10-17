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
    await initDB();
    await loadTemplatesIntoDB();

    await refreshProgramList();
    console.log("PM Tool initialized.");
});

// ===============================
// STRATEGIC / PROGRAM / PROJECT CREATION
// ===============================

// Create Strategic Objective
async function createNewStrategicUI() {
    const name = prompt("Enter Strategic Objective Name:");
    if (!name) return;

    const description = prompt("Enter Description:");
    const owner = prompt("Enter Owner:");

    const template = await loadTemplate("empty-strategic") || {};
    const obj = {
        ...template,
        id: generateId("so"),
        name,
        description,
        owner,
        programs: template.programs || []
    };

    await saveStrategicObjective(obj);
    alert("Strategic Objective created.");
}

// Create Program
async function createNewProgramUI() {
    const name = prompt("Enter Program Name:");
    if (!name) return;

    const manager = prompt("Enter Program Manager:");
    const soId = prompt("Enter Strategic Objective ID (optional):");

    const template = await loadTemplate("empty-program") || {};
    const program = {
        ...template,
        id: generateId("pg"),
        name,
        manager,
        strategicObjective: soId || null,
        projects: template.projects || [],
        currentGate: template.currentGate || null,
        currentMilestone: template.currentMilestone || null
    };

    await saveProgram(program);
    activeProgram = program.id;

    await refreshProgramList();
    await refreshProjectList(program.id);

    alert("Program created successfully.");
}

// Create Project (linked to activeProgram)
async function createNewProjectUI() {
    if (!activeProgram) {
        alert("Select a Program first.");
        return;
    }

    const name = prompt("Enter Project Name:");
    if (!name) return;

    const manager = prompt("Enter Project Manager:");

    const template = await loadTemplate("empty-project") || {};
    const project = {
        ...template,
        id: generateId("pj"),
        name,
        manager,
        programId: activeProgram
    };

    await saveProject(project);

    // Link project to program
    const program = await loadProgram(activeProgram);
    program.projects = program.projects || [];
    program.projects.push(project.id);
    await saveProgram(program);

    activeProject = project.id;
    await refreshProjectList(activeProgram);

    alert("Project created successfully.");
}

// ===============================
// PROGRAM MANAGEMENT
// ===============================

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
