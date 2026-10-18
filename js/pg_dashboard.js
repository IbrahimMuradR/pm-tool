// ===============================
// PROGRAM DASHBOARD — UI + ENGINE HOOK
// ===============================
// Relies on:
// - storage.js (loadProgram, loadProject)
// - pg_dashboard_engine.js (computeProgramDashboard)
// ===============================

router.register("program-dashboard", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    // Set contextual back
    window.lastPage = { page: "home" };

    // -------------------------------
    // METRICS FROM PROGRAM ENGINE
    // -------------------------------
    const metrics = await computeProgramDashboard(program);

    const rag = metrics.programRag;
    const ragClass =
        rag === "Green" ? "status-green" :
        rag === "Amber" ? "status-amber" :
        "status-red";

    // -------------------------------
    // PROJECT SUMMARY TABLE
    // -------------------------------
    const projectRows = metrics.projectSummaries.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>
                <span class="status-circle ${
                    p.rag === "Green" ? "status-green" :
                    p.rag === "Amber" ? "status-amber" :
                    "status-red"
                }"></span>
                ${p.rag}
            </td>
            <td>${p.plannedCost}</td>
            <td>${p.actualCost}</td>
            <td>${p.costVariance.toFixed(1)}%</td>
            <td>${p.plannedSchedule}</td>
            <td>${p.actualSchedule}</td>
            <td>${p.scheduleVariance.toFixed(1)}%</td>
            <td>${p.highIssues}</td>
            <td>${p.totalIssues}</td>
        </tr>
    `).join("");

    // -------------------------------
    // FINAL RENDER
    // -------------------------------
    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
        <button class="btn" onclick="openCreateProjectFromProgram()">+ Create Project</button>

        <h2>Program Dashboard: ${program.name}</h2>

        <div class="dashboard-grid">
            <div class="widget">
                <h3>Program Info</h3>
                <p><strong>Manager:</strong> ${program.manager || "Not set"}</p>
                <p><strong>Projects:</strong> ${(program.projects || []).length}</p>
            </div>

            <div class="widget">
                <h3>Cost Summary</h3>
                <p><strong>Total Planned:</strong> £${metrics.totalPlannedCost}</p>
                <p><strong>Total Actual:</strong> £${metrics.totalActualCost}</p>
                <p><strong>Variance:</strong> ${metrics.programCostVariance.toFixed(1)}%</p>
            </div>

            <div class="widget">
                <h3>Schedule Summary</h3>
                <p><strong>Total Planned:</strong> ${metrics.totalPlannedSchedule} days</p>
                <p><strong>Total Actual:</strong> ${metrics.totalActualSchedule} days</p>
                <p><strong>Variance:</strong> ${metrics.programScheduleVariance.toFixed(1)}%</p>
            </div>

            <div class="widget">
                <h3>Overall Program Status</h3>
                <span class="status-circle ${ragClass}"></span>
                <span style="margin-left: 10px; font-size: 16px;">${rag}</span>
                <p class="mt-10"><strong>Average Score:</strong> ${metrics.avgScore.toFixed(2)}</p>
            </div>
        </div>

        <h3 class="mt-20">Project Summary</h3>
        <table>
            <tr>
                <th>Project</th>
                <th>RAG</th>
                <th>Planned Cost</th>
                <th>Actual Cost</th>
                <th>Cost Variance</th>
                <th>Planned Schedule</th>
                <th>Actual Schedule</th>
                <th>Schedule Variance</th>
                <th>Critical Issues</th>
                <th>Total Issues</th>
            </tr>
            ${projectRows || "<tr><td colspan='10'>No projects linked.</td></tr>"}
        </table>
    `;
});
