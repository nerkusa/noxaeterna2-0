import React, { useState } from 'react';
import { cF, mHP } from '../utils/character';
import { getProfs } from '../utils/profStore';
import CharacterViewModal from './CharacterViewModal';

/* Постоянная правая колонка — состав группы виден всегда, статус
   «в игре» ставит ГМ (та же кнопка «В игру» в панели ГМ). */
function PartyRail(pr){
var chars=(pr.characters||[]).filter(function(c){return c._fbId!==pr.selfId});
var _o=useState(null);var openId=_o[0];var setOpen=_o[1];
var openChar=chars.find(function(c){return c._fbId===openId});
return(<aside style={{width:150,flexShrink:0,borderLeft:"1px solid var(--color-divider)",display:"flex",flexDirection:"column",minHeight:0,background:"var(--color-bg)",overflowY:"auto"}}>
<div style={{padding:"12px 12px 6px",fontSize:10,fontWeight:700,letterSpacing:.06,textTransform:"uppercase",color:"var(--color-text-muted)"}}>Партия</div>
<div style={{display:"flex",flexDirection:"column",gap:2,padding:"0 6px 10px"}}>
{chars.length===0&&<div style={{padding:"10px 6px",fontSize:11,color:"var(--color-text-muted)",fontStyle:"italic"}}>Пока никого нет</div>}
{chars.map(function(c){
  var inf=cF(c);var fs=inf.fs;
  var pf=getProfs().find(function(p){return p.id===c.profId});
  var mx=c.hpOv||mHP(fs);var hp=(c.curHp!==null&&c.curHp!==undefined)?c.curHp:mx;
  return(<button key={c._fbId} onClick={function(){setOpen(c._fbId)}} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 6px",border:"none",borderRadius:8,background:"transparent",cursor:"pointer",textAlign:"left"}}>
    <div style={{position:"relative",flexShrink:0}}>
      <div style={{width:34,height:34,borderRadius:8,background:c.portrait?"none":"linear-gradient(135deg,var(--color-accent-2),var(--color-accent))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#161826",overflow:"hidden"}}>{c.portrait?<img src={c.portrait} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(c.name||"?")[0]}</div>
      <span style={{position:"absolute",right:-2,bottom:-2,width:9,height:9,borderRadius:"50%",background:c.active?"#10b981":"var(--color-text-muted)",boxShadow:"0 0 0 2px var(--color-bg)"}}/>
    </div>
    <div style={{minWidth:0,flex:1}}>
      <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name||"?"}</div>
      <div style={{fontSize:9,color:"var(--color-text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{(pf&&pf.id!=="none"?pf.name+" · ":"")+"ур. "+c.level}</div>
      <div style={{fontSize:9,color:"var(--color-text-muted)"}}>{hp+"/"+mx+" HP"}</div>
    </div>
  </button>)
})}
</div>
{openChar&&<CharacterViewModal char={openChar} onClose={function(){setOpen(null)}}/>}
</aside>)}

export default PartyRail;
