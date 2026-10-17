router.register("program-change", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const changes = program.changeRequests || [];

    let rows = changes.map(c => `
        <tr>
            <td>${c.id || ""}</td>
            <td>${c.description || ""}</td>
            <td>${c.project || ""}</td>
            <td>${c.responsible || ""}</td>
            <td>${c.priority || ""}</td>
            <td>${c.costImpact || ""}</td>
            <td>${c.scheduleImpact || ""}</td>
            <td>${c.tasksCreated || ""}</td>
            <td>${c.discussion || ""}</td>
            <td>${c.status || ""}</td>
        </tr>
    `).join("");

    if (!rows) {
        rows = `<tr><td colspan="10">No Change Requests yet.</td></tr>`;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Program Change Requests: ${program.name}</h2>
        <button>Create New</button>
        <button>Import</button>
        <table>
            <tr>
                <th>CR ID</th>
                <th>Description</th>
                <th>Project</th>
                <th>Responsible</th>
                <th>Priority</th>
                <th>Impact to Cost</th>
                <th>Impact to Schedule</th>
                <th>Tasks created</th>
                <th>Discussion</th>
                <th>Status</th>
            </tr>
            ${rows}
        </table>
    `;
});

