import React, { useState } from 'react';
import { S } from '../../styles/ui';
import { uid, r1 } from '../../utils/dice';
import { cF, mHP } from '../../utils/character';
import { CUR_ORDER, CUR_LABEL, CUR_ICON, emptyCurrency, toCopper, fromCopper, fmtCurrency } from '../../utils/currency';
import LiveField from '../LiveField';

/* "NdM" -> сумма броска (та же логика, что и у ремкомплектов в ArmorSection) */
function rollDice(d){var m=(""+d).match(/(\d+)d(\d+)/);if(!m)return r1(4);var n=parseInt(m[1])||1,f=parseInt(m[2])||4,t=0;for(var i=0;i<n;i++)t+=r1(f);return t}

var ITEM_SUBORDER=["potion","ammo","repair","misc"];
var ITEM_SUBLABEL={potion:"🧪 Зелья и тоники",ammo:"🏹 Боеприпасы",repair:"🔧 Ремкомплекты",misc:"🎒 Бытовые вещи"};
function itemSubOf(it){if(it.heal)return"potion";if(it.ptype||it.cat==="ammo")return"ammo";if(it.dice||it.cat==="tool")return"repair";return"misc"}

function InvTab(pr){var c=pr.char;var sv=pr.save;var _a=useState("");var ni=_a[0];var sNI=_a[1];var _sp=useState(false);var spOpen=_sp[0];var sSpOpen=_sp[1];
var _cg=useState({});var collapsedGroups=_cg[0];var sCG=_cg[1];
var shopItems=(pr.shop||[]).filter(function(i){return i.cat==="item"||i.cat==="tool"||i.cat==="ammo"});
var curr=c.currency||{gold:0,silver:(c.gold||0),bronze:0,copper:0};

function addLocal(){if(!ni.trim())return;sv(Object.assign({},c,{inventory:(c.inventory||[]).concat([{id:uid(),name:ni.trim(),qty:1,equipped:false}])}));sNI("")}

/* Зелья/тоники — расходуются, откатывают HP или Волю на бросок кости и
   пишутся в лог, как и починка снаряжения. */
function useItem(idx){
  var it=(c.inventory||[])[idx];if(!it||!it.heal)return;
  var amt=rollDice(it.heal);
  var patch={};
  if(it.healWill){
    var mxW=c.willOv||cF(c).fs.WILL||1;var curW=c.curWill!==null&&c.curWill!==undefined?c.curWill:mxW;
    patch.curWill=Math.min(mxW,curW+amt);
  } else {
    var mx=c.hpOv||mHP(cF(c).fs,c);var curH=c.curHp!==null&&c.curHp!==undefined?c.curHp:mx;
    patch.curHp=Math.min(mx,curH+amt);
  }
  patch.inventory=(c.inventory||[]).map(function(i,j){return j===idx?Object.assign({},i,{qty:(i.qty||0)-1}):i}).filter(function(i){return i.qty>0});
  sv(Object.assign({},c,patch));
  if(pr.addLog)pr.addLog({who:c.name||"???",type:"rest",label:"🧪 "+it.name+": +"+amt+(it.healWill?" Воли":" HP"),detail:it.heal,total:amt});
  if(pr.onRoll)pr.onRoll({label:it.name,d10:null,parts:[],total:amt,subtext:(it.healWill?"Восстановлено Воли: +":"Восстановлено HP: +")+amt});
}

function setCur(k,d){var nc=Object.assign({},curr);nc[k]=Math.max(0,(nc[k]||0)+d);sv(Object.assign({},c,{currency:nc}))}

function setCurAbs(k,val){var nc=Object.assign({},curr);nc[k]=Math.max(0,parseInt(val)||0);sv(Object.assign({},c,{currency:nc}))}

function priceOf(it){return (it.price&&typeof it.price==="object")?it.price:emptyCurrency()}

function pickItem(it){
  var price=priceOf(it);var cost=toCopper(price);var patch={};
  if(cost>0){
    var have=toCopper(curr);
    if(have<cost){alert("Не хватает денег: нужно "+fmtCurrency(price)+", у тебя "+fmtCurrency(curr));return}
    patch.currency=fromCopper(have-cost);
  }
  var ptype=it.ptype||(it.cat==="ammo"?"Стрела":"");
  var dice=it.dice||(it.cat==="tool"?"1d4":"");
  var heal=it.heal||"";
  var inv=(c.inventory||[]).slice();
  if(ptype){
    var bundle=it.bundleQty||1;
    var ex=inv.find(function(i){return i.proj&&i.ptype===ptype});
    if(ex){inv=inv.map(function(i){return i===ex?Object.assign({},i,{qty:(i.qty||0)+bundle}):i})}
    else{inv=inv.concat([{id:uid(),name:it.name,qty:bundle,equipped:false,proj:true,ptype:ptype}])}
  } else if(dice){
    inv=inv.concat([{id:uid(),name:it.name,qty:1,equipped:false,tool:true,dice:dice}]);
  } else if(heal){
    var exH=inv.find(function(i){return i.heal===heal&&i.healWill===!!it.healWill&&i.name===it.name});
    if(exH){inv=inv.map(function(i){return i===exH?Object.assign({},i,{qty:(i.qty||0)+1}):i})}
    else{inv=inv.concat([{id:uid(),name:it.name,qty:1,equipped:false,heal:heal,healWill:!!it.healWill}])}
  } else {
    inv=inv.concat([{id:uid(),name:it.name,qty:1,equipped:false}]);
  }
  patch.inventory=inv;
  sv(Object.assign({},c,patch));
  sSpOpen(false);
}

return(<div style={{display:"flex",flexDirection:"column",gap:6}}>
<div style={{display:"flex",gap:3}}>
<input style={Object.assign({},S.inp,{flex:2})} value={ni} onChange={function(e){sNI(e.target.value)}} placeholder="Предмет..." onKeyDown={function(e){if(e.key==="Enter")addLocal()}}/>
<button onClick={addLocal} title="Добавить свой предмет" style={Object.assign({},S.ab,{width:30,background:"#10b981",color:"#fff",fontWeight:700,border:"none"})}>+</button>
<button onClick={function(){sSpOpen(!spOpen)}} title="Взять из магазина" style={Object.assign({},S.ab,{width:30,background:"#f59e0b",color:"#161826",fontWeight:700,border:"none",fontSize:14})}>{spOpen?"✕":"+"}</button>
</div>
{spOpen&&<div style={{background:"#1b1d29",border:"1px solid #34374a",borderRadius:8,padding:6,display:"flex",flexDirection:"column",gap:3}}>
{shopItems.length===0&&<div style={{fontSize:9,color:"#9397ab",fontStyle:"italic",textAlign:"center",padding:6}}>Пусто — ГМ ещё не добавил вещи</div>}
{ITEM_SUBORDER.map(function(sk){
var list=shopItems.filter(function(it){return itemSubOf(it)===sk});
if(!list.length)return null;
var collapsed=collapsedGroups[sk]!==undefined?collapsedGroups[sk]:list.length>6;
return(<div key={sk} style={{display:"flex",flexDirection:"column",gap:3}}>
<button onClick={function(){sCG(function(cg){var n=Object.assign({},cg);n[sk]=!collapsed;return n})}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",padding:"3px 1px",marginTop:3,cursor:"pointer"}}>
<span style={{fontSize:9,fontWeight:700,color:"#f59e0b"}}>{ITEM_SUBLABEL[sk]}</span>
<span style={{fontSize:8,color:"#75798c"}}>{(collapsed?"▸ показать ":"▾ скрыть ")+list.length}</span>
</button>
{!collapsed&&list.map(function(it){var ptype=it.ptype||(it.cat==="ammo"?"Стрела":"");var dice=it.dice||(it.cat==="tool"?"1d4":"");var heal=it.heal||"";var price=priceOf(it);var cost=toCopper(price);
return(<div key={it.id} style={{display:"flex",alignItems:"center",gap:6,background:"#232532",border:"1px solid #34374a",borderRadius:6,padding:"4px 7px"}}>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:10,fontWeight:700,color:"#e9e9ed"}}>{it.name}{cost>0?<span style={{fontSize:8,color:"#d97706",marginLeft:5}}>{"💰 "+fmtCurrency(price)}</span>:null}</div>
<div style={{fontSize:8,color:"#9397ab"}}>{[it.desc,ptype?("снаряд: "+ptype+(it.bundleQty>1?" ×"+it.bundleQty:"")):null,dice?"починка "+dice:null,heal?("🧪 "+heal+(it.healWill?" Воли":" HP")):null].filter(Boolean).join(" · ")}</div>
</div>
<button onClick={function(){pickItem(it)}} style={{padding:"3px 9px",borderRadius:5,border:"none",background:"#f59e0b",color:"#161826",fontWeight:700,fontSize:9,cursor:"pointer"}}>Взять</button>
</div>)})}
</div>)})}
</div>}
<div style={{background:"#2a2008",borderRadius:8,padding:"6px 8px",display:"flex",flexWrap:"wrap",gap:8,justifyContent:"space-between"}}>
{CUR_ORDER.map(function(k){return(<div key={k} style={{display:"flex",alignItems:"center",gap:3}}>
<span style={{fontSize:11}}>{CUR_ICON[k]}</span>
<span style={{fontSize:8,color:"#9397ab",fontWeight:700,width:22}}>{CUR_LABEL[k]}</span>
<button onClick={function(){setCur(k,-1)}} style={S.sm}>−</button>
<LiveField type="number" min="0" value={curr[k]||0} onCommit={function(val){setCurAbs(k,val)}} style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,color:"#d97706",background:"#1b1d29",border:"1px solid #34374a",borderRadius:5,width:44,textAlign:"center",padding:"2px 0",outline:"none"}}/>
<button onClick={function(){setCur(k,1)}} style={S.sm}>+</button>
</div>)})}
</div>
{(c.inventory||[]).map(function(it,idx){return <div key={(it.id!=null?it.id:"i")+"_"+idx} style={{display:"flex",alignItems:"center",gap:3,background:it.equipped?"#12233a":"#1b1d29",border:"1px solid #34374a",borderRadius:5,padding:"3px 6px"}}><button onClick={function(){sv(Object.assign({},c,{inventory:(c.inventory||[]).map(function(i,j){return j===idx?Object.assign({},i,{equipped:!i.equipped}):i})}))}} style={{background:"none",border:"none",fontSize:11,cursor:"pointer"}}>{it.equipped?"🛡️":"📦"}</button><span style={{flex:1,fontSize:9}}>{it.name}{it.heal?<span style={{color:"#f87171",marginLeft:4}}>{"🧪"+it.heal}</span>:null}</span>{it.heal&&<button onClick={function(){useItem(idx)}} title={"Выпить/использовать: +"+it.heal+(it.healWill?" Воли":" HP")} style={{padding:"2px 7px",borderRadius:4,border:"none",background:"#dc2626",color:"#fff",fontWeight:700,fontSize:8,cursor:"pointer"}}>Исп.</button>}<button onClick={function(){sv(Object.assign({},c,{inventory:(c.inventory||[]).map(function(i,j){return j===idx?Object.assign({},i,{qty:Math.max(0,i.qty-1)}):i}).filter(function(i){return i.qty>0})}))}} style={Object.assign({},S.sm,{width:16,height:16,fontSize:7})}>−</button><span style={{fontSize:9,fontWeight:700}}>{it.qty}</span><button onClick={function(){sv(Object.assign({},c,{inventory:(c.inventory||[]).map(function(i,j){return j===idx?Object.assign({},i,{qty:i.qty+1}):i})}))}} style={Object.assign({},S.sm,{width:16,height:16,fontSize:7})}>+</button><button onClick={function(){sv(Object.assign({},c,{inventory:(c.inventory||[]).filter(function(i,j){return j!==idx})}))}} style={{background:"none",border:"none",color:"#ef4444",fontSize:9,cursor:"pointer"}}>✕</button></div>})}
</div>)}

export default InvTab;
