(()=>{
  "use strict";
  if(new URLSearchParams(location.search).get("test")!=="all")return;
  if(window.__BG_LEVEL_SAFETY_AUDIT_V1__)return;
  window.__BG_LEVEL_SAFETY_AUDIT_V1__=true;
  const START=200,FINISH=6344;
  const FOOD=new Set(["hamburger","coxinha","refri","brigadeiro","pudim","pudim2","sausage","pipeMonster","cupcake","pizza"]);
  function snap(l){return l&&l.__bgBaseSnapshotV5||null}
  function baseTile(s,x,y){return s&&x>=0&&x<s.width&&y>=0&&y<s.height?s.blocks[x*s.height+y]:0}
  function baseGround(s,x){return s&&x>=0&&x<s.width?Number(s.ground[x]):-1}
  function nearGround(s,x){let g=baseGround(s,x);if(g>0)return g;for(let d=1;d<=8;d++){const a=baseGround(s,x-d),b=baseGround(s,x+d);if(a>0&&b>0)return Math.round((a+b)/2);if(a>0)return a;if(b>0)return b}return -1}
  function restore(l,s,x,y){const b=baseTile(s,x,y);if((l.GetBlock(x,y)&255)!==b){l.SetBlock(x,y,b);return 1}return 0}
  function scan(state){
    const l=state&&state.Level,s=snap(l);if(!l||!s||s.width!==l.Width||s.height!==l.Height)return false;
    const end=Math.min(FINISH,l.Width-35);let repaired=0,templates=0,checked=0;const risky=[];
    for(let x=START;x<end;x++){
      const g=nearGround(s,x);if(g<4)continue;checked++;
      // Preserve the exact original main route: two full empty headroom tiles above its original surface.
      for(let y=Math.max(1,g-2);y<=Math.min(l.Height-1,g-1);y++){
        if(baseTile(s,x,y)===0)repaired+=restore(l,s,x,y);
        try{const t=l.GetSpriteTemplate(x,y);if(t&&(t.__bgV5Kind||t.__bgTestVariant)){l.SetSpriteTemplate(x,y,null);templates++}}catch(e){}
      }
      // Never allow experimental food-enemy leftovers anywhere in the map.
      for(let y=0;y<l.Height;y++)try{const t=l.GetSpriteTemplate(x,y);if(t&&FOOD.has(t.__bgTestVariant)){l.SetSpriteTemplate(x,y,null);templates++}}catch(e){}
      let blocked=0;
      for(let y=Math.max(1,g-2);y<=g-1;y++)try{if(l.IsBlocking(x,y,0,1))blocked++}catch(e){}
      if(blocked)risky.push(x);
    }
    // Compact consecutive risky columns for audit. They should normally be empty after repair.
    const spans=[];let a=null,p=null;for(const x of risky){if(a===null){a=p=x}else if(x===p+1)p=x;else{spans.push([a,p]);a=p=x}}if(a!==null)spans.push([a,p]);
    const audit={from:START,to:end,columnsChecked:checked,repairedBlocks:repaired,removedTemplates:templates,riskySpans:spans,ok:spans.length===0,width:l.Width,at:Date.now()};
    l.__bgSafetyAuditV1=audit;window.__bgFullMapSafetyAudit=audit;
    const badge=document.getElementById("bgAllTestBadge");if(badge)badge.textContent=`TESTE SEGURO • MAPA AUDITADO ${START}–${end} m • ERROS ${spans.length}`;
    return audit.ok;
  }
  function install(){if(!(window.Mario&&Mario.LevelState&&Mario.LevelState.prototype))return false;const p=Mario.LevelState.prototype;if(p.__bgSafetyAuditV1)return true;const enter=p.Enter,update=p.Update;p.__bgSafetyAuditV1=true;
    p.Enter=function(){const r=enter.apply(this,arguments);setTimeout(()=>{try{scan(this)}catch(e){}},20);return r};
    p.Update=function(){const before=this.Level,r=update.apply(this,arguments);try{const l=this.Level,a=l&&l.__bgSafetyAuditV1;if(l&&(l!==before||!a||a.width!==l.Width))setTimeout(()=>scan(this),20)}catch(e){}return r};return true}
  if(!install()){const t=setInterval(()=>{if(install())clearInterval(t)},40);setTimeout(()=>clearInterval(t),15000)}
  window.__bgRunFullMapSafetyAudit=()=>{try{return scan(window.__jo2app&&window.__jo2app.stateContext&&window.__jo2app.stateContext.State)}catch(e){return false}};
})();
