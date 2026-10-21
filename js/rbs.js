const RBS = { width: 270, domainHeight: 206, resourceHeight: 165, levelGap: 95, siblingGap: 50 };

router.register("rbs-tree", async projectId => {
  const project = await loadProject(projectId);
  if (!project) return document.getElementById("main-view").innerHTML = "<h2>No project selected.</h2>";
  project.rbs = normaliseRbs(project.rbs);
  if (!project.rbs.nodes.length) project.rbs.nodes.push(newRbsNode(null, true, "Domain 0"));
  repairRbs(project.rbs.nodes);
  await saveProject(project);
  renderRbsPage(project);
});

function newRbsNode(parentId, ownsDomain, domain) {
  return { id: generateId("rbs"), parentId, children: [], collapsed: false, ownsDomain,
    domain: domain || "Domain 0", title: "New Role", name: "", location: "", hourlyRate: 0 };
}

function normaliseRbs(rbs) {
  if (!rbs) return { nodes: [] };
  if (Array.isArray(rbs)) rbs = { nodes: rbs };
  if (!Array.isArray(rbs.nodes)) {
    const view = (rbs.views || []).find(v => v.id === rbs.defaultViewId) || (rbs.views || [])[0];
    rbs = { nodes: view?.nodes || [] };
  }
  if (!rbs.nodes.length || rbs.nodes.every(n => Object.hasOwn(n, "ownsDomain"))) return rbs;

  const old = rbs.nodes, byId = new Map(old.map(n => [n.id, n])), converted = [];
  function convertDomain(domain, parentId) {
    const children = (domain.children || []).map(id => byId.get(id)).filter(Boolean);
    const leader = children.find(n => n.type === "resource");
    const cell = { id: domain.id || generateId("rbs"), parentId, children: [], collapsed: !!domain.collapsed,
      ownsDomain: true, domain: domain.label || "New Domain", title: leader?.title || "New Role",
      name: leader?.name || "", location: leader?.location || "", hourlyRate: +(leader?.hourlyRate || 0) };
    converted.push(cell);
    children.filter(n => n.type === "domain").forEach(child => { const c = convertDomain(child, cell.id); cell.children.push(c.id); });
    children.filter(n => n.type === "resource" && n !== leader).forEach(resource => {
      const c = { id: resource.id || generateId("rbs"), parentId: cell.id, children: [], collapsed: false,
        ownsDomain: false, domain: cell.domain, title: resource.title || "New Role", name: resource.name || "",
        location: resource.location || "", hourlyRate: +(resource.hourlyRate || 0) };
      converted.push(c); cell.children.push(c.id);
    });
    return cell;
  }
  const root = old.find(n => n.type === "domain" && n.parentId == null);
  if (root) convertDomain(root, null);
  return { nodes: converted };
}

function repairRbs(nodes) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  nodes.forEach(n => {
    n.children = [...new Set((n.children || []).filter(id => id !== n.id && byId.has(id)))];
    n.children.forEach(id => byId.get(id).parentId = n.id);
    n.collapsed = !!n.collapsed; n.ownsDomain = n.parentId == null ? true : !!n.ownsDomain;
    n.domain ||= "Domain 0"; n.title ||= "New Role"; n.name ||= ""; n.location ||= ""; n.hourlyRate = +(n.hourlyRate || 0);
  });
  if (nodes.length && !nodes.some(n => n.parentId == null)) nodes[0].parentId = null;
  updateInheritedDomains(nodes);
}

function nearestDomain(nodes, start) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  for (let node = start, seen = new Set(); node && !seen.has(node.id); node = byId.get(node.parentId)) {
    seen.add(node.id); if (node.ownsDomain && node.domain) return node.domain;
  }
  return "Domain 0";
}

function updateInheritedDomains(nodes, startId = null) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const starts = startId ? [byId.get(startId)] : nodes.filter(n => n.parentId == null);
  function walk(node) {
    if (!node) return;
    if (!node.ownsDomain) node.domain = nearestDomain(nodes, byId.get(node.parentId));
    (node.children || []).forEach(id => walk(byId.get(id)));
  }
  starts.forEach(walk);
}

function rbsHeight(node) { return node.ownsDomain ? RBS.domainHeight : RBS.resourceHeight; }

