router.register("cost", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    const costItems = project.costWbs || [];
    const domainSummary = project.costDomain || [];
    const resourceSummary = project.costResources || [];

    // WBS‑level cost
    let wbsRows = costItems.map(c => `
        <tr>
            <td>${c.workProduct || ""}</td>
            <td>${c.domain || ""}</td>
            <td>${c.plannedEffort || ""}</td>
            <td>${c.actualEffort || ""}</td>
            <td>${c.hourlyRate || ""}</td>
            <td>${c.plannedCost || ""}</td>
            <td>${c.actualCost || ""}</td>
            <td>${c.variance || ""}</td>
            <td>${c.resources || ""}</td>
            <td>${c.notes || ""}</td>
        </tr>
    `).join("");

    if (!wbsRows) {
        wbsRows = `<tr><td colspan="10">No cost breakdown yet.</td></tr>`;
    }

    // Domain summary
    let domainRows = domainSummary.map(d => `
        <tr>
            <td>${d.domain || ""}</td>
            <td>${d.plannedEffort || ""}</td>
            <td>${d.actualEffort || ""}</td>
            <td>${d.plannedCost || ""}</td>
            <td>${d.actualCost || ""}</td>
            <td>${d.plannedFtes || ""}</td>
            <td>${d.actualFtes || ""}</td>
            <td>${d.notes || ""}</td>
        </tr>
    `).join("");

    if (!domainRows) {
        domainRows = `<tr><td colspan="8">No domain summary yet.</td></tr>`;
    }

    // Resource summary
    let resourceRows = resourceSummary.map(r => `
        <tr>
            <td>${r.resource || ""}</td>
            <td>${r.domain || ""}</td>
            <td>${r.plannedCost || ""}</td>
            <td>${r.actualCost || ""}</td>
            <td>${r.variance || ""}</td>
            <td>${r.notes || ""}</td>
        </tr>
    `).join("");

    if (!resourceRows) {
        resourceRows = `<tr><td colspan="6">No resource summary yet.</td></tr>`;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Cost Breakdown Structure: ${project.name}</h2>

        <h3>Cost Breakdown (WBS)</h3>
        <table>
            <tr>
                <th>Work Product</th>
                <th>Domain</th>
                <th>Planned Effort</th>
                <th>Actual Effort</th>
                <th>Hourly Rate</th>
                <th>Planned Cost</th>
                <th>Actual Cost</th>
                <th>Variance</th>
                <th>Resource(s)</th>
                <th>Notes</th>
            </tr>
            ${wbsRows}
        </table>

        <h3>Cost Breakdown (WBS → RBS Domains)</h3>
        <table>
            <tr>
                <th>Domain</th>
                <th>Planned Effort</th>
                <th>Actual Effort</th>
                <th>Planned Cost</th>
                <th>Actual Cost</th>
                <th>Planned FTEs</th>
                <th>Actual FTEs</th>
                <th>Notes</th>
            </tr>
            ${domainRows}
        </table>

        <h3>Cost Breakdown (RBS Resources)</h3>
        <table>
            <tr>
                <th>Resources</th>
                <th>Domain</th>
                <th>Planned Cost</th>
                <th>Actual Cost</th>
                <th>Variance</th>
                <th>Notes</th>
            </tr>
            ${resourceRows}
        </table>
    `;
});

