(()=>{
  "use strict";
  if(window.__BG_RANKING_PRO__) return;
  window.__BG_RANKING_PRO__=true;

  const style=document.createElement("style");
  style.textContent=`
    #gameOverRanking .rank-row:nth-child(n+4){display:none!important}
    #rankingFullList .rank-row:nth-child(n+11){display:none!important}
    .rank-row{position:relative}
    .rank-row.rank-top1{background:linear-gradient(90deg,rgba(255,215,0,.20),rgba(255,255,255,.07));border-color:rgba(255,215,0,.30)}
    .rank-row.rank-top2{background:linear-gradient(90deg,rgba(210,220,235,.17),rgba(255,255,255,.06))}
    .rank-row.rank-top3{background:linear-gradient(90deg,rgba(205,127,50,.17),rgba(255,255,255,.06))}
    .rank-row.rank-me{outline:2px solid rgba(255,230,93,.75);background:rgba(255,230,93,.13)}
    .rank-more-btn{
      border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;
      padding:8px 11px;border-radius:11px;font-size:11px;font-weight:1000;cursor:pointer;white-space:nowrap
    }
    .rank-more-btn:hover{background:rgba(255,255,255,.13)}
    #rankingOverlay .sys-card{max-height:min(86vh,760px);overflow:auto}
    #rankingOverlay .ranking-list{gap:6px}
    #rankingOverlay .rank-row{padding:9px 11px}
    #rankSelfPin{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.13)}
    #rankSelfPin::before{content:"SUA POSIÇÃO";display:block;margin:0 0 7px 2px;color:#9eb2d8;font-size:10px;font-weight:1000;letter-spacing:.09em}
    #rankSelfPin .rank-row{background:rgba(255,230,93,.13);border-color:rgba(255,230,93,.35);outline:1px solid rgba(255,230,93,.34)}
    @media(max-width:760px){.rank-more-btn{padding:7px 9px;font-size:10px}.ranking-title{align-items:flex-start}.ranking-title>div{gap:5px!important}}
  `;
  document.head.appendChild(style);

  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const currentName=()=>{try{return String(localStorage.getItem("bruno_guloso_player_name")||"").trim()}catch(e){return ""}};
  const medals=["🥇","🥈","🥉"];

  function decorate(list,limit){
    if(!list) return;
    const me=currentName().toLocaleLowerCase();
    const rows=[...list.querySelectorAll(":scope > .rank-row")];
    rows.forEach((row,i)=>{
      row.classList.remove("rank-top1","rank-top2","rank-top3","rank-me");
      if(i<3) row.classList.add(`rank-top${i+1}`);
      const pos=row.querySelector(".rank-pos");
      const label=i<3?medals[i]:`${i+1}º`;
      // Important: do not rewrite identical text. Rewriting textContent inside
      // a subtree watched by MutationObserver can create an endless microtask loop.
      if(pos && pos.textContent!==label) pos.textContent=label;
      const cells=row.children;
      const name=cells[1]?cells[1].textContent.trim().toLocaleLowerCase():"";
      if(me && name===me) row.classList.add("rank-me");
      const wanted=i<limit?"":"none";
      if(row.style.display!==wanted) row.style.display=wanted;
    });
  }

  function updateSelfPin(){
    const full=document.getElementById("rankingFullList");
    if(!full) return;
    let pin=document.getElementById("rankSelfPin");
    const mode=(document.getElementById("rankingModeLabel")?.textContent||"").trim().toUpperCase();
    if(mode==="ONLINE"){
      if(pin) pin.remove();
      return;
    }
    try{
      const me=currentName();
      const board=JSON.parse(localStorage.getItem("bruno_guloso_local_board")||"{}");
      const rows=Object.entries(board).map(([name,v])=>({name,score:Number(v?.score||0),when:Number(v?.when||0)}))
        .sort((a,b)=>b.score-a.score||a.when-b.when);
      const idx=rows.findIndex(r=>r.name===me);
      if(idx<10){if(pin)pin.remove();return}
      const r=rows[idx];
      if(!pin){pin=document.createElement("div");pin.id="rankSelfPin";full.insertAdjacentElement("afterend",pin)}
      const html=`<div class="rank-row rank-me"><div class="rank-pos">${idx+1}º</div><div>${esc(r.name)}</div><div class="rank-score">${Math.floor(r.score)} m</div></div>`;
      if(pin.innerHTML!==html) pin.innerHTML=html;
    }catch(e){if(pin)pin.remove()}
  }

  let refreshQueued=false;
  function setup(){
    const go=document.getElementById("gameOverRanking");
    const full=document.getElementById("rankingFullList");
    if(!go||!full) return false;

    const goTitle=go.closest(".ranking-box")?.querySelector(".ranking-title h3");
    if(goTitle && goTitle.textContent!=="🏆 Top 3") goTitle.textContent="🏆 Top 3";

    const titleRow=go.closest(".ranking-box")?.querySelector(".ranking-title");
    if(titleRow && !document.getElementById("gameOverTop10Btn")){
      const btn=document.createElement("button");
      btn.id="gameOverTop10Btn";
      btn.type="button";
      btn.className="rank-more-btn";
      btn.textContent="VER TOP 10";
      btn.onclick=e=>{e.preventDefault();e.stopPropagation();document.getElementById("rankingOpenBtn")?.click()};
      titleRow.appendChild(btn);
    }

    const overlay=document.getElementById("rankingOverlay");
    const h2=overlay?.querySelector("h2");
    if(h2 && h2.textContent!=="Top 10 dos sobreviventes") h2.textContent="Top 10 dos sobreviventes";

    const refresh=()=>{
      refreshQueued=false;
      decorate(go,3);
      decorate(full,10);
      updateSelfPin();
    };
    const scheduleRefresh=()=>{
      if(refreshQueued)return;
      refreshQueued=true;
      requestAnimationFrame(refresh);
    };

    // Observe only direct row insertion/removal. Watching the entire subtree made
    // our own medal text edits retrigger the observer forever on game over.
    new MutationObserver(scheduleRefresh).observe(go,{childList:true});
    new MutationObserver(scheduleRefresh).observe(full,{childList:true});
    document.getElementById("rankingOpenBtn")?.addEventListener("click",scheduleRefresh);
    document.getElementById("gameOverOverlay")?.addEventListener("transitionend",scheduleRefresh);
    refresh();
    return true;
  }

  if(!setup()){
    const timer=setInterval(()=>{if(setup())clearInterval(timer)},100);
    setTimeout(()=>clearInterval(timer),10000);
  }
})();
