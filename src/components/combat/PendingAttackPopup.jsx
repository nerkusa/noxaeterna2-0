import React from 'react';
import { db, ref, update, remove } from '../../firebase';
import { cF } from '../../utils/character';
import { r1, rollHit } from '../../utils/dice';
import GMAttackPanel from './GMAttackPanel';

function PendingAttackPopup(pr){
  var attacks=pr.attacks||{};
  var myId=pr.myId;var myChar=pr.myChar;var addLog=pr.addLog;var onRoll=pr.onRoll;
  /* Показываем и pending_dodge (ждём броска) и pending_dmg (ждём урона от ГМ) */
  var pending=Object.entries(attacks).filter(function(e){
    return e[1].targetId===myId&&(e[1].status==="pending_dodge"||e[1].status==="pending_shield"||e[1].status==="pending_dmg"||e[1].status==="dodged"||!e[1].status);
  });
  if(pending.length===0)return null;
  var entry=pending[0];var id=entry[0];var atk=entry[1];
  var inf=cF(myChar);var fs=inf.fs;var es=inf.eSk;
  var waiting=atk.status==="pending_dodge"||!atk.status;var shieldPhase=atk.status==="pending_shield";
  var dodged=atk.status==="dodged";
  var atkD=atk.atkD||"?";var atkREF=atk.atkREF||0;var atkSkill=atk.atkSkill||0;
  var atkBonus=atk.atkBonus||0;var atkSkillName=atk.atkSkillName||"Навык";
  var dodgeDetail=atk.dodgeDetail||"";
  var isMagic=!!atk.magic;
  function doDodge(){
    var R=rollHit();var d=R.d;
    var dv=isMagic?(fs.WILL||0):(fs.DEX||0);
    var dg=isMagic?(es["Magic Resist"]||0):(es.Dodge||0);
    var t=d+dv+dg;
    var det=isMagic?("d10("+d+")+WILL("+dv+")+M.Resist("+dg+")="+t):("d10("+d+")+DEX("+dv+")+Dodge("+dg+")="+t);
    var dodgedNow=t>=atk.hitRoll;
    if(dodgedNow){
      /* Успех — ставим статус "dodged", ГМ видит результат с кнопкой Закрыть */
      update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{dodgeRoll:t,dodgeDetail:det,status:"dodged"});
      addLog({who:myChar.name||"???",type:isMagic?"magic":"dodge",label:(isMagic?"✨ Устоял против чуда — ":"✅ Уклонился от ")+atk.attackerName,detail:det+" vs "+atk.hitRoll,total:t});
    } else {
      /* Не защитился — переходим в фазу выбора щита */
      update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{dodgeRoll:t,dodgeDetail:det,status:"pending_shield"});
      addLog({who:myChar.name||"???",type:isMagic?"magic_fail":"dodge",label:(isMagic?"❌ Не устоял против чуда — ":"❌ Не уклонился от ")+atk.attackerName,detail:det+" vs "+atk.hitRoll,total:t});
    }
  }
  function acceptHit(){
    update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{dodgeRoll:0,status:"pending_shield"});
  }
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,animation:"fadeIn 0.2s"}}>
    <div style={{background:"#221e17",border:"3px solid "+(waiting?"#ef4444":dodged?"#10b981":"#ef4444"),borderRadius:16,padding:"18px 22px",textAlign:"center",minWidth:270,maxWidth:350,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"popIn 0.3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
        <div style={{fontSize:9,color:"#a89a82"}}>{pending.length>1?"Атака 1 из "+pending.length:""}</div>
        <button onClick={function(){update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{status:"done"}).then(function(){remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));})}} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#8d8270",lineHeight:1}} title="Отменить атаку">✕</button>
      </div>
      <div style={{fontSize:24,marginBottom:4}}>{waiting?"⚔️":dodged?"🛡️":shieldPhase?"🛡":"💥"}</div>
      <div style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:15,color:"#dc2626",marginBottom:8}}>{atk.attackerName+" атакует "+myChar.name+"!"}</div>
      {/* Бросок атаки с деталями */}
      <div style={{background:"#262219",border:"1px solid #322d24",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
        <div style={{fontSize:8,color:"#9a8f7c",marginBottom:4}}>Бросок на попадание</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,flexWrap:"wrap",marginBottom:6}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:900,color:atkD===10?"#d97706":atkD===1?"#dc2626":"#3b82f6"}}>{"🎲"+(atkD||atk.hitRoll)}</span>
          {atkREF>0&&<span style={{color:"#a89a82"}}>+</span>}
          {atkREF>0&&<span style={{background:"#2c2820",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#a89a82",fontSize:7,display:"block"}}>REF</span><span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700}}>{atkREF}</span></span>}
          {atkSkill>0&&<span style={{color:"#a89a82"}}>+</span>}
          {atkSkill>0&&<span style={{background:"#2c2820",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#a89a82",fontSize:7,display:"block"}}>{atkSkillName}</span><span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700}}>{atkSkill}</span></span>}
          {atkBonus!==0&&<span style={{color:"#a89a82"}}>+</span>}
          {atkBonus!==0&&<span style={{background:"#2c2820",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#a89a82",fontSize:7,display:"block"}}>Бнс</span><span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700}}>{atkBonus}</span></span>}
        </div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:32,fontWeight:900,color:"#dc2626"}}>{"= "+atk.hitRoll}</div>
        {atk.atkCrit&&<div style={{fontSize:11,color:"#d97706",fontWeight:700}}>🌟 КРИТ ×1.5</div>}{atk.atkFumble&&<div style={{fontSize:11,color:"#dc2626",fontWeight:700}}>💀 ПРОВАЛ</div>}
        {atk.weaponName&&<div style={{fontSize:9,color:"#a89a82",marginTop:2}}>{atk.weaponName+" · "+atk.dmgType}</div>}
      </div>
      {/* Уклонение — кнопка или результат */}
      <div style={{background:"#262219",border:"1px solid "+(waiting?"#3a3429":shieldPhase?"#38bdf840":"#10b98140"),borderRadius:10,padding:"8px 12px",marginBottom:waiting?10:0}}>
        <div style={{fontSize:8,color:"#9a8f7c",marginBottom:4}}>{isMagic?"✨ Сопротивление чуду":"Твоё уклонение"}</div>
        {waiting
          ?<div>
            <div style={{fontSize:9,color:"#a89a82",marginBottom:8}}>{isMagic?("d10 + WILL("+(fs.WILL||0)+") + Miracle Resist("+(es["Magic Resist"]||0)+")"):("d10 + DEX("+(fs.DEX||0)+") + Dodge("+(es.Dodge||0)+")")}</div>
            <button onClick={doDodge} style={{width:"100%",padding:"10px",borderRadius:9,border:"none",background:isMagic?"#7c3aed":"#10b981",color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:14,cursor:"pointer",marginBottom:6}}>{isMagic?"✨ Сопротивляться чуду!":"🛡️ Уклониться!"}</button>
            <button onClick={acceptHit} style={{width:"100%",padding:6,borderRadius:7,border:"2px solid #ef444440",background:"none",color:"#ef4444",fontWeight:700,fontSize:10,cursor:"pointer"}}>Принять удар</button>
          </div>
          :<div>
            {dodgeDetail&&<div style={{fontSize:9,color:"#9a8f7c",marginBottom:4}}>{dodgeDetail}</div>}
            <div style={{fontFamily:"'Cinzel',serif",fontSize:32,fontWeight:900,color:dodged?"#10b981":"#ef4444"}}>{atk.dodgeRoll||0}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13,color:dodged?"#34d399":"#f87171",marginTop:4}}>
              {dodged?"✅ Уклонился!":shieldPhase?"❌ Попало! Выбери защиту:":"❌ Попало!"}
            </div>
            {shieldPhase&&(function(){
              var shieldId=myChar.equippedShield;
              var shObj=shieldId?(myChar.shields||[]).find(function(s){return s.id===shieldId}):null;
              var equippedW=(myChar.weapons||[]).find(function(w){return w.id===myChar.equippedWeapon});
              var is2h=equippedW&&(equippedW.hands===2||(equippedW.hands===1.5&&(myChar.weaponMode||"1h")==="2h"));
              var canShield=shObj&&shObj.hp>0&&!is2h;
              return(<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
                {canShield&&<button onClick={function(){update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{status:"pending_dmg",shieldUsed:true,shieldAbsorb:shObj.absorb,shieldName:shObj.name,shieldId:shObj.id});}} style={{width:"100%",padding:10,borderRadius:8,border:"none",background:"#38bdf8",color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:13,cursor:"pointer"}}>🛡 Выставить {shObj.name} ({shObj.absorb*100}% поглощения)</button>}
                {canShield&&<div style={{fontSize:8,color:"#a89a82",textAlign:"center"}}>HP щита: {shObj.hp}/{shObj.maxHp}</div>}
                {!canShield&&shObj&&shObj.hp<=0&&<div style={{fontSize:9,color:"#ef4444",textAlign:"center",fontWeight:700}}>💔 Щит сломан</div>}
                {!shObj&&<div style={{fontSize:9,color:"#a89a82",textAlign:"center",fontStyle:"italic"}}>Нет щита</div>}
                <button onClick={function(){update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{status:"pending_dmg",shieldUsed:false});}} style={{width:"100%",padding:10,borderRadius:8,border:"2px solid #ef444440",background:"none",color:"#ef4444",fontWeight:700,fontSize:12,cursor:"pointer"}}>💥 Принять удар без щита</button>
              </div>);
            })()}
            {!shieldPhase&&!dodged&&<div style={{fontSize:10,color:"#a89a82",marginTop:6,fontStyle:"italic"}}>ГМ наносит урон...</div>}
          </div>
        }
      </div>
    </div>
  </div>)}

/* ── GMAttackPanel: ГМ видит сцену NPC→Игрок ── */

export default PendingAttackPopup;
