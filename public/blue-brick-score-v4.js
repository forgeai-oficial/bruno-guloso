(()=>{
  "use strict";
  if(window.__BG_BLUE_BRICK_SCORE_V4__)return;
  window.__BG_BLUE_BRICK_SCORE_V4__=true;

  const POWER_MS=15000;
  const POWER_SPACING=150;
  const DONUT_VALUE=10;
  const BLUE_VALUE=50;
  const EMERGE_MS=420;
  let zeroUntil=0;
  let lastRemaining=0;
  let blueSprite=null;
  let blueSource=null;

  const style=document.createElement("style");
  style.id="bgBlueBrickScoreStyleV4";
  style.textContent=`
    @keyframes bgBluePickupV4{
      0%,100%{filter:none;opacity:1;scale:1}
      12%{filter:brightness(1.9) saturate(2.1) drop-shadow(0 0 7px #73c8ff);opacity:.82;scale:1.04}
      28%{filter:brightness(1.2) saturate(1.5) drop-shadow(0 0 12px #2c83ff);opacity:1;scale:1.08}
      44%{filter:brightness(2.05) saturate(2.25) drop-shadow(0 0 10px #d3f0ff);opacity:.78;scale:1.11}
      62%{filter:brightness(1.22) saturate(1.55) drop-shadow(0 0 14px #2b7dff);opacity:1;scale:1.08}
      80%{filter:brightness(1.75) saturate(1.95) drop-shadow(0 0 9px #8bd2ff);opacity:.9;scale:1.04}
    }
    #brunoHD.bg-blue-pickup-v4{animation:bgBluePickupV4 1.35s linear!important;transform-origin:center bottom!important}
    #bgJumpPowerTimer{
      z-index:260!important;
      min-width:108px!important;
      font-size:12px!important;
      letter-spacing:.03em!important;
    }
  `;
  document.head.appendChild(style);

  function player(){
    try{return window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.World?Mario.MarioCharacter:null}catch(e){return null}
  }

  function distanceNow(){
    const m=player();
    return Math.max(0,Math.floor((Number(window.__bgRunMaxX)||Number(m&&m.X)||0)/16));
  }

  function getBlueCount(state){
    const d=state&&state.__bgCollectibleData;
    return Math.max(0,Math.floor(Number(d&&d.__bgBlueCountV4)||Number(window.__bgBlueMushroomsCollected)||0));
  }

  function metrics(state){
    const distance=distanceNow();
    const d=state&&state.__bgCollectibleData;
    const donuts=Math.max(0,Math.floor(Number(d&&d.donuts)||Number(window.__bgDonutsCollected)||0));
    const blues=getBlueCount(state);
    const donutPoints=donuts*DONUT_VALUE;
    const bluePoints=blues*BLUE_VALUE;
    return {distance,donuts,blues,donutPoints,bluePoints,total:distance+donutPoints+bluePoints};
  }

  function publish(state){
    const m=metrics(state);
    window.__bgLastDistance=m.distance;
    window.__bgLastDonuts=m.donuts;
    window.__bgLastBlueMushrooms=m.blues;
    window.__bgLastDonutPoints=m.donutPoints;
    window.__bgLastBluePoints=m.bluePoints;
    window.__bgDonutScore=m.donutPoints;
    window.__bgBlueMushroomsCollected=m.blues;
    window.__bgCompositeScore=m.total;
    window.__bgLastScore=m.total;
    const hud=document.getElementById("bgDonutScoreHud");
    if(hud)hud.textContent=`🍩 ${m.donuts}  🔵 ${m.blues}  •  ${m.total} pts`;
    return m;
  }

  window.__bgRankingMetrics=()=>metrics(window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State);

  function isBreakable(level,x,y){
    try{
      const tile=level.GetBlock(x,y)&255;
      return !!(window.Mario&&(Mario.Tile.Behaviors[tile]&Mario.Tile.Breakable));
    }catch(e){return false}
  }

  function isBlocking(level,x,y){
    try{return !!level.IsBlocking(x,y,0,1)}catch(e){return false}
  }

  function findBreakableId(level){
    try{
      for(let x=0;x<(level.Width|0);x++)for(let y=1;y<(level.Height|0)-1;y++){
        const tile=level.GetBlock(x,y)&255;
        if(window.Mario&&(Mario.Tile.Behaviors[tile]&Mario.Tile.Breakable))return tile;
      }
    }catch(e){}
    return 16;
  }

  function findSurface(level,targetX){
    const w=level.Width|0,h=level.Height|0;
    for(let r=0;r<=45;r++){
      const arr=r===0?[targetX]:[targetX+r,targetX-r];
      for(const xx of arr){
        const x=Math.max(6,Math.min(w-7,xx|0));
        for(let y=3;y<h;y++){
          if(isBlocking(level,x,y)&&!isBlocking(level,x,y-1)&&!isBlocking(level,x,y-2)&&!isBlocking(level,x,y-3))return {x,y};
        }
      }
    }
    return null;
  }

  function findBrickNear(level,anchor,used){
    const h=level.Height|0;
    for(let r=0;r<=74;r++){
      const xs=r===0?[anchor]:[anchor-r,anchor+r];
      for(const x of xs){
        if(x<5||x>=level.Width-5)continue;
        for(let y=2;y<h-2;y++){
          const key=`${x},${y}`;
          if(used[key]||!isBreakable(level,x,y))continue;
          if(!isBlocking(level,x,y+1))return {x,y,key};
        }
      }
    }
    return null;
  }

  function injectBrick(level,anchor,used,breakableId){
    const p=findSurface(level,anchor);
    if(!p)return null;
    const y=p.y-3;
    if(y<2)return null;
    const key=`${p.x},${y}`;
    if(used[key])return null;
    try{
      level.SetBlock(p.x,y,breakableId);
      level.SetBlockData(p.x,y,0);
      return {x:p.x,y,key,added:true};
    }catch(e){return null}
  }

  function hiddenData(state){
    const data=state&&state.__bgCollectibleData;
    if(!data)return null;
    if(!data.__bgBlueHiddenV4)data.__bgBlueHiddenV4={assigned:{},used:{},bricks:[],breakableId:0};
    if(!Number.isFinite(Number(data.__bgBlueCountV4)))data.__bgBlueCountV4=0;
    return data.__bgBlueHiddenV4;
  }

  function suppressLegacyPowers(state){
    const data=state&&state.__bgCollectibleData;
    if(!data||!Array.isArray(data.powers))return;
    for(const p of data.powers)if(p)p.taken=true;
  }

  function prepareBricks(state){
    const level=state&&state.Level;
    const hd=hiddenData(state);
    if(!level||!hd)return;
    suppressLegacyPowers(state);
    if(!hd.breakableId)hd.breakableId=findBreakableId(level);
    const max=Math.max(POWER_SPACING,Math.floor((level.Width-20)/POWER_SPACING)*POWER_SPACING);
    for(let anchor=POWER_SPACING;anchor<=max;anchor+=POWER_SPACING){
      if(hd.assigned[anchor])continue;
      let b=findBrickNear(level,anchor,hd.used);
      if(!b)b=injectBrick(level,anchor,hd.used,hd.breakableId);
      if(!b)continue;
      hd.assigned[anchor]=true;
      hd.used[b.key]=true;
      hd.bricks.push({anchor,tileX:b.x,tileY:b.y,revealed:false,collected:false,emerge:0,revealAt:0});
    }
  }

  function blueImage(){
    try{
      const src=window.Enjine&&Enjine.Resources&&Enjine.Resources.Images&&Enjine.Resources.Images.items;
      if(!src||!src.width||!src.height)return null;
      if(blueSprite&&blueSource===src)return blueSprite;
      const c=document.createElement("canvas");c.width=16;c.height=16;
      const ctx=c.getContext("2d",{willReadFrequently:true});ctx.imageSmoothingEnabled=false;
      ctx.drawImage(src,0,0,16,16,0,0,16,16);
      const im=ctx.getImageData(0,0,16,16),d=im.data;
      for(let i=0;i<d.length;i+=4){
        if(!d[i+3])continue;
        const lum=(d[i]+d[i+1]+d[i+2])/3;
        const k=Math.max(0,Math.min(1,lum/255));
        d[i]=Math.round(10+42*k);
        d[i+1]=Math.round(42+95*k);
        d[i+2]=Math.round(105+150*k);
      }
      ctx.putImageData(im,0,0);
      ctx.fillStyle="#09245f";
      ctx.fillRect(8,3,1,3);
      blueSprite=c;blueSource=src;
      return c;
    }catch(e){return null}
  }

  function powerWorldPos(b){
    const e=Math.max(0,Math.min(1,Number(b.emerge)||0));
    const eased=1-Math.pow(1-e,3);
    return {x:b.tileX*16+8,y:b.tileY*16+8-9*eased};
  }

  function touchPower(m,pos){
    if(!m)return false;
    const halfW=Math.max(4,Number(m.Width)||4)+7;
    const h=Math.max(12,Number(m.Height)||24)+7;
    const x=Number(m.X)||0,y=Number(m.Y)||0;
    return pos.x>=x-halfW&&pos.x<=x+halfW&&pos.y>=y-h&&pos.y<=y+7;
  }

  function triggerAnimation(){
    const el=document.getElementById("brunoHD");
    if(!el)return;
    el.classList.remove("bg-blue-pickup","bg-blue-pickup-v4");
    void el.offsetWidth;
    el.classList.add("bg-blue-pickup-v4");
    setTimeout(()=>el.classList.remove("bg-blue-pickup-v4"),1450);
  }

  function collectBlue(state,b){
    if(b.collected)return;
    b.collected=true;
    const data=state.__bgCollectibleData;
    data.__bgBlueCountV4=Math.max(0,Math.floor(Number(data.__bgBlueCountV4)||0))+1;
    data.powerRemaining=POWER_MS;
    window.__bgSuperJumpActive=true;
    window.__bgSuperJumpRemaining=POWER_MS;
    window.__bgBlueMushroomsCollected=data.__bgBlueCountV4;
    try{if(window.Enjine&&Enjine.Resources)Enjine.Resources.PlaySound("powerup")}catch(e){}
    triggerAnimation();
    try{
      if(window.Mario&&Mario.Sparkle&&typeof state.AddSprite==="function"){
        const m=player();
        for(let i=0;i<14;i++)state.AddSprite(new Mario.Sparkle(state,(m?m.X:0)+(Math.random()*26-13),(m?m.Y:0)+(Math.random()*30-20),Math.random()*2.6-1.3,Math.random()*-2.2,0,1,5));
      }
    }catch(e){}
    zeroUntil=0;
    lastRemaining=POWER_MS;
    publish(state);
  }

  function updateTimer(state){
    const data=state&&state.__bgCollectibleData;
    const timer=document.getElementById("bgJumpPowerTimer");
    if(!data||!timer)return;
    const rem=Math.max(0,Number(data.powerRemaining)||0);
    if(lastRemaining>0&&rem<=0)zeroUntil=performance.now()+850;
    lastRemaining=rem;
    if(rem>0){
      timer.style.display="block";
      timer.classList.add("bg-power-on");
      timer.textContent=`🔵 SALTO ×2  ${Math.ceil(rem/1000)}`;
    }else if(performance.now()<zeroUntil){
      timer.style.display="block";
      timer.classList.add("bg-power-on");
      timer.textContent="🔵 SALTO ×2  0";
    }else{
      timer.style.display="none";
      timer.classList.remove("bg-power-on");
    }
  }

  function normalizeEffects(state){
    const data=state&&state.__bgCollectibleData;
    if(!data)return;
    const donuts=Math.max(0,Math.floor(Number(data.donuts)||0));
    data.score=donuts*DONUT_VALUE;
    if(Array.isArray(data.effects))for(const fx of data.effects)if(fx&&fx.kind==="donut"&&fx.text==="+100")fx.text="+10";
  }

  function updateBlue(state,delta){
    prepareBricks(state);
    const hd=hiddenData(state),m=player();
    if(!hd)return;
    for(const b of hd.bricks){
      if(!b.revealed||b.collected)continue;
      b.emerge=Math.min(1,(Number(b.emerge)||0)+(Math.max(0,Number(delta)||0)*1000)/EMERGE_MS);
      const pos=powerWorldPos(b);
      if(b.emerge>.45&&touchPower(m,pos))collectBlue(state,b);
    }
    normalizeEffects(state);
    publish(state);
    updateTimer(state);
  }

  function drawBlue(state,ctx){
    const hd=hiddenData(state),img=blueImage();
    if(!hd||!img||!ctx||!state.Camera)return;
    ctx.save();ctx.imageSmoothingEnabled=false;
    const camX=Math.round(Number(state.Camera.X)||0),camY=Math.round(Number(state.Camera.Y)||0);
    for(const b of hd.bricks){
      if(!b.revealed||b.collected)continue;
      const p=powerWorldPos(b);
      const bob=b.emerge>=1?Math.round(Math.sin(performance.now()/180+b.anchor)*1):0;
      ctx.drawImage(img,Math.round(p.x-8-camX),Math.round(p.y-15+bob-camY),16,16);
    }
    ctx.restore();
  }

  function install(){
    if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;
    const p=Mario.LevelState.prototype;
    if(p.__bgBlueBrickScoreV4)return true;
    p.__bgBlueBrickScoreV4=true;

    const enter=p.Enter;
    p.Enter=function(){
      const r=enter.apply(this,arguments);
      try{
        const d=this.__bgCollectibleData;
        if(d){d.__bgBlueCountV4=0;d.__bgBlueHiddenV4=null}
        window.__bgBlueMushroomsCollected=0;
        zeroUntil=0;lastRemaining=0;
        prepareBricks(this);publish(this);updateTimer(this);
      }catch(e){}
      return r;
    };

    const bump=p.Bump;
    p.Bump=function(x,y,canBreak){
      try{prepareBricks(this)}catch(e){}
      let target=null;
      try{
        const hd=hiddenData(this);
        if(hd)target=hd.bricks.find(b=>!b.revealed&&!b.collected&&b.tileX===x&&b.tileY===y)||null;
      }catch(e){}
      const r=bump.apply(this,arguments);
      if(target&&!target.revealed){
        target.revealed=true;target.emerge=0;target.revealAt=performance.now();
        try{if(window.Enjine&&Enjine.Resources)Enjine.Resources.PlaySound("sprout")}catch(e){}
      }
      return r;
    };

    const update=p.Update;
    p.Update=function(delta){
      const r=update.apply(this,arguments);
      try{if(!window.__bgGameOverActive&&!window.__bgVictoryActive)updateBlue(this,delta)}catch(e){}
      return r;
    };

    const draw=p.Draw;
    p.Draw=function(ctx){
      const r=draw.apply(this,arguments);
      try{drawBlue(this,ctx)}catch(e){}
      return r;
    };

    return true;
  }

  if(!install()){
    const t=setInterval(()=>{if(install())clearInterval(t)},50);
    setTimeout(()=>clearInterval(t),10000);
  }

  window.__bgBlueBrickScore={
    powerSeconds:15,
    spacingMeters:150,
    donutValue:DONUT_VALUE,
    blueValue:BLUE_VALUE,
    get metrics(){return metrics(window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State)}
  };
})();
