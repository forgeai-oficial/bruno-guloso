(()=>{
  "use strict";
  const params=new URLSearchParams(location.search);
  if(params.get("test")!=="all")return;
  if(window.__BG_ALL_MECHANICS_TEST_V1__)return;
  window.__BG_ALL_MECHANICS_TEST_V1__=true;

  const TEST_START=600;
  const TEST_END=1500;
  const SOLID=145;
  const PLATFORM_LEFT=132,PLATFORM_MID=133,PLATFORM_RIGHT=134;
  const FEATURE_NAMES=[
    "Morros altos","Segunda rota superior","Escada de tijolos","Ponte suspensa","Plataformas sobre buraco",
    "Plataforma horizontal","Pequeno elevador","Plataforma que cai","Plataforma oscilante","Trampolim",
    "Bloco invisível","Bloco com várias rosquinhas","Bloco azul secreto","Tijolo com rosquinha","Arco de rosquinhas",
    "Hambúrguer Andante","Coxinha Cautelosa","Refrigerante Saltador","Brigadeiro Nervoso","Pudim Pesado",
    "Pudim Blindado","Salsicha do cano","Cupcake Saltador","Pizza Rolante","Dupla de monstros",
    "Mini arena curta","Segredo do cogumelo azul","Alcova alta","Atalho quebrando teto","Corrida azul",
    "Escada de blocos secretos","Cano com monstro","Lançador de comida","Sala bônus real","Rampas reais","Scroll vertical"
  ];
  const anchors=Array.from({length:36},(_,i)=>612+i*24);

  const badge=document.createElement("div");
  badge.id="bgAllTestBadge";
  badge.textContent="TESTE • 36 MECÂNICAS • 0–600 ORIGINAL";
  Object.assign(badge.style,{position:"fixed",left:"50%",top:"4px",transform:"translateX(-50%)",zIndex:"500",padding:"4px 8px",borderRadius:"8px",background:"rgba(10,15,30,.78)",border:"1px solid rgba(255,255,255,.28)",font:"800 10px/1.1 Inter,system-ui,sans-serif",color:"#fff",pointerEvents:"none",display:"none"});
  document.body.appendChild(badge);
  const style=document.createElement("style");
  style.textContent="body.bg-game-active #bgAllTestBadge{display:block}";
  document.head.appendChild(style);

  function hash(n,s=0){n=(n|0)^(s|0)^0x51ed270b;n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return (n^(n>>>16))>>>0}
  function inBounds(l,x,y){return !!l&&x>=0&&y>=0&&x<(l.Width|0)&&y<(l.Height|0)}
  function tile(l,x,y){return inBounds(l,x,y)?(l.GetBlock(x,y)&255):255}
  function empty(l,x,y){return inBounds(l,x,y)&&tile(l,x,y)===0}
  function blocking(l,x,y){try{return !!l.IsBlocking(x,y,0,1)}catch(e){return false}}
  function templateEmpty(l,x,y){try{return inBounds(l,x,y)&&l.GetSpriteTemplate(x,y)===null}catch(e){return false}}
  function surfaceY(l,x){for(let y=2;y<(l.Height|0);y++)if(blocking(l,x,y)&&!blocking(l,x,y-1)&&!blocking(l,x,y-2))return y;return -1}
  function flatAt(l,x,len){const y=surfaceY(l,x);if(y<5)return -1;for(let i=0;i<len;i++){if(surfaceY(l,x+i)!==y)return -1;if(!empty(l,x+i,y-1)||!empty(l,x+i,y-2))return -1}return y}
  function findFlat(l,anchor,len=8,radius=28){for(let r=0;r<=radius;r++){for(const x of r?[anchor-r,anchor+r]:[anchor]){if(x<TEST_START+4||x+len>=Math.min(TEST_END-2,l.Width-4))continue;const y=flatAt(l,x,len);if(y>0)return{x,y}}}return null}
  function putPlatform(l,x,y,len){if(y<1||x<1||x+len>=l.Width-1)return false;for(let i=0;i<len;i++)if(!empty(l,x+i,y))return false;for(let i=0;i<len;i++)l.SetBlock(x+i,y,i===0?PLATFORM_LEFT:i===len-1?PLATFORM_RIGHT:PLATFORM_MID);return true}
  function behaviorTile(mask,forbid=0){try{for(let i=1;i<256;i++){const b=Mario.Tile.Behaviors[i]||0;if((b&mask)===mask&&!(b&forbid))return i}}catch(e){}return 0}
  function breakableId(){return behaviorTile(Mario.Tile.Breakable)}
  function bumpableId(){return behaviorTile(Mario.Tile.Bumpable,Mario.Tile.Special)}
  function specialId(){return behaviorTile(Mario.Tile.Bumpable|Mario.Tile.Special)}
  function markFeature(state,n,ok,detail){const a=audit(state);a.features[n-1]={n,name:FEATURE_NAMES[n-1],ok:!!ok,detail:detail||""};return ok}
  function audit(state){if(!state.__bgAllTestAudit)state.__bgAllTestAudit={mode:"all",untouchedUntil:TEST_START,features:FEATURE_NAMES.map((name,i)=>({n:i+1,name,ok:false,detail:""})),prepared:false,bonusEntered:false};window.__bgAllTestAudit=state.__bgAllTestAudit;return state.__bgAllTestAudit}

  function makeTemplate(kind,extra){const t=new Mario.SpriteTemplate(Mario.Enemy.Goomba,false);t.__bgTestVariant=kind;if(extra)Object.assign(t,extra);return t}
  function placeTemplate(l,x,y,kind,extra,allowOccupied=false){if(!inBounds(l,x,y)||!templateEmpty(l,x,y)||(!allowOccupied&&!empty(l,x,y)))return false;l.SetSpriteTemplate(x,y,makeTemplate(kind,extra));return true}
  function addDonut(l,x,y,key){if(!l.__bgAllTestDonuts)l.__bgAllTestDonuts=[];if(l.__bgAllTestDonuts.some(d=>d.key===key))return;l.__bgAllTestDonuts.push({key,x:x*16+8,y:y*16+8,phase:hash(x*37+y,91)%31})}
  function syncDonuts(state){try{const l=state.Level,d=state.__bgCollectibleData;if(!l||!d||!Array.isArray(d.items)||!Array.isArray(l.__bgAllTestDonuts))return;const have=new Set(d.items.map(i=>i&&i.__bgAllTestKey).filter(Boolean));for(const q of l.__bgAllTestDonuts){if(have.has(q.key))continue;d.items.push({x:q.x,y:q.y,taken:false,phase:q.phase,__bgAllTestKey:q.key});have.add(q.key)}}catch(e){}}
  function awardDonut(state,x,y){try{const d=state.__bgCollectibleData;if(d){d.donuts=Math.max(0,Number(d.donuts)||0)+1;d.score=d.donuts*10;window.__bgDonutsCollected=d.donuts;window.__bgDonutScore=d.score;if(Array.isArray(d.effects))d.effects.push({x,y,text:"+10",kind:"donut",life:620,max:620})}Enjine.Resources.PlaySound("coin")}catch(e){}}

  function foodDraw(ctx,s,kind){if(!ctx||s.Visible===false)return;const x=Math.round(s.X||0),y=Math.round(s.Y||0);ctx.save();ctx.translate(x,y);
    if(kind==="hamburger"){ctx.fillStyle="#d99845";ctx.fillRect(-7,-13,14,4);ctx.fillStyle="#f2c46d";ctx.fillRect(-5,-15,10,2);ctx.fillStyle="#4e2a17";ctx.fillRect(-7,-8,14,4);ctx.fillStyle="#48a647";ctx.fillRect(-7,-10,14,2);ctx.fillStyle="#e2a632";ctx.fillRect(-6,-4,12,3)}
    else if(kind==="coxinha"){ctx.fillStyle="#d58a2d";ctx.fillRect(-6,-9,12,7);ctx.fillRect(-4,-13,8,4);ctx.fillRect(-2,-16,4,3);ctx.fillStyle="#f2bd55";ctx.fillRect(-4,-11,8,3)}
    else if(kind==="refri"){ctx.fillStyle="#d93d3d";ctx.fillRect(-5,-15,10,14);ctx.fillStyle="#55b9ff";ctx.fillRect(-4,-11,8,6);ctx.fillStyle="#e8edf5";ctx.fillRect(-3,-16,6,1)}
    else if(kind==="brigadeiro"){ctx.fillStyle="#3a1c16";ctx.fillRect(-6,-9,12,7);ctx.fillRect(-4,-12,8,3);ctx.fillStyle="#7a402d";ctx.fillRect(-5,-10,2,2);ctx.fillRect(1,-8,2,2);ctx.fillRect(-1,-12,2,2)}
    else if(kind==="pudim"||kind==="pudim2"){ctx.fillStyle="#d18a24";ctx.fillRect(-7,-10,14,8);ctx.fillStyle="#f5c955";ctx.fillRect(-6,-12,12,4);ctx.fillStyle="#7a351d";ctx.fillRect(-6,-13,12,2);if(kind==="pudim2"){ctx.fillStyle="#7fc8ff";ctx.fillRect(-8,-9,2,6);ctx.fillRect(6,-9,2,6)}}
    else if(kind==="cupcake"){ctx.fillStyle="#c85c85";ctx.fillRect(-6,-12,12,5);ctx.fillStyle="#f2a9c4";ctx.fillRect(-4,-15,8,3);ctx.fillStyle="#9a5c34";ctx.fillRect(-5,-7,10,6)}
    ctx.fillStyle="#141414";ctx.fillRect(-3,-6,1,1);ctx.fillRect(2,-6,1,1);ctx.restore()}

  function FoodEnemy(world,x,y,facing,kind){Mario.Enemy.call(this,world,x,y,facing,Mario.Enemy.Goomba,false);this.__kind=kind;this.__cool=35+(hash(x|0,33)%35);this.__hits=kind==="pudim2"?2:1;if(kind==="coxinha")this.AvoidCliffs=true;if(kind==="pudim")this.NoFireballDeath=true}
  FoodEnemy.prototype=Object.create(Mario.Enemy.prototype);FoodEnemy.prototype.constructor=FoodEnemy;
  FoodEnemy.prototype.Draw=function(ctx){foodDraw(ctx,this,this.__kind)};
  FoodEnemy.prototype.Move=function(){const oldX=this.X;if((this.__kind==="refri"||this.__kind==="cupcake")&&this.DeadTime===0){if(--this.__cool<=0&&this.OnGround){this.Ya=this.__kind==="cupcake"?-11:-9;this.OnGround=false;this.__cool=this.__kind==="cupcake"?38:58}}const r=Mario.Enemy.prototype.Move.call(this);if(this.DeadTime===0){if(this.__kind==="pudim")this.X=oldX+(this.X-oldX)*.5;else if(this.__kind==="brigadeiro"&&!this.SubMove(this.Facing*.85,0))this.Facing=-this.Facing}return r};
  FoodEnemy.prototype.CollideCheck=function(){if(this.__kind!=="pudim2")return Mario.Enemy.prototype.CollideCheck.call(this);if(this.DeadTime!==0)return;const m=Mario.MarioCharacter,dx=m.X-this.X,dy=m.Y-this.Y;if(dx>-12&&dx<12&&dy>-this.Height&&dy<m.Height){if(m.Ya>0&&dy<=0&&(!m.OnGround||!m.WasOnGround)){m.Stomp(this);this.__hits--;if(this.__hits<=0){this.DeadTime=10;this.YPicO=7;this.PicHeight=8;if(this.SpriteTemplate)this.SpriteTemplate.IsDead=true}else{try{Enjine.Resources.PlaySound("bump")}catch(e){}}}else m.GetHurt()}};

  function SausageEnemy(world,x,y){Mario.FlowerEnemy.call(this,world,x,y);this.__kind="sausage"}
  SausageEnemy.prototype=Object.create(Mario.FlowerEnemy.prototype);SausageEnemy.prototype.constructor=SausageEnemy;
  SausageEnemy.prototype.Draw=function(ctx){const x=Math.round(this.X),y=Math.round(this.Y);ctx.save();ctx.translate(x,y);ctx.fillStyle="#b64032";ctx.fillRect(-5,-17,10,14);ctx.fillStyle="#ed8b62";ctx.fillRect(-3,-15,6,4);ctx.fillStyle="#f2ca48";ctx.fillRect(-5,-6,10,1);ctx.fillStyle="#151515";ctx.fillRect(-2,-11,1,1);ctx.fillRect(2,-11,1,1);ctx.restore()};

  function PizzaRoll(world,x,y,facing){Mario.Shell.call(this,world,x,y,0);this.Facing=facing||1;this.__angle=0}
  PizzaRoll.prototype=Object.create(Mario.Shell.prototype);PizzaRoll.prototype.constructor=PizzaRoll;
  PizzaRoll.prototype.Move=function(){this.__angle+=.23*this.Facing;return Mario.Shell.prototype.Move.call(this)};
  PizzaRoll.prototype.Draw=function(ctx){ctx.save();ctx.translate(Math.round(this.X),Math.round(this.Y-7));ctx.rotate(this.__angle);ctx.fillStyle="#d68a33";ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#e8c352";ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#bd3f35";ctx.fillRect(-3,-3,2,2);ctx.fillRect(2,1,2,2);ctx.fillRect(-1,3,2,2);ctx.restore()};

  function platformContact(s,w=44){const m=Mario.MarioCharacter;if(!m||m.DeathTime>0||m.WinTime>0)return false;const top=s.Y-5,half=w/2;if(Number(m.Ya)>=0&&m.X>=s.X-half-3&&m.X<=s.X+half+3&&m.Y>=top-5&&m.Y<=top+9&&m.YOld<=top+5){m.Y=top;m.Ya=0;m.OnGround=true;m.MayJump=true;return true}return false}
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
  FallingPlatform.prototype=Object.create(BasePlatform.prototype);FallingPlatform.prototype.constructor=FallingPlatform;FallingPlatform.prototype.Move=function(){if(this.reset>0){if(--this.reset===0){this.Y=this.BaseY;this.v=0;this.wait=-1;this.Visible=true}return}if(this.wait>=0){if(--this.wait<=0)this.v=.7}if(this.v){this.v+=.45;this.Y+=this.v;if(this.Y>this.BaseY+180){this.Visible=false;this.reset=120;return}}if(this.Visible&&platformContact(this,this.__w)&&this.wait<0)this.wait=22};
  function Spring(world,x,y){BasePlatform.call(this,world,x,y);this.__w=20;this.cool=0}
  Spring.prototype=Object.create(BasePlatform.prototype);Spring.prototype.constructor=Spring;Spring.prototype.Move=function(){if(this.cool>0)this.cool--;const m=Mario.MarioCharacter,top=this.Y-6;if(this.cool<=0&&m&&m.Ya>=0&&Math.abs(m.X-this.X)<=11&&m.Y>=top-5&&m.Y<=top+8&&m.YOld<=top+5){m.Y=top;m.Ya=-19;m.OnGround=false;m.MayJump=false;m.JumpTime=0;this.cool=12;try{Enjine.Resources.PlaySound("jump")}catch(e){}}};Spring.prototype.Draw=function(ctx){ctx.save();ctx.translate(Math.round(this.X),Math.round(this.Y));ctx.fillStyle="#29364b";ctx.fillRect(-10,-3,20,3);ctx.fillStyle="#f1a928";ctx.fillRect(-9,-7,18,4);ctx.fillStyle="#fff07a";ctx.fillRect(-6,-9,12,2);ctx.restore()};
  function Ramp(world,x,y,dir){Mario.NotchSprite.call(this);this.World=world;this.X=this.XOld=x;this.Y=this.YOld=y;this.Layer=1;this.dir=dir||1;this.w=64;this.h=34}
  Ramp.prototype=Object.create(Mario.NotchSprite.prototype);Ramp.prototype.constructor=Ramp;Ramp.prototype.surface=function(px){const left=this.X-this.w/2,t=Math.max(0,Math.min(1,(px-left)/this.w));return this.dir>0?this.Y-t*this.h:this.Y-(1-t)*this.h};Ramp.prototype.Move=function(){const m=Mario.MarioCharacter;if(!m||m.Ya<0)return;const left=this.X-this.w/2,right=this.X+this.w/2;if(m.X<left-2||m.X>right+2)return;const sy=this.surface(m.X);if(m.Y>=sy-5&&m.Y<=sy+10&&m.YOld<=sy+6){m.Y=sy;m.Ya=0;m.OnGround=true;m.MayJump=true}};Ramp.prototype.Draw=function(ctx){ctx.save();ctx.translate(Math.round(this.X-this.w/2),Math.round(this.Y));ctx.fillStyle="#805326";for(let i=0;i<8;i++){const yy=-Math.round((i+1)*this.h/8),xx=i*8;if(this.dir>0)ctx.fillRect(xx,yy,8,-yy+1);else ctx.fillRect(this.w-xx-8,yy,8,-yy+1)}ctx.restore()};

  function FoodShot(world,x,y,dir){Mario.NotchSprite.call(this);this.World=world;this.X=this.XOld=x;this.Y=this.YOld=y;this.Layer=1;this.dir=dir||-1;this.life=150;this.Ya=-1}
  FoodShot.prototype=Object.create(Mario.NotchSprite.prototype);FoodShot.prototype.constructor=FoodShot;FoodShot.prototype.Move=function(){this.X+=this.dir*3.4;this.Y+=this.Ya;this.Ya+=.08;if(--this.life<=0||Math.abs(this.X-Mario.MarioCharacter.X)>450)this.World.RemoveSprite(this);try{if(this.World.Level.IsBlocking(this.X/16|0,this.Y/16|0,this.dir*3,0))this.World.RemoveSprite(this)}catch(e){}};FoodShot.prototype.CollideCheck=function(){const m=Mario.MarioCharacter;if(Math.abs(m.X-this.X)<9&&Math.abs((m.Y-8)-this.Y)<12){m.GetHurt();this.World.RemoveSprite(this)}};FoodShot.prototype.Draw=function(ctx){ctx.save();ctx.translate(Math.round(this.X),Math.round(this.Y));ctx.fillStyle="#ee9a38";ctx.fillRect(-4,-3,8,6);ctx.fillStyle="#9f342b";ctx.fillRect(-2,-2,2,2);ctx.restore()};
  function Launcher(world,x,y){Mario.NotchSprite.call(this);this.World=world;this.X=this.XOld=x;this.Y=this.YOld=y;this.Layer=1;this.tick=30}
  Launcher.prototype=Object.create(Mario.NotchSprite.prototype);Launcher.prototype.constructor=Launcher;Launcher.prototype.Move=function(){const m=Mario.MarioCharacter;if(!m)return;if(--this.tick<=0&&Math.abs(m.X-this.X)<250){this.tick=75;this.World.AddSprite(new FoodShot(this.World,this.X,this.Y-18,m.X<this.X?-1:1));try{Enjine.Resources.PlaySound("cannon")}catch(e){}}};Launcher.prototype.Draw=function(ctx){ctx.save();ctx.translate(Math.round(this.X),Math.round(this.Y));ctx.fillStyle="#65351e";ctx.fillRect(-7,-18,14,18);ctx.fillStyle="#cf6535";ctx.fillRect(-9,-22,18,6);ctx.fillStyle="#231a18";ctx.fillRect(-5,-21,10,3);ctx.restore()};

  function BonusPipe(world,x,y){Mario.NotchSprite.call(this);this.World=world;this.X=this.XOld=x;this.Y=this.YOld=y;this.Layer=1;this.used=false}
  BonusPipe.prototype=Object.create(Mario.NotchSprite.prototype);BonusPipe.prototype.constructor=BonusPipe;BonusPipe.prototype.Move=function(){if(this.used||this.World.__bgInBonus)return;const m=Mario.MarioCharacter;if(m&&Math.abs(m.X-this.X)<10&&m.Y>=this.Y-8&&m.Y<=this.Y+10){this.used=true;enterBonus(this.World,this.X)}};BonusPipe.prototype.Draw=function(ctx){ctx.save();ctx.translate(Math.round(this.X),Math.round(this.Y));ctx.fillStyle="#1d7e55";ctx.fillRect(-8,-18,16,18);ctx.fillStyle="#36c979";ctx.fillRect(-11,-22,22,6);ctx.fillStyle="#d9fff0";ctx.font="bold 5px sans-serif";ctx.fillText("BÔNUS",-10,-25);ctx.restore()};

  function enterBonus(state,portalX){if(state.__bgInBonus)return;const m=Mario.MarioCharacter;state.__bgInBonus=true;audit(state).bonusEntered=true;window.__bgTestRun=true;
    state.__bgBonusSave={Level:state.Level,Layer:state.Layer,BgLayer:state.BgLayer,max:window.__jo2MaxLevelWidth,data:state.__bgCollectibleData,x:m.X,y:m.Y,portalX};
    const keep=m;for(const s of state.Sprites.Objects.slice())if(s!==keep)state.Sprites.Remove(s);
    const l=new Mario.Level(80,28);l.ExitX=79;l.ExitY=26;for(let x=0;x<80;x++)for(let y=26;y<28;y++)l.SetBlock(x,y,SOLID);for(let y=0;y<28;y++){l.SetBlock(0,y,SOLID);l.SetBlock(79,y,SOLID)}
    const shelves=[[5,23,8],[15,21,8],[25,19,8],[35,17,8],[45,15,8],[55,13,8],[45,11,7],[34,9,7],[23,7,7],[12,5,8],[55,5,10]];for(const [x,y,w] of shelves)putPlatform(l,x,y,w);
    l.__bgAllTestDonuts=[];for(const [x,y,w] of shelves)for(let i=1;i<w;i+=2)addDonut(l,x+i,y-1,`bonus:${x}:${i}`);
    window.__jo2MaxLevelWidth=80;state.Level=l;state.Layer=new Mario.LevelRenderer(l,320,240);state.__bgCollectibleData={score:Number(state.__bgBonusSave.data&&state.__bgBonusSave.data.score)||0,donuts:Number(state.__bgBonusSave.data&&state.__bgBonusSave.data.donuts)||0,items:[],powers:[],effects:[],scannedWidth:80,powerRemaining:Number(state.__bgBonusSave.data&&state.__bgBonusSave.data.powerRemaining)||0,initialized:true,__bgBlueCountV5:Number(state.__bgBonusSave.data&&state.__bgBonusSave.data.__bgBlueCountV5)||0};syncDonuts(state);
    m.X=4*16;m.Y=25*16;m.XOld=m.X;m.YOld=m.Y;m.Xa=0;m.Ya=0;state.Camera.X=0;state.Camera.Y=200;
    state.AddSprite(new Elevator(state,20*16,22*16,36,0));state.AddSprite(new Elevator(state,50*16,14*16,32,2));
  }
  function exitBonus(state){if(!state.__bgInBonus||!state.__bgBonusSave)return;const m=Mario.MarioCharacter,s=state.__bgBonusSave,bonusData=state.__bgCollectibleData;const gained=Math.max(0,(Number(bonusData&&bonusData.donuts)||0)-(Number(s.data&&s.data.donuts)||0));state.Level=s.Level;state.Layer=s.Layer;state.BgLayer=s.BgLayer;window.__jo2MaxLevelWidth=s.max;state.__bgCollectibleData=s.data;if(state.__bgCollectibleData&&gained){state.__bgCollectibleData.donuts=Math.max(0,Number(state.__bgCollectibleData.donuts)||0)+gained;state.__bgCollectibleData.score=state.__bgCollectibleData.donuts*10;window.__bgDonutsCollected=state.__bgCollectibleData.donuts}for(const obj of state.Sprites.Objects.slice())if(obj!==m)state.Sprites.Remove(obj);m.X=s.portalX+28;m.Y=s.y;m.XOld=m.X;m.YOld=m.Y;m.Xa=1;m.Ya=0;state.Camera.X=Math.max(0,m.X-160);state.Camera.Y=0;state.__bgInBonus=false;state.__bgBonusSave=null}

  function installSpawn(){const p=Mario.SpriteTemplate.prototype;if(p.__bgAllTestSpawn)return;const original=p.Spawn;p.__bgAllTestSpawn=true;p.Spawn=function(world,b,c,facing){const k=this.__bgTestVariant;if(!k)return original.apply(this,arguments);if(this.IsDead)return;let s=null,x=b*16+8,y=c*16+15;if(["hamburger","coxinha","refri","brigadeiro","pudim","pudim2","cupcake"].includes(k))s=new FoodEnemy(world,x,y,facing,k);else if(k==="sausage"||k==="pipeMonster")s=new SausageEnemy(world,b*16+15,c*16+24);else if(k==="pizza")s=new PizzaRoll(world,x,y,facing);else if(k==="moveH")s=new MovingH(world,x,(c+1)*16-1,this.range,this.phase);else if(k==="elevator")s=new Elevator(world,x,(c+1)*16-1,this.range,this.phase);else if(k==="fall")s=new FallingPlatform(world,x,(c+1)*16-1);else if(k==="osc")s=new OscPlatform(world,x,(c+1)*16-1);else if(k==="spring")s=new Spring(world,x,(c+1)*16-1);else if(k==="rampUp")s=new Ramp(world,x,(c+1)*16-1,1);else if(k==="rampDown")s=new Ramp(world,x,(c+1)*16-1,-1);else if(k==="launcher")s=new Launcher(world,x,(c+1)*16-1);else if(k==="bonusPipe")s=new BonusPipe(world,x,(c+1)*16-1);if(!s)return original.apply(this,arguments);this.Sprite=s;s.SpriteTemplate=this;world.AddSprite(s)}}

  function findGap(l,anchor,min=3,max=8){for(let r=0;r<60;r++){const x=anchor+(r%2?-(r>>1):(r>>1));if(x<TEST_START+4||x>TEST_END-12)continue;let n=0;for(let i=0;i<max;i++){if(surfaceY(l,x+i)<0)n++;else break}if(n>=min){const left=surfaceY(l,x-1),right=surfaceY(l,x+n);if(left>3&&right>3)return{x,len:n,y:Math.min(left,right)}}}return null}
  function safeObjectSpot(l,anchor,len=8){return findFlat(l,anchor,len,38)}
  function placeFeature(state,n,fn){let ok=false,detail="";try{const r=fn(anchors[n-1]);ok=!!r;detail=typeof r==="string"?r:""}catch(e){detail=String(e&&e.message||e)}return markFeature(state,n,ok,detail)}

  function prepare(state){if(!state||!state.Level||state.__bgAllTestPrepared||state.__bgInBonus)return;const l=state.Level;if((l.Width|0)<=TEST_END+40)return;state.__bgAllTestPrepared=true;const br=breakableId()||16,bu=bumpableId()||21,sp=specialId()||18;state.__bgTestHidden=[];state.__bgTestMulti=[];state.__bgTestBlue=[];state.__bgTestSecretStairs=[];state.__bgTestBrickRewards=[];
    const flat=(a,len=8)=>safeObjectSpot(l,a,len);

    placeFeature(state,1,a=>{const p=flat(a,12);if(!p)return false;const{x,y}=p;const cells=[[x+2,y-1],[x+3,y-1],[x+4,y-1],[x+5,y-1],[x+4,y-2],[x+5,y-2],[x+6,y-2],[x+5,y-3]];for(const[cx,cy]of cells)if(empty(l,cx,cy))l.SetBlock(cx,cy,SOLID);return true});
    placeFeature(state,2,a=>{const p=flat(a,13);if(!p)return false;const{x,y}=p;putPlatform(l,x+1,y-3,5);putPlatform(l,x+7,y-4,5);for(let i=0;i<5;i++)addDonut(l,x+1+i,y-4,`f2a:${x}:${i}`);for(let i=0;i<5;i++)addDonut(l,x+7+i,y-5,`f2b:${x}:${i}`);return true});
    placeFeature(state,3,a=>{const p=flat(a,10);if(!p)return false;const{x,y}=p;for(let i=0;i<5;i++)for(let h=0;h<=i;h++)if(empty(l,x+1+i,y-1-h))l.SetBlock(x+1+i,y-1-h,br);return true});
    placeFeature(state,4,a=>{const g=findGap(l,a,3,8);if(g){for(let i=0;i<g.len;i++)l.SetBlock(g.x+i,g.y-2,i===0?PLATFORM_LEFT:i===g.len-1?PLATFORM_RIGHT:PLATFORM_MID);return true}const p=flat(a,10);if(!p)return false;return putPlatform(l,p.x+1,p.y-4,8)});
    placeFeature(state,5,a=>{const g=findGap(l,a,4,9);if(g){for(let i=0;i<g.len;i+=2)l.SetBlock(g.x+i,g.y-3,PLATFORM_MID);return true}const p=flat(a,12);if(!p)return false;for(let i=1;i<10;i+=3)l.SetBlock(p.x+i,p.y-3,PLATFORM_MID);return true});
    placeFeature(state,6,a=>{const p=flat(a,10);return p&&placeTemplate(l,p.x+5,p.y-4,"moveH",{range:30,phase:0})});
    placeFeature(state,7,a=>{const p=flat(a,10);return p&&placeTemplate(l,p.x+5,p.y-4,"elevator",{range:38,phase:1.7})});
    placeFeature(state,8,a=>{const p=flat(a,10);return p&&placeTemplate(l,p.x+5,p.y-4,"fall")});
    placeFeature(state,9,a=>{const p=flat(a,10);return p&&placeTemplate(l,p.x+5,p.y-4,"osc")});
    placeFeature(state,10,a=>{const p=flat(a,10);if(!p)return false;placeTemplate(l,p.x+2,p.y-1,"spring");putPlatform(l,p.x+6,p.y-6,4);addDonut(l,p.x+7,p.y-7,`f10:${p.x}`);return true});
    placeFeature(state,11,a=>{const p=flat(a,8);if(!p)return false;state.__bgTestHidden.push({x:p.x+4,y:p.y-4,active:false});return true});
    placeFeature(state,12,a=>{const p=flat(a,8);if(!p)return false;l.SetBlock(p.x+4,p.y-4,bu);state.__bgTestMulti.push({x:p.x+4,y:p.y-4,left:5});return true});
    placeFeature(state,13,a=>{const p=flat(a,8);if(!p)return false;l.SetBlock(p.x+4,p.y-4,sp);state.__bgTestBlue.push({x:p.x+4,y:p.y-4,used:false});return true});
    placeFeature(state,14,a=>{const p=flat(a,8);if(!p)return false;l.SetBlock(p.x+4,p.y-4,br);state.__bgTestBrickRewards.push({x:p.x+4,y:p.y-4});return true});
    placeFeature(state,15,a=>{const p=flat(a,12);if(!p)return false;for(let i=0;i<9;i++){const yy=p.y-3-Math.round(Math.sin(i/8*Math.PI)*3);addDonut(l,p.x+1+i,yy,`arc:${p.x}:${i}`)}return true});
    const enemy=(n,kind)=>placeFeature(state,n,a=>{const p=flat(a,8);return p&&placeTemplate(l,p.x+4,p.y-1,kind)});
    enemy(16,"hamburger");enemy(17,"coxinha");enemy(18,"refri");enemy(19,"brigadeiro");enemy(20,"pudim");enemy(21,"pudim2");
    placeFeature(state,22,a=>{const p=flat(a,8);return p&&placeTemplate(l,p.x+4,p.y-1,"sausage")});
    enemy(23,"cupcake");enemy(24,"pizza");
    placeFeature(state,25,a=>{const p=flat(a,10);if(!p)return false;const a1=placeTemplate(l,p.x+2,p.y-1,"hamburger"),a2=placeTemplate(l,p.x+7,p.y-1,"coxinha");return a1||a2});
    placeFeature(state,26,a=>{const p=flat(a,14);if(!p)return false;for(const[k,kind]of [[2,"hamburger"],[5,"brigadeiro"],[8,"refri"],[11,"coxinha"]])placeTemplate(l,p.x+k,p.y-1,kind);for(let i=3;i<12;i+=2)addDonut(l,p.x+i,p.y-5,`arena:${p.x}:${i}`);return true});
    placeFeature(state,27,a=>{const p=flat(a,12);if(!p)return false;putPlatform(l,p.x+4,p.y-8,6);for(let i=0;i<6;i++)addDonut(l,p.x+4+i,p.y-9,`blue-secret:${p.x}:${i}`);return true});
    placeFeature(state,28,a=>{const p=flat(a,12);if(!p)return false;putPlatform(l,p.x+5,p.y-6,5);for(let i=0;i<4;i++)addDonut(l,p.x+5+i,p.y-7,`alcove:${p.x}:${i}`);return true});
    placeFeature(state,29,a=>{const p=flat(a,12);if(!p)return false;for(let i=3;i<9;i++)if(empty(l,p.x+i,p.y-4))l.SetBlock(p.x+i,p.y-4,br);putPlatform(l,p.x+3,p.y-7,6);return true});
    placeFeature(state,30,a=>{const p=flat(a,14);if(!p)return false;for(let i=0;i<13;i++){const yy=p.y-4-(i%4===1||i%4===2?2:0);addDonut(l,p.x+i,yy,`blue-run:${p.x}:${i}`)}return true});
    placeFeature(state,31,a=>{const p=flat(a,10);if(!p)return false;for(let i=0;i<5;i++)state.__bgTestSecretStairs.push({x:p.x+2+i,y:p.y-3-i,active:false,index:i});return true});
    placeFeature(state,32,a=>{const p=flat(a,8);if(!p)return false;return placeTemplate(l,p.x+4,p.y-1,"pipeMonster")});
    placeFeature(state,33,a=>{const p=flat(a,10);return p&&placeTemplate(l,p.x+6,p.y-1,"launcher")});
    placeFeature(state,34,a=>{const p=flat(a,10);return p&&placeTemplate(l,p.x+5,p.y-1,"bonusPipe")});
    placeFeature(state,35,a=>{const p=flat(a,14);if(!p)return false;const r1=placeTemplate(l,p.x+4,p.y-1,"rampUp"),r2=placeTemplate(l,p.x+9,p.y-3,"rampDown");return r1||r2});
    markFeature(state,36,true,"scroll vertical dentro da sala bônus #34");
    syncDonuts(state);audit(state).prepared=true;badge.textContent=`TESTE • ${audit(state).features.filter(f=>f.ok).length}/36 MECÂNICAS • 0–600 ORIGINAL`;
  }

  function updateHidden(state){const m=Mario.MarioCharacter,l=state.Level;if(!m||!l)return;const headY=m.Y-m.Height;for(const h of state.__bgTestHidden||[]){if(h.active)continue;if(m.Ya<0&&Math.abs(m.X-(h.x*16+8))<11&&headY<=h.y*16+16&&headY>=h.y*16-8){h.active=true;l.SetBlock(h.x,h.y,4);awardDonut(state,h.x*16+8,h.y*16)}}const stairs=state.__bgTestSecretStairs||[];for(const h of stairs){if(h.active)continue;if(h.index>0&&!stairs[h.index-1].active)continue;if(m.Ya<0&&Math.abs(m.X-(h.x*16+8))<11&&headY<=h.y*16+16&&headY>=h.y*16-8){h.active=true;l.SetBlock(h.x,h.y,4);awardDonut(state,h.x*16+8,h.y*16)}}}
  function spawnBlue(state,x,y){try{const C=window.__bgBlueMushroomClass;if(C){state.AddSprite(new C(state,x*16+8,y*16+8));return true}}catch(e){}return false}
  function installLevelHooks(){const p=Mario.LevelState.prototype;if(p.__bgAllTestHooks)return;p.__bgAllTestHooks=true;const enter=p.Enter,update=p.Update,bump=p.Bump,draw=p.Draw;
    p.Enter=function(){const r=enter.apply(this,arguments);window.__bgTestRun=true;try{prepare(this);syncDonuts(this)}catch(e){console.warn("all-test enter",e)}return r};
    p.Bump=function(x,y,canBreak){try{const multi=(this.__bgTestMulti||[]).find(b=>b.x===x&&b.y===y&&b.left>0);if(multi){this.BumpInto(x,y-1);this.Level.SetBlockData(x,y,4);awardDonut(this,x*16+8,y*16+8);multi.left--;if(multi.left<=0)this.Level.SetBlock(x,y,4);return}const blue=(this.__bgTestBlue||[]).find(b=>b.x===x&&b.y===y&&!b.used);if(blue){this.BumpInto(x,y-1);this.Level.SetBlock(x,y,4);this.Level.SetBlockData(x,y,4);blue.used=true;try{Enjine.Resources.PlaySound("sprout")}catch(e){}spawnBlue(this,x,y);return}}catch(e){}return bump.apply(this,arguments)};
    p.Update=function(delta){window.__bgTestRun=true;const r=update.apply(this,arguments);try{if(this.__bgInBonus){syncDonuts(this);const m=Mario.MarioCharacter;if(m&&m.X>62*16&&m.Y<9*16)exitBonus(this);return r}prepare(this);syncDonuts(this);updateHidden(this)}catch(e){console.warn("all-test update",e)}return r};
    p.Draw=function(ctx){const r=draw.apply(this,arguments);try{if(this.__bgInBonus&&ctx){ctx.save();ctx.font="bold 7px sans-serif";ctx.fillStyle="#fff";ctx.fillText("SALA BÔNUS • SUBA ATÉ O TOPO",62,14);ctx.restore()}}catch(e){}return r};
  }

  function install(){if(!(window.Mario&&Mario.LevelState&&Mario.SpriteTemplate&&window.__bgCollectibles&&window.__bgBluePowerV5))return false;installSpawn();installLevelHooks();return true}
  if(!install()){const t=setInterval(()=>{if(install())clearInterval(t)},50);setTimeout(()=>clearInterval(t),12000)}

  window.__bgAllMechanicsTest={active:true,startMeter:TEST_START,endDenseMeter:TEST_END,names:FEATURE_NAMES,get audit(){return window.__bgAllTestAudit||null}};
})();
