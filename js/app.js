let PROJECT_CONFIG=null; let ACTIVE_TEMPLATE=null;
const ui={templateSelect:document.getElementById("templateSelect"),bodyInput:document.getElementById("bodyInput"),signatureInput:document.getElementById("signatureInput"),dateInput:document.getElementById("dateInput"),renderBtn:document.getElementById("renderBtn"),downloadPngBtn:document.getElementById("downloadPngBtn"),downloadHtmlBtn:document.getElementById("downloadHtmlBtn")};
const sampleData={body:`Estimados compañeros, informamos que *el Ing. Paúl Sandoval* hará uso de sus vacaciones desde el *24 de junio hasta el 6 de julio de 2026.*

Durante este periodo deberán considerar:

- Solicitar vehículos con anticipación.
- Remitir la solicitud al correo institucional.
- Copiar a la Dirección Administrativa.

> Este párrafo tiene una sangría simple para notas o aclaraciones.

>> Este párrafo tiene doble sangría.

Agradecemos su atención y colaboración.`,signature:"DIRECCIÓN ADMINISTRATIVA",date:"24 de junio de 2026"};
function getCurrentData(){return{body:ui.bodyInput.value,signature:ui.signatureInput.value,date:ui.dateInput.value};}
function populateTemplateSelect(){ui.templateSelect.innerHTML=""; for(const [id,template] of Object.entries(PROJECT_CONFIG.templates)){const option=document.createElement("option"); option.value=id; option.textContent=template.name; ui.templateSelect.appendChild(option);}}
async function activateTemplate(templateId){ACTIVE_TEMPLATE=PROJECT_CONFIG.templates[templateId]; const rawSVG=await loadTemplateSVG(templateId); setupTemplate(ACTIVE_TEMPLATE,rawSVG); renderContent(ACTIVE_TEMPLATE,getCurrentData());}
async function init(){PROJECT_CONFIG=await loadProjectConfig(); ui.bodyInput.value=sampleData.body; ui.signatureInput.value=sampleData.signature; ui.dateInput.value=sampleData.date; populateTemplateSelect(); await activateTemplate(ui.templateSelect.value); ui.templateSelect.addEventListener("change",e=>activateTemplate(e.target.value)); ui.renderBtn.addEventListener("click",()=>renderContent(ACTIVE_TEMPLATE,getCurrentData())); ui.bodyInput.addEventListener("input",()=>renderContent(ACTIVE_TEMPLATE,getCurrentData())); ui.signatureInput.addEventListener("input",()=>renderContent(ACTIVE_TEMPLATE,getCurrentData())); ui.dateInput.addEventListener("input",()=>renderContent(ACTIVE_TEMPLATE,getCurrentData())); ui.downloadPngBtn.addEventListener("click",()=>downloadGeneratedPNG(ACTIVE_TEMPLATE)); ui.downloadHtmlBtn.addEventListener("click",downloadGeneratedHTML);}
document.fonts.ready.then(init);
