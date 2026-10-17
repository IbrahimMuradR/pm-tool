router.register("program-gantt", async function (programId) {
    const program = await loadProgram(programId);

    if (!program) {
        document.getElementById("main-view").innerHTML =
            "<h2>No program selected.</h2>";
        return;
    }

    // Placeholder: later, aggregate project Gantt data + input‑to dependencies
    document.getElementById("main-view").innerHTML = `
        <h2>Program Gantt Chart: ${program.name}</h2>
        <p>This chart will be generated from project Gantt charts, using start/end dates and dependencies.</p>
        <p>Program Gates will be highlighted, and the critical path will be shown in red.</p>
    `;
});

