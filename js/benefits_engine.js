// ===============================
// BENEFITS REALIZATION ENGINE
// ===============================
// Computes:
// - Benefit achievement status
// - Variance (Target - Actual)
// - KPI health (Green/Amber/Red)
// - Evidence completeness
// ===============================

async function computeBenefitsRealization(projectOrProgram) {

    const benefits = projectOrProgram.benefits || [];

    const benefitSummaries = benefits.map(b => {

        const baseline = Number(b.baseline || 0);
        const target = Number(b.target || 0);
        const actual = Number(b.actual || 0);

        const variance = target - actual;

        // KPI Health
        let health = "Green";
        if (variance < 0) health = "Red";          // actual worse than target
        else if (variance < (target * 0.1)) health = "Amber"; // within 10%

        // Status
        let status = "Achieved";
        if (actual < target) status = "Partially Achieved";
        if (actual === 0) status = "Not Achieved";

        // Evidence completeness
        const evidenceProvided = b.evidence && b.evidence.trim().length > 0;
        const evidenceStatus = evidenceProvided ? "Provided" : "Missing";

        return {
            id: b.id,
            benefit: b.benefit || "",
            type: b.type || "",
            description: b.description || "",
            kpi: b.kpi || "",
            baseline,
            target,
            actual,
            variance,
            owner: b.owner || "",
            evidence: b.evidence || "",
            evidenceStatus,
            health,
            status,
            notes: b.notes || ""
        };
    });

    return benefitSummaries;
}
