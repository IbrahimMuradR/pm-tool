console.log("NEW RBS FILE LOADED");

// ===============================
// RBS PAGE — Tree Org Chart
// ===============================

router.register("rbs-tree", async function (projectId) {
    console.log("NEW RBS ROUTE EXECUTED");

    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    // Ensure RBS structure exists
    project.rbs = project.rbs || { views: [], defaultViewId: null, currentViewId: null };

    // If no views exist, create the default Top View with one domain + one resource
    if (!project.rbs.views.length) {

        const rootDomain = {
            id: generateId("rbs-domain"),
            type: "domain",
            label: "Project Management",
            showDetails: true,
            children: []
        };

        const rootResource = {
            id: generateId("rbs-resource"),
            type: "resource",
            domainId: rootDomain.id,
            role: "Project Manager",
            name: "",
            location: "",
            hourlyRate: 0
        };

        rootDomain.children.push(rootResource.id);

        const topView = {
            id: generateId("rbs-view"),
            name: "Top View",
            isDefault: true,
            nodes: [rootDomain, rootResource]
        };

        project.rbs.views.push(topView);
        project.rbs.defaultViewId = topView.id;
        project.rbs.currentViewId = topView.id;

        await saveProject(project);
    }

    const currentView =
        project.rbs.views.find(v => v.id === project.rbs.currentViewId) ||
        project.rbs.views[0];

    renderRbsPage(project, currentView);
});

