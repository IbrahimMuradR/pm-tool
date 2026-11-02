// ===============================
// PROJECT LESSONS PAGE — UI + ENGINE HOOK
// ===============================

router.register("project-lessons", async function (projectId) {
    const project = await loadProject(projectId);

    if (!project) {
        document.getElementById("main-view").innerHTML =
            "<h2>No project selected.</h2>";
        return;
    }

    const lessons = await computeProjectLessons(project);

    const rows = lessons.map(l => `
        <tr>
            <td>${l.lesson}</td>
            <td>${l.category}</td>
            <td>${l.impact}</td>
            <td>${l.actions}</td>
            <td>${l.incorporatedIntoProjects.join(", ")}</td>
            <td>${l.programBenefit}</td>
            <td>${l.notes}</td>
        </tr>
    `).join("");

    const bodyRows = lessons.length
        ? rows
        : `<tr><td colspan="7">No lessons learned recorded yet.</td></tr>`;

    document.getElementById("main-view").innerHTML = `
        <h2>Project Lessons Learned: ${project.name}</h2>

        <table>
            <tr>
                <th>Lesson</th>
                <th>Category</th>
                <th>Impact</th>
                <th>Actions</th>
                <th>Incorporated Into Projects</th>
                <th>Program Benefit</th>
                <th>Notes</th>
            </tr>
            ${bodyRows}
        </table>

        <p class="mt-10">
            Lessons learned can be propagated to other projects and tracked for program-level benefits.
        </p>
    `;
});
