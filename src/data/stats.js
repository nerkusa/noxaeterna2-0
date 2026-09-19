var SD=[{key:"INT",full:"Интеллект",color:"#6366f1",emoji:"🧠"},{key:"PRC",full:"Восприятие",color:"#06b6d4",emoji:"👁️"},{key:"REF",full:"Рефлексы",color:"#f59e0b",emoji:"⚡"},{key:"DEX",full:"Ловкость",color:"#10b981",emoji:"🏹"},{key:"BODY",full:"Тело",color:"#ef4444",emoji:"💪"},{key:"EMP",full:"Эмпатия",color:"#ec4899",emoji:"💜"},{key:"CRA",full:"Крафт",color:"#f97316",emoji:"🔨"},{key:"WILL",full:"Воля",color:"#8b5cf6",emoji:"🔥"}];
var SKD={INT:[{name:"Уличные знания",x2:false},{name:"Знания",x2:false},{name:"Азартные игры",x2:false},{name:"Оккультизм",x2:true},{name:"Расследование",x2:true},{name:"Медицина",x2:true}],PRC:[{name:"Внимательность",x2:false},{name:"Выживание",x2:true},{name:"Навигация",x2:false},{name:"Слежка",x2:false},{name:"Первая помощь",x2:true}],REF:[{name:"Боевое оружие",x2:true},{name:"Простое оружие",x2:false},{name:"Огнестрельное оружие",x2:true},{name:"Стрельба",x2:true},{name:"Метательное оружие",x2:true}],DEX:[{name:"Акробатика",x2:false},{name:"Ловкость рук",x2:true},{name:"Скрытность",x2:true},{name:"Уклонение",x2:true},{name:"Взлом замков",x2:false},{name:"Верховая езда",x2:false}],BODY:[{name:"Рукопашный бой",x2:true},{name:"Сопротивление",x2:false},{name:"Атлетика",x2:false},{name:"Запугивание",x2:false}],EMP:[{name:"Убеждение",x2:true},{name:"Обман",x2:false},{name:"Выступление",x2:false},{name:"Обольщение",x2:true},{name:"Проницательность",x2:false},{name:"Этикет",x2:true}],CRA:[{name:"Алхимия",x2:false},{name:"Кузнечное дело",x2:true},{name:"Механика",x2:false}],WILL:[{name:"Чародейство",x2:true},{name:"Сопротивление магии",x2:true},{name:"Самообладание",x2:true},{name:"Чутьё на чудеса",x2:true}]};
var WS={Battle:"Боевое оружие",Simple:"Простое оружие",Guns:"Огнестрельное оружие",Archery:"Стрельба",Thrown:"Метательное оружие",Brawl:"Рукопашный бой"};var DT=["К","Р","Д","С","П"];var WT=["Battle","Simple","Guns","Archery","Thrown","Brawl"];
/* Характеристика для броска на попадание по типу оружия (рукопашка — от BODY, метательное и остальное — от REF) */
var WSTAT={Brawl:"BODY"};function wStat(t){return WSTAT[t]||"REF"}
/* Человекочитаемые названия типов оружия */
var WT_LABEL={Battle:"Боевое",Simple:"Простое",Guns:"Огнестрел",Archery:"Лук",Thrown:"Метательное",Brawl:"Рукопашный"};function wtLabel(t){return WT_LABEL[t]||t}
/* Переопределения отображаемых имён навыков — сам навык в SKD/skills персонажа
   остаётся "Чародейство"/"Сопротивление магии" (иначе у всех уже созданных
   персонажей слетели бы вложенные туда очки), а на экране показываем новое
   название. */
var SK_LABEL={"Чародейство":"Чудотворство","Сопротивление магии":"Сопротивление чудотворству"};
function skLabel(n){return SK_LABEL[n]||n}

export { SD, SKD, WS, DT, WT, SK_LABEL, skLabel, WSTAT, wStat, WT_LABEL, wtLabel };
