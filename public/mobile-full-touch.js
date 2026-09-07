(()=>{
  "use strict";
  if(window.__BG_MOBILE_FULL_TOUCH_V2__)return;
  window.__BG_MOBILE_FULL_TOUCH_V2__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const isLandscape=()=>innerWidth>innerHeight;

  const style=document.createElement("style");
  style.id="bgFullTouchStyleV2";
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
        -webkit-touch-callout:none;
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

  let surface=document.getElementById("bgFullTouchSurface");
  if(!surface){
    surface=document.createElement("div");
    surface.id="bgFullTouchSurface";
    document.body.appendChild(surface);
  }

  let jumpPointers=new Set();
  let touchJumpCount=0;

  const controls=()=>window.__bgMobileControls||null;
  const active=()=>document.body.classList.contains("bg-game-active")&&isMobile()&&isLandscape()&&!window.__bgOrientationBlocked&&!window.__bgGameOverActive&&!window.__bgVictoryActive&&!window.__bgPaused;

  function setJump(on){
    const c=controls();
    if(c&&typeof c.setJump==="function"){
      c.setJump(!!on);
      return;
    }
    try{
      if(window.Enjine&&Enjine.KeyboardInput&&Enjine.KeyboardInput.Pressed){
        window.__jo2JumpHeld=!!on;
        Enjine.KeyboardInput.Pressed[Enjine.Keys.S]=!!on;
        if(!on)window.__jo2JumpNeedsRearm=false;
      }
    }catch(e){}
  }

  function vibrate(ms){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}
  function beginJump(){
    if(!active())return false;
    setJump(true);
    vibrate(7);
    return true;
  }
  function releaseIfDone(){
    if(jumpPointers.size===0&&touchJumpCount===0)setJump(false);
  }
  function releaseAll(){
    jumpPointers.clear();
    touchJumpCount=0;
    setJump(false);
  }

  // Pointer Events: any free gameplay touch jumps. Movement remains on the buttons.
  surface.addEventListener("pointerdown",e=>{
    if(e.pointerType==="mouse"||!beginJump())return;
    jumpPointers.add(e.pointerId);
    try{surface.setPointerCapture(e.pointerId)}catch(err){}
    e.preventDefault();
  },{passive:false});

  const endPointer=e=>{
    if(!jumpPointers.has(e.pointerId))return;
    jumpPointers.delete(e.pointerId);
    releaseIfDone();
  };
  ["pointerup","pointercancel","lostpointercapture"].forEach(type=>surface.addEventListener(type,endPointer,{passive:true}));

  // Touch Events fallback for mobile browsers/webviews where Pointer Events are unreliable.
  surface.addEventListener("touchstart",e=>{
    if(window.PointerEvent)return;
    if(!active())return;
    touchJumpCount=e.touches.length;
    if(touchJumpCount>0){setJump(true);vibrate(7)}
    e.preventDefault();
  },{passive:false});
  surface.addEventListener("touchend",e=>{
    if(window.PointerEvent)return;
    touchJumpCount=e.touches.length;
    releaseIfDone();
    e.preventDefault();
  },{passive:false});
  surface.addEventListener("touchcancel",()=>{if(!window.PointerEvent)releaseAll()},{passive:true});

  addEventListener("blur",releaseAll);
  addEventListener("orientationchange",()=>setTimeout(releaseAll,80),{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseAll()});

  window.__bgMobileFullTouch={
    get enabled(){return true},
    get mode(){return "tap-any-free-area-to-jump"}
  };
})();
