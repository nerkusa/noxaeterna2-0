import React, { useState } from 'react';
import { getProfs } from '../../utils/profStore';
import { cF } from '../../utils/character';
import { getRaces } from '../../utils/raceStore';
import ContactList from './ContactList';
import { RaceInfo, ProfInfo } from './CharInfo';

var ALIGNMENTS=["","Порядок-Добро","Нейтрал-Добро","Хаос-Добро","Порядок-Нейтрал","Истинный нейтрал","Хаос-Нейтрал","Порядок-Зло","Нейтрал-Зло","Хаос-Зло"];

function AppearField(pr){
return(<div className="n-field"><label>{pr.label}</label><input className="n-input" value={pr.value||""} disabled={pr.disabled} onChange={pr.onChange} placeholder={pr.placeholder}/></div>)}

function LifepathTable(pr){
var rows=pr.rows||[];
function upd(i,k,v){var n=rows.slice();var row=Object.assign({},n[i]);row[k]=v;n[i]=row;pr.onChange(n)}
function add(){pr.onChange(rows.concat([{age:"",event:"",outcome:""}]))}
function del(i){var n=rows.slice();n.splice(i,1);pr.onChange(n)}
return(<div className="n-card">
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
  <div style={{fontSize:13,fontWeight:600}}>Жизненный путь</div>
  {!pr.disabled&&<button onClick={add} className="n-btn n-btn-secondary" style={{padding:"4px 10px",fontSize:11}}>+ Строка</button>}
</div>
{rows.length===0&&<div style={{fontSize:12,color:"var(--color-text-muted)",fontStyle:"italic"}}>Пока пусто — добавь события из прошлого персонажа</div>}
{rows.length>0&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
<div style={{display:"grid",gridTemplateColumns:"70px 1fr 1fr 28px",gap:6,fontSize:10,fontWeight:700,textTransform:"uppercase",color:"var(--color-text-muted)",padding:"0 2px"}}><span>Возраст</span><span>Событие</span><span>Исход</span><span/></div>
{rows.map(function(r,i){return(<div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr 1fr 28px",gap:6,alignItems:"center"}}>
  <input className="n-input" style={{padding:"6px 8px"}} value={r.age||""} disabled={pr.disabled} onChange={function(e){upd(i,"age",e.target.value)}}/>
  <input className="n-input" style={{padding:"6px 8px"}} value={r.event||""} disabled={pr.disabled} onChange={function(e){upd(i,"event",e.target.value)}}/>
  <input className="n-input" style={{padding:"6px 8px"}} value={r.outcome||""} disabled={pr.disabled} onChange={function(e){upd(i,"outcome",e.target.value)}}/>
  {!pr.disabled&&<button onClick={function(){del(i)}} className="n-btn" style={{padding:"4px",fontSize:11,color:"#ef4444"}}>✕</button>}
</div>)})}
</div>}
</div>)}

function AccountCard(pr){
var _cp=useState("");var curPass=_cp[0];var sCurPass=_cp[1];
var _nl=useState(pr.login);var newLogin=_nl[0];var sNewLogin=_nl[1];
var _np=useState("");var newPass=_np[0];var sNewPass=_np[1];
var _np2=useState("");var newPass2=_np2[0];var sNewPass2=_np2[1];
var _st=useState(null);var status=_st[0];var sStatus=_st[1];
var _bz=useState(false);var busy=_bz[0];var sBusy=_bz[1];
function submit(){
  if(!curPass){sStatus({ok:false,text:"Введи текущий пароль"});return}
  if(newPass&&newPass!==newPass2){sStatus({ok:false,text:"Новые пароли не совпадают"});return}
  sBusy(true);sStatus(null);
  pr.changeAccount(curPass,newLogin.trim(),newPass||null).then(function(res){
    sBusy(false);
    if(!res.ok){sStatus({ok:false,text:res.error||"Не удалось изменить аккаунт"});return}
    sStatus({ok:true,text:"Сохранено"});sCurPass("");sNewPass("");sNewPass2("")
  })
}
return(<div className="n-card">
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Аккаунт</div>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<div className="n-field"><label>Логин</label><input className="n-input" value={newLogin} onChange={function(e){sNewLogin(e.target.value)}}/></div>
<div className="n-field"><label>Текущий пароль</label><input className="n-input" type="password" value={curPass} onChange={function(e){sCurPass(e.target.value)}}/></div>
<div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
  <div className="n-field" style={{flex:1,minWidth:140}}><label>Новый пароль</label><input className="n-input" type="password" value={newPass} onChange={function(e){sNewPass(e.target.value)}} placeholder="оставь пустым, чтобы не менять"/></div>
  <div className="n-field" style={{flex:1,minWidth:140}}><label>Повтори новый пароль</label><input className="n-input" type="password" value={newPass2} onChange={function(e){sNewPass2(e.target.value)}}/></div>
</div>
{status&&<div style={{fontSize:12,fontWeight:600,color:status.ok?"#10b981":"#ef4444"}}>{status.text}</div>}
<button onClick={submit} disabled={busy} className="n-btn n-btn-primary" style={{alignSelf:"flex-start"}}>{busy?"Сохраняю…":"Сохранить"}</button>
</div>
</div>)}

