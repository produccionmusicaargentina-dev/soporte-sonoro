import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CK="ss-catalog-v2",PK="ss-promo-v1",PYK="ss-payments-v1",BCK="ss-budget-ctr",ADK="ss-admin-cred",OFK="ss-offers-v2";
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function shortCode(){return uid().toUpperCase().slice(0,6);}
function isOfferActive(o){if(!o.active)return false;const now=new Date(),today=now.getDay(),dom=now.getDate(),dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();if(o.startDate&&new Date(o.startDate)>now)return false;if(o.endDate&&new Date(o.endDate)<now)return false;if(o.scheduleDays?.length>0&&!o.scheduleDays.includes(today))return false;if(o.endOfMonth&&dom<dim-4)return false;return true;}
async function hashPw(pw){const enc=new TextEncoder().encode(pw+"soporte_sonoro_salt_2026");const buf=await crypto.subtle.digest("SHA-256",enc);return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");}
function copyText(t){try{navigator.clipboard?.writeText(t).catch(()=>fbCopy(t))}catch{fbCopy(t);}}
function fbCopy(t){const ta=document.createElement("textarea");ta.value=t;ta.style.cssText="position:fixed;left:-9999px";document.body.appendChild(ta);ta.select();try{document.execCommand("copy")}catch{}document.body.removeChild(ta);}
function printText(ti,tx){const w=window.open("","_blank","width=800,height=600");if(!w)return;w.document.write("<!DOCTYPE html><html><head><title>"+ti+"</title><style>body{font-family:monospace;font-size:13px;padding:30px;white-space:pre-wrap;line-height:1.6}</style></head><body>"+tx.replace(/</g,"&lt;")+"</body></html>");w.document.close();setTimeout(()=>w.print(),300);}
function Countdown({endDate}){const[l,setL]=useState("");useEffect(()=>{const iv=setInterval(()=>{const d=new Date(endDate)-new Date();if(d<=0){setL("Fin");clearInterval(iv);return;}const dd=Math.floor(d/864e5),h=Math.floor((d%864e5)/36e5),m=Math.floor((d%36e5)/6e4);setL((dd?dd+"d ":"")+(h?h+"h ":"")+m+"m");},1e3);return()=>clearInterval(iv);},[endDate]);return<span style={{color:"#ef4444",fontWeight:700,fontSize:11}}>{l}</span>;}
function fmtDate(ts){if(!ts)return"";const d=new Date(ts);return d.toLocaleDateString("es-AR");}
function fmtDateTime(ts){if(!ts)return"";const d=new Date(ts);return d.toLocaleDateString("es-AR")+" "+d.toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});}

