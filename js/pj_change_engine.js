// ===============================
// PROJECT CHANGE REQUEST ENGINE
// ===============================
// Computes:
// - CR impact (cost, schedule, scope)
// - CR severity (Green/Amber/Red)
// - CR status health
// ===============================

async function computeProjectChangeRequests(project) {

    const changeRequests = project.changeRequests || [];

    const crSummaries = changeRequests.map(cr => {

        const impactCost = Number(cr.impactCost || 0);
        const impactSchedule = Number(cr.impactSchedule || 0);
        const impactScope = cr.impactScope || "None";

        // Severity scoring
        let severity = "Green";

        const costRed = impactCost > 10000;
        const costAmber = impactCost > 2000;

        const scheduleRed = impactSchedule > 20;
        const scheduleAmber = impactSchedule > 5;

        const scopeRed = impactScope === "Major";
        const scopeAmber = impactScope === "Moderate";

        if (costRed || scheduleRed || scopeRed) severity = "Red";
        else if (costAmber || scheduleAmber || scopeAmber) severity = "Amber";

        // Status health
        let statusHealth = "Green";
        if (cr.status === "Rejected") statusHealth = "Red";
        else if (cr.status === "In Review") statusHealth = "Amber";

        return {
            id: cr.id,
            description: cr.description || "",
            domain: cr.domain || "",
            responsible: cr.responsible || "",
            priority: cr.priority || "",
            impactCost,
            impactSchedule,
            impactScope,
            severity,
            status: cr.status || "",
            statusHealth,
            discussion: cr.discussion || "",
            tasks: cr.tasks || [],
            notes: cr.notes || ""
        };
    });

    return crSummaries;
}
