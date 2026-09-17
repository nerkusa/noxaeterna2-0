import React, { useState } from 'react';
import { db, ref, set } from '../../firebase';
import { ARMOR_T, weapDur } from '../../data/combat';
import { S } from '../../styles/ui';
import { r1, sm, uid } from '../../utils/dice';
import ShopPicker from '../ShopPicker';

function ArmorSection(pr){var c=pr.char;var sv=pr.save;var fs=pr.finalStats;
var _saa=useState(false);var saa=_saa[0];var sSAA=_saa[1];
var _an=useState("");var an=_an[0];var sAN=_an[1];
var _at=useState("light");var at=_at[0];var sAT=_at[1];
var _ah=useState(10);var ah=_ah[0];var sAH=_ah[1];
var eqH=(c.armors||[]).find(function(a){return a.id===c.equippedHead});
var eqB=(c.armors||[]).find(function(a){return a.id===c.equippedBody});
var SHIELD_ABSORB={light:0.5,medium:0.75,tower:1.0,none:0};
var SHIELD_T=[{id:"light",name:"Лёгкий",absorb:0.5,bodyReq:4},{id:"medium",name:"Средний",absorb:0.75,bodyReq:6},{id:"tower",name:"Башенный",absorb:1.0,bodyReq:8}];
var _ssadd=useState(false);var ssAdd=_ssadd[0];var sSsAdd=_ssadd[1];
var _shn=useState("");var shn=_shn[0];var sShn=_shn[1];
var _sht=useState("light");var sht=_sht[0];var sSht=_sht[1];
var _shhp=useState(15);var shhp=_shhp[0];var sShhp=_shhp[1];
var shields=c.shields||[];
var eqShield=shields.find(function(s){return s.id===c.equippedShield});
var equippedW=(c.weapons||[]).find(function(w){return w.id===c.equippedWeapon});
var shieldBlocked=equippedW&&(equippedW.hands===2||(equippedW.hands===1.5&&(c.weaponMode||"1h")==="2h"));
return <div style={{background:"#262219",border:"2px solid #64748b18",borderRadius:9,padding:"7px 8px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><label style={S.lb}>🛡️ Броня</label><button onClick={function(){sSAA(!saa)}} style={{fontSize:9,background:"#0e2018",border:"1px solid #10b98140",borderRadius:5,padding:"2px 8px",cursor:"pointer",color:"#34d399",fontWeight:700}}>{saa?"✕ Закрыть":"➕ Добавить броню"}</button></div>
<ShopPicker color="#10b981" items={(pr.shop||[]).filter(function(i){return i.cat==="armor"})} subOf={function(it){return it.type}} suborder={["light","medium","heavy"]} sublabels={{light:"🟢 Лёгкая броня",medium:"🟡 Средняя броня",heavy:"🔴 Тяжёлая броня"}} sub={function(it){var a=ARMOR_T.find(function(x){return x.id===it.type});return (a?a.name:it.type)+" · "+it.hp+" HP"}} onPick={function(it){var at2=ARMOR_T.find(function(a){return a.id===it.type})||ARMOR_T[0];if(fs.BODY<at2.bodyReq){alert("BODY("+fs.BODY+")<"+at2.bodyReq);return}sv(Object.assign({},c,{armors:(c.armors||[]).concat([{id:uid(),name:it.name,type:it.type,hp:it.hp,maxHp:it.hp}])}))}}/>
{/* Слот щита — как инвентарь */}
<div style={{marginBottom:6,padding:"5px 7px",background:"#0e1a2b",border:"1px solid #38bdf828",borderRadius:7}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
<div style={{fontSize:8,fontWeight:700,color:"#38bdf8"}}>🛡 Щит (левая рука){shieldBlocked&&<span style={{color:"#f59e0b",marginLeft:4}}>⚠️ недоступен</span>}</div>
<button onClick={function(){sSsAdd(!ssAdd)}} style={{fontSize:8,background:"none",border:"none",cursor:"pointer",color:"#38bdf8",fontWeight:700}}>{ssAdd?"✕":"+ Добавить"}</button>
</div>
<ShopPicker color="#38bdf8" label="🛒 Взять щит из магазина" items={(pr.shop||[]).filter(function(i){return i.cat==="shield"})} subOf={function(it){return it.type}} suborder={["light","medium","tower"]} sublabels={{light:"🟢 Лёгкий",medium:"🟡 Средний",tower:"🔵 Башенный"}} sub={function(it){var t=SHIELD_T.find(function(x){return x.id===it.type});return (t?t.name+" "+(t.absorb*100)+"%":it.type)+" · "+it.hp+" HP"}} onPick={function(it){var t=SHIELD_T.find(function(x){return x.id===it.type})||SHIELD_T[0];if(fs.BODY<t.bodyReq){alert("BODY("+fs.BODY+")<"+t.bodyReq);return}sv(Object.assign({},c,{shields:(c.shields||[]).concat([{id:uid(),name:it.name,type:it.type,absorb:t.absorb,hp:it.hp,maxHp:it.hp}])}))}}/>
{ssAdd&&<div style={{background:"#0e2236",borderRadius:6,padding:5,marginBottom:5,display:"flex",flexDirection:"column",gap:3}}>
<input style={Object.assign({},S.inp,{fontSize:9,padding:3})} value={shn} onChange={function(e){sShn(e.target.value)}} placeholder="Название щита"/>
<div style={{display:"flex",gap:3}}>
<select value={sht} onChange={function(e){sSht(e.target.value);var t=SHIELD_T.find(function(x){return x.id===e.target.value});if(t)sShhp(t.id==="light"?15:t.id==="medium"?25:40);}} style={Object.assign({},S.inp,{flex:1,fontSize:9,padding:3,cursor:"pointer"})}>
{SHIELD_T.map(function(t){return <option key={t.id} value={t.id}>{t.name+" (Body≥"+t.bodyReq+") "+t.absorb*100+"%"}</option>})}
</select>
<input style={Object.assign({},S.inp,{width:40,fontSize:9,padding:3})} type="number" value={shhp} onChange={function(e){sShhp(parseInt(e.target.value)||1)}} placeholder="HP"/>
</div>
<button onClick={function(){if(!shn.trim())return;var tObj=SHIELD_T.find(function(x){return x.id===sht})||SHIELD_T[0];if(fs.BODY<tObj.bodyReq){alert("BODY("+fs.BODY+") < "+tObj.bodyReq);return;}var ns={id:uid(),name:shn.trim(),type:sht,absorb:tObj.absorb,hp:shhp,maxHp:shhp};sv(Object.assign({},c,{shields:(c.shields||[]).concat([ns])}));sShn("");sSsAdd(false);}} style={{padding:4,borderRadius:4,border:"none",background:"#38bdf8",color:"#fff",fontWeight:700,fontSize:9,cursor:"pointer"}}>Добавить</button>
</div>}
{shields.length===0&&!ssAdd&&<div style={{fontSize:8,color:"#a89a82",fontStyle:"italic"}}>Нет щитов</div>}
{shields.map(function(sh,shIdx){var isEqSh=c.equippedShield===sh.id;var shPct=sh.maxHp>0?(sh.hp/sh.maxHp)*100:0;var shTyp=SHIELD_T.find(function(x){return x.id===sh.type})||SHIELD_T[0];
return <div key={(sh.id!=null?sh.id:"sh")+"_"+shIdx} style={{background:isEqSh?"#0e2236":"#1d1a14",border:"1px solid "+(isEqSh?"#38bdf830":"#322d24"),borderRadius:5,padding:"3px 5px",marginBottom:3,display:"flex",flexDirection:"column",gap:2}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:9,fontWeight:isEqSh?700:400}}>{sh.name} <span style={{fontSize:7,color:"#94a3b8"}}>{shTyp.name+" "+shTyp.absorb*100+"%"}</span></span>
<div style={{display:"flex",gap:3,alignItems:"center"}}>
<button onClick={function(){sv(Object.assign({},c,{shields:(c.shields||[]).map(function(x){return x.id===sh.id?Object.assign({},x,{hp:Math.max(0,x.hp-1)}):x})}))}} style={Object.assign({},S.sm,{width:14,height:14,fontSize:8})}>−</button>
<span style={{fontSize:9,fontWeight:700,color:sh.hp<=0?"#ef4444":"#38bdf8",minWidth:28,textAlign:"center"}}>{sh.hp+"/"+sh.maxHp}</span>
<button onClick={function(){sv(Object.assign({},c,{shields:(c.shields||[]).map(function(x){return x.id===sh.id?Object.assign({},x,{hp:Math.min(x.maxHp,x.hp+1)}):x})}))}} style={Object.assign({},S.sm,{width:14,height:14,fontSize:8})}>+</button>
{!isEqSh&&<button disabled={shieldBlocked} onClick={function(){if(!shieldBlocked)sv(Object.assign({},c,{equippedShield:sh.id}));}} style={{fontSize:7,padding:"1px 5px",borderRadius:3,border:"1px solid #38bdf820",background:"#0e2236",cursor:shieldBlocked?"not-allowed":"pointer",color:"#38bdf8",opacity:shieldBlocked?0.5:1}}>Надеть</button>}
{isEqSh&&<button onClick={function(){sv(Object.assign({},c,{equippedShield:null}))}} style={{fontSize:7,padding:"1px 5px",borderRadius:3,border:"1px solid #ef444420",background:"#311717",cursor:"pointer",color:"#ef4444"}}>Снять</button>}
<button onClick={function(){if(!window.confirm("Удалить "+sh.name+"?"))return;var upd={shields:(c.shields||[]).filter(function(x,j){return j!==shIdx})};if(isEqSh)upd.equippedShield=null;sv(Object.assign({},c,upd))}} title={isEqSh?"Удалить (снимется)":"Удалить"} style={{background:"none",border:"none",color:"#ef4444",fontSize:10,cursor:"pointer"}}>🗑</button>
</div></div>
<div style={{background:"#262219",borderRadius:2,height:4,overflow:"hidden"}}><div style={{height:"100%",width:shPct+"%",background:sh.hp<=0?"#ef4444":"#38bdf8",borderRadius:2}}/></div>
{sh.hp<=0&&<div style={{fontSize:7,color:"#ef4444",fontWeight:700}}>💔 Сломан!</div>}
</div>;})}
</div>
{saa&&<div style={{background:"#262219",borderRadius:7,padding:6,marginBottom:5,display:"flex",flexDirection:"column",gap:3}}><input style={S.inp} value={an} onChange={function(e){sAN(e.target.value)}} placeholder="Название брони"/><div style={{display:"flex",gap:3}}><div style={{flex:1}}><select value={at} onChange={function(e){sAT(e.target.value)}} style={Object.assign({},S.inp,{fontSize:9,padding:3,cursor:"pointer"})}>{ARMOR_T.filter(function(a){return a.id!=="none"}).map(function(a){return <option key={a.id} value={a.id}>{a.name+" (Body\u2265"+a.bodyReq+")"}</option>})}</select></div><div style={{width:45}}><input style={Object.assign({},S.inp,{fontSize:9,padding:3})} type="number" value={ah} onChange={function(e){sAH(parseInt(e.target.value)||1)}} placeholder="HP"/></div></div><button onClick={function(){if(!an.trim())return;var at2=ARMOR_T.find(function(a){return a.id===at})||ARMOR_T[0];if(fs.BODY<at2.bodyReq){alert("BODY("+fs.BODY+")<"+at2.bodyReq);return}sv(Object.assign({},c,{armors:(c.armors||[]).concat([{id:uid(),name:an.trim(),type:at,hp:ah,maxHp:ah}])}));sAN("");sSAA(false)}} style={{padding:5,borderRadius:5,border:"none",background:"#10b981",color:"#fff",fontWeight:700,fontSize:10,cursor:"pointer"}}>Добавить</button></div>}
{["head","body"].map(function(slot){var eq=slot==="head"?eqH:eqB;var atD=eq?ARMOR_T.find(function(a){return a.id===eq.type})||ARMOR_T[0]:null;var pct=eq&&eq.maxHp>0?(eq.hp/eq.maxHp)*100:0;return <div key={slot} style={{marginTop:4,padding:"4px 6px",background:eq?"#0e2018":"#1d1a14",border:"1px solid "+(eq?"#10b98120":"#322d24"),borderRadius:6}}><div style={{fontSize:8,fontWeight:700,color:"#94a3b8"}}>{slot==="head"?"🧠 Голова":"🫀 Тело"}</div>{eq?<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:10,fontWeight:700}}>{eq.name} <span style={{fontSize:8,color:"#94a3b8"}}>{atD?atD.name:""}</span></span><div style={{display:"flex",alignItems:"center",gap:2}}><button onClick={function(){sv(Object.assign({},c,{armors:(c.armors||[]).map(function(a){return a.id===eq.id?Object.assign({},a,{hp:Math.max(0,a.hp-1)}):a})}))}} style={Object.assign({},S.sm,{width:16,height:16,fontSize:8})}>−</button><span style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:11,color:eq.hp<=0?"#ef4444":"#10b981"}}>{eq.hp+"/"+eq.maxHp}</span><button onClick={function(){sv(Object.assign({},c,{armors:(c.armors||[]).map(function(a){return a.id===eq.id?Object.assign({},a,{hp:Math.min(a.maxHp,a.hp+1)}):a})}))}} style={Object.assign({},S.sm,{width:16,height:16,fontSize:8})}>+</button><button onClick={function(){var u={};u[slot==="head"?"equippedHead":"equippedBody"]=null;sv(Object.assign({},c,u))}} style={{fontSize:8,background:"#311717",border:"1px solid #ef444420",borderRadius:4,padding:"1px 5px",cursor:"pointer",color:"#ef4444",fontWeight:700}}>Снять</button></div></div><div style={{background:"#262219",borderRadius:3,height:6,overflow:"hidden",marginTop:2}}><div style={{height:"100%",width:pct+"%",background:eq.hp<=0?"#ef4444":"#10b981",borderRadius:3}}/></div>{atD&&atD.desc&&<div style={{fontSize:7,color:"#94a3b8",marginTop:1}}>{atD.desc}</div>}</div>:<div style={{fontSize:9,color:"#a89a82",fontStyle:"italic"}}>Пусто</div>}</div>})}
{(c.armors||[]).length>0&&<div style={{marginTop:5}}><div style={{fontSize:8,fontWeight:700,color:"#94a3b8",marginBottom:2}}>Инвентарь брони:</div>{(c.armors||[]).map(function(a,aIdx){var isEq=a.id===c.equippedHead||a.id===c.equippedBody;var atD2=ARMOR_T.find(function(x){return x.id===a.type})||ARMOR_T[0];return <div key={(a.id!=null?a.id:"a")+"_"+aIdx} style={{display:"flex",alignItems:"center",gap:3,padding:"2px 4px",borderRadius:4,background:isEq?"#12233a":"#1d1a14",marginBottom:2,fontSize:9}}><span style={{flex:1,fontWeight:isEq?700:400}}>{a.name} <span style={{fontSize:7,color:"#94a3b8"}}>{atD2.name} {a.hp+"/"+a.maxHp}</span>{isEq&&<span style={{fontSize:7,color:"#3b82f6"}}> ЭКИП</span>}</span>{!isEq&&<button onClick={function(){if(fs.BODY<atD2.bodyReq){alert("BODY<"+atD2.bodyReq);return}sv(Object.assign({},c,{equippedHead:a.id}))}} style={{fontSize:7,padding:"1px 4px",borderRadius:3,border:"1px solid #3b82f620",background:"#0e1a2b",cursor:"pointer",color:"#60a5fa"}}>Гол</button>}{!isEq&&<button onClick={function(){if(fs.BODY<atD2.bodyReq){alert("BODY<"+atD2.bodyReq);return}sv(Object.assign({},c,{equippedBody:a.id}))}} style={{fontSize:7,padding:"1px 4px",borderRadius:3,border:"1px solid #3b82f620",background:"#0e1a2b",cursor:"pointer",color:"#60a5fa"}}>Тело</button>}<button onClick={function(){if(!window.confirm("Удалить "+a.name+"?"))return;var na=(c.armors||[]).filter(function(x,j){return j!==aIdx});var has=function(id){return na.some(function(x){return x.id===id})};sv(Object.assign({},c,{armors:na,equippedHead:has(c.equippedHead)?c.equippedHead:null,equippedBody:has(c.equippedBody)?c.equippedBody:null}))}} title="Удалить" style={{fontSize:10,background:"none",border:"none",color:"#ef4444",cursor:"pointer"}}>🗑</button></div>})}</div>}
{(function(){
  var isArt=c.profId==="artisan";
  var faceOf=function(d){var m=(""+d).match(/d(\d+)/);return m?parseInt(m[1]):0};
  var rollDice=function(d){var m=(""+d).match(/(\d+)d(\d+)/);if(!m)return r1(4);var nn=parseInt(m[1])||1,ff=parseInt(m[2])||4,tt=0;for(var i=0;i<nn;i++)tt+=r1(ff);return tt};
  var toolItems=(c.inventory||[]).filter(function(i){return i.tool});
  var bestTool=toolItems.reduce(function(a,b){return faceOf(b.dice)>faceOf(a?a.dice:"0d0")?b:a},null);
  var toolDie=bestTool?(bestTool.dice||"1d4"):null;
  var used=!!c.repairUsed;
  var canRepair=isArt||!!toolDie;
  var die=toolDie||(isArt?"1d8":"1d4");
  var pwr=die+(isArt?"+CRA":"");
  var rollAmt=function(){return rollDice(die)+(isArt?(fs.CRA||0):0)};
  var doLog=function(amt,what){if(pr.addLog)pr.addLog({who:c.name||"???",type:"rest",label:"🔧 Починка: "+what+" +"+amt+" HP",detail:die+(isArt?"+CRA("+(fs.CRA||0)+")":""),total:amt});if(pr.onRoll)pr.onRoll({label:"🔧 Починка",d10:null,parts:[],total:amt,subtext:what+": +"+amt+"\n"+pwr});};
  var repWpn=function(arr,id,amt){return (arr||[]).map(function(x){if(x.id!==id)return x;var md=(x.maxDur!=null?x.maxDur:weapDur(x.type));return Object.assign({},x,{maxDur:md,dur:Math.min(md,(x.dur!=null?x.dur:md)+amt)})})};
  var repOwn=function(kind,id,nm){if(used||!canRepair)return;var amt=rollAmt();var patch={repairUsed:true};if(kind==="armor")patch.armors=(c.armors||[]).map(function(a){return a.id===id?Object.assign({},a,{hp:Math.min(a.maxHp,(a.hp||0)+amt)}):a});else if(kind==="shield")patch.shields=(c.shields||[]).map(function(x){return x.id===id?Object.assign({},x,{hp:Math.min(x.maxHp,(x.hp||0)+amt)}):x});else patch.weapons=repWpn(c.weapons,id,amt);sv(Object.assign({},c,patch));doLog(amt,nm);};
  var repAlly=function(al,kind,id,nm){if(used||!isArt||!pr.room)return;var amt=rollAmt();var upd=Object.assign({},al);delete upd._fbId;if(kind==="armor")upd.armors=(al.armors||[]).map(function(a){return a.id===id?Object.assign({},a,{hp:Math.min(a.maxHp,(a.hp||0)+amt)}):a});else if(kind==="shield")upd.shields=(al.shields||[]).map(function(x){return x.id===id?Object.assign({},x,{hp:Math.min(x.maxHp,(x.hp||0)+amt)}):x});else upd.weapons=repWpn(al.weapons,id,amt);set(ref(db,"rooms/"+pr.room+"/characters/"+al._fbId),upd);sv(Object.assign({},c,{repairUsed:true}));doLog(amt,al.name+" · "+nm);};
  var dmgOf=function(o){return (o.armors||[]).filter(function(a){return (a.hp||0)<a.maxHp}).map(function(a){return {kind:"armor",id:a.id,nm:a.name,hp:a.hp,mhp:a.maxHp}}).concat((o.shields||[]).filter(function(x){return (x.hp||0)<x.maxHp}).map(function(x){return {kind:"shield",id:x.id,nm:x.name,hp:x.hp,mhp:x.maxHp}})).concat((o.weapons||[]).filter(function(w){var md=(w.maxDur!=null?w.maxDur:weapDur(w.type));var d2=(w.dur!=null?w.dur:md);return md>0&&d2<md}).map(function(w){var md=(w.maxDur!=null?w.maxDur:weapDur(w.type));return {kind:"weapon",id:w.id,nm:w.name,hp:(w.dur!=null?w.dur:md),mhp:md}}))};
  var ownDmg=dmgOf(c);
  var allies=isArt?((pr.characters||[]).filter(function(x){return x._fbId!==c._fbId&&x.active})):[];
  return <div style={{marginTop:6,padding:"5px 7px",background:"#231b08",border:"1px solid #f59e0b30",borderRadius:7}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:8,fontWeight:700,color:"#f0b352"}}>🔧 Ремонт снаряжения (1/день)</span><span style={{fontSize:7,color:"#a89a82"}}>{used?"✓ использовано":canRepair?pwr:"нужны инструменты"}</span></div>
    {!used&&canRepair&&ownDmg.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:3}}>{ownDmg.map(function(it){return <button key={it.kind+it.id} onClick={function(){repOwn(it.kind,it.id,it.nm)}} style={{padding:"2px 5px",borderRadius:4,border:"1px solid #f59e0b30",background:"#1d1a14",fontSize:7,fontWeight:700,color:"#f0b352",cursor:"pointer"}}>{"🔧 "+it.nm+" ("+it.hp+"/"+it.mhp+")"}</button>})}</div>}
    {!used&&canRepair&&ownDmg.length===0&&!allies.some(function(a){return dmgOf(a).length})&&<div style={{fontSize:7,color:"#a89a82",marginTop:2,fontStyle:"italic"}}>Вся броня цела</div>}
    {!used&&!canRepair&&<div style={{fontSize:7,color:"#a89a82",marginTop:2,fontStyle:"italic"}}>Возьми набор инструментов в инвентаре (или будь Ремесленником)</div>}
    {isArt&&!used&&allies.map(function(al){var ad=dmgOf(al);if(!ad.length)return null;return <div key={al._fbId} style={{marginTop:3}}><div style={{fontSize:7,color:"#94a3b8",fontWeight:700}}>{"🤝 "+al.name}</div><div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:1}}>{ad.map(function(it){return <button key={it.kind+it.id} onClick={function(){repAlly(al,it.kind,it.id,it.nm)}} style={{padding:"2px 5px",borderRadius:4,border:"1px solid #10b98130",background:"#0e2018",fontSize:7,fontWeight:700,color:"#34d399",cursor:"pointer"}}>{"🔧 "+it.nm+" ("+it.hp+"/"+it.mhp+")"}</button>})}</div></div>})}
    {used&&<div style={{fontSize:7,color:"#a89a82",marginTop:2,fontStyle:"italic"}}>Отдых (💤) сбросит починку</div>}
  </div>;
})()}
</div>}

export default ArmorSection;