function generateGiftSVG(code,items,from,to){
  const it=items.slice(0,5).map(a=>a.name).join(", ")+(items.length>5?" +"+(items.length-5)+" mas":"");
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" style="max-width:100%;height:auto"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#312e81"/></linearGradient></defs><rect width="800" height="400" rx="20" fill="url(#bg)"/><rect x="16" y="16" width="768" height="368" rx="14" fill="none" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="8 4"/><text x="400" y="55" text-anchor="middle" fill="#c7d2fe" font-family="Arial" font-size="13" letter-spacing="4">SOPORTE SONORO</text><text x="400" y="100" text-anchor="middle" fill="#fff" font-family="Arial" font-size="30" font-weight="bold">GIFT CARD</text><text x="400" y="130" text-anchor="middle" fill="#a5b4fc" font-family="Arial" font-size="14">Vale por instalaciones y optimizaciones de audio</text><rect x="280" y="148" width="240" height="40" rx="10" fill="#4f46e5"/><text x="400" y="175" text-anchor="middle" fill="#fff" font-family="monospace" font-size="22" font-weight="bold">${code}</text><text x="400" y="215" text-anchor="middle" fill="#c7d2fe" font-family="Arial" font-size="12">${it}</text>${from?`<text x="400" y="260" text-anchor="middle" fill="#a5b4fc" font-family="Arial" font-size="14">De: ${from}${to?" | Para: "+to:""}</text>`:to?`<text x="400" y="260" text-anchor="middle" fill="#a5b4fc" font-family="Arial" font-size="14">Para: ${to}</text>`:""}<line x1="80" y1="290" x2="720" y2="290" stroke="#4338ca" stroke-width="1"/><text x="400" y="320" text-anchor="middle" fill="#818cf8" font-family="Arial" font-size="12">Para coordinar tu instalacion contacta a:</text><text x="400" y="345" text-anchor="middle" fill="#e0e7ff" font-family="Arial" font-size="14" font-weight="bold">produccionmusicaargentina@gmail.com</text><text x="400" y="375" text-anchor="middle" fill="#6366f1" font-family="Arial" font-size="10">Presenta este codigo al contactarnos</text></svg>`;
}

const defaultCatalog=[
  {id:"p001",name:"u-he Diva",os:"both",price:17500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:DEE0B91B34B251E11297F4A4441C752ED4035543"}]},
  {id:"p002",name:"Arturia V Collection X",os:"windows",price:22500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:514ED8096EA63DC285B747095D9CAC75C1168E72"}]},
  {id:"p003",name:"Arturia V Collection X",os:"mac",price:37500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:C5C60BFCF67E60557DD59C7A4A9CFE7277F079C7"}]},
  {id:"p004",name:"u-he Hive 2",os:"windows",price:17500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:5B4E3D294C19B5F015E772CDC74CD7B0055B5BCF"}]},
  {id:"p005",name:"u-he Hive 2",os:"mac",price:17500,category:"Synth",giftEligible:false,links:[{type:"drive",url:"https://drive.google.com/file/d/1J5N1rJaKyCbWHOGeRwnSF9eA7gBYMnaq/view"}]},
  {id:"p006",name:"Waves Bundle",os:"mac",price:27500,category:"FX / Bundle",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:70E723ECAEFCEC2F11B88F36639687017E542F57"}]},
  {id:"p007",name:"Fabfilter Bundle",os:"mac",price:19500,category:"FX / Bundle",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:495071ED878483DE33B19C496E2BD60E68482CAA"}]},
  {id:"p008",name:"Voxengo Span Plus",os:"mac",price:17500,category:"FX",giftEligible:false,links:[]},{id:"p009",name:"Valhalla Bundle",os:"mac",price:17500,category:"FX / Bundle",giftEligible:false,links:[]},
  {id:"p010",name:"Synapse Audio Legend",os:"mac",price:17500,category:"Synth",giftEligible:false,links:[]},{id:"p011",name:"Soothe2",os:"mac",price:17500,category:"FX",giftEligible:false,links:[]},
  {id:"p012",name:"SubBoomBass 2",os:"mac",price:17500,category:"Synth",giftEligible:false,links:[]},{id:"p013",name:"Serum",os:"mac",price:17500,category:"Synth",giftEligible:false,links:[]},
  {id:"p014",name:"Kickstart 2",os:"both",price:17500,category:"FX",giftEligible:false,links:[]},{id:"p015",name:"Synapse Audio Obsession",os:"mac",price:19500,category:"Synth",giftEligible:false,links:[]},
  {id:"p016",name:"Dada Life Bundle",os:"mac",price:19500,category:"FX / Bundle",giftEligible:false,links:[]},
  {id:"p017",name:"3 Pack Librerias",os:"both",price:17500,category:"Librerias",giftEligible:false,links:[]},{id:"p018",name:"5 Pack Librerias",os:"both",price:22500,category:"Librerias",giftEligible:false,links:[]},{id:"p019",name:"10 Pack Librerias",os:"both",price:37500,category:"Librerias",giftEligible:false,links:[]},
  {id:"p020",name:"Ableton Live 12 Suite",os:"windows",price:27500,category:"DAW",giftEligible:false,links:[]},
  {id:"p021",name:"Fabfilter Bundle",os:"windows",price:19500,category:"FX / Bundle",giftEligible:false,links:[]},{id:"p022",name:"DS Tantra 2",os:"windows",price:17500,category:"Synth",giftEligible:false,links:[]},
  {id:"p023",name:"Soundtheory Gullfoss",os:"mac",price:17500,category:"FX",giftEligible:false,links:[]},{id:"p024",name:"Kazrog KClip 3",os:"both",price:17500,category:"FX",giftEligible:false,links:[]},
  {id:"p025",name:"u-he Repro 1/5",os:"both",price:17500,category:"Synth",giftEligible:false,links:[]},{id:"p026",name:"Arturia FX Collection 5",os:"windows",price:22500,category:"FX / Bundle",giftEligible:false,links:[]},
  {id:"p027",name:"Omnisphere 3",os:"windows",price:32500,category:"Synth",giftEligible:false,links:[]},{id:"p028",name:"Dune 3",os:"windows",price:17500,category:"Synth",giftEligible:false,links:[]},
  {id:"p029",name:"Waves Bundle",os:"windows",price:27500,category:"FX / Bundle",giftEligible:false,links:[]},{id:"p030",name:"Spire",os:"windows",price:19500,category:"Synth",giftEligible:false,links:[]},
  {id:"p031",name:"Swivel Audio The Sauce",os:"windows",price:19500,category:"FX",giftEligible:false,links:[]},{id:"p032",name:"Nexus 5",os:"windows",price:27500,category:"Synth",giftEligible:false,links:[]},
  {id:"p033",name:"ShaperBox 3",os:"both",price:17500,category:"FX",giftEligible:false,links:[]},{id:"p034",name:"Trackspacer",os:"mac",price:17500,category:"FX",giftEligible:false,links:[]},
  {id:"p035",name:"God Particle",os:"mac",price:17500,category:"FX",giftEligible:false,links:[]},{id:"p036",name:"Brainworx Bundle",os:"mac",price:22500,category:"FX / Bundle",giftEligible:false,links:[]},
  {id:"p037",name:"Roland RE-201",os:"windows",price:17500,category:"FX",giftEligible:false,links:[]},{id:"p038",name:"Soundtoys",os:"windows",price:17500,category:"FX / Bundle",giftEligible:false,links:[]},
  {id:"p039",name:"Trilian",os:"both",price:27500,category:"Synth",giftEligible:false,links:[]},{id:"p040",name:"MiniMeters",os:"both",price:17500,category:"Utility",giftEligible:false,links:[]},
  {id:"p041",name:"Legend HZ",os:"windows",price:19500,category:"Synth",giftEligible:false,links:[]},
  {id:"s001",name:"Optimizacion del sistema",os:"both",price:32500,category:"Servicio",giftEligible:false,links:[]},
  {id:"s002",name:"Optimizacion + Limpieza",os:"both",price:47500,category:"Servicio",giftEligible:false,links:[]},
];

const OsB=({os})=>{const m={windows:{l:"Win",bg:"#dbeafe",c:"#1e40af"},mac:{l:"Mac",bg:"#f3e8ff",c:"#7c3aed"},both:{l:"W+M",bg:"#d1fae5",c:"#065f46"}};const s=m[os]||m.both;return<span style={{background:s.bg,color:s.c,padding:"2px 6px",borderRadius:4,fontSize:10,fontWeight:600}}>{s.l}</span>;};
const Gift=()=><span style={{background:"#fef3c7",color:"#b45309",padding:"2px 6px",borderRadius:4,fontSize:10,fontWeight:700}}>REGALO</span>;
const COLORS=["#4f46e5","#059669","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#84cc16"];
const inp={padding:"8px 12px",borderRadius:8,border:"1.5px solid #ddd",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",background:"#fafafa"};
const bP={padding:"8px 18px",borderRadius:8,border:"none",background:"#4f46e5",color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer"};
const bG={...bP,background:"#059669"};const bD={...bP,background:"#ef4444"};
const bO={...bP,background:"transparent",color:"#4f46e5",border:"1.5px solid #4f46e5"};const bS={...bO,padding:"4px 10px",fontSize:11};
const crd={background:"#fff",border:"1.5px solid #e8e8ee",borderRadius:10,padding:"12px 14px",marginBottom:8};
const crdSel={...crd,borderColor:"#4f46e5",boxShadow:"0 0 0 2px rgba(79,70,229,.12)"};const crdG={...crd,borderColor:"#f59e0b",background:"#fffdf5"};
const lbl={fontSize:11,color:"#666",display:"block",marginBottom:3,marginTop:12,fontWeight:600};
const tB=(a)=>({padding:"6px 10px",borderRadius:8,border:"2px solid",cursor:"pointer",fontWeight:600,fontSize:10,borderColor:a?"#4f46e5":"#e2e2e8",background:a?"#4f46e5":"#fff",color:a?"#fff":"#555",whiteSpace:"nowrap"});
const sec={background:"#f8fafc",borderRadius:10,padding:"16px 14px",border:"1.5px solid #e2e2e8",marginBottom:14};

// Payment status colors
function payColor(r){if(!r.status||r.status==="pending")return"#f59e0b";if(r.status==="rejected")return"#ef4444";if(r.status==="accepted"||r.status==="installed"){if(r.pendingAmount>0)return"#ef4444";return"#059669";}return"#e2e2e8";}

// ====== MAIN ======
export default function App(){
  const[mode,setMode]=useState(null);const[sesCode,setSesCode]=useState("");const[inCode,setInCode]=useState("");const[err,setErr]=useState("");const[trackNum,setTrackNum]=useState("");const[trackResult,setTrackResult]=useState(null);
  useEffect(()=>{if(window.location.hash==="#admin")setMode("login");const h=()=>{if(window.location.hash==="#admin")setMode("login");};window.addEventListener("hashchange",h);return()=>window.removeEventListener("hashchange",h);},[]);

  async function join(){const c=inCode.trim().toUpperCase();if(!c){setErr("Ingresa un codigo");return;}
    try{let used=false;try{const u=await window.storage.get("ss-used-"+c,true);if(u?.value)used=true;}catch{}
    if(used){setErr("Codigo ya utilizado");return;}
    let found=false;try{const r=await window.storage.get("ss-ses-"+c,true);if(r?.value)found=true;}catch{}
    if(!found){try{const r=await window.storage.get("swcat-session-"+c,true);if(r?.value)found=true;}catch{}}
    if(!found){setErr("Codigo no encontrado");return;}setSesCode(c);setMode("client");}catch{setErr("Error");}}

  async function trackBudget(){if(!trackNum.trim()){setTrackResult({err:"Ingresa numero"});return;}
    try{const ks=await window.storage.list("ss-resp-",true);for(const k of(ks?.keys||[])){try{const r=await window.storage.get(k,true);if(r?.value){const d=JSON.parse(r.value);if(d.budgetNumber===trackNum.trim().toUpperCase()){setTrackResult(d);return;}}}catch{}}setTrackResult({err:"No encontrado"});}catch{setTrackResult({err:"Error"});}}

  if(!mode)return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:440,margin:"0 auto",padding:"40px 16px",textAlign:"center"}}>
    <div style={{fontSize:18,fontWeight:800,letterSpacing:2,color:"#4f46e5",marginBottom:4}}>SOPORTE SONORO</div>
    <p style={{color:"#888",fontSize:13,marginBottom:24}}>Instalaciones, optimizaciones y software de audio</p>
    <p style={{fontSize:13,color:"#666",marginBottom:8,fontWeight:600}}>Codigo de presupuesto</p>
    <div style={{display:"flex",gap:8,marginBottom:16}}><input style={{...inp,flex:1,textAlign:"center",fontSize:16,letterSpacing:4,fontWeight:700,textTransform:"uppercase"}} value={inCode} onChange={e=>{setInCode(e.target.value);setErr("");}} placeholder="ABC123" maxLength={8} onKeyDown={e=>e.key==="Enter"&&join()}/><button style={bG} onClick={join}>Entrar</button></div>
    {err&&<p style={{color:"#ef4444",fontSize:12,marginTop:-8,marginBottom:8}}>{err}</p>}
    <div style={{borderTop:"1px solid #eee",paddingTop:14}}>
      <p style={{fontSize:12,color:"#888",marginBottom:6}}>Consultar presupuesto</p>
      <div style={{display:"flex",gap:8}}><input style={{...inp,flex:1,textAlign:"center",fontSize:12,textTransform:"uppercase"}} value={trackNum} onChange={e=>{setTrackNum(e.target.value);setTrackResult(null);}} placeholder="PRES-2026-0001" onKeyDown={e=>e.key==="Enter"&&trackBudget()}/><button style={bS} onClick={trackBudget}>Buscar</button></div>
      {trackResult&&(trackResult.err?<p style={{color:"#ef4444",fontSize:12,marginTop:6}}>{trackResult.err}</p>:
      <div style={{...crd,textAlign:"left",marginTop:8,borderLeft:"4px solid "+payColor(trackResult)}}><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontWeight:800,color:"#4f46e5",fontSize:13}}>#{trackResult.budgetNumber}</span><span style={{fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:600,background:payColor(trackResult)+"20",color:payColor(trackResult)}}>{trackResult.status||"pendiente"}</span></div><div style={{fontSize:12,color:"#666",marginTop:4}}>Total: <strong>${(trackResult.total||0).toLocaleString("es-AR")}</strong>{trackResult.pendingAmount>0&&<span style={{color:"#ef4444",fontWeight:600}}> (pendiente: ${trackResult.pendingAmount.toLocaleString("es-AR")})</span>}</div></div>)}
    </div>
  </div>);
  if(mode==="login")return<AdminLogin onAuth={()=>setMode("admin")} onBack={()=>{setMode(null);window.location.hash="";}}/>;
  if(mode==="admin")return<AdminPanel onBack={()=>{setMode(null);window.location.hash="";}}/>;
  if(mode==="client")return<ClientPanel code={sesCode} onBack={()=>{setMode(null);setSesCode("");setInCode("");}}/>;
}

function AdminLogin({onAuth,onBack}){
  const[user,setUser]=useState(""),p=useState(""),err=useState(""),isS=useState(null),p2=useState("");
  const[pw,setPw]=p;const[er,setEr]=err;const[isSetup,setIsSetup]=isS;const[pw2,setPw2]=p2;
  useEffect(()=>{(async()=>{try{const r=await window.storage.get(ADK);setIsSetup(!!r?.value);}catch{setIsSetup(false);}})();},[]);
  async function doSetup(){if(!user.trim()||pw.length<6){setEr("Min 6 chars");return;}if(pw!==pw2){setEr("No coinciden");return;}try{await window.storage.set(ADK,JSON.stringify({user:user.trim(),hash:await hashPw(pw)}));onAuth();}catch{setEr("Error");}}
  async function doLogin(){try{const r=await window.storage.get(ADK);if(!r?.value)return setEr("Sin cuenta");const c=JSON.parse(r.value);if(c.user===user.trim()&&c.hash===await hashPw(pw))onAuth();else setEr("Incorrecto");}catch{setEr("Error");}}
  if(isSetup===null)return<div style={{padding:40,textAlign:"center",color:"#888"}}>...</div>;
  return(<div style={{fontFamily:"system-ui",maxWidth:360,margin:"0 auto",padding:"60px 16px"}}><button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#999",marginBottom:14}}>Volver</button><div style={{...sec,padding:24}}><div style={{fontWeight:800,color:"#4f46e5",letterSpacing:1,marginBottom:16}}>SOPORTE SONORO</div>
    <label style={{...lbl,marginTop:0}}>Usuario</label><input style={inp} value={user} onChange={e=>setUser(e.target.value)}/>
    <label style={lbl}>Pass</label><input style={inp} type="password" value={pw} onChange={e=>{setPw(e.target.value);setEr("");}} onKeyDown={e=>e.key==="Enter"&&(isSetup?doLogin():null)}/>
    {!isSetup&&<><label style={lbl}>Repetir</label><input style={inp} type="password" value={pw2} onChange={e=>setPw2(e.target.value)}/></>}
    {er&&<p style={{color:"#ef4444",fontSize:12,marginTop:6}}>{er}</p>}
    <button style={{...bP,width:"100%",marginTop:16,padding:"10px"}} onClick={isSetup?doLogin:doSetup}>{isSetup?"Entrar":"Crear"}</button></div></div>);
}

// ====== ADMIN ======
function AdminPanel({onBack}){
  const[apps,setApps]=useState([]);const[loaded,setLoaded]=useState(false);const[tab,setTab]=useState("catalog");const[search,setSearch]=useState("");
  const[showForm,setShowForm]=useState(false);const[editApp,setEditApp]=useState(null);const[osF,setOsF]=useState("all");
  const[sel,setSel]=useState(new Set());const[giftIds,setGiftIds]=useState(new Set());const[showExp,setShowExp]=useState(false);
  const[sesCode,setSesCode]=useState("");const[resps,setResps]=useState([]);const[pEvery,setPEvery]=useState(3);const[pMode,setPMode]=useState("cheapest");
  const[viewR,setViewR]=useState(null);const[payments,setPayments]=useState([{id:uid(),label:"Transferencia",alias:"",cbu:"",titular:"",banco:"",extra:""}]);
  const[offers,setOffers]=useState([]);const[showOfferForm,setShowOfferForm]=useState(false);const[editOffer,setEditOffer]=useState(null);
  const[copied,setCopied]=useState(false);const[sorteoCount,setSorteoCount]=useState(1);const[sorteoResult,setSorteoResult]=useState(null);
  const[respSearch,setRespSearch]=useState("");const[respFilter,setRespFilter]=useState("all");
  const[nlSubject,setNlSubject]=useState("");const[nlBody,setNlBody]=useState("");
  const[statMode,setStatMode]=useState("month");
  const fileRef=useRef(null);

  useEffect(()=>{(async()=>{
    try{const r=await window.storage.get(CK);if(r?.value){const p=JSON.parse(r.value);setApps(p.length>0?p:defaultCatalog);}else setApps(defaultCatalog);}catch{setApps(defaultCatalog);}
    try{const p=await window.storage.get(PK);if(p?.value){const d=JSON.parse(p.value);setPEvery(d.every||3);setPMode(d.mode||"cheapest");}}catch{}
    try{const p=await window.storage.get(PYK);if(p?.value)setPayments(JSON.parse(p.value));}catch{}
    try{const p=await window.storage.get(OFK);if(p?.value)setOffers(JSON.parse(p.value));}catch{}
    setLoaded(true);})();},[]);
  useEffect(()=>{if(loaded)try{window.storage.set(CK,JSON.stringify(apps))}catch{}},[apps,loaded]);
  useEffect(()=>{if(loaded)try{window.storage.set(PK,JSON.stringify({every:pEvery,mode:pMode}))}catch{}},[pEvery,pMode,loaded]);
  useEffect(()=>{if(loaded)try{window.storage.set(OFK,JSON.stringify(offers))}catch{}},[offers,loaded]);

  const filt=apps.filter(a=>{const mO=osF==="all"||a.os===osF||a.os==="both";return mO&&(a.name.toLowerCase().includes(search.toLowerCase())||(a.category||"").toLowerCase().includes(search.toLowerCase()));});
  const selApps=apps.filter(a=>sel.has(a.id));const paid=selApps.filter(a=>!giftIds.has(a.id));const gifts=selApps.filter(a=>giftIds.has(a.id));
  const maxG=Math.floor(paid.length/pEvery);const totP=paid.reduce((s,a)=>s+(a.price||0),0);
  const toggleS=id=>{setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});};
  const toggleG=id=>{setGiftIds(p=>{const n=new Set(p);if(n.has(id)){n.delete(id);return n;}if(n.size<maxG){n.add(id);return n;}return p;});};

  async function loadResps(){try{const ks=await window.storage.list("ss-resp-",true);const rs=[];for(const k of(ks?.keys||[])){try{const r=await window.storage.get(k,true);if(r?.value)rs.push({...JSON.parse(r.value),_key:k});}catch{}}setResps(rs.sort((a,b)=>(b.timestamp||"").localeCompare(a.timestamp||"")));}catch{}}
  async function updateResp(resp,updates){const u={...resp,...updates};try{await window.storage.set(resp._key,JSON.stringify(u),true);}catch{}setResps(p=>p.map(r=>r._key===resp._key?u:r));if(viewR?._key===resp._key)setViewR(u);}

  function genExp(r){const l=[];l.push("SOPORTE SONORO - #"+(r.budgetNumber||""));l.push("Cliente: "+(r.clientName||"")+" | "+fmtDateTime(r.timestamp));l.push("---");const pd=(r.selectedApps||[]).filter(a=>!a.isGift);const gf=(r.selectedApps||[]).filter(a=>a.isGift);pd.forEach((a,i)=>{l.push((i+1)+". "+a.name+" $"+(a.price||0).toLocaleString("es-AR"));(a.links||[]).forEach(lk=>l.push("   "+lk.url));});if(gf.length){l.push("\n--- REGALOS ---");gf.forEach(a=>{l.push("* "+a.name+" - GRATIS");(a.links||[]).forEach(lk=>l.push("   "+lk.url));});}if((r.customRequests||[]).length){l.push("\n--- SOLICITUDES ---");r.customRequests.forEach(cr=>l.push("* "+cr.name+(cr.note?" - "+cr.note:"")));}l.push("---\nTOTAL: $"+(r.total||0).toLocaleString("es-AR")+(r.paymentCurrency?" ("+r.paymentCurrency+")":""));if(r.pendingAmount>0)l.push("PENDIENTE: $"+r.pendingAmount.toLocaleString("es-AR"));return l.join("\n");}
  function doCopy(t){copyText(t);setCopied(true);setTimeout(()=>setCopied(false),2e3);}
  async function createSes(){const c=shortCode();try{let ctr=1;try{const r=await window.storage.get(BCK);if(r?.value)ctr=JSON.parse(r.value);}catch{}await window.storage.set(BCK,JSON.stringify(ctr+1));await window.storage.set("ss-ses-"+c,JSON.stringify({catalog:apps,promo:{every:pEvery,mode:pMode},payments,giftPool:apps.filter(a=>a.giftEligible),offers:offers.filter(o=>o.active),nextBudget:ctr}),true);setSesCode(c);}catch{}}

  // Filtered responses
  const filtResps=resps.filter(r=>{const mS=!respSearch||(r.clientName||"").toLowerCase().includes(respSearch.toLowerCase())||(r.clientEmail||"").toLowerCase().includes(respSearch.toLowerCase())||(r.budgetNumber||"").toLowerCase().includes(respSearch.toLowerCase())||fmtDate(r.timestamp).includes(respSearch);const mF=respFilter==="all"||(respFilter==="unpaid"&&r.pendingAmount>0)||(respFilter==="paid"&&(r.status==="accepted"||r.status==="installed")&&!r.pendingAmount)||(respFilter==="pending"&&(!r.status||r.status==="pending"));return mS&&mF;});

  // Emails
  const allEmails=[...new Set(resps.map(r=>r.clientEmail).filter(Boolean))];
  function runSorteo(){const sh=[...allEmails].sort(()=>Math.random()-0.5);setSorteoResult(sh.slice(0,Math.min(sorteoCount,sh.length)));}

  // Referral stats
  const refMap={};resps.forEach(r=>{if(r.referralCode){if(!refMap[r.referralCode])refMap[r.referralCode]={code:r.referralCode,uses:0,names:[]};refMap[r.referralCode].uses++;refMap[r.referralCode].names.push(r.clientName||"");}});
  const refOwners={};resps.forEach(r=>{if(r.myReferralCode)refOwners[r.myReferralCode]=r.clientName||r.clientEmail||"";});
  const refList=Object.values(refMap).sort((a,b)=>b.uses-a.uses);

  // Stats
  const acc=resps.filter(r=>r.status==="accepted"||r.status==="installed");
  const totalRev=acc.reduce((s,r)=>s+(r.total||0),0);
  const totalPending=resps.filter(r=>r.pendingAmount>0).reduce((s,r)=>s+(r.pendingAmount||0),0);
  const monthlyData=(()=>{const m={};acc.forEach(r=>{if(!r.timestamp)return;const d=new Date(r.timestamp),k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");if(!m[k])m[k]={month:k,total:0,n:0};m[k].total+=(r.total||0);m[k].n++;});return Object.values(m).sort((a,b)=>a.month.localeCompare(b.month));})();
  const catData=(()=>{const m={};acc.forEach(r=>(r.selectedApps||[]).forEach(a=>{if(a.isGift)return;const c=a.category||"Otro";if(!m[c])m[c]={name:c,value:0};m[c].value+=(a.price||0);}));return Object.values(m).sort((a,b)=>b.value-a.value);})();
  const pluginData=(()=>{const m={};acc.forEach(r=>(r.selectedApps||[]).forEach(a=>{if(!m[a.name])m[a.name]={name:a.name,count:0,rev:0};m[a.name].count++;if(!a.isGift)m[a.name].rev+=(a.price||0);}));return Object.values(m).sort((a,b)=>b.count-a.count).slice(0,10);})();
  const osData=(()=>{const m={windows:0,mac:0,both:0};acc.forEach(r=>{const o=r.osFilter||"both";m[o]=(m[o]||0)+(r.total||0);});return Object.entries(m).filter(([_,v])=>v>0).map(([k,v])=>({name:k==="windows"?"Windows":k==="mac"?"macOS":"Ambos",value:v}));})();

  if(!loaded)return<div style={{padding:40,textAlign:"center",color:"#888"}}>...</div>;
  return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:780,margin:"0 auto",padding:"10px 10px 60px"}}>
    <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:12,flexWrap:"wrap"}}>
      <button onClick={onBack} style={{background:"#fee2e2",border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600,color:"#991b1b"}}>Salir</button>
      <div style={{fontSize:13,fontWeight:800,flex:"1 1 40px",color:"#4f46e5",letterSpacing:1}}>SS</div>
      {["catalog","promo","offers","session","share","payment","responses","newsletter","referrals","sorteo","stats"].map(t=>(<button key={t} style={tB(tab===t)} onClick={()=>{setTab(t);setShowExp(false);setViewR(null);if(["responses","stats","referrals","sorteo","newsletter"].includes(t))loadResps();}}>{{catalog:"Cat",promo:"Pr",offers:"Of",session:"Trab",share:"Cod",payment:"Pay",responses:"Pres",newsletter:"Mail",referrals:"Ref",sorteo:"Sort",stats:"Stat"}[t]}</button>))}
    </div>

    {tab==="catalog"&&<div>
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}><input style={{...inp,flex:1,minWidth:80}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/><button style={bP} onClick={()=>{setEditApp(null);setShowForm(true);}}>+</button><button style={bO} onClick={()=>fileRef.current?.click()}>XLS</button><input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const wb=XLSX.read(ev.target.result,{type:"array"});const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""});const na=rows.map(r=>{const w=String(r.windows||"").toLowerCase(),m=String(r.macos||"").toLowerCase();let os="both";if(w==="si"&&m!=="si")os="windows";else if(m==="si"&&w!=="si")os="mac";return{id:uid(),name:String(r.Plugin||r.plugin||"").trim(),os,price:Number(r.valor||0),category:"",giftEligible:false,links:[]};}).filter(a=>a.name);setApps(p=>[...p,...na]);}catch{}};r.readAsArrayBuffer(f);e.target.value="";}}/></div>
      <div style={{fontSize:11,color:"#888",marginBottom:6}}>{apps.length} items</div>
      {filt.map(a=>(<div key={a.id} style={crd}><div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:12,flex:1}}>{a.name}</span><OsB os={a.os}/><span style={{fontSize:10,color:"#777",background:"#f3f4f6",padding:"1px 5px",borderRadius:3}}>{a.category}</span><span style={{fontWeight:700,color:"#4f46e5",fontSize:12}}>${(a.price||0).toLocaleString("es-AR")}</span><button style={bS} onClick={()=>{setEditApp(a);setShowForm(true);}}>Ed</button><button style={{background:"none",border:"none",color:"#ccc",cursor:"pointer",fontSize:12}} onClick={()=>setApps(apps.filter(x=>x.id!==a.id))}>x</button></div></div>))}
    </div>}

    {tab==="promo"&&<div style={sec}><h3 style={{margin:"0 0 10px",fontSize:15}}>Promo</h3><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}><span>Cada</span><input type="number" min={2} max={20} value={pEvery} onChange={e=>setPEvery(Math.max(2,Number(e.target.value)||3))} style={{...inp,width:50,textAlign:"center",padding:"3px"}}/><span>apps = 1 gratis</span></div>
      {[["cheapest","Auto: mas barato"],["pool","Cliente elige"]].map(([v,t])=>(<label key={v} style={{display:"flex",alignItems:"center",gap:8,padding:10,borderRadius:8,border:pMode===v?"2px solid #4f46e5":"2px solid #e2e2e8",cursor:"pointer",background:pMode===v?"#eef2ff":"#fff",marginBottom:6}} onClick={()=>setPMode(v)}><input type="radio" checked={pMode===v} onChange={()=>{}}/><span style={{fontWeight:600,fontSize:13}}>{t}</span></label>))}</div>}

    {tab==="offers"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><h3 style={{margin:0,fontSize:15}}>Ofertas</h3><button style={bP} onClick={()=>{setEditOffer(null);setShowOfferForm(true);}}>+</button></div>
      {offers.map(o=>{const disc=o.originalPrice>0&&o.price>0?Math.round((1-o.price/o.originalPrice)*100):0;return(<div key={o.id} style={{...crd,borderLeft:o.isSuper?"4px solid #ef4444":"4px solid #f59e0b",opacity:isOfferActive(o)?1:.5}}><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>{o.isSuper&&<span style={{background:"#ef4444",color:"#fff",padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:800}}>SUPER</span>}<span style={{fontWeight:800,flex:1,fontSize:13}}>{o.name}</span><span style={{fontWeight:800,color:"#ef4444"}}>${(o.price||0).toLocaleString("es-AR")}</span>{disc>0&&<span style={{background:"#dcfce7",color:"#166534",padding:"1px 5px",borderRadius:4,fontSize:10,fontWeight:700}}>-{disc}%</span>}</div>
        <div style={{display:"flex",gap:4,marginTop:6}}><button style={bS} onClick={()=>{setEditOffer(o);setShowOfferForm(true);}}>Ed</button><button style={{...bS,color:o.active?"#ef4444":"#059669"}} onClick={()=>setOffers(offers.map(x=>x.id===o.id?{...x,active:!x.active}:x))}>{o.active?"Off":"On"}</button><button style={{background:"none",border:"none",color:"#ccc",cursor:"pointer"}} onClick={()=>setOffers(offers.filter(x=>x.id!==o.id))}>x</button></div></div>);})}
      {showOfferForm&&<OfferForm offer={editOffer} apps={apps} onSave={o=>{if(editOffer)setOffers(offers.map(x=>x.id===o.id?o:x));else setOffers([...offers,{...o,id:uid(),active:true}]);setShowOfferForm(false);setEditOffer(null);}} onCancel={()=>{setShowOfferForm(false);setEditOffer(null);}}/>}
    </div>}

    {tab==="session"&&!showExp&&<div>
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>{["all","windows","mac"].map(o=><button key={o} style={tB(osF===o)} onClick={()=>setOsF(o)}>{o==="all"?"All":"Win/Mac".split("/")[o==="windows"?0:1]}</button>)}</div>
      <input style={{...inp,marginBottom:8}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
      {sel.size>0&&<div style={{fontSize:12,color:"#666",marginBottom:6}}>{sel.size} sel | Total: ${totP.toLocaleString("es-AR")} <button style={bG} onClick={()=>setShowExp(true)}>Generar</button></div>}
      {filt.map(a=>{const is=sel.has(a.id),ig=giftIds.has(a.id);return(<div key={a.id} style={ig?crdG:is?crdSel:crd}><div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}><input type="checkbox" checked={is} onChange={()=>toggleS(a.id)} style={{width:16,height:16}}/><span style={{fontWeight:700,fontSize:12,flex:1,cursor:"pointer"}} onClick={()=>toggleS(a.id)}>{a.name}</span>{ig&&<Gift/>}<OsB os={a.os}/><span style={{fontWeight:700,color:ig?"#16a34a":"#4f46e5",fontSize:12,textDecoration:ig?"line-through":"none"}}>${(a.price||0).toLocaleString("es-AR")}</span>{is&&<button onClick={()=>toggleG(a.id)} style={{background:ig?"#fbbf24":"#eee",border:"none",borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:10}}>R</button>}</div></div>);})}
    </div>}
    {tab==="session"&&showExp&&<div><button style={{...bS,marginBottom:10}} onClick={()=>setShowExp(false)}>Volver</button><div style={sec}><textarea readOnly id="exp-ta" value={"SOPORTE SONORO\n---\n"+paid.map((a,i)=>(i+1)+". "+a.name+" $"+(a.price||0).toLocaleString("es-AR")+"\n"+(a.links||[]).map(l=>"   "+l.url).join("\n")).join("\n")+(gifts.length?"\n--- REGALOS ---\n"+gifts.map(a=>"* "+a.name+" GRATIS\n"+(a.links||[]).map(l=>"   "+l.url).join("\n")).join("\n"):"")+"\n---\nTOTAL: $"+totP.toLocaleString("es-AR")} style={{width:"100%",minHeight:180,fontFamily:"monospace",fontSize:11,padding:12,borderRadius:8,border:"1px solid #ddd",background:"#fff",resize:"vertical",boxSizing:"border-box"}}/><div style={{display:"flex",gap:8,marginTop:10}}><button style={bP} onClick={()=>doCopy(document.getElementById("exp-ta").value)}>{copied?"OK":"Copiar"}</button><button style={bO} onClick={()=>printText("SS",document.getElementById("exp-ta").value)}>Print</button></div></div></div>}

    {tab==="payment"&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><h3 style={{margin:0,fontSize:15}}>Pagos</h3><button style={bP} onClick={()=>setPayments([...payments,{id:uid(),label:"",alias:"",cbu:"",titular:"",banco:"",extra:""}])}>+</button></div>
      {payments.map(pm=>(<div key={pm.id} style={{...sec,position:"relative"}}>{payments.length>1&&<button onClick={()=>setPayments(payments.filter(p=>p.id!==pm.id))} style={{position:"absolute",top:8,right:10,background:"none",border:"none",color:"#ccc",cursor:"pointer"}}>x</button>}
        {[["Nombre *","label"],["Alias","alias"],["CBU","cbu"],["Titular","titular"],["Banco","banco"]].map(([l,k])=>(<div key={k}><label style={{...lbl,marginTop:k==="label"?0:undefined}}>{l}</label><input style={inp} value={pm[k]} onChange={e=>setPayments(payments.map(p=>p.id===pm.id?{...p,[k]:e.target.value}:p))}/></div>))}
        <label style={lbl}>Extra</label><textarea style={{...inp,minHeight:35,resize:"vertical"}} value={pm.extra} onChange={e=>setPayments(payments.map(p=>p.id===pm.id?{...p,extra:e.target.value}:p))}/>
      </div>))}<button style={bG} onClick={()=>{try{window.storage.set(PYK,JSON.stringify(payments))}catch{}}}>Guardar</button></div>}

    {tab==="share"&&<div style={sec}><h3 style={{margin:"0 0 8px",fontSize:15}}>Codigo</h3>{!sesCode?<button style={{...bP,padding:"10px 24px"}} onClick={createSes}>Generar</button>:(<div><div style={{fontSize:26,fontWeight:800,letterSpacing:6,color:"#4f46e5",textAlign:"center",padding:"14px 0",background:"#eef2ff",borderRadius:10,marginBottom:10}}>{sesCode}</div><div style={{display:"flex",gap:6}}><button style={bO} onClick={()=>doCopy(sesCode)}>{copied?"OK":"Copiar"}</button><button style={bO} onClick={()=>setSesCode("")}>Nuevo</button></div></div>)}</div>}

    {tab==="responses"&&!viewR&&<div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}><input style={{...inp,flex:1,minWidth:100}} placeholder="Buscar nombre, email, fecha, #..." value={respSearch} onChange={e=>setRespSearch(e.target.value)}/><button style={bS} onClick={()=>loadResps()}>Actualizar</button></div>
      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>{[["all","Todos"],["pending","Nuevos"],["unpaid","Deben"],["paid","Pagados"]].map(([v,l])=><button key={v} style={tB(respFilter===v)} onClick={()=>setRespFilter(v)}>{l}</button>)}</div>
      {filtResps.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:30}}>Sin resultados</div>}
      {filtResps.map((r,i)=>(<div key={i} style={{...crd,padding:12,cursor:"pointer",borderLeft:"4px solid "+payColor(r)}} onClick={()=>setViewR(r)}><div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}><span style={{fontWeight:800,fontSize:12,color:"#4f46e5"}}>#{r.budgetNumber}</span>{r.isGiftCard&&<span style={{background:"#a855f7",color:"#fff",padding:"1px 5px",borderRadius:4,fontSize:9}}>GIFT</span>}<span style={{fontWeight:600,flex:1,fontSize:12}}>{r.clientName}</span><span style={{fontSize:11,color:"#888"}}>{fmtDate(r.timestamp)}</span></div><div style={{display:"flex",gap:6,marginTop:3,fontSize:11,color:"#888"}}><span style={{fontWeight:700,color:"#333"}}>${(r.total||0).toLocaleString("es-AR")}{r.paymentCurrency?" "+r.paymentCurrency:""}</span>{r.pendingAmount>0&&<span style={{color:"#ef4444",fontWeight:700}}>Debe: ${r.pendingAmount.toLocaleString("es-AR")}</span>}{r.referralCode&&<span style={{color:"#7c3aed"}}>REF</span>}</div></div>))}
    </div>}
    {tab==="responses"&&viewR&&<div><button style={{...bS,marginBottom:10}} onClick={()=>setViewR(null)}>Volver</button><div style={sec}>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}><span style={{fontWeight:800,fontSize:15,color:"#4f46e5"}}>#{viewR.budgetNumber}</span>{viewR.isGiftCard&&<span style={{background:"#a855f7",color:"#fff",padding:"2px 6px",borderRadius:6,fontSize:11}}>GIFT</span>}<span style={{fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:600,background:payColor(viewR)+"20",color:payColor(viewR)}}>{viewR.status||"nuevo"}</span></div>
      <div style={{fontSize:13,marginBottom:12,lineHeight:1.8}}>Cliente: <strong>{viewR.clientName}</strong><br/>Email: {viewR.clientEmail}<br/>Fecha: {fmtDateTime(viewR.timestamp)}<br/>OS: <OsB os={viewR.osFilter||"both"}/>{viewR.giftTo&&<><br/>Para: <strong>{viewR.giftTo}</strong></>}{viewR.referralCode&&<><br/>Ref: <strong>{viewR.referralCode}</strong></>}{viewR.refDiscount>0&&<><br/>Desc ref: <strong style={{color:"#059669"}}>-${viewR.refDiscount.toLocaleString("es-AR")}</strong></>}</div>
      {(viewR.selectedApps||[]).map((a,j)=><div key={j} style={{padding:"5px 0",borderBottom:"1px solid #eee",display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}><span style={{flex:1,fontWeight:600,fontSize:12}}>{a.name}</span>{a.isGift&&<Gift/>}<span style={{fontWeight:700,color:a.isGift?"#16a34a":"#4f46e5",fontSize:12}}>{a.isGift?"$0":"$"+(a.price||0).toLocaleString("es-AR")}</span></div>)}
      {(viewR.customRequests||[]).length>0&&<div style={{marginTop:10,background:"#f5f3ff",borderRadius:6,padding:8,border:"1px solid #c4b5fd",fontSize:12}}>{viewR.customRequests.map((r,i)=><div key={i}><strong>{r.name}</strong>{r.note?" - "+r.note:""}</div>)}</div>}
      <div style={{fontWeight:800,fontSize:16,color:"#4f46e5",margin:"12px 0"}}>Total: ${(viewR.total||0).toLocaleString("es-AR")}</div>

      {/* Payment edit */}
      <div style={{background:"#f0f9ff",borderRadius:8,padding:12,marginBottom:12,border:"1px solid #bae6fd"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Pago</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
          <div><label style={{fontSize:10,color:"#666"}}>Moneda</label><select style={{...inp,width:90}} value={viewR.paymentCurrency||""} onChange={e=>updateResp(viewR,{paymentCurrency:e.target.value})}><option value="">--</option><option value="ARS">ARS</option><option value="USD">USD</option></select></div>
          <div><label style={{fontSize:10,color:"#666"}}>Pendiente $</label><input style={{...inp,width:100}} type="number" value={viewR.pendingAmount||""} onChange={e=>updateResp(viewR,{pendingAmount:Number(e.target.value)||0})}/></div>
          <div><label style={{fontSize:10,color:"#666"}}>Fecha pago</label><input style={{...inp,width:140}} type="datetime-local" value={viewR.paymentDate||""} onChange={e=>updateResp(viewR,{paymentDate:e.target.value})}/></div>
        </div>
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {(!viewR.status||viewR.status==="pending")&&<><button style={bG} onClick={()=>updateResp(viewR,{status:"accepted"})}>Aceptar</button><button style={bD} onClick={()=>updateResp(viewR,{status:"rejected"})}>Rechazar</button></>}
        {viewR.status==="accepted"&&<><button style={{...bP,background:"#1e40af"}} onClick={()=>updateResp(viewR,{status:"installed"})}>Instalado</button><button style={bD} onClick={()=>updateResp(viewR,{status:"rejected"})}>Rechazar</button></>}
        {viewR.status==="installed"&&<button style={bG} onClick={()=>updateResp(viewR,{pendingAmount:0})}>Pagado</button>}
        <button style={bO} onClick={()=>doCopy(genExp(viewR))}>{copied?"OK":"Copiar"}</button><button style={bO} onClick={()=>printText("SS",genExp(viewR))}>Print</button>
      </div>
    </div></div>}

    {tab==="newsletter"&&<div>
      <h3 style={{margin:"0 0 10px",fontSize:15}}>Newsletter ({allEmails.length} emails)</h3>
      <div style={{...sec}}><p style={{fontSize:12,color:"#888",margin:"0 0 10px"}}>Base de emails de clientes. Para +50 contactos recomendamos <a href="https://www.brevo.com" target="_blank" rel="noopener noreferrer" style={{color:"#4f46e5",fontWeight:600}}>Brevo</a> (gratis hasta 300 emails/dia).</p>
        <div style={{maxHeight:150,overflow:"auto",marginBottom:10}}>{allEmails.map((e,i)=><div key={i} style={{fontSize:12,padding:"3px 0",borderBottom:"1px solid #f0f0f0"}}>{e}</div>)}</div>
        <button style={bO} onClick={()=>doCopy(allEmails.join("\n"))}>{copied?"OK":"Copiar emails"}</button>
      </div>
      <div style={sec}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Enviar email masivo</div>
        <label style={{...lbl,marginTop:0}}>Asunto</label><input style={inp} value={nlSubject} onChange={e=>setNlSubject(e.target.value)} placeholder="Nuevos plugins disponibles!"/>
        <label style={lbl}>Mensaje</label><textarea style={{...inp,minHeight:80,resize:"vertical"}} value={nlBody} onChange={e=>setNlBody(e.target.value)} placeholder="Hola! Tenemos novedades..."/>
        <button style={{...bP,marginTop:10}} onClick={()=>{if(!nlSubject.trim()||!nlBody.trim())return;window.open("mailto:?bcc="+allEmails.join(",")+"&subject="+encodeURIComponent(nlSubject)+"&body="+encodeURIComponent(nlBody),"_blank");}} disabled={allEmails.length===0}>Abrir en mail ({allEmails.length} dest.)</button>
        <p style={{fontSize:11,color:"#888",marginTop:6}}>Se abre tu cliente de mail con todos los contactos en BCC (ocultos entre si). Para envios grandes usa Brevo.</p>
      </div>
    </div>}

    {tab==="referrals"&&<div><h3 style={{margin:"0 0 10px",fontSize:15}}>Referidos</h3>
      {refList.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:30}}>Sin referidos</div>}
      {refList.map((r,i)=>(<div key={i} style={{...crd,borderLeft:i===0&&r.uses>1?"4px solid #f59e0b":undefined}}><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>{i===0&&r.uses>1&&<span style={{background:"#fef3c7",color:"#b45309",padding:"1px 5px",borderRadius:4,fontSize:9,fontWeight:700}}>TOP</span>}<span style={{fontWeight:800,color:"#7c3aed",fontSize:12}}>{r.code}</span><span style={{flex:1,fontSize:12}}>{refOwners[r.code]||""}</span><span style={{fontWeight:700,color:"#059669"}}>{r.uses} usos</span></div></div>))}
    </div>}

    {tab==="sorteo"&&<div><h3 style={{margin:"0 0 10px",fontSize:15}}>Sorteo ({allEmails.length} part.)</h3><div style={sec}>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}><span>Ganadores:</span><input type="number" min={1} max={allEmails.length||1} value={sorteoCount} onChange={e=>setSorteoCount(Math.max(1,Number(e.target.value)||1))} style={{...inp,width:60,textAlign:"center",padding:"4px"}}/><button style={bP} onClick={runSorteo} disabled={!allEmails.length}>Sortear</button></div>
      {sorteoResult&&<div style={{background:"#f0fdf4",borderRadius:10,padding:14,border:"2px solid #059669"}}><div style={{fontWeight:800,color:"#059669",marginBottom:8}}>Ganadores</div>{sorteoResult.map((e,i)=>(<div key={i} style={{padding:"8px 10px",background:"#fff",borderRadius:6,marginBottom:6,display:"flex",gap:8,alignItems:"center",border:"1px solid #bbf7d0"}}><span style={{background:"#059669",color:"#fff",width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,flexShrink:0}}>{i+1}</span><span style={{fontSize:13,wordBreak:"break-all"}}>{e}</span></div>))}<button style={{...bO,marginTop:6}} onClick={()=>doCopy(sorteoResult.join("\n"))}>Copiar</button></div>}
    </div></div>}

    {tab==="stats"&&<div><h3 style={{margin:"0 0 10px",fontSize:15}}>Stats</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:14}}>
        {[["Facturado","$"+totalRev.toLocaleString("es-AR"),"#4f46e5"],["Pendiente","$"+totalPending.toLocaleString("es-AR"),"#ef4444"],["Aceptados",""+acc.length,"#059669"],["Totales",""+resps.length,"#f59e0b"]].map(([l,v,c])=>(<div key={l} style={{background:"#fff",borderRadius:8,padding:"12px 8px",border:"1.5px solid #e8e8ee",textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>{l}</div></div>))}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>{[["month","Mensual"],["category","Categoria"],["plugin","Plugin"],["os","OS"]].map(([v,l])=><button key={v} style={tB(statMode===v)} onClick={()=>setStatMode(v)}>{l}</button>)}</div>
      {statMode==="month"&&monthlyData.length>0&&<div style={sec}><ResponsiveContainer width="100%" height={200}><BarChart data={monthlyData}><XAxis dataKey="month" tick={{fontSize:9}}/><YAxis tick={{fontSize:9}}/><Tooltip formatter={v=>"$"+v.toLocaleString("es-AR")}/><Bar dataKey="total" fill="#4f46e5" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>}
      {statMode==="category"&&catData.length>0&&<div style={sec}><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({name,percent})=>name+" "+Math.round(percent*100)+"%"} labelLine={false} style={{fontSize:9}}>{catData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={v=>"$"+v.toLocaleString("es-AR")}/></PieChart></ResponsiveContainer></div>}
      {statMode==="plugin"&&<div style={sec}><ResponsiveContainer width="100%" height={250}><BarChart data={pluginData} layout="vertical"><XAxis type="number" tick={{fontSize:9}}/><YAxis dataKey="name" type="category" width={120} tick={{fontSize:9}}/><Tooltip formatter={(v,n)=>n==="count"?v+" ventas":"$"+v.toLocaleString("es-AR")}/><Bar dataKey="count" fill="#8b5cf6" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div>}
      {statMode==="os"&&osData.length>0&&<div style={sec}><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={osData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({name,percent})=>name+" "+Math.round(percent*100)+"%"} labelLine={false} style={{fontSize:10}}>{osData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={v=>"$"+v.toLocaleString("es-AR")}/></PieChart></ResponsiveContainer></div>}
      {acc.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:20}}>Acepta presupuestos para ver stats</div>}
    </div>}

    {showForm&&<AppForm app={editApp} onSave={a=>{if(editApp)setApps(apps.map(x=>x.id===a.id?a:x));else setApps([...apps,{...a,id:uid()}]);setShowForm(false);setEditApp(null);}} onCancel={()=>{setShowForm(false);setEditApp(null);}}/>}
  </div>);
}

// ====== CLIENT (compact) ======
function ClientPanel({code,onBack}){
  const[cat,setCat]=useState([]);const[promo,setPromo]=useState({every:3,mode:"cheapest"});const[payL,setPayL]=useState([]);const[gPool,setGPool]=useState([]);const[offers,setOffers]=useState([]);const[nBud,setNBud]=useState(1);const[loaded,setLoaded]=useState(false);
  const[search,setSearch]=useState("");const[osF,setOsF]=useState(null);const[macVer,setMacVer]=useState(null);const[isGift,setIsGift]=useState(null);const[giftTo,setGiftTo]=useState("");const[giftFrom,setGiftFrom]=useState("");
  const[sel,setSel]=useState(new Set());const[gSel,setGSel]=useState(new Set());const[selOffers,setSelOffers]=useState(new Set());
  const[cName,setCName]=useState("");const[cEmail,setCEmail]=useState("");const[done,setDone]=useState(false);const[budN,setBudN]=useState("");
  const[customReqs,setCustomReqs]=useState([]);const[showReqForm,setShowReqForm]=useState(false);const[reqName,setReqName]=useState("");const[reqNote,setReqNote]=useState("");
  const[refCode,setRefCode]=useState("");const[myRefCode,setMyRefCode]=useState("");const[catFilter,setCatFilter]=useState("Todos");const[giftSvg,setGiftSvg]=useState(null);

  useEffect(()=>{(async()=>{let data=null;try{const r=await window.storage.get("ss-ses-"+code,true);if(r?.value)data=JSON.parse(r.value);}catch{}
    if(!data){try{const r=await window.storage.get("swcat-session-"+code,true);if(r?.value)data=JSON.parse(r.value);}catch{}}
    if(data){setCat(data.catalog||[]);setPromo(data.promo||{every:3,mode:"cheapest"});setPayL(data.payments||[]);setGPool(data.giftPool||[]);setOffers((data.offers||[]).filter(o=>isOfferActive(o)));setNBud(data.nextBudget||1);}setLoaded(true);})();},[code]);

  const eOs=osF==="mac"?"mac":osF==="windows"?"windows":"all";
  const filt=cat.filter(a=>(a.os===eOs||a.os==="both")&&(a.name.toLowerCase().includes(search.toLowerCase())||(a.category||"").toLowerCase().includes(search.toLowerCase()))&&(catFilter==="Todos"||a.category===catFilter));
  const selApps=cat.filter(a=>sel.has(a.id));let autoGift=new Set(),paid,maxPG=0;
  if(promo.mode==="cheapest"){const mG=Math.floor(selApps.length/(promo.every+1));if(mG>0)[...selApps].sort((a,b)=>a.price-b.price).slice(0,mG).forEach(a=>autoGift.add(a.id));paid=selApps.filter(a=>!autoGift.has(a.id));}else{paid=selApps;maxPG=Math.floor(selApps.length/promo.every);}
  const sub=paid.reduce((s,a)=>s+(a.price||0),0)+offers.filter(o=>selOffers.has(o.id)).reduce((s,o)=>s+(o.price||0),0);
  const refDisc=refCode.trim()?Math.round(sub*0.1):0;const totP=sub-refDisc;

  async function submit(){const y=new Date().getFullYear(),num="PRES-"+y+"-"+String(nBud).padStart(4,"0"),mrc="REF-"+shortCode();setBudN(num);setMyRefCode(mrc);
    const r={sessionCode:code,budgetNumber:num,clientName:cName.trim()||"Anonimo",clientEmail:cEmail.trim(),osFilter:eOs,macVersion:macVer,isGiftCard:isGift===true,giftTo:giftTo.trim(),giftFrom:giftFrom.trim(),referralCode:refCode.trim().toUpperCase()||null,myReferralCode:mrc,refDiscount:refDisc,timestamp:new Date().toISOString(),status:"pending",pendingAmount:0,paymentCurrency:"",selectedApps:selApps.map(a=>({...a,isGift:autoGift.has(a.id)})),selectedOffers:offers.filter(o=>selOffers.has(o.id)),giftSelections:gPool.filter(a=>gSel.has(a.id)),customRequests:customReqs,total:totP};
    try{await window.storage.set("ss-resp-"+code+"-"+uid(),JSON.stringify(r),true);try{const c=await window.storage.get(BCK);await window.storage.set(BCK,JSON.stringify((c?.value?JSON.parse(c.value):nBud)+1));}catch{}
    try{await window.storage.set("ss-used-"+code,"1",true);}catch{}
    if(isGift)setGiftSvg(generateGiftSVG(num,selApps,giftFrom.trim(),giftTo.trim()));setDone(true);}catch{alert("Error");}}

  if(!loaded)return<div style={{padding:40,textAlign:"center",color:"#888"}}>...</div>;

  // Steps: OS > macVer > gift? > catalog > done
  const stepStyle={fontFamily:"'Inter',system-ui,sans-serif",maxWidth:400,margin:"0 auto",padding:"40px 16px",textAlign:"center"};
  const bigBtn=(onClick,label,border)=>(<button onClick={onClick} style={{padding:"22px 28px",borderRadius:14,border:"3px solid "+border,background:"#fff",cursor:"pointer",fontSize:14,fontWeight:700,flex:"1 1 130px",maxWidth:170}}>{label}</button>);

  if(!osF)return(<div style={stepStyle}><button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#999",marginBottom:14}}>Volver</button><div style={{fontSize:15,fontWeight:800,color:"#4f46e5",marginBottom:8}}>SOPORTE SONORO</div><h2 style={{fontSize:17,marginBottom:20}}>Sistema operativo</h2><div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>{bigBtn(()=>setOsF("windows"),"Windows","#dbeafe")}{bigBtn(()=>setOsF("mac"),"macOS","#f3e8ff")}</div></div>);
  if(osF==="mac"&&!macVer)return(<div style={stepStyle}><button onClick={()=>setOsF(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#999",marginBottom:14}}>Cambiar</button><h2 style={{fontSize:17,marginBottom:20}}>Version macOS</h2><div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>{bigBtn(()=>setMacVer("new"),"Monterey+","#d1fae5")}{bigBtn(()=>setMacVer("old"),"Big Sur-","#fef3c7")}</div></div>);
  if(isGift===null)return(<div style={stepStyle}><button onClick={()=>{if(osF==="mac")setMacVer(null);else setOsF(null);}} style={{background:"none",border:"none",cursor:"pointer",color:"#999",marginBottom:14}}>Atras</button><h2 style={{fontSize:17,marginBottom:20}}>Para vos o para regalar?</h2><div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>{bigBtn(()=>setIsGift(false),"Para mi","#d1fae5")}{bigBtn(()=>setIsGift(true),"Regalar","#e9d5ff")}</div></div>);

  if(done){const isWin=eOs==="windows",adUrl=isWin?"https://anydesk.com/es/downloads/thank-you?dv=win_exe":macVer==="new"?"https://anydesk.com/es/downloads/thank-you?dv=mac_dmg":"https://download.anydesk.com/macos/10.12_Sierra/anydesk_v7.0.2.dmg",vidUrl=isWin?null:macVer==="new"?"https://www.youtube.com/watch?v=aeAMm3YdCRI":"https://www.youtube.com/watch?v=qHBgGAWb-jE";
  return(<div style={{fontFamily:"system-ui",maxWidth:480,margin:"0 auto",padding:"20px 14px"}}>
    <div style={{textAlign:"center",marginBottom:14}}><div style={{fontWeight:800,color:"#4f46e5",letterSpacing:1,fontSize:13}}>SOPORTE SONORO</div><h2 style={{margin:"6px 0",fontSize:17}}>{isGift?"Gift Card lista!":"Presupuesto enviado!"}</h2><div style={{fontSize:18,fontWeight:800,color:"#4f46e5"}}>#{budN}</div><p style={{color:"#666",fontSize:13}}>Total: <strong>${totP.toLocaleString("es-AR")}</strong></p></div>
    {isGift&&giftSvg&&<div style={{marginBottom:14}}><div dangerouslySetInnerHTML={{__html:giftSvg}} style={{borderRadius:10,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.2)",marginBottom:8}}/><button style={{...bP,width:"100%",padding:"10px",background:"#7c3aed"}} onClick={()=>{const b=new Blob([giftSvg],{type:"image/svg+xml"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="GiftCard-"+budN+".svg";a.click();URL.revokeObjectURL(u);}}>Descargar Gift Card</button></div>}
    <div style={{background:"#f5f3ff",borderRadius:8,padding:10,marginBottom:12,border:"1px solid #c4b5fd",textAlign:"center"}}><div style={{fontSize:11,color:"#666"}}>Tu codigo de referido (10% off):</div><div style={{fontSize:16,fontWeight:800,color:"#7c3aed",letterSpacing:3}}>{myRefCode}</div></div>
    {payL.length>0&&<div style={{background:"#f0fdf4",borderRadius:10,padding:12,border:"1.5px solid #bbf7d0",marginBottom:12}}><div style={{fontWeight:700,fontSize:13,marginBottom:6}}>Medios de pago</div>{payL.filter(p=>p.alias||p.label).map((pm,i)=>(<div key={i} style={{background:"#fff",borderRadius:6,padding:"6px 8px",marginBottom:4,border:"1px solid #d1fae5",fontSize:12}}><strong style={{color:"#065f46"}}>{pm.label}</strong>{pm.alias&&<span> | Alias: <strong>{pm.alias}</strong></span>}{pm.cbu&&<span> | CBU: {pm.cbu}</span>}</div>))}</div>}
    {!isGift&&<div style={{background:"#eef2ff",borderRadius:10,padding:12,border:"1.5px solid #c7d2fe",marginBottom:12}}><div style={{fontWeight:700,fontSize:13,marginBottom:6,color:"#4f46e5"}}>Prepara tu equipo</div>
      <a href={adUrl} target="_blank" rel="noopener noreferrer" style={{display:"block",padding:"8px",background:"#ef4444",color:"#fff",borderRadius:8,fontWeight:700,textAlign:"center",textDecoration:"none",marginBottom:8,fontSize:13}}>Descargar AnyDesk</a>
      <div style={{background:"#fff",borderRadius:6,padding:10,border:"1px solid #c7d2fe",fontSize:11,lineHeight:1.7}}>{isWin?"1. Instala AnyDesk\n2. Anota tu ID de 9 digitos\n3. Compartilo cuando coordinemos".split("\n").map((l,i)=><div key={i}>{l}</div>):"1. Preferencias > Privacidad\n2. Accesibilidad: agregar AnyDesk\n3. Grabacion pantalla: agregar AnyDesk\n4. Reiniciar AnyDesk".split("\n").map((l,i)=><div key={i}>{l}</div>)}{vidUrl&&<a href={vidUrl} target="_blank" rel="noopener noreferrer" style={{color:"#4f46e5",fontWeight:600,display:"block",marginTop:4}}>Video tutorial</a>}</div>
    </div>}
    <div style={{textAlign:"center"}}><button style={bO} onClick={onBack}>Volver</button></div></div>);}

  const availCats=[...new Set(cat.filter(a=>a.os===eOs||a.os==="both").map(a=>a.category||"Otro"))];
  return(<div style={{fontFamily:"system-ui",maxWidth:680,margin:"0 auto",padding:"10px 10px 80px"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><button onClick={()=>setIsGift(null)} style={{background:"none",border:"none",fontSize:14,cursor:"pointer",color:"#999"}}>{"<"}</button><div style={{fontSize:14,fontWeight:800,flex:1,color:"#4f46e5"}}>SOPORTE SONORO</div><OsB os={eOs}/>{isGift&&<span style={{background:"#a855f7",color:"#fff",padding:"1px 6px",borderRadius:4,fontSize:10,fontWeight:700}}>GIFT</span>}</div>
    <div style={{background:"#fffbeb",padding:"6px 10px",borderRadius:6,fontSize:11,marginBottom:10,color:"#92400e",border:"1px solid #fde68a"}}><strong>Promo:</strong> cada {promo.mode==="cheapest"?promo.every+1:promo.every} apps, {promo.mode==="cheapest"?"la mas barata gratis":"elegis 1 de regalo"}</div>

    {offers.length>0&&<div style={{marginBottom:12}}>{offers.map(o=>{const isSel=selOffers.has(o.id),disc=o.originalPrice>0&&o.price>0?Math.round((1-o.price/o.originalPrice)*100):0;return(<div key={o.id} style={{...crd,borderColor:isSel?"#ef4444":"#fca5a5",background:isSel?"#fef2f2":"#fff",border:isSel?"2px solid #ef4444":"2px solid #fca5a5"}} onClick={()=>setSelOffers(p=>{const n=new Set(p);n.has(o.id)?n.delete(o.id):n.add(o.id);return n;})}>
      <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",cursor:"pointer"}}><input type="checkbox" checked={isSel} onChange={()=>{}}/>{o.isSuper&&<span style={{background:"#ef4444",color:"#fff",padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:800}}>SUPER</span>}<span style={{fontWeight:800,flex:1,color:"#ef4444",fontSize:13}}>{o.name}</span><span style={{fontWeight:800,color:"#ef4444"}}>${(o.price||0).toLocaleString("es-AR")}</span>{disc>0&&<span style={{background:"#dcfce7",color:"#166534",padding:"1px 5px",borderRadius:4,fontSize:10,fontWeight:800}}>-{disc}%</span>}</div>
      {o.endDate&&<div style={{marginLeft:22,marginTop:2}}><Countdown endDate={o.endDate}/></div>}
    </div>);})}</div>}

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}><div><label style={{fontSize:10,color:"#666"}}>Nombre *</label><input style={inp} value={cName} onChange={e=>setCName(e.target.value)}/></div><div><label style={{fontSize:10,color:"#666"}}>Email *</label><input style={inp} type="email" value={cEmail} onChange={e=>setCEmail(e.target.value)}/></div></div>
    {isGift&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}><div><label style={{fontSize:10,color:"#666"}}>De</label><input style={inp} value={giftFrom} onChange={e=>setGiftFrom(e.target.value)}/></div><div><label style={{fontSize:10,color:"#666"}}>Para</label><input style={inp} value={giftTo} onChange={e=>setGiftTo(e.target.value)}/></div></div>}
    <div style={{marginBottom:8}}><label style={{fontSize:10,color:"#666"}}>Codigo referido (10% off)</label><input style={{...inp,maxWidth:180}} value={refCode} onChange={e=>setRefCode(e.target.value)} placeholder="REF-XXXXXX"/></div>

    <div style={{display:"flex",gap:3,marginBottom:6,flexWrap:"wrap"}}>{["Todos",...availCats].filter((v,i,a)=>a.indexOf(v)===i).map(c=><button key={c} style={{...tB(catFilter===c),fontSize:9,padding:"4px 7px"}} onClick={()=>setCatFilter(c)}>{c}</button>)}</div>
    <input style={{...inp,marginBottom:8}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>

    {filt.map(a=>{const is=sel.has(a.id),ig=autoGift.has(a.id);return(<div key={a.id} style={ig?crdG:is?crdSel:crd}><div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}><input type="checkbox" checked={is} onChange={()=>setSel(p=>{const n=new Set(p);n.has(a.id)?n.delete(a.id):n.add(a.id);return n;})} style={{width:15,height:15}}/><span style={{fontWeight:700,fontSize:12,flex:1,cursor:"pointer"}} onClick={()=>setSel(p=>{const n=new Set(p);n.has(a.id)?n.delete(a.id):n.add(a.id);return n;})}>{a.name}</span>{ig&&<Gift/>}<OsB os={a.os}/><span style={{fontSize:10,color:"#777",background:"#f3f4f6",padding:"1px 4px",borderRadius:3}}>{a.category}</span><span style={{fontWeight:700,color:ig?"#16a34a":"#4f46e5",fontSize:12,textDecoration:ig?"line-through":"none"}}>${(a.price||0).toLocaleString("es-AR")}</span></div></div>);})}
    <button style={{...bO,width:"100%",padding:"7px",fontSize:11,borderStyle:"dashed",marginTop:8,marginBottom:6}} onClick={()=>setShowReqForm(true)}>+ Pedir algo que no esta</button>
    {showReqForm&&<div style={{...sec,marginBottom:8}}><input style={inp} value={reqName} onChange={e=>setReqName(e.target.value)} placeholder="Plugin..." autoFocus/><input style={{...inp,marginTop:6}} value={reqNote} onChange={e=>setReqNote(e.target.value)} placeholder="Nota"/><div style={{display:"flex",gap:6,marginTop:8}}><button style={bG} onClick={()=>{if(reqName.trim()){setCustomReqs(p=>[...p,{id:uid(),name:reqName.trim(),note:reqNote.trim()}]);setReqName("");setReqNote("");setShowReqForm(false);}}}>OK</button><button style={bO} onClick={()=>{setShowReqForm(false);setReqName("");setReqNote("");}}>X</button></div></div>}
    {customReqs.map(r=>(<div key={r.id} style={{...crd,borderStyle:"dashed",borderColor:"#c4b5fd",display:"flex",gap:5,alignItems:"center"}}><span style={{flex:1,fontSize:12}}><strong>{r.name}</strong>{r.note?" - "+r.note:""}</span><button onClick={()=>setCustomReqs(p=>p.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",color:"#ccc",cursor:"pointer"}}>x</button></div>))}

    {(sel.size>0||selOffers.size>0||customReqs.length>0)&&<div style={{position:"sticky",bottom:0,background:"#f0f0ff",borderRadius:10,padding:"10px 12px",marginTop:10,borderTop:"2px solid #4f46e5"}}>
      {refDisc>0&&<div style={{fontSize:12,color:"#059669",fontWeight:600,marginBottom:4}}>Referido -10%: -${refDisc.toLocaleString("es-AR")}</div>}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontWeight:700,fontSize:14,flex:1}}>Total: ${totP.toLocaleString("es-AR")}</span></div>
      <button style={{...bG,width:"100%",padding:"10px",fontSize:13,background:isGift?"#7c3aed":"#059669"}} onClick={submit} disabled={!cName.trim()||!cEmail.trim()}>{isGift?"Gift Card":"Enviar"}</button>
      {(!cName.trim()||!cEmail.trim())&&<div style={{fontSize:10,color:"#ef4444",marginTop:3,textAlign:"center"}}>Completa nombre y email</div>}
    </div>}
  </div>);
}

// ====== FORMS ======
function AppForm({app,onSave,onCancel}){
  const[n,sN]=useState(app?.name||"");const[os,sO]=useState(app?.os||"both");const[pr,sP]=useState(app?.price||0);const[cat,sC]=useState(app?.category||"");const[ge,sGE]=useState(app?.giftEligible||false);const[lks,sL]=useState(app?.links?.length?app.links:[{type:"magnet",url:""}]);
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3,padding:10}} onClick={onCancel}><div style={{background:"#fff",borderRadius:14,padding:"18px 14px",width:"100%",maxWidth:460,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
    <label style={{...lbl,marginTop:0}}>Nombre *</label><input style={inp} value={n} onChange={e=>sN(e.target.value)} autoFocus/>
    <label style={lbl}>Categoria</label><input style={inp} value={cat} onChange={e=>sC(e.target.value)}/>
    <label style={lbl}>OS</label><div style={{display:"flex",gap:6}}>{[["both","Ambos"],["windows","Win"],["mac","Mac"]].map(([v,l])=><button key={v} onClick={()=>sO(v)} style={{padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:os===v?"2px solid #4f46e5":"2px solid #e2e2e8",background:os===v?"#eef2ff":"#fff"}}>{l}</button>)}</div>
    <label style={lbl}>Precio</label><input style={inp} type="number" value={pr||""} onChange={e=>sP(e.target.value)}/>
    <label style={{...lbl,display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>sGE(!ge)}><input type="checkbox" checked={ge} onChange={()=>{}}/><span>Elegible regalo</span></label>
    <label style={lbl}>Links</label>{lks.map((l,i)=><div key={i} style={{display:"flex",gap:4,marginBottom:4}}><select value={l.type} onChange={e=>sL(lks.map((x,j)=>j===i?{...x,type:e.target.value}:x))} style={{...inp,width:70,fontSize:11}}><option value="magnet">Mag</option><option value="drive">Drv</option><option value="direct">Dir</option></select><input style={{...inp,flex:1}} value={l.url} onChange={e=>sL(lks.map((x,j)=>j===i?{...x,url:e.target.value}:x))}/></div>)}
    <button onClick={()=>sL([...lks,{type:"magnet",url:""}])} style={{background:"none",border:"none",color:"#4f46e5",cursor:"pointer",fontSize:11}}>+ Link</button>
    <div style={{display:"flex",gap:6,marginTop:16,justifyContent:"flex-end"}}><button onClick={onCancel} style={{padding:"7px 14px",borderRadius:6,border:"1.5px solid #ddd",background:"#fff",cursor:"pointer"}}>X</button><button onClick={()=>{if(!n.trim())return;onSave({id:app?.id,name:n.trim(),os,price:Number(pr)||0,category:cat.trim(),giftEligible:ge,links:lks.filter(l=>l.url.trim())});}} style={bP}>OK</button></div>
  </div></div>);
}
function OfferForm({offer,apps,onSave,onCancel}){
  const[n,sN]=useState(offer?.name||"");const[desc,sD]=useState(offer?.description||"");const[pr,sP]=useState(offer?.price||0);const[oP,sOP]=useState(offer?.originalPrice||0);
  const[pIds,sPIds]=useState(new Set((offer?.plugins||[]).map(p=>p.id)));const[isSuper,setIsSuper]=useState(offer?.isSuper||false);
  const[schDays,setSchDays]=useState(offer?.scheduleDays||[]);const[eom,setEom]=useState(offer?.endOfMonth||false);const[startD,setStartD]=useState(offer?.startDate||"");const[endD,setEndD]=useState(offer?.endDate||"");
  const dayN=["Do","Lu","Ma","Mi","Ju","Vi","Sa"];
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3,padding:10}} onClick={onCancel}><div style={{background:"#fff",borderRadius:14,padding:"18px 14px",width:"100%",maxWidth:500,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
    <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>Oferta</div>
    <label style={{...lbl,marginTop:0}}>Nombre *</label><input style={inp} value={n} onChange={e=>sN(e.target.value)} autoFocus/>
    <label style={lbl}>Descripcion</label><textarea style={{...inp,minHeight:40,resize:"vertical"}} value={desc} onChange={e=>sD(e.target.value)}/>
    <div style={{display:"flex",gap:8}}><div style={{flex:1}}><label style={lbl}>Precio</label><input style={inp} type="number" value={pr||""} onChange={e=>sP(e.target.value)}/></div><div style={{flex:1}}><label style={lbl}>Original</label><input style={inp} type="number" value={oP||""} onChange={e=>sOP(e.target.value)}/></div></div>
    <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginTop:10,padding:"6px 10px",borderRadius:6,background:isSuper?"#fef2f2":"#fafafa",border:isSuper?"2px solid #ef4444":"2px solid #eee"}} onClick={()=>setIsSuper(!isSuper)}><input type="checkbox" checked={isSuper} onChange={()=>{}}/><span style={{fontWeight:600,fontSize:12,color:isSuper?"#ef4444":"#888"}}>SUPER OFERTA</span></label>
    <div style={{background:"#f8fafc",borderRadius:8,padding:10,marginTop:10,border:"1px solid #e2e2e8"}}>
      <div style={{display:"flex",gap:3,marginBottom:8,flexWrap:"wrap"}}>{dayN.map((d,i)=>(<button key={i} onClick={()=>setSchDays(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])} style={{padding:"3px 7px",borderRadius:4,fontSize:10,fontWeight:600,cursor:"pointer",border:schDays.includes(i)?"2px solid #4f46e5":"2px solid #eee",background:schDays.includes(i)?"#eef2ff":"#fff"}}>{d}</button>))}</div>
      <label style={{display:"flex",gap:6,cursor:"pointer",fontSize:11,marginBottom:8}} onClick={()=>setEom(!eom)}><input type="checkbox" checked={eom} onChange={()=>{}}/><span>Fin de mes</span></label>
      <div style={{display:"flex",gap:6}}><div style={{flex:1}}><label style={{fontSize:10,color:"#666"}}>Desde</label><input style={inp} type="date" value={startD} onChange={e=>setStartD(e.target.value)}/></div><div style={{flex:1}}><label style={{fontSize:10,color:"#666"}}>Hasta</label><input style={inp} type="date" value={endD} onChange={e=>setEndD(e.target.value)}/></div></div>
    </div>
    <label style={{...lbl,marginTop:12}}>Plugins ({pIds.size})</label>
    <div style={{maxHeight:140,overflow:"auto",border:"1px solid #eee",borderRadius:6,padding:6}}>{apps.map(a=><label key={a.id} style={{display:"flex",gap:5,padding:"2px 0",cursor:"pointer",fontSize:11}}><input type="checkbox" checked={pIds.has(a.id)} onChange={()=>sPIds(p=>{const n=new Set(p);n.has(a.id)?n.delete(a.id):n.add(a.id);return n;})}/><span style={{flex:1}}>{a.name}</span><span style={{color:"#888"}}>${(a.price||0).toLocaleString("es-AR")}</span></label>)}</div>
    <div style={{display:"flex",gap:6,marginTop:14}}><button onClick={onCancel} style={{padding:"7px 14px",borderRadius:6,border:"1.5px solid #ddd",background:"#fff",cursor:"pointer"}}>X</button><button onClick={()=>{if(!n.trim())return;onSave({id:offer?.id,name:n.trim(),description:desc.trim(),price:Number(pr)||0,originalPrice:Number(oP)||0,plugins:apps.filter(a=>pIds.has(a.id)),active:offer?.active??true,isSuper,scheduleDays:schDays,endOfMonth:eom,startDate:startD||null,endDate:endD||null});}} style={bP}>OK</button></div>
  </div></div>);
}
