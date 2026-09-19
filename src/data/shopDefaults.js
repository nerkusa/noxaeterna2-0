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

/* Бытовые мелочи/безделушки — чисто предметы для отыгрыша и находчивости
   (верёвка, огниво, инструменты...), без встроенной механики: то, что
   игрок обычно таскает с собой "на всякий случай". Отдельный набор от
   buildShopDefaults(), чтобы можно было добавить только его, не трогая
   уже выданные броню/оружие/зелья. */
function buildMiscDefaults() {
  const items = [
    { cat: 'item', name: 'Верёвка пеньковая (15 м)', price: price(0, 3, 0), desc: 'Прочная, но тяжёлая и шершавая.' },
    { cat: 'item', name: 'Верёвка шёлковая (15 м)', price: price(1, 0, 0), desc: 'Лёгкая, прочная, почти бесшумная.' },
    { cat: 'item', name: 'Крюк-кошка', price: price(0, 5, 0), desc: 'Трёхлапый крюк на цепочке — цепляется за карниз или борт.' },
    { cat: 'item', name: 'Пустая бутылка', price: price(0, 0, 1), desc: 'Стеклянная, с пробкой. Для зелий, посланий или коктейлей Молотова.' },
    { cat: 'item', name: 'Фляга с водой', price: price(0, 0, 3), desc: 'Металлическая, на ремешке.' },
    { cat: 'item', name: 'Бурдюк', price: price(0, 0, 5), desc: 'Кожаный мех для воды или вина — больше фляги.' },
    { cat: 'item', name: 'Факел', price: price(0, 0, 1), desc: 'Горит около часа, светит на 6 метров.' },
    { cat: 'item', name: 'Огниво и трут', price: price(0, 0, 5), desc: 'Высечь искру получится не с первой попытки.' },
    { cat: 'item', name: 'Масляный фонарь', price: price(1, 0, 0), desc: 'Ровный свет, не боится ветра — если есть масло.' },
    { cat: 'item', name: 'Фляга масла для лампы', price: price(0, 0, 5), desc: 'Хватит на несколько часов горения.' },
    { cat: 'item', name: 'Свеча', price: price(0, 0, 1), desc: 'Огарок на полчаса света.' },
    { cat: 'item', name: 'Спальный мешок', price: price(0, 3, 0), desc: 'Тёплая ночёвка без стога сена.' },
    { cat: 'item', name: 'Палатка (на двоих)', price: price(1, 0, 0), desc: 'Ставится за пару минут, держит дождь.' },
    { cat: 'item', name: 'Сухой паёк (на день)', price: price(0, 0, 2), desc: 'Вяленое мясо, сухари, немного соли.' },
    { cat: 'item', name: 'Заплечный мешок', price: price(0, 0, 2), desc: 'Простой холщовый мешок с лямкой.' },
    { cat: 'item', name: 'Рюкзак', price: price(0, 5, 0), desc: 'Крепкие лямки, несколько отделений.' },
    { cat: 'item', name: 'Цепь (3 м)', price: price(0, 8, 0), desc: 'Железная, со скобами на концах.' },
    { cat: 'item', name: 'Кандалы', price: price(0, 5, 0), desc: 'На руки, с одним ключом.' },
    { cat: 'item', name: 'Отмычки', price: price(0, 8, 0), desc: 'Набор щупов и отмычек для простых замков.' },
    { cat: 'item', name: 'Карманное зеркальце', price: price(0, 0, 5), desc: 'Пускать зайчики или заглянуть за угол.' },
    { cat: 'item', name: 'Увеличительное стекло', price: price(0, 3, 0), desc: 'Разглядеть мелкие детали или разжечь костёр в солнечный день.' },
    { cat: 'item', name: 'Подзорная труба', price: price(1, 5, 0), desc: 'Потёртая медная труба — видно далеко, если не трясутся руки.' },
    { cat: 'item', name: 'Рыболовный набор', price: price(0, 5, 0), desc: 'Леска, крючки, грузила — прокормиться у воды.' },
    { cat: 'item', name: 'Набор для шитья', price: price(0, 3, 0), desc: 'Иглы, нитки, наперсток — залатать одежду или рану на скорую руку.' },
    { cat: 'item', name: 'Лом', price: price(0, 3, 0), desc: 'Вскрыть ящик, дверь или то, что вскрывать не следовало.' },
    { cat: 'item', name: 'Лопата', price: price(0, 5, 0), desc: 'Копать могилы, ямы или сокровища.' },
    { cat: 'item', name: 'Святой символ', price: price(0, 1, 0), desc: 'Простой оберег — у кого-то фамильный, у кого-то с базара.' },
    { cat: 'item', name: 'Пучок благовоний', price: price(0, 0, 2), desc: 'Для ритуала или просто перебить вонь подземелья.' },
    { cat: 'item', name: 'Колода игральных карт', price: price(0, 0, 1), desc: 'Потрёпанная, но полная.' },
    { cat: 'item', name: 'Набор игральных костей', price: price(0, 0, 1), desc: 'Кости из кости — не всегда честные.' },
    { cat: 'item', name: 'Сигнальный свисток', price: price(0, 0, 2), desc: 'Услышат издалека — и свои, и чужие.' },
    { cat: 'item', name: 'Кусок мыла', price: price(0, 0, 1), desc: 'Роскошь после недели в пути.' },
    { cat: 'item', name: 'Флакон духов', price: price(0, 5, 0), desc: 'Перебивает запах дороги — хотя бы для первого впечатления.' },
    { cat: 'item', name: 'Чернильница и перо', price: price(0, 0, 5), desc: 'Записать важное, пока не забылось.' },
    { cat: 'item', name: 'Лист пергамента', price: price(0, 0, 2), desc: 'Для писем, карт или контрактов.' },
    { cat: 'item', name: 'Сургуч с личной печатью', price: price(0, 0, 3), desc: 'Заверить письмо — или подделать чужое.' },
    { cat: 'item', name: 'Тубус для карт', price: price(0, 3, 0), desc: 'Кожаный футляр — свитки и карты не помнутся.' },
    { cat: 'item', name: 'Компас', price: price(0, 8, 0), desc: 'Стрелка иногда шалит рядом с руинами, но в целом надёжен.' },
    { cat: 'item', name: 'Песочные часы (час)', price: price(0, 5, 0), desc: 'Отмерить время, когда нельзя отвлекаться на разговоры.' },
    { cat: 'item', name: 'Колокольчик', price: price(0, 0, 2), desc: 'Привязать к двери, ловушке или козе.' },
    { cat: 'item', name: 'Рыболовная сеть', price: price(0, 8, 0), desc: 'Для рыбы. Или не только для рыбы.' },
    { cat: 'item', name: 'Мешочек калтропов', price: price(0, 5, 0), desc: 'Горсть шипов под ноги преследователю.' },
    { cat: 'item', name: 'Дымная шашка', price: price(0, 8, 0), desc: 'Густой дым на несколько секунд — прикрыть отход.' },
    { cat: 'item', name: 'Моток бинтов', price: price(0, 0, 2), desc: 'Остановить кровь — не лечит, но и не даёт истечь.' },
    { cat: 'item', name: 'Кусок мела', price: price(0, 0, 1), desc: 'Оставить метку на стене, полу или спине не заметившего.' },
    { cat: 'item', name: 'Клетка для мелкого зверя', price: price(0, 5, 0), desc: 'Для ловчей птицы, крысы или чего похуже.' },
    { cat: 'item', name: 'Кукла-марионетка', price: price(0, 3, 0), desc: 'Потрёпанная, но забавная — для уличного представления.' },
    { cat: 'item', name: 'Курительная трубка', price: price(0, 2, 0), desc: 'С трубочным табаком или без.' },
    { cat: 'item', name: 'Гребень', price: price(0, 0, 3), desc: 'Костяной гребень для волос.' },
    { cat: 'item', name: 'Точильный оселок (для бритвы)', price: price(0, 0, 2), desc: 'Мелкий камень для тонкой заточки, не для оружия.' },
    { cat: 'item', name: 'Медный котелок', price: price(0, 3, 0), desc: 'Вскипятить воду или сварить похлёбку на привале.' },
  ];
  return items.map(function (it) { return Object.assign({ id: uid() }, it); });
}

export { buildShopDefaults, buildMiscDefaults };
