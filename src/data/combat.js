var ZONES=[{r:1,name:"Голова",mult:3,e:"🧠",slot:"head",ignoreArmor:false},{r:2,name:"Шея",mult:2,e:"🫁",slot:"head",ignoreArmor:false},{r:3,name:"Торс",mult:1,e:"🫀",slot:"body",ignoreArmor:false},{r:4,name:"Руки",mult:1,e:"💪",slot:"body",ignoreArmor:false},{r:5,name:"Пах",mult:2,e:"⚠️",slot:"body",ignoreArmor:true},{r:6,name:"Ноги",mult:1,e:"🦵",slot:"body",ignoreArmor:false}];
/* penalty: штрафы «если экипировано». bodyDodge/headDodge — к Уклонению
   (складываются в навык, действуют на все броски уклонения). bodyDodgeGate —
   штраф к корпусной броне действует, только если BODY у персонажа ≤ значения
   (иначе персонаж достаточно силён и штрафа нет). headAtk — штраф к каждому
   броску атаки (шлем мешает целиться), не завязан на характеристику. */
var ARMOR_T=[
  {id:"none",name:"Нет",bodyReq:0,desc:"",penalty:{bodyDodge:0,headDodge:0,headAtk:0}},
  {id:"light",name:"Лёгкая",bodyReq:4,desc:"К:25%бр/50%HP · Р:50%/50% · Д:полн · С:полн · П:полн",penalty:{bodyDodge:0,headDodge:0,headAtk:0}},
  {id:"medium",name:"Средняя",bodyReq:6,desc:"К:25%бр/50%HP · Р:50%/50% · Д:полн · С:бр полн/HP½ · П:полн",penalty:{bodyDodge:3,headDodge:1,headAtk:0}},
  {id:"heavy",name:"Тяжёлая",bodyReq:8,desc:"К:25%бр/50%HP · Р:50%/50% · Д:полн · С:½бр/HP блок · П:полн",penalty:{bodyDodge:5,bodyDodgeGate:8,headDodge:2,headAtk:3}},
];
/* Щиты — тоже штрафуют Уклонение при экипировке, тяжелее щит — больше штраф. */
var SHIELD_T=[
  {id:"light",name:"Лёгкий",absorb:0.5,bodyReq:4,dodgePen:0},
  {id:"medium",name:"Средний",absorb:0.75,bodyReq:6,dodgePen:1},
  {id:"tower",name:"Башенный",absorb:1.0,bodyReq:8,dodgePen:2},
];

/* Штраф к попаданию за прицельный удар по конкретной зоне */
var AIM_PEN={"Голова":6,"Шея":4,"Пах":4,"Торс":2,"Руки":2,"Ноги":2};
function aimPen(n){return AIM_PEN[n]!==undefined?AIM_PEN[n]:2}
function zoneByName(n){return ZONES.find(function(z){return z.name===n})||ZONES[2]}

/* Прочность оружия (ячейки) по типу */
var WEAP_DUR={Battle:30,Simple:20,Guns:20,Archery:20,Thrown:15,Brawl:0};
function weapDur(t){return WEAP_DUR[t]!==undefined?WEAP_DUR[t]:20}
/* Какие типы брони «ломают» оружие данного типа урона (при попадании + антикрите) */
var BREAK_VS={"К":["light","medium","heavy"],"Р":["medium","heavy"],"Д":["heavy"]};
function breaksVs(dmgType,armorType){var a=BREAK_VS[dmgType];return !!(a&&a.indexOf(armorType)>=0)}
/* Урон, который атака наносит собственному оружию: антикрит (провал) −5,
   любое другое попадание −1. */
function weaponWear(fumble){return fumble?5:1}

/* ── Штрафы от надетой брони/шлема/щита — считаются от снаряжения персонажа ── */
function armorPenaltyOf(c,finalStats){
  var out={dodge:0,atk:0};
  var armors=c.armors||[];
  var head=armors.find(function(a){return a.id===c.equippedHead});
  var body=armors.find(function(a){return a.id===c.equippedBody});
  if(head){var ht=ARMOR_T.find(function(a){return a.id===head.type});if(ht&&ht.penalty){out.dodge-=ht.penalty.headDodge||0;out.atk-=ht.penalty.headAtk||0;}}
  if(body){var bt=ARMOR_T.find(function(a){return a.id===body.type});if(bt&&bt.penalty){var gate=bt.penalty.bodyDodgeGate;var bodyStat=(finalStats&&finalStats.BODY)||0;if(!gate||bodyStat<=gate)out.dodge-=bt.penalty.bodyDodge||0;}}
  var shields=c.shields||[];var sh=shields.find(function(s){return s.id===c.equippedShield});
  if(sh){var st=SHIELD_T.find(function(s){return s.id===sh.type});if(st)out.dodge-=st.dodgePen||0;}
  return out;
}
/* Штраф к урону от ран: 70-100% ХП — без штрафа, 50-70% — −3, ниже 50% — −5 */
function woundDmgPenalty(curHp,maxHp){
  if(!(maxHp>0))return 0;
  var pct=(curHp/maxHp)*100;
  if(pct<50)return 5;
  if(pct<70)return 3;
  return 0;
}

export { ZONES, ARMOR_T, SHIELD_T, AIM_PEN, aimPen, zoneByName, WEAP_DUR, weapDur, BREAK_VS, breaksVs, weaponWear, armorPenaltyOf, woundDmgPenalty };
