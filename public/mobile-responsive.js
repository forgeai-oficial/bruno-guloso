(()=>{
  "use strict";
  if(window.__BG_MOBILE_RESPONSIVE__) return;
  window.__BG_MOBILE_RESPONSIVE__=true;

  function bgSetAppHeight(){
    const h=Math.max(1,window.innerHeight||document.documentElement.clientHeight||1);
    document.documentElement.style.setProperty("--bg-app-h",h+"px");
  }
  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=900;
  const isPortrait=()=>window.innerHeight>=window.innerWidth;

  bgSetAppHeight();
  window.addEventListener("resize",bgSetAppHeight,{passive:true});
  window.addEventListener("orientationchange",()=>setTimeout(bgSetAppHeight,80),{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener("resize",bgSetAppHeight,{passive:true});

  const style=document.createElement("style");
  style.id="bgMobileResponsiveStyle";
  style.textContent=`
  @media (max-width:1100px),(pointer:coarse){
    html,body{
      width:100%!important;height:var(--bg-app-h)!important;min-height:var(--bg-app-h)!important;
      margin:0!important;padding:0!important;overflow:hidden!important;overscroll-behavior:none!important;
    }
    #startLayer{overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom)}
    #startLayer .card{width:100%!important;min-height:var(--bg-app-h)!important;padding:12px 12px calc(18px + env(safe-area-inset-bottom))!important;overflow:visible!important}
    .landing-wrap{width:100%!important;max-width:100%!important}
    .brand{gap:8px!important;margin-bottom:10px!important;align-items:flex-start!important}.brand-left{gap:7px!important}
    .logo-chip,.tag-rainbow,.brand-note{font-size:11px!important;line-height:1.2!important;padding:7px 9px!important;border-width:2px!important}
    .hero-row,.story-grid,.fun-facts{grid-template-columns:1fr!important;gap:12px!important}.side-stack{gap:12px!important}
    .hero-main,.panel,.fact{padding:15px!important;border-radius:20px!important;border-width:2px!important}
    .card h1{font-size:clamp(38px,12.5vw,62px)!important;line-height:.93!important;margin:13px 0 10px!important}
    .hero-badge{font-size:10px!important;line-height:1.25!important;padding:7px 9px!important;white-space:normal!important}
    .lead{font-size:16px!important;line-height:1.38!important;margin-bottom:12px!important}
    .quick-pills{gap:7px!important;margin:12px 0 14px!important}.quick-pills span{font-size:12px!important;padding:8px 10px!important}
    .cta-row{gap:10px!important;margin-top:14px!important;align-items:stretch!important}.start-btn,#startBtn{width:100%!important;padding:16px 18px!important;font-size:18px!important}
    .cta-note{font-size:13px!important;padding:11px 12px!important}.panel h3{font-size:18px!important}.panel p,.panel li{font-size:14px!important}.fact b{font-size:20px!important}.mini{font-size:12px!important}
    .sys-overlay{padding:10px!important;align-items:center!important}.sys-card{width:min(96vw,720px)!important;max-height:calc(var(--bg-app-h) - 20px)!important;overflow:auto!important;padding:17px!important;border-radius:20px!important}
    .sys-card h2{font-size:clamp(28px,9vw,44px)!important}.sys-card p{font-size:15px!important}.sys-actions{gap:8px!important}.sys-btn{min-width:0!important;flex:1 1 46%!important;padding:13px 11px!important;font-size:14px!important}
    .score-big{margin:13px 0 10px!important;padding:13px!important}.score-big strong{font-size:clamp(38px,13vw,64px)!important}.ranking-box{margin-top:12px!important}.rank-row{grid-template-columns:34px minmax(0,1fr) auto!important;gap:7px!important;padding:8px 9px!important;font-size:13px!important}.rank-pos{font-size:16px!important}

    /* Gameplay mobile: RETRATO e tela inteira. */
    body.bg-game-active main{position:fixed!important;inset:0!important;width:100vw!important;height:var(--bg-app-h)!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
    body.bg-game-active #canvas{position:fixed!important;inset:0!important;left:0!important;top:0!important;width:100vw!important;height:var(--bg-app-h)!important;min-width:100vw!important;min-height:var(--bg-app-h)!important;max-width:none!important;max-height:none!important;margin:0!important;transform:none!important;border:0!important;border-radius:0!important}

    body.bg-game-active .game-hud{left:7px!important;right:auto!important;top:max(7px,env(safe-area-inset-top))!important;gap:5px!important;max-width:calc(100vw - 165px)!important}
    body.bg-game-active .hud-left{gap:5px!important;flex-wrap:nowrap!important}.hud-chip.optional{display:none!important}
    body.bg-game-active .hud-chip{min-height:38px!important;padding:7px 9px!important;font-size:13px!important;border-radius:11px!important;white-space:nowrap!important}.hud-chip small{font-size:9px!important}
    body.bg-game-active #pauseBtn{right:max(7px,env(safe-area-inset-right))!important;top:max(7px,env(safe-area-inset-top))!important;width:40px!important;height:40px!important;border-radius:11px!important}
    body.bg-game-active #rankingOpenBtn{right:53px!important;top:max(7px,env(safe-area-inset-top))!important;height:40px!important;min-width:42px!important;width:42px!important;padding:0!important;font-size:0!important;border-radius:11px!important}
    body.bg-game-active #rankingOpenBtn::after{content:"🏆";font-size:18px}
    body.bg-game-active #bgAudioBtn{right:100px!important;top:max(7px,env(safe-area-inset-top))!important;width:42px!important;min-width:42px!important;height:40px!important;padding:0!important;border-radius:11px!important;font-size:0!important}
    body.bg-game-active #bgAudioBtn[data-on="1"]::after{content:"🔊";font-size:17px}body.bg-game-active #bgAudioBtn[data-on="0"]::after{content:"🔇";font-size:17px}
    body.bg-game-active #bgAudioHint{bottom:86px!important;font-size:10px!important;padding:7px 10px!important;max-width:80vw!important;white-space:normal!important;text-align:center!important}

    body.bg-game-active footer{display:flex!important;left:0!important;right:0!important;bottom:max(6px,env(safe-area-inset-bottom))!important;transform:none!important;width:100%!important;max-width:none!important;padding:7px 9px!important;gap:7px!important;justify-content:flex-start!important;flex-wrap:nowrap!important;background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;pointer-events:none!important}
    body.bg-game-active footer .ctrl{display:block!important;pointer-events:auto!important;min-width:52px!important;width:52px!important;height:52px!important;padding:0!important;border-radius:16px!important;font-size:18px!important;font-weight:1000!important;box-shadow:0 8px 22px rgba(0,0,0,.32)!important;opacity:.92!important}
    body.bg-game-active footer .ctrl.jump{margin-left:auto!important;width:72px!important;font-size:12px!important}.ctrl.run{width:72px!important;font-size:12px!important}
    body.bg-game-active footer #restartBtn{display:none!important}body:not(.bg-game-active) footer{display:none!important}

    #bgRotateHint{display:none;position:fixed;inset:0;z-index:500;place-items:center;padding:24px;background:radial-gradient(circle at 50% 36%,rgba(95,68,190,.28),transparent 38%),rgba(4,8,24,.97);color:#fff;text-align:center;font-family:Inter,system-ui,Segoe UI,sans-serif;pointer-events:auto}
    body.bg-game-active.bg-orientation-blocked #bgRotateHint{display:grid!important}
    #bgRotateHint .bg-rotate-box{width:min(360px,88vw);padding:28px 22px;border-radius:26px;background:rgba(19,28,67,.96);border:2px solid rgba(255,255,255,.16);box-shadow:0 24px 70px rgba(0,0,0,.48)}
    #bgRotateHint .bg-rotate-icon{font-size:58px;line-height:1;margin-bottom:13px;animation:bgPortraitNudge 1.4s ease-in-out infinite alternate}
    #bgRotateHint strong{display:block;color:#ffe65d;font-size:28px;line-height:1.05;margin-bottom:9px}#bgRotateHint span{display:block;color:#dce9ff;font-size:15px;line-height:1.4}
    @keyframes bgPortraitNudge{from{transform:rotate(90deg) scale(.96)}to{transform:rotate(0deg) scale(1.04)}}
  }

  @media (max-width:480px){
    body.bg-game-active .hud-chip:first-child{display:none!important}body.bg-game-active .game-hud{max-width:150px!important}.brand-note{display:none!important}.quick-pills span{width:100%!important}.sys-btn{flex-basis:100%!important}
  }
  `;
  document.head.appendChild(style);

  const hint=document.createElement("div");
  hint.id="bgRotateHint";
  hint.innerHTML='<div class="bg-rotate-box"><div class="bg-rotate-icon">📱</div><strong>Vire para retrato</strong><span>BRUNO GULOSO funciona no celular somente com a tela em pé.</span></div>';
  document.body.appendChild(hint);

  let orientationPaused=false;
  const start=document.getElementById("startLayer");

  function releaseInputs(){
    try{
      if(window.Enjine&&Enjine.KeyboardInput&&Enjine.KeyboardInput.Pressed){
        const p=Enjine.KeyboardInput.Pressed;Object.keys(p).forEach(k=>p[k]=false);
      }
    }catch(e){}
    window.__jo2JumpHeld=false;
  }

  function overlayOpen(id){const el=document.getElementById(id);return !!el&&(el.style.display==="grid"||el.classList.contains("show"));}

  function sync(){
    bgSetAppHeight();
    const gameActive=!!start&&start.style.display==="none";
    document.body.classList.toggle("bg-game-active",gameActive);
    const blocked=isMobile()&&gameActive&&!isPortrait();
    document.body.classList.toggle("bg-orientation-blocked",blocked);
    window.__bgOrientationBlocked=blocked;

    if(blocked){
      releaseInputs();
      if(!window.__bgGameOverActive&&!window.__bgVictoryActive&&!window.__bgPaused){
        window.__bgPaused=true;
        orientationPaused=true;
      }
    }else if(orientationPaused){
      orientationPaused=false;
      if(gameActive&&!window.__bgGameOverActive&&!window.__bgVictoryActive&&!overlayOpen("pauseOverlay")&&!overlayOpen("rankingOverlay")){
        window.__bgPaused=false;
      }
    }
  }

  if(start)new MutationObserver(sync).observe(start,{attributes:true,attributeFilter:["style"]});
  sync();
  addEventListener("resize",sync,{passive:true});
  addEventListener("orientationchange",()=>setTimeout(sync,100),{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener("resize",sync,{passive:true});
})();
