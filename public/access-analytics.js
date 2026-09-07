(()=>{
  "use strict";
  if(window.__BG_ACCESS_ANALYTICS_V1__)return;
  window.__BG_ACCESS_ANALYTICS_V1__=true;

  const VISITOR_KEY="bg_access_visitor_v1";
  const SESSION_KEY="bg_access_session_v1";
  let sentStart=false;

  function randomId(prefix){
    try{return prefix+crypto.randomUUID().replace(/-/g,"")}
    catch(e){return prefix+Date.now().toString(36)+Math.random().toString(36).slice(2)}
  }

  function stableVisitor(){
    try{
      let id=localStorage.getItem(VISITOR_KEY);
      if(!id){id=randomId("v_");localStorage.setItem(VISITOR_KEY,id)}
      return id;
    }catch(e){return randomId("v_")}
  }

  function sessionId(){
    try{
      let id=sessionStorage.getItem(SESSION_KEY);
      if(!id){id=randomId("s_");sessionStorage.setItem(SESSION_KEY,id)}
      return id;
    }catch(e){return randomId("s_")}
  }

  function browserFromUA(ua){
    ua=String(ua||"");
    if(/Edg\//.test(ua))return "Edge";
    if(/OPR\//.test(ua))return "Opera";
    if(/Firefox\//.test(ua))return "Firefox";
    if(/Chrome\//.test(ua)&&!/Edg\//.test(ua))return "Chrome";
    if(/Safari\//.test(ua)&&!/Chrome\//.test(ua))return "Safari";
    return "Outro";
  }

  function osFromUA(ua){
    ua=String(ua||"");
    if(/Android/i.test(ua))return "Android";
    if(/iPhone|iPad|iPod/i.test(ua))return "iOS/iPadOS";
    if(/Windows NT/i.test(ua))return "Windows";
    if(/Mac OS X|Macintosh/i.test(ua))return "macOS";
    if(/CrOS/i.test(ua))return "ChromeOS";
    if(/Linux/i.test(ua))return "Linux";
    return "Outro";
  }

  function deviceType(ua,mobileHint){
    if(mobileHint===true)return "Celular";
    if(/iPad|Tablet/i.test(ua))return "Tablet";
    if(/Mobi|Android|iPhone|iPod/i.test(ua))return "Celular";
    return "Computador";
  }

  async function deviceInfo(){
    const ua=String(navigator.userAgent||"").slice(0,220);
    let platform=String(navigator.platform||"").slice(0,60);
    let model="";
    let architecture="";
    let mobileHint=false;
    try{
      const d=navigator.userAgentData;
      if(d){
        platform=String(d.platform||platform).slice(0,60);
        mobileHint=!!d.mobile;
        if(typeof d.getHighEntropyValues==="function"){
          const hi=await d.getHighEntropyValues(["model","platformVersion","architecture"]);
          model=String(hi.model||"").slice(0,80);
          architecture=String(hi.architecture||"").slice(0,30);
          if(hi.platformVersion)platform+=(" "+String(hi.platformVersion).slice(0,30));
        }
      }
    }catch(e){}
    return {
      ua,
      browser:browserFromUA(ua),
      os:osFromUA(ua),
      platform,
      model,
      architecture,
      deviceType:deviceType(ua,mobileHint),
      screen:`${Math.round(screen.width||0)}x${Math.round(screen.height||0)}`,
      viewport:`${Math.round(innerWidth||0)}x${Math.round(innerHeight||0)}`,
      dpr:Math.round((Number(devicePixelRatio)||1)*100)/100,
      language:String(navigator.language||"").slice(0,20),
      timezone:(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(e){return ""}})()
    };
  }

  function referrerHost(){
    try{return document.referrer?new URL(document.referrer).hostname.slice(0,120):"direto"}
    catch(e){return "direto"}
  }

  async function send(event){
    // Respeita sinais explícitos de privacidade do navegador.
    if(navigator.globalPrivacyControl===true||navigator.doNotTrack==="1")return;
    try{
      const info=await deviceInfo();
      const body={
        event,
        visitorId:stableVisitor(),
        sessionId:sessionId(),
        referrer:referrerHost(),
        path:location.pathname.slice(0,120),
        ...info
      };
      fetch("/api/analytics/visit",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body),
        cache:"no-store",
        keepalive:true
      }).catch(()=>{});
    }catch(e){}
  }

  function installNotice(){
    if(document.getElementById("bgAccessAnalyticsNotice"))return;
    const el=document.createElement("div");
    el.id="bgAccessAnalyticsNotice";
    el.textContent="Estatísticas técnicas de acesso: dispositivo, navegador e região aproximada. IP não é armazenado.";
    el.style.cssText="position:fixed;left:0;right:0;bottom:3px;z-index:8;text-align:center;font:600 9px/1.2 system-ui,sans-serif;color:rgba(255,255,255,.48);text-shadow:0 1px 2px #000;pointer-events:none;padding:0 8px;";
    document.body.appendChild(el);
    const sync=()=>{el.style.display=document.body.classList.contains("bg-game-active")?"none":"block"};
    new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["class"]});
    sync();
  }

  function watchGameStart(){
    const check=()=>{
      if(!sentStart&&document.body.classList.contains("bg-game-active")){
        sentStart=true;
        send("game_start");
      }
    };
    new MutationObserver(check).observe(document.body,{attributes:true,attributeFilter:["class"]});
    check();
  }

  function boot(){
    installNotice();
    send("visit");
    watchGameStart();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
