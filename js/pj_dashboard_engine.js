// ===============================
// PROJECT DASHBOARD ENGINE
// ===============================
// Computes:
// - Cost Health
// - Schedule Health
// - Issue Health
// - Deliverable Health
// - Gate/Sprint KPIs
// - Project RAG (Green/Amber/Red)
// ===============================

async function computeProjectDashboard(project) {

    // -------------------------------
    // COST HEALTH
    // -------------------------------
    const plannedCost = project.plannedCost || 0;
    const actualCost = project.actualCost || 0;

    const costVariance = plannedCost
        ? ((actualCost - plannedCost) / plannedCost) * 100
        : 0;

    let costHealth = "Green";
    if (costVariance > 10) costHealth = "Red";
    else if (costVariance > 5) costHealth = "Amber";

    // -------------------------------
    // SCHEDULE HEALTH
    // -------------------------------
    const plannedSchedule = project.plannedSchedule || 0;
    const actualSchedule = project.actualSchedule || 0;

    const scheduleVariance = plannedSchedule
        ? ((actualSchedule - plannedSchedule) / plannedSchedule) * 100
        : 0;

    let scheduleHealth = "Green";
    if (scheduleVariance > 10) scheduleHealth = "Red";
    else if (scheduleVariance > 5) scheduleHealth = "Amber";

    // -------------------------------
    // ISSUE HEALTH
    // -------------------------------
    const issues = project.issues || [];
    const highIssues = issues.filter(i => i.priority === "High");
    const mediumIssues = issues.filter(i => i.priority === "Medium");
    const lowIssues = issues.filter(i => i.priority === "Low");

    let issueHealth = "Green";
    if (highIssues.length > 0) issueHealth = "Red";
    else if (mediumIssues.length > 0) issueHealth = "Amber";

    // -------------------------------
    // DELIVERABLE HEALTH
    // -------------------------------
    const deliverables = project.deliverables || [];

    const released = deliverables.filter(d => d.status === "released").length;
    const inReview = deliverables.filter(d => d.status === "in review").length;
    const draft = deliverables.filter(d => d.status === "draft").length;
    const uninitiated = deliverables.filter(d => d.status === "uninitiated").length;
    const tailoredOut = deliverables.filter(d => d.status === "tailored out").length;

    let deliverableHealth = "Green";
    if (uninitiated > 0 || draft > 0) deliverableHealth = "Amber";
    if (deliverables.length > 0 && released === 0) deliverableHealth = "Red";

    // -------------------------------
    // GATE / SPRINT KPIs
    // -------------------------------
    const gate = project.currentGate || "Not set";
    const sprint = project.currentSprint || "Not set";

    const gateDeliverables = deliverables.filter(d => d.milestone === gate);
    const sprintDeliverables = deliverables.filter(d => d.milestone === sprint);

    const gateKpi = {
        total: gateDeliverables.length,
        released: gateDeliverables.filter(d => d.status === "released").length,
        pending: gateDeliverables.filter(d => d.status !== "released").length
    };

    const sprintKpi = {
        total: sprintDeliverables.length,
        released: sprintDeliverables.filter(d => d.status === "released").length,
        pending: sprintDeliverables.filter(d => d.status !== "released").length
    };

    // -------------------------------
    // PROJECT RAG (Wireframe Rules)
    // -------------------------------
    let rag = "Green";

    const costRed = costVariance > 10;
    const costAmber = costVariance > 5 && costVariance <= 10;

    const scheduleRed = scheduleVariance > 10;
    const scheduleAmber = scheduleVariance > 5 && scheduleVariance <= 10;

    const criticalIssues = highIssues.length > 0;

    if (costRed || scheduleRed || criticalIssues) rag = "Red";
    else if (costAmber || scheduleAmber) rag = "Amber";

    // -------------------------------
    // Return all computed metrics
    // -------------------------------
    return {
        costVariance,
        costHealth,
        scheduleVariance,
        scheduleHealth,
        issueHealth,
        deliverableHealth,
        gateKpi,
        sprintKpi,
        rag
    };
}
