// ===============================
// WBS ENGINE — Work Breakdown Structure
// ===============================

router.register("wbs", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    // Ensure WBS structure exists
    project.wbs = project.wbs || [];

    // If empty, create a simple default table
    if (!project.wbs.length) {
        project.wbs = createDefaultWbs();
        await saveProject(project);
    }

    renderWbsPage(project);
});

// -------------------------------
// Default WBS
// -------------------------------
function createDefaultWbs() {
    return [
        {
            id: generateId("wbs"),
            parentId: null,
            workProduct: "Item/System Definition",
            responsible: [],
            startDate: "",
            plannedDate: "",
            actualDate: "",
            milestone: "",
            storageLocation: "",
            status: "uninitiated",
            inputTo: null
        }
    ];
}

// -------------------------------
// Render WBS Page
// -------------------------------
async function renderWbsPage(project) {
    const wbs = project.wbs || [];
    const container = document.getElementById("main-view");

    const rowsHtml = wbs.map(row => renderWbsRow(row, wbs)).join("");

    container.innerHTML = `
        <h2>Work Breakdown Structure (WBS): ${project.name}</h2>

        <div class="table-actions">
            <button class="btn" id="wbs-add-row-btn">Add Row (+)</button>
        </div>

        <table>
            <tr>
                <th>Work Product</th>
                <th>Responsible</th>
                <th>Start Date</th>
                <th>Planned Date</th>
                <th>Actual Due Date</th>
                <th>Applicable Milestone</th>
                <th>Storage Location</th>
                <th>Status</th>
                <th>Input to</th>
                <th>Actions</th>
            </tr>
            ${rowsHtml}
        </table>

        <p class="mt-10">
            Right‑click on a row to add/delete/nest items (basic implementation via buttons for now).
        </p>
    `;

    wireWbsEvents(project);
}

// -------------------------------
// Render Single Row
// -------------------------------
function renderWbsRow(row, allRows) {
    const isNested = row.parentId !== null;
    const nestedClass = isNested ? "wbs-nested" : "";

    const responsibleText = (row.responsible || []).join(", ");

    const inputOptions = allRows
        .filter(r => r.id !== row.id)
        .map(r => `<option value="${r.id}" ${row.inputTo === r.id ? "selected" : ""}>${r.workProduct}</option>`)
        .join("");

    return `
        <tr class="wbs-row ${nestedClass}" data-row-id="${row.id}">
            <td>${row.workProduct}</td>
            <td>${responsibleText}</td>
            <td>${row.startDate || ""}</td>
            <td>${row.plannedDate || ""}</td>
            <td>${row.actualDate || ""}</td>
            <td>${row.milestone || ""}</td>
            <td>${row.storageLocation || ""}</td>
            <td>${row.status || ""}</td>
            <td>
                <select class="wbs-inputto-select">
                    <option value="">(none)</option>
                    ${inputOptions}
                </select>
            </td>
            <td>
                <button class="btn wbs-edit-btn">Edit</button>
                <button class="btn wbs-add-sub-btn">+ Sub</button>
                <button class="btn btn-danger wbs-delete-btn">Delete</button>
            </td>
        </tr>
    `;
}

// -------------------------------
// Wire Events
// -------------------------------
function wireWbsEvents(project) {
    const table = document.querySelector("#main-view table");
    const wbs = project.wbs || [];

    // Add row at bottom
    document.getElementById("wbs-add-row-btn").onclick = async () => {
        const newRow = {
            id: generateId("wbs"),
            parentId: null,
            workProduct: "New Work Product",
            responsible: [],
            startDate: "",
            plannedDate: "",
            actualDate: "",
            milestone: "",
            storageLocation: "",
            status: "uninitiated",
            inputTo: null
        };
        wbs.push(newRow);
        project.wbs = wbs;
        await saveProject(project);
        renderWbsPage(project);
    };

    // Edit row
    table.querySelectorAll(".wbs-edit-btn").forEach(btn => {
        btn.onclick = async () => {
            const rowId = btn.closest("tr").getAttribute("data-row-id");
            const row = wbs.find(r => r.id === rowId);
            if (!row) return;

            const wp = prompt("Work Product:", row.workProduct || "");
            if (wp === null) return;

            const resp = prompt("Responsible (comma‑separated roles):", (row.responsible || []).join(", "));
            if (resp === null) return;

            const start = prompt("Start Date (YYYY‑MM‑DD):", row.startDate || "");
            if (start === null) return;

            const planned = prompt("Planned Date (YYYY‑MM‑DD):", row.plannedDate || "");
            if (planned === null) return;

            const actual = prompt("Actual Due Date (YYYY‑MM‑DD):", row.actualDate || "");
            if (actual === null) return;

            const milestone = prompt("Applicable Milestone:", row.milestone || "");
            if (milestone === null) return;

            const storage = prompt("Storage Location:", row.storageLocation || "");
            if (storage === null) return;

            const status = prompt("Status (released, in review, draft, uninitiated, tailored out):", row.status || "");
            if (status === null) return;

            row.workProduct = wp;
            row.responsible = resp ? resp.split(",").map(s => s.trim()) : [];
            row.startDate = start;
            row.plannedDate = planned;
            row.actualDate = actual;
            row.milestone = milestone;
            row.storageLocation = storage;
            row.status = status;

            project.wbs = wbs;
            await saveProject(project);
            renderWbsPage(project);
        };
    });

    // Add sub‑package
    table.querySelectorAll(".wbs-add-sub-btn").forEach(btn => {
        btn.onclick = async () => {
            const parentId = btn.closest("tr").getAttribute("data-row-id");
            const parentRow = wbs.find(r => r.id === parentId);
            if (!parentRow) return;

            const newRow = {
                id: generateId("wbs"),
                parentId: parentRow.id,
                workProduct: parentRow.workProduct + " (Sub)",
                responsible: [...(parentRow.responsible || [])],
                startDate: parentRow.startDate,
                plannedDate: parentRow.plannedDate,
                actualDate: parentRow.actualDate,
                milestone: parentRow.milestone,
                storageLocation: parentRow.storageLocation,
                status: parentRow.status,
                inputTo: parentRow.inputTo
            };

            wbs.push(newRow);
            project.wbs = wbs;
            await saveProject(project);
            renderWbsPage(project);
        };
    });


   // Delete row
table.querySelectorAll(".wbs-delete-btn").forEach(btn => {
    btn.onclick = async () => {
        const rowId = btn.closest("tr").getAttribute("data-row-id");

        // Remove row + any nested children
        const removeRecursively = (id) => {
            const index = wbs.findIndex(r => r.id === id);
            if (index !== -1) {
                const children = wbs.filter(r => r.parentId === id);
                children.forEach(child => removeRecursively(child.id));
                wbs.splice(index, 1);
            }
        };

        removeRecursively(rowId);

        project.wbs = wbs;
        await saveProject(project);
        renderWbsPage(project);
    };
});

// Update "Input To" dropdowns
table.querySelectorAll(".wbs-inputto-select").forEach(select => {
    select.onchange = async () => {
        const rowId = select.closest("tr").getAttribute("data-row-id");
        const row = wbs.find(r => r.id === rowId);
        if (!row) return;

        row.inputTo = select.value || null;

        project.wbs = wbs;
        await saveProject(project);
        renderWbsPage(project);
    };
});
}
