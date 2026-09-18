import React from 'react';
import { db, ref, set, update, remove } from '../../firebase';
import { ZONES, zoneByName } from '../../data/combat';
import { cF, mHP } from '../../utils/character';
import { calcAE } from '../../utils/combat';
import { r1, rN, sm } from '../../utils/dice';
import PlayerAttackNotif from './PlayerAttackNotif';

function GMAttackPanel(pr){
  var attacks=pr.attacks||{};
  var addLog=pr.addLog;var onRoll=pr.onRoll;var characters=pr.characters||[];
  var active=Object.entries(attacks).filter(function(e){
    return !e[1].fromPlayer&&(e[1].status==="pending_dodge"||e[1].status==="pending_shield"||e[1].status==="pending_dmg"||e[1].status==="dodged"||(!e[1].status&&!e[1].fromPlayer&&e[1].targetId));
  });
  if(active.length===0)return null;
  var entry=active[0];var id=entry[0];var atk=entry[1];
  var waiting=atk.status==="pending_dodge";var shieldPhaseGM=atk.status==="pending_shield";
  var dodged=atk.status==="dodged";
  var tgtChar=characters.find(function(x){return x._fbId===atk.targetId;});
  /* Детали броска атаки */
  var atkD=atk.atkD||"?";
  var atkREF=atk.atkREF||0;
  var atkSkill=atk.atkSkill||0;
  var atkBonus=atk.atkBonus||0;
  var atkSkillName=atk.atkSkillName||"Skill";
  /* Детали уклонения (если пришли) */
  var dodgeDetail=atk.dodgeDetail||"";

  function doRollDmg(){
    if(!tgtChar)return;
    var aimed=!!atk.aimedZone;var zoneD=aimed?0:r1(6);var zoneObj=aimed?zoneByName(atk.aimedZone):ZONES[zoneD-1];var zoneRoll=aimed?"🎯прицел":"1d6="+zoneD;
    var m=(atk.dmgDice||"1d6").match(/(\d+)d(\d+)/);if(!m)return;
    var dice=rN(parseInt(m[1]),parseInt(m[2]));
    var critM=atk.atkCrit?1.5:1;
    var rawDmg=Math.floor((sm(dice)+(atk.dmgBonus||0))*critM);
    var multiplied=Math.floor(rawDmg*zoneObj.mult);
    var pArmorId=zoneObj.slot==="head"?tgtChar.equippedHead:tgtChar.equippedBody;
    var pArmorObj=(tgtChar.armors||[]).find(function(a){return a.id===pArmorId;});
    var pArmorType=pArmorObj?(pArmorObj.hp>0?pArmorObj.type:"none"):"none";
    var ae=zoneObj.ignoreArmor?{ad:0,hd:multiplied,desc:"🔓"+zoneObj.name+"×"+zoneObj.mult+" игнор→HP−"+multiplied}:calcAE(pArmorType,atk.dmgType||"Р",multiplied);
    /* Щит — поглощает часть HP урона */
    var shieldDesc="";var shieldDmg=0;
    if(atk.shieldUsed&&atk.shieldAbsorb){
      var absorbed=Math.floor(ae.hd*atk.shieldAbsorb);
      shieldDmg=absorbed;ae.hd=Math.max(0,ae.hd-absorbed);
      shieldDesc=" 🛡 "+atk.shieldName+" поглотил "+absorbed;
      /* HP щита обновится ниже через shields[] */
    }
    var inf2=cF(tgtChar);var pMx=tgtChar.hpOv||mHP(inf2.fs);
    var pCur=tgtChar.curHp!==null&&tgtChar.curHp!==undefined?tgtChar.curHp:pMx;
    var newHp=Math.max(0,pCur-ae.hd);
    /* Пишем только изменённые поля персонажа, чтобы не затирать
       параллельные правки листа игроком (гонка данных). */
    var patch={curHp:newHp};
    if(atk.shieldUsed&&atk.shieldId){patch.shields=(tgtChar.shields||[]).map(function(s){return s.id===atk.shieldId?Object.assign({},s,{hp:Math.max(0,s.hp-shieldDmg)}):s;});if(patch.shields.find(function(s){return s.id===atk.shieldId&&s.hp<=0}))patch.equippedShield=null;}
    if(pArmorObj&&ae.ad>0){patch.armors=(tgtChar.armors||[]).map(function(a){return a.id===pArmorId?Object.assign({},a,{hp:Math.max(0,a.hp-ae.ad)}):a;});}
    update(ref(db,"rooms/"+pr.room+"/characters/"+tgtChar._fbId),patch);
    if(ae.hd>0){set(ref(db,"rooms/"+pr.room+"/dmgEvents/"+tgtChar._fbId),{attackerName:atk.attackerName,dmg:ae.hd,oldHp:pCur,newHp:newHp,maxHp:pMx,ts:Date.now()});}
    addLog({who:atk.attackerName,type:"dmg_npc",label:"💥 "+atk.weaponName+" → "+atk.targetName+" ["+zoneObj.e+zoneObj.name+"] "+ae.hd+" HP"+shieldDesc,detail:zoneRoll+" "+zoneObj.name+" | "+ae.desc+" | ❤️ "+pCur+"→"+newHp,total:ae.hd});
    onRoll({label:atk.attackerName+" 💥 Урон",d10:null,parts:[{label:atk.dmgDice||"1d6",value:sm(dice)},{label:"Бнс",value:atk.dmgBonus||0}],total:rawDmg,subtext:zoneObj.e+" "+zoneObj.name+" ×"+zoneObj.mult+(zoneObj.ignoreArmor?" 🔓":"")+"\n"+ae.desc+shieldDesc+"\n→ "+atk.targetName+": "+pCur+"→"+newHp+" HP"});
    remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));
  }
  function skipDmg(){remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));}

  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:997,animation:"fadeIn 0.2s"}}>
    <div style={{background:"#161826",border:"3px solid "+(waiting?"#f59e0b":dodged?"#10b981":shieldPhaseGM?"#38bdf8":"#ef4444"),borderRadius:16,padding:"18px 22px",textAlign:"center",minWidth:270,maxWidth:350,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"popIn 0.3s"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:2}}><button onClick={skipDmg} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#9397ab",lineHeight:1}}>✕</button></div>
      {active.length>1&&<div style={{fontSize:9,color:"#9397ab",marginBottom:4}}>{"Сцена 1 из "+active.length}</div>}
      <div style={{fontSize:24,marginBottom:4}}>{waiting?"⚔️":dodged?"🛡️":shieldPhaseGM?"⏳":"💥"}</div>
      <div style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:15,color:"#dc2626",marginBottom:8}}>{shieldPhaseGM?(atk.attackerName+" → "+atk.targetName+" — щит?"):(atk.attackerName+" атакует "+atk.targetName+"!")}</div>

      {/* Бросок атаки с деталями */}
      <div style={{background:"#232532",border:"1px solid #34374a",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
        <div style={{fontSize:8,color:"#9397ab",marginBottom:4}}>Бросок на попадание</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,flexWrap:"wrap",marginBottom:6}}>
          <span style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:900,color:atkD===10?"#d97706":atkD===1?"#dc2626":"#3b82f6"}}>{"🎲"+atkD}</span>
          <span style={{color:"#9397ab"}}>+</span>
          <span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}>
            <span style={{color:"#9397ab",fontSize:7,display:"block"}}>REF</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkREF}</span>
          </span>
          <span style={{color:"#9397ab"}}>+</span>
          <span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}>
            <span style={{color:"#9397ab",fontSize:7,display:"block"}}>{atkSkillName}</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkSkill}</span>
          </span>
          {atkBonus!==0&&<span style={{color:"#9397ab"}}>+</span>}
          {atkBonus!==0&&<span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}>
            <span style={{color:"#9397ab",fontSize:7,display:"block"}}>Бнс</span>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkBonus}</span>
          </span>}
        </div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:900,color:"#dc2626"}}>{"= "+atk.hitRoll}</div>
        {atk.atkCrit&&<div style={{fontSize:11,color:"#d97706",fontWeight:700}}>🌟 КРИТ ×1.5</div>}{atk.atkFumble&&<div style={{fontSize:11,color:"#dc2626",fontWeight:700}}>💀 ПРОВАЛ</div>}
        <div style={{fontSize:9,color:"#9397ab",marginTop:2}}>{atk.weaponName+" · "+atk.dmgDice+" · "+atk.dmgType}</div>
      </div>

      {/* Уклонение — ждём или показываем */}
      <div style={{background:"#232532",border:"1px solid "+(waiting?"#34374a":shieldPhaseGM?"#38bdf840":"#10b98140"),borderRadius:10,padding:"8px 12px",marginBottom:10}}>
        <div style={{fontSize:8,color:"#9397ab",marginBottom:4}}>Уклонение {atk.targetName}</div>
        {waiting
          ?<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"6px 0"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#f59e0b",animation:"fadeIn 0.5s infinite alternate"}}/>
            <span style={{fontSize:12,color:"#75798c",fontStyle:"italic"}}>ждём броска игрока...</span>
          </div>
          :<div>
            <div style={{fontSize:9,color:"#9397ab",marginBottom:4}}>{dodgeDetail}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:900,color:dodged?"#10b981":"#ef4444"}}>{atk.dodgeRoll||0}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:dodged?"#34d399":shieldPhaseGM?"#38bdf8":"#f87171",marginTop:4}}>
              {dodged?"✅ Уклонился!":shieldPhaseGM?"❌ Попало! Игрок выбирает щит...": "❌ Попало!"}
            </div>
            {shieldPhaseGM&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:4,padding:"4px 0",background:"#0e2236",borderRadius:6}}><div style={{width:6,height:6,borderRadius:"50%",background:"#38bdf8"}}/><span style={{fontSize:10,color:"#38bdf8",fontStyle:"italic"}}>ждём решения...</span></div>}
          </div>
        }
      </div>

      {/* Кнопки */}
      {(waiting||shieldPhaseGM)&&<div style={{fontSize:9,color:"#9397ab",fontStyle:"italic"}}>{shieldPhaseGM?"⏳ Игрок выбирает защиту...": "Ожидаем действия игрока..."}</div>}
      {!waiting&&!shieldPhaseGM&&(dodged
        ?<button onClick={skipDmg} style={{width:"100%",padding:8,borderRadius:8,border:"none",background:"#10b981",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:13,cursor:"pointer"}}>✅ Закрыть</button>
        :<button onClick={doRollDmg} style={{width:"100%",padding:10,borderRadius:8,border:"none",background:"#ef4444",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:14,cursor:"pointer"}}>💥 Бросить урон + зону!</button>
      )}
    </div>
  </div>)}

/* ── PlayerAttackNotif: ГМ видит сцену Игрок→NPC (кидает уклонение / авто-урон) ── */

export default GMAttackPanel;
