import React, { useState } from 'react';

function DonatePage(pr){
var onClose=pr.onClose;var isGM=pr.isGM;var saveMap=pr.saveMap;var mapData=pr.mapData||{};
var _editMode=useState(false);var editMode=_editMode[0];var sEditMode=_editMode[1];

/* Default packs stored in mapData.donatePacks, fallback to hardcoded */
var DEFAULT_PACKS=[
  {id:1,icon:"💪",name:"Стартовый пак",price:"500 ₽",items:["Начните с преимущества!","+1 к силе, +1 к ловкости","+500 золота","Одно случайное зелье"]},
  {id:2,icon:"🛡️",name:"Стандартный пак",price:"1000 ₽",items:["Станьте сильнее!","+2 к любой характеристике","+1000 золота","Один редкий магический предмет"]},
  {id:3,icon:"👑",name:"VIP пак",price:"2000 ₽",items:["Доминируйте!","Отмена крит. промаха 1×/сессию","Список слабостей монстра","Секретный разговор с NPC"]},
  {id:4,icon:"🏆",name:"King пак",price:"5000 ₽",items:["Станьте королём!","Всё из VIP","+2 к характеристике навсегда","Идеальный спутник-легенда","Внеочередной ход"]},
  {id:5,icon:"❤️",name:"Личный запас здоровья",price:"2500 ₽",items:["Начало сессии с полным HP","+50% к макс. здоровью на сессию"]},
  {id:6,icon:"🎯",name:"Игнорирование промаха",price:"500 ₽",items:["Промах → попадание","Работает 1× за раунд"]},
  {id:7,icon:"✨",name:"Полное воскрешение",price:"1000 ₽",items:["Персонаж воскресает на месте","Все вещи, полное HP, без штрафов"]},
  {id:8,icon:"📦",name:"Сундук из другого мира",price:"1500 ₽",items:["Случайный предмет — от простого до легендарного","Гарантированно ломает баланс!"]},
  {id:9,icon:"📊",name:"Изменение характеристик",price:"800 ₽",items:["Перераспределить все очки","или +2 к любой характеристике навсегда"]},
  {id:10,icon:"🔮",name:"Бесплатные заклинания",price:"400 ₽",items:["Любой класс заклинания 1×/сессию","Без затрат WILL"]},
  {id:11,icon:"🌍",name:"Мастер мира",price:"1000 ₽/сессию",items:["Отменить действие игрока или ДМа","Список слабостей монстра"]},
  {id:12,icon:"💎",name:"Титан Подземелья",price:"10 000 ₽",items:["Все донаты бесплатно навсегда","Приоритет выбора заданий","Право голоса по любым спорам"]},
];
var packs=mapData.donatePacks?JSON.parse(mapData.donatePacks):DEFAULT_PACKS;
var _ep=useState(null);var editPack=_ep[0];var sEditPack=_ep[1];
var _ename=useState("");var eName=_ename[0];var sEName=_ename[1];
var _eprice=useState("");var ePrice=_eprice[0];var sEPrice=_eprice[1];
var _eicon=useState("💰");var eIcon=_eicon[0];var sEIcon=_eicon[1];
var _eitems=useState("");var eItems=_eitems[0];var sEItems=_eitems[1];

function savePacks(newPacks){if(saveMap)saveMap(Object.assign({},mapData,{donatePacks:JSON.stringify(newPacks)}));}
function startEdit(p){sEditPack(p.id);sEName(p.name);sEPrice(p.price);sEIcon(p.icon);sEItems(p.items.join("\n"));}
function saveEdit(){var np=packs.map(function(p){return p.id===editPack?Object.assign({},p,{name:eName,price:ePrice,icon:eIcon,items:eItems.split("\n").filter(function(x){return x.trim()})}):p});savePacks(np);sEditPack(null);}
function deletePack(id){savePacks(packs.filter(function(p){return p.id!==id}));}
function addPack(){var newId=Date.now();var np=packs.concat([{id:newId,icon:"⭐",name:"Новый пакет",price:"0 ₽",items:["Описание"]}]);savePacks(np);startEdit({id:newId,name:"Новый пакет",price:"0 ₽",icon:"⭐",items:["Описание"]});}

function setDonateImg(key,dataUrl){if(saveMap)saveMap(Object.assign({},mapData,function(){var o={};o["donate_"+key]=dataUrl;return o}()));}
var qrImg=mapData.donate_qr||"";
var img1=mapData.donate_img1||"";
var img2=mapData.donate_img2||"";

var CONDITIONS=[
  "ДМ всегда прав. Окончательное решение по любому донату остается за ДМом.",
  "Донаты не возвращаются. Даже если вы не смогли ими воспользоваться.",
  "Использование по требованию. ДМ может потребовать использовать донат в любой момент.",
  "Срок годности. Все донаты (кроме Титана) исчезают через 24 часа.",
  "Без гарантий. Мы не несём ответственности за поломку игры или потерю дружбы.",
  "Бафф для монстров. После каждой покупки один монстр получает случайный бонус.",
  "Налог на донат. 50% стоимости выплачивается заданиями от ДМа.",
];

var S2={inp:{width:"100%",padding:"4px 6px",border:"1px solid #4b3800",borderRadius:5,fontSize:9,fontFamily:"'Nunito',sans-serif",background:"#1a1008",color:"#f0d9a8",outline:"none"}};

return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:1000,overflowY:"auto",fontFamily:"'Nunito',sans-serif"}}>
<div style={{maxWidth:560,margin:"0 auto",padding:"16px 12px 40px"}}>

