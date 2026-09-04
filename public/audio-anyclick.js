(()=>{
  "use strict";
  if(window.__BG_AUDIO_ANYCLICK__) return;
  window.__BG_AUDIO_ANYCLICK__=true;

  let done=false;
  function startMusic(){
    if(done) return;
    const audio=window.__bgAudio;
    if(!audio) return;
    if(!audio.enabled) return; // respeita quem desligou o som manualmente
    if(audio.unlocked){ done=true; return; }
    try{
      audio.enable();
      setTimeout(()=>{ if(window.__bgAudio?.unlocked) done=true; },30);
    }catch(e){}
  }

  ["pointerdown","mousedown","touchstart","click","keydown"].forEach(type=>{
    window.addEventListener(type,startMusic,{capture:true,passive:type!=="keydown"});
    document.addEventListener(type,startMusic,{capture:true,passive:type!=="keydown"});
  });
})();
