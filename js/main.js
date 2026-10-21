let activeProgram=null,activeProject=null,activeStrategic=null;
window.lastPage=null;window.currentPageName="home";
function goBack(){if(!window.lastPage)return router.navigate("home");const {page,id}=window.lastPage;router.navigate(page,id);}
document.addEventListener("DOMContentLoaded",async()=>{await ensureDBReady();await populateSidebar();router.navigate("home");});
async function populateSidebar(){
 const host=document.getElementById("sidebar-content")||document.getElementById("sidebar");if(!host)return;
 const home=window.currentPageName==="home";
 const [ss,ps,js]=await Promise.all([loadAllStrategicObjectives(),loadAllPrograms(),loadAllProjects()]);
 const s=activeStrategic?ss.find(x=>x.id===activeStrategic):null,p=activeProgram?ps.find(x=>x.id===activeProgram):null,j=activeProject?js.find(x=>x.id===activeProject):null;
 let h=`<button class="sidebar-home" onclick="goToPmToolHome()">PM Tool</button>`;
 if(home){h+=`<section class="sidebar-actions"><h3>Home</h3><button onclick="router.navigate('create-strategic')">Create New Strategic Objective</button><button onclick="router.navigate('load-strategic')">Load Strategic Objectives</button><button onclick="openCreateProgramStandalone()">Create New Program</button><button onclick="router.navigate('load-program')">Load Program</button><button onclick="openCreateProjectStandalone()">Create New Project</button><button onclick="router.navigate('load-project')">Load Project</button><button onclick="openPdfSaveDialog()">Save as PDF</button></section>`;}
 else{if(s)h+=`<section class="sidebar-context"><h3>Strategy</h3><button onclick="openStrategic()">Strategy Dashboard</button><button onclick="openCreateProgramFromStrategic()">+ Create Linked Program</button></section>`;if(p)h+=`<section class="sidebar-context"><h3>Program</h3><button onclick="openProgramDashboard()">Program Dashboard</button><button onclick="openProgramOverview()">Program Overview</button><button onclick="openProgramMilestones()">Program Milestones</button><button onclick="openProgramGantt()">Program Gantt</button><button onclick="openProgramRaid()">Program RAID</button><button onclick="openProgramChange()">Program Change Requests</button><button onclick="openProgramBenefits()">Benefits Realization</button><button onclick="openCreateProjectFromProgram()">+ Create Linked Project</button></section>`;if(j)h+=`<section class="sidebar-context"><h3>Project</h3><button onclick="openProjectDashboard()">Project Dashboard</button><button onclick="openProjectRbs()">Resource Breakdown</button><button onclick="openProjectWbs()">Work Breakdown</button><button onclick="openProjectCost()">Cost Breakdown</button><button onclick="openProjectGantt()">Project Gantt</button><button onclick="openProjectRaid()">Project RAID</button><button onclick="openProjectChange()">Project Change Requests</button></section>`;if(s||p||j){h+=`<section class="sidebar-loaded"><h3>Loaded Items</h3>`;if(s)h+=`<button onclick="loadStrategicUI('${s.id}')"><span>Strategy</span>${escapeUi(s.name)}</button>`;if(p)h+=`<button onclick="loadProgramUI('${p.id}')"><span>Program</span>${escapeUi(p.name)}</button>`;if(j)h+=`<button onclick="loadProjectUI('${j.id}')"><span>Project</span>${escapeUi(j.name)}</button>`;h+=`</section>`;}h+=`<section class="sidebar-actions"><button onclick="openPdfSaveDialog()">Save as PDF</button></section>`;}
 host.innerHTML=h;
}
function goToPmToolHome(){activeStrategic=null;activeProgram=null;activeProject=null;window.lastPage=null;router.navigate("home");}
async function loadStrategicUI(id){activeStrategic=id;activeProgram=null;activeProject=null;window.lastPage={page:"home"};await populateSidebar();router.navigate("strategic-objectives",id);}
async function loadProgramUI(id){const x=await loadProgram(id);activeProgram=id;activeProject=null;activeStrategic=x?.strategicId||x?.strategicObjective||null;window.lastPage={page:"home"};await populateSidebar();router.navigate("program-dashboard",id);}
async function loadProjectUI(id){const x=await loadProject(id);activeProject=id;activeProgram=x?.programId||null;activeStrategic=null;if(activeProgram){const p=await loadProgram(activeProgram);activeStrategic=p?.strategicId||p?.strategicObjective||null;}window.lastPage={page:"home"};await populateSidebar();router.navigate("project-dashboard",id);}
function openCreateProgramStandalone(){window.pendingStrategicId=null;router.navigate("create-program");}function openCreateProgramFromStrategic(){if(!activeStrategic)return alert("Load a Strategy first.");window.pendingStrategicId=activeStrategic;router.navigate("create-program");}function openCreateProjectStandalone(){window.pendingProgramId=null;router.navigate("create-project");}function openCreateProjectFromProgram(){if(!activeProgram)return alert("Load a Program first.");window.pendingProgramId=activeProgram;router.navigate("create-project");}
function openStrategic(){if(activeStrategic)router.navigate("strategic-objectives",activeStrategic);}function openProgramDashboard(){if(activeProgram)router.navigate("program-dashboard",activeProgram);}function openProgramOverview(){if(activeProgram)router.navigate("program-overview",activeProgram);}function openProgramMilestones(){if(activeProgram)router.navigate("program-milestones",activeProgram);}function openProgramGantt(){if(activeProgram)router.navigate("program-gantt",activeProgram);}function openProgramRaid(){if(activeProgram)router.navigate("program-raid",activeProgram);}function openProgramChange(){if(activeProgram)router.navigate("program-change",activeProgram);}function openProgramBenefits(){if(activeProgram)router.navigate("benefits",activeProgram);}function openProjectDashboard(){if(activeProject)router.navigate("project-dashboard",activeProject);}function openProjectRbs(){if(activeProject)router.navigate("rbs-tree",activeProject);}function openProjectWbs(){if(activeProject)router.navigate("wbs",activeProject);}function openProjectCost(){if(activeProject)router.navigate("cost",activeProject);}function openProjectGantt(){if(activeProject)router.navigate("project-gantt",activeProject);}function openProjectRaid(){if(activeProject)router.navigate("project-raid",activeProject);}function openProjectChange(){if(activeProject)router.navigate("project-change",activeProject);}
function openPdfSaveDialog(){const old=document.getElementById("pdf-save-dialog-bg");if(old)old.remove();const bg=document.createElement("div");bg.id="pdf-save-dialog-bg";bg.className="pdf-dialog-bg";bg.innerHTML=`<div class="pdf-dialog"><h3>Save as PDF</h3><p>What would you like to save?</p><div class="pdf-dialog-actions"><button class="btn" id="pdf-cancel">Cancel</button><button class="btn" id="pdf-current">Save current page</button><button class="btn btn-primary" id="pdf-complete">Save complete loaded items</button></div></div>`;document.body.appendChild(bg);pdfCancel=()=>bg.remove();document.getElementById("pdf-cancel").onclick=pdfCancel;document.getElementById("pdf-current").onclick=()=>{bg.remove();window.print();};document.getElementById("pdf-complete").onclick=async()=>{bg.remove();await printCompleteLoadedItems();};bg.onclick=e=>{if(e.target===bg)bg.remove();};}
function saveCurrentPageAsPdf(){openPdfSaveDialog();}
async function printCompleteLoadedItems(){
 const strategyId=activeStrategic,programId=activeProgram,projectId=activeProject;
 if(!strategyId&&!programId&&!projectId)return alert("Load at least one item first.");
 const printWindow=window.open("","_blank");
 if(!printWindow)return alert("Allow pop-ups to save the complete loaded items.");
 printWindow.document.write('<!doctype html><html><head><title>Preparing complete loaded items</title></head><body><p style="font-family:Arial;padding:24px">Preparing printable pages...</p></body></html>');
 printWindow.document.close();
 const current={page:window.currentPageName,id:getCurrentPageId()};
 const pages=[];
 if(strategyId)pages.push(["Strategy Dashboard","strategic-objectives",strategyId],["Strategy Lessons","strategic-lessons",strategyId]);
 if(programId)pages.push(["Program Dashboard","program-dashboard",programId],["Program Overview","program-overview",programId],["Program Milestones","program-milestones",programId],["Program Gantt","program-gantt",programId],["Program RAID","program-raid",programId],["Program Change Requests","program-change",programId],["Program Benefits","benefits",programId],["Program Cost Breakdown","program-cbs",programId],["Program Quality","program-quality",programId],["Program Lessons","program-lessons",programId]);
 if(projectId)pages.push(["Project Dashboard","project-dashboard",projectId],["Resource Breakdown","rbs-tree",projectId],["Work Breakdown","wbs",projectId],["Cost Breakdown","cost",projectId],["Project Gantt","project-gantt",projectId],["Project RAID","project-raid",projectId],["Project Change Requests","project-change",projectId],["Project Cost Breakdown","project-cbs",projectId],["Project Quality","project-quality",projectId],["Project Lessons","project-lessons",projectId],["Project Benefits","benefits",projectId]);
 const rendered=[];
 try{
   for(const [title,route,id] of pages){
     try{
       await router.navigate(route,id);
       await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
       const view=document.getElementById("main-view").cloneNode(true);
       view.querySelectorAll("button,.back-btn,.table-actions,.rbs-dialog-bg,#rbs-dialog-bg").forEach(el=>el.remove());
       view.querySelectorAll("input,select,textarea").forEach(el=>{const span=document.createElement("span");span.textContent=el.value||"";el.replaceWith(span);});
       rendered.push(`<section class="complete-print-page"><div class="complete-print-label">${escapeUi(title)}</div>${view.innerHTML}</section>`);
     }catch(error){console.error("Unable to render",route,error);}
   }
 }finally{
   activeStrategic=strategyId;activeProgram=programId;activeProject=projectId;
   if(current.page&&current.page!=="home"&&current.id)await router.navigate(current.page,current.id);else await router.navigate("home");
 }
 const styles=Array.from(document.querySelectorAll('link[rel="stylesheet"],style')).map(el=>el.outerHTML).join("\n");
 printWindow.document.open();
 printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>PM Tool complete loaded items</title>${styles}<style>
 body{background:#fff!important;overflow:visible!important}.complete-print-title{font-family:Arial,sans-serif;margin:0 0 24px}.complete-print-page{position:relative!important;margin:0!important;padding:8px 0 24px!important;break-after:page;page-break-after:always;min-height:auto!important;overflow:visible!important}.complete-print-page:last-child{break-after:auto;page-break-after:auto}.complete-print-label{font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#667085;border-bottom:1px solid #d0d5dd;padding-bottom:8px;margin-bottom:18px}.complete-print-page #rbs-stage,.complete-print-page #rbs-org-container{height:auto!important;min-height:650px!important;overflow:visible!important;border:0!important}.complete-print-page #rbs-canvas,.complete-print-page #rbs-org-inner{transform-origin:top left}.complete-print-page .gantt-container{overflow:visible!important}#sidebar,.btn,button{display:none!important}#main-view{margin:0!important;padding:0!important;width:auto!important}@page{margin:14mm}@media print{body{margin:0}.complete-print-title{margin-top:0}}
 </style></head><body><h1 class="complete-print-title">PM Tool: Complete Loaded Items</h1>${rendered.join("")}<script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script></body></html>`);
 printWindow.document.close();
}
function getCurrentPageId(){
 if(window.currentPageName&&window.currentPageName.startsWith("strategic"))return activeStrategic;
 if(window.currentPageName&&window.currentPageName.startsWith("program"))return activeProgram;
 if(["rbs-tree","wbs","cost","project-dashboard","project-gantt","project-raid","project-change","project-cbs","project-quality","project-lessons"].includes(window.currentPageName))return activeProject;
 return null;
}
