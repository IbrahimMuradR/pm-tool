console.log("RBS ENGINE REWRITTEN");

// ===============================
// RBS ROUTE
// ===============================
router.register("rbs-tree", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    // Ensure RBS structure exists
    project.rbs = project.rbs || { nodes: [] };

    // If no nodes exist, create root domain + one resource
    if (!project.rbs.nodes.length) {
        const rootDomain = {
            id: generateId("rbs-domain"),
            type: "domain",
            label: "Domain 0",
            parentId: null,
            collapsed: false,
            children: []
        };

        const rootResource = {
            id: generateId("rbs-resource"),
            type: "resource",
            parentId: rootDomain.id,
            title: "Project Manager",
            name: "",
            location: "",
            hourlyRate: 0
        };

        rootDomain.children.push(rootResource.id);

        project.rbs.nodes.push(rootDomain);
        project.rbs.nodes.push(rootResource);

        await saveProject(project);
    }

    renderRbsPage(project);
});

// ===============================
// PAGE SHELL
// ===============================
function renderRbsPage(project) {
    const container = document.getElementById("main-view");

    container.innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>

        <h2>Resource Breakdown Structure (RBS): ${project.name}</h2>

        <div id="rbs-org-container" class="rbs-container">
            <svg id="rbs-arrows" class="rbs-arrows"></svg>
            <div id="rbs-org-inner" class="rbs-inner"></div>
        </div>

        <p class="mt-10">
            Domains represent teams. Resources represent individual people with title, name, hourly rate and location.
            Double‑click a domain or resource to edit. Drag domains or resources to reorganize the tree.
        </p>
    `;

    layoutAndRenderTree(project);
    wireRbsInteractions(project);
}

// ===============================
// LAYOUT ENGINE
// ===============================
function layoutAndRenderTree(project) {
    const nodes = project.rbs.nodes;
    const inner = document.getElementById("rbs-org-inner");
    const arrowsSvg = document.getElementById("rbs-arrows");

    inner.innerHTML = "";
    arrowsSvg.innerHTML = "";

    const root = nodes.find(n => n.type === "domain" && n.parentId === null);
    if (!root) return;

    // Compute layout: positions for each node
    const positions = {};
    const levelHeight = 140;
    const nodeWidth = 200;
    const nodeHorizontalGap = 40;

    function measureSubtree(nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return 0;

        if (node.type === "resource") {
            return nodeWidth;
        }

        const visibleChildren = (node.children || [])
            .map(id => nodes.find(n => n.id === id))
            .filter(child => child && !(child.type === "domain" && child.collapsed));

        if (!visibleChildren.length) {
            return nodeWidth;
        }

        let total = 0;
        visibleChildren.forEach(child => {
            total += measureSubtree(child.id) + nodeHorizontalGap;
        });

        total -= nodeHorizontalGap; // remove last gap
        return Math.max(total, nodeWidth);
    }

    function assignPositions(nodeId, x, y) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const subtreeWidth = measureSubtree(nodeId);
        const nodeX = x + subtreeWidth / 2 - nodeWidth / 2;
        positions[nodeId] = { x: nodeX, y };

        if (node.type === "domain") {
            const visibleChildren = (node.children || [])
                .map(id => nodes.find(n => n.id === id))
                .filter(child => child && !(child.type === "domain" && child.collapsed));

            if (!visibleChildren.length) return;

            let currentX = x;
            const childY = y + levelHeight;

            visibleChildren.forEach(child => {
                const childSubtreeWidth = measureSubtree(child.id);
                assignPositions(child.id, currentX, childY);
                currentX += childSubtreeWidth + nodeHorizontalGap;
            });
        }
    }

    // Root centred horizontally
    const containerWidth = inner.clientWidth || inner.offsetWidth || 800;
    const rootSubtreeWidth = measureSubtree(root.id);
    const startX = (containerWidth - rootSubtreeWidth) / 2;
    assignPositions(root.id, startX, 20);

    // Render nodes
    nodes.forEach(node => {
        const pos = positions[node.id];
        if (!pos) return;

        const el = document.createElement("div");
        el.className = node.type === "domain" ? "rbs-node rbs-domain" : "rbs-node rbs-resource";
        el.style.position = "absolute";
        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
        el.setAttribute("data-node-id", node.id);

        if (node.type === "domain") {
            const isRoot = node.parentId === null;

            el.innerHTML = `
                <div class="rbs-domain-header">
                    <span class="rbs-toggle">${node.collapsed ? "[+]" : "[-]"}</span>
                    <strong>${node.label || "Domain"}</strong>
                    ${isRoot ? "" : `
                        <button class="btn btn-danger rbs-delete-btn">🗑</button>
                    `}
                    <button class="btn rbs-add-domain-btn">+D</button>
                    <button class="btn rbs-add-resource-btn">+R</button>
                </div>
            `;
        } else {
            el.innerHTML = `
                <div><strong>${node.title || "Title"}</strong></div>
                <div style="font-size:12px; margin-top:4px;">
                    ${node.name || "(name)"}<br>
                    ${node.location || "(location)"}<br>
                    £${node.hourlyRate || 0}/h
                </div>
            `;
        }

        inner.appendChild(el);
    });

    // Render arrows
    nodes.forEach(node => {
        if (node.type === "domain") {
            (node.children || []).forEach(childId => {
                const child = nodes.find(n => n.id === childId);
                if (!child) return;
                if (child.type === "domain" && child.collapsed) return;

                const parentPos = positions[node.id];
                const childPos = positions[child.id];
                if (!parentPos || !childPos) return;

                const x1 = parentPos.x + nodeWidth / 2;
                const y1 = parentPos.y + 80;
                const x2 = childPos.x + nodeWidth / 2;
                const y2 = childPos.y;

                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", x1);
                line.setAttribute("y1", y1);
                line.setAttribute("x2", x2);
                line.setAttribute("y2", y2);
                line.setAttribute("stroke", "#555");
                line.setAttribute("stroke-width", "2");
                arrowsSvg.appendChild(line);
            });
        }
    });
}

// ===============================
// INTERACTIONS
// ===============================
function wireRbsInteractions(project) {
    const inner = document.getElementById("rbs-org-inner");
    const nodes = project.rbs.nodes;

    // Editing + buttons
    inner.querySelectorAll(".rbs-node").forEach(el => {
        const nodeId = el.getAttribute("data-node-id");
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        if (node.type === "domain") {
            const toggle = el.querySelector(".rbs-toggle");
            const addDomainBtn = el.querySelector(".rbs-add-domain-btn");
            const addResourceBtn = el.querySelector(".rbs-add-resource-btn");
            const deleteBtn = el.querySelector(".rbs-delete-btn");

            toggle.onclick = async () => {
                node.collapsed = !node.collapsed;
                await saveProject(project);
                layoutAndRenderTree(project);
                wireRbsInteractions(project);
            };

            addDomainBtn.onclick = async () => {
                const newDomain = {
                    id: generateId("rbs-domain"),
                    type: "domain",
                    label: "New Domain",
                    parentId: node.id,
                    collapsed: false,
                    children: []
                };
                project.rbs.nodes.push(newDomain);
                node.children = node.children || [];
                node.children.push(newDomain.id);
                await saveProject(project);
                layoutAndRenderTree(project);
                wireRbsInteractions(project);
            };

            addResourceBtn.onclick = async () => {
                const newRes = {
                    id: generateId("rbs-resource"),
                    type: "resource",
                    parentId: node.id,
                    title: "New Role",
                    name: "",
                    location: "",
                    hourlyRate: 0
                };
                project.rbs.nodes.push(newRes);
                node.children = node.children || [];
                node.children.push(newRes.id);
                await saveProject(project);
                layoutAndRenderTree(project);
                wireRbsInteractions(project);
            };

            if (deleteBtn) {
                deleteBtn.onclick = async () => {
                    if (!confirm("Delete this domain and everything beneath it?")) return;
                    deleteSubtree(project, node.id);
                    await saveProject(project);
                    layoutAndRenderTree(project);
                    wireRbsInteractions(project);
                };
            }

            el.ondblclick = () => editDomainNode(project, node);
        } else {
            el.ondblclick = () => editResourceNode(project, node);
        }
    });

    // Drag and drop
    let dragNode = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    inner.querySelectorAll(".rbs-node").forEach(el => {
        const nodeId = el.getAttribute("data-node-id");
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const isRootDomain = node.type === "domain" && node.parentId === null;
        if (isRootDomain) return; // root not draggable

        el.style.cursor = "grab";

        el.onpointerdown = e => {
            dragNode = node;
            const rect = el.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            el.setPointerCapture(e.pointerId);
            el.style.opacity = "0.7";
        };

        el.onpointermove = e => {
            if (!dragNode) return;
            const x = e.clientX - dragOffsetX;
            const y = e.clientY - dragOffsetY;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
        };

        el.onpointerup = async e => {
            if (!dragNode) return;
            el.releasePointerCapture(e.pointerId);
            el.style.opacity = "1";

            // Determine drop target (nearest domain)
            const allDomainEls = inner.querySelectorAll(".rbs-domain");
            let bestDomain = null;
            let bestDist = Infinity;

            allDomainEls.forEach(domEl => {
                const domId = domEl.getAttribute("data-node-id");
                const domNode = nodes.find(n => n.id === domId);
                if (!domNode) return;

                const rect = domEl.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = e.clientX - centerX;
                const dy = e.clientY - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < bestDist) {
                    bestDist = dist;
                    bestDomain = domNode;
                }
            });

            if (bestDomain) {
                if (dragNode.type === "resource") {
                    // Move resource to new domain
                    const oldParent = nodes.find(n => n.id === dragNode.parentId);
                    if (oldParent && oldParent.children) {
                        oldParent.children = oldParent.children.filter(id => id !== dragNode.id);
                    }
                    dragNode.parentId = bestDomain.id;
                    bestDomain.children = bestDomain.children || [];
                    if (!bestDomain.children.includes(dragNode.id)) {
                        bestDomain.children.push(dragNode.id);
                    }
                } else if (dragNode.type === "domain") {
                    // Move domain subtree to new domain (not root)
                    if (bestDomain.id !== dragNode.id && dragNode.parentId !== null) {
                        const oldParent = nodes.find(n => n.id === dragNode.parentId);
                        if (oldParent && oldParent.children) {
                            oldParent.children = oldParent.children.filter(id => id !== dragNode.id);
                        }
                        dragNode.parentId = bestDomain.id;
                        bestDomain.children = bestDomain.children || [];
                        if (!bestDomain.children.includes(dragNode.id)) {
                            bestDomain.children.push(dragNode.id);
                        }
                    }
                }
            }

            dragNode = null;
            await saveProject(project);
            layoutAndRenderTree(project);
            wireRbsInteractions(project);
        };
    });
}

// ===============================
// EDITING HELPERS
// ===============================
function editDomainNode(project, domain) {
    const label = prompt("Domain label (team name):", domain.label || "");
    if (label === null) return;
    domain.label = label;
    saveProject(project).then(() => {
        layoutAndRenderTree(project);
        wireRbsInteractions(project);
    });
}

function editResourceNode(project, res) {
    const title = prompt("Title:", res.title || "");
    if (title === null) return;

    const name = prompt("Name:", res.name || "");
    if (name === null) return;

    const location = prompt("Location:", res.location || "");
    if (location === null) return;

    const rate = prompt("Hourly rate (£):", res.hourlyRate || 0);
    if (rate === null) return;

    res.title = title;
    res.name = name;
    res.location = location;
    res.hourlyRate = Number(rate) || 0;

    saveProject(project).then(() => {
        layoutAndRenderTree(project);
        wireRbsInteractions(project);
    });
}

// ===============================
// DELETE SUBTREE
// ===============================
function deleteSubtree(project, domainId) {
    const nodes = project.rbs.nodes;
    const toDelete = new Set();

    function collect(id) {
        toDelete.add(id);
        const node = nodes.find(n => n.id === id);
        if (!node) return;
        if (node.type === "domain") {
            (node.children || []).forEach(childId => collect(childId));
        }
    }

    collect(domainId);

    project.rbs.nodes = nodes.filter(n => !toDelete.has(n.id));

    project.rbs.nodes.forEach(n => {
        if (n.type === "domain" && n.children) {
            n.children = n.children.filter(id => !toDelete.has(id));
        }
    });
}
