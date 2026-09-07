(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_TIP_MARK_V8__)return;
  window.__BG_MUSHROOM_TIP_MARK_V8__=true;

  const FRAME=16;
  const MARK_X=8;
  const MARK_Y=3;
  const MARK_W=1;
  const MARK_H=4;
  const PINK_MARK="#2a0820";
  const BLUE_MARK="#061942";
  let patchedSheet=null;
  let originalSheet=null;
  let drawHookInstalled=false;

  function stateNow(){
    try{return window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State}catch(e){return null}
  }

  function frameCount(img){
    return img&&img.width?Math.max(0,Math.floor(Number(img.width)/FRAME)):0;
  }

  function isKnownItemImage(img){
    if(!img)return false;
    if(img===patchedSheet||img===originalSheet)return true;
    try{return !!(window.Enjine&&Enjine.Resources&&Enjine.Resources.Images&&img===Enjine.Resources.Images.items)}catch(e){return false}
  }

  function isMushroomItem(s){
    try{
      if(!s||s.Visible===false)return false;
      if(s.__bgBluePowerV5)return true;
      if(window.Mario&&Mario.Mushroom&&s instanceof Mario.Mushroom)return true;
      if(window.Mario&&Mario.FireFlower&&s instanceof Mario.FireFlower)return true;
      const xp=Math.floor(Number(s.XPic)||0),yp=Math.floor(Number(s.YPic)||0);
      return isKnownItemImage(s.Image)&&
        Number(s.PicWidth)===16&&Number(s.PicHeight)===16&&
        Number(s.XPicO)===8&&Number(s.YPicO)===15&&
        yp===0&&xp>=0&&xp<Math.max(1,frameCount(patchedSheet||originalSheet));
    }catch(e){return false}
  }

  function spriteTopLeft(s){
    const xo=Number(s&&s.XPicO)||0,yo=Number(s&&s.YPicO)||0;
    const x0=Number.isFinite(Number(s&&s.XOld))?Number(s.XOld):Number(s&&s.X)||0;
    const y0=Number.isFinite(Number(s&&s.YOld))?Number(s.YOld):Number(s&&s.Y)||0;
    const x1=Number(s&&s.X)||0,y1=Number(s&&s.Y)||0;
    const d=Number.isFinite(Number(s&&s.Delta))?Number(s.Delta):0;
    return {x:(x0+(x1-x0)*d|0)-xo,y:(y0+(y1-y0)*d|0)-yo};
  }

  function installDrawHook(){
    try{
      if(!(window.Mario&&Mario.NotchSprite&&Mario.NotchSprite.prototype&&typeof Mario.NotchSprite.prototype.Draw==="function"))return false;
      const p=Mario.NotchSprite.prototype;
      if(p.__bgEveryMushroomTipV8){drawHookInstalled=true;return true}
      const original=p.Draw;
      p.__bgEveryMushroomTipV8=true;
      p.Draw=function(ctx){
        const r=original.apply(this,arguments);
        try{
          if(ctx&&isMushroomItem(this)){
            const pos=spriteTopLeft(this);
            ctx.save();
            ctx.fillStyle=this.__bgBluePowerV5?BLUE_MARK:PINK_MARK;
            ctx.fillRect(Math.round(pos.x)+MARK_X,Math.round(pos.y)+MARK_Y,MARK_W,MARK_H);
            ctx.restore();
          }
        }catch(e){}
        return r;
      };
      drawHookInstalled=true;
      return true;
    }catch(e){return false}
  }

  function patchExisting(){
    try{
      if(!patchedSheet)return;
      const st=stateNow(),list=st&&st.Sprites&&st.Sprites.Objects;
      if(!Array.isArray(list))return;
      for(const s of list){
        if(!s||s.__bgBluePowerV5)continue;
        if(isMushroomItem(s))s.Image=patchedSheet;
      }
    }catch(e){}
  }

  function patchSheet(){
    try{
      if(!(window.Enjine&&Enjine.Resources&&Enjine.Resources.Images))return false;
      const src=Enjine.Resources.Images.items;
      if(!src||!src.width||!src.height)return false;
      if(src.__bgEveryMushroomTipV8){
        patchedSheet=src;
        if(!originalSheet)originalSheet=src.__bgOriginalItemsV8||null;
        patchExisting();
        return true;
      }

      originalSheet=src;
      const c=document.createElement("canvas");
      c.width=src.width;c.height=src.height;
      const ctx=c.getContext("2d",{willReadFrequently:true});if(!ctx)return false;
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(src,0,0);

      const frames=frameCount(c);
      ctx.fillStyle=PINK_MARK;
      for(let i=0;i<frames;i++)ctx.fillRect(i*FRAME+MARK_X,MARK_Y,MARK_W,MARK_H);

      c.__bgEveryMushroomTipV8=true;
      c.__bgOriginalItemsV8=src;
      c.__bgMarkedFramesV8=frames;
      Enjine.Resources.Images.items=c;
      patchedSheet=c;
      patchExisting();
      return true;
    }catch(e){return false}
  }

  function validateSheet(){
    const out={frames:0,marked:0,all:false,drawHook:!!drawHookInstalled};
    try{
      const img=patchedSheet;
      if(!img||!img.width||!img.height)return out;
      const frames=frameCount(img);out.frames=frames;
      const c=document.createElement("canvas");c.width=img.width;c.height=img.height;
      const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0);
      const expected=[0x2a,0x08,0x20,0xff];
      for(let f=0;f<frames;f++){
        const d=ctx.getImageData(f*FRAME+MARK_X,MARK_Y,MARK_W,MARK_H).data;
        let ok=true;
        for(let i=0;i<d.length;i+=4){
          if(d[i]!==expected[0]||d[i+1]!==expected[1]||d[i+2]!==expected[2]||d[i+3]!==expected[3]){ok=false;break}
        }
        if(ok)out.marked++;
      }
      out.all=frames>0&&out.marked===frames&&out.drawHook;
    }catch(e){}
    return out;
  }

  function installAll(){
    installDrawHook();
    patchSheet();
    patchExisting();
    const status=validateSheet();
    window.__bgMushroomTipAudit=status;
    return status.all;
  }

  let ticks=0;
  const timer=setInterval(()=>{
    installAll();
    if(++ticks>600)clearInterval(timer);
  },50);
  installAll();

  window.__bgMushroomTipMark={
    allMushrooms:true,
    x:MARK_X,y:MARK_Y,w:MARK_W,h:MARK_H,
    validate:validateSheet,
    get status(){return validateSheet()},
    get patched(){return !!patchedSheet},
    get drawHook(){return !!drawHookInstalled}
  };
})();

(()=>{
  "use strict";
  if(window.__BG_MAP_EXPANSION_LOADER_V1__)return;
  window.__BG_MAP_EXPANSION_LOADER_V1__=true;
  const s=document.createElement("script");
  s.src="/map-expansion-v1.js?v=1";
  s.async=false;
  (document.head||document.documentElement).appendChild(s);
})();
