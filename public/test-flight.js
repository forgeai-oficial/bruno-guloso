(()=>{
  "use strict";
  if(window.__BG_TEST_FLIGHT__)return;
  window.__BG_TEST_FLIGHT__=true;

  const BOARD_KEY="bruno_guloso_local_board";
  const FLY_KEY="f";
  const FLY_Y=82;
  const FLY_SPEED=9000; // pixels/segundo; ~12 s para atravessar a fase inteira

  let flyHeld=false;
  let tainted=false;
  let lastFrame=performance.now();

  window.__bgTestRun=false;
  window.__bgTestFlightActive=false;

  const badge=document.createElement("div");
  badge.id="bgTestFlightBadge";
  badge.textContent="🧪 MODO TESTE • RANKING DESATIVADO";
  badge.style.cssText="position:fixed;z-index:350;left:50%;top:10px;transform:translateX(-50%);display:none;padding:7px 11px;border-radius:999px;background:rgba(10,16,37,.90);border:1px solid rgba(255,229,94,.55);color:#ffe55d;font:900 11px/1 system-ui;letter-spacing:.03em;pointer-events:none;box-shadow:0 5px 18px rgba(0,0,0,.28);white-space:nowrap";
  document.body.appendChild(badge);

  function editable(t){return !!(t&&t.closest&&t.closest("input,textarea,[contenteditable='true']"));}
  function gameActive(){
    return document.body.classList.contains("bg-game-active")&&
      !window.__bgGameOverActive&&!window.__bgVictoryActive&&!window.__bgPaused;
  }
  function character(){
    try{return window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.World?Mario.MarioCharacter:null}catch(e){return null}
  }

  function markTest(){
    if(tainted)return;
    tainted=true;
    window.__bgTestRun=true;
    badge.style.display="block";
  }

  function resetTest(){
    flyHeld=false;
    tainted=false;
    window.__bgTestRun=false;
    window.__bgTestFlightActive=false;
    badge.style.display="none";
  }

  // Bloqueio 1: nenhuma tentativa marcada como TESTE pode alterar o ranking local.
  try{
    const originalSetItem=Storage.prototype.setItem;
    if(!originalSetItem.__bgTestFlightWrapped){
      const wrapped=function(key,value){
        if(window.__bgTestRun&&String(key)===BOARD_KEY)return;
        return originalSetItem.call(this,key,value);
      };
      wrapped.__bgTestFlightWrapped=true;
      wrapped.__bgOriginal=originalSetItem;
      Storage.prototype.setItem=wrapped;
    }
  }catch(e){}

  // Bloqueio 2: nenhuma tentativa marcada como TESTE pode fazer POST no ranking global.
  try{
    const originalFetch=window.fetch.bind(window);
    if(!window.fetch.__bgTestFlightWrapped){
      const wrapped=function(input,init){
        try{
          const reqMethod=String((init&&init.method)||(input&&input.method)||"GET").toUpperCase();
          const rawUrl=typeof input==="string"?input:(input&&input.url)||"";
          const u=new URL(rawUrl,location.href);
          if(window.__bgTestRun&&reqMethod==="POST"&&u.origin===location.origin&&u.pathname==="/api/ranking"){
            const rows=Array.isArray(window.__bgGlobalRows)?window.__bgGlobalRows:[];
            return Promise.resolve(new Response(JSON.stringify({rows}),{
              status:200,
              headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}
            }));
          }
        }catch(e){}
        return originalFetch(input,init);
      };
      wrapped.__bgTestFlightWrapped=true;
      wrapped.__bgOriginal=originalFetch;
      window.fetch=wrapped;
    }
  }catch(e){}

  // Uma LevelState nova significa tentativa nova: libera ranking novamente.
  function installInitializeReset(){
    try{
      if(!(window.Mario&&Mario.Character&&Mario.Character.prototype&&typeof Mario.Character.prototype.Initialize==="function"))return false;
      const proto=Mario.Character.prototype;
      if(proto.Initialize.__bgTestResetWrapped)return true;
      const original=proto.Initialize;
      const wrapped=function(){
        resetTest();
        return original.apply(this,arguments);
      };
      wrapped.__bgTestResetWrapped=true;
      wrapped.__bgOriginal=original;
      proto.Initialize=wrapped;
      return true;
    }catch(e){return false}
  }
  if(!installInitializeReset()){
    const timer=setInterval(()=>{if(installInitializeReset())clearInterval(timer)},60);
    setTimeout(()=>clearInterval(timer),10000);
  }

  addEventListener("keydown",e=>{
    if(String(e.key||"").toLowerCase()!==FLY_KEY||e.repeat||editable(e.target)||!gameActive())return;
    flyHeld=true;
    markTest();
    window.__bgTestFlightActive=true;
    e.preventDefault();
  },true);

  addEventListener("keyup",e=>{
    if(String(e.key||"").toLowerCase()!==FLY_KEY)return;
    flyHeld=false;
    window.__bgTestFlightActive=false;
    e.preventDefault();
  },true);

  addEventListener("blur",()=>{flyHeld=false;window.__bgTestFlightActive=false});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){flyHeld=false;window.__bgTestFlightActive=false}});

  function applyFlight(now){
    const dt=Math.min(.05,Math.max(0,(now-lastFrame)/1000));
    lastFrame=now;

    if(flyHeld&&gameActive()){
      const m=character();
      if(m){
        markTest();
        window.__bgTestFlightActive=true;
        try{
          if(m.World)m.World.Paused=false;
          m.DeathTime=0;
          m.WinTime=0;
          m.InvulnerableTime=Math.max(Number(m.InvulnerableTime)||0,9999);
          m.Xa=0;
          m.Ya=0;
          m.OnGround=false;
          m.WasOnGround=false;
          m.Y=FLY_Y;
          m.YOld=FLY_Y;

          const nextX=m.X+FLY_SPEED*dt;
          m.X=nextX;
          m.XOld=nextX;
          window.__bgRunMaxX=Math.max(Number(window.__bgRunMaxX)||0,nextX);
        }catch(e){}
      }
    }else{
      window.__bgTestFlightActive=false;
    }

    // Deixa explícito no fim da tentativa que nada foi salvo.
    if(tainted){
      const rank=document.getElementById("bgVictoryRank");
      if(rank&&(document.getElementById("bgVictoryOverlay")?.classList.contains("show")))
        rank.textContent="🧪 MODO TESTE • resultado NÃO salvo no ranking";

      const go=document.getElementById("gameOverOverlay");
      if(go&&go.style.display==="grid"){
        const best=document.getElementById("gameOverBest");
        if(best)best.textContent="🧪 MODO TESTE • resultado NÃO salvo";
      }
    }

    requestAnimationFrame(applyFlight);
  }
  requestAnimationFrame(applyFlight);

  window.__bgTestFlight={
    key:"F",
    get used(){return tainted},
    get active(){return flyHeld},
    reset:resetTest
  };
})();
