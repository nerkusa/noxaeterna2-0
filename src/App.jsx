import React, { useState, useEffect } from 'react';
import { db, ref, set, get, onValue, update, remove } from './firebase';
import { CSS } from './styles/globalCss';
import { nC } from './utils/character';
import { setRaces } from './utils/raceStore';
import { setProfs } from './utils/profStore';
import DonatePage from './components/gm/DonatePage';
import GameView from './components/GameView';
import GMPanel from './components/gm/GMPanel';
import Lobby from './components/Lobby';
import NpcHitPopup from './components/combat/NpcHitPopup';

export default function App(){
var _r=useState(null);var room=_r[0];var setRoom=_r[1];var _gm=useState(false);var isGM=_gm[0];var setIsGM=_gm[1];var _pn=useState("");var pN=_pn[0];var sPN=_pn[1];var _pid=useState(null);var pId=_pid[0];var sPId=_pid[1];
/* Автовход из localStorage */
useEffect(function(){
  try{
    var saved=localStorage.getItem("nox_session");
    if(!saved)return;
    var s=JSON.parse(saved);
    if(!s.room)return;
    /* Проверяем что комната ещё существует */
    get(ref(db,"rooms/"+s.room)).then(function(snap){
      if(!snap.exists())return;
      setRoom(s.room);
      setIsGM(!!s.isGM);
      if(s.playerName)sPN(s.playerName);
    }).catch(function(){});
  }catch(e){}
},[]);
var _ch=useState({});var chars=_ch[0];var sCh=_ch[1];var _lo=useState({});var lore=_lo[0];var sLo=_lo[1];var _mp=useState({});var mapData=_mp[0];var sMapData=_mp[1];var _lg=useState([]);var logs=_lg[0];var sLg=_lg[1];var _nt=useState({});var npcTempl=_nt[0];var sNpcTempl=_nt[1];var _sn=useState({});var spawned=_sn[0];var sSpawned=_sn[1];
var _pa=useState({});var pendAtk=_pa[0];var sPendAtk=_pa[1];
var _dme=useState({});var dmgEvents=_dme[0];var sDmgEvents=_dme[1];
var _ld=useState(false);var loaded=_ld[0];var sLoaded=_ld[1];
var _rcs=useState(null);var racesData=_rcs[0];var sRacesData=_rcs[1];
var _prf=useState(null);var profsData=_prf[0];var sProfsData=_prf[1];
var _nh=useState({});var npcHits=_nh[0];var sNpcHits=_nh[1];
var _shp=useState([]);var shop=_shp[0];var sShop=_shp[1];
var _ini=useState(null);var initiative=_ini[0];var sInitiative=_ini[1];
function handleJoin(rc,nm,gm){
  setRoom(rc);setIsGM(gm);if(nm)sPN(nm);
  try{localStorage.setItem("nox_session",JSON.stringify({room:rc,isGM:!!gm,playerName:nm||""}))}catch(e){}
}
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
u.push(onValue(ref(db,"rooms/"+room+"/dmgEvents"),function(s){sDmgEvents(s.val()||{})}));u.push(onValue(ref(db,"rooms/"+room+"/races"),function(s){sRacesData(s.val()||null)}));u.push(onValue(ref(db,"rooms/"+room+"/npcHits"),function(s){sNpcHits(s.val()||{})}));u.push(onValue(ref(db,"rooms/"+room+"/shop"),function(s){sShop(s.val()||[])}));u.push(onValue(ref(db,"rooms/"+room+"/initiative"),function(s){sInitiative(s.val()||null)}));u.push(onValue(ref(db,"rooms/"+room+"/profs"),function(s){sProfsData(s.val()||null)}));return function(){u.forEach(function(x){x()})}},[room]);
useEffect(function(){if(!room||isGM||!pN||pId)return;
get(ref(db,"rooms/"+room+"/characters")).then(function(snap){
  var data=snap.val()||{};
  var ex=Object.entries(data).find(function(e){return e[1].name===pN});
  if(ex){sPId(ex[0]);return}
  var nid="p_"+Date.now();
  set(ref(db,"rooms/"+room+"/characters/"+nid),nC(pN));
  sPId(nid);
})},[room,isGM,pN,pId]);
function saveChar(id,d){if(!room)return;var c=Object.assign({},d);delete c._fbId;set(ref(db,"rooms/"+room+"/characters/"+id),c);sCh(function(p){var n=Object.assign({},p);n[id]=c;return n})}
function deleteChar(id){if(!room)return;remove(ref(db,"rooms/"+room+"/characters/"+id))}
function saveLore(d){if(!room)return;set(ref(db,"rooms/"+room+"/lore"),d)}
function saveMap(d){if(!room)return;set(ref(db,"rooms/"+room+"/mapData"),d)}
function addLog(e){if(!room)return;set(ref(db,"rooms/"+room+"/logs/"+Date.now()),Object.assign({},e,{ts:Date.now()}))}
function clearLogs(){if(!room)return;set(ref(db,"rooms/"+room+"/logs"),null)}
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
function leave(){
  if(!window.confirm("Выйти из комнаты?"))return;
  setRoom(null);setIsGM(false);sPN("");sPId(null);sCh({});sLo({});sLg([]);
  try{localStorage.removeItem("nox_session")}catch(e){}
}
var _cp=useState(false);var cp=_cp[0];var sCP=_cp[1];var _sd=useState(false);var showDonate=_sd[0];var sShowDonate=_sd[1];var _sb2=useState(false);var showBestApp=_sb2[0];var sShowBestApp=_sb2[1];
if(!room)return <Lobby onJoin={handleJoin}/>;
var ca=Object.entries(chars).map(function(e){return Object.assign({},e[1],{_fbId:e[0]})});
setRaces(racesData);setProfs(profsData);
return(<div style={{fontFamily:"'Nunito',sans-serif",color:"#e8e0d4",background:"linear-gradient(180deg,#221e17,#14110c)",minHeight:"100vh",maxWidth:520,margin:"0 auto",display:"flex",flexDirection:"column"}}><style>{CSS}</style>
{showDonate&&<DonatePage onClose={function(){sShowDonate(false)}} isGM={isGM} saveMap={saveMap} mapData={mapData}/>}
{isGM&&<NpcHitPopup events={npcHits} onClear={clearNpcHit}/>}
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 10px",background:"#1b1813",color:"#e8e0d4",fontSize:10,gap:4}}><span style={{fontFamily:"'Cinzel',serif",fontWeight:700}}>✦ Nox Aeterna <span style={{fontSize:7,opacity:0.5,fontWeight:400}}>v1.2.0.1</span></span><div style={{display:"flex",gap:4,alignItems:"center"}}><button onClick={function(){sShowDonate(true)}} style={{background:"linear-gradient(90deg,#f59e0b,#d97706)",border:"none",borderRadius:4,padding:"2px 8px",color:"#ece5d8",cursor:"pointer",fontSize:9,fontFamily:"'Cinzel',serif",fontWeight:700}}>💰 Донат</button><button onClick={function(){if(navigator.clipboard){navigator.clipboard.writeText(room);sCP(true);setTimeout(function(){sCP(false)},1500)}}} style={{background:"none",border:"1px solid #3a3429",borderRadius:4,padding:"2px 8px",color:"#e8e0d4",cursor:"pointer",fontSize:10,fontFamily:"'Cinzel',serif"}}>{cp?"✓":"Код: "+room}</button><button onClick={leave} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:10}}>Выйти</button></div></div>
{isGM?<GMPanel characters={ca} saveChar={saveChar} deleteChar={deleteChar} lore={lore} saveLore={saveLore} logs={logs} addLog={addLog} clearLogs={clearLogs} mapData={mapData} saveMap={saveMap} npcTempl={npcTempl} saveNpcTempl={saveNpcTempl} spawned={spawned} saveSpawned={saveSpawned} roomCode={room} pendAtk={pendAtk} savePendingAttack={savePendingAttack} clearPendingAttack={clearPendingAttack} showBest={showBestApp} setShowBest={sShowBestApp} races={racesData} saveRaces={saveRaces} saveNpcHit={saveNpcHit} shop={shop} saveShop={saveShop} initiative={initiative} saveInitiative={saveInitiative} profs={profsData} saveProfs={saveProfs}/>:(function(){var my=ca.find(function(c){return c._fbId===pId});if(!my)return <div style={{padding:20,textAlign:"center"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700}}>⏳ Подключение...</div></div>;return <GameView char={my} save={function(d){saveChar(pId,d)}} isGM={false} logs={logs} addLog={addLog} lore={lore} mapData={mapData} saveMap={saveMap} characters={ca} spawned={spawned} saveSpawned={saveSpawned} pendAtk={pendAtk} clearPendingAttack={clearPendingAttack} savePendingAttack={savePendingAttack} room={room} dmgEvents={dmgEvents} clearDmgEvent={clearDmgEvent} saveNpcHit={saveNpcHit} shop={shop} initiative={initiative}/>})()}
</div>)}

