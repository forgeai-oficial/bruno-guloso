(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_MAP_TEST_VISUAL_V2__)return;
  window.__BG_MAP_TEST_VISUAL_V2__=true;

  const START=200;
  const END=700;
  const LEFT=132,MID=133,RIGHT=134;
  const REMOVED=new Set(["hamburger","coxinha","refri","brigadeiro","pudim","pudim2","sausage","pipeMonster","cupcake","pizza"]);

  function stateNow(){
    try{return window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State||window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.World||null}catch(e){return null}
  }
  function inBounds(l,x,y){return l&&x>=0&&y>=0&&x<(l.Width|0)&&y<(l.Height|0)}
  function empty(l,x,y){return inBounds(l,x,y)&&(l.GetBlock(x,y)&255)===0}
  function blocking(l,x,y){try{return !!l.IsBlocking(x,y,0,1)}catch(e){return false}}
  function surface(l,x){for(let y=3;y<(l.Height|0);y++)if(blocking(l,x,y)&&!blocking(l,x,y-1)&&!blocking(l,x,y-2))return y;return -1}
  function flat(l,x,len){const y=surface(l,x);if(y<6)return -1;for(let i=0;i<len;i++)if(surface(l,x+i)!==y||!empty(l,x+i,y-1)||!empty(l,x+i,y-2))return -1;return y}
  function findFlat(l,anchor,len=10,radius=50){
    for(let r=0;r<=radius;r++)for(const x of r?[anchor-r,anchor+r]:[anchor]){
      if(x<START+5||x+len>=Math.min(END,l.Width-5))continue;
      const y=flat(l,x,len);if(y>0)return{x,y};
    }
    return null;
  }
  function platform(l,x,y,len){
    if(y<2||x<2||x+len>=l.Width-2)return false;
    for(let i=0;i<len;i++)if(!empty(l,x+i,y))return false;
    for(let i=0;i<len;i++)l.SetBlock(x+i,y,i===0?LEFT:(i===len-1?RIGHT:MID));
    return true;
  }
  function template(kind,extra){const t=new Mario.SpriteTemplate(Mario.Enemy.Goomba,false);t.__bgTestVariant=kind;if(extra)Object.assign(t,extra);return t}
  function putTemplate(l,x,y,kind,extra){
    try{if(!inBounds(l,x,y)||!empty(l,x,y)||l.GetSpriteTemplate(x,y)!==null)return false;l.SetSpriteTemplate(x,y,template(kind,extra));return true}catch(e){return false}
  }

  function removeFoodTemplates(state){
    const l=state&&state.Level;if(!l)return;
    for(let x=START;x<Math.min(l.Width,1500);x++)for(let y=0;y<l.Height;y++){
      try{const t=l.GetSpriteTemplate(x,y);if(t&&REMOVED.has(t.__bgTestVariant))l.SetSpriteTemplate(x,y,null)}catch(e){}
    }
    try{
      const list=state.Sprites&&state.Sprites.Objects;
      if(Array.isArray(list))for(const s of list.slice()){
        const k=s&&s.__kind||s&&s.__bgFoodKind;
        if(REMOVED.has(k))state.RemoveSprite(s);
      }
    }catch(e){}
  }

  function buildShowcase(state){
    if(!state||!state.Level||state.__bgVisualShowcaseV2)return false;
    const l=state.Level;if((l.Width|0)<800)return false;
    state.__bgVisualShowcaseV2=true;
    const audit={stairs:0,upperRoutes:0,movers:0,elevators:0,falling:0,oscillating:0,springs:0,bridges:0,ramps:0};

    let p=findFlat(l,212,12);
    if(p){
      const x=p.x,y=p.y;
      for(let i=0;i<6;i++)for(let h=0;h<=Math.min(i,3);h++)if(empty(l,x+1+i,y-1-h))l.SetBlock(x+1+i,y-1-h,145);
      audit.stairs++;
    }

    p=findFlat(l,255,18);
    if(p){
      const x=p.x,y=p.y;
      if(platform(l,x+1,y-3,5))audit.upperRoutes++;
      platform(l,x+7,y-5,5);
      platform(l,x+13,y-3,4);
    }

    p=findFlat(l,310,10);
    if(p&&putTemplate(l,p.x+5,p.y-4,"moveH",{range:42,phase:0}))audit.movers++;

    p=findFlat(l,355,10);
    if(p&&putTemplate(l,p.x+5,p.y-4,"elevator",{range:48,phase:1.4}))audit.elevators++;

    p=findFlat(l,400,10);
    if(p&&putTemplate(l,p.x+5,p.y-4,"fall"))audit.falling++;

    p=findFlat(l,445,10);
    if(p&&putTemplate(l,p.x+5,p.y-4,"osc"))audit.oscillating++;

    p=findFlat(l,490,14);
    if(p){
      putTemplate(l,p.x+3,p.y-1,"spring");
      platform(l,p.x+8,p.y-7,5);
      audit.springs++;
    }

    p=findFlat(l,545,22);
    if(p){
      const x=p.x,y=p.y;
      const ok1=platform(l,x+1,y-4,6),ok2=platform(l,x+8,y-5,6),ok3=platform(l,x+15,y-4,5);
      if(ok1||ok2||ok3)audit.bridges++;
    }

    p=findFlat(l,610,16);
    if(p){
      const a=putTemplate(l,p.x+5,p.y-1,"rampUp"),b=putTemplate(l,p.x+11,p.y-3,"rampDown");
      if(a||b)audit.ramps++;
    }

    p=findFlat(l,665,18);
    if(p){
      putTemplate(l,p.x+4,p.y-4,"moveH",{range:36,phase:1});
      putTemplate(l,p.x+10,p.y-5,"fall");
      putTemplate(l,p.x+15,p.y-4,"elevator",{range:40,phase:2.2});
    }

    window.__bgMapTestVisualAudit=audit;
    const badge=document.getElementById("bgAllTestBadge");
    if(badge)badge.textContent="TESTE MAPA • 0–200 ORIGINAL • MECÂNICAS VISÍVEIS";
    removeFoodTemplates(state);
    return true;
  }

  function installSpawnFilter(){
    if(!(window.Mario&&Mario.SpriteTemplate&&Mario.SpriteTemplate.prototype))return false;
    const p=Mario.SpriteTemplate.prototype;if(p.__bgNoFoodTestV2)return true;
    const old=p.Spawn;p.__bgNoFoodTestV2=true;
    p.Spawn=function(){if(REMOVED.has(this.__bgTestVariant)){this.IsDead=true;return}return old.apply(this,arguments)};
    return true;
  }

  function installLevelHook(){
    if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;
    const p=Mario.LevelState.prototype;if(p.__bgVisualShowcaseV2)return true;
    const enter=p.Enter,update=p.Update;p.__bgVisualShowcaseV2=true;
    p.Enter=function(){const r=enter.apply(this,arguments);try{buildShowcase(this);removeFoodTemplates(this)}catch(e){}return r};
    p.Update=function(){const r=update.apply(this,arguments);try{buildShowcase(this);removeFoodTemplates(this)}catch(e){}return r};
    return true;
  }

  function install(){
    if(!window.__BG_ALL_MECHANICS_TEST_V1__||!(window.Mario&&Mario.SpriteTemplate&&Mario.LevelState))return false;
    installSpawnFilter();installLevelHook();
    const st=stateNow();if(st){buildShowcase(st);removeFoodTemplates(st)}
    return true;
  }

  if(!install()){
    const t=setInterval(()=>{if(install())clearInterval(t)},40);
    setTimeout(()=>clearInterval(t),12000);
  }
})();
