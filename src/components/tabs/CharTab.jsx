import React, { useState } from 'react';
import { getProfs } from '../../utils/profStore';
import { cF, rndStats } from '../../utils/character';
import { getRaces } from '../../utils/raceStore';
import ContactList from './ContactList';
import { RaceInfo, ProfInfo } from './CharInfo';

function CharTab(pr){var c=pr.char;var sv=pr.save;var oR=pr.onRoll;var gm=pr.isGM;var inf=cF(c);var rc=inf.race;var fs=inf.fs;var es=inf.eSk;var pf=getProfs().find(function(p){return p.id===c.profId})||getProfs()[0];var avL=(c.lvlPts||0)-(c.spentLvlPts||0);var _un=useState(null);var undo=_un[0];var sU=_un[1];
return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
<div className="n-card" style={{display:"flex",flexDirection:"column",gap:14}}>
<div style={{display:"flex",gap:8}}>{!c.locked&&<button onClick={function(){sU({name:c.name,raceId:c.raceId,humanBonusStat:c.humanBonusStat,stats:Object.assign({},c.stats),skills:Object.assign({},c.skills)});var r=rndStats(c.profId,c.raceId);sv(Object.assign({},c,r,{curHp:null,curWill:null}))}} className="n-btn n-btn-secondary" style={{flex:1,color:"#f0b352",borderColor:"#f59e0b40"}}>🎲 Рандом</button>}{!c.locked&&undo&&<button onClick={function(){sv(Object.assign({},c,undo,{curHp:null,curWill:null}));sU(null)}} className="n-btn n-btn-secondary" style={{color:"var(--color-accent)"}}>↩️</button>}<button onClick={function(){sv(Object.assign({},c,{locked:!c.locked}))}} className="n-btn n-btn-secondary" style={{color:c.locked?"#ef4444":"#10b981",borderColor:c.locked?"#ef444440":"#10b98140"}}>{c.locked?"🔒 Заперт":"🔓 Открыт"}</button></div>
{c.locked&&avL>0&&<div style={{background:"rgba(245,158,11,.12)",border:"1.5px solid #f59e0b40",borderRadius:8,padding:"8px 10px",fontSize:12,fontWeight:600,color:"#f0b352"}}>{"⬆️ Есть неизрасходованные очки: "+avL}</div>}
<div style={{display:"flex",gap:10,flexWrap:"wrap"}}><div className="n-field" style={{flex:2,minWidth:140}}><label>Имя</label><input className="n-input" value={c.name||""} disabled={c.locked&&!gm} onChange={function(e){sv(Object.assign({},c,{name:e.target.value}))}}/></div><div className="n-field" style={{flex:1,minWidth:60}}><label>Ур.</label><input className="n-input" style={{background:"var(--color-surface)"}} value={c.level} disabled/></div></div>
<div className="n-field"><label>Раса</label><select value={c.raceId} disabled={c.locked&&!gm} onChange={function(e){sv(Object.assign({},c,{raceId:e.target.value,curHp:null}))}} className="n-input" style={{cursor:"pointer"}}>{getRaces().map(function(r){return <option key={r.id} value={r.id}>{r.name}</option>})}</select></div>
{rc.id!=="none"&&<RaceInfo race={rc}/>}
<div className="n-field"><label>Профессия</label><select value={c.profId} disabled={c.locked&&!gm} onChange={function(e){sv(Object.assign({},c,{profId:e.target.value}))}} className="n-input" style={{cursor:"pointer"}}>{getProfs().map(function(p){return <option key={p.id} value={p.id}>{p.name}</option>})}</select></div>
{pf.id!=="none"&&<ProfInfo prof={pf} char={c} save={sv} finalStats={fs} finalSkills={es} onRoll={oR} addLog={pr.addLog}/>}
</div>

<div className="n-card">
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>📋 Профиль</div>
<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><label style={{width:180,height:180,borderRadius:12,background:c.portrait?"none":"linear-gradient(135deg,var(--color-accent-2),var(--color-accent))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:c.portrait?0:48,fontWeight:700,color:"#161826",flexShrink:0,cursor:"pointer",overflow:"hidden",position:"relative",boxShadow:"var(--shadow-sm)"}}>{c.portrait?<img src={c.portrait} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{textAlign:"center"}}><div>{(c.name||"?")[0]}</div><div style={{fontSize:11,color:"#161826",opacity:.7,marginTop:4,fontWeight:500}}>📷 Загрузить фото</div></div>}<input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var file=e.target.files&&e.target.files[0];if(!file)return;if(file.size>500000){alert("Файл слишком большой! Макс. 500KB");return}var reader=new FileReader();reader.onload=function(ev){sv(Object.assign({},c,{portrait:ev.target.result}))};reader.readAsDataURL(file)}}/></label>{c.portrait&&<button onClick={function(){sv(Object.assign({},c,{portrait:""}))}} style={{fontSize:12,background:"none",border:"none",color:"#ef4444",cursor:"pointer"}}>✕ Удалить фото</button>}</div>
<div className="n-field" style={{marginTop:12}}><label>Био</label><textarea className="n-input" style={{minHeight:70,resize:"vertical"}} value={c.bio||""} onChange={function(e){sv(Object.assign({},c,{bio:e.target.value}))}}/></div>
</div>

{["friends","enemies"].map(function(lk){var isF=lk==="friends";var items=c[lk]||[];return <ContactList key={lk} label={isF?"🤝 Друзья":"⚔️ Враги"} color={isF?"#10b981":"#ef4444"} bg={isF?"#0e2018":"#2a1414"} items={items} onChange={function(ni){sv(Object.assign({},c,function(){var o={};o[lk]=ni;return o}()))}}/>})}
</div>)}

/* ── ContactList ── */

export default CharTab;
