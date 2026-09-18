import React, { useState } from 'react';
import { db, ref, set } from '../../firebase';
import { ZONES, ARMOR_T, aimPen, weapDur, breaksVs } from '../../data/combat';
import { getProfs } from '../../utils/profStore';
import { DT, WS, WT, wStat, wtLabel } from '../../data/stats';
import { PROF_DESC } from '../../data/professions';
import { cF, mHP } from '../../utils/character';
import { applyDmgToNpc } from '../../utils/combat';
import { tryPay } from '../../utils/currency';
import { pk, r1, rN, sm, uid, rollHit } from '../../utils/dice';
import ArmorSection from './ArmorSection';
import InvTab from './InvTab';
import ShopPicker from '../ShopPicker';
import InitiativeBar from '../combat/InitiativeBar';

function Lbl(pr){return <div style={{fontSize:11,fontWeight:700,letterSpacing:.06,textTransform:"uppercase",color:"var(--color-text-muted)"}}>{pr.children}</div>}
function Bar(pr){return(<div style={{height:pr.h||8,borderRadius:4,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{height:"100%",width:pr.pct+"%",background:pr.color,transition:"width 0.3s"}}/></div>)}

function CombatTab(pr){
var c=pr.char;var sv=pr.save;var oR=pr.onRoll;var inf=cF(c);var fs=inf.fs;var es=inf.eSk;
var pf=getProfs().find(function(p){return p.id===c.profId})||getProfs()[0];
var _sa=useState(false);var sa=_sa[0];var sSA=_sa[1];
var _wn=useState("");var wn=_wn[0];var sWN=_wn[1];
var _wt=useState("Battle");var wt=_wt[0];var sWT=_wt[1];
var _wdt=useState("Р");var wdt=_wdt[0];var sWDT=_wdt[1];
var _wb=useState(0);var wb=_wb[0];var sWB=_wb[1];
var _wdi=useState("1d6");var wdi=_wdi[0];var sWDI=_wdi[1];
var _wh=useState(1);var wh=_wh[0];var sWH=_wh[1];
var _wdi2=useState("2d6");var wdi2=_wdi2[0];var sWDI2=_wdi2[1];var _wb2=useState(0);var wb2=_wb2[0];var sWB2=_wb2[1];
var _wcl=useState(1);var wcl=_wcl[0];var sWCL=_wcl[1];
var _wam=useState("Стрела");var wam=_wam[0];var sWAM=_wam[1];
var _tgt=useState(null);var tgtId=_tgt[0];var sTgt=_tgt[1];
var _zone=useState("Торс");var selZone=_zone[0];var sZone=_zone[1];
var _aim=useState(false);var aim=_aim[0];var sAim=_aim[1];
var _mint=useState("");var mInt=_mint[0];var sMInt=_mint[1];
var spawned=pr.spawned||{};var saveSpawned=pr.saveSpawned;
var spawnedArr=Object.entries(spawned).filter(function(e){var hp=e[1].hp!==undefined?e[1].hp:e[1].maxHp;return hp>0});
var tgtNpc=tgtId?spawned[tgtId]:null;
var mx=c.hpOv||mHP(fs);var curHp=c.curHp!==null&&c.curHp!==undefined?c.curHp:mx;
var mxW=c.willOv||fs.WILL||1;var curW=c.curWill!==null&&c.curWill!==undefined?c.curWill:mxW;
var hpP=mx>0?(curHp/mx)*100:0;
var isGM=pr.isGM;
var visibleLogs=(pr.logs||[]).filter(function(l){return isGM||(l.type!=="dmg_npc"&&l.type!=="spawn"&&l.type!=="gm_roll")});

var pdDef=PROF_DESC[pf.id]||{};
var profDesc=(pf.desc!==undefined&&pf.desc!=="")?pf.desc:(pdDef.desc||"");
var profAbilityType=pf.abilityType||pdDef.abilityType||"flavor";

return(<div style={{display:"flex",flexDirection:"column",gap:14}}>

<div className="n-card" style={{padding:"10px 14px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><Lbl>Здоровье</Lbl><div style={{display:"flex",alignItems:"baseline",gap:3}}><span style={{fontWeight:700,fontSize:15,color:"#ef4444"}}>{curHp}</span><span style={{color:"var(--color-text-muted)",fontSize:12}}>/</span><span style={{fontWeight:700,fontSize:15}}>{mx}</span></div></div>
<Bar pct={hpP} color="linear-gradient(90deg,#ef4444,#f87171)" h={6}/>
<div style={{display:"flex",gap:4,justifyContent:"center",marginTop:6}}>{[-10,-5,-1,1,5,10].map(function(d){return <button key={d} onClick={function(){sv(Object.assign({},c,{curHp:Math.max(0,Math.min(mx,curHp+d))}))}} className="n-btn n-btn-secondary" style={{padding:"1px 7px",fontSize:10,color:"#ef4444"}}>{d>0?"+"+d:d}</button>})}</div>
</div>

<div style={{display:"flex",gap:8}}>
<div className="n-card" style={{flex:1,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px"}}>
<Lbl>Воля</Lbl>
<div style={{display:"flex",alignItems:"center",gap:5}}><button onClick={function(){sv(Object.assign({},c,{curWill:Math.max(0,curW-1)}))}} className="n-btn n-btn-secondary" style={{width:20,height:20,padding:0,fontSize:11}}>−</button><span style={{fontWeight:700,fontSize:13,color:"var(--color-accent)"}}>{curW+"/"+mxW}</span><button onClick={function(){sv(Object.assign({},c,{curWill:Math.min(mxW,curW+1)}))}} className="n-btn n-btn-secondary" style={{width:20,height:20,padding:0,fontSize:11}}>+</button></div>
</div>
<button onClick={function(){sv(Object.assign({},c,{curHp:mx,curWill:mxW,warriorBonus:false,warriorBonusUsed:false,sensitiveBonus:false,customStance:false,merchantUsed:false,repairUsed:false}));pr.addLog({who:c.name||"???",type:"rest",label:"Отдых — способности восстановлены",detail:"",total:0})}} className="n-btn n-btn-secondary" style={{color:"#34d399",padding:"6px 14px"}}>Отдых</button>
</div>

<div className="n-combat-grid">
<div style={{display:"flex",flexDirection:"column",gap:14}}>

{/* Оружие */}
<div className="n-card">
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><Lbl>Оружие</Lbl><div style={{display:"flex",gap:6}}><button onClick={function(){if((c.weapons||[]).some(function(x){return x.type==="Brawl"&&x.name==="Кулаки"})){alert("Кулаки уже добавлены");return}sv(Object.assign({},c,{weapons:(c.weapons||[]).concat([{id:uid(),name:"Кулаки",type:"Brawl",dmgType:"Д",bonus:0,dmgDice:"1d6",hands:1}])}))}} title="Добавить рукопашную атаку (1d6, BODY+Brawl)" className="n-btn n-btn-secondary" style={{padding:"3px 9px",fontSize:10,color:"#f87171"}}>Кулаки</button><button onClick={function(){sSA(!sa)}} title="Добавить своё оружие вручную" className="n-btn n-btn-secondary" style={{width:26,height:26,padding:0,fontSize:14,color:"#60a5fa"}}>{sa?"✕":"✎"}</button></div></div>
<ShopPicker color="#9184d9" label="Добавить оружие" items={(pr.shop||[]).filter(function(i){return i.cat==="weapon"})} subOf={function(it){return it.wtype}} suborder={["Battle","Simple","Guns","Archery","Thrown","Brawl"]} sublabels={{Battle:"Боевое оружие",Simple:"Простое оружие",Guns:"Огнестрел",Archery:"Лук",Thrown:"Метательное",Brawl:"Рукопашное"}} sub={function(it){var h=it.hands===2?"двуруч.":it.hands===1.5?"полуторн.":"одноруч.";return wtLabel(it.wtype)+" · "+it.dmgDice+(it.bonus?"+"+it.bonus:"")+" · "+it.dmgType+" · "+h}} onPick={function(it){var pay=tryPay(c,it.price);if(pay===null)return;var newW={id:uid(),name:it.name,type:it.wtype,dmgType:it.dmgType,bonus:it.bonus||0,dmgDice:it.dmgDice,hands:it.hands};if(it.hands===1.5){newW.dmgDice2h=it.dmgDice2h;newW.bonus2h=it.bonus2h||0;}if(it.dmgType==="П"||it.wtype==="Archery"){newW.clip=it.clip||1;newW.ammo=it.clip||1;}sv(Object.assign({},c,pay,{weapons:(c.weapons||[]).concat([newW])}))}}/>
{sa&&<div style={{background:"var(--color-sunken)",borderRadius:10,padding:10,marginBottom:8,display:"flex",flexDirection:"column",gap:6}}>
<input className="n-input" value={wn} onChange={function(e){sWN(e.target.value)}} placeholder="Название"/>
<div style={{display:"flex",gap:6}}>
<select className="n-input" value={wt} onChange={function(e){sWT(e.target.value)}} style={{flex:1,padding:"6px 8px",minHeight:34,cursor:"pointer"}}>{WT.map(function(t){return <option key={t} value={t}>{wtLabel(t)}</option>})}</select>
<select className="n-input" value={wdt} onChange={function(e){sWDT(e.target.value)}} style={{width:60,padding:"6px 8px",minHeight:34,cursor:"pointer"}}>{DT.map(function(t){return <option key={t} value={t}>{t}</option>})}</select>
</div>
<div style={{display:"flex",gap:6}}>{[1,1.5,2].map(function(h){return<button key={h} onClick={function(){sWH(h)}} className="n-btn n-btn-secondary" style={{flex:1,fontSize:11,padding:"5px 0",borderColor:wh===h?"#3b82f6":"var(--color-divider)",color:wh===h?"#60a5fa":"var(--color-text-muted)"}}>{h===1?"Одноручное":h===1.5?"Полуторное":"Двуручное"}</button>})}</div>
{wh!==1.5
?<div style={{display:"flex",gap:6}}><input className="n-input" style={{flex:1,padding:"6px 8px",minHeight:34}} value={wdi} onChange={function(e){sWDI(e.target.value)}} placeholder="1d6"/><input className="n-input" style={{width:56,padding:"6px 8px",minHeight:34}} type="number" value={wb} onChange={function(e){sWB(parseInt(e.target.value)||0)}} placeholder="Бнс"/></div>
:<div style={{display:"flex",flexDirection:"column",gap:6}}>
<div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:11,color:"var(--color-text-muted)",width:50}}>1 рука:</span><input className="n-input" style={{flex:1,padding:"6px 8px",minHeight:34}} value={wdi} onChange={function(e){sWDI(e.target.value)}} placeholder="1d8"/><input className="n-input" style={{width:50,padding:"6px 8px",minHeight:34}} type="number" value={wb} onChange={function(e){sWB(parseInt(e.target.value)||0)}} placeholder="Бнс"/></div>
<div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:11,color:"var(--color-text-muted)",width:50}}>2 руки:</span><input className="n-input" style={{flex:1,padding:"6px 8px",minHeight:34}} value={wdi2} onChange={function(e){sWDI2(e.target.value)}} placeholder="2d8"/><input className="n-input" style={{width:50,padding:"6px 8px",minHeight:34}} type="number" value={wb2} onChange={function(e){sWB2(parseInt(e.target.value)||0)}} placeholder="Бнс"/></div>
</div>}
{(wdt==="П"||wt==="Archery")&&<div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:11,color:"#f0b352",width:70}}>{wt==="Archery"?"Колчан:":"Обойма:"}</span><input className="n-input" style={{width:56,padding:"6px 8px",minHeight:34}} type="number" value={wcl} onChange={function(e){sWCL(parseInt(e.target.value)||1)}} placeholder="1"/><span style={{fontSize:11,color:"var(--color-text-muted)"}}>снаряд:</span><select className="n-input" value={wam} onChange={function(e){sWAM(e.target.value)}} style={{flex:1,padding:"6px 8px",minHeight:34,cursor:"pointer"}}>{["Стрела","Болт","Пуля"].map(function(a){return <option key={a} value={a}>{a}</option>})}</select></div>}
<button onClick={function(){if(!wn.trim())return;var newW={id:uid(),name:wn.trim(),type:wt,dmgType:wdt,bonus:wb,dmgDice:wdi,hands:wh};if(wh===1.5){newW.dmgDice2h=wdi2;newW.bonus2h=wb2;}if(wdt==="П"||wt==="Archery"){newW.clip=wcl;newW.ammo=wcl;newW.ammoType=wam;}sv(Object.assign({},c,{weapons:(c.weapons||[]).concat([newW])}));sWN("");sSA(false);sWH(1);sWDI("1d6");sWDI2("2d6");sWB2(0);sWCL(1);}} className="n-btn n-btn-primary" style={{alignSelf:"flex-start"}}>Добавить</button>
</div>}
{(c.weapons||[]).length===0&&!sa&&<div style={{textAlign:"center",padding:"16px 8px",color:"var(--color-text-muted)",fontStyle:"italic",fontSize:12,border:"1px dashed var(--color-divider)",borderRadius:10}}>Нет оружия — добавь его из магазина выше</div>}
{(c.weapons||[]).map(function(w,wIdx){var sk=WS[w.type]||"Простое оружие";var statKey=wStat(w.type);var isEq=c.equippedWeapon===w.id;var isGun=w.dmgType==="П"||w.type==="Archery";var clip=w.clip||(isGun?1:0);var ammo=(w.ammo!==undefined&&w.ammo!==null)?w.ammo:clip;
var wMaxDur=(w.maxDur!==undefined&&w.maxDur!==null)?w.maxDur:weapDur(w.type);var wDur=(w.dur!==undefined&&w.dur!==null)?w.dur:wMaxDur;var broken=wMaxDur>0&&wDur<=0;
var durPct=wMaxDur>0?(wDur/wMaxDur):1;var durPen=wMaxDur>0?(durPct<=0.30?10:(durPct<=0.50?5:0)):0;
var atype=w.ammoType||(w.type==="Archery"?"Стрела":(w.dmgType==="П"?"Пуля":null));
var projLeft=atype?(c.inventory||[]).filter(function(i){return i.proj&&i.ptype===atype}).reduce(function(s,i){return s+(i.qty||0)},0):0;var curMode=c.weaponMode||"1h";var activeDice=(w.hands===1.5&&curMode==="2h")?(w.dmgDice2h||w.dmgDice):w.dmgDice;var activeBon=(w.hands===1.5&&curMode==="2h")?(w.bonus2h!==undefined?w.bonus2h:w.bonus||0):(w.bonus||0);var handsLabel=w.hands===2?"двуручное":w.hands===1.5?"полуторное":"одноручное";
return(<div key={(w.id!=null?w.id:"w")+"_"+wIdx} style={{background:isEq?"rgba(16,185,129,.08)":"var(--color-sunken)",border:"1px solid "+(isEq?"rgba(16,185,129,.3)":"var(--color-divider)"),borderRadius:10,padding:"9px 10px",marginBottom:6}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
<div style={{fontWeight:700,fontSize:13}}>{w.name}</div>
<div style={{fontSize:11,color:"var(--color-text-muted)",fontWeight:600}}>{activeDice+(activeBon?"+"+activeBon:"")}</div>
</div>
<div style={{fontSize:11,color:"var(--color-text-muted)",marginBottom:6}}>{wtLabel(w.type)+" · тип урона "+w.dmgType+" · "+handsLabel}</div>
{wMaxDur>0&&<Bar pct={wMaxDur>0?(wDur/wMaxDur)*100:0} color={broken?"#ef4444":(wDur/wMaxDur<0.34?"#f59e0b":"linear-gradient(90deg,var(--color-accent-2),var(--color-accent))")} h={4}/>}
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
{wMaxDur>0&&<span style={{fontSize:10,color:broken?"#ef4444":"var(--color-text-muted)"}}>{(broken?"сломано":wDur+"/"+wMaxDur)+(!broken&&durPen>0?" (−"+durPen+" урон)":"")}</span>}
{isGun&&<span style={{fontSize:10,fontWeight:700,color:ammo<=0?"#ef4444":"#f0b352"}}>{ammo+"/"+clip}{atype?" · "+atype+": "+projLeft:""}</span>}
</div>
<div style={{display:"flex",gap:4}}>
<button onClick={function(){var newEq=isEq?null:w.id;var upd={equippedWeapon:newEq};if(w.hands===2&&c.equippedShield)upd.equippedShield=null;sv(Object.assign({},c,upd));}} className="n-btn n-btn-secondary" style={{padding:"3px 8px",fontSize:10,color:isEq?"#34d399":"var(--color-text-muted)",borderColor:isEq?"rgba(16,185,129,.4)":"var(--color-divider)"}}>{isEq?"Снаряжено":"Снарядить"}</button>
<button onClick={function(){if(!window.confirm("Удалить "+w.name+"?"))return;var upd={weapons:(c.weapons||[]).filter(function(x,j){return j!==wIdx})};if(isEq)upd.equippedWeapon=null;sv(Object.assign({},c,upd))}} title={isEq?"Удалить (снимется с руки)":"Удалить"} style={{background:"none",border:"none",color:"#ef4444",fontSize:13,cursor:"pointer"}}>✕</button>
</div>
</div>
{w.hands===1.5&&<div style={{display:"flex",gap:4,marginTop:6}}>
<button onClick={function(){sv(Object.assign({},c,{weaponMode:"1h"}))}} className="n-btn n-btn-secondary" style={{flex:1,fontSize:10,padding:"3px 0",borderColor:curMode==="1h"?"#3b82f6":"var(--color-divider)",color:curMode==="1h"?"#60a5fa":"var(--color-text-muted)"}}>{"1 рука · "+w.dmgDice+(w.bonus?" +"+w.bonus:"")}</button>
<button onClick={function(){var upd={weaponMode:"2h"};if(c.equippedShield)upd.equippedShield=null;sv(Object.assign({},c,upd));}} className="n-btn n-btn-secondary" style={{flex:1,fontSize:10,padding:"3px 0",borderColor:curMode==="2h"?"#3b82f6":"var(--color-divider)",color:curMode==="2h"?"#60a5fa":"var(--color-text-muted)"}}>{"2 руки · "+(w.dmgDice2h||w.dmgDice)+(w.bonus2h!==undefined?" +"+w.bonus2h:"")}</button>
</div>}
{isGun&&<button onClick={function(){
  var need=clip-ammo;if(need<=0)need=clip;
  if(atype){
    if(projLeft<=0){alert("Нет боеприпасов: "+atype);return}
    var take=Math.min(need,projLeft);var left=take;
    var inv=(c.inventory||[]).map(function(i){if(left>0&&i.proj&&i.ptype===atype){var t=Math.min(i.qty||0,left);left-=t;return Object.assign({},i,{qty:(i.qty||0)-t})}return i}).filter(function(i){return !i.proj||(i.qty||0)>0});
    sv(Object.assign({},c,{weapons:(c.weapons||[]).map(function(x){return x.id===w.id?Object.assign({},x,{clip:clip,ammo:ammo+take}):x}),inventory:inv}));
    if(pr.addLog)pr.addLog({who:c.name||"???",type:"rest",label:w.name+": +"+take+" "+atype,detail:"осталось "+(projLeft-take),total:0});
  } else {
    sv(Object.assign({},c,{weapons:(c.weapons||[]).map(function(x){return x.id===w.id?Object.assign({},x,{clip:clip,ammo:clip}):x})}));
    if(pr.addLog)pr.addLog({who:c.name||"???",type:"rest",label:w.name+" — перезарядка ("+clip+")",detail:"",total:0});
  }
}} className="n-btn n-btn-secondary" style={{marginTop:6,fontSize:10,color:"#f0b352"}}>{"Перезарядить"+(ammo<=0?" · пусто":"")}</button>}
<div style={{display:"flex",gap:6,marginTop:6}}>
<button onClick={function(){if(broken){alert(w.name+" сломано — почини набором инструментов!");return}if(isGun&&ammo<=0){alert("Нет боеприпасов — перезаряди!");return}var R=rollHit();var d=R.d;var rv=fs[statKey]||0;var sv2=es[sk]||0;var warBon=(c.warriorBonus&&(pf.id==="warrior"||pf.abilityType==="bonus_attack"))?5:0;var _patch={};if(warBon)_patch.warriorBonus=false;var wP=null;if(isGun)wP=Object.assign(wP||{},{clip:clip,ammo:Math.max(0,ammo-1)});if(R.fumble&&tgtNpc&&wMaxDur>0){var _at=tgtNpc.armorBody||"none";var _ahp=tgtNpc.armorBodyHp||0;if(_ahp>0&&breaksVs(w.dmgType,_at))wP=Object.assign(wP||{},{maxDur:wMaxDur,dur:Math.max(0,wDur-1)});}if(wP)_patch.weapons=(c.weapons||[]).map(function(x){return x.id===w.id?Object.assign({},x,wP):x});if(Object.keys(_patch).length)sv(Object.assign({},c,_patch));var aimP=(aim&&tgtNpc)?aimPen(selZone):0;var t=d+rv+sv2+(w.bonus||0)+warBon-aimP;pr.addLog({who:c.name||"???",type:"hit",label:w.name+(tgtNpc?" → "+tgtNpc.name:"")+(aimP?" · "+selZone+"(−"+aimP+")":"")+(warBon?" · +5":"")+(R.crit?" · крит":R.fumble?" · провал":""),detail:"d10("+d+") + "+statKey+"("+rv+") + "+sk+"("+sv2+") + бонус("+(w.bonus||0)+")"+(aimP?" − прицел("+aimP+")":"")+" = "+t,total:t});
if(tgtNpc&&tgtId&&pr.savePendingAttack){pr.savePendingAttack({id:"atk_"+Date.now(),fromPlayer:true,attackerId:c._fbId,attackerName:c.name||"???",npcId:tgtId,npcName:tgtNpc.name,hitRoll:t,atkD:d,atkREF:rv,atkStatName:statKey,atkSkill:sv2,atkSkillName:sk,atkBonus:w.bonus||0,atkCrit:R.crit,atkFumble:R.fumble,weaponName:w.name,dmgDice:activeDice||"1d6",dmgType:w.dmgType||"Р",dmgBonus:activeBon-durPen,zone:selZone,aimedZone:aimP?selZone:null,status:"pending_dodge",ts:Date.now()});}
else{oR({label:w.name+" Попад."+(aimP?" · "+selZone:""),d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:statKey,value:rv},{label:sk,value:sv2},{label:"Бнс",value:w.bonus||0}].concat(aimP?[{label:"Прицел",value:-aimP}]:[]),total:t});}}}
 className="n-btn n-btn-secondary" style={{flex:1,fontSize:11,color:"#60a5fa"}}>{"Попадание"+(tgtNpc?" → "+tgtNpc.name.slice(0,10):"")}</button>
<button onClick={function(){
  var m=activeDice.match(/(\d+)d(\d+)/);if(!m)return;
  var dice=rN(parseInt(m[1]),parseInt(m[2]));
  var warDmgBon=(c.warriorBonus&&(pf.id==="warrior"||pf.abilityType==="bonus_attack"))?5:0;
  if(warDmgBon)sv(Object.assign({},c,{warriorBonus:false}));
  var rawDmg=Math.max(0,sm(dice)+activeBon+warDmgBon-durPen);
  if(tgtNpc&&tgtId&&saveSpawned){
    applyDmgToNpc(tgtNpc,rawDmg,w.dmgType,selZone,saveSpawned,spawned,tgtId,pr.addLog,c.name||"???",function(ev){
      var xpGain=tgtNpc.maxHp||0;
      if(xpGain>0){sv(Object.assign({},c,{xp:(c.xp||0)+xpGain}));pr.addLog({who:c.name||"???",type:"xp",label:"Опыт за "+tgtNpc.name,detail:"+"+xpGain+" XP",total:0});}
      if(pr.onNpcDeath)pr.onNpcDeath(ev);
    },w.name,pr.saveNpcHit);
  } else {
    pr.addLog({who:c.name||"???",type:"dmg",label:w.name+" ("+w.dmgType+")"+(warDmgBon?" · +5":""),detail:activeDice+"["+dice.join(",")+"]"+(w.bonus?("+бнс("+w.bonus+")"):"")+(warDmgBon?"+5":"")+" = "+rawDmg,total:rawDmg});
  }
  oR({label:w.name+" Урон",d10:null,parts:[{label:activeDice,value:sm(dice)},{label:"Бнс",value:activeBon+warDmgBon}],total:rawDmg,subtext:"Тип: "+w.dmgType+(warDmgBon?" · +5":"")+(tgtNpc?" → "+tgtNpc.name+"\nЗона: "+selZone:" (нет цели)")});
}} className="n-btn n-btn-secondary" style={{flex:1,fontSize:11,color:"#dc2626"}}>{"Урон"+(tgtNpc?" → "+tgtNpc.name.slice(0,10):"")}</button>
</div>
</div>)})}
</div>

