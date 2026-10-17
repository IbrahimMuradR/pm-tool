async function createNewProgram(name, manager, strategicObjectiveId) {
    const template = await loadTemplate("empty-program");

    const newProgram = {
        ...template,
        id: generateId("PR"),
        name,
        manager,
        strategicObjective: strategicObjectiveId,
        programObjectives: [],
        projects: [],
        gates: [],
        milestones: [],
        raid: [],
        changes: [],
        benefits: []
    };

    await saveProgram(newProgram);
    return newProgram;
}

