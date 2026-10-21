// ===============================
// CREATE PROGRAM PAGE
// ===============================

router.register("create-program", function () {
    document.getElementById("main-view").innerHTML = `
        <h2>Create New Program</h2>

        <p><strong>Name:</strong></p>
        <input id="new-program-name" class="input" placeholder="Program Name">

        <p class="mt-20">
            <button class="btn" onclick="createProgram()">Create</button>
        </p>
    `;
});

async function createProgram() {
    const name = document.getElementById("new-program-name").value.trim();
    if (!name) {
        alert("Please enter a program name.");
        return;
    }

    const program = {
        id: generateId("program"),
        name,
        manager: "",
        projects: [],
        milestones: [],
        changeRequests: [],
        issues: [],
        benefits: []
    };

    await saveProgram(program);

    window.activeProgram = program.id;
    populateSidebar();

    router.navigate("program-dashboard", program.id);
}
