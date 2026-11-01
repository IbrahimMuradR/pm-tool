router.register("program-dashboard", async function (programId) {
    const program = await loadProgram(programId);
    if (!program) { document.getElementById("main-view").innerHTML = "<h2>No program selected.</h2>"; return; }
    const metrics = await computeProgramDashboard(program);
    const rows = metrics.projectSummaries.map(p => `<tr><td><button class="link-button" onclick="loadProjectUI('${p.id}')">${p.name}</button></td><td>${p.rag}</td><td>${p.costVariance.toFixed(1)}%</td><td>${p.scheduleVariance.toFixed(1)}%</td><td>${p.totalIssues}</td></tr>`).join("");
    document.getElementById("main-view").innerHTML = `<button class="btn back-btn" onclick="goBack()">← Back</button><h2>Program Dashboard: ${program.name}</h2><p><button class="btn" onclick="openCreateProjectFromProgram()">+ Create Project</button></p><div class="dashboard-grid"><div class="widget"><h3>Overall status</h3><p>${metrics.programRag}</p></div><div class="widget"><h3>Cost variance</h3><p>${metrics.programCostVariance.toFixed(1)}%</p></div><div class="widget"><h3>Schedule variance</h3><p>${metrics.programScheduleVariance.toFixed(1)}%</p></div></div><table><tr><th>Project</th><th>RAG</th><th>Cost variance</th><th>Schedule variance</th><th>Issues</th></tr>${rows || "<tr><td colspan='5'>No projects linked.</td></tr>"}</table>`;
});