function renderRbsPage(project) {
  installRbsCss();
  document.getElementById("main-view").innerHTML = `
    <button class="btn back-btn" onclick="goBack()">← Back</button>
    <h2>Resource Breakdown: ${rbsEsc(project.name)}</h2>
    <div id="rbs-stage"><div id="rbs-canvas"><svg id="rbs-lines"></svg><div id="rbs-layer"></div></div></div>
    <p class="mt-10">Drag a non-root cell onto another cell to change its parent.</p>
    <div id="rbs-dialog-bg" hidden><form id="rbs-dialog">
      <h3>Edit RBS cell</h3><label>Domain<input id="rbs-domain"></label>
      <label>Role<input id="rbs-role" required></label><label>Name<input id="rbs-name"></label>
      <label>Location<input id="rbs-location"></label><label>Hourly rate (£)<input id="rbs-rate" type="number" min="0" step="0.01"></label>
      <div class="rbs-dialog-actions"><button type="button" class="btn" id="rbs-cancel">Cancel</button><button class="btn btn-primary">Save</button></div>
    </form></div>`;
  drawRbs(project); bindRbs(project);
}

function visibleRbs(nodes) {
  const byId = new Map(nodes.map(n => [n.id, n])), root = nodes.find(n => n.parentId == null), list = [];
  function walk(node) { if (!node) return; list.push(node); if (!node.collapsed) (node.children || []).forEach(id => walk(byId.get(id))); }
  walk(root); return { byId, root, list };
}

function drawRbs(project) {
  const stage = document.getElementById("rbs-stage"), canvas = document.getElementById("rbs-canvas"),
    layer = document.getElementById("rbs-layer"), svg = document.getElementById("rbs-lines");
  const { byId, root, list } = visibleRbs(project.rbs.nodes);
  layer.innerHTML = ""; svg.innerHTML = ""; if (!root) return;
  const positions = {};
  const children = n => n.collapsed ? [] : (n.children || []).map(id => byId.get(id)).filter(Boolean);
  const measure = n => { const kids = children(n); return kids.length ? Math.max(RBS.width, kids.reduce((s, k) => s + measure(k), 0) + RBS.siblingGap * (kids.length - 1)) : RBS.width; };
  function place(node, left, top) {
    const width = measure(node); positions[node.id] = { x: left + (width - RBS.width) / 2, y: top };
    let childLeft = left; children(node).forEach(child => { const w = measure(child); place(child, childLeft, top + rbsHeight(node) + RBS.levelGap); childLeft += w + RBS.siblingGap; });
  }
  const treeWidth = measure(root), start = Math.max(32, ((stage.clientWidth || 1000) - treeWidth) / 2); place(root, start, 32);
  let maxX = stage.clientWidth || 1000, maxY = 600;
  list.forEach(node => {
    const pos = positions[node.id], height = rbsHeight(node), isRoot = node.parentId == null, hasChildren = node.children.length > 0;
    maxX = Math.max(maxX, pos.x + RBS.width + 32); maxY = Math.max(maxY, pos.y + height + 32);
    const box = document.createElement("article"); box.className = `rbs-box ${node.ownsDomain ? "has-domain" : "role-only"}`;
    box.dataset.id = node.id; box.style.left = `${pos.x}px`; box.style.top = `${pos.y}px`; box.style.height = `${height}px`; box.draggable = !isRoot;
    box.innerHTML = `<header>
      <button type="button" class="rbs-icon rbs-toggle" ${hasChildren ? "" : "disabled"}>${node.collapsed ? "+" : "−"}</button>
      <div class="rbs-header-actions"><button type="button" class="btn rbs-add-domain">+D</button><button type="button" class="btn rbs-add-resource">+R</button></div>
      ${isRoot ? "" : '<button type="button" class="rbs-icon rbs-delete" aria-label="Delete">🗑</button>'}
    </header>
    ${node.ownsDomain ? `<div class="rbs-row"><small>DOMAIN</small><b>${rbsEsc(node.domain)}</b></div>` : ""}
    <div class="rbs-row"><small>ROLE</small><b>${rbsEsc(node.title)}</b></div>
    <div class="rbs-row"><small>NAME</small><b>${rbsEsc(node.name || "Unassigned")}</b><em>${rbsEsc(node.location || "No location")} · £${node.hourlyRate.toFixed(2)}/h</em></div>`;
    layer.appendChild(box);
  });
  canvas.style.width = `${maxX}px`; canvas.style.height = `${maxY}px`; svg.setAttribute("width", maxX); svg.setAttribute("height", maxY); svg.setAttribute("viewBox", `0 0 ${maxX} ${maxY}`);
  list.forEach(parent => {
    const kids = children(parent); if (!kids.length) return;
    const pp = positions[parent.id], sx = pp.x + RBS.width / 2, sy = pp.y + rbsHeight(parent), jointY = sy + RBS.levelGap / 2;
    const points = kids.map(k => ({ x: positions[k.id].x + RBS.width / 2, y: positions[k.id].y }));
    let d = `M ${sx} ${sy} V ${jointY}`;
    if (points.length > 1) d += ` M ${Math.min(...points.map(p => p.x))} ${jointY} H ${Math.max(...points.map(p => p.x))}`;
    points.forEach(p => d += ` M ${p.x} ${jointY} V ${p.y}`);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d", d); path.setAttribute("class", "rbs-line"); svg.appendChild(path);
  });
}

