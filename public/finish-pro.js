(()=>{
  "use strict";
  if(window.__BG_FINISH_PRO__) return;
  window.__BG_FINISH_PRO__=true;

  const style=document.createElement("style");
  style.id="bgFinishProStyle";
  style.textContent=`
    #bgFinishGate{position:fixed;z-index:115;display:none;pointer-events:none;transform:translateX(-50%);transform-origin:center bottom;filter:drop-shadow(0 5px 4px rgba(0,0,0,.26))}
    #bgFinishGate .bgf-poles{position:absolute;inset:0;border-left:4px solid #f5f7ff;border-right:4px solid #f5f7ff;border-radius:3px}
    #bgFinishGate .bgf-tape{position:absolute;left:0;right:0;top:3px;height:24%;border:3px solid #fff;background:conic-gradient(#111 25%,#fff 0 50%,#111 0 75%,#fff 0) 0 0/18px 18px;box-shadow:0 4px 0 rgba(0,0,0,.18)}
    #bgFinishGate .bgf-label{position:absolute;top:29%;left:50%;transform:translateX(-50%);padding:4px 8px;border-radius:999px;background:#ffe45c;color:#171b31;border:2px solid #fff;font:1000 10px/1 system-ui;white-space:nowrap;box-shadow:0 4px 10px rgba(0,0,0,.25)}

    #bgVictoryOverlay{position:fixed;inset:0;z-index:280;display:none;place-items:center;padding:18px;background:radial-gradient(circle at 50% 40%,rgba(52,211,153,.22),transparent 36%),rgba(3,7,20,.88);backdrop-filter:blur(8px);overflow:hidden;font-family:Inter,system-ui,Segoe UI,sans-serif}
    #bgVictoryOverlay.show{display:grid}
    #bgVictoryScene{position:absolute;inset:0;pointer-events:none;overflow:hidden}
    .bgv-confetti{position:absolute;top:-12vh;font-size:clamp(22px,4vw,42px);animation:bgvFall var(--d) linear var(--delay) infinite;left:var(--x);filter:drop-shadow(0 3px 2px rgba(0,0,0,.25))}
    @keyframes bgvFall{0%{transform:translateY(-12vh) rotate(0deg)}100%{transform:translateY(120vh) rotate(680deg)}}
    .bgv-track{position:absolute;left:8%;right:8%;bottom:8%;height:28%;border-bottom:8px solid rgba(255,255,255,.9)}
    .bgv-line{position:absolute;left:48%;bottom:0;width:12px;height:100%;background:repeating-linear-gradient(#fff 0 14px,#111 14px 28px);box-shadow:0 0 0 3px rgba(255,255,255,.35)}
    .bgv-bruno{position:absolute;left:8%;bottom:6px;height:min(24vh,155px);width:auto;object-fit:contain;filter:drop-shadow(0 8px 5px rgba(0,0,0,.28));animation:bgvBruno 2.1s cubic-bezier(.18,.72,.2,1) forwards}
    @keyframes bgvBruno{0%{left:8%;transform:rotate(-3deg) scale(.96)}45%{left:42%;transform:rotate(2deg) scale(1)}62%{left:48%;transform:translateY(-20px) rotate(-7deg) scale(1.08)}100%{left:51%;transform:translateY(0) rotate(2deg) scale(1)}}
    .bgv-fridge{position:absolute;right:6%;bottom:4px;width:min(20vw,150px);height:min(24vh,170px);border:5px solid #e6efff;border-radius:16px;background:linear-gradient(90deg,#dce9f7 0 48%,#b7c9dc 49% 52%,#edf5fc 53%);box-shadow:0 12px 30px rgba(0,0,0,.35);animation:bgvFridge .22s ease-in-out 1.1s 8 alternate}
    .bgv-fridge:before{content:"GELADEIRA";position:absolute;left:50%;top:14%;transform:translateX(-50%);font:1000 11px/1 system-ui;color:#17203c;background:#ffe45c;border-radius:999px;padding:5px 8px}
    .bgv-fridge:after{content:"😡";position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);font-size:min(8vw,52px)}
    @keyframes bgvFridge{from{transform:rotate(-2deg)}to{transform:rotate(2deg)}}
    .bgv-donut{position:absolute;right:13%;bottom:18%;font-size:min(8vw,58px);opacity:0;animation:bgvDonut 1.3s cubic-bezier(.18,.75,.28,1) 1.55s forwards}
    @keyframes bgvDonut{0%{opacity:0;transform:translate(0,0) rotate(0)}12%{opacity:1}100%{opacity:1;transform:translate(-28vw,-12vh) rotate(-540deg)}}

    .bgv-card{position:relative;z-index:2;width:min(680px,94vw);padding:26px;border-radius:30px;background:linear-gradient(180deg,rgba(22,31,79,.98),rgba(10,17,48,.98));border:3px solid rgba(255,255,255,.18);box-shadow:0 34px 100px rgba(0,0,0,.52);color:#fff;text-align:center;opacity:0;transform:translateY(18px) scale(.98);animation:bgvCard .45s ease 2.45s forwards}
    @keyframes bgvCard{to{opacity:1;transform:none}}
    .bgv-kicker{display:inline-flex;padding:8px 12px;border-radius:999px;background:rgba(255,229,94,.16);border:1px solid rgba(255,229,94,.42);color:#fff1a8;font-weight:1000;font-size:12px;letter-spacing:.06em}
    .bgv-card h2{margin:12px 0 7px;font-size:clamp(34px,7vw,68px);line-height:.95;color:#ffe45c;text-shadow:0 4px 0 rgba(0,0,0,.22)}
    .bgv-joke{margin:6px auto 14px;max-width:560px;color:#dce9ff;font-size:clamp(15px,2.4vw,19px);line-height:1.42}
    .bgv-score{display:flex;justify-content:center;align-items:baseline;gap:8px;margin:12px 0 4px;font-weight:1000}.bgv-score strong{font-size:clamp(42px,9vw,82px);color:#fff}.bgv-score span{font-size:20px;color:#9fc5ff}
    .bgv-rank{min-height:27px;margin:5px 0 14px;color:#bde7ff;font-weight:900}
    .bgv-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:16px}
    .bgv-btn{border:0;border-radius:16px;padding:14px 17px;min-width:145px;font:1000 15px/1 system-ui;cursor:pointer}.bgv-btn.primary{background:linear-gradient(#ffe65d,#ffbd17);color:#17203c}.bgv-btn.secondary{background:#26355f;color:#fff;border:2px solid rgba(255,255,255,.14)}
    @media(max-width:700px){#bgVictoryOverlay{padding:10px}.bgv-card{padding:18px;border-radius:22px}.bgv-actions{gap:7px}.bgv-btn{flex:1 1 44%;min-width:0;padding:13px 10px}.bgv-track{bottom:4%;height:22%}.bgv-fridge{right:3%}.bgv-donut{right:9%}}
  `;
  document.head.appendChild(style);

  const gate=document.createElement("div");
  gate.id="bgFinishGate";
  gate.innerHTML='<div class="bgf-poles"></div><div class="bgf-tape"></div><div class="bgf-label">🏁 CHEGADA</div>';
  document.body.appendChild(gate);

  const overlay=document.createElement("div");
  overlay.id="bgVictoryOverlay";
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.innerHTML=`
    <div id="bgVictoryScene">
      <div class="bgv-track"><div class="bgv-line"></div><img class="bgv-bruno" alt=""><div class="bgv-fridge"></div><div class="bgv-donut">🍩</div></div>
    </div>
    <section class="bgv-card">
      <div class="bgv-kicker">🏁 FASE CONCLUÍDA</div>
      <h2>A GELADEIRA PERDEU.</h2>
      <div class="bgv-joke">Depois de quilômetros fugindo da comida, Bruno cruzou a chegada. A geladeira pediu revisão do VAR e um rodízio de emergência.</div>
      <div class="bgv-score"><strong id="bgVictoryScore">0</strong><span>m</span></div>
      <div id="bgVictoryRank" class="bgv-rank">Salvando no ranking geral…</div>
      <div class="bgv-actions">
        <button id="bgVictoryRankBtn" class="bgv-btn secondary" type="button">🏆 VER TOP 10</button>
        <button id="bgVictoryRetryBtn" class="bgv-btn primary" type="button">↻ JOGAR DE NOVO</button>
        <button id="bgVictoryHomeBtn" class="bgv-btn secondary" type="button">⌂ INÍCIO</button>
      </div>
    </section>`;
  document.body.appendChild(overlay);

  const confetti=["🍕","🍩","🍔","🍰","🍦","🍪","🥨","🧁","🏁","✨","🌈"];
  const scene=overlay.querySelector("#bgVictoryScene");
  for(let i=0;i<30;i++){
    const e=document.createElement("span");
    e.className="bgv-confetti";
    e.textContent=confetti[i%confetti.length];
    e.style.setProperty("--x",((i*37)%101)+"%");
    e.style.setProperty("--d",(3.2+(i%7)*.34)+"s");
    e.style.setProperty("--delay",(-((i*19)%40)/10)+"s");
    scene.appendChild(e);
  }

  let victoryActive=false;
  let installed=false;

  const cleanName=v=>String(v||"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,16);
  function playerName(){try{return cleanName(localStorage.getItem("bruno_guloso_player_name")||"")}catch(e){return "Jogador"}}
  function scoreNow(character){
    const x=Math.max(Number(window.__bgRunMaxX)||0,Number(character&&character.X)||0);
    return Math.max(0,Math.floor(x/16));
  }
  function saveLocal(name,score){
    try{
      const board=JSON.parse(localStorage.getItem("bruno_guloso_local_board")||"{}")||{};
      let key=Object.keys(board).find(k=>cleanName(k).toLocaleLowerCase()===name.toLocaleLowerCase())||name;
      if(score>Number(board[key]&&board[key].score||0))board[key]={score,when:Date.now()};
      localStorage.setItem("bruno_guloso_local_board",JSON.stringify(board));
    }catch(e){}
  }
  function releaseKeys(){
    try{
      const P=window.Enjine&&Enjine.KeyboardInput&&Enjine.KeyboardInput.Pressed;
      if(P)Object.keys(P).forEach(k=>P[k]=false);
    }catch(e){}
    window.__jo2JumpHeld=false;
  }
  function positionInRows(rows,name){
    const n=name.toLocaleLowerCase();
    const idx=(rows||[]).findIndex(r=>cleanName(r&&r.name).toLocaleLowerCase()===n);
    return idx<0?0:idx+1;
  }
  function updateRankText(rows,name){
    const el=document.getElementById("bgVictoryRank");
    const pos=positionInRows(rows,name);
    if(pos)el.textContent=`🏆 Resultado salvo • ${pos}º no ranking geral`;
    else el.textContent="🏆 Resultado salvo no ranking geral";
  }
  function submitRanking(name,score){
    const api=window.__bgGlobalRanking;
    if(api&&typeof api.submitCurrent==="function"){
      Promise.resolve(api.submitCurrent()).then(rows=>updateRankText(rows,name)).catch(()=>{
        document.getElementById("bgVictoryRank").textContent="✓ Resultado salvo neste aparelho • online será sincronizado depois";
      });
      return;
    }
    fetch("/api/ranking",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({player:name,score}),cache:"no-store"})
      .then(r=>r.ok?r.json():Promise.reject(new Error("ranking")))
      .then(data=>updateRankText((data&&data.rows)||[],name))
      .catch(()=>{document.getElementById("bgVictoryRank").textContent="✓ Resultado salvo neste aparelho • online será sincronizado depois"});
  }

  function showVictory(character){
    if(victoryActive)return;
    victoryActive=true;
    window.__bgVictoryActive=true;
    window.__bgGameOverActive=true;
    window.__bgPaused=true;
    releaseKeys();
    try{if(character&&character.World)character.World.Paused=true}catch(e){}
    if(character){character.WinTime=0;character.DeathTime=0;character.Xa=0;character.Ya=0}

    const name=playerName()||"Jogador";
    const score=scoreNow(character);
    window.__bgLastScore=score;
    saveLocal(name,score);
    document.getElementById("bgVictoryScore").textContent=String(score);
    document.getElementById("bgVictoryRank").textContent="Salvando no ranking geral…";

    const source=document.getElementById("brunoHD");
    const mini=overlay.querySelector(".bgv-bruno");
    if(source&&source.src)mini.src=source.src;
    else mini.style.display="none";

    overlay.classList.add("show");
    try{window.__bgAudio&&window.__bgAudio.sfx&&window.__bgAudio.sfx("exit")}catch(e){}
    submitRanking(name,score);
  }

  function isFinal(character){
    try{
      const level=character&&character.World&&character.World.Level;
      if(!level)return false;
      const max=Number(window.__jo2MaxLevelWidth)||6400;
      return Number(level.Width)>=max;
    }catch(e){return false}
  }

  function installWinHook(){
    try{
      if(!(window.Mario&&Mario.Character&&Mario.Character.prototype&&typeof Mario.Character.prototype.Win==="function"))return false;
      const proto=Mario.Character.prototype;
      if(proto.Win.__bgFinishWrapped)return true;
      const original=proto.Win;
      const wrapped=function(){
        if(isFinal(this)){showVictory(this);return}
        return original.apply(this,arguments);
      };
      wrapped.__bgFinishWrapped=true;
      wrapped.__bgOriginal=original;
      proto.Win=wrapped;
      installed=true;
      return true;
    }catch(e){return false}
  }

  function renderGate(){
    try{
      if(victoryActive){gate.style.display="none";requestAnimationFrame(renderGate);return}
      const app=window.__jo2app;
      const st=app&&app.stateContext&&app.stateContext.State;
      const level=st&&st.Level;
      const canvas=document.getElementById("canvas");
      const max=Number(window.__jo2MaxLevelWidth)||6400;
      if(!level||!canvas||Number(level.Width)<max){gate.style.display="none";requestAnimationFrame(renderGate);return}
      const r=canvas.getBoundingClientRect();
      const sx=r.width/320,sy=r.height/240;
      const wx=Number(level.ExitX)*16;
      const cam=Number(st.Camera&&st.Camera.X)||0;
      const screenX=wx-cam;
      if(screenX<-45||screenX>365){gate.style.display="none";requestAnimationFrame(renderGate);return}
      const baseY=Number(level.ExitY)*16;
      const logicalH=112;
      gate.style.left=(r.left+screenX*sx)+"px";
      gate.style.top=(r.top+Math.max(4,baseY-logicalH)*sy)+"px";
      gate.style.width=Math.max(42,34*sx)+"px";
      gate.style.height=Math.max(90,logicalH*sy)+"px";
      gate.style.display="block";
    }catch(e){gate.style.display="none"}
    requestAnimationFrame(renderGate);
  }

  function closeVictory(){overlay.classList.remove("show")}
  document.getElementById("bgVictoryRetryBtn").addEventListener("click",()=>{
    closeVictory();victoryActive=false;window.__bgVictoryActive=false;
    document.getElementById("retryBtn")?.click();
  });
  document.getElementById("bgVictoryHomeBtn").addEventListener("click",()=>{
    closeVictory();victoryActive=false;window.__bgVictoryActive=false;
    document.getElementById("gameOverHomeBtn")?.click();
  });
  document.getElementById("bgVictoryRankBtn").addEventListener("click",()=>{
    closeVictory();
    const rank=document.getElementById("rankingOpenBtn");
    if(rank)rank.click();
    else overlay.classList.add("show");
  });
  document.getElementById("rankingCloseBtn")?.addEventListener("click",()=>{
    if(victoryActive)setTimeout(()=>overlay.classList.add("show"),0);
  });

  if(!installWinHook()){
    const t=setInterval(()=>{if(installWinHook())clearInterval(t)},50);
    setTimeout(()=>clearInterval(t),10000);
  }
  requestAnimationFrame(renderGate);
  window.__bgFinishPro={get installed(){return installed},get active(){return victoryActive},showVictory};
})();
