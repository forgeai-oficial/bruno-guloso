(()=>{
  "use strict";
  if(window.__BG_GLOBAL_RANKING__) return;
  window.__BG_GLOBAL_RANKING__=true;

  const LOCAL_KEY="bruno_guloso_local_board";
  const NAME_KEY="bruno_guloso_player_name";
  let lastSubmit="";
  let busy=false;

  const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const cleanName=s=>String(s||"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,16);
  const medals=["🥇","🥈","🥉"];

  function localBoard(){
    try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||"{}")||{}}catch(e){return {}}
  }
  function localRows(){
    const b=localBoard();
    return Object.entries(b).map(([name,v])=>({name:cleanName(name),score:Math.max(0,Math.floor(Number(v&&v.score||0))),when:Number(v&&v.when||0)}))
      .filter(x=>x.name).sort((a,b)=>b.score-a.score||a.when-b.when).slice(0,200);
  }
  function mergeIntoLocal(rows){
    try{
      const b=localBoard();
      let changed=false;
      for(const r of rows||[]){
        const name=cleanName(r.name); const score=Math.max(0,Math.floor(Number(r.score)||0));
        if(!name) continue;
        let existingKey=Object.keys(b).find(k=>cleanName(k).toLocaleLowerCase()===name.toLocaleLowerCase());
        if(!existingKey) existingKey=name;
        const prev=Number(b[existingKey]&&b[existingKey].score||0);
        if(score>prev){b[existingKey]={score,when:Number(r.when||Date.now())};changed=true;}
      }
      if(changed)localStorage.setItem(LOCAL_KEY,JSON.stringify(b));
    }catch(e){}
  }
  async function api(method="GET",body=null){
    const opts={method,cache:"no-store",headers:{"Accept":"application/json"}};
    if(body){opts.headers["Content-Type"]="application/json";opts.body=JSON.stringify(body)}
    const r=await fetch("/api/ranking",opts);
    if(!r.ok)throw new Error("ranking "+r.status);
    return r.json();
  }
  function draw(el,rows,limit){
    if(!el)return;
    const arr=(rows||[]).slice(0,limit);
    if(!arr.length){el.innerHTML='<div class="rank-empty">Ainda não tem placar. Seja a primeira vítima.</div>';return}
    const me=cleanName(localStorage.getItem(NAME_KEY)||"").toLocaleLowerCase();
    el.innerHTML=arr.map((r,i)=>`<div class="rank-row rank-top${i+1}${cleanName(r.name).toLocaleLowerCase()===me?" rank-me":""}"><div class="rank-pos">${i<3?medals[i]:`${i+1}º`}</div><div>${esc(r.name)}</div><div class="rank-score">${Math.floor(r.score)} m</div></div>`).join("");
  }
  function paint(rows){
    window.__bgLastRankingRows=(rows||[]).slice();
    window.__bgLastRankingOnline=true;
    const label=document.getElementById("rankingModeLabel");
    const sub=document.getElementById("rankingSubtitle");
    if(label)label.textContent="ONLINE";
    if(sub)sub.textContent="Ranking geral entre todos os jogadores e dispositivos.";
    draw(document.getElementById("gameOverRanking"),rows,3);
    draw(document.getElementById("rankingFullList"),rows,10);
  }
  async function refresh(){
    if(busy)return window.__bgGlobalRows||[];
    busy=true;
    try{
      const data=await api("GET");
      const rows=Array.isArray(data)?data:(data&&data.rows)||[];
      window.__bgGlobalRows=rows;
      mergeIntoLocal(rows);
      paint(rows);
      return rows;
    }catch(e){return window.__bgGlobalRows||[]}
    finally{busy=false}
  }
  async function migrateLocal(){
    const rows=localRows();
    if(!rows.length)return refresh();
    try{
      const data=await api("POST",{scores:rows});
      const globalRows=Array.isArray(data)?data:(data&&data.rows)||[];
      window.__bgGlobalRows=globalRows; mergeIntoLocal(globalRows); paint(globalRows); return globalRows;
    }catch(e){return refresh()}
  }
  async function submitCurrent(){
    const name=cleanName(localStorage.getItem(NAME_KEY)||"");
    const score=Math.max(0,Math.floor(Number(window.__bgLastScore)||0));
    if(!name||!score)return refresh();
    const sig=name.toLocaleLowerCase()+":"+score;
    if(sig===lastSubmit)return refresh();
    lastSubmit=sig;
    try{
      const data=await api("POST",{player:name,score});
      const rows=Array.isArray(data)?data:(data&&data.rows)||[];
      window.__bgGlobalRows=rows; mergeIntoLocal(rows); paint(rows); return rows;
    }catch(e){lastSubmit="";return refresh()}
  }

  const go=document.getElementById("gameOverOverlay");
  if(go){
    new MutationObserver(()=>{if(go.style.display==="grid")setTimeout(submitCurrent,0)}).observe(go,{attributes:true,attributeFilter:["style"]});
  }
  document.getElementById("rankingOpenBtn")?.addEventListener("click",()=>setTimeout(refresh,0));
  document.getElementById("gameOverTop10Btn")?.addEventListener("click",()=>setTimeout(refresh,0));
  window.addEventListener("focus",refresh);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh()});

  setTimeout(migrateLocal,250);
  setInterval(refresh,15000);
  window.__bgGlobalRanking={refresh,migrateLocal,submitCurrent,get rows(){return (window.__bgGlobalRows||[]).slice()}};
})();