function bindRbs(project) {
  const layer = document.getElementById("rbs-layer");
  layer.onclick = async event => {
    const box = event.target.closest(".rbs-box"); if (!box) return;
    const node = project.rbs.nodes.find(n => n.id === box.dataset.id); if (!node) return;
    if (event.target.closest(".rbs-toggle")) { if (!node.children.length) return; node.collapsed = !node.collapsed; }
    else if (event.target.closest(".rbs-add-domain")) { const child = newRbsNode(node.id, true, "New Domain"); project.rbs.nodes.push(child); node.children.push(child.id); node.collapsed = false; }
    else if (event.target.closest(".rbs-add-resource")) { const child = newRbsNode(node.id, false, nearestDomain(project.rbs.nodes, node)); project.rbs.nodes.push(child); node.children.push(child.id); node.collapsed = false; }
    else if (event.target.closest(".rbs-delete")) { if (node.parentId == null || !confirm("Delete this cell and every cell beneath it?")) return; deleteRbsSubtree(project, node.id); }
    else return;
    updateInheritedDomains(project.rbs.nodes); await saveProject(project); drawRbs(project);
  };
  layer.ondblclick = event => { if (event.target.closest("button")) return; const box = event.target.closest(".rbs-box"); const node = box && project.rbs.nodes.find(n => n.id === box.dataset.id); if (node) openRbsEditor(project, node); };
  layer.ondragstart = event => { const box = event.target.closest(".rbs-box"); if (!box || box.draggable === false) return; event.dataTransfer.setData("text/rbs-id", box.dataset.id); event.dataTransfer.effectAllowed = "move"; box.classList.add("dragging"); };
  layer.ondragend = event => event.target.closest(".rbs-box")?.classList.remove("dragging");
  layer.ondragover = event => { const box = event.target.closest(".rbs-box"); if (box) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; box.classList.add("drop-target"); } };
  layer.ondragleave = event => event.target.closest(".rbs-box")?.classList.remove("drop-target");
  layer.ondrop = async event => {
    event.preventDefault(); const targetBox = event.target.closest(".rbs-box"); if (!targetBox) return;
    layer.querySelectorAll(".drop-target").forEach(el => el.classList.remove("drop-target"));
    const draggedId = event.dataTransfer.getData("text/rbs-id"), targetId = targetBox.dataset.id;
    if (!draggedId || draggedId === targetId || rbsDescendant(project.rbs.nodes, targetId, draggedId)) return;
    const byId = new Map(project.rbs.nodes.map(n => [n.id, n])), dragged = byId.get(draggedId), oldParent = byId.get(dragged?.parentId), target = byId.get(targetId);
    if (!dragged || dragged.parentId == null || !target) return;
    if (oldParent) oldParent.children = oldParent.children.filter(id => id !== dragged.id);
    dragged.parentId = target.id; if (!target.children.includes(dragged.id)) target.children.push(dragged.id); target.collapsed = false;
    updateInheritedDomains(project.rbs.nodes, dragged.id); await saveProject(project); drawRbs(project);
  };
}

