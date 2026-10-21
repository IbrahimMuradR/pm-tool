// ===============================
// ROUTER — Single Page Navigation
// ===============================

const MAIN_VIEW_ID = "main-view";
const pages = {};

// Register a page
function registerPage(name, renderFunction) {
    console.log("Registering page:", name);
    pages[name] = renderFunction;
}

// Navigate to a page
function routerNavigate(pageName, id = null) {
    console.log("Navigating to:", pageName, "with id:", id);

    if (!pages[pageName]) {
        console.error("Page not registered:", pageName);
        document.getElementById(MAIN_VIEW_ID).innerHTML =
            `<div class="error">Page "${pageName}" not found.</div>`;
        return;
    }

    pages[pageName](id);
}

const router = {
    navigate: routerNavigate,
    register: registerPage
};

window.router = router;
