// ===============================
// CBS ENGINE — Cost Breakdown Structure
// ===============================

router.register("cost", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    // Ensure WBS + RBS exist
    project.wbs = project.wbs || [];
    project.rbs = project.rbs || { views: [] };

    // Use default RBS view
    const rbsView = project.rbs.views.find(v => v.id === project.rbs.defaultViewId)
        || project.rbs.views[0]
        || { nodes: [] };

    // Compute CBS
    const cbsWbs = computeWbsCost(project.wbs, rbsView.nodes);
    const cbsDomain = computeDomainCost(cbsWbs);
    const cbsResource = computeResourceCost(cbsWbs);

    // Save CBS into project for dashboard use
    project.costWbs = cbsWbs;
    project.costDomain = cbsDomain;
    project.costResources = cbsResource;
    await saveProject(project);

    renderCbsPage(project, cbsWbs, cbsDomain, cbsResource);
});

// ===============================
// WBS COST CALCULATION
// ===============================
function computeWbsCost(wbs, rbsNodes) {
    return wbs.map(wp => {
        // Planned effort = difference between start and planned date
        const plannedEffort = calculateEffort(wp.startDate, wp.plannedDate);

        // Actual effort = difference between start and actual date
        const actualEffort = calculateEffort(wp.startDate, wp.actualDate);

        // Responsible roles → find resources in RBS
        const responsibleResources = wp.responsible || [];

        const resourceRates = responsibleResources.map(role => {
            const node = rbsNodes.find(n => n.type === "resource" && n.label === role);
            return node ? Number(node.hourlyRate || 0) : 0;
        });

        // Weightage: if none provided, split equally
        const weightage = responsibleResources.length
            ? responsibleResources.map(() => 1 / responsibleResources.length)
            : [];

        // Planned cost = Σ (plannedEffort × hourlyRate × weightage)
        const plannedCost = resourceRates.reduce((sum, rate, i) =>
            sum + plannedEffort * rate * (weightage[i] || 0), 0);

        // Actual cost = Σ (actualEffort × hourlyRate × weightage)
        const actualCost = resourceRates.reduce((sum, rate, i) =>
            sum + actualEffort * rate * (weightage[i] || 0), 0);

        const variance = plannedCost - actualCost;

        return {
            workProduct: wp.workProduct,
            domain: wp.domain || "(none)",
            plannedEffort,
            actualEffort,
            hourlyRate: resourceRates.join(", "),
            plannedCost,
            actualCost,
            variance,
            resources: responsibleResources.join(", "),
            notes: wp.notes || ""
        };
    });
}

// ===============================
// DOMAIN COST CALCULATION
// ===============================
function computeDomainCost(cbsWbs) {
    const domainMap = {};

    cbsWbs.forEach(row => {
        const domain = row.domain || "(none)";
        if (!domainMap[domain]) {
            domainMap[domain] = {
                domain,
                plannedEffort: 0,
                actualEffort: 0,
                plannedCost: 0,
                actualCost: 0,
                plannedFtes: 0,
                actualFtes: 0,
                notes: ""
            };
        }

        domainMap[domain].plannedEffort += row.plannedEffort;
        domainMap[domain].actualEffort += row.actualEffort;
        domainMap[domain].plannedCost += row.plannedCost;
        domainMap[domain].actualCost += row.actualCost;

        // FTE = effort / working hours (assume 8h/day)
        domainMap[domain].plannedFtes += row.plannedEffort / 8;
        domainMap[domain].actualFtes += row.actualEffort / 8;
    });

    return Object.values(domainMap);
}

// ===============================
// RESOURCE COST CALCULATION
// ===============================
function computeResourceCost(cbsWbs) {
    const resourceMap = {};

    cbsWbs.forEach(row => {
        const resources = row.resources.split(",").map(r => r.trim()).filter(r => r);

        resources.forEach(res => {
            if (!resourceMap[res]) {
                resourceMap[res] = {
                    resource: res,
                    domain: row.domain,
                    plannedCost: 0,
                    actualCost: 0,
                    variance: 0,
                    notes: ""
                };
            }

            resourceMap[res].plannedCost += row.plannedCost;
            resourceMap[res].actualCost += row.actualCost;
            resourceMap[res].variance += row.variance;
        });
    });

    return Object.values(resourceMap);
}

