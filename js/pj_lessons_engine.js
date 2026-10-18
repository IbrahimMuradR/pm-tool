// ===============================
// PROJECT LESSONS LEARNED ENGINE
// ===============================
// Lessons stored inside project.lessons
// Adds propagation fields:
// - incorporatedIntoProjects[]
// - programBenefit
// ===============================

async function computeProjectLessons(project) {

    const lessons = project.lessons || [];

    const summaries = lessons.map(l => ({
        id: l.id,
        lesson: l.lesson || "",
        category: l.category || "",
        impact: l.impact || "",
        actions: l.actions || "",
        incorporatedIntoProjects: l.incorporatedIntoProjects || [],
        programBenefit: l.programBenefit || "",
        notes: l.notes || ""
    }));

    return summaries;
}
