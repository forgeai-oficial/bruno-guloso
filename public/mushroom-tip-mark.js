(()=>{
  "use strict";
  if(window.__BG_MUSHROOM_TIP_MARK_V4__)return;
  window.__BG_MUSHROOM_TIP_MARK_V4__=true;

  const patchedSources=new WeakSet();

  function patchCurrentItems(){
    try{
      if(!(window.Enjine&&Enjine.Resources&&Enjine.Resources.Images))return false;
      const src=Enjine.Resources.Images.items;
      if(!src||!src.width||!src.height)return false;
      if(src.__bgMushroomTipPatchedV4||patchedSources.has(src))return true;

      const canvas=document.createElement("canvas");
      canvas.width=src.width;canvas.height=src.height;
      const ctx=canvas.getContext("2d");if(!ctx)return false;
      ctx.imageSmoothingEnabled=false;ctx.drawImage(src,0,0);
      ctx.fillStyle="rgb(70,20,55)";
      ctx.fillRect(8,3,1,3);
      canvas.__bgMushroomTipPatchedV4=true;
      try{patchedSources.add(src)}catch(e){}
      Enjine.Resources.Images.items=canvas;

      try{
        const st=window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State;
        const list=st&&st.Sprites&&st.Sprites.Objects;
        if(Array.isArray(list)&&window.Mario&&Mario.Mushroom){for(const s of list)if(s instanceof Mario.Mushroom)s.Image=canvas}
      }catch(e){}
      return true;
    }catch(e){return false}
  }

  function installDrawGuarantee(){
    try{
      if(!(window.Mario&&Mario.Mushroom&&Mario.Mushroom.prototype&&Mario.NotchSprite))return false;
      const p=Mario.Mushroom.prototype;
      if(p.__bgTipDrawV4)return true;
      p.__bgTipDrawV4=true;
      const original=p.Draw||Mario.NotchSprite.prototype.Draw;
      p.Draw=function(ctx,cam){
        const r=original.call(this,ctx,cam);
        try{
          if(!ctx||this.Visible===false)return r;
          const left=(this.XOld+(this.X-this.XOld)*this.Delta|0)-this.XPicO;
          const top=(this.YOld+(this.Y-this.YOld)*this.Delta|0)-this.YPicO;
          ctx.save();ctx.fillStyle="rgb(70,20,55)";ctx.fillRect(left+8,top+3,1,3);ctx.restore();
        }catch(e){}
        return r;
      };
      return true;
    }catch(e){return false}
  }

  let ticks=0;
  const timer=setInterval(()=>{
    patchCurrentItems();installDrawGuarantee();ticks++;
    if(ticks>1200)clearInterval(timer);
  },100);
  patchCurrentItems();installDrawGuarantee();
  window.__bgMushroomTipMark={allMushrooms:true,x:8,y:3,w:1,h:3};
})();