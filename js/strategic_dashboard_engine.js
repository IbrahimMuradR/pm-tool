// ===============================
// STRATEGIC DASHBOARD ENGINE
// ===============================
// Computes:
// - Strategic RAG
// - Program roll‑up KPIs
// - Strategic cost & schedule variance
// - Strategic issue health
// ===============================

async function computeStrategicDashboard(strategic) {

    const programIds = strategic.programs || [];
    const programSummaries = [];

    let totalPlannedCost = 0;
    let totalActualCost = 0;
    let totalPlannedSchedule = 0;
    let totalActualSchedule = 0;

    let totalCriticalIssues = 0;
    let totalIssues = 0;

    for (const pgid of programIds) {
        const program = await loadProgram(pgid);
        if (!program) continue;

        // Use program dashboard engine
        const pgMetrics = await computeProgramDashboard(program);

        totalPlannedCost += pgMetrics.totalPlannedCost;
        totalActualCost += pgMetrics.totalActualCost;

        totalPlannedSchedule += pgMetrics.totalPlannedSchedule;
        totalActualSchedule += pgMetrics.totalActualSchedule;

        // Count issues for this program and for the strategic total
        let programCriticalIssues = 0;
        let programIssues = 0;
        pgMetrics.projectSummaries.forEach(p => {
            programCriticalIssues += p.highIssues;
            programIssues += p.totalIssues;
        });
        totalCriticalIssues += programCriticalIssues;
        totalIssues += programIssues;

        programSummaries.push({
            id: program.id,
            name: program.name,
            rag: pgMetrics.programRag,
            avgScore: pgMetrics.avgScore,
            costVariance: pgMetrics.programCostVariance,
            scheduleVariance: pgMetrics.programScheduleVariance,
            criticalIssues: programCriticalIssues,
            totalIssues: programIssues
        });
    }

    // Strategic cost variance
    const strategicCostVariance = totalPlannedCost
        ? ((totalActualCost - totalPlannedCost) / totalPlannedCost) * 100
        : 0;

    // Strategic schedule variance
    const strategicScheduleVariance = totalPlannedSchedule
        ? ((totalActualSchedule - totalPlannedSchedule) / totalPlannedSchedule) * 100
        : 0;

    // Strategic RAG (same scoring as program)
    const avgScore = programSummaries.length
        ? programSummaries.reduce((s, p) => s + p.avgScore, 0) / programSummaries.length
        : 0;

    let strategicRag = "Green";
    if (avgScore < 1.7) strategicRag = "Green";
    else if (avgScore < 2.5) strategicRag = "Amber";
    else strategicRag = "Red";

    return {
        programSummaries,
        totalPlannedCost,
        totalActualCost,
        totalPlannedSchedule,
        totalActualSchedule,
        strategicCostVariance,
        strategicScheduleVariance,
        totalCriticalIssues,
        totalIssues,
        avgScore,
        strategicRag
    };
}
