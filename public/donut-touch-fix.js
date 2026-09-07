(()=>{
  "use strict";
  if(window.__BG_DONUT_TOUCH_FIX_V2__)return;
  window.__BG_DONUT_TOUCH_FIX_V2__=true;

  const DONUT_POINTS=10;
  const RADIUS_X=7;
  const RADIUS_Y=7;

  function playCoin(){
    try{if(window.Enjine&&Enjine.Resources)Enjine.Resources.PlaySound("coin")}catch(e){}
  }

  function player(){
    try{return window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.World?Mario.MarioCharacter:null}catch(e){return null}
  }

  function overlapsAt(m,item,x,y){
    const halfW=Math.max(4,Number(m.Width)||4);
    const h=Math.max(12,Number(m.Height)||24);
    return item.x>=x-halfW-RADIUS_X && item.x<=x+halfW+RADIUS_X &&
           item.y>=y-h-RADIUS_Y && item.y<=y+RADIUS_Y;
  }

  function sweptTouch(m,item){
    const x0=Number.isFinite(Number(m.XOld))?Number(m.XOld):Number(m.X)||0;
    const y0=Number.isFinite(Number(m.YOld))?Number(m.YOld):Number(m.Y)||0;
    const x1=Number(m.X)||0;
    const y1=Number(m.Y)||0;
    const dx=x1-x0,dy=y1-y0;
    const steps=Math.max(1,Math.min(48,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/3)));
    for(let i=0;i<=steps;i++){
      const t=i/steps;
      if(overlapsAt(m,item,x0+dx*t,y0+dy*t))return true;
    }
    return false;
  }

  function refreshHud(data){
    try{
      const donuts=Math.max(0,Math.floor(Number(data.donuts)||0));
      const points=donuts*DONUT_POINTS;
      const hud=document.getElementById("bgDonutScoreHud");
      if(hud)hud.textContent=`🍩 ${donuts} · +${points}`;
      const distance=Math.max(0,Math.floor((Number(window.__bgRunMaxX)||Number(player()?.X)||0)/16));
      window.__bgLastDistance=distance;
      window.__bgLastDonuts=donuts;
      window.__bgLastDonutPoints=points;
      window.__bgDonutScore=points;
    }catch(e){}
  }

  function takeDonut(state,data,item){
    if(item.taken)return;
    item.taken=true;
    data.donuts=Math.max(0,Math.floor(Number(data.donuts)||0))+1;
    data.score=data.donuts*DONUT_POINTS;
    window.__bgDonutsCollected=data.donuts;
    window.__bgDonutScore=data.score;
    try{data.effects&&data.effects.push({x:item.x,y:item.y,text:"+10",kind:"donut",life:620,max:620})}catch(e){}
    playCoin();
    try{
      if(window.Mario&&Mario.Sparkle&&state&&typeof state.AddSprite==="function"){
        for(let i=0;i<5;i++)state.AddSprite(new Mario.Sparkle(state,item.x+(i-2)*2,item.y-3,(i-2)*.3,-1.4));
      }
    }catch(e){}
    refreshHud(data);
  }

  function robustCollect(state){
    const data=state&&state.__bgCollectibleData;
    const m=player();
    if(!data||!m||m.World!==state||m.DeathTime>0||m.WinTime>0)return;
    if(!Array.isArray(data.items))return;
    for(const item of data.items){
      if(item&&item.taken!==true&&sweptTouch(m,item))takeDonut(state,data,item);
    }
  }

  function install(){
    try{
      if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype&&typeof Mario.LevelState.prototype.Update==="function"))return false;
      const p=Mario.LevelState.prototype;
      if(p.__bgDonutTouchFixV2)return true;
      p.__bgDonutTouchFixV2=true;
      const original=p.Update;
      p.Update=function(){
        const r=original.apply(this,arguments);
        try{if(!this.Paused&&!window.__bgPaused&&!window.__bgGameOverActive&&!window.__bgVictoryActive)robustCollect(this)}catch(e){}
        return r;
      };
      return true;
    }catch(e){return false}
  }

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},50);
    setTimeout(()=>clearInterval(timer),10000);
  }

  window.__bgDonutTouchFix={radiusX:RADIUS_X,radiusY:RADIUS_Y,swept:true,pointsPerDonut:DONUT_POINTS};
})();
