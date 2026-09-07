(()=>{
  "use strict";
  if(window.__BG_DONUT_SCORE_POWERUP__)return;
  window.__BG_DONUT_SCORE_POWERUP__=true;

  const DONUT_POINTS=100;
  const POWER_MS=10000;
  const JUMP_FACTOR=Math.SQRT2;

  const style=document.createElement("style");
  style.id="bgDonutPowerStyle";
  style.textContent=`
    #bgDonutScoreHud,#bgJumpPowerTimer{
      position:fixed;z-index:146;pointer-events:none;display:none;
      font-family:Inter,system-ui,Segoe UI,sans-serif;
      font-weight:900;line-height:1;
      color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.8);
      background:rgba(7,14,34,.76);
      border:1px solid rgba(255,255,255,.18);
      box-shadow:0 4px 14px rgba(0,0,0,.18);
      backdrop-filter:blur(4px);
    }
    #bgDonutScoreHud{
      left:14px;top:66px;padding:7px 9px;border-radius:10px;font-size:12px;
    }
    #bgJumpPowerTimer{
      right:14px;top:66px;padding:6px 8px;border-radius:9px;font-size:11px;
      background:linear-gradient(90deg,rgba(170,30,48,.80),rgba(25,72,170,.80));
    }
    body.bg-game-active #bgDonutScoreHud{display:block}
    body.bg-game-active #bgJumpPowerTimer.bg-power-on{display:block}
    @media (max-width:1100px),(pointer:coarse){
      #bgDonutScoreHud{left:8px;top:53px;padding:6px 8px;font-size:11px}
      #bgJumpPowerTimer{right:8px;top:53px;padding:5px 7px;font-size:10px}
    }
  `;
  document.head.appendChild(style);

  const scoreHud=document.createElement("div");
  scoreHud.id="bgDonutScoreHud";
  scoreHud.textContent="🍩 0 · 000000";
  document.body.appendChild(scoreHud);

  const timerHud=document.createElement("div");
  timerHud.id="bgJumpPowerTimer";
  timerHud.textContent="🍄 SALTO ×2 10.0s";
  document.body.appendChild(timerHud);

  function freshData(){
    return {
      score:0,
      donuts:0,
      items:[],
      powers:[],
      scannedWidth:0,
      powerRemaining:0,
      lastJumpCount:Number(window.__jo2JumpCount||0),
      initialized:false
    };
  }

  function updateHud(data){
    scoreHud.textContent=`🍩 ${data.donuts} · ${String(data.score).padStart(6,"0")}`;
    if(data.powerRemaining>0){
      timerHud.classList.add("bg-power-on");
      timerHud.textContent=`🍄 SALTO ×2 ${(Math.max(0,data.powerRemaining)/1000).toFixed(1)}s`;
    }else{
      timerHud.classList.remove("bg-power-on");
    }
  }

  function isSolid(level,x,y){
    try{return !!level.IsBlocking(x,y,0,1)}catch(e){return false}
  }

  function findSurface(level,targetX){
    const width=level.Width|0;
    const height=level.Height|0;
    for(let r=0;r<=34;r++){
      const tests=r===0?[targetX]:[targetX+r,targetX-r];
      for(const x0 of tests){
        const x=Math.max(4,Math.min(width-5,x0|0));
        for(let y=2;y<height;y++){
          if(isSolid(level,x,y)&&!isSolid(level,x,y-1)&&!isSolid(level,x,y-2)){
            return {x:x*16+8,y:y*16-9};
          }
        }
      }
    }
    return null;
  }

  function processDonuts(state,fromX,toX){
    const level=state.Level;
    if(!level)return;
    const data=state.__bgCollectibleData;
    let added=0;
    const start=Math.max(0,fromX|0);
    const end=Math.min(level.Width|0,toX|0);
    for(let x=start;x<end;x++){
      for(let y=0;y<(level.Height|0);y++){
        const tile=level.GetBlock(x,y)&255;
        const behavior=Mario.Tile.Behaviors[tile]||0;
        if((behavior&Mario.Tile.PickUpable)>0){
          data.items.push({x:x*16+8,y:y*16+8,taken:false,phase:(x*13+y*7)%31});
          level.SetBlock(x,y,0);
          try{level.SetBlockData(x,y,0)}catch(e){}
          added++;
        }
      }
    }

    // Safety fallback: if a long section happened to have almost no native
    // collectables, add sparse donuts over safe ground so the mechanic is visible.
    if(added<4){
      const first=Math.max(start+60,80);
      for(let x=first;x<end-40;x+=140){
        const p=findSurface(level,x);
        if(p)data.items.push({x:p.x,y:p.y-13,taken:false,phase:x%29});
      }
    }
  }

  function processPowers(state,fromX,toX){
    const level=state.Level;
    const data=state.__bgCollectibleData;
    if(!level)return;
    const start=Math.max(0,fromX|0);
    const end=Math.min(level.Width|0,toX|0);

    // Roughly one rare power-up each ~1100 m. Deterministic positions.
    for(let anchor=420;anchor<end;anchor+=1100){
      if(anchor<start)continue;
      const p=findSurface(level,anchor);
      if(p)data.powers.push({x:p.x,y:p.y,taken:false,phase:anchor%37});
    }
  }

  function ensurePrepared(state,reset=false){
    if(!state||!state.Level)return null;
    if(reset||!state.__bgCollectibleData){
      state.__bgCollectibleData=freshData();
      window.__bgDonutScore=0;
      window.__bgDonutsCollected=0;
    }
    const data=state.__bgCollectibleData;
    const width=state.Level.Width|0;
    if(width>data.scannedWidth){
      const from=data.scannedWidth;
      processDonuts(state,from,width);
      processPowers(state,from,width);
      data.scannedWidth=width;
    }
    data.initialized=true;
    updateHud(data);
    return data;
  }

  function playerCenter(){
    const m=window.Mario&&Mario.MarioCharacter;
    if(!m)return null;
    return {m,x:Number(m.X||0),y:Number(m.Y||0)-Number(m.Height||12)/2};
  }

  function collect(state,data){
    const p=playerCenter();
    if(!p||p.m.DeathTime>0||p.m.WinTime>0)return;

    for(const item of data.items){
      if(item.taken)continue;
      if(Math.abs(p.x-item.x)<=12&&Math.abs(p.y-item.y)<=14){
        item.taken=true;
        data.donuts++;
        data.score+=DONUT_POINTS;
        window.__bgDonutScore=data.score;
        window.__bgDonutsCollected=data.donuts;
      }
    }

    for(const power of data.powers){
      if(power.taken)continue;
      if(Math.abs(p.x-power.x)<=14&&Math.abs(p.y-power.y)<=16){
        power.taken=true;
        data.powerRemaining=POWER_MS;
        window.__bgSuperJumpActive=true;
        window.__bgSuperJumpRemaining=POWER_MS;
      }
    }
  }

  function drawDonut(ctx,x,y,t){
    const bob=Math.round(Math.sin((t+performance.now()/180))*1.2);
    y+=bob;
    ctx.save();
    ctx.translate(Math.round(x),Math.round(y));
    ctx.fillStyle="#5b2a18";
    ctx.fillRect(-5,-6,10,12);ctx.fillRect(-6,-5,12,10);
    ctx.fillStyle="#d88b38";
    ctx.fillRect(-4,-5,8,10);ctx.fillRect(-5,-4,10,8);
    ctx.fillStyle="#ef6ea8";
    ctx.fillRect(-4,-4,8,3);ctx.fillRect(-5,-2,10,3);
    ctx.fillStyle="#6e301c";
    ctx.fillRect(-2,-2,4,5);
    ctx.fillStyle="#fff1a8";
    ctx.fillRect(-3,-3,1,1);ctx.fillRect(3,-2,1,1);ctx.fillRect(1,1,1,1);
    ctx.restore();
  }

  function drawPower(ctx,x,y,t){
    const bob=Math.round(Math.sin((t+performance.now()/210))*1.2);
    y+=bob;
    ctx.save();
    ctx.translate(Math.round(x),Math.round(y));
    // dark outline
    ctx.fillStyle="#2b1731";
    ctx.fillRect(-5,-7,10,2);ctx.fillRect(-7,-5,14,5);ctx.fillRect(-5,0,10,3);
    // red left half / blue right half
    ctx.fillStyle="#d93645";ctx.fillRect(-6,-5,6,5);ctx.fillRect(-4,-6,4,2);
    ctx.fillStyle="#2f69d9";ctx.fillRect(0,-5,6,5);ctx.fillRect(0,-6,4,2);
    ctx.fillStyle="#f4f0dc";ctx.fillRect(-2,-4,2,2);ctx.fillRect(2,-3,2,2);
    // stem
    ctx.fillStyle="#e8d5aa";ctx.fillRect(-3,0,6,5);
    ctx.fillStyle="#9b6f4f";ctx.fillRect(-2,2,1,2);ctx.fillRect(1,2,1,2);
    ctx.restore();
  }

  function drawWorld(ctx,state){
    const data=state&&state.__bgCollectibleData;
    if(!data)return;
    for(const item of data.items)if(!item.taken)drawDonut(ctx,item.x,item.y,item.phase);
    for(const power of data.powers)if(!power.taken)drawPower(ctx,power.x,power.y,power.phase);
  }

  function install(){
    if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;
    const proto=Mario.LevelState.prototype;
    if(proto.__bgDonutPowerInstalled)return true;
    proto.__bgDonutPowerInstalled=true;

    const originalEnter=proto.Enter;
    proto.Enter=function(){
      const result=originalEnter.apply(this,arguments);
      ensurePrepared(this,true);
      return result;
    };

    const originalUpdate=proto.Update;
    proto.Update=function(delta){
      const beforeJump=Number(window.__jo2JumpCount||0);
      const result=originalUpdate.apply(this,arguments);
      const data=ensurePrepared(this,false);
      if(!data)return result;

      const running=!window.__bgPaused&&!window.__bgGameOverActive&&!window.__bgVictoryActive&&!this.Paused;
      if(running){
        collect(this,data);
        if(data.powerRemaining>0){
          data.powerRemaining=Math.max(0,data.powerRemaining-Math.max(0,Number(delta)||0)*1000);
          window.__bgSuperJumpRemaining=data.powerRemaining;
          if(data.powerRemaining<=0)window.__bgSuperJumpActive=false;
        }
      }

      const afterJump=Number(window.__jo2JumpCount||0);
      if(data.powerRemaining>0&&afterJump>beforeJump&&Mario.MarioCharacter){
        const m=Mario.MarioCharacter;
        if(Number(m.YJumpSpeed)<0)m.YJumpSpeed*=JUMP_FACTOR;
        if(Number(m.Ya)<0)m.Ya*=JUMP_FACTOR;
      }
      data.lastJumpCount=afterJump;
      updateHud(data);
      return result;
    };

    const originalDraw=proto.Draw;
    proto.Draw=function(ctx){
      const result=originalDraw.apply(this,arguments);
      const data=ensurePrepared(this,false);
      if(data&&ctx&&this.Camera){
        ctx.save();
        ctx.translate(-this.Camera.X,-this.Camera.Y);
        drawWorld(ctx,this);
        ctx.restore();
      }
      return result;
    };

    return true;
  }

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},50);
    setTimeout(()=>clearInterval(timer),10000);
  }

  window.__bgCollectibles={
    drawWorld,
    get score(){return Number(window.__bgDonutScore||0)},
    get donuts(){return Number(window.__bgDonutsCollected||0)},
    get superJump(){return !!window.__bgSuperJumpActive}
  };
})();
