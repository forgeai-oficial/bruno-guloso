(()=>{
  "use strict";
  if(window.__BG_AUDIO_CLEANUP__) return;
  window.__BG_AUDIO_CLEANUP__=true;

  try{
    const AudioNodeCtor=window.AudioNode;
    const Osc=window.OscillatorNode;
    const Buf=window.AudioBufferSourceNode;
    if(!AudioNodeCtor||!Osc||!Buf) return;

    const edges=new WeakMap();
    const originalConnect=AudioNodeCtor.prototype.connect;

    AudioNodeCtor.prototype.connect=function(destination){
      try{
        if(destination instanceof AudioNodeCtor){
          let list=edges.get(this);
          if(!list){list=[];edges.set(this,list)}
          list.push(destination);
        }
      }catch(e){}
      return originalConnect.apply(this,arguments);
    };

    function cleanup(node,depth){
      if(!node||depth<0)return;
      let next=[];
      try{next=edges.get(node)||[]}catch(e){}
      try{node.disconnect()}catch(e){}
      try{edges.delete(node)}catch(e){}
      if(depth>0){
        next.forEach(n=>cleanup(n,depth-1));
      }
    }

    function wrapStart(proto,depth){
      const originalStart=proto.start;
      if(originalStart.__bgCleanupWrapped)return;
      const wrapped=function(){
        try{
          if(!this.__bgCleanupArmed){
            this.__bgCleanupArmed=true;
            this.addEventListener("ended",()=>cleanup(this,depth),{once:true});
          }
        }catch(e){}
        return originalStart.apply(this,arguments);
      };
      wrapped.__bgCleanupWrapped=true;
      proto.start=wrapped;
    }

    // Oscillator: source -> private gain -> permanent bus.
    wrapStart(Osc.prototype,1);
    // Noise: buffer source -> private filter -> private gain -> permanent bus.
    wrapStart(Buf.prototype,2);
  }catch(e){}
})();
