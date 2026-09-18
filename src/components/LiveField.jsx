import React, { useState, useEffect, useRef } from 'react';

/* Поле ввода с локальным буфером: печатать плавно даже если onCommit
   гоняет значение через сеть (WS до сервера и обратно) — пока поле
   в фокусе, входящее value из пропсов его не перетирает. */
function LiveField(pr){
var tag=pr.tag||"input";
var rest={};
Object.keys(pr).forEach(function(k){if(k!=="tag"&&k!=="value"&&k!=="onCommit")rest[k]=pr[k]});
var _v=useState(pr.value);var v=_v[0];var sV=_v[1];
var focused=useRef(false);
useEffect(function(){if(!focused.current)sV(pr.value)},[pr.value]);
function onChange(e){sV(e.target.value);pr.onCommit(e.target.value)}
function onFocus(e){focused.current=true;if(rest.onFocus)rest.onFocus(e)}
function onBlur(e){focused.current=false;sV(pr.value);if(rest.onBlur)rest.onBlur(e)}
if(tag==="textarea")return <textarea {...rest} value={v==null?"":v} onChange={onChange} onFocus={onFocus} onBlur={onBlur}/>;
return <input {...rest} value={v==null?"":v} onChange={onChange} onFocus={onFocus} onBlur={onBlur}/>;
}

export default LiveField;
