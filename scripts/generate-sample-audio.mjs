import fs from "node:fs/promises";
import ts from "typescript";
const source=await fs.readFile("lib/story.ts","utf8");
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {sampleCouncil}=await import("data:text/javascript;base64,"+Buffer.from(js).toString("base64"));
const voices={quill:"JBFqnCBsd6RMkjVDRZzb",ember:"N2lVS1w4EtoT3dr4eOWO",willow:"pFZP5JQG7iQjIQuC4Bku"};
await fs.mkdir("public/audio",{recursive:true});
for(const [id,voice] of Object.entries(voices)){
const path="public/audio/sample-"+id+".mp3";
try{await fs.access(path);console.log(id+": existing audio retained");continue;}catch{}
const r=await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+voice+"?output_format=mp3_44100_128",{method:"POST",headers:{"xi-api-key":process.env.ELEVENLABS_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({text:sampleCouncil[id].advice,model_id:"eleven_multilingual_v2",voice_settings:{stability:id==="ember"?.42:.65,similarity_boost:.75,style:.18,use_speaker_boost:true,speed:id==="ember"?1.04:.93}}),signal:AbortSignal.timeout(60000)});
if(!r.ok){const error=await r.json();console.log(JSON.stringify({character:id,status:r.status,error:error.detail?.status}));process.exitCode=1;continue;}
await fs.writeFile(path,Buffer.from(await r.arrayBuffer()));console.log(id+": narration saved");
}
