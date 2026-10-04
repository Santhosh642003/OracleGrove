import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:5173";
const input = {question:"How should I spend my weekend?",optionA:"Paint at home",optionB:"Attend a class"};
async function post(path, payload, origin=base) {
  return fetch(base+path,{method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:JSON.stringify(payload)});
}
assert.equal((await post("/api/council",input,"https://example.com")).status,403);
assert.equal((await post("/api/council",{...input,optionB:input.optionA})).status,400);
assert.equal((await post("/api/council",{...input,question:"Hi"})).status,400);
const safety=await post("/api/council",{...input,question:"I want to hurt myself and need help"});
assert.equal(safety.status,200);
assert.deepEqual(await safety.json(),{safety:true});
const voice=await post("/api/voice",{ticket:"invalid.invalid"});
assert.equal(voice.status,503);
assert.ok((await voice.json()).error);
for(const id of ["quill","ember","willow"]){
  const r=await fetch(base+"/audio/sample-"+id+".mp3");
  assert.equal(r.status,200);
  assert.ok((await r.arrayBuffer()).byteLength>10000);
}
console.log("Passed: cross-origin rejection, input validation, safety routing, invalid voice ticket, and all sample audio files.");
