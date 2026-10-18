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
    await populateSidebar();
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
    window.lastPage = { page: "home" };
    router.navigate("load-program");
}

function openCreateStrategicFromHome() {
    window.lastPage = { page: "home" };
    router.navigate("create-strategic");
}

function openLoadStrategicFromHome() {
    window.lastPage = { page: "home" };
    router.navigate("load-strategic");
}

// ===============================
// LOADERS (Sidebar lists)
// ===============================
async function loadProgramUI(programId) {
    activeProgram = programId;
    activeProject = null;

    window.lastPage = { page: "home" };

    await populateSidebar();
    router.navigate("program-dashboard", programId);
}

async function loadProjectUI(projectId) {
    activeProject = projectId;

    window.lastPage = { page: "program-dashboard", id: activeProgram };

    router.navigate("project-dashboard", projectId);
}

// ===============================
// DASHBOARD → CREATE ENTRY POINTS
// ===============================
function openCreateProjectFromProgram() {
    if (!activeProgram) {
        alert("Select or create a Program first.");
        return;
    }
    window.lastPage = { page: "program-dashboard", id: activeProgram };
    router.navigate("create-project");
}

function openCreateProgramFromStrategic() {
    if (!activeStrategic) {
        alert("Select or create a Strategic Objective first.");
        return;
    }
    window.lastPage = { page: "strategic-objectives", id: activeStrategic };
    router.navigate("create-program");
}

// ===============================
// SIDEBAR BUTTON HANDLERS
// ===============================

// Strategic
function openStrategicDashboard() {
    if (!activeStrategic) {
        alert("Load or create a Strategic Objective first.");
        return;
    }
    window.lastPage = { page: "home" };
    router.navigate("strategic-objectives", activeStrategic);
}

// Programs
function openProgramDashboard() {
    if (!activeProgram) {
        alert("Load or create a Program first.");
        return;
    }
    window.lastPage = { page: "home" };
    router.navigate("program-dashboard", activeProgram);
}

function openProgramOverview() {
    if (!activeProgram) {
        alert("Load or create a Program first.");
        return;
    }
    window.lastPage = { page: "program-dashboard", id: activeProgram };
    router.navigate("program-overview", activeProgram);
}

function openProgramMilestones() {
    if (!activeProgram) {
        alert("Load or create a Program first.");
        return;
    }
    window.lastPage = { page: "program-dashboard", id: activeProgram };
    router.navigate("program-milestones", activeProgram);
}

function openProgramGantt() {
    if (!activeProgram) {
        alert("Load or create a Program first.");
        return;
    }
    window.lastPage = { page: "program-dashboard", id: activeProgram };
    router.navigate("program-gantt", activeProgram);
}

function openProgramRaid() {
    if (!activeProgram) {
        alert("Load or create a Program first.");
        return;
    }
    window.lastPage = { page: "program-dashboard", id: activeProgram };
    router.navigate("program-raid", activeProgram);
}

function openProgramChange() {
    if (!activeProgram) {
        alert("Load or create a Program first.");
        return;
    }
    window.lastPage = { page: "program-dashboard", id: activeProgram };
    router.navigate("program-change", activeProgram);
}

function openProgramBenefits() {
    if (!activeProgram) {
        alert("Load or create a Program first.");
        return;
    }
    window.lastPage = { page: "program-dashboard", id: activeProgram };
    router.navigate("benefits", activeProgram);
}

// Projects
function openProjectDashboard() {
    if (!activeProject) {
        alert("Load or create a Project first.");
        return;
    }
    window.lastPage = { page: "program-dashboard", id: activeProgram };
    router.navigate("project-dashboard", activeProject);
}

function openProjectRbs() {
    if (!activeProject) {
        alert("Load or create a Project first.");
        return;
    }
    window.lastPage = { page: "project-dashboard", id: activeProject };
    router.navigate("rbs", activeProject);
}

function openProjectWbs() {
    if (!activeProject) {
        alert("Load or create a Project first.");
        return;
    }
    window.lastPage = { page: "project-dashboard", id: activeProject };
    router.navigate("wbs", activeProject);
}

function openProjectCost() {
    if (!activeProject) {
        alert("Load or create a Project first.");
        return;
    }
    window.lastPage = { page: "project-dashboard", id: activeProject };
    router.navigate("cost", activeProject);
}

function openProjectGantt() {
    if (!activeProject) {
        alert("Load or create a Project first.");
        return;
    }
    window.lastPage = { page: "project-dashboard", id: activeProject };
    router.navigate("project-gantt", activeProject);
}

function openProjectRaid() {
    if (!activeProject) {
        alert("Load or create a Project first.");
        return;
    }
    window.lastPage = { page: "project-dashboard", id: activeProject };
    router.navigate("project-raid", activeProject);
}

function openProjectChange() {
    if (!activeProject) {
        alert("Load or create a Project first.");
        return;
    }
    window.lastPage = { page: "project-dashboard", id: activeProject };
    router.navigate("project-change", activeProject);
}
