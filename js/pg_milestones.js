router.register("program-milestones", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const milestones = program.milestones || [];

    const rows = milestones.map(m => `
        <tr>
            <td>${m.name || ""}</td>
            <td>${m.healthStatus || ""}</td>
            <td>${m.status || ""}</td>
            <td>${m.notes || ""}</td>
            <td>${m.owner || program.manager || ""}</td>
            <td>${m.dueDate || ""}</td>
        </tr>
    `);

    const bodyRows = rows.length
        ? rows.join("")
        : `<tr><td colspan="6">No program milestones defined yet.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Program Milestones: ${program.name}</h2>
        <table>
            <tr>
                <th>Program Gate/Milestone</th>
                <th>Health Status</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Owner</th>
                <th>Due Date</th>
            </tr>
            ${bodyRows}
        </table>
        <p class="mt-10">
            Health status and status can later be auto‑calculated from project gates, cost variance and schedule variance.
        </p>
    `;
});
