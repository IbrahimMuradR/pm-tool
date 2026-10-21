// ===============================
// QUALITY MANAGEMENT ENGINE
// ===============================
// Computes simple quality KPIs from existing data:
// - Defect density (issues per WP)
// - Test coverage (WPs tagged as test vs total)
// - Rework rate (change requests vs WPs)
// - Quality RAG (Green/Amber/Red)
// ===============================

async function computeQualityMetrics(entity) {
    const wbs = entity.wbs || [];
    const issues = entity.issues || [];
    const changeRequests = entity.changeRequests || [];

    const totalWps = wbs.length;
    const totalIssues = issues.length;
    const totalCr = changeRequests.length;

    // Defect density: issues per WP
    const defectDensity = totalWps ? totalIssues / totalWps : 0;

    // Test coverage: WPs whose workProduct contains "Test" or "Validation"
    const testWps = wbs.filter(wp =>
        (wp.workProduct || "").toLowerCase().includes("test") ||
        (wp.workProduct || "").toLowerCase().includes("validation")
    ).length;
    const testCoverage = totalWps ? (testWps / totalWps) * 100 : 0;

    // Rework rate: CRs per WP
    const reworkRate = totalWps ? totalCr / totalWps : 0;

    // Quality RAG
    let qualityRag = "Green";

    const highDefect = defectDensity > 0.5;
    const mediumDefect = defectDensity > 0.2;

    const lowCoverage = testCoverage < 50;
    const mediumCoverage = testCoverage < 70;

    const highRework = reworkRate > 0.3;
    const mediumRework = reworkRate > 0.15;

    if (highDefect || lowCoverage || highRework) {
        qualityRag = "Red";
    } else if (mediumDefect || mediumCoverage || mediumRework) {
        qualityRag = "Amber";
    }

    return {
        totalWps,
        totalIssues,
        totalCr,
        defectDensity,
        testCoverage,
        reworkRate,
        qualityRag
    };
}
