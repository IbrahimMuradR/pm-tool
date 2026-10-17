router.register("project-raid", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    const raids = project.raids || [];

    let rows = raids.map(r => `
        <tr>
            <td>${r.id || ""}</td>
            <td>${r.description || ""}</td>
            <td>${r.domain || ""}</td>
            <td>${r.responsible || ""}</td>
            <td>${r.priority || ""}</td>
            <td>${r.discussion || ""}</td>
            <td>${r.status || ""}</td>
        </tr>
    `).join("");

    if (!rows) {
        rows = `<tr><td colspan="7">No RAID items yet.</td></tr>`;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Project RAID Log: ${project.name}</h2>
        <button>Create New</button>
        <button>Import</button>
        <table>
            <tr>
                <th>RAID ID</th>
                <th>Description</th>
                <th>Domain</th>
                <th>Responsible</th>
                <th>Priority</th>
                <th>Discussion</th>
                <th>Status</th>
            </tr>
            ${rows}
        </table>
    `;
});

