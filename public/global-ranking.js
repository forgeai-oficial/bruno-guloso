(()=>{
  "use strict";
  if(window.__BG_GLOBAL_RANKING_V3__) return;
  window.__BG_GLOBAL_RANKING_V3__=true;

  const LOCAL_KEY="bruno_guloso_local_board_v2";
  const NAME_KEY="bruno_guloso_player_name";
  let lastSubmit="";
  let busy=false;

  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const cleanName=s=>String(s||"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,16);
  const medals=["🥇","🥈","🥉"];

  function metrics(){
    try{if(typeof window.__bgRankingMetrics==="function")return window.__bgRankingMetrics()}catch(e){}
    const distance=Math.max(0,Math.floor(Number(window.__bgLastDistance)||0));
    const donuts=Math.max(0,Math.floor(Number(window.__bgLastDonuts)||Number(window.__bgDonutsCollected)||0));
    const blues=Math.max(0,Math.floor(Number(window.__bgLastBlueMushrooms)||Number(window.__bgBlueMushroomsCollected)||0));
    const donutPoints=donuts*10,bluePoints=blues*50;
    return {distance,donuts,blues,donutPoints,bluePoints,total:distance+donutPoints+bluePoints};
  }

  function normalizeRow(r){
    return {
      name:cleanName(r&&r.name),
      score:Math.max(0,Math.floor(Number(r&&r.score)||0)),
      distance:Math.max(0,Math.floor(Number(r&&r.distance)||0)),
      donuts:Math.max(0,Math.floor(Number(r&&r.donuts)||0)),
      blues:Math.max(0,Math.floor(Number(r&&r.blues)||0)),
      when:Number(r&&r.when)||0
    };
  }

  function localBoard(){try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||"{}")||{}}catch(e){return {}}}
  function localRows(){
    return Object.entries(localBoard()).map(([name,v])=>normalizeRow({name,...(v||{})})).filter(x=>x.name)
      .sort((a,b)=>b.score-a.score||b.distance-a.distance||a.when-b.when).slice(0,200);
  }
  function mergeIntoLocal(rows){
    try{
      const b=localBoard();let changed=false;
      for(const raw of rows||[]){
        const r=normalizeRow(raw);if(!r.name)continue;
        let key=Object.keys(b).find(k=>cleanName(k).toLocaleLowerCase()===r.name.toLocaleLowerCase())||r.name;
        const prev=Number(b[key]&&b[key].score||0);
        if(r.score>prev){b[key]={score:r.score,distance:r.distance,donuts:r.donuts,blues:r.blues,when:r.when||Date.now()};changed=true}
      }
      if(changed)localStorage.setItem(LOCAL_KEY,JSON.stringify(b));
    }catch(e){}
  }

  async function api(method="GET",body=null){
    const opts={method,cache:"no-store",headers:{"Accept":"application/json"}};
    if(body){opts.headers["Content-Type"]="application/json";opts.body=JSON.stringify(body)}
    const r=await fetch("/api/ranking",opts);if(!r.ok)throw new Error("ranking "+r.status);return r.json();
  }

  function scoreHtml(r){
    return `<div class="rank-score-main">${Math.floor(r.score)} pts</div><small>${r.distance} m · 🍩 ${r.donuts} · 🔵 ${r.blues}</small>`;
  }
  function draw(el,rows,limit){
    if(!el)return;
    const arr=(rows||[]).map(normalizeRow).slice(0,limit);
    if(!arr.length){el.innerHTML='<div class="rank-empty">Ainda não tem placar. Seja a primeira vítima.</div>';return}
    const me=cleanName(localStorage.getItem(NAME_KEY)||"").toLocaleLowerCase();
    el.innerHTML=arr.map((r,i)=>`<div class="rank-row rank-top${i+1}${cleanName(r.name).toLocaleLowerCase()===me?" rank-me":""}"><div class="rank-pos">${i<3?medals[i]:`${i+1}º`}</div><div>${esc(r.name)}</div><div class="rank-score">${scoreHtml(r)}</div></div>`).join("");
  }
  function paint(rows){
    window.__bgLastRankingRows=(rows||[]).map(normalizeRow);
    window.__bgLastRankingOnline=true;
    const label=document.getElementById("rankingModeLabel"),sub=document.getElementById("rankingSubtitle");
    if(label)label.textContent="ONLINE";
    if(sub)sub.textContent="Pontos = distância + 10 por rosquinha + 50 por cogumelo azul.";
    draw(document.getElementById("gameOverRanking"),rows,3);
    draw(document.getElementById("rankingFullList"),rows,10);
  }
  async function refresh(){
    if(busy)return window.__bgGlobalRows||[];busy=true;
    try{
      const data=await api("GET"),rows=Array.isArray(data)?data:(data&&data.rows)||[];
      window.__bgGlobalRows=rows.map(normalizeRow);mergeIntoLocal(rows);paint(rows);return window.__bgGlobalRows;
    }catch(e){return window.__bgGlobalRows||[]}
    finally{busy=false}
  }
  async function migrateLocal(){
    const rows=localRows();if(!rows.length)return refresh();
    try{
      const data=await api("POST",{scores:rows}),globalRows=Array.isArray(data)?data:(data&&data.rows)||[];
      window.__bgGlobalRows=globalRows.map(normalizeRow);mergeIntoLocal(globalRows);paint(globalRows);return window.__bgGlobalRows;
    }catch(e){return refresh()}
  }
  async function submitCurrent(){
    const name=cleanName(localStorage.getItem(NAME_KEY)||"");
    const m=metrics(),score=Math.max(0,Math.floor(Number(m.total)||0));
    if(!name||!score)return refresh();
    window.__bgLastScore=score;window.__bgLastDistance=m.distance;window.__bgLastDonuts=m.donuts;window.__bgLastBlueMushrooms=m.blues;
    const sig=`${name.toLocaleLowerCase()}:${score}:${m.distance}:${m.donuts}:${m.blues}`;
    if(sig===lastSubmit)return refresh();lastSubmit=sig;
    try{
      const data=await api("POST",{player:name,score,distance:m.distance,donuts:m.donuts,blues:m.blues}),rows=Array.isArray(data)?data:(data&&data.rows)||[];
      window.__bgGlobalRows=rows.map(normalizeRow);mergeIntoLocal(rows);paint(rows);return window.__bgGlobalRows;
    }catch(e){lastSubmit="";return refresh()}
  }

  const go=document.getElementById("gameOverOverlay");
  if(go)new MutationObserver(()=>{if(go.style.display==="grid")setTimeout(submitCurrent,0)}).observe(go,{attributes:true,attributeFilter:["style"]});
  document.getElementById("rankingOpenBtn")?.addEventListener("click",()=>setTimeout(refresh,0));
  document.getElementById("gameOverTop10Btn")?.addEventListener("click",()=>setTimeout(refresh,0));
  window.addEventListener("focus",refresh);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh()});

  const style=document.createElement("style");
  style.textContent=`.rank-score{display:flex!important;flex-direction:column;align-items:flex-end;gap:2px}.rank-score-main{font-weight:1000}.rank-score small{font-size:9px;opacity:.72;font-weight:800;white-space:nowrap}`;
  document.head.appendChild(style);

  setTimeout(migrateLocal,250);setInterval(refresh,15000);
  window.__bgGlobalRanking={refresh,migrateLocal,submitCurrent,get rows(){return (window.__bgGlobalRows||[]).slice()}};
})();
