import React, { useState } from 'react';
import { S } from '../../styles/ui';
import { uid } from '../../utils/dice';
import { CUR_ORDER, CUR_LABEL, CUR_ICON, emptyCurrency, toCopper, fromCopper, fmtCurrency } from '../../utils/currency';
import LiveField from '../LiveField';

function InvTab(pr){var c=pr.char;var sv=pr.save;var _a=useState("");var ni=_a[0];var sNI=_a[1];var _sp=useState(false);var spOpen=_sp[0];var sSpOpen=_sp[1];
var shopItems=(pr.shop||[]).filter(function(i){return i.cat==="item"||i.cat==="tool"||i.cat==="ammo"});
var curr=c.currency||{gold:0,silver:(c.gold||0),bronze:0,copper:0};

function addLocal(){if(!ni.trim())return;sv(Object.assign({},c,{inventory:(c.inventory||[]).concat([{id:uid(),name:ni.trim(),qty:1,equipped:false}])}));sNI("")}

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
  var inv=(c.inventory||[]).slice();
  if(ptype){
    var ex=inv.find(function(i){return i.proj&&i.ptype===ptype});
    if(ex){inv=inv.map(function(i){return i===ex?Object.assign({},i,{qty:(i.qty||0)+1}):i})}
    else{inv=inv.concat([{id:uid(),name:it.name,qty:1,equipped:false,proj:true,ptype:ptype}])}
  } else if(dice){
    inv=inv.concat([{id:uid(),name:it.name,qty:1,equipped:false,tool:true,dice:dice}]);
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
{shopItems.map(function(it){var ptype=it.ptype||(it.cat==="ammo"?"Стрела":"");var dice=it.dice||(it.cat==="tool"?"1d4":"");var price=priceOf(it);var cost=toCopper(price);
return(<div key={it.id} style={{display:"flex",alignItems:"center",gap:6,background:"#232532",border:"1px solid #34374a",borderRadius:6,padding:"4px 7px"}}>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:10,fontWeight:700,color:"#e9e9ed"}}>{it.name}{cost>0?<span style={{fontSize:8,color:"#d97706",marginLeft:5}}>{"💰 "+fmtCurrency(price)}</span>:null}</div>
<div style={{fontSize:8,color:"#9397ab"}}>{[it.desc,ptype?"снаряд: "+ptype:null,dice?"починка "+dice:null].filter(Boolean).join(" · ")}</div>
</div>
<button onClick={function(){pickItem(it)}} style={{padding:"3px 9px",borderRadius:5,border:"none",background:"#f59e0b",color:"#161826",fontWeight:700,fontSize:9,cursor:"pointer"}}>Взять</button>
</div>)})}
</div>}
<div style={{background:"#2a2008",borderRadius:8,padding:"6px 8px",display:"flex",flexWrap:"wrap",gap:8,justifyContent:"space-between"}}>
{CUR_ORDER.map(function(k){return(<div key={k} style={{display:"flex",alignItems:"center",gap:3}}>
<span style={{fontSize:11}}>{CUR_ICON[k]}</span>
<span style={{fontSize:8,color:"#9397ab",fontWeight:700,width:14}}>{CUR_LABEL[k]}</span>
<button onClick={function(){setCur(k,-1)}} style={S.sm}>−</button>
<LiveField type="number" min="0" value={curr[k]||0} onCommit={function(val){setCurAbs(k,val)}} style={{fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:700,color:"#d97706",background:"#1b1d29",border:"1px solid #34374a",borderRadius:5,width:44,textAlign:"center",padding:"2px 0",outline:"none"}}/>
<button onClick={function(){setCur(k,1)}} style={S.sm}>+</button>
</div>)})}
</div>
{(c.inventory||[]).map(function(it,idx){return <div key={(it.id!=null?it.id:"i")+"_"+idx} style={{display:"flex",alignItems:"center",gap:3,background:it.equipped?"#12233a":"#1b1d29",border:"1px solid #34374a",borderRadius:5,padding:"3px 6px"}}><button onClick={function(){sv(Object.assign({},c,{inventory:(c.inventory||[]).map(function(i,j){return j===idx?Object.assign({},i,{equipped:!i.equipped}):i})}))}} style={{background:"none",border:"none",fontSize:11,cursor:"pointer"}}>{it.equipped?"🛡️":"📦"}</button><span style={{flex:1,fontSize:9}}>{it.name}</span><button onClick={function(){sv(Object.assign({},c,{inventory:(c.inventory||[]).map(function(i,j){return j===idx?Object.assign({},i,{qty:Math.max(0,i.qty-1)}):i}).filter(function(i){return i.qty>0})}))}} style={Object.assign({},S.sm,{width:16,height:16,fontSize:7})}>−</button><span style={{fontSize:9,fontWeight:700}}>{it.qty}</span><button onClick={function(){sv(Object.assign({},c,{inventory:(c.inventory||[]).map(function(i,j){return j===idx?Object.assign({},i,{qty:i.qty+1}):i})}))}} style={Object.assign({},S.sm,{width:16,height:16,fontSize:7})}>+</button><button onClick={function(){sv(Object.assign({},c,{inventory:(c.inventory||[]).filter(function(i,j){return j!==idx})}))}} style={{background:"none",border:"none",color:"#ef4444",fontSize:9,cursor:"pointer"}}>✕</button></div>})}
</div>)}

export default InvTab;
