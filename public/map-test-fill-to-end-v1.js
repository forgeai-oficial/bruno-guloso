(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_MAP_FILL_TO_END_V1__)return;
  window.__BG_MAP_FILL_TO_END_V1__=true;

  const START=1500;
  const FINISH=6344;
  const LEFT=132,MID=133,RIGHT=134;

  function stateNow(){try{return window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State||window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.World||null}catch(e){return null}}
  function inBounds(l,x,y){return !!l&&x>=0&&y>=0&&x<(l.Width|0)&&y<(l.Height|0)}
  function tile(l,x,y){return inBounds(l,x,y)?(l.GetBlock(x,y)&255):255}
  function empty(l,x,y){return inBounds(l,x,y)&&tile(l,x,y)===0}
  function blocking(l,x,y){try{return !!l.IsBlocking(x,y,0,1)}catch(e){return false}}
  function templateEmpty(l,x,y){try{return inBounds(l,x,y)&&l.GetSpriteTemplate(x,y)===null}catch(e){return false}}
  function groundSurface(l,x){let found=-1;for(let y=4;y<(l.Height|0);y++)if(blocking(l,x,y)&&!blocking(l,x,y-1)&&!blocking(l,x,y-2))found=y;return found}
  function groundFlat(l,x,len){const y=groundSurface(l,x);if(y<7)return -1;for(let i=0;i<len;i++){if(groundSurface(l,x+i)!==y)return -1;if(!empty(l,x+i,y-1)||!empty(l,x+i,y-2))return -1}return y}
  function buildEnd(l){return Math.max(START,Math.min(FINISH,(l.Width|0)-90))}
  function findGround(l,anchor,len=14,radius=24){const end=buildEnd(l);for(let r=0;r<=radius;r++)for(const x of r?[anchor-r,anchor+r]:[anchor]){if(x<START+3||x+len>=end)continue;const y=groundFlat(l,x,len);if(y>0)return{x,y}}return null}
  function behaviorTile(mask,forbid=0){try{for(let i=1;i<256;i++){const b=Mario.Tile.Behaviors[i]||0;if((b&mask)===mask&&!(b&forbid))return i}}catch(e){}return 0}
  function brickId(){return behaviorTile(Mario.Tile.Breakable)||16}
  function bumpId(){return behaviorTile(Mario.Tile.Bumpable,Mario.Tile.Special)||21}
  function specialId(){return behaviorTile(Mario.Tile.Bumpable|Mario.Tile.Special)||18}
  function setAir(l,x,y,id){if(y<2||!inBounds(l,x,y)||!empty(l,x,y)||!templateEmpty(l,x,y))return false;l.SetBlock(x,y,id);return true}
  function row(l,x,y,len,id,gapEvery=0){let n=0;for(let i=0;i<len;i++){if(gapEvery&&i>0&&i<len-1&&i%gapEvery===0)continue;if(setAir(l,x+i,y,id))n++}return n}
  function col(l,x,fromY,toY,id){let n=0;for(let y=fromY;y>=toY;y--)if(setAir(l,x,y,id))n++;return n}
  function platform(l,x,y,len){if(y<2||x<2||x+len>=l.Width-2)return 0;for(let i=0;i<len;i++)if(!empty(l,x+i,y)||!templateEmpty(l,x+i,y))return 0;for(let i=0;i<len;i++)l.SetBlock(x+i,y,i===0?LEFT:(i===len-1?RIGHT:MID));return len}
  function donut(l,x,y,key){if(!inBounds(l,x,y))return;if(!l.__bgAllTestDonuts)l.__bgAllTestDonuts=[];if(l.__bgAllTestDonuts.some(d=>d.key===key))return;l.__bgAllTestDonuts.push({key,x:x*16+8,y:y*16+8,phase:(x*19+y*11)%31})}

  function buildPattern(l,p,index,audit){
    const br=brickId(),bu=bumpId(),sp=specialId(),x=p.x,y=p.y,k=index%12;let made=0;
    if(k===0){made+=row(l,x+1,y-4,12,br);if(setAir(l,x+4,y-4,bu))made++;if(setAir(l,x+8,y-4,sp))made++;made+=row(l,x+3,y-7,8,br,4)}
    else if(k===1){made+=platform(l,x+1,y-3,4);made+=platform(l,x+6,y-5,4);made+=platform(l,x+11,y-7,4);made+=platform(l,x+16,y-5,4);made+=platform(l,x+21,y-3,4);for(const [dx,dy] of [[2,4],[7,6],[12,8],[17,6],[22,4]])donut(l,x+dx,y-dy,`end1:${x}:${dx}`)}
    else if(k===2){made+=row(l,x+1,y-6,18,br,5);made+=row(l,x+3,y-3,4,br);made+=row(l,x+12,y-3,4,br);if(setAir(l,x+9,y-4,sp))made++}
    else if(k===3){made+=col(l,x+2,y-3,y-7,br);made+=col(l,x+13,y-3,y-7,br);made+=row(l,x+2,y-8,12,br);made+=platform(l,x+5,y-5,6);if(setAir(l,x+7,y-5,bu))made++}
    else if(k===4){for(let i=0;i<9;i++){const yy=y-3-(i<5?i:8-i);if(setAir(l,x+1+i,yy,br))made++}made+=row(l,x+11,y-4,8,br);for(let i=0;i<9;i+=2)donut(l,x+1+i,y-4-(i<5?i:8-i),`end4:${x}:${i}`)}
    else if(k===5){made+=platform(l,x+1,y-4,7);made+=platform(l,x+9,y-6,7);made+=platform(l,x+17,y-4,7);made+=row(l,x+4,y-8,17,br,6)}
    else if(k===6){made+=row(l,x+1,y-3,6,br);made+=row(l,x+8,y-5,6,br);made+=row(l,x+15,y-7,6,br);made+=row(l,x+8,y-9,13,br,4);if(setAir(l,x+11,y-5,bu))made++;if(setAir(l,x+18,y-7,sp))made++}
    else if(k===7){made+=col(l,x+1,y-3,y-6,br);made+=col(l,x+6,y-4,y-8,br);made+=col(l,x+12,y-3,y-7,br);made+=col(l,x+18,y-4,y-8,br);made+=row(l,x+1,y-9,18,br,6)}
    else if(k===8){made+=platform(l,x+1,y-4,5);made+=platform(l,x+7,y-4,5);made+=platform(l,x+13,y-4,5);made+=platform(l,x+19,y-4,5);made+=row(l,x+3,y-7,19,br,5);for(let i=2;i<23;i+=4)donut(l,x+i,y-5,`end8:${x}:${i}`)}
    else if(k===9){made+=row(l,x+1,y-7,22,br);made+=row(l,x+3,y-4,5,br);made+=row(l,x+10,y-4,5,br);made+=row(l,x+17,y-4,5,br);if(setAir(l,x+5,y-4,bu))made++;if(setAir(l,x+12,y-4,sp))made++;if(setAir(l,x+19,y-4,bu))made++}
    else if(k===10){made+=platform(l,x+1,y-3,4);made+=platform(l,x+6,y-5,4);made+=platform(l,x+11,y-3,4);made+=platform(l,x+16,y-6,4);made+=platform(l,x+21,y-4,4);made+=row(l,x+4,y-8,18,br,5)}
    else{made+=col(l,x+2,y-3,y-7,br);made+=col(l,x+20,y-3,y-7,br);made+=row(l,x+2,y-8,19,br);made+=row(l,x+5,y-5,4,br);made+=row(l,x+14,y-5,4,br);made+=platform(l,x+9,y-4,4);if(setAir(l,x+11,y-4,sp))made++}
    if(made>0){audit.structures++;audit.blocks+=made}
  }

  function fillToCurrentEnd(state){
    const l=state&&state.Level;if(!l||!window.Mario||!Mario.Tile)return false;
    const end=buildEnd(l);if(end<=START+30)return false;
    if(!l.__bgFillEndAudit)l.__bgFillEndAudit={from:START,to:0,structures:0,blocks:0,passes:0};
    const audit=l.__bgFillEndAudit;let from=Math.max(START,Number(l.__bgFillEndBuiltTo)||START);
    if(from>=end-20){window.__bgFillToEndAudit=audit;return true}
    const STEP=37;let first=START+Math.ceil((from-START)/STEP)*STEP;if(first<START)first=START;
    for(let anchor=first;anchor<end-24;anchor+=STEP){const idx=Math.floor((anchor-START)/STEP);let p=findGround(l,anchor,26,20);if(!p)p=findGround(l,anchor,18,28);if(!p)p=findGround(l,anchor,12,36);if(p)buildPattern(l,p,idx,audit)}
    l.__bgFillEndBuiltTo=end;audit.to=end;audit.passes++;window.__bgFillToEndAudit=audit;
    const badge=document.getElementById("bgAllTestBadge");if(badge)badge.textContent=`TESTE MAPA • 0–200 ORIGINAL • CONSTRUÍDO ATÉ ${end} m`;
    return true;
  }

  function installLevelHook(){
    if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;
    const p=Mario.LevelState.prototype;if(p.__bgFillToEndV1)return true;
    const enter=p.Enter,update=p.Update;p.__bgFillToEndV1=true;
    p.Enter=function(){const r=enter.apply(this,arguments);window.__bgTestRun=true;try{fillToCurrentEnd(this)}catch(e){console.warn("fill end enter",e)}return r};
    p.Update=function(){const before=this.Level,r=update.apply(this,arguments);window.__bgTestRun=true;try{if(this.Level!==before||!this.Level.__bgFillEndBuiltTo||this.Level.__bgFillEndBuiltTo<buildEnd(this.Level))fillToCurrentEnd(this)}catch(e){}return r};
    return true;
  }

  function install(){if(!(window.__BG_ALL_MECHANICS_TEST_V1__&&window.Mario&&Mario.LevelState&&Mario.Tile))return false;installLevelHook();const st=stateNow();if(st)fillToCurrentEnd(st);return true}
  if(!install()){const t=setInterval(()=>{if(install())clearInterval(t)},40);setTimeout(()=>clearInterval(t),15000)}
  window.__bgMapFillToEnd={active:true,start:START,finish:FINISH,get audit(){return window.__bgFillToEndAudit||null}};
})();