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
    b.tabIndex=-1;
    b.textContent=dir<0?"←":"→";
    document.body.appendChild(b);
    return b;
  }

  // Áreas extras já existentes: uma acima de cada seta visível.
  const leftPad=makePad(-1,"Mover para trás - área extra");
  const rightPad=makePad(1,"Mover para frente - área extra acima");

  // Novas áreas pedidas para o botão →:
  // 1) uma imediatamente à direita do botão visível;
  // 2) outra imediatamente acima dessa nova área.
  const rightFrontPad=makePad(1,"Mover para frente - área extra à direita");
  const rightFrontTopPad=makePad(1,"Mover para frente - área extra superior direita");

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
  bind(rightFrontPad,1);
  bind(rightFrontTopPad,1);

  function metrics(source){
    if(!source||!active())return null;
    const r=source.getBoundingClientRect();
    if(!r.width||!r.height)return null;
    return {
      left:r.left,
      top:r.top,
      width:Math.max(58,Math.round(r.width)),
      height:Math.max(58,Math.round(r.height)),
      right:r.right
    };
  }

  function setBox(pad,left,top,w,h){
    pad.style.width=Math.round(w)+"px";
    pad.style.height=Math.round(h)+"px";
    pad.style.left=Math.round(left)+"px";
    pad.style.top=Math.round(top)+"px";
  }

  function sync(){
    const l=document.querySelector('footer [data-key="left"]');
    const r=document.querySelector('footer [data-key="right"]');
    if(active()){
      const lm=metrics(l);
      const rm=metrics(r);
      if(lm)setBox(leftPad,lm.left,lm.top-lm.height,lm.width,lm.height);
      if(rm){
        // mantém o extra já existente logo acima do →
        setBox(rightPad,rm.left,rm.top-rm.height,rm.width,rm.height);

        // novo extra logo à frente (direita) do → visível
        setBox(rightFrontPad,rm.right,rm.top,rm.width,rm.height);

        // novo extra logo acima do extra da direita
        setBox(rightFrontTopPad,rm.right,rm.top-rm.height,rm.width,rm.height);
      }
    }else{
      pressed.clear();
      setDir(0);
    }
    requestAnimationFrame(sync);
  }
  requestAnimationFrame(sync);

  addEventListener("blur",()=>{pressed.clear();setDir(0)});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){pressed.clear();setDir(0)}});

  window.__bgInvisibleArrows={
    left:leftPad,
    rightTop:rightPad,
    rightFront:rightFrontPad,
    rightFrontTop:rightFrontTopPad
  };
})();
