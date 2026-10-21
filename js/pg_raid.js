// ===============================
// PROGRAM RAID PAGE — UI + ENGINE HOOK
// ===============================

router.register("program-raid", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const raid = await computeProgramRaid(program);

    // -------------------------------
    // RISKS
    // -------------------------------
    const riskRows = raid.risks.map(r => `
        <tr>
            <td>${r.project}</td>
            <td>${r.title}</td>
            <td>${r.impact}</td>
            <td>${r.likelihood}</td>
            <td>${r.score}</td>
            <td>${r.severity}</td>
            <td>${r.owner}</td>
            <td>${r.mitigation}</td>
            <td>${r.notes}</td>
        </tr>
    `).join("");

    // -------------------------------
    // ISSUES
    // -------------------------------
    const issueRows = raid.issues.map(i => `
        <tr>
            <td>${i.project}</td>
            <td>${i.description}</td>
            <td>${i.domain}</td>
            <td>${i.priority}</td>
            <td>${i.severity}</td>
            <td>${i.owner}</td>
            <td>${i.status}</td>
            <td>${i.notes}</td>
        </tr>
    `).join("");

    // -------------------------------
    // ASSUMPTIONS
    // -------------------------------
    const assumptionRows = raid.assumptions.map(a => `
        <tr>
            <td>${a.project}</td>
            <td>${a.assumption}</td>
            <td>${a.status}</td>
            <td>${a.owner}</td>
            <td>${a.notes}</td>
        </tr>
    `).join("");

    // -------------------------------
    // DEPENDENCIES
    // -------------------------------
    const dependencyRows = raid.dependencies.map(d => `
        <tr>
            <td>${d.project}</td>
            <td>${d.dependency}</td>
            <td>${d.health}</td>
            <td>${d.owner}</td>
            <td>${d.notes}</td>
        </tr>
    `).join("");

    document.getElementById("main-view").innerHTML = `
        <h2>Program RAID: ${program.name}</h2>

        <h3>Risks</h3>
        <table>
            <tr>
                <th>Project</th>
                <th>Risk</th>
                <th>Impact</th>
                <th>Likelihood</th>
                <th>Score</th>
                <th>Severity</th>
                <th>Owner</th>
                <th>Mitigation</th>
                <th>Notes</th>
            </tr>
            ${riskRows || "<tr><td colspan='9'>No risks found.</td></tr>"}
        </table>

        <h3 class="mt-20">Issues</h3>
        <table>
            <tr>
                <th>Project</th>
                <th>Description</th>
                <th>Domain</th>
                <th>Priority</th>
                <th>Severity</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Notes</th>
            </tr>
            ${issueRows || "<tr><td colspan='8'>No issues found.</td></tr>"}
        </table>

        <h3 class="mt-20">Assumptions</h3>
        <table>
            <tr>
                <th>Project</th>
                <th>Assumption</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Notes</th>
            </tr>
            ${assumptionRows || "<tr><td colspan='5'>No assumptions found.</td></tr>"}
        </table>

        <h3 class="mt-20">Dependencies</h3>
        <table>
            <tr>
                <th>Project</th>
                <th>Dependency</th>
                <th>Health</th>
                <th>Owner</th>
                <th>Notes</th>
            </tr>
            ${dependencyRows || "<tr><td colspan='5'>No dependencies found.</td></tr>"}
        </table>
    `;
});
