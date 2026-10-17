router.register("program-dashboard", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    // Placeholder aggregates – will be computed from projects later
    const totalCostVariance = program.totalCostVariance || 0;
    const totalScheduleVariance = program.totalScheduleVariance || 0;
    const totalCriticalIssues = program.totalCriticalIssues || 0;
    const ragScore = program.ragScore || 1; // 1=Green,2=Amber,3=Red

    let ragStatus = "Green";
    if (ragScore >= 2.5) ragStatus = "Red";
    else if (ragScore >= 1.7) ragStatus = "Amber";

    document.getElementById("main-view").innerHTML = `
        <h2>Program Dashboard: ${program.name}</h2>
        <p><strong>Program Manager:</strong> ${program.manager || "Not set"}</p>
        <p><strong>Current Program Gate:</strong> ${program.currentGate || "Not set"}</p>
        <p><strong>Current Milestone:</strong> ${program.currentMilestone || "Not set"}</p>
        <p><strong>Total Cost Variance:</strong> ${totalCostVariance}%</p>
        <p><strong>Total Schedule Variance:</strong> ${totalScheduleVariance}%</p>
        <p><strong>Total Critical Issues:</strong> ${totalCriticalIssues}</p>
        <p><strong>Program RAG Status:</strong> ${ragStatus}</p>
        <p><strong>Linked Strategic Objective:</strong> ${program.strategicObjective || "None"}</p>
        <hr>
        <p>Cross‑project dependency map and detailed metrics will be implemented later.</p>
    `;
});
