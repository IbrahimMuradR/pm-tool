// ===============================
// GLOBAL STATE
// ===============================
let activeProgram = null;
let activeProject = null;
let activeStrategic = null;

window.lastPage = null;

// ===============================
// BACK BUTTON
// ===============================
function goBack() {
    if (!window.lastPage) {
        router.navigate("home");
        return;
    }
    const { page, id } = window.lastPage;
    router.navigate(page, id);
}

// ===============================
// STARTUP
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
    await ensureDBReady();
    await populateSidebar();
    router.navigate("home");
});

// ===============================
// SIDEBAR LISTS (Loaded Items)
// ===============================
async function populateSidebar() {
    const programList = document.getElementById("program-list");
    const projectList = document.getElementById("project-list");

    const programs = await loadAllPrograms();
    const projects = await loadAllProjects();

    programList.innerHTML = programs.map(p => `
        <div class="sidebar-item" onclick="loadProgramUI('${p.id}')">${p.name}</div>
    `).join("");

    if (activeProgram) {
        const program = await loadProgram(activeProgram);
        projectList.innerHTML = program.projects.map(pid => {
            const proj = projects.find(p => p.id === pid);
            return proj ? `
                <div class="sidebar-item" onclick="loadProjectUI('${proj.id}')">${proj.name}</div>
            ` : "";
        }).join("");
    } else {
        projectList.innerHTML = "";
    }
}

// ===============================
// LOADERS
// ===============================
async function loadProgramUI(id) {
    activeProgram = id;
    activeProject = null;
    window.lastPage = { page: "home" };
    await populateSidebar();
    router.navigate("program-dashboard", id);
}

async function loadProjectUI(id) {
    activeProject = id;
    window.lastPage = { page: "program-dashboard", id: activeProgram };
    router.navigate("project-dashboard", id);
}

// ===============================
// HOME → CREATE/LOAD
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
// SIDEBAR BUTTONS — STRATEGIC
// ===============================
function openStrategic() {
    if (!activeStrategic) return alert("Load or create a Strategic Objective first.");
    window.lastPage = { page: "home" };
    router.navigate("strategic-objectives", activeStrategic);
}

// ===============================
// SIDEBAR BUTTONS — PROGRAMS
// ===============================
function openProgramDashboard() {
    if (!activeProgram) return alert("Load or create a Program first.");
    router.navigate("program-dashboard", activeProgram);
}

function openProgramOverview() {
    if (!activeProgram) return alert("Load or create a Program first.");
    router.navigate("program-overview", activeProgram);
}

function openProgramMilestones() {
    if (!activeProgram) return alert("Load or create a Program first.");
    router.navigate("program-milestones", activeProgram);
}

function openProgramGantt() {
    if (!activeProgram) return alert("Load or create a Program first.");
    router.navigate("program-gantt", activeProgram);
}

function openProgramRaid() {
    if (!activeProgram) return alert("Load or create a Program first.");
    router.navigate("program-raid", activeProgram);
}

function openProgramChange() {
    if (!activeProgram) return alert("Load or create a Program first.");
    router.navigate("program-change", activeProgram);
}

function openProgramBenefits() {
    if (!activeProgram) return alert("Load or create a Program first.");
    router.navigate("benefits", activeProgram);
}

// ===============================
// SIDEBAR BUTTONS — PROJECTS
// ===============================
function openProjectDashboard() {
    if (!activeProject) return alert("Load or create a Project first.");
    router.navigate("project-dashboard", activeProject);
}

function openProjectRbs() {
    if (!activeProject) return alert("Load or create a Project first.");
    router.navigate("project-rbs", activeProject);
}

function openProjectWbs() {
    if (!activeProject) return alert("Load or create a Project first.");
    router.navigate("wbs", activeProject);
}

function openProjectCost() {
    if (!activeProject) return alert("Load or create a Project first.");
    router.navigate("cost", activeProject);
}

function openProjectGantt() {
    if (!activeProject) return alert("Load or create a Project first.");
    router.navigate("project-gantt", activeProject);
}

function openProjectRaid() {
    if (!activeProject) return alert("Load or create a Project first.");
    router.navigate("project-raid", activeProject);
}

function openProjectChange() {
    if (!activeProject) return alert("Load or create a Project first.");
    router.navigate("project-change", activeProject);
}
