import React, { useState } from 'react';
import { ARMOR_T, SHIELD_T } from '../../data/combat';
import { DT, WT } from '../../data/stats';
import { uid } from '../../utils/dice';
import { CUR_ORDER, CUR_LABEL, CUR_ICON, CUR_NAME, emptyCurrency, fmtCurrency, toCopper } from '../../utils/currency';
import { buildShopDefaults, buildMiscDefaults } from '../../data/shopDefaults';
import LiveField from '../LiveField';

const backBtn = { padding: '5px 12px', borderRadius: 6, border: '2px solid #34374a', background: '#1b1d29', color: '#e9e9ed', fontWeight: 700, fontSize: 11, cursor: 'pointer' };
const inp = { width: '100%', padding: '6px 8px', border: '2px solid #34374a', borderRadius: 6, fontSize: 12, fontFamily: "'Inter',sans-serif", background: '#232532', color: '#e9e9ed', outline: 'none' };
const lbl = { display: 'block', fontSize: 8, fontWeight: 700, color: '#9397ab', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 };

const CATS = [
  { id: 'armor', name: '🛡️ Броня', color: '#10b981' },
  { id: 'weapon', name: '⚔️ Оружие', color: '#3b82f6' },
  { id: 'shield', name: '🛡 Щиты', color: '#0ea5e9' },
  { id: 'item', name: '🎒 Вещи', color: '#f59e0b' },
];

const PROJ_TYPES = ['Стрела', 'Болт', 'Пуля'];

const REPAIR_DICE = ['1d4', '1d6', '1d8', '1d10', '1d12'];
const HEAL_DICE = ['1d4', '1d6', '2d4', '2d6', '3d6', '4d6'];

// подкатегории для группировки
const SUBLABEL = {
  armor: { head: '🧠 Голова', body: '🫀 Тело' },
  weapon: { Battle: '⚔️ Боевое оружие', Simple: '🗡️ Простое оружие', Guns: '🔫 Огнестрел', Archery: '🏹 Лук', Thrown: '🪃 Метательное', Brawl: '👊 Рукопашное' },
  shield: { light: '🟢 Лёгкий щит', medium: '🟡 Средний щит', tower: '🔵 Башенный щит' },
};
const SUBORDER = { armor: ['head', 'body'], weapon: ['Battle', 'Simple', 'Guns', 'Archery', 'Thrown', 'Brawl'], shield: ['light', 'medium', 'tower'] };
const SLOT_LABEL = { head: 'Голова', body: 'Тело' };
function subOf(it) { if (it.cat === 'armor') return it.slot || 'body'; if (it.cat === 'shield') return it.type; if (it.cat === 'weapon') return it.wtype; return null; }

function field(label, node) { return <div style={{ flex: 1 }}><label style={lbl}>{label}</label>{node}</div>; }
function priceOf(it) { return (it.price && typeof it.price === 'object') ? it.price : emptyCurrency(); }

