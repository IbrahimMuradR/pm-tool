// ===============================
// RBS ENGINE — Resource Breakdown Structure
// ===============================

router.register("rbs", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    // Ensure RBS structure exists
    project.rbs = project.rbs || {
        views: [],
        defaultViewId: null,
        currentViewId: null
    };

    // If no views yet, create a default "Top View"
    if (!project.rbs.views.length) {
        const topView = createDefaultTopView();
        project.rbs.views.push(topView);
        project.rbs.defaultViewId = topView.id;
        project.rbs.currentViewId = topView.id;
        await saveProject(project);
    }

    const currentView = project.rbs.views.find(v => v.id === project.rbs.currentViewId);

    renderRbsPage(project, currentView);
});

// -------------------------------
// Default Top View
// -------------------------------
function createDefaultTopView() {
    return {
        id: generateId("rbs-view"),
        name: "Top View",
        nodes: [
            {
                id: generateId("rbs-node"),
                type: "domain",
                label: "Domain 0",
                x: 400,
                y: 50,
                showRates: false
            },
            {
                id: generateId("rbs-node"),
                type: "resource",
                label: "Role 1",
                person: "",
                location: "",
                hourlyRate: "",
                x: 400,
                y: 150
            }
        ],
        edges: [
            {
                from: null, // root
                to: null    // first domain (optional)
            }
        ]
    };
}

// -------------------------------
// Render RBS Page
// -------------------------------
async function renderRbsPage(project, view) {
    const container = document.getElementById("main-view");

    const viewOptions = project.rbs.views.map(v => `
        <option value="${v.id}" ${v.id === project.rbs.currentViewId ? "selected" : ""}>
            ${v.name}
        </option>
    `).join("");

    container.innerHTML = `
        <h2>Resource Breakdown Structure (RBS): ${project.name}</h2>

        <div class="dashboard-grid">
            <div class="widget">
                <h3>View Management</h3>
                <p>
                    <strong>Current View:</strong>
                    <select id="rbs-view-select">
                        ${viewOptions}
                    </select>
                </p>
                <p class="mt-10">
                    <button class="btn" id="rbs-save-view-btn">Save View</button>
                    <button class="btn" id="rbs-set-default-btn">Set as Default</button>
                    <button class="btn btn-danger" id="rbs-delete-view-btn">Delete View</button>
                </p>
            </div>

            <div class="widget">
                <h3>Tree Controls</h3>
                <p>
                    <button class="btn" id="rbs-add-domain-btn">+D (Add Domain + Resource)</button>
                    <button class="btn" id="rbs-add-resource-btn">+R (Add Resource)</button>
                    <button class="btn btn-danger" id="rbs-delete-subtree-btn">Garbage (Delete Subtree)</button>
                </p>
                <p class="mt-10">
                    Double‑click a node to edit role/person/location/hourly rate or toggle rate visibility.
                </p>
            </div>
        </div>

        <div class="mt-20">
            <div class="rbs-container" id="rbs-canvas">
                ${renderRbsNodes(view)}
            </div>
        </div>
    `;

    wireRbsEvents(project, view);
}

// -------------------------------
// Render Nodes
// -------------------------------
function renderRbsNodes(view) {
    return view.nodes.map(node => {
        const isDomain = node.type === "domain";
        const roleText = isDomain ? node.label : (node.label || "Role");
        const personText = !isDomain
            ? `${node.person || "Name"} / ${node.location || "Location"} / ${node.hourlyRate || "Rate"}`
            : (node.showRates ? (node.person || "") : "");

        return `
            <div class="rbs-node"
                 data-node-id="${node.id}"
                 style="left:${node.x}px; top:${node.y}px;">
                <div><strong>${roleText}</strong></div>
                <div style="margin-top:4px; font-size:12px;">
                    ${personText}
                </div>
            </div>
        `;
    }).join("");
}

