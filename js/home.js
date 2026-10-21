// ===============================
// HOME PAGE — Startup Screen
// ===============================

router.register("home", function () {
    document.getElementById("main-view").innerHTML = `
        <h2>Welcome to the PM Tool</h2>

        <div class="home-menu">
            <button class="btn" onclick="router.navigate('create-project')">Create New Project</button>
            <button class="btn" onclick="router.navigate('load-project')">Load Existing Project</button>

            <button class="btn mt-20" onclick="router.navigate('create-program')">Create New Program</button>
            <button class="btn" onclick="router.navigate('load-program')">Load Existing Program</button>

            <button class="btn mt-20" onclick="router.navigate('create-strategic')">Create Strategic Objective</button>
            <button class="btn" onclick="router.navigate('load-strategic')">Load Strategic Objective</button>
        </div>
    `;
});