function CharTab(pr){var c=pr.char;var sv=pr.save;var oR=pr.onRoll;var gm=pr.isGM;var inf=cF(c);var rc=inf.race;var fs=inf.fs;var es=inf.eSk;var pf=getProfs().find(function(p){return p.id===c.profId})||getProfs()[0];var avL=(c.lvlPts||0)-(c.spentLvlPts||0);var locked=c.locked&&!gm;
return(<div style={{display:"flex",flexDirection:"column",gap:16}}>

<div className="n-card" style={{display:"flex",flexDirection:"column",gap:14}}>
{c.locked&&avL>0&&<div style={{background:"rgba(245,158,11,.12)",border:"1.5px solid #f59e0b40",borderRadius:8,padding:"8px 10px",fontSize:12,fontWeight:600,color:"#f0b352"}}>{"Есть неизрасходованные очки: "+avL}</div>}
<div style={{display:"flex",gap:10,flexWrap:"wrap"}}><div className="n-field" style={{flex:2,minWidth:140}}><label>Имя</label><input className="n-input" value={c.name||""} disabled={locked} onChange={function(e){sv(Object.assign({},c,{name:e.target.value}))}}/></div><div className="n-field" style={{flex:1,minWidth:60}}><label>Ур.</label><input className="n-input" style={{background:"var(--color-surface)"}} value={c.level} disabled/></div></div>
<div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
<div className="n-field" style={{flex:1,minWidth:150}}><label>Раса</label><select value={c.raceId} disabled={locked} onChange={function(e){sv(Object.assign({},c,{raceId:e.target.value,curHp:null}))}} className="n-input" style={{cursor:"pointer"}}>{getRaces().map(function(r){return <option key={r.id} value={r.id}>{r.name}</option>})}</select></div>
<div className="n-field" style={{flex:1,minWidth:150}}><label>Профессия</label><select value={c.profId} disabled={locked} onChange={function(e){sv(Object.assign({},c,{profId:e.target.value}))}} className="n-input" style={{cursor:"pointer"}}>{getProfs().map(function(p){return <option key={p.id} value={p.id}>{p.name}</option>})}</select></div>
</div>
{rc.id!=="none"&&<RaceInfo race={rc}/>}
{pf.id!=="none"&&<ProfInfo prof={pf} char={c} save={sv} finalStats={fs} finalSkills={es} onRoll={oR} addLog={pr.addLog}/>}
</div>

<div className="n-card" style={{display:"flex",gap:16,flexWrap:"wrap"}}>
<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,flexShrink:0}}><label style={{width:140,height:140,borderRadius:12,background:c.portrait?"none":"linear-gradient(135deg,var(--color-accent-2),var(--color-accent))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:c.portrait?0:40,fontWeight:700,color:"#161826",flexShrink:0,cursor:"pointer",overflow:"hidden",position:"relative",boxShadow:"var(--shadow-sm)"}}>{c.portrait?<img src={c.portrait} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{textAlign:"center"}}><div>{(c.name||"?")[0]}</div><div style={{fontSize:10,color:"#161826",opacity:.7,marginTop:4,fontWeight:500}}>Загрузить фото</div></div>}<input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var file=e.target.files&&e.target.files[0];if(!file)return;if(file.size>500000){alert("Файл слишком большой! Макс. 500KB");return}var reader=new FileReader();reader.onload=function(ev){sv(Object.assign({},c,{portrait:ev.target.result}))};reader.readAsDataURL(file)}}/></label>{c.portrait&&<button onClick={function(){sv(Object.assign({},c,{portrait:""}))}} style={{fontSize:12,background:"none",border:"none",color:"#ef4444",cursor:"pointer"}}>Удалить фото</button>}</div>
<div style={{flex:1,minWidth:220,display:"flex",flexDirection:"column",gap:10}}>
<div style={{fontSize:13,fontWeight:600}}>Внешность</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<AppearField label="Рост" value={c.height} disabled={locked} placeholder="180 см" onChange={function(e){sv(Object.assign({},c,{height:e.target.value}))}}/>
<AppearField label="Вес" value={c.weight} disabled={locked} placeholder="75 кг" onChange={function(e){sv(Object.assign({},c,{weight:e.target.value}))}}/>
<AppearField label="Цвет волос" value={c.hair} disabled={locked} onChange={function(e){sv(Object.assign({},c,{hair:e.target.value}))}}/>
<AppearField label="Цвет глаз" value={c.eyeColor} disabled={locked} onChange={function(e){sv(Object.assign({},c,{eyeColor:e.target.value}))}}/>
<AppearField label="Цвет кожи" value={c.skinColor} disabled={locked} onChange={function(e){sv(Object.assign({},c,{skinColor:e.target.value}))}}/>
<div className="n-field"><label>Мировоззрение</label><select className="n-input" value={c.alignment||""} disabled={locked} onChange={function(e){sv(Object.assign({},c,{alignment:e.target.value}))}} style={{cursor:"pointer"}}>{ALIGNMENTS.map(function(a){return <option key={a} value={a}>{a||"— не выбрано —"}</option>})}</select></div>
</div>
</div>
</div>

<div className="n-card">
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Био</div>
<div className="n-field"><textarea className="n-input" style={{minHeight:70,resize:"vertical"}} value={c.bio||""} disabled={locked} onChange={function(e){sv(Object.assign({},c,{bio:e.target.value}))}}/></div>
</div>

<LifepathTable rows={c.lifepath} disabled={locked} onChange={function(n){sv(Object.assign({},c,{lifepath:n}))}}/>

{["friends","enemies"].map(function(lk){var isF=lk==="friends";var items=c[lk]||[];return <ContactList key={lk} label={isF?"Друзья":"Враги"} color={isF?"#10b981":"#ef4444"} bg={isF?"#0e2018":"#2a1414"} items={items} onChange={function(ni){sv(Object.assign({},c,function(){var o={};o[lk]=ni;return o}()))}}/>})}

{!gm&&pr.changeAccount&&<AccountCard login={c._fbId} changeAccount={pr.changeAccount}/>}
</div>)}

/* ── ContactList ── */

export default CharTab;
