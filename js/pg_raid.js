router.register("program-raid", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const raids = program.raids || [];

    let rows = raids.map(r => `
        <tr>
            <td>${r.id || ""}</td>
            <td>${r.description || ""}</td>
            <td>${r.project || ""}</td>
            <td>${r.projectLead || ""}</td>
            <td>${r.priority || ""}</td>
            <td>${r.discussion || ""}</td>
            <td>${r.status || ""}</td>
        </tr>
    `).join("");

    if (!rows) {
        rows = `
        <tr><td colspan="7">No RAID items yet.</td></tr>
        `;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Program RAID Log: ${program.name}</h2>
        <button>Create New</button>
        <button>Import</button>
        <table>
            <tr>
                <th>RAID ID</th>
                <th>Description</th>
                <th>Project</th>
                <th>Project Lead</th>
                <th>Priority</th>
                <th>Discussion</th>
                <th>Status</th>
            </tr>
            ${rows}
        </table>
    `;
});

