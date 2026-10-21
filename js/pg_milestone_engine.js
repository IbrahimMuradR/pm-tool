// ===============================
// PROGRAM MILESTONE HEALTH ENGINE
// ===============================
// Computes milestone health based on:
// - Project gate completion
// - Cost variance
// - Schedule variance
// - Critical issues
// - Deliverable status
// ===============================

async function computeProgramMilestoneHealth(program) {
    const milestones = program.milestones || [];
    const projectIds = program.projects || [];

    // Load all projects
    const projects = [];
    for (const pid of projectIds) {
        const p = await loadProject(pid);
        if (p) projects.push(p);
    }

    // Compute milestone health for each milestone
    const milestoneSummaries = milestones.map(m => {
        const milestoneName = m.name || "";
        const milestoneProjects = projects.filter(p => p.currentGate === milestoneName);

        // If no projects are aligned to this milestone → neutral
        if (!milestoneProjects.length) {
            return {
                name: milestoneName,
                healthStatus: "Green",
                status: "No linked projects",
                notes: "No projects currently aligned to this milestone.",
                owner: m.owner || program.manager || "",
                dueDate: m.dueDate || ""
            };
        }

        // Aggregate metrics
        let totalCostVariance = 0;
        let totalScheduleVariance = 0;
        let criticalIssues = 0;
        let totalIssues = 0;
        let deliverableProblems = 0;

        milestoneProjects.forEach(p => {
            const plannedCost = p.plannedCost || 0;
            const actualCost = p.actualCost || 0;
            const costVariance = plannedCost
                ? ((actualCost - plannedCost) / plannedCost) * 100
                : 0;

            const plannedSchedule = p.plannedSchedule || 0;
            const actualSchedule = p.actualSchedule || 0;
            const scheduleVariance = plannedSchedule
                ? ((actualSchedule - plannedSchedule) / plannedSchedule) * 100
                : 0;

            totalCostVariance += costVariance;
            totalScheduleVariance += scheduleVariance;

            const issues = p.issues || [];
            criticalIssues += issues.filter(i => i.priority === "High").length;
            totalIssues += issues.length;

            const deliverables = p.deliverables || [];
            deliverableProblems += deliverables.filter(d =>
                d.status === "draft" ||
                d.status === "uninitiated"
            ).length;
        });

        // Average metrics
        const avgCostVariance = totalCostVariance / milestoneProjects.length;
        const avgScheduleVariance = totalScheduleVariance / milestoneProjects.length;

        // Determine milestone health
        let healthStatus = "Green";
        let status = "On Track";

        const costRed = avgCostVariance > 10;
        const costAmber = avgCostVariance > 5 && avgCostVariance <= 10;

        const scheduleRed = avgScheduleVariance > 10;
        const scheduleAmber = avgScheduleVariance > 5 && avgScheduleVariance <= 10;

        const issuesRed = criticalIssues > 0;
        const issuesAmber = totalIssues > 0;

        const deliverableRed = deliverableProblems > 0;

        if (costRed || scheduleRed || issuesRed || deliverableRed) {
            healthStatus = "Red";
            status = "At Risk";
        } else if (costAmber || scheduleAmber || issuesAmber) {
            healthStatus = "Amber";
            status = "Needs Attention";
        }

        return {
            name: milestoneName,
            healthStatus,
            status,
            notes: m.notes || "",
            owner: m.owner || program.manager || "",
            dueDate: m.dueDate || ""
        };
    });

    return milestoneSummaries;
}
