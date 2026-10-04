// Small synthesized sound effects (no audio files). Created lazily on a user gesture.
type Ctor=typeof AudioContext;
let ctx:AudioContext|null=null;
function ac(){
  if(typeof window==="undefined")return null;
  if(!ctx){const C:Ctor|undefined=window.AudioContext||(window as unknown as {webkitAudioContext?:Ctor}).webkitAudioContext;if(!C)return null;ctx=new C();}
  if(ctx.state==="suspended")void ctx.resume();
  return ctx;
}
function noise(c:AudioContext,seconds:number){
  const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*seconds),c.sampleRate),data=buffer.getChannelData(0);
  let last=0;for(let i=0;i<data.length;i++){const white=Math.random()*2-1;last=(last+0.06*white)/1.06;data[i]=last*6;}
  const src=c.createBufferSource();src.buffer=buffer;return src;
}
function whoosh(c:AudioContext,t:number,from:number,peak:number,to:number,length:number,volume:number){
  const src=noise(c,length+0.1),filter=c.createBiquadFilter(),gain=c.createGain();
  filter.type="bandpass";filter.Q.value=0.9;
  filter.frequency.setValueAtTime(from,t);filter.frequency.exponentialRampToValueAtTime(peak,t+length*0.5);filter.frequency.exponentialRampToValueAtTime(to,t+length);
  gain.gain.setValueAtTime(0.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+length*0.3);gain.gain.exponentialRampToValueAtTime(0.0001,t+length);
  src.connect(filter).connect(gain).connect(c.destination);src.start(t);src.stop(t+length+0.1);
}
function thump(c:AudioContext,t:number,volume:number){
  const osc=c.createOscillator(),gain=c.createGain();
  osc.type="sine";osc.frequency.setValueAtTime(120,t);osc.frequency.exponentialRampToValueAtTime(55,t+0.14);
  gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(0.0001,t+0.18);
  osc.connect(gain).connect(c.destination);osc.start(t);osc.stop(t+0.2);
  const tick=noise(c,0.06),hp=c.createBiquadFilter(),tg=c.createGain();
  hp.type="highpass";hp.frequency.value=2500;tg.gain.setValueAtTime(volume*0.5,t);tg.gain.exponentialRampToValueAtTime(0.0001,t+0.05);
  tick.connect(hp).connect(tg).connect(c.destination);tick.start(t);tick.stop(t+0.06);
}
/** A paper leaf turning; the sweep rises going forward and falls going back. */
export function turn(direction:"forward"|"back",landMs:number){
  const c=ac();if(!c)return;const t=c.currentTime+0.02,land=Math.max(0.4,landMs/1000-0.12);
  if(direction==="forward")whoosh(c,t,500,2600,1400,land,0.2);else whoosh(c,t,2400,1500,450,land,0.2);
  thump(c,t+land,0.1);
}
/** The cover swinging open. */
export function open(){
  const c=ac();if(!c)return;const t=c.currentTime+0.02;
  whoosh(c,t,260,1100,500,0.75,0.22);thump(c,t+0.72,0.18);
}
/** A soft two-note chime. */
export function chime(){
  const c=ac();if(!c)return;const t=c.currentTime+0.02;
  [660,990].forEach((freq,i)=>{
    const osc=c.createOscillator(),gain=c.createGain(),start=t+i*0.09;
    osc.type="sine";osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.0001,start);gain.gain.exponentialRampToValueAtTime(0.09,start+0.02);gain.gain.exponentialRampToValueAtTime(0.0001,start+0.7);
    osc.connect(gain).connect(c.destination);osc.start(start);osc.stop(start+0.75);
  });
}
