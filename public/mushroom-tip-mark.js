(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_TIP_MARK_V2__)return;
  window.__BG_MUSHROOM_TIP_MARK_V2__=true;

  function install(){
    try{
      if(!(window.Mario&&Mario.Mushroom&&Mario.Mushroom.prototype))return false;
      const proto=Mario.Mushroom.prototype;
      const original=proto.Draw;
      if(typeof original!=="function")return false;
      if(original.__bgTipMarkV2Wrapped)return true;

      const wrapped=function(ctx){
        original.apply(this,arguments);
        if(!this.Visible||!ctx)return;
        try{
          const x=((this.XOld+(this.X-this.XOld)*this.Delta)|0)-this.XPicO;
          const y=((this.YOld+(this.Y-this.YOld)*this.Delta)|0)-this.YPicO;
          ctx.save();
          ctx.fillStyle="rgba(77,20,56,.98)";
          // O sprite real do cogumelo começa no y+3. O risco entra na própria ponta.
          ctx.fillRect(Math.round(x+8),Math.round(y+3),1,3);
          ctx.restore();
        }catch(e){}
      };
      wrapped.__bgTipMarkV2Wrapped=true;
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
