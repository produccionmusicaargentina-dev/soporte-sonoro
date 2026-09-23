import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CK="ss-catalog-v2";const PK="ss-promo-v1";const PYK="ss-payments-v1";const BCK="ss-budget-ctr";const ADK="ss-admin-cred";const OFK="ss-offers-v2";const RFK="ss-referrals-v1";
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function shortCode(){return uid().toUpperCase().slice(0,6);}
function isOfferActive(o){if(!o.active)return false;const now=new Date();const today=now.getDay();const dom=now.getDate();const dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();if(o.startDate&&new Date(o.startDate)>now)return false;if(o.endDate&&new Date(o.endDate)<now)return false;if(o.scheduleDays&&o.scheduleDays.length>0&&!o.scheduleDays.includes(today))return false;if(o.endOfMonth&&dom<dim-4)return false;return true;}
async function hashPw(pw){const enc=new TextEncoder().encode(pw+"soporte_sonoro_salt_2026");const buf=await crypto.subtle.digest("SHA-256",enc);return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");}
function copyText(t){try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).catch(()=>fbCopy(t));}else{fbCopy(t);}}catch{fbCopy(t);}}
function fbCopy(t){const ta=document.createElement("textarea");ta.value=t;ta.style.cssText="position:fixed;left:-9999px";document.body.appendChild(ta);ta.select();try{document.execCommand("copy");}catch{}document.body.removeChild(ta);}
function printText(title,text){const w=window.open("","_blank","width=800,height=600");if(!w)return;w.document.write("<!DOCTYPE html><html><head><title>"+title+"</title><style>body{font-family:'Courier New',monospace;font-size:13px;padding:30px;white-space:pre-wrap;line-height:1.6}</style></head><body>"+text.replace(/</g,"&lt;")+"</body></html>");w.document.close();setTimeout(()=>w.print(),300);}
function Countdown({endDate}){const[left,setLeft]=useState("");useEffect(()=>{const iv=setInterval(()=>{const diff=new Date(endDate)-new Date();if(diff<=0){setLeft("Finalizada");clearInterval(iv);return;}const d=Math.floor(diff/864e5);const h=Math.floor((diff%864e5)/36e5);const m=Math.floor((diff%36e5)/6e4);setLeft((d>0?d+"d ":"")+(h>0?h+"h ":"")+m+"m");},1e3);return()=>clearInterval(iv);},[endDate]);return<span style={{color:"#ef4444",fontWeight:700,fontSize:12}}>{left}</span>;}

