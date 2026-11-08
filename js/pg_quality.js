// ===============================
// PROGRAM QUALITY PAGE — UI + ENGINE HOOK
// ===============================

router.register("program-quality", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const projectIds = program.projects || [];
    const projectMetrics = [];

    let totalWps = 0;
    let totalIssues = 0;
    let totalCr = 0;

    for (const pid of projectIds) {
        const project = await loadProject(pid);
        if (!project) continue;

        const qm = await computeQualityMetrics(project);

        projectMetrics.push({
            name: project.name,
            ...qm
        });

        totalWps += qm.totalWps;
        totalIssues += qm.totalIssues;
        totalCr += qm.totalCr;
    }

    const avgDefectDensity = projectMetrics.length
        ? projectMetrics.reduce((s, p) => s + p.defectDensity, 0) / projectMetrics.length
        : 0;

    const avgTestCoverage = projectMetrics.length
        ? projectMetrics.reduce((s, p) => s + p.testCoverage, 0) / projectMetrics.length
        : 0;

    const avgReworkRate = projectMetrics.length
        ? projectMetrics.reduce((s, p) => s + p.reworkRate, 0) / projectMetrics.length
        : 0;

    // Program quality RAG from average of project RAGs
    const scoreMap = { Green: 1, Amber: 2, Red: 3 };
    const avgScore = projectMetrics.length
        ? projectMetrics.reduce((s, p) => s + (scoreMap[p.qualityRag] || 2), 0) / projectMetrics.length
        : 0;

    let programRag = "Green";
    if (avgScore < 1.7) programRag = "Green";
    else if (avgScore < 2.5) programRag = "Amber";
    else programRag = "Red";

    const ragClass =
        programRag === "Green" ? "status-green" :
        programRag === "Amber" ? "status-amber" :
        "status-red";

    const rows = projectMetrics.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.totalWps}</td>
            <td>${p.totalIssues}</td>
            <td>${p.totalCr}</td>
            <td>${p.defectDensity.toFixed(2)}</td>
            <td>${p.testCoverage.toFixed(1)}%</td>
            <td>${p.reworkRate.toFixed(2)}</td>
            <td>${p.qualityRag}</td>
        </tr>
    `).join("");

    const bodyRows = projectMetrics.length
        ? rows
        : `<tr><td colspan="8">No projects linked to this program.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Program Quality: ${program.name}</h2>

        <div class="dashboard-grid">
            <div class="widget">
                <h3>Summary</h3>
                <p><strong>Projects:</strong> ${projectMetrics.length}</p>
                <p><strong>Total WPs:</strong> ${totalWps}</p>
                <p><strong>Total Issues:</strong> ${totalIssues}</p>
                <p><strong>Total CRs:</strong> ${totalCr}</p>
            </div>

            <div class="widget">
                <h3>Average Defect Density</h3>
                <p>${avgDefectDensity.toFixed(2)} issues per WP</p>
            </div>

            <div class="widget">
                <h3>Average Test Coverage</h3>
                <p>${avgTestCoverage.toFixed(1)}%</p>
            </div>

            <div class="widget">
                <h3>Average Rework Rate</h3>
                <p>${avgReworkRate.toFixed(2)} CRs per WP</p>
            </div>

            <div class="widget">
                <h3>Program Quality Status</h3>
                <span class="status-circle ${ragClass}"></span>
                <span style="margin-left:10px;">${programRag}</span>
            </div>
        </div>

        <h3 class="mt-20">Project Quality Breakdown</h3>
        <table>
            <tr>
                <th>Project</th>
                <th>Work Products</th>
                <th>Issues</th>
                <th>Change Requests</th>
                <th>Defect Density</th>
                <th>Test Coverage</th>
                <th>Rework Rate</th>
                <th>Quality RAG</th>
            </tr>
            ${bodyRows}
        </table>
    `;
});
