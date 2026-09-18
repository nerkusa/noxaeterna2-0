import React, { useState } from 'react';
import { getProfs } from '../../utils/profStore';
import { cF, mHP, xpProgress, levelUpReward } from '../../utils/character';
import BestiaryEditor from './BestiaryEditor';
import DonatePage from './DonatePage';
import GameView from '../GameView';
import GMRoll from './GMRoll';
import ChatTab from '../tabs/ChatTab';
import CoopRollPopup from '../combat/CoopRollPopup';
import RollPopup from '../combat/RollPopup';
import LoreEditor from './LoreEditor';
import ProfEditor from './ProfEditor';
import RaceEditor from './RaceEditor';
import ShopEditor from './ShopEditor';
import TraitEditor from './TraitEditor';

function CharCard(pr){var c=pr.char;var inf=cF(c);var pf=getProfs().find(function(p){return p.id===c.profId})||getProfs()[0];var mx=c.hpOv||mHP(inf.fs,c);var ch=c.curHp!==null&&c.curHp!==undefined?c.curHp:mx;var xpp=xpProgress(c);
var _xg=useState("");var xg=_xg[0];var sXg=_xg[1];
function giveXp(){var amt=parseInt(xg)||0;if(!amt)return;pr.saveChar(c._fbId,Object.assign({},c,{xp:Math.max(0,(c.xp||0)+amt)}));sXg("")}
return(<div style={{background:"#1b1d29",border:"2px solid #c084fc18",borderRadius:9,padding:"7px 9px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:12}}>{c.name||"?"} <span style={{fontSize:8,color:"#9397ab"}}>{pf.name} Ур.{c.level}</span>{c.active&&<span style={{fontSize:7,background:"#10b981",color:"#fff",borderRadius:3,padding:"1px 4px",marginLeft:4}}>В ИГРЕ</span>}</span><div style={{display:"flex",gap:2}}><button onClick={function(){pr.saveChar(c._fbId,Object.assign({},c,{active:!c.active}))}} style={{padding:"3px 7px",borderRadius:5,border:"1px solid "+(c.active?"#10b98140":"#34374a"),background:c.active?"#0e2018":"#1b1d29",fontWeight:700,fontSize:8,color:c.active?"#34d399":"#9397ab",cursor:"pointer"}}>{c.active?"✓ Активен":"В игру"}</button><button onClick={function(){pr.onOpen(c._fbId)}} style={{padding:"3px 8px",borderRadius:5,border:"1px solid #7c3aed28",background:"#1f1330",fontWeight:700,fontSize:9,color:"#7c3aed",cursor:"pointer"}}>Открыть</button></div></div>
<div style={{fontSize:9}}>{"❤️ "+ch+"/"+mx+" 🔥 "+(inf.fs.WILL||0)}</div>
<div style={{marginTop:3}}>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:xpp.ready?"#34d399":"#9397ab"}}><span>{"XP: "+xpp.got+"/"+xpp.need+" до ур."+(xpp.level+1)}</span>{xpp.ready&&<span>✓ готов</span>}</div>
  <div style={{height:4,borderRadius:2,background:"#0e0f16",overflow:"hidden",marginTop:1}}><div style={{width:xpp.pct+"%",height:"100%",background:xpp.ready?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#f59e0b,#fbbf24)"}}/></div>
</div>
<div style={{display:"flex",gap:2,marginTop:3,flexWrap:"wrap"}}>
  <button onClick={function(){var nl=c.level+1;var rw=levelUpReward(nl);pr.saveChar(c._fbId,Object.assign({},c,{level:nl,statPts:(c.statPts||0)+rw.stat,skillPts:(c.skillPts||0)+rw.skill,levelUpPending:{level:nl,stat:rw.stat,skill:rw.skill}}))}} title={"Повысить уровень (награда за ур."+(c.level+1)+": "+levelUpReward(c.level+1).stat+" очк. хар. + "+levelUpReward(c.level+1).skill+" очк. нав.)"} style={{padding:"3px 6px",borderRadius:4,border:"1px solid "+(xpp.ready?"#10b981":"#10b98128"),background:xpp.ready?"#10b981":"#0e2018",fontSize:8,fontWeight:700,color:xpp.ready?"#fff":"#34d399",cursor:"pointer"}}>⬆️ Ур.+1</button>
  <button onClick={function(){pr.saveChar(c._fbId,Object.assign({},c,{curHp:c.hpOv||mHP(cF(c).fs,c),curWill:c.willOv||cF(c).fs.WILL||1}))}} style={{padding:"3px 6px",borderRadius:4,border:"1px solid #10b98128",background:"#0e2018",fontSize:8,fontWeight:700,color:"#34d399",cursor:"pointer"}}>💤</button>
  {[-5,-1,1,5].map(function(d){return <button key={d} onClick={function(){var mx2=c.hpOv||mHP(cF(c).fs,c);var cur=c.curHp!==null&&c.curHp!==undefined?c.curHp:mx2;pr.saveChar(c._fbId,Object.assign({},c,{curHp:Math.max(0,Math.min(mx2,cur+d))}))}} style={{padding:"3px 5px",borderRadius:4,border:"1px solid #ef444420",background:d<0?"#2a1414":"#0e2018",fontSize:8,fontWeight:700,color:d<0?"#ef4444":"#10b981",cursor:"pointer"}}>{"HP"+(d>0?"+":"")+d}</button>})}
  <button onClick={function(){if(window.confirm("Удалить "+c.name+"?"))pr.deleteChar(c._fbId)}} style={{padding:"3px 6px",borderRadius:4,border:"1px solid #ef444440",background:"#2a1414",fontSize:8,fontWeight:700,color:"#ef4444",cursor:"pointer"}}>🗑️ Удалить</button>
</div>
<div style={{display:"flex",gap:3,marginTop:3}}>
  <input type="number" value={xg} onChange={function(e){sXg(e.target.value)}} placeholder="XP" style={{width:50,padding:"2px 4px",fontSize:8,borderRadius:4,border:"1px solid #34374a",background:"#161826",color:"#e9e9ed"}}/>
  <button onClick={giveXp} style={{padding:"3px 8px",borderRadius:4,border:"1px solid #f0b35240",background:"#241c08",fontSize:8,fontWeight:700,color:"#f0b352",cursor:"pointer"}}>Выдать XP</button>
</div>
</div>)}

function GMPanel(pr){var _s=useState(null);var sid=_s[0];var sS=_s[1];var _sl=useState(false);var sl=_sl[0];var sSL=_sl[1];
var showBest=pr.showBest||false;var sShowBest=pr.setShowBest||function(){};var _rv=useState(false);var rv=_rv[0];var sRV=_rv[1];var _sh=useState(false);var shp=_sh[0];var sShp=_sh[1];var _pe=useState(false);var pe=_pe[0];var sPE=_pe[1];var _ct=useState(false);var ct=_ct[0];var sCt=_ct[1];var _tr=useState(false);var tr=_tr[0];var sTr=_tr[1];var _crp=useState(null);var chatRoll=_crp[0];var sChatRoll=_crp[1];var _ccr=useState(null);var chatCoopRoll=_ccr[0];var sChatCoopRoll=_ccr[1];
var sel=pr.characters.find(function(c){return c._fbId===sid});
if(sel)return <GameView char={sel} save={function(d){pr.saveChar(sel._fbId,d)}} onBack={function(){sS(null)}} isGM={true} logs={pr.logs} addLog={pr.addLog} chat={pr.chat} sendChat={pr.sendChat} lore={pr.lore} mapData={pr.mapData} saveMap={pr.saveMap} characters={pr.characters} spawned={pr.spawned} saveSpawned={pr.saveSpawned} pendAtk={pr.pendAtk} clearPendingAttack={pr.clearPendingAttack} room={pr.roomCode} savePendingAttack={pr.savePendingAttack} saveNpcHit={pr.saveNpcHit} shop={pr.shop} initiative={pr.initiative} saveInitiative={pr.saveInitiative} traits={pr.traits}/>;
if(ct)return(<div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}><RollPopup roll={chatRoll} onClose={function(){sChatRoll(null)}}/><CoopRollPopup roll={chatCoopRoll} onClose={function(){sChatCoopRoll(null)}}/><div style={{padding:"10px 14px",borderBottom:"1px solid var(--color-divider)",display:"flex",alignItems:"center",gap:8}}><button onClick={function(){sCt(false)}} className="n-btn" style={{padding:"4px 8px",fontSize:14}}>←</button><span style={{fontWeight:600,fontSize:14,flex:1}}>💬 Чат</span>{pr.clearChat&&<button onClick={function(){if(!window.confirm("Очистить весь чат (сообщения и броски)?"))return;pr.clearChat();if(pr.clearLogs)pr.clearLogs()}} className="n-btn" style={{padding:"4px 8px",fontSize:11,color:"#ef4444"}}>Очистить</button>}</div><div style={{flex:1,minHeight:0,padding:12}}><ChatTab chat={pr.chat} logs={pr.logs} sendChat={pr.sendChat} addLog={pr.addLog} onRoll={sChatRoll} onCoopRoll={sChatCoopRoll} characters={pr.characters} who="Мастер"/></div></div>);
if(sl)return(<div style={{flex:1,display:"flex",flexDirection:"column"}}><div style={{padding:"8px 10px",borderBottom:"2px solid #c084fc28",background:"#1f1330",display:"flex",alignItems:"center",gap:6}}><button onClick={function(){sSL(false)}} style={{background:"none",border:"none",fontSize:14,cursor:"pointer",color:"#9397ab"}}>←</button><span style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:14,color:"#7c3aed"}}>📚 Лорбук</span></div><div style={{flex:1,padding:8,overflowY:"auto"}}><LoreEditor lore={pr.lore} saveLore={pr.saveLore} mapData={pr.mapData} saveMap={pr.saveMap} characters={pr.characters}/></div></div>);
if(rv)return(<div style={{flex:1,padding:8,overflowY:"auto"}}><RaceEditor races={pr.races} saveRaces={pr.saveRaces} onBack={function(){sRV(false)}}/></div>);
if(pe)return(<div style={{flex:1,padding:8,overflowY:"auto"}}><ProfEditor profs={pr.profs} saveProfs={pr.saveProfs} onBack={function(){sPE(false)}}/></div>);
if(shp)return(<div style={{flex:1,padding:8,overflowY:"auto"}}><ShopEditor shop={pr.shop} saveShop={pr.saveShop} onBack={function(){sShp(false)}}/></div>);
if(tr)return(<div style={{flex:1,padding:8,overflowY:"auto"}}><TraitEditor traits={pr.traits} saveTraits={pr.saveTraits} onBack={function(){sTr(false)}}/></div>);
if(showBest)return <BestiaryEditor npcTempl={pr.npcTempl} saveNpcTempl={pr.saveNpcTempl} spawned={pr.spawned} saveSpawned={pr.saveSpawned} onBack={function(){sShowBest(false)}} addLog={pr.addLog} characters={pr.characters} roomCode={pr.roomCode} savePendingAttack={pr.savePendingAttack} clearPendingAttack={pr.clearPendingAttack} pendAtk={pr.pendAtk} logs={pr.logs} initiative={pr.initiative} saveInitiative={pr.saveInitiative}/>;
return(<div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column"}}><div style={{padding:"8px 10px",borderBottom:"2px solid #c084fc28",background:"#1f1330"}}><div style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:16,color:"#7c3aed",textAlign:"center"}}>🎭 ГМ</div></div><div style={{flex:1,padding:8,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
<button onClick={function(){sCt(true)}} style={{width:"100%",padding:10,borderRadius:9,border:"2px solid var(--color-accent)",background:"rgba(145,132,217,.12)",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:"var(--color-accent)",cursor:"pointer"}}>💬 Чат</button>
<button onClick={function(){sSL(true)}} style={{width:"100%",padding:10,borderRadius:9,border:"2px solid #8b5cf630",background:"#1f1330",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:"#7c3aed",cursor:"pointer"}}>📚 Лорбук</button>
<button onClick={function(){sShowBest(true)}} style={{width:"100%",padding:10,borderRadius:9,border:"2px solid #ef444430",background:"#2a1414",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:"#ef4444",cursor:"pointer"}}>👹 Бестиарий / NPC</button>
<button onClick={function(){sRV(true)}} style={{width:"100%",padding:10,borderRadius:9,border:"2px solid #10b98140",background:"#0e2018",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:"#34d399",cursor:"pointer"}}>🧬 Расы</button>
<button onClick={function(){sPE(true)}} style={{width:"100%",padding:10,borderRadius:9,border:"2px solid #a78bfa40",background:"#1f1330",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:"#a78bfa",cursor:"pointer"}}>🎭 Классы</button>
<button onClick={function(){sShp(true)}} style={{width:"100%",padding:10,borderRadius:9,border:"2px solid #f59e0b40",background:"#2a2008",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:"#f0b352",cursor:"pointer"}}>🛒 Магазин / Вещи</button>
<button onClick={function(){sTr(true)}} style={{width:"100%",padding:10,borderRadius:9,border:"2px solid #f0b35240",background:"#241c08",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:"#f0b352",cursor:"pointer"}}>🧬 Черты</button>
<GMRoll addLog={pr.addLog}/>
{pr.characters.length===0&&<div style={{textAlign:"center",padding:20,color:"#9397ab"}}>Ожидаем...</div>}
{pr.characters.map(function(c){return <CharCard key={c._fbId} char={c} saveChar={pr.saveChar} deleteChar={pr.deleteChar} onOpen={function(id){sS(id)}}/>})}
<div style={{border:"2px solid #34374a",borderRadius:9,padding:"7px 8px",background:"#1b1d29"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:12}}>📜 Общий лог</span><button onClick={function(){if(window.confirm("Очистить все логи?"))pr.clearLogs()}} style={{fontSize:8,background:"#2a1414",border:"1px solid #ef444420",borderRadius:4,padding:"2px 6px",cursor:"pointer",color:"#ef4444",fontWeight:700}}>🗑️ Очистить</button></div><div style={{maxHeight:250,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>{(pr.logs||[]).length===0&&<div style={{textAlign:"center",padding:10,color:"#9397ab",fontStyle:"italic",fontSize:9}}>Пусто</div>}{(pr.logs||[]).map(function(l,i){var bgc=l.type==="magic_fail"?"#311717":l.type==="magic"?"#1f1330":l.type==="rest"?"#0e2018":l.type==="dodge"?"#0e2018":l.type==="zone"?"#231b08":l.type==="hit"?"#0e1a2b":l.type==="dmg_npc"?"#2a1414":l.type==="dmg"?"#2a1414":l.type==="spawn"?"#1f1330":"#1b1d29";return <div key={i} style={{background:bgc,border:"1px solid #34374a20",borderRadius:5,padding:"4px 6px",fontSize:9,animation:i===0?"slideIn 0.3s":"none"}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700,color:"#e9e9ed"}}>{l.who||"?"}</span>{l.ts&&<span style={{fontSize:7,color:"#c2b69e"}}>{new Date(l.ts).toLocaleTimeString()}</span>}</div><div style={{color:"#9397ab",marginTop:1}}>{l.label}</div>{l.detail&&<div style={{fontSize:8,color:"#9397ab",fontFamily:"monospace"}}>{l.detail}</div>}{l.total>0&&<div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:l.type==="magic_fail"?"#dc2626":"#e9e9ed"}}>{"= "+l.total}</div>}</div>})}</div></div>
</div></div>)}


/* ── DonatePage ── */

export default GMPanel;
