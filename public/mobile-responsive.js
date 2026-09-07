(()=>{
  "use strict";
  if(window.__BG_MOBILE_RESPONSIVE__) return;
  window.__BG_MOBILE_RESPONSIVE__=true;

  const style=document.createElement("style");
  style.id="bgMobileResponsiveStyle";
  style.textContent=`
  @media (max-width:900px){
    html,body{width:100%;height:100%;overscroll-behavior:none}
    #startLayer{overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom)}
    #startLayer .card{width:100%!important;min-height:100dvh!important;padding:12px 12px calc(18px + env(safe-area-inset-bottom))!important;overflow:visible!important}
    .landing-wrap{width:100%!important;max-width:100%!important}
    .brand{gap:8px!important;margin-bottom:10px!important;align-items:flex-start!important}
    .brand-left{gap:7px!important}
    .logo-chip,.tag-rainbow,.brand-note{font-size:11px!important;line-height:1.2!important;padding:7px 9px!important;border-width:2px!important}
    .hero-row,.story-grid,.fun-facts{grid-template-columns:1fr!important;gap:12px!important}
    .side-stack{gap:12px!important}
    .hero-main,.panel,.fact{padding:15px!important;border-radius:20px!important;border-width:2px!important}
    .card h1{font-size:clamp(38px,12.5vw,62px)!important;line-height:.93!important;margin:13px 0 10px!important}
    .hero-badge{font-size:10px!important;line-height:1.25!important;padding:7px 9px!important;white-space:normal!important}
    .lead{font-size:16px!important;line-height:1.38!important;margin-bottom:12px!important}
    .quick-pills{gap:7px!important;margin:12px 0 14px!important}
    .quick-pills span{font-size:12px!important;padding:8px 10px!important}
    .cta-row{gap:10px!important;margin-top:14px!important;align-items:stretch!important}
    .start-btn,#startBtn{width:100%!important;padding:16px 18px!important;font-size:18px!important}
    .cta-note{font-size:13px!important;padding:11px 12px!important}
    .panel h3{font-size:18px!important}.panel p,.panel li{font-size:14px!important}
    .fact b{font-size:20px!important}.mini{font-size:12px!important}
    .sys-overlay{padding:10px!important;align-items:center!important}
    .sys-card{width:min(96vw,720px)!important;max-height:92dvh!important;overflow:auto!important;padding:17px!important;border-radius:20px!important}
    .sys-card h2{font-size:clamp(28px,9vw,44px)!important}
    .sys-card p{font-size:15px!important}
    .sys-actions{gap:8px!important}.sys-btn{min-width:0!important;flex:1 1 46%!important;padding:13px 11px!important;font-size:14px!important}
    .score-big{margin:13px 0 10px!important;padding:13px!important}.score-big strong{font-size:clamp(38px,13vw,64px)!important}
    .ranking-box{margin-top:12px!important}.rank-row{grid-template-columns:34px minmax(0,1fr) auto!important;gap:7px!important;padding:8px 9px!important;font-size:13px!important}.rank-pos{font-size:16px!important}

    body.bg-game-active #canvas{
      inset:auto!important;left:50%!important;top:50%!important;
      width:min(100vw,calc(100dvh * 4 / 3))!important;
      height:min(100dvh,calc(100vw * 3 / 4))!important;
      transform:translate(-50%,-50%)!important;
      max-width:100vw!important;max-height:100dvh!important;
    }
    body.bg-game-active .game-hud{left:7px!important;right:auto!important;top:max(7px,env(safe-area-inset-top))!important;gap:5px!important;max-width:calc(100vw - 165px)!important}
    body.bg-game-active .hud-left{gap:5px!important;flex-wrap:nowrap!important}
    body.bg-game-active .hud-chip{min-height:38px!important;padding:7px 9px!important;font-size:13px!important;border-radius:11px!important;white-space:nowrap!important}
    body.bg-game-active .hud-chip small{font-size:9px!important}
    body.bg-game-active .hud-chip.optional{display:none!important}
    body.bg-game-active #pauseBtn{right:max(7px,env(safe-area-inset-right))!important;top:max(7px,env(safe-area-inset-top))!important;width:40px!important;height:40px!important;border-radius:11px!important}
    body.bg-game-active #rankingOpenBtn{right:53px!important;top:max(7px,env(safe-area-inset-top))!important;height:40px!important;min-width:42px!important;width:42px!important;padding:0!important;font-size:0!important;border-radius:11px!important}
    body.bg-game-active #rankingOpenBtn::after{content:"🏆";font-size:18px}
    body.bg-game-active #bgAudioBtn{right:100px!important;top:max(7px,env(safe-area-inset-top))!important;width:42px!important;min-width:42px!important;height:40px!important;padding:0!important;border-radius:11px!important;font-size:0!important}
    body.bg-game-active #bgAudioBtn[data-on="1"]::after{content:"🔊";font-size:17px}body.bg-game-active #bgAudioBtn[data-on="0"]::after{content:"🔇";font-size:17px}
    body.bg-game-active #bgAudioHint{bottom:86px!important;font-size:10px!important;padding:7px 10px!important;max-width:80vw!important;white-space:normal!important;text-align:center!important}

    body.bg-game-active footer{display:flex!important;left:0!important;right:0!important;bottom:max(6px,env(safe-area-inset-bottom))!important;transform:none!important;width:100%!important;max-width:none!important;padding:7px 9px!important;gap:7px!important;justify-content:flex-start!important;flex-wrap:nowrap!important;background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;pointer-events:none!important}
    body.bg-game-active footer .ctrl{display:block!important;pointer-events:auto!important;min-width:52px!important;width:52px!important;height:52px!important;padding:0!important;border-radius:16px!important;font-size:18px!important;font-weight:1000!important;box-shadow:0 8px 22px rgba(0,0,0,.32)!important;opacity:.92!important}
    body.bg-game-active footer .ctrl.jump{margin-left:auto!important;width:72px!important;font-size:12px!important}
    body.bg-game-active footer .ctrl.run{width:72px!important;font-size:12px!important}
    body.bg-game-active footer #restartBtn{display:none!important}
    body:not(.bg-game-active) footer{display:none!important}
  }
  @media (max-width:480px){
    body.bg-game-active .hud-chip:first-child{display:none!important}
    body.bg-game-active .game-hud{max-width:150px!important}
    .brand-note{display:none!important}.quick-pills span{width:100%!important}
    .sys-btn{flex-basis:100%!important}
  }
  @media (orientation:portrait) and (max-width:900px){
    body.bg-game-active #bgRotateHint{display:block!important}
  }
  `;
  document.head.appendChild(style);

  const hint=document.createElement("div");
  hint.id="bgRotateHint";
  hint.textContent="↻ Para jogar melhor, vire o celular";
  hint.style.cssText="display:none;position:fixed;left:50%;top:62px;transform:translateX(-50%);z-index:150;background:rgba(7,14,34,.88);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:7px 11px;font:800 10px/1.2 system-ui;pointer-events:none;white-space:nowrap";
  document.body.appendChild(hint);

  const start=document.getElementById("startLayer");
  const sync=()=>document.body.classList.toggle("bg-game-active",!!start&&start.style.display==="none");
  if(start)new MutationObserver(sync).observe(start,{attributes:true,attributeFilter:["style"]});
  sync();
  addEventListener("resize",sync,{passive:true});
  addEventListener("orientationchange",sync,{passive:true});
})();