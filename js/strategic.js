router.register("strategic-objectives", async function (strategicId) {
    const strategy = await loadStrategicObjective(strategicId);
    if (!strategy) {
        document.getElementById("main-view").innerHTML = "<h2>No strategy selected.</h2>";
        return;
    }
    activeStrategic = strategy.id;
    const [metrics, allPrograms] = await Promise.all([
        computeStrategicDashboard(strategy), loadAllPrograms()
    ]);
    const linkedIds = new Set(strategy.programs || []);
    const availablePrograms = allPrograms.filter(program => !linkedIds.has(program.id));
    const programOptions = availablePrograms.map(program =>
        `<option value="${program.id}">${strategyEscape(program.name || "Untitled Program")}</option>`
    ).join("");
    const programRows = metrics.programSummaries.map(program => `
        <tr>
            <td><button type="button" class="link-button" onclick="loadProgramUI('${program.id}')">${strategyEscape(program.name)}</button></td>
            <td>${strategyEscape(program.rag)}</td>
            <td>${Number(program.costVariance || 0).toFixed(1)}%</td>
            <td>${Number(program.scheduleVariance || 0).toFixed(1)}%</td>
            <td>${Number(program.criticalIssues || 0)}</td>
            <td>${Number(program.totalIssues || 0)}</td>
            <td><button type="button" class="btn btn-danger strategy-unlink-btn" onclick="unlinkProgramFromStrategy('${strategy.id}','${program.id}')">Remove</button></td>
        </tr>`).join("");
    const rag = metrics.strategicRag || "Green";
    const ragClass = rag === "Green" ? "status-green" : rag === "Amber" ? "status-amber" : "status-red";

    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
        <button class="btn" onclick="openCreateProgramFromStrategic()">+ Create Program</button>
        <h2>Strategy Dashboard: ${strategyEscape(strategy.name)}</h2>
        ${strategy.description ? `<p class="strategy-description">${strategyEscape(strategy.description)}</p>` : ""}
        <div class="dashboard-grid">
            <div class="widget"><h3>Strategy Info</h3><p><strong>Owner:</strong> ${strategyEscape(strategy.owner || "Not set")}</p><p><strong>Programs:</strong> ${(strategy.programs || []).length}</p></div>
            <div class="widget"><h3>Cost Summary</h3><p><strong>Total Planned:</strong> £${Number(metrics.totalPlannedCost || 0)}</p><p><strong>Total Actual:</strong> £${Number(metrics.totalActualCost || 0)}</p><p><strong>Variance:</strong> ${Number(metrics.strategicCostVariance || 0).toFixed(1)}%</p></div>
            <div class="widget"><h3>Schedule Summary</h3><p><strong>Total Planned:</strong> ${Number(metrics.totalPlannedSchedule || 0)} days</p><p><strong>Total Actual:</strong> ${Number(metrics.totalActualSchedule || 0)} days</p><p><strong>Variance:</strong> ${Number(metrics.strategicScheduleVariance || 0).toFixed(1)}%</p></div>
            <div class="widget"><h3>Overall Strategy Status</h3><span class="status-circle ${ragClass}"></span><span class="status-label">${strategyEscape(rag)}</span><p class="mt-10"><strong>Average Score:</strong> ${Number(metrics.avgScore || 0).toFixed(2)}</p></div>
        </div>
        <div class="strategy-program-linker">
            <h3>Link an Existing Program</h3>
            <div class="strategy-link-controls">
                <select id="strategy-program-select" ${availablePrograms.length ? "" : "disabled"}>
                    <option value="">${availablePrograms.length ? "Select an existing program" : "No unlinked programs available"}</option>
                    ${programOptions}
                </select>
                <button type="button" class="btn btn-primary" onclick="linkExistingProgram('${strategy.id}')" ${availablePrograms.length ? "" : "disabled"}>Add Program</button>
            </div>
        </div>
        <h3 class="mt-20">Program Summary</h3>
        <table>
            <tr><th>Program</th><th>RAG</th><th>Cost Variance</th><th>Schedule Variance</th><th>Critical Issues</th><th>Total Issues</th><th>Actions</th></tr>
            ${programRows || '<tr><td colspan="7">No programs linked.</td></tr>'}
        </table>`;
    await populateSidebar();
});

async function linkExistingProgram(strategyId) {
    const select = document.getElementById("strategy-program-select");
    const programId = select && select.value;
    if (!programId) return alert("Select a program first.");
    const [strategy, program] = await Promise.all([
        loadStrategicObjective(strategyId), loadProgram(programId)
    ]);
    if (!strategy || !program) return alert("The selected program could not be loaded.");
    strategy.programs = strategy.programs || [];
    if (!strategy.programs.includes(programId)) strategy.programs.push(programId);
    strategy.updatedAt = Date.now();
    program.strategicId = strategyId;
    program.updatedAt = Date.now();
    await Promise.all([saveStrategicObjective(strategy), saveProgram(program)]);
    router.navigate("strategic-objectives", strategyId);
}

async function unlinkProgramFromStrategy(strategyId, programId) {
    const program = await loadProgram(programId);
    const name = program ? program.name : "this program";
    if (!confirm(`Remove "${name}" from this Strategy? The program itself will not be deleted.`)) return;
    const strategy = await loadStrategicObjective(strategyId);
    if (!strategy) return;
    strategy.programs = (strategy.programs || []).filter(id => id !== programId);
    strategy.updatedAt = Date.now();
    if (program && (program.strategicId === strategyId || program.strategicObjective === strategyId)) {
        program.strategicId = null;
        program.strategicObjective = "";
        program.updatedAt = Date.now();
        await saveProgram(program);
    }
    await saveStrategicObjective(strategy);
    if (activeProgram === programId) activeProgram = null;
    router.navigate("strategic-objectives", strategyId);
}

function strategyEscape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}
