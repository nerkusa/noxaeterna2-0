import React from 'react';
import NpcDeathPopup from './NpcDeathPopup';

function DamagePopup(pr){
  var ev=pr.event;
  if(!ev)return null;
  var dead=ev.newHp<=0;
  var pct=ev.maxHp>0?(ev.newHp/ev.maxHp)*100:0;
  return(<div style={{position:"fixed",inset:0,background:dead?"rgba(0,0,0,0.85)":"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:996,animation:"fadeIn 0.15s"}} onClick={pr.onClose}>
    <div onClick={function(e){e.stopPropagation()}} style={{background:dead?"linear-gradient(135deg,#e9e9ed,#b2b6ca)":"linear-gradient(135deg,#311717,#3a1c1c)",border:"3px solid "+(dead?"#9397ab":"#ef4444"),borderRadius:16,padding:"18px 24px",textAlign:"center",minWidth:250,maxWidth:320,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",animation:"popIn 0.3s"}}>
      <div style={{fontSize:40,marginBottom:6}}>{dead?"💀":"🩸"}</div>
      <div style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:18,color:dead?"#232532":"#dc2626",marginBottom:4}}>{dead?"ПОГИБ":"РАНЕН"}</div>
      <div style={{background:dead?"rgba(255,255,255,0.1)":"#161826",borderRadius:10,padding:"8px 14px",marginBottom:10}}>
        <div style={{fontSize:9,color:dead?"#75798c":"#9397ab",marginBottom:2}}>{ev.attackerName+" нанёс "+ev.dmg+" урона"}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
          <span style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:22,color:dead?"#9397ab":"#ef4444",textDecoration:dead?"line-through":"none"}}>{ev.oldHp}</span>
          <span style={{fontSize:14,color:dead?"#75798c":"#9397ab"}}>→</span>
          <span style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:28,color:dead?"#b2b6ca":"#dc2626"}}>{ev.newHp}</span>
          <span style={{fontSize:10,color:dead?"#9397ab":"#9397ab"}}>{"/ "+ev.maxHp}</span>
        </div>
        {!dead&&<div style={{marginTop:6,background:"#232532",borderRadius:4,height:8,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:pct<=25?"#dc2626":pct<=50?"#f59e0b":"#10b981",borderRadius:4,transition:"width 0.5s"}}/></div>}
      </div>
      {dead&&<div style={{fontSize:10,color:"#75798c",marginBottom:10}}>Персонаж потерял сознание или погиб</div>}
      <button onClick={pr.onClose} style={{width:"100%",padding:8,borderRadius:8,border:"none",background:dead?"#b2b6ca":"#ef4444",color:dead?"#161826":"#fff",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>OK</button>
    </div>
  </div>)}

/* ── NpcDeathPopup ── */

export default DamagePopup;
