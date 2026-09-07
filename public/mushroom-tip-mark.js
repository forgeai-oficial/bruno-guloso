(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_TIP_MARK_V6__)return;
  window.__BG_MUSHROOM_TIP_MARK_V6__=true;

  const MARK="#421034";
  let pinkSprite=null;
  let pinkSource=null;
  let wrapped=false;

  function makePinkSprite(){
    try{
      const src=window.Enjine&&Enjine.Resources&&Enjine.Resources.Images&&Enjine.Resources.Images.items;
      if(!src||!src.width||!src.height)return null;
      if(pinkSprite&&pinkSource===src)return pinkSprite;
      const c=document.createElement("canvas");c.width=16;c.height=16;
      const ctx=c.getContext("2d");if(!ctx)return null;
      ctx.imageSmoothingEnabled=false;ctx.drawImage(src,0,0,16,16,0,0,16,16);
      ctx.fillStyle=MARK;ctx.fillRect(8,2,1,4);
      pinkSprite=c;pinkSource=src;return c;
    }catch(e){return null}
  }

  function worldPos(s){
    const xo=Number(s&&s.XPicO)||0,yo=Number(s&&s.YPicO)||0;
    const xOld=Number(s&&s.XOld)||Number(s&&s.X)||0,yOld=Number(s&&s.YOld)||Number(s&&s.Y)||0;
    const x=Number(s&&s.X)||0,y=Number(s&&s.Y)||0,d=Number(s&&s.Delta)||0;
    return{x:(xOld+(x-xOld)*d|0)-xo,y:(yOld+(y-yOld)*d|0)-yo};
  }

  function wrapConstructor(){
    try{
      if(wrapped||!(window.Mario&&Mario.Mushroom&&Mario.Mushroom.prototype))return wrapped;
      const Original=Mario.Mushroom;
      if(Original.__bgMarkedWrapperV6){wrapped=true;return true}
      const Wrapped=function(world,x,y){
        Original.call(this,world,x,y);
        const img=makePinkSprite();if(img)this.Image=img;
        this.__bgPinkMarkedV6=true;
      };
      Wrapped.prototype=Original.prototype;Wrapped.prototype.constructor=Wrapped;
      Wrapped.__bgMarkedWrapperV6=true;Wrapped.__bgOriginalMushroom=Original;
      Mario.Mushroom=Wrapped;wrapped=true;return true;
    }catch(e){return false}
  }

  function patchExisting(){
    try{
      const img=makePinkSprite();if(!img)return;
      const st=window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State;
      const list=st&&st.Sprites&&st.Sprites.Objects;if(!Array.isArray(list)||!(window.Mario&&Mario.Mushroom))return;
      for(const s of list){
        if(!s||s.__bgBluePowerV5)continue;
        if(s instanceof Mario.Mushroom){s.Image=img;s.__bgPinkMarkedV6=true}
      }
    }catch(e){}
  }

  function installDrawGuarantee(){
    try{
      if(!(window.Mario&&Mario.Mushroom&&Mario.Mushroom.prototype&&Mario.NotchSprite))return false;
      const p=Mario.Mushroom.prototype;if(p.__bgTipDrawV6)return true;p.__bgTipDrawV6=true;
      const original=p.Draw||Mario.NotchSprite.prototype.Draw;
      p.Draw=function(ctx,cam){
        const r=original.call(this,ctx,cam);
        try{
          if(!ctx||this.Visible===false||this.__bgBluePowerV5)return r;
          const pos=worldPos(this);ctx.save();ctx.fillStyle=MARK;ctx.fillRect(pos.x+8,pos.y+2,1,4);ctx.restore();
        }catch(e){}return r;
      };
      return true;
    }catch(e){return false}
  }

  function installFinalOverlay(){
    try{
      if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype&&typeof Mario.LevelState.prototype.Draw==="function"))return false;
      const p=Mario.LevelState.prototype;if(p.__bgAllMushroomMarksV6)return true;p.__bgAllMushroomMarksV6=true;
      const original=p.Draw;
      p.Draw=function(ctx){
        const r=original.apply(this,arguments);
        try{
          const list=this.Sprites&&this.Sprites.Objects;
          if(ctx&&Array.isArray(list)&&this.Camera&&window.Mario&&Mario.Mushroom){
            let total=0;ctx.save();ctx.fillStyle=MARK;
            for(const s of list){
              if(!s||s.Visible===false||s.__bgBluePowerV5||!(s instanceof Mario.Mushroom))continue;
              const pos=worldPos(s),sx=Math.round(pos.x-Number(this.Camera.X||0)),sy=Math.round(pos.y-Number(this.Camera.Y||0));
              ctx.fillRect(sx+8,sy+2,1,4);total++;
            }
            ctx.restore();window.__bgVisiblePinkMushrooms=total;
          }
        }catch(e){}return r;
      };
      return true;
    }catch(e){return false}
  }

  function installAll(){
    const a=wrapConstructor();const b=installDrawGuarantee();const c=installFinalOverlay();patchExisting();return a&&b&&c;
  }

  let ticks=0;const timer=setInterval(()=>{installAll();ticks++;if(ticks>1200)clearInterval(timer)},80);
  installAll();
  window.__bgMushroomTipMark={allMushrooms:true,x:8,y:2,w:1,h:4,get visible(){return Number(window.__bgVisiblePinkMushrooms)||0}};
})();
