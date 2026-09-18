import React, { useEffect, useRef, useState } from 'react';

/* Общая лента: сообщения игроков/ГМ вперемешку с карточками бросков.
   Асинхронная игра — это чат, а не карта: сюда ходят по умолчанию. */
function ChatTab(pr){
var who=pr.who||"???";
var _t=useState("");var text=_t[0];var sText=_t[1];
var endRef=useRef(null);

var items=[];
(pr.chat||[]).forEach(function(m){items.push({kind:"msg",ts:m.ts||0,who:m.who,text:m.text})});
(pr.logs||[]).forEach(function(l){items.push({kind:"roll",ts:l.ts||0,who:l.who,label:l.label,detail:l.detail,total:l.total})});
items.sort(function(a,b){return a.ts-b.ts});

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

return(<div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:0}}>
<div style={{flex:1,minHeight:0,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:8}}>
{items.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--color-text-muted)",fontSize:12,fontStyle:"italic"}}>Пока тихо — напиши первым</div>}
{items.map(function(it,i){
  if(it.kind==="roll")return(<div key={i} className="n-roll-card">
    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:600,color:"var(--color-accent)",marginBottom:4}}>🎲 {it.label}{it.who&&<span style={{color:"var(--color-text-muted)",fontWeight:400}}>{" · "+it.who}</span>}</div>
    {it.detail&&<div style={{fontSize:11,color:"var(--color-text-muted)",fontFamily:"monospace",marginBottom:it.total?2:0}}>{it.detail}</div>}
    {(it.total!==undefined&&it.total!==0)&&<div style={{fontSize:20,fontWeight:700}}>{it.total}</div>}
  </div>);
  var self=it.who===who;
  return(<div key={i} className={"n-msg "+(self?"n-msg-self":"n-msg-other")}>
    {!self&&<span className="n-msg-who">{it.who}</span>}
    <span>{it.text}</span>
  </div>);
})}
<div ref={endRef}/>
</div>
<div style={{display:"flex",gap:8,alignItems:"flex-end",paddingTop:8,borderTop:"1px solid var(--color-divider)"}}>
<textarea className="n-input" value={text} onChange={function(e){sText(e.target.value)}} onKeyDown={onKeyDown} placeholder="Опиши ход…" style={{minHeight:40,maxHeight:100,resize:"vertical"}}/>
<button onClick={send} disabled={!text.trim()} className="n-btn n-btn-primary" style={{flexShrink:0}}>Отправить</button>
</div>
</div>)}

export default ChatTab;