{/* Броня игрока */}
<ArmorSection char={c} save={sv} finalStats={fs} finalSkills={es} shop={pr.shop} characters={pr.characters} room={pr.room} addLog={pr.addLog} onRoll={oR}/>

{pr.initiative&&<InitiativeBar initiative={pr.initiative}/>}

{/* Ход: объявить действие / передать ход */}
{(function(){
  var init=pr.initiative;var myTurn=!!(init&&Array.isArray(init.list)&&init.list.length&&init.list[init.turn||0]&&init.list[init.turn||0].id===c._fbId);
  function announce(a){pr.addLog({who:c.name||"???",type:"stance",label:(c.name||"???")+" объявляет: "+a,detail:"",total:0})}
  function passTurn(){
    if(!init||!Array.isArray(init.list)||!init.list.length){announce("Передать ход");return}
    var next=((init.turn||0)+1)%init.list.length;var round=(init.round||1)+(next===0?1:0);
    if(pr.saveInitiative)pr.saveInitiative(Object.assign({},init,{turn:next,round:round}));
    pr.addLog({who:c.name||"???",type:"stance",label:(c.name||"???")+" передаёт ход",detail:"",total:0});
  }
  return(<div className="n-card">
    <Lbl>Ход</Lbl>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
      {["Атака","Защита","Реакция","Предмет"].map(function(a){return <button key={a} onClick={function(){announce(a)}} className="n-btn n-btn-secondary" style={{flex:"1 1 21%",fontSize:12,padding:"8px 4px"}}>{a}</button>})}
      <button onClick={passTurn} disabled={!!init&&!myTurn} title={init&&!myTurn?"Сейчас не твой ход":"Передать ход следующему"} className="n-btn" style={{flex:"1 1 100%",fontSize:12,padding:"8px 4px",border:"1.5px solid "+(init&&!myTurn?"var(--color-divider)":"#f59e0b"),color:init&&!myTurn?"var(--color-text-muted)":"#f0b352"}}>Передать ход</button>
    </div>
  </div>);
})()}

