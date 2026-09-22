import React from 'react';
import { db, ref, update, remove } from '../../firebase';
import { cF, mHP, willPenalty } from '../../utils/character';
import { hasTraitEffect } from '../../data/traits';
import { getTraits } from '../../utils/traitStore';
import { r1, rollHit } from '../../utils/dice';
import GMAttackPanel from './GMAttackPanel';

function PendingAttackPopup(pr){
  var attacks=pr.attacks||{};
  var myId=pr.myId;var myChar=pr.myChar;var addLog=pr.addLog;var onRoll=pr.onRoll;
  /* Показываем pending_dodge/pending_shield/pending_dmg/dodged, а для страха — ещё pending_fear_choice */
  var pending=Object.entries(attacks).filter(function(e){
    return e[1].targetId===myId&&(e[1].status==="pending_dodge"||e[1].status==="pending_shield"||e[1].status==="pending_dmg"||e[1].status==="dodged"||e[1].status==="pending_fear_choice"||!e[1].status);
  });
  if(pending.length===0)return null;
  var entry=pending[0];var id=entry[0];var atk=entry[1];
  var inf=cF(myChar);var fs=inf.fs;var es=inf.eSk;
  var waiting=atk.status==="pending_dodge"||!atk.status;var shieldPhase=atk.status==="pending_shield";
  var dodged=atk.status==="dodged";
  var isFear=!!atk.fear;var fearChoice=atk.status==="pending_fear_choice";
  var atkD=atk.atkD||"?";var atkREF=atk.atkREF||0;var atkSkill=atk.atkSkill||0;
  var atkBonus=atk.atkBonus||0;var atkSkillName=atk.atkSkillName||"Навык";
  var dodgeDetail=atk.dodgeDetail||"";
  var isMagic=!!atk.magic;
  var myCurWill=myChar.curWill!==null&&myChar.curWill!==undefined?myChar.curWill:(fs.WILL||1);
  var wPen=willPenalty(myCurWill);var sPen=myChar.shakenPenalty?-myChar.shakenPenalty:0;
  var rPen=wPen+sPen;
  function clearShakenPatch(patch){if(myChar.shakenPenalty)patch.shakenPenalty=0;return patch}
  function doDodge(){
    if(isFear){
      var R2=rollHit();var d2=R2.d;var wv2=fs.WILL||0;var sc2=es["Самообладание"]||0;var t2=d2+wv2+sc2+rPen;
      var det2="d10("+d2+")+WILL("+wv2+")+Самообладание("+sc2+")"+(wPen?" "+wPen+"(деморализован)":"")+(sPen?" "+sPen+"(потрясён)":"")+"="+t2;
      var resisted=t2>=atk.hitRoll;
      update(ref(db,"rooms/"+pr.room+"/characters/"+myId),clearShakenPatch({}));
      if(resisted){
        addLog({who:myChar.name||"???",type:"fear",label:"😤 Устоял перед "+atk.attackerName,detail:det2+" vs "+atk.hitRoll,total:t2});
        update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{status:"done"}).then(function(){remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));});
      } else {
        addLog({who:myChar.name||"???",type:"fear",label:"😨 Не устоял перед "+atk.attackerName,detail:det2+" vs "+atk.hitRoll,total:t2});
        update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{fearRoll:t2,fearD:d2,fearDetail:det2,status:"pending_fear_choice"});
      }
      return;
    }
    var R=rollHit();var d=R.d;
    var dv=isMagic?(fs.WILL||0):(fs.DEX||0);
    var dg=isMagic?(es["Сопротивление магии"]||0):(es["Уклонение"]||0);
    var t=d+dv+dg+rPen;
    var det=isMagic?("d10("+d+")+WILL("+dv+")+Сопр.чудотв.("+dg+")"+(rPen?" +штраф("+rPen+")":"")+"="+t):("d10("+d+")+DEX("+dv+")+Уклонение("+dg+")"+(rPen?" +штраф("+rPen+")":"")+"="+t);
    var dodgedNow=t>=atk.hitRoll;
    update(ref(db,"rooms/"+pr.room+"/characters/"+myId),clearShakenPatch({}));
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
    if(isFear){
      update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{fearRoll:-999,fearD:0,fearDetail:"без сопротивления",status:"pending_fear_choice"});
      addLog({who:myChar.name||"???",type:"fear",label:"😨 Не сопротивлялся страху — "+atk.attackerName,detail:"",total:0});
      return;
    }
    update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{dodgeRoll:0,status:"pending_shield"});
  }
  /* Выбор при проигранном броске Страха: Пересилить (−2 Воли, бесплатно на HP<25% с «Хладнокровием») или Поддаться */
  var mx=myChar.hpOv||mHP(fs,myChar);var curHpV=myChar.curHp!==null&&myChar.curHp!==undefined?myChar.curHp:mx;
  var lowHp=mx>0&&(curHpV/mx)<0.25;
  var freeOvercome=lowHp&&hasTraitEffect(myChar,getTraits(),"free_overcome_fear");
  function overcomeFear(){
    var newWill=freeOvercome?myCurWill:myCurWill-2;
    update(ref(db,"rooms/"+pr.room+"/characters/"+myId),{curWill:newWill});
    addLog({who:myChar.name||"???",type:"fear",label:(freeOvercome?"❄️ Пересилил страх (бесплатно — Хладнокровие)":"💪 Пересилил страх (−2 Воли)")+" — "+atk.attackerName,detail:"Воля: "+myCurWill+"→"+newWill,total:0});
    remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));
  }
  function giveInFear(){
    var lostBy=atk.hitRoll-(atk.fearRoll||0);
    var broken=lostBy>=5||atk.fearD===1;
    if(broken){
      update(ref(db,"rooms/"+pr.room+"/characters/"+myId),{broken:true});
      addLog({who:myChar.name||"???",type:"fear",label:"💀 Сломлен от страха перед "+atk.attackerName,detail:"Пропуск хода / вынужденное отступление в этот раунд",total:0});
    } else {
      update(ref(db,"rooms/"+pr.room+"/characters/"+myId),{shakenPenalty:2});
      addLog({who:myChar.name||"???",type:"fear",label:"😰 Потрясён перед "+atk.attackerName,detail:"−2 к следующему броску",total:0});
    }
    remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));
  }
  if(isFear){
    var accentF="#f472b6";
    return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,animation:"fadeIn 0.2s"}}>
      <div style={{background:"#161826",border:"3px solid "+accentF,borderRadius:16,padding:"18px 22px",textAlign:"center",minWidth:270,maxWidth:350,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"popIn 0.3s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div style={{fontSize:9,color:"#9397ab"}}>{pending.length>1?"Событие 1 из "+pending.length:""}</div>
          {waiting&&<button onClick={function(){update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{status:"done"}).then(function(){remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));})}} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#75798c",lineHeight:1}} title="Закрыть">✕</button>}
        </div>
        <div style={{fontSize:24,marginBottom:4}}>😨</div>
        <div style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:15,color:accentF,marginBottom:8}}>{atk.attackerName+" пытается устрашить "+myChar.name+"!"}</div>
        <div style={{background:"#232532",border:"1px solid #34374a",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
          <div style={{fontSize:8,color:"#9397ab",marginBottom:4}}>Бросок Устрашения</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,flexWrap:"wrap",marginBottom:6}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:900,color:"#3b82f6"}}>{"🎲"+(atkD||atk.hitRoll)}</span>
            {atkREF>0&&<span style={{color:"#9397ab"}}>+</span>}
            {atkREF>0&&<span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>{atk.atkStatName||"EMP"}</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkREF}</span></span>}
            {atkSkill>0&&<span style={{color:"#9397ab"}}>+</span>}
            {atkSkill>0&&<span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>{atkSkillName}</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkSkill}</span></span>}
            {!!atk.atkPenalty&&<span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>Штраф</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700,color:"#ef4444"}}>{atk.atkPenalty}</span></span>}
          </div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:900,color:accentF}}>{"= "+atk.hitRoll}</div>
        </div>
        <div style={{background:"#232532",border:"1px solid "+accentF+"40",borderRadius:10,padding:"8px 12px"}}>
          <div style={{fontSize:8,color:"#9397ab",marginBottom:4}}>Твоё Самообладание</div>
          {waiting
            ?<div>
              <div style={{fontSize:9,color:"#9397ab",marginBottom:8}}>{"d10 + WILL("+(fs.WILL||0)+") + Самообладание("+(es["Самообладание"]||0)+")"+(rPen?" "+rPen:"")}</div>
              <button onClick={doDodge} style={{width:"100%",padding:"10px",borderRadius:9,border:"none",background:accentF,color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:14,cursor:"pointer",marginBottom:6}}>😨 Бросить Самообладание!</button>
              <button onClick={acceptHit} style={{width:"100%",padding:6,borderRadius:7,border:"2px solid #ef444440",background:"none",color:"#ef4444",fontWeight:700,fontSize:10,cursor:"pointer"}}>Не сопротивляться</button>
            </div>
            :<div>
              {atk.fearDetail&&<div style={{fontSize:9,color:"#9397ab",marginBottom:4}}>{atk.fearDetail}</div>}
              <div style={{fontFamily:"'Inter',sans-serif",fontSize:28,fontWeight:900,color:"#ef4444"}}>{(atk.fearRoll||0)+" vs "+atk.hitRoll}</div>
              <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:"#f87171",marginTop:4,marginBottom:8}}>😨 Не устоял! Выбери реакцию:</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <button onClick={overcomeFear} style={{width:"100%",padding:10,borderRadius:8,border:"none",background:"#3b82f6",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:12,cursor:"pointer"}}>{freeOvercome?"❄️ Пересилить (бесплатно — Хладнокровие)":"💪 Пересилить (−2 Воли)"}</button>
                <button onClick={giveInFear} style={{width:"100%",padding:10,borderRadius:8,border:"2px solid #ef444440",background:"none",color:"#ef4444",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>😨 Поддаться</button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>);
  }
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,animation:"fadeIn 0.2s"}}>
    <div style={{background:"#161826",border:"3px solid "+(waiting?"#ef4444":dodged?"#10b981":"#ef4444"),borderRadius:16,padding:"18px 22px",textAlign:"center",minWidth:270,maxWidth:350,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"popIn 0.3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
        <div style={{fontSize:9,color:"#9397ab"}}>{pending.length>1?"Атака 1 из "+pending.length:""}</div>
        <button onClick={function(){update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{status:"done"}).then(function(){remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));})}} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#75798c",lineHeight:1}} title="Отменить атаку">✕</button>
      </div>
      <div style={{fontSize:24,marginBottom:4}}>{waiting?"⚔️":dodged?"🛡️":shieldPhase?"🛡":"💥"}</div>
      <div style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:15,color:"#dc2626",marginBottom:8}}>{atk.attackerName+" атакует "+myChar.name+"!"}</div>
      {/* Бросок атаки с деталями */}
      <div style={{background:"#232532",border:"1px solid #34374a",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
        <div style={{fontSize:8,color:"#9397ab",marginBottom:4}}>Бросок на попадание</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,flexWrap:"wrap",marginBottom:6}}>
          <span style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:900,color:atkD===10?"#d97706":atkD===1?"#dc2626":"#3b82f6"}}>{"🎲"+(atkD||atk.hitRoll)}</span>
          {atkREF>0&&<span style={{color:"#9397ab"}}>+</span>}
          {atkREF>0&&<span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>{atk.atkStatName||"REF"}</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkREF}</span></span>}
          {atkSkill>0&&<span style={{color:"#9397ab"}}>+</span>}
          {atkSkill>0&&<span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>{atkSkillName}</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkSkill}</span></span>}
          {atkBonus!==0&&<span style={{color:"#9397ab"}}>+</span>}
          {atkBonus!==0&&<span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>Бнс</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkBonus}</span></span>}
          {!!atk.atkPenalty&&<span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>Штраф</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700,color:"#ef4444"}}>{atk.atkPenalty}</span></span>}
        </div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:900,color:"#dc2626"}}>{"= "+atk.hitRoll}</div>
        {atk.atkCrit&&<div style={{fontSize:11,color:"#d97706",fontWeight:700}}>🌟 КРИТ ×1.5</div>}{atk.atkFumble&&<div style={{fontSize:11,color:"#dc2626",fontWeight:700}}>💀 ПРОВАЛ</div>}
        {atk.weaponName&&<div style={{fontSize:9,color:"#9397ab",marginTop:2}}>{atk.weaponName+" · "+atk.dmgType}</div>}
      </div>
      {/* Уклонение — кнопка или результат */}
      <div style={{background:"#232532",border:"1px solid "+(waiting?"#34374a":shieldPhase?"#38bdf840":"#10b98140"),borderRadius:10,padding:"8px 12px",marginBottom:waiting?10:0}}>
        <div style={{fontSize:8,color:"#9397ab",marginBottom:4}}>{isMagic?"✨ Сопротивление чуду":"Твоё уклонение"}</div>
        {waiting
          ?<div>
            <div style={{fontSize:9,color:"#9397ab",marginBottom:8}}>{isMagic?("d10 + WILL("+(fs.WILL||0)+") + Сопротивление чудотворству("+(es["Сопротивление магии"]||0)+")"):("d10 + DEX("+(fs.DEX||0)+") + Уклонение("+(es["Уклонение"]||0)+")")}</div>
            <button onClick={doDodge} style={{width:"100%",padding:"10px",borderRadius:9,border:"none",background:isMagic?"#7c3aed":"#10b981",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:14,cursor:"pointer",marginBottom:6}}>{isMagic?"✨ Сопротивляться чуду!":"🛡️ Уклониться!"}</button>
            <button onClick={acceptHit} style={{width:"100%",padding:6,borderRadius:7,border:"2px solid #ef444440",background:"none",color:"#ef4444",fontWeight:700,fontSize:10,cursor:"pointer"}}>Принять удар</button>
          </div>
          :<div>
            {dodgeDetail&&<div style={{fontSize:9,color:"#9397ab",marginBottom:4}}>{dodgeDetail}</div>}
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:900,color:dodged?"#10b981":"#ef4444"}}>{atk.dodgeRoll||0}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:dodged?"#34d399":"#f87171",marginTop:4}}>
              {dodged?"✅ Уклонился!":shieldPhase?"❌ Попало! Выбери защиту:":"❌ Попало!"}
            </div>
            {shieldPhase&&(function(){
              var shieldId=myChar.equippedShield;
              var shObj=shieldId?(myChar.shields||[]).find(function(s){return s.id===shieldId}):null;
              var equippedW=(myChar.weapons||[]).find(function(w){return w.id===myChar.equippedWeapon});
              var is2h=equippedW&&(equippedW.hands===2||(equippedW.hands===1.5&&(myChar.weaponMode||"1h")==="2h"));
              var canShield=shObj&&shObj.hp>0&&!is2h;
              return(<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
                {canShield&&<button onClick={function(){update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{status:"pending_dmg",shieldUsed:true,shieldAbsorb:shObj.absorb,shieldName:shObj.name,shieldId:shObj.id});}} style={{width:"100%",padding:10,borderRadius:8,border:"none",background:"#38bdf8",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:13,cursor:"pointer"}}>🛡 Выставить {shObj.name} ({shObj.absorb*100}% поглощения)</button>}
                {canShield&&<div style={{fontSize:8,color:"#9397ab",textAlign:"center"}}>HP щита: {shObj.hp}/{shObj.maxHp}</div>}
                {!canShield&&shObj&&shObj.hp<=0&&<div style={{fontSize:9,color:"#ef4444",textAlign:"center",fontWeight:700}}>💔 Щит сломан</div>}
                {!shObj&&<div style={{fontSize:9,color:"#9397ab",textAlign:"center",fontStyle:"italic"}}>Нет щита</div>}
                <button onClick={function(){update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{status:"pending_dmg",shieldUsed:false});}} style={{width:"100%",padding:10,borderRadius:8,border:"2px solid #ef444440",background:"none",color:"#ef4444",fontWeight:700,fontSize:12,cursor:"pointer"}}>💥 Принять удар без щита</button>
              </div>);
            })()}
            {!shieldPhase&&!dodged&&<div style={{fontSize:10,color:"#9397ab",marginTop:6,fontStyle:"italic"}}>ГМ наносит урон...</div>}
          </div>
        }
      </div>
    </div>
  </div>)}

/* ── GMAttackPanel: ГМ видит сцену NPC→Игрок ── */

export default PendingAttackPopup;
