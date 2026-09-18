import React, { useState, useEffect } from 'react';
import { db, ref, set, get, onValue, update, remove, authChangeAccount } from './firebase';
import { CSS } from './styles/globalCss';
import { nC } from './utils/character';
import { setRaces } from './utils/raceStore';
import { setProfs } from './utils/profStore';
import DonatePage from './components/gm/DonatePage';
import GameView from './components/GameView';
import GMPanel from './components/gm/GMPanel';
import Login from './components/Login';
import NpcHitPopup from './components/combat/NpcHitPopup';

var WORLD="world";

export default function App(){
var _au=useState(null);var auth=_au[0];var setAuth=_au[1];
var room=auth?WORLD:null;var isGM=!!(auth&&auth.role==="gm");var pId=auth?auth.login:null;
/* Автовход из localStorage (просто запоминаем кто заходил в прошлый раз — без повторной проверки пароля, как и раньше с кодом комнаты) */
useEffect(function(){
  try{
    var saved=localStorage.getItem("nox_session");
    if(!saved)return;
    var s=JSON.parse(saved);
    if(!s.login)return;
    setAuth({login:s.login,role:s.role||"player"});
  }catch(e){}
},[]);
function handleAuth(a){
  setAuth(a);
  try{localStorage.setItem("nox_session",JSON.stringify({login:a.login,role:a.role}))}catch(e){}
}
var _ch=useState({});var chars=_ch[0];var sCh=_ch[1];var _lo=useState({});var lore=_lo[0];var sLo=_lo[1];var _mp=useState({});var mapData=_mp[0];var sMapData=_mp[1];var _lg=useState([]);var logs=_lg[0];var sLg=_lg[1];var _nt=useState({});var npcTempl=_nt[0];var sNpcTempl=_nt[1];var _sn=useState({});var spawned=_sn[0];var sSpawned=_sn[1];
var _pa=useState({});var pendAtk=_pa[0];var sPendAtk=_pa[1];
var _dme=useState({});var dmgEvents=_dme[0];var sDmgEvents=_dme[1];
var _ld=useState(false);var loaded=_ld[0];var sLoaded=_ld[1];
var _rcs=useState(null);var racesData=_rcs[0];var sRacesData=_rcs[1];
var _prf=useState(null);var profsData=_prf[0];var sProfsData=_prf[1];
var _nh=useState({});var npcHits=_nh[0];var sNpcHits=_nh[1];
var _shp=useState([]);var shop=_shp[0];var sShop=_shp[1];
var _ini=useState(null);var initiative=_ini[0];var sInitiative=_ini[1];
var _chat=useState([]);var chat=_chat[0];var sChat=_chat[1];
useEffect(function(){if(!room)return;sLoaded(false);
/* Чистим pendingAttacks старше 1 часа */
get(ref(db,"rooms/"+room+"/pendingAttacks")).then(function(snap){
  var data=snap.val()||{};var cutoff=Date.now()-3600000;
  Object.entries(data).forEach(function(e){if((e[1].ts||0)<cutoff)remove(ref(db,"rooms/"+room+"/pendingAttacks/"+e[0]));});
}).catch(function(){});
/* Чистим устаревшие события урона по NPC (старше 5 минут) */
get(ref(db,"rooms/"+room+"/npcHits")).then(function(snap){
  var data=snap.val()||{};var cut=Date.now()-300000;
  Object.entries(data).forEach(function(e){if((e[1].ts||0)<cut)remove(ref(db,"rooms/"+room+"/npcHits/"+e[0]));});
}).catch(function(){});
var u=[];u.push(onValue(ref(db,"rooms/"+room+"/characters"),function(s){sCh(s.val()||{});sLoaded(true)}));u.push(onValue(ref(db,"rooms/"+room+"/lore"),function(s){sLo(s.val()||{})}));u.push(onValue(ref(db,"rooms/"+room+"/mapData"),function(s){sMapData(s.val()||{})}));u.push(onValue(ref(db,"rooms/"+room+"/npcTemplates"),function(s){sNpcTempl(s.val()||{})}));u.push(onValue(ref(db,"rooms/"+room+"/spawned"),function(s){sSpawned(s.val()||{})}));u.push(onValue(ref(db,"rooms/"+room+"/logs"),function(s){var d=s.val()||{};sLg(Object.values(d).sort(function(a,b){return(b.ts||0)-(a.ts||0)}).slice(0,100))}));u.push(onValue(ref(db,"rooms/"+room+"/pendingAttacks"),function(s){sPendAtk(s.val()||{})}));
u.push(onValue(ref(db,"rooms/"+room+"/dmgEvents"),function(s){sDmgEvents(s.val()||{})}));u.push(onValue(ref(db,"rooms/"+room+"/races"),function(s){sRacesData(s.val()||null)}));u.push(onValue(ref(db,"rooms/"+room+"/npcHits"),function(s){sNpcHits(s.val()||{})}));u.push(onValue(ref(db,"rooms/"+room+"/shop"),function(s){sShop(s.val()||[])}));u.push(onValue(ref(db,"rooms/"+room+"/initiative"),function(s){sInitiative(s.val()||null)}));u.push(onValue(ref(db,"rooms/"+room+"/profs"),function(s){sProfsData(s.val()||null)}));u.push(onValue(ref(db,"rooms/"+room+"/chat"),function(s){var d=s.val()||{};sChat(Object.values(d).sort(function(a,b){return(a.ts||0)-(b.ts||0)}).slice(-200))}));return function(){u.forEach(function(x){x()})}},[room]);
/* Персонаж игрока привязан к логину — создаём один раз, если ещё нет */
useEffect(function(){if(!room||isGM||!pId)return;
get(ref(db,"rooms/"+room+"/characters/"+pId)).then(function(snap){
  if(snap.exists())return;
  set(ref(db,"rooms/"+room+"/characters/"+pId),nC(pId));
})},[room,isGM,pId]);
function saveChar(id,d){if(!room)return;var c=Object.assign({},d);delete c._fbId;set(ref(db,"rooms/"+room+"/characters/"+id),c);sCh(function(p){var n=Object.assign({},p);n[id]=c;return n})}
function deleteChar(id){if(!room)return;remove(ref(db,"rooms/"+room+"/characters/"+id))}
function saveLore(d){if(!room)return;set(ref(db,"rooms/"+room+"/lore"),d)}
function saveMap(d){if(!room)return;set(ref(db,"rooms/"+room+"/mapData"),d)}
function addLog(e){if(!room)return;set(ref(db,"rooms/"+room+"/logs/"+Date.now()),Object.assign({},e,{ts:Date.now()}))}
function clearLogs(){if(!room)return;set(ref(db,"rooms/"+room+"/logs"),null)}
function sendChat(who,text){if(!room)return;set(ref(db,"rooms/"+room+"/chat/"+Date.now()),{who:who,text:text,ts:Date.now()})}
function clearChat(){if(!room)return;set(ref(db,"rooms/"+room+"/chat"),null)}
function saveNpcTempl(d){if(!room)return;set(ref(db,"rooms/"+room+"/npcTemplates"),d)}
function savePendingAttack(d){if(!room)return;set(ref(db,"rooms/"+room+"/pendingAttacks/"+d.id),d)}
function clearPendingAttack(id){if(!room)return;remove(ref(db,"rooms/"+room+"/pendingAttacks/"+id))}
function clearDmgEvent(charId){if(!room)return;remove(ref(db,"rooms/"+room+"/dmgEvents/"+charId))}
function saveSpawned(d){if(!room)return;
  /* Пишем только изменённые/удалённые узлы NPC, чтобы параллельные правки
     других NPC (напр. два игрока бьют разных мобов) не затирали друг друга. */
  var updates={};
  Object.keys(d||{}).forEach(function(k){if(d[k]!==spawned[k])updates["rooms/"+room+"/spawned/"+k]=d[k];});
  Object.keys(spawned||{}).forEach(function(k){if(!d||!(k in d))updates["rooms/"+room+"/spawned/"+k]=null;});
  if(Object.keys(updates).length)update(ref(db),updates);
}
function saveRaces(d){if(!room)return;set(ref(db,"rooms/"+room+"/races"),d)}
function saveProfs(d){if(!room)return;set(ref(db,"rooms/"+room+"/profs"),d)}
function saveNpcHit(ev){if(!room)return;var id=Date.now()+"_"+Math.floor(Math.random()*1000);set(ref(db,"rooms/"+room+"/npcHits/"+id),ev)}
function clearNpcHit(id){if(!room)return;remove(ref(db,"rooms/"+room+"/npcHits/"+id))}
function saveShop(d){if(!room)return;set(ref(db,"rooms/"+room+"/shop"),d)}
function saveInitiative(d){if(!room)return;set(ref(db,"rooms/"+room+"/initiative"),d)}
function changeAccount(currentPassword,newLogin,newPassword){
  return authChangeAccount(room,auth.login,currentPassword,newLogin,newPassword).then(function(res){
    if(res.ok){
      setAuth({login:res.login,role:res.role});
      try{localStorage.setItem("nox_session",JSON.stringify({login:res.login,role:res.role}))}catch(e){}
    }
    return res;
  })
}
function leave(){
  if(!window.confirm("Выйти?"))return;
  setAuth(null);sCh({});sLo({});sLg([]);
  try{localStorage.removeItem("nox_session")}catch(e){}
}
var _sd=useState(false);var showDonate=_sd[0];var sShowDonate=_sd[1];var _sb2=useState(false);var showBestApp=_sb2[0];var sShowBestApp=_sb2[1];
if(!auth)return <Login onAuth={handleAuth}/>;
var ca=Object.entries(chars).map(function(e){return Object.assign({},e[1],{_fbId:e[0]})});
setRaces(racesData);setProfs(profsData);
return(<div style={{fontFamily:"'Inter',sans-serif",color:"var(--color-text)",background:"var(--color-bg)",minHeight:"100vh",width:"100%",display:"flex",flexDirection:"column"}}><style>{CSS}</style>
{showDonate&&<DonatePage onClose={function(){sShowDonate(false)}} isGM={isGM} saveMap={saveMap} mapData={mapData}/>}
{isGM&&<NpcHitPopup events={npcHits} onClear={clearNpcHit}/>}
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",rowGap:6,padding:"10px 16px",borderBottom:"1px solid var(--color-divider)",gap:8,flexShrink:0}}>
<span style={{fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:14,whiteSpace:"nowrap"}}>✦ Nox Aeterna<span style={{fontSize:10,color:"var(--color-text-muted)",fontWeight:400,marginLeft:6}}>v2.0</span></span>
<div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
<button onClick={function(){sShowDonate(true)}} className="n-btn n-btn-secondary" style={{padding:"5px 10px",fontSize:11}}>💰 Донат</button>
<span className="n-tag" style={{background:isGM?"rgba(124,58,237,.16)":"rgba(145,132,217,.14)",color:isGM?"#a78bfa":"var(--color-accent)",whiteSpace:"nowrap"}}>{(isGM?"🎭 ГМ · ":"👤 ")+auth.login}</span>
<button onClick={leave} className="n-btn" style={{color:"#ef4444",padding:"5px 8px",fontSize:11}}>Выйти</button>
</div>
</div>
{isGM?<GMPanel characters={ca} saveChar={saveChar} deleteChar={deleteChar} lore={lore} saveLore={saveLore} logs={logs} addLog={addLog} clearLogs={clearLogs} chat={chat} sendChat={sendChat} clearChat={clearChat} myName={auth.login} mapData={mapData} saveMap={saveMap} npcTempl={npcTempl} saveNpcTempl={saveNpcTempl} spawned={spawned} saveSpawned={saveSpawned} roomCode={room} pendAtk={pendAtk} savePendingAttack={savePendingAttack} clearPendingAttack={clearPendingAttack} showBest={showBestApp} setShowBest={sShowBestApp} races={racesData} saveRaces={saveRaces} saveNpcHit={saveNpcHit} shop={shop} saveShop={saveShop} initiative={initiative} saveInitiative={saveInitiative} profs={profsData} saveProfs={saveProfs}/>:(function(){var my=ca.find(function(c){return c._fbId===pId});if(!my)return <div style={{padding:20,textAlign:"center"}}><div style={{fontFamily:"'Inter',sans-serif",fontSize:16,fontWeight:700}}>⏳ Подключение...</div></div>;return <GameView char={my} save={function(d){saveChar(pId,d)}} isGM={false} logs={logs} addLog={addLog} chat={chat} sendChat={sendChat} lore={lore} mapData={mapData} saveMap={saveMap} characters={ca} spawned={spawned} saveSpawned={saveSpawned} pendAtk={pendAtk} clearPendingAttack={clearPendingAttack} savePendingAttack={savePendingAttack} room={room} dmgEvents={dmgEvents} clearDmgEvent={clearDmgEvent} saveNpcHit={saveNpcHit} shop={shop} initiative={initiative} changeAccount={changeAccount}/>})()}
</div>)}

