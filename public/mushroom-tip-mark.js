(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_TIP_MARK_V5__)return;
  window.__BG_MUSHROOM_TIP_MARK_V5__=true;

  const MARK="#451437";
  const patchedSources=new WeakSet();

  function patchCurrentItems(){
    try{
      if(!(window.Enjine&&Enjine.Resources&&Enjine.Resources.Images))return false;
      const src=Enjine.Resources.Images.items;
      if(!src||!src.width||!src.height)return false;
      if(src.__bgMushroomTipPatchedV5||patchedSources.has(src))return true;

      const canvas=document.createElement("canvas");
      canvas.width=src.width;canvas.height=src.height;
      const ctx=canvas.getContext("2d");if(!ctx)return false;
      ctx.imageSmoothingEnabled=false;ctx.drawImage(src,0,0);
      ctx.fillStyle=MARK;
      ctx.fillRect(8,3,1,3);
      canvas.__bgMushroomTipPatchedV5=true;
      try{patchedSources.add(src)}catch(e){}
      Enjine.Resources.Images.items=canvas;

      try{
        const st=window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State;
        const list=st&&st.Sprites&&st.Sprites.Objects;
        if(Array.isArray(list)&&window.Mario&&Mario.Mushroom){
          for(const s of list)if(s instanceof Mario.Mushroom)s.Image=canvas;
        }
      }catch(e){}
      return true;
    }catch(e){return false}
  }

  function worldPos(s){
    const x=((Number(s.XOld)||0)+((Number(s.X)||0)-(Number(s.XOld)||0))*(Number(s.Delta)||0)|0)-(Number(s.XPicO)||0);
    const y=((Number(s.YOld)||0)+((Number(s.Y)||0)-(Number(s.YOld)||0))*(Number(s.Delta)||0)|0)-(Number(s.YPicO)||0);
    return {x,y};
  }

  function isPinkMushroom(s){
    try{
      if(!s||s.Visible===false||!window.Mario)return false;
      if(Mario.Mushroom&&s instanceof Mario.Mushroom)return true;
      return Number(s.XPic)===0&&Number(s.YPic)===0&&Number(s.PicWidth)===16&&Number(s.PicHeight)===16&&Number(s.XPicO)===8&&Number(s.YPicO)===15&&typeof s.CollideCheck==="function";
    }catch(e){return false}
  }

  function installPerSpriteDraw(){
    try{
      if(!(window.Mario&&Mario.Mushroom&&Mario.Mushroom.prototype&&Mario.NotchSprite))return false;
      const p=Mario.Mushroom.prototype;
      if(p.__bgTipDrawV5)return true;
      p.__bgTipDrawV5=true;
      const original=p.Draw||Mario.NotchSprite.prototype.Draw;
      p.Draw=function(ctx,cam){
        const r=original.call(this,ctx,cam);
        try{
          if(!ctx||this.Visible===false)return r;
          const pos=worldPos(this);
          ctx.save();ctx.fillStyle=MARK;ctx.fillRect(pos.x+8,pos.y+3,1,3);ctx.restore();
        }catch(e){}
        return r;
      };
      return true;
    }catch(e){return false}
  }

  function installFinalOverlay(){
    try{
      if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype&&typeof Mario.LevelState.prototype.Draw==="function"))return false;
      const p=Mario.LevelState.prototype;
      if(p.__bgAllMushroomMarksV5)return true;
      p.__bgAllMushroomMarksV5=true;
      const original=p.Draw;
      p.Draw=function(ctx){
        const r=original.apply(this,arguments);
        try{
          const list=this.Sprites&&this.Sprites.Objects;
          if(ctx&&Array.isArray(list)&&this.Camera){
            let total=0;
            ctx.save();ctx.fillStyle=MARK;
            for(const s of list){
              if(!isPinkMushroom(s))continue;
              const pos=worldPos(s);
              const sx=Math.round(pos.x-Number(this.Camera.X||0));
              const sy=Math.round(pos.y-Number(this.Camera.Y||0));
              ctx.fillRect(sx+8,sy+3,1,3);
              total++;
            }
            ctx.restore();
            window.__bgVisiblePinkMushrooms=total;
          }
        }catch(e){}
        return r;
      };
      return true;
    }catch(e){return false}
  }

  function installAll(){
    patchCurrentItems();
    const a=installPerSpriteDraw();
    const b=installFinalOverlay();
    return a&&b;
  }

  let ticks=0;
  const timer=setInterval(()=>{
    installAll();ticks++;
    if(ticks>1200)clearInterval(timer);
  },100);
  installAll();

  window.__bgMushroomTipMark={allMushrooms:true,x:8,y:3,w:1,h:3,get visible(){return Number(window.__bgVisiblePinkMushrooms)||0}};
})();
