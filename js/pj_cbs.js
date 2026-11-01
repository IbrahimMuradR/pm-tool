// ===============================
// PROJECT CBS PAGE — UI + ENGINE HOOK
// ===============================

router.register("project-cbs", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    const cbs = await computeProjectCbs(project);

    // WP-level table
    const wpRows = cbs.wpSummaries.map(wp => `
        <tr>
            <td>${wp.workProduct}</td>
            <td>${wp.domain}</td>
            <td>${wp.plannedEffortDays.toFixed(1)}</td>
            <td>${wp.actualEffortDays.toFixed(1)}</td>
            <td>${wp.hourlyRate.toFixed(2)}</td>
            <td>${wp.plannedCost.toFixed(2)}</td>
            <td>${wp.actualCost.toFixed(2)}</td>
            <td>${wp.variance.toFixed(2)}</td>
            <td>${wp.responsible}</td>
            <td>${wp.notes}</td>
        </tr>
    `).join("");

    const wpBody = cbs.wpSummaries.length
        ? wpRows
        : `<tr><td colspan="10">No work products found.</td></tr>`;

    // Domain-level table
    const domainRows = cbs.domainSummaries.map(d => `
        <tr>
            <td>${d.domain}</td>
            <td>${d.plannedEffortDays.toFixed(1)}</td>
            <td>${d.actualEffortDays.toFixed(1)}</td>
            <td>${d.plannedCost.toFixed(2)}</td>
            <td>${d.actualCost.toFixed(2)}</td>
            <td>${d.plannedFtes.toFixed(2)}</td>
            <td>${d.actualFtes.toFixed(2)}</td>
            <td>${d.variance.toFixed(2)}</td>
            <td>${d.notes}</td>
        </tr>
    `).join("");

    const domainBody = cbs.domainSummaries.length
        ? domainRows
        : `<tr><td colspan="9">No domain data found.</td></tr>`;

    // Resource-level table
    const resourceRows = cbs.resourceSummaries.map(r => `
        <tr>
            <td>${r.resource}</td>
            <td>${r.domains}</td>
            <td>${r.plannedCost.toFixed(2)}</td>
            <td>${r.actualCost.toFixed(2)}</td>
            <td>${r.variance.toFixed(2)}</td>
            <td>${r.notes}</td>
        </tr>
    `).join("");

    const resourceBody = cbs.resourceSummaries.length
        ? resourceRows
        : `<tr><td colspan="6">No resource data found.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Project Cost Breakdown & Resource Utilization: ${project.name}</h2>

        <h3>Work Product Cost Breakdown (from WBS)</h3>
        <table>
            <tr>
                <th>Work Product</th>
                <th>Domain</th>
                <th>Planned Effort (days)</th>
                <th>Actual Effort (days)</th>
                <th>Hourly Rate</th>
                <th>Planned Cost</th>
                <th>Actual Cost</th>
                <th>Variance</th>
                <th>Resource(s)</th>
                <th>Notes</th>
            </tr>
            ${wpBody}
        </table>

        <h3 class="mt-20">Domain Cost & FTE Summary</h3>
        <table>
            <tr>
                <th>Domain</th>
                <th>Planned Effort (days)</th>
                <th>Actual Effort (days)</th>
                <th>Planned Cost</th>
                <th>Actual Cost</th>
                <th>Planned FTEs</th>
                <th>Actual FTEs</th>
                <th>Variance</th>
                <th>Notes</th>
            </tr>
            ${domainBody}
        </table>

        <h3 class="mt-20">Resource Cost Summary (from RBS)</h3>
        <table>
            <tr>
                <th>Resource</th>
                <th>Domain(s)</th>
                <th>Planned Cost</th>
                <th>Actual Cost</th>
                <th>Variance</th>
                <th>Notes</th>
            </tr>
            ${resourceBody}
        </table>

        <p class="mt-10">
            Values are calculated from WBS dates, RBS hourly rates, and inferred effort.
        </p>
    `;
});
