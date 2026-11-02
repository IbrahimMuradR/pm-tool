// ===============================
// PROGRAM DASHBOARD ENGINE
// ===============================
// Computes:
// - Program cost & schedule variance
// - Program RAG (Green/Amber/Red)
// - Project scores (1/2/3)
// - Aggregated issue & deliverable health
// ===============================

async function computeProgramDashboard(program) {
    const projectIds = program.projects || [];
    const projectSummaries = [];

    let totalPlannedCost = 0;
    let totalActualCost = 0;
    let totalPlannedSchedule = 0;
    let totalActualSchedule = 0;

    for (const pid of projectIds) {
        const project = await loadProject(pid);
        if (!project) continue;

        const plannedCost = project.plannedCost || 0;
        const actualCost = project.actualCost || 0;
        const plannedSchedule = project.plannedSchedule || 0;
        const actualSchedule = project.actualSchedule || 0;

        const costVariance = plannedCost
            ? ((actualCost - plannedCost) / plannedCost) * 100
            : 0;

        const scheduleVariance = plannedSchedule
            ? ((actualSchedule - plannedSchedule) / plannedSchedule) * 100
            : 0;

        // Project RAG (same rules as project dashboard)
        let rag = "Green";
        const costRed = costVariance > 10;
        const costAmber = costVariance > 5 && costVariance <= 10;
        const scheduleRed = scheduleVariance > 10;
        const scheduleAmber = scheduleVariance > 5 && scheduleVariance <= 10;
        const highIssues = (project.issues || []).filter(i => i.priority === "High").length > 0;

        if (costRed || scheduleRed || highIssues) rag = "Red";
        else if (costAmber || scheduleAmber) rag = "Amber";

        const score = rag === "Green" ? 1 : rag === "Amber" ? 2 : 3;

        totalPlannedCost += plannedCost;
        totalActualCost += actualCost;
        totalPlannedSchedule += plannedSchedule;
        totalActualSchedule += actualSchedule;

        projectSummaries.push({
            id: project.id,
            name: project.name,
            rag,
            score,
            plannedCost,
            actualCost,
            costVariance,
            plannedSchedule,
            actualSchedule,
            scheduleVariance,
            highIssues: (project.issues || []).filter(i => i.priority === "High").length,
            totalIssues: (project.issues || []).length
        });
    }

    const programCostVariance = totalPlannedCost
        ? ((totalActualCost - totalPlannedCost) / totalPlannedCost) * 100
        : 0;

    const programScheduleVariance = totalPlannedSchedule
        ? ((totalActualSchedule - totalPlannedSchedule) / totalPlannedSchedule) * 100
        : 0;

    const avgScore = projectSummaries.length
        ? projectSummaries.reduce((s, p) => s + p.score, 0) / projectSummaries.length
        : 0;

    // Program RAG (wireframe rule)
    let programRag = "Green";
    if (avgScore < 1.7) programRag = "Green";
    else if (avgScore < 2.5) programRag = "Amber";
    else programRag = "Red";

    return {
        projectSummaries,
        totalPlannedCost,
        totalActualCost,
        totalPlannedSchedule,
        totalActualSchedule,
        programCostVariance,
        programScheduleVariance,
        avgScore,
        programRag
    };
}
