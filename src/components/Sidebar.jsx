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
return(<aside style={{width:132,flexShrink:0,borderRight:"1px solid var(--color-divider)",display:"flex",flexDirection:"column",minHeight:0,background:"var(--color-bg)",overflowY:"auto"}}>
<div style={{padding:"14px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,borderBottom:"1px solid var(--color-divider)"}}>
<div style={{width:52,height:52,borderRadius:10,background:c.portrait?"none":"linear-gradient(135deg,var(--color-accent-2),var(--color-accent))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:c.portrait?0:20,fontWeight:700,color:"#161826",overflow:"hidden",boxShadow:"var(--shadow-sm)"}}>{c.portrait?<img src={c.portrait} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(c.name||"?")[0]}</div>
<div style={{fontSize:12,fontWeight:600,textAlign:"center",lineHeight:1.2,maxWidth:116,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name||"Герой"}</div>
<div style={{width:"100%"}}>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"var(--color-text-muted)",marginBottom:2}}><span>❤️ HP</span><span>{curHp+"/"+mx}</span></div>
  <div style={{height:5,borderRadius:3,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:hpP+"%",height:"100%",background:"#ef4444"}}/></div>
</div>
<div style={{width:"100%"}}>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"var(--color-text-muted)",marginBottom:2}}><span>🔥 Воля</span><span>{curW+"/"+mxW}</span></div>
  <div style={{height:5,borderRadius:3,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:wP+"%",height:"100%",background:"#8b5cf6"}}/></div>
</div>
</div>
{!c.locked&&<div style={{padding:"8px 8px",display:"flex",flexDirection:"column",gap:3,borderBottom:"1px solid var(--color-divider)"}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:stL===0?"#10b981":"var(--color-text-muted)"}}><span>Статы</span><span style={{fontWeight:700}}>{stL+"/40"}</span></div>
<div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:skL===0?"#10b981":"var(--color-text-muted)"}}><span>Навыки</span><span style={{fontWeight:700}}>{skL+"/"+(60+bsk)}</span></div>
</div>}
<div style={{flex:1,minHeight:0,padding:"6px 6px 14px"}}>
{SD.map(function(st){var sks=SKD[st.key];var op=oSt===st.key;var v=fs[st.key];
return(<div key={st.key} style={{marginBottom:3}}>
<div style={{display:"flex",alignItems:"center",gap:2,borderRadius:8}}>
<button onClick={function(){sOS(op?null:st.key)}} style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"6px 2px",background:op?"var(--color-surface)":"transparent",border:"none",borderRadius:8,cursor:"pointer"}}>
<span style={{fontSize:10,fontWeight:700,color:st.color,letterSpacing:.4}}>{st.key}</span>
<span style={{fontSize:17,fontWeight:600}}>{v}</span>
</button>
</div>
<div style={{display:"flex",justifyContent:"center",gap:3,marginBottom:2}}>
<button onClick={function(){uS(st.key,-1)}} style={Object.assign({},S.sm,{width:20,height:18,fontSize:10})}>−</button>
<button onClick={function(){var R=rollHit();var d=R.d;var t=d+v;if(pr.addLog)pr.addLog({who:c.name||"???",type:"skill",label:"Бросок "+st.key+(R.crit?" 🌟КРИТ":R.fumble?" 💀ПРОВАЛ":""),detail:"🎲"+d+" + "+st.key+"("+v+") = "+t,total:t});oR({label:st.key,d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:st.key,value:v}],total:t})}} title="Бросить характеристику" style={{width:20,height:18,border:"1px solid transparent",borderRadius:5,background:"transparent",color:st.color,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>🎲</button>
<button onClick={function(){uS(st.key,1)}} style={Object.assign({},S.sm,{width:20,height:18,fontSize:10,color:st.color})}>+</button>
</div>
{op&&sks&&<div style={{display:"flex",flexDirection:"column",gap:2,padding:"4px 0 6px",borderTop:"1px solid var(--color-divider)",marginTop:3}}>
{sks.map(function(sk){var ev=es[sk.name]||0;return(<div key={sk.name} style={{display:"flex",flexDirection:"column",gap:2,padding:"4px 3px",borderRadius:6,background:ev>0?"rgba(233,233,237,.03)":"transparent"}}>
<div style={{fontSize:9,fontWeight:ev>0?600:400,color:ev>0?"var(--color-text)":"var(--color-text-muted)",lineHeight:1.25}}>{skLabel(sk.name)}{sk.x2&&<span style={{color:"#ef4444"}}> ×2</span>}</div>
<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
<button onClick={function(){uSk(sk.name,-1)}} style={Object.assign({},S.sm,{width:18,height:18,fontSize:9})}>−</button>
<button onClick={function(){var R=rollHit();var d=R.d;var sv2=fs[st.key];var t=d+sv2+ev;if(pr.addLog)pr.addLog({who:c.name||"???",type:"skill",label:"Бросок "+skLabel(sk.name)+(R.crit?" 🌟КРИТ":R.fumble?" 💀ПРОВАЛ":""),detail:"🎲"+d+" + "+st.key+"("+sv2+") + "+skLabel(sk.name)+"("+ev+") = "+t,total:t});oR({label:skLabel(sk.name),d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:st.key,value:sv2},{label:skLabel(sk.name),value:ev}],total:t})}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,padding:0,opacity:ev>0?1:0.35}}>🎲</button>
<span style={{fontSize:12,fontWeight:700,minWidth:14,textAlign:"center",color:ev>0?st.color:"var(--color-text-muted)"}}>{ev}</span>
<button onClick={function(){uSk(sk.name,1)}} style={Object.assign({},S.sm,{width:18,height:18,fontSize:9,color:st.color})}>+</button>
</div>
</div>)})}
</div>}
</div>)})}
</div>
</aside>)}

export default Sidebar;
