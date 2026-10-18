// ===============================
// MAIN APPLICATION CONTROLLER
// ===============================

// Global state
let activeProgram = null;
let activeProject = null;
let activeStrategic = null;

// Track last page for contextual back navigation
window.lastPage = null;

// -------------------------------
// Global Back Handler
// -------------------------------
function goBack() {
    if (!window.lastPage) {
        router.navigate("home");
        return;
    }

    const { page, id } = window.lastPage;

    if (id) router.navigate(page, id);
    else router.navigate(page);
}

// -------------------------------
// Start App AFTER DB is ready
// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await ensureDBReady();
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
    window.lastPage = null;

    document.getElementById("main-view").innerHTML = `
        <h2>Welcome to the PM Tool</h2>

        <div class="home-menu">
            <button class="btn" onclick="openCreateProjectFromHome()">Create New Project</button>
            <button class="btn" onclick="openLoadProjectFromHome()">Load Existing Project</button>

            <button class="btn mt-20" onclick="openCreateProgramFromHome()">Create New Program</button>
            <button class="btn" onclick="openLoadProgramFromHome()">Load Existing Program</button>

            <button class="btn mt-20" onclick="openCreateStrategicFromHome()">Create Strategic Objective</button>
            <button class="btn" onclick="openLoadStrategicFromHome()">Load Strategic Objective</button>
        </div>
    `;
});

// ===============================
// HOME → CREATE/LOAD ENTRY POINTS
// ===============================
function openCreateProjectFromHome() {
    window.lastPage = { page: "home" };
    router.navigate("create-project");
}

function openLoadProjectFromHome() {
    window.lastPage = { page: "home" };
    router.navigate("load-project");
}

function openCreateProgramFromHome() {
    window.lastPage = { page: "home" };
    router.navigate("create-program");
}

function openLoadProgramFromHome() {
