// ===============================
// PROGRAM LESSONS PAGE — UI + ENGINE HOOK
// ===============================

router.register("program-lessons", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    const lessons = await computeProgramLessons(program);

    const rows = lessons.map(l => `
        <tr>
            <td>${l.source}</td>
            <td>${l.project || l.program || ""}</td>
            <td>${l.lesson}</td>
            <td>${l.category}</td>
            <td>${l.impact}</td>
            <td>${l.actions}</td>
            <td>${l.incorporatedIntoProjects ? l.incorporatedIntoProjects.join(", ") : l.incorporatedIntoPrograms.join(", ")}</td>
            <td>${l.programBenefit || l.strategicBenefit || ""}</td>
            <td>${l.notes}</td>
        </tr>
    `).join("");

    const bodyRows = lessons.length
        ? rows
        : `<tr><td colspan="9">No lessons learned found across program.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Program Lessons Learned: ${program.name}</h2>

        <table>
            <tr>
                <th>Source</th>
                <th>Project/Program</th>
                <th>Lesson</th>
                <th>Category</th>
                <th>Impact</th>
                <th>Actions</th>
                <th>Incorporated Into</th>
                <th>Benefit</th>
                <th>Notes</th>
            </tr>
            ${bodyRows}
        </table>

        <p class="mt-10">
            Program lessons include both program-level and project-level lessons,
            with propagation tracking across projects.
        </p>
    `;
});
