import {z} from "zod";
import {body,guard,reply,secret,inputSchema,councilJson,councilSchema,ticket,errorResponse} from "@/lib/server";
import {characters} from "@/lib/story";
import {DEFAULT_MODEL,extractGemini,councilInstructions,type GeminiResponse} from "@/lib/gemini";
const resultSchema=z.object({safety:z.enum(["none","crisis","harm"]),council:councilSchema.nullable()}).strict();
export async function POST(request:Request){
  const blocked=guard(request,"council");if(blocked)return blocked;
  let input;try{input=inputSchema.parse(await body(request));}catch{return reply({error:"Write a question of at least 8 characters and two different options (2–180 characters each)."},400);}
  const text=[input.question,input.optionA,input.optionB].join("\n");
  if(/\b(suicid\w*|self[ -]?harm|kill myself|end my life|hurt myself|want to die|overdos\w*)\b/i.test(text))return reply({safety:true});
  if(!secret("GEMINI_API_KEY"))return reply({error:"The grove is not connected to Gemini yet. You can read the sample story.",code:"not_configured"},503);
  try {
    const model=secret("GEMINI_MODEL")||DEFAULT_MODEL;
    if(!/^[a-zA-Z0-9._-]+$/.test(model))throw new Error("GEMINI_CONFIG");
    const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent",{
      method:"POST",headers:{"x-goog-api-key":secret("GEMINI_API_KEY"),"Content-Type":"application/json"},
      signal:AbortSignal.timeout(65000),
      body:JSON.stringify({
        systemInstruction:{parts:[{text:councilInstructions}]},
        contents:[{role:"user",parts:[{text:JSON.stringify(input)}]}],
        generationConfig:{maxOutputTokens:4096,responseFormat:{text:{mimeType:"APPLICATION_JSON",schema:{
          type:"object",properties:{safety:{type:"string",enum:["none","crisis","harm"]},council:{anyOf:[councilJson,{type:"null"}]}},required:["safety","council"],additionalProperties:false
        }}}}
      })
    });
    if(!response.ok)throw new Error("GEMINI_"+response.status);
    const extracted=extractGemini(await response.json() as GeminiResponse);
    if(extracted.blocked)return reply({safety:true,general:true});
    const result=resultSchema.parse(extracted.value);
    if(result.safety!=="none")return reply({safety:true,general:result.safety==="harm"});
    if(!result.council)throw new Error("GEMINI_EMPTY_COUNCIL");
    const council=result.council;
    const tickets=Object.fromEntries(await Promise.all(characters.map(async id=>[id,await ticket(id,council[id].advice)])));
    return reply({council,tickets});
  }catch(error){return errorResponse(error);}
}
