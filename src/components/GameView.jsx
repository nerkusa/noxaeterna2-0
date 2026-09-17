import React, { useState } from 'react';
import { IconBattle, IconChar, IconInv, IconLib, IconParty } from '../icons/index';
import BestiaryEditor from './gm/BestiaryEditor';
import CharTab from './tabs/CharTab';
import CheatTab from './tabs/CheatTab';
import CombatTab from './tabs/CombatTab';
import DamagePopup from './combat/DamagePopup';
import GMAttackPanel from './combat/GMAttackPanel';
import InvTab from './tabs/InvTab';
import LibTab from './tabs/LibTab';
import NpcDeathPopup from './combat/NpcDeathPopup';
import PartyView from './tabs/PartyView';
import PendingAttackPopup from './combat/PendingAttackPopup';
import PlayerAttackNotif from './combat/PlayerAttackNotif';
import PlayerAttackStatus from './combat/PlayerAttackStatus';
import RollPopup from './combat/RollPopup';

function GameView(pr){var c=pr.char;var _t=useState("character");var tab=_t[0];var sT=_t[1];var _r=useState(null);var rP=_r[0];var sRP=_r[1];
var _de=useState(null);var dmgEv=_de[0];var sDmgEv=_de[1];
var _nd=useState(null);var npcDeathEv=_nd[0];var sNpcDeathEv=_nd[1];
var tabs=[{id:"character",l:"Игрок",ic:<IconChar/>},{id:"combat",l:"Бой",ic:<IconBattle/>},{id:"inventory",l:"Инв.",ic:<IconInv/>},{id:"party",l:"Группа",ic:<IconParty/>},{id:"library",l:"Лор",ic:<IconLib/>},{id:"guide",l:"Памятка",ic:<span style={{fontSize:15}}>📋</span>}];
var pendAtk=pr.pendAtk||{};var clearPA=pr.clearPendingAttack;var isGMv=pr.isGM;
return(<div style={{flex:1,display:"flex",flexDirection:"column"}}><RollPopup roll={rP} onClose={function(){sRP(null)}}/>{!isGMv&&<PendingAttackPopup attacks={pendAtk} myId={pr.char._fbId} myChar={pr.char} clearPendingAttack={clearPA} addLog={pr.addLog} onRoll={sRP} room={pr.room}/>}{!isGMv&&<PlayerAttackStatus attacks={pendAtk} myName={pr.char.name} myId={pr.char._fbId} room={pr.room} spawned={pr.spawned||{}} saveSpawned={pr.saveSpawned} addLog={pr.addLog} onRoll={sRP} saveNpcHit={pr.saveNpcHit}/>}{isGMv&&<GMAttackPanel attacks={pendAtk} clearPendingAttack={clearPA} characters={pr.characters||[]} room={pr.room} addLog={pr.addLog} onRoll={sRP}/>}{!isGMv&&(function(){var myEvs=Object.entries(pr.dmgEvents||{}).filter(function(e){return e[1]&&pr.char._fbId===e[0]});if(myEvs.length===0)return null;var ev=myEvs[0];return <DamagePopup event={ev[1]} onClose={function(){if(pr.clearDmgEvent)pr.clearDmgEvent(ev[0]);sDmgEv(null);}}/>;})()}{isGMv&&npcDeathEv&&<NpcDeathPopup event={npcDeathEv} onClose={function(){sNpcDeathEv(null)}}/>}{isGMv&&<PlayerAttackNotif attacks={pendAtk} clearPendingAttack={clearPA} spawned={pr.spawned||{}} saveSpawned={pr.saveSpawned} addLog={pr.addLog} onRoll={sRP} room={pr.room}/>}
<div style={{display:"flex",alignItems:"center",padding:"6px 8px 2px",borderBottom:"2px solid #322d24",background:"#221e17",gap:5}}>{pr.onBack&&<button onClick={pr.onBack} style={{background:"none",border:"none",fontSize:14,cursor:"pointer",color:"#a89a82"}}>←</button>}<div style={{flex:1,textAlign:"center"}}><div style={{fontSize:12,fontFamily:"'Cinzel',serif",fontWeight:900}}>{c.name||"Герой"}{pr.isGM&&<span style={{fontSize:8,color:"#7c3aed",marginLeft:3}}>ГМ</span>}</div><div style={{fontSize:8,color:"#a89a82"}}>Ур.{c.level}</div></div></div>
<div style={{display:"flex",gap:1,padding:"2px 2px 0",background:"#262219",borderBottom:"1px solid #322d24"}}>{tabs.map(function(t){return <button key={t.id} onClick={function(){sT(t.id)}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"4px 1px",border:"none",borderRadius:"6px 6px 0 0",cursor:"pointer",fontFamily:"'Nunito',sans-serif",background:tab===t.id?"#2c2820":"transparent",color:tab===t.id?"#cbb990":"#a89a82",fontWeight:tab===t.id?700:500,fontSize:8}}>{t.ic}<span>{t.l}</span></button>})}</div>
<div style={{flex:1,padding:8,overflowY:"auto"}}>
{tab==="character"&&<CharTab char={c} save={pr.save} onRoll={sRP} isGM={pr.isGM} addLog={pr.addLog}/>}
{tab==="combat"&&<CombatTab char={c} save={pr.save} logs={pr.logs} addLog={pr.addLog} onRoll={sRP} spawned={pr.spawned} saveSpawned={pr.saveSpawned} characters={pr.characters} isGM={pr.isGM} onDmgEvent={sDmgEv} onNpcDeath={sNpcDeathEv} savePendingAttack={pr.savePendingAttack} room={pr.room} saveNpcHit={pr.saveNpcHit} shop={pr.shop} initiative={pr.initiative}/>}
{tab==="inventory"&&<InvTab char={c} save={pr.save} shop={pr.shop}/>}
{tab==="party"&&<PartyView characters={pr.characters} selfId={c._fbId}/>}
{tab==="library"&&<LibTab lore={pr.lore} mapData={pr.mapData} saveMap={pr.saveMap} characters={pr.characters} isGM={pr.isGM} charId={c._fbId}/>}
{tab==="guide"&&<CheatTab/>}
</div></div>)}

/* ── BestiaryEditor — ГМ видит попап с броском ── */

export default GameView;
