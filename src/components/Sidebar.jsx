import React, { useState } from 'react';
import { SD, SKD, skLabel } from '../data/stats';
import { S } from '../styles/ui';
import { cF, mHP, uSP, uSkP } from '../utils/character';
import { rollHit } from '../utils/dice';
import { getRaces } from '../utils/raceStore';

/* Постоянная левая колонка — характеристики и навыки видны всегда,
   не прячутся за вкладкой (в отличие от остального листа персонажа). */
function Sidebar(pr){
var c=pr.char;var sv=pr.save;var oR=pr.onRoll;
var inf=cF(c);var fs=inf.fs;var es=inf.eSk;var rc=inf.race||{};
var _os=useState(null);var oSt=_os[0];var sOS=_os[1];
var mx=c.hpOv||mHP(fs);var curHp=c.curHp!==null&&c.curHp!==undefined?c.curHp:mx;var hpP=mx>0?(curHp/mx)*100:0;
var mxW=c.willOv||fs.WILL||1;var curW=c.curWill!==null&&c.curWill!==undefined?c.curWill:mxW;var wP=mxW>0?(curW/mxW)*100:0;
var bsk=rc.bsp?1:0;var stL=40-uSP(c.stats||{});var skL=(60+bsk)-uSkP(c.skills||{});
function uS(k,d){var stats=Object.assign({},c.stats);if(c.locked){if(d<0)return;var avL=(c.lvlPts||0)-(c.spentLvlPts||0);if(avL<5)return;stats[k]=(stats[k]||0)+1;if(stats[k]>10)return;sv(Object.assign({},c,{stats:stats,spentLvlPts:(c.spentLvlPts||0)+5}));return}stats[k]=(stats[k]||0)+d;if(stats[k]<1||stats[k]>8)return;if(uSP(stats)>40)return;sv(Object.assign({},c,{stats:stats}))}
function uSk(n,d){var skills=Object.assign({},c.skills);if(c.locked){if(d<0)return;var sd=Object.values(SKD).flat().find(function(s){return s.name===n});var cost=sd&&sd.x2?4:2;var avL=(c.lvlPts||0)-(c.spentLvlPts||0);if(avL<cost)return;skills[n]=(skills[n]||0)+1;if(skills[n]>10)return;sv(Object.assign({},c,{skills:skills,spentLvlPts:(c.spentLvlPts||0)+cost}));return}skills[n]=(skills[n]||0)+d;if(skills[n]<0||skills[n]>10)return;if(uSkP(skills)>60+bsk)return;sv(Object.assign({},c,{skills:skills}))}
return(<aside style={{width:104,flexShrink:0,borderRight:"1px solid var(--color-divider)",display:"flex",flexDirection:"column",minHeight:0,background:"var(--color-bg)",overflowY:"auto"}}>
<div style={{padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,borderBottom:"1px solid var(--color-divider)"}}>
<div style={{width:40,height:40,borderRadius:8,background:c.portrait?"none":"linear-gradient(135deg,#34374a,#3a3322)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:c.portrait?0:16,overflow:"hidden",boxShadow:"inset 0 0 0 1px var(--color-divider)"}}>{c.portrait?<img src={c.portrait} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(c.name||"?")[0]}</div>
<div style={{fontSize:10,fontWeight:700,textAlign:"center",lineHeight:1.15,maxWidth:92,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name||"Герой"}</div>
<div style={{width:"100%"}}>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#9397ab",marginBottom:1}}><span>❤️</span><span>{curHp+"/"+mx}</span></div>
  <div style={{height:4,borderRadius:2,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:hpP+"%",height:"100%",background:"#ef4444"}}/></div>
</div>
<div style={{width:"100%"}}>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:"#9397ab",marginBottom:1}}><span>🔥</span><span>{curW+"/"+mxW}</span></div>
  <div style={{height:4,borderRadius:2,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:wP+"%",height:"100%",background:"#8b5cf6"}}/></div>
</div>
</div>
{!c.locked&&<div style={{padding:"5px 6px",display:"flex",flexDirection:"column",gap:2,borderBottom:"1px solid var(--color-divider)"}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:stL===0?"#10b981":"#9397ab"}}><span>Статы</span><span style={{fontWeight:700}}>{stL+"/40"}</span></div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:skL===0?"#10b981":"#9397ab"}}><span>Навыки</span><span style={{fontWeight:700}}>{skL+"/"+(60+bsk)}</span></div>
</div>}
<div style={{flex:1,minHeight:0,padding:"4px 4px 10px"}}>
{SD.map(function(st){var sks=SKD[st.key];var op=oSt===st.key;var v=fs[st.key];
return(<div key={st.key} style={{marginBottom:2}}>
<div style={{display:"flex",alignItems:"center",gap:2,borderRadius:6}}>
<button onClick={function(){sOS(op?null:st.key)}} style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",alignItems:"center",gap:0,padding:"5px 2px",background:op?"var(--color-surface)":"transparent",border:"none",borderRadius:6,cursor:"pointer"}}>
<span style={{fontSize:8,fontWeight:700,color:st.color}}>{st.key}</span>
<span style={{fontSize:14,fontWeight:700}}>{v}</span>
</button>
</div>
<div style={{display:"flex",justifyContent:"center",gap:2,marginBottom:1}}>
<button onClick={function(){uS(st.key,-1)}} style={Object.assign({},S.sm,{width:16,height:14,fontSize:8})}>−</button>
<button onClick={function(){var R=rollHit();var d=R.d;var t=d+v;if(pr.addLog)pr.addLog({who:c.name||"???",type:"skill",label:"Бросок "+st.key+(R.crit?" 🌟КРИТ":R.fumble?" 💀ПРОВАЛ":""),detail:"🎲"+d+" + "+st.key+"("+v+") = "+t,total:t});oR({label:st.key,d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:st.key,value:v}],total:t})}} title="Бросить характеристику" style={{width:16,height:14,border:"1px solid transparent",borderRadius:4,background:"transparent",color:st.color,cursor:"pointer",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center"}}>🎲</button>
<button onClick={function(){uS(st.key,1)}} style={Object.assign({},S.sm,{width:16,height:14,fontSize:8,color:st.color})}>+</button>
</div>
{op&&sks&&<div style={{display:"flex",flexDirection:"column",gap:1,padding:"2px 0 4px",borderTop:"1px solid var(--color-divider)",marginTop:2}}>
{sks.map(function(sk){var ev=es[sk.name]||0;return(<div key={sk.name} style={{display:"flex",flexDirection:"column",gap:1,padding:"3px 2px",borderRadius:4}}>
<div style={{fontSize:7,fontWeight:ev>0?700:400,color:ev>0?"#e9e9ed":"#9397ab",lineHeight:1.2}}>{skLabel(sk.name)}{sk.x2&&<span style={{color:"#ef4444"}}>×2</span>}</div>
<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:2}}>
<button onClick={function(){uSk(sk.name,-1)}} style={Object.assign({},S.sm,{width:14,height:14,fontSize:7})}>−</button>
<button onClick={function(){var R=rollHit();var d=R.d;var sv2=fs[st.key];var t=d+sv2+ev;if(pr.addLog)pr.addLog({who:c.name||"???",type:"skill",label:"Бросок "+skLabel(sk.name)+(R.crit?" 🌟КРИТ":R.fumble?" 💀ПРОВАЛ":""),detail:"🎲"+d+" + "+st.key+"("+sv2+") + "+skLabel(sk.name)+"("+ev+") = "+t,total:t});oR({label:skLabel(sk.name),d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:st.key,value:sv2},{label:skLabel(sk.name),value:ev}],total:t})}} style={{background:"none",border:"none",cursor:"pointer",fontSize:9,padding:0,opacity:ev>0?1:0.35}}>🎲</button>
<span style={{fontSize:10,fontWeight:700,minWidth:12,textAlign:"center",color:ev>0?st.color:"#4b443a"}}>{ev}</span>
<button onClick={function(){uSk(sk.name,1)}} style={Object.assign({},S.sm,{width:14,height:14,fontSize:7,color:st.color})}>+</button>
</div>
</div>)})}
</div>}
</div>)})}
</div>
</aside>)}

export default Sidebar;
