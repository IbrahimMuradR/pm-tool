// ===============================
// PROGRAM LESSONS LEARNED ENGINE
// ===============================
// Aggregates:
// - Project lessons (with propagation fields)
// - Program lessons (with propagation fields)
// Adds:
// - incorporatedIntoPrograms[]
// - strategicBenefit
// ===============================

async function computeProgramLessons(program) {

    const programLessons = program.lessons || [];
    const projectIds = program.projects || [];

    const aggregated = [];

    // Add program-level lessons
    programLessons.forEach(l => {
        aggregated.push({
            source: "Program",
            program: program.name,
            id: l.id,
            lesson: l.lesson || "",
            category: l.category || "",
            impact: l.impact || "",
            actions: l.actions || "",
            incorporatedIntoPrograms: l.incorporatedIntoPrograms || [],
            strategicBenefit: l.strategicBenefit || "",
            notes: l.notes || ""
        });
    });

    // Add project-level lessons
    for (const pid of projectIds) {
        const project = await loadProject(pid);
        if (!project) continue;

        const projectLessons = project.lessons || [];

        projectLessons.forEach(l => {
            aggregated.push({
                source: "Project",
                project: project.name,
                id: l.id,
                lesson: l.lesson || "",
                category: l.category || "",
                impact: l.impact || "",
                actions: l.actions || "",
                incorporatedIntoProjects: l.incorporatedIntoProjects || [],
                programBenefit: l.programBenefit || "",
                notes: l.notes || ""
            });
        });
    }

    return aggregated;
}
