(()=>{
  "use strict";
  if(window.__BG_MOBILE_CONTROLS__)return;
  window.__BG_MOBILE_CONTROLS__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=900;
  const isPortrait=()=>window.innerHeight>=window.innerWidth;

  const style=document.createElement("style");
  style.textContent=`
    body.bg-game-active,
    body.bg-game-active *:not(input):not(textarea){
      -webkit-user-select:none!important;
      user-select:none!important;
      -webkit-touch-callout:none!important;
      -webkit-tap-highlight-color:transparent!important;
    }
    body.bg-game-active img,
    body.bg-game-active canvas{
      -webkit-user-drag:none!important;
      user-drag:none!important;
    }
    body.bg-game-active button,
    body.bg-game-active .ctrl{touch-action:manipulation!important}

    @media(max-width:1100px),(pointer:coarse){
      body.bg-game-active #canvas{touch-action:none!important;-webkit-user-select:none!important;user-select:none!important}
      #bgTouchStick{position:fixed;z-index:125;display:none;width:86px;height:86px;border-radius:50%;border:2px solid rgba(255,255,255,.28);background:rgba(7,14,34,.22);box-shadow:inset 0 0 24px rgba(0,0,0,.22);pointer-events:none;transform:translate(-50%,-50%)}
      #bgTouchStick.show{display:block}#bgTouchKnob{position:absolute;left:50%;top:50%;width:38px;height:38px;border-radius:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,.78);box-shadow:0 5px 15px rgba(0,0,0,.25)}
      #bgJumpPulse{position:fixed;z-index:124;display:none;width:72px;height:72px;border-radius:50%;border:3px solid rgba(255,229,94,.78);background:rgba(255,229,94,.12);pointer-events:none;transform:translate(-50%,-50%);animation:bgJumpPulse .48s ease-out forwards}@keyframes bgJumpPulse{to{transform:translate(-50%,-50%) scale(1.45);opacity:0}}
      #bgMobileTip{position:fixed;z-index:260;left:50%;bottom:92px;transform:translateX(-50%);display:none;width:min(520px,90vw);padding:10px 13px;border-radius:14px;background:rgba(7,14,34,.92);border:1px solid rgba(255,255,255,.2);color:#fff;text-align:center;font:900 11px/1.35 system-ui;box-shadow:0 10px 28px rgba(0,0,0,.35);pointer-events:none}
      #bgMobileTip.show{display:block;animation:bgTip 3.4s ease forwards}@keyframes bgTip{0%,8%{opacity:0;transform:translate(-50%,8px)}18%,78%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-5px)}}
    }
  `;
  document.head.appendChild(style);

  const stick=document.createElement("div");stick.id="bgTouchStick";stick.innerHTML='<div id="bgTouchKnob"></div>';document.body.appendChild(stick);
  const knob=stick.firstElementChild;
  const pulse=document.createElement("div");pulse.id="bgJumpPulse";document.body.appendChild(pulse);
  const tip=document.createElement("div");tip.id="bgMobileTip";tip.textContent="🎮 CONTROLES: use os botões OU toque na tela • lado esquerdo move • lado direito pula • CORRER pode ser segurado junto";document.body.appendChild(tip);

  let movePointer=null,jumpPointer=null,originX=0,originY=0,currentDir=0;
  let tipShown=false;

  function P(){try{return window.Enjine&&Enjine.KeyboardInput&&Enjine.KeyboardInput.Pressed}catch(e){return null}}
  function setDir(dir){
    const p=P();if(!p||!window.Enjine)return;
    currentDir=dir;p[Enjine.Keys.Left]=dir<0;p[Enjine.Keys.Right]=dir>0;
  }
  function setJump(on){
    const p=P();if(!p||!window.Enjine)return;
    window.__jo2JumpHeld=!!on;p[Enjine.Keys.S]=!!on;if(!on)window.__jo2JumpNeedsRearm=false;
  }
  function vibrate(ms){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}
  function gameActive(){
    return document.body.classList.contains("bg-game-active")&&
      !window.__bgGameOverActive&&!window.__bgVictoryActive&&
      !window.__bgOrientationBlocked&&isPortrait();
  }
  function updateStick(x,y){
    const dx=Math.max(-28,Math.min(28,x-originX));
    const dy=Math.max(-28,Math.min(28,y-originY));
    knob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
    const dead=10;setDir(dx<-dead?-1:dx>dead?1:0);
  }
  function endMove(){if(movePointer!==null){movePointer=null;setDir(0);stick.classList.remove("show");knob.style.transform="translate(-50%,-50%)"}}
  function endJump(){if(jumpPointer!==null){jumpPointer=null;setJump(false)}}
  function releaseTouch(){endMove();endJump();}

  function bindCanvas(){
    const canvas=document.getElementById("canvas");
    if(!canvas||canvas.__bgTouchBound)return !!canvas;
    canvas.__bgTouchBound=true;
    canvas.addEventListener("pointerdown",e=>{
      if(!isMobile()||!gameActive()||e.pointerType==="mouse")return;
      const r=canvas.getBoundingClientRect();
      const rel=(e.clientX-r.left)/Math.max(1,r.width);
      if(rel<.46&&movePointer===null){
        movePointer=e.pointerId;originX=e.clientX;originY=e.clientY;
        stick.style.left=originX+"px";stick.style.top=originY+"px";stick.classList.add("show");
        setDir(rel<.23?-1:1);vibrate(7);
      }else if(jumpPointer===null){
        jumpPointer=e.pointerId;setJump(true);vibrate(8);
        pulse.style.left=e.clientX+"px";pulse.style.top=e.clientY+"px";pulse.style.display="block";pulse.style.animation="none";void pulse.offsetWidth;pulse.style.animation="bgJumpPulse .48s ease-out forwards";
      }
      try{canvas.setPointerCapture(e.pointerId)}catch(err){}
      e.preventDefault();
    },{passive:false});
    canvas.addEventListener("pointermove",e=>{if(e.pointerId===movePointer){updateStick(e.clientX,e.clientY);e.preventDefault()}},{passive:false});
    const finish=e=>{if(e.pointerId===movePointer)endMove();if(e.pointerId===jumpPointer)endJump()};
    ["pointerup","pointercancel","lostpointercapture"].forEach(type=>canvas.addEventListener(type,finish,{passive:true}));
    return true;
  }

  function maybeTip(){
    if(!isMobile()||!gameActive()||tipShown)return;
    try{if(localStorage.getItem("bg_mobile_controls_tip_v1")==="1"){tipShown=true;return}localStorage.setItem("bg_mobile_controls_tip_v1","1")}catch(e){}
    tipShown=true;tip.classList.add("show");setTimeout(()=>tip.classList.remove("show"),3600);
  }

  async function requestGameFullscreenPortrait(){
    if(!isMobile())return;
    try{
      if(!document.fullscreenElement){
        const el=document.documentElement;const fn=el.requestFullscreen||el.webkitRequestFullscreen;
        if(typeof fn==="function")await fn.call(el,{navigationUI:"hide"});
      }
    }catch(e){}
    try{
      if(screen.orientation&&typeof screen.orientation.lock==="function")await screen.orientation.lock("portrait");
    }catch(e){}
  }

  const start=document.getElementById("startBtn");
  if(start)start.addEventListener("click",()=>{if(isMobile())requestGameFullscreenPortrait()},{capture:true});

  document.querySelectorAll("footer [data-key]").forEach(btn=>btn.addEventListener("pointerdown",e=>{
    if(e.pointerType!=="mouse")vibrate(7);
  },{passive:true}));

  function editableTarget(t){
    return !!(t&&t.closest&&t.closest("input,textarea,[contenteditable='true']"));
  }
  function blockGameSelection(e){
    if(!document.body.classList.contains("bg-game-active")||editableTarget(e.target))return;
    e.preventDefault();
  }
  ["selectstart","dragstart","dblclick","contextmenu"].forEach(type=>
    document.addEventListener(type,blockGameSelection,{capture:true,passive:false})
  );
  document.addEventListener("gesturestart",blockGameSelection,{capture:true,passive:false});

  const timer=setInterval(()=>{if(bindCanvas())clearInterval(timer)},80);setTimeout(()=>clearInterval(timer),10000);
  const startLayer=document.getElementById("startLayer");
  if(startLayer)new MutationObserver(()=>{
    if(gameActive()){bindCanvas();setTimeout(maybeTip,450)}else releaseTouch();
  }).observe(startLayer,{attributes:true,attributeFilter:["style"]});

  const orientationSync=()=>{if(!gameActive())releaseTouch();};
  addEventListener("resize",orientationSync,{passive:true});
  addEventListener("orientationchange",()=>setTimeout(orientationSync,90),{passive:true});
  addEventListener("blur",releaseTouch);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseTouch()});

  window.__bgMobileControls={setDir,setJump,get directTouch(){return true},get buttons(){return true},get portraitOnly(){return true}};
})();
