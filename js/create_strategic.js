// Create Strategy with a required name and optional description.
router.register("create-strategic", function () {
    document.getElementById("main-view").innerHTML = `
        <button type="button" class="btn back-btn" onclick="goBack()">← Back</button>
        <h2>Create New Strategic Objective</h2>

        <div class="entity-form">
            <label class="form-label" for="new-strategic-name">Name</label>
            <input
                id="new-strategic-name"
                class="input"
                type="text"
                placeholder="Strategic Objective Name"
                autocomplete="off"
            >

            <label class="form-label" for="new-strategic-description">Description</label>
            <textarea
                id="new-strategic-description"
                class="input strategy-description-input"
                rows="6"
                placeholder="Please provide description of your strategic objective"
            ></textarea>

            <p id="create-strategy-error" class="form-error" hidden></p>

            <button
                id="create-strategy-button"
                type="button"
                class="btn btn-primary"
                onclick="createStrategic()"
            >Create</button>
        </div>
    `;

    document.getElementById("new-strategic-name").focus();
});

async function createStrategic() {
    const nameInput = document.getElementById("new-strategic-name");
    const descriptionInput = document.getElementById("new-strategic-description");
    const button = document.getElementById("create-strategy-button");
    const error = document.getElementById("create-strategy-error");
    const name = nameInput ? nameInput.value.trim() : "";
    const description = descriptionInput
        ? descriptionInput.value.trim()
        : "";

    if (!name) {
        if (error) {
            error.textContent = "Please enter a Strategy name.";
            error.hidden = false;
        }
        nameInput?.focus();
        return;
    }

    button.disabled = true;
    button.textContent = "Creating...";
    if (error) error.hidden = true;

    try {
        const now = Date.now();
        const strategy = {
            id: generateId("strategic"),
            name,
            description,
            owner: "",
            programs: [],
            lessons: [],
            createdAt: now,
            updatedAt: now
        };

        await saveStrategicObjective(strategy);

        activeStrategic = strategy.id;
        activeProgram = null;
        activeProject = null;
        await populateSidebar();
        await router.navigate("strategic-objectives", strategy.id);
    } catch (creationError) {
        console.error("Unable to create Strategy:", creationError);
        if (error) {
            error.textContent = creationError.message || "The Strategy could not be created.";
            error.hidden = false;
        }
        button.disabled = false;
        button.textContent = "Create";
    }
}
