(()=>{
  "use strict";
  if(window.__BG_DONUT_SCORE_POWERUP_V2__)return;
  window.__BG_DONUT_SCORE_POWERUP_V2__=true;

  const DONUT_POINTS=100;
  const POWER_MS=10000;
  // With the existing gravity, sqrt(2) on launch velocity gives ~2x jump height.
  const JUMP_FACTOR=Math.SQRT2;

  const style=document.createElement("style");
  style.id="bgDonutPowerStyleV2";
  style.textContent=`
    #bgDonutScoreHud,#bgJumpPowerTimer{
      position:fixed;z-index:146;pointer-events:none;display:none;
      font-family:Inter,system-ui,Segoe UI,sans-serif;font-weight:900;line-height:1;
      color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.85);
      background:rgba(7,14,34,.78);border:1px solid rgba(255,255,255,.18);
      box-shadow:0 4px 14px rgba(0,0,0,.18);backdrop-filter:blur(4px)
    }
    #bgDonutScoreHud{left:14px;top:66px;padding:7px 9px;border-radius:10px;font-size:12px}
    #bgJumpPowerTimer{
      right:14px;top:66px;padding:6px 8px;border-radius:9px;font-size:11px;
      background:linear-gradient(90deg,rgba(185,34,48,.84),rgba(33,91,210,.84))
    }
    body.bg-game-active #bgDonutScoreHud{display:block}
    body.bg-game-active #bgJumpPowerTimer.bg-power-on{display:block}
    @media (max-width:1100px),(pointer:coarse){
      #bgDonutScoreHud{left:8px;top:53px;padding:6px 8px;font-size:11px}
      #bgJumpPowerTimer{right:8px;top:53px;padding:5px 7px;font-size:10px}
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

  function updateHud(data){
    scoreHud.textContent=`🍩 ${data.donuts} · ${String(data.score).padStart(6,"0")}`;
    if(data.powerRemaining>0){
      timerHud.classList.add("bg-power-on");
      timerHud.textContent=`🍄 SALTO ×2 ${(Math.max(0,data.powerRemaining)/1000).toFixed(1)}s`;
    }else timerHud.classList.remove("bg-power-on");
  }

  function isSolid(level,x,y){try{return !!level.IsBlocking(x,y,0,1)}catch(e){return false}}

  function findSurface(level,targetX){
    const width=level.Width|0,height=level.Height|0;
    for(let r=0;r<=48;r++){
      const tests=r===0?[targetX]:[targetX+r,targetX-r];
      for(const x0 of tests){
        const x=Math.max(5,Math.min(width-6,x0|0));
        for(let y=2;y<height;y++){
          if(isSolid(level,x,y)&&!isSolid(level,x,y-1)&&!isSolid(level,x,y-2)){
            return {x:x*16+8,y:y*16-11,tileX:x,tileY:y};
          }
        }
      }
    }
    return null;
  }

  function auditBreakables(state){
    const level=state&&state.Level;if(!level||!window.Mario)return null;
    const ids={},coords=[];
    for(let x=0;x<(level.Width|0);x++)for(let y=0;y<(level.Height|0);y++){
      const tile=level.GetBlock(x,y)&255;
      const behavior=Mario.Tile.Behaviors[tile]||0;
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
    // Keep Mario-like paths populated even in a sparse generated section.
    if(added<4){
      const first=Math.max(start+55,75);
      for(let x=first;x<end-35;x+=115){
        const p=findSurface(level,x);if(p)data.items.push({x:p.x,y:p.y-16,taken:false,phase:x%29});
      }
    }
  }

  function powerAnchorsForRange(start,end){
    const out=[];
    // First one is deliberately early so the mechanic is visible/testable.
    const anchors=[150,650,1250,1950,2750,3650,4550,5450,6150];
    for(const a of anchors)if(a>=start&&a<end)out.push(a);
    return out;
  }

  function processPowers(state,fromX,toX){
    const level=state.Level,data=state.__bgCollectibleData;if(!level)return;
    const start=Math.max(0,fromX|0),end=Math.min(level.Width|0,toX|0);
    for(const anchor of powerAnchorsForRange(start,end)){
      const p=findSurface(level,anchor);
      if(p&&!data.powers.some(q=>Math.abs(q.x-p.x)<8))data.powers.push({x:p.x,y:p.y-3,taken:false,phase:anchor%37,anchor});
    }
  }

  function ensurePrepared(state,reset=false){
    if(!state||!state.Level)return null;
    if(reset||!state.__bgCollectibleData){
      state.__bgCollectibleData=freshData();window.__bgDonutScore=0;window.__bgDonutsCollected=0;
      window.__bgSuperJumpActive=false;window.__bgSuperJumpRemaining=0;
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

  function addEffect(data,x,y,text="+100",kind="donut"){
    data.effects.push({x,y,text,kind,life:620,max:620});
  }

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
      if(Math.abs(p.x-item.x)<=13&&Math.abs(p.y-item.y)<=15){
        item.taken=true;awardDonut(state,item.x,item.y,true);
        try{for(let i=0;i<4;i++)state.AddSprite(new Mario.Sparkle(state,item.x-5+i*3,item.y-4,(i-1.5)*.35,-1.5,0,1,5))}catch(e){}
      }
    }
    for(const power of data.powers){
      if(power.taken)continue;
      if(Math.abs(p.x-power.x)<=15&&Math.abs(p.y-power.y)<=18){
        power.taken=true;data.powerRemaining=POWER_MS;
        window.__bgSuperJumpActive=true;window.__bgSuperJumpRemaining=POWER_MS;
        addEffect(data,power.x,power.y,"SALTO ×2","power");sound("powerup");updateHud(data);
      }
    }
  }

  function drawDonut(ctx,x,y,t,scale=1){
    const bob=Math.round(Math.sin(t+performance.now()/170));
    ctx.save();ctx.translate(Math.round(x),Math.round(y+bob));ctx.scale(scale,scale);
    // Crisp 16x16 circular pixel-art silhouette.
    ctx.fillStyle="#542719";
    ctx.fillRect(-4,-8,8,1);ctx.fillRect(-6,-7,12,1);ctx.fillRect(-7,-6,14,2);
    ctx.fillRect(-8,-4,16,8);ctx.fillRect(-7,4,14,2);ctx.fillRect(-6,6,12,1);ctx.fillRect(-4,7,8,1);
    // Bread.
    ctx.fillStyle="#d99143";
    ctx.fillRect(-4,-7,8,1);ctx.fillRect(-6,-6,12,2);ctx.fillRect(-7,-4,14,8);ctx.fillRect(-6,4,12,2);ctx.fillRect(-4,6,8,1);
    // Pink icing, rounded and clearly separate from bread.
    ctx.fillStyle="#ff78b3";
    ctx.fillRect(-4,-6,8,1);ctx.fillRect(-6,-5,12,2);ctx.fillRect(-7,-3,14,4);ctx.fillRect(-6,1,12,2);ctx.fillRect(-4,3,8,1);
    ctx.fillStyle="#ffb6d5";ctx.fillRect(-4,-5,4,1);ctx.fillRect(2,-3,3,1);ctx.fillRect(-5,0,2,1);
    // Central hole redraw on top to keep it perfectly legible.
    ctx.fillStyle="#542719";ctx.fillRect(-2,-2,4,4);ctx.fillStyle="#29140e";ctx.fillRect(-1,-1,2,2);
    // Sprinkles.
    ctx.fillStyle="#fff0a8";ctx.fillRect(-4,-3,1,1);ctx.fillRect(4,-2,1,1);ctx.fillRect(3,2,1,1);
    ctx.fillStyle="#4dd3ff";ctx.fillRect(-2,3,1,1);ctx.fillRect(1,-5,1,1);
    ctx.restore();
  }

  function drawPower(ctx,x,y,t){
    const bob=Math.round(Math.sin(t+performance.now()/190)*1.4);
    ctx.save();ctx.translate(Math.round(x),Math.round(y+bob));
    // 18x17 mushroom: dark outline, left red / right blue cap, bright white spots.
    ctx.fillStyle="#24152d";
    ctx.fillRect(-4,-8,8,1);ctx.fillRect(-7,-7,14,1);ctx.fillRect(-8,-6,16,2);ctx.fillRect(-9,-4,18,5);ctx.fillRect(-7,1,14,2);
    ctx.fillStyle="#e23a48";ctx.fillRect(-7,-6,7,2);ctx.fillRect(-8,-4,8,5);ctx.fillRect(-6,1,6,1);
    ctx.fillStyle="#3479ed";ctx.fillRect(0,-6,7,2);ctx.fillRect(0,-4,8,5);ctx.fillRect(0,1,6,1);
    ctx.fillStyle="#fff7df";ctx.fillRect(-5,-4,3,2);ctx.fillRect(3,-5,3,2);ctx.fillRect(-1,-6,2,2);
    ctx.fillStyle="#f1ddb6";ctx.fillRect(-4,2,8,5);ctx.fillStyle="#6e4a3a";ctx.fillRect(-2,4,1,2);ctx.fillRect(1,4,1,2);
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
    if(Mario.CoinAnim.prototype.__bgDonutDrawV2)return;
    Mario.CoinAnim.prototype.__bgDonutDrawV2=true;
    Mario.CoinAnim.prototype.Draw=function(ctx){
      if(!ctx||this.Visible===false)return;
      const x=(typeof this.GetX==="function"?this.GetX(this.Delta):this.X)+8;
      const y=(typeof this.GetY==="function"?this.GetY(this.Delta):this.Y)+8;
      drawDonut(ctx,x,y,0,1);
    };
  }

  function installCharacterHooks(){
    if(!(window.Mario&&Mario.Character&&Mario.Character.prototype))return;
    const cp=Mario.Character.prototype;

    if(!cp.__bgDonutGetCoinV2){
      cp.__bgDonutGetCoinV2=true;
      const originalGetCoin=cp.GetCoin;
      cp.GetCoin=function(){
        const result=originalGetCoin.apply(this,arguments);
        try{if(this.World)awardDonut(this.World,Number(this.X||0),Number(this.Y||0)-18,false)}catch(e){}
        return result;
      };
    }

    if(!cp.__bgSuperJumpMoveV2){
      cp.__bgSuperJumpMoveV2=true;
      const originalMove=cp.Move;
      cp.Move=function(){
        const wasGround=!!this.OnGround;
        const result=originalMove.apply(this,arguments);
        try{
          const st=this.World,data=st&&st.__bgCollectibleData;
          // Detect the exact launch frame, independent of keyboard/mobile implementation.
          if(data&&data.powerRemaining>0&&wasGround&&Number(this.Ya)<0&&Number(this.JumpTime)>0&&!this.__bgPoweredThisJump){
            this.__bgPoweredThisJump=true;
            if(Number(this.YJumpSpeed)<0)this.YJumpSpeed*=JUMP_FACTOR;
            this.Ya*=JUMP_FACTOR;
          }
          if(this.OnGround||Number(this.Ya)>=0)this.__bgPoweredThisJump=false;
        }catch(e){}
        return result;
      };
    }
  }

  function installLevelHooks(){
    if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;
    const proto=Mario.LevelState.prototype;
    if(proto.__bgDonutPowerV2)return true;
    proto.__bgDonutPowerV2=true;

    const originalEnter=proto.Enter;
    proto.Enter=function(){const r=originalEnter.apply(this,arguments);ensurePrepared(this,true);return r};

    // Fix every engine-designated breakable brick. Bruno has no useful small/large
    // visual state, so a Breakable block must actually break whenever hit from below.
    const originalBump=proto.Bump;
    proto.Bump=function(x,y,canBreak){
      let tile=0,behavior=0,isBreakable=false,isBumpable=false,isSpecial=false;
      try{
        tile=this.Level.GetBlock(x,y)&255;behavior=Mario.Tile.Behaviors[tile]||0;
        isBreakable=(behavior&Mario.Tile.Breakable)>0;isBumpable=(behavior&Mario.Tile.Bumpable)>0;isSpecial=(behavior&Mario.Tile.Special)>0;
      }catch(e){}
      const r=originalBump.call(this,x,y,isBreakable?true:canBreak);
      try{
        // Native ordinary prize blocks call GetCoin(), which our Character hook converts
        // into donut score; CoinAnim is visually replaced by a popping donut.
        // A broken brick does not call GetCoin natively, so reward one here.
        if(isBreakable&&(this.Level.GetBlock(x,y)&255)===0){
          awardDonut(this,x*16+8,y*16+8,true);
          addEffect(this.__bgCollectibleData,x*16+8,y*16+8,"🍩","donut");
        }
        // Special blocks still keep their original mushroom/flower behavior.
        if(isBumpable&&!isSpecial)updateHud(ensurePrepared(this,false));
      }catch(e){}
      return r;
    };

    const originalUpdate=proto.Update;
    proto.Update=function(delta){
      const r=originalUpdate.apply(this,arguments),data=ensurePrepared(this,false);if(!data)return r;
      const running=!window.__bgPaused&&!window.__bgGameOverActive&&!window.__bgVictoryActive&&!this.Paused;
      if(running){
        collect(this,data);
        const ms=Math.max(0,Number(delta)||0)*1000;
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
      if(data&&ctx&&this.Camera){ctx.save();ctx.translate(-this.Camera.X,-this.Camera.Y);drawWorld(ctx,this);ctx.restore()}
      return r;
    };
    return true;
  }

  function installAll(){
    if(!(window.Mario&&window.Enjine))return false;
    installCoinAnim();installCharacterHooks();return installLevelHooks();
  }

  if(!installAll()){
    const timer=setInterval(()=>{if(installAll())clearInterval(timer)},50);setTimeout(()=>clearInterval(timer),10000);
  }

  window.__bgCollectibles={
    drawWorld,
    get score(){return Number(window.__bgDonutScore||0)},
    get donuts(){return Number(window.__bgDonutsCollected||0)},
    get superJump(){return !!window.__bgSuperJumpActive},
    get blockAudit(){return window.__bgBlockAudit||null}
  };
})();
