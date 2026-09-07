(()=>{
  "use strict";
  if(window.__BG_MOBILE_ARROW_TUNE__)return;
  window.__BG_MOBILE_ARROW_TUNE__=true;

  const style=document.createElement("style");
  style.id="bgMobileArrowTuneStyle";
  style.textContent=`
    @media (max-width:1100px),(pointer:coarse){
      body.bg-game-active footer [data-key="left"],
      body.bg-game-active footer [data-key="right"]{
        width:58px!important;
        min-width:58px!important;
        height:58px!important;
        font-size:21px!important;
        border-radius:17px!important;
      }

      body.bg-game-active footer [data-key="right"]{
        margin-left:9px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
