(()=>{
  "use strict";
  if(window.__BG_MOBILE_INVISIBLE_ARROWS_V3__)return;
  window.__BG_MOBILE_INVISIBLE_ARROWS_V3__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const isLandscape=()=>innerWidth>innerHeight;

  const style=document.createElement("style");
  style.id="bgInvisibleArrowStyleV3";
  style.textContent=`
    .bgInvisibleArrowPad{
      position:fixed!important;
      z-index:170!important;
      display:none;
      margin:0!important;
      padding:0!important;
      border:0!important;
      border-radius:0!important;
      background:rgba(255,255,255,.001)!important;
      opacity:.001!important;
      color:transparent!important;
      box-shadow:none!important;
      outline:none!important;
      appearance:none!important;
      -webkit-appearance:none!important;
      box-sizing:border-box!important;
      pointer-events:auto!important;
      touch-action:none!important;
      -webkit-user-select:none!important;
      user-select:none!important;
      -webkit-tap-highlight-color:transparent!important;
    }
    @media (max-width:1100px),(pointer:coarse){
      body.bg-game-active:not(.bg-orientation-blocked) .bgInvisibleArrowPad{display:block!important}
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

  // ← mantém somente a área extra já existente acima.
  const leftTop=makePad(-1,"Mover para trás - área extra superior");

  // → forma um bloco 2x2 sem frestas:
  // [ invisível topo-esquerda ][ invisível topo-direita ]
  // [ botão visível →         ][ invisível baixo-direita ]
  const rightTopLeft=makePad(1,"Mover para frente - superior esquerda");
  const rightBottomRight=makePad(1,"Mover para frente - inferior direita");
  const rightTopRight=makePad(1,"Mover para frente - superior direita");

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
    pressed.delete(pad);
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
      if(e&&e.stopPropagation)e.stopPropagation();
    },{passive:false}));
  }

  bind(leftTop,-1);
  bind(rightTopLeft,1);
  bind(rightBottomRight,1);
  bind(rightTopRight,1);

  function setBox(pad,left,top,w,h){
    pad.style.left=left+"px";
    pad.style.top=top+"px";
    pad.style.width=w+"px";
    pad.style.height=h+"px";
  }

  let forwardRect=null;
  function sync(){
    const left=document.querySelector('footer [data-key="left"]');
    const right=document.querySelector('footer [data-key="right"]');

    if(active()){
      if(left){
        const l=left.getBoundingClientRect();
        if(l.width&&l.height)setBox(leftTop,l.left,l.top-l.height,l.width,l.height+2);
      }

      if(right){
        const r=right.getBoundingClientRect();
        if(r.width&&r.height){
          const w=r.width,h=r.height;
          const overlap=2; // elimina qualquer fresta/subpixel entre os 4 quadrados

          setBox(rightTopLeft,r.left,r.top-h,w+overlap,h+overlap);
          setBox(rightBottomRight,r.right-overlap,r.top,w+overlap,h);
          setBox(rightTopRight,r.right-overlap,r.top-h,w+overlap,h+overlap);

          forwardRect={
            left:r.left,
            top:r.top-h,
            right:r.left+w*2,
            bottom:r.top+h
          };
        }
      }
    }else{
      forwardRect=null;
      pressed.clear();
      setDir(0);
    }
    requestAnimationFrame(sync);
  }
  requestAnimationFrame(sync);

  addEventListener("blur",()=>{pressed.clear();setDir(0)});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){pressed.clear();setDir(0)}});

  window.__bgInvisibleArrows={
    leftTop,
    rightTopLeft,
    rightBottomRight,
    rightTopRight,
    get forwardRect(){return forwardRect},
    containsForward(x,y){
      const r=forwardRect;
      return !!r&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
    }
  };
})();
