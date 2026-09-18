import React, { useState } from 'react';
import { IconBattle, IconChar, IconChat, IconLib, IconScroll } from '../icons/index';
import BestiaryEditor from './gm/BestiaryEditor';
import Sidebar from './Sidebar';
import PartyRail from './PartyRail';
import ChatTab from './tabs/ChatTab';
import CharTab from './tabs/CharTab';
import CheatTab from './tabs/CheatTab';
import CombatTab from './tabs/CombatTab';
import DamagePopup from './combat/DamagePopup';
import GMAttackPanel from './combat/GMAttackPanel';
import LibTab from './tabs/LibTab';
import NpcDeathPopup from './combat/NpcDeathPopup';
import PendingAttackPopup from './combat/PendingAttackPopup';
import PlayerAttackNotif from './combat/PlayerAttackNotif';
import PlayerAttackStatus from './combat/PlayerAttackStatus';
import RollPopup from './combat/RollPopup';

function GameView(pr){var c=pr.char;var _t=useState("chat");var tab=_t[0];var sT=_t[1];var _r=useState(null);var rP=_r[0];var sRP=_r[1];
var _de=useState(null);var dmgEv=_de[0];var sDmgEv=_de[1];
var _nd=useState(null);var npcDeathEv=_nd[0];var sNpcDeathEv=_nd[1];
var _cp=useState(null);var coopTarget=_cp[0];var sCoopTarget=_cp[1];
function quickRoll(charId){sT("chat");sCoopTarget(charId)}
var tabs=[{id:"chat",l:"Чат",ic:<IconChat/>},{id:"character",l:"Профиль",ic:<IconChar/>},{id:"combat",l:"Бой",ic:<IconBattle/>},{id:"library",l:"Лор",ic:<IconLib/>},{id:"guide",l:"Памятка",ic:<IconScroll/>}];
var pendAtk=pr.pendAtk||{};var clearPA=pr.clearPendingAttack;var isGMv=pr.isGM;
return(<div style={{flex:1,display:"flex",minHeight:0}}><RollPopup roll={rP} onClose={function(){sRP(null)}}/>{!isGMv&&<PendingAttackPopup attacks={pendAtk} myId={pr.char._fbId} myChar={pr.char} clearPendingAttack={clearPA} addLog={pr.addLog} onRoll={sRP} room={pr.room}/>}{!isGMv&&<PlayerAttackStatus attacks={pendAtk} myName={pr.char.name} myId={pr.char._fbId} room={pr.room} spawned={pr.spawned||{}} saveSpawned={pr.saveSpawned} addLog={pr.addLog} onRoll={sRP} saveNpcHit={pr.saveNpcHit}/>}{isGMv&&<GMAttackPanel attacks={pendAtk} clearPendingAttack={clearPA} characters={pr.characters||[]} room={pr.room} addLog={pr.addLog} onRoll={sRP}/>}{!isGMv&&(function(){var myEvs=Object.entries(pr.dmgEvents||{}).filter(function(e){return e[1]&&pr.char._fbId===e[0]});if(myEvs.length===0)return null;var ev=myEvs[0];return <DamagePopup event={ev[1]} onClose={function(){if(pr.clearDmgEvent)pr.clearDmgEvent(ev[0]);sDmgEv(null);}}/>;})()}{isGMv&&npcDeathEv&&<NpcDeathPopup event={npcDeathEv} onClose={function(){sNpcDeathEv(null)}}/>}{isGMv&&<PlayerAttackNotif attacks={pendAtk} clearPendingAttack={clearPA} spawned={pr.spawned||{}} saveSpawned={pr.saveSpawned} addLog={pr.addLog} onRoll={sRP} room={pr.room}/>}
<Sidebar char={c} save={pr.save} onRoll={sRP} addLog={pr.addLog}/>
<div style={{flex:1,minWidth:0,minHeight:0,display:"flex",flexDirection:"column"}}>
<div style={{display:"flex",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid var(--color-divider)",gap:8}}>{pr.onBack&&<button onClick={pr.onBack} className="n-btn" style={{padding:"4px 8px",fontSize:14}}>←</button>}<div style={{flex:1}}><div style={{fontSize:15,fontWeight:600}}>{c.name||"Герой"}{pr.isGM&&<span style={{fontSize:11,color:"#a78bfa",marginLeft:6,fontWeight:500}}>ГМ</span>}</div><div style={{fontSize:11,color:"var(--color-text-muted)"}}>Ур. {c.level}</div></div></div>
<div style={{display:"flex",gap:2,padding:"0 8px",borderBottom:"1px solid var(--color-divider)",overflowX:"auto"}}>{tabs.map(function(t){return <button key={t.id} onClick={function(){sT(t.id)}} style={{flex:"1 0 auto",minWidth:56,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 4px",border:"none",borderBottom:tab===t.id?"2px solid var(--color-accent)":"2px solid transparent",cursor:"pointer",fontFamily:"'Inter',sans-serif",background:"transparent",color:tab===t.id?"var(--color-accent)":"var(--color-text-muted)",fontWeight:tab===t.id?600:500,fontSize:10.5}}>{t.ic}<span>{t.l}</span></button>})}</div>
<div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",padding:tab==="chat"?12:16,overflowY:tab==="chat"?"hidden":"auto"}}>
{tab==="chat"&&<ChatTab chat={pr.chat} logs={pr.logs} sendChat={pr.sendChat} addLog={pr.addLog} char={isGMv?null:c} characters={pr.characters} who={isGMv?"Мастер":(c.name||"???")} coopTarget={coopTarget} onCoopConsumed={function(){sCoopTarget(null)}}/>}
{tab==="character"&&<CharTab char={c} save={pr.save} onRoll={sRP} isGM={pr.isGM} addLog={pr.addLog} changeAccount={pr.changeAccount}/>}
{tab==="combat"&&<CombatTab char={c} save={pr.save} logs={pr.logs} addLog={pr.addLog} onRoll={sRP} spawned={pr.spawned} saveSpawned={pr.saveSpawned} characters={pr.characters} isGM={pr.isGM} onDmgEvent={sDmgEv} onNpcDeath={sNpcDeathEv} savePendingAttack={pr.savePendingAttack} room={pr.room} saveNpcHit={pr.saveNpcHit} shop={pr.shop} initiative={pr.initiative} saveInitiative={pr.saveInitiative}/>}
{tab==="library"&&<LibTab lore={pr.lore} mapData={pr.mapData} saveMap={pr.saveMap} characters={pr.characters} isGM={pr.isGM} charId={c._fbId}/>}
{tab==="guide"&&<CheatTab/>}
</div></div>
<PartyRail characters={pr.characters} selfId={c._fbId} onQuickRoll={quickRoll}/>
</div>)}

/* ── BestiaryEditor — ГМ видит попап с броском ── */

export default GameView;
