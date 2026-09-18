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
var _pid=useState("");var partnerId=_pid[0];var sPartnerId=_pid[1];
var _rs2=useState(SD[0].key);var rollStat2=_rs2[0];var sRollStat2=_rs2[1];
var _rsk2=useState("");var rollSkill2=_rsk2[0];var sRollSkill2=_rsk2[1];
var _desc=useState("");var actDesc=_desc[0];var sActDesc=_desc[1];
var endRef=useRef(null);

var inf=pr.char?cF(pr.char):null;
var fs=inf?inf.fs:null;var es=inf?inf.eSk:null;
var skillsForStat=SKD[rollStat]||[];
var partners=(pr.characters||[]).filter(function(c){return c._fbId!==(pr.char&&pr.char._fbId)});
var partner=partners.find(function(c){return c._fbId===partnerId});
var pInf=partner?cF(partner):null;var pfs=pInf?pInf.fs:null;var pes=pInf?pInf.eSk:null;
var skillsForStat2=SKD[rollStat2]||[];

useEffect(function(){
  if(!pr.coopTarget)return;
  sRollOpen(true);sPartnerId(pr.coopTarget);
  if(pr.onCoopConsumed)pr.onCoopConsumed();
},[pr.coopTarget]);

var items=[];
(pr.chat||[]).forEach(function(m){items.push({kind:"msg",ts:m.ts||0,who:m.who,text:m.text})});
(pr.logs||[]).forEach(function(l){items.push({kind:"roll",ts:l.ts||0,who:l.who,label:l.label,detail:l.detail,total:l.total})});
items.sort(function(a,b){return a.ts-b.ts});

function fmtYkt(ts){
  try{return new Intl.DateTimeFormat('ru-RU',{timeZone:'Asia/Yakutsk',hour:'2-digit',minute:'2-digit'}).format(new Date(ts))+" YKT"}
  catch(e){return ""}
}

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
  var myDetail="d10("+d+") + "+rollStat+"("+statVal+")"+(skillObj?" + "+skLabel(skillObj.name)+"("+skillVal+")":"")+(bonus?" + бонус("+bonus+")":"")+(R.crit?" 🌟КРИТ":R.fumble?" 💀ПРОВАЛ":"");

  if(partner){
    var pStatObj=SD.find(function(s){return s.key===rollStat2});
    var pStatVal=pfs?(pfs[rollStat2]||0):0;
    var pSkillObj=skillsForStat2.find(function(s){return s.name===rollSkill2});
    var pSkillVal=(rollSkill2&&pes)?(pes[rollSkill2]||0):0;
    var R2=rollHit();var d2=R2.d;var t2=d2+pStatVal+pSkillVal;
    var pDetail="d10("+d2+") + "+rollStat2+"("+pStatVal+")"+(pSkillObj?" + "+skLabel(pSkillObj.name)+"("+pSkillVal+")":"")+(R2.crit?" 🌟КРИТ":R2.fumble?" 💀ПРОВАЛ":"");
    var label=(skillObj?skLabel(skillObj.name):statObj.full)+" + "+(pSkillObj?skLabel(pSkillObj.name):pStatObj.full)+" · "+who+" & "+(partner.name||"?");
    var detail=(actDesc.trim()?actDesc.trim()+"\n":"")+who+": "+myDetail+"\n"+(partner.name||"?")+": "+pDetail;
    if(pr.addLog)pr.addLog({who:who,type:"skill",label:label,detail:detail,total:t+t2});
    sPartnerId("");sActDesc("");
    return;
  }

  var label=(skillObj?skLabel(skillObj.name):statObj.full)+" · "+who;
  if(pr.addLog)pr.addLog({who:who,type:"skill",label:label,detail:myDetail,total:t});
}

return(<div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:0}}>
<div style={{flex:1,minHeight:0,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
{items.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--color-text-muted)",fontSize:12,fontStyle:"italic"}}>Пока тихо — напиши первым</div>}
{items.map(function(it,i){
  if(it.kind==="roll")return(<div key={i} style={{display:"flex",gap:8,alignSelf:"flex-start",maxWidth:"88%",alignItems:"flex-end"}}>
    <Avatar name={it.who}/>
    <div className="n-roll-card" style={{flex:1,minWidth:0}}>
      <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:600,color:"var(--color-accent)",marginBottom:4}}><IconD10 size={13}/> {it.label}{it.who&&<span style={{color:"var(--color-text-muted)",fontWeight:400}}>{" · "+it.who}</span>}<span style={{marginLeft:"auto",fontSize:9,color:"var(--color-text-muted)",fontWeight:400}}>{fmtYkt(it.ts)}</span></div>
      {it.detail&&<div style={{fontSize:11,color:"var(--color-text-muted)",fontFamily:"monospace",whiteSpace:"pre-line",marginBottom:it.total?2:0}}>{it.detail}</div>}
      {(it.total!==undefined&&it.total!==0)&&<div style={{fontSize:20,fontWeight:700}}>{it.total}</div>}
    </div>
  </div>);
  var self=it.who===who;
  return(<div key={i} style={{display:"flex",gap:8,alignSelf:self?"flex-end":"flex-start",flexDirection:self?"row-reverse":"row",maxWidth:"88%",alignItems:"flex-end"}}>
    <Avatar name={it.who}/>
    <div className={"n-msg "+(self?"n-msg-self":"n-msg-other")} style={{maxWidth:"100%"}}>
      {!self&&<span className="n-msg-who">{it.who}</span>}
      <span>{it.text}</span>
      <div style={{fontSize:9,color:"var(--color-text-muted)",marginTop:3,textAlign:self?"right":"left"}}>{fmtYkt(it.ts)}</div>
    </div>
  </div>);
})}
<div ref={endRef}/>
</div>

{pr.addLog&&<div style={{borderTop:"1px solid var(--color-divider)",paddingTop:8}}>
<button onClick={function(){sRollOpen(!rollOpen)}} className="n-btn n-btn-secondary" style={{padding:"5px 10px",fontSize:11,marginBottom:rollOpen?8:0}}><IconD10 size={13}/> {rollOpen?"Свернуть бросок":"Бросить кубик"}</button>
{rollOpen&&<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8}}>

<div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-end"}}>
  <div className="n-field" style={{minWidth:110}}>
    <label>{partner?"Моя характеристика":"Характеристика"}</label>
    <select className="n-input" value={rollStat} onChange={function(e){sRollStat(e.target.value);sRollSkill("")}} style={{padding:"6px 8px",minHeight:34}}>
      {SD.map(function(s){return <option key={s.key} value={s.key}>{s.key+" · "+s.full+(fs?" ("+(fs[s.key]||0)+")":"")}</option>})}
    </select>
  </div>
  <div className="n-field" style={{minWidth:130}}>
    <label>{partner?"Мой навык":"Навык"}</label>
    <select className="n-input" value={rollSkill} onChange={function(e){sRollSkill(e.target.value)}} style={{padding:"6px 8px",minHeight:34}}>
      <option value="">— без навыка —</option>
      {skillsForStat.map(function(s){return <option key={s.name} value={s.name}>{skLabel(s.name)+(es?" ("+(es[s.name]||0)+")":"")}</option>})}
    </select>
  </div>
  {!partner&&<div className="n-field" style={{width:80}}>
    <label>Бонус</label>
    <input className="n-input" type="number" value={rollBonus} onChange={function(e){sRollBonus(e.target.value)}} style={{padding:"6px 8px",minHeight:34}}/>
  </div>}
</div>

<div className="n-field" style={{minWidth:160}}>
  <label>Совместное действие с</label>
  <select className="n-input" value={partnerId} onChange={function(e){sPartnerId(e.target.value)}} style={{padding:"6px 8px",minHeight:34}}>
    <option value="">— соло —</option>
    {partners.map(function(c){return <option key={c._fbId} value={c._fbId}>{c.name||"?"}</option>})}
  </select>
</div>

{partner&&<div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-end"}}>
  <div className="n-field" style={{minWidth:110}}>
    <label>{"Характеристика · "+(partner.name||"?")}</label>
    <select className="n-input" value={rollStat2} onChange={function(e){sRollStat2(e.target.value);sRollSkill2("")}} style={{padding:"6px 8px",minHeight:34}}>
      {SD.map(function(s){return <option key={s.key} value={s.key}>{s.key+" · "+s.full+(pfs?" ("+(pfs[s.key]||0)+")":"")}</option>})}
    </select>
  </div>
  <div className="n-field" style={{minWidth:130}}>
    <label>{"Навык · "+(partner.name||"?")}</label>
    <select className="n-input" value={rollSkill2} onChange={function(e){sRollSkill2(e.target.value)}} style={{padding:"6px 8px",minHeight:34}}>
      <option value="">— без навыка —</option>
      {skillsForStat2.map(function(s){return <option key={s.name} value={s.name}>{skLabel(s.name)+(pes?" ("+(pes[s.name]||0)+")":"")}</option>})}
    </select>
  </div>
</div>}

{partner&&<div className="n-field">
  <label>Описание действия (необязательно)</label>
  <input className="n-input" value={actDesc} onChange={function(e){sActDesc(e.target.value)}} placeholder="Например: вместе стабилизируем раненого" style={{padding:"6px 8px",minHeight:34}}/>
</div>}

<button onClick={doRoll} className="n-btn n-btn-primary" style={{minHeight:34,alignSelf:"flex-start"}}><IconD10 size={14}/> Бросить</button>
</div>}
</div>}

<div style={{display:"flex",gap:8,alignItems:"flex-end",paddingTop:8}}>
<textarea className="n-input" value={text} onChange={function(e){sText(e.target.value)}} onKeyDown={onKeyDown} placeholder="Опиши ход или отправь сообщение…" style={{minHeight:40,maxHeight:100,resize:"vertical"}}/>
<button onClick={send} disabled={!text.trim()} className="n-btn n-btn-primary" style={{flexShrink:0}}>Отправить</button>
</div>
</div>)}

export default ChatTab;