<div style={{display:"flex",gap:6}}>
<button onClick={function(){var d=r1(6);var z=ZONES[d-1];sZone(z.name);pr.addLog({who:c.name||"???",type:"zone",label:z.name+" ×"+z.mult,detail:"1d6="+d,total:d});oR({label:"Зона",d10:d,parts:[],total:d,subtext:z.name+" ×"+z.mult+(z.ignoreArmor?" (игнор брони)":"")})}} className="n-btn n-btn-secondary" style={{flex:1,color:"#f0b352"}}>Зона</button>
<button onClick={function(){var R=rollHit();var d=R.d;var dv=fs.DEX||0;var dg=es["Уклонение"]||0;var t=d+dv+dg;pr.addLog({who:c.name||"???",type:"dodge",label:"Уклонение"+(R.crit?" · крит":R.fumble?" · провал":""),detail:"d10("+d+") + DEX("+dv+") + Уклонение("+dg+") = "+t,total:t});oR({label:"Уклонение",d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:"DEX",value:dv},{label:"Уклонение",value:dg}],total:t})}} className="n-btn n-btn-secondary" style={{flex:1,color:"#34d399"}}>Уклонение</button>
<button onClick={function(){var R=rollHit();var d=R.d;var wv=fs.WILL||0;var mr=es["Сопротивление магии"]||0;var t=d+wv+mr;pr.addLog({who:c.name||"???",type:"magic",label:"Сопр. чуду"+(R.crit?" · крит":R.fumble?" · провал":""),detail:"d10("+d+") + WILL("+wv+") + Сопр.магии("+mr+") = "+t,total:t});oR({label:"Сопротивление чуду",d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:"WILL",value:wv},{label:"Сопр.магии",value:mr}],total:t})}} className="n-btn n-btn-secondary" style={{flex:1,color:"var(--color-accent)"}}>Сопр. чуду</button>
</div>