// -------------------------------
// Wire Events
// -------------------------------
function wireRbsEvents(project, view) {
    const canvas = document.getElementById("rbs-canvas");

    // View select
    document.getElementById("rbs-view-select").onchange = async (e) => {
        project.rbs.currentViewId = e.target.value;
        await saveProject(project);
        const newView = project.rbs.views.find(v => v.id === project.rbs.currentViewId);
        renderRbsPage(project, newView);
    };

    // Save view (snapshot)
    document.getElementById("rbs-save-view-btn").onclick = async () => {
        const name = prompt("Enter name for this view:");
        if (!name) return;

        const newView = {
            id: generateId("rbs-view"),
            name,
            nodes: JSON.parse(JSON.stringify(view.nodes)),
            edges: JSON.parse(JSON.stringify(view.edges))
        };

        project.rbs.views.push(newView);
        project.rbs.currentViewId = newView.id;
        await saveProject(project);

        renderRbsPage(project, newView);
    };

    // Set default
    document.getElementById("rbs-set-default-btn").onclick = async () => {
        project.rbs.defaultViewId = view.id;
        await saveProject(project);
        alert("Default view updated.");
    };

    // Delete view
    document.getElementById("rbs-delete-view-btn").onclick = async () => {
        if (!confirm("Delete this view?")) return;

        project.rbs.views = project.rbs.views.filter(v => v.id !== view.id);

        if (!project.rbs.views.length) {
            const topView = createDefaultTopView();
            project.rbs.views.push(topView);
            project.rbs.defaultViewId = topView.id;
            project.rbs.currentViewId = topView.id;
        } else {
            project.rbs.currentViewId = project.rbs.defaultViewId || project.rbs.views[0].id;
        }

        await saveProject(project);
        const newView = project.rbs.views.find(v => v.id === project.rbs.currentViewId);
        renderRbsPage(project, newView);
    };

    // Add Domain + Resource
    document.getElementById("rbs-add-domain-btn").onclick = async () => {
        const domainLabel = prompt("Enter Domain name:");
        if (!domainLabel) return;

        const domainNode = {
            id: generateId("rbs-node"),
            type: "domain",
            label: domainLabel,
            x: 200 + Math.random() * 600,
            y: 50 + Math.random() * 400,
            showRates: false
        };

        const resourceNode = {
            id: generateId("rbs-node"),
            type: "resource",
            label: "Role",
            person: "",
            location: "",
            hourlyRate: "",
            x: domainNode.x,
            y: domainNode.y + 100
        };

        view.nodes.push(domainNode, resourceNode);
        view.edges.push({ from: domainNode.id, to: resourceNode.id });

        await saveProject(project);
        renderRbsPage(project, view);
    };

    // Add Resource under last domain
    document.getElementById("rbs-add-resource-btn").onclick = async () => {
        const lastDomain = [...view.nodes].reverse().find(n => n.type === "domain");
        if (!lastDomain) {
            alert("No domain found. Add a domain first.");
            return;
        }

        const resourceNode = {
            id: generateId("rbs-node"),
            type: "resource",
            label: "Role",
            person: "",
            location: "",
            hourlyRate: "",
            x: lastDomain.x + (Math.random() * 80 - 40),
            y: lastDomain.y + 100 + Math.random() * 200
        };

        view.nodes.push(resourceNode);
        view.edges.push({ from: lastDomain.id, to: resourceNode.id });

        await saveProject(project);
        renderRbsPage(project, view);
    };

    // Delete subtree (simple: delete last domain + its resources)
    document.getElementById("rbs-delete-subtree-btn").onclick = async () => {
        if (!confirm("Delete subtree from last domain downward?")) return;

        const lastDomain = [...view.nodes].reverse().find(n => n.type === "domain");
        if (!lastDomain) {
            alert("No domain found.");
            return;
        }

        const toDeleteIds = [lastDomain.id];
        view.edges.forEach(e => {
            if (e.from === lastDomain.id) {
                toDeleteIds.push(e.to);
            }
        });

        view.nodes = view.nodes.filter(n => !toDeleteIds.includes(n.id));
        view.edges = view.edges.filter(e => !toDeleteIds.includes(e.from) && !toDeleteIds.includes(e.to));

        await saveProject(project);
        renderRbsPage(project, view);
    };

    // Double‑click node to edit
    canvas.querySelectorAll(".rbs-node").forEach(nodeEl => {
        nodeEl.ondblclick = async () => {
            const nodeId = nodeEl.getAttribute("data-node-id");
            const node = view.nodes.find(n => n.id === nodeId);
            if (!node) return;

            if (node.type === "domain") {
                const label = prompt("Domain name:", node.label || "");
                if (label === null) return;

                const showRates = confirm("Show location/hourly rate on this domain cell?");
                node.label = label;
                node.showRates = showRates;
            } else {
                const role = prompt("Role:", node.label || "");
                if (role === null) return;

                const person = prompt("Name:", node.person || "");
                if (person === null) return;

                const location = prompt("Location:", node.location || "");
                if (location === null) return;

                const rate = prompt("Hourly rate:", node.hourlyRate || "");
                if (rate === null) return;

                node.label = role;
                node.person = person;
                node.location = location;
                node.hourlyRate = rate;
            }

            await saveProject(project);
            renderRbsPage(project, view);
        };
    });
}
