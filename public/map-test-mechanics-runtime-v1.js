(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_TEST_MECHANICS_RUNTIME_V3__)return;
  window.__BG_TEST_MECHANICS_RUNTIME_V3__=true;
  window.__bgTestRun=true;

  let badge=document.getElementById("bgAllTestBadge");
  if(!badge){
    badge=document.createElement("div");badge.id="bgAllTestBadge";
    Object.assign(badge.style,{position:"fixed",left:"50%",top:"4px",transform:"translateX(-50%)",zIndex:"500",padding:"4px 8px",borderRadius:"8px",background:"rgba(10,15,30,.82)",border:"1px solid rgba(255,255,255,.28)",font:"800 10px/1.1 Inter,system-ui,sans-serif",color:"#fff",pointerEvents:"none",display:"none"});
    document.body.appendChild(badge);const st=document.createElement("style");st.textContent="body.bg-game-active #bgAllTestBadge{display:block}";document.head.appendChild(st);
  }
  badge.textContent="TESTE DESIGN SEGURO • 0–200 ORIGINAL";

  function snapshotBase(state){
    try{
      const l=state&&state.Level;if(!l||!l.Width||!l.Height)return false;
      const w=l.Width|0,h=l.Height|0;
      if(l.__bgBaseSnapshotV5&&l.__bgBaseSnapshotV5.width===w&&l.__bgBaseSnapshotV5.height===h)return true;
      const blocks=new Uint8Array(w*h),ground=new Int16Array(w);ground.fill(-1);
      for(let x=0;x<w;x++){
        let g=-1;
        for(let y=0;y<h;y++){
          blocks[x*h+y]=l.GetBlock(x,y)&255;
          try{if(y>=3&&l.IsBlocking(x,y,0,1)&&!l.IsBlocking(x,y-1,0,1)&&!l.IsBlocking(x,y-2,0,1))g=y}catch(e){}
        }
        ground[x]=g;
      }
      l.__bgBaseSnapshotV5={width:w,height:h,blocks,ground,created:Date.now()};
      window.__bgBaseSnapshotV5=l.__bgBaseSnapshotV5;
      return true;
    }catch(e){return false}
  }

  function platformContact(s,w=44){const m=window.Mario&&Mario.MarioCharacter;if(!m||m.DeathTime>0||m.WinTime>0)return false;const top=s.Y-5,half=w/2;if(Number(m.Ya)>=0&&m.X>=s.X-half-3&&m.X<=s.X+half+3&&m.Y>=top-5&&m.Y<=top+9&&m.YOld<=top+5){m.Y=top;m.Ya=0;m.OnGround=true;m.MayJump=true;return true}return false}
  function BasePlatform(world,x,y){Mario.NotchSprite.call(this);this.World=world;this.X=this.XOld=x;this.Y=this.YOld=y;this.Layer=1;this.__w=44}
  BasePlatform.prototype=Object.create(Mario.NotchSprite.prototype);BasePlatform.prototype.constructor=BasePlatform;
  BasePlatform.prototype.Draw=function(ctx){const w=this.__w|0;ctx.save();ctx.translate(Math.round(this.X),Math.round(this.Y));ctx.fillStyle="#57391f";ctx.fillRect(-(w>>1),-5,w,6);ctx.fillStyle="#e5a13b";ctx.fillRect(-(w>>1)+2,-7,w-4,3);ctx.restore()};
  function MovingH(world,x,y,range,phase){BasePlatform.call(this,world,x,y);this.BaseX=x;this.range=range||30;this.phase=phase||0}
  MovingH.prototype=Object.create(BasePlatform.prototype);MovingH.prototype.constructor=MovingH;MovingH.prototype.Move=function(){const old=this.X;this.phase+=.045;this.X=this.BaseX+Math.sin(this.phase)*this.range;const dx=this.X-old;if(platformContact(this,this.__w)&&Math.abs(dx)<4)Mario.MarioCharacter.X+=dx};
  function Elevator(world,x,y,range,phase){BasePlatform.call(this,world,x,y);this.BaseY=y;this.range=range||40;this.phase=phase||0}
  Elevator.prototype=Object.create(BasePlatform.prototype);Elevator.prototype.constructor=Elevator;Elevator.prototype.Move=function(){const old=this.Y;this.phase+=.04;this.Y=this.BaseY+Math.sin(this.phase)*this.range;const dy=this.Y-old;if(platformContact(this,this.__w)&&Math.abs(dy)<4)Mario.MarioCharacter.Y+=dy};
  function OscPlatform(world,x,y){BasePlatform.call(this,world,x,y);this.BaseX=x;this.BaseY=y;this.phase=0}
  OscPlatform.prototype=Object.create(BasePlatform.prototype);OscPlatform.prototype.constructor=OscPlatform;OscPlatform.prototype.Move=function(){const ox=this.X,oy=this.Y;this.phase+=.04;this.X=this.BaseX+Math.sin(this.phase)*26;this.Y=this.BaseY+Math.sin(this.phase*2)*9;const dx=this.X-ox,dy=this.Y-oy;if(platformContact(this,this.__w)){Mario.MarioCharacter.X+=dx;Mario.MarioCharacter.Y+=dy}};
  function FallingPlatform(world,x,y){BasePlatform.call(this,world,x,y);this.BaseY=y;this.wait=-1;this.v=0;this.reset=0}
  FallingPlatform.prototype=Object.create(BasePlatform.prototype);FallingPlatform.prototype.constructor=FallingPlatform;FallingPlatform.prototype.Move=function(){if(this.reset>0){if(--this.reset===0){this.Y=this.BaseY;this.v=0;this.wait=-1;this.Visible=true}return}if(this.wait>=0&&--this.wait<=0)this.v=.7;if(this.v){this.v+=.45;this.Y+=this.v;if(this.Y>this.BaseY+180){this.Visible=false;this.reset=120;return}}if(this.Visible&&platformContact(this,this.__w)&&this.wait<0)this.wait=22};
  function Spring(world,x,y){BasePlatform.call(this,world,x,y);this.__w=20;this.cool=0}
  Spring.prototype=Object.create(BasePlatform.prototype);Spring.prototype.constructor=Spring;
  Spring.prototype.Move=function(){if(this.cool>0)this.cool--;const m=Mario.MarioCharacter,top=this.Y-6;if(this.cool<=0&&m&&m.Ya>=0&&Math.abs(m.X-this.X)<=11&&m.Y>=top-5&&m.Y<=top+8&&m.YOld<=top+5){m.Y=top;m.Ya=-19;m.OnGround=false;m.MayJump=false;m.JumpTime=0;this.cool=12;try{Enjine.Resources.PlaySound("jump")}catch(e){}}};
  Spring.prototype.Draw=function(ctx){ctx.save();ctx.translate(Math.round(this.X),Math.round(this.Y));ctx.fillStyle="#29364b";ctx.fillRect(-10,-3,20,3);ctx.fillStyle="#f1a928";ctx.fillRect(-9,-7,18,4);ctx.fillStyle="#fff07a";ctx.fillRect(-6,-9,12,2);ctx.restore()};

  function syncDonuts(state){try{const l=state&&state.Level,d=state&&state.__bgCollectibleData;if(!l||!d||!Array.isArray(d.items))return;const src=[].concat(Array.isArray(l.__bgV5Donuts)?l.__bgV5Donuts:[],Array.isArray(l.__bgAllTestDonuts)?l.__bgAllTestDonuts:[]);const have=new Set(d.items.map(i=>i&&(i.__bgV5Key||i.__bgAllTestKey)).filter(Boolean));for(const q of src){const key=q&&q.key;if(!key||have.has(key))continue;d.items.push({x:q.x,y:q.y,taken:false,phase:q.phase||0,__bgV5Key:key,__bgAllTestKey:key});have.add(key)}}catch(e){}}

  function installSpawn(){if(!(window.Mario&&Mario.SpriteTemplate&&Mario.SpriteTemplate.prototype))return false;const p=Mario.SpriteTemplate.prototype;if(p.__bgV5RuntimeSpawnV3)return true;const old=p.Spawn;p.__bgV5RuntimeSpawnV3=true;p.Spawn=function(world,b,c,facing){const k=this.__bgV5Kind||this.__bgTestVariant;if(!["moveH","elevator","fall","osc","spring"].includes(k))return old.apply(this,arguments);if(this.IsDead)return;const x=b*16+8,y=(c+1)*16-1;let s=null,range=this.__bgRange||this.range||30,phase=this.__bgPhase||this.phase||0;if(k==="moveH")s=new MovingH(world,x,y,range,phase);else if(k==="elevator")s=new Elevator(world,x,y,range||40,phase);else if(k==="fall")s=new FallingPlatform(world,x,y);else if(k==="osc")s=new OscPlatform(world,x,y);else if(k==="spring")s=new Spring(world,x,y);if(!s)return old.apply(this,arguments);this.Sprite=s;s.SpriteTemplate=this;world.AddSprite(s)};return true}

  function installStateHook(){if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;const p=Mario.LevelState.prototype;if(p.__bgV5RuntimeStateV3)return true;const enter=p.Enter,update=p.Update;p.__bgV5RuntimeStateV3=true;
    p.Enter=function(){const r=enter.apply(this,arguments);window.__bgTestRun=true;try{snapshotBase(this);syncDonuts(this)}catch(e){}return r};
    p.Update=function(){const before=this.Level,r=update.apply(this,arguments);window.__bgTestRun=true;try{if(this.Level!==before||!this.Level.__bgBaseSnapshotV5)snapshotBase(this);syncDonuts(this)}catch(e){}return r};return true}
  function install(){if(!(window.Mario&&Mario.NotchSprite&&Mario.SpriteTemplate&&Mario.LevelState))return false;installSpawn();installStateHook();return true}
  if(!install()){const t=setInterval(()=>{if(install())clearInterval(t)},40);setTimeout(()=>clearInterval(t),15000)}
  window.__bgV5Mechanics={active:true,legacyBuilderDisabled:true,snapshotBase};
})();
