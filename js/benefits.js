router.register("benefits", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const benefits = program.benefits || [];

    let rows = benefits.map(b => `
        <tr>
            <td>${b.name || ""}</td>
            <td>${b.type || ""}</td>
            <td>${b.description || ""}</td>
            <td>${b.kpi || ""}</td>
            <td>${b.baseline || ""}</td>
            <td>${b.target || ""}</td>
            <td>${b.actual || ""}</td>
            <td>${b.owner || ""}</td>
            <td>${b.evidence || ""}</td>
            <td>${b.status || ""}</td>
            <td>${b.notes || ""}</td>
        </tr>
    `).join("");

    if (!rows) {
        rows = `<tr><td colspan="11">No benefits defined yet.</td></tr>`;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Benefits Realization: ${program.name}</h2>
        <table>
            <tr>
                <th>Benefit</th>
                <th>Type</th>
                <th>Description</th>
                <th>KPI</th>
                <th>Baseline</th>
                <th>Target</th>
                <th>Actual</th>
                <th>Owner</th>
                <th>Evidence</th>
                <th>Status</th>
                <th>Notes</th>
            </tr>
            ${rows}
        </table>
    `;
});

