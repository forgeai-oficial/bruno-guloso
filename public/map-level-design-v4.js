(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_LEVEL_DESIGN_V4__)return;
  window.__BG_LEVEL_DESIGN_V4__=true;

  const START=200, FINISH=6344;
  const LEFT=132,MID=133,RIGHT=134,SOLID=145;
  const REMOVED=new Set(["hamburger","coxinha","refri","brigadeiro","pudim","pudim2","sausage","pipeMonster","cupcake","pizza"]);

  const rng=(n,s=0)=>{n=(n|0)^(s|0)^0x6d2b79f5;n=Math.imul(n^(n>>>15),1|n);n^=n+Math.imul(n^(n>>>7),61|n);return((n^(n>>>14))>>>0)};
  const inBounds=(l,x,y)=>!!l&&x>=0&&y>=0&&x<(l.Width|0)&&y<(l.Height|0);
  const tile=(l,x,y)=>inBounds(l,x,y)?(l.GetBlock(x,y)&255):255;
  const empty=(l,x,y)=>inBounds(l,x,y)&&tile(l,x,y)===0;
  const blocking=(l,x,y)=>{try{return !!l.IsBlocking(x,y,0,1)}catch(e){return false}};
  const templateEmpty=(l,x,y)=>{try{return inBounds(l,x,y)&&l.GetSpriteTemplate(x,y)===null}catch(e){return false}};
  const groundY=(l,x)=>{let f=-1;for(let y=4;y<l.Height;y++)if(blocking(l,x,y)&&!blocking(l,x,y-1)&&!blocking(l,x,y-2))f=y;return f};
  function behavior(mask,forbid=0){try{for(let i=1;i<256;i++){const b=Mario.Tile.Behaviors[i]||0;if((b&mask)===mask&&!(b&forbid))return i}}catch(e){}return 0}
  const BR=()=>behavior(Mario.Tile.Breakable)||16;
  const BU=()=>behavior(Mario.Tile.Bumpable,Mario.Tile.Special)||21;
  const SP=()=>behavior(Mario.Tile.Bumpable|Mario.Tile.Special)||18;
  function setAir(l,x,y,id){if(y<1||y>=l.Height-1||!empty(l,x,y)||!templateEmpty(l,x,y))return 0;l.SetBlock(x,y,id);return 1}
  function platform(l,x,y,w){if(y<1||x<1||x+w>=l.Width-1)return 0;for(let i=0;i<w;i++)if(!empty(l,x+i,y)||!templateEmpty(l,x+i,y))return 0;for(let i=0;i<w;i++)l.SetBlock(x+i,y,i===0?LEFT:(i===w-1?RIGHT:MID));return w}
  function row(l,x,y,w,id,gaps=[]){let n=0;const g=new Set(gaps);for(let i=0;i<w;i++)if(!g.has(i))n+=setAir(l,x+i,y,id);return n}
  function col(l,x,y0,y1,id){let n=0;for(let y=y0;y>=y1;y--)n+=setAir(l,x,y,id);return n}
  function fill(l,x,y,w,h,id){let n=0;for(let xx=0;xx<w;xx++)for(let yy=0;yy<h;yy++)n+=setAir(l,x+xx,y-yy,id);return n}
  function addDonut(l,x,y,key){if(!inBounds(l,x,y))return;if(!l.__bgAllTestDonuts)l.__bgAllTestDonuts=[];if(l.__bgAllTestDonuts.some(d=>d.key===key))return;l.__bgAllTestDonuts.push({key,x:x*16+8,y:y*16+8,phase:rng(x*31+y,17)%31})}
  function tpl(kind,extra){const t=new Mario.SpriteTemplate(Mario.Enemy.Goomba,false);t.__bgTestVariant=kind;if(extra)Object.assign(t,extra);return t}
  function putTpl(l,x,y,kind,extra){try{if(!inBounds(l,x,y)||!empty(l,x,y)||l.GetSpriteTemplate(x,y)!==null)return 0;l.SetSpriteTemplate(x,y,tpl(kind,extra));return 1}catch(e){return 0}}
  function pipe(l,x,g,h){if(h<2)return 0;let n=0;for(let yy=0;yy<h;yy++){const y=g-h+yy;if(yy===0){n+=setAir(l,x,y,10);n+=setAir(l,x+1,y,11)}else{n+=setAir(l,x,y,26);n+=setAir(l,x+1,y,27)}}return n}
  function safeBase(l,a,w=36,r=24){for(let rr=0;rr<=r;rr++){for(const x of rr?[a-rr,a+rr]:[a]){if(x<START+3||x+w>=Math.min(FINISH-40,l.Width-40))continue;let ys=[];for(let i=0;i<w;i++){const y=groundY(l,x+i);if(y>5)ys.push(y)}if(ys.length>=Math.floor(w*.68)){ys.sort((a,b)=>a-b);return{x,g:ys[Math.floor(ys.length/2)]}}}}return null}
  function clearance(l,x,y,w,h=1){for(let xx=0;xx<w;xx++)for(let yy=0;yy<h;yy++)if(!empty(l,x+xx,y-yy))return false;return true}

  function terrace(l,b,id){const{x,g}=b;let n=0;n+=fill(l,x+2,g-1,5,2,SOLID);n+=fill(l,x+8,g-1,6,4,SOLID);n+=fill(l,x+15,g-1,7,6,SOLID);n+=fill(l,x+23,g-1,6,4,SOLID);n+=fill(l,x+30,g-1,5,2,SOLID);n+=platform(l,x+7,g-6,7);n+=platform(l,x+22,g-6,7);for(let i=0;i<5;i++)addDonut(l,x+16+i,g-8,`v4:t:${id}:${i}`);return n}
  function twinTowers(l,b,id){const{x,g}=b,br=BR(),sp=SP();let n=0;n+=col(l,x+3,g-1,g-8,br);n+=col(l,x+4,g-1,g-8,br);n+=col(l,x+22,g-1,g-10,br);n+=col(l,x+23,g-1,g-10,br);n+=platform(l,x+2,g-9,8);n+=platform(l,x+19,g-11,8);n+=row(l,x+8,g-7,12,br,[4,5,6,7]);n+=platform(l,x+10,g-5,8);n+=setAir(l,x+13,g-5,sp);for(let i=0;i<6;i++)addDonut(l,x+10+i,g-6,`v4:tw:${id}:${i}`);return n}
  function brokenBridge(l,b,id){const{x,g}=b,br=BR();let n=0;n+=platform(l,x+1,g-5,6);n+=platform(l,x+9,g-6,5);n+=platform(l,x+17,g-4,7);n+=platform(l,x+27,g-7,5);n+=row(l,x+4,g-9,25,br,[5,6,12,13,19,20]);n+=putTpl(l,x+7,g-4,"moveH",{range:28,phase:1});n+=putTpl(l,x+24,g-5,"fall");for(const p of [[3,6],[11,7],[19,5],[29,8]])addDonut(l,x+p[0],g-p[1],`v4:bb:${id}:${p[0]}`);return n}
  function gatehouse(l,b,id){const{x,g}=b,br=BR(),bu=BU();let n=0;n+=fill(l,x+2,g-1,5,7,br);n+=fill(l,x+24,g-1,5,7,br);n+=row(l,x+2,g-8,27,br,[8,9,10,11,12,13,14,15,16,17,18]);n+=platform(l,x+8,g-8,15);n+=row(l,x+9,g-5,13,br,[2,3,4,8,9,10]);n+=setAir(l,x+15,g-5,bu);n+=pipe(l,x+31,g,3);return n}
  function zigzag(l,b,id){const{x,g}=b,br=BR();let n=0;const pts=[[1,3,5],[7,5,4],[12,7,5],[18,4,4],[23,8,5],[29,5,5]];for(const [dx,h,w] of pts){n+=platform(l,x+dx,g-h,w);for(let i=1;i<w;i+=2)addDonut(l,x+dx+i,g-h-1,`v4:zz:${id}:${dx}:${i}`)}n+=row(l,x+4,g-10,27,br,[3,4,10,11,17,18,24]);return n}
  function hollowPyramid(l,b,id){const{x,g}=b,br=BR(),sp=SP();let n=0;for(let i=0;i<8;i++){for(let h=0;h<=i;h++){if(!(i>=3&&i<=6&&h<=2))n+=setAir(l,x+2+i,g-1-h,br)}}for(let i=0;i<8;i++){for(let h=0;h<=7-i;h++){if(!(i<=4&&i>=1&&h<=2))n+=setAir(l,x+11+i,g-1-h,br)}}n+=platform(l,x+7,g-9,7);n+=setAir(l,x+10,g-9,sp);for(let i=0;i<5;i++)addDonut(l,x+8+i,g-10,`v4:hp:${id}:${i}`);return n}
  function splitRoute(l,b,id){const{x,g}=b,br=BR();let n=0;n+=row(l,x+1,g-5,13,br,[3,8]);n+=row(l,x+17,g-7,14,br,[4,9]);n+=platform(l,x+4,g-9,8);n+=platform(l,x+20,g-11,8);n+=platform(l,x+13,g-6,5);n+=putTpl(l,x+15,g-5,"elevator",{range:42,phase:2});for(const [dx,dy] of [[5,10],[9,10],[21,12],[25,12]])addDonut(l,x+dx,g-dy,`v4:sr:${id}:${dx}`);return n}
  function pipeGarden(l,b,id){const{x,g}=b,br=BR();let n=0;const hs=[2,4,3,6,2];for(let i=0;i<hs.length;i++)n+=pipe(l,x+2+i*6,g,hs[i]);n+=platform(l,x+4,g-8,6);n+=platform(l,x+16,g-10,7);n+=row(l,x+9,g-6,6,br,[2,3]);n+=putTpl(l,x+13,g-5,"spring");return n}
  function archHall(l,b,id){const{x,g}=b,br=BR(),sp=SP();let n=0;for(const dx of [2,11,20,29])n+=col(l,x+dx,g-1,g-8,br);n+=row(l,x+2,g-9,29,br,[5,6,14,15,23,24]);n+=platform(l,x+4,g-6,5);n+=platform(l,x+13,g-7,5);n+=platform(l,x+22,g-6,5);n+=setAir(l,x+15,g-7,sp);return n}
  function skyIslands(l,b,id){const{x,g}=b;let n=0;const islands=[[2,5,5],[10,8,6],[20,6,4],[27,10,7]];for(const [dx,h,w] of islands){n+=platform(l,x+dx,g-h,w);n+=fill(l,x+dx+1,g-h-1,Math.max(1,w-2),2,SOLID);for(let i=1;i<w;i+=2)addDonut(l,x+dx+i,g-h-1,`v4:si:${id}:${dx}:${i}`)}n+=putTpl(l,x+17,g-5,"moveH",{range:38,phase:3});return n}
  function towerClimb(l,b,id){const{x,g}=b,br=BR(),bu=BU();let n=0;n+=fill(l,x+2,g-1,5,3,SOLID);n+=fill(l,x+10,g-1,5,6,SOLID);n+=fill(l,x+19,g-1,5,9,SOLID);n+=platform(l,x+3,g-5,5);n+=platform(l,x+11,g-8,6);n+=platform(l,x+20,g-11,6);n+=row(l,x+27,g-6,6,br);n+=setAir(l,x+30,g-6,bu);n+=putTpl(l,x+7,g-4,"spring");return n}
  function lowHighCorridor(l,b,id){const{x,g}=b,br=BR();let n=0;n+=row(l,x+1,g-6,30,br,[6,7,14,15,22,23]);n+=platform(l,x+3,g-3,6);n+=platform(l,x+12,g-4,5);n+=platform(l,x+21,g-3,7);n+=row(l,x+5,g-9,20,br,[5,10,15]);for(let i=0;i<5;i++)addDonut(l,x+13+i,g-5,`v4:lh:${id}:${i}`);return n}
  function castle(l,b,id){const{x,g}=b,br=BR(),sp=SP();let n=0;n+=fill(l,x+2,g-1,4,8,br);n+=fill(l,x+29,g-1,4,8,br);n+=row(l,x+2,g-9,31,br,[8,9,10,20,21,22]);n+=platform(l,x+8,g-6,7);n+=platform(l,x+20,g-6,7);n+=row(l,x+10,g-11,15,br,[4,5,9,10]);n+=setAir(l,x+17,g-11,sp);n+=putTpl(l,x+16,g-5,"osc");return n}
  const THEMES=[terrace,twinTowers,brokenBridge,gatehouse,zigzag,hollowPyramid,splitRoute,pipeGarden,archHall,skyIslands,towerClimb,lowHighCorridor,castle];

  function removeFood(state){const l=state&&state.Level;if(!l)return;for(let x=START;x<Math.min(l.Width,FINISH);x++)for(let y=0;y<l.Height;y++){try{const t=l.GetSpriteTemplate(x,y);if(t&&REMOVED.has(t.__bgTestVariant))l.SetSpriteTemplate(x,y,null)}catch(e){}}}
  function designToEnd(state){const l=state&&state.Level;if(!l||!window.Mario||!Mario.Tile)return false;const end=Math.min(FINISH,Math.max(START,l.Width-70));if(end<START+80)return false;if(!l.__bgLevelDesignV4)l.__bgLevelDesignV4={builtTo:START,sections:0,blocks:0,names:[]};const a=l.__bgLevelDesignV4;let cursor=Math.max(START,a.builtTo||START);let section=Math.floor((cursor-START)/68);while(cursor<end-55){const width=52+(rng(section,8)%31);const base=safeBase(l,cursor+3,Math.min(width-4,38),28);if(base){const fn=THEMES[section%THEMES.length];const before=a.blocks;const made=fn(l,base,section)||0;a.blocks+=made;if(made>0){a.sections++;a.names.push(fn.name)}}cursor+=width;section++;if(section>200)break}a.builtTo=end;window.__bgLevelDesignAudit=a;removeFood(state);const badge=document.getElementById("bgAllTestBadge");if(badge)badge.textContent=`TESTE DESIGN V4 • ${a.sections} TRECHOS • ATÉ ${end} m`;return true}

  function installSpawnFilter(){if(!(window.Mario&&Mario.SpriteTemplate))return false;const p=Mario.SpriteTemplate.prototype;if(p.__bgV4NoFood)return true;const old=p.Spawn;p.__bgV4NoFood=true;p.Spawn=function(){if(REMOVED.has(this.__bgTestVariant)){this.IsDead=true;return}return old.apply(this,arguments)};return true}
  function installHook(){if(!(window.Mario&&Mario.LevelState))return false;const p=Mario.LevelState.prototype;if(p.__bgLevelDesignHookV4)return true;const enter=p.Enter,update=p.Update;p.__bgLevelDesignHookV4=true;p.Enter=function(){const r=enter.apply(this,arguments);window.__bgTestRun=true;try{designToEnd(this)}catch(e){console.warn("level design v4 enter",e)}return r};p.Update=function(){const oldLevel=this.Level,r=update.apply(this,arguments);window.__bgTestRun=true;try{if(this.Level!==oldLevel||!this.Level.__bgLevelDesignV4||this.Level.__bgLevelDesignV4.builtTo<Math.min(FINISH,this.Level.Width-70))designToEnd(this)}catch(e){}return r};return true}
  function install(){if(!(window.Mario&&Mario.LevelState&&Mario.SpriteTemplate&&Mario.Tile))return false;installSpawnFilter();installHook();try{const st=window.Mario&&Mario.MarioCharacter&&Mario.MarioCharacter.World;if(st)designToEnd(st)}catch(e){}return true}
  if(!install()){const t=setInterval(()=>{if(install())clearInterval(t)},40);setTimeout(()=>clearInterval(t),15000)}
})();
