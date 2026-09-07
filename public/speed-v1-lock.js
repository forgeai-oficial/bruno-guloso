(()=>{
  "use strict";
  if(window.__BG_SPEED_V4_LOCK__)return;
  window.__BG_SPEED_V4_LOCK__=true;

  // Redução horizontal adicional. Salto e gravidade permanecem intactos.
  const GROUND=0.86;
  const AIR=0.86;

  function apply(c){
    if(!c)return;
    c.GroundInertia=GROUND;
    c.AirInertia=AIR;
  }

  function install(){
    try{
      if(!(window.Mario&&Mario.Character&&Mario.Character.prototype))return false;
      const p=Mario.Character.prototype;
      if(p.__bgSpeedV4Lock)return true;
      p.__bgSpeedV4Lock=true;
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
  window.__bgSpeedV4={groundInertia:GROUND,airInertia:AIR};
})();
