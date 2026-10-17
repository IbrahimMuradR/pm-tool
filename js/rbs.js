router.register("rbs", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    const rbs = project.rbs || []; // tree of domains + roles/resources

    document.getElementById("main-view").innerHTML = `
        <h2>Resource Breakdown Structure (RBS): ${project.name}</h2>
        <p>Org chart with domains and roles will be rendered here.</p>
        <p>Double‑click cells to edit domain, role, name, location and hourly rate.</p>
        <p>Buttons: +R (add resource), +D (add domain + resource), Garbage (delete subtree).</p>
        <p>Views can be saved, set as default, and loaded from a dropdown.</p>
    `;
});