// ===============================
// Effort calculation helper
// ===============================
function calculateEffort(start, end) {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = (e - s) / (1000 * 60 * 60 * 24); // days
    return diff > 0 ? diff : 0;
}

// ===============================
// Render CBS Page
// ===============================
function renderCbsPage(project, cbsWbs, cbsDomain, cbsResource) {
    const container = document.getElementById("main-view");

    const wbsRows = cbsWbs.map(r => `
        <tr>
            <td>${r.workProduct}</td>
            <td>${r.domain}</td>
            <td>${r.plannedEffort}</td>
            <td>${r.actualEffort}</td>
            <td>${r.hourlyRate}</td>
            <td>${r.plannedCost.toFixed(2)}</td>
            <td>${r.actualCost.toFixed(2)}</td>
            <td class="${r.variance >= 0 ? "cbs-positive" : "cbs-negative"}">
                ${r.variance.toFixed(2)}
            </td>
            <td>${r.resources}</td>
            <td>${r.notes}</td>
        </tr>
    `).join("");

    const domainRows = cbsDomain.map(d => `
        <tr>
            <td>${d.domain}</td>
            <td>${d.plannedEffort}</td>
            <td>${d.actualEffort}</td>
            <td>${d.plannedCost.toFixed(2)}</td>
            <td>${d.actualCost.toFixed(2)}</td>
            <td>${d.plannedFtes.toFixed(2)}</td>
            <td>${d.actualFtes.toFixed(2)}</td>
            <td>${d.notes}</td>
        </tr>
    `).join("");

    const resourceRows = cbsResource.map(r => `
        <tr>
            <td>${r.resource}</td>
            <td>${r.domain}</td>
            <td>${r.plannedCost.toFixed(2)}</td>
            <td>${r.actualCost.toFixed(2)}</td>
            <td class="${r.variance >= 0 ? "cbs-positive" : "cbs-negative"}">
                ${r.variance.toFixed(2)}
            </td>
            <td>${r.notes}</td>
        </tr>
    `).join("");

    container.innerHTML = `
        <h2>Cost Breakdown Structure (CBS): ${project.name}</h2>

        <div class="cbs-section">
            <h3>Cost Breakdown (WBS)</h3>
            <table>
                <tr>
                    <th>Work Product</th>
                    <th>Domain</th>
                    <th>Planned Effort</th>
                    <th>Actual Effort</th>
                    <th>Hourly Rate</th>
                    <th>Planned Cost (£)</th>
                    <th>Actual Cost (£)</th>
                    <th>Variance (£)</th>
                    <th>Resources</th>
                    <th>Notes</th>
                </tr>
                ${wbsRows}
            </table>
        </div>

        <div class="cbs-section">
            <h3>Cost Breakdown (Domain)</h3>
            <table>
                <tr>
                    <th>Domain</th>
                    <th>Planned Effort</th>
                    <th>Actual Effort</th>
                    <th>Planned Cost (£)</th>
                    <th>Actual Cost (£)</th>
                    <th>Planned FTEs</th>
                    <th>Actual FTEs</th>
                    <th>Notes</th>
                </tr>
                ${domainRows}
            </table>
        </div>

        <div class="cbs-section">
            <h3>Cost Breakdown (Resources)</h3>
            <table>
                <tr>
                    <th>Resource</th>
                    <th>Domain</th>
                    <th>Planned Cost (£)</th>
                    <th>Actual Cost (£)</th>
                    <th>Variance (£)</th>
                    <th>Notes</th>
                </tr>
                ${resourceRows}
            </table>
        </div>

        <p class="mt-10">
            CBS values are automatically calculated from WBS effort, RBS hourly rates,
            and resource weightage distribution.
        </p>
    `;
}
