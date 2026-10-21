router.register("load-program", async function () {
    const programs = await loadAllPrograms();
    const rows = programs.map(p => `<div class="load-item" onclick="loadProgramSelect('${p.id}')">${p.name}</div>`).join("");
    document.getElementById("main-view").innerHTML = `<button class="btn back-btn" onclick="goBack()">← Back</button><h2>Load Program</h2>${rows || "<p>No programs found.</p>"}`;
});
async function loadProgramSelect(id) {
    activeProgram = id; activeProject = null;
    await populateSidebar();
    router.navigate("program-dashboard", id);
}
