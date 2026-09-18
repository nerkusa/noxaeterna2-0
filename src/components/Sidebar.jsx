import React, { useState } from 'react';
import { SD, SKD, skLabel } from '../data/stats';
import { S } from '../styles/ui';
import { cF, mHP, uSP, uSkP, rndStats, xpProgress } from '../utils/character';
import { rollHit } from '../utils/dice';
import { getProfs } from '../utils/profStore';
import { IconD10 } from '../icons/index';

/* Постоянная левая колонка — характеристики и навыки видны всегда,
   не прячутся за вкладкой (в отличие от остального листа персонажа). */
function Sidebar(pr){
var c=pr.char;var sv=pr.save;var oR=pr.onRoll;var isGM=!!pr.isGM;
var inf=cF(c);var fs=inf.fs;var es=inf.eSk;var rc=inf.race||{};
var pf=getProfs().find(function(p){return p.id===c.profId})||getProfs()[0];
var _os=useState(null);var oSt=_os[0];var sOS=_os[1];
var _un=useState(null);var undo=_un[0];var sU=_un[1];
var mx=c.hpOv||mHP(fs,c);var curHp=c.curHp!==null&&c.curHp!==undefined?c.curHp:mx;var hpP=mx>0?(curHp/mx)*100:0;
var mxW=c.willOv||fs.WILL||1;var curW=c.curWill!==null&&c.curWill!==undefined?c.curWill:mxW;var wP=mxW>0?(curW/mxW)*100:0;
var xpp=xpProgress(c);
var bsk=rc.bsp?1:0;var stL=40-uSP(c.stats||{});var skL=(60+bsk)-uSkP(c.skills||{});
var raceBonusTags=Object.entries(rc.st||{}).map(function(e){var sd=SD.find(function(s){return s.key===e[0]});return{label:"+"+e[1]+" "+(sd?sd.key:e[0]),color:sd?sd.color:"var(--color-accent)"}});
/* ГМ редактирует характеристики/навыки напрямую, без пула и без трат
   очков уровня — на любом персонаже, запертом или нет. Игрок до «Принять»
   свободно распределяет очки из общего пула; после «Принять» — только
   тратит очки за уровни (spentLvlPts), назад отменить нельзя. */
function uS(k,d){var stats=Object.assign({},c.stats);if(isGM){stats[k]=Math.max(1,Math.min(10,(stats[k]||0)+d));sv(Object.assign({},c,{stats:stats}));return}if(c.locked){if(d<0)return;var avL=(c.lvlPts||0)-(c.spentLvlPts||0);if(avL<5)return;stats[k]=(stats[k]||0)+1;if(stats[k]>10)return;sv(Object.assign({},c,{stats:stats,spentLvlPts:(c.spentLvlPts||0)+5}));return}stats[k]=(stats[k]||0)+d;if(stats[k]<1||stats[k]>8)return;if(uSP(stats)>40)return;sv(Object.assign({},c,{stats:stats}))}
function uSk(n,d){var skills=Object.assign({},c.skills);if(isGM){skills[n]=Math.max(0,Math.min(10,(skills[n]||0)+d));sv(Object.assign({},c,{skills:skills}));return}if(c.locked){if(d<0)return;var sd=Object.values(SKD).flat().find(function(s){return s.name===n});var cost=sd&&sd.x2?4:2;var avL=(c.lvlPts||0)-(c.spentLvlPts||0);if(avL<cost)return;skills[n]=(skills[n]||0)+1;if(skills[n]>10)return;sv(Object.assign({},c,{skills:skills,spentLvlPts:(c.spentLvlPts||0)+cost}));return}skills[n]=(skills[n]||0)+d;if(skills[n]<0||skills[n]>10)return;if(uSkP(skills)>60+bsk)return;sv(Object.assign({},c,{skills:skills}))}
return(<aside className="n-sidebar" style={{flexShrink:0,borderRight:"1px solid var(--color-divider)",display:"flex",flexDirection:"column",minHeight:0,background:"var(--color-bg)",overflowY:"auto"}}>

<div style={{padding:14,display:"flex",gap:10,alignItems:"flex-start",borderBottom:"1px solid var(--color-divider)"}}>
<div className="n-sidebar-portrait" style={{width:48,height:48,borderRadius:10,flexShrink:0,background:c.portrait?"none":"repeating-linear-gradient(135deg,var(--color-surface) 0 4px,var(--color-sunken) 4px 8px)",boxShadow:"inset 0 0 0 1px var(--color-divider)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{c.portrait?<img src={c.portrait} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:8,color:"var(--color-text-muted)",fontWeight:600}}>{(c.name||"?")[0]}</span>}</div>
<div className="n-sidebar-info" style={{minWidth:0}}>
  <div style={{fontSize:16,fontWeight:600,lineHeight:1.15}}>{c.name||"Герой"}</div>
  <div style={{fontSize:11,color:"var(--color-text-muted)",marginTop:2}}>{[pf.id!=="none"?pf.name:null,rc.id!=="none"?rc.name:null,"ур. "+c.level].filter(Boolean).join(" · ")}</div>
  <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
    {pf.id!=="none"&&pf.abN&&<span className="n-tag" style={{background:"rgba(145,132,217,.14)",color:"var(--color-accent)"}}>{pf.abN}</span>}
    {raceBonusTags.map(function(t,i){return <span key={i} className="n-tag" style={{background:t.color+"22",color:t.color}}>{t.label}</span>})}
  </div>
</div>
</div>

<div className="n-sidebar-bars" style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:8,borderBottom:"1px solid var(--color-divider)"}}>
<div>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontWeight:600,letterSpacing:.06,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:3}}><span>Здоровье</span><span style={{color:"var(--color-text)",textTransform:"none",fontWeight:700}}>{curHp+" / "+mx}</span></div>
  <div style={{height:6,borderRadius:3,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:hpP+"%",height:"100%",background:"linear-gradient(90deg,#ef4444,#f87171)"}}/></div>
