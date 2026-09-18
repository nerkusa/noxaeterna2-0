import React from 'react';

function LevelUpPopup(pr){
  var p=pr.pending;
  if(!p)return null;
  var hasStat=p.stat>0;
  var hasSkill=p.skill>0;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:997,animation:"fadeIn 0.15s"}}>
    <div style={{background:"linear-gradient(135deg,#1f1330,#161826)",border:"3px solid #9184d9",borderRadius:16,padding:"20px 26px",textAlign:"center",minWidth:260,maxWidth:340,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",animation:"popIn 0.3s"}}>
      <div style={{fontSize:40,marginBottom:6}}>🎉</div>
      <div style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:18,color:"#e9e9ed",marginBottom:4}}>{"Новый уровень: "+p.level}</div>
      <div style={{fontSize:11,color:"#9397ab",marginBottom:12}}>Получены очки для распределения</div>
      <div style={{background:"#161826",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",flexDirection:"column",gap:6}}>
        {hasStat&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#9397ab"}}>Очки характеристик</span><span style={{fontWeight:700,color:"#f0b352"}}>{"+"+p.stat}</span></div>}
        {hasSkill&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#9397ab"}}>Очки навыков</span><span style={{fontWeight:700,color:"#f0b352"}}>{"+"+p.skill}</span></div>}
        {!hasStat&&!hasSkill&&<div style={{fontSize:12,color:"#9397ab"}}>На этот раз без очков</div>}
      </div>
      <div style={{fontSize:10,color:"#75798c",marginBottom:12}}>Потратить их можно в панели слева, на характеристиках и навыках.</div>
      <button onClick={pr.onAccept} style={{width:"100%",padding:9,borderRadius:8,border:"none",background:"#9184d9",color:"#161826",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>✓ Принять</button>
    </div>
  </div>)}

export default LevelUpPopup;
