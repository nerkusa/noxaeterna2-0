var RACES=[{id:"none",name:"— Нет —",st:{},sk:{},sp:null,fp:false,bsp:false},{id:"human",name:"Человек",st:{EMP:1},sk:{Streetwise:2,"Ride-Drive":1},sp:"+1 навык",fp:true,bsp:true},{id:"elf_sun",name:"Эльф (Солн.)",st:{WILL:1,INT:1,BODY:-1},sk:{Spellcasting:2,Lore:1,Performance:1},sp:null,fp:false,bsp:false},{id:"elf_wood",name:"Эльф (Лесн.)",st:{DEX:1,REF:1,WILL:-1},sk:{Archery:2,Stealth:1,"Wilderness Survival":1},sp:null,fp:false,bsp:false},{id:"dwarf_high",name:"Гном (Воит.)",st:{BODY:1,REF:1,EMP:-1},sk:{"Battle Weapon":2,Resistance:1},sp:null,fp:false,bsp:false},{id:"dwarf_deep",name:"Гном (Рем.)",st:{CRA:2,DEX:-1},sk:{Blacksmithing:2,"Jewel Crafting":1,Lore:1},sp:null,fp:false,bsp:false},{id:"dwarf_dark",name:"Гном (Тёмн.)",st:{INT:1,DEX:1,EMP:-2},sk:{Awareness:2,"Wilderness Survival":2},sp:"Слепота",fp:false,bsp:false},{id:"azgul",name:"Азгул",st:{BODY:2,WILL:-1,EMP:-1},sk:{Resistance:2,"Battle Weapon":1,Athletics:1},sp:null,fp:false,bsp:false},{id:"dragonborn",name:"Драконорожд.",st:{BODY:1,WILL:1,DEX:-1},sk:{"Battle Weapon":2,Resistance:1},sp:"Breath 1d8",fp:false,bsp:false},{id:"kobold",name:"Кобольд",st:{DEX:1,CRA:1,BODY:-2},sk:{Tinkering:2,Stealth:2,"Sleight of Hands":1},sp:null,fp:false,bsp:false},{id:"drow",name:"Дроу",st:{DEX:1,INT:1,EMP:-1},sk:{Alchemy:1,Spellcasting:1,Deception:1,Stealth:1},sp:null,fp:false,bsp:false}];
var RACE_DESC={
  none:"",
  human:"Жители Аэтернии, строители городов и создатели сложной феодальной иерархии. Адаптивные, амбициозные и дипломатичные.",
  elf_sun:"Древние, мудрые, живущие в изоляции и гармонии. Пацифисты, вынужденные защищаться.",
  elf_wood:"Отказавшиеся от магии ради физического совершенства и выживания. Жестокие, прагматичные охотники на драконов и детей мятежного бога.",
  dwarf_high:"Жители верхних уровней Карак-Зара. Милитаристы, стражи врат, ориентированные на оборону и торговлю оружием.",
  dwarf_deep:"Жители сердца горы. Хранители храмов и величайшие кузнецы, создающие шедевры.",
  dwarf_dark:"Мутировавшие жители 8-го уровня. Бледные, слепые (видят эхолокацией), живут в полной темноте, питаются грибами и тварями.",
  azgul:"Искаженные эльфы, превращенные в идеальных солдат. Не чувствуют боли, дисциплинированы, служат в тяжелой пехоте. Ненавидимы эльфами.",
  dragonborn:"Неудавшийся эксперимент по созданию идеальных воинов. Имеют внутреннее пламя, честь наёмников и стремление к порядку. Breath Weapon — гарантированная атака вблизи (1d8).",
  kobold:"Мелкие, суетливые создания, «отходы» творения. Живут в тенях, мастера механизмов, ловушек и выживания в канализациях.",
  drow:"Жители самых глубоких недр. Матриархат, интриги, яды и поклонение хаосу. Жестокие и хитрые."
};

export { RACES, RACE_DESC };
