router.register("create-strategic", function () {
    document.getElementById("main-view").innerHTML = `
        <button class="btn back-btn" onclick="goBack()">← Back</button>
        <h2>Create Strategic Objective</h2>

        <p><strong>Name:</strong></p>
        <input id="new-strategic-name" class="input" placeholder="Strategic Objective Name">

        <p class="mt-20">
            <button class="btn" onclick="createStrategic()">Create</button>
        </p>
    `;
});

async function createStrategic() {
    const name = document.getElementById("new-strategic-name").value.trim();
    if (!name) return alert("Please enter a name.");

    const strategic = {
        id: generateId("so"),
        name,
        owner: "",
        programs: [],
        lessons: []
    };

    await saveStrategicObjective(strategic);

    activeStrategic = strategic.id;
    populateSidebar();

    router.navigate("strategic-objectives", strategic.id);
}
