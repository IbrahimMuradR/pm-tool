// ===============================
// PROJECT QUALITY PAGE — UI + ENGINE HOOK
// ===============================

router.register("project-quality", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    const qm = await computeQualityMetrics(project);

    const ragClass =
        qm.qualityRag === "Green" ? "status-green" :
        qm.qualityRag === "Amber" ? "status-amber" :
        "status-red";

    document.getElementById("main-view").innerHTML = `
        <h2>Project Quality: ${project.name}</h2>

        <div class="dashboard-grid">
            <div class="widget">
                <h3>Summary</h3>
                <p><strong>Work Products:</strong> ${qm.totalWps}</p>
                <p><strong>Issues:</strong> ${qm.totalIssues}</p>
                <p><strong>Change Requests:</strong> ${qm.totalCr}</p>
            </div>

            <div class="widget">
                <h3>Defect Density</h3>
                <p><strong>Issues per WP:</strong> ${qm.defectDensity.toFixed(2)}</p>
            </div>

            <div class="widget">
                <h3>Test Coverage</h3>
                <p><strong>Coverage:</strong> ${qm.testCoverage.toFixed(1)}%</p>
            </div>

            <div class="widget">
                <h3>Rework Rate</h3>
                <p><strong>CRs per WP:</strong> ${qm.reworkRate.toFixed(2)}</p>
            </div>

            <div class="widget">
                <h3>Quality Status</h3>
                <span class="status-circle ${ragClass}"></span>
                <span style="margin-left:10px;">${qm.qualityRag}</span>
            </div>
        </div>

        <p class="mt-10">
            Quality KPIs are inferred from WBS, Issues and Change Requests.
        </p>
    `;
});
