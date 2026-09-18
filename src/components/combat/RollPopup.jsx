import React, { useEffect, useRef, useState } from 'react';
import { IconD10 } from '../../icons/index';

var ROLL_MS=650;

function RollPopup(p){
var _ph=useState("result");var phase=_ph[0];var sPhase=_ph[1];
var _sp=useState(1);var spin=_sp[0];var sSpin=_sp[1];
var timerRef=useRef(null);var intRef=useRef(null);

useEffect(function(){
  if(!p.roll)return;
  var isDmg=p.roll.d10===null;
  if(isDmg){sPhase("result");return}
  sPhase("rolling");
  sSpin(1+Math.floor(Math.random()*10));
  intRef.current=setInterval(function(){sSpin(1+Math.floor(Math.random()*10))},60);
  timerRef.current=setTimeout(function(){
    clearInterval(intRef.current);
    sPhase("result");
  },ROLL_MS);
  return function(){clearTimeout(timerRef.current);clearInterval(intRef.current)};
},[p.roll]);

if(!p.roll)return null;
var r=p.roll;var iC=r.crit||r.d10===10;var iF=r.fumble||r.d10===1;var isDmg=r.d10===null;
var rolling=phase==="rolling"&&!isDmg;

return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,animation:"fadeIn 0.2s"}} onClick={rolling?undefined:p.onClose}>

{rolling
?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
  <div style={{width:84,height:84,borderRadius:16,background:"radial-gradient(circle at 50% 40%,var(--color-accent-2),var(--color-accent) 70%)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 40px rgba(145,132,217,.55)",animation:"diceSpin 0.65s linear infinite"}}>
    <span style={{fontFamily:"'Inter',sans-serif",fontSize:34,fontWeight:900,color:"#161826"}}>{spin}</span>
  </div>
  <div style={{fontSize:12,color:"var(--color-text-muted)",fontWeight:600,letterSpacing:.05}}>{r.label}</div>
</div>
:<div onClick={function(e){e.stopPropagation()}} style={{background:isDmg?"linear-gradient(135deg,#2a1414,#311717)":iC?"linear-gradient(135deg,#231b08,#3a2c0c)":iF?"linear-gradient(135deg,#311717,#3a1c1c)":"linear-gradient(135deg,#232532,#1b1d29)",border:isDmg?"3px solid #ef4444":iC?"3px solid #f59e0b":iF?"3px solid #ef4444":"3px solid #34374a",borderRadius:16,padding:"16px 22px",textAlign:"center",minWidth:240,maxWidth:350,boxShadow:"0 20px 60px rgba(0,0,0,0.3)",animation:iC?"critPop 0.4s":"popIn 0.3s"}}>
<div style={{fontSize:12,color:"#9397ab",fontWeight:700,marginBottom:4}}>{r.label}</div>
<div style={{background:"#232532",border:"2px solid #34374a",borderRadius:10,padding:"8px 10px",marginBottom:8,position:"relative"}}>
{iC&&!isDmg&&<div style={{position:"absolute",inset:0,borderRadius:10,background:"radial-gradient(circle,rgba(245,158,11,.25),transparent 70%)",animation:"critFlash 0.5s ease-out"}}/>}
<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,flexWrap:"wrap",position:"relative"}}>{!isDmg&&<span style={{display:"flex",alignItems:"center",gap:3,fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:900,color:iC?"#d97706":iF?"#dc2626":"#3b82f6"}}><IconD10 size={18}/>{r.d10}</span>}{(r.parts||[]).map(function(pt,i){return <span key={i} style={{display:"flex",alignItems:"center",gap:2}}><span style={{color:"#9397ab",fontSize:13}}>+</span><span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>{pt.label}</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{pt.value}</span></span></span>})}</div>
</div>
<div style={{fontFamily:"'Inter',sans-serif",fontSize:30,fontWeight:900,color:isDmg?"#dc2626":iC?"#d97706":iF?"#dc2626":"#e9e9ed"}}>{"= "+r.total}</div>
{iC&&<div style={{fontSize:13,color:"#d97706",fontWeight:700}}>🌟 КРИТ!</div>}{iF&&<div style={{fontSize:13,color:"#dc2626",fontWeight:700}}>💀 ПРОВАЛ!</div>}{r.subtext&&<div style={{fontSize:10,marginTop:3,color:"#c084fc",fontWeight:600,whiteSpace:"pre-line"}}>{r.subtext}</div>}
<button onClick={p.onClose} style={{marginTop:10,padding:"4px 18px",borderRadius:6,border:"2px solid #34374a",background:"#1b1d29",fontWeight:700,fontSize:11,cursor:"pointer"}}>OK</button>
</div>}
</div>)}

export default RollPopup;
