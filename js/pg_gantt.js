// ===============================
// PROGRAM GANTT ENGINE — Program Gantt Chart
// ===============================

router.register("program-gantt", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const projectIds = program.projects || [];

    if (!projectIds.length) {
        document.getElementById("main-view").innerHTML = `
            <h2>Program Gantt: ${program.name}</h2>
            <p>No projects linked to this program yet.</p>
        `;
        return;
    }

    const projectTasks = [];

    for (const pid of projectIds) {
        const project = await loadProject(pid);
        if (!project) continue;

        const wbs = project.wbs || [];
        if (!wbs.length) continue;

        const tasks = buildProjectSpanFromWbs(project, wbs);
        if (!tasks) continue;

        projectTasks.push(tasks);
    }

    if (!projectTasks.length) {
        document.getElementById("main-view").innerHTML = `
            <h2>Program Gantt: ${program.name}</h2>
            <p>No WBS data available for linked projects.</p>
        `;
        return;
    }

    const { earliestStart, latestEnd } = getProgramTimelineBounds(projectTasks);
    const criticalProjectIds = computeProgramCriticalPath(projectTasks);

    renderProgramGantt(program, projectTasks, earliestStart, latestEnd, criticalProjectIds);
});

// -------------------------------
// Build project span from WBS
// -------------------------------
function buildProjectSpanFromWbs(project, wbs) {
    const datedItems = wbs.filter(wp => wp.startDate && wp.plannedDate);
    if (!datedItems.length) return null;

    let earliestStart = null;
    let latestEnd = null;

    datedItems.forEach(wp => {
        const s = new Date(wp.startDate);
        const e = new Date(wp.plannedDate);
        if (!earliestStart || s < earliestStart) earliestStart = s;
        if (!latestEnd || e > latestEnd) latestEnd = e;
    });

    const durationDays = Math.max(
        1,
        (latestEnd - earliestStart) / (1000 * 60 * 60 * 24)
    );

    return {
        id: project.id,
        name: project.name,
        start: earliestStart,
        end: latestEnd,
        durationDays,
        gate: project.currentGate || "",
        sprint: project.currentSprint || "",
        inputTo: (project.inputTo || []).map(p => p) // optional cross‑project deps
    };
}

// -------------------------------
// Program timeline bounds
// -------------------------------
function getProgramTimelineBounds(projectTasks) {
    let earliestStart = null;
    let latestEnd = null;

    projectTasks.forEach(t => {
        if (!earliestStart || t.start < earliestStart) earliestStart = t.start;
        if (!latestEnd || t.end > latestEnd) latestEnd = t.end;
    });

    return { earliestStart, latestEnd };
}

// -------------------------------
// Program critical path (simple longest project chain)
// -------------------------------
function computeProgramCriticalPath(projectTasks) {
    const taskMap = {};
    projectTasks.forEach(t => { taskMap[t.id] = t; });

    const adj = {};
    projectTasks.forEach(t => {
        (t.inputTo || []).forEach(targetId => {
            if (taskMap[targetId]) {
                if (!adj[t.id]) adj[t.id] = [];
                adj[t.id].push(targetId);
            }
        });
    });

    const memo = {};
    function dfs(id) {
        if (memo[id]) return memo[id];
        const children = adj[id] || [];
        if (!children.length) {
            memo[id] = { length: taskMap[id].durationDays, path: [id] };
            return memo[id];
        }
        let best = { length: taskMap[id].durationDays, path: [id] };
        children.forEach(childId => {
            const childRes = dfs(childId);
            const totalLen = taskMap[id].durationDays + childRes.length;
            if (totalLen > best.length) {
                best = { length: totalLen, path: [id, ...childRes.path] };
            }
        });
        memo[id] = best;
        return best;
    }

    let bestOverall = { length: 0, path: [] };
    projectTasks.forEach(t => {
        const res = dfs(t.id);
        if (res.length > bestOverall.length) {
            bestOverall = res;
        }
    });

    return new Set(bestOverall.path);
}

// -------------------------------
// Render Program Gantt
// -------------------------------
function renderProgramGantt(program, projectTasks, earliestStart, latestEnd, criticalProjectIds) {
    const container = document.getElementById("main-view");

    const totalDays = Math.max(
        1,
        (latestEnd - earliestStart) / (1000 * 60 * 60 * 24)
    );

    const rowsHtml = projectTasks.map(t => {
        const offsetDays = (t.start - earliestStart) / (1000 * 60 * 60 * 24);
        const offsetPercent = (offsetDays / totalDays) * 100;
        const widthPercent = (t.durationDays / totalDays) * 100;

        const isCritical = criticalProjectIds.has(t.id);
        const barClass = isCritical ? "gantt-bar gantt-critical" : "gantt-bar";

        const gateLabel = t.gate ? `Gate: ${t.gate}` : "";
        const sprintLabel = t.sprint ? `Sprint: ${t.sprint}` : "";

        return `
            <div class="gantt-row">
                <div class="gantt-label">
                    ${t.name}
                    <div style="font-size:12px; margin-top:2px;">
                        ${gateLabel} ${sprintLabel}
                    </div>
                </div>
                <div style="flex:1; position:relative;">
                    <div class="${barClass}"
                         style="margin-left:${offsetPercent}%; width:${widthPercent}%;">
                    </div>
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <h2>Program Gantt: ${program.name}</h2>
        <p><strong>Timeline:</strong> ${formatDate(earliestStart)} → ${formatDate(latestEnd)}</p>

        <div class="gantt-container">
            ${rowsHtml}
        </div>

        <p class="mt-10">
            Each bar represents a project’s span (from earliest WBS start to latest planned date).
            Critical path across projects is highlighted in red. Program gates can be aligned to these spans.
        </p>
    `;
}

// -------------------------------
// Date formatting helper
// -------------------------------
function formatDate(d) {
    if (!d) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
