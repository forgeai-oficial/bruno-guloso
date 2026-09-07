(()=>{
  "use strict";
  if(window.__BG_MOBILE_STATIC_FIT__)return;
  window.__BG_MOBILE_STATIC_FIT__=true;

  const style=document.createElement("style");
  style.id="bgMobileStaticFitStyle";
  style.textContent=`
    @media (max-width:1100px),(pointer:coarse){
      body.bg-game-active main{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--bg-app-h)!important;
        overflow:hidden!important;
        background:radial-gradient(circle at 50% 45%,#101a3a 0,#070d22 58%,#030711 100%)!important;
      }

      /*
        Mobile landscape: keep the complete original 4:3 game view visible.
        No vertical crop, no dynamic CSS camera and no distortion.
      */
      body.bg-game-active #canvas{
        position:fixed!important;
        left:50%!important;
        top:50%!important;
        right:auto!important;
        bottom:auto!important;
        width:min(100vw,calc(var(--bg-app-h) * 4 / 3))!important;
        height:min(var(--bg-app-h),calc(100vw * 3 / 4))!important;
        min-width:0!important;
        min-height:0!important;
        max-width:100vw!important;
        max-height:var(--bg-app-h)!important;
        aspect-ratio:4 / 3!important;
        margin:0!important;
        border:0!important;
        border-radius:0!important;
        transform:translate(-50%,-50%)!important;
        transform-origin:center center!important;
        will-change:auto!important;
      }

      /* Side areas are intentional control space on wide phones. */
      body.bg-game-active footer{
        z-index:140!important;
      }
      body.bg-game-active .game-hud,
      body.bg-game-active #pauseBtn,
      body.bg-game-active #rankingOpenBtn,
      body.bg-game-active #bgAudioBtn{
        z-index:145!important;
      }
    }
  `;
  document.head.appendChild(style);

  function clearOldDynamicCamera(){
    const canvas=document.getElementById("canvas");
    if(!canvas)return;
    canvas.style.removeProperty("will-change");
  }

  clearOldDynamicCamera();
  addEventListener("orientationchange",()=>setTimeout(clearOldDynamicCamera,120),{passive:true});
  addEventListener("resize",clearOldDynamicCamera,{passive:true});
})();
