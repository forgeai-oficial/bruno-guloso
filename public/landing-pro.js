(()=>{
  "use strict";
  if(window.__BG_LANDING_PRO__) return;
  window.__BG_LANDING_PRO__=true;

  const style=document.createElement("style");
  style.id="bgLandingProStyle";
  style.textContent=`
    .side-stack .landing-rank-card{
      position:relative;overflow:hidden;transform:none!important;
      border:2px solid rgba(255,230,93,.55)!important;
      background:linear-gradient(145deg,rgba(14,24,58,.96),rgba(55,28,83,.92))!important;
      box-shadow:0 18px 46px rgba(14,13,49,.34),inset 0 1px 0 rgba(255,255,255,.10)!important;
    }
    .side-stack .landing-rank-card:before{content:"";position:absolute;inset:-80px -60px auto auto;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,230,93,.22),transparent 66%);pointer-events:none}
    .landing-rank-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:11px}
    .side-stack .landing-rank-title{font-size:20px;font-weight:1000;letter-spacing:-.02em;color:#fff!important}
    .side-stack .landing-rank-sub{margin-top:2px;color:#b8c7e6!important;font-size:10px;font-weight:950;letter-spacing:.09em;text-transform:uppercase}
    .side-stack .landing-rank-badge{flex:0 0 auto;padding:7px 9px;border-radius:999px;background:rgba(255,230,93,.14);border:1px solid rgba(255,230,93,.30);color:#ffe65d;font-size:10px;font-weight:1000;letter-spacing:.05em}
    .side-stack .landing-rank-list{display:grid;gap:7px;margin-top:5px}
    .side-stack .landing-rank-row{display:grid;grid-template-columns:35px minmax(0,1fr) auto;align-items:center;gap:9px;padding:9px 10px;border-radius:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08)}
    .side-stack .landing-rank-row:nth-child(1){background:linear-gradient(90deg,rgba(255,215,0,.18),rgba(255,255,255,.06));border-color:rgba(255,215,0,.28)}
    .side-stack .landing-rank-placeholder{opacity:.62}
    .side-stack .landing-rank-pos{font-size:18px;text-align:center;color:#ffe65d!important}.side-stack .landing-rank-name{font-size:13px;font-weight:950;color:#fff!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.side-stack .landing-rank-score{font-size:12px;font-weight:1000;color:#b9e0ff!important;white-space:nowrap}
    .side-stack .landing-rank-empty{padding:12px;border-radius:12px;background:rgba(255,255,255,.06);color:#c4d2ec!important;font-size:12px;font-weight:800;text-align:center}
    .side-stack .landing-rank-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px}
    .side-stack .landing-rank-me{min-width:0;color:#dce7fb!important;font-size:11px;font-weight:850;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #landingTop10Btn{flex:0 0 auto;border:1px solid rgba(255,230,93,.38);background:#ffe65d;color:#16172a;padding:9px 12px;border-radius:11px;font-size:11px;font-weight:1000;cursor:pointer;box-shadow:0 7px 18px rgba(255,212,48,.17)}
    #landingTop10Btn:hover{filter:brightness(1.04);transform:translateY(-1px)}
    #bgAudioHint{pointer-events:auto!important;cursor:pointer!important;bottom:auto!important;top:18px!important;background:linear-gradient(90deg,#111a38,#39205d)!important;border-color:rgba(255,230,93,.55)!important;color:#fff!important;box-shadow:0 10px 34px rgba(0,0,0,.34),0 0 0 3px rgba(255,230,93,.08)!important}
    #bgAudioHint:after{content:" • tocar";color:#ffe65d}
    @media(max-width:760px){
      .side-stack .landing-rank-card{order:-2}.landing-rank-title{font-size:18px}.landing-rank-row{padding:8px 9px}.landing-rank-actions{align-items:stretch;flex-direction:column}.landing-rank-me{white-space:normal}.landing-rank-actions #landingTop10Btn{width:100%}
      #bgAudioHint{top:62px!important;bottom:auto!important;max-width:90vw!important}
    }
  `;
  document.head.appendChild(style);

  const side=document.querySelector("#startLayer .side-stack");
  if(side&&!document.getElementById("landingRankingCard")){
    const card=document.createElement("aside");
    card.id="landingRankingCard";
    card.className="panel landing-rank-card";
    card.innerHTML=`
      <div class="landing-rank-head">
        <div><div class="landing-rank-title">🏆 Ranking dos sobreviventes</div><div class="landing-rank-sub">Top 3 visível • Top 10 completo</div></div>
        <div class="landing-rank-badge">TOP 10</div>
      </div>
      <div id="landingRankList" class="landing-rank-list"></div>
      <div class="landing-rank-actions">
        <div id="landingRankMe" class="landing-rank-me">Faça sua primeira tentativa e entre no placar.</div>
        <button id="landingTop10Btn" type="button">VER TOP 10</button>
      </div>`;
    side.prepend(card);
  }

  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function player(){try{return String(localStorage.getItem("bruno_guloso_player_name")||"").trim()}catch(e){return ""}}
  function rows(){
    try{
      const raw=JSON.parse(localStorage.getItem("bruno_guloso_local_board")||"{}")||{};
      return Object.entries(raw).map(([name,v])=>({name:String(name),score:Number(v&&v.score||0),when:Number(v&&v.when||0)})).sort((a,b)=>b.score-a.score||a.when-b.when).slice(0,20);
    }catch(e){return []}
  }
  function renderLandingRanking(){
    const list=document.getElementById("landingRankList"),mine=document.getElementById("landingRankMe");
    if(!list||!mine)return;
    const all=rows(),top=all.slice(0,3),me=player();
    const med=["🥇","🥈","🥉"];
    list.innerHTML=[0,1,2].map(i=>{
      const r=top[i];
      if(r)return `<div class="landing-rank-row"><div class="landing-rank-pos">${med[i]}</div><div class="landing-rank-name">${esc(r.name)}</div><div class="landing-rank-score">${Math.floor(r.score)} m</div></div>`;
      return `<div class="landing-rank-row landing-rank-placeholder"><div class="landing-rank-pos">${med[i]}</div><div class="landing-rank-name">— aguardando recorde —</div><div class="landing-rank-score">—</div></div>`;
    }).join("");
    if(!me){mine.textContent="Escolha seu nome e tente entrar no Top 10.";return}
    const idx=all.findIndex(r=>r.name.toLocaleLowerCase()===me.toLocaleLowerCase());
    if(idx<0)mine.textContent=`${me}: ainda sem recorde.`;
    else mine.textContent=`Sua posição: ${idx+1}º • ${Math.floor(all[idx].score)} m`;
  }
  renderLandingRanking();
  setInterval(()=>{const layer=document.getElementById("startLayer");if(layer&&layer.style.display!=="none")renderLandingRanking()},900);
  window.addEventListener("storage",renderLandingRanking);

  const top10=document.getElementById("landingTop10Btn");
  if(top10)top10.addEventListener("click",()=>{
    const btn=document.getElementById("rankingOpenBtn");
    if(btn&&typeof btn.onclick==="function")btn.click();
    else{const ov=document.getElementById("rankingOverlay");if(ov)ov.style.display="grid"}
  });

  function audioHintSetup(){
    const hint=document.getElementById("bgAudioHint");
    if(hint){
      hint.textContent="🔊 ATIVAR MÚSICA";
      hint.title="Clique para liberar a música no navegador";
      if(!hint.__bgClickable){hint.__bgClickable=true;hint.addEventListener("click",()=>{try{window.__bgAudio&&window.__bgAudio.enable()}catch(e){}})}
    }
  }
  function tryAutoplay(){
    audioHintSetup();
    try{if(window.__bgAudio&&window.__bgAudio.enabled&&!window.__bgAudio.unlocked)window.__bgAudio.enable()}catch(e){}
  }
  tryAutoplay();
  setTimeout(tryAutoplay,80);setTimeout(tryAutoplay,350);setTimeout(tryAutoplay,1200);
  window.addEventListener("pageshow",tryAutoplay);window.addEventListener("focus",tryAutoplay);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)tryAutoplay()});
})();