function generateGiftSVG(code,items,from,to){
  const itemsText=items.slice(0,5).map(a=>a.name).join(", ")+(items.length>5?" +"+( items.length-5)+" mas":"");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" style="max-width:100%;height:auto">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#312e81"/></linearGradient></defs>
<rect width="800" height="400" rx="20" fill="url(#bg)"/>
<rect x="16" y="16" width="768" height="368" rx="14" fill="none" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="8 4"/>
<text x="400" y="55" text-anchor="middle" fill="#c7d2fe" font-family="Arial" font-size="13" letter-spacing="4">SOPORTE SONORO</text>
<text x="400" y="100" text-anchor="middle" fill="#fff" font-family="Arial" font-size="30" font-weight="bold">GIFT CARD</text>
<text x="400" y="130" text-anchor="middle" fill="#a5b4fc" font-family="Arial" font-size="14">Vale por instalaciones y optimizaciones de audio</text>
<rect x="280" y="148" width="240" height="40" rx="10" fill="#4f46e5"/>
<text x="400" y="175" text-anchor="middle" fill="#fff" font-family="monospace" font-size="22" font-weight="bold">${code}</text>
<text x="400" y="215" text-anchor="middle" fill="#c7d2fe" font-family="Arial" font-size="12">${itemsText}</text>
${from?`<text x="400" y="260" text-anchor="middle" fill="#a5b4fc" font-family="Arial" font-size="14">De: ${from}${to?" | Para: "+to:""}</text>`:`<text x="400" y="260" text-anchor="middle" fill="#a5b4fc" font-family="Arial" font-size="14">${to?"Para: "+to:""}</text>`}
<line x1="80" y1="290" x2="720" y2="290" stroke="#4338ca" stroke-width="1"/>
<text x="400" y="320" text-anchor="middle" fill="#818cf8" font-family="Arial" font-size="12">Para coordinar tu instalacion contacta a:</text>
<text x="400" y="345" text-anchor="middle" fill="#e0e7ff" font-family="Arial" font-size="14" font-weight="bold">produccionmusicaargentina@gmail.com</text>
<text x="400" y="375" text-anchor="middle" fill="#6366f1" font-family="Arial" font-size="10">Presenta este codigo al contactarnos</text>
</svg>`;
}

const defaultCatalog=[
  {id:"p001",name:"u-he Diva",os:"both",price:17500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:DEE0B91B34B251E11297F4A4441C752ED4035543"}]},
  {id:"p002",name:"Arturia V Collection X",os:"windows",price:22500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:514ED8096EA63DC285B747095D9CAC75C1168E72"}]},
  {id:"p003",name:"Arturia V Collection X",os:"mac",price:37500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:C5C60BFCF67E60557DD59C7A4A9CFE7277F079C7"}]},
  {id:"p004",name:"u-he Hive 2",os:"windows",price:17500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:5B4E3D294C19B5F015E772CDC74CD7B0055B5BCF"}]},
  {id:"p005",name:"u-he Hive 2",os:"mac",price:17500,category:"Synth",giftEligible:false,links:[{type:"drive",url:"https://drive.google.com/file/d/1J5N1rJaKyCbWHOGeRwnSF9eA7gBYMnaq/view"}]},
  {id:"p006",name:"Waves Bundle",os:"mac",price:27500,category:"FX / Bundle",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:70E723ECAEFCEC2F11B88F36639687017E542F57"}]},
  {id:"p007",name:"Fabfilter Bundle",os:"mac",price:19500,category:"FX / Bundle",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:495071ED878483DE33B19C496E2BD60E68482CAA"}]},
  {id:"p008",name:"Voxengo Span Plus",os:"mac",price:17500,category:"FX",giftEligible:false,links:[{type:"drive",url:"https://drive.google.com/file/d/1PaexgFnyh0zepJ0rLgvXVdBLJ4zDWxcr/view"}]},
  {id:"p009",name:"Valhalla Bundle",os:"mac",price:17500,category:"FX / Bundle",giftEligible:false,links:[{type:"drive",url:"https://drive.google.com/file/d/1UZJPEXAhUobzCVb_mpvYv3dKqDWpq3_5/view"}]},
  {id:"p010",name:"Synapse Audio Legend",os:"mac",price:17500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:15C981D17FBA4BF10B141411CE73E8F0EAF5D85A"}]},
  {id:"p011",name:"Soothe2",os:"mac",price:17500,category:"FX",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:63E3342C5A69A6D934BC4FBEA5142FE3CB787636"}]},
  {id:"p012",name:"SubBoomBass 2",os:"mac",price:17500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:0D7177DA1473E5541A1727BE1E535791F378B4E8"}]},
  {id:"p013",name:"Serum",os:"mac",price:17500,category:"Synth",giftEligible:false,links:[{type:"drive",url:"https://drive.google.com/file/d/18Dr6B80sZ8boGY_qsj3M1hhO_qkC05bd/view"}]},
  {id:"p014",name:"Kickstart 2",os:"both",price:17500,category:"FX",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:F9E740D5FEEDB075F7AAAAAB036CA1EE1816B1EE"}]},
  {id:"p015",name:"Synapse Audio Obsession",os:"mac",price:19500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:ad38267d53b51f3bb47a5b4a8f64605bd0ee06ef"}]},
  {id:"p016",name:"Dada Life Bundle",os:"mac",price:19500,category:"FX / Bundle",giftEligible:false,links:[{type:"drive",url:"https://drive.google.com/file/d/1EXLlMgGLZHlG8viOUh5IEeKqWV5qccep/view"}]},
  {id:"p017",name:"3 Pack Librerias",os:"both",price:17500,category:"Librerias",giftEligible:false,links:[]},
  {id:"p018",name:"5 Pack Librerias",os:"both",price:22500,category:"Librerias",giftEligible:false,links:[]},
  {id:"p019",name:"10 Pack Librerias",os:"both",price:37500,category:"Librerias",giftEligible:false,links:[]},
  {id:"p020",name:"Ableton Live 12 Suite",os:"windows",price:27500,category:"DAW",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:5EA7A6F5C5D72BF0E56EBC69240F649A299295B0"}]},
  {id:"p021",name:"Fabfilter Bundle",os:"windows",price:19500,category:"FX / Bundle",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:931949E21108CC4481853D8D00BA5511AF818651"}]},
  {id:"p022",name:"DS Tantra 2",os:"windows",price:17500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:3F80C339936CEE2EE51AD8A23AC6986CC1A8198A"}]},
  {id:"p023",name:"Soundtheory Gullfoss",os:"mac",price:17500,category:"FX",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:A9212B20A2EA53DA64C0D652A64EE988D2CD3990"}]},
  {id:"p024",name:"Kazrog KClip 3",os:"both",price:17500,category:"FX",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:37912C46591D0266117E9081DDCF8124074E7315"}]},
  {id:"p025",name:"u-he Repro 1/5",os:"both",price:17500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:CA31A8568791FBAE7760A9F2634DDB2948F895A9"}]},
  {id:"p026",name:"Arturia FX Collection 5",os:"windows",price:22500,category:"FX / Bundle",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:BB7BF05630A4E2643FAA26F9496B0F8531112064"}]},
  {id:"p027",name:"Omnisphere 3",os:"windows",price:32500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:BB7BF05630A4E2643FAA26F9496B0F8531112064"}]},
  {id:"p028",name:"Dune 3",os:"windows",price:17500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:13D9A41A3842FE445D3BE88F3D7F9656A2C28010"}]},
  {id:"p029",name:"Waves Bundle",os:"windows",price:27500,category:"FX / Bundle",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:2835CF936AF330E14E25B849EE3532A7EC86F826"}]},
  {id:"p030",name:"Spire",os:"windows",price:19500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:2DC09E9F492B95D3EDBBD093B5F5EBC484376966"}]},
  {id:"p031",name:"Swivel Audio The Sauce",os:"windows",price:19500,category:"FX",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:6F75E20ED4E5A2D9FE5B6841C758FDB96E73C326"}]},
  {id:"p032",name:"Nexus 5",os:"windows",price:27500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:8DA21153AFCCB3DAD8FD6CC24AB392E62B1F7048"}]},
  {id:"p033",name:"ShaperBox 3",os:"both",price:17500,category:"FX",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:33A92992BEC22C62CE019834B0CD64044D0FEF09"}]},
  {id:"p034",name:"Trackspacer",os:"mac",price:17500,category:"FX",giftEligible:false,links:[{type:"drive",url:"https://drive.google.com/file/d/1JAzBsIZXhMdkW8kXDBdUj1PUB4uKk8J6/view"}]},
  {id:"p035",name:"God Particle",os:"mac",price:17500,category:"FX",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:3757114FD31D6BA02CD1C5479D18AE312FA2935C"}]},
  {id:"p036",name:"Brainworx Bundle",os:"mac",price:22500,category:"FX / Bundle",giftEligible:false,links:[{type:"direct",url:"http://mediafire.com/file/mdnoc7hfluqcpaz/Brainworx.dmg/file"}]},
  {id:"p037",name:"Roland RE-201",os:"windows",price:17500,category:"FX",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:B6953B8EC2676C70C70A021634B7A60B91162EF0"}]},
  {id:"p038",name:"Soundtoys",os:"windows",price:17500,category:"FX / Bundle",giftEligible:false,links:[{type:"drive",url:"https://drive.google.com/file/d/12x1TD9en5po9WLO--N3l08LWdiUewdu6/view"}]},
  {id:"p039",name:"Trilian",os:"both",price:27500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:377DC46474B9DB407F49E8050946B1CA3EB8775D"}]},
  {id:"p040",name:"MiniMeters",os:"both",price:17500,category:"Utility",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:228FE7E1CC5B674A52620DFDD84A996DBBAE6BF9"}]},
  {id:"p041",name:"Legend HZ",os:"windows",price:19500,category:"Synth",giftEligible:false,links:[{type:"magnet",url:"magnet:?xt=urn:btih:BDF6F6B4D841C041595A9799B0E0BAB68FC2EC2E"}]},
  {id:"s001",name:"Optimizacion del sistema",os:"both",price:32500,category:"Servicio",giftEligible:false,links:[]},
  {id:"s002",name:"Optimizacion + Limpieza",os:"both",price:47500,category:"Servicio",giftEligible:false,links:[]},
];

const OsB=({os})=>{const m={windows:{l:"Windows",bg:"#dbeafe",c:"#1e40af"},mac:{l:"macOS",bg:"#f3e8ff",c:"#7c3aed"},both:{l:"Win+Mac",bg:"#d1fae5",c:"#065f46"}};const s=m[os]||m.both;return<span style={{background:s.bg,color:s.c,padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:600}}>{s.l}</span>;};
const Gift=()=><span style={{background:"#fef3c7",color:"#b45309",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700}}>REGALO</span>;
const GiftE=()=><span style={{background:"#fdf4ff",color:"#a21caf",padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:700}}>Elegible</span>;
const StB=({status})=>{const m={pending:{l:"Pendiente",bg:"#fef3c7",c:"#92400e"},accepted:{l:"Aceptado",bg:"#d1fae5",c:"#065f46"},rejected:{l:"Rechazado",bg:"#fee2e2",c:"#991b1b"},installed:{l:"Instalado",bg:"#dbeafe",c:"#1e40af"}};const s=m[status]||m.pending;return<span style={{background:s.bg,color:s.c,padding:"3px 10px",borderRadius:6,fontSize:12,fontWeight:700}}>{s.l}</span>;};
const COLORS=["#4f46e5","#059669","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#84cc16"];
const inp={padding:"9px 14px",borderRadius:8,border:"1.5px solid #ddd",fontSize:14,outline:"none",width:"100%",boxSizing:"border-box",background:"#fafafa"};
const bP={padding:"9px 20px",borderRadius:8,border:"none",background:"#4f46e5",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer"};
const bG={...bP,background:"#059669"};const bD={...bP,background:"#ef4444"};
const bO={...bP,background:"transparent",color:"#4f46e5",border:"1.5px solid #4f46e5"};const bS={...bO,padding:"4px 12px",fontSize:12};
const crd={background:"#fff",border:"1.5px solid #e8e8ee",borderRadius:12,padding:"14px 16px",marginBottom:10};
const crdSel={...crd,borderColor:"#4f46e5",boxShadow:"0 0 0 2px rgba(79,70,229,.12)"};const crdG={...crd,borderColor:"#f59e0b",background:"#fffdf5"};
const lbl={fontSize:12,color:"#666",display:"block",marginBottom:4,marginTop:14,fontWeight:600};
const tB=(a)=>({padding:"7px 12px",borderRadius:8,border:"2px solid",cursor:"pointer",fontWeight:600,fontSize:11,borderColor:a?"#4f46e5":"#e2e2e8",background:a?"#4f46e5":"#fff",color:a?"#fff":"#555",whiteSpace:"nowrap"});
const sec={background:"#f8fafc",borderRadius:12,padding:"20px 18px",border:"1.5px solid #e2e2e8",marginBottom:16};

// ====== MAIN ======
export default function App(){
  const[mode,setMode]=useState(null);const[sesCode,setSesCode]=useState("");const[inCode,setInCode]=useState("");const[err,setErr]=useState("");const[trackNum,setTrackNum]=useState("");const[trackResult,setTrackResult]=useState(null);

  // Admin via hash: soportesonoro.netlify.app/#admin
  useEffect(()=>{if(window.location.hash==="#admin")setMode("login");const h=()=>{if(window.location.hash==="#admin")setMode("login");};window.addEventListener("hashchange",h);return()=>window.removeEventListener("hashchange",h);},[]);

  async function join(){const c=inCode.trim().toUpperCase();if(!c){setErr("Ingresa un codigo");return;}
    try{let found=false;try{const r=await window.storage.get("ss-ses-"+c,true);if(r&&r.value)found=true;}catch(e){}
    if(!found){try{const r=await window.storage.get("swcat-session-"+c,true);if(r&&r.value)found=true;}catch(e){}}
    if(!found){setErr("Codigo no encontrado");return;}setSesCode(c);setMode("client");}catch(e){setErr("Error");}}

  async function trackBudget(){if(!trackNum.trim()){setTrackResult({err:"Ingresa tu numero"});return;}
    try{const ks=await window.storage.list("ss-resp-",true);for(const k of(ks?.keys||[])){try{const r=await window.storage.get(k,true);if(r?.value){const d=JSON.parse(r.value);if(d.budgetNumber===trackNum.trim().toUpperCase()){setTrackResult(d);return;}}}catch{}}setTrackResult({err:"No encontrado"});}catch{setTrackResult({err:"Error"});}}

  // Landing: NO admin button visible
  if(!mode)return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:480,margin:"0 auto",padding:"40px 20px",textAlign:"center"}}>
    <div style={{fontSize:20,fontWeight:800,letterSpacing:2,color:"#4f46e5",marginBottom:4}}>SOPORTE SONORO</div>
    <p style={{color:"#888",fontSize:14,marginBottom:28}}>Instalaciones, optimizaciones y software de audio</p>
    <p style={{fontSize:14,color:"#666",marginBottom:10,fontWeight:600}}>Codigo de presupuesto</p>
    <div style={{display:"flex",gap:8,marginBottom:20}}><input style={{...inp,flex:1,textAlign:"center",fontSize:18,letterSpacing:4,fontWeight:700,textTransform:"uppercase"}} value={inCode} onChange={e=>{setInCode(e.target.value);setErr("");}} placeholder="ABC123" maxLength={8} onKeyDown={e=>e.key==="Enter"&&join()}/><button style={bG} onClick={join}>Entrar</button></div>
    {err&&<p style={{color:"#ef4444",fontSize:13,marginTop:-12,marginBottom:12}}>{err}</p>}
    <div style={{borderTop:"1px solid #eee",paddingTop:16}}>
      <p style={{fontSize:13,color:"#888",marginBottom:8}}>Consultar estado de presupuesto</p>
      <div style={{display:"flex",gap:8}}><input style={{...inp,flex:1,textAlign:"center",fontSize:13,textTransform:"uppercase"}} value={trackNum} onChange={e=>{setTrackNum(e.target.value);setTrackResult(null);}} placeholder="PRES-2026-0001" onKeyDown={e=>e.key==="Enter"&&trackBudget()}/><button style={bS} onClick={trackBudget}>Buscar</button></div>
      {trackResult&&(trackResult.err?<p style={{color:"#ef4444",fontSize:13,marginTop:8}}>{trackResult.err}</p>:
      <div style={{...crd,textAlign:"left",marginTop:10}}><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><span style={{fontWeight:800,color:"#4f46e5"}}>#{trackResult.budgetNumber}</span><StB status={trackResult.status||"pending"}/></div><div style={{fontSize:13,color:"#666",marginTop:6}}>Total: <strong>${(trackResult.total||0).toLocaleString("es-AR")}</strong></div>{trackResult.status==="accepted"&&<div style={{fontSize:13,color:"#059669",marginTop:4,fontWeight:600}}>Aceptado! Te contactamos pronto.</div>}{trackResult.status==="installed"&&<div style={{fontSize:13,color:"#1e40af",marginTop:4,fontWeight:600}}>Instalacion completada</div>}</div>)}
    </div>
  </div>);
  if(mode==="login")return<AdminLogin onAuth={()=>setMode("admin")} onBack={()=>{setMode(null);window.location.hash="";}}/>;
  if(mode==="admin")return<AdminPanel onBack={()=>{setMode(null);window.location.hash="";}}/>;
  if(mode==="client")return<ClientPanel code={sesCode} onBack={()=>{setMode(null);setSesCode("");setInCode("");}}/>;
}

// ====== LOGIN ======
function AdminLogin({onAuth,onBack}){
  const[user,setUser]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");const[isSetup,setIsSetup]=useState(null);const[pw2,setPw2]=useState("");
  useEffect(()=>{(async()=>{try{const r=await window.storage.get(ADK);setIsSetup(!!r?.value);}catch{setIsSetup(false);}})();},[]);
  async function handleSetup(){if(!user.trim()||pw.length<6){setErr("Min 6 caracteres");return;}if(pw!==pw2){setErr("No coinciden");return;}const h=await hashPw(pw);try{await window.storage.set(ADK,JSON.stringify({user:user.trim(),hash:h}));onAuth();}catch{setErr("Error");}}
  async function handleLogin(){try{const r=await window.storage.get(ADK);if(!r?.value){setErr("Sin cuenta");return;}const cred=JSON.parse(r.value);const h=await hashPw(pw);if(cred.user===user.trim()&&cred.hash===h)onAuth();else setErr("Datos incorrectos");}catch{setErr("Error");}}
  if(isSetup===null)return<div style={{padding:40,textAlign:"center",fontFamily:"system-ui",color:"#888"}}>Cargando...</div>;
  return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:380,margin:"0 auto",padding:"60px 20px"}}><button onClick={onBack} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#999",marginBottom:16}}>Volver</button><div style={{...sec,padding:28}}><div style={{fontSize:14,fontWeight:800,color:"#4f46e5",marginBottom:4,letterSpacing:1}}>SOPORTE SONORO</div><h3 style={{margin:"0 0 20px",fontSize:17}}>{isSetup?"Login":"Crear cuenta"}</h3>
    <label style={{...lbl,marginTop:0}}>Usuario</label><input style={inp} value={user} onChange={e=>setUser(e.target.value)} placeholder="admin" autoComplete="username"/>
    <label style={lbl}>Pass</label><input style={inp} type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} placeholder="------" onKeyDown={e=>e.key==="Enter"&&(isSetup?handleLogin():null)}/>
    {!isSetup&&<><label style={lbl}>Repetir</label><input style={inp} type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="------"/></>}
    {err&&<p style={{color:"#ef4444",fontSize:13,marginTop:8}}>{err}</p>}
    <button style={{...bP,width:"100%",marginTop:18,padding:"12px"}} onClick={isSetup?handleLogin:handleSetup}>{isSetup?"Entrar":"Crear"}</button></div></div>);
}

// ====== ADMIN ======
function AdminPanel({onBack}){
  const[apps,setApps]=useState([]);const[loaded,setLoaded]=useState(false);const[tab,setTab]=useState("catalog");const[search,setSearch]=useState("");
  const[showForm,setShowForm]=useState(false);const[editApp,setEditApp]=useState(null);const[osF,setOsF]=useState("all");
  const[sel,setSel]=useState(new Set());const[giftIds,setGiftIds]=useState(new Set());const[showExp,setShowExp]=useState(false);
  const[extra,setExtra]=useState(0);const[extraL,setExtraL]=useState("Mano de obra");const[sesCode,setSesCode]=useState("");
  const[resps,setResps]=useState([]);const[pEvery,setPEvery]=useState(3);const[pMode,setPMode]=useState("cheapest");
  const[viewR,setViewR]=useState(null);const[payments,setPayments]=useState([{id:uid(),label:"Transferencia",alias:"",cbu:"",titular:"",banco:"",extra:""}]);
  const[offers,setOffers]=useState([]);const[showOfferForm,setShowOfferForm]=useState(false);const[editOffer,setEditOffer]=useState(null);
  const[copied,setCopied]=useState(false);const[sorteoCount,setSorteoCount]=useState(1);const[sorteoResult,setSorteoResult]=useState(null);
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
  const savePay=()=>{try{window.storage.set(PYK,JSON.stringify(payments))}catch{}};

  const filt=apps.filter(a=>{const mO=osF==="all"||a.os===osF||a.os==="both";const mS=a.name.toLowerCase().includes(search.toLowerCase())||(a.category||"").toLowerCase().includes(search.toLowerCase());return mO&&mS;});
  const selApps=apps.filter(a=>sel.has(a.id));const paid=selApps.filter(a=>!giftIds.has(a.id));const gifts=selApps.filter(a=>giftIds.has(a.id));
  const maxG=Math.floor(paid.length/pEvery);const totP=paid.reduce((s,a)=>s+(a.price||0),0);
  const toggleS=id=>{setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});};
  const toggleG=id=>{setGiftIds(p=>{const n=new Set(p);if(n.has(id)){n.delete(id);return n;}if(n.size<maxG){n.add(id);return n;}return p;});};
  const delApp=id=>setApps(p=>p.filter(a=>a.id!==id));
  const saveApp=app=>{if(editApp)setApps(p=>p.map(a=>a.id===app.id?app:a));else setApps(p=>[...p,{...app,id:uid()}]);setShowForm(false);setEditApp(null);};
  const toggleGE=id=>setApps(p=>p.map(a=>a.id===id?{...a,giftEligible:!a.giftEligible}:a));
  function handleImport(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const wb=XLSX.read(ev.target.result,{type:"array"});const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""});const na=rows.map(r=>{const w=String(r.windows||r.Windows||"").toLowerCase().trim();const m=String(r.macos||r.macOs||"").toLowerCase().trim();let os="both";if(w==="si"&&m!=="si")os="windows";else if(m==="si"&&w!=="si")os="mac";const links=[];const mag=String(r.magnet||"").trim();const enl=String(r.enlace||r.link||"").trim();if(mag&&mag.startsWith("magnet:"))links.push({type:"magnet",url:mag});if(enl)links.push({type:enl.includes("drive.google")?"drive":"direct",url:enl});return{id:uid(),name:String(r.Plugin||r.plugin||"").trim(),os,price:Number(r.valor||r.precio||0),category:"",giftEligible:false,links};}).filter(a=>a.name);setApps(p=>[...p,...na]);}catch{}};r.readAsArrayBuffer(f);e.target.value="";}
  async function createSes(){const c=shortCode();try{let ctr=1;try{const r=await window.storage.get(BCK);if(r?.value)ctr=JSON.parse(r.value);}catch{}await window.storage.set(BCK,JSON.stringify(ctr+1));const gP=apps.filter(a=>a.giftEligible);await window.storage.set("ss-ses-"+c,JSON.stringify({catalog:apps,promo:{every:pEvery,mode:pMode},payments,giftPool:gP,offers:offers.filter(o=>o.active),nextBudget:ctr}),true);setSesCode(c);}catch{}}

  async function loadResps(){try{const ks=await window.storage.list("ss-resp-",true);const rs=[];for(const k of(ks?.keys||[])){try{const r=await window.storage.get(k,true);if(r?.value)rs.push({...JSON.parse(r.value),_key:k});}catch{}}setResps(rs.sort((a,b)=>(b.timestamp||"").localeCompare(a.timestamp||"")));}catch{}}
  async function updateSt(resp,st){const u={...resp,status:st};try{await window.storage.set(resp._key,JSON.stringify(u),true);}catch{}setResps(p=>p.map(r=>r._key===resp._key?u:r));if(viewR?._key===resp._key)setViewR(u);}
  function genExp(r){const l=[];l.push("SOPORTE SONORO - #"+(r.budgetNumber||""));l.push("Cliente: "+(r.clientName||""));l.push("---");(r.selectedApps||[]).filter(a=>!a.isGift).forEach((a,i)=>{l.push((i+1)+". "+a.name+" $"+(a.price||0).toLocaleString("es-AR"));(a.links||[]).forEach(lk=>l.push("   "+lk.url));});l.push("---\nTOTAL: $"+(r.total||0).toLocaleString("es-AR"));return l.join("\n");}
  function doCopy(txt){copyText(txt);setCopied(true);setTimeout(()=>setCopied(false),2e3);}

  // Sorteo
  const allEmails=[...new Set(resps.map(r=>r.clientEmail).filter(Boolean))];
  function runSorteo(){const shuffled=[...allEmails].sort(()=>Math.random()-0.5);setSorteoResult(shuffled.slice(0,Math.min(sorteoCount,shuffled.length)));}

  // Referral stats
  const refMap={};resps.forEach(r=>{if(r.referralCode){if(!refMap[r.referralCode])refMap[r.referralCode]={code:r.referralCode,uses:0,names:[]};refMap[r.referralCode].uses++;refMap[r.referralCode].names.push(r.clientName||"");}});
  const refList=Object.values(refMap).sort((a,b)=>b.uses-a.uses);
  // Find who owns each ref code
  const refOwners={};resps.forEach(r=>{if(r.myReferralCode)refOwners[r.myReferralCode]=r.clientName||r.clientEmail||"";});

  const accepted=resps.filter(r=>r.status==="accepted"||r.status==="installed");
  const monthlyData=(()=>{const map={};accepted.forEach(r=>{if(!r.timestamp)return;const d=new Date(r.timestamp);const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");if(!map[k])map[k]={month:k,total:0,count:0};map[k].total+=(r.total||0);map[k].count++;});return Object.values(map).sort((a,b)=>a.month.localeCompare(b.month));})();
  const catData=(()=>{const map={};accepted.forEach(r=>(r.selectedApps||[]).forEach(a=>{const c=a.category||"Otro";if(!map[c])map[c]={name:c,value:0};map[c].value+=(a.isGift?0:(a.price||0));}));return Object.values(map).sort((a,b)=>b.value-a.value);})();
  const totalRevenue=accepted.reduce((s,r)=>s+(r.total||0),0);

  if(!loaded)return<div style={{padding:40,textAlign:"center",fontFamily:"system-ui",color:"#888"}}>Cargando...</div>;
  return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:780,margin:"0 auto",padding:"12px 12px 60px"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      <button onClick={onBack} style={{background:"#fee2e2",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:600,color:"#991b1b"}}>Salir</button>
      <div style={{fontSize:14,fontWeight:800,flex:"1 1 60px",color:"#4f46e5",letterSpacing:1}}>SOPORTE SONORO</div>
      {["catalog","promo","offers","session","share","payment","responses","referrals","sorteo","stats"].map(t=>(<button key={t} style={tB(tab===t)} onClick={()=>{setTab(t);setShowExp(false);setViewR(null);if(t==="responses"||t==="stats"||t==="referrals"||t==="sorteo")loadResps();}}>{{catalog:"Cat",promo:"Promo",offers:"Ofertas",session:"Trabajo",share:"Codigo",payment:"Pagos",responses:"Presup",referrals:"Refs",sorteo:"Sorteo",stats:"Stats"}[t]}</button>))}
    </div>

    {tab==="catalog"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}><input style={{...inp,flex:1,minWidth:100}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/><button style={bP} onClick={()=>{setEditApp(null);setShowForm(true);}}>+</button><button style={bO} onClick={()=>fileRef.current?.click()}>Excel</button><input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleImport}/></div>
      <div style={{fontSize:12,color:"#888",marginBottom:8}}>{apps.length} items</div>
      {apps.filter(a=>a.name.toLowerCase().includes(search.toLowerCase())||(a.category||"").toLowerCase().includes(search.toLowerCase())).map(a=>(<div key={a.id} style={{...crd,borderLeft:a.giftEligible?"4px solid #f59e0b":undefined}}><div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:13,flex:1}}>{a.name}</span>{a.giftEligible&&<GiftE/>}<OsB os={a.os}/><span style={{fontSize:11,color:"#777",background:"#f3f4f6",padding:"1px 6px",borderRadius:4}}>{a.category}</span><span style={{fontWeight:700,color:"#4f46e5",fontSize:13}}>${(a.price||0).toLocaleString("es-AR")}</span></div>
        <div style={{marginTop:4,display:"flex",gap:4,flexWrap:"wrap"}}><button style={bS} onClick={()=>toggleGE(a.id)}>R</button><button style={bS} onClick={()=>{setEditApp(a);setShowForm(true);}}>Ed</button><button style={{background:"none",border:"none",color:"#ccc",cursor:"pointer"}} onClick={()=>delApp(a.id)}>x</button></div></div>))}
    </div>}

    {tab==="promo"&&<div style={sec}><h3 style={{margin:"0 0 12px"}}>Promo</h3><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><span>Cada</span><input type="number" min={2} max={20} value={pEvery} onChange={e=>setPEvery(Math.max(2,Number(e.target.value)||3))} style={{...inp,width:55,textAlign:"center",padding:"4px 8px"}}/><span>apps = 1 gratis</span></div>
      {[["cheapest","Auto: mas barato gratis"],["pool","Cliente elige de lista"]].map(([v,t])=>(<label key={v} style={{display:"flex",alignItems:"center",gap:10,padding:12,borderRadius:8,border:pMode===v?"2px solid #4f46e5":"2px solid #e2e2e8",cursor:"pointer",background:pMode===v?"#eef2ff":"#fff",marginBottom:8}} onClick={()=>setPMode(v)}><input type="radio" checked={pMode===v} onChange={()=>{}}/><span style={{fontWeight:700,fontSize:14}}>{t}</span></label>))}</div>}

    {tab==="offers"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h3 style={{margin:0}}>Ofertas</h3><button style={bP} onClick={()=>{setEditOffer(null);setShowOfferForm(true);}}>+ Crear</button></div>
      {offers.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:40}}>Sin ofertas</div>}
      {offers.map(o=>{const isAct=isOfferActive(o);const disc=o.originalPrice>0&&o.price>0?Math.round((1-o.price/o.originalPrice)*100):0;return(<div key={o.id} style={{...crd,borderLeft:o.isSuper?"4px solid #ef4444":"4px solid #f59e0b",opacity:isAct?1:.6}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>{o.isSuper&&<span style={{background:"#ef4444",color:"#fff",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:800}}>SUPER</span>}<span style={{fontWeight:800,flex:1}}>{o.name}</span><span style={{fontWeight:800,color:"#ef4444"}}>${(o.price||0).toLocaleString("es-AR")}</span>{disc>0&&<span style={{background:"#dcfce7",color:"#166534",padding:"2px 6px",borderRadius:4,fontSize:11,fontWeight:700}}>-{disc}%</span>}</div>
        <div style={{fontSize:12,color:"#888",marginTop:4}}>{(o.plugins||[]).length} plugins {o.endDate&&<Countdown endDate={o.endDate}/>}</div>
        <div style={{display:"flex",gap:6,marginTop:6}}><button style={bS} onClick={()=>{setEditOffer(o);setShowOfferForm(true);}}>Ed</button><button style={{...bS,color:o.active?"#ef4444":"#059669"}} onClick={()=>setOffers(offers.map(x=>x.id===o.id?{...x,active:!x.active}:x))}>{o.active?"Off":"On"}</button><button style={{background:"none",border:"none",color:"#ccc",cursor:"pointer"}} onClick={()=>setOffers(offers.filter(x=>x.id!==o.id))}>x</button></div></div>);})}
      {showOfferForm&&<OfferForm offer={editOffer} apps={apps} onSave={o=>{if(editOffer)setOffers(offers.map(x=>x.id===o.id?o:x));else setOffers([...offers,{...o,id:uid(),active:true}]);setShowOfferForm(false);setEditOffer(null);}} onCancel={()=>{setShowOfferForm(false);setEditOffer(null);}}/>}
    </div>}

    {tab==="session"&&!showExp&&<div>
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>{["all","windows","mac"].map(o=><button key={o} style={tB(osF===o)} onClick={()=>setOsF(o)}>{o==="all"?"Todos":o==="windows"?"Win":"Mac"}</button>)}</div>
      <input style={{...inp,marginBottom:10}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><span style={{fontSize:13,color:"#666"}}>{sel.size} sel</span>{maxG>0&&<span style={{fontSize:13,color:"#b45309",fontWeight:600}}>R: {giftIds.size}/{maxG}</span>}<div style={{flex:1}}/>{sel.size>0&&<button style={bG} onClick={()=>setShowExp(true)}>Generar</button>}</div>
      {filt.map(a=>{const is=sel.has(a.id);const ig=giftIds.has(a.id);return(<div key={a.id} style={ig?crdG:is?crdSel:crd}><div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><input type="checkbox" checked={is} onChange={()=>toggleS(a.id)} style={{width:18,height:18,accentColor:"#4f46e5"}}/><span style={{fontWeight:700,fontSize:13,flex:1,cursor:"pointer"}} onClick={()=>toggleS(a.id)}>{a.name}</span>{ig&&<Gift/>}<OsB os={a.os}/><span style={{fontWeight:700,color:ig?"#16a34a":"#4f46e5",fontSize:13,textDecoration:ig?"line-through":"none"}}>${(a.price||0).toLocaleString("es-AR")}</span>{is&&<button onClick={()=>toggleG(a.id)} style={{background:ig?"#fbbf24":"#f3f4f6",border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer"}}>R</button>}</div></div>);})}
      {sel.size>0&&<div style={{position:"sticky",bottom:0,background:"#f0f0ff",borderRadius:12,padding:"12px",marginTop:14,borderTop:"2px solid #4f46e5",display:"flex",alignItems:"center",gap:10}}><span style={{fontWeight:700,fontSize:15,flex:1}}>Total: ${totP.toLocaleString("es-AR")}</span><button style={bG} onClick={()=>setShowExp(true)}>Generar</button></div>}
    </div>}
    {tab==="session"&&showExp&&<div><button style={{...bS,marginBottom:14}} onClick={()=>setShowExp(false)}>Volver</button><div style={sec}><textarea readOnly id="exp-ta" value={"SOPORTE SONORO\n---\n"+paid.map((a,i)=>(i+1)+". "+a.name+" $"+(a.price||0).toLocaleString("es-AR")+"\n"+(a.links||[]).map(l=>"   "+l.url).join("\n")).join("\n")+(gifts.length?"\n--- REGALOS ---\n"+gifts.map(a=>"* "+a.name).join("\n"):"")+"\n---\nTOTAL: $"+(totP+extra).toLocaleString("es-AR")} style={{width:"100%",minHeight:200,fontFamily:"monospace",fontSize:12,padding:14,borderRadius:8,border:"1.5px solid #ddd",background:"#fff",resize:"vertical",boxSizing:"border-box"}}/><div style={{display:"flex",gap:10,marginTop:12}}><button style={bP} onClick={()=>doCopy(document.getElementById("exp-ta").value)}>{copied?"OK":"Copiar"}</button><button style={bO} onClick={()=>printText("SS",document.getElementById("exp-ta").value)}>Imprimir</button></div></div></div>}

    {tab==="payment"&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h3 style={{margin:0}}>Pagos</h3><button style={bP} onClick={()=>setPayments([...payments,{id:uid(),label:"",alias:"",cbu:"",titular:"",banco:"",extra:""}])}>+</button></div>
      {payments.map(pm=>(<div key={pm.id} style={{...sec,position:"relative"}}>{payments.length>1&&<button onClick={()=>setPayments(payments.filter(p=>p.id!==pm.id))} style={{position:"absolute",top:12,right:14,background:"none",border:"none",color:"#ccc",cursor:"pointer"}}>x</button>}
        <label style={{...lbl,marginTop:0}}>Nombre *</label><input style={inp} value={pm.label} onChange={e=>setPayments(payments.map(p=>p.id===pm.id?{...p,label:e.target.value}:p))}/>
        <label style={lbl}>Alias</label><input style={inp} value={pm.alias} onChange={e=>setPayments(payments.map(p=>p.id===pm.id?{...p,alias:e.target.value}:p))}/>
        <label style={lbl}>CBU</label><input style={inp} value={pm.cbu} onChange={e=>setPayments(payments.map(p=>p.id===pm.id?{...p,cbu:e.target.value}:p))}/>
        <label style={lbl}>Titular</label><input style={inp} value={pm.titular} onChange={e=>setPayments(payments.map(p=>p.id===pm.id?{...p,titular:e.target.value}:p))}/>
        <label style={lbl}>Banco</label><input style={inp} value={pm.banco} onChange={e=>setPayments(payments.map(p=>p.id===pm.id?{...p,banco:e.target.value}:p))}/>
        <label style={lbl}>Extra</label><textarea style={{...inp,minHeight:40,resize:"vertical"}} value={pm.extra} onChange={e=>setPayments(payments.map(p=>p.id===pm.id?{...p,extra:e.target.value}:p))}/>
      </div>))}<button style={bG} onClick={savePay}>Guardar</button></div>}

    {tab==="share"&&<div style={sec}><h3 style={{margin:"0 0 10px"}}>Codigo de sesion</h3>{!sesCode?<button style={{...bP,padding:"12px 28px"}} onClick={createSes}>Generar</button>:(<div><div style={{fontSize:28,fontWeight:800,letterSpacing:6,color:"#4f46e5",textAlign:"center",padding:"16px 0",background:"#eef2ff",borderRadius:10,marginBottom:12,wordBreak:"break-all"}}>{sesCode}</div><div style={{display:"flex",gap:8}}><button style={bO} onClick={()=>doCopy(sesCode)}>{copied?"OK":"Copiar"}</button><button style={bO} onClick={()=>setSesCode("")}>Otro</button></div></div>)}</div>}

    {tab==="responses"&&!viewR&&<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h3 style={{margin:0}}>Presupuestos</h3><button style={bS} onClick={()=>loadResps()}>Actualizar</button></div>
      {resps.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:40}}>Sin presupuestos</div>}
      {resps.map((r,i)=>(<div key={i} style={{...crd,padding:14,cursor:"pointer"}} onClick={()=>setViewR(r)}><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontWeight:800,fontSize:13,color:"#4f46e5"}}>#{r.budgetNumber||""}</span>{r.isGiftCard&&<span style={{background:"#a855f7",color:"#fff",padding:"1px 6px",borderRadius:4,fontSize:10}}>GIFT</span>}<span style={{fontWeight:700,flex:1,fontSize:13}}>{r.clientName||""}</span><StB status={r.status||"pending"}/></div><div style={{fontSize:12,color:"#888",marginTop:4}}>${(r.total||0).toLocaleString("es-AR")} {r.referralCode&&<span style={{color:"#7c3aed"}}>REF</span>}</div></div>))}
    </div>}
    {tab==="responses"&&viewR&&<div><button style={{...bS,marginBottom:14}} onClick={()=>setViewR(null)}>Volver</button><div style={sec}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}><span style={{fontWeight:800,fontSize:16,color:"#4f46e5"}}>#{viewR.budgetNumber}</span>{viewR.isGiftCard&&<span style={{background:"#a855f7",color:"#fff",padding:"2px 8px",borderRadius:6,fontSize:12}}>GIFT</span>}<StB status={viewR.status||"pending"}/></div>
      <div style={{fontSize:14,marginBottom:14,lineHeight:1.8}}>Cliente: <strong>{viewR.clientName}</strong><br/>Email: {viewR.clientEmail}<br/>OS: <OsB os={viewR.osFilter||"both"}/>{viewR.giftTo&&<><br/>Para: <strong>{viewR.giftTo}</strong></>}{viewR.referralCode&&<><br/>Referido: <strong>{viewR.referralCode}</strong></>}{viewR.refDiscount>0&&<><br/>Descuento ref: <strong style={{color:"#059669"}}>-${viewR.refDiscount.toLocaleString("es-AR")}</strong></>}</div>
      {(viewR.selectedApps||[]).map((a,j)=><div key={j} style={{padding:"6px 0",borderBottom:"1px solid #eee",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{flex:1,fontWeight:600,fontSize:13}}>{a.name}</span>{a.isGift&&<Gift/>}<span style={{fontWeight:700,color:a.isGift?"#16a34a":"#4f46e5",fontSize:13}}>{a.isGift?"$0":"$"+(a.price||0).toLocaleString("es-AR")}</span></div>)}
      {(viewR.customRequests||[]).length>0&&<div style={{marginTop:12,background:"#f5f3ff",borderRadius:8,padding:10,border:"1px solid #c4b5fd"}}>{viewR.customRequests.map((r,i)=><div key={i} style={{fontSize:13}}><strong>{r.name}</strong>{r.note?" - "+r.note:""}</div>)}</div>}
      <div style={{fontWeight:800,fontSize:18,color:"#4f46e5",margin:"14px 0"}}>Total: ${(viewR.total||0).toLocaleString("es-AR")}</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {(!viewR.status||viewR.status==="pending")&&<><button style={bG} onClick={()=>updateSt(viewR,"accepted")}>Aceptar</button><button style={bD} onClick={()=>updateSt(viewR,"rejected")}>Rechazar</button></>}
        {viewR.status==="accepted"&&<><button style={{...bP,background:"#1e40af"}} onClick={()=>updateSt(viewR,"installed")}>Instalado</button><button style={bD} onClick={()=>updateSt(viewR,"rejected")}>Rechazar</button></>}
        <button style={bO} onClick={()=>doCopy(genExp(viewR))}>{copied?"OK":"Copiar"}</button>
      </div>
    </div></div>}

    {tab==="referrals"&&<div><h3 style={{margin:"0 0 14px"}}>Referidos</h3>
      {refList.length===0&&<div style={{textAlign:"center",color:"#bbb",padding:40}}>Sin referidos</div>}
      {refList.map((r,i)=>(<div key={i} style={{...crd,borderLeft:i===0&&r.uses>1?"4px solid #f59e0b":undefined}}><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>{i===0&&r.uses>1&&<span style={{background:"#fef3c7",color:"#b45309",padding:"2px 6px",borderRadius:4,fontSize:10,fontWeight:700}}>TOP</span>}<span style={{fontWeight:800,color:"#7c3aed"}}>{r.code}</span><span style={{flex:1,fontSize:13}}>{refOwners[r.code]||"--"}</span><span style={{fontWeight:700,color:"#059669"}}>{r.uses} usos</span></div><div style={{fontSize:12,color:"#888",marginTop:4}}>Referidos: {r.names.join(", ")}</div></div>))}
    </div>}

    {tab==="sorteo"&&<div><h3 style={{margin:"0 0 14px"}}>Sorteo</h3>
      <div style={sec}><p style={{fontSize:13,color:"#666",margin:"0 0 14px"}}>Participan todos los emails de presupuestos ({allEmails.length} participantes)</p>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}><span style={{fontSize:14}}>Ganadores:</span><input type="number" min={1} max={allEmails.length||1} value={sorteoCount} onChange={e=>setSorteoCount(Math.max(1,Number(e.target.value)||1))} style={{...inp,width:70,textAlign:"center",padding:"6px"}}/><button style={bP} onClick={runSorteo} disabled={allEmails.length===0}>Sortear</button></div>
        {sorteoResult&&<div style={{background:"#f0fdf4",borderRadius:12,padding:16,border:"2px solid #059669"}}>
          <div style={{fontWeight:800,fontSize:16,color:"#059669",marginBottom:12}}>Ganadores</div>
          {sorteoResult.map((e,i)=>(<div key={i} style={{padding:"10px 14px",background:"#fff",borderRadius:8,marginBottom:8,display:"flex",alignItems:"center",gap:10,border:"1px solid #bbf7d0"}}><span style={{background:"#059669",color:"#fff",width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,flexShrink:0}}>{i+1}</span><span style={{fontWeight:600,fontSize:14,wordBreak:"break-all"}}>{e}</span></div>))}
          <button style={{...bO,marginTop:8}} onClick={()=>doCopy(sorteoResult.join("\n"))}>{copied?"OK":"Copiar"}</button>
        </div>}
      </div>
    </div>}

    {tab==="stats"&&<div><h3 style={{margin:"0 0 16px"}}>Stats</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:20}}>
        {[["Facturado","$"+totalRevenue.toLocaleString("es-AR"),"#4f46e5"],["Aceptados",""+accepted.length,"#059669"],["Totales",""+resps.length,"#f59e0b"],["Gifts",""+resps.filter(r=>r.isGiftCard).length,"#a855f7"]].map(([l,v,c])=>(<div key={l} style={{background:"#fff",borderRadius:10,padding:"14px 10px",border:"1.5px solid #e8e8ee",textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:11,color:"#888",marginTop:4}}>{l}</div></div>))}
      </div>
      {monthlyData.length>0&&<div style={{...sec,marginBottom:16}}><div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Mensual</div><ResponsiveContainer width="100%" height={200}><BarChart data={monthlyData}><XAxis dataKey="month" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip formatter={v=>"$"+v.toLocaleString("es-AR")}/><Bar dataKey="total" fill="#4f46e5" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>}
      {catData.length>0&&<div style={sec}><div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Categorias</div><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({name,percent})=>name+" "+Math.round(percent*100)+"%"} labelLine={false} style={{fontSize:9}}>{catData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={v=>"$"+v.toLocaleString("es-AR")}/></PieChart></ResponsiveContainer></div>}
    </div>}

    {showForm&&<AppForm app={editApp} onSave={saveApp} onCancel={()=>{setShowForm(false);setEditApp(null);}}/>}
  </div>);
}

// ====== CLIENT ======
function ClientPanel({code,onBack}){
  const[cat,setCat]=useState([]);const[promo,setPromo]=useState({every:3,mode:"cheapest"});const[payL,setPayL]=useState([]);
  const[gPool,setGPool]=useState([]);const[offers,setOffers]=useState([]);const[nBud,setNBud]=useState(1);const[loaded,setLoaded]=useState(false);
  const[search,setSearch]=useState("");const[osF,setOsF]=useState(null);const[macVer,setMacVer]=useState(null);
  const[isGift,setIsGift]=useState(null);const[giftTo,setGiftTo]=useState("");const[giftFrom,setGiftFrom]=useState("");
  const[sel,setSel]=useState(new Set());const[gSel,setGSel]=useState(new Set());const[selOffers,setSelOffers]=useState(new Set());
  const[cName,setCName]=useState("");const[cEmail,setCEmail]=useState("");const[done,setDone]=useState(false);const[budN,setBudN]=useState("");
  const[customReqs,setCustomReqs]=useState([]);const[showReqForm,setShowReqForm]=useState(false);const[reqName,setReqName]=useState("");const[reqNote,setReqNote]=useState("");
  const[refCode,setRefCode]=useState("");const[myRefCode,setMyRefCode]=useState("");const[catFilter,setCatFilter]=useState("Todos");
  const[giftSvg,setGiftSvg]=useState(null);

  useEffect(()=>{(async()=>{let data=null;
    try{const r=await window.storage.get("ss-ses-"+code,true);if(r&&r.value)data=JSON.parse(r.value);}catch(e){}
    if(!data){try{const r=await window.storage.get("swcat-session-"+code,true);if(r&&r.value)data=JSON.parse(r.value);}catch(e){}}
    if(data){setCat(data.catalog||[]);setPromo(data.promo||{every:3,mode:"cheapest"});setPayL(data.payments||[]);setGPool(data.giftPool||[]);setOffers((data.offers||[]).filter(o=>isOfferActive(o)));setNBud(data.nextBudget||1);}
    setLoaded(true);})();},[code]);

  const eOs=osF==="mac"?"mac":osF==="windows"?"windows":"all";
  const filt=cat.filter(a=>{const mO=a.os===eOs||a.os==="both";const mS=a.name.toLowerCase().includes(search.toLowerCase())||(a.category||"").toLowerCase().includes(search.toLowerCase());const mC=catFilter==="Todos"||a.category===catFilter;return mO&&mS&&mC;});
  const selApps=cat.filter(a=>sel.has(a.id));const activeOffers=offers.filter(o=>selOffers.has(o.id));
  let autoGift=new Set();let paid,maxPG=0;
  if(promo.mode==="cheapest"){const mG=Math.floor(selApps.length/(promo.every+1));if(mG>0){[...selApps].sort((a,b)=>(a.price||0)-(b.price||0)).slice(0,mG).forEach(a=>autoGift.add(a.id));}paid=selApps.filter(a=>!autoGift.has(a.id));}
  else{paid=selApps;maxPG=Math.floor(selApps.length/promo.every);}
  const subtotal=paid.reduce((s,a)=>s+(a.price||0),0)+activeOffers.reduce((s,o)=>s+(o.price||0),0);
  const refDiscount=refCode.trim()?Math.round(subtotal*0.1):0;
  const totP=subtotal-refDiscount;
  const toggleS=id=>{setSel(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});};
  const togglePG=id=>{setGSel(p=>{const n=new Set(p);if(n.has(id)){n.delete(id);return n;}if(n.size<maxPG){n.add(id);return n;}return p;});};
  function addReq(){if(!reqName.trim())return;setCustomReqs(p=>[...p,{id:uid(),name:reqName.trim(),note:reqNote.trim()}]);setReqName("");setReqNote("");setShowReqForm(false);}

  async function submit(){
    const y=new Date().getFullYear();const num="PRES-"+y+"-"+String(nBud).padStart(4,"0");setBudN(num);
    const mrc="REF-"+shortCode();setMyRefCode(mrc);
    const r={sessionCode:code,budgetNumber:num,clientName:cName.trim()||"Anonimo",clientEmail:cEmail.trim(),osFilter:eOs,macVersion:macVer,isGiftCard:isGift===true,giftTo:giftTo.trim(),giftFrom:giftFrom.trim(),referralCode:refCode.trim().toUpperCase()||null,myReferralCode:mrc,refDiscount,timestamp:new Date().toISOString(),status:"pending",selectedApps:selApps.map(a=>({...a,isGift:autoGift.has(a.id)})),selectedOffers:activeOffers,giftSelections:gPool.filter(a=>gSel.has(a.id)),customRequests:customReqs,total:totP};
    try{await window.storage.set("ss-resp-"+code+"-"+uid(),JSON.stringify(r),true);
      try{const c=await window.storage.get(BCK);const cur=c?.value?JSON.parse(c.value):nBud;await window.storage.set(BCK,JSON.stringify(cur+1));}catch{}
      if(isGift){setGiftSvg(generateGiftSVG(num,selApps,giftFrom.trim(),giftTo.trim()));}
      setDone(true);}catch{alert("Error");}
  }
  function downloadGift(){if(!giftSvg)return;const blob=new Blob([giftSvg],{type:"image/svg+xml"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="GiftCard-"+budN+".svg";a.click();URL.revokeObjectURL(url);}

  if(!loaded)return<div style={{padding:40,textAlign:"center",fontFamily:"system-ui",color:"#888"}}>Cargando...</div>;

  if(!osF)return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:400,margin:"0 auto",padding:"40px 16px",textAlign:"center"}}>
    <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#999",marginBottom:16,display:"block"}}>Volver</button>
    <div style={{fontSize:16,fontWeight:800,color:"#4f46e5",letterSpacing:1,marginBottom:8}}>SOPORTE SONORO</div>
    <h2 style={{fontSize:18,marginBottom:20}}>Sistema operativo</h2>
    <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
      <button onClick={()=>setOsF("windows")} style={{padding:"24px 30px",borderRadius:16,border:"3px solid #dbeafe",background:"#fff",cursor:"pointer",fontSize:15,fontWeight:700,flex:"1 1 140px",maxWidth:180}}>Windows</button>
      <button onClick={()=>setOsF("mac")} style={{padding:"24px 30px",borderRadius:16,border:"3px solid #f3e8ff",background:"#fff",cursor:"pointer",fontSize:15,fontWeight:700,flex:"1 1 140px",maxWidth:180}}>macOS</button>
    </div>
  </div>);

  if(osF==="mac"&&!macVer)return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:420,margin:"0 auto",padding:"40px 16px",textAlign:"center"}}>
    <button onClick={()=>setOsF(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#999",marginBottom:16}}>Cambiar</button>
    <h2 style={{fontSize:18,marginBottom:20}}>Version de macOS</h2>
    <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
      <button onClick={()=>setMacVer("new")} style={{padding:"20px 24px",borderRadius:16,border:"3px solid #d1fae5",background:"#fff",cursor:"pointer",fontWeight:700,flex:"1 1 140px",maxWidth:180,textAlign:"left"}}><div style={{fontWeight:800}}>Monterey+</div><div style={{color:"#888",fontSize:11,marginTop:4}}>macOS 12+</div></button>
      <button onClick={()=>setMacVer("old")} style={{padding:"20px 24px",borderRadius:16,border:"3px solid #fef3c7",background:"#fff",cursor:"pointer",fontWeight:700,flex:"1 1 140px",maxWidth:180,textAlign:"left"}}><div style={{fontWeight:800}}>Big Sur o anterior</div><div style={{color:"#888",fontSize:11,marginTop:4}}>macOS 11-</div></button>
    </div>
  </div>);

  if(isGift===null)return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:400,margin:"0 auto",padding:"40px 16px",textAlign:"center"}}>
    <button onClick={()=>{if(osF==="mac")setMacVer(null);else setOsF(null);}} style={{background:"none",border:"none",cursor:"pointer",color:"#999",marginBottom:16}}>Atras</button>
    <h2 style={{fontSize:18,marginBottom:20}}>Es para vos o para regalar?</h2>
    <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
      <button onClick={()=>setIsGift(false)} style={{padding:"24px 30px",borderRadius:16,border:"3px solid #d1fae5",background:"#fff",cursor:"pointer",fontSize:15,fontWeight:700,flex:"1 1 140px",maxWidth:180}}>Para mi</button>
      <button onClick={()=>setIsGift(true)} style={{padding:"24px 30px",borderRadius:16,border:"3px solid #e9d5ff",background:"#fff",cursor:"pointer",fontSize:15,fontWeight:700,flex:"1 1 140px",maxWidth:180}}>Regalar</button>
    </div>
  </div>);

  if(done){const isWin=eOs==="windows";const adUrl=isWin?"https://anydesk.com/es/downloads/thank-you?dv=win_exe":macVer==="new"?"https://anydesk.com/es/downloads/thank-you?dv=mac_dmg":"https://download.anydesk.com/macos/10.12_Sierra/anydesk_v7.0.2.dmg";const vidUrl=isWin?null:macVer==="new"?"https://www.youtube.com/watch?v=aeAMm3YdCRI":"https://www.youtube.com/watch?v=qHBgGAWb-jE";
  return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:500,margin:"0 auto",padding:"20px 16px"}}>
    <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:14,fontWeight:800,color:"#4f46e5",letterSpacing:1}}>SOPORTE SONORO</div><h2 style={{margin:"8px 0",fontSize:18}}>{isGift?"Gift Card lista!":"Presupuesto enviado!"}</h2><div style={{fontSize:20,fontWeight:800,color:"#4f46e5"}}>#{budN}</div><p style={{color:"#666",fontSize:14}}>Total: <strong>${totP.toLocaleString("es-AR")}</strong></p></div>
    {isGift&&giftSvg&&<div style={{marginBottom:16}}><div dangerouslySetInnerHTML={{__html:giftSvg}} style={{borderRadius:12,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.2)",marginBottom:10}}/><button style={{...bP,width:"100%",padding:"12px",background:"#7c3aed"}} onClick={downloadGift}>Descargar Gift Card</button></div>}
    <div style={{background:"#f5f3ff",borderRadius:10,padding:12,marginBottom:14,border:"1px solid #c4b5fd",textAlign:"center"}}><div style={{fontSize:12,color:"#666"}}>Tu codigo de referido:</div><div style={{fontSize:18,fontWeight:800,color:"#7c3aed",letterSpacing:3}}>{myRefCode}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>Compartilo y obtene 10% de descuento</div></div>
    {payL.length>0&&<div style={{background:"#f0fdf4",borderRadius:12,padding:14,border:"1.5px solid #bbf7d0",marginBottom:14}}><div style={{fontWeight:700,fontSize:14,marginBottom:8}}>Medios de pago</div>{payL.filter(p=>p.alias||p.label).map((pm,i)=>(<div key={i} style={{background:"#fff",borderRadius:8,padding:"8px 10px",marginBottom:6,border:"1px solid #d1fae5"}}><div style={{fontWeight:700,fontSize:13,color:"#065f46"}}>{pm.label}</div><div style={{fontSize:12}}>{pm.alias&&<div>Alias: <strong>{pm.alias}</strong></div>}{pm.cbu&&<div>CBU: {pm.cbu}</div>}{pm.titular&&<div>Titular: {pm.titular}</div>}</div></div>))}</div>}
    {!isGift&&<div style={{background:"#eef2ff",borderRadius:12,padding:14,border:"1.5px solid #c7d2fe",marginBottom:14}}><div style={{fontWeight:800,fontSize:14,marginBottom:6,color:"#4f46e5"}}>Prepara tu equipo</div>
      <a href={adUrl} target="_blank" rel="noopener noreferrer" style={{display:"block",padding:"10px",background:"#ef4444",color:"#fff",borderRadius:10,fontWeight:700,textAlign:"center",textDecoration:"none",marginBottom:10,fontSize:14}}>Descargar AnyDesk</a>
      {!isWin&&<div style={{background:"#fff",borderRadius:8,padding:12,border:"1px solid #c7d2fe",fontSize:12,lineHeight:1.7}}>1. Preferencias - Privacidad<br/>2. Accesibilidad: agregar AnyDesk<br/>3. Grabacion pantalla: agregar AnyDesk<br/>4. Reiniciar AnyDesk{vidUrl&&<><br/><a href={vidUrl} target="_blank" rel="noopener noreferrer" style={{color:"#4f46e5",fontWeight:600}}>Video tutorial</a></>}</div>}
      {isWin&&<div style={{background:"#fff",borderRadius:8,padding:12,border:"1px solid #c7d2fe",fontSize:12,lineHeight:1.7}}>1. Instala AnyDesk<br/>2. Anota tu ID de 9 digitos<br/>3. Compartilo cuando coordinemos</div>}
    </div>}
    <div style={{textAlign:"center"}}><button style={bO} onClick={onBack}>Volver</button></div>
  </div>);}

  const availCats=[...new Set(cat.filter(a=>a.os===eOs||a.os==="both").map(a=>a.category||"Otro"))];
  return(<div style={{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:700,margin:"0 auto",padding:"10px 12px 80px"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}><button onClick={()=>setIsGift(null)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#999"}}>{"<"}</button><div style={{fontSize:15,fontWeight:800,flex:1,color:"#4f46e5",letterSpacing:1}}>SOPORTE SONORO</div><OsB os={eOs}/>{isGift&&<span style={{background:"#a855f7",color:"#fff",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700}}>GIFT</span>}</div>
    <div style={{background:"#fffbeb",padding:"8px 12px",borderRadius:8,fontSize:12,marginBottom:12,color:"#92400e",border:"1px solid #fde68a"}}><strong>Promo:</strong> {promo.mode==="cheapest"?"cada "+(promo.every+1)+" apps, la mas barata gratis":"cada "+promo.every+" apps, elegis 1 de regalo"}</div>

    {offers.length>0&&<div style={{marginBottom:14}}><div style={{fontSize:13,fontWeight:700,marginBottom:6,color:"#ef4444"}}>Ofertas</div>{offers.map(o=>{const isSel=selOffers.has(o.id);const disc=o.originalPrice>0&&o.price>0?Math.round((1-o.price/o.originalPrice)*100):0;return(<div key={o.id} style={{...crd,borderColor:isSel?"#ef4444":"#fca5a5",background:isSel?"#fef2f2":o.isSuper?"#fff5f5":"#fff",border:isSel?"2px solid #ef4444":o.isSuper?"3px solid #ef4444":"2px solid #fca5a5"}} onClick={()=>{setSelOffers(p=>{const n=new Set(p);n.has(o.id)?n.delete(o.id):n.add(o.id);return n;});}}><div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",cursor:"pointer"}}><input type="checkbox" checked={isSel} onChange={()=>{}}/>{o.isSuper&&<span style={{background:"#ef4444",color:"#fff",padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:800}}>SUPER</span>}<span style={{fontWeight:800,fontSize:o.isSuper?15:14,flex:1,color:"#ef4444"}}>{o.name}</span><span style={{fontWeight:800,color:"#ef4444"}}>${(o.price||0).toLocaleString("es-AR")}</span>{disc>0&&<span style={{background:"#dcfce7",color:"#166534",padding:"2px 6px",borderRadius:4,fontSize:11,fontWeight:800}}>-{disc}%</span>}</div>{o.description&&<p style={{fontSize:12,color:"#666",margin:"4px 0 0 24px"}}>{o.description}</p>}{o.endDate&&<div style={{marginLeft:24,marginTop:2}}><Countdown endDate={o.endDate}/></div>}</div>);})}</div>}

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
      <div><label style={{fontSize:11,color:"#666",display:"block",marginBottom:3}}>Nombre *</label><input style={inp} value={cName} onChange={e=>setCName(e.target.value)}/></div>
      <div><label style={{fontSize:11,color:"#666",display:"block",marginBottom:3}}>Email *</label><input style={inp} type="email" value={cEmail} onChange={e=>setCEmail(e.target.value)}/></div>
    </div>
    {isGift&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
      <div><label style={{fontSize:11,color:"#666",display:"block",marginBottom:3}}>De</label><input style={inp} value={giftFrom} onChange={e=>setGiftFrom(e.target.value)}/></div>
      <div><label style={{fontSize:11,color:"#666",display:"block",marginBottom:3}}>Para</label><input style={inp} value={giftTo} onChange={e=>setGiftTo(e.target.value)}/></div>
    </div>}
    <div style={{marginBottom:10}}><label style={{fontSize:11,color:"#666",display:"block",marginBottom:3}}>Codigo referido (10% off)</label><input style={{...inp,maxWidth:200}} value={refCode} onChange={e=>setRefCode(e.target.value)} placeholder="REF-XXXXXX"/></div>

    <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap",overflowX:"auto"}}>{["Todos",...availCats].filter((v,i,a)=>a.indexOf(v)===i).map(c=><button key={c} style={{...tB(catFilter===c),fontSize:10,padding:"5px 8px"}} onClick={()=>setCatFilter(c)}>{c}</button>)}</div>
    <input style={{...inp,marginBottom:10}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>

    {filt.map(a=>{const is=sel.has(a.id);const ig=autoGift.has(a.id);return(<div key={a.id} style={ig?crdG:is?crdSel:crd}><div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><input type="checkbox" checked={is} onChange={()=>toggleS(a.id)} style={{width:16,height:16,accentColor:"#4f46e5"}}/><span style={{fontWeight:700,fontSize:13,flex:1,cursor:"pointer"}} onClick={()=>toggleS(a.id)}>{a.name}</span>{ig&&<Gift/>}<OsB os={a.os}/><span style={{fontSize:10,color:"#777",background:"#f3f4f6",padding:"1px 5px",borderRadius:3}}>{a.category}</span><span style={{fontWeight:700,color:ig?"#16a34a":"#4f46e5",fontSize:13,textDecoration:ig?"line-through":"none"}}>${(a.price||0).toLocaleString("es-AR")}</span></div></div>);})}

    <div style={{marginTop:10,marginBottom:8}}><button style={{...bO,width:"100%",padding:"8px",fontSize:12,borderStyle:"dashed"}} onClick={()=>setShowReqForm(true)}>+ Pedir algo que no esta</button></div>
    {showReqForm&&<div style={{...sec,marginBottom:10}}><input style={inp} value={reqName} onChange={e=>setReqName(e.target.value)} placeholder="Nombre del plugin" autoFocus/><input style={{...inp,marginTop:8}} value={reqNote} onChange={e=>setReqNote(e.target.value)} placeholder="Nota (opcional)"/><div style={{display:"flex",gap:8,marginTop:10}}><button style={bG} onClick={addReq}>OK</button><button style={bO} onClick={()=>{setShowReqForm(false);setReqName("");setReqNote("");}}>X</button></div></div>}
    {customReqs.map(r=>(<div key={r.id} style={{...crd,borderStyle:"dashed",borderColor:"#c4b5fd",display:"flex",gap:6,alignItems:"center"}}><span style={{flex:1,fontSize:13}}><strong>{r.name}</strong>{r.note?" - "+r.note:""}</span><button onClick={()=>setCustomReqs(p=>p.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",color:"#ccc",cursor:"pointer"}}>x</button></div>))}

    {promo.mode==="pool"&&maxPG>0&&<div style={{background:"#fffbeb",borderRadius:12,padding:14,marginTop:12,border:"1.5px solid #fde68a"}}><div style={{fontWeight:700,marginBottom:6}}>Elegi {maxPG} regalo{maxPG>1?"s":""}</div>{gPool.filter(a=>a.os===eOs||a.os==="both").map(a=>{const pk=gSel.has(a.id);return(<div key={a.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",marginBottom:4,borderRadius:8,background:pk?"#fef3c7":"#fff",border:pk?"2px solid #f59e0b":"1.5px solid #e2e2e8",cursor:"pointer"}} onClick={()=>togglePG(a.id)}><input type="checkbox" checked={pk} onChange={()=>{}}/><span style={{flex:1,fontWeight:600,fontSize:13}}>{a.name}</span><span style={{color:"#16a34a",fontWeight:700,fontSize:12}}>GRATIS</span></div>);})}</div>}

    {(sel.size>0||selOffers.size>0||customReqs.length>0)&&<div style={{position:"sticky",bottom:0,background:"#f0f0ff",borderRadius:12,padding:"12px",marginTop:12,borderTop:"2px solid #4f46e5"}}>
      {refDiscount>0&&<div style={{fontSize:13,color:"#059669",fontWeight:600,marginBottom:6}}>Descuento referido (10%): -${refDiscount.toLocaleString("es-AR")}</div>}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontWeight:700,fontSize:15,flex:1}}>Total: ${totP.toLocaleString("es-AR")}{customReqs.length>0?" +"+customReqs.length:""}</span></div>
      <button style={{...bG,width:"100%",padding:"12px",fontSize:14,background:isGift?"#7c3aed":"#059669"}} onClick={submit} disabled={!cName.trim()||!cEmail.trim()}>{isGift?"Generar Gift Card":"Enviar presupuesto"}</button>
      {(!cName.trim()||!cEmail.trim())&&<div style={{fontSize:11,color:"#ef4444",marginTop:4,textAlign:"center"}}>Completa nombre y email</div>}
    </div>}
  </div>);
}

// ====== FORMS ======
function AppForm({app,onSave,onCancel}){
  const[n,sN]=useState(app?.name||"");const[os,sO]=useState(app?.os||"both");const[pr,sP]=useState(app?.price||0);const[cat,sC]=useState(app?.category||"");const[ge,sGE]=useState(app?.giftEligible||false);const[lks,sL]=useState(app?.links?.length?app.links:[{type:"magnet",url:""}]);
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}} onClick={onCancel}><div style={{background:"#fff",borderRadius:16,padding:"20px 16px",width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
    <label style={{...lbl,marginTop:0}}>Nombre *</label><input style={inp} value={n} onChange={e=>sN(e.target.value)} autoFocus/>
    <label style={lbl}>Categoria</label><input style={inp} value={cat} onChange={e=>sC(e.target.value)}/>
    <label style={lbl}>OS</label><div style={{display:"flex",gap:6}}>{[["both","Ambos"],["windows","Win"],["mac","Mac"]].map(([v,l])=><button key={v} onClick={()=>sO(v)} style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",border:os===v?"2px solid #4f46e5":"2px solid #e2e2e8",background:os===v?"#eef2ff":"#fff",color:os===v?"#4f46e5":"#666"}}>{l}</button>)}</div>
    <label style={lbl}>Precio</label><input style={inp} type="number" value={pr||""} onChange={e=>sP(e.target.value)}/>
    <label style={{...lbl,display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginTop:14}} onClick={()=>sGE(!ge)}><input type="checkbox" checked={ge} onChange={()=>{}}/><span>Elegible regalo</span></label>
    <label style={lbl}>Links</label>{lks.map((l,i)=><div key={i} style={{display:"flex",gap:4,marginBottom:6}}><select value={l.type} onChange={e=>sL(lks.map((x,j)=>j===i?{...x,type:e.target.value}:x))} style={{...inp,width:80,fontSize:12}}><option value="magnet">Magnet</option><option value="drive">Drive</option><option value="direct">Direct</option></select><input style={{...inp,flex:1}} value={l.url} onChange={e=>sL(lks.map((x,j)=>j===i?{...x,url:e.target.value}:x))}/></div>)}
    <button onClick={()=>sL([...lks,{type:"magnet",url:""}])} style={{background:"none",border:"none",color:"#4f46e5",cursor:"pointer",fontSize:12}}>+ Link</button>
    <div style={{display:"flex",gap:8,marginTop:18,justifyContent:"flex-end"}}><button onClick={onCancel} style={{padding:"8px 16px",borderRadius:8,border:"1.5px solid #ddd",background:"#fff",cursor:"pointer"}}>X</button><button onClick={()=>{if(!n.trim())return;onSave({id:app?.id,name:n.trim(),os,price:Number(pr)||0,category:cat.trim(),giftEligible:ge,links:lks.filter(l=>l.url.trim())});}} style={bP}>OK</button></div>
  </div></div>);
}

function OfferForm({offer,apps,onSave,onCancel}){
  const[n,sN]=useState(offer?.name||"");const[desc,sD]=useState(offer?.description||"");const[pr,sP]=useState(offer?.price||0);const[oP,sOP]=useState(offer?.originalPrice||0);
  const[pIds,sPIds]=useState(new Set((offer?.plugins||[]).map(p=>p.id)));const[isSuper,setIsSuper]=useState(offer?.isSuper||false);
  const[schDays,setSchDays]=useState(offer?.scheduleDays||[]);const[eom,setEom]=useState(offer?.endOfMonth||false);const[startD,setStartD]=useState(offer?.startDate||"");const[endD,setEndD]=useState(offer?.endDate||"");
  const dayN=["Do","Lu","Ma","Mi","Ju","Vi","Sa"];const disc=oP>0&&pr>0?Math.round((1-pr/oP)*100):0;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:12}} onClick={onCancel}><div style={{background:"#fff",borderRadius:16,padding:"20px 16px",width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
    <div style={{fontWeight:700,fontSize:16,marginBottom:10}}>Oferta</div>
    <label style={{...lbl,marginTop:0}}>Nombre *</label><input style={inp} value={n} onChange={e=>sN(e.target.value)} autoFocus/>
    <label style={lbl}>Descripcion</label><textarea style={{...inp,minHeight:45,resize:"vertical"}} value={desc} onChange={e=>sD(e.target.value)}/>
    <div style={{display:"flex",gap:8}}><div style={{flex:1}}><label style={lbl}>Precio</label><input style={inp} type="number" value={pr||""} onChange={e=>sP(e.target.value)}/></div><div style={{flex:1}}><label style={lbl}>Original</label><input style={inp} type="number" value={oP||""} onChange={e=>sOP(e.target.value)}/></div></div>
    {disc>0&&<div style={{fontSize:13,color:"#059669",fontWeight:700,marginTop:4}}>-{disc}%</div>}
    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginTop:10,padding:"8px 12px",borderRadius:8,background:isSuper?"#fef2f2":"#fafafa",border:isSuper?"2px solid #ef4444":"2px solid #e8e8ee"}} onClick={()=>setIsSuper(!isSuper)}><input type="checkbox" checked={isSuper} onChange={()=>{}}/><span style={{fontWeight:700,fontSize:13,color:isSuper?"#ef4444":"#666"}}>SUPER OFERTA</span></label>
    <div style={{background:"#f8fafc",borderRadius:10,padding:12,marginTop:12,border:"1px solid #e2e2e8"}}>
      <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Programacion</div>
      <div style={{display:"flex",gap:3,marginBottom:10,flexWrap:"wrap"}}>{dayN.map((d,i)=>(<button key={i} onClick={()=>setSchDays(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])} style={{padding:"4px 8px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:schDays.includes(i)?"2px solid #4f46e5":"2px solid #e2e2e8",background:schDays.includes(i)?"#eef2ff":"#fff",color:schDays.includes(i)?"#4f46e5":"#888"}}>{d}</button>))}</div>
      <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,marginBottom:10}} onClick={()=>setEom(!eom)}><input type="checkbox" checked={eom} onChange={()=>{}}/><span>Fin de mes</span></label>
      <div style={{display:"flex",gap:8}}><div style={{flex:1}}><label style={{fontSize:11,color:"#666",display:"block",marginBottom:3}}>Desde</label><input style={inp} type="date" value={startD} onChange={e=>setStartD(e.target.value)}/></div><div style={{flex:1}}><label style={{fontSize:11,color:"#666",display:"block",marginBottom:3}}>Hasta</label><input style={inp} type="date" value={endD} onChange={e=>setEndD(e.target.value)}/></div></div>
    </div>
    <label style={{...lbl,marginTop:14}}>Plugins ({pIds.size})</label>
    <div style={{maxHeight:150,overflow:"auto",border:"1px solid #eee",borderRadius:8,padding:6}}>{apps.map(a=><label key={a.id} style={{display:"flex",gap:6,padding:"3px 0",cursor:"pointer",fontSize:12}}><input type="checkbox" checked={pIds.has(a.id)} onChange={()=>{sPIds(p=>{const nn=new Set(p);nn.has(a.id)?nn.delete(a.id):nn.add(a.id);return nn;});}}/><span style={{flex:1}}>{a.name}</span><span style={{color:"#888"}}>${(a.price||0).toLocaleString("es-AR")}</span></label>)}</div>
    <div style={{display:"flex",gap:8,marginTop:18}}><button onClick={onCancel} style={{padding:"8px 16px",borderRadius:8,border:"1.5px solid #ddd",background:"#fff",cursor:"pointer"}}>X</button><button onClick={()=>{if(!n.trim())return;onSave({id:offer?.id,name:n.trim(),description:desc.trim(),price:Number(pr)||0,originalPrice:Number(oP)||0,plugins:apps.filter(a=>pIds.has(a.id)),active:offer?.active??true,isSuper,scheduleDays:schDays,endOfMonth:eom,startDate:startD||null,endDate:endD||null});}} style={bP}>OK</button></div>
  </div></div>);
}
