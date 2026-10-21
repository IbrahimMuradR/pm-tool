// ===============================
// PROGRAM CHANGE REQUEST PAGE — UI + ENGINE HOOK
// ===============================

router.register("program-change", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const crSummaries = await computeProgramChangeRequests(program);

    const rows = crSummaries.map(cr => `
        <tr>
            <td>${cr.project}</td>
            <td>${cr.description}</td>
            <td>${cr.domain}</td>
            <td>${cr.responsible}</td>
            <td>${cr.priority}</td>
            <td>${cr.impactCost}</td>
            <td>${cr.impactSchedule}</td>
            <td>${cr.impactScope}</td>
            <td>${cr.severity}</td>
            <td>${cr.status}</td>
            <td>${cr.statusHealth}</td>
            <td>${cr.notes}</td>
        </tr>
    `).join("");

    const bodyRows = crSummaries.length
        ? rows
        : `<tr><td colspan="12">No change requests found across program.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Program Change Requests: ${program.name}</h2>

        <table>
            <tr>
                <th>Project</th>
                <th>Description</th>
                <th>Domain</th>
                <th>Responsible</th>
                <th>Priority</th>
                <th>Impact Cost (£)</th>
                <th>Impact Schedule (days)</th>
                <th>Impact Scope</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Status Health</th>
                <th>Notes</th>
            </tr>
            ${bodyRows}
        </table>

        <p class="mt-10">
            Program-level severity is rolled up from project CRs.
        </p>
    `;
});
