router.register("program-dashboard", async function(programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    document.getElementById("main-view").innerHTML = `
        <h2>Program Dashboard: ${program.name}</h2>
        <p><strong>Manager:</strong> ${program.manager}</p>
        <p><strong>Strategic Objective:</strong> ${program.strategicObjective || "None"}</p>
        <p><strong>Projects Linked:</strong> ${program.projects.length}</p>
        <hr>
        <p>This is a placeholder program dashboard. You will expand this in Step 8.</p>
    `;
});

