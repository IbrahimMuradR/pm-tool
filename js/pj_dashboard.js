router.register("project-dashboard", async function(projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Project Dashboard: ${project.name}</h2>
        <p><strong>Manager:</strong> ${project.manager}</p>
        <p><strong>Active Gate:</strong> ${project.gates[0] || "None"}</p>
        <p><strong>Active Sprint:</strong> ${project.sprints[0] || "None"}</p>
        <hr>
        <p>This is a placeholder project dashboard. You will expand this in Step 8.</p>
    `;
});

