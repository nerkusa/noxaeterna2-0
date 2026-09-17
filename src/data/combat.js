var ZONES=[{r:1,name:"Голова",mult:3,e:"🧠",slot:"head",ignoreArmor:false},{r:2,name:"Шея",mult:2,e:"🫁",slot:"head",ignoreArmor:false},{r:3,name:"Торс",mult:1,e:"🫀",slot:"body",ignoreArmor:false},{r:4,name:"Руки",mult:1,e:"💪",slot:"body",ignoreArmor:false},{r:5,name:"Пах",mult:2,e:"⚠️",slot:"body",ignoreArmor:true},{r:6,name:"Ноги",mult:1,e:"🦵",slot:"body",ignoreArmor:false}];
var ARMOR_T=[{id:"none",name:"Нет",bodyReq:0,desc:""},{id:"light",name:"Лёгкая",bodyReq:4,desc:"К:25%бр/50%HP · Р:50%/50% · Д:полн · С:полн · П:полн"},{id:"medium",name:"Средняя",bodyReq:6,desc:"К:25%бр/50%HP · Р:50%/50% · Д:полн · С:бр полн/HP½ · П:полн"},{id:"heavy",name:"Тяжёлая",bodyReq:8,desc:"К:25%бр/50%HP · Р:50%/50% · Д:полн · С:½бр/HP блок · П:полн"}];

/* Штраф к попаданию за прицельный удар по конкретной зоне */
var AIM_PEN={"Голова":6,"Шея":4,"Пах":4,"Торс":2,"Руки":2,"Ноги":2};
function aimPen(n){return AIM_PEN[n]!==undefined?AIM_PEN[n]:2}
function zoneByName(n){return ZONES.find(function(z){return z.name===n})||ZONES[2]}

/* Прочность оружия (ячейки) по типу */
var WEAP_DUR={Battle:30,Simple:20,Guns:20,Archery:20,Brawl:0};
function weapDur(t){return WEAP_DUR[t]!==undefined?WEAP_DUR[t]:20}
/* Какие типы брони «ломают» оружие данного типа урона (при попадании + антикрите) */
var BREAK_VS={"К":["light","medium","heavy"],"Р":["medium","heavy"],"Д":["heavy"]};
function breaksVs(dmgType,armorType){var a=BREAK_VS[dmgType];return !!(a&&a.indexOf(armorType)>=0)}

export { ZONES, ARMOR_T, AIM_PEN, aimPen, zoneByName, WEAP_DUR, weapDur, BREAK_VS, breaksVs };
