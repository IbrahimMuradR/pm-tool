// ===============================
// MAIN APPLICATION CONTROLLER
// ===============================

// Global state
let activeProgram = null;
let activeProject = null;
let activeStrategic = null;

// -------------------------------
// Initialize App
// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    populateSidebar();
    router.navigate("home");
    console.log("PM Tool initialized.");
});

// ===============================
// SIDEBAR POPULATION
// ===============================

async function populateSidebar() {
    const programList = document.getElementById("program-list");
    const projectList = document.getElementById("project-list");

    const programs = await loadAllPrograms();
    const projects = await loadAllProjects();

    // PROGRAMS
    programList.innerHTML = programs.map(p => `
        <div class="sidebar-item" onclick="loadProgramUI('${p.id}')">
            ${p.name}
        </div>
    `).join("");

    // PROJECTS (only those belonging to activeProgram)
    if (activeProgram) {
        const program = await loadProgram(activeProgram);
        if (program && program.projects) {
            projectList.innerHTML = program.projects.map(pid => {
                const proj = projects.find(p => p.id === pid);
                return proj ? `
                    <div class="sidebar-item" onclick="loadProjectUI('${proj.id}')">
                        ${proj.name}
                    </div>
                ` : "";
            }).join("");
        }
    } else {
        projectList.innerHTML = "";
    }
}

// ===============================
// HOME SCREEN
// ===============================

router.register("home", function () {
    document.getElementById("main-view").innerHTML = `
        <h2>Welcome to the PM Tool</h2>

        <div class="home-menu">
            <button class="btn" onclick="router.navigate('create-project')">Create New Project</button>
            <button class="btn" onclick="router.navigate('load-project')">Load Existing Project</button>

            <button class="btn mt-20" onclick="router.navigate('create-program')">Create New Program</button>
            <button class="btn" onclick="router.navigate('load-program')">Load Existing Program</button>

            <button class="btn mt-20" onclick="router.navigate('create-strategic')">Create Strategic Objective</button>
            <button class="btn" onclick="router.navigate('load-strategic')">Load Strategic Objective</button>
        </div>
    `;
});

// ===============================
// CREATE STRATEGIC OBJECTIVE
// ===============================

router.register("create-strategic", function () {
    document.getElementById("main-view").innerHTML = `
        <h2>Create Strategic Objective</h2>

        <p><strong>Name:</strong></p>
        <input id="new-strategic-name" class="input" placeholder="Strategic Objective Name">

        <p class="mt-20">
            <button class="btn" onclick="createStrategic()">Create</button>
        </p>
    `;
});

async function createStrategic() {
    const name = document.getElementById("new-strategic-name").value.trim();
    if (!name) return alert("Please enter a name.");

    const strategic = {
        id: generateId("so"),
        name,
        owner: "",
        programs: [],
        lessons: []
    };

    await saveStrategicObjective(strategic);

    activeStrategic = strategic.id;
    populateSidebar();

    router.navigate("strategic-objectives", strategic.id);
}

// ===============================
// CREATE PROGRAM
// ===============================

router.register("create-program", function () {
    document.getElementById("main-view").innerHTML = `
        <h2>Create New Program</h2>

        <p><strong>Name:</strong></p>
        <input id="new-program-name" class="input" placeholder="Program Name">

        <p class="mt-20">
            <button class="btn" onclick="createProgram()">Create</button>
        </p>
    `;
});

async function createProgram() {
    const name = document.getElementById("new-program-name").value.trim();
    if (!name) return alert("Please enter a program name.");

    const program = {
        id: generateId("pg"),
        name,
        manager: "",
        projects: [],
        milestones: [],
        changeRequests: [],
        issues: [],
        benefits: []
    };

    await saveProgram(program);

    activeProgram = program.id;
    populateSidebar();

    router.navigate("program-dashboard", program.id);
}

// ===============================
// CREATE PROJECT
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

    // Link project to program
    const program = await loadProgram(activeProgram);
    program.projects.push(project.id);
    await saveProgram(program);

    activeProject = project.id;
    populateSidebar();

    router.navigate("project-dashboard", project.id);
}

// ===============================
// LOAD PROJECT
// ===============================

router.register("load-project", async function () {
    const projects = await loadAllProjects();

    const rows = projects.map(p => `
        <div class="load-item" onclick="loadProjectSelect('${p.id}')">
            ${p.name}
        </div>
    `).join("");

    document.getElementById("main-view").innerHTML = `
        <h2>Load Project</h2>
        ${rows || "<p>No projects found.</p>"}
    `;
});

async function loadProjectSelect(id) {
    activeProject = id;
    populateSidebar();
    router.navigate("project-dashboard", id);
}

// ===============================
// LOAD PROGRAM
// ===============================

router.register("load-program", async function () {
    const programs = await loadAllPrograms();

    const rows = programs.map(p => `
        <div class="load-item" onclick="loadProgramSelect('${p.id}')">
            ${p.name}
        </div>
    `).join("");

    document.getElementById("main-view").innerHTML = `
        <h2>Load Program</h2>
        ${rows || "<p>No programs found.</p>"}
    `;
});

async function loadProgramSelect(id) {
    activeProgram = id;
    populateSidebar();
    router.navigate("program-dashboard", id);
}

// ===============================
// LOAD STRATEGIC OBJECTIVE
// ===============================

router.register("load-strategic", async function () {
    const list = await loadAllStrategic();

    const rows = list.map(s => `
        <div class="load-item" onclick="loadStrategicSelect('${s.id}')">
            ${s.name}
        </div>
    `).join("");

    document.getElementById("main-view").innerHTML = `
        <h2>Load Strategic Objective</h2>
        ${rows || "<p>No strategic objectives found.</p>"}
    `;
});

async function loadStrategicSelect(id) {
    activeStrategic = id;
    populateSidebar();
    router.navigate("strategic-objectives", id);
}

// ===============================
// EXISTING LOADERS (Sidebar)
// ===============================

async function loadProgramUI(programId) {
    activeProgram = programId;
    activeProject = null;

    populateSidebar();
    router.navigate("program-dashboard", programId);
}

async function loadProjectUI(projectId) {
    activeProject = projectId;
    router.navigate("project-dashboard", projectId);
}
