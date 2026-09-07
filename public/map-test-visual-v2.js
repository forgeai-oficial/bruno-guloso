(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_LEVEL_DESIGN_V5_LOADER__)return;
  window.__BG_LEVEL_DESIGN_V5_LOADER__=true;
  const s=document.createElement("script");
  s.src="/map-level-design-v4.js?v=2";
  s.async=false;
  s.onload=()=>{
    const f=document.createElement("script");
    f.src="/map-level-design-v4-filler.js?v=2";
    f.async=false;
    f.onload=()=>{
      const a=document.createElement("script");
      a.src="/map-level-safety-audit-v1.js?v=1";
      a.async=false;
      (document.head||document.documentElement).appendChild(a);
    };
    (document.head||document.documentElement).appendChild(f);
  };
  (document.head||document.documentElement).appendChild(s);
})();
