import React from 'react';

function NpcDeathPopup(pr){
  var ev=pr.event;if(!ev)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:996,animation:"fadeIn 0.15s"}} onClick={pr.onClose}>
    <div onClick={function(e){e.stopPropagation()}} style={{background:"linear-gradient(135deg,#161826,#0e0f18)",border:"3px solid #e9e9ed",borderRadius:16,padding:"16px 22px",textAlign:"center",minWidth:240,boxShadow:"0 20px 60px rgba(0,0,0,0.4)",animation:"popIn 0.3s"}}>
      <div style={{fontSize:36,marginBottom:4}}>💀</div>
      <div style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:16,marginBottom:4}}>{ev.npcName}</div>
      <div style={{fontSize:11,color:"#9397ab",marginBottom:12}}>повержен!</div>
      <button onClick={pr.onClose} style={{width:"100%",padding:8,borderRadius:8,border:"2px solid #34374a",background:"#1b1d29",color:"#e9e9ed",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>OK</button>
    </div>
  </div>)}



export default NpcDeathPopup;
