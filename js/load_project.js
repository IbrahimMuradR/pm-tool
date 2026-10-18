// ===============================
// LOAD PROJECT PAGE
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
    activeProject = id;        // 
    await populateSidebar();   // 
    router.navigate("project-dashboard", id);
}

