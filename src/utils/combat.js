import { ZONES } from '../data/combat';

/* ── calcAE: урон по броне/HP по типу урона ── */
/* Голова(×3) и Пах(×2) ignoreArmor — броня не считается, урон идёт напрямую в HP с множителем */
function calcAE(at,dt,rd){
  /* at=тип брони, dt=тип урона (К/Р/Д/С/П), rd=урон после множителя зоны */
  if(at==="none")return{ad:0,hd:rd,desc:"Без брони → HP:"+rd};
  /* К Колющий: 25% по броне, 50% по HP — все типы брони одинаково */
  if(dt==="К"){var ab=Math.floor(rd*0.25);var hb=Math.floor(rd*0.5);return{ad:ab,hd:hb,desc:"К: бр−"+ab+", HP−"+hb}}
  /* Р Режущий: 50% по броне, 50% по HP — все типы брони */
  if(dt==="Р"){var ab2=Math.floor(rd*0.5);var hb2=Math.floor(rd*0.5);return{ad:ab2,hd:hb2,desc:"Р: бр−"+ab2+", HP−"+hb2}}
  /* Д Дробящий: полный урон и по броне и по HP */
  if(dt==="Д"){return{ad:rd,hd:rd,desc:"Д: бр−"+rd+", HP−"+rd}}
  /* С Стрела: зависит от типа брони */
  if(dt==="С"){
    if(at==="light"){return{ad:rd,hd:rd,desc:"С+лёгк: бр−"+rd+", HP−"+rd}}
    if(at==="medium"){var hm=Math.floor(rd*0.5);return{ad:rd,hd:hm,desc:"С+средн: бр−"+rd+", HP−"+hm}}
    if(at==="heavy"){var ah=Math.floor(rd*0.5);return{ad:ah,hd:0,desc:"С+тяж: бр−"+ah+", HP блок"}}
  }
  /* П Пуля: полный урон и по броне и по HP */
  if(dt==="П"){return{ad:rd,hd:rd,desc:"П: бр−"+rd+", HP−"+rd}}
  return{ad:0,hd:rd,desc:"→HP:"+rd}
}

/* ── applyDmgToNpc: применить урон к заспавненному NPC ── */
function applyDmgToNpc(npc,rawDmg,dmgType,zoneName,saveSpawnedFn,spawnedAll,npcId,addLog,who,onNpcDeath,srcLabel,broadcast){
  var z=ZONES.find(function(x){return x.name===zoneName})||ZONES[2];
  var multiplied=Math.floor(rawDmg*z.mult);
  var ignArmor=z.ignoreArmor;
  /* Определяем броню по слоту зоны */
  var armorType="none",armorHp=0,armorMaxHp=0,armorHpKey="",armorName="";
  if(z.slot==="head"){
    armorType=npc.armorHead||"none";
    armorHp=npc.armorHeadHp||0;
    armorMaxHp=npc.armorHeadMaxHp||armorHp;
    armorHpKey="armorHeadHp";
    armorName=npc.armorHead||"";
  } else {
    armorType=npc.armorBody||"none";
    armorHp=npc.armorBodyHp||0;
    armorMaxHp=npc.armorBodyMaxHp||armorHp;
    armorHpKey="armorBodyHp";
    armorName=npc.armorBody||"";
  }
  var ae;
  if(ignArmor){
    /* Голова/Пах игнорируют броню полностью */
    ae={ad:0,hd:multiplied,desc:"🔓 "+z.name+" ×"+z.mult+" (игнор брони) → HP−"+multiplied};
  } else {
    ae=calcAE(armorType,dmgType,multiplied);
  }
  /* Если броня уже сломана (hp=0) весь урон идёт в HP */
  if(!ignArmor&&armorType!=="none"&&armorHp<=0){
    ae={ad:0,hd:multiplied,desc:"Броня сломана → HP−"+multiplied};
  }
  var newArmorHp=Math.max(0,armorHp-ae.ad);
  var curHp=npc.hp!==undefined?npc.hp:(npc.maxHp||0);
  var newHp=Math.max(0,curHp-ae.hd);
  var upd=Object.assign({},npc,{hp:newHp});
  if(armorHpKey&&ae.ad>0)upd[armorHpKey]=newArmorHp;
  var sp=Object.assign({},spawnedAll);sp[npcId]=upd;
  saveSpawnedFn(sp);
  addLog({
    who:who,type:"dmg_npc",
    label:"💥 "+npc.name+" ["+z.e+z.name+" ×"+z.mult+"] "+dmgType,
    detail:ae.desc+(ae.ad>0?" | "+armorName+" "+armorHp+"→"+newArmorHp:"")+" | ❤️ "+curHp+"→"+newHp,
    total:ae.hd
  });
  if(broadcast){broadcast({attackerName:who,srcLabel:srcLabel||"",npcName:npc.name,zone:z.name,zoneE:z.e,zoneMult:z.mult,dmgType:dmgType,dmg:ae.hd,oldHp:curHp,newHp:newHp,desc:ae.desc,ts:Date.now()});}
  if(newHp<=0&&onNpcDeath){onNpcDeath({npcName:npc.name});}
}

export { calcAE, applyDmgToNpc };