{/* Чувствительный */}
{pf.id==="sensitive"&&<div className="n-card" style={{display:"flex",flexDirection:"column",gap:6}}>
<input className="n-input" value={mInt} onChange={function(e){sMInt(e.target.value)}} placeholder="Опиши чудо: «Создал фаербол и метнул…»"/>
<button onClick={function(){
  if(curW<=0){alert("Нет WILL!");return}
  sv(Object.assign({},c,{curWill:curW-1}));
  var cbon=r1(6)+(c.sensitiveBonus?r1(6):0);
  var ft=sm(rN(3,12))+cbon;
  var cc=r1(6);
  if(cc<=3){
    /* Срыв каста (d6 1-3): 1-2 по себе, 3 по союзнику */
    if(cc<=2){
      sv(Object.assign({},c,{curHp:Math.max(0,curHp-ft),curWill:Math.max(0,curW-1),sensitiveBonus:false}));
      pr.addLog({who:c.name||"???",type:"magic_fail",label:(mInt||"Чудо")+" — срыв (d6="+cc+")! Удар по СЕБЕ: "+ft,detail:"",total:ft});
      oR({label:mInt||"Чудо",d10:null,parts:[{label:"d6",value:cc}],total:ft,subtext:"СРЫВ КАСТА!\n"+ft+" урона СЕБЕ\n−1 WILL"});
    } else {
      var actAllies=(pr.characters||[]).filter(function(x){return x._fbId!==c._fbId&&x.active});
      if(!actAllies.length)actAllies=(pr.characters||[]).filter(function(x){return x._fbId!==c._fbId});
      var ally=actAllies.length>0?pk(actAllies):null;
      if(ally&&pr.room){
        var aInf=cF(ally);var aMx=ally.hpOv||mHP(aInf.fs);var aCur=ally.curHp!==null&&ally.curHp!==undefined?ally.curHp:aMx;var aNewHp=Math.max(0,aCur-ft);
        var aUpd=Object.assign({},ally,{curHp:aNewHp});delete aUpd._fbId;
        set(ref(db,"rooms/"+pr.room+"/characters/"+ally._fbId),aUpd);
        set(ref(db,"rooms/"+pr.room+"/dmgEvents/"+ally._fbId),{attackerName:(c.name||"???")+" (срыв магии)",dmg:ft,oldHp:aCur,newHp:aNewHp,maxHp:aMx,ts:Date.now()});
      }
      sv(Object.assign({},c,{curWill:Math.max(0,curW-1),sensitiveBonus:false}));
      pr.addLog({who:c.name||"???",type:"magic_fail",label:(mInt||"Чудо")+" — срыв (d6=3)! Дружественный огонь"+(ally?" → "+ally.name:""),detail:"Урон: "+ft,total:ft});
      oR({label:mInt||"Чудо",d10:null,parts:[{label:"d6",value:cc}],total:ft,subtext:"СРЫВ КАСТА!\n"+ft+(ally?" → "+ally.name:"")+"\n−1 WILL"});
    }
    sMInt("");
    return;
  }
  /* Каст удался (d6 4-6) — теперь враг кидает защиту (Miracle Resist) */
  if(tgtNpc&&tgtId&&pr.savePendingAttack){
    var R=rollHit();var dd=R.d;var wv=fs.WILL||0;var msk=es["Чародейство"]||0;var hitC=dd+wv+msk;
    pr.savePendingAttack({id:"atk_"+Date.now(),fromPlayer:true,magic:true,attackerId:c._fbId,attackerName:c.name||"???",npcId:tgtId,npcName:tgtNpc.name,hitRoll:hitC,atkD:dd,atkREF:wv,atkStatName:"WILL",atkSkill:msk,atkSkillName:"Чародейство",atkBonus:0,atkCrit:R.crit,atkFumble:false,weaponName:mInt||"Чудо",dmgDice:"3d12",dmgType:"Д",dmgBonus:cbon,zone:selZone,castIntent:mInt||"",status:"pending_dodge",ts:Date.now()});
    pr.addLog({who:c.name||"???",type:"magic",label:(mInt||"Чудо")+" → "+tgtNpc.name+" (каст удался d6="+cc+")"+(R.crit?" · крит":""),detail:"d10("+dd+") + WILL("+wv+") + Чародейство("+msk+") = "+hitC,total:hitC});
    oR({label:mInt||"Чудо",d10:dd,crit:R.crit,parts:[{label:"WILL",value:wv},{label:"Чародейство",value:msk}],total:hitC,subtext:(mInt?"«"+mInt+"»\n":"")+"Каст удался (d6="+cc+")\n−1 WILL\n→ "+tgtNpc.name+" сопротивляется…"});
  } else {
    pr.addLog({who:c.name||"???",type:"magic",label:(mInt||"Чудо")+" — каст удался (d6="+cc+")",detail:"нет цели",total:0});
    oR({label:mInt||"Чудо",d10:null,parts:[{label:"d6",value:cc}],total:0,subtext:(mInt?"«"+mInt+"»\n":"")+"Каст удался (d6="+cc+") — выбери цель\n−1 WILL"});
  }
  sMInt("");
}} className="n-btn n-btn-primary" style={{width:"100%"}}>{"Сотворить чудо (−1 WILL) "+(curW<=0?"⛔":"")+(tgtNpc?" → "+tgtNpc.name:"")}</button></div>}

