import React, { useState } from 'react';
import { authLogin, authRegister } from '../firebase';
import { CSS } from '../styles/globalCss';

function Login(pr){
var _m=useState("login"),md=_m[0],sM=_m[1];
var _lg=useState(""),lg=_lg[0],sLg=_lg[1];
var _p=useState(""),ps=_p[0],sP=_p[1];
var _p2=useState(""),ps2=_p2[0],sP2=_p2[1];
var _e=useState(""),er=_e[0],sE=_e[1];
var _l=useState(false),ld=_l[0],sL=_l[1];
var li={width:"100%",padding:"10px 12px",border:"2px solid #322d24",borderRadius:8,fontSize:14,fontFamily:"'Nunito',sans-serif",background:"#1d1a14",color:"#ece5d8",outline:"none",textAlign:"center"};
var btn=function(c){return{width:"100%",padding:14,borderRadius:12,border:"2px solid "+c+"40",background:c+"10",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:15,color:c,cursor:"pointer"}};
function doLogin(){
  if(!lg.trim()||!ps){sE("Заполни логин и пароль");return}
  sE("");sL(true);
  authLogin(lg.trim(),ps).then(function(res){
    sL(false);
    if(!res.ok){sE(res.error||"Не удалось войти");return}
    pr.onAuth({login:res.login,role:res.role});
  });
}
function doRegister(){
  if(!lg.trim()||!ps){sE("Заполни логин и пароль");return}
  if(ps!==ps2){sE("Пароли не совпадают");return}
  sE("");sL(true);
  authRegister(lg.trim(),ps).then(function(res){
    sL(false);
    if(!res.ok){sE(res.error||"Не удалось зарегистрироваться");return}
    pr.onAuth({login:res.login,role:res.role});
  });
}
function onKeyDown(e){if(e.key==="Enter"){md==="login"?doLogin():doRegister()}}
return(<div style={{fontFamily:"'Nunito',sans-serif",color:"#ece5d8",background:"linear-gradient(180deg,#221e17,#14110c)",minHeight:"100vh",maxWidth:520,margin:"0 auto",display:"flex",flexDirection:"column",justifyContent:"center",padding:"20px 16px"}}><style>{CSS}</style>
<div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:28,fontFamily:"'Cinzel',serif",fontWeight:900,color:"#ece5d8"}}>✦ Nox Aeterna 2.0</div><div style={{fontSize:14,fontFamily:"'Cinzel',serif",color:"#a89a82",marginTop:4}}>Fantasy Companion</div></div>
<div style={{display:"flex",flexDirection:"column",gap:10,background:"#262219",border:"2px solid #322d24",borderRadius:14,padding:"20px 16px"}}>
<div style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:17,textAlign:"center"}}>{md==="login"?"🔑 Вход":"📝 Регистрация"}</div>
<input style={li} value={lg} onChange={function(e){sLg(e.target.value)}} onKeyDown={onKeyDown} placeholder="Логин" autoCapitalize="none" autoCorrect="off"/>
<input style={li} type="password" value={ps} onChange={function(e){sP(e.target.value)}} onKeyDown={onKeyDown} placeholder="Пароль"/>
{md==="register"&&<input style={li} type="password" value={ps2} onChange={function(e){sP2(e.target.value)}} onKeyDown={onKeyDown} placeholder="Повтори пароль"/>}
{er&&<div style={{color:"#ef4444",fontSize:11,textAlign:"center"}}>{er}</div>}
<button onClick={md==="login"?doLogin:doRegister} disabled={ld} style={btn(md==="login"?"#3b82f6":"#10b981")}>{ld?"⏳...":(md==="login"?"Войти":"Зарегистрироваться")}</button>
<button onClick={function(){sM(md==="login"?"register":"login");sE("")}} style={{background:"none",border:"none",color:"#a89a82",cursor:"pointer",fontSize:12}}>{md==="login"?"Нет аккаунта? Зарегистрироваться":"← Уже есть аккаунт? Войти"}</button>
</div>
</div>)}

export default Login;
