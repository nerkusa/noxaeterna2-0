import React from 'react';
import { SD, SKD, skLabel } from '../data/stats';
import { cF, mHP } from '../utils/character';
import { getProfs } from '../utils/profStore';

/* Окно поверх приложения — только просмотр чужого персонажа (статы, снаряжение, био) */
function CharacterViewModal(pr){
var c=pr.char;
var inf=cF(c);var fs=inf.fs;var es=inf.eSk;var rc=inf.race;
var pf=getProfs().find(function(p){return p.id===c.profId})||getProfs()[0];
var mx=c.hpOv||mHP(fs,c);var hp=(c.curHp!==null&&c.curHp!==undefined)?c.curHp:mx;var hpP=mx>0?(hp/mx)*100:0;
var mxW=c.willOv||fs.WILL||1;var w=(c.curWill!==null&&c.curWill!==undefined)?c.curWill:mxW;var wP=mxW>0?(w/mxW)*100:0;
var equipped=(c.weapons||[]).find(function(x){return x.id===c.equippedWeapon});
var armorNames=(c.armors||[]).filter(function(a){return a.id===c.equippedHead||a.id===c.equippedBody}).map(function(a){return a.name});

return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:997,animation:"fadeIn 0.15s"}} onClick={pr.onClose}>
<div onClick={function(e){e.stopPropagation()}} className="n-card" style={{width:"min(420px,92vw)",maxHeight:"86vh",overflowY:"auto",boxShadow:"var(--shadow-lg)",animation:"popIn 0.2s",display:"flex",flexDirection:"column",gap:14}}>

<div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
  <div style={{width:56,height:56,borderRadius:10,flexShrink:0,background:c.portrait?"none":"linear-gradient(135deg,var(--color-accent-2),var(--color-accent))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#161826",overflow:"hidden"}}>{c.portrait?<img src={c.portrait} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(c.name||"?")[0]}</div>
  <div style={{flex:1,minWidth:0}}>
    <div style={{fontSize:17,fontWeight:600}}>{c.name||"?"}</div>
    <div style={{fontSize:12,color:"var(--color-text-muted)",marginTop:2}}>{[pf.id!=="none"?pf.name:null,rc.id!=="none"?rc.name:null,"ур. "+c.level,c.active?"в игре":"не в игре"].filter(Boolean).join(" · ")}</div>
  </div>
  <button onClick={pr.onClose} className="n-btn" style={{padding:"4px 8px",fontSize:14}}>✕</button>
</div>

<div style={{display:"flex",flexDirection:"column",gap:8}}>
<div>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontWeight:600,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:3}}><span>Здоровье</span><span style={{color:"var(--color-text)",textTransform:"none",fontWeight:700}}>{hp+" / "+mx}</span></div>
  <div style={{height:6,borderRadius:3,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:hpP+"%",height:"100%",background:"linear-gradient(90deg,#ef4444,#f87171)"}}/></div>
</div>
<div>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontWeight:600,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:3}}><span>Воля</span><span style={{color:"var(--color-text)",textTransform:"none",fontWeight:700}}>{w+" / "+mxW}</span></div>
  <div style={{height:6,borderRadius:3,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:wP+"%",height:"100%",background:"linear-gradient(90deg,var(--color-accent),var(--color-accent-2))"}}/></div>
</div>
</div>

<div>
  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:6}}>Характеристики</div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>{SD.map(function(s){return <div key={s.key} style={{textAlign:"center",background:"var(--color-sunken)",borderRadius:8,padding:"6px 2px"}}><div style={{fontSize:9,fontWeight:700,color:s.color}}>{s.key}</div><div style={{fontSize:15,fontWeight:600}}>{fs[s.key]||0}</div></div>})}</div>
</div>

{(function(){var any=Object.values(SKD).flat().some(function(sk){return es[sk.name]>0});if(!any)return null;return(
<div>
  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:6}}>Навыки</div>
  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{Object.values(SKD).flat().filter(function(sk){return es[sk.name]>0}).map(function(sk){return <span key={sk.name} className="n-tag" style={{background:"var(--color-sunken)",color:"var(--color-text)"}}>{skLabel(sk.name)+" "+es[sk.name]}</span>})}</div>
</div>);})()}

{(equipped||armorNames.length>0)&&<div>
  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:6}}>Снаряжение</div>
  <div style={{fontSize:12,color:"var(--color-text)",lineHeight:1.6}}>
    {equipped&&<div>⚔ {equipped.name}</div>}
    {armorNames.map(function(n,i){return <div key={i}>🛡 {n}</div>})}
  </div>
</div>}

{c.bio&&<div>
  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:6}}>Био</div>
  <div style={{fontSize:12,color:"var(--color-text-muted)",lineHeight:1.6,fontStyle:"italic"}}>{c.bio}</div>
</div>}

</div>
</div>)}

export default CharacterViewModal;
