router.register("program-milestones", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    // Use the milestone engine
    const milestoneSummaries = await computeProgramMilestoneHealth(program);

    const rows = milestoneSummaries.map(m => `
        <tr>
            <td>${m.name}</td>
            <td>${m.healthStatus}</td>
            <td>${m.status}</td>
            <td>${m.notes}</td>
            <td>${m.owner}</td>
            <td>${m.dueDate}</td>
        </tr>
    `).join("");

    const bodyRows = milestoneSummaries.length
        ? rows
        : `<tr><td colspan="6">No program milestones defined yet.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Program Milestones: ${program.name}</h2>
        <table>
            <tr>
                <th>Program Gate/Milestone</th>
                <th>Health Status</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Owner</th>
                <th>Due Date</th>
            </tr>
            ${bodyRows}
        </table>
        <p class="mt-10">
            Milestone health is automatically calculated from project gates,
            cost variance, schedule variance, issues, and deliverable status.
        </p>
    `;
});
