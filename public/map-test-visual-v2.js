(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_MAP_TEST_VISUAL_V3__)return;
  window.__BG_MAP_TEST_VISUAL_V3__=true;

  const START=200;
  const END=1500;
  const LEFT=132,MID=133,RIGHT=134;
  const REMOVED=new Set(["hamburger","coxinha","refri","brigadeiro","pudim","pudim2","sausage","pipeMonster","cupcake","pizza"]);

  function stateNow(){
    try{return window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State||window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.World||null}catch(e){return null}
  }
  function inBounds(l,x,y){return l&&x>=0&&y>=0&&x<(l.Width|0)&&y<(l.Height|0)}
  function tile(l,x,y){return inBounds(l,x,y)?(l.GetBlock(x,y)&255):255}
  function empty(l,x,y){return inBounds(l,x,y)&&tile(l,x,y)===0}
  function blocking(l,x,y){try{return !!l.IsBlocking(x,y,0,1)}catch(e){return false}}
  function templateEmpty(l,x,y){try{return inBounds(l,x,y)&&l.GetSpriteTemplate(x,y)===null}catch(e){return false}}
  function surface(l,x){for(let y=3;y<(l.Height|0);y++)if(blocking(l,x,y)&&!blocking(l,x,y-1)&&!blocking(l,x,y-2))return y;return -1}
  function groundSurface(l,x){let found=-1;for(let y=4;y<(l.Height|0);y++)if(blocking(l,x,y)&&!blocking(l,x,y-1)&&!blocking(l,x,y-2))found=y;return found}
  function flat(l,x,len){const y=surface(l,x);if(y<6)return -1;for(let i=0;i<len;i++)if(surface(l,x+i)!==y||!empty(l,x+i,y-1)||!empty(l,x+i,y-2))return -1;return y}
  function groundFlat(l,x,len){const y=groundSurface(l,x);if(y<7)return -1;for(let i=0;i<len;i++)if(groundSurface(l,x+i)!==y||!empty(l,x+i,y-1)||!empty(l,x+i,y-2))return -1;return y}
  function findFlat(l,anchor,len=10,radius=50){
    for(let r=0;r<=radius;r++)for(const x of r?[anchor-r,anchor+r]:[anchor]){
      if(x<START+5||x+len>=Math.min(END,l.Width-5))continue;
      const y=flat(l,x,len);if(y>0)return{x,y};
    }
    return null;
  }
  function findGroundFlat(l,anchor,len=10,radius=24){
    for(let r=0;r<=radius;r++)for(const x of r?[anchor-r,anchor+r]:[anchor]){
      if(x<START+4||x+len>=Math.min(END,l.Width-4))continue;
      const y=groundFlat(l,x,len);if(y>0)return{x,y};
    }
    return null;
  }
  function platform(l,x,y,len){
    if(y<2||x<2||x+len>=l.Width-2)return false;
    for(let i=0;i<len;i++)if(!empty(l,x+i,y)||!templateEmpty(l,x+i,y))return false;
    for(let i=0;i<len;i++)l.SetBlock(x+i,y,i===0?LEFT:(i===len-1?RIGHT:MID));
    return true;
  }
  function behaviorTile(mask,forbid=0){
    try{for(let i=1;i<256;i++){const b=Mario.Tile.Behaviors[i]||0;if((b&mask)===mask&&!(b&forbid))return i}}catch(e){}
    return 0;
  }
  function brickId(){return behaviorTile(Mario.Tile.Breakable)||16}
  function bumpId(){return behaviorTile(Mario.Tile.Bumpable,Mario.Tile.Special)||21}
  function specialId(){return behaviorTile(Mario.Tile.Bumpable|Mario.Tile.Special)||18}
  function setAir(l,x,y,id){if(y<2||!empty(l,x,y)||!templateEmpty(l,x,y))return false;l.SetBlock(x,y,id);return true}
  function row(l,x,y,len,id,gapEvery=0){let n=0;for(let i=0;i<len;i++){if(gapEvery&&i>0&&i<len-1&&i%gapEvery===0)continue;if(setAir(l,x+i,y,id))n++}return n}
  function column(l,x,groundY,height,id){let n=0;for(let h=1;h<=height;h++)if(setAir(l,x,groundY-h,id))n++;return n}
  function template(kind,extra){const t=new Mario.SpriteTemplate(Mario.Enemy.Goomba,false);t.__bgTestVariant=kind;if(extra)Object.assign(t,extra);return t}
  function putTemplate(l,x,y,kind,extra){
    try{if(!inBounds(l,x,y)||!empty(l,x,y)||l.GetSpriteTemplate(x,y)!==null)return false;l.SetSpriteTemplate(x,y,template(kind,extra));return true}catch(e){return false}
  }
  function addDonut(l,x,y,key){
    if(!inBounds(l,x,y))return;
    if(!l.__bgAllTestDonuts)l.__bgAllTestDonuts=[];
    if(l.__bgAllTestDonuts.some(d=>d.key===key))return;
    l.__bgAllTestDonuts.push({key,x:x*16+8,y:y*16+8,phase:(x*17+y*13)%31});
  }

  function removeFoodTemplates(state){
    const l=state&&state.Level;if(!l)return;
    for(let x=START;x<Math.min(l.Width,END);x++)for(let y=0;y<l.Height;y++){
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
    if(!state||!state.Level||state.__bgVisualShowcaseV3)return false;
    const l=state.Level;if((l.Width|0)<800)return false;
    state.__bgVisualShowcaseV3=true;
    const audit={stairs:0,upperRoutes:0,movers:0,elevators:0,falling:0,oscillating:0,springs:0,bridges:0,ramps:0,airStructures:0,airBricks:0};

    let p=findGroundFlat(l,212,12);
    if(p){const x=p.x,y=p.y;for(let i=0;i<6;i++)for(let h=0;h<=Math.min(i,3);h++)if(setAir(l,x+1+i,y-1-h,brickId()))audit.airBricks++;audit.stairs++}

    p=findGroundFlat(l,255,18);
    if(p){const x=p.x,y=p.y;if(platform(l,x+1,y-3,5))audit.upperRoutes++;platform(l,x+7,y-5,5);platform(l,x+13,y-3,4)}

    p=findGroundFlat(l,310,10);if(p&&putTemplate(l,p.x+5,p.y-4,"moveH",{range:42,phase:0}))audit.movers++;
    p=findGroundFlat(l,355,10);if(p&&putTemplate(l,p.x+5,p.y-4,"elevator",{range:48,phase:1.4}))audit.elevators++;
    p=findGroundFlat(l,400,10);if(p&&putTemplate(l,p.x+5,p.y-4,"fall"))audit.falling++;
    p=findGroundFlat(l,445,10);if(p&&putTemplate(l,p.x+5,p.y-4,"osc"))audit.oscillating++;

    p=findGroundFlat(l,490,14);
    if(p){putTemplate(l,p.x+3,p.y-1,"spring");platform(l,p.x+8,p.y-7,5);audit.springs++}

    p=findGroundFlat(l,545,22);
    if(p){const x=p.x,y=p.y;const ok1=platform(l,x+1,y-4,6),ok2=platform(l,x+8,y-5,6),ok3=platform(l,x+15,y-4,5);if(ok1||ok2||ok3)audit.bridges++}

    p=findGroundFlat(l,610,16);
    if(p){const a=putTemplate(l,p.x+5,p.y-1,"rampUp"),b=putTemplate(l,p.x+11,p.y-3,"rampDown");if(a||b)audit.ramps++}

    p=findGroundFlat(l,665,18);
    if(p){putTemplate(l,p.x+4,p.y-4,"moveH",{range:36,phase:1});putTemplate(l,p.x+10,p.y-5,"fall");putTemplate(l,p.x+15,p.y-4,"elevator",{range:40,phase:2.2})}

    densifyAir(state,audit);
    window.__bgMapTestVisualAudit=audit;
    const badge=document.getElementById("bgAllTestBadge");
    if(badge)badge.textContent="TESTE MAPA • 0–200 ORIGINAL • CENÁRIO DENSO";
    removeFoodTemplates(state);
    return true;
  }

  function densifyAir(state,audit){
    const l=state.Level,br=brickId(),bu=bumpId(),sp=specialId();
    let idx=0;
    for(let anchor=225;anchor<1475;anchor+=31+(idx%3)*4,idx++){
      const p=findGroundFlat(l,anchor,12,18);if(!p)continue;
      const x=p.x,y=p.y,kind=idx%10;
      let made=0;

      if(kind===0){
        made+=row(l,x+1,y-4,9,br);
        if(setAir(l,x+5,y-4,bu))made++;
        for(let i=1;i<9;i+=2)addDonut(l,x+i,y-5,`dense0:${x}:${i}`);
      }else if(kind===1){
        made+=row(l,x+1,y-3,5,br);
        made+=row(l,x+7,y-5,5,br);
        made+=row(l,x+4,y-7,5,br);
        if(setAir(l,x+6,y-5,sp))made++;
      }else if(kind===2){
        for(let i=0;i<6;i++)for(let h=0;h<=Math.min(i,3);h++)if(setAir(l,x+1+i,y-1-h,br))made++;
        for(let i=0;i<5;i++)if(setAir(l,x+7+i,y-4+i%2,br))made++;
      }else if(kind===3){
        if(platform(l,x+1,y-4,5))made+=5;
        if(platform(l,x+7,y-6,5))made+=5;
        made+=row(l,x+2,y-8,9,br,3);
        addDonut(l,x+3,y-5,`dense3a:${x}`);addDonut(l,x+9,y-7,`dense3b:${x}`);
      }else if(kind===4){
        made+=column(l,x+1,y,3,br);made+=column(l,x+10,y,3,br);
        made+=row(l,x+1,y-4,10,br);
        if(setAir(l,x+5,y-4,bu))made++;
        if(setAir(l,x+6,y-4,sp))made++;
      }else if(kind===5){
        if(platform(l,x+1,y-3,3))made+=3;
        if(platform(l,x+5,y-5,3))made+=3;
        if(platform(l,x+9,y-4,3))made+=3;
        made+=row(l,x+2,y-7,9,br,4);
      }else if(kind===6){
        made+=row(l,x+1,y-4,12,br,4);
        made+=row(l,x+2,y-6,10,br,5);
        if(setAir(l,x+4,y-4,bu))made++;if(setAir(l,x+9,y-4,bu))made++;
      }else if(kind===7){
        made+=row(l,x+1,y-6,11,br);
        made+=row(l,x+3,y-4,3,br);
        made+=row(l,x+8,y-4,3,br);
        if(setAir(l,x+6,y-4,sp))made++;
        for(let i=2;i<11;i+=2)addDonut(l,x+i,y-7,`dense7:${x}:${i}`);
      }else if(kind===8){
        made+=column(l,x+2,y,4,br);made+=column(l,x+9,y,5,br);
        if(platform(l,x+2,y-5,8))made+=8;
        made+=row(l,x+4,y-7,4,br);
      }else{
        if(platform(l,x+1,y-5,11))made+=11;
        made+=column(l,x+1,y-5,2,br);made+=column(l,x+11,y-5,2,br);
        made+=row(l,x+3,y-7,7,br);
        if(setAir(l,x+6,y-7,sp))made++;
      }

      if(made>0){audit.airStructures++;audit.airBricks+=made}
    }
  }

  function installSpawnFilter(){
    if(!(window.Mario&&Mario.SpriteTemplate&&Mario.SpriteTemplate.prototype))return false;
    const p=Mario.SpriteTemplate.prototype;if(p.__bgNoFoodTestV3)return true;
    const old=p.Spawn;p.__bgNoFoodTestV3=true;
    p.Spawn=function(){if(REMOVED.has(this.__bgTestVariant)){this.IsDead=true;return}return old.apply(this,arguments)};
    return true;
  }

  function installLevelHook(){
    if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;
    const p=Mario.LevelState.prototype;if(p.__bgVisualShowcaseV3)return true;
    const enter=p.Enter,update=p.Update;p.__bgVisualShowcaseV3=true;
    p.Enter=function(){const r=enter.apply(this,arguments);try{buildShowcase(this);removeFoodTemplates(this)}catch(e){console.warn("dense map enter",e)}return r};
    p.Update=function(){const r=update.apply(this,arguments);try{buildShowcase(this);removeFoodTemplates(this)}catch(e){}return r};
    return true;
  }

  function install(){
    if(!window.__BG_ALL_MECHANICS_TEST_V1__||!(window.Mario&&Mario.SpriteTemplate&&Mario.LevelState&&Mario.Tile))return false;
    installSpawnFilter();installLevelHook();
    const st=stateNow();if(st){buildShowcase(st);removeFoodTemplates(st)}
    return true;
  }

  if(!install()){
    const t=setInterval(()=>{if(install())clearInterval(t)},40);
    setTimeout(()=>clearInterval(t),12000);
  }
})();
