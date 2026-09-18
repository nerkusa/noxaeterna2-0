import React, { useState } from 'react';
import { db, ref, set } from '../../firebase';
import { ARMOR_T, SHIELD_T, weapDur } from '../../data/combat';
import { r1, uid, rollHit } from '../../utils/dice';
import { tryPay } from '../../utils/currency';
import ShopPicker from '../ShopPicker';

var SLOT_LABEL={head:"Голова",body:"Тело"};

function Bar(pr){
return(<div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontWeight:600,letterSpacing:.05,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:3}}><span>{pr.label}</span><span style={{color:"var(--color-text)",textTransform:"none",fontWeight:700}}>{pr.value}</span></div>
<div style={{height:pr.h||5,borderRadius:3,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:pr.pct+"%",height:"100%",background:pr.color||"linear-gradient(90deg,var(--color-accent),var(--color-accent-2))"}}/></div>
</div>)}

function ArmorSection(pr){var c=pr.char;var sv=pr.save;var fs=pr.finalStats;var es=pr.finalSkills||{};
var _saa=useState(false);var saa=_saa[0];var sSAA=_saa[1];
var _an=useState("");var an=_an[0];var sAN=_an[1];
var _at=useState("light");var at=_at[0];var sAT=_at[1];
var _asl=useState("body");var asl=_asl[0];var sAsl=_asl[1];
var _ah=useState(10);var ah=_ah[0];var sAH=_ah[1];
var eqH=(c.armors||[]).find(function(a){return a.id===c.equippedHead});
var eqB=(c.armors||[]).find(function(a){return a.id===c.equippedBody});
var _ssadd=useState(false);var ssAdd=_ssadd[0];var sSsAdd=_ssadd[1];
var _shn=useState("");var shn=_shn[0];var sShn=_shn[1];
var _sht=useState("light");var sht=_sht[0];var sSht=_sht[1];
var _shhp=useState(15);var shhp=_shhp[0];var sShhp=_shhp[1];
var shields=c.shields||[];
var equippedW=(c.weapons||[]).find(function(w){return w.id===c.equippedWeapon});
var shieldBlocked=equippedW&&(equippedW.hands===2||(equippedW.hands===1.5&&(c.weaponMode||"1h")==="2h"));

function rollDefense(){
  var R=rollHit();var d=R.d;var dv=fs.DEX||0;var dg=es["Уклонение"]||0;var t=d+dv+dg;
  if(pr.addLog)pr.addLog({who:c.name||"???",type:"dodge",label:"Бросок защиты"+(R.crit?" · крит":R.fumble?" · провал":""),detail:"d10("+d+") + DEX("+dv+") + Уклонение("+dg+") = "+t,total:t});
  if(pr.onRoll)pr.onRoll({label:"Защита",d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:"DEX",value:dv},{label:"Уклонение",value:dg}],total:t});
}

return <div className="n-card" style={{display:"flex",flexDirection:"column",gap:10}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{fontSize:11,fontWeight:700,letterSpacing:.06,textTransform:"uppercase",color:"var(--color-text-muted)"}}>Броня, щит и защита</div>
<div style={{display:"flex",gap:6}}>
<button onClick={rollDefense} title="Бросок защиты: DEX + Уклонение" className="n-btn n-btn-secondary" style={{padding:"4px 10px",fontSize:11}}>Защита</button>
<button onClick={function(){sSAA(!saa)}} className="n-btn n-btn-secondary" style={{padding:"4px 10px",fontSize:13}}>{saa?"✕":"+"}</button>
</div>
</div>

