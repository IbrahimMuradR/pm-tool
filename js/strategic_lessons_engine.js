// ===============================
// STRATEGIC LESSONS LEARNED ENGINE
// ===============================
// Aggregates:
// - Program lessons (with propagation fields)
// - Strategic lessons (with propagation fields)
// ===============================

async function computeStrategicLessons(strategic) {

    const strategicLessons = strategic.lessons || [];
    const programIds = strategic.programs || [];

    const aggregated = [];

    // Add strategic-level lessons
    strategicLessons.forEach(l => {
        aggregated.push({
            source: "Strategic",
            strategic: strategic.name,
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

    // Add program-level lessons
    for (const pgid of programIds) {
        const program = await loadProgram(pgid);
        if (!program) continue;

        const programLessons = program.lessons || [];

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
    }

    return aggregated;
}
