import React, { useState, useRef, useEffect } from 'react';
import { S } from '../../styles/ui';

var TOKEN_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#ece5d8", "#ffffff", "#a16207", "#0f766e", "#7c3aed", "#be185d", "#b45309", "#cabfa9", "#dc2626"];

function MapView(pr){var md=pr.mapData||{};var sMD=pr.saveMap;var chars=pr.characters||[];var isGM=pr.isGM;var cId=pr.charId;
var _view=useState("local");var view=_view[0];var sView=_view[1];var isWorld=view==="world";
var imgKey=isWorld?"imageWorld":"image";var tokKey=isWorld?"tokensWorld":"tokens";
var img=md[imgKey]||"";var tokens=md[tokKey]||[];
function setImg(dataUrl){if(sMD){var o={};o[imgKey]=dataUrl;sMD(Object.assign({},md,o))}}
var mapSwitch=(<div style={{display:"flex",gap:4,marginBottom:2}}>
  <button onClick={function(){sView("local");sZoom(1)}} style={{flex:1,padding:"6px 4px",borderRadius:7,border:"2px solid #10b981"+(isWorld?"20":""),background:isWorld?"#1d1a14":"#0e2018",color:"#34d399",fontWeight:700,fontSize:10,cursor:"pointer"}}>🏠 Локальная</button>
  <button onClick={function(){sView("world");sZoom(1)}} style={{flex:1,padding:"6px 4px",borderRadius:7,border:"2px solid #3b82f6"+(isWorld?"":"20"),background:isWorld?"#0e1a2b":"#1d1a14",color:"#60a5fa",fontWeight:700,fontSize:10,cursor:"pointer"}}>🌍 Масштабная (1:1)</button>
</div>);
var mapTitle=md.title||"Карта Мидфаля";
var titleBar=isGM
  ?<input value={md.title||""} onChange={function(e){if(sMD)sMD(Object.assign({},md,{title:e.target.value}))}} placeholder="Карта Мидфаля" style={{width:"100%",boxSizing:"border-box",textAlign:"center",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:15,background:"#1d1a14",color:"#ece5d8",border:"2px solid #322d24",borderRadius:8,padding:"4px 8px",outline:"none",marginBottom:4}}/>
  :<div style={{textAlign:"center",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:15,color:"#ece5d8",marginBottom:4}}>{mapTitle}</div>;
var _dr=useState(null);var drId=_dr[0];var sDrId=_dr[1];
var _off=useState({x:0,y:0});var drOff=_off[0];var sDrOff=_off[1];
var _live=useState(null);var liveT=_live[0];var sLiveT=_live[1];
var _pan=useState(null);var pan=_pan[0];var sPan=_pan[1];
var _sn=useState(false);var sn=_sn[0];var sSN=_sn[1];
var _nn=useState("");var nn=_nn[0];var sNN=_nn[1];
var _nc=useState("#ef4444");var nc=_nc[0];var sNC=_nc[1];
var _ns=useState(6);var ns=_ns[0];var sNS=_ns[1];
var _zoom=useState(1);var zoom=_zoom[0];var sZoom=_zoom[1];
var _et=useState(null);var editTk=_et[0];var sEditTk=_et[1];
var _pc=useState("#3b82f6");var pColor=_pc[0];var sPColor=_pc[1];
/* allT — во время перетаскивания используем локальную копию (liveT), чтобы не писать
   огромную карту (base64) в Firebase на каждое движение мыши. Сохраняем на отпускании. */
var allT=liveT||tokens.slice();
function saveTk(nt){if(sMD){var o={};o[tokKey]=nt;sMD(Object.assign({},md,o))}}
function updTk(id,patch){saveTk(tokens.map(function(t){return t.id===id?Object.assign({},t,patch):t}))}
function canDr(t){return isGM||(t.charId&&t.charId===cId)}
var _imgEl=useState(null);var imgEl=_imgEl[0];var sImgEl=_imgEl[1];
var contRef=useRef(null);
/* Зум колесом мыши (native listener с passive:false, чтобы можно было preventDefault) */
useEffect(function(){
  var el=contRef.current;if(!el)return;
  function wh(e){e.preventDefault();var d=e.deltaY<0?0.2:-0.2;sZoom(function(z){return Math.max(0.25,Math.min(8,+(z+d).toFixed(2)))})}
  el.addEventListener("wheel",wh,{passive:false});
  return function(){el.removeEventListener("wheel",wh)};
},[img,view]);
/* Перевести экранные координаты в % относительно зумированного размера картинки */
function toPct(e){
  if(!imgEl)return null;
  var r=imgEl.getBoundingClientRect();
  var cx=e.touches?e.touches[0].clientX:e.clientX;
  var cy=e.touches?e.touches[0].clientY:e.clientY;
  return{
    x:Math.max(0,Math.min(100,((cx-r.left)/r.width)*100)),
    y:Math.max(0,Math.min(100,((cy-r.top)/r.height)*100))
  };
}
function startDr(e,t){if(!canDr(t))return;e.preventDefault();e.stopPropagation();sDrId(t.id);var p=toPct(e);if(!p)return;sDrOff({x:p.x-t.x,y:p.y-t.y});sLiveT(tokens.slice())}
/* Панорама: зажал ЛКМ на пустом месте карты — тащишь весь холст (scroll) */
function startPan(e){if(drId)return;var el=contRef.current;if(!el)return;var cx=e.touches?e.touches[0].clientX:e.clientX;var cy=e.touches?e.touches[0].clientY:e.clientY;sPan({x:cx,y:cy,sl:el.scrollLeft,st:el.scrollTop})}
function onMv(e){
  if(drId){e.preventDefault();var p=toPct(e);if(!p)return;sLiveT((liveT||tokens).map(function(t){return t.id===drId?Object.assign({},t,{x:Math.max(0,Math.min(100,p.x-drOff.x)),y:Math.max(0,Math.min(100,p.y-drOff.y))}):t}));return}
  if(pan){var el=contRef.current;if(!el)return;var cx=e.touches?e.touches[0].clientX:e.clientX;var cy=e.touches?e.touches[0].clientY:e.clientY;el.scrollLeft=pan.sl-(cx-pan.x);el.scrollTop=pan.st-(cy-pan.y)}
}
function endDr(){if(drId&&liveT){saveTk(liveT);}sDrId(null);sLiveT(null);sPan(null)}
if(!img)return <div style={{display:"flex",flexDirection:"column",gap:6}}>{titleBar}{mapSwitch}<div style={{textAlign:"center",padding:"24px 10px"}}><div style={{fontSize:40}}>🗺️</div><div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:14}}>{isWorld?"Масштабная карта (1:1)":"Локальная карта"}</div>{isGM?<label style={{display:"inline-block",marginTop:10,padding:"10px 20px",borderRadius:8,border:"2px dashed #10b981",background:"#0e2018",fontWeight:700,fontSize:12,color:"#34d399",cursor:"pointer"}}>📁 Загрузить карту<input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){setImg(ev.target.result)};r.readAsDataURL(f)}}/></label>:<div style={{fontSize:10,color:"#a89a82",marginTop:8}}>Мастер ещё не загрузил карту</div>}</div></div>;
return <div style={{display:"flex",flexDirection:"column",gap:6}}>
{titleBar}
{mapSwitch}
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
  <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13}}>{isWorld?"🌍 Масштабная":"🏠 Локальная"}</div>
  <div style={{display:"flex",alignItems:"center",gap:4}}>
    <button onClick={function(){sZoom(function(z){return Math.max(0.25,+(z-0.25).toFixed(2))})}} style={{width:24,height:24,borderRadius:5,border:"1px solid #322d24",background:"#1d1a14",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
    <span style={{fontSize:9,fontWeight:700,minWidth:32,textAlign:"center"}}>{Math.round(zoom*100)+"%"}</span>
    <button onClick={function(){sZoom(function(z){return Math.min(8,+(z+0.25).toFixed(2))})}} style={{width:24,height:24,borderRadius:5,border:"1px solid #322d24",background:"#1d1a14",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
    <button onClick={function(){sZoom(1)}} style={{padding:"2px 6px",borderRadius:5,border:"1px solid #322d24",background:"#1d1a14",fontSize:8,cursor:"pointer",color:"#a89a82"}}>1:1</button>
  </div>
</div>
<div style={{fontSize:8,color:"#7c715a",textAlign:"right",marginTop:-4}}>колесо — зум · ЛКМ по карте — двигать карту · тащи жетон — двигать жетон</div>
<div ref={contRef} style={{overflow:"auto",borderRadius:10,border:"2px solid #322d24",background:"#1a1a2e",maxHeight:500,touchAction:"none",userSelect:"none",cursor:pan?"grabbing":"grab"}} onMouseDown={startPan} onTouchStart={startPan} onMouseMove={onMv} onMouseUp={endDr} onMouseLeave={endDr} onTouchMove={onMv} onTouchEnd={endDr}>
  {/* Единственный контейнер — картинка с position:relative, токены absolute внутри неё */}
  <div style={{position:"relative",display:"inline-block",lineHeight:0}}>
    <img ref={function(el){sImgEl(el)}} src={img}
      style={{
        display:"block",
        width:(imgEl?imgEl.naturalWidth*zoom:300)+"px",
        maxWidth:"none",
        pointerEvents:"none"
      }} alt="map"/>
    {allT.map(function(t){
      var sz=Math.max(2,t.size||6);
      return <div key={t.id}
        onMouseDown={function(e){startDr(e,t)}}
        onTouchStart={function(e){startDr(e,t)}}
        style={{
          position:"absolute",
          left:t.x+"%",
          top:t.y+"%",
          width:sz+"px",
          height:sz+"px",
          borderRadius:"50%",
          background:t.color||"#3b82f6",
          border:sz>=4?"1.5px solid rgba(255,255,255,0.85)":"none",
          boxShadow:drId===t.id?"0 0 0 2px #fff,0 0 6px rgba(255,255,255,0.5)":"0 1px 3px rgba(0,0,0,0.8)",
          transform:"translate(-50%,-50%)",
          cursor:canDr(t)?"grab":"default",
          zIndex:drId===t.id?50:10,
          pointerEvents:"all"
        }} title={t.name}/>
    })}
  </div>
</div>
{/* Список жетонов — цвет/имя/размер/удаление */}
<div style={{display:"flex",flexDirection:"column",gap:3}}>{allT.map(function(t){var sz=t.size||6;var canEdit=isGM||t.charId===cId;return <div key={t.id} style={{background:"#1d1a14",border:"1px solid #322d24",borderRadius:6,padding:"3px 6px",fontSize:8}}>
<div style={{display:"flex",alignItems:"center",gap:4}}>
<button onClick={function(){if(canEdit)sEditTk(editTk===t.id?null:t.id)}} title={canEdit?"Сменить цвет":""} style={{width:12,height:12,borderRadius:"50%",background:t.color||"#3b82f6",border:"1px solid #322d24",flexShrink:0,cursor:canEdit?"pointer":"default",padding:0}}/>
<span style={{fontWeight:600,flex:1}}>{t.name||"?"}{t.charId?<span style={{fontSize:7,color:"#60a5fa",marginLeft:3}}>игрок</span>:<span style={{fontSize:7,color:"#f87171",marginLeft:3}}>NPC</span>}</span>
{canEdit&&<button onClick={function(){var nm=window.prompt("Имя жетона:",t.name||"");if(nm!==null)updTk(t.id,{name:nm.trim()||t.name})}} title="Переименовать" style={{background:"none",border:"none",cursor:"pointer",fontSize:9,color:"#a89a82",lineHeight:1}}>✎</button>}
{canEdit&&<span style={{display:"flex",gap:1,alignItems:"center"}}><button onClick={function(){updTk(t.id,{size:Math.max(2,sz-1)})}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#a89a82",lineHeight:1}}>−</button><span style={{fontSize:7,minWidth:20,textAlign:"center"}}>{sz}px</span><button onClick={function(){updTk(t.id,{size:Math.min(60,sz+1)})}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#a89a82",lineHeight:1}}>+</button></span>}
{canEdit&&<button onClick={function(){if(window.confirm("Удалить жетон «"+(t.name||"?")+"»?"))saveTk(tokens.filter(function(x){return x.id!==t.id}))}} title="Удалить жетон" style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:10}}>🗑</button>}
</div>
{canEdit&&editTk===t.id&&<div style={{display:"flex",gap:2,flexWrap:"wrap",marginTop:4,paddingTop:4,borderTop:"1px solid #322d24"}}>{TOKEN_COLORS.map(function(cl){return <button key={cl} onClick={function(){updTk(t.id,{color:cl});sEditTk(null)}} style={{width:16,height:16,borderRadius:"50%",background:cl,border:(t.color===cl)?"2px solid #cabfa9":"1px solid #333333",cursor:"pointer",flexShrink:0,padding:0}}/>})}</div>}
</div>})}</div>
{!isGM&&cId&&!allT.find(function(t){return t.charId===cId})&&<div style={{display:"flex",flexDirection:"column",gap:4}}>
<div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center"}}>{TOKEN_COLORS.map(function(cl){return <button key={cl} onClick={function(){sPColor(cl)}} style={{width:18,height:18,borderRadius:"50%",background:cl,border:pColor===cl?"3px solid #cabfa9":"1.5px solid #333333",cursor:"pointer",flexShrink:0,padding:0}}/>})}</div>
<button onClick={function(){var me=chars.find(function(c2){return(c2._fbId||c2.id)===cId});saveTk(tokens.concat([{id:"ch-"+cId,charId:cId,name:me?me.name:"?",x:50,y:50,color:pColor,size:6,type:"player"}]))}} style={{padding:"6px 12px",borderRadius:7,border:"2px solid #3b82f630",background:"#0e1a2b",fontWeight:700,fontSize:10,color:"#60a5fa",cursor:"pointer",width:"100%"}}>📍 Создать мой жетон ({pColor==="#3b82f6"?"цвет по умолч.":"выбран цвет"})</button>
</div>}
{isGM&&<div style={{display:"flex",gap:3}}><button onClick={function(){sSN(!sn)}} style={{flex:1,padding:6,borderRadius:6,border:"2px solid #ef444420",background:"#2a1414",fontWeight:700,fontSize:9,color:"#ef4444",cursor:"pointer"}}>{sn?"✕":"👹 + Жетон"}</button><label style={{padding:"6px 10px",borderRadius:6,border:"2px solid #10b98120",background:"#0e2018",fontWeight:700,fontSize:9,color:"#34d399",cursor:"pointer",textAlign:"center"}}>🖼️ Сменить<input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){setImg(ev.target.result)};r.readAsDataURL(f)}}/></label></div>}
{isGM&&sn&&<div style={{background:"#2a1414",border:"1px solid #ef444420",borderRadius:7,padding:6,display:"flex",flexDirection:"column",gap:4}}><input style={S.inp} value={nn} onChange={function(e){sNN(e.target.value)}} placeholder="Имя жетона"/>
<div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{TOKEN_COLORS.map(function(cl){return <button key={cl} onClick={function(){sNC(cl)}} style={{width:18,height:18,borderRadius:"50%",background:cl,border:nc===cl?"3px solid #cabfa9":"1.5px solid #333333",boxShadow:nc===cl?"0 0 0 2px "+cl:"none",cursor:"pointer",flexShrink:0}}/>})}</div>
<div style={{display:"flex",gap:3,alignItems:"center"}}><label style={{fontSize:8,fontWeight:700,color:"#b3a890",whiteSpace:"nowrap"}}>Размер (px):</label><input style={Object.assign({},S.inp,{width:50,fontSize:9,padding:2,textAlign:"center"})} type="number" min={2} max={60} value={ns} onChange={function(e){sNS(parseInt(e.target.value)||4)}}/><span style={{fontSize:8,color:"#a89a82"}}>мин 2, макс 60</span></div>
<button onClick={function(){if(!nn.trim())return;saveTk(tokens.concat([{id:"npc-"+Date.now(),name:nn.trim(),x:50,y:50,color:nc,size:ns,type:"npc"}]));sNN("");sSN(false)}} style={{padding:5,borderRadius:5,border:"none",background:"#ef4444",color:"#fff",fontWeight:700,fontSize:9,cursor:"pointer"}}>Добавить жетон</button></div>}
</div>}


export default MapView;
