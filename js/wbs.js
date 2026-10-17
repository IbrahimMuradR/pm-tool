router.register("wbs", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    // For now, show combined WBS; later, domain‑specific pages
    const wbs = project.wbs || [];

    let rows = wbs.map(wp => `
        <tr>
            <td>${wp.name || ""}</td>
            <td>${(wp.responsible || []).join(", ")}</td>
            <td>${wp.startDate || ""}</td>
            <td>${wp.plannedDate || ""}</td>
            <td>${wp.actualDate || ""}</td>
            <td>${wp.milestone || ""}</td>
            <td>${wp.storageLocation || ""}</td>
            <td>${wp.status || ""}</td>
            <td>${wp.inputTo || ""}</td>
        </tr>
    `).join("");

    if (!rows) {
        rows = `<tr><td colspan="9">No work products defined yet.</td></tr>`;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Work Breakdown Structure (WBS): ${project.name}</h2>
        <table>
            <tr>
                <th>Work Product</th>
                <th>Responsible</th>
                <th>Start Date</th>
                <th>Planned Date</th>
                <th>Actual Due Date</th>
                <th>Applicable Milestone</th>
                <th>Storage Location</th>
                <th>Status</th>
                <th>Input to</th>
            </tr>
            ${rows}
        </table>
        <p>Plus buttons, nesting, right‑click actions and weightage dialogs will be implemented later.</p>
    `;
});

