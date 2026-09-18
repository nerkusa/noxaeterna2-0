import React, { useState } from 'react';
import { cF, mHP } from '../utils/character';
import { getProfs } from '../utils/profStore';
import { IconD10 } from '../icons/index';
import CharacterViewModal from './CharacterViewModal';

/* Постоянная правая колонка — состав группы виден всегда, статус
   «в игре» ставит ГМ (та же кнопка «В игру» в панели ГМ). */
function PartyRail(pr){
var chars=(pr.characters||[]).filter(function(c){return c._fbId!==pr.selfId});
var _o=useState(null);var openId=_o[0];var setOpen=_o[1];
var openChar=chars.find(function(c){return c._fbId===openId});
return(<aside style={{width:240,flexShrink:0,borderLeft:"1px solid var(--color-divider)",display:"flex",flexDirection:"column",minHeight:0,background:"var(--color-bg)",overflowY:"auto"}}>
<div style={{padding:"14px 14px 8px",fontSize:11,fontWeight:700,letterSpacing:.06,textTransform:"uppercase",color:"var(--color-text-muted)"}}>Партия</div>
<div style={{display:"flex",flexDirection:"column",gap:8,padding:"0 10px 14px"}}>
{chars.length===0&&<div style={{padding:"10px 6px",fontSize:12,color:"var(--color-text-muted)",fontStyle:"italic"}}>Пока никого нет</div>}
{chars.map(function(c){
  var inf=cF(c);var fs=inf.fs;
  var pf=getProfs().find(function(p){return p.id===c.profId});
  var mx=c.hpOv||mHP(fs);var hp=(c.curHp!==null&&c.curHp!==undefined)?c.curHp:mx;var hpP=mx>0?(hp/mx)*100:0;
  return(<div key={c._fbId} className="n-card" style={{padding:10,display:"flex",flexDirection:"column",gap:8}}>
    <button onClick={function(){setOpen(c._fbId)}} style={{display:"flex",alignItems:"center",gap:10,border:"none",background:"transparent",cursor:"pointer",textAlign:"left",padding:0}}>
      <div style={{position:"relative",flexShrink:0}}>
        <div style={{width:42,height:42,borderRadius:10,background:c.portrait?"none":"linear-gradient(135deg,var(--color-accent-2),var(--color-accent))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#161826",overflow:"hidden"}}>{c.portrait?<img src={c.portrait} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(c.name||"?")[0]}</div>
        <span style={{position:"absolute",right:-2,bottom:-2,width:10,height:10,borderRadius:"50%",background:c.active?"#10b981":"var(--color-text-muted)",boxShadow:"0 0 0 2px var(--color-bg)"}}/>
      </div>
      <div style={{minWidth:0,flex:1}}>
        <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name||"?"}</div>
        <div style={{fontSize:11,color:"var(--color-text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{(pf&&pf.id!=="none"?pf.name+" · ":"")+"ур. "+c.level}</div>
      </div>
    </button>
    <div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"var(--color-text-muted)",marginBottom:2}}><span>HP</span><span style={{fontWeight:700,color:"var(--color-text)"}}>{hp+"/"+mx}</span></div>
      <div style={{height:5,borderRadius:3,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:hpP+"%",height:"100%",background:"linear-gradient(90deg,#ef4444,#f87171)"}}/></div>
    </div>
    {pr.onQuickRoll&&<button onClick={function(){pr.onQuickRoll(c._fbId)}} style={{display:"flex",alignItems:"center",gap:5,alignSelf:"flex-start",border:"none",background:"transparent",cursor:"pointer",padding:0,fontSize:10,fontWeight:700,letterSpacing:.04,textTransform:"uppercase",color:"var(--color-accent)"}}><IconD10 size={12}/>Быстрый бросок</button>}
  </div>)
})}
</div>
{openChar&&<CharacterViewModal char={openChar} onClose={function(){setOpen(null)}}/>}
</aside>)}

export default PartyRail;
