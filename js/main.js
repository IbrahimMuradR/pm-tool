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

async function createNewProject(programId, name, manager) {
    const template = await loadTemplate("empty-project");

    const newProject = {
        ...template,
        id: generateId("P"),
        programId,
        name,
        manager,
        gates: [],
        milestones: [],
        sprints: [],
        rbs: [],
        wbs: [],
        cost: [],
        raid: [],
        changes: []
    };

    await saveProject(newProject);

    // Also update the program to include this project
    const program = await loadProgram(programId);
    program.projects.push(newProject.id);
    await saveProgram(program);

    return newProject;
}
async function createStrategicObjective(name, description, owner) {
    const template = await loadTemplate("empty-strategic");

    const newSO = {
        ...template,
        id: generateId("SO"),
        name,
        description,
        owner,
        programs: []
    };

    await saveStrategicObjective(newSO);
    return newSO;
}


