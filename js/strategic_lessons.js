// ===============================
// STRATEGIC LESSONS PAGE — UI + ENGINE HOOK
// ===============================

router.register("strategic-lessons", async function (strategicId) {
    const strategic = await loadStrategic(strategicId);

    if (!strategic) {
        document.getElementById("main-view").innerHTML =
            "<h2>No strategic objective selected.</h2>";
        return;
    }

    const lessons = await computeStrategicLessons(strategic);

    const rows = lessons.map(l => `
        <tr>
            <td>${l.source}</td>
            <td>${l.program || l.strategic || ""}</td>
            <td>${l.lesson}</td>
            <td>${l.category}</td>
            <td>${l.impact}</td>
            <td>${l.actions}</td>
            <td>${l.incorporatedIntoPrograms.join(", ")}</td>
            <td>${l.strategicBenefit}</td>
            <td>${l.notes}</td>
        </tr>
    `).join("");

    const bodyRows = lessons.length
        ? rows
        : `<tr><td colspan="9">No lessons learned found across strategic objectives.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Strategic Lessons Learned: ${strategic.name}</h2>

        <table>
            <tr>
                <th>Source</th>
                <th>Program/Strategic</th>
                <th>Lesson</th>
                <th>Category</th>
                <th>Impact</th>
                <th>Actions</th>
                <th>Incorporated Into Programs</th>
                <th>Strategic Benefit</th>
                <th>Notes</th>
            </tr>
            ${bodyRows}
        </table>

        <p class="mt-10">
            Strategic lessons include both strategic-level and program-level lessons,
            with propagation tracking across programs.
        </p>
    `;
});
