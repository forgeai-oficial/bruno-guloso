(()=>{
  "use strict";
  if(window.__BG_TEST_FLIGHT_V3__)return;
  window.__BG_TEST_FLIGHT_V3__=true;

  const BOARD_KEY="bruno_guloso_local_board";
  const HOLD_MS=5000;
  const FLY_Y=82;
  const FLY_SPEED=9000;

  let keyHeld=false;
  let holdStarted=0;
  let flightActive=false;
  let tainted=false;
  let lastFrame=performance.now();
  let lastCharacter=null;

  window.__bgTestRun=false;
  window.__bgTestFlightActive=false;

  const badge=document.createElement("div");
  badge.id="bgTestFlightBadge";
  badge.textContent="🧪 MODO TESTE • RANKING DESATIVADO";
  badge.style.cssText="position:fixed;z-index:350;left:50%;top:10px;transform:translateX(-50%);display:none;padding:7px 11px;border-radius:999px;background:rgba(10,16,37,.90);border:1px solid rgba(255,229,94,.55);color:#ffe55d;font:900 11px/1 system-ui;letter-spacing:.03em;pointer-events:none;box-shadow:0 5px 18px rgba(0,0,0,.28);white-space:nowrap";
  document.body.appendChild(badge);

  const editable=t=>!!(t&&t.closest&&t.closest("input,textarea,[contenteditable='true']"));
  const gameActive=()=>document.body.classList.contains("bg-game-active")&&!window.__bgGameOverActive&&!window.__bgVictoryActive&&!window.__bgPaused;
  function character(){try{return window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.World?Mario.MarioCharacter:null}catch(e){return null}}

  function markTest(){
    if(tainted)return;
    tainted=true;
    window.__bgTestRun=true;
    badge.style.display="block";
  }
  function stopHold(){
    keyHeld=false;
    holdStarted=0;
    flightActive=false;
    window.__bgTestFlightActive=false;
  }
  function resetTest(){
    stopHold();
    tainted=false;
    window.__bgTestRun=false;
    badge.style.display="none";
  }

  // Ranking local: uma corrida de teste nunca altera a tabela local.
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

  // Ranking global: POST de corrida de teste nunca chega ao servidor.
  try{
    const originalFetch=window.fetch.bind(window);
    if(!window.fetch.__bgTestFlightWrapped){
      const wrapped=function(input,init){
        try{
          const method=String((init&&init.method)||(input&&input.method)||"GET").toUpperCase();
          const raw=typeof input==="string"?input:(input&&input.url)||"";
          const u=new URL(raw,location.href);
          if(window.__bgTestRun&&method==="POST"&&u.origin===location.origin&&u.pathname==="/api/ranking"){
            const rows=Array.isArray(window.__bgGlobalRows)?window.__bgGlobalRows:[];
            return Promise.resolve(new Response(JSON.stringify({rows}),{status:200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}}));
          }
        }catch(e){}
        return originalFetch(input,init);
      };
      wrapped.__bgTestFlightWrapped=true;
      wrapped.__bgOriginal=originalFetch;
      window.fetch=wrapped;
    }
  }catch(e){}

  // F é completamente isolado. Nenhuma outra tecla é interceptada.
  addEventListener("keydown",e=>{
    if(e.code!=="KeyF"||editable(e.target)||!gameActive())return;
    if(!keyHeld){keyHeld=true;holdStarted=performance.now();flightActive=false}
    e.preventDefault();
  },false);

  addEventListener("keyup",e=>{
    if(e.code!=="KeyF")return;
    stopHold();
    e.preventDefault();
  },false);

  addEventListener("blur",stopHold);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stopHold()});

  function applyFlight(now){
    const dt=Math.min(.05,Math.max(0,(now-lastFrame)/1000));
    lastFrame=now;
    const m=character();

    // Detecta uma tentativa nova sem tocar em nenhum prototype/Initialize do jogo.
    if(m&&m!==lastCharacter){
      lastCharacter=m;
      resetTest();
    }

    if(keyHeld&&gameActive()){
      if(!flightActive&&holdStarted>0&&now-holdStarted>=HOLD_MS){
        flightActive=true;
        markTest();
        window.__bgTestFlightActive=true;
      }
      if(flightActive&&m){
        try{
          if(m.World)m.World.Paused=false;
          m.DeathTime=0;
          m.WinTime=0;
          m.InvulnerableTime=Math.max(Number(m.InvulnerableTime)||0,9999);
          m.Xa=0;m.Ya=0;m.OnGround=false;m.WasOnGround=false;
          m.Y=FLY_Y;m.YOld=FLY_Y;
          const nextX=m.X+FLY_SPEED*dt;
          m.X=nextX;m.XOld=nextX;
          window.__bgRunMaxX=Math.max(Number(window.__bgRunMaxX)||0,nextX);
        }catch(e){}
      }
    }else{
      flightActive=false;
      window.__bgTestFlightActive=false;
    }

    if(tainted){
      const rank=document.getElementById("bgVictoryRank");
      if(rank&&document.getElementById("bgVictoryOverlay")?.classList.contains("show"))rank.textContent="🧪 MODO TESTE • resultado NÃO salvo no ranking";
      const go=document.getElementById("gameOverOverlay");
      if(go&&go.style.display==="grid"){
        const best=document.getElementById("gameOverBest");
        if(best)best.textContent="🧪 MODO TESTE • resultado NÃO salvo";
      }
    }
    requestAnimationFrame(applyFlight);
  }
  requestAnimationFrame(applyFlight);

  window.__bgTestFlight={key:"F",holdSeconds:5,get used(){return tainted},get active(){return flightActive},get holding(){return keyHeld},reset:resetTest};
})();