{/* Header */}
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
  <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:18,color:"#f59e0b"}}>💰 Донат-магазин</div>{isGM&&<span style={{fontSize:8,background:"#f59e0b20",color:"#f59e0b",border:"1px solid #f59e0b40",borderRadius:4,padding:"1px 6px"}}>ГМ</span>}</div>
  <div style={{display:"flex",gap:6,alignItems:"center"}}>
    {isGM&&<button onClick={function(){sEditMode(!editMode);sEditPack(null)}} style={{padding:"4px 12px",borderRadius:5,border:"2px solid #f59e0b",background:editMode?"#f59e0b":"transparent",color:editMode?"#1a1008":"#f59e0b",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'Cinzel',serif"}}>{editMode?"✓ Готово":"✏️ Редактировать"}</button>}
    {!isGM&&<span style={{fontSize:8,color:"#b8ad97",fontStyle:"italic"}}>режим просмотра</span>}
    <button onClick={onClose} style={{background:"none",border:"1px solid #3a3429",borderRadius:5,padding:"4px 12px",color:"#ece5d8",cursor:"pointer",fontSize:10}}>✕ Закрыть</button>
  </div>
</div>

{/* Banner image */}
<div style={{marginBottom:12,borderRadius:10,overflow:"hidden",border:"1px solid #4b3800"}}>
  {img1?<div style={{position:"relative"}}>
    <img src={img1} style={{width:"100%",maxHeight:180,objectFit:"cover",display:"block"}} alt="banner"/>
    {isGM&&editMode&&<label style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,0.8)",border:"1px solid #f59e0b",borderRadius:5,padding:"3px 8px",color:"#f59e0b",cursor:"pointer",fontSize:8}}>🖼️ Сменить<input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){setDonateImg("img1",ev.target.result)};r.readAsDataURL(f)}}/></label>}
  </div>:isGM&&editMode?<label style={{display:"block",padding:"24px",background:"#1a1008",textAlign:"center",color:"#f59e0b",cursor:"pointer",fontSize:10}}>🖼️ Загрузить баннер<input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){setDonateImg("img1",ev.target.result)};r.readAsDataURL(f)}}/></label>:<div style={{background:"linear-gradient(135deg,#1a1008,#2d1f00)",padding:"14px",textAlign:"center"}}><div style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:14,color:"#f59e0b",marginBottom:4}}>Цены для настоящих королей Мидланда!</div><div style={{fontSize:9,color:"#d97706"}}>Наши донаты — ваш ключ к абсолютной власти!</div></div>}
</div>

{/* Packs list */}
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
  <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:11,color:"#f59e0b"}}>🎁 Пакеты доната</div>
  {isGM&&editMode&&<button onClick={addPack} style={{padding:"3px 10px",borderRadius:5,border:"1px solid #f59e0b40",background:"#2d1f00",color:"#f59e0b",cursor:"pointer",fontSize:9,fontWeight:700}}>+ Добавить</button>}
</div>

