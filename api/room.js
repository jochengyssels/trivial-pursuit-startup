// Same-origin sync backend for the multi-device TriAmigos sprint.
// Browser <-> /api/room (no CORS)  <->  jsonblob registry (server-side only).
// State is server-authoritative: clients send small "ops", server merges & returns full room.

const REGISTRY_ID = "019eb2dc-f100-71a9-aed6-751caf0d79d7";
const BLOB_URL = `https://jsonblob.com/api/jsonBlob/${REGISTRY_ID}`;
const WEDGE_KEYS = ["market","pain","ai","why","insight","win"];
const ROOM_TTL_MS = 12 * 60 * 60 * 1000; // prune rooms older than 12h

const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function withRetry(fn, tries=3){
  let last;
  for(let i=0;i<tries;i++){ try{ return await fn(); }catch(e){ last=e; await sleep(180*(i+1)); } }
  throw last;
}
async function getRegistry(){
  return withRetry(async()=>{
    const c=new AbortController(); const t=setTimeout(()=>c.abort(),6000);
    try{
      const r = await fetch(BLOB_URL, { headers:{ "Accept":"application/json" }, signal:c.signal });
      if(!r.ok) throw new Error("registry read "+r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  });
}
async function putRegistry(reg){
  return withRetry(async()=>{
    const c=new AbortController(); const t=setTimeout(()=>c.abort(),6000);
    try{
      const r = await fetch(BLOB_URL, { method:"PUT", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(reg), signal:c.signal });
      if(!r.ok) throw new Error("registry write "+r.status);
    } finally { clearTimeout(t); }
  });
}
function blankRoom(code){
  const r = { code, phase:0, host:null, createdAt:Date.now(), updatedAt:Date.now(),
    players:{}, picks:{}, customs:{}, votes:{}, candidates:[], candVotes:{}, chosenCand:null, lap2:{} };
  WEDGE_KEYS.forEach(k=>{ r.picks[k]={}; r.customs[k]=[]; r.lap2[k]={best:null,pass:[],fail:[],earned:false}; });
  return r;
}
function ensure(room){
  room.players=room.players||{}; room.picks=room.picks||{}; room.customs=room.customs||{};
  room.votes=room.votes||{}; room.candidates=room.candidates||[]; room.candVotes=room.candVotes||{};
  room.lap2=room.lap2||{};
  WEDGE_KEYS.forEach(k=>{ room.picks[k]=room.picks[k]||{}; room.customs[k]=room.customs[k]||[];
    room.lap2[k]=room.lap2[k]||{best:null,pass:[],fail:[],earned:false}; });
  return room;
}
function toggle(arr, v){ const i=arr.indexOf(v); if(i<0) arr.push(v); else arr.splice(i,1); return arr; }
function majority(n){ return Math.floor(n/2)+1; }

function applyOp(room, op){
  ensure(room);
  const players = Object.keys(room.players);
  switch(op.type){
    case "join":
      room.players[op.pid] = { name:op.name||"Player", role:op.role||"", seen:Date.now() };
      if(!room.host) room.host = op.pid;
      break;
    case "ping":
      if(room.players[op.pid]) room.players[op.pid].seen = Date.now();
      break;
    case "rename":
      if(room.players[op.pid]){ room.players[op.pid].name=op.name; room.players[op.pid].role=op.role; }
      break;
    case "setPhase":
      room.phase = op.phase|0;
      break;
    case "togglePick": // round 1 diverge (multiple choice)
      room.picks[op.wedge] = room.picks[op.wedge]||{};
      room.picks[op.wedge][op.optionId] = toggle(room.picks[op.wedge][op.optionId]||[], op.pid);
      if(room.picks[op.wedge][op.optionId].length===0) delete room.picks[op.wedge][op.optionId];
      break;
    case "addCustom":
      { const id="c_"+Math.random().toString(36).slice(2,7);
        room.customs[op.wedge].push({ id, text:String(op.text||"").slice(0,140), by:op.pid });
        room.picks[op.wedge][id] = [op.pid]; }
      break;
    case "vote": // round 2 dot voting on pooled items, itemKey = "wedge|optionId"
      room.votes[op.itemKey] = toggle(room.votes[op.itemKey]||[], op.pid);
      if(room.votes[op.itemKey].length===0) delete room.votes[op.itemKey];
      break;
    case "setCandidates": // host stores computed candidate list
      room.candidates = (op.candidates||[]).slice(0,4);
      room.candVotes = {};
      break;
    case "candVote": // single choice per player
      Object.keys(room.candVotes).forEach(cid=>{ room.candVotes[cid]=(room.candVotes[cid]||[]).filter(p=>p!==op.pid); });
      room.candVotes[op.candId] = room.candVotes[op.candId]||[];
      if(!room.candVotes[op.candId].includes(op.pid)) room.candVotes[op.candId].push(op.pid);
      break;
    case "chooseCand":
      room.chosenCand = op.candId;
      break;
    case "setBest": // round 3, choose best option for a wedge
      room.lap2[op.wedge].best = op.optionId;
      recompute(room, op.wedge);
      break;
    case "passFail":
      { const w=room.lap2[op.wedge];
        w.pass=(w.pass||[]).filter(p=>p!==op.pid); w.fail=(w.fail||[]).filter(p=>p!==op.pid);
        if(op.val==="pass") w.pass.push(op.pid); else if(op.val==="fail") w.fail.push(op.pid);
        recompute(room, op.wedge); }
      break;
    case "reset":
      { const code=room.code; const keep=room.players; const host=room.host;
        const fresh=blankRoom(code); fresh.players=keep; fresh.host=host; Object.assign(room,fresh); }
      break;
  }
  room.updatedAt = Date.now();
  return room;
}
function recompute(room, wedge){
  const w=room.lap2[wedge]; const n=Object.keys(room.players).length||1;
  w.earned = !!w.best && (w.pass||[]).length >= majority(n) && (w.pass||[]).length > (w.fail||[]).length;
}
function prune(reg){
  const now=Date.now();
  Object.keys(reg.rooms||{}).forEach(code=>{ if(now-(reg.rooms[code].updatedAt||0) > ROOM_TTL_MS) delete reg.rooms[code]; });
}

export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  res.setHeader("Cache-Control","no-store");
  if(req.method==="OPTIONS"){ res.status(204).end(); return; }

  try{
    if(req.method==="GET"){
      const code=(req.query.code||"").toString().toUpperCase();
      if(!code){ res.status(400).json({ok:false,error:"code required"}); return; }
      const reg=await getRegistry(); reg.rooms=reg.rooms||{};
      const room=reg.rooms[code];
      if(!room){ res.status(404).json({ok:false,error:"no such room"}); return; }
      res.status(200).json({ok:true,state:room}); return;
    }
    if(req.method==="POST"){
      let body=req.body;
      if(typeof body==="string"){ try{ body=JSON.parse(body); }catch(e){ body={}; } }
      body=body||{};
      const code=(body.code||"").toString().toUpperCase();
      const op=body.op||{};
      if(!code){ res.status(400).json({ok:false,error:"code required"}); return; }
      const reg=await getRegistry(); reg.rooms=reg.rooms||{};
      let room=reg.rooms[code];
      if(!room){ room=blankRoom(code); reg.rooms[code]=room; }
      applyOp(room, op);
      prune(reg);
      await putRegistry(reg);
      res.status(200).json({ok:true,state:room}); return;
    }
    res.status(405).json({ok:false,error:"method"});
  }catch(e){
    res.status(500).json({ok:false,error:String(e.message||e)});
  }
}

// expose reducer for tests
export { applyOp, blankRoom, recompute };
