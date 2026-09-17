var SD=[{key:"INT",full:"Интеллект",color:"#6366f1",emoji:"🧠"},{key:"REF",full:"Рефлексы",color:"#f59e0b",emoji:"⚡"},{key:"DEX",full:"Ловкость",color:"#10b981",emoji:"🏹"},{key:"BODY",full:"Тело",color:"#ef4444",emoji:"💪"},{key:"EMP",full:"Эмпатия",color:"#ec4899",emoji:"💜"},{key:"CRA",full:"Крафт",color:"#f97316",emoji:"🔨"},{key:"WILL",full:"Воля",color:"#8b5cf6",emoji:"🔥"}];
var SKD={INT:[{name:"Awareness",x2:false},{name:"Teaching",x2:true},{name:"Streetwise",x2:false},{name:"Lore",x2:false},{name:"Gambling",x2:false},{name:"Wilderness Survival",x2:false},{name:"Navigating",x2:false}],REF:[{name:"Battle Weapon",x2:true},{name:"Simple Weapon",x2:false},{name:"Guns",x2:true},{name:"Archery",x2:true}],DEX:[{name:"Acrobatics",x2:false},{name:"Ride-Drive",x2:false},{name:"Sleight of Hands",x2:false},{name:"Stealth",x2:false},{name:"Dodge",x2:true}],BODY:[{name:"Brawl",x2:false},{name:"Resistance",x2:false},{name:"Athletics",x2:false},{name:"Swimming",x2:false}],EMP:[{name:"Charisma",x2:false},{name:"Deception",x2:false},{name:"Performance",x2:false},{name:"Seduction",x2:true}],CRA:[{name:"Alchemy",x2:false},{name:"Blacksmithing",x2:false},{name:"Jewel Crafting",x2:true},{name:"Tinkering",x2:true}],WILL:[{name:"Spellcasting",x2:true},{name:"Magic Resist",x2:true}]};
var WS={Battle:"Battle Weapon",Simple:"Simple Weapon",Guns:"Guns",Archery:"Archery",Brawl:"Brawl"};var DT=["К","Р","Д","С","П"];var WT=["Battle","Simple","Guns","Archery","Brawl"];
/* Характеристика для броска на попадание по типу оружия (рукопашка — от BODY) */
var WSTAT={Brawl:"BODY"};function wStat(t){return WSTAT[t]||"REF"}
/* Человекочитаемые названия типов оружия */
var WT_LABEL={Battle:"Боевое",Simple:"Простое",Guns:"Огнестрел",Archery:"Лук",Brawl:"Рукопашный"};function wtLabel(t){return WT_LABEL[t]||t}
/* Отображаемые имена навыков (внутренние ключи не меняем, чтобы не ломать данные) */
var SK_LABEL={Spellcasting:"Miracle","Magic Resist":"Miracle Resist"};
function skLabel(n){return SK_LABEL[n]||n}

export { SD, SKD, WS, DT, WT, SK_LABEL, skLabel, WSTAT, wStat, WT_LABEL, wtLabel };
