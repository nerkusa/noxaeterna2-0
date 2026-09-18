import React, { useState } from 'react';
import { authLogin, authRegister } from '../firebase';
import { CSS } from '../styles/globalCss';
import { randomQuote } from '../data/quotes';

function Login(pr){
var _q=useState(randomQuote),quote=_q[0];
var _m=useState("login"),md=_m[0],sM=_m[1];
var _lg=useState(""),lg=_lg[0],sLg=_lg[1];
var _p=useState(""),ps=_p[0],sP=_p[1];
var _p2=useState(""),ps2=_p2[0],sP2=_p2[1];
var _e=useState(""),er=_e[0],sE=_e[1];
var _l=useState(false),ld=_l[0],sL=_l[1];
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
return(<div style={{fontFamily:"'Inter',sans-serif",color:"var(--color-text)",background:"radial-gradient(circle at 50% 20%,#1c1f34,var(--color-bg) 60%)",minHeight:"100vh",width:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
<style>{CSS}</style>
<div style={{width:"100%",maxWidth:380}}>

<div className="n-card" style={{boxShadow:"var(--shadow-lg)",padding:28}}>
  <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--color-accent)"}}>Nox Aeterna</div>
  <h1 style={{margin:"10px 0 6px",fontSize:26,fontWeight:600,letterSpacing:"-0.015em",lineHeight:1.15}}>{md==="login"?"С возвращением":"Создать аккаунт"}</h1>
  <p style={{margin:"0 0 22px",fontSize:13,lineHeight:1.55,color:"var(--color-text-muted)",fontStyle:"italic"}}>{"«"+quote+"»"}</p>

  <div className="n-field" style={{marginBottom:14}}>
    <label>Логин</label>
    <input className="n-input" value={lg} onChange={function(e){sLg(e.target.value)}} onKeyDown={onKeyDown} autoCapitalize="none" autoCorrect="off"/>
  </div>
  <div className="n-field" style={{marginBottom:md==="register"?14:20}}>
    <label>Пароль</label>
    <input className="n-input" type="password" value={ps} onChange={function(e){sP(e.target.value)}} onKeyDown={onKeyDown} placeholder="••••••••"/>
  </div>
  {md==="register"&&<div className="n-field" style={{marginBottom:20}}>
    <label>Повтори пароль</label>
    <input className="n-input" type="password" value={ps2} onChange={function(e){sP2(e.target.value)}} onKeyDown={onKeyDown} placeholder="••••••••"/>
  </div>}

  {er&&<div style={{color:"#ef4444",fontSize:12,marginBottom:14}}>{er}</div>}

  <button onClick={md==="login"?doLogin:doRegister} disabled={ld} className="n-btn n-btn-primary n-btn-block" style={{minHeight:44,fontSize:15}}>{ld?"⏳ …":(md==="login"?"Войти":"Зарегистрироваться")}</button>

  <div style={{display:"flex",justifyContent:"center",marginTop:16}}>
    <button onClick={function(){sM(md==="login"?"register":"login");sE("")}} className="n-btn" style={{color:"var(--color-accent)",fontSize:13,padding:"6px 4px"}}>{md==="login"?"Нет аккаунта? Создать":"← Уже есть аккаунт? Войти"}</button>
  </div>
</div>

<div style={{textAlign:"center",marginTop:22,fontSize:12,color:"var(--color-text-muted)"}}>✦ Nox Aeterna 2.0 · Fantasy Companion</div>
</div>
</div>)}

export default Login;
