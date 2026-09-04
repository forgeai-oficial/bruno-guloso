(()=>{
  "use strict";
  if(window.__BG_AUDIO_FIX_V3__) return;
  window.__BG_AUDIO_FIX_V3__=true;

  const AC=window.AudioContext||window.webkitAudioContext;
  let ctx=null;
  function ensure(){
    if(!AC) return null;
    if(!ctx){ try{ctx=new AC()}catch(e){return null} }
    try{ if(ctx.state!=="running") ctx.resume().catch(()=>{}); }catch(e){}
    return ctx;
  }
  function env(g,a,b,t0,t1){
    g.gain.cancelScheduledValues(t0);
    g.gain.setValueAtTime(Math.max(.0001,a),t0);
    g.gain.exponentialRampToValueAtTime(Math.max(.0001,b),t1);
  }
  function tone(f0,f1,dur,vol,type="square",delay=0){
    const c=ensure(); if(!c||c.state!=="running") return;
    const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
    env(g,vol,.0001,t,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.02);
  }
  function clickNoise(dur=.045,vol=.12,delay=0){
    const c=ensure(); if(!c||c.state!=="running") return;
    const t=c.currentTime+delay,n=Math.max(1,Math.floor(c.sampleRate*dur)),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
    const src=c.createBufferSource(),bp=c.createBiquadFilter(),g=c.createGain();src.buffer=buf;bp.type="bandpass";bp.frequency.value=780;bp.Q.value=.8;
    env(g,vol,.0001,t,t+dur);src.connect(bp);bp.connect(g);g.connect(c.destination);src.start(t);src.stop(t+dur+.01);
  }
  function classicStomp(){
    tone(390,145,.055,.18,"square",0);
    tone(145,62,.09,.16,"triangle",.004);
    clickNoise(.05,.14,.002);
    tone(520,230,.035,.08,"square",.032);
  }

  function tryAutoplay(){
    try{
      if(window.__bgAudio&&typeof window.__bgAudio.enable==="function") window.__bgAudio.enable();
    }catch(e){}
    ensure();
  }

  function fixLabel(){
    const b=document.getElementById("bgAudioBtn");
    if(!b) return;
    const on=b.dataset.on!=="0";
    const wanted=on?"🔊 MÚSICA + SOM":"🔇 SEM SOM";
    if(b.textContent!==wanted) b.textContent=wanted;
    b.title="Ligar ou desligar música e efeitos";
  }

  function installStompBoost(){
    try{
      const p=window.Mario&&Mario.Character&&Mario.Character.prototype;
      if(!p||typeof p.Stomp!=="function") return false;
      if(p.Stomp.__bgStompBoostV3) return true;
      const original=p.Stomp;
      const wrapped=function(target){
        const r=original.call(this,target);
        classicStomp();
        return r;
      };
      wrapped.__bgStompBoostV3=true;
      wrapped.__bgOriginal=original;
      p.Stomp=wrapped;
      return true;
    }catch(e){return false}
  }

  tryAutoplay();
  setTimeout(tryAutoplay,80);
  setTimeout(tryAutoplay,350);
  setTimeout(tryAutoplay,1200);
  ["pointerdown","touchstart","keydown","click"].forEach(ev=>document.addEventListener(ev,tryAutoplay,{capture:true,passive:true,once:false}));

  fixLabel();
  const timer=setInterval(()=>{fixLabel();installStompBoost();},120);
  setTimeout(()=>clearInterval(timer),30000);
})();
