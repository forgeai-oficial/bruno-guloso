(()=>{
  "use strict";
  if(window.__BG_MOBILE_FULL_TOUCH_V3__)return;
  window.__BG_MOBILE_FULL_TOUCH_V3__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const isLandscape=()=>innerWidth>innerHeight;

  const style=document.createElement("style");
  style.id="bgFullTouchStyleV3";
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

  const jumpPointers=new Set();
  const forwardPointers=new Set();

  const controls=()=>window.__bgMobileControls||null;
  const active=()=>document.body.classList.contains("bg-game-active")&&isMobile()&&isLandscape()&&!window.__bgOrientationBlocked&&!window.__bgGameOverActive&&!window.__bgVictoryActive&&!window.__bgPaused;

  function setJump(on){
    const c=controls();
    if(c&&typeof c.setJump==="function"){c.setJump(!!on);return;}
    try{
      if(window.Enjine&&Enjine.KeyboardInput&&Enjine.KeyboardInput.Pressed){
        window.__jo2JumpHeld=!!on;
        Enjine.KeyboardInput.Pressed[Enjine.Keys.S]=!!on;
        if(!on)window.__jo2JumpNeedsRearm=false;
      }
    }catch(e){}
  }

  function setDir(dir){
    const c=controls();
    if(c&&typeof c.setDir==="function"){c.setDir(dir);return;}
    try{
      if(window.Enjine&&Enjine.KeyboardInput&&Enjine.KeyboardInput.Pressed){
        Enjine.KeyboardInput.Pressed[Enjine.Keys.Left]=dir<0;
        Enjine.KeyboardInput.Pressed[Enjine.Keys.Right]=dir>0;
      }
    }catch(e){}
  }

  function isForwardBlock(x,y){
    const api=window.__bgInvisibleArrows;
    if(api&&typeof api.containsForward==="function"&&api.containsForward(x,y))return true;

    // fallback independente: calcula o bloco 2x2 direto pelo botão → visível
    const btn=document.querySelector('footer [data-key="right"]');
    if(!btn)return false;
    const r=btn.getBoundingClientRect();
    if(!r.width||!r.height)return false;
    return x>=r.left&&x<=r.left+r.width*2&&y>=r.top-r.height&&y<=r.top+r.height;
  }

  function vibrate(ms){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}
  function releaseJump(){if(jumpPointers.size===0)setJump(false)}
  function releaseForward(){if(forwardPointers.size===0)setDir(0)}
  function releaseAll(){
    jumpPointers.clear();
    forwardPointers.clear();
    setJump(false);
    setDir(0);
  }

  surface.addEventListener("pointerdown",e=>{
    if(e.pointerType==="mouse"||!active())return;

    // BLOCO 2x2 DO →: nunca pula. Qualquer ponto nele = avançar.
    if(isForwardBlock(e.clientX,e.clientY)){
      forwardPointers.add(e.pointerId);
      setDir(1);
      vibrate(6);
      try{surface.setPointerCapture(e.pointerId)}catch(err){}
      e.preventDefault();
      return;
    }

    // restante da área livre = pular
    jumpPointers.add(e.pointerId);
    setJump(true);
    vibrate(7);
    try{surface.setPointerCapture(e.pointerId)}catch(err){}
    e.preventDefault();
  },{passive:false});

  const endPointer=e=>{
    if(forwardPointers.delete(e.pointerId))releaseForward();
    if(jumpPointers.delete(e.pointerId))releaseJump();
  };
  ["pointerup","pointercancel","lostpointercapture"].forEach(type=>surface.addEventListener(type,endPointer,{passive:true}));

  // fallback para navegadores sem Pointer Events
  surface.addEventListener("touchstart",e=>{
    if(window.PointerEvent||!active())return;
    for(const t of Array.from(e.changedTouches||[])){
      if(isForwardBlock(t.clientX,t.clientY)){
        forwardPointers.add("t"+t.identifier);
        setDir(1);
      }else{
        jumpPointers.add("t"+t.identifier);
        setJump(true);
      }
    }
    e.preventDefault();
  },{passive:false});

  surface.addEventListener("touchend",e=>{
    if(window.PointerEvent)return;
    for(const t of Array.from(e.changedTouches||[])){
      forwardPointers.delete("t"+t.identifier);
      jumpPointers.delete("t"+t.identifier);
    }
    releaseForward();
    releaseJump();
    e.preventDefault();
  },{passive:false});
  surface.addEventListener("touchcancel",()=>{if(!window.PointerEvent)releaseAll()},{passive:true});

  addEventListener("blur",releaseAll);
  addEventListener("orientationchange",()=>setTimeout(releaseAll,80),{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseAll()});

  window.__bgMobileFullTouch={
    get enabled(){return true},
    get mode(){return "tap-free-area-jump-forward-block-move"}
  };
})();
