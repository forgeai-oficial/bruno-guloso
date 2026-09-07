(()=>{
  "use strict";
  if(window.__BG_MOBILE_RESPONSIVE__) return;
  window.__BG_MOBILE_RESPONSIVE__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const isLandscape=()=>window.innerWidth>window.innerHeight;

  function bgSetAppHeight(){
    const h=Math.max(1,window.innerHeight||document.documentElement.clientHeight||1);
    document.documentElement.style.setProperty("--bg-app-h",h+"px");
  }

  bgSetAppHeight();
  addEventListener("resize",bgSetAppHeight,{passive:true});
  addEventListener("orientationchange",()=>setTimeout(bgSetAppHeight,100),{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener("resize",bgSetAppHeight,{passive:true});

  const style=document.createElement("style");
  style.id="bgMobileResponsiveStyle";
  style.textContent=`
  @media (max-width:1100px),(pointer:coarse){
    html,body{
      width:100%!important;height:var(--bg-app-h)!important;min-height:var(--bg-app-h)!important;
      margin:0!important;padding:0!important;overflow:hidden!important;overscroll-behavior:none!important;
      background:#050916!important;
    }

    #startLayer{
      overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;
      padding-bottom:env(safe-area-inset-bottom)
    }
    #startLayer .card{
      width:100%!important;min-height:var(--bg-app-h)!important;
      padding:12px 12px calc(18px + env(safe-area-inset-bottom))!important;overflow:visible!important
    }
    .landing-wrap{width:100%!important;max-width:100%!important}
    .brand{gap:8px!important;margin-bottom:10px!important;align-items:flex-start!important}.brand-left{gap:7px!important}
    .logo-chip,.tag-rainbow,.brand-note{font-size:11px!important;line-height:1.2!important;padding:7px 9px!important;border-width:2px!important}
    .hero-row,.story-grid,.fun-facts{grid-template-columns:1fr!important;gap:12px!important}.side-stack{gap:12px!important}
    .hero-main,.panel,.fact{padding:15px!important;border-radius:20px!important;border-width:2px!important}
    .card h1{font-size:clamp(34px,7vw,58px)!important;line-height:.93!important;margin:13px 0 10px!important}
    .hero-badge{font-size:10px!important;line-height:1.25!important;padding:7px 9px!important;white-space:normal!important}
    .lead{font-size:15px!important;line-height:1.38!important;margin-bottom:12px!important}
    .quick-pills{gap:7px!important;margin:12px 0 14px!important}.quick-pills span{font-size:12px!important;padding:8px 10px!important}
    .cta-row{gap:10px!important;margin-top:14px!important;align-items:stretch!important}.start-btn,#startBtn{width:100%!important;padding:14px 18px!important;font-size:17px!important}
    .cta-note{font-size:12px!important;padding:10px 12px!important}.panel h3{font-size:18px!important}.panel p,.panel li{font-size:13px!important}.fact b{font-size:19px!important}.mini{font-size:12px!important}
    .sys-overlay{padding:10px!important;align-items:center!important}.sys-card{width:min(94vw,720px)!important;max-height:calc(var(--bg-app-h) - 20px)!important;overflow:auto!important;padding:17px!important;border-radius:20px!important}
    .sys-card h2{font-size:clamp(28px,7vw,44px)!important}.sys-card p{font-size:14px!important}.sys-actions{gap:8px!important}.sys-btn{min-width:0!important;flex:1 1 46%!important;padding:12px 10px!important;font-size:13px!important}
    .score-big{margin:13px 0 10px!important;padding:13px!important}.score-big strong{font-size:clamp(38px,9vw,64px)!important}.ranking-box{margin-top:12px!important}.rank-row{grid-template-columns:34px minmax(0,1fr) auto!important;gap:7px!important;padding:8px 9px!important;font-size:13px!important}.rank-pos{font-size:16px!important}

    /* GAMEPLAY MOBILE — SOMENTE PAISAGEM.
       Mantém o mapa 4:3 do desktop sem esticar. A tela é preenchida por cover,
       ancorado embaixo para nunca cortar o chão/Bruno. */
    body.bg-game-active main{
      position:fixed!important;inset:0!important;width:100vw!important;height:var(--bg-app-h)!important;
      min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#050916!important
    }
    body.bg-game-active #canvas{
      position:fixed!important;
      left:50%!important;right:auto!important;top:auto!important;bottom:0!important;
      width:100vw!important;height:auto!important;
      min-width:100vw!important;min-height:0!important;max-width:none!important;max-height:none!important;
      aspect-ratio:4 / 3!important;
      margin:0!important;border:0!important;border-radius:0!important;
      transform:translateX(-50%)!important;
      transform-origin:center bottom!important;
    }

    body.bg-game-active .game-hud{left:max(7px,env(safe-area-inset-left))!important;right:auto!important;top:max(7px,env(safe-area-inset-top))!important;gap:5px!important;max-width:calc(100vw - 165px)!important}
    body.bg-game-active .hud-left{gap:5px!important;flex-wrap:nowrap!important}.hud-chip.optional{display:none!important}
    body.bg-game-active .hud-chip{min-height:36px!important;padding:6px 9px!important;font-size:12px!important;border-radius:11px!important;white-space:nowrap!important}.hud-chip small{font-size:9px!important}
    body.bg-game-active #pauseBtn{right:max(7px,env(safe-area-inset-right))!important;top:max(7px,env(safe-area-inset-top))!important;width:40px!important;height:40px!important;border-radius:11px!important}
    body.bg-game-active #rankingOpenBtn{right:53px!important;top:max(7px,env(safe-area-inset-top))!important;height:40px!important;min-width:42px!important;width:42px!important;padding:0!important;font-size:0!important;border-radius:11px!important}
    body.bg-game-active #rankingOpenBtn::after{content:"🏆";font-size:18px}
    body.bg-game-active #bgAudioBtn{right:100px!important;top:max(7px,env(safe-area-inset-top))!important;width:42px!important;min-width:42px!important;height:40px!important;padding:0!important;border-radius:11px!important;font-size:0!important}
    body.bg-game-active #bgAudioBtn[data-on="1"]::after{content:"🔊";font-size:17px}body.bg-game-active #bgAudioBtn[data-on="0"]::after{content:"🔇";font-size:17px}
    body.bg-game-active #bgAudioHint{bottom:76px!important;font-size:10px!important;padding:7px 10px!important;max-width:70vw!important;white-space:normal!important;text-align:center!important}

    body.bg-game-active footer{
      display:flex!important;left:max(0px,env(safe-area-inset-left))!important;right:max(0px,env(safe-area-inset-right))!important;
      bottom:max(6px,env(safe-area-inset-bottom))!important;transform:none!important;width:auto!important;max-width:none!important;
      padding:7px 9px!important;gap:7px!important;justify-content:flex-start!important;flex-wrap:nowrap!important;
      background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;pointer-events:none!important
    }
    body.bg-game-active footer .ctrl{display:block!important;pointer-events:auto!important;min-width:50px!important;width:50px!important;height:50px!important;padding:0!important;border-radius:16px!important;font-size:18px!important;font-weight:1000!important;box-shadow:0 8px 22px rgba(0,0,0,.32)!important;opacity:.92!important}
    body.bg-game-active footer .ctrl.jump{margin-left:auto!important;width:70px!important;font-size:11px!important}.ctrl.run{width:70px!important;font-size:11px!important}
    body.bg-game-active footer #restartBtn{display:none!important}body:not(.bg-game-active) footer{display:none!important}

    #bgRotateHint{
      display:none;position:fixed;inset:0;z-index:1000;place-items:center;padding:24px;
      background:radial-gradient(circle at 50% 36%,rgba(95,68,190,.28),transparent 38%),rgba(4,8,24,.985);
      color:#fff;text-align:center;font-family:Inter,system-ui,Segoe UI,sans-serif;
      pointer-events:auto;touch-action:none;-webkit-user-select:none;user-select:none
    }
    body.bg-mobile-portrait #bgRotateHint{display:grid!important}
    #bgRotateHint .bg-rotate-box{width:min(380px,88vw);padding:28px 22px;border-radius:26px;background:rgba(19,28,67,.96);border:2px solid rgba(255,255,255,.16);box-shadow:0 24px 70px rgba(0,0,0,.48)}
    #bgRotateHint .bg-rotate-icon{font-size:58px;line-height:1;margin-bottom:13px;animation:bgLandscapeNudge 1.35s ease-in-out infinite alternate}
    #bgRotateHint strong{display:block;color:#ffe65d;font-size:28px;line-height:1.05;margin-bottom:9px}#bgRotateHint span{display:block;color:#dce9ff;font-size:15px;line-height:1.4}
    @keyframes bgLandscapeNudge{from{transform:rotate(0deg) scale(.96)}to{transform:rotate(90deg) scale(1.04)}}
  }
  `;
  document.head.appendChild(style);

  const hint=document.createElement("div");
  hint.id="bgRotateHint";
  hint.innerHTML='<div class="bg-rotate-box"><div class="bg-rotate-icon">📱</div><strong>Vire para paisagem</strong><span>BRUNO GULOSO no celular funciona somente com a tela deitada.</span></div>';
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

  function overlayOpen(id){
    const el=document.getElementById(id);
    return !!el&&(el.style.display==="grid"||el.classList.contains("show"));
  }

  function sync(){
    bgSetAppHeight();
    const mobile=isMobile();
    const portrait=mobile&&!isLandscape();
    const gameActive=!!start&&start.style.display==="none";

    document.body.classList.toggle("bg-game-active",gameActive);
    document.body.classList.toggle("bg-mobile-portrait",portrait);
    document.body.classList.toggle("bg-orientation-blocked",portrait);
    window.__bgOrientationBlocked=portrait;

    if(portrait){
      releaseInputs();
      if(gameActive&&!window.__bgGameOverActive&&!window.__bgVictoryActive&&!window.__bgPaused){
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
  addEventListener("orientationchange",()=>setTimeout(sync,110),{passive:true});
  if(window.visualViewport)window.visualViewport.addEventListener("resize",sync,{passive:true});
})();
