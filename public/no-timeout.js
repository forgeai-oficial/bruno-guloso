(()=>{
  "use strict";
  if(window.__BG_NO_TIMEOUT__) return;
  window.__BG_NO_TIMEOUT__=true;

  function install(){
    try{
      if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype&&typeof Mario.LevelState.prototype.Update==="function")) return false;
      const proto=Mario.LevelState.prototype;
      if(proto.Update.__bgNoTimeoutWrapped) return true;
      const original=proto.Update;
      const wrapped=function(delta){
        if(Number.isFinite(this.TimeLeft) && this.TimeLeft < 3600) this.TimeLeft=3600;
        return original.call(this,delta);
      };
      wrapped.__bgNoTimeoutWrapped=true;
      wrapped.__bgOriginal=original;
      proto.Update=wrapped;
      return true;
    }catch(e){ return false; }
  }

  if(!install()){
    const t=setInterval(()=>{ if(install()) clearInterval(t); },50);
    setTimeout(()=>clearInterval(t),10000);
  }
})();
