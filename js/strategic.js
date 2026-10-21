// ===============================
// STRATEGIC DASHBOARD — UI + ENGINE HOOK
// ===============================

router.register("strategic-objectives", async function (strategicId) {
    const strategic = await loadStrategicObjective(strategicId);

    if (!strategic) {
        document.getElementById("main-view").innerHTML =
            "<h2>No strategic plan selected.</h2>";
        return;
    }

    window.lastPage = { page: "home" };

    const metrics = await computeStrategicDashboard(strategic);

    const rag = metrics.strategicRag;
    const ragClass =
        rag === "Green" ? "status-green" :
        rag === "Amber" ? "status-amber" :
        "status-red";

    const programRows = metrics.programSummaries.map(p => `
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
            <td>${p.costVariance.toFixed(1)}%</td>
            <td>${p.scheduleVariance.toFixed(1)}%</td>
            <td>${p.criticalIssues}</td>
            <td>${p.totalIssues}</td>
        </tr>
    `).join("");

    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
        <button class="btn" onclick="openCreateProgramFromStrategic()">+ Create Program</button>

        <h2>Strategic Dashboard: ${strategic.name}</h2>

        <div class="dashboard-grid">
            <div class="widget">
                <h3>Strategic Info</h3>
                <p><strong>Owner:</strong> ${strategic.owner || "Not set"}</p>
                <p><strong>Programs:</strong> ${(strategic.programs || []).length}</p>
            </div>

            <div class="widget">
                <h3>Cost Summary</h3>
                <p><strong>Total Planned:</strong> £${metrics.totalPlannedCost}</p>
                <p><strong>Total Actual:</strong> £${metrics.totalActualCost}</p>
                <p><strong>Variance:</strong> ${metrics.strategicCostVariance.toFixed(1)}%</p>
            </div>

            <div class="widget">
                <h3>Schedule Summary</h3>
                <p><strong>Total Planned:</strong> ${metrics.totalPlannedSchedule} days</p>
                <p><strong>Total Actual:</strong> ${metrics.totalActualSchedule} days</p>
                <p><strong>Variance:</strong> ${metrics.strategicScheduleVariance.toFixed(1)}%</p>
            </div>

            <div class="widget">
                <h3>Overall Strategic Status</h3>
                <span class="status-circle ${ragClass}"></span>
                <span style="margin-left: 10px; font-size: 16px;">${rag}</span>
                <p class="mt-10"><strong>Average Score:</strong> ${metrics.avgScore.toFixed(2)}</p>
            </div>
        </div>

        <h3 class="mt-20">Program Summary</h3>
        <table>
            <tr>
                <th>Program</th>
                <th>RAG</th>
                <th>Cost Variance</th>
                <th>Schedule Variance</th>
                <th>Critical Issues</th>
                <th>Total Issues</th>
            </tr>
            ${programRows || "<tr><td colspan='6'>No programs linked.</td></tr>"}
        </table>
    `;
});
