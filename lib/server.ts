import {env} from "cloudflare:workers";
import {z} from "zod";
import type {Character} from "./story";
export const inputSchema=z.object({question:z.string().trim().min(8).max(1800),optionA:z.string().trim().min(2).max(180),optionB:z.string().trim().min(2).max(180)}).strict().refine(v=>v.optionA.toLowerCase()!==v.optionB.toLowerCase(),{message:"Please give the grove two different options."});
export function secret(name:string){return String((env as unknown as Record<string,unknown>)[name]||process.env[name]||"").trim();}
export function reply(body:unknown,status=200){return Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
const limits=new Map<string,{count:number;until:number}>();
export function guard(request:Request,type:string,max=6){
const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return reply({error:"This request must come from the storybook."},403);
if(!request.headers.get("content-type")?.includes("application/json"))return reply({error:"Please submit the storybook form."},415);
if(Number(request.headers.get("content-length")||0)>12000)return reply({error:"Please shorten your question."},413);
const now=Date.now();for(const [k,v]of limits)if(v.until<now)limits.delete(k);
const ip=request.headers.get("cf-connecting-ip")||"local";
const key=type+":"+ip;const v=limits.get(key)||{count:0,until:now+600000};
if(v.count>=max)return reply({error:"Let the grove rest a moment. Please try again in a few minutes."},429);
v.count++;limits.set(key,v);return null;
}
export async function body(request:Request){const s=await request.text();if(s.length>12000)throw new Error("INPUT_SIZE");return JSON.parse(s);}
function b64(bytes:Uint8Array){let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
function unb64(s:string){return Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));}
async function signingKey(){return crypto.subtle.importKey("raw",new TextEncoder().encode(secret("NARRATION_SIGNING_SECRET")||secret("GEMINI_API_KEY")), {name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);}
export async function ticket(id:Character,text:string){const data=b64(new TextEncoder().encode(JSON.stringify({id,text,expires:Date.now()+1800000})));const sig=b64(new Uint8Array(await crypto.subtle.sign("HMAC",await signingKey(),new TextEncoder().encode(data))));return data+"."+sig;}
export async function verifyTicket(s:string){if(s.length>5000)throw new Error("TICKET");const [data,sig]=s.split(".");if(!data||!sig||!await crypto.subtle.verify("HMAC",await signingKey(),unb64(sig),new TextEncoder().encode(data)))throw new Error("TICKET");const v=JSON.parse(new TextDecoder().decode(unb64(data)));if(!["quill","ember","willow"].includes(v.id)||typeof v.text!=="string"||v.text.length>2000||v.expires<Date.now())throw new Error("TICKET");return v as {id:Character;text:string;expires:number};}
export const perspectiveJson={type:"object",properties:{advice:{type:"string"},lean:{type:"string",enum:["A","B","unsure"]},reason:{type:"string"},keepsake:{type:"string"}},required:["advice","lean","reason","keepsake"],additionalProperties:false};
export const councilJson={type:"object",properties:{quill:perspectiveJson,ember:perspectiveJson,willow:perspectiveJson,next_step:{type:"string"}},required:["quill","ember","willow","next_step"],additionalProperties:false};
const perspective=z.object({advice:z.string().min(10).max(2000),lean:z.enum(["A","B","unsure"]),reason:z.string().max(400),keepsake:z.string().max(240)}).strict();
export const councilSchema=z.object({quill:perspective,ember:perspective,willow:perspective,next_step:z.string().max(600)}).strict();
export function errorResponse(error:unknown){
const msg=error instanceof Error?error.message:"";
console.error("Oracle Grove service error",/^GEMINI_[A-Z0-9_]+$/.test(msg)?msg:"request_failed");
const quota=msg==="GEMINI_429",auth=msg==="GEMINI_401"||msg==="GEMINI_403",expired=msg.includes("TICKET");
return reply({error:quota?"Gemini is at its current request limit. Please try later, or read the sample story.":auth?"The grove could not connect with its Gemini credentials. You can read the sample story while access is checked.":expired?"This narration has expired. Please ask the grove again.":"The grove couldn't finish this time. Your question is still here; please try again.",code:quota?"service_quota":auth?"service_credentials":expired?"expired":"service_unavailable"},503);
}
