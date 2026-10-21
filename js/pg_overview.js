router.register("program-overview", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const projects = program.projects || [];
    const rows = [];

    for (const projectId of projects) {
        const project = await loadProject(projectId);
        if (!project) continue;

        const gate = project.currentGate || "";
        const sprint = project.currentSprint || "";
        const scheduleHealth = project.scheduleHealth || "";
        const costHealth = project.costHealth || "";
        const criticalIssues = (project.issues || []).filter(i => i.priority === "High").length;
        const status = project.status || "";
        const plannedCost = project.plannedCost || "";
        const actualCost = project.actualCost || "";
        const costVariance = plannedCost && actualCost
            ? (plannedCost - actualCost)
            : "";

        rows.push(`
            <tr>
                <td>${project.name}</td>
                <td>${gate}</td>
                <td>${sprint}</td>
                <td>${scheduleHealth}</td>
                <td>${costHealth}</td>
                <td>${criticalIssues}</td>
                <td>${(project.inputTo || []).join(", ")}</td>
                <td>${status}</td>
                <td>${plannedCost}</td>
                <td>${actualCost}</td>
                <td>${costVariance}</td>
            </tr>
        `);
    }

    const bodyRows = rows.length
        ? rows.join("")
        : `<tr><td colspan="11">No projects linked to this program yet.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Program Overview: ${program.name}</h2>
        <table>
            <tr>
                <th>Project</th>
                <th>Gate</th>
                <th>Sprint</th>
                <th>Schedule Health</th>
                <th>Cost Health</th>
                <th>Critical Issues</th>
                <th>Input to</th>
                <th>Status</th>
                <th>Planned Cost</th>
                <th>Actual Cost</th>
                <th>Cost Variance</th>
            </tr>
            ${bodyRows}
        </table>
    `;
});
