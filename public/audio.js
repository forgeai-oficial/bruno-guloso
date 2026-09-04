(()=>{
  "use strict";
  if(window.__BG_AUDIO_INSTALLED__) return;
  window.__BG_AUDIO_INSTALLED__=true;

  const STORE_KEY="bruno_guloso_audio";
  const AC=window.AudioContext||window.webkitAudioContext;
  let ctx=null,master=null,musicBus=null,sfxBus=null;
  let enabled=true,unlocked=false,nextStepTime=0,musicStep=0,lastTheme=-1;
  let prevGround=true,lastFoot=0,lastFoodAt=0,lastFoodX=-99999,inStomp=false;
  let firstUnlock=true;
  try{enabled=localStorage.getItem(STORE_KEY)!=="off"}catch(e){}

  const style=document.createElement("style");
  style.id="bgAudioStyle";
  style.textContent=`
    #bgAudioBtn{position:fixed;right:184px;top:12px;z-index:130;min-width:106px;height:48px;padding:0 13px;border-radius:15px;border:2px solid rgba(255,255,255,.25);background:rgba(7,14,34,.94);color:#fff;font:900 13px/1 Inter,system-ui,Segoe UI,sans-serif;letter-spacing:.02em;cursor:pointer;box-shadow:0 7px 25px rgba(0,0,0,.28);backdrop-filter:blur(8px);transition:transform .12s ease,opacity .12s ease}
    #bgAudioBtn:hover{transform:translateY(-1px)}#bgAudioBtn:active{transform:translateY(1px) scale(.98)}#bgAudioBtn[data-on="0"]{opacity:.72}
    #bgAudioHint{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:135;padding:10px 15px;border-radius:999px;background:rgba(7,14,34,.94);border:2px solid rgba(255,255,255,.22);color:#fff;font:900 12px/1.2 Inter,system-ui,Segoe UI,sans-serif;letter-spacing:.025em;box-shadow:0 10px 28px rgba(0,0,0,.3);pointer-events:none;animation:bgAudioPulse 1.15s ease-in-out infinite alternate;white-space:nowrap}
    #bgAudioHint[hidden]{display:none!important}@keyframes bgAudioPulse{from{transform:translateX(-50%) scale(.98);opacity:.78}to{transform:translateX(-50%) scale(1.03);opacity:1}}
    @media(max-width:760px){#bgAudioBtn{right:154px;top:7px;height:42px;min-width:90px;padding:0 9px;border-radius:12px;font-size:11px}#bgAudioHint{bottom:86px;font-size:11px;max-width:88vw;white-space:normal;text-align:center}}
  `;
  document.head.appendChild(style);

  const btn=document.createElement("button");
  btn.id="bgAudioBtn";btn.type="button";btn.title="Ligar ou desligar música e efeitos";
  document.body.appendChild(btn);
  const hint=document.createElement("div");
  hint.id="bgAudioHint";hint.textContent="🎵 CLIQUE UMA VEZ PARA ATIVAR A MÚSICA";
  document.body.appendChild(hint);

  function paintButton(){btn.dataset.on=enabled?"1":"0";btn.setAttribute("aria-pressed",enabled?"true":"false");btn.textContent=enabled?"🔊 MÚSICA + SOM":"🔇 SEM SOM"}
  paintButton();

  function initAudio(){
    if(!AC||ctx)return;
    try{
      ctx=new AC();master=ctx.createGain();musicBus=ctx.createGain();sfxBus=ctx.createGain();
      master.gain.value=.86;musicBus.gain.value=.52;sfxBus.gain.value=.76;
      musicBus.connect(master);sfxBus.connect(master);master.connect(ctx.destination);nextStepTime=ctx.currentTime+.04;
    }catch(e){ctx=null}
  }

  function expo(g,a,b,t0,t1){const start=Math.max(ctx.currentTime,t0);g.gain.cancelScheduledValues(start);g.gain.setValueAtTime(Math.max(.0001,a),start);g.gain.exponentialRampToValueAtTime(Math.max(.0001,b),Math.max(start+.005,t1))}

  function tone(freq,dur=.09,type="square",vol=.08,when=null,endFreq=null,bus=sfxBus){
    if(!enabled||!unlocked||!ctx||ctx.state!=="running")return;
    const t=when==null?ctx.currentTime:Math.max(ctx.currentTime,when),o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(Math.max(25,freq),t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(25,endFreq),t+dur);
    expo(g,vol,.0001,t,t+dur);o.connect(g);g.connect(bus||sfxBus);o.start(t);o.stop(t+dur+.015)
  }

  function noise(dur=.05,vol=.04,when=null,highpass=700,bus=sfxBus){
    if(!enabled||!unlocked||!ctx||ctx.state!=="running")return;
    const t=when==null?ctx.currentTime:Math.max(ctx.currentTime,when),n=Math.max(1,Math.floor(ctx.sampleRate*dur));
    const b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=b;f.type="highpass";f.frequency.value=highpass;expo(g,vol,.0001,t,t+dur);src.connect(f);f.connect(g);g.connect(bus||sfxBus);src.start(t);src.stop(t+dur+.01)
  }

  const midi=n=>440*Math.pow(2,(n-69)/12);
  const arp=(notes,step=.055,type="square",vol=.07)=>{if(!ctx)return;const t=ctx.currentTime+.005;notes.forEach((n,i)=>tone(midi(n),step*.95,type,vol,t+i*step,null,sfxBus))};

  function sfx(name){
    if(!enabled||!unlocked||!ctx||ctx.state!=="running")return 0;
    const t=ctx.currentTime+.003;
    switch(String(name||"").toLowerCase()){
      case"jump":tone(330,.08,"square",.085,t,570);tone(165,.07,"triangle",.035,t,245);break;
      case"land":tone(105,.055,"triangle",.085,t,70);noise(.04,.03,t,350);break;
      case"step":tone(112,.024,"triangle",.028,t,88);noise(.018,.01,t,560);break;
      case"bump":tone(150,.055,"square",.08,t,105);noise(.03,.026,t,500);break;
      case"breakblock":noise(.08,.08,t,420);tone(120,.065,"sawtooth",.065,t,65);tone(205,.045,"square",.04,t+.018,92);break;
      case"coin":tone(988,.045,"square",.072,t);tone(1319,.075,"square",.068,t+.045);break;
      case"kick":tone(180,.05,"square",.07,t,105);noise(.04,.035,t,700);break;
      case"stomp":
        tone(92,.09,"triangle",.13,t,48);noise(.07,.085,t,260);tone(265,.055,"square",.085,t+.018,115);tone(520,.04,"square",.045,t+.05,360);break;
      case"powerup":case"sprout":arp([60,64,67,72,76],.055,"square",.065);break;
      case"powerdown":arp([72,67,63,58],.07,"sawtooth",.06);break;
      case"fireball":tone(520,.05,"square",.065,t,230);noise(.03,.03,t,1200);break;
      case"cannon":tone(90,.12,"sawtooth",.09,t,42);noise(.09,.07,t,250);break;
      case"1up":arp([67,72,76,79,84],.05,"square",.07);break;
      case"exit":arp([60,64,67,72,76,79,84],.07,"square",.07);tone(midi(48),.5,"triangle",.06,t+.1,null,sfxBus);break;
      case"death":tone(294,.12,"square",.08,t,247);tone(247,.16,"square",.08,t+.12,196);tone(196,.22,"sawtooth",.075,t+.28,110);tone(98,.35,"triangle",.065,t+.46,55);break;
      case"food":tone(392,.09,"sine",.06,t,440);tone(523,.11,"sine",.055,t+.08,587);tone(659,.14,"triangle",.05,t+.17,698);break;
      case"ui":tone(440,.035,"square",.04,t,520);break;
      case"start":arp([60,64,67,72],.06,"square",.06);break;
      default:tone(220,.04,"square",.03,t,245)
    }
    return 0
  }

  async function unlockAudio(){
    if(!enabled)return;initAudio();if(!ctx)return;
    try{if(ctx.state!=="running")await ctx.resume()}catch(e){}
    unlocked=ctx.state==="running";
    if(unlocked){hint.hidden=true;if(firstUnlock){firstUnlock=false;nextStepTime=ctx.currentTime+.02;setTimeout(()=>sfx("start"),15)}}
  }

  function installEngineHook(){
    try{
      if(window.Enjine&&Enjine.Resources){Enjine.Resources.PlaySound=function(name){if(inStomp&&String(name).toLowerCase()==="kick")return 0;return sfx(name)};return true}
    }catch(e){}return false
  }

  function installStompHook(){
    try{
      if(!(window.Mario&&Mario.Character&&Mario.Character.prototype&&typeof Mario.Character.prototype.Stomp==="function"))return false;
      const proto=Mario.Character.prototype;if(proto.Stomp.__bgAudioWrapped)return true;
      const original=proto.Stomp;
      const wrapped=function(target){
        let result;inStomp=true;
        try{result=original.call(this,target)}finally{inStomp=false}
        sfx("stomp");return result
      };
      wrapped.__bgAudioWrapped=true;wrapped.__bgOriginal=original;proto.Stomp=wrapped;return true
    }catch(e){}return false
  }

  const hookTimer=setInterval(()=>{const a=installEngineHook(),b=installStompHook();if(a&&b)clearInterval(hookTimer)},100);

  const THEMES=[
    {name:"Corrida Gulosa",tempo:.165,lead:[72,null,76,79,76,null,74,72,67,null,72,74,76,null,74,67,72,null,76,79,81,79,76,74,72,67,69,71,72,null,67,null],bass:[48,null,null,null,55,null,null,null,53,null,null,null,55,null,null,null,48,null,null,null,55,null,null,null,53,null,50,null,48,null,43,null]},
    {name:"Operação Padaria",tempo:.158,lead:[74,null,77,81,79,77,74,null,69,null,72,74,77,74,72,null,76,null,79,83,81,79,76,74,72,74,76,77,79,null,72,null],bass:[50,null,null,null,57,null,null,null,55,null,null,null,57,null,null,null,52,null,null,null,59,null,null,null,55,null,52,null,50,null,45,null]},
    {name:"Última Fatia",tempo:.145,lead:[76,79,83,81,79,76,74,76,79,81,84,83,81,79,76,74,72,76,79,83,81,79,76,74,77,81,84,81,79,76,72,71],bass:[52,null,59,null,57,null,55,null,52,null,60,null,59,null,57,null,48,null,55,null,53,null,52,null,50,null,57,null,55,null,52,null]}
  ];

  function musicAllowed(){return!!(enabled&&unlocked&&ctx&&ctx.state==="running"&&document.visibilityState!=="hidden"&&!window.__bgPaused&&!window.__bgGameOverActive)}
  function themeIndex(){try{const m=window.Mario&&Mario.MarioCharacter,s=window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State;if(!m||!s||!s.Level)return 0;const r=(m.X||0)/Math.max(1,s.Level.Width*16);return r>.68?2:r>.34?1:0}catch(e){return 0}}

  function scheduleMusicStep(t){
    const idx=themeIndex(),th=THEMES[idx],i=musicStep%th.lead.length;
    if(idx!==lastTheme){lastTheme=idx;tone(midi(60+idx*2),.11,"triangle",.055,t,null,musicBus);tone(midi(67+idx*2),.1,"square",.038,t+.045,null,musicBus)}
    const ln=th.lead[i],bn=th.bass[i];
    if(ln!=null){tone(midi(ln),th.tempo*.78,"square",.07,t,null,musicBus);if(i%8===0)tone(midi(ln-12),th.tempo*.62,"triangle",.028,t,null,musicBus)}
    if(bn!=null)tone(midi(bn),th.tempo*1.85,"triangle",.075,t,null,musicBus);
    if(i%4===0){tone(78,.055,"triangle",.065,t,48,musicBus);noise(.025,.025,t,420,musicBus)}
    if(i%4===2)noise(.018,.02,t,2600,musicBus);
    if(i%8===4)tone(205,.03,"triangle",.035,t,155,musicBus)
  }

  setInterval(()=>{
    if(!ctx||!enabled||!unlocked)return;
    if(!musicAllowed()){nextStepTime=ctx.currentTime+.05;return}
    if(nextStepTime<ctx.currentTime-.2)nextStepTime=ctx.currentTime+.02;
    while(nextStepTime<ctx.currentTime+.18){const th=THEMES[themeIndex()];scheduleMusicStep(nextStepTime);nextStepTime+=th.tempo;musicStep++}
  },40);

  function maybeFoodSting(m){const now=performance.now();if(now-lastFoodAt<1800)return;let nearest=99999,wx=null;document.querySelectorAll(".food-world-prop[data-wx]").forEach(el=>{const x=Number(el.dataset.wx);if(!Number.isFinite(x))return;const d=Math.abs(x-(m.X||0));if(d<nearest){nearest=d;wx=x}});if(nearest<78&&Math.abs((wx||0)-lastFoodX)>20){lastFoodAt=now;lastFoodX=wx||0;sfx("food")}}

  setInterval(()=>{try{if(!(window.__ready&&musicAllowed()))return;const m=window.Mario&&Mario.MarioCharacter;if(!m)return;const now=performance.now();if(!prevGround&&m.OnGround)sfx("land");prevGround=!!m.OnGround;const speed=Math.abs(Number(m.Xa)||0);if(m.OnGround&&speed>.42&&now-lastFoot>Math.max(145,265-speed*10)){lastFoot=now;sfx("step")}maybeFoodSting(m)}catch(e){}},60);

  function setEnabled(on){enabled=!!on;try{localStorage.setItem(STORE_KEY,enabled?"on":"off")}catch(e){}paintButton();if(enabled){hint.hidden=unlocked;unlockAudio().then(()=>{sfx("ui");nextStepTime=ctx?ctx.currentTime+.03:0})}else{hint.hidden=true;if(ctx){try{master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(.0001,ctx.currentTime,.025)}catch(e){}setTimeout(()=>{if(ctx&&master)master.gain.value=.86},120)}}}

  btn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();setEnabled(!enabled)});
  const gesture=()=>unlockAudio();
  document.addEventListener("pointerdown",gesture,{capture:true,passive:true});document.addEventListener("touchstart",gesture,{capture:true,passive:true});document.addEventListener("keydown",gesture,{capture:true});
  document.addEventListener("click",e=>{const x=e.target&&e.target.closest?e.target.closest("button"):null;if(!x||x===btn)return;const id=x.id||"";if(id==="startBtn")setTimeout(()=>sfx("start"),25);else if(["pauseBtn","resumeBtn","pauseRetryBtn","pauseHomeBtn","retryBtn","gameOverHomeBtn","rankingOpenBtn","rankingCloseBtn"].includes(id))sfx("ui")},true);

  // Autoplay with sound is blocked by modern browsers. Try anyway; if blocked, the hint stays visible.
  if(enabled){initAudio();unlockAudio();setTimeout(()=>{if(!unlocked)hint.hidden=false},250)}else hint.hidden=true;

  window.__bgAudio={version:"2.0.0",sfx,enable:()=>setEnabled(true),disable:()=>setEnabled(false),toggle:()=>setEnabled(!enabled),get enabled(){return enabled},get unlocked(){return unlocked},themes:THEMES.map(x=>x.name)};
})();
