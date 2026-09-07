(()=>{
  "use strict";
  if(window.__BG_BLUE_POWER_MARIO_STYLE_V5__)return;
  window.__BG_BLUE_POWER_MARIO_STYLE_V5__=true;

  const POWER_MS=15000;
  const POWER_SPACING=150;
  const DONUT_VALUE=10;
  const BLUE_VALUE=50;
  let zeroUntil=0;
  let lastRemaining=0;
  let blueSprite=null;
  let blueSource=null;
  let BlueMushroom=null;

  const style=document.createElement("style");
  style.id="bgBluePowerMarioStyleV5";
  style.textContent=`
    @keyframes bgBluePowerActiveV5{
      0%,100%{filter:brightness(1.05) saturate(1.15) drop-shadow(0 0 3px #3b8dff);opacity:1;scale:1}
      20%{filter:brightness(1.55) saturate(1.75) drop-shadow(0 0 8px #73c8ff);opacity:.9;scale:1.025}
      40%{filter:brightness(1.15) saturate(1.4) drop-shadow(0 0 12px #2c83ff);opacity:1;scale:1.05}
      60%{filter:brightness(1.75) saturate(1.95) drop-shadow(0 0 10px #d3f0ff);opacity:.88;scale:1.065}
      80%{filter:brightness(1.18) saturate(1.5) drop-shadow(0 0 12px #2b7dff);opacity:1;scale:1.035}
    }
    #brunoHD.bg-blue-power-active-v5{
      animation:bgBluePowerActiveV5 1.55s ease-in-out infinite!important;
      transform-origin:center bottom!important;
    }
    #bgJumpPowerTimer{
      z-index:420!important;
      right:16px!important;
      top:72px!important;
      min-width:164px!important;
      padding:10px 14px!important;
      border-radius:13px!important;
      border:2px solid rgba(205,235,255,.98)!important;
      background:linear-gradient(90deg,rgba(10,64,177,.98),rgba(26,126,246,.98))!important;
      box-shadow:0 0 0 2px rgba(45,132,255,.3),0 0 22px rgba(49,141,255,.58),0 7px 22px rgba(0,0,0,.42)!important;
      color:#fff!important;
      font-size:17px!important;
      font-weight:1000!important;
      letter-spacing:.035em!important;
      text-align:center!important;
      text-shadow:0 2px 3px rgba(0,0,0,.85)!important;
    }
    @media (max-width:1100px),(pointer:coarse){
      #bgJumpPowerTimer{right:8px!important;top:62px!important;min-width:142px!important;padding:8px 10px!important;font-size:15px!important}
    }
  `;
  document.head.appendChild(style);

  function player(){try{return window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.World?Mario.MarioCharacter:null}catch(e){return null}}
  function stateNow(){try{return window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State}catch(e){return null}}
  function distanceNow(){const m=player();return Math.max(0,Math.floor((Number(window.__bgRunMaxX)||Number(m&&m.X)||0)/16))}

  function blueCount(state){
    const d=state&&state.__bgCollectibleData;
    return Math.max(0,Math.floor(Number(d&&d.__bgBlueCountV5)||Number(window.__bgBlueMushroomsCollected)||0));
  }

  function metrics(state){
    const d=state&&state.__bgCollectibleData;
    const distance=distanceNow();
    const donuts=Math.max(0,Math.floor(Number(d&&d.donuts)||Number(window.__bgDonutsCollected)||0));
    const blues=blueCount(state);
    return {distance,donuts,blues,donutPoints:donuts*DONUT_VALUE,bluePoints:blues*BLUE_VALUE,total:distance+donuts*DONUT_VALUE+blues*BLUE_VALUE};
  }

  function publish(state){
    const m=metrics(state);
    window.__bgLastDistance=m.distance;window.__bgLastDonuts=m.donuts;window.__bgLastBlueMushrooms=m.blues;
    window.__bgLastDonutPoints=m.donutPoints;window.__bgLastBluePoints=m.bluePoints;window.__bgDonutScore=m.donutPoints;
    window.__bgBlueMushroomsCollected=m.blues;window.__bgCompositeScore=m.total;window.__bgLastScore=m.total;
    const hud=document.getElementById("bgDonutScoreHud");if(hud)hud.textContent=`🍩 ${m.donuts}  🔵 ${m.blues}  •  ${m.total} pts`;
    return m;
  }
  window.__bgRankingMetrics=()=>metrics(stateNow());

  function suppressLegacyPowers(state){
    const d=state&&state.__bgCollectibleData;if(!d||!Array.isArray(d.powers))return;
    for(const p of d.powers)if(p)p.taken=true;
  }

  function isBlocking(level,x,y){try{return !!level.IsBlocking(x,y,0,1)}catch(e){return false}}

  function findSpecialId(level){
    try{
      for(let x=0;x<(level.Width|0);x++)for(let y=1;y<(level.Height|0)-1;y++){
        const tile=level.GetBlock(x,y)&255,b=Mario.Tile.Behaviors[tile]||0;
        if((b&Mario.Tile.Bumpable)>0&&(b&Mario.Tile.Special)>0)return tile;
      }
    }catch(e){}
    return 0;
  }

  function findSurface(level,target){
    const w=level.Width|0,h=level.Height|0;
    for(let r=0;r<=40;r++){
      const xs=r===0?[target]:[target-r,target+r];
      for(const xx of xs){
        const x=Math.max(6,Math.min(w-7,xx|0));
        for(let y=3;y<h;y++)if(isBlocking(level,x,y)&&!isBlocking(level,x,y-1)&&!isBlocking(level,x,y-2)&&!isBlocking(level,x,y-3))return{x,y};
      }
    }
    return null;
  }

  function freeBlockSpot(level,target,used){
    for(let r=0;r<=28;r++){
      const xs=r===0?[target]:[target-r,target+r];
      for(const x of xs){
        if(x<6||x>=level.Width-6)continue;
        const s=findSurface(level,x);if(!s)continue;
        for(const up of [3,4]){
          const y=s.y-up,key=`${s.x},${y}`;
          if(y>1&&!used[key]&&!isBlocking(level,s.x,y)&&!isBlocking(level,s.x,y-1))return{x:s.x,y,key};
        }
      }
    }
    return null;
  }

  function hiddenData(state){
    const d=state&&state.__bgCollectibleData;if(!d)return null;
    if(!d.__bgBlueNativeV5)d.__bgBlueNativeV5={assigned:{},used:{},blocks:[],specialId:0,preparedWidth:0};
    if(!Number.isFinite(Number(d.__bgBlueCountV5)))d.__bgBlueCountV5=0;
    return d.__bgBlueNativeV5;
  }

  function prepareBlocks(state){
    const level=state&&state.Level,hd=hiddenData(state);if(!level||!hd)return;
    suppressLegacyPowers(state);
    if(!hd.specialId)hd.specialId=findSpecialId(level);
    if(!hd.specialId)return;
    const max=Math.floor((level.Width-12)/POWER_SPACING)*POWER_SPACING;
    for(let anchor=POWER_SPACING;anchor<=max;anchor+=POWER_SPACING){
      if(hd.assigned[anchor])continue;
      const spot=freeBlockSpot(level,anchor,hd.used);if(!spot)continue;
      try{
        level.SetBlock(spot.x,spot.y,hd.specialId);level.SetBlockData(spot.x,spot.y,0);
        hd.used[spot.key]=true;hd.assigned[anchor]=true;
        hd.blocks.push({anchor,tileX:spot.x,tileY:spot.y,revealed:false});
      }catch(e){}
    }
    hd.preparedWidth=level.Width|0;
  }

  function blueImage(){
    try{
      const src=window.Enjine&&Enjine.Resources&&Enjine.Resources.Images&&Enjine.Resources.Images.items;
      if(!src||!src.width||!src.height)return null;
      if(blueSprite&&blueSource===src)return blueSprite;
      const c=document.createElement("canvas");c.width=16;c.height=16;
      const ctx=c.getContext("2d",{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.drawImage(src,0,0,16,16,0,0,16,16);
      const im=ctx.getImageData(0,0,16,16),d=im.data;
      for(let i=0;i<d.length;i+=4){
        if(!d[i+3])continue;
        const lum=(d[i]+d[i+1]+d[i+2])/3,k=Math.max(0,Math.min(1,lum/255));
        d[i]=Math.round(8+38*k);d[i+1]=Math.round(36+100*k);d[i+2]=Math.round(105+150*k);
      }
      ctx.putImageData(im,0,0);ctx.fillStyle="#071e58";ctx.fillRect(8,2,1,4);
      blueSprite=c;blueSource=src;return c;
    }catch(e){return null}
  }

  function makeBlueClass(){
    if(BlueMushroom||!(window.Mario&&Mario.Mushroom&&Mario.Mushroom.prototype))return BlueMushroom;
    BlueMushroom=function(world,x,y){
      Mario.Mushroom.call(this,world,x,y);this.Image=blueImage()||this.Image;this.__bgBluePowerV5=true;
    };
    BlueMushroom.prototype=Object.create(Mario.Mushroom.prototype);BlueMushroom.prototype.constructor=BlueMushroom;
    BlueMushroom.prototype.CollideCheck=function(){
      const m=player();if(!m)return;
      const dx=m.X-this.X,dy=m.Y-this.Y;
      if(dx>-16&&dx<16&&dy>-this.Height&&dy<m.Height){collectBlue(this.World);this.World.RemoveSprite(this)}
    };
    window.__bgBlueMushroomClass=BlueMushroom;
    return BlueMushroom;
  }

  function syncPowerVisual(state){
    const d=state&&state.__bgCollectibleData,rem=Math.max(0,Number(d&&d.powerRemaining)||0),el=document.getElementById("brunoHD");
    if(el)el.classList.toggle("bg-blue-power-active-v5",rem>0);
    window.__bgSuperJumpActive=rem>0;window.__bgSuperJumpRemaining=rem;
  }

  function collectBlue(state){
    const d=state&&state.__bgCollectibleData;if(!d)return;
    d.__bgBlueCountV5=Math.max(0,Math.floor(Number(d.__bgBlueCountV5)||0))+1;d.powerRemaining=POWER_MS;
    zeroUntil=0;lastRemaining=POWER_MS;
    try{Enjine.Resources.PlaySound("powerup")}catch(e){}
    try{const m=player();for(let i=0;i<16;i++)state.AddSprite(new Mario.Sparkle(state,(m?m.X:0)+(Math.random()*28-14),(m?m.Y:0)+(Math.random()*34-22),Math.random()*2.6-1.3,Math.random()*-2.3,0,1,5))}catch(e){}
    syncPowerVisual(state);publish(state);updateTimer(state);
  }

  function updateTimer(state){
    const d=state&&state.__bgCollectibleData,timer=document.getElementById("bgJumpPowerTimer");if(!d||!timer)return;
    const rem=Math.max(0,Number(d.powerRemaining)||0);
    if(lastRemaining>0&&rem<=0)zeroUntil=performance.now()+900;lastRemaining=rem;
    if(rem>0){timer.style.display="block";timer.classList.add("bg-power-on");timer.textContent=`🔵 SALTO ×2   ${Math.ceil(rem/1000)}`}
    else if(performance.now()<zeroUntil){timer.style.display="block";timer.classList.add("bg-power-on");timer.textContent="🔵 SALTO ×2   0"}
    else{timer.style.display="none";timer.classList.remove("bg-power-on")}
  }

  function normalizeScore(state){
    const d=state&&state.__bgCollectibleData;if(!d)return;
    d.score=Math.max(0,Math.floor(Number(d.donuts)||0))*DONUT_VALUE;
    if(Array.isArray(d.effects))for(const fx of d.effects)if(fx&&fx.kind==="donut"&&fx.text==="+100")fx.text="+10";
  }

  function install(){
    if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype&&Mario.Mushroom))return false;
    makeBlueClass();const p=Mario.LevelState.prototype;if(p.__bgBlueNativeV5)return true;p.__bgBlueNativeV5=true;

    const enter=p.Enter;
    p.Enter=function(){
      const r=enter.apply(this,arguments);
      try{
        const d=this.__bgCollectibleData;if(d){d.__bgBlueCountV5=0;d.__bgBlueNativeV5=null}
        window.__bgBlueMushroomsCollected=0;zeroUntil=0;lastRemaining=0;
        const el=document.getElementById("brunoHD");if(el)el.classList.remove("bg-blue-power-active-v5");
        prepareBlocks(this);publish(this);updateTimer(this);
      }catch(e){}return r;
    };

    const bump=p.Bump;
    p.Bump=function(x,y,canBreak){
      try{prepareBlocks(this)}catch(e){}
      let target=null;
      try{const hd=hiddenData(this);if(hd)target=hd.blocks.find(b=>!b.revealed&&b.tileX===x&&b.tileY===y)||null}catch(e){}
      if(target){
        try{
          const tile=this.Level.GetBlock(x,y)&255,beh=Mario.Tile.Behaviors[tile]||0;
          if((beh&Mario.Tile.Bumpable)>0){
            this.BumpInto(x,y-1);this.Level.SetBlock(x,y,4);this.Level.SetBlockData(x,y,4);target.revealed=true;
            Enjine.Resources.PlaySound("sprout");const C=makeBlueClass();if(C)this.AddSprite(new C(this,x*16+8,y*16+8));
            return;
          }
        }catch(e){}
      }
      return bump.apply(this,arguments);
    };

    const update=p.Update;
    p.Update=function(delta){
      const r=update.apply(this,arguments);
      try{prepareBlocks(this);normalizeScore(this);syncPowerVisual(this);publish(this);updateTimer(this)}catch(e){}
      return r;
    };
    return true;
  }

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},50);setTimeout(()=>clearInterval(timer),10000);
  }

  window.__bgBluePowerV5={spacingMeters:POWER_SPACING,durationSeconds:15,points:BLUE_VALUE,get count(){return blueCount(stateNow())}};
})();
