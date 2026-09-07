(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_MAP_TEST_LOADER_V4__)return;
  window.__BG_MAP_TEST_LOADER_V4__=true;
  const base=document.createElement("script");
  base.src="/map-test-visual-v3-base.js?v=1";
  base.async=false;
  base.onload=()=>{
    const fill=document.createElement("script");
    fill.src="/map-test-fill-to-end-v1.js?v=1";
    fill.async=false;
    (document.head||document.documentElement).appendChild(fill);
  };
  (document.head||document.documentElement).appendChild(base);
})();