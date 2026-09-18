import React, { useEffect, useRef, useState } from 'react';
import { SD, SKD, skLabel } from '../../data/stats';
import { cF } from '../../utils/character';
import { rollHit } from '../../utils/dice';
import { IconD10 } from '../../icons/index';

/* Общая лента: сообщения игроков/ГМ вперемешку с карточками бросков.
   Асинхронная игра — это чат, а не карта: сюда ходят по умолчанию. */
function ChatTab(pr){
var who=pr.who||"???";
var _t=useState("");var text=_t[0];var sText=_t[1];
var _ro=useState(false);var rollOpen=_ro[0];var sRollOpen=_ro[1];
var _rs=useState(SD[0].key);var rollStat=_rs[0];var sRollStat=_rs[1];
var _rsk=useState("");var rollSkill=_rsk[0];var sRollSkill=_rsk[1];
var _rb=useState(0);var rollBonus=_rb[0];var sRollBonus=_rb[1];
var endRef=useRef(null);

var inf=pr.char?cF(pr.char):null;
var fs=inf?inf.fs:null;var es=inf?inf.eSk:null;
var skillsForStat=SKD[rollStat]||[];

var items=[];
(pr.chat||[]).forEach(function(m){items.push({kind:"msg",ts:m.ts||0,who:m.who,text:m.text})});
(pr.logs||[]).forEach(function(l){items.push({kind:"roll",ts:l.ts||0,who:l.who,label:l.label,detail:l.detail,total:l.total})});
items.sort(function(a,b){return a.ts-b.ts});

function Avatar(ap){
  var ch=(pr.characters||[]).find(function(c){return c.name===ap.name});
  var isGM=ap.name==="Мастер";
  var portrait=ch&&ch.portrait;
  var initial=((ch&&ch.name)||ap.name||"?")[0];
  var sz=ap.size||28;
  return(<div style={{width:sz,height:sz,borderRadius:"50%",flexShrink:0,background:portrait?"none":(isGM?"linear-gradient(135deg,#7c3aed,#a78bfa)":"linear-gradient(135deg,var(--color-accent-2),var(--color-accent))"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(sz*0.42),fontWeight:700,color:"#161826",overflow:"hidden"}}>{portrait?<img src={portrait} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:initial}</div>)
}

useEffect(function(){
  if(endRef.current)endRef.current.scrollIntoView({block:"end"});
},[items.length]);

function send(){
  var t=text.trim();
  if(!t)return;
  pr.sendChat(who,t);
  sText("");
}
function onKeyDown(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}

function doRoll(){
  var statObj=SD.find(function(s){return s.key===rollStat});
  var statVal=fs?(fs[rollStat]||0):0;
  var skillObj=skillsForStat.find(function(s){return s.name===rollSkill});
  var skillVal=(rollSkill&&es)?(es[rollSkill]||0):0;
  var bonus=parseInt(rollBonus)||0;
  var R=rollHit();var d=R.d;var t=d+statVal+skillVal+bonus;
  var label=(skillObj?skLabel(skillObj.name):statObj.full)+" · "+who;
  var detail="d10("+d+") + "+rollStat+"("+statVal+")"+(skillObj?" + "+skLabel(skillObj.name)+"("+skillVal+")":"")+(bonus?" + бонус("+bonus+")":"")+(R.crit?" 🌟КРИТ":R.fumble?" 💀ПРОВАЛ":"");
  if(pr.addLog)pr.addLog({who:who,type:"skill",label:label,detail:detail,total:t});
}

return(<div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:0}}>
<div style={{flex:1,minHeight:0,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
{items.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--color-text-muted)",fontSize:12,fontStyle:"italic"}}>Пока тихо — напиши первым</div>}
{items.map(function(it,i){
  if(it.kind==="roll")return(<div key={i} style={{display:"flex",gap:8,alignSelf:"flex-start",maxWidth:"88%",alignItems:"flex-end"}}>
    <Avatar name={it.who}/>
    <div className="n-roll-card" style={{flex:1,minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:600,color:"var(--color-accent)",marginBottom:4}}><IconD10 size={13}/> {it.label}{it.who&&<span style={{color:"var(--color-text-muted)",fontWeight:400}}>{" · "+it.who}</span>}</div>
      {it.detail&&<div style={{fontSize:11,color:"var(--color-text-muted)",fontFamily:"monospace",marginBottom:it.total?2:0}}>{it.detail}</div>}
      {(it.total!==undefined&&it.total!==0)&&<div style={{fontSize:20,fontWeight:700}}>{it.total}</div>}
    </div>
  </div>);
  var self=it.who===who;
  return(<div key={i} style={{display:"flex",gap:8,alignSelf:self?"flex-end":"flex-start",flexDirection:self?"row-reverse":"row",maxWidth:"88%",alignItems:"flex-end"}}>
    <Avatar name={it.who}/>
    <div className={"n-msg "+(self?"n-msg-self":"n-msg-other")} style={{maxWidth:"100%"}}>
      {!self&&<span className="n-msg-who">{it.who}</span>}
      <span>{it.text}</span>
    </div>
  </div>);
})}
<div ref={endRef}/>
</div>

{pr.addLog&&<div style={{borderTop:"1px solid var(--color-divider)",paddingTop:8}}>
<button onClick={function(){sRollOpen(!rollOpen)}} className="n-btn n-btn-secondary" style={{padding:"5px 10px",fontSize:11,marginBottom:rollOpen?8:0}}><IconD10 size={13}/> {rollOpen?"Свернуть бросок":"Бросить кубик"}</button>
{rollOpen&&<div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-end",marginBottom:8}}>
  <div className="n-field" style={{minWidth:110}}>
    <label>Характеристика</label>
    <select className="n-input" value={rollStat} onChange={function(e){sRollStat(e.target.value);sRollSkill("")}} style={{padding:"6px 8px",minHeight:34}}>
      {SD.map(function(s){return <option key={s.key} value={s.key}>{s.key+" · "+s.full+(fs?" ("+(fs[s.key]||0)+")":"")}</option>})}
    </select>
  </div>
  <div className="n-field" style={{minWidth:130}}>
    <label>Навык</label>
    <select className="n-input" value={rollSkill} onChange={function(e){sRollSkill(e.target.value)}} style={{padding:"6px 8px",minHeight:34}}>
      <option value="">— без навыка —</option>
      {skillsForStat.map(function(s){return <option key={s.name} value={s.name}>{skLabel(s.name)+(es?" ("+(es[s.name]||0)+")":"")}</option>})}
    </select>
  </div>
  <div className="n-field" style={{width:80}}>
    <label>Бонус</label>
    <input className="n-input" type="number" value={rollBonus} onChange={function(e){sRollBonus(e.target.value)}} style={{padding:"6px 8px",minHeight:34}}/>
  </div>
  <button onClick={doRoll} className="n-btn n-btn-primary" style={{minHeight:34}}><IconD10 size={14}/> Бросить</button>
</div>}
</div>}

<div style={{display:"flex",gap:8,alignItems:"flex-end",paddingTop:8}}>
<textarea className="n-input" value={text} onChange={function(e){sText(e.target.value)}} onKeyDown={onKeyDown} placeholder="Опиши ход…" style={{minHeight:40,maxHeight:100,resize:"vertical"}}/>
<button onClick={send} disabled={!text.trim()} className="n-btn n-btn-primary" style={{flexShrink:0}}>Отправить</button>
</div>
</div>)}

export default ChatTab;
