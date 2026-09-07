(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_MARK_FINAL_V1__)return;
  window.__BG_MUSHROOM_MARK_FINAL_V1__=true;

  const PINK_MARK="#451437";
  const BLUE_MARK="#08245f";

  function spriteWorldPos(s){
    const xo=Number(s&&s.XPicO)||0,yo=Number(s&&s.YPicO)||0;
    const xOld=Number(s&&s.XOld)||Number(s&&s.X)||0;
    const yOld=Number(s&&s.YOld)||Number(s&&s.Y)||0;
    const x=Number(s&&s.X)||0,y=Number(s&&s.Y)||0,d=Number(s&&s.Delta)||0;
    return {x:(xOld+(x-xOld)*d|0)-xo,y:(yOld+(y-yOld)*d|0)-yo};
  }

  function blueWorldPos(b){
    const e=Math.max(0,Math.min(1,Number(b&&b.emerge)||0));
    const eased=1-Math.pow(1-e,3);
    return {x:Number(b&&b.tileX)*16+8,y:Number(b&&b.tileY)*16+8-9*eased};
  }

  function drawViewport(ctx,state,cam){
    if(!ctx||!state||!cam)return;
    const camX=Math.round(Number(cam.X)||0),camY=Math.round(Number(cam.Y)||0);
    let pink=0,blue=0;
    ctx.save();
    try{
      const list=state.Sprites&&state.Sprites.Objects;
      if(Array.isArray(list)&&window.Mario&&Mario.Mushroom){
        ctx.fillStyle=PINK_MARK;
        for(const s of list){
          if(!s||s.Visible===false||!(s instanceof Mario.Mushroom))continue;
          const p=spriteWorldPos(s);
          ctx.fillRect(Math.round(p.x-camX)+8,Math.round(p.y-camY)+3,1,3);
          pink++;
        }
      }

      const hd=state.__bgCollectibleData&&state.__bgCollectibleData.__bgBlueHiddenV4;
      if(hd&&Array.isArray(hd.bricks)){
        ctx.fillStyle=BLUE_MARK;
        for(const b of hd.bricks){
          if(!b||!b.revealed||b.collected)continue;
          const p=blueWorldPos(b);
          const bob=(Number(b.emerge)||0)>=1?Math.round(Math.sin(performance.now()/180+(Number(b.anchor)||0))*1):0;
          // O sprite azul é desenhado de x-8 / y-15; o risquinho fica no centro do topo.
          ctx.fillRect(Math.round(p.x-camX),Math.round(p.y-15+bob-camY)+3,1,3);
          blue++;
        }
      }
    }catch(e){}finally{ctx.restore()}
    window.__bgMushroomMarksVisible={pink,blue,total:pink+blue};
  }

  function install(){
    try{
      if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype&&typeof Mario.LevelState.prototype.Draw==="function"))return false;
      const p=Mario.LevelState.prototype;
      if(p.__bgMushroomFinalMarkV1)return true;
      p.__bgMushroomFinalMarkV1=true;
      const original=p.Draw;
      p.Draw=function(ctx){
        const r=original.apply(this,arguments);
        try{drawViewport(ctx,this,this.Camera)}catch(e){}
        return r;
      };
      return true;
    }catch(e){return false}
  }

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},50);
    setTimeout(()=>clearInterval(timer),10000);
  }

  window.__bgMushroomFinalMark={drawViewport,get visible(){return window.__bgMushroomMarksVisible||{pink:0,blue:0,total:0}}};
})();