export default function ShopEditor(pr) {
  const shop = Array.isArray(pr.shop) ? pr.shop : [];
  const saveShop = pr.saveShop;
  const [cat, setCat] = useState('armor');
  const [editId, setEditId] = useState(null);
  const [q, setQ] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const persist = function (arr) { saveShop(arr); };
  const upd = function (id, patch) { persist(shop.map(function (i) { return i.id === id ? Object.assign({}, i, patch) : i; })); };
  const del = function (id) { if (window.confirm('Удалить вещь из магазина?')) persist(shop.filter(function (i) { return i.id !== id; })); };
  const priceField = function (it) {
    const p = priceOf(it);
    return (
      <div style={{ flex: 1 }}>
        <label style={lbl}>Цена</label>
        <div style={{ display: 'flex', gap: 3 }}>
          {CUR_ORDER.map(function (k) {
            return (
              <div key={k} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 11 }}>{CUR_ICON[k]}</span>
                <LiveField type="number" min="0" value={p[k] || 0} onCommit={function (val) { const np = Object.assign({}, p); np[k] = Math.max(0, parseInt(val) || 0); upd(it.id, { price: np }); }} title={CUR_NAME[k]} placeholder={CUR_LABEL[k]} style={Object.assign({}, inp, { minWidth: 0, textAlign: 'center', padding: '6px 2px' })} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const add = function () {
    const base = {
      armor: { cat: 'armor', name: 'Новая броня', type: 'light', slot: 'body', hp: 10, price: emptyCurrency(), desc: '' },
      weapon: { cat: 'weapon', name: 'Новое оружие', wtype: 'Battle', dmgDice: '1d6', dmgType: 'Р', hands: 1, bonus: 0, dmgDice2h: '2d6', bonus2h: 0, price: emptyCurrency(), desc: '' },
      shield: { cat: 'shield', name: 'Новый щит', type: 'light', hp: 15, price: emptyCurrency(), desc: '' },
      item: { cat: 'item', name: 'Новый предмет', desc: '', price: emptyCurrency(), ptype: '', dice: '' },
    }[cat];
    const it = Object.assign({ id: uid() }, base);
    persist(shop.concat([it]));
    setEditId(it.id);
  };
  const seedAll = function () {
    const existingNames = shop.map(function (i) { return (i.name || '').trim().toLowerCase(); });
    const toAdd = buildShopDefaults().concat(buildMiscDefaults()).filter(function (d) { return existingNames.indexOf(d.name.trim().toLowerCase()) < 0; });
    if (toAdd.length === 0) { alert('Всё это уже есть в магазине.'); return; }
    if (!window.confirm('Добавить ' + toAdd.length + ' готовых вещей из каталога (броня, оружие, щиты, зелья, боеприпасы, ремкомплекты, бытовые мелочи)? Существующие вещи не тронет.')) return;
    persist(shop.concat(toAdd));
  };

  const itemsByCat = shop.filter(function (i) { return cat === 'item' ? (i.cat === 'item' || i.cat === 'tool' || i.cat === 'ammo') : i.cat === cat; });
  const items = q.trim() ? itemsByCat.filter(function (i) { return (i.name || '').toLowerCase().includes(q.trim().toLowerCase()); }) : itemsByCat;
  const catColor = (CATS.find(function (c) { return c.id === cat; }) || CATS[0]).color;

  function summary(it) {
    if (it.cat === 'armor') { const a = ARMOR_T.find(function (x) { return x.id === it.type; }); return (SLOT_LABEL[it.slot || 'body']) + ' · ' + (a ? a.name : it.type) + ' · ' + it.hp + ' HP'; }
    if (it.cat === 'shield') { const s = SHIELD_T.find(function (x) { return x.id === it.type; }); return (s ? s.name + ' ' + (s.absorb * 100) + '%' : it.type) + ' · ' + it.hp + ' HP' + (it.desc ? ' · ' + it.desc : ''); }
    if (it.cat === 'weapon') { const h = it.hands === 2 ? 'двуруч.' : it.hands === 1.5 ? 'полуторн.' : 'одноруч.'; return it.wtype + ' · ' + it.dmgDice + (it.bonus ? '+' + it.bonus : '') + ' · ' + it.dmgType + ' · ' + h + (it.desc ? ' · ' + it.desc : ''); }
    // item (и легаси tool/ammo) — обычная вещь, необязательно с функцией снаряда или ремкомплекта
    const parts = [];
    if (it.desc) parts.push(it.desc);
    if (it.ptype || it.cat === 'ammo') parts.push('🏹 Снаряд: ' + (it.ptype || 'Стрела') + (it.bundleQty > 1 ? ' ×' + it.bundleQty : ''));
    if (it.dice || it.cat === 'tool') parts.push('🔧 Починка ' + (it.dice || '1d4'));
    if (it.heal) parts.push('🧪 ' + it.heal + (it.healWill ? ' Воли' : ' HP'));
    return parts.join(' · ');
  }

  function editForm(it) {
    if (it.cat === 'armor') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {field('Название', <LiveField value={it.name} onCommit={function (val) { upd(it.id, { name: val }); }} style={inp} />)}
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Слот', <select value={it.slot || 'body'} onChange={function (e) { upd(it.id, { slot: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}><option value="head">Голова</option><option value="body">Тело</option></select>)}
            {field('Тип', <select value={it.type} onChange={function (e) { upd(it.id, { type: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{ARMOR_T.filter(function (a) { return a.id !== 'none'; }).map(function (a) { return <option key={a.id} value={a.id}>{a.name + ' (Body≥' + a.bodyReq + ')'}</option>; })}</select>)}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {field('HP брони', <LiveField type="number" value={it.hp} onCommit={function (val) { upd(it.id, { hp: parseInt(val) || 1 }); }} style={inp} />)}
          </div>
          {priceField(it)}
          {field('Описание (для игроков)', <LiveField tag="textarea" value={it.desc || ''} onCommit={function (val) { upd(it.id, { desc: val }); }} placeholder="Как выглядит, откуда взялась…" style={Object.assign({}, inp, { minHeight: 40, resize: 'vertical' })} />)}
        </div>
      );
    }
    if (it.cat === 'shield') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {field('Название', <LiveField value={it.name} onCommit={function (val) { upd(it.id, { name: val }); }} style={inp} />)}
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Тип', <select value={it.type} onChange={function (e) { upd(it.id, { type: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{SHIELD_T.map(function (s) { return <option key={s.id} value={s.id}>{s.name + ' ' + (s.absorb * 100) + '% (Body≥' + s.bodyReq + ')'}</option>; })}</select>)}
            {field('HP щита', <LiveField type="number" value={it.hp} onCommit={function (val) { upd(it.id, { hp: parseInt(val) || 1 }); }} style={inp} />)}
          </div>
          {priceField(it)}
          {field('Описание (для игроков)', <LiveField tag="textarea" value={it.desc || ''} onCommit={function (val) { upd(it.id, { desc: val }); }} placeholder="Как выглядит, откуда взялся…" style={Object.assign({}, inp, { minHeight: 40, resize: 'vertical' })} />)}
        </div>
      );
    }
    if (it.cat === 'weapon') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {field('Название', <LiveField value={it.name} onCommit={function (val) { upd(it.id, { name: val }); }} style={inp} />)}
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Тип', <select value={it.wtype} onChange={function (e) { upd(it.id, { wtype: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{WT.map(function (t) { return <option key={t} value={t}>{SUBLABEL.weapon[t] || t}</option>; })}</select>)}
            {field('Урон', <select value={it.dmgType} onChange={function (e) { upd(it.id, { dmgType: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{DT.map(function (t) { return <option key={t} value={t}>{t}</option>; })}</select>)}
            {field('Руки', <select value={it.hands} onChange={function (e) { upd(it.id, { hands: parseFloat(e.target.value) }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}><option value={1}>1</option><option value={1.5}>1.5</option><option value={2}>2</option></select>)}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Кубик', <LiveField value={it.dmgDice} onCommit={function (val) { upd(it.id, { dmgDice: val }); }} placeholder="1d6" style={inp} />)}
            {field('Бонус', <LiveField type="number" value={it.bonus} onCommit={function (val) { upd(it.id, { bonus: parseInt(val) || 0 }); }} style={inp} />)}
          </div>
          {priceField(it)}
          {(it.dmgType === 'П' || it.wtype === 'Archery') && (
            <div style={{ display: 'flex', gap: 6 }}>
              {field(it.wtype === 'Archery' ? '🏹 Колчан (выстрелов)' : '🔫 Обойма (патронов)', <LiveField type="number" value={it.clip || 1} onCommit={function (val) { upd(it.id, { clip: parseInt(val) || 1 }); }} style={inp} />)}
              {it.wtype === 'Archery' && field('Тип боеприпаса', <select value={it.ammoType || 'Стрела'} onChange={function (e) { upd(it.id, { ammoType: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}><option value="Стрела">Стрела (лук)</option><option value="Болт">Болт (арбалет)</option></select>)}
            </div>
          )}
          {it.hands === 1.5 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {field('Кубик (2 руки)', <LiveField value={it.dmgDice2h} onCommit={function (val) { upd(it.id, { dmgDice2h: val }); }} placeholder="2d6" style={inp} />)}
              {field('Бонус (2 руки)', <LiveField type="number" value={it.bonus2h} onCommit={function (val) { upd(it.id, { bonus2h: parseInt(val) || 0 }); }} style={inp} />)}
            </div>
          )}
          {field('Описание (для игроков)', <LiveField tag="textarea" value={it.desc || ''} onCommit={function (val) { upd(it.id, { desc: val }); }} placeholder="Как выглядит, откуда взялось…" style={Object.assign({}, inp, { minHeight: 40, resize: 'vertical' })} />)}
        </div>
      );
    }
    // item (и легаси tool/ammo) — единая форма: обычная вещь + необязательные функции
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
        {field('Название', <LiveField value={it.name} onCommit={function (val) { upd(it.id, { name: val }); }} style={inp} />)}
        {field('Описание', <LiveField tag="textarea" value={it.desc} onCommit={function (val) { upd(it.id, { desc: val }); }} style={Object.assign({}, inp, { minHeight: 40, resize: 'vertical' })} />)}
        {priceField(it)}
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          {field('Тип снаряда (необязательно)', <select value={it.ptype || ''} onChange={function (e) { upd(it.id, { ptype: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}><option value="">— нет —</option>{PROJ_TYPES.map(function (p) { return <option key={p} value={p}>{p}</option>; })}</select>)}
          {it.ptype && field('Штук за покупку', <LiveField type="number" min="1" value={it.bundleQty || 1} onCommit={function (val) { upd(it.id, { bundleQty: Math.max(1, parseInt(val) || 1) }); }} style={inp} />)}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {field('Кубик починки (необязательно)', <select value={it.dice || ''} onChange={function (e) { upd(it.id, { dice: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}><option value="">— нет —</option>{REPAIR_DICE.map(function (d) { return <option key={d} value={d}>{d}</option>; })}</select>)}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          {field('🧪 Кубик лечения (необязательно)', <select value={it.heal || ''} onChange={function (e) { upd(it.id, { heal: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}><option value="">— нет —</option>{HEAL_DICE.map(function (d) { return <option key={d} value={d}>{d}</option>; })}</select>)}
          {it.heal && <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#9397ab', paddingBottom: 8, whiteSpace: 'nowrap' }}><input type="checkbox" checked={!!it.healWill} onChange={function (e) { upd(it.id, { healWill: e.target.checked }); }} />Лечит Волю, а не HP</label>}
        </div>
        <div style={{ fontSize: 8, color: '#9397ab', fontStyle: 'italic' }}>Тип снаряда делает вещь боеприпасом (тратится при перезарядке нужного оружия). Кубик починки делает вещь ремкомплектом (чинит снаряжение 1 раз в день). Кубик лечения делает вещь зельем — игрок сможет «Использовать» его из инвентаря, чтобы восстановить HP (или Волю). Поля можно оставить пустыми — тогда это просто предмет.</div>
      </div>
    );
  }

  function itemRow(it) {
    const open = editId === it.id;
    return (
      <div key={it.id} style={{ border: '2px solid #34374a', borderRadius: 9, background: '#1b1d29', padding: '7px 9px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, color: '#e9e9ed' }}>{it.name}{toCopper(priceOf(it)) > 0 ? <span style={{ fontSize: 9, color: '#d97706', marginLeft: 5 }}>{'💰 ' + fmtCurrency(priceOf(it))}</span> : null}</div>
            <div style={{ fontSize: 8, color: '#9397ab' }}>{summary(it)}</div>
          </div>
          <button onClick={function () { del(it.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>🗑</button>
          <button onClick={function () { setEditId(open ? null : it.id); }} style={{ padding: '4px 9px', borderRadius: 6, border: '1px solid ' + catColor + '40', background: catColor + '18', color: catColor, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>{open ? '✕' : '✏️'}</button>
        </div>
        {open && editForm(it)}
      </div>
    );
  }

  // группировка по подкатегориям — длинные подсписки (>6 вещей) по умолчанию
  // свёрнуты, чтобы страница не превращалась в один гигантский скролл
  const subs = SUBORDER[cat];
  let grouped = null;
  if (subs) {
    grouped = subs.map(function (sk) {
      const list = items.filter(function (i) { return subOf(i) === sk; });
      if (!list.length) return null;
      const key = cat + ':' + sk;
      const collapsed = collapsedGroups[key] !== undefined ? collapsedGroups[key] : (list.length > 6 && !q.trim());
      return (
        <div key={sk} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={function () { setCollapsedGroups(function (c) { const n = Object.assign({}, c); n[key] = !collapsed; return n; }); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', padding: '4px 2px', marginTop: 4, cursor: 'pointer' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: catColor }}>{SUBLABEL[cat][sk]}</span>
            <span style={{ fontSize: 9, color: '#75798c' }}>{(collapsed ? '▸ показать ' : '▾ скрыть ') + list.length}</span>
          </button>
          {!collapsed && list.map(itemRow)}
        </div>
      );
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={pr.onBack} style={Object.assign({}, backBtn, { alignSelf: 'flex-start' })}>← Назад</button>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 16, color: '#f0b352' }}>🛒 Магазин / Вещи</div>
        <div style={{ fontSize: 9, color: '#9397ab' }}>Добавляй вещи — игроки берут их из своего листа</div>
        <button onClick={seedAll} style={{ marginTop: 4, background: 'none', border: 'none', color: '#75798c', fontSize: 9, cursor: 'pointer', textDecoration: 'underline' }}>📦 добавить ещё из готового каталога</button>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {CATS.map(function (cc) {
          const on = cat === cc.id;
          return <button key={cc.id} onClick={function () { setCat(cc.id); setEditId(null); }} style={{ flex: '1 1 40%', padding: '6px 2px', borderRadius: 7, border: '2px solid ' + cc.color + (on ? '' : '20'), background: on ? cc.color + '20' : '#1b1d29', color: cc.color, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>{cc.name}</button>;
        })}
      </div>

      <button onClick={add} style={{ padding: 9, borderRadius: 8, border: '2px dashed ' + catColor + '60', background: catColor + '12', color: catColor, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>➕ Добавить</button>
      <input value={q} onChange={function (e) { setQ(e.target.value); }} placeholder="🔎 Поиск по названию…" style={inp} />

      {items.length === 0 && <div style={{ textAlign: 'center', padding: 14, color: '#9397ab', fontSize: 11, fontStyle: 'italic' }}>{q.trim() ? 'Ничего не найдено' : 'Пусто — добавь первую вещь'}</div>}
      {grouped ? grouped : items.map(itemRow)}
    </div>
  );
}
