// ===============================
// LOAD PROGRAM PAGE
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
    window.activeProgram = id;
    populateSidebar();
    router.navigate("program-dashboard", id);
}
