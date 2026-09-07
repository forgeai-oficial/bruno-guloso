(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_LEVEL_DESIGN_V4_FILLER__)return;
  window.__BG_LEVEL_DESIGN_V4_FILLER__=true;
  const START=200,FINISH=6344,LEFT=132,MID=133,RIGHT=134,SOLID=145;
  const rng=n=>{n=(n|0)^0x9e3779b9;n=Math.imul(n^(n>>>16),0x21f0aaad);n=Math.imul(n^(n>>>15),0x735a2d97);return(n^(n>>>15))>>>0};
  const ok=(l,x,y)=>l&&x>=0&&y>0&&x<l.Width&&y<l.Height-1;
  const empty=(l,x,y)=>ok(l,x,y)&&(l.GetBlock(x,y)&255)===0;
  const block=(l,x,y)=>{try{return !!l.IsBlocking(x,y,0,1)}catch(e){return false}};
  const templEmpty=(l,x,y)=>{try{return ok(l,x,y)&&l.GetSpriteTemplate(x,y)===null}catch(e){return false}};
  const gy=(l,x)=>{let f=-1;for(let y=4;y<l.Height;y++)if(block(l,x,y)&&!block(l,x,y-1)&&!block(l,x,y-2))f=y;return f};
  function behavior(mask,forbid=0){try{for(let i=1;i<256;i++){const b=Mario.Tile.Behaviors[i]||0;if((b&mask)===mask&&!(b&forbid))return i}}catch(e){}return 0}
  const BR=()=>behavior(Mario.Tile.Breakable)||16,BU=()=>behavior(Mario.Tile.Bumpable,Mario.Tile.Special)||21,SP=()=>behavior(Mario.Tile.Bumpable|Mario.Tile.Special)||18;
  function air(l,x,y,id){if(!empty(l,x,y)||!templEmpty(l,x,y))return 0;l.SetBlock(x,y,id);return 1}
  function plat(l,x,y,w){if(!ok(l,x,y)||x+w>=l.Width)return 0;for(let i=0;i<w;i++)if(!empty(l,x+i,y)||!templEmpty(l,x+i,y))return 0;for(let i=0;i<w;i++)l.SetBlock(x+i,y,i===0?LEFT:(i===w-1?RIGHT:MID));return w}
  function row(l,x,y,w,id,g=[]){let n=0,gs=new Set(g);for(let i=0;i<w;i++)if(!gs.has(i))n+=air(l,x+i,y,id);return n}
  function col(l,x,y0,y1,id){let n=0;for(let y=y0;y>=y1;y--)n+=air(l,x,y,id);return n}
  function pipe(l,x,g,h){let n=0;for(let i=0;i<h;i++){const y=g-h+i;n+=air(l,x,y,i?26:10);n+=air(l,x+1,y,i?27:11)}return n}
  function donut(l,x,y,key){if(!ok(l,x,y))return;if(!l.__bgAllTestDonuts)l.__bgAllTestDonuts=[];if(l.__bgAllTestDonuts.some(d=>d.key===key))return;l.__bgAllTestDonuts.push({key,x:x*16+8,y:y*16+8,phase:rng(x*41+y)%31})}
  function tpl(l,x,y,kind,extra){try{if(!empty(l,x,y)||l.GetSpriteTemplate(x,y)!==null)return 0;const t=new Mario.SpriteTemplate(Mario.Enemy.Goomba,false);t.__bgTestVariant=kind;if(extra)Object.assign(t,extra);l.SetSpriteTemplate(x,y,t);return 1}catch(e){return 0}}
  function visualCount(l,x0,x1){let n=0;for(let x=x0;x<x1;x++){const g=gy(l,x);if(g<6)continue;for(let y=Math.max(1,g-10);y<=g-2;y++)if((l.GetBlock(x,y)&255)!==0)n++}return n}
  function base(l,a,w=18){for(let r=0;r<14;r++)for(const x of r?[a-r,a+r]:[a]){if(x<START+2||x+w>=Math.min(FINISH-35,l.Width-35))continue;let ys=[];for(let i=0;i<w;i++){const y=gy(l,x+i);if(y>6)ys.push(y)}if(ys.length>=Math.floor(w*.7)){ys.sort((a,b)=>a-b);return{x,g:ys[ys.length>>1]}}}return null}

  function motif(l,b,k,id){const{x,g}=b,br=BR(),bu=BU(),sp=SP();let n=0;
    if(k===0){n+=col(l,x+2,g-1,g-6,br);n+=col(l,x+12,g-1,g-6,br);n+=row(l,x+2,g-7,11,br,[4,5,6]);n+=plat(l,x+5,g-5,5);n+=air(l,x+7,g-5,sp)}
    else if(k===1){n+=plat(l,x+1,g-3,4);n+=plat(l,x+6,g-5,4);n+=plat(l,x+11,g-7,4);n+=plat(l,x+16,g-4,4);for(const [dx,h]of[[2,4],[7,6],[12,8],[17,5]])donut(l,x+dx,g-h,`vf1:${id}:${dx}`)}
    else if(k===2){n+=pipe(l,x+2,g,2);n+=pipe(l,x+8,g,4);n+=pipe(l,x+15,g,3);n+=plat(l,x+5,g-7,6);n+=air(l,x+7,g-7,bu)}
    else if(k===3){for(let i=0;i<5;i++)for(let h=0;h<=i;h++)n+=air(l,x+1+i,g-1-h,br);for(let i=0;i<5;i++)for(let h=0;h<=4-i;h++)n+=air(l,x+7+i,g-1-h,br);n+=plat(l,x+5,g-6,5)}
    else if(k===4){n+=plat(l,x+1,g-6,5);n+=plat(l,x+8,g-9,6);n+=plat(l,x+16,g-6,5);n+=tpl(l,x+7,g-5,"moveH",{range:30,phase:2});for(let i=0;i<4;i++)donut(l,x+9+i,g-10,`vf4:${id}:${i}`)}
    else if(k===5){n+=row(l,x+1,g-5,18,br,[4,5,11,12]);n+=row(l,x+4,g-8,12,br,[3,7]);n+=col(l,x+1,g-1,g-4,br);n+=col(l,x+18,g-1,g-4,br);n+=air(l,x+9,g-8,sp)}
    else if(k===6){n+=plat(l,x+2,g-4,5);n+=plat(l,x+10,g-7,5);n+=col(l,x+5,g-1,g-3,SOLID);n+=col(l,x+13,g-1,g-6,SOLID);n+=tpl(l,x+7,g-3,"spring");n+=tpl(l,x+16,g-5,"fall")}
    else{n+=row(l,x+1,g-7,20,br,[2,3,8,9,14,15]);n+=plat(l,x+3,g-4,5);n+=plat(l,x+12,g-5,6);n+=air(l,x+6,g-4,bu);n+=air(l,x+15,g-5,sp)}
    return n;
  }

  function fillDead(state){const l=state&&state.Level;if(!l||!window.Mario||!Mario.Tile)return false;const end=Math.min(FINISH,l.Width-55);if(end<=START)return false;if(!l.__bgV4Filler)l.__bgV4Filler={to:START,filled:0};const a=l.__bgV4Filler;let from=Math.max(START,a.to||START);for(let x=START+18+Math.floor((from-START)/26)*26;x<end-22;x+=26){if(visualCount(l,x-8,x+19)>=11)continue;const b=base(l,x-3,20);if(!b)continue;const made=motif(l,b,rng(x)%8,x);if(made>0)a.filled++}a.to=end;window.__bgLevelDesignFillerAudit=a;return true}
  function install(){if(!(window.Mario&&Mario.LevelState&&Mario.Tile))return false;const p=Mario.LevelState.prototype;if(p.__bgV4FillerHook)return true;const enter=p.Enter,update=p.Update;p.__bgV4FillerHook=true;p.Enter=function(){const r=enter.apply(this,arguments);try{setTimeout(()=>fillDead(this),0)}catch(e){}return r};p.Update=function(){const before=this.Level,r=update.apply(this,arguments);try{if(this.Level!==before||!this.Level.__bgV4Filler||this.Level.__bgV4Filler.to<Math.min(FINISH,this.Level.Width-55))fillDead(this)}catch(e){}return r};return true}
  if(!install()){const t=setInterval(()=>{if(install())clearInterval(t)},50);setTimeout(()=>clearInterval(t),15000)}
})();