</div>
<div style={{display:"flex",flexDirection:"column",gap:14}}>

{/* Профессия */}
{pf.id!=="none"&&<div className="n-card">
<Lbl>Профессия</Lbl>
<div style={{fontWeight:700,fontSize:15,marginTop:6}}>{pf.name}</div>
{profDesc&&<div style={{fontSize:12,color:"var(--color-text-muted)",lineHeight:1.55,marginTop:4}}>{profDesc}</div>}
<div style={{borderTop:"1px solid var(--color-divider)",margin:"10px 0"}}/>
{(function(){
  if(pf.id==="warrior"||profAbilityType==="bonus_attack"){
    var cbActive=c.warriorBonus;var cbUsed=c.warriorBonusUsed;
    return(<div>
      <div style={{fontSize:12,color:"var(--color-text)",lineHeight:1.55,marginBottom:8}}>{(pf.abN||"Способность")+": "+(pf.abilityDesc||pdDef.abilityDesc||(cbActive?"Активна — следующая атака +5":"Один раз в день: +5 к атаке в одном ходу"))}</div>
      <div style={{display:"flex",gap:6}}>
        <button disabled={cbUsed} onClick={function(){sv(Object.assign({},c,{warriorBonus:true,warriorBonusUsed:true}))}} className="n-btn" style={{flex:1,border:"none",background:cbUsed?"var(--color-divider)":cbActive?"#10b981":"#f59e0b",color:cbUsed?"var(--color-text-muted)":"#fff",fontSize:12}}>{cbUsed?(cbActive?"+5 активен":"Использовано сегодня"):"Активировать +5"}</button>
        {cbActive&&<button onClick={function(){sv(Object.assign({},c,{warriorBonus:false}))}} className="n-btn n-btn-secondary" style={{fontSize:11}}>Снять</button>}
        {cbUsed&&<button onClick={function(){sv(Object.assign({},c,{warriorBonus:false,warriorBonusUsed:false}))}} title="Сбросить (новый день)" className="n-btn n-btn-secondary" style={{fontSize:11}}>Сброс</button>}
      </div>
    </div>);
  }
  if(pf.id==="sensitive"||profAbilityType==="toggle"){
    var senActive=pf.id==="sensitive"?c.sensitiveBonus:c.customStance;
    var toggleKey=pf.id==="sensitive"?"sensitiveBonus":"customStance";
    return(<div>
      <div style={{fontSize:12,color:"var(--color-text)",lineHeight:1.55,marginBottom:8}}>{(pf.abN||"Способность")+": "+(pf.abilityDesc||pdDef.abilityDesc||"Переключатель режима")}</div>
      <button onClick={function(){var u={};u[toggleKey]=!senActive;sv(Object.assign({},c,u))}} className="n-btn" style={{width:"100%",border:"none",background:senActive?"#10b981":"var(--color-accent)",color:"#fff",fontSize:12}}>{senActive?"Активно — нажми чтобы выключить":"Активировать"}</button>
    </div>);
  }
  if(profAbilityType==="roll_charisma"){
    var merchantUsed=!!c.merchantUsed;
    return(<div>
      <div style={{fontSize:12,color:"var(--color-text)",lineHeight:1.55,marginBottom:8}}>{(pf.abN||"Способность")+": "+(pf.abilityDesc||pdDef.abilityDesc||"")}</div>
      <button disabled={merchantUsed} onClick={function(){if(merchantUsed)return;sv(Object.assign({},c,{merchantUsed:true}));var d=r1(10);var ev=fs.EMP||0;var sk=es["Убеждение"]||0;var t=d+ev+sk+5;pr.addLog({who:c.name||"???",type:"skill",label:(pf.abN||"Убеждение")+" +5",detail:"d10("+d+")+EMP("+ev+")+Убеждение("+sk+")+5 = "+t,total:t});oR({label:(pf.abN||"Убеждение")+" (+5)",d10:d,parts:[{label:"EMP",value:ev},{label:"Убеждение",value:sk},{label:"+5",value:5}],total:t})}} className="n-btn" style={{width:"100%",border:"none",background:merchantUsed?"var(--color-divider)":"var(--color-accent)",color:merchantUsed?"var(--color-text-muted)":"#fff",fontSize:12}}>{merchantUsed?"Использовано (отдых сбросит)":"Бросить Убеждение (+5)"}</button>
    </div>);
  }
  if(profAbilityType==="check"){
    return(<div>
      <div style={{fontSize:12,color:"var(--color-text)",lineHeight:1.55,marginBottom:8}}>{(pf.abN||"Способность")+": "+(pf.abilityDesc||pdDef.abilityDesc||"")}</div>
      <button onClick={function(){var d=r1(10);var hit=d>=6;pr.addLog({who:c.name||"???",type:"skill",label:(pf.abN||"Проверка")+": оценка механизма",detail:"d10="+d+(hit?" — успех":" — неудача"),total:d});oR({label:pf.abN||"Проверка",d10:d,parts:[],total:d,subtext:hit?"Успех — оценено!":"Неудача"})}} className="n-btn" style={{width:"100%",border:"none",background:"#f59e0b",color:"#fff",fontSize:12}}>Проверить механизм</button>
    </div>);
  }
  return(pf.abilityDesc||pdDef.abilityDesc)?<div style={{fontSize:12,color:"var(--color-text)",lineHeight:1.55}}>{(pf.abN||"Способность")+": "+(pf.abilityDesc||pdDef.abilityDesc)}</div>:null;
})()}
</div>}

