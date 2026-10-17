// ===============================
// IndexedDB Setup for PM Tool
// ===============================

const DB_NAME = "pm_tool_db";
const DB_VERSION = 1;
let db = null;

// -------------------------------
// Initialize Database
// -------------------------------
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;

            if (!db.objectStoreNames.contains("programs")) {
                db.createObjectStore("programs", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("projects")) {
                db.createObjectStore("projects", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("strategicObjectives")) {
                db.createObjectStore("strategicObjectives", { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains("templates")) {
                db.createObjectStore("templates", { keyPath: "name" });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };

        request.onerror = (event) => {
            reject("IndexedDB error: " + event.target.errorCode);
        };
    });
}

// -------------------------------
// Generic Save Function
// -------------------------------
function saveItem(storeName, item) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readwrite");
        const store = tx.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject("Save failed");
    });
}

// -------------------------------
// Generic Load Function
// -------------------------------
function loadItem(storeName, id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readonly");
        const store = tx.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Load failed");
    });
}

// -------------------------------
// Load All Items from Store
// -------------------------------
function loadAll(storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction([storeName], "readonly");
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Load all failed");
    });
}

// -------------------------------
// Program CRUD
// -------------------------------
function saveProgram(programObj) {
    return saveItem("programs", programObj);
}

function loadProgram(programId) {
    return loadItem("programs", programId);
}

function loadAllPrograms() {
    return loadAll("programs");
}

// -------------------------------
// Project CRUD
// -------------------------------
function saveProject(projectObj) {
    return saveItem("projects", projectObj);
}

function loadProject(projectId) {
    return loadItem("projects", projectId);
}

function loadAllProjects() {
    return loadAll("projects");
}

// -------------------------------
// Strategic Objective CRUD
// -------------------------------
function saveStrategicObjective(obj) {
    return saveItem("strategicObjectives", obj);
}

function loadStrategicObjective(id) {
    return loadItem("strategicObjectives", id);
}

function loadAllStrategicObjectives() {
    return loadAll("strategicObjectives");
}

// -------------------------------
// Template CRUD
// -------------------------------
function saveTemplate(templateObj) {
    return saveItem("templates", templateObj);
}

function loadTemplate(name) {
    return loadItem("templates", name);
}

function loadAllTemplates() {
    return loadAll("templates");
}

// -------------------------------
// Load JSON templates into IndexedDB
// -------------------------------
async function loadTemplatesIntoDB() {
    const templateFiles = [
        { name: "empty-program", file: "/templates/empty-program.json" },
        { name: "empty-project", file: "/templates/empty-project.json" },
        { name: "empty-strategic", file: "/templates/empty-strategic.json" }
    ];

    for (const t of templateFiles) {
        const response = await fetch(t.file);
        const json = await response.json();
        json.name = t.name;
        await saveTemplate(json);
    }

    console.log("Templates loaded into IndexedDB.");
}

// -------------------------------
// ID Generator
// -------------------------------
function generateId(prefix) {
    const random = Math.floor(Math.random() * 1000000);
    return `${prefix}-${Date.now()}-${random}`;
}