<ShopPicker color="#9184d9" label="Добавить броню" items={(pr.shop||[]).filter(function(i){return i.cat==="armor"})} subOf={function(it){return it.slot||"body"}} suborder={["head","body"]} sublabels={{head:"Голова",body:"Тело"}} sub={function(it){var a=ARMOR_T.find(function(x){return x.id===it.type});return (a?a.name:it.type)+" · "+it.hp+" HP"}} onPick={function(it){var at2=ARMOR_T.find(function(a){return a.id===it.type})||ARMOR_T[0];if(fs.BODY<at2.bodyReq){alert("BODY("+fs.BODY+")<"+at2.bodyReq);return}var pay=tryPay(c,it.price);if(pay===null)return;var slot=it.slot||"body";var newA={id:uid(),name:it.name,type:it.type,slot:slot,hp:it.hp,maxHp:it.hp,desc:it.desc||""};sv(Object.assign({},c,pay,{armors:(c.armors||[]).concat([newA])}))}}/>

{saa&&<div style={{background:"var(--color-sunken)",borderRadius:10,padding:10,display:"flex",flexDirection:"column",gap:6}}>
<input className="n-input" value={an} onChange={function(e){sAN(e.target.value)}} placeholder="Название брони"/>
<div style={{display:"flex",gap:6}}>
<select className="n-input" value={asl} onChange={function(e){sAsl(e.target.value)}} style={{flex:1,padding:"6px 8px",minHeight:34,cursor:"pointer"}}><option value="head">Голова</option><option value="body">Тело</option></select>
<select className="n-input" value={at} onChange={function(e){sAT(e.target.value)}} style={{flex:1,padding:"6px 8px",minHeight:34,cursor:"pointer"}}>{ARMOR_T.filter(function(a){return a.id!=="none"}).map(function(a){return <option key={a.id} value={a.id}>{a.name+" (Body≥"+a.bodyReq+")"}</option>})}</select>
<input className="n-input" style={{width:60,padding:"6px 8px",minHeight:34}} type="number" value={ah} onChange={function(e){sAH(parseInt(e.target.value)||1)}} placeholder="HP"/>
</div>
<button onClick={function(){if(!an.trim())return;var at2=ARMOR_T.find(function(a){return a.id===at})||ARMOR_T[0];if(fs.BODY<at2.bodyReq){alert("BODY("+fs.BODY+")<"+at2.bodyReq);return}var newA={id:uid(),name:an.trim(),type:at,slot:asl,hp:ah,maxHp:ah};sv(Object.assign({},c,{armors:(c.armors||[]).concat([newA])}));sAN("");sSAA(false)}} className="n-btn n-btn-primary" style={{alignSelf:"flex-start"}}>Добавить</button>
</div>}

{/* Голова / Тело */}
<div style={{display:"flex",flexDirection:"column",gap:6}}>
{["head","body"].map(function(slot){var eq=slot==="head"?eqH:eqB;var atD=eq?ARMOR_T.find(function(a){return a.id===eq.type})||ARMOR_T[0]:null;var pct=eq&&eq.maxHp>0?(eq.hp/eq.maxHp)*100:0;
return(<div key={slot} style={{padding:"8px 10px",background:"var(--color-sunken)",borderRadius:10,border:"1px solid "+(eq?"rgba(145,132,217,.25)":"var(--color-divider)")}}>
<div style={{fontSize:10,fontWeight:600,color:"var(--color-text-muted)",textTransform:"uppercase",letterSpacing:.05,marginBottom:eq?4:0}}>{SLOT_LABEL[slot]}</div>
{eq?<div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
    <div><span style={{fontSize:13,fontWeight:700}}>{eq.name}</span><span style={{fontSize:11,color:"var(--color-text-muted)",marginLeft:6}}>{atD?atD.name:""}</span></div>
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      <button onClick={function(){sv(Object.assign({},c,{armors:(c.armors||[]).map(function(a){return a.id===eq.id?Object.assign({},a,{hp:Math.max(0,a.hp-1)}):a})}))}} className="n-btn n-btn-secondary" style={{width:22,height:22,padding:0,fontSize:11}}>−</button>
      <span style={{fontSize:13,fontWeight:700,color:eq.hp<=0?"#ef4444":"var(--color-text)",minWidth:36,textAlign:"center"}}>{eq.hp+"/"+eq.maxHp}</span>
      <button onClick={function(){sv(Object.assign({},c,{armors:(c.armors||[]).map(function(a){return a.id===eq.id?Object.assign({},a,{hp:Math.min(a.maxHp,a.hp+1)}):a})}))}} className="n-btn n-btn-secondary" style={{width:22,height:22,padding:0,fontSize:11}}>+</button>
      <button onClick={function(){var u={};u[slot==="head"?"equippedHead":"equippedBody"]=null;sv(Object.assign({},c,u))}} className="n-btn n-btn-secondary" style={{padding:"3px 8px",fontSize:10,color:"#ef4444"}}>Снять</button>
    </div>
  </div>
  <Bar label="" value="" pct={pct} color={eq.hp<=0?"#ef4444":"linear-gradient(90deg,#10b981,#34d399)"} h={5}/>
  {eq.desc&&<div style={{fontSize:11,color:"var(--color-text-muted)",fontStyle:"italic",marginTop:5}}>{eq.desc}</div>}
</div>:<div style={{fontSize:12,color:"var(--color-text-muted)",fontStyle:"italic"}}>Пусто</div>}
</div>);
})}
</div>

