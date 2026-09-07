(()=>{
  "use strict";
  if(window.__BG_MOBILE_SIDE_VIEWPORT__)return;
  window.__BG_MOBILE_SIDE_VIEWPORT__=true;

  const isMobile=()=>matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0||innerWidth<=1100;
  const isLandscape=()=>innerWidth>innerHeight;

  const style=document.createElement("style");
  style.id="bgMobileSideViewportStyle";
  style.textContent=`
    @media (max-width:1100px),(pointer:coarse){
      #bgSideViewport{
        position:fixed;
        inset:0;
        z-index:0;
        display:none;
        width:100vw;
        height:var(--bg-app-h);
        pointer-events:none;
        image-rendering:pixelated;
        background:#0b142a;
      }
      body.bg-game-active:not(.bg-orientation-blocked) #bgSideViewport{display:block}
      body.bg-game-active #canvas{z-index:1!important}
      body.bg-game-active #brunoHD{z-index:20!important}
    }
  `;
  document.head.appendChild(style);

  const wide=document.createElement("canvas");
  wide.id="bgSideViewport";
  wide.width=400;
  wide.height=240;
  const ctx=wide.getContext("2d",{alpha:false});
  document.body.appendChild(wide);

  let lastW=0;

  function getState(){
    try{
      const app=window.__jo2app;
      return app&&app.stateContext&&app.stateContext.State;
    }catch(e){return null}
  }

  function logicalWidth(){
    const vh=Math.max(1,window.visualViewport?window.visualViewport.height:innerHeight);
    const vw=Math.max(1,window.visualViewport?window.visualViewport.width:innerWidth);
    return Math.max(320,Math.min(560,Math.round(240*vw/vh)));
  }

  function ensureSize(w){
    if(w===lastW)return;
    lastW=w;
    wide.width=w;
    wide.height=240;
    ctx.imageSmoothingEnabled=false;
  }

  function drawSprites(st,cam,layer){
    if(!st.Sprites||!st.Sprites.Objects)return;
    ctx.save();
    ctx.translate(-cam.X,-cam.Y);
    for(let i=0;i<st.Sprites.Objects.length;i++){
      const s=st.Sprites.Objects[i];
      if(s&&s.Layer===layer&&typeof s.Draw==="function"){
        try{s.Draw(ctx,cam)}catch(e){}
      }
    }
    ctx.restore();
  }

  function render(){
    const active=document.body.classList.contains("bg-game-active");
    if(!active||!isMobile()||!isLandscape()||window.__bgOrientationBlocked){
      requestAnimationFrame(render);
      return;
    }

    const st=getState();
    if(!st||!st.Level||!st.Camera||!st.Layer||!st.BgLayer){
      requestAnimationFrame(render);
      return;
    }

    const w=logicalWidth();
    ensureSize(w);
    ctx.clearRect(0,0,w,240);

    const side=(w-320)/2;
    const cam={X:Number(st.Camera.X||0)-side,Y:Number(st.Camera.Y||0)};

    const oldLayerW=st.Layer.Width;
    const oldBgW=[];
    try{
      st.Layer.Width=w;
      for(let i=0;i<st.BgLayer.length;i++){
        if(st.BgLayer[i]){
          oldBgW[i]=st.BgLayer[i].Width;
          st.BgLayer[i].Width=w;
          st.BgLayer[i].Draw(ctx,cam);
        }
      }

      drawSprites(st,cam,0);
      st.Layer.Draw(ctx,cam);
      if(typeof st.Layer.DrawExit0==="function")st.Layer.DrawExit0(ctx,cam,!(window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.WinTime));
      drawSprites(st,cam,1);
      if(typeof st.Layer.DrawExit1==="function")st.Layer.DrawExit1(ctx,cam);
    }catch(e){}finally{
      st.Layer.Width=oldLayerW;
      for(let i=0;i<st.BgLayer.length;i++)if(st.BgLayer[i]&&oldBgW[i]!=null)st.BgLayer[i].Width=oldBgW[i];
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  window.__bgMobileSideViewport={
    get enabled(){return true},
    get logicalWidth(){return lastW||logicalWidth()}
  };
})();
