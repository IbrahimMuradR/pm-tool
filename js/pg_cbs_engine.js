// ===============================
// PROGRAM COST & RESOURCE UTILIZATION ENGINE
// ===============================
// Rolls up CBS across all projects in the program
// ===============================

async function computeProgramCbs(program) {

    const projectIds = program.projects || [];

    const aggregatedWp = [];
    const domainMap = {};
    const resourceMap = {};

    for (const pid of projectIds) {
        const project = await loadProject(pid);
        if (!project) continue;

        const cbs = await computeProjectCbs(project);

        // WP-level aggregation (tag with project)
        cbs.wpSummaries.forEach(wp => {
            aggregatedWp.push({
                project: project.name,
                ...wp
            });

            // domain aggregation
            const domain = wp.domain || "(none)";
            if (!domainMap[domain]) {
                domainMap[domain] = {
                    domain,
                    plannedEffortDays: 0,
                    actualEffortDays: 0,
                    plannedCost: 0,
                    actualCost: 0
                };
            }
            domainMap[domain].plannedEffortDays += wp.plannedEffortDays;
            domainMap[domain].actualEffortDays += wp.actualEffortDays;
            domainMap[domain].plannedCost += wp.plannedCost;
            domainMap[domain].actualCost += wp.actualCost;
        });

        // resource aggregation
        cbs.resourceSummaries.forEach(r => {
            const key = r.resource;
            if (!resourceMap[key]) {
                resourceMap[key] = {
                    resource: r.resource,
                    domains: new Set(),
                    plannedCost: 0,
                    actualCost: 0
                };
            }
            r.domains.split(",").forEach(d => {
                if (d.trim()) resourceMap[key].domains.add(d.trim());
            });
            resourceMap[key].plannedCost += r.plannedCost;
            resourceMap[key].actualCost += r.actualCost;
        });
    }

    const domainSummaries = Object.values(domainMap).map(d => {
        const variance = d.plannedCost - d.actualCost;
        const plannedFtes = d.plannedEffortDays / 20;
        const actualFtes = d.actualEffortDays / 20;

        return {
            domain: d.domain,
            plannedEffortDays: d.plannedEffortDays,
            actualEffortDays: d.actualEffortDays,
            plannedCost: d.plannedCost,
            actualCost: d.actualCost,
            variance,
            plannedFtes,
            actualFtes,
            notes: ""
        };
    });

    const resourceSummaries = Object.values(resourceMap).map(r => {
        const variance = r.plannedCost - r.actualCost;
        return {
            resource: r.resource,
            domains: Array.from(r.domains).join(", "),
            plannedCost: r.plannedCost,
            actualCost: r.actualCost,
            variance,
            notes: ""
        };
    });

    return {
        wpSummaries: aggregatedWp,
        domainSummaries,
        resourceSummaries
    };
}
