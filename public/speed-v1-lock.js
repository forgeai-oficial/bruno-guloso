(()=>{
  "use strict";
  if(window.__BG_SPEED_V2_LOCK__)return;
  window.__BG_SPEED_V2_LOCK__=true;

  // Um pouco mais lento que a V1, sem mexer no salto/gravidade.
  const GROUND=0.88;
  const AIR=0.88;

  function apply(c){
    if(!c)return;
    c.GroundInertia=GROUND;
    c.AirInertia=AIR;
  }

  function install(){
    try{
      if(!(window.Mario&&Mario.Character&&Mario.Character.prototype))return false;
      const p=Mario.Character.prototype;
      if(p.__bgSpeedV2Lock)return true;
      p.__bgSpeedV2Lock=true;
      const init=p.Initialize;
      p.Initialize=function(){const r=init.apply(this,arguments);apply(this);return r};
      const move=p.Move;
      p.Move=function(){apply(this);return move.apply(this,arguments)};
      try{apply(Mario.MarioCharacter)}catch(e){}
      return true;
    }catch(e){return false}
  }

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},50);
    setTimeout(()=>clearInterval(timer),10000);
  }
  window.__bgSpeedV2={groundInertia:GROUND,airInertia:AIR};
})();