// ===============================
// Render RBS Page
// ===============================
function renderRbsPage(project, view) {
    const container = document.getElementById("main-view");

    // keep a reference to current view for helpers
    window.lastRbsView = view;

    container.innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>

        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>Resource Breakdown Structure (RBS): ${project.name}</h2>

            <div>
                <select id="rbs-view-select" class="input">
                    ${project.rbs.views.map(v => `
                        <option value="${v.id}" ${v.id === view.id ? "selected" : ""}>
                            ${v.name}${v.isDefault ? " (default)" : ""}
                        </option>
                    `).join("")}
                </select>
                <button class="btn" id="rbs-save-view-btn">Save View</button>
                <button class="btn" id="rbs-edit-view-btn">✏️</button>
            </div>
        </div>

        <div id="rbs-org-container" class="rbs-container">
            <div id="rbs-org-inner" style="transform-origin: 0 0;"></div>
        </div>

        <p class="mt-10">
            Double‑click a cell to edit. Use +R to add a resource, +D to add a domain + resource,
            and 🗑 to delete a branch. Scroll to move around; Ctrl + mouse wheel to zoom.
        </p>
    `;

    renderRbsTree(view);
    wireRbsEvents(project, view);
}

// ===============================
// Render Tree (simple nested layout)
// ===============================
function renderRbsTree(view) {
    const inner = document.getElementById("rbs-org-inner");
    inner.innerHTML = "";

    const nodes = view.nodes || [];
    const domains = nodes.filter(n => n.type === "domain");

    const rootDomains = domains.filter(d =>
        !nodes.some(n => n.type === "domain" && n.children && n.children.includes(d.id))
    );

    rootDomains.forEach((root, idx) => {
        const rootEl = createDomainBlock(view, root);
        rootEl.style.marginTop = idx === 0 ? "20px" : "60px";
        inner.appendChild(rootEl);
    });
}

function createDomainBlock(view, domain) {
    const nodes = view.nodes;
    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-block";
    wrapper.style.margin = "20px";
    wrapper.style.textAlign = "center";

    // Domain header with +D, +R, delete
    const header = document.createElement("div");
    header.style.marginBottom = "10px";

    const plusD = document.createElement("button");
    plusD.className = "btn";
    plusD.textContent = "+D";
    plusD.onclick = () => addDomainAndResource(view, domain.id);

    const plusR = document.createElement("button");
    plusR.className = "btn";
    plusR.textContent = "+R";
    plusR.style.marginLeft = "5px";
    plusR.onclick = () => addResource(view, domain.id);

    const del = document.createElement("button");
    del.className = "btn btn-danger";
    del.textContent = "🗑";
    del.style.marginLeft = "5px";
    del.onclick = () => deleteBranch(view, domain.id);

    header.appendChild(plusD);
    header.appendChild(plusR);
    header.appendChild(del);

    wrapper.appendChild(header);

    // Domain cell
    const domainCell = document.createElement("div");
    domainCell.className = "rbs-node";
    domainCell.style.display = "inline-block";
    domainCell.style.minWidth = "180px";
    domainCell.style.marginBottom = "10px";
    domainCell.setAttribute("data-node-id", domain.id);

    domainCell.innerHTML = `
        <div><strong>${domain.label}</strong></div>
        <div style="font-size:12px; margin-top:4px;">
            ${domain.showDetails ? "Location + Hourly rate visible" : "Details hidden"}
        </div>
    `;

    domainCell.ondblclick = () => editDomain(domain);

    wrapper.appendChild(domainCell);

    // Children resources/domains
    const childrenContainer = document.createElement("div");
    childrenContainer.style.marginTop = "15px";

    (domain.children || []).forEach(childId => {
        const childNode = nodes.find(n => n.id === childId);
        if (!childNode) return;

        if (childNode.type === "resource") {
            const resCell = document.createElement("div");
            resCell.className = "rbs-node";
            resCell.style.display = "inline-block";
            resCell.style.margin = "10px";
            resCell.setAttribute("data-node-id", childNode.id);

            resCell.innerHTML = `
                <div><strong>${childNode.role || "Role"}</strong></div>
                <div style="font-size:12px; margin-top:4px;">
                    ${childNode.name || "(name)"}<br>
                    ${childNode.location || "(location)"}<br>
                    £${childNode.hourlyRate || 0}/h
                </div>
            `;

            resCell.ondblclick = () => editResource(childNode);

            childrenContainer.appendChild(resCell);
        }

        if (childNode.type === "domain") {
            const domBlock = createDomainBlock(view, childNode);
            childrenContainer.appendChild(domBlock);
        }
    });

    wrapper.appendChild(childrenContainer);

    return wrapper;
}

// ===============================
// Tree Operations
// ===============================
function addResource(view, domainId) {
    const domain = view.nodes.find(n => n.id === domainId && n.type === "domain");
    if (!domain) return;

    const res = {
        id: generateId("rbs-resource"),
        type: "resource",
        domainId,
        role: "New Role",
        name: "",
        location: "",
        hourlyRate: 0
    };

    view.nodes.push(res);
    domain.children = domain.children || [];
    domain.children.push(res.id);

    rerenderCurrentRbs(view);
}

function addDomainAndResource(view, parentDomainId) {
    const parent = view.nodes.find(n => n.id === parentDomainId && n.type === "domain");
    if (!parent) return;

    const newDomain = {
        id: generateId("rbs-domain"),
        type: "domain",
        label: "New Domain",
        showDetails: true,
        children: []
    };

    const newRes = {
        id: generateId("rbs-resource"),
        type: "resource",
        domainId: newDomain.id,
        role: "New Role",
        name: "",
        location: "",
        hourlyRate: 0
    };

    newDomain.children.push(newRes.id);

    view.nodes.push(newDomain);
    view.nodes.push(newRes);

    parent.children = parent.children || [];
    parent.children.push(newDomain.id);

    rerenderCurrentRbs(view);
}

function deleteBranch(view, domainId) {
    if (!confirm("Delete this domain and everything beneath it?")) return;

    const toDelete = new Set();
    collectBranch(view, domainId, toDelete);

    view.nodes = view.nodes.filter(n => !toDelete.has(n.id));

    // Remove references from parents
    view.nodes.forEach(n => {
        if (n.type === "domain" && n.children) {
            n.children = n.children.filter(id => !toDelete.has(id));
        }
    });

    rerenderCurrentRbs(view);
}

function collectBranch(view, nodeId, set) {
    set.add(nodeId);
    const node = view.nodes.find(n => n.id === nodeId);
    if (!node) return;
    (node.children || []).forEach(childId => collectBranch(view, childId, set));
}

// ===============================
// Editing
// ===============================
function editDomain(domain) {
    const label = prompt("Domain label:", domain.label || "");
    if (label === null) return;

    const showDetails = confirm("Show location/hourly rate details on this domain cell?");

    domain.label = label;
    domain.showDetails = showDetails;

    rerenderCurrentRbsFromDomain(domain);
}

function editResource(res) {
    const role = prompt("Role:", res.role || "");
    if (role === null) return;

    const name = prompt("Name:", res.name || "");
    if (name === null) return;

    const location = prompt("Location:", res.location || "");
    if (location === null) return;

    const rate = prompt("Hourly rate (£):", res.hourlyRate || 0);
    if (rate === null) return;

    res.role = role;
    res.name = name;
    res.location = location;
    res.hourlyRate = Number(rate) || 0;

    rerenderCurrentRbsFromResource(res);
}

// ===============================
// View + Zoom Wiring
// ===============================
function wireRbsEvents(project, view) {
    const select = document.getElementById("rbs-view-select");
    const saveBtn = document.getElementById("rbs-save-view-btn");
    const editBtn = document.getElementById("rbs-edit-view-btn");
    const orgContainer = document.getElementById("rbs-org-container");
    const orgInner = document.getElementById("rbs-org-inner");

    // Switch view
    select.onchange = async () => {
        const newId = select.value;
        project.rbs.currentViewId = newId;
        await saveProject(project);

        const newView = project.rbs.views.find(v => v.id === newId);
        renderRbsPage(project, newView);
    };

    // Save view (create new)
    saveBtn.onclick = async () => {
        const name = prompt("Name for this view:", view.name || "");
        if (!name) return;

        const newView = {
            id: generateId("rbs-view"),
            name,
            isDefault: false,
            nodes: JSON.parse(JSON.stringify(view.nodes))
        };

        project.rbs.views.push(newView);
        project.rbs.currentViewId = newView.id;
        await saveProject(project);

        renderRbsPage(project, newView);
    };

    // Edit view (rename / set default / delete)
    editBtn.onclick = async () => {
        const choice = prompt("Edit view:\n1 = Rename\n2 = Set as default\n3 = Delete", "1");
        if (!choice) return;

        if (choice === "1") {
            const newName = prompt("New name:", view.name || "");
            if (!newName) return;
            view.name = newName;
        } else if (choice === "2") {
            project.rbs.views.forEach(v => v.isDefault = false);
            view.isDefault = true;
            project.rbs.defaultViewId = view.id;
        } else if (choice === "3") {
            if (!confirm("Delete this view?")) return;
            project.rbs.views = project.rbs.views.filter(v => v.id !== view.id);
            const fallback = project.rbs.views[0];
            project.rbs.currentViewId = fallback ? fallback.id : null;
        }

        await saveProject(project);

        const current =
            project.rbs.views.find(v => v.id === project.rbs.currentViewId) ||
            project.rbs.views[0];

        renderRbsPage(project, current);
    };

    // Zoom with Ctrl + mouse wheel
    let scale = 1;
    orgContainer.addEventListener("wheel", e => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        scale = Math.min(Math.max(0.3, scale + delta), 2.5);
        orgInner.style.transform = `scale(${scale})`;
    });
}

// ===============================
// Helpers to rerender current view
// ===============================
function rerenderCurrentRbs(view) {
    const projectId = activeProject;
    loadProject(projectId).then(project => {
        renderRbsPage(project, view);
        saveProject(project);
    });
}

function rerenderCurrentRbsFromDomain(domain) {
    rerenderCurrentRbs(getCurrentViewForNode(domain.id));
}

function rerenderCurrentRbsFromResource(res) {
    rerenderCurrentRbs(getCurrentViewForNode(res.id));
}

function getCurrentViewForNode(nodeId) {
    return window.lastRbsView || null;
}
