router.register("project-dashboard", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    // -------------------------------
    // BASIC PROJECT INFO
    // -------------------------------
    const gate = project.currentGate || "Not set";
    const sprint = project.currentSprint || "Not set";

    // -------------------------------
    // DELIVERABLES (Gate + Sprint)
    // -------------------------------
    const deliverables = project.deliverables || [];
    const orderedDeliverables = [...deliverables].sort((a, b) => {
        const order = ["released", "in review", "draft", "uninitiated", "tailored out"];
        return order.indexOf(a.status) - order.indexOf(b.status);
    });

    const deliverableRows = orderedDeliverables.map(d => `
        <tr>
            <td>${d.name}</td>
            <td>${d.status}</td>
            <td>${d.milestone || ""}</td>
        </tr>
    `).join("");

    // -------------------------------
    // ISSUES (Severity)
    // -------------------------------
    const issues = project.issues || [];
    const totalIssues = issues.length;
    const highIssues = issues.filter(i => i.priority === "High").length;
    const mediumIssues = issues.filter(i => i.priority === "Medium").length;
    const lowIssues = issues.filter(i => i.priority === "Low").length;

    const issueRows = issues.map(i => `
        <tr>
            <td>${i.id}</td>
            <td>${i.description}</td>
            <td>${i.domain}</td>
            <td>
                <span class="badge badge-${i.priority.toLowerCase()}">${i.priority}</span>
            </td>
            <td>${i.status}</td>
        </tr>
    `).join("");

    // -------------------------------
    // COST & SCHEDULE VARIANCE
    // -------------------------------
    const plannedCost = project.plannedCost || 0;
    const actualCost = project.actualCost || 0;
    const costVariance = plannedCost ? ((actualCost - plannedCost) / plannedCost) * 100 : 0;

    const plannedSchedule = project.plannedSchedule || 0;
    const actualSchedule = project.actualSchedule || 0;
    const scheduleVariance = plannedSchedule ? ((actualSchedule - plannedSchedule) / plannedSchedule) * 100 : 0;

    // -------------------------------
    // RAG STATUS ENGINE
    // -------------------------------
    let rag = "Green";

    const costRed = costVariance > 10;
    const costAmber = costVariance > 5 && costVariance <= 10;

    const scheduleRed = scheduleVariance > 10;
    const scheduleAmber = scheduleVariance > 5 && scheduleVariance <= 10;

    const criticalIssues = highIssues > 0;

    if (costRed || scheduleRed || criticalIssues) rag = "Red";
    else if (costAmber || scheduleAmber) rag = "Amber";

    const ragClass =
        rag === "Green" ? "status-green" :
        rag === "Amber" ? "status-amber" :
        "status-red";

    // -------------------------------
    // KANBAN (Gate + Sprint)
    // -------------------------------
    const gateKanban = project.gateKanban || {
        backlog: [],
        inProgress: [],
        validation: [],
        completed: []
    };

    const sprintKanban = project.sprintKanban || {
        backlog: [],
        inProgress: [],
        validation: [],
        completed: []
    };

    function renderKanbanColumn(title, items) {
        return `
            <div class="kanban-column">
                <h4>${title}</h4>
                ${items.map(i => `<div class="kanban-item">${i}</div>`).join("")}
            </div>
        `;
    }

    const gateKanbanHTML = `
        <h3>Gate Work Products</h3>
        <div class="kanban-board">
            ${renderKanbanColumn("Backlog", gateKanban.backlog)}
            ${renderKanbanColumn("In Progress", gateKanban.inProgress)}
            ${renderKanbanColumn("Validation", gateKanban.validation)}
            ${renderKanbanColumn("Completed", gateKanban.completed)}
        </div>
    `;

    const sprintKanbanHTML = `
        <h3>Sprint Work Products</h3>
        <div class="kanban-board">
            ${renderKanbanColumn("Backlog", sprintKanban.backlog)}
            ${renderKanbanColumn("In Progress", sprintKanban.inProgress)}
            ${renderKanbanColumn("Validation", sprintKanban.validation)}
            ${renderKanbanColumn("Completed", sprintKanban.completed)}
        </div>
    `;

    // -------------------------------
    // CHANGE REQUESTS COUNT
    // -------------------------------
    const openCRs = (project.changeRequests || []).length;

    // -------------------------------
    // FINAL RENDER
    // -------------------------------
    document.getElementById("main-view").innerHTML = `
        <h2>Project Dashboard: ${project.name}</h2>

        <div class="dashboard-grid">
            <div class="widget">
                <h3>Project Info</h3>
                <p><strong>Manager:</strong> ${project.manager || "Not set"}</p>
                <p><strong>Active Gate:</strong> ${gate}</p>
                <p><strong>Active Sprint:</strong> ${sprint}</p>
            </div>

            <div class="widget">
                <h3>Issues</h3>
                <p><strong>Total:</strong> ${totalIssues}</p>
                <p><strong>High:</strong> ${highIssues}</p>
                <p><strong>Medium:</strong> ${mediumIssues}</p>
                <p><strong>Low:</strong> ${lowIssues}</p>
            </div>

            <div class="widget">
                <h3>Cost</h3>
                <p><strong>Planned:</strong> £${plannedCost}</p>
                <p><strong>Actual:</strong> £${actualCost}</p>
                <p><strong>Variance:</strong> ${costVariance.toFixed(1)}%</p>
            </div>

            <div class="widget">
                <h3>Schedule</h3>
                <p><strong>Planned:</strong> ${plannedSchedule} days</p>
                <p><strong>Actual:</strong> ${actualSchedule} days</p>
                <p><strong>Variance:</strong> ${scheduleVariance.toFixed(1)}%</p>
            </div>

            <div class="widget">
                <h3>Overall Status</h3>
                <span class="status-circle ${ragClass}"></span>
                <span style="margin-left: 10px; font-size: 16px;">${rag}</span>
            </div>

            <div class="widget">
                <h3>Open Change Requests</h3>
                <p>${openCRs}</p>
            </div>
        </div>

        <h3 class="mt-20">Deliverables</h3>
        <table>
            <tr>
                <th>Deliverable</th>
                <th>Status</th>
                <th>Milestone</th>
            </tr>
            ${deliverableRows || "<tr><td colspan='3'>No deliverables yet.</td></tr>"}
        </table>

        ${gateKanbanHTML}
        ${sprintKanbanHTML}

        <h3 class="mt-20">Issues</h3>
        <table>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Domain</th>
                <th>Priority</th>
                <th>Status</th>
            </tr>
            ${issueRows || "<tr><td colspan='5'>No issues yet.</td></tr>"}
        </table>
    `;
});
