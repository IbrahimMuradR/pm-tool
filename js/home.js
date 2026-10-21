router.register("home", async function () {
    const [strategies, programs, projects] = await Promise.all([
        loadAllStrategicObjectives(), loadAllPrograms(), loadAllProjects()
    ]);
    const items = [
        ...strategies.map(item => ({...item, type:"Strategy"})),
        ...programs.map(item => ({...item, type:"Program"})),
        ...projects.map(item => ({...item, type:"Project"}))
    ].sort((a,b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));
    const tiles = items.map(item => `<button class="recent-tile" onclick="openRecentItem('${item.type}','${item.id}')"><span class="recent-type">${item.type}</span><strong>${escapeUi(item.name || "Untitled")}</strong></button>`).join("");
    document.getElementById("main-view").innerHTML = `<div class="home-header"><h1>Recents</h1><p>Items created on this device.</p></div><div class="recents-grid">${tiles || '<div class="empty-recents">No items created on this device yet. Use the sidebar to get started.</div>'}</div>`;
});
async function openRecentItem(type,id){
    if(type==="Strategy") return loadStrategicUI(id);
    if(type==="Program") return loadProgramUI(id);
    return loadProjectUI(id);
}
function escapeUi(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);}
