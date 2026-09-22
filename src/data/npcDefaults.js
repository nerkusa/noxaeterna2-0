/* Стартовый бестиарий — гримдарк-калибровка (минимум статов 4-5, максимум
   9 для обычных NPC; существа/элиты/боссы выше). Каждая категория
   превращается в отдельную папку бестиария; повторное добавление не
   плодит дублей — GM-редактор сверяет по имени внутри категории. Схема
   полей — та же, что использует форма создания NPC в BestiaryEditor.jsx
   (stats/skills/weapons/armorHead.../shieldType...). */

function armorSlot(a) {
  if (!a) return { type: 'none', hp: 0, name: '' };
  return { type: a.type, hp: a.hp, name: a.name || '' };
}

function w(name, dice, type, dmgType, bonus, magic) {
  return { id: 'w_' + name, name: name, dice: dice, type: type, dmgType: dmgType, bonus: bonus || 0, magic: !!magic };
}

function npc(o) {
  var head = armorSlot(o.armorHead);
  var body = armorSlot(o.armorBody);
  var shield = armorSlot(o.shield);
  return {
    name: o.name,
    level: o.level || 1,
    hp: o.hp, maxHp: o.hp,
    xpReward: o.xpReward != null ? o.xpReward : o.hp,
    stats: Object.assign({ INT: 1, PRC: 1, REF: 1, DEX: 1, BODY: 1, EMP: 1, CRA: 1, WILL: 1 }, o.stats || {}),
    skills: o.skills || {},
    extraSkills: {},
    weapons: o.weapons || [],
    armorHead: head.type, armorHeadHp: head.hp, armorHeadMaxHp: head.hp, armorHeadName: head.name,
    armorBody: body.type, armorBodyHp: body.hp, armorBodyMaxHp: body.hp, armorBodyName: body.name,
    shieldType: shield.type, shieldHp: shield.hp, shieldMaxHp: shield.hp, shieldName: shield.name,
    hasMagic: !!o.hasMagic,
  };
}

