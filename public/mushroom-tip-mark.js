(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_TIP_MARK_V7__)return;
  window.__BG_MUSHROOM_TIP_MARK_V7__=true;

  const MARK="#2a0820";
  let patchedSheet=null;

  function currentState(){
    try{return window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State}catch(e){return null}
  }

  function looksLikePinkMushroom(s){
    try{
      if(!s||s.__bgBluePowerV5)return false;
      if(window.Mario&&Mario.Mushroom&&s instanceof Mario.Mushroom)return true;
      return Number(s.XPic||0)===0&&Number(s.YPic||0)===0&&Number(s.PicWidth||0)===16&&Number(s.PicHeight||0)===16&&Number(s.XPicO||0)===8&&Number(s.YPicO||0)===15&&typeof s.CollideCheck==="function";
    }catch(e){return false}
  }

  function patchExisting(sheet){
    try{
      const st=currentState(),list=st&&st.Sprites&&st.Sprites.Objects;
      if(!Array.isArray(list))return;
      for(const s of list)if(looksLikePinkMushroom(s))s.Image=sheet;
    }catch(e){}
  }

  function patchSheet(){
    try{
      if(!(window.Enjine&&Enjine.Resources&&Enjine.Resources.Images))return false;
      const src=Enjine.Resources.Images.items;
      if(!src||!src.width||!src.height)return false;

      if(src.__bgMushroomTipV7){
        patchedSheet=src;
        patchExisting(src);
        return true;
      }

      const c=document.createElement("canvas");
      c.width=src.width;c.height=src.height;
      const ctx=c.getContext("2d");if(!ctx)return false;
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(src,0,0);

      // O sprite real do cogumelo começa em y=3 (x=6..10).
      // Risquinho vertical: centro exato do topo, dentro do chapéu.
      ctx.fillStyle=MARK;
      ctx.fillRect(8,3,1,4);

      c.__bgMushroomTipV7=true;
      c.__bgOriginalItemsSource=src;
      Enjine.Resources.Images.items=c;
      patchedSheet=c;
      patchExisting(c);
      return true;
    }catch(e){return false}
  }

  let tries=0;
  const timer=setInterval(()=>{
    patchSheet();
    if(patchedSheet)patchExisting(patchedSheet);
    if(++tries>300)clearInterval(timer);
  },100);
  patchSheet();

  window.__bgMushroomTipMark={allMushrooms:true,x:8,y:3,w:1,h:4,get patched(){return !!patchedSheet}};
})();
