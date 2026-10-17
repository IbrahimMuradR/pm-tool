// ===============================
// ROUTER — Single Page Navigation
// ===============================

// The main content area where pages will be rendered
const MAIN_VIEW_ID = "main-view";

// Registered pages
const pages = {};

// -------------------------------
// Register a page module
// -------------------------------
function registerPage(name, renderFunction) {
    pages[name] = renderFunction;
}

// -------------------------------
// Navigate to a page
// -------------------------------
function routerNavigate(pageName, id = null) {
    if (!pages[pageName]) {
        console.error("Page not registered:", pageName);
        document.getElementById(MAIN_VIEW_ID).innerHTML =
            `<div class="error">Page "${pageName}" not found.</div>`;
        return;
    }

    // Render the page
    pages[pageName](id);
}

// Make router globally accessible
const router = {
    navigate: routerNavigate,
    register: registerPage
};

window.router = router;

