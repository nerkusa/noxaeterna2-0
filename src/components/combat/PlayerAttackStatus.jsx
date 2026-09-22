import React from 'react';
import { db, ref, remove } from '../../firebase';
import { ZONES, SHIELD_T, zoneByName } from '../../data/combat';
import { calcAE } from '../../utils/combat';
import { r1, rN, sm } from '../../utils/dice';
import PendingAttackPopup from './PendingAttackPopup';

function PlayerAttackStatus(pr){
  var attacks=pr.attacks||{};
  var myName=pr.myName;var myId=pr.myId;var spawned=pr.spawned||{};var saveSpawned=pr.saveSpawned;var addLog=pr.addLog;var onRoll=pr.onRoll;
  /* Ищем атаки от этого игрока которые ещё не закрыты */
  /* Ищем по myId — attackerId записывается при создании атаки */
  var mine=Object.entries(attacks).filter(function(e){
    return e[1].fromPlayer&&(e[1].attackerId===myId||(e[1].attackerName&&e[1].attackerName===myName))&&(e[1].status==="pending_dodge"||e[1].status==="pending_dmg"||e[1].status==="pending_shield");
  });
  if(mine.length===0)return null;
  var entry=mine[0];var id=entry[0];var atk=entry[1];
  var waiting=atk.status==="pending_dodge";var shieldPhaseGM=atk.status==="pending_shield";
  var dodged=atk.status==="dodged";
  var atkD=atk.atkD||"?";var atkREF=atk.atkREF||0;var atkStat=atk.atkStatName||"REF";var atkSkill=atk.atkSkill||0;
  var atkBonus=atk.atkBonus||0;var atkSkillName=atk.atkSkillName||"Навык";
  var dodgeDetail=atk.dodgeDetail||"";
  var isMag=!!atk.magic;
  var isFear=!!atk.fear;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:997,animation:"fadeIn 0.2s"}}>
    <div style={{background:"#161826",border:"3px solid "+(waiting?"#f59e0b":dodged?"#10b981":shieldPhaseGM?"#38bdf8":isFear?"#f472b6":isMag?"#a78bfa":"#ef4444"),borderRadius:16,padding:"18px 22px",textAlign:"center",minWidth:270,maxWidth:350,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"popIn 0.3s"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:2}}>{waiting&&<button onClick={function(){remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));}} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#75798c",lineHeight:1}} title="Отменить атаку">✕</button>}</div>
      <div style={{fontSize:24,marginBottom:4}}>{isFear?"😨":isMag?"✨":"🎯"}</div>
      <div style={{fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:15,color:isFear?"#f472b6":isMag?"#a78bfa":"#60a5fa",marginBottom:8}}>{(isFear?"Ты пытаешься устрашить ":isMag?"Ты творишь чудо на ":"Ты атакуешь ")+atk.npcName+"!"}</div>
      {/* Бросок атаки */}
      <div style={{background:"#232532",border:"1px solid #34374a",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
        <div style={{fontSize:8,color:"#9397ab",marginBottom:4}}>Твой бросок на попадание</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,flexWrap:"wrap",marginBottom:6}}>
          <span style={{fontFamily:"'Inter',sans-serif",fontSize:20,fontWeight:900,color:atkD===10?"#d97706":atkD===1?"#dc2626":"#3b82f6"}}>{"🎲"+atkD}</span>
          <span style={{color:"#9397ab"}}>+</span>
          <span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>{atkStat}</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkREF}</span></span>
          <span style={{color:"#9397ab"}}>+</span>
          <span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>{atkSkillName}</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkSkill}</span></span>
          {atkBonus!==0&&<span style={{color:"#9397ab"}}>+</span>}
          {atkBonus!==0&&<span style={{background:"#2b2e40",borderRadius:5,padding:"2px 6px",textAlign:"center"}}><span style={{color:"#9397ab",fontSize:7,display:"block"}}>Бнс</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700}}>{atkBonus}</span></span>}
        </div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:900,color:"#60a5fa"}}>{"= "+atk.hitRoll}</div>
        {atk.atkCrit&&<div style={{fontSize:11,color:"#d97706",fontWeight:700}}>🌟 КРИТ ×1.5</div>}{atk.atkFumble&&<div style={{fontSize:11,color:"#dc2626",fontWeight:700}}>💀 ПРОВАЛ</div>}
        <div style={{fontSize:9,color:"#9397ab",marginTop:2}}>{(atk.weaponName||"")+(atk.dmgType?" · "+atk.dmgType:"")}</div>
      </div>
      {/* Уклонение NPC */}
      <div style={{background:"#232532",border:"1px solid "+(waiting?"#34374a":shieldPhaseGM?"#38bdf840":"#10b98140"),borderRadius:10,padding:"8px 12px"}}>
        <div style={{fontSize:8,color:"#9397ab",marginBottom:4}}>{(isFear?"Самообладание ":isMag?"Сопротивление чуду ":"Уклонение ")+atk.npcName}</div>
        {isFear
          ?<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"8px 0"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#f59e0b"}}/>
            <span style={{fontSize:12,color:"#75798c",fontStyle:"italic"}}>ГМ бросает Самообладание — итог в логе события</span>
          </div>
          :waiting
          ?<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"8px 0"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#f59e0b"}}/>
            <span style={{fontSize:12,color:"#75798c",fontStyle:"italic"}}>{isMag?"ГМ бросает Miracle Resist...":"ГМ бросает уклонение..."}</span>
          </div>
          :<div>
            {dodgeDetail&&<div style={{fontSize:9,color:"#9397ab",marginBottom:4}}>{dodgeDetail}</div>}
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:32,fontWeight:900,color:dodged?"#10b981":"#ef4444"}}>{atk.dodgeRoll||0}</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,color:dodged?"#34d399":"#f87171",marginTop:4}}>
              {dodged?(isMag?"✨ NPC устоял!":"✅ NPC уклонился!"):"❌ Попало!"}
            </div>
            {!dodged&&atk.status==="pending_dmg"&&(function(){
              var npc=spawned[atk.npcId];
              function doPlayerDmg(){
                if(!npc)return;
                var m=(atk.dmgDice||"1d6").match(/(\d+)d(\d+)/);if(!m)return;
                var dice=rN(parseInt(m[1]),parseInt(m[2]));
                var critM=atk.atkCrit?1.5:1;
                var rawDmg=Math.floor((sm(dice)+(atk.dmgBonus||0))*critM);
                var aimed=!!atk.aimedZone;var zoneD=aimed?0:r1(6);var zoneObj=aimed?zoneByName(atk.aimedZone):ZONES[zoneD-1];var zoneRoll=aimed?"🎯прицел":"1d6="+zoneD;
                var multiplied=Math.floor(rawDmg*zoneObj.mult);
                var npcArmorType=zoneObj.slot==="head"?(npc.armorHead||"none"):(npc.armorBody||"none");
                var npcArmorHp=zoneObj.slot==="head"?(npc.armorHeadHp||0):(npc.armorBodyHp||0);
                if(npcArmorHp<=0)npcArmorType="none";
                var ae=zoneObj.ignoreArmor?{ad:0,hd:multiplied,desc:"🔓"+zoneObj.name+"×"+zoneObj.mult}:calcAE(npcArmorType,atk.dmgType||"Р",multiplied);
                var shieldDmg=0,shieldDesc="";
                if(npc.shieldType&&npc.shieldType!=="none"&&(npc.shieldHp||0)>0){var shObj=SHIELD_T.find(function(t){return t.id===npc.shieldType});var absorb=shObj?shObj.absorb:0;shieldDmg=Math.floor(ae.hd*absorb);ae=Object.assign({},ae,{hd:Math.max(0,ae.hd-shieldDmg)});shieldDesc=" 🛡"+(npc.shieldName||(shObj?shObj.name:npc.shieldType))+" −"+shieldDmg;}
                var newNpcHp=Math.max(0,(npc.hp||0)-ae.hd);
                var updNpc=Object.assign({},npc,{hp:newNpcHp});
                if(shieldDmg>0)updNpc.shieldHp=Math.max(0,(npc.shieldHp||0)-shieldDmg);
                if(ae.ad>0){if(zoneObj.slot==="head")updNpc.armorHeadHp=Math.max(0,(npc.armorHeadHp||0)-ae.ad);else updNpc.armorBodyHp=Math.max(0,(npc.armorBodyHp||0)-ae.ad);}
                var spAll=Object.assign({},spawned);spAll[atk.npcId]=updNpc;
                if(saveSpawned)saveSpawned(spAll);
                if(addLog)addLog({who:atk.attackerName,type:"dmg",label:"💥 "+atk.weaponName+" → "+atk.npcName+" ["+zoneObj.e+zoneObj.name+"] "+ae.hd+" HP",detail:zoneRoll+" "+zoneObj.name+" | "+ae.desc+shieldDesc+" | ❤️ "+(npc.hp||0)+"→"+newNpcHp,total:ae.hd});
                if(pr.onRoll)pr.onRoll({label:atk.weaponName+" 💥 Урон",d10:null,parts:[{label:atk.dmgDice||"1d6",value:sm(dice)},{label:"Бнс",value:atk.dmgBonus||0}],total:rawDmg,subtext:"Тип: "+(atk.dmgType||"Р")+"\n"+zoneObj.e+" "+zoneObj.name+" ×"+zoneObj.mult+"\n→ "+atk.npcName+": "+(npc.hp||0)+"→"+newNpcHp+" HP"});
                if(pr.saveNpcHit)pr.saveNpcHit({attackerName:atk.attackerName,srcLabel:atk.weaponName||"",npcName:atk.npcName,zone:zoneObj.name,zoneE:zoneObj.e,zoneMult:zoneObj.mult,dmgType:atk.dmgType||"Р",dmg:ae.hd,oldHp:(npc.hp||0),newHp:newNpcHp,desc:ae.desc,ts:Date.now()});
                remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));
              }
              return(<div style={{marginTop:8}}>
                <button onClick={doPlayerDmg} style={{width:"100%",padding:10,borderRadius:8,border:"none",background:"#ef4444",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:14,cursor:"pointer"}}>💥 Бросить урон + зону!</button>
                <div style={{fontSize:9,color:"#9397ab",marginTop:4,textAlign:"center"}}>{atk.dmgDice+(atk.dmgBonus?"+"+atk.dmgBonus:"")+" · "+atk.dmgType}</div>
              </div>);
            })()}
            {!dodged&&atk.status==="pending_shield"&&<div style={{fontSize:10,color:"#38bdf8",marginTop:4,fontStyle:"italic",fontWeight:700}}>⏳ Ждём решения игрока...</div>}
            {dodged&&<button onClick={function(){remove(ref(db,"rooms/"+pr.room+"/pendingAttacks/"+id));}} style={{width:"100%",marginTop:8,padding:9,borderRadius:8,border:"none",background:"#10b981",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:900,fontSize:13,cursor:"pointer"}}>✅ Закрыть</button>}
          </div>
        }
      </div>
    </div>
  </div>)}

/* ── PendingAttackPopup — показывается игроку когда NPC атакует ── */

export default PlayerAttackStatus;
