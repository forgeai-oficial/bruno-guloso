(()=>{
  "use strict";
  if(window.__BG_MOBILE_INVISIBLE_ARROWS__)return;
  window.__BG_MOBILE_INVISIBLE_ARROWS__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const isLandscape=()=>innerWidth>innerHeight;

  const style=document.createElement("style");
  style.id="bgInvisibleArrowStyle";
  style.textContent=`
    .bgInvisibleArrowPad{
      position:fixed;
      z-index:143;
      display:none;
      margin:0;
      padding:0;
      border:0;
      border-radius:17px;
      background:rgba(255,255,255,.001);
      opacity:.001;
      color:transparent;
      box-shadow:none;
      outline:none;
      pointer-events:auto;
      touch-action:none;
      -webkit-user-select:none;
      user-select:none;
      -webkit-tap-highlight-color:transparent;
    }
    @media (max-width:1100px),(pointer:coarse){
      body.bg-game-active:not(.bg-orientation-blocked) .bgInvisibleArrowPad{display:block}
    }
  `;
  document.head.appendChild(style);

  function makePad(dir,label){
    const b=document.createElement("button");
    b.type="button";
    b.className="bgInvisibleArrowPad";
    b.dataset.dir=String(dir);
    b.setAttribute("aria-label",label);
    b.textContent=dir<0?"←":"→";
    document.body.appendChild(b);
    return b;
  }

  const leftPad=makePad(-1,"Mover para trás - área extra");
  const rightPad=makePad(1,"Mover para frente - área extra");

  const controls=()=>window.__bgMobileControls||null;
  const active=()=>document.body.classList.contains("bg-game-active")&&isMobile()&&isLandscape()&&!window.__bgOrientationBlocked&&!window.__bgGameOverActive&&!window.__bgVictoryActive;

  const pressed=new Map();
  function setDir(dir){
    const c=controls();
    if(c&&typeof c.setDir==="function")c.setDir(dir);
    else{
      try{
        if(window.Enjine&&Enjine.KeyboardInput&&Enjine.KeyboardInput.Pressed){
          Enjine.KeyboardInput.Pressed[Enjine.Keys.Left]=dir<0;
          Enjine.KeyboardInput.Pressed[Enjine.Keys.Right]=dir>0;
        }
      }catch(e){}
    }
  }
  function releasePad(pad){
    if(pressed.has(pad))pressed.delete(pad);
    if(!pressed.size)setDir(0);
    else setDir(Array.from(pressed.values()).pop());
  }
  function bind(pad,dir){
    pad.addEventListener("pointerdown",e=>{
      if(e.pointerType==="mouse"||!active())return;
      pressed.set(pad,dir);
      setDir(dir);
      try{navigator.vibrate&&navigator.vibrate(6)}catch(err){}
      try{pad.setPointerCapture(e.pointerId)}catch(err){}
      e.preventDefault();
      e.stopPropagation();
    },{passive:false});
    ["pointerup","pointercancel","lostpointercapture"].forEach(type=>pad.addEventListener(type,e=>{
      releasePad(pad);
      if(e&&e.preventDefault)e.preventDefault();
    },{passive:false}));
  }
  bind(leftPad,-1);
  bind(rightPad,1);

  function place(pad,source){
    if(!source||!active())return;
    const r=source.getBoundingClientRect();
    if(!r.width||!r.height)return;
    const size=Math.max(58,Math.round(r.width));
    pad.style.width=size+"px";
    pad.style.height=Math.max(58,Math.round(r.height))+"px";
    pad.style.left=Math.round(r.left)+"px";
    pad.style.top=Math.round(r.top-Math.max(58,r.height))+"px";
  }

  function sync(){
    const l=document.querySelector('footer [data-key="left"]');
    const r=document.querySelector('footer [data-key="right"]');
    if(active()){
      place(leftPad,l);
      place(rightPad,r);
    }else{
      pressed.clear();
      setDir(0);
    }
    requestAnimationFrame(sync);
  }
  requestAnimationFrame(sync);

  addEventListener("blur",()=>{pressed.clear();setDir(0)});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){pressed.clear();setDir(0)}});

  window.__bgInvisibleArrows={left:leftPad,right:rightPad};
})();