</div>
<div>
  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontWeight:600,letterSpacing:.06,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:3}}><span>Воля</span><span style={{color:"var(--color-text)",textTransform:"none",fontWeight:700}}>{curW+" / "+mxW}</span></div>
  <div style={{height:6,borderRadius:3,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:wP+"%",height:"100%",background:"linear-gradient(90deg,var(--color-accent),var(--color-accent-2))"}}/></div>
</div>
<div>
  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",rowGap:1,fontSize:10,fontWeight:600,letterSpacing:.06,textTransform:"uppercase",color:"var(--color-text-muted)",marginBottom:3}}><span>Опыт</span><span style={{whiteSpace:"nowrap",color:xpp.ready?"#34d399":"var(--color-text)",textTransform:"none",fontWeight:700}}>{xpp.got+"/"+xpp.need+" до ур."+(xpp.level+1)}</span></div>
  <div style={{height:6,borderRadius:3,background:"var(--color-sunken)",overflow:"hidden"}}><div style={{width:xpp.pct+"%",height:"100%",background:xpp.ready?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#f59e0b,#fbbf24)"}}/></div>
  {xpp.ready&&<div style={{fontSize:9,color:"#34d399",fontWeight:700,marginTop:2}}>Хватает опыта на новый уровень — попроси ГМ повысить</div>}
</div>
</div>

<div style={{padding:"10px 14px 4px",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
<span className="n-sidebar-hide-compact" style={{fontSize:10,fontWeight:700,letterSpacing:.06,textTransform:"uppercase",color:"var(--color-text-muted)"}}>Характеристики и навыки</span>
{!c.locked&&!isGM&&<span style={{fontSize:10,color:(stL===0&&skL===0)?"#10b981":"var(--color-text-muted)"}}>{stL+"/40 · "+skL+"/"+(60+bsk)}</span>}
{isGM&&<span style={{fontSize:10,color:"var(--color-accent)"}}>ГМ: свободное редактирование</span>}
</div>

<div style={{flex:1,minHeight:0,padding:"2px 6px 14px"}}>
{SD.map(function(st){var sks=SKD[st.key];var op=oSt===st.key;var v=fs[st.key];
return(<div key={st.key} style={{marginBottom:1}}>
<button onClick={function(){sOS(op?null:st.key)}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 8px",background:op?"var(--color-surface)":"transparent",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left"}}>
<span style={{fontSize:10,color:"var(--color-text-muted)",width:9}}>{op?"⌄":"›"}</span>
<span style={{fontSize:11,fontWeight:700,color:st.color,width:30,flexShrink:0}}>{st.key}</span>
<span className="n-sidebar-hide-compact" style={{flex:1,fontSize:13,color:"var(--color-text)",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st.full}</span>
<span style={{fontSize:16,fontWeight:700,color:"var(--color-text)"}}>{v}</span>
<span onClick={function(e){e.stopPropagation();var R=rollHit();var d=R.d;var t=d+v;if(pr.addLog)pr.addLog({who:c.name||"???",type:"skill",label:"Бросок "+st.key+(R.crit?" 🌟КРИТ":R.fumble?" 💀ПРОВАЛ":""),detail:"d10("+d+") + "+st.key+"("+v+") = "+t,total:t});oR({label:st.key,d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:st.key,value:v}],total:t})}} title="Бросить характеристику" style={{color:st.color,cursor:"pointer",padding:"2px 2px 2px 4px",display:"flex",alignItems:"center"}}><IconD10 size={13}/></span>
</button>
<div style={{display:"flex",justifyContent:"flex-end",gap:4,padding:"0 8px 2px"}}>
<button onClick={function(){uS(st.key,-1)}} style={Object.assign({},S.sm,{width:20,height:18,fontSize:10})}>−</button>
<button onClick={function(){uS(st.key,1)}} style={Object.assign({},S.sm,{width:20,height:18,fontSize:10,color:st.color})}>+</button>
</div>
{op&&sks&&<div style={{display:"flex",flexDirection:"column",gap:1,padding:"2px 0 8px 24px",borderLeft:"1px solid var(--color-divider)",marginLeft:16}}>
{sks.map(function(sk){var ev=es[sk.name]||0;return(<div key={sk.name} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 6px",borderRadius:6,background:ev>0?"rgba(233,233,237,.03)":"transparent"}}>
<span style={{flex:1,fontSize:12,fontWeight:ev>0?600:400,color:ev>0?"var(--color-text)":"var(--color-text-muted)",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{skLabel(sk.name)}{sk.x2&&<span style={{color:"#ef4444"}}> ×2</span>}</span>
<button onClick={function(){uSk(sk.name,-1)}} style={Object.assign({},S.sm,{width:18,height:18,fontSize:9})}>−</button>
<span style={{fontSize:13,fontWeight:700,minWidth:16,textAlign:"center",color:ev>0?st.color:"var(--color-text-muted)"}}>{ev}</span>
<button onClick={function(){uSk(sk.name,1)}} style={Object.assign({},S.sm,{width:18,height:18,fontSize:9,color:st.color})}>+</button>
<span onClick={function(){var R=rollHit();var d=R.d;var sv2=fs[st.key];var t=d+sv2+ev;if(pr.addLog)pr.addLog({who:c.name||"???",type:"skill",label:"Бросок "+skLabel(sk.name)+(R.crit?" 🌟КРИТ":R.fumble?" 💀ПРОВАЛ":""),detail:"d10("+d+") + "+st.key+"("+sv2+") + "+skLabel(sk.name)+"("+ev+") = "+t,total:t});oR({label:skLabel(sk.name),d10:d,crit:R.crit,fumble:R.fumble,parts:[{label:st.key,value:sv2},{label:skLabel(sk.name),value:ev}],total:t})}} style={{color:st.color,cursor:"pointer",opacity:ev>0?1:0.4,display:"flex",alignItems:"center"}}><IconD10 size={12}/></span>
</div>)})}
</div>}
</div>)})}
</div>

<div style={{padding:"10px 14px 14px",borderTop:"1px solid var(--color-divider)",display:"flex",flexWrap:"wrap",gap:8}}>
{!c.locked&&!isGM&&<button onClick={function(){sU({name:c.name,raceId:c.raceId,humanBonusStat:c.humanBonusStat,stats:Object.assign({},c.stats),skills:Object.assign({},c.skills)});var r=rndStats(c.profId,c.raceId);sv(Object.assign({},c,r,{curHp:null,curWill:null}))}} className="n-btn n-btn-secondary" style={{flex:"1 1 auto",color:"#f0b352",borderColor:"#f59e0b40"}}>Рандом</button>}
{!c.locked&&!isGM&&undo&&<button onClick={function(){sv(Object.assign({},c,undo,{curHp:null,curWill:null}));sU(null)}} className="n-btn n-btn-secondary" style={{flex:"1 1 auto",color:"var(--color-accent)"}}>Отменить</button>}
{!c.locked&&!isGM&&<button onClick={function(){if(!window.confirm("Принять распределение характеристик и навыков? Дальше менять их сможет только ГМ."))return;sv(Object.assign({},c,{locked:true}))}} className="n-btn n-btn-primary" style={{flex:"1 1 auto"}}>✓ Принять</button>}
{c.locked&&!isGM&&<span style={{flex:1,textAlign:"center",fontSize:11,color:"var(--color-text-muted)",alignSelf:"center"}}>Распределение закреплено</span>}
{isGM&&<span style={{flex:1,textAlign:"center",fontSize:11,color:c.locked?"#34d399":"#f0b352"}}>{c.locked?"✓ Принят игроком":"Черновик — ещё не принят"}</span>}
</div>
</aside>)}

export default Sidebar;
