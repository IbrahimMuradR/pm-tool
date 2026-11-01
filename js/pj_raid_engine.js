// ===============================
// PROJECT RAID ENGINE
// ===============================
// Computes:
// - Risk severity (Green/Amber/Red)
// - Issue severity (Green/Amber/Red)
// - Assumption validity
// - Dependency health
// ===============================

async function computeProjectRaid(project) {

    const risks = project.risks || [];
    const issues = project.issues || [];
    const assumptions = project.assumptions || [];
    const dependencies = project.dependencies || [];

    // -------------------------------
    // RISK SEVERITY
    // -------------------------------
    const riskSummaries = risks.map(r => {
        const impact = Number(r.impact || 0);
        const likelihood = Number(r.likelihood || 0);

        const score = impact * likelihood;

        let severity = "Green";
        if (score >= 12) severity = "Red";
        else if (score >= 6) severity = "Amber";

        return {
            id: r.id,
            title: r.title || "",
            impact,
            likelihood,
            score,
            severity,
            owner: r.owner || "",
            mitigation: r.mitigation || "",
            notes: r.notes || ""
        };
    });

    // -------------------------------
    // ISSUE SEVERITY
    // -------------------------------
    const issueSummaries = issues.map(i => {
        const priority = i.priority || "Low";

        let severity = "Green";
        if (priority === "High") severity = "Red";
        else if (priority === "Medium") severity = "Amber";

        return {
            id: i.id,
            description: i.description || "",
            domain: i.domain || "",
            priority,
            severity,
            owner: i.owner || "",
            status: i.status || "",
            notes: i.notes || ""
        };
    });

    // -------------------------------
    // ASSUMPTION VALIDITY
    // -------------------------------
    const assumptionSummaries = assumptions.map(a => {
        const valid = a.valid === true;
        const status = valid ? "Valid" : "Invalid";

        return {
            id: a.id,
            assumption: a.assumption || "",
            status,
            owner: a.owner || "",
            notes: a.notes || ""
        };
    });

    // -------------------------------
    // DEPENDENCY HEALTH
    // -------------------------------
    const dependencySummaries = dependencies.map(d => {
        const blocked = d.blocked === true;
        const health = blocked ? "Red" : "Green";

        return {
            id: d.id,
            dependency: d.dependency || "",
            blocked,
            health,
            owner: d.owner || "",
            notes: d.notes || ""
        };
    });

    return {
        risks: riskSummaries,
        issues: issueSummaries,
        assumptions: assumptionSummaries,
        dependencies: dependencySummaries
    };
}
