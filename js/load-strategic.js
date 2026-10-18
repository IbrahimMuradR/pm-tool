router.register("load-strategic", async function () {
    const list = await loadAllStrategic();

    window.lastPage = { page: "home" };

    const rows = list.map(s => `
        <div class="load-item" onclick="loadStrategicSelect('${s.id}')">
            ${s.name}
        </div>
    `).join("");

    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
        <h2>Load Strategic Objective</h2>
        ${rows || "<p>No strategic objectives found.</p>"}
    `;
});

async function loadStrategicSelect(id) {
    activeStrategic = id;
    populateSidebar();
    router.navigate("strategic-objectives", id);
}
