router.register("strategic-objectives", async function () {
    const objectives = await loadAllStrategicObjectives();

    let rows = objectives.map(o => `
        <tr onclick="router.navigate('program-dashboard', '${o.programs && o.programs[0] || ""}')">
            <td>${o.name || ""}</td>
            <td>${o.description || ""}</td>
            <td>${o.owner || ""}</td>
            <td>${(o.programs || []).length}</td>
        </tr>
    `).join("");

    if (!rows) {
        rows = `<tr><td colspan="4">No strategic objectives yet.</td></tr>`;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Strategic Objectives</h2>
        <table>
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Owner</th>
                <th>Linked Programs</th>
            </tr>
            ${rows}
        </table>
        <p>Click a row to navigate downwards into the first linked Program (if any).</p>
    `;
});