{/* Инвентарь — полностью функционален прямо здесь */}
<div className="n-card">
<Lbl>Инвентарь</Lbl>
<div style={{marginTop:8}}>
<InvTab char={c} save={sv} shop={pr.shop}/>
</div>
</div>

{/* Цель + прицельный удар — один блок, открыт по умолчанию */}
<div className="n-card">
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<Lbl>Цель</Lbl>
<button onClick={function(){sAim(!aim)}} title="Прицельный удар: бьёшь по выбранной зоне со штрафом к попаданию" style={{padding:"6px 14px",borderRadius:8,border:"none",fontWeight:800,fontSize:12,letterSpacing:.02,cursor:"pointer",background:aim?"linear-gradient(90deg,#f59e0b,#f0b352)":"var(--color-sunken)",color:aim?"#1a1206":"var(--color-text-muted)",boxShadow:aim?"0 0 0 1.5px #f59e0b, 0 2px 8px rgba(245,158,11,.35)":"0 0 0 1.5px var(--color-divider)",transition:"all .15s"}}>{aim?("⚔ Прицельный удар (−"+aimPen(selZone)+")"):"⚔ Прицельный удар"}</button>
</div>
<div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
{spawnedArr.length===0&&<div style={{fontSize:12,color:"var(--color-text-muted)",fontStyle:"italic"}}>На поле боя пока никого нет</div>}
{spawnedArr.map(function(e){var nid=e[0];var n=e[1];var nHp=n.hp!==undefined?n.hp:n.maxHp;var hpPct=n.maxHp>0?(nHp/n.maxHp)*100:0;var isSel=tgtId===nid;
return <button key={nid} onClick={function(){sTgt(isSel?null:nid)}} style={{padding:"8px 12px",borderRadius:10,border:"1.5px solid "+(isSel?"#ef4444":"var(--color-divider)"),background:isSel?"rgba(239,68,68,.12)":"var(--color-sunken)",cursor:"pointer",display:"flex",flexDirection:"column",gap:4,minWidth:90,textAlign:"left"}}>
<span style={{fontWeight:700,fontSize:13}}>{n.name}</span>
<div style={{width:66,height:5,background:"var(--color-bg)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:hpPct+"%",background:hpPct<=25?"#ef4444":hpPct<=50?"#f59e0b":"#10b981"}}/></div>
<span style={{fontSize:10,color:"var(--color-text-muted)"}}>{nHp+"/"+n.maxHp+" HP"}</span>
</button>})}
</div>
{tgtNpc&&(function(){var atD=ARMOR_T.find(function(a){return a.id===(tgtNpc.armorBody||"none")})||ARMOR_T[0];var nHp=tgtNpc.hp!==undefined?tgtNpc.hp:tgtNpc.maxHp;var hpPct=tgtNpc.maxHp>0?(nHp/tgtNpc.maxHp)*100:0;
return(<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--color-divider)"}}>
<div style={{fontWeight:700,fontSize:14}}>{tgtNpc.name}</div>
<div style={{fontSize:11,color:"var(--color-text-muted)",marginTop:2}}>{atD.name+" броня"}</div>
<div style={{marginTop:8}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--color-text-muted)",marginBottom:3}}><span>HP</span><span style={{fontWeight:700,color:"var(--color-text)"}}>{nHp+" / "+tgtNpc.maxHp}</span></div>
<Bar pct={hpPct} color="linear-gradient(90deg,var(--color-accent),var(--color-accent-2))" h={7}/>
</div>
</div>);
})()}
{tgtNpc&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--color-divider)"}}>
<div style={{fontSize:10,fontWeight:700,letterSpacing:.05,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:6}}>Зона удара</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
{ZONES.map(function(z){var isSel=selZone===z.name;return <button key={z.name} onClick={function(){sZone(z.name)}} style={{padding:"8px 6px",borderRadius:9,border:"1.5px solid "+(isSel?"#f59e0b":"var(--color-divider)"),background:isSel?"rgba(245,158,11,.12)":"var(--color-sunken)",cursor:"pointer",opacity:aim&&!isSel?0.5:1,textAlign:"left"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><span style={{fontSize:12,fontWeight:700}}>{z.name}</span><span style={{fontSize:10,color:"var(--color-text-muted)"}}>{"×"+z.mult}</span></div>
<div style={{fontSize:9,color:"var(--color-text-muted)",marginTop:2}}>{aim?"штраф к попаданию −"+aimPen(z.name):(z.ignoreArmor?"игнор брони":"")}</div>
</button>})}
</div>
{aim&&<div style={{fontSize:11,color:"#f0b352",marginTop:6,fontStyle:"italic"}}>{"Прицельно в «"+selZone+"»: −"+aimPen(selZone)+" к попаданию, урон точно по этой зоне."}</div>}
</div>}
{!tgtNpc&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--color-divider)",opacity:.45}}>
<div style={{fontSize:10,fontWeight:700,letterSpacing:.05,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:6}}>Зона удара</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
{ZONES.map(function(z){var isSel=selZone===z.name;return <button key={z.name} disabled onClick={function(){sZone(z.name)}} style={{padding:"8px 6px",borderRadius:9,border:"1.5px solid "+(isSel?"#f59e0b":"var(--color-divider)"),background:isSel?"rgba(245,158,11,.12)":"var(--color-sunken)",cursor:"not-allowed",textAlign:"left"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><span style={{fontSize:12,fontWeight:700}}>{z.name}</span><span style={{fontSize:10,color:"var(--color-text-muted)"}}>{"×"+z.mult}</span></div>
<div style={{fontSize:9,color:"var(--color-text-muted)",marginTop:2}}>{z.ignoreArmor?"игнор брони":""}</div>
</button>})}
</div>
<div style={{fontSize:10,color:"var(--color-text-muted)",marginTop:6,fontStyle:"italic"}}>Выбери цель выше, чтобы бить по зонам</div>
</div>}
</div>

{/* Лог урона */}
<div className="n-card">
<Lbl>Лог урона</Lbl>
<div style={{maxHeight:280,overflowY:"auto",display:"flex",flexDirection:"column",gap:4,marginTop:8}}>
{visibleLogs.length===0&&<div style={{textAlign:"center",padding:10,color:"var(--color-text-muted)",fontSize:12,fontStyle:"italic"}}>Пусто</div>}
{visibleLogs.map(function(l,i){return <div key={i} style={{background:"var(--color-sunken)",borderRadius:8,padding:"6px 8px",fontSize:12}}><b>{(l.who||"")+": "+l.label}</b>{l.detail&&<div style={{fontSize:11,color:"var(--color-text-muted)",marginTop:1}}>{l.detail}</div>}{l.total>0&&<div style={{fontWeight:700,fontSize:14,marginTop:1}}>{"= "+l.total}</div>}</div>})}
</div>
</div>

</div>
</div>

</div>)}

export default CombatTab;
