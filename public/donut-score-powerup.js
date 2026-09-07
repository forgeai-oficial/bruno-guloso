(()=>{
  "use strict";
  if(window.__BG_DONUT_SCORE_POWERUP_V3__)return;
  window.__BG_DONUT_SCORE_POWERUP_V3__=true;

  const DONUT_POINTS=100;
  const POWER_MS=10000;
  const POWER_SPACING=150;
  const JUMP_FACTOR=Math.SQRT2;

  const style=document.createElement("style");
  style.id="bgDonutPowerStyleV3";
  style.textContent=`
    #bgDonutScoreHud,#bgJumpPowerTimer{
      position:fixed;pointer-events:none;display:none;
      font-family:Inter,system-ui,Segoe UI,sans-serif;font-weight:900;line-height:1;
      color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.9);
      background:rgba(7,14,34,.86);border:1px solid rgba(255,255,255,.24);
      box-shadow:0 5px 16px rgba(0,0,0,.28);backdrop-filter:blur(4px)
    }
    #bgDonutScoreHud{z-index:230;left:14px;top:66px;padding:7px 9px;border-radius:10px;font-size:12px}
    #bgJumpPowerTimer{
      z-index:245;right:12px;top:88px;min-width:126px;text-align:center;
      padding:7px 9px;border-radius:10px;font-size:12px;letter-spacing:.02em;
      background:linear-gradient(90deg,rgba(25,78,190,.94),rgba(31,119,235,.94));
      border-color:rgba(160,211,255,.72);box-shadow:0 0 0 1px rgba(45,132,255,.28),0 5px 18px rgba(0,0,0,.32)
    }
    body.bg-game-active #bgDonutScoreHud{display:block}
    @keyframes bgBluePickup{
      0%,100%{filter:none;opacity:1}
      15%{filter:brightness(1.8) saturate(1.8) drop-shadow(0 0 5px #69b9ff);opacity:.82}
      30%{filter:brightness(1.15) saturate(1.3) drop-shadow(0 0 9px #247dff);opacity:1}
      45%{filter:brightness(1.9) saturate(2) drop-shadow(0 0 7px #bde7ff);opacity:.76}
      65%{filter:brightness(1.2) saturate(1.45) drop-shadow(0 0 10px #2e87ff);opacity:1}
      82%{filter:brightness(1.65) saturate(1.8) drop-shadow(0 0 5px #8ed0ff);opacity:.88}
    }
    #brunoHD.bg-blue-pickup{animation:bgBluePickup .82s linear!important}
    @media (max-width:1100px),(pointer:coarse){
      #bgDonutScoreHud{left:8px;top:53px;padding:6px 8px;font-size:11px}
      #bgJumpPowerTimer{right:8px;top:72px;min-width:112px;padding:6px 8px;font-size:11px}
    }
  `;
  document.head.appendChild(style);

  let scoreHud=document.getElementById("bgDonutScoreHud");
  if(!scoreHud){scoreHud=document.createElement("div");scoreHud.id="bgDonutScoreHud";document.body.appendChild(scoreHud)}
  let timerHud=document.getElementById("bgJumpPowerTimer");
  if(!timerHud){timerHud=document.createElement("div");timerHud.id="bgJumpPowerTimer";document.body.appendChild(timerHud)}

  function sound(name){try{if(window.Enjine&&Enjine.Resources)Enjine.Resources.PlaySound(name)}catch(e){}}

  function freshData(){
    return {score:0,donuts:0,items:[],powers:[],effects:[],scannedWidth:0,powerRemaining:0,initialized:false,audit:null};
  }

  function rankingMetrics(){
    let distance=0;
    try{distance=Math.max(0,Math.floor((Number(window.__bgRunMaxX)||Number(Mario?.MarioCharacter?.X)||0)/16))}catch(e){}
    const donuts=Math.max(0,Math.floor(Number(window.__bgDonutsCollected)||0));
    const donutPoints=Math.max(0,Math.floor(Number(window.__bgDonutScore)||donuts*DONUT_POINTS));
    return {distance,donuts,donutPoints,total:distance+donutPoints};
  }

  function publishMetrics(){
    const m=rankingMetrics();
    window.__bgLastDistance=m.distance;
    window.__bgLastDonuts=m.donuts;
    window.__bgLastDonutPoints=m.donutPoints;
    window.__bgCompositeScore=m.total;
    return m;
  }

  function updateHud(data){
    scoreHud.textContent=`🍩 ${data.donuts} · +${String(data.score).padStart(5,"0")}`;
    if(data.powerRemaining>0){
      const left=(Math.max(0,data.powerRemaining)/1000).toFixed(1);
      timerHud.classList.add("bg-power-on");
      timerHud.textContent=`🔵 SALTO ×2  ${left}s`;
      timerHud.style.display="block";
    }else{
      timerHud.classList.remove("bg-power-on");
      timerHud.style.display="none";
    }
    publishMetrics();
  }

  function triggerPickupAnimation(){
    try{
      const el=document.getElementById("brunoHD");
      if(!el)return;
      el.classList.remove("bg-blue-pickup");
      void el.offsetWidth;
      el.classList.add("bg-blue-pickup");
      setTimeout(()=>el.classList.remove("bg-blue-pickup"),900);
    }catch(e){}
  }

  function isSolid(level,x,y){try{return !!level.IsBlocking(x,y,0,1)}catch(e){return false}}

  function findSurface(level,targetX){
    const width=level.Width|0,height=level.Height|0;
    for(let r=0;r<=48;r++){
      const tests=r===0?[targetX]:[targetX+r,targetX-r];
      for(const x0 of tests){
        const x=Math.max(5,Math.min(width-6,x0|0));
        for(let y=2;y<height;y++){
          if(isSolid(level,x,y)&&!isSolid(level,x,y-1)&&!isSolid(level,x,y-2))return {x:x*16+8,y:y*16-11,tileX:x,tileY:y};
        }
      }
    }
    return null;
  }

  function auditBreakables(state){
    const level=state&&state.Level;if(!level||!window.Mario)return null;
    const ids={},coords=[];
    for(let x=0;x<(level.Width|0);x++)for(let y=0;y<(level.Height|0);y++){
      const tile=level.GetBlock(x,y)&255,behavior=Mario.Tile.Behaviors[tile]||0;
      if((behavior&Mario.Tile.Breakable)>0){ids[tile]=(ids[tile]||0)+1;if(coords.length<80)coords.push([x,y,tile])}
    }
    const audit={width:level.Width|0,total:Object.values(ids).reduce((a,b)=>a+b,0),ids,examples:coords};
    state.__bgBreakableAudit=audit;window.__bgBlockAudit=audit;return audit;
  }

  function processDonuts(state,fromX,toX){
    const level=state.Level;if(!level)return;
    const data=state.__bgCollectibleData;let added=0;
    const start=Math.max(0,fromX|0),end=Math.min(level.Width|0,toX|0);
    for(let x=start;x<end;x++)for(let y=0;y<(level.Height|0);y++){
      const tile=level.GetBlock(x,y)&255,behavior=Mario.Tile.Behaviors[tile]||0;
      if((behavior&Mario.Tile.PickUpable)>0){
        data.items.push({x:x*16+8,y:y*16+8,taken:false,phase:(x*13+y*7)%31});
        level.SetBlock(x,y,0);try{level.SetBlockData(x,y,0)}catch(e){}added++;
      }
    }
    if(added<4){
      const first=Math.max(start+55,75);
      for(let x=first;x<end-35;x+=115){const p=findSurface(level,x);if(p)data.items.push({x:p.x,y:p.y-16,taken:false,phase:x%29})}
    }
  }

  function powerAnchorsForRange(start,end){
    const out=[];
    const first=Math.max(POWER_SPACING,Math.ceil(Math.max(start,POWER_SPACING)/POWER_SPACING)*POWER_SPACING);
    for(let a=first;a<end;a+=POWER_SPACING)out.push(a);
    return out;
  }

  function processPowers(state,fromX,toX){
    const level=state.Level,data=state.__bgCollectibleData;if(!level)return;
    const start=Math.max(0,fromX|0),end=Math.min(level.Width|0,toX|0);
    for(const anchor of powerAnchorsForRange(start,end)){
      const p=findSurface(level,anchor);
      if(p&&!data.powers.some(q=>q.anchor===anchor))data.powers.push({x:p.x,y:p.y-3,taken:false,phase:anchor%37,anchor});
    }
  }

  function ensurePrepared(state,reset=false){
    if(!state||!state.Level)return null;
    if(reset||!state.__bgCollectibleData){
      state.__bgCollectibleData=freshData();window.__bgDonutScore=0;window.__bgDonutsCollected=0;
      window.__bgSuperJumpActive=false;window.__bgSuperJumpRemaining=0;timerHud.style.display="none";
    }
    const data=state.__bgCollectibleData,width=state.Level.Width|0;
    if(width>data.scannedWidth){
      const from=data.scannedWidth;processDonuts(state,from,width);processPowers(state,from,width);data.scannedWidth=width;auditBreakables(state);
    }
    data.initialized=true;updateHud(data);return data;
  }

  function playerCenter(){
    const m=window.Mario&&Mario.MarioCharacter;if(!m)return null;
    return {m,x:Number(m.X||0),y:Number(m.Y||0)-Number(m.Height||12)/2};
  }

  function addEffect(data,x,y,text="+100",kind="donut"){data.effects.push({x,y,text,kind,life:620,max:620})}

  function awardDonut(state,x,y,withSound=true){
    const data=ensurePrepared(state,false);if(!data)return;
    data.donuts++;data.score+=DONUT_POINTS;
    window.__bgDonutScore=data.score;window.__bgDonutsCollected=data.donuts;
    addEffect(data,x,y,"+100","donut");if(withSound)sound("coin");updateHud(data);
  }

  function collect(state,data){
    const p=playerCenter();if(!p||p.m.DeathTime>0||p.m.WinTime>0)return;
    for(const item of data.items){
      if(item.taken)continue;
      if(Math.abs(p.x-item.x)<=12&&Math.abs(p.y-item.y)<=14){
        item.taken=true;awardDonut(state,item.x,item.y,true);
        try{for(let i=0;i<4;i++)state.AddSprite(new Mario.Sparkle(state,item.x-5+i*3,item.y-4,(i-1.5)*.35,-1.5,0,1,5))}catch(e){}
      }
    }
    for(const power of data.powers){
      if(power.taken)continue;
      if(Math.abs(p.x-power.x)<=14&&Math.abs(p.y-power.y)<=17){
        power.taken=true;data.powerRemaining=POWER_MS;
        window.__bgSuperJumpActive=true;window.__bgSuperJumpRemaining=POWER_MS;
        addEffect(data,power.x,power.y,"SALTO ×2","power");sound("powerup");triggerPickupAnimation();
        try{for(let i=0;i<10;i++)state.AddSprite(new Mario.Sparkle(state,p.x+(Math.random()*20-10),p.y+(Math.random()*24-12),Math.random()*2-1,Math.random()*-2,0,1,5))}catch(e){}
        updateHud(data);
      }
    }
  }

  function drawDonut(ctx,x,y,t,scale=1){
    const bob=Math.round(Math.sin(t+performance.now()/190));
    ctx.save();ctx.translate(Math.round(x),Math.round(y+bob));ctx.scale(scale,scale);
    ctx.fillStyle="#4b2415";
    ctx.fillRect(-3,-6,7,1);ctx.fillRect(-5,-5,11,1);ctx.fillRect(-6,-4,13,8);ctx.fillRect(-5,4,11,1);ctx.fillRect(-3,5,7,1);
    ctx.fillStyle="#c77932";
    ctx.fillRect(-3,-5,7,1);ctx.fillRect(-5,-4,11,2);ctx.fillRect(-5,-2,11,6);ctx.fillRect(-3,4,7,1);
    ctx.fillStyle="#e5a04e";
    ctx.fillRect(-4,-4,4,1);ctx.fillRect(-5,1,2,2);ctx.fillRect(3,2,2,1);ctx.fillRect(-2,4,4,1);
    ctx.fillStyle="#ed659f";
    ctx.fillRect(-3,-5,7,1);ctx.fillRect(-5,-4,11,1);ctx.fillRect(-5,-3,11,2);ctx.fillRect(-4,-1,9,2);ctx.fillRect(-3,1,7,1);
    ctx.fillStyle="#ff9cc7";
    ctx.fillRect(-3,-4,3,1);ctx.fillRect(2,-3,2,1);ctx.fillRect(-4,-1,2,1);
    ctx.fillStyle="#542718";ctx.fillRect(-2,-2,4,4);ctx.fillStyle="#28120c";ctx.fillRect(-1,-1,2,2);
    ctx.fillStyle="#fff0a0";ctx.fillRect(-4,-2,1,1);ctx.fillRect(4,-2,1,1);ctx.fillRect(3,1,1,1);
    ctx.fillStyle="#62d8ff";ctx.fillRect(-2,2,1,1);ctx.fillRect(1,-4,1,1);
    ctx.fillStyle="#8a3e24";ctx.fillRect(-4,3,2,1);ctx.fillRect(2,4,2,1);
    ctx.restore();
  }

  let blueSprite=null,blueSpriteSource=null;
  function ensureBlueSprite(){
    try{
      const src=window.Enjine&&Enjine.Resources&&Enjine.Resources.Images&&Enjine.Resources.Images.items;
      if(!src||!src.width||!src.height)return null;
      if(blueSprite&&blueSpriteSource===src)return blueSprite;
      const c=document.createElement("canvas");c.width=16;c.height=16;
      const x=c.getContext("2d",{willReadFrequently:true});x.imageSmoothingEnabled=false;x.drawImage(src,0,0,16,16,0,0,16,16);
      const im=x.getImageData(0,0,16,16),d=im.data;
      for(let py=0;py<=9;py++)for(let px=0;px<16;px++){
        const i=(py*16+px)*4,r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];if(!a)continue;
        const max=Math.max(r,g,b),min=Math.min(r,g,b),lum=(r+g+b)/3;
        if(max-min<18&&lum>150)continue;
        if(lum<62)continue;
        const k=Math.max(0,Math.min(1,(lum-62)/193));
        d[i]=Math.round(28+58*k);d[i+1]=Math.round(78+92*k);d[i+2]=Math.round(165+90*k);
      }
      x.putImageData(im,0,0);
      x.fillStyle="#12316f";x.fillRect(8,3,1,3);
      blueSprite=c;blueSpriteSource=src;return c;
    }catch(e){return null}
  }

  function drawPower(ctx,x,y,t){
    const bob=Math.round(Math.sin(t+performance.now()/205));
    const sprite=ensureBlueSprite();
    ctx.save();ctx.imageSmoothingEnabled=false;
    if(sprite)ctx.drawImage(sprite,Math.round(x)-8,Math.round(y+bob)-8,16,16);
    else{
      ctx.translate(Math.round(x),Math.round(y+bob));
      ctx.fillStyle="#16316d";ctx.fillRect(-4,-7,8,1);ctx.fillRect(-6,-6,12,2);ctx.fillRect(-7,-4,14,5);
      ctx.fillStyle="#3479ed";ctx.fillRect(-5,-5,10,5);ctx.fillStyle="#fff7df";ctx.fillRect(-3,-4,2,2);ctx.fillRect(2,-3,2,2);
      ctx.fillStyle="#ead9b4";ctx.fillRect(-3,1,6,5);ctx.fillStyle="#12316f";ctx.fillRect(0,-5,1,3);
    }
    ctx.restore();
  }

  function drawEffects(ctx,data){
    for(const fx of data.effects){
      const k=1-fx.life/fx.max,alpha=Math.max(0,fx.life/fx.max);
      ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(fx.x),Math.round(fx.y-10-k*16));
      ctx.font="bold 7px monospace";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle=fx.kind==="power"?"#dff1ff":"#fff0a8";ctx.fillText(fx.text,0,0);ctx.restore();
    }
  }

  function drawWorld(ctx,state){
    const data=state&&state.__bgCollectibleData;if(!data)return;
    for(const item of data.items)if(!item.taken)drawDonut(ctx,item.x,item.y,item.phase,1);
    for(const power of data.powers)if(!power.taken)drawPower(ctx,power.x,power.y,power.phase);
    drawEffects(ctx,data);
  }

  function installCoinAnim(){
    if(!(window.Mario&&Mario.CoinAnim&&Mario.CoinAnim.prototype))return;
    if(Mario.CoinAnim.prototype.__bgDonutDrawV3)return;
    Mario.CoinAnim.prototype.__bgDonutDrawV3=true;
    Mario.CoinAnim.prototype.Draw=function(ctx,cam){
      if(!ctx||this.Visible===false)return;
      let x=(typeof this.GetX==="function"?this.GetX(this.Delta):this.X)+8;
      let y=(typeof this.GetY==="function"?this.GetY(this.Delta):this.Y)+8;
      if(cam){x=Math.round(x-Number(cam.X||0))+Number(cam.X||0);y=Math.round(y-Number(cam.Y||0))+Number(cam.Y||0)}
      drawDonut(ctx,x,y,0,1);
    };
  }

  function installCharacterHooks(){
    if(!(window.Mario&&Mario.Character&&Mario.Character.prototype))return;
    const cp=Mario.Character.prototype;
    if(!cp.__bgDonutGetCoinV3){
      cp.__bgDonutGetCoinV3=true;const originalGetCoin=cp.GetCoin;
      cp.GetCoin=function(){const r=originalGetCoin.apply(this,arguments);try{if(this.World)awardDonut(this.World,Number(this.X||0),Number(this.Y||0)-18,false)}catch(e){}return r};
    }
    if(!cp.__bgSuperJumpMoveV3){
      cp.__bgSuperJumpMoveV3=true;const originalMove=cp.Move;
      cp.Move=function(){
        const wasGround=!!this.OnGround,r=originalMove.apply(this,arguments);
        try{
          const st=this.World,data=st&&st.__bgCollectibleData;
          if(data&&data.powerRemaining>0&&wasGround&&Number(this.Ya)<0&&Number(this.JumpTime)>0&&!this.__bgPoweredThisJump){
            this.__bgPoweredThisJump=true;if(Number(this.YJumpSpeed)<0)this.YJumpSpeed*=JUMP_FACTOR;this.Ya*=JUMP_FACTOR;
          }
          if(this.OnGround||Number(this.Ya)>=0)this.__bgPoweredThisJump=false;
        }catch(e){}
        return r;
      };
    }
  }

  function installLevelHooks(){
    if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;
    const proto=Mario.LevelState.prototype;if(proto.__bgDonutPowerV3)return true;proto.__bgDonutPowerV3=true;
    const originalEnter=proto.Enter;
    proto.Enter=function(){const r=originalEnter.apply(this,arguments);ensurePrepared(this,true);return r};

    const originalBump=proto.Bump;
    proto.Bump=function(x,y,canBreak){
      let tile=0,behavior=0,isBreakable=false,isBumpable=false,isSpecial=false;
      try{tile=this.Level.GetBlock(x,y)&255;behavior=Mario.Tile.Behaviors[tile]||0;isBreakable=(behavior&Mario.Tile.Breakable)>0;isBumpable=(behavior&Mario.Tile.Bumpable)>0;isSpecial=(behavior&Mario.Tile.Special)>0}catch(e){}
      const r=originalBump.call(this,x,y,isBreakable?true:canBreak);
      try{
        if(isBreakable&&(this.Level.GetBlock(x,y)&255)===0){awardDonut(this,x*16+8,y*16+8,true);addEffect(this.__bgCollectibleData,x*16+8,y*16+8,"🍩","donut")}
        if(isBumpable&&!isSpecial)updateHud(ensurePrepared(this,false));
      }catch(e){}
      return r;
    };

    const originalUpdate=proto.Update;
    proto.Update=function(delta){
      const r=originalUpdate.apply(this,arguments),data=ensurePrepared(this,false);if(!data)return r;
      const running=!window.__bgPaused&&!window.__bgGameOverActive&&!window.__bgVictoryActive&&!this.Paused;
      if(running){
        collect(this,data);const ms=Math.max(0,Number(delta)||0)*1000;
        for(const fx of data.effects)fx.life-=ms;data.effects=data.effects.filter(f=>f.life>0);
        if(data.powerRemaining>0){
          data.powerRemaining=Math.max(0,data.powerRemaining-ms);window.__bgSuperJumpRemaining=data.powerRemaining;
          if(data.powerRemaining<=0){window.__bgSuperJumpActive=false;window.__bgSuperJumpRemaining=0}
        }
      }
      updateHud(data);return r;
    };

    const originalDraw=proto.Draw;
    proto.Draw=function(ctx){
      const r=originalDraw.apply(this,arguments),data=ensurePrepared(this,false);
      if(data&&ctx&&this.Camera){ctx.save();ctx.translate(-Math.round(Number(this.Camera.X||0)),-Math.round(Number(this.Camera.Y||0)));drawWorld(ctx,this);ctx.restore()}
      return r;
    };
    return true;
  }

  function syncCompositeLocal(){
    if(window.__bgTestRun)return;
    try{
      const name=String(localStorage.getItem("bruno_guloso_player_name")||"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,16);if(!name)return;
      const m=publishMetrics();if(m.total<=0)return;
      window.__bgLastScore=m.total;
      const key="bruno_guloso_local_board",board=JSON.parse(localStorage.getItem(key)||"{}")||{};
      let existing=Object.keys(board).find(k=>String(k).toLocaleLowerCase()===name.toLocaleLowerCase())||name;
      if(m.total>Number(board[existing]&&board[existing].score||0))board[existing]={score:m.total,distance:m.distance,donuts:m.donuts,when:Date.now()};
      localStorage.setItem(key,JSON.stringify(board));
    }catch(e){}
  }

  function installCompositeObservers(){
    const go=document.getElementById("gameOverOverlay");
    if(go&&!go.__bgCompositeObserved){go.__bgCompositeObserved=true;new MutationObserver(()=>{if(go.style.display==="grid")setTimeout(syncCompositeLocal,0)}).observe(go,{attributes:true,attributeFilter:["style"]})}
    const win=document.getElementById("bgVictoryOverlay");
    if(win&&!win.__bgCompositeObserved){win.__bgCompositeObserved=true;new MutationObserver(()=>{if(win.classList.contains("show"))setTimeout(syncCompositeLocal,0)}).observe(win,{attributes:true,attributeFilter:["class"]})}
  }

  function installAll(){
    if(!(window.Mario&&window.Enjine))return false;
    installCoinAnim();installCharacterHooks();installCompositeObservers();return installLevelHooks();
  }

  if(!installAll()){
    const timer=setInterval(()=>{installCompositeObservers();if(installAll())clearInterval(timer)},50);setTimeout(()=>clearInterval(timer),10000);
  }
  setTimeout(installCompositeObservers,300);

  window.__bgRankingMetrics=rankingMetrics;
  window.__bgCollectibles={
    drawWorld,
    get score(){return Number(window.__bgDonutScore||0)},
    get donuts(){return Number(window.__bgDonutsCollected||0)},
    get superJump(){return !!window.__bgSuperJumpActive},
    get blockAudit(){return window.__bgBlockAudit||null},
    get ranking(){return rankingMetrics()}
  };
})();