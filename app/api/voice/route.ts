import {body,guard,reply,secret,verifyTicket,errorResponse} from "@/lib/server";
const voices={quill:"JBFqnCBsd6RMkjVDRZzb",ember:"N2lVS1w4EtoT3dr4eOWO",willow:"pFZP5JQG7iQjIQuC4Bku"};
export async function POST(request:Request){const blocked=guard(request,"voice",24);if(blocked)return blocked;
if(!secret("ELEVENLABS_API_KEY"))return reply({error:"Narration is not connected yet. You can still read every page."},503);
try{const data=await body(request);if(typeof data.ticket!=="string")return reply({error:"A valid story is needed for narration."},400);const v=await verifyTicket(data.ticket);
const voice=secret("ELEVENLABS_VOICE_"+v.id.toUpperCase())||voices[v.id];
const response=await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+voice+"?output_format=mp3_44100_128",{method:"POST",headers:{"xi-api-key":secret("ELEVENLABS_API_KEY"),"Content-Type":"application/json"},body:JSON.stringify({text:v.text,model_id:"eleven_multilingual_v2",voice_settings:{stability:v.id==="ember"?.42:.65,similarity_boost:.75,style:.18,use_speaker_boost:true,speed:v.id==="ember"?1.04:.93}}),signal:AbortSignal.timeout(60000)});
if(!response.ok)return reply({error:"The voice is resting. You can continue reading or try listening again."},502);
return new Response(response.body,{headers:{"Content-Type":"audio/mpeg","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}catch(error){return errorResponse(error);}}

