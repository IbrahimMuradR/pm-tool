router.register("create-program", function () {
    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
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
    if (!name) return alert("Please enter a program name.");

    const program = {
        id: generateId("pg"),
        name,
        manager: "",
        projects: [],
        milestones: [],
        changeRequests: [],
        issues: [],
        benefits: []
    };

    await saveProgram(program);

    activeProgram = program.id;
    populateSidebar();

    router.navigate("program-dashboard", program.id);
}
