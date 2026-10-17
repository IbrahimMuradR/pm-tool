router.register("project-gantt", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Project Gantt Chart: ${project.name}</h2>
        <p>This chart will be generated from WBS work products, using start date, planned date, actual date and dependencies (Input to).</p>
        <p>The critical path will be highlighted in red.</p>
    `;
});

