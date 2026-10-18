// ===============================
// PROGRAM CHANGE REQUEST ENGINE
// ===============================
// Rolls up CRs across all projects
// Computes:
// - Program-level CR severity
// - Program-level CR status health
// ===============================

async function computeProgramChangeRequests(program) {

    const projectIds = program.projects || [];
    const aggregated = [];

    for (const pid of projectIds) {
        const project = await loadProject(pid);
        if (!project) continue;

        const crSummaries = await computeProjectChangeRequests(project);

        crSummaries.forEach(cr => {
            aggregated.push({
                ...cr,
                project: project.name
            });
        });
    }

    return aggregated;
}
