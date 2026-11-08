// ===============================
// PROGRAM RAID ENGINE
// ===============================
// Rolls up RAID across all projects in the program
// ===============================

async function computeProgramRaid(program) {

    const projectIds = program.projects || [];
    const aggregated = {
        risks: [],
        issues: [],
        assumptions: [],
        dependencies: []
    };

    for (const pid of projectIds) {
        const project = await loadProject(pid);
        if (!project) continue;

        const raid = await computeProjectRaid(project);

        // Tag each item with project name
        raid.risks.forEach(r => aggregated.risks.push({ ...r, project: project.name }));
        raid.issues.forEach(i => aggregated.issues.push({ ...i, project: project.name }));
        raid.assumptions.forEach(a => aggregated.assumptions.push({ ...a, project: project.name }));
        raid.dependencies.forEach(d => aggregated.dependencies.push({ ...d, project: project.name }));
    }

    return aggregated;
}