{/* Щит */}
<div style={{padding:"8px 10px",background:"var(--color-sunken)",borderRadius:10,border:"1px solid var(--color-divider)"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
<div style={{fontSize:10,fontWeight:600,color:"var(--color-text-muted)",textTransform:"uppercase",letterSpacing:.05}}>{"Щит (левая рука)"+(shieldBlocked?" · недоступен":"")}</div>
<button onClick={function(){sSsAdd(!ssAdd)}} className="n-btn n-btn-secondary" style={{padding:"3px 8px",fontSize:10}}>{ssAdd?"✕":"+ Добавить"}</button>
</div>
<ShopPicker color="#38bdf8" label="Взять щит из магазина" items={(pr.shop||[]).filter(function(i){return i.cat==="shield"})} subOf={function(it){return it.type}} suborder={["light","medium","tower"]} sublabels={{light:"Лёгкий",medium:"Средний",tower:"Башенный"}} sub={function(it){var t=SHIELD_T.find(function(x){return x.id===it.type});return (t?t.name+" "+(t.absorb*100)+"%":it.type)+" · "+it.hp+" HP"}} onPick={function(it){var t=SHIELD_T.find(function(x){return x.id===it.type})||SHIELD_T[0];if(fs.BODY<t.bodyReq){alert("BODY("+fs.BODY+")<"+t.bodyReq);return}var pay=tryPay(c,it.price);if(pay===null)return;sv(Object.assign({},c,pay,{shields:(c.shields||[]).concat([{id:uid(),name:it.name,type:it.type,absorb:t.absorb,hp:it.hp,maxHp:it.hp}])}))}}/>
{ssAdd&&<div style={{background:"var(--color-bg)",borderRadius:8,padding:8,marginBottom:6,display:"flex",flexDirection:"column",gap:6}}>
<input className="n-input" value={shn} onChange={function(e){sShn(e.target.value)}} placeholder="Название щита"/>
<div style={{display:"flex",gap:6}}>
<select className="n-input" value={sht} onChange={function(e){sSht(e.target.value);var t=SHIELD_T.find(function(x){return x.id===e.target.value});if(t)sShhp(t.id==="light"?15:t.id==="medium"?25:40);}} style={{flex:1,padding:"6px 8px",minHeight:34,cursor:"pointer"}}>
{SHIELD_T.map(function(t){return <option key={t.id} value={t.id}>{t.name+" (Body≥"+t.bodyReq+") "+t.absorb*100+"%"}</option>})}
</select>
<input className="n-input" style={{width:60,padding:"6px 8px",minHeight:34}} type="number" value={shhp} onChange={function(e){sShhp(parseInt(e.target.value)||1)}} placeholder="HP"/>
</div>
<button onClick={function(){if(!shn.trim())return;var tObj=SHIELD_T.find(function(x){return x.id===sht})||SHIELD_T[0];if(fs.BODY<tObj.bodyReq){alert("BODY("+fs.BODY+") < "+tObj.bodyReq);return;}var ns={id:uid(),name:shn.trim(),type:sht,absorb:tObj.absorb,hp:shhp,maxHp:shhp};sv(Object.assign({},c,{shields:(c.shields||[]).concat([ns])}));sShn("");sSsAdd(false);}} className="n-btn n-btn-primary" style={{alignSelf:"flex-start"}}>Добавить</button>
</div>}
{shields.length===0&&!ssAdd&&<div style={{fontSize:12,color:"var(--color-text-muted)",fontStyle:"italic"}}>Нет щитов</div>}
{shields.map(function(sh,shIdx){var isEqSh=c.equippedShield===sh.id;var shPct=sh.maxHp>0?(sh.hp/sh.maxHp)*100:0;var shTyp=SHIELD_T.find(function(x){return x.id===sh.type})||SHIELD_T[0];
return(<div key={(sh.id!=null?sh.id:"sh")+"_"+shIdx} style={{background:isEqSh?"rgba(56,189,248,.12)":"var(--color-bg)",border:"1px solid "+(isEqSh?"rgba(56,189,248,.3)":"var(--color-divider)"),borderRadius:8,padding:"6px 8px",marginBottom:4,display:"flex",flexDirection:"column",gap:4}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:12,fontWeight:isEqSh?700:500}}>{sh.name}<span style={{fontSize:11,color:"var(--color-text-muted)",marginLeft:6}}>{shTyp.name+" "+shTyp.absorb*100+"%"}</span></span>
<div style={{display:"flex",gap:4,alignItems:"center"}}>
<button onClick={function(){sv(Object.assign({},c,{shields:(c.shields||[]).map(function(x){return x.id===sh.id?Object.assign({},x,{hp:Math.max(0,x.hp-1)}):x})}))}} className="n-btn n-btn-secondary" style={{width:20,height:20,padding:0,fontSize:10}}>−</button>
<span style={{fontSize:12,fontWeight:700,color:sh.hp<=0?"#ef4444":"#38bdf8",minWidth:32,textAlign:"center"}}>{sh.hp+"/"+sh.maxHp}</span>
<button onClick={function(){sv(Object.assign({},c,{shields:(c.shields||[]).map(function(x){return x.id===sh.id?Object.assign({},x,{hp:Math.min(x.maxHp,x.hp+1)}):x})}))}} className="n-btn n-btn-secondary" style={{width:20,height:20,padding:0,fontSize:10}}>+</button>
{!isEqSh&&<button disabled={shieldBlocked} onClick={function(){if(!shieldBlocked)sv(Object.assign({},c,{equippedShield:sh.id}));}} className="n-btn n-btn-secondary" style={{padding:"2px 7px",fontSize:10,opacity:shieldBlocked?0.5:1}}>Надеть</button>}
{isEqSh&&<button onClick={function(){sv(Object.assign({},c,{equippedShield:null}))}} className="n-btn n-btn-secondary" style={{padding:"2px 7px",fontSize:10,color:"#ef4444"}}>Снять</button>}
<button onClick={function(){if(!window.confirm("Удалить "+sh.name+"?"))return;var upd={shields:(c.shields||[]).filter(function(x,j){return j!==shIdx})};if(isEqSh)upd.equippedShield=null;sv(Object.assign({},c,upd))}} title={isEqSh?"Удалить (снимется)":"Удалить"} style={{background:"none",border:"none",color:"#ef4444",fontSize:13,cursor:"pointer"}}>✕</button>
</div></div>
<div style={{height:4,borderRadius:2,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{height:"100%",width:shPct+"%",background:sh.hp<=0?"#ef4444":"#38bdf8"}}/></div>
{sh.hp<=0&&<div style={{fontSize:10,color:"#ef4444",fontWeight:700}}>Сломан</div>}
</div>);})}
</div>

{/* Инвентарь брони */}
{(c.armors||[]).length>0&&<div style={{display:"flex",flexDirection:"column",gap:4}}>
<div style={{fontSize:10,fontWeight:600,color:"var(--color-text-muted)",textTransform:"uppercase",letterSpacing:.05}}>Инвентарь брони</div>
{(c.armors||[]).map(function(a,aIdx){var slot=a.slot||"body";var isEq=a.id===(slot==="head"?c.equippedHead:c.equippedBody);var atD2=ARMOR_T.find(function(x){return x.id===a.type})||ARMOR_T[0];
return(<div key={(a.id!=null?a.id:"a")+"_"+aIdx} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:8,background:isEq?"rgba(145,132,217,.12)":"var(--color-sunken)",fontSize:12}}>
<span style={{flex:1,fontWeight:isEq?700:400}}>{a.name}<span style={{fontSize:11,color:"var(--color-text-muted)",marginLeft:6}}>{SLOT_LABEL[slot]+" · "+atD2.name+" "+a.hp+"/"+a.maxHp}</span>{isEq&&<span style={{fontSize:10,color:"var(--color-accent)",marginLeft:5}}>экип.</span>}</span>
{!isEq&&<button onClick={function(){if(fs.BODY<atD2.bodyReq){alert("BODY<"+atD2.bodyReq);return}var u={};u[slot==="head"?"equippedHead":"equippedBody"]=a.id;sv(Object.assign({},c,u))}} className="n-btn n-btn-secondary" style={{padding:"3px 8px",fontSize:10}}>{"Надеть ("+SLOT_LABEL[slot]+")"}</button>}
<button onClick={function(){if(!window.confirm("Удалить "+a.name+"?"))return;var na=(c.armors||[]).filter(function(x,j){return j!==aIdx});var has=function(id){return na.some(function(x){return x.id===id})};sv(Object.assign({},c,{armors:na,equippedHead:has(c.equippedHead)?c.equippedHead:null,equippedBody:has(c.equippedBody)?c.equippedBody:null}))}} title="Удалить" style={{background:"none",border:"none",color:"#ef4444",fontSize:13,cursor:"pointer"}}>✕</button>
</div>);})}
</div>}

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
  var doLog=function(amt,what){if(pr.addLog)pr.addLog({who:c.name||"???",type:"rest",label:"Починка: "+what+" +"+amt+" HP",detail:die+(isArt?"+CRA("+(fs.CRA||0)+")":""),total:amt});if(pr.onRoll)pr.onRoll({label:"Починка",d10:null,parts:[],total:amt,subtext:what+": +"+amt+"\n"+pwr});};
  var repWpn=function(arr,id,amt){return (arr||[]).map(function(x){if(x.id!==id)return x;var md=(x.maxDur!=null?x.maxDur:weapDur(x.type));return Object.assign({},x,{maxDur:md,dur:Math.min(md,(x.dur!=null?x.dur:md)+amt)})})};
  var repOwn=function(kind,id,nm){if(used||!canRepair)return;var amt=rollAmt();var patch={repairUsed:true};if(kind==="armor")patch.armors=(c.armors||[]).map(function(a){return a.id===id?Object.assign({},a,{hp:Math.min(a.maxHp,(a.hp||0)+amt)}):a});else if(kind==="shield")patch.shields=(c.shields||[]).map(function(x){return x.id===id?Object.assign({},x,{hp:Math.min(x.maxHp,(x.hp||0)+amt)}):x});else patch.weapons=repWpn(c.weapons,id,amt);sv(Object.assign({},c,patch));doLog(amt,nm);};
  var repAlly=function(al,kind,id,nm){if(used||!isArt||!pr.room)return;var amt=rollAmt();var upd=Object.assign({},al);delete upd._fbId;if(kind==="armor")upd.armors=(al.armors||[]).map(function(a){return a.id===id?Object.assign({},a,{hp:Math.min(a.maxHp,(a.hp||0)+amt)}):a});else if(kind==="shield")upd.shields=(al.shields||[]).map(function(x){return x.id===id?Object.assign({},x,{hp:Math.min(x.maxHp,(x.hp||0)+amt)}):x});else upd.weapons=repWpn(al.weapons,id,amt);set(ref(db,"rooms/"+pr.room+"/characters/"+al._fbId),upd);sv(Object.assign({},c,{repairUsed:true}));doLog(amt,al.name+" · "+nm);};
  var dmgOf=function(o){return (o.armors||[]).filter(function(a){return (a.hp||0)<a.maxHp}).map(function(a){return {kind:"armor",id:a.id,nm:a.name,hp:a.hp,mhp:a.maxHp}}).concat((o.shields||[]).filter(function(x){return (x.hp||0)<x.maxHp}).map(function(x){return {kind:"shield",id:x.id,nm:x.name,hp:x.hp,mhp:x.maxHp}})).concat((o.weapons||[]).filter(function(w){var md=(w.maxDur!=null?w.maxDur:weapDur(w.type));var d2=(w.dur!=null?w.dur:md);return md>0&&d2<md}).map(function(w){var md=(w.maxDur!=null?w.maxDur:weapDur(w.type));return {kind:"weapon",id:w.id,nm:w.name,hp:(w.dur!=null?w.dur:md),mhp:md}}))};
  var ownDmg=dmgOf(c);
  var allies=isArt?((pr.characters||[]).filter(function(x){return x._fbId!==c._fbId&&x.active})):[];
  return <div style={{padding:"8px 10px",background:"var(--color-sunken)",border:"1px solid var(--color-divider)",borderRadius:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,fontWeight:700,color:"var(--color-text-muted)",textTransform:"uppercase",letterSpacing:.05}}>Ремонт снаряжения (1/день)</span><span style={{fontSize:11,color:"var(--color-text-muted)"}}>{used?"использовано":canRepair?pwr:"нужны инструменты"}</span></div>
    {!used&&canRepair&&ownDmg.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>{ownDmg.map(function(it){return <button key={it.kind+it.id} onClick={function(){repOwn(it.kind,it.id,it.nm)}} className="n-btn n-btn-secondary" style={{padding:"3px 8px",fontSize:10}}>{it.nm+" ("+it.hp+"/"+it.mhp+")"}</button>})}</div>}
    {!used&&canRepair&&ownDmg.length===0&&!allies.some(function(a){return dmgOf(a).length})&&<div style={{fontSize:11,color:"var(--color-text-muted)",marginTop:4,fontStyle:"italic"}}>Вся броня цела</div>}
    {!used&&!canRepair&&<div style={{fontSize:11,color:"var(--color-text-muted)",marginTop:4,fontStyle:"italic"}}>Возьми набор инструментов в инвентаре (или будь Ремесленником)</div>}
    {isArt&&!used&&allies.map(function(al){var ad=dmgOf(al);if(!ad.length)return null;return <div key={al._fbId} style={{marginTop:5}}><div style={{fontSize:11,color:"var(--color-text-muted)",fontWeight:600}}>{al.name}</div><div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:2}}>{ad.map(function(it){return <button key={it.kind+it.id} onClick={function(){repAlly(al,it.kind,it.id,it.nm)}} className="n-btn n-btn-secondary" style={{padding:"3px 8px",fontSize:10}}>{it.nm+" ("+it.hp+"/"+it.mhp+")"}</button>})}</div></div>})}
    {used&&<div style={{fontSize:11,color:"var(--color-text-muted)",marginTop:4,fontStyle:"italic"}}>Отдых сбросит починку</div>}
  </div>;
})()}
</div>}

export default ArmorSection;
