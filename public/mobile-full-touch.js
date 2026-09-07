(()=>{
  "use strict";
  if(window.__BG_MOBILE_FULL_TOUCH__)return;
  window.__BG_MOBILE_FULL_TOUCH__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const isLandscape=()=>innerWidth>innerHeight;

  const style=document.createElement("style");
  style.textContent=`
    @media (max-width:1100px),(pointer:coarse){
      #bgFullTouchSurface{
        position:fixed;
        inset:0;
        z-index:110;
        display:none;
        background:transparent;
        touch-action:none;
        -webkit-user-select:none;
        user-select:none;
        -webkit-tap-highlight-color:transparent;
      }
      body.bg-game-active:not(.bg-orientation-blocked) #bgFullTouchSurface{display:block}
      body.bg-game-active footer{z-index:140!important}
      body.bg-game-active .game-hud,
      body.bg-game-active #pauseBtn,
      body.bg-game-active #rankingOpenBtn,
      body.bg-game-active #bgAudioBtn{z-index:145!important}
      body.bg-game-active .sys-overlay{z-index:200!important}
    }
  `;
  document.head.appendChild(style);

  const surface=document.createElement("div");
  surface.id="bgFullTouchSurface";
  document.body.appendChild(surface);

  let movePointer=null;
  let jumpPointer=null;
  let originX=0;
  let originY=0;

  const controls=()=>window.__bgMobileControls||null;
  const active=()=>document.body.classList.contains("bg-game-active")&&isMobile()&&isLandscape()&&!window.__bgOrientationBlocked&&!window.__bgGameOverActive&&!window.__bgVictoryActive;

  function vibrate(ms){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}

  function stopMove(){
    if(movePointer!==null){
      movePointer=null;
      const c=controls();
      if(c&&c.setDir)c.setDir(0);
    }
  }

  function stopJump(){
    if(jumpPointer!==null){
      jumpPointer=null;
      const c=controls();
      if(c&&c.setJump)c.setJump(false);
    }
  }

  function releaseAll(){stopMove();stopJump();}

  surface.addEventListener("pointerdown",e=>{
    if(!active()||e.pointerType==="mouse")return;
    const c=controls();
    if(!c)return;

    const rel=e.clientX/Math.max(1,innerWidth);

    if(rel<0.46&&movePointer===null){
      movePointer=e.pointerId;
      originX=e.clientX;
      originY=e.clientY;
      c.setDir(rel<0.23?-1:1);
      vibrate(7);
    }else if(jumpPointer===null){
      jumpPointer=e.pointerId;
      c.setJump(true);
      vibrate(8);
    }

    try{surface.setPointerCapture(e.pointerId)}catch(err){}
    e.preventDefault();
  },{passive:false});

  surface.addEventListener("pointermove",e=>{
    if(e.pointerId!==movePointer)return;
    const c=controls();
    if(!c)return;
    const dx=e.clientX-originX;
    const dead=12;
    c.setDir(dx<-dead?-1:dx>dead?1:0);
    e.preventDefault();
  },{passive:false});

  const finish=e=>{
    if(e.pointerId===movePointer)stopMove();
    if(e.pointerId===jumpPointer)stopJump();
  };
  ["pointerup","pointercancel","lostpointercapture"].forEach(type=>surface.addEventListener(type,finish,{passive:true}));

  addEventListener("blur",releaseAll);
  addEventListener("orientationchange",()=>setTimeout(releaseAll,80),{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseAll()});

  window.__bgMobileFullTouch={get enabled(){return true}};
})();
