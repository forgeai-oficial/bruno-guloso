(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_TIP_MARK__)return;
  window.__BG_MUSHROOM_TIP_MARK__=true;

  function install(){
    try{
      if(!(window.Mario&&Mario.Mushroom&&Mario.Mushroom.prototype))return false;
      const proto=Mario.Mushroom.prototype;
      const original=proto.Draw;
      if(typeof original!=="function")return false;
      if(original.__bgTipMarkWrapped)return true;

      const wrapped=function(ctx){
        original.apply(this,arguments);
        if(!this.Visible||!ctx)return;
        try{
          const x=((this.XOld+(this.X-this.XOld)*this.Delta)|0)-this.XPicO;
          const y=((this.YOld+(this.Y-this.YOld)*this.Delta)|0)-this.YPicO;
          ctx.save();
          ctx.fillStyle="rgba(73,24,58,.95)";
          // Risquinho vertical minúsculo: 1 px de largura x 2 px de altura,
          // exatamente no centro do topo do cogumelo.
          ctx.fillRect(Math.round(x+8),Math.round(y+1),1,2);
          ctx.restore();
        }catch(e){}
      };
      wrapped.__bgTipMarkWrapped=true;
      wrapped.__bgOriginal=original;
      proto.Draw=wrapped;
      return true;
    }catch(e){return false}
  }

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},60);
    setTimeout(()=>clearInterval(timer),10000);
  }
})();