function buildNpcDefaults() {
  var cats = {};
  function addCat(catName, list) {
    var obj = cats[catName] || { _created: Date.now() };
    var startLen = Object.keys(obj).length;
    list.forEach(function (n, i) { obj['npc_seed_' + catName.length + '_' + startLen + '_' + i] = n; });
    cats[catName] = obj;
  }

  addCat('Бандиты', [
    npc({ name: 'Бандит', level: 1, hp: 36, xpReward: 18, stats: { INT: 4, PRC: 4, REF: 5, DEX: 5, BODY: 5, EMP: 4, CRA: 4, WILL: 4 },
      skills: { dodge: 4, resist: 4, brawl: 4, simpleWeapon: 5 },
      weapons: [w('Дубина', '1d8', 'Simple', 'Д', 0)],
      armorBody: { type: 'light', hp: 11, name: 'Кожаная куртка с клёпками' } }),
    npc({ name: 'Элитный бандит', level: 3, hp: 55, xpReward: 55, stats: { INT: 5, PRC: 5, REF: 7, DEX: 6, BODY: 7, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 6, resist: 5, battleWeapon: 7, athletics: 5 },
      weapons: [w('Сабля', '1d10', 'Battle', 'Р', 3)],
      armorHead: { type: 'light', hp: 13, name: 'Кожаный шлем-скуфья с наносником' },
      armorBody: { type: 'medium', hp: 26, name: 'Бригантина' } }),
    npc({ name: 'Ассасин с клинками', level: 4, hp: 50, xpReward: 80, stats: { INT: 5, PRC: 7, REF: 9, DEX: 9, BODY: 5, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 8, brawl: 5, battleWeapon: 8, athletics: 6 },
      weapons: [w('Скрытый стилет', '1d6', 'Brawl', 'К', 3), w('Кинжал', '1d6', 'Simple', 'К', 1)] }),
    npc({ name: 'Бандит-чудотворец', level: 3, hp: 45, xpReward: 60, hasMagic: true, stats: { INT: 5, PRC: 6, REF: 5, DEX: 4, BODY: 4, EMP: 5, CRA: 4, WILL: 8 },
      skills: { dodge: 4, resist: 4, spellcast: 7, mresist: 5 },
      weapons: [w('Кистень простой', '1d8', 'Simple', 'Д', 2)],
      armorBody: { type: 'light', hp: 14, name: 'Стёганый доспех истфальского кроя' } }),
    npc({ name: 'Главарь бандитов', level: 6, hp: 80, xpReward: 180, stats: { INT: 5, PRC: 6, REF: 8, DEX: 7, BODY: 9, EMP: 6, CRA: 4, WILL: 6 },
      skills: { dodge: 6, resist: 7, battleWeapon: 9, athletics: 6 },
      weapons: [w('Моргенштерн', '1d10', 'Battle', 'Д', 4)],
      armorHead: { type: 'medium', hp: 19, name: 'Бацинет' },
      armorBody: { type: 'heavy', hp: 30, name: 'Пластинчатый доспех' },
      shield: { type: 'medium', hp: 18, name: 'Круглый щит' } }),
  ]);

  addCat('Лучники', [
    npc({ name: 'Деревенский ополченец с луком', level: 1, hp: 35, xpReward: 2, stats: { INT: 4, PRC: 5, REF: 4, DEX: 4, BODY: 4, EMP: 4, CRA: 4, WILL: 4 },
      skills: { dodge: 4, archery: 4 },
      weapons: [w('Короткий лук', '1d10', 'Archery', 'С', 1)] }),
    npc({ name: 'Городской стрелок', level: 1, hp: 38, xpReward: 10, stats: { INT: 4, PRC: 5, REF: 5, DEX: 4, BODY: 4, EMP: 4, CRA: 4, WILL: 4 },
      skills: { dodge: 4, archery: 5 },
      weapons: [w('Охотничий лук', '1d10', 'Archery', 'С', 2)],
      armorBody: { type: 'light', hp: 13, name: 'Гамбезон' } }),
    npc({ name: 'Опытный лучник', level: 2, hp: 45, xpReward: 20, stats: { INT: 4, PRC: 6, REF: 6, DEX: 5, BODY: 5, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 5, archery: 6, athletics: 4 },
      weapons: [w('Длинный лук', '2d6', 'Archery', 'С', 2)],
      armorHead: { type: 'light', hp: 13, name: 'Кожаный шлем-скуфья с наносником' },
      armorBody: { type: 'light', hp: 14, name: 'Стёганый доспех истфальского кроя' } }),
    npc({ name: 'Меткий стрелок', level: 3, hp: 50, xpReward: 30, stats: { INT: 5, PRC: 8, REF: 6, DEX: 5, BODY: 5, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 5, archery: 8, athletics: 4 },
      weapons: [w('Составной лук', '2d8', 'Archery', 'С', 3)],
      armorHead: { type: 'medium', hp: 16, name: 'Кольчужный койф' },
      armorBody: { type: 'medium', hp: 22, name: 'Кольчужная рубаха' } }),
  ]);

  addCat('Стража и солдаты', [
    npc({ name: 'Городской стражник', level: 1, hp: 38, xpReward: 20, stats: { INT: 4, PRC: 4, REF: 5, DEX: 4, BODY: 5, EMP: 4, CRA: 4, WILL: 4 },
      skills: { dodge: 4, resist: 4, simpleWeapon: 5 },
      weapons: [w('Топорик дровосека-воина', '1d8', 'Simple', 'Р', 2)],
      armorHead: { type: 'light', hp: 10, name: 'Кожаный капюшон' },
      armorBody: { type: 'light', hp: 12, name: 'Мидфальский гамбезон легионера' },
      shield: { type: 'light', hp: 10, name: 'Баклер' } }),
    npc({ name: 'Стражник-ветеран', level: 3, hp: 55, xpReward: 50, stats: { INT: 4, PRC: 5, REF: 6, DEX: 5, BODY: 7, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 5, resist: 6, battleWeapon: 6, athletics: 5 },
      weapons: [w('Меч', '1d10', 'Battle', 'Р', 3)],
      armorHead: { type: 'light', hp: 17, name: 'Мидфальский шлем-котелок легиона' },
      armorBody: { type: 'medium', hp: 24, name: 'Мидфальская кольчуга с сюрко' },
      shield: { type: 'medium', hp: 18, name: 'Круглый щит' } }),
    npc({ name: 'Имперский легионер', level: 2, hp: 45, xpReward: 40, stats: { INT: 4, PRC: 5, REF: 5, DEX: 5, BODY: 6, EMP: 4, CRA: 4, WILL: 4 },
      skills: { dodge: 4, resist: 5, battleWeapon: 5 },
      weapons: [w('Копьё', '2d6', 'Battle', 'К', 3)],
      armorHead: { type: 'light', hp: 17, name: 'Мидфальский шлем-котелок легиона' },
      armorBody: { type: 'medium', hp: 24, name: 'Мидфальская кольчуга с сюрко' },
      shield: { type: 'medium', hp: 19, name: 'Имперский миндалевидный щит легиона' } }),
    npc({ name: 'Сержант легиона', level: 4, hp: 65, xpReward: 85, stats: { INT: 5, PRC: 5, REF: 6, DEX: 5, BODY: 8, EMP: 5, CRA: 4, WILL: 5 },
      skills: { dodge: 5, resist: 7, battleWeapon: 7, athletics: 5 },
      weapons: [w('Кавалерийский палаш', '1d10', 'Battle', 'Р', 4)],
      armorHead: { type: 'medium', hp: 20, name: 'Мидфальский бацинет центуриона' },
      armorBody: { type: 'medium', hp: 27, name: 'Кольчуга с наручами' },
      shield: { type: 'medium', hp: 19, name: 'Имперский миндалевидный щит легиона' } }),
    npc({ name: 'Ландскнехт Серениссимы', level: 3, hp: 58, xpReward: 55, stats: { INT: 4, PRC: 5, REF: 7, DEX: 6, BODY: 6, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 6, resist: 5, battleWeapon: 7, guns: 5 },
      weapons: [w('Двуручный меч', '2d8', 'Battle', 'Р', 4), w('Пистолет', '2d8', 'Guns', 'П', 2)],
      armorHead: { type: 'medium', hp: 18, name: 'Кабассет ландскнехта' },
      armorBody: { type: 'medium', hp: 19, name: 'Полукираса ландскнехта' },
      shield: { type: 'light', hp: 14, name: 'Ландскнетский тарч' } }),
    npc({ name: 'Наёмник Золотой Перчатки', level: 7, hp: 80, xpReward: 220, stats: { INT: 5, PRC: 6, REF: 9, DEX: 7, BODY: 9, EMP: 5, CRA: 5, WILL: 6 },
      skills: { dodge: 7, resist: 8, battleWeapon: 10, athletics: 6 },
      weapons: [w('Клинок Золотой Перчатки', '2d8', 'Battle', 'Р', 5)],
      armorBody: { type: 'heavy', hp: 44, name: 'Позолоченные латы Золотой Перчатки' },
      shield: { type: 'tower', hp: 32, name: 'Позолоченный щит Золотой Перчатки' } }),
  ]);

  addCat('Чудотворцы', [
    npc({ name: 'Дикий чудотворец', level: 2, hp: 38, xpReward: 45, hasMagic: true, stats: { INT: 4, PRC: 6, REF: 5, DEX: 4, BODY: 4, EMP: 4, CRA: 4, WILL: 8 },
      skills: { dodge: 4, spellcast: 7, mresist: 4 },
      weapons: [w('Посох', '1d8', 'Simple', 'Д', 1)] }),
    npc({ name: 'Храмовый чудотворец-целитель', level: 3, hp: 40, xpReward: 40, hasMagic: true, stats: { INT: 5, PRC: 5, REF: 4, DEX: 4, BODY: 4, EMP: 7, CRA: 4, WILL: 8 },
      skills: { dodge: 4, spellcast: 6, mresist: 5 },
      armorBody: { type: 'light', hp: 12, name: 'Мидфальский гамбезон легионера' } }),
    npc({ name: 'Одержимый чудотворец', level: 5, hp: 65, xpReward: 130, hasMagic: true, stats: { INT: 5, PRC: 7, REF: 5, DEX: 4, BODY: 5, EMP: 4, CRA: 4, WILL: 10 },
      skills: { dodge: 4, spellcast: 9, mresist: 7 } }),
  ]);

  addCat('Существа Диких Земель и орды', [
    npc({ name: 'Азгул-отщепенец (мечник)', level: 1, hp: 34, xpReward: 25, stats: { INT: 4, PRC: 4, REF: 5, DEX: 4, BODY: 5, EMP: 3, CRA: 3, WILL: 4 },
      skills: { dodge: 4, resist: 4, simpleWeapon: 4, brawl: 4 },
      weapons: [w('Обломок косы', '1d8', 'Simple', 'Р', -1)] }),
    npc({ name: 'Азгул-отщепенец (лучник)', level: 1, hp: 30, xpReward: 24, stats: { INT: 4, PRC: 5, REF: 5, DEX: 4, BODY: 4, EMP: 3, CRA: 3, WILL: 4 },
      skills: { dodge: 4, archery: 4 },
      weapons: [w('Короткий лук', '1d10', 'Archery', 'С', 1)] }),
    npc({ name: 'Азгул-отщепенец (ближник со щитом)', level: 2, hp: 42, xpReward: 34, stats: { INT: 4, PRC: 4, REF: 5, DEX: 4, BODY: 6, EMP: 3, CRA: 3, WILL: 4 },
      skills: { dodge: 4, resist: 5, simpleWeapon: 5 },
      weapons: [w('Кустарный тесак ополченца', '1d8', 'Simple', 'Р', 1)],
      shield: { type: 'medium', hp: 18, name: 'Круглый щит' } }),
    npc({ name: 'Азгул-легионер (мечник)', level: 3, hp: 55, xpReward: 60, stats: { INT: 5, PRC: 5, REF: 7, DEX: 6, BODY: 7, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 6, resist: 6, battleWeapon: 6 },
      weapons: [w('Боевой топор', '2d8', 'Battle', 'Р', 3)],
      armorHead: { type: 'medium', hp: 18, name: 'Шапель с назатыльником' },
      armorBody: { type: 'medium', hp: 25, name: 'Эрдвинский чешуйчатый доспех (трофейный)' } }),
    npc({ name: 'Азгул-легионер (лучник)', level: 3, hp: 48, xpReward: 58, stats: { INT: 5, PRC: 7, REF: 7, DEX: 6, BODY: 5, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 5, archery: 7, athletics: 5 },
      weapons: [w('Составной лук', '2d8', 'Archery', 'С', 2)],
      armorBody: { type: 'medium', hp: 23, name: 'Ламеллярный доспех' } }),
    npc({ name: 'Азгул-легионер (щитоносец)', level: 4, hp: 62, xpReward: 70, stats: { INT: 5, PRC: 5, REF: 6, DEX: 5, BODY: 8, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 5, resist: 7, battleWeapon: 6 },
      weapons: [w('Боевой цеп', '2d8', 'Battle', 'Д', 3)],
      armorHead: { type: 'medium', hp: 18, name: 'Шапель с назатыльником' },
      armorBody: { type: 'medium', hp: 22, name: 'Кольчужная рубаха' },
      shield: { type: 'medium', hp: 20, name: 'Каплевидный щит' } }),
    npc({ name: 'Хобгоблин-отщепенец (мечник)', level: 1, hp: 36, xpReward: 25, stats: { INT: 4, PRC: 4, REF: 5, DEX: 4, BODY: 5, EMP: 4, CRA: 3, WILL: 4 },
      skills: { dodge: 4, resist: 4, simpleWeapon: 4 },
      weapons: [w('Кустарный тесак ополченца', '1d8', 'Simple', 'Р', 0)],
      armorBody: { type: 'light', hp: 11, name: 'Кожаная куртка с клёпками' } }),
    npc({ name: 'Хобгоблин-отщепенец (лучник)', level: 1, hp: 32, xpReward: 24, stats: { INT: 4, PRC: 5, REF: 5, DEX: 4, BODY: 4, EMP: 4, CRA: 3, WILL: 4 },
      skills: { dodge: 4, archery: 4 },
      weapons: [w('Охотничий лук', '1d10', 'Archery', 'С', 1)] }),
    npc({ name: 'Хобгоблин-отщепенец (щитоносец)', level: 2, hp: 48, xpReward: 40, stats: { INT: 4, PRC: 4, REF: 5, DEX: 4, BODY: 6, EMP: 4, CRA: 3, WILL: 4 },
      skills: { dodge: 4, resist: 5, simpleWeapon: 5 },
      weapons: [w('Кустарный тесак ополченца', '1d8', 'Simple', 'Р', 1)],
      armorBody: { type: 'light', hp: 11, name: 'Кожаная куртка с клёпками' },
      shield: { type: 'medium', hp: 17, name: 'Эрдвинский умбоновый щит (трофейный)' } }),
    npc({ name: 'Хобгоблин-легионер (мечник)', level: 3, hp: 58, xpReward: 65, stats: { INT: 5, PRC: 5, REF: 6, DEX: 5, BODY: 8, EMP: 5, CRA: 4, WILL: 5 },
      skills: { dodge: 5, resist: 7, battleWeapon: 6 },
      weapons: [w('Боевой топор', '2d8', 'Battle', 'Р', 3)],
      armorHead: { type: 'medium', hp: 18, name: 'Шапель с назатыльником' },
      armorBody: { type: 'medium', hp: 25, name: 'Эрдвинский чешуйчатый доспех' },
      shield: { type: 'medium', hp: 17, name: 'Эрдвинский умбоновый щит' } }),
    npc({ name: 'Хобгоблин-легионер (лучник)', level: 3, hp: 50, xpReward: 62, stats: { INT: 5, PRC: 7, REF: 6, DEX: 6, BODY: 6, EMP: 5, CRA: 4, WILL: 5 },
      skills: { dodge: 5, archery: 7, athletics: 5 },
      weapons: [w('Составной лук', '2d8', 'Archery', 'С', 2)],
      armorBody: { type: 'medium', hp: 23, name: 'Эрдвинская кольчуга' } }),
    npc({ name: 'Хобгоблин-вожак', level: 5, hp: 72, xpReward: 110, stats: { INT: 6, PRC: 6, REF: 7, DEX: 6, BODY: 8, EMP: 7, CRA: 4, WILL: 6 },
      skills: { dodge: 6, resist: 7, battleWeapon: 8 },
      weapons: [w('Боевой топор', '2d8', 'Battle', 'Р', 4)],
      armorHead: { type: 'medium', hp: 18, name: 'Шапель с назатыльником' },
      armorBody: { type: 'medium', hp: 25, name: 'Эрдвинский чешуйчатый доспех' },
      shield: { type: 'medium', hp: 17, name: 'Эрдвинский умбоновый щит' } }),
    npc({ name: 'Тролль', level: 6, hp: 160, xpReward: 200, stats: { INT: 4, PRC: 5, REF: 5, DEX: 4, BODY: 12, EMP: 3, CRA: 3, WILL: 5 },
      skills: { resist: 9, brawl: 8, athletics: 5 },
      weapons: [w('Голые руки/коряга', '3d6', 'Brawl', 'Д', 5)],
      armorBody: { type: 'heavy', hp: 24, name: 'Толстая шкура (встроенная)' } }),
    npc({ name: 'Виверна', level: 6, hp: 130, xpReward: 220, stats: { INT: 4, PRC: 6, REF: 8, DEX: 7, BODY: 8, EMP: 3, CRA: 3, WILL: 5 },
      skills: { dodge: 6, brawl: 7, athletics: 6 },
      weapons: [w('Жало/когти', '3d8', 'Brawl', 'К', 6)],
      armorBody: { type: 'heavy', hp: 26, name: 'Роговые чешуйчатые пластины (встроенная)' } }),
    npc({ name: 'Молодой дракон', level: 9, hp: 420, xpReward: 700, stats: { INT: 6, PRC: 7, REF: 7, DEX: 5, BODY: 14, EMP: 4, CRA: 4, WILL: 7 },
      skills: { dodge: 5, resist: 10, brawl: 10, athletics: 6 },
      weapons: [w('Укус', '4d10', 'Brawl', 'Д', 12), w('Огненное дыхание', '6d10', 'Brawl', 'Д', 20)],
      armorBody: { type: 'heavy', hp: 45, name: 'Драконья чешуя (встроенная)' } }),
  ]);

  addCat('Ракси', [
    npc({ name: 'Ракси-ассасин', level: 4, hp: 48, xpReward: 85, stats: { INT: 5, PRC: 8, REF: 9, DEX: 9, BODY: 5, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 8, brawl: 5, simpleWeapon: 8, athletics: 6 },
      weapons: [w('Скрытый стилет', '1d6', 'Brawl', 'К', 3), w('Кинжал', '1d6', 'Simple', 'К', 1)] }),
    npc({ name: 'Ракси-воин (лёгкая конница)', level: 2, hp: 44, xpReward: 38, stats: { INT: 4, PRC: 5, REF: 6, DEX: 6, BODY: 5, EMP: 4, CRA: 4, WILL: 4 },
      skills: { dodge: 5, battleWeapon: 5, athletics: 5 },
      weapons: [w('Сабля', '1d10', 'Battle', 'Р', 3)],
      armorBody: { type: 'medium', hp: 23, name: 'Ламеллярный доспех' } }),
    npc({ name: 'Ракси-лучник конный', level: 3, hp: 46, xpReward: 45, stats: { INT: 4, PRC: 7, REF: 7, DEX: 6, BODY: 5, EMP: 4, CRA: 4, WILL: 4 },
      skills: { dodge: 5, archery: 7, athletics: 6 },
      weapons: [w('Ракси-composite', '2d8', 'Archery', 'С', 3)],
      armorBody: { type: 'medium', hp: 23, name: 'Ламеллярный доспех' } }),
    npc({ name: 'Гвардеец Ашкандара', level: 5, hp: 62, xpReward: 115, stats: { INT: 5, PRC: 6, REF: 7, DEX: 6, BODY: 7, EMP: 5, CRA: 4, WILL: 6 },
      skills: { dodge: 6, resist: 6, battleWeapon: 7, athletics: 5 },
      weapons: [w('Кавалерийский палаш', '1d10', 'Battle', 'Р', 4)],
      armorHead: { type: 'heavy', hp: 25, name: 'Катафрактный шлем с бармицей' },
      armorBody: { type: 'medium', hp: 23, name: 'Ламеллярный доспех' },
      shield: { type: 'medium', hp: 20, name: 'Катафрактный щит' } }),
  ]);

  addCat('Драконорождённые', [
    npc({ name: 'Драконорождённый воин', level: 3, hp: 58, xpReward: 60, stats: { INT: 4, PRC: 5, REF: 6, DEX: 5, BODY: 8, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 5, resist: 6, brawl: 5, battleWeapon: 6 },
      weapons: [w('Боевой топор', '2d8', 'Battle', 'Р', 3)],
      armorBody: { type: 'medium', hp: 16, name: 'Природная чешуя (встроенная)' } }),
    npc({ name: 'Драконорождённый элитный воин', level: 5, hp: 78, xpReward: 125, stats: { INT: 5, PRC: 6, REF: 7, DEX: 6, BODY: 10, EMP: 5, CRA: 4, WILL: 6 },
      skills: { dodge: 6, resist: 8, brawl: 7, battleWeapon: 8 },
      weapons: [w('Люцернский молот', '2d10', 'Battle', 'Д', 4)],
      armorBody: { type: 'heavy', hp: 22, name: 'Природная чешуя (встроенная)' } }),
    npc({ name: 'Драконорождённый жрец-заклинатель', level: 4, hp: 58, xpReward: 95, hasMagic: true, stats: { INT: 5, PRC: 6, REF: 5, DEX: 4, BODY: 7, EMP: 5, CRA: 4, WILL: 9 },
      skills: { dodge: 4, resist: 6, spellcast: 8, mresist: 5 },
      weapons: [w('Боевой цеп', '2d8', 'Battle', 'Д', 2)],
      armorBody: { type: 'medium', hp: 16, name: 'Природная чешуя (встроенная)' } }),
    npc({ name: 'Гиндгор, вождь Синей Молнии', level: 8, hp: 150, xpReward: 420, stats: { INT: 6, PRC: 7, REF: 9, DEX: 7, BODY: 13, EMP: 6, CRA: 5, WILL: 7 },
      skills: { dodge: 7, resist: 10, brawl: 9, battleWeapon: 11, athletics: 7 },
      weapons: [w('Клинок с молниевым узором', '2d10', 'Battle', 'Р', 5)],
      armorBody: { type: 'heavy', hp: 28, name: 'Природная чешуя (встроенная)' } }),
  ]);

  addCat('Фракционные (люди)', [
    npc({ name: 'Вестфальский гвардеец', level: 3, hp: 52, xpReward: 55, stats: { INT: 4, PRC: 5, REF: 6, DEX: 5, BODY: 6, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 5, resist: 5, battleWeapon: 6 },
      weapons: [w('Сабля', '1d10', 'Battle', 'Р', 3)],
      armorHead: { type: 'medium', hp: 21, name: 'Вестфальский шлем-бургиньот с плюмажем' },
      armorBody: { type: 'medium', hp: 21, name: 'Вестфальский полудоспех' },
      shield: { type: 'medium', hp: 19, name: 'Вестфальский щит-тарч мореходов' } }),
    npc({ name: 'Грифоний гвардеец Мидденбурга', level: 6, hp: 78, xpReward: 190, stats: { INT: 5, PRC: 6, REF: 8, DEX: 6, BODY: 9, EMP: 6, CRA: 4, WILL: 6 },
      skills: { dodge: 6, resist: 8, battleWeapon: 8, athletics: 6 },
      weapons: [w('Меч дворцовой гвардии с грифоном', '1d10', 'Battle', 'Р', 4)],
      armorHead: { type: 'heavy', hp: 29, name: 'Грифоний шлем-арме дворцовой гвардии' },
      armorBody: { type: 'heavy', hp: 39, name: 'Грифоньи латы дворцовой гвардии' },
      shield: { type: 'medium', hp: 26, name: 'Грифоний тарч дворцовой гвардии' } }),
    npc({ name: 'Оруженосец Аурелиума', level: 2, hp: 42, xpReward: 38, stats: { INT: 4, PRC: 5, REF: 6, DEX: 5, BODY: 5, EMP: 4, CRA: 4, WILL: 4 },
      skills: { dodge: 5, resist: 4, simpleWeapon: 5 },
      weapons: [w('Копьё ополчения', '1d8', 'Simple', 'К', 1)],
      armorHead: { type: 'medium', hp: 18, name: 'Шлем оруженосца Аурелиума' },
      armorBody: { type: 'medium', hp: 20, name: 'Доспех оруженосца Аурелиума' } }),
    npc({ name: 'Солнценосец Аурелиума', level: 5, hp: 68, xpReward: 140, stats: { INT: 5, PRC: 6, REF: 7, DEX: 5, BODY: 9, EMP: 6, CRA: 4, WILL: 7 },
      skills: { dodge: 6, resist: 8, battleWeapon: 8, athletics: 6 },
      weapons: [w('Благословенный клинок Солнценосца', '1d10', 'Battle', 'Р', 4)],
      armorHead: { type: 'heavy', hp: 26, name: 'Шлем Солнценосца' },
      armorBody: { type: 'heavy', hp: 33, name: 'Доспех Солнценосца' } }),
    npc({ name: 'Паладин Аурелиума', level: 7, hp: 80, xpReward: 260, stats: { INT: 5, PRC: 7, REF: 8, DEX: 6, BODY: 10, EMP: 7, CRA: 5, WILL: 9 },
      skills: { dodge: 7, resist: 9, battleWeapon: 10, athletics: 6 },
      weapons: [w('Клинок наградной работы', '1d10', 'Battle', 'Р', 5)],
      armorHead: { type: 'heavy', hp: 30, name: 'Венценосный шлем Паладина' },
      armorBody: { type: 'heavy', hp: 41, name: 'Доспех Паладина Аурелиума' },
      shield: { type: 'tower', hp: 27, name: 'Солнечный щит Ордена' } }),
    npc({ name: 'Эрдвинский крылатый гусар', level: 5, hp: 65, xpReward: 130, stats: { INT: 5, PRC: 6, REF: 9, DEX: 7, BODY: 7, EMP: 5, CRA: 4, WILL: 5 },
      skills: { dodge: 7, battleWeapon: 8, athletics: 6 },
      weapons: [w('Копьё крылатого всадника', '2d6', 'Battle', 'К', 4)],
      armorHead: { type: 'heavy', hp: 27, name: 'Шлем крылатого всадника' },
      armorBody: { type: 'heavy', hp: 36, name: 'Доспех крылатого всадника' } }),
    npc({ name: 'Истфальский катафрактарий', level: 4, hp: 62, xpReward: 100, stats: { INT: 5, PRC: 5, REF: 6, DEX: 5, BODY: 8, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 5, resist: 6, battleWeapon: 7, athletics: 5 },
      weapons: [w('Катафрактный конт', '2d6', 'Battle', 'К', 3)],
      armorHead: { type: 'heavy', hp: 25, name: 'Катафрактный шлем с бармицей' },
      armorBody: { type: 'heavy', hp: 31, name: 'Катафрактный доспех' },
      shield: { type: 'medium', hp: 20, name: 'Катафрактный щит' } }),
  ]);

  addCat('Дворфы', [
    npc({ name: 'Дворфийский гвардеец', level: 3, hp: 58, xpReward: 60, stats: { INT: 5, PRC: 5, REF: 5, DEX: 4, BODY: 9, EMP: 4, CRA: 6, WILL: 6 },
      skills: { dodge: 4, resist: 7, battleWeapon: 6 },
      weapons: [w('Дворфья секира', '1d10', 'Battle', 'Р', 4)],
      armorHead: { type: 'heavy', hp: 27, name: 'Полный шлем-арме' },
      armorBody: { type: 'heavy', hp: 34, name: 'Латные доспехи' } }),
    npc({ name: 'Дворфийский кувалдоносец', level: 4, hp: 68, xpReward: 95, stats: { INT: 5, PRC: 5, REF: 4, DEX: 4, BODY: 11, EMP: 4, CRA: 6, WILL: 6 },
      skills: { resist: 8, battleWeapon: 7, athletics: 4 },
      weapons: [w('Двуручный молот дворфьей ковки', '3d6', 'Battle', 'Д', 4)],
      armorBody: { type: 'heavy', hp: 30, name: 'Пластинчатый доспех' } }),
    npc({ name: 'Дворфийский драконоборец', level: 5, hp: 62, xpReward: 115, stats: { INT: 5, PRC: 8, REF: 6, DEX: 5, BODY: 8, EMP: 4, CRA: 6, WILL: 6 },
      skills: { dodge: 5, resist: 6, archery: 8 },
      weapons: [w('Дворфий болтомёт-скорострел', '2d8', 'Archery', 'С', 3)],
      armorHead: { type: 'heavy', hp: 24, name: 'Барбют' },
      armorBody: { type: 'heavy', hp: 32, name: 'Кираса' } }),
    npc({ name: 'Всадник на медвесыче', level: 6, hp: 75, xpReward: 170, stats: { INT: 5, PRC: 6, REF: 6, DEX: 5, BODY: 9, EMP: 5, CRA: 5, WILL: 6 },
      skills: { dodge: 5, resist: 8, battleWeapon: 8, athletics: 6 },
      weapons: [w('Дворфья секира', '1d10', 'Battle', 'Р', 4)],
      armorHead: { type: 'heavy', hp: 27, name: 'Полный шлем-арме' },
      armorBody: { type: 'heavy', hp: 34, name: 'Латные доспехи' } }),
  ]);

  addCat('Эльфы', [
    npc({ name: 'Солнечный родовой воин', level: 3, hp: 46, xpReward: 60, stats: { INT: 5, PRC: 6, REF: 8, DEX: 6, BODY: 5, EMP: 4, CRA: 5, WILL: 6 },
      skills: { dodge: 7, battleWeapon: 7, athletics: 5 },
      weapons: [w('Эльфийская глефа-перевёртыш', '1d10', 'Battle', 'Р', 4)],
      armorBody: { type: 'medium', hp: 22, name: 'Кольчужная рубаха' } }),
    npc({ name: 'Солнечная конница (рогатые кони)', level: 4, hp: 52, xpReward: 85, stats: { INT: 5, PRC: 6, REF: 9, DEX: 6, BODY: 6, EMP: 4, CRA: 5, WILL: 6 },
      skills: { dodge: 7, battleWeapon: 7, athletics: 6 },
      weapons: [w('Кавалерийский палаш', '1d10', 'Battle', 'Р', 4)],
      armorBody: { type: 'medium', hp: 26, name: 'Бригантина' } }),
    npc({ name: 'Лесной страж Иллинора', level: 3, hp: 50, xpReward: 55, stats: { INT: 5, PRC: 7, REF: 7, DEX: 6, BODY: 6, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 6, resist: 5, battleWeapon: 6, athletics: 6 },
      weapons: [w('Боевая коса', '2d10', 'Battle', 'Р', 4)],
      armorBody: { type: 'light', hp: 14, name: 'Стёганый доспех истфальского кроя' } }),
    npc({ name: 'Лучник Иллинора', level: 3, hp: 44, xpReward: 50, stats: { INT: 5, PRC: 8, REF: 7, DEX: 6, BODY: 5, EMP: 4, CRA: 4, WILL: 5 },
      skills: { dodge: 6, archery: 8, athletics: 5 },
      weapons: [w('Составной лук', '2d8', 'Archery', 'С', 3)] }),
  ]);

  addCat('Боссы', [
    npc({ name: 'Эрегин', level: 20, hp: 500, xpReward: 2000, hasMagic: true,
      stats: { INT: 8, PRC: 10, REF: 12, DEX: 10, BODY: 12, EMP: 4, CRA: 4, WILL: 18 },
      skills: { dodge: 8, resist: 10, brawl: 6, battleWeapon: 14, simpleWeapon: 4, thrown: 4, athletics: 8, spellcast: 16, mresist: 12 },
      weapons: [
        w('Сабля Эрегина (правая)', '2d8', 'Battle', 'Р', 8),
        w('Сабля Эрегина (левая)', '2d8', 'Battle', 'Р', 8),
      ],
      armorBody: { type: 'heavy', hp: 90, name: 'Панцирь Эрегина' } }),
    npc({ name: 'Гул-Морраг, шаман орды', level: 7, hp: 130, xpReward: 280, hasMagic: true, stats: { INT: 6, PRC: 7, REF: 6, DEX: 5, BODY: 7, EMP: 6, CRA: 5, WILL: 11 },
      skills: { dodge: 5, resist: 6, spellcast: 10, mresist: 7 },
      weapons: [w('Ритуальный посох', '1d8', 'Simple', 'Д', 2)],
      armorBody: { type: 'medium', hp: 23, name: 'Ламеллярный доспех' } }),
    npc({ name: 'Тёмный всадник (рядовой)', level: 6, hp: 110, xpReward: 220, stats: { INT: 5, PRC: 6, REF: 10, DEX: 7, BODY: 9, EMP: 3, CRA: 4, WILL: 9 },
      skills: { dodge: 7, resist: 8, battleWeapon: 8 },
      weapons: [w('Клинок нездешней ковки', '2d8', 'Battle', 'Р', 4)],
      armorBody: { type: 'heavy', hp: 36, name: 'Доспех, что не отражает свет (сталь — половина урона, огонь — полный урон)' } }),
  ]);

  return cats;
}

export { buildNpcDefaults };