function openRbsEditor(project, node) {
  const bg = document.getElementById("rbs-dialog-bg"), form = document.getElementById("rbs-dialog"), domain = document.getElementById("rbs-domain");
  domain.value = node.domain; domain.readOnly = !node.ownsDomain; domain.classList.toggle("rbs-readonly", !node.ownsDomain);
  document.getElementById("rbs-role").value = node.title; document.getElementById("rbs-name").value = node.name; document.getElementById("rbs-location").value = node.location; document.getElementById("rbs-rate").value = node.hourlyRate; bg.hidden = false;
  const close = () => { bg.hidden = true; form.onsubmit = null; }; document.getElementById("rbs-cancel").onclick = close; bg.onclick = e => { if (e.target === bg) close(); };
  form.onsubmit = async event => { event.preventDefault(); if (node.ownsDomain) node.domain = domain.value.trim() || "New Domain"; node.title = document.getElementById("rbs-role").value.trim() || "New Role"; node.name = document.getElementById("rbs-name").value.trim(); node.location = document.getElementById("rbs-location").value.trim(); node.hourlyRate = Math.max(0, +document.getElementById("rbs-rate").value || 0); updateInheritedDomains(project.rbs.nodes); await saveProject(project); close(); drawRbs(project); };
}

function deleteRbsSubtree(project, id) { const byId = new Map(project.rbs.nodes.map(n => [n.id, n])), node = byId.get(id), remove = new Set(); function collect(x) { if (remove.has(x)) return; remove.add(x); (byId.get(x)?.children || []).forEach(collect); } collect(id); const parent = byId.get(node.parentId); if (parent) parent.children = parent.children.filter(x => x !== id); project.rbs.nodes = project.rbs.nodes.filter(n => !remove.has(n.id)); }
function rbsDescendant(nodes, candidateId, ancestorId) { const byId = new Map(nodes.map(n => [n.id, n])); for (let n = byId.get(candidateId), seen = new Set(); n && !seen.has(n.id); n = byId.get(n.parentId)) { if (n.parentId === ancestorId) return true; seen.add(n.id); } return false; }
function rbsEsc(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }

function installRbsCss() {
  if (document.getElementById("rbs-css")) return;
  const style = document.createElement("style"); style.id = "rbs-css";
  style.textContent = `#rbs-stage{height:calc(100vh - 190px);min-height:560px;overflow:auto;border:1px solid #cad3df;border-radius:8px;background:#f8fafc}#rbs-canvas{position:relative;min-width:100%;min-height:100%}#rbs-lines,#rbs-layer{position:absolute;inset:0}#rbs-lines{pointer-events:none}.rbs-line{fill:none;stroke:#64748b;stroke-width:3;stroke-linecap:square;stroke-linejoin:miter}.rbs-box{position:absolute;width:${RBS.width}px;display:flex;flex-direction:column;background:#fff;border:2px solid #78a7ff;border-radius:9px;box-shadow:0 3px 10px #0002;overflow:hidden}.rbs-box.dragging{opacity:.5}.rbs-box.drop-target{outline:4px solid #22c55e;outline-offset:3px}.rbs-box header{height:40px;flex:0 0 40px;display:flex;align-items:center;gap:8px;padding:4px 8px;background:#eaf2ff;border-bottom:1px solid #cbd7e8;cursor:grab}.rbs-header-actions{flex:1;display:flex;justify-content:center;align-items:center;gap:8px}.rbs-header-actions .btn{min-width:48px;padding:4px 12px;font-size:13px;line-height:20px}.rbs-icon{width:30px;height:30px;padding:0;display:grid;place-items:center;background:#fff;border:1px solid #9aabc0;border-radius:5px;font-size:16px;line-height:1}.rbs-delete{color:#b42318;border-color:#f99;font-size:15px}.rbs-icon:disabled{opacity:.3}.rbs-row{height:55px;flex:0 0 55px;padding:7px 12px;display:grid;grid-template-columns:72px 1fr;align-items:center;border-bottom:1px solid #d7dee8}.role-only .rbs-row{height:61px;flex-basis:61px}.rbs-row small{color:#56708e}.rbs-row b{overflow:hidden;text-overflow:ellipsis}.rbs-row em{grid-column:2;font-size:11px;color:#64748b;font-style:normal}#rbs-dialog-bg{position:fixed;inset:0;z-index:9999;background:#0f172a88;display:flex;align-items:center;justify-content:center}#rbs-dialog-bg[hidden]{display:none}#rbs-dialog{width:min(460px,92vw);padding:22px;border-radius:10px;background:#fff;box-shadow:0 25px 70px #0005}#rbs-dialog label{display:grid;gap:5px;margin:11px 0;font-weight:600}#rbs-dialog input{width:100%;padding:9px}.rbs-readonly{background:#eef2f7;color:#64748b;cursor:not-allowed}.rbs-dialog-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}`;
  document.head.appendChild(style);
}
