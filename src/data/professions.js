var PROFS=[{id:"none",name:"— Нет —",ab:"",abN:"",pS:[],pSk:[]},{id:"merchant",name:"Купец",ab:"+5 Charisma/день",abN:"Мастер Обмена",pS:["EMP","INT"],pSk:["Charisma","Deception","Streetwise","Gambling","Ride-Drive"]},{id:"warrior",name:"Воин",ab:"+5 атака/день",abN:"Стойкость",pS:["REF","BODY"],pSk:["Battle Weapon","Resistance","Athletics","Dodge","Simple Weapon"]},{id:"priest",name:"Священник",ab:"Воля Судьбы",abN:"Воля Судьбы",pS:["WILL","EMP"],pSk:["Spellcasting","Performance","Lore","Magic Resist","Charisma"]},{id:"artisan",name:"Ремесленник",ab:"Оценка механизмов",abN:"Рука Мастера",pS:["CRA","INT"],pSk:["Blacksmithing","Tinkering","Alchemy","Jewel Crafting","Lore"]},{id:"sensitive",name:"Чудотворец",ab:"+1d6 урона",abN:"Хаот. Всплеск",pS:["WILL","EMP"],pSk:["Spellcasting","Magic Resist","Awareness","Lore","Performance"]}];
var PROF_DESC={
  none:{desc:"",abilityDesc:""},
  merchant:{desc:"Мастер торговли, процветающий на рынках Аэтериона и караванных путях Торгового Союза.",abilityDesc:"Один раз в день: +5 к Charisma для выторговывания редких товаров или информации.",abilityType:"roll_charisma"},
  warrior:{desc:"Непреклонный боец, закалённый в битвах Железных Холмов или дуэлях Южных Герцогств.",abilityDesc:"Один раз в день: +5 к атаке в одном ходу.",abilityType:"bonus_attack"},
  priest:{desc:"Духовный наставник, чтящий традиции без обращения к богам. Вдохновляет песнями и ритуалами.",abilityDesc:"«Что вершит судьбу человечества в этом мире? Некое незримое существо или закон, подобно Длани Господней, парящей над миром? По крайней мере истинно то, что человек не властен даже над своей волей.»",abilityType:"flavor"},
  artisan:{desc:"Искусный творец аркебуз, механизмов и инструментов в кузницах Мелких Королевств.",abilityDesc:"Мгновенно оцените и улучшите любой механизм или оружие, отражая гордость за наследие.",abilityType:"check"},
  sensitive:{desc:"Интуитивный искатель, чувствующий скрытые энергии природы. Использует хаотическую магию.",abilityDesc:"+1d6 урона к заклинаниям. Действует до первой неудачи, затем вызывает диссонанс.",abilityType:"toggle"}
};

export { PROFS, PROF_DESC };
