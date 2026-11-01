// ===============================
// BENEFITS REALIZATION PAGE — UI + ENGINE HOOK
// ===============================
// Relies on:
// - storage.js (loadProject, loadProgram)
// - benefits_engine.js (computeBenefitsRealization)
// ===============================

router.register("benefits", async function (entityId) {

    // Entity can be a project or a program
    let entity = await loadProject(entityId);
    if (!entity) entity = await loadProgram(entityId);

    if (!entity) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project or program selected.</h2>";
        return;
    }

    const benefitSummaries = await computeBenefitsRealization(entity);

    const rows = benefitSummaries.map(b => `
        <tr>
            <td>${b.benefit}</td>
            <td>${b.type}</td>
            <td>${b.description}</td>
            <td>${b.kpi}</td>
            <td>${b.baseline}</td>
            <td>${b.target}</td>
            <td>${b.actual}</td>
            <td>${b.variance}</td>
            <td>${b.owner}</td>
            <td>${b.evidenceStatus}</td>
            <td>${b.health}</td>
            <td>${b.status}</td>
            <td>${b.notes}</td>
        </tr>
    `).join("");

    const bodyRows = benefitSummaries.length
        ? rows
        : `<tr><td colspan="13">No benefits defined yet.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Benefits Realization: ${entity.name}</h2>

        <table>
            <tr>
                <th>Benefit</th>
                <th>Type</th>
                <th>Description</th>
                <th>KPI</th>
                <th>Baseline</th>
                <th>Target</th>
                <th>Actual</th>
                <th>Variance</th>
                <th>Owner</th>
                <th>Evidence</th>
                <th>Health</th>
                <th>Status</th>
                <th>Notes</th>
            </tr>
            ${bodyRows}
        </table>

        <p class="mt-10">
            Benefits are automatically evaluated using baseline, target, actual values,
            KPI health, and evidence completeness.
        </p>
    `;
});
