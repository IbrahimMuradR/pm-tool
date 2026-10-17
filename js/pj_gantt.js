// ===============================
// GANTT ENGINE — Project Gantt Chart
// ===============================

router.register("project-gantt", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    project.wbs = project.wbs || [];

    if (!project.wbs.length) {
        document.getElementById("main-view").innerHTML = `
            <h2>Project Gantt: ${project.name}</h2>
            <p>No WBS defined yet. Create WBS items first.</p>
        `;
        return;
    }

    const tasks = buildTasksFromWbs(project.wbs);
    const { earliestStart, latestEnd } = getTimelineBounds(tasks);
    const criticalPathIds = computeCriticalPath(tasks);

    renderProjectGantt(project, tasks, earliestStart, latestEnd, criticalPathIds);
});

// -------------------------------
// Build tasks from WBS
// -------------------------------
function buildTasksFromWbs(wbs) {
    return wbs
        .filter(wp => wp.startDate && wp.plannedDate)
        .map(wp => {
            const start = new Date(wp.startDate);
            const end = new Date(wp.plannedDate);
            const durationDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));

            return {
                id: wp.id,
                label: wp.workProduct,
                start,
                end,
                durationDays,
                domain: wp.domain || "(none)",
                milestone: wp.milestone || "",
                inputTo: wp.inputTo || null
            };
        });
}

// -------------------------------
// Timeline bounds
// -------------------------------
function getTimelineBounds(tasks) {
    let earliestStart = null;
    let latestEnd = null;

    tasks.forEach(t => {
        if (!earliestStart || t.start < earliestStart) earliestStart = t.start;
        if (!latestEnd || t.end > latestEnd) latestEnd = t.end;
    });

    return { earliestStart, latestEnd };
}

// -------------------------------
// Critical path (simple longest chain via inputTo)
// -------------------------------
function computeCriticalPath(tasks) {
    const taskMap = {};
    tasks.forEach(t => { taskMap[t.id] = t; });

    // Build adjacency: from → to
    const adj = {};
    tasks.forEach(t => {
        if (t.inputTo && taskMap[t.inputTo]) {
            if (!adj[t.id]) adj[t.id] = [];
            adj[t.id].push(t.inputTo);
        }
    });

    // DFS to find longest path
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
    tasks.forEach(t => {
        const res = dfs(t.id);
        if (res.length > bestOverall.length) {
            bestOverall = res;
        }
    });

    return new Set(bestOverall.path);
}

// -------------------------------
// Render Gantt
// -------------------------------
function renderProjectGantt(project, tasks, earliestStart, latestEnd, criticalPathIds) {
    const container = document.getElementById("main-view");

    const totalDays = Math.max(
        1,
        (latestEnd - earliestStart) / (1000 * 60 * 60 * 24)
    );

    const rowsHtml = tasks.map(t => {
        const offsetDays = (t.start - earliestStart) / (1000 * 60 * 60 * 24);
        const offsetPercent = (offsetDays / totalDays) * 100;
        const widthPercent = (t.durationDays / totalDays) * 100;

        const isCritical = criticalPathIds.has(t.id);
        const barClass = isCritical ? "gantt-bar gantt-critical" : "gantt-bar";

        return `
            <div class="gantt-row">
                <div class="gantt-label">${t.label}</div>
                <div style="flex:1; position:relative;">
                    <div class="${barClass}"
                         style="margin-left:${offsetPercent}%; width:${widthPercent}%;">
                    </div>
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <h2>Project Gantt: ${project.name}</h2>
        <p><strong>Timeline:</strong> ${formatDate(earliestStart)} → ${formatDate(latestEnd)}</p>

        <div class="gantt-container">
            ${rowsHtml}
        </div>

        <p class="mt-10">
            Critical path is highlighted in red. Dependencies are derived from the "Input to" field in WBS.
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
