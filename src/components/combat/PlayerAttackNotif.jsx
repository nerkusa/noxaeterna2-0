import React from 'react';
import { db, ref, update, remove } from '../../firebase';
import { ZONES, zoneByName } from '../../data/combat';
import { calcAE } from '../../utils/combat';
import { r1, rN, sm, rollHit } from '../../utils/dice';
import DamagePopup from './DamagePopup';
import PlayerAttackStatus from './PlayerAttackStatus';

function PlayerAttackNotif(pr){
  var attacks=pr.attacks||{};
  var spawned=pr.spawned||{};var saveSpawned=pr.saveSpawned;
  var addLog=pr.addLog;var onRoll=pr.onRoll;
  /* Сначала pending_dodge — нужно уклонение */
  var needDodge=Object.entries(attacks).filter(function(e){return e[1].fromPlayer&&e[1].status==="pending_dodge";});
  /* pending_dmg — показываем ГМу кнопку урона (не авто) */
  var needDmg=Object.entries(attacks).filter(function(e){return e[1].fromPlayer&&e[1].status==="pending_dmg";});
  if(needDodge.length===0&&needDmg.length===0)return null;
  /* Если только pending_dmg — показываем попап с кнопкой урона */
  if(needDodge.length===0&&needDmg.length>0){
    var dmgEntry=needDmg[0];var dmgId=dmgEntry[0];var dmgAtk=dmgEntry[1];
    var dmgNpc=spawned[dmgAtk.npcId];
    var isMagD=!!dmgAtk.magic;
    var dodgedNpc=(dmgAtk.dodgeRoll||0)>=(dmgAtk.hitRoll||0);
    function doNpcDmg(){
      if(!dmgNpc)return;
      var aimed=!!dmgAtk.aimedZone;var zoneD=aimed?0:r1(6);var zoneObj=aimed?zoneByName(dmgAtk.aimedZone):ZONES[zoneD-1];var zoneRoll=aimed?"🎯прицел":"1d6="+zoneD;
      var m=(dmgAtk.dmgDice||"1d6").match(/(\d+)d(\d+)/);if(!m)return;
      var dice=rN(parseInt(m[1]),parseInt(m[2]));
      var critM=dmgAtk.atkCrit?1.5:1;
      var rawDmg=Math.floor((sm(dice)+(dmgAtk.dmgBonus||0))*critM);
      var multiplied=Math.floor(rawDmg*zoneObj.mult);
      var npcArmorType=zoneObj.slot==="head"?(dmgNpc.armorHead||"none"):(dmgNpc.armorBody||"none");
      var npcArmorHp=zoneObj.slot==="head"?(dmgNpc.armorHeadHp||0):(dmgNpc.armorBodyHp||0);
      if(npcArmorHp<=0)npcArmorType="none";
      var ae=zoneObj.ignoreArmor?{ad:0,hd:multiplied,desc:"🔓"+zoneObj.name+"×"+zoneObj.mult}:calcAE(npcArmorType,dmgAtk.dmgType||"Р",multiplied);
      var newNpcHp=Math.max(0,(dmgNpc.hp||0)-ae.hd);
      var updNpc=Object.assign({},dmgNpc,{hp:newNpcHp});
      if(ae.ad>0){if(zoneObj.slot==="head")updNpc.armorHeadHp=Math.max(0,(dmgNpc.armorHeadHp||0)-ae.ad);else updNpc.armorBodyHp=Math.max(0,(dmgNpc.armorBodyHp||0)-ae.ad);}
      var spAll=Object.assign({},spawned);spAll[dmgAtk.npcId]=updNpc;saveSpawned(spAll);
      addLog({who:dmgAtk.attackerName,type:"dmg",label:"💥 "+dmgAtk.weaponName+" → "+dmgAtk.npcName+" ["+zoneObj.e+zoneObj.name+"] "+ae.hd+" HP",detail:zoneRoll+" "+zoneObj.name+" | "+ae.desc+" | ❤️ "+(dmgNpc.hp||0)+"→"+newNpcHp,total:ae.hd});
      onRoll&&onRoll({label:dmgAtk.attackerName+" 💥 Урон",d10:null,parts:[{label:dmgAtk.dmgDice||"1d6",value:sm(dice)},{label:"Бнс",value:dmgAtk.dmgBonus||0}],total:rawDmg,subtext:zoneObj.e+" "+zoneObj.name+" ×"+zoneObj.mult+(zoneObj.ignoreArmor?" 🔓":"")+"\n"+ae.desc+"\n→ "+dmgAtk.npcName+": "+(dmgNpc.hp||0)+"→"+newNpcHp+" HP"});
      remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+dmgId));
    }
    function skipNpcDmg(){remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+dmgId));}
    return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,animation:"fadeIn 0.2s"}}>
      <div style={{background:"#221e17",border:"3px solid "+(dodgedNpc?"#10b981":"#ef4444"),borderRadius:16,padding:"18px 22px",textAlign:"center",minWidth:270,maxWidth:350,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"popIn 0.3s"}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:2}}><button onClick={skipNpcDmg} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#a89a82"}}>✕</button></div>
        <div style={{fontSize:24,marginBottom:4}}>{dodgedNpc?"🛡️":"💥"}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:14,color:dodgedNpc?"#34d399":"#dc2626",marginBottom:8}}>{dmgAtk.attackerName+" vs "+dmgAtk.npcName}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:10}}>
          <div style={{textAlign:"center",background:"#2a1414",borderRadius:8,padding:"6px 14px"}}><div style={{fontSize:8,color:"#9a8f7c",marginBottom:1}}>{isMagD?"Чудо":"Атака"}</div><div style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:26,color:"#ef4444"}}>{dmgAtk.hitRoll}</div></div>
          <div style={{fontSize:15,color:"#a89a82",fontWeight:700,alignSelf:"center"}}>vs</div>
          <div style={{textAlign:"center",background:"#0e2018",borderRadius:8,padding:"6px 14px"}}><div style={{fontSize:8,color:"#9a8f7c",marginBottom:1}}>{isMagD?"Сопрот.":"Уклонение"}</div><div style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:26,color:"#10b981"}}>{dmgAtk.dodgeRoll||0}</div></div>
        </div>
        <div style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13,color:dodgedNpc?"#34d399":"#f87171",marginBottom:10}}>{dodgedNpc?(isMagD?"✨ NPC устоял!":"✅ NPC уклонился!"):"❌ Попало!"}</div>
        {dodgedNpc
          ?<button onClick={skipNpcDmg} style={{width:"100%",padding:8,borderRadius:8,border:"none",background:"#10b981",color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:13,cursor:"pointer"}}>✅ Закрыть</button>
          :<div style={{marginTop:4,padding:"8px",background:isMagD?"#1f1330":"#2a1414",borderRadius:8,fontSize:10,color:"#a89a82",fontStyle:"italic",textAlign:"center"}}>{isMagD?"✨ Игрок бросает урон чуда...":"⚔️ Игрок бросает урон..."}</div>
        }
      </div>
    </div>);
  }
  if(needDodge.length===0)return null;
  var entry=needDodge[0];var id=entry[0];var atk=entry[1];
  var npc=spawned[atk.npcId];
  var isMag=!!atk.magic;
  function doDodge(){
    if(!npc)return;
    var st=npc.stats||{};var sk=npc.skills||{};
    var R=rollHit();var d=R.d;
    var dv=isMag?(st.WILL||0):(st.DEX||0);
    var dg=isMag?(sk.mresist||0):(sk.dodge||0);
    var t=d+dv+dg;
    var det=isMag?("d10("+d+")+WILL("+dv+")+M.Resist("+dg+")="+t):("d10("+d+")+DEX("+dv+")+Dodge("+dg+")="+t);
    var dodged=t>=atk.hitRoll;
    update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{dodgeRoll:t,status:dodged?"done":"pending_dmg",dodgeDetail:det});
    addLog({who:npc.name,type:isMag?"magic":"dodge",label:(isMag?(dodged?"✨ Устоял против чуда — ":"❌ Не устоял против чуда — "):(dodged?"✅ Уклонился от ":"❌ Не уклонился от "))+atk.attackerName,detail:det+" vs "+atk.hitRoll,total:t});
    /* onRoll убран — результат показывается в PlayerAttackStatus у игрока */
  }
  function acceptHit(){
    update(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id),{dodgeRoll:0,status:"pending_dmg"});
  }
  var atkD2=atk.atkD||"?";var atkREF2=atk.atkREF||0;var atkStat2=atk.atkStatName||"REF";var atkSkill2=atk.atkSkill||0;var atkBonus2=atk.atkBonus||0;var atkSkillName2=atk.atkSkillName||"Навык";
  var npcDex=npc?(npc.stats||{}).DEX||0:0;var npcDodge=npc?(npc.skills||{}).dodge||0:0;
  var npcWill=npc?(npc.stats||{}).WILL||0:0;var npcMR=npc?(npc.skills||{}).mresist||0:0;
  var accent=isMag?"#a78bfa":"#3b82f6";
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,animation:"fadeIn 0.2s"}}>
    <div style={{background:"#221e17",border:"3px solid "+accent,borderRadius:16,padding:"18px 22px",textAlign:"center",minWidth:270,maxWidth:350,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"popIn 0.3s"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:2}}><button onClick={acceptHit} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#a89a82",lineHeight:1}}>✕</button></div>
      {needDodge.length>1&&<div style={{fontSize:9,color:"#a89a82",marginBottom:4}}>{"Атака 1 из "+needDodge.length}</div>}
      <div style={{fontSize:24,marginBottom:4}}>{isMag?"✨":"🎯"}</div>
      <div style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:15,color:isMag?"#a78bfa":"#60a5fa",marginBottom:8}}>{atk.attackerName+(isMag?" творит чудо на ":" атакует ")+atk.npcName+"!"}</div>
      {isMag&&atk.castIntent&&<div style={{fontSize:10,color:"#a78bfa",fontStyle:"italic",marginBottom:8,padding:"4px 8px",background:"#1f1330",borderRadius:7}}>«{atk.castIntent}»</div>}
      {/* Бросок атаки с деталями */}
      <div style={{background:"#262219",border:"1px solid #322d24",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
        <div style={{fontSize:8,color:"#9a8f7c",marginBottom:4}}>Бросок на попадание</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,flexWrap:"wrap",marginBottom:6}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:900,color:atkD2===10?"#d97706":atkD2===1?"#dc2626":"#3b82f6"}}>{"🎲"+atkD2}</span>
          <span style={{color:"#a89a82"}}>+</span>
          <span style={{background:"#2c2820",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#a89a82",fontSize:7,display:"block"}}>{atkStat2}</span><span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700}}>{atkREF2}</span></span>
          <span style={{color:"#a89a82"}}>+</span>
          <span style={{background:"#2c2820",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#a89a82",fontSize:7,display:"block"}}>{atkSkillName2}</span><span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700}}>{atkSkill2}</span></span>
          {atkBonus2!==0&&<span style={{color:"#a89a82"}}>+</span>}
          {atkBonus2!==0&&<span style={{background:"#2c2820",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#a89a82",fontSize:7,display:"block"}}>Бнс</span><span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700}}>{atkBonus2}</span></span>}
        </div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:32,fontWeight:900,color:"#60a5fa"}}>{"= "+atk.hitRoll}</div>
        {atk.atkCrit&&<div style={{fontSize:11,color:"#d97706",fontWeight:700}}>🌟 КРИТ ×1.5</div>}{atk.atkFumble&&<div style={{fontSize:11,color:"#dc2626",fontWeight:700}}>💀 ПРОВАЛ</div>}
        <div style={{fontSize:9,color:"#a89a82",marginTop:2}}>{(atk.weaponName||"")+(atk.dmgType?" · "+atk.dmgType:"")}</div>
      </div>
      {/* Защита NPC */}
      <div style={{background:"#262219",border:"1px solid "+(isMag?"#a78bfa40":"#322d24"),borderRadius:10,padding:"8px 12px",marginBottom:10}}>
        <div style={{fontSize:8,color:"#9a8f7c",marginBottom:4}}>{isMag?("✨ Сопротивление чуду "+atk.npcName):("Уклонение "+atk.npcName)}</div>
        <div style={{fontSize:9,color:"#a89a82",marginBottom:6}}>{isMag?("d10 + WILL("+npcWill+") + Miracle Resist("+npcMR+")"):("d10 + DEX("+npcDex+") + Dodge("+npcDodge+")")}</div>
        <button onClick={doDodge} style={{width:"100%",padding:"10px",borderRadius:9,border:"none",background:isMag?"#7c3aed":"#10b981",color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:14,cursor:"pointer"}}>{isMag?"✨ Бросить Miracle Resist!":"🛡️ Бросить уклонение!"}</button>
      </div>
      <button onClick={acceptHit} style={{width:"100%",padding:6,borderRadius:7,border:"2px solid "+accent+"40",background:"none",color:"#a89a82",fontWeight:700,fontSize:10,cursor:"pointer"}}>{isMag?"Принять чудо без сопротивления":"Принять удар без уклонения"}</button>
    </div>
  </div>)}

/* ── DamagePopup — показывается игроку при получении урона ── */

export default PlayerAttackNotif;
