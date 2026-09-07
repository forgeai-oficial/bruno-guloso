(()=>{
  "use strict";
  if(window.__BG_ORIENTATION_GAME_ONLY_V2__)return;
  window.__BG_ORIENTATION_GAME_ONLY_V2__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const physicalLandscape=()=>innerWidth>innerHeight;
  const startLayer=document.getElementById("startLayer");
  const startBtn=document.getElementById("startBtn");

  let session=false;
  let fullscreenOwned=false;
  let locking=false;

  const style=document.createElement("style");
  style.id="bgLandscapeSessionStyle";
  style.textContent=`
    @media (max-width:1100px),(pointer:coarse){
      body.bg-game-active #bgRotateHint{display:none!important}
      body.bg-game-active.bg-css-landscape{
        position:fixed!important;
        left:0!important;top:0!important;
        width:100vh!important;height:100vw!important;
        min-width:100vh!important;min-height:100vw!important;
        margin:0!important;padding:0!important;overflow:hidden!important;
        transform-origin:top left!important;
        transform:rotate(90deg) translateY(-100%)!important;
      }
      body.bg-game-active.bg-css-landscape main,
      body.bg-game-active.bg-css-landscape #bgSideViewport,
      body.bg-game-active.bg-css-landscape #bgFullTouchSurface{
        width:100vh!important;height:100vw!important;
      }
      body.bg-game-active.bg-css-landscape #canvas{
        width:min(100vh,calc(100vw * 4 / 3))!important;
        height:min(100vw,calc(100vh * 3 / 4))!important;
        max-width:100vh!important;max-height:100vw!important;
      }
      body.bg-game-active.bg-css-landscape .game-hud{max-width:calc(100vh - 165px)!important}
    }
  `;
  document.head.appendChild(style);

  const gameActive=()=>!!startLayer&&startLayer.style.display==="none";

  function clearOrientationBlock(){
    document.body.classList.remove("bg-mobile-portrait","bg-orientation-blocked");
    window.__bgOrientationBlocked=false;
  }

  function applyFallback(){
    if(!session||!isMobile()||!gameActive()){
      document.body.classList.remove("bg-css-landscape");
      return;
    }
    const cssRotate=!physicalLandscape();
    document.body.classList.toggle("bg-css-landscape",cssRotate);
    clearOrientationBlock();
    if(cssRotate)document.documentElement.style.setProperty("--bg-app-h",Math.max(1,innerWidth)+"px");
    else document.documentElement.style.setProperty("--bg-app-h",Math.max(1,innerHeight)+"px");
  }

  async function requestLandscapeLock(){
    if(!isMobile()||locking)return;
    locking=true;
    try{
      if(!document.fullscreenElement){
        const el=document.documentElement;
        const fn=el.requestFullscreen||el.webkitRequestFullscreen;
        if(typeof fn==="function"){
          try{await fn.call(el,{navigationUI:"hide"});fullscreenOwned=true}catch(e){}
        }
      }
      if(screen.orientation&&typeof screen.orientation.lock==="function"){
        try{await screen.orientation.lock("landscape-primary")}
        catch(e){try{await screen.orientation.lock("landscape")}catch(err){}}
      }
    }finally{
      locking=false;
      setTimeout(applyFallback,0);
      setTimeout(applyFallback,180);
    }
  }

  function beginSession(fromGesture=false){
    if(!isMobile())return;
    session=true;
    window.__bgLandscapeSessionActive=true;
    clearOrientationBlock();
    applyFallback();
    if(fromGesture||gameActive())requestLandscapeLock();
  }

  async function endSession(){
    if(!session&&!window.__bgLandscapeSessionActive)return;
    session=false;
    window.__bgLandscapeSessionActive=false;
    document.body.classList.remove("bg-css-landscape","bg-mobile-portrait","bg-orientation-blocked");
    window.__bgOrientationBlocked=false;
    document.documentElement.style.setProperty("--bg-app-h",Math.max(1,innerHeight)+"px");
    try{if(screen.orientation&&typeof screen.orientation.unlock==="function")screen.orientation.unlock()}catch(e){}
    if(fullscreenOwned&&document.fullscreenElement){try{await document.exitFullscreen()}catch(e){}}
    fullscreenOwned=false;
  }

  function sync(){
    if(!isMobile()){
      if(session)endSession();
      return;
    }
    if(gameActive()){
      if(!session)beginSession(false);
      clearOrientationBlock();
      applyFallback();
    }else endSession();
  }

  if(startBtn)startBtn.addEventListener("click",()=>beginSession(true),{capture:true});
  if(startLayer)new MutationObserver(()=>setTimeout(sync,0)).observe(startLayer,{attributes:true,attributeFilter:["style"]});
  addEventListener("resize",()=>setTimeout(sync,0),{passive:true});
  addEventListener("orientationchange",()=>setTimeout(sync,100),{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener("resize",()=>setTimeout(sync,0),{passive:true});
  document.addEventListener("fullscreenchange",()=>setTimeout(()=>{if(session)requestLandscapeLock();sync()},40));

  function enforce(){
    if(session&&gameActive()){
      clearOrientationBlock();
      applyFallback();
    }
    requestAnimationFrame(enforce);
  }
  requestAnimationFrame(enforce);
  setTimeout(sync,0);

  window.__bgLandscapeSession={get active(){return session},lock:()=>beginSession(true),unlock:endSession};
})();
