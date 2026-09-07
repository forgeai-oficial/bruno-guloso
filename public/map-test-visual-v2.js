(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_LEVEL_DESIGN_V4_LOADER__)return;
  window.__BG_LEVEL_DESIGN_V4_LOADER__=true;
  const s=document.createElement("script");
  s.src="/map-level-design-v4.js?v=1";
  s.async=false;
  s.onload=()=>{
    const f=document.createElement("script");
    f.src="/map-level-design-v4-filler.js?v=1";
    f.async=false;
    (document.head||document.documentElement).appendChild(f);
  };
  (document.head||document.documentElement).appendChild(s);
})();