<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
{packs.map(function(p){
  var isEditing=editPack===p.id;
  return(<div key={p.id} style={{background:"linear-gradient(135deg,#1a1008,#221500)",border:"1px solid "+(isEditing?"#f59e0b":"#f59e0b20"),borderRadius:10,overflow:"hidden"}}>
    {isEditing?
    /* Edit form */
    <div style={{padding:"10px 12px",display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",gap:6}}>
        <input style={Object.assign({},S2.inp,{width:36,textAlign:"center",fontSize:14})} value={eIcon} onChange={function(e){sEIcon(e.target.value)}} placeholder="🎁"/>
        <input style={Object.assign({},S2.inp,{flex:2})} value={eName} onChange={function(e){sEName(e.target.value)}} placeholder="Название пакета"/>
        <input style={Object.assign({},S2.inp,{width:80})} value={ePrice} onChange={function(e){sEPrice(e.target.value)}} placeholder="1000 ₽"/>
      </div>
      <div>
        <div style={{fontSize:8,color:"#d97706",marginBottom:3}}>Описание (каждый пункт с новой строки):</div>
        <textarea style={Object.assign({},S2.inp,{minHeight:70,resize:"vertical",lineHeight:1.6})} value={eItems} onChange={function(e){sEItems(e.target.value)}} placeholder={"Пункт 1\nПункт 2\nПункт 3"}/>
      </div>
      <div style={{display:"flex",gap:5}}>
        <button onClick={saveEdit} style={{flex:1,padding:"5px",borderRadius:5,border:"none",background:"#f59e0b",color:"#ece5d8",fontWeight:700,fontSize:9,cursor:"pointer"}}>💾 Сохранить</button>
        <button onClick={function(){sEditPack(null)}} style={{padding:"5px 10px",borderRadius:5,border:"1px solid #4b3800",background:"#1a1008",color:"#8d8270",fontSize:9,cursor:"pointer"}}>Отмена</button>
        <button onClick={function(){if(window.confirm("Удалить "+p.name+"?"))deletePack(p.id)}} style={{padding:"5px 8px",borderRadius:5,border:"1px solid #ef444440",background:"#1a1008",color:"#ef4444",fontSize:9,cursor:"pointer"}}>🗑️</button>
      </div>
    </div>:
    /* View mode */
    <div style={{padding:"10px 12px",display:"flex",gap:10,alignItems:"flex-start"}}>
      <div style={{fontSize:20,flexShrink:0,marginTop:1}}>{p.icon}</div>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:10,color:"#f0d9a8"}}>{p.name}</span>
          <span style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:10,color:"#f59e0b",background:"#2d1f00",borderRadius:4,padding:"1px 6px",whiteSpace:"nowrap",flexShrink:0,marginLeft:6}}>{p.price}</span>
        </div>
        {p.items.map(function(it,j){return<div key={j} style={{fontSize:8,color:"#d97706",lineHeight:1.6}}>• {it}</div>})}
      </div>
      {isGM&&editMode&&<button onClick={function(){startEdit(p)}} style={{background:"none",border:"none",color:"#f59e0b",cursor:"pointer",fontSize:12,flexShrink:0,padding:"0 2px"}}>✏️</button>}
    </div>}
  </div>);
})}
</div>

{/* Middle image */}
{img2?<div style={{position:"relative",marginBottom:14}}>
  <img src={img2} style={{width:"100%",maxHeight:200,objectFit:"cover",borderRadius:10}} alt="companions"/>
  {isGM&&editMode&&<label style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,0.8)",border:"1px solid #f59e0b",borderRadius:5,padding:"3px 8px",color:"#f59e0b",cursor:"pointer",fontSize:8}}>🖼️ Сменить<input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){setDonateImg("img2",ev.target.result)};r.readAsDataURL(f)}}/></label>}
</div>:isGM&&editMode?<label style={{display:"block",marginBottom:14,padding:"20px",borderRadius:10,border:"2px dashed #4b3800",color:"#f59e0b",cursor:"pointer",fontSize:10,textAlign:"center",background:"#1a1008"}}>🖼️ Загрузить картинку<input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){setDonateImg("img2",ev.target.result)};r.readAsDataURL(f)}}/></label>:null}

{/* QR */}
<div style={{background:"#1a1008",border:"1px solid #4b3800",borderRadius:12,padding:"14px",marginBottom:14,textAlign:"center"}}>
  <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:10,color:"#f59e0b",marginBottom:10}}>💳 Оплата</div>
  {qrImg?<div style={{position:"relative",display:"inline-block"}}>
    <img src={qrImg} style={{width:180,height:180,borderRadius:8,objectFit:"contain",background:"#262219",padding:6,display:"block"}} alt="QR"/>
    {isGM&&editMode&&<label style={{position:"absolute",bottom:4,right:4,background:"rgba(0,0,0,0.85)",border:"1px solid #f59e0b",borderRadius:5,padding:"3px 8px",color:"#f59e0b",cursor:"pointer",fontSize:8}}>🔄 QR<input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){setDonateImg("qr",ev.target.result)};r.readAsDataURL(f)}}/></label>}
  </div>:
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
    <div style={{width:140,height:140,background:"#111",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",border:"2px dashed #4b3800"}}>
      {isGM&&editMode?<label style={{cursor:"pointer",textAlign:"center",padding:10}}><div style={{fontSize:28}}>📷</div><div style={{fontSize:8,color:"#f59e0b",marginTop:4}}>Загрузить QR-код</div><input type="file" accept="image/*" style={{display:"none"}} onChange={function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){setDonateImg("qr",ev.target.result)};r.readAsDataURL(f)}}/></label>:<div style={{textAlign:"center"}}><div style={{fontSize:32}}>📱</div><div style={{fontSize:8,color:"#b8ad97",marginTop:4}}>QR появится здесь</div></div>}
    </div>
  </div>}
</div>

{/* Conditions */}
<div style={{background:"#0d0d0d",border:"1px solid #ece5d8",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
  <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:9,color:"#9a8f7c",marginBottom:8}}>📜 Условия использования</div>
  {CONDITIONS.map(function(c,i){return<div key={i} style={{fontSize:8,color:"#b8ad97",lineHeight:1.7}}>⚠️ {c}</div>})}
</div>
<div style={{textAlign:"center",fontSize:8,color:"#ece5d8",marginTop:8}}>Nox Aeterna © Здоровье не продаётся. Хотя...</div>
</div>
</div>)}


/* ── MAIN APP ── */

export default DonatePage;
