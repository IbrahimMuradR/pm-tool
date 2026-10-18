// ===============================
// LOAD STRATEGIC OBJECTIVE PAGE
// ===============================

router.register("load-strategic", async function () {
    const strategicList = await loadAllStrategic();

    const rows = strategicList.map(s => `
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
    window.activeStrategic = id;
    populateSidebar();
    router.navigate("strategic-objectives", id);
}
