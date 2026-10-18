// ===============================
// PROJECT COST & RESOURCE UTILIZATION ENGINE
// ===============================
// Uses:
// - WBS (project.wbs)
// - RBS (project.rbs)
// Computes:
// - WP-level effort & cost
// - Domain-level effort & cost & FTEs
// - Resource-level cost & variance
// ===============================

async function computeProjectCbs(project) {

    const wbs = project.wbs || [];
    const rbs = project.rbs || [];

    // -------------------------------
    // Helper: get hourly rate for a role/person
    // -------------------------------
    function getHourlyRateForResponsible(responsible) {
        if (!responsible) return 0;

        // responsible may be a single name or array of names/roles
        const names = Array.isArray(responsible) ? responsible : [responsible];

        // average hourly rate across all matching resources
        let totalRate = 0;
        let count = 0;

        names.forEach(name => {
            rbs.forEach(node => {
                if (node.name === name || node.role === name) {
                    if (node.hourlyRate) {
                        totalRate += Number(node.hourlyRate);
                        count += 1;
                    }
                }
            });
        });

        if (!count) return 0;
        return totalRate / count;
    }

    // -------------------------------
    // WP-level CBS (from WBS)
    // -------------------------------
    const wpSummaries = wbs.map(wp => {
        const start = wp.startDate ? new Date(wp.startDate) : null;
        const planned = wp.plannedDate ? new Date(wp.plannedDate) : null;
        const actual = wp.actualDate ? new Date(wp.actualDate) : null;

        const plannedEffortDays = (start && planned)
            ? Math.max(0, (planned - start) / (1000 * 60 * 60 * 24))
            : 0;

        const actualEffortDays = (start && actual)
            ? Math.max(0, (actual - start) / (1000 * 60 * 60 * 24))
            : 0;

        const hourlyRate = getHourlyRateForResponsible(wp.responsible);
        const plannedCost = plannedEffortDays * 8 * hourlyRate; // 8h/day
        const actualCost = actualEffortDays * 8 * hourlyRate;
        const variance = plannedCost - actualCost;

        return {
            id: wp.id,
            workProduct: wp.workProduct || "",
            domain: wp.domain || "",
            plannedEffortDays,
            actualEffortDays,
            hourlyRate,
            plannedCost,
            actualCost,
            variance,
            responsible: wp.responsible || "",
            notes: wp.notes || ""
        };
    });

    // -------------------------------
    // Domain-level CBS (aggregate from WP)
    // -------------------------------
    const domainMap = {};

    wpSummaries.forEach(wp => {
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

    const domainSummaries = Object.values(domainMap).map(d => {
        const variance = d.plannedCost - d.actualCost;

        // FTEs: effort days / working days (assume 20 days/month)
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

    // -------------------------------
    // Resource-level CBS (from RBS + WBS)
    // -------------------------------
    const resourceMap = {};

    wpSummaries.forEach(wp => {
        const names = Array.isArray(wp.responsible)
            ? wp.responsible
            : (wp.responsible ? [wp.responsible] : []);

        if (!names.length) return;

        const share = 1 / names.length;

        names.forEach(name => {
            if (!resourceMap[name]) {
                resourceMap[name] = {
                    resource: name,
                    domains: new Set(),
                    plannedCost: 0,
                    actualCost: 0
                };
            }
            resourceMap[name].domains.add(wp.domain || "(none)");
            resourceMap[name].plannedCost += wp.plannedCost * share;
            resourceMap[name].actualCost += wp.actualCost * share;
        });
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
        wpSummaries,
        domainSummaries,
        resourceSummaries
    };
}
