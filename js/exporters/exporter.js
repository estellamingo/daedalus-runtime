const DaedalusExporter=(()=>{
  let last={dataUrl:null,blob:null,filename:"comunicado.png"};

  const status=text=>{
    const el=document.getElementById("exportStatus");
    if(el) el.textContent=text||"";
  };
  const showModal=()=>{document.getElementById("exportModal").hidden=false;};
  const closeModal=()=>{document.getElementById("exportModal").hidden=true;};

  const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);

  async function waitReady(){
    await document.fonts.ready;
    await new Promise(resolve=>setTimeout(resolve,250));
  }

  async function getEmbeddedFontCSS(node){
    if(!window.htmlToImage || !htmlToImage.getFontEmbedCSS) return "";
    try{
      return await htmlToImage.getFontEmbedCSS(node);
    }catch(error){
      console.warn("No se pudo incrustar la fuente:",error);
      return "";
    }
  }

  async function htmlToImageBlob(node,template){
    if(!window.htmlToImage) throw new Error("html-to-image no está disponible.");
    const height=Math.ceil(parseFloat(getComputedStyle(node).height));
    const fontEmbedCSS=await getEmbeddedFontCSS(node);

    return await htmlToImage.toBlob(node,{
      width:template.width,
      height,
      cacheBust:true,
      backgroundColor:"#ffffff",
      pixelRatio:isIOS()?1.5:2,
      fontEmbedCSS,
      skipAutoScale:false,
      style:{
        transform:"none",
        transformOrigin:"top left",
        width:`${template.width}px`,
        height:`${height}px`
      }
    });
  }

  async function fallbackBlob(node,template){
    const artboard=node.cloneNode(true);
    const width=template.width;
    const height=Math.ceil(parseFloat(getComputedStyle(node).height));

    artboard.setAttribute("xmlns","http://www.w3.org/1999/xhtml");
    artboard.style.width=`${width}px`;
    artboard.style.height=`${height}px`;
    artboard.style.transform="none";
    artboard.style.position="relative";
    artboard.style.overflow="hidden";
    artboard.style.background="#ffffff";

    const serialized=new XMLSerializer().serializeToString(artboard);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="${width}" height="${height}">${serialized}</foreignObject>
    </svg>`;
    const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));

    try{
      const image=await new Promise((resolve,reject)=>{
        const img=new Image();
        img.onload=()=>resolve(img);
        img.onerror=()=>reject(new Error("No se pudo rasterizar el SVG."));
        img.src=url;
      });

      const canvas=document.createElement("canvas");
      canvas.width=width;
      canvas.height=height;
      const ctx=canvas.getContext("2d");
      if(!ctx) throw new Error("No se pudo crear el canvas.");

      ctx.fillStyle="#ffffff";
      ctx.fillRect(0,0,width,height);
      ctx.drawImage(image,0,0);

      return await new Promise((resolve,reject)=>{
        canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("El navegador no produjo el PNG.")),"image/png");
      });
    }finally{
      URL.revokeObjectURL(url);
    }
  }

  function blobToDataURL(blob){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result);
      reader.onerror=()=>reject(new Error("No se pudo leer la imagen generada."));
      reader.readAsDataURL(blob);
    });
  }

  async function generatePNG(template){
    showModal();
    status("Generando imagen...");
    const wrap=document.getElementById("exportImageWrap");
    wrap.innerHTML="";

    try{
      await waitReady();
      const node=document.getElementById("artboard");
      let blob;

      try{
        blob=await htmlToImageBlob(node,template);
      }catch(primaryError){
        console.warn("Exporter principal falló; usando fallback:",primaryError);
        status("Aplicando método alternativo...");
        blob=await fallbackBlob(node,template);
      }

      const dataUrl=await blobToDataURL(blob);
      last={dataUrl,blob,filename:"comunicado.png"};

      const img=document.createElement("img");
      img.src=dataUrl;
      img.alt="Imagen generada";
      img.decoding="async";
      wrap.appendChild(img);
      status("Imagen lista.");
    }catch(error){
      console.error(error);
      status(`No se pudo generar la imagen: ${error.message}`);
    }
  }

  function download(){
    if(!last.dataUrl){status("Primero genera la imagen.");return;}
    const link=document.createElement("a");
    link.href=last.dataUrl;
    link.download=last.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function openImage(){
    if(!last.dataUrl){status("Primero genera la imagen.");return;}
    const win=window.open();
    if(win){
      win.document.write(`<meta name="viewport" content="width=device-width,initial-scale=1"><img src="${last.dataUrl}" style="display:block;max-width:100%;height:auto;margin:auto;">`);
      win.document.close();
    }else{
      window.location.href=last.dataUrl;
    }
  }

  async function share(){
    if(!last.blob){status("Primero genera la imagen.");return;}
    const file=new File([last.blob],last.filename,{type:"image/png"});

    if(navigator.canShare && navigator.canShare({files:[file]}) && navigator.share){
      try{
        await navigator.share({files:[file],title:"Daedalus Studio",text:"Imagen generada"});
        status("Imagen compartida.");
      }catch(error){
        if(error.name!=="AbortError") status("No se pudo abrir el menú Compartir.");
      }
      return;
    }

    if(navigator.share){
      try{
        await navigator.share({title:"Daedalus Studio",text:"Imagen generada",url:last.dataUrl});
      }catch(error){
        if(error.name!=="AbortError") status("No se pudo compartir la imagen.");
      }
      return;
    }

    status("Este navegador no permite compartir. Usa Abrir imagen o mantén presionada la vista previa.");
  }

  function downloadHTML(){
    const blob=new Blob([document.documentElement.outerHTML],{type:"text/html;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download="comunicado_generado.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function bind(){
    document.getElementById("closeExportModal")?.addEventListener("click",closeModal);
    document.getElementById("downloadImageBtn")?.addEventListener("click",download);
    document.getElementById("openImageBtn")?.addEventListener("click",openImage);
    document.getElementById("shareImageBtn")?.addEventListener("click",share);
  }

  return{generatePNG,downloadHTML,bind};
})();

document.addEventListener("DOMContentLoaded",DaedalusExporter.bind);
