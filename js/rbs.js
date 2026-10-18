// ===============================
// RBS PAGE — Resource Breakdown Structure
// ===============================
// Lets user define roles, team members, and hourly rates.
// ===============================

router.register("rbs", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    // Ensure RBS exists
    project.rbs = project.rbs || { views: [], defaultViewId: null, currentViewId: null };

    // If empty, create a default view
    if (!project.rbs.views.length) {
        const defaultView = {
            id: generateId("rbs"),
            name: "Default RBS View",
            nodes: []
        };
        project.rbs.views.push(defaultView);
        project.rbs.defaultViewId = defaultView.id;
        project.rbs.currentViewId = defaultView.id;
        await saveProject(project);
    }

    const view = project.rbs.views.find(v => v.id === project.rbs.currentViewId);

    renderRbsPage(project, view);
});

// ===============================
// Render RBS Page
// ===============================
function renderRbsPage(project, view) {
    const container = document.getElementById("main-view");

    const rows = view.nodes.map(node => `
        <tr data-node-id="${node.id}">
            <td>${node.label}</td>
            <td>${node.type}</td>
            <td>${node.hourlyRate || 0}</td>
            <td>${node.notes || ""}</td>
            <td>
                <button class="btn rbs-edit-btn">Edit</button>
                <button class="btn btn-danger rbs-delete-btn">Delete</button>
            </td>
        </tr>
    `).join("");

    container.innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>

        <h2>Resource Breakdown Structure (RBS): ${project.name}</h2>

        <div class="table-actions">
            <button class="btn" id="rbs-add-btn">Add Resource (+)</button>
        </div>

        <table>
            <tr>
                <th>Label</th>
                <th>Type</th>
                <th>Hourly Rate (£)</th>
                <th>Notes</th>
                <th>Actions</th>
            </tr>
            ${rows || "<tr><td colspan='5'>No resources defined.</td></tr>"}
        </table>

        <p class="mt-10">
            Define roles and team members here. WBS and CBS calculations use these hourly rates.
        </p>
    `;

    wireRbsEvents(project, view);
}

// ===============================
// Wire Events
// ===============================
function wireRbsEvents(project, view) {
    const table = document.querySelector("#main-view table");

    // Add resource
    document.getElementById("rbs-add-btn").onclick = async () => {
        const label = prompt("Resource Label (e.g., System Engineer):");
        if (!label) return;

        const type = prompt("Type (resource or role):", "resource");
        if (!type) return;

        const rate = prompt("Hourly Rate (£):", "0");
        const notes = prompt("Notes:", "");

        const node = {
            id: generateId("rbs-node"),
            label,
            type,
            hourlyRate: Number(rate || 0),
            notes
        };

        view.nodes.push(node);
        await saveProject(project);
        renderRbsPage(project, view);
    };

    // Edit resource
    table.querySelectorAll(".rbs-edit-btn").forEach(btn => {
        btn.onclick = async () => {
            const nodeId = btn.closest("tr").getAttribute("data-node-id");
            const node = view.nodes.find(n => n.id === nodeId);
            if (!node) return;

            const label = prompt("Label:", node.label);
            if (label === null) return;

            const type = prompt("Type (resource or role):", node.type);
            if (type === null) return;

            const rate = prompt("Hourly Rate (£):", node.hourlyRate);
            if (rate === null) return;

            const notes = prompt("Notes:", node.notes);
            if (notes === null) return;

            node.label = label;
            node.type = type;
            node.hourlyRate = Number(rate || 0);
            node.notes = notes;

            await saveProject(project);
            renderRbsPage(project, view);
        };
    });

    // Delete resource
    table.querySelectorAll(".rbs-delete-btn").forEach(btn => {
        btn.onclick = async () => {
            const nodeId = btn.closest("tr").getAttribute("data-node-id");
            view.nodes = view.nodes.filter(n => n.id !== nodeId);

            await saveProject(project);
            renderRbsPage(project, view);
        };
    });
}
