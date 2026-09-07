(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_TIP_MARK_V3__)return;
  window.__BG_MUSHROOM_TIP_MARK_V3__=true;

  const patchedSources=new WeakSet();

  function patchCurrentItems(){
    try{
      if(!(window.Enjine&&Enjine.Resources&&Enjine.Resources.Images))return false;
      const src=Enjine.Resources.Images.items;
      if(!src||!src.width||!src.height)return false;
      if(src.__bgMushroomTipPatched)return true;
      if(typeof src==="object"&&patchedSources.has(src))return true;

      const canvas=document.createElement("canvas");
      canvas.width=src.width;
      canvas.height=src.height;
      const ctx=canvas.getContext("2d");
      if(!ctx)return false;
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(src,0,0);

      // Primeiro tile 16x16 = cogumelo. O chapéu real começa em y=3.
      // Risquinho vertical minúsculo, 1 px x 3 px, no centro exato do topo.
      ctx.fillStyle="rgb(70,20,55)";
      ctx.fillRect(8,3,1,3);

      canvas.__bgMushroomTipPatched=true;
      try{patchedSources.add(src)}catch(e){}
      Enjine.Resources.Images.items=canvas;

      // Se algum cogumelo já existir na fase, troca sua imagem também.
      try{
        const app=window.__jo2app;
        const st=app&&app.stateContext&&app.stateContext.State;
        const list=st&&st.Sprites&&st.Sprites.Objects;
        if(Array.isArray(list)&&window.Mario&&Mario.Mushroom){
          for(const s of list)if(s instanceof Mario.Mushroom)s.Image=canvas;
        }
      }catch(e){}

      window.__bgMushroomTipMark={patched:true,width:canvas.width,height:canvas.height,x:8,y:3,w:1,h:3};
      return true;
    }catch(e){return false}
  }

  // O HTML carrega os sprites de forma assíncrona e pode substituir Images.items.
  // Mantém a checagem por alguns segundos e reaplica se a fonte for trocada.
  let ticks=0;
  const timer=setInterval(()=>{
    patchCurrentItems();
    ticks++;
    if(ticks>200)clearInterval(timer);
  },50);
  patchCurrentItems();
})();
