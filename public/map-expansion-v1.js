(()=>{
  "use strict";
  if(window.__BG_MAP_EXPANSION_V1__)return;
  window.__BG_MAP_EXPANSION_V1__=true;

  const VERSION=1;
  const MODULE_STEP=140;
  const SAFE_START=70;
  const SAFE_END=110;
  const PLATFORM_LEFT=132, PLATFORM_MID=133, PLATFORM_RIGHT=134;

  function hash(n,salt=0){
    n=(n|0)^(salt|0)^0x6d2b79f5;
    n=Math.imul(n^(n>>>15),n|1);
    n^=n+Math.imul(n^(n>>>7),n|61);
    return (n^(n>>>14))>>>0;
  }
  function inBounds(level,x,y){return x>=0&&y>=0&&x<(level.Width|0)&&y<(level.Height|0)}
  function tile(level,x,y){return inBounds(level,x,y)?(level.GetBlock(x,y)&255):255}
  function empty(level,x,y){return inBounds(level,x,y)&&tile(level,x,y)===0}
  function blocking(level,x,y){try{return !!level.IsBlocking(x,y,0,1)}catch(e){return false}}
  function templateEmpty(level,x,y){try{return inBounds(level,x,y)&&level.GetSpriteTemplate(x,y)===null}catch(e){return false}}

  function surfaceY(level,x){
    const h=level.Height|0;
    for(let y=2;y<h;y++){
      if(blocking(level,x,y)&&!blocking(level,x,y-1)&&!blocking(level,x,y-2))return y;
    }
    return -1;
  }

  function flatSurface(level,start,len){
    const y=surfaceY(level,start);
    if(y<4)return -1;
    for(let x=start;x<start+len;x++){
      if(surfaceY(level,x)!==y)return -1;
      if(!empty(level,x,y-1)||!empty(level,x,y-2))return -1;
    }
    return y;
  }

  function verticalClear(level,start,len,topY,bottomY){
    for(let x=start;x<start+len;x++)for(let y=topY;y<bottomY;y++)if(!empty(level,x,y))return false;
    return true;
  }

  function findFlat(level,anchor,len,fromX,toX){
    const maxR=72;
    for(let r=0;r<=maxR;r++){
      const tests=r===0?[anchor]:[anchor+r,anchor-r];
      for(const x0 of tests){
        const x=x0|0;
        if(x<Math.max(SAFE_START,fromX+3)||x+len>=Math.min(toX-3,(level.Width|0)-SAFE_END))continue;
        const y=flatSurface(level,x,len);
        if(y>0)return {x,y};
      }
    }
    return null;
  }

  function canPlatform(level,x,y,len,clearBelow=false,bottomY=0){
    if(y<2||y>=level.Height-2||x<2||x+len>=level.Width-2)return false;
    for(let i=0;i<len;i++){
      if(!empty(level,x+i,y)||!templateEmpty(level,x+i,y)||!templateEmpty(level,x+i,y-1))return false;
    }
    if(clearBelow&&!verticalClear(level,x,len,y,bottomY))return false;
    return true;
  }

  function putPlatform(level,x,y,len){
    if(!canPlatform(level,x,y,len))return false;
    for(let i=0;i<len;i++)level.SetBlock(x+i,y,i===0?PLATFORM_LEFT:(i===len-1?PLATFORM_RIGHT:PLATFORM_MID));
    return true;
  }

  function makeTemplate(kind,extra){
    const t=new Mario.SpriteTemplate(Mario.Enemy.Goomba,false);
    t.__bgVariant=kind;
    if(extra)Object.assign(t,extra);
    return t;
  }

  function placeTemplate(level,x,y,kind,extra,allowOccupied=false){
    if(!templateEmpty(level,x,y)||(!allowOccupied&&!empty(level,x,y)))return false;
    level.SetSpriteTemplate(x,y,makeTemplate(kind,extra));
    return true;
  }

  function secret(level,x,y,key){
    if(!level.__bgSecretDonuts)level.__bgSecretDonuts=[];
    if(level.__bgSecretDonuts.some(d=>d.key===key))return;
    level.__bgSecretDonuts.push({key,x:x*16+8,y:y*16+8,phase:hash(x*31+y,17)%31});
  }

  function auditFor(state){
    if(!state.__bgMapAudit)state.__bgMapAudit={version:VERSION,ranges:[],upperRoutes:0,enemyZones:0,coxinhas:0,refris:0,sausages:0,springs:0,movers:0,blueSecrets:0,secretDonuts:0,tilesAdded:0,templatesAdded:0};
    window.__bgMapExpansionAudit=state.__bgMapAudit;
    return state.__bgMapAudit;
  }

  function addUpperRoute(state,level,anchor,fromX,toX){
    const p=findFlat(level,anchor,16,fromX,toX);if(!p)return false;
    const {x,y}=p,aY=y-3,bY=y-4,cY=y-3;
    if(!canPlatform(level,x+1,aY,4)||!canPlatform(level,x+6,bY,5)||!canPlatform(level,x+12,cY,3))return false;
    if(!verticalClear(level,x+1,4,aY,y)||!verticalClear(level,x+6,5,bY,y)||!verticalClear(level,x+12,3,cY,y))return false;
    putPlatform(level,x+1,aY,4);putPlatform(level,x+6,bY,5);putPlatform(level,x+12,cY,3);
    secret(level,x+2,aY-1,`upper:${x}:a`);secret(level,x+8,bY-1,`upper:${x}:b`);secret(level,x+13,cY-1,`upper:${x}:c`);
    const a=auditFor(state);a.upperRoutes++;a.tilesAdded+=12;a.secretDonuts+=3;
    return true;
  }

  function addEnemyZone(state,level,anchor,fromX,toX){
    const p=findFlat(level,anchor,10,fromX,toX);if(!p)return false;
    const {x,y}=p;let n=0;
    if(placeTemplate(level,x+2,y-1,"coxinha")){auditFor(state).coxinhas++;n++}
    if(placeTemplate(level,x+7,y-1,"refri")){auditFor(state).refris++;n++}
    if(!n)return false;
    const a=auditFor(state);a.enemyZones++;a.templatesAdded+=n;
    return true;
  }

  function addSpringZone(state,level,anchor,fromX,toX){
    const p=findFlat(level,anchor,12,fromX,toX);if(!p)return false;
    const {x,y}=p;
    if(!placeTemplate(level,x+3,y-1,"spring"))return false;
    const ledgeY=y-5;
    if(canPlatform(level,x+7,ledgeY,4)&&verticalClear(level,x+7,4,ledgeY,y)){
      putPlatform(level,x+7,ledgeY,4);
      secret(level,x+8,ledgeY-1,`spring:${x}:1`);secret(level,x+9,ledgeY-1,`spring:${x}:2`);
      const a=auditFor(state);a.tilesAdded+=4;a.secretDonuts+=2;
    }
    const a=auditFor(state);a.springs++;a.templatesAdded++;
    return true;
  }

  function addMovingZone(state,level,anchor,fromX,toX){
    const p=findFlat(level,anchor,12,fromX,toX);if(!p)return false;
    const {x,y}=p,py=y-4;
    if(!verticalClear(level,x+2,8,py,y))return false;
    if(!placeTemplate(level,x+6,py,"moving",{__bgRange:28+(hash(x,44)%15),__bgPhase:(hash(x,45)%628)/100}))return false;
    const a=auditFor(state);a.movers++;a.templatesAdded++;
    return true;
  }

  function addBlueSecret(state,level,anchor,fromX,toX){
    const p=findFlat(level,anchor,12,fromX,toX);if(!p)return false;
    const {x,y}=p,py=y-7;
    if(py<2||!canPlatform(level,x+4,py,5)||!verticalClear(level,x+3,7,py,y))return false;
    putPlatform(level,x+4,py,5);
    secret(level,x+5,py-1,`blue:${x}:1`);secret(level,x+7,py-1,`blue:${x}:2`);secret(level,x+8,py-1,`blue:${x}:3`);
    const a=auditFor(state);a.blueSecrets++;a.tilesAdded+=5;a.secretDonuts+=3;
    return true;
  }

  function addPipeSausages(state,level,fromX,toX){
    let seen=0,last=-9999;
    for(let x=Math.max(fromX,SAFE_START);x<Math.min(toX-1,level.Width-SAFE_END);x++){
      for(let y=2;y<level.Height-2;y++){
        if(tile(level,x,y)===10&&tile(level,x+1,y)===11){
          seen++;
          if(seen%3===1&&x-last>260&&templateEmpty(level,x,y)){
            if(placeTemplate(level,x,y,"sausage",null,true)){
              last=x;const a=auditFor(state);a.sausages++;a.templatesAdded++;
            }
          }
          break;
        }
      }
    }
  }

  function enhanceRange(state,fromX,toX){
    const level=state&&state.Level;if(!level||!window.Mario)return false;
    fromX=Math.max(0,fromX|0);toX=Math.min(level.Width|0,toX|0);
    if(toX-fromX<120)return false;
    const a=auditFor(state);a.ranges.push([fromX,toX]);
    const first=Math.max(SAFE_START,Math.ceil((fromX+60)/MODULE_STEP)*MODULE_STEP);
    for(let anchor=first;anchor<toX-SAFE_END;anchor+=MODULE_STEP){
      const index=Math.floor(anchor/MODULE_STEP),kind=(index+4)%5;
      if(kind===0)addUpperRoute(state,level,anchor,fromX,toX);
      else if(kind===1)addEnemyZone(state,level,anchor,fromX,toX);
      else if(kind===2)addSpringZone(state,level,anchor,fromX,toX);
      else if(kind===3)addMovingZone(state,level,anchor,fromX,toX);
      else addBlueSecret(state,level,anchor,fromX,toX);
    }
    addPipeSausages(state,level,fromX,toX);
    level.__bgMapExpansionV1=true;
    syncSecretDonuts(state);
    return true;
  }

  function syncSecretDonuts(state){
    try{
      const level=state&&state.Level,data=state&&state.__bgCollectibleData;
      if(!level||!data||!Array.isArray(data.items)||!Array.isArray(level.__bgSecretDonuts))return;
      const have=new Set(data.items.map(i=>i&&i.__bgMapSecretKey).filter(Boolean));
      for(const d of level.__bgSecretDonuts){
        if(have.has(d.key))continue;
        data.items.push({x:d.x,y:d.y,taken:false,phase:d.phase,__bgMapSecretKey:d.key});have.add(d.key);
      }
    }catch(e){}
  }

  function foodDraw(ctx,s,kind){
    if(!ctx||s.Visible===false)return;
    const x=Math.round(Number(s.X)||0),y=Math.round(Number(s.Y)||0);
    ctx.save();ctx.translate(x,y);
    if(kind==="coxinha"){
      ctx.fillStyle="#4b2a13";ctx.fillRect(-5,-2,10,2);
      ctx.fillStyle="#d28b2e";ctx.fillRect(-6,-8,12,6);ctx.fillRect(-4,-12,8,4);ctx.fillRect(-2,-15,4,3);
      ctx.fillStyle="#f0b94b";ctx.fillRect(-4,-10,8,3);ctx.fillRect(-5,-7,3,3);
      ctx.fillStyle="#21140d";ctx.fillRect(-3,-7,1,1);ctx.fillRect(2,-7,1,1);ctx.fillRect(-1,-4,3,1);
    }else if(kind==="refri"){
      ctx.fillStyle="#1d2b49";ctx.fillRect(-5,-14,10,13);
      ctx.fillStyle="#e63e36";ctx.fillRect(-4,-13,8,3);ctx.fillRect(-4,-4,8,3);
      ctx.fillStyle="#59b8ff";ctx.fillRect(-4,-10,8,6);ctx.fillStyle="#fff";ctx.fillRect(-2,-9,4,1);
      ctx.fillStyle="#111827";ctx.fillRect(-3,-7,1,1);ctx.fillRect(2,-7,1,1);ctx.fillRect(-1,-5,3,1);
      ctx.fillStyle="#d8dce7";ctx.fillRect(-3,-15,6,1);
    }else if(kind==="sausage"){
      ctx.fillStyle="#5b2517";ctx.fillRect(-5,-3,10,3);
      ctx.fillStyle="#d55b3e";ctx.fillRect(-5,-15,10,12);ctx.fillRect(-4,-17,8,2);
      ctx.fillStyle="#f29a69";ctx.fillRect(-3,-14,6,2);ctx.fillRect(-4,-9,8,3);
      ctx.fillStyle="#1b1010";ctx.fillRect(-3,-11,1,1);ctx.fillRect(2,-11,1,1);ctx.fillRect(-1,-7,3,1);
      ctx.fillStyle="#f4c84a";ctx.fillRect(-5,-5,10,1);
    }
    ctx.restore();
  }

  function FoodEnemy(world,x,y,facing,kind){
    Mario.Enemy.call(this,world,x,y,facing,Mario.Enemy.Goomba,false);
    this.__bgFoodKind=kind;this.__bgJumpCooldown=30+(hash(x|0,73)%40);
    if(kind==="coxinha")this.AvoidCliffs=true;
  }
  FoodEnemy.prototype=Object.create(Mario.Enemy.prototype);
  FoodEnemy.prototype.constructor=FoodEnemy;
  FoodEnemy.prototype.Draw=function(ctx){foodDraw(ctx,this,this.__bgFoodKind)};
  FoodEnemy.prototype.Move=function(){
    if(this.__bgFoodKind==="refri"&&this.DeadTime===0){
      this.__bgJumpCooldown--;
      if(this.OnGround&&this.__bgJumpCooldown<=0){this.Ya=-9.5;this.OnGround=false;this.__bgJumpCooldown=55+(hash((this.X|0)+(this.Y|0),81)%25)}
    }
    return Mario.Enemy.prototype.Move.call(this);
  };

  function SausageEnemy(world,x,y){Mario.FlowerEnemy.call(this,world,x,y);this.__bgFoodKind="sausage"}
  SausageEnemy.prototype=Object.create(Mario.FlowerEnemy.prototype);
  SausageEnemy.prototype.constructor=SausageEnemy;
  SausageEnemy.prototype.Draw=function(ctx){foodDraw(ctx,this,"sausage")};

  function Springboard(world,x,y){
    Mario.NotchSprite.call(this);this.World=world;this.X=x;this.Y=y;this.XOld=x;this.YOld=y;this.Layer=1;this.__bgCooldown=0;
  }
  Springboard.prototype=Object.create(Mario.NotchSprite.prototype);
  Springboard.prototype.constructor=Springboard;
  Springboard.prototype.Move=function(){
    if(this.__bgCooldown>0)this.__bgCooldown--;
    const m=Mario.MarioCharacter;if(!m||m.DeathTime>0||m.WinTime>0)return;
    const top=this.Y-5;
    if(this.__bgCooldown<=0&&Number(m.Ya)>=0&&Math.abs(m.X-this.X)<=10&&m.Y>=top-3&&m.Y<=top+7&&m.YOld<=top+4){
      m.Y=top;m.Ya=-18.5;m.OnGround=false;m.MayJump=false;m.JumpTime=0;this.__bgCooldown=12;
      try{Enjine.Resources.PlaySound("jump")}catch(e){}
      try{for(let i=0;i<5;i++)this.World.AddSprite(new Mario.Sparkle(this.World,this.X-7+i*3,top-5,(i-2)*.25,-1.4,0,1,5))}catch(e){}
    }
  };
  Springboard.prototype.Draw=function(ctx){
    const x=Math.round(this.X),y=Math.round(this.Y);
    ctx.save();ctx.translate(x,y);ctx.fillStyle="#1e293b";ctx.fillRect(-8,-3,16,3);ctx.fillStyle="#f59e0b";ctx.fillRect(-7,-6,14,3);ctx.fillStyle="#fde047";ctx.fillRect(-5,-8,10,2);ctx.fillStyle="#94a3b8";ctx.fillRect(-4,0,8,2);ctx.restore();
  };

  function MovingPlatform(world,x,y,range,phase){
    Mario.NotchSprite.call(this);this.World=world;this.X=this.BaseX=x;this.Y=y;this.XOld=x;this.YOld=y;this.Layer=1;this.__bgRange=Math.max(24,Number(range)||32);this.__bgPhase=Number(phase)||0;this.__bgSpeed=.045;this.__bgWidth=46;
  }
  MovingPlatform.prototype=Object.create(Mario.NotchSprite.prototype);
  MovingPlatform.prototype.constructor=MovingPlatform;
  MovingPlatform.prototype.Move=function(){
    const oldX=this.X;this.__bgPhase+=this.__bgSpeed;this.X=this.BaseX+Math.sin(this.__bgPhase)*this.__bgRange;
    const dx=this.X-oldX,m=Mario.MarioCharacter;if(!m||m.DeathTime>0||m.WinTime>0)return;
    const top=this.Y-5,half=this.__bgWidth/2;
    if(Number(m.Ya)>=0&&m.X>=this.X-half-3&&m.X<=this.X+half+3&&m.Y>=top-4&&m.Y<=top+8&&m.YOld<=top+4){
      m.Y=top;m.Ya=0;m.OnGround=true;m.MayJump=true;
      if(Math.abs(dx)<3)m.X+=dx;
    }
  };
  MovingPlatform.prototype.Draw=function(ctx){
    const x=Math.round(this.X),y=Math.round(this.Y),w=this.__bgWidth|0;
    ctx.save();ctx.translate(x,y);ctx.fillStyle="#49311d";ctx.fillRect(-(w>>1),-5,w,6);ctx.fillStyle="#f59e0b";ctx.fillRect(-(w>>1)+2,-7,w-4,3);ctx.fillStyle="#fde68a";ctx.fillRect(-8,-6,5,1);ctx.fillRect(3,-6,5,1);ctx.fillStyle="#7c2d12";ctx.fillRect(-2,-4,4,2);ctx.restore();
  };

  function installTemplateSpawn(){
    if(!(window.Mario&&Mario.SpriteTemplate&&Mario.SpriteTemplate.prototype))return false;
    const p=Mario.SpriteTemplate.prototype;if(p.__bgMapSpawnV1)return true;
    const original=p.Spawn;p.__bgMapSpawnV1=true;
    p.Spawn=function(world,b,c,facing){
      const kind=this.__bgVariant;
      if(!kind)return original.apply(this,arguments);
      if(this.IsDead)return;
      let s=null;
      if(kind==="coxinha"||kind==="refri")s=new FoodEnemy(world,b*16+8,c*16+15,facing,kind);
      else if(kind==="sausage")s=new SausageEnemy(world,b*16+15,c*16+24);
      else if(kind==="spring")s=new Springboard(world,b*16+8,(c+1)*16-1);
      else if(kind==="moving")s=new MovingPlatform(world,b*16+8,(c+1)*16-1,this.__bgRange,this.__bgPhase);
      if(!s)return original.apply(this,arguments);
      this.Sprite=s;s.SpriteTemplate=this;world.AddSprite(s);
    };
    return true;
  }

  function installLevelHooks(){
    if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;
    const p=Mario.LevelState.prototype;if(p.__bgMapExpansionV1)return true;
    const originalEnter=p.Enter,originalUpdate=p.Update;p.__bgMapExpansionV1=true;
    p.Enter=function(){
      const r=originalEnter.apply(this,arguments);
      try{this.__bgMapEnhancedWidth=0;enhanceRange(this,0,this.Level.Width|0);this.__bgMapEnhancedWidth=this.Level.Width|0;syncSecretDonuts(this)}catch(e){console.warn("BG map enter",e)}
      return r;
    };
    p.Update=function(delta){
      let beforeLevel=this.Level,beforeWidth=beforeLevel?(beforeLevel.Width|0):0;
      try{
        if(beforeLevel&&this.__bgMapEnhancedWidth==null){
          const late=(this.Tick|0)>5&&Mario.MarioCharacter?Math.max(0,(Mario.MarioCharacter.X/16|0)+24):0;
          enhanceRange(this,late,beforeWidth);this.__bgMapEnhancedWidth=beforeWidth;
        }
      }catch(e){}
      const r=originalUpdate.apply(this,arguments);
      try{
        const now=this.Level,nowWidth=now?(now.Width|0):0;
        const done=Math.max(0,this.__bgMapEnhancedWidth|0);
        if(now&&nowWidth>done){
          const from=now!==beforeLevel?Math.max(beforeWidth,done):done;
          enhanceRange(this,from,nowWidth);this.__bgMapEnhancedWidth=nowWidth;
        }
        syncSecretDonuts(this);
      }catch(e){console.warn("BG map update",e)}
      return r;
    };
    return true;
  }

  function install(){return installTemplateSpawn()&&installLevelHooks()}
  if(!install()){
    const t=setInterval(()=>{if(install())clearInterval(t)},50);setTimeout(()=>clearInterval(t),10000);
  }

  window.__bgMapExpansion={version:VERSION,enhanceRange,get audit(){return window.__bgMapExpansionAudit||null}};
})();
