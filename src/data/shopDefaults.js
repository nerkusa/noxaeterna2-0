import { uid } from '../utils/dice';

/* Стартовый набор магазина: броня/оружие/щиты с уже подобранными
   характеристиками (урон/HP/цена сбалансированы друг относительно друга
   по тиру simple/battle/archery/guns и типу брони light/medium/heavy),
   плюс расходники — зелья (лечат HP или Волю через кубик), боеприпасы
   (тратятся при перезарядке лука/арбалета/огнестрела) и ремкомплекты
   (чинят броню/щиты/оружие — 1 раз в день, см. вкладку «Броня»).
   Цены — {gold,silver,bronze,copper}, 1з=10с=1000бр=10000м. */

function price(gold, silver, bronze) {
  return { gold: gold || 0, silver: silver || 0, bronze: bronze || 0, copper: 0 };
}

function buildShopDefaults() {
  const items = [
    // ── Броня (голова) ──
    { cat: 'armor', name: 'Кожаный капюшон', type: 'light', slot: 'head', hp: 10, price: price(0, 3, 0), desc: 'Простой кожаный капюшон — почти не мешает, почти не защищает.' },
    { cat: 'armor', name: 'Кольчужный капюшон', type: 'medium', slot: 'head', hp: 16, price: price(0, 8, 0), desc: 'Плетёная сталь на плотной подкладке.' },
    { cat: 'armor', name: 'Полный шлем', type: 'heavy', slot: 'head', hp: 24, price: price(2, 0, 0), desc: 'Закрытый шлем с узкой прорезью для обзора — надёжно, но целиться в нём неудобно.' },
    // ── Броня (тело) ──
    { cat: 'armor', name: 'Стёганый доспех', type: 'light', slot: 'body', hp: 14, price: price(0, 5, 0), desc: 'Многослойная простёганная ткань — лёгкий и дешёвый вариант.' },
    { cat: 'armor', name: 'Кольчуга', type: 'medium', slot: 'body', hp: 22, price: price(1, 5, 0), desc: 'Классическая кольчужная рубаха до колен.' },
    { cat: 'armor', name: 'Латные доспехи', type: 'heavy', slot: 'body', hp: 34, price: price(5, 0, 0), desc: 'Полный набор кованых пластин — тяжёлые, но почти неуязвимые.' },
    // ── Щиты ──
    { cat: 'shield', name: 'Баклер', type: 'light', hp: 10, price: price(0, 3, 0), desc: 'Маленький кулачный щит — не мешает двигаться.' },
    { cat: 'shield', name: 'Круглый щит', type: 'medium', hp: 18, price: price(0, 8, 0), desc: 'Прочный щит на ремне — стандарт для пехоты.' },
    { cat: 'shield', name: 'Башенный щит', type: 'tower', hp: 28, price: price(2, 0, 0), desc: 'Щит в человеческий рост — за ним можно спрятаться целиком.' },
    // ── Оружие: простое ──
    { cat: 'weapon', name: 'Кинжал', wtype: 'Simple', dmgType: 'К', dmgDice: '1d4', hands: 1, bonus: 0, price: price(0, 1, 0), desc: 'Короткий клинок — всегда под рукой.' },
    { cat: 'weapon', name: 'Дубина', wtype: 'Simple', dmgType: 'Д', dmgDice: '1d6', hands: 1, bonus: 0, price: price(0, 0, 5), desc: 'Просто тяжёлая палка.' },
    { cat: 'weapon', name: 'Топорик', wtype: 'Simple', dmgType: 'Р', dmgDice: '1d6', hands: 1, bonus: 0, price: price(0, 1, 0), desc: 'Небольшой рабочий топор, годится и в бою.' },
    // ── Оружие: боевое ──
    { cat: 'weapon', name: 'Меч', wtype: 'Battle', dmgType: 'Р', dmgDice: '1d8', hands: 1, bonus: 0, price: price(0, 5, 0), desc: 'Добротный клинок пехотинца.' },
    { cat: 'weapon', name: 'Рапира', wtype: 'Battle', dmgType: 'К', dmgDice: '1d8', hands: 1, bonus: 0, price: price(0, 5, 0), desc: 'Лёгкий колющий клинок для дуэлянтов.' },
    { cat: 'weapon', name: 'Боевой топор', wtype: 'Battle', dmgType: 'Р', dmgDice: '1d10', hands: 1.5, bonus: 0, dmgDice2h: '2d6', bonus2h: 0, price: price(0, 8, 0), desc: 'Можно бить одной рукой или взять в обе для мощного замаха.' },
    { cat: 'weapon', name: 'Боевой молот', wtype: 'Battle', dmgType: 'Д', dmgDice: '1d10', hands: 1.5, bonus: 0, dmgDice2h: '2d8', bonus2h: 0, price: price(0, 8, 0), desc: 'Дробит броню не хуже, чем кости.' },
    { cat: 'weapon', name: 'Двуручный меч', wtype: 'Battle', dmgType: 'Р', dmgDice: '2d6', hands: 2, bonus: 0, price: price(1, 2, 0), desc: 'Огромный клинок — нужны обе руки, зато и урон соответствующий.' },
    { cat: 'weapon', name: 'Алебарда', wtype: 'Battle', dmgType: 'Р', dmgDice: '2d8', hands: 2, bonus: 0, price: price(1, 5, 0), desc: 'Древковое оружие пехоты — держит дистанцию.' },
    // ── Оружие: стрелковое (нужен колчан — см. раздел боеприпасов) ──
    { cat: 'weapon', name: 'Короткий лук', wtype: 'Archery', dmgType: 'С', dmgDice: '1d6', hands: 2, bonus: 0, clip: 1, ammoType: 'Стрела', price: price(0, 5, 0), desc: 'Компактный лук для верховых и разведчиков.' },
    { cat: 'weapon', name: 'Длинный лук', wtype: 'Archery', dmgType: 'С', dmgDice: '1d8', hands: 2, bonus: 0, clip: 1, ammoType: 'Стрела', price: price(0, 8, 0), desc: 'Требует силы, но бьёт далеко и больно.' },
    { cat: 'weapon', name: 'Арбалет', wtype: 'Archery', dmgType: 'С', dmgDice: '1d10', hands: 2, bonus: 0, clip: 1, ammoType: 'Болт', price: price(1, 0, 0), desc: 'Медленно взводится, зато не требует долгой тренировки.' },
    // ── Оружие: метательное и рукопашное ──
    { cat: 'weapon', name: 'Метательные ножи', wtype: 'Thrown', dmgType: 'К', dmgDice: '1d4', hands: 1, bonus: 0, price: price(0, 0, 3), desc: 'Продаются связкой — удобно иметь про запас.' },
    { cat: 'weapon', name: 'Кастеты', wtype: 'Brawl', dmgType: 'Д', dmgDice: '1d4', hands: 1, bonus: 0, price: price(0, 0, 2), desc: 'Утяжеляют кулак, не занимая руку целиком.' },
    // ── Оружие: огнестрельное (нужны патроны) ──
    { cat: 'weapon', name: 'Пистолет', wtype: 'Guns', dmgType: 'П', dmgDice: '1d8', hands: 1, bonus: 0, clip: 1, price: price(1, 5, 0), desc: 'Кремнёвый пистолет — один точный выстрел на всю перезарядку.' },
    { cat: 'weapon', name: 'Мушкет', wtype: 'Guns', dmgType: 'П', dmgDice: '2d6', hands: 2, bonus: 0, clip: 1, price: price(3, 0, 0), desc: 'Тяжёлый и медленный, но пробивает почти любую броню.' },
    // ── Боеприпасы (расходуются при «Перезарядить» у нужного оружия) ──
    { cat: 'item', name: 'Стрелы (колчан)', ptype: 'Стрела', price: price(0, 0, 5), desc: 'Десяток охотничьих стрел.' },
    { cat: 'item', name: 'Болты (колчан)', ptype: 'Болт', price: price(0, 0, 8), desc: 'Арбалетные болты с гранёным наконечником.' },
    { cat: 'item', name: 'Патроны', ptype: 'Пуля', price: price(0, 2, 0), desc: 'Заряды пороха и свинца для огнестрела.' },
    // ── Ремкомплекты (вкладка «Броня» → «Ремонт снаряжения», 1/день) ──
    { cat: 'item', name: 'Точильный камень', dice: '1d4', price: price(0, 0, 3), desc: 'Для правки лезвия в полевых условиях.' },
    { cat: 'item', name: 'Набор инструментов', dice: '1d6', price: price(0, 0, 8), desc: 'Отвёртки, клещи, запасные ремни и заклёпки.' },
    { cat: 'item', name: 'Кузнечный набор', dice: '1d8', price: price(0, 2, 0), desc: 'Компактная наковальня и молоток — для серьёзного ремонта.' },
    // ── Зелья и тоники (кнопка «Исп.» в инвентаре) ──
    { cat: 'item', name: 'Малое зелье лечения', heal: '1d4', price: price(0, 0, 5), desc: 'Мутный отвар с горьким привкусом — но работает.' },
    { cat: 'item', name: 'Зелье лечения', heal: '2d4', price: price(0, 2, 0), desc: 'Стандартная алхимическая настойка.' },
    { cat: 'item', name: 'Большое зелье лечения', heal: '3d6', price: price(0, 5, 0), desc: 'Дорогая, но затягивает раны почти мгновенно.' },
    { cat: 'item', name: 'Тоник ясности', heal: '1d4', healWill: true, price: price(0, 3, 0), desc: 'Успокаивает разум, возвращает Волю.' },
    { cat: 'item', name: 'Эликсир стойкости духа', heal: '2d6', healWill: true, price: price(0, 6, 0), desc: 'Редкий состав для тех, кто на пределе.' },
  ];
  return items.map(function (it) { return Object.assign({ id: uid() }, it); });
}

export { buildShopDefaults };
