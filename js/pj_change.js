// ===============================
// PROJECT CHANGE REQUEST PAGE — UI + ENGINE HOOK
// ===============================

router.register("project-change", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    const crSummaries = await computeProjectChangeRequests(project);

    const rows = crSummaries.map(cr => `
        <tr>
            <td>${cr.description}</td>
            <td>${cr.domain}</td>
            <td>${cr.responsible}</td>
            <td>${cr.priority}</td>
            <td>${cr.impactCost}</td>
            <td>${cr.impactSchedule}</td>
            <td>${cr.impactScope}</td>
            <td>${cr.severity}</td>
            <td>${cr.status}</td>
            <td>${cr.statusHealth}</td>
            <td>${cr.notes}</td>
        </tr>
    `).join("");

    const bodyRows = crSummaries.length
        ? rows
        : `<tr><td colspan="11">No change requests defined yet.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Project Change Requests: ${project.name}</h2>

        <table>
            <tr>
                <th>Description</th>
                <th>Domain</th>
                <th>Responsible</th>
                <th>Priority</th>
                <th>Impact Cost (£)</th>
                <th>Impact Schedule (days)</th>
                <th>Impact Scope</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Status Health</th>
                <th>Notes</th>
            </tr>
            ${bodyRows}
        </table>

        <p class="mt-10">
            Severity is automatically calculated from cost, schedule, and scope impact.
        </p>
    `;
});
