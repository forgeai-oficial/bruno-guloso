(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_MARK_FINAL_V2__)return;
  window.__BG_MUSHROOM_MARK_FINAL_V2__=true;

  const PINK_MARK="#421034";
  const BLUE_MARK="#071e58";

  function spriteWorldPos(s){
    const xo=Number(s&&s.XPicO)||0,yo=Number(s&&s.YPicO)||0;
    const xOld=Number(s&&s.XOld)||Number(s&&s.X)||0,yOld=Number(s&&s.YOld)||Number(s&&s.Y)||0;
    const x=Number(s&&s.X)||0,y=Number(s&&s.Y)||0,d=Number(s&&s.Delta)||0;
    return{x:(xOld+(x-xOld)*d|0)-xo,y:(yOld+(y-yOld)*d|0)-yo};
  }

  function drawViewport(ctx,state,cam){
    if(!ctx||!state||!cam)return;
    const camX=Math.round(Number(cam.X)||0),camY=Math.round(Number(cam.Y)||0);
    let pink=0,blue=0;
    ctx.save();
    try{
      const list=state.Sprites&&state.Sprites.Objects;
      if(Array.isArray(list)&&window.Mario&&Mario.Mushroom){
        for(const s of list){
          if(!s||s.Visible===false||!(s instanceof Mario.Mushroom))continue;
          const p=spriteWorldPos(s),sx=Math.round(p.x-camX)+8,sy=Math.round(p.y-camY)+2;
          if(s.__bgBluePowerV5){ctx.fillStyle=BLUE_MARK;blue++}else{ctx.fillStyle=PINK_MARK;pink++}
          ctx.fillRect(sx,sy,1,4);
        }
      }
    }catch(e){}finally{ctx.restore()}
    window.__bgMushroomMarksVisible={pink,blue,total:pink+blue};
  }

  function install(){
    try{
      if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype&&typeof Mario.LevelState.prototype.Draw==="function"))return false;
      const p=Mario.LevelState.prototype;if(p.__bgMushroomFinalMarkV2)return true;p.__bgMushroomFinalMarkV2=true;
      const original=p.Draw;
      p.Draw=function(ctx){const r=original.apply(this,arguments);try{drawViewport(ctx,this,this.Camera)}catch(e){}return r};
      return true;
    }catch(e){return false}
  }

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},50);setTimeout(()=>clearInterval(timer),10000);
  }
  window.__bgMushroomFinalMark={drawViewport,get visible(){return window.__bgMushroomMarksVisible||{pink:0,blue:0,total:0}}};
})();
