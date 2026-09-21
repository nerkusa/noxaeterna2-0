/* Готовый набор NPC для бестиария — разные по силе и духу противники,
   плюс несколько элитных бойцов и один именной босс (Эрегин). Каждая
   категория превращается в отдельную папку бестиария; повторное
   добавление не плодит дублей — GM-редактор сверяет по имени внутри
   категории. Схема полей — та же, что использует форма создания NPC
   в BestiaryEditor.jsx (stats/skills/weapons/armorHead.../shieldType...). */

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
    stats: Object.assign({ INT: 1, REF: 1, DEX: 1, BODY: 1, EMP: 1, CRA: 1, WILL: 1 }, o.stats || {}),
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
    var obj = { _created: Date.now() };
    list.forEach(function (n, i) { obj['npc_seed_' + catName.length + '_' + i] = n; });
    cats[catName] = obj;
  }

  addCat('Бандиты', [
    npc({ name: 'Разбойник', level: 1, hp: 18, stats: { INT: 2, REF: 3, DEX: 3, BODY: 3, EMP: 1, CRA: 1, WILL: 2 },
      skills: { dodge: 1, resist: 1, brawl: 1, simpleWeapon: 2, thrown: 1, athletics: 1 },
      weapons: [w('Ржавый нож', '1d6', 'Simple', 'К', -1)],
      armorBody: { type: 'light', hp: 10, name: 'Потрёпанная куртка' } }),
    npc({ name: 'Головорез', level: 2, hp: 26, stats: { INT: 2, REF: 4, DEX: 3, BODY: 4, EMP: 1, CRA: 1, WILL: 2 },
      skills: { dodge: 2, resist: 2, brawl: 1, battleWeapon: 3, simpleWeapon: 1, athletics: 2 },
      weapons: [w('Короткий меч ополченца', '1d8', 'Battle', 'Р', 1)],
      armorHead: { type: 'light', hp: 10, name: 'Кожаный капюшон' },
      armorBody: { type: 'light', hp: 11, name: 'Кожаная куртка с клёпками' } }),
    npc({ name: 'Поджигатель', level: 2, hp: 20, stats: { INT: 3, REF: 3, DEX: 4, BODY: 2, EMP: 1, CRA: 2, WILL: 2 },
      skills: { dodge: 2, resist: 1, thrown: 3, athletics: 1 },
      weapons: [w('Зажигательные дротики', '1d6', 'Thrown', 'К', 1)] }),
    npc({ name: 'Арбалетчик банды', level: 2, hp: 22, stats: { INT: 2, REF: 4, DEX: 3, BODY: 2, EMP: 1, CRA: 1, WILL: 2 },
      skills: { dodge: 1, resist: 1, archery: 3, athletics: 1 },
      weapons: [w('Лёгкий арбалет', '2d6', 'Archery', 'С', 1)],
      armorHead: { type: 'light', hp: 9, name: 'Меховая шапка с нашивным железом' } }),
    npc({ name: 'Главарь банды', level: 3, hp: 42, xpReward: 55, stats: { INT: 3, REF: 5, DEX: 4, BODY: 4, EMP: 2, CRA: 1, WILL: 3 },
      skills: { dodge: 3, resist: 2, battleWeapon: 4, simpleWeapon: 1, athletics: 2 },
      weapons: [w('Сабля', '1d10', 'Battle', 'Р', 2)],
      armorBody: { type: 'medium', hp: 22, name: 'Бригантина' },
      shield: { type: 'light', hp: 10, name: 'Баклер' } }),
  ]);

  addCat('Нежить', [
    npc({ name: 'Зомби', level: 1, hp: 32, stats: { INT: 1, REF: 2, DEX: 1, BODY: 4, EMP: 1, CRA: 1, WILL: 1 },
      skills: { dodge: 0, resist: 3, brawl: 2, athletics: 1 },
      weapons: [w('Гнилые когти', '1d6', 'Brawl', 'Д', 0)] }),
    npc({ name: 'Скелет-воин', level: 2, hp: 20, stats: { INT: 1, REF: 3, DEX: 3, BODY: 3, EMP: 1, CRA: 1, WILL: 1 },
      skills: { dodge: 1, resist: 2, battleWeapon: 2, simpleWeapon: 1 },
      weapons: [w('Ржавый меч', '1d8', 'Battle', 'Р', 0)],
      armorBody: { type: 'light', hp: 8, name: 'Истлевшие лохмотья доспеха' } }),
    npc({ name: 'Костяной лучник', level: 2, hp: 16, xpReward: 18, stats: { INT: 1, REF: 3, DEX: 3, BODY: 2, EMP: 1, CRA: 1, WILL: 1 },
      skills: { dodge: 1, archery: 3 },
      weapons: [w('Костяной лук', '1d10', 'Archery', 'С', 1)] }),
    npc({ name: 'Гуль', level: 3, hp: 30, xpReward: 28, stats: { INT: 1, REF: 4, DEX: 4, BODY: 4, EMP: 1, CRA: 1, WILL: 2 },
      skills: { dodge: 3, brawl: 3, athletics: 2 },
      weapons: [w('Когти гуля', '1d8', 'Brawl', 'К', 2)] }),
    npc({ name: 'Призрак', level: 3, hp: 22, xpReward: 30, hasMagic: true, stats: { INT: 3, REF: 3, DEX: 3, BODY: 1, EMP: 1, CRA: 1, WILL: 6 },
      skills: { dodge: 3, spellcast: 4, mresist: 4 },
      weapons: [w('Могильный хлад', '1d8', 'Brawl', 'Д', 0, true)] }),
    npc({ name: 'Вампир-отступник', level: 5, hp: 75, xpReward: 90, hasMagic: true, stats: { INT: 5, REF: 7, DEX: 6, BODY: 5, EMP: 3, CRA: 1, WILL: 7 },
      skills: { dodge: 5, resist: 4, battleWeapon: 5, spellcast: 5, mresist: 5, athletics: 3 },
      weapons: [w('Клинок из чёрной стали', '1d10', 'Battle', 'Р', 3)],
      armorBody: { type: 'medium', hp: 20, name: 'Полуистлевший камзол' } }),
  ]);

  addCat('Звери', [
    npc({ name: 'Волк', level: 1, hp: 18, xpReward: 15, stats: { INT: 1, REF: 3, DEX: 4, BODY: 3, EMP: 1, CRA: 1, WILL: 1 },
      skills: { dodge: 2, brawl: 2, athletics: 2 },
      weapons: [w('Клыки', '1d6', 'Brawl', 'К', 0)] }),
    npc({ name: 'Бурый медведь', level: 3, hp: 55, xpReward: 45, stats: { INT: 1, REF: 3, DEX: 2, BODY: 7, EMP: 1, CRA: 1, WILL: 2 },
      skills: { dodge: 1, resist: 3, brawl: 5, athletics: 3 },
      weapons: [w('Когти и клыки', '1d10', 'Brawl', 'Д', 2)] }),
    npc({ name: 'Дикий кабан', level: 2, hp: 28, xpReward: 22, stats: { INT: 1, REF: 3, DEX: 2, BODY: 5, EMP: 1, CRA: 1, WILL: 1 },
      skills: { resist: 2, brawl: 3, athletics: 2 },
      weapons: [w('Клыки-бивни', '1d8', 'Brawl', 'К', 1)] }),
    npc({ name: 'Гигантский паук', level: 2, hp: 24, xpReward: 25, stats: { INT: 1, REF: 4, DEX: 5, BODY: 3, EMP: 1, CRA: 1, WILL: 1 },
      skills: { dodge: 3, brawl: 2, athletics: 2 },
      weapons: [w('Ядовитые жвала', '1d6', 'Brawl', 'К', 1)] }),
    npc({ name: 'Ядовитая змея', level: 1, hp: 12, xpReward: 14, stats: { INT: 1, REF: 4, DEX: 5, BODY: 1, EMP: 1, CRA: 1, WILL: 1 },
      skills: { dodge: 4, brawl: 1 },
      weapons: [w('Ядовитый укус', '1d4', 'Brawl', 'К', 0)] }),
    npc({ name: 'Гарпия', level: 2, hp: 20, xpReward: 24, stats: { INT: 1, REF: 5, DEX: 5, BODY: 2, EMP: 1, CRA: 1, WILL: 1 },
      skills: { dodge: 4, brawl: 2, athletics: 3 },
      weapons: [w('Когти', '1d6', 'Brawl', 'К', 1)] }),
  ]);

  addCat('Элитные воины', [
    npc({ name: 'Элитный мечник', level: 5, hp: 65, xpReward: 70, stats: { INT: 3, REF: 7, DEX: 5, BODY: 6, EMP: 2, CRA: 1, WILL: 3 },
      skills: { dodge: 5, resist: 4, battleWeapon: 7, athletics: 4 },
      weapons: [w('Мастерски откованный меч', '2d6', 'Battle', 'Р', 4)],
      armorHead: { type: 'medium', hp: 19, name: 'Бацинет' },
      armorBody: { type: 'medium', hp: 26, name: 'Бригантина' },
      shield: { type: 'light', hp: 12, name: 'Тарч' } }),
    npc({ name: 'Элитный копейщик', level: 5, hp: 60, xpReward: 65, stats: { INT: 3, REF: 6, DEX: 5, BODY: 6, EMP: 2, CRA: 1, WILL: 3 },
      skills: { dodge: 4, resist: 4, battleWeapon: 6, athletics: 4 },
      weapons: [w('Копьё', '2d8', 'Battle', 'К', 2)],
      armorHead: { type: 'medium', hp: 20, name: 'Бургиньот' },
      armorBody: { type: 'heavy', hp: 32, name: 'Кираса' } }),
    npc({ name: 'Элитный лучник', level: 5, hp: 50, xpReward: 60, stats: { INT: 3, REF: 7, DEX: 7, BODY: 4, EMP: 2, CRA: 1, WILL: 3 },
      skills: { dodge: 5, archery: 7, athletics: 3 },
      weapons: [w('Составной лук', '2d8', 'Archery', 'С', 2)],
      armorBody: { type: 'light', hp: 15, name: 'Акетон' } }),
    npc({ name: 'Тяжёлый латник', level: 6, hp: 90, xpReward: 85, stats: { INT: 2, REF: 5, DEX: 3, BODY: 9, EMP: 1, CRA: 1, WILL: 3 },
      skills: { dodge: 2, resist: 6, battleWeapon: 6, athletics: 3 },
      weapons: [w('Боевой молот', '2d6', 'Battle', 'Д', 2)],
      armorHead: { type: 'heavy', hp: 27, name: 'Полный шлем-арме' },
      armorBody: { type: 'heavy', hp: 34, name: 'Латные доспехи' },
      shield: { type: 'medium', hp: 18, name: 'Круглый щит' } }),
    npc({ name: 'Чемпион ордена', level: 7, hp: 100, xpReward: 110, hasMagic: true, stats: { INT: 3, REF: 7, DEX: 6, BODY: 7, EMP: 3, CRA: 1, WILL: 6 },
      skills: { dodge: 5, resist: 5, battleWeapon: 8, spellcast: 5, mresist: 5, athletics: 4 },
      weapons: [w('Благословенный клинок Солнценосца', '2d6', 'Battle', 'Р', 4)],
      armorHead: { type: 'heavy', hp: 26, name: 'Шлем Солнценосца' },
      armorBody: { type: 'heavy', hp: 33, name: 'Доспех Солнценосца' } }),
    npc({ name: 'Гвардеец с грифоном', level: 6, hp: 80, xpReward: 90, stats: { INT: 3, REF: 6, DEX: 5, BODY: 6, EMP: 2, CRA: 1, WILL: 3 },
      skills: { dodge: 4, resist: 4, battleWeapon: 7, athletics: 4 },
      weapons: [w('Меч дворцовой гвардии с грифоном', '2d6', 'Battle', 'Р', 4)],
      armorHead: { type: 'heavy', hp: 29, name: 'Грифоний шлем-арме дворцовой гвардии' },
      armorBody: { type: 'heavy', hp: 39, name: 'Грифоньи латы дворцовой гвардии' },
      shield: { type: 'medium', hp: 26, name: 'Грифоний тарч дворцовой гвардии' } }),
  ]);

  addCat('Боссы', [
    npc({ name: 'Эрегин', level: 20, hp: 500, xpReward: 2000, hasMagic: true,
      stats: { INT: 8, REF: 12, DEX: 10, BODY: 12, EMP: 4, CRA: 4, WILL: 18 },
      skills: { dodge: 8, resist: 10, brawl: 6, battleWeapon: 14, simpleWeapon: 4, thrown: 4, athletics: 8, spellcast: 16, mresist: 12 },
      weapons: [
        w('Сабля Эрегина (правая)', '2d8', 'Battle', 'Р', 8),
        w('Сабля Эрегина (левая)', '2d8', 'Battle', 'Р', 8),
      ],
      armorBody: { type: 'heavy', hp: 90, name: 'Панцирь Эрегина' } }),
  ]);

  return cats;
}

export { buildNpcDefaults };
