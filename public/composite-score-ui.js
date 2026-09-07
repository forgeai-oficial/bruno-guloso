(()=>{
  "use strict";
  if(window.__BG_COMPOSITE_SCORE_UI_V2__)return;
  window.__BG_COMPOSITE_SCORE_UI_V2__=true;

  const BOARD_KEY="bruno_guloso_local_board_v2";
  const clean=s=>String(s||"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,16);

  function metrics(){
    try{if(typeof window.__bgRankingMetrics==="function")return window.__bgRankingMetrics()}catch(e){}
    const distance=Math.max(0,Math.floor(Number(window.__bgLastDistance)||0));
    const donuts=Math.max(0,Math.floor(Number(window.__bgDonutsCollected)||0));
    const blues=Math.max(0,Math.floor(Number(window.__bgBlueMushroomsCollected)||0));
    return {distance,donuts,blues,donutPoints:donuts*10,bluePoints:blues*50,total:distance+donuts*10+blues*50};
  }

  function board(){try{return JSON.parse(localStorage.getItem(BOARD_KEY)||"{}")||{}}catch(e){return {}}}
  function findLocal(name){
    const b=board(),key=Object.keys(b).find(k=>clean(k).toLocaleLowerCase()===clean(name).toLocaleLowerCase());
    return key?b[key]:null;
  }

  function saveLocalCurrent(){
    if(window.__bgTestRun)return;
    try{
      const m=metrics(),name=clean(localStorage.getItem("bruno_guloso_player_name")||"");
      if(!name||m.total<=0)return;
      const b=board();
      let key=Object.keys(b).find(k=>clean(k).toLocaleLowerCase()===name.toLocaleLowerCase())||name;
      if(m.total>Number(b[key]&&b[key].score||0))b[key]={score:m.total,distance:m.distance,donuts:m.donuts,blues:m.blues,when:Date.now()};
      localStorage.setItem(BOARD_KEY,JSON.stringify(b));
    }catch(e){}
  }

  function updateEndScreens(){
    const m=metrics(),name=clean(localStorage.getItem("bruno_guloso_player_name")||"")||"Jogador";
    const local=findLocal(name),best=Math.max(m.total,Number(local&&local.score||0));
    const go=document.getElementById("gameOverOverlay");
    if(go&&go.style.display==="grid"){
      const score=document.getElementById("gameOverScore"),bestEl=document.getElementById("gameOverBest");
      if(score)score.textContent=`${m.total} pts`;
      if(bestEl)bestEl.textContent=`${m.distance} m + 🍩${m.donuts}×10 + 🔵${m.blues}×50 = ${m.total} pts • recorde ${best} pts`;
    }
    const win=document.getElementById("bgVictoryOverlay");
    if(win&&win.classList.contains("show")){
      const score=document.getElementById("bgVictoryScore"),unit=win.querySelector(".bgv-score span");
      if(score)score.textContent=String(m.total);
      if(unit)unit.textContent="pts";
    }
  }

  function decorateList(el){
    if(!el)return;
    const b=board();
    for(const row of el.querySelectorAll(":scope > .rank-row")){
      const cells=row.children;if(!cells[1]||!cells[2])continue;
      const scoreCell=cells[2];if(scoreCell.querySelector(".rank-score-main"))continue;
      const name=clean(cells[1].textContent),key=Object.keys(b).find(k=>clean(k).toLocaleLowerCase()===name.toLocaleLowerCase());
      const v=key&&b[key];
      if(v){
        const score=Math.max(0,Math.floor(Number(v.score)||0));
        const distance=Math.max(0,Math.floor(Number(v.distance)||0));
        const donuts=Math.max(0,Math.floor(Number(v.donuts)||0));
        const blues=Math.max(0,Math.floor(Number(v.blues)||0));
        scoreCell.innerHTML=`<div class="rank-score-main">${score} pts</div><small>${distance} m · 🍩 ${donuts} · 🔵 ${blues}</small>`;
      }
    }
  }

  function refresh(){
    updateEndScreens();
    decorateList(document.getElementById("gameOverRanking"));
    decorateList(document.getElementById("rankingFullList"));
    const sub=document.getElementById("rankingSubtitle");
    if(sub)sub.textContent="Pontos = distância + 10 por rosquinha + 50 por cogumelo azul.";
  }

  for(const id of ["gameOverRanking","rankingFullList"]){
    const el=document.getElementById(id);if(el)new MutationObserver(refresh).observe(el,{childList:true});
  }
  const go=document.getElementById("gameOverOverlay");
  if(go)new MutationObserver(()=>{if(go.style.display==="grid")setTimeout(()=>{saveLocalCurrent();refresh()},0)}).observe(go,{attributes:true,attributeFilter:["style"]});
  const win=document.getElementById("bgVictoryOverlay");
  if(win)new MutationObserver(()=>{if(win.classList.contains("show"))setTimeout(()=>{saveLocalCurrent();refresh()},0)}).observe(win,{attributes:true,attributeFilter:["class"]});
  document.getElementById("rankingOpenBtn")?.addEventListener("click",()=>setTimeout(refresh,0));
  setInterval(()=>{if(document.body.classList.contains("bg-game-active"))updateEndScreens()},500);
  refresh();
})();
