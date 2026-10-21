// Create Program, either independently or linked to the active Strategy.
router.register("create-program", async function () {
    const strategyId = window.pendingStrategicId || activeStrategic || null;
    const strategy = strategyId
        ? await loadStrategicObjective(strategyId)
        : null;

    document.getElementById("main-view").innerHTML = `
        <button type="button" class="btn back-btn" onclick="goBack()">← Back</button>
        <h2>Create New Program</h2>
        ${strategy
            ? `<p class="link-notice">Will be linked to Strategy: <strong>${escapeProgramHtml(strategy.name)}</strong></p>`
            : `<p class="link-notice">This program will be created independently.</p>`}

        <div class="entity-form">
            <label class="form-label" for="new-program-name">Name</label>
            <input
                id="new-program-name"
                class="input"
                type="text"
                placeholder="Program Name"
                autocomplete="off"
            >

            <p id="create-program-error" class="form-error" hidden></p>

            <button
                id="create-program-button"
                type="button"
                class="btn btn-primary"
                onclick="createProgram()"
            >Create</button>
        </div>
    `;

    const input = document.getElementById("new-program-name");
    input.focus();
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            createProgram();
        }
    });
});

async function createProgram() {
    const input = document.getElementById("new-program-name");
    const button = document.getElementById("create-program-button");
    const error = document.getElementById("create-program-error");
    const name = input ? input.value.trim() : "";

    if (!name) {
        if (error) {
            error.textContent = "Please enter a program name.";
            error.hidden = false;
        }
        input?.focus();
        return;
    }

    button.disabled = true;
    button.textContent = "Creating...";
    if (error) error.hidden = true;

    try {
        const strategyId = window.pendingStrategicId || activeStrategic || null;
        const now = Date.now();
        const program = {
            id: generateId("program"),
            name,
            manager: "",
            strategicId: strategyId,
            projects: [],
            milestones: [],
            changeRequests: [],
            issues: [],
            benefits: [],
            lessons: [],
            createdAt: now,
            updatedAt: now
        };

        await saveProgram(program);

        if (strategyId) {
            const strategy = await loadStrategicObjective(strategyId);
            if (!strategy) {
                throw new Error("The selected Strategy could not be loaded.");
            }

            strategy.programs = Array.isArray(strategy.programs)
                ? strategy.programs
                : [];

            if (!strategy.programs.includes(program.id)) {
                strategy.programs.push(program.id);
            }

            strategy.updatedAt = now;
            await saveStrategicObjective(strategy);

            activeStrategic = strategyId;
            activeProgram = null;
            activeProject = null;
            window.pendingStrategicId = null;
            await populateSidebar();
            await router.navigate("strategic-objectives", strategyId);
            return;
        }

        activeStrategic = null;
        activeProgram = program.id;
        activeProject = null;
        window.pendingStrategicId = null;
        await populateSidebar();
        await router.navigate("program-dashboard", program.id);
    } catch (creationError) {
        console.error("Unable to create Program:", creationError);
        if (error) {
            error.textContent = creationError.message || "The Program could not be created.";
            error.hidden = false;
        }
        button.disabled = false;
        button.textContent = "Create";
    }
}

function escapeProgramHtml(value) {
    return String(value == null ? "" : value).replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]
    );
}
