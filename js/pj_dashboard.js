router.register("project-dashboard", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    const gate = project.currentGate || "Not set";
    const sprint = project.currentSprint || "Not set";
    const deliverables = project.deliverables || [];
    const issues = project.issues || [];
    const openCRs = (project.changeRequests || []).length;

    const totalIssues = issues.length;
    const highIssues = issues.filter(i => i.priority === "High").length;
    const mediumIssues = issues.filter(i => i.priority === "Medium").length;
    const lowIssues = issues.filter(i => i.priority === "Low").length;

    document.getElementById("main-view").innerHTML = `
        <h2>Project Dashboard: ${project.name}</h2>
        <p><strong>Project Manager:</strong> ${project.manager || "Not set"}</p>
        <p><strong>Active Gate:</strong> ${gate}</p>
        <p><strong>Active Sprint:</strong> ${sprint}</p>

        <h3>Deliverables (Gate & Sprint)</h3>
        <p>Ordered by status: released, in review, draft, uninitiated, tailored out.</p>

        <h3>Active Issues</h3>
        <p><strong>Total:</strong> ${totalIssues}</p>
        <p><strong>High Priority:</strong> ${highIssues}</p>
        <p><strong>Medium Priority:</strong> ${mediumIssues}</p>
        <p><strong>Low Priority:</strong> ${lowIssues}</p>

        <h3>Costs</h3>
        <p>Overall project cost vs budget, gate and sprint costs vs budgets, and variances will be shown here.</p>

        <h3>Open Change Requests:</h3>
        <p>${openCRs}</p>
    `;
});
