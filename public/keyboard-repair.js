(()=>{
  "use strict";
  if(window.__BG_KEYBOARD_REPAIR__)return;
  window.__BG_KEYBOARD_REPAIR__=true;

  function editable(t){return !!(t&&t.closest&&t.closest("input,textarea,[contenteditable='true']"));}
  function P(){try{return window.Enjine&&Enjine.KeyboardInput&&Enjine.KeyboardInput.Pressed}catch(e){return null}}
  function set(name,on){
    const p=P();
    if(!p||!window.Enjine)return;
    if(name==="left")p[Enjine.Keys.Left]=!!on;
    if(name==="right")p[Enjine.Keys.Right]=!!on;
    if(name==="run")p[Enjine.Keys.A]=!!on;
    if(name==="jump"){
      window.__jo2JumpHeld=!!on;
      p[Enjine.Keys.S]=!!on;
      if(!on)window.__jo2JumpNeedsRearm=false;
    }
  }
  function map(e,on){
    if(editable(e.target))return false;
    const k=String(e.key||"").toLowerCase();
    let handled=true;
    if(k==="a"||k==="arrowleft")set("left",on);
    else if(k==="d"||k==="arrowright")set("right",on);
    else if(k===" "||k==="w"||k==="arrowup")set("jump",on);
    else if(k==="shift")set("run",on);
    else handled=false;
    return handled;
  }

  addEventListener("keydown",e=>{
    if(e.code==="KeyF")return;
    if(map(e,true))e.preventDefault();
  },false);
  addEventListener("keyup",e=>{
    if(e.code==="KeyF")return;
    if(map(e,false))e.preventDefault();
  },false);

  addEventListener("blur",()=>{
    set("left",false);set("right",false);set("jump",false);set("run",false);
  });
})();
