(()=>{
  "use strict";
  if(window.__BG_ORIENTATION_GAME_ONLY__)return;
  window.__BG_ORIENTATION_GAME_ONLY__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const isLandscape=()=>innerWidth>innerHeight;
  const start=document.getElementById("startLayer");
  let pausedByOrientation=false;

  function releaseInputs(){
    try{
      if(window.Enjine&&Enjine.KeyboardInput&&Enjine.KeyboardInput.Pressed){
        const p=Enjine.KeyboardInput.Pressed;
        Object.keys(p).forEach(k=>p[k]=false);
      }
    }catch(e){}
    window.__jo2JumpHeld=false;
  }

  function overlayOpen(id){
    const el=document.getElementById(id);
    return !!el&&(el.style.display==="grid"||el.classList.contains("show"));
  }

  function sync(){
    const gameActive=!!start&&start.style.display==="none";
    const blocked=isMobile()&&gameActive&&!isLandscape();

    // Orientation is unrestricted on the landing/home page.
    document.body.classList.toggle("bg-mobile-portrait",blocked);
    document.body.classList.toggle("bg-orientation-blocked",blocked);
    window.__bgOrientationBlocked=blocked;

    if(!gameActive){
      pausedByOrientation=false;
      return;
    }

    if(blocked){
      releaseInputs();
      if(!window.__bgGameOverActive&&!window.__bgVictoryActive&&!window.__bgPaused){
        window.__bgPaused=true;
        pausedByOrientation=true;
      }
      return;
    }

    if(pausedByOrientation){
      pausedByOrientation=false;
      if(!window.__bgGameOverActive&&!window.__bgVictoryActive&&!overlayOpen("pauseOverlay")&&!overlayOpen("rankingOverlay")){
        window.__bgPaused=false;
      }
    }
  }

  if(start)new MutationObserver(()=>setTimeout(sync,0)).observe(start,{attributes:true,attributeFilter:["style"]});
  addEventListener("resize",()=>setTimeout(sync,0),{passive:true});
  addEventListener("orientationchange",()=>setTimeout(sync,130),{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener("resize",()=>setTimeout(sync,0),{passive:true});

  setTimeout(sync,0);
  setTimeout(sync,250);
})();
