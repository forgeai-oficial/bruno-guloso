(()=>{
  "use strict";
  if(window.__BG_MOBILE_CAMERA_FRAMING__)return;
  window.__BG_MOBILE_CAMERA_FRAMING__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const isLandscape=()=>innerWidth>innerHeight;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  let currentTop=null;
  let raf=0;

  function getState(){
    try{
      const app=window.__jo2app;
      return app&&app.stateContext&&app.stateContext.State;
    }catch(e){return null}
  }

  function resetCanvas(canvas){
    if(!canvas)return;
    currentTop=null;
    canvas.style.removeProperty("top");
    canvas.style.removeProperty("bottom");
    canvas.style.removeProperty("will-change");
  }

  function frame(){
    const canvas=document.getElementById("canvas");
    const active=document.body.classList.contains("bg-game-active");

    if(!canvas||!isMobile()||!isLandscape()||!active||window.__bgOrientationBlocked){
      resetCanvas(canvas);
      raf=requestAnimationFrame(frame);
      return;
    }

    const st=getState();
    const m=window.Mario&&Mario.MarioCharacter;
    if(!st||!st.Camera||!m){
      raf=requestAnimationFrame(frame);
      return;
    }

    const rect=canvas.getBoundingClientRect();
    const vh=Math.max(1,window.visualViewport?window.visualViewport.height:innerHeight);
    const canvasH=Math.max(1,rect.height);
    const minTop=Math.min(0,vh-canvasH);
    const maxTop=0;

    if(currentTop===null||!Number.isFinite(currentTop))currentTop=minTop;

    // Character Y is measured at the feet in the original 320x240 game view.
    // Focus around Bruno's torso, not the feet.
    const logicalHeight=240;
    const bodyOffset=Math.max(8,Number(m.Height||24)*0.55);
    const logicalY=clamp(Number(m.Y||0)-Number(st.Camera.Y||0)-bodyOffset,0,logicalHeight);
    const renderedY=(logicalY/logicalHeight)*canvasH;
    const screenY=currentTop+renderedY;

    // Professional-style vertical dead zone. Inside it, the crop does not move.
    // When Bruno approaches an edge, only then does the framing slide smoothly.
    let safeTop=vh*0.28;
    let safeBottom=vh*0.69;

    // Small vertical look-ahead: while rising, give Bruno more room above his head.
    const ya=Number(m.Ya||0);
    if(ya<-2)safeTop=vh*0.38;
    else if(ya>4)safeBottom=vh*0.64;

    let desired=currentTop;
    if(screenY<safeTop)desired+=safeTop-screenY;
    else if(screenY>safeBottom)desired-=screenY-safeBottom;

    desired=clamp(desired,minTop,maxTop);

    // Damping avoids camera snapping/jitter on small jumps and uneven terrain.
    const alpha=Math.abs(desired-currentTop)>70?0.22:0.12;
    currentTop+= (desired-currentTop)*alpha;
    if(Math.abs(desired-currentTop)<0.25)currentTop=desired;

    canvas.style.setProperty("top",currentTop.toFixed(2)+"px","important");
    canvas.style.setProperty("bottom","auto","important");
    canvas.style.setProperty("will-change","top","important");

    raf=requestAnimationFrame(frame);
  }

  addEventListener("resize",()=>{currentTop=null},{passive:true});
  addEventListener("orientationchange",()=>{currentTop=null},{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)currentTop=null});

  raf=requestAnimationFrame(frame);
  window.__bgMobileCameraFraming={
    reset(){currentTop=null},
    get enabled(){return true},
    get top(){return currentTop}
  };
})();
