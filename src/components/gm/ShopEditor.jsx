import React, { useState } from 'react';
import { ARMOR_T } from '../../data/combat';
import { DT, WT } from '../../data/stats';
import { uid } from '../../utils/dice';

const backBtn = { padding: '5px 12px', borderRadius: 6, border: '2px solid #322d24', background: '#1d1a14', color: '#ece5d8', fontWeight: 700, fontSize: 11, cursor: 'pointer' };
const inp = { width: '100%', padding: '6px 8px', border: '2px solid #322d24', borderRadius: 6, fontSize: 12, fontFamily: "'Nunito',sans-serif", background: '#262219', color: '#ece5d8', outline: 'none' };
const lbl = { display: 'block', fontSize: 8, fontWeight: 700, color: '#a89a82', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 };

const CATS = [
  { id: 'armor', name: '🛡️ Броня', color: '#10b981' },
  { id: 'weapon', name: '⚔️ Оружие', color: '#3b82f6' },
  { id: 'shield', name: '🛡 Щиты', color: '#0ea5e9' },
  { id: 'item', name: '🎒 Расходники', color: '#f59e0b' },
  { id: 'tool', name: '🔧 Инструменты', color: '#a78bfa' },
  { id: 'ammo', name: '🏹 Боеприпасы', color: '#84cc16' },
];

const PROJ_TYPES = ['Стрела', 'Болт', 'Пуля'];

const REPAIR_DICE = ['1d4', '1d6', '1d8', '1d10', '1d12'];

export const SHIELD_T = [
  { id: 'light', name: 'Лёгкий', absorb: 0.5, bodyReq: 4 },
  { id: 'medium', name: 'Средний', absorb: 0.75, bodyReq: 6 },
  { id: 'tower', name: 'Башенный', absorb: 1.0, bodyReq: 8 },
];

// подкатегории для группировки
const SUBLABEL = {
  armor: { light: '🟢 Лёгкая броня', medium: '🟡 Средняя броня', heavy: '🔴 Тяжёлая броня' },
  weapon: { Battle: '⚔️ Боевое оружие', Simple: '🗡️ Простое оружие', Guns: '🔫 Огнестрел', Archery: '🏹 Лук', Brawl: '👊 Рукопашное' },
  shield: { light: '🟢 Лёгкий щит', medium: '🟡 Средний щит', tower: '🔵 Башенный щит' },
};
const SUBORDER = { armor: ['light', 'medium', 'heavy'], weapon: ['Battle', 'Simple', 'Guns', 'Archery', 'Brawl'], shield: ['light', 'medium', 'tower'] };
function subOf(it) { if (it.cat === 'armor' || it.cat === 'shield') return it.type; if (it.cat === 'weapon') return it.wtype; return null; }

function field(label, node) { return <div style={{ flex: 1 }}><label style={lbl}>{label}</label>{node}</div>; }

export default function ShopEditor(pr) {
  const shop = Array.isArray(pr.shop) ? pr.shop : [];
  const saveShop = pr.saveShop;
  const [cat, setCat] = useState('armor');
  const [editId, setEditId] = useState(null);

  const persist = function (arr) { saveShop(arr); };
  const upd = function (id, patch) { persist(shop.map(function (i) { return i.id === id ? Object.assign({}, i, patch) : i; })); };
  const del = function (id) { if (window.confirm('Удалить вещь из магазина?')) persist(shop.filter(function (i) { return i.id !== id; })); };
  const add = function () {
    const base = {
      armor: { cat: 'armor', name: 'Новая броня', type: 'light', hp: 10, price: '' },
      weapon: { cat: 'weapon', name: 'Новое оружие', wtype: 'Battle', dmgDice: '1d6', dmgType: 'Р', hands: 1, bonus: 0, dmgDice2h: '2d6', bonus2h: 0, price: '' },
      shield: { cat: 'shield', name: 'Новый щит', type: 'light', hp: 15, price: '' },
      item: { cat: 'item', name: 'Новый предмет', desc: '', price: '' },
      tool: { cat: 'tool', name: 'Лёгкий набор инструментов', dice: '1d4', desc: 'Починка снаряжения', price: '' },
      ammo: { cat: 'ammo', name: 'Стрелы', ptype: 'Стрела', price: '' },
    }[cat];
    const it = Object.assign({ id: uid() }, base);
    persist(shop.concat([it]));
    setEditId(it.id);
  };

  const items = shop.filter(function (i) { return i.cat === cat; });
  const catColor = (CATS.find(function (c) { return c.id === cat; }) || CATS[0]).color;

  function summary(it) {
    if (it.cat === 'armor') { const a = ARMOR_T.find(function (x) { return x.id === it.type; }); return (a ? a.name : it.type) + ' · ' + it.hp + ' HP'; }
    if (it.cat === 'shield') { const s = SHIELD_T.find(function (x) { return x.id === it.type; }); return (s ? s.name + ' ' + (s.absorb * 100) + '%' : it.type) + ' · ' + it.hp + ' HP'; }
    if (it.cat === 'weapon') { const h = it.hands === 2 ? 'двуруч.' : it.hands === 1.5 ? 'полуторн.' : 'одноруч.'; return it.wtype + ' · ' + it.dmgDice + (it.bonus ? '+' + it.bonus : '') + ' · ' + it.dmgType + ' · ' + h; }
    if (it.cat === 'tool') { return '🔧 Починка ' + (it.dice || '1d4') + (it.desc ? ' · ' + it.desc : ''); }
    if (it.cat === 'ammo') { return '🏹 ' + (it.ptype || 'Стрела'); }
    return it.desc || '';
  }

  function editForm(it) {
    if (it.cat === 'armor') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {field('Название', <input value={it.name} onChange={function (e) { upd(it.id, { name: e.target.value }); }} style={inp} />)}
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Тип', <select value={it.type} onChange={function (e) { upd(it.id, { type: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{ARMOR_T.filter(function (a) { return a.id !== 'none'; }).map(function (a) { return <option key={a.id} value={a.id}>{a.name + ' (Body≥' + a.bodyReq + ')'}</option>; })}</select>)}
            {field('HP брони', <input type="number" value={it.hp} onChange={function (e) { upd(it.id, { hp: parseInt(e.target.value) || 1 }); }} style={inp} />)}
            {field('Цена', <input value={it.price} onChange={function (e) { upd(it.id, { price: e.target.value }); }} placeholder="напр. 200" style={inp} />)}
          </div>
        </div>
      );
    }
    if (it.cat === 'shield') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {field('Название', <input value={it.name} onChange={function (e) { upd(it.id, { name: e.target.value }); }} style={inp} />)}
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Тип', <select value={it.type} onChange={function (e) { upd(it.id, { type: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{SHIELD_T.map(function (s) { return <option key={s.id} value={s.id}>{s.name + ' ' + (s.absorb * 100) + '% (Body≥' + s.bodyReq + ')'}</option>; })}</select>)}
            {field('HP щита', <input type="number" value={it.hp} onChange={function (e) { upd(it.id, { hp: parseInt(e.target.value) || 1 }); }} style={inp} />)}
            {field('Цена', <input value={it.price} onChange={function (e) { upd(it.id, { price: e.target.value }); }} style={inp} />)}
          </div>
        </div>
      );
    }
    if (it.cat === 'weapon') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {field('Название', <input value={it.name} onChange={function (e) { upd(it.id, { name: e.target.value }); }} style={inp} />)}
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Тип', <select value={it.wtype} onChange={function (e) { upd(it.id, { wtype: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{WT.map(function (t) { return <option key={t} value={t}>{SUBLABEL.weapon[t] || t}</option>; })}</select>)}
            {field('Урон', <select value={it.dmgType} onChange={function (e) { upd(it.id, { dmgType: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{DT.map(function (t) { return <option key={t} value={t}>{t}</option>; })}</select>)}
            {field('Руки', <select value={it.hands} onChange={function (e) { upd(it.id, { hands: parseFloat(e.target.value) }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}><option value={1}>1</option><option value={1.5}>1.5</option><option value={2}>2</option></select>)}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Кубик', <input value={it.dmgDice} onChange={function (e) { upd(it.id, { dmgDice: e.target.value }); }} placeholder="1d6" style={inp} />)}
            {field('Бонус', <input type="number" value={it.bonus} onChange={function (e) { upd(it.id, { bonus: parseInt(e.target.value) || 0 }); }} style={inp} />)}
            {field('Цена', <input value={it.price} onChange={function (e) { upd(it.id, { price: e.target.value }); }} style={inp} />)}
          </div>
          {(it.dmgType === 'П' || it.wtype === 'Archery') && (
            <div style={{ display: 'flex', gap: 6 }}>
              {field(it.wtype === 'Archery' ? '🏹 Колчан (выстрелов)' : '🔫 Обойма (патронов)', <input type="number" value={it.clip || 1} onChange={function (e) { upd(it.id, { clip: parseInt(e.target.value) || 1 }); }} style={inp} />)}
            </div>
          )}
          {it.hands === 1.5 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {field('Кубик (2 руки)', <input value={it.dmgDice2h} onChange={function (e) { upd(it.id, { dmgDice2h: e.target.value }); }} placeholder="2d6" style={inp} />)}
              {field('Бонус (2 руки)', <input type="number" value={it.bonus2h} onChange={function (e) { upd(it.id, { bonus2h: parseInt(e.target.value) || 0 }); }} style={inp} />)}
            </div>
          )}
        </div>
      );
    }
    if (it.cat === 'tool') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {field('Название', <input value={it.name} onChange={function (e) { upd(it.id, { name: e.target.value }); }} placeholder="Лёгкий / Средний / Тяжёлый набор" style={inp} />)}
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Кубик починки', <select value={it.dice || '1d4'} onChange={function (e) { upd(it.id, { dice: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{REPAIR_DICE.map(function (d) { return <option key={d} value={d}>{d}</option>; })}</select>)}
            {field('Цена', <input value={it.price} onChange={function (e) { upd(it.id, { price: e.target.value }); }} placeholder="напр. 100" style={inp} />)}
          </div>
          {field('Описание', <input value={it.desc} onChange={function (e) { upd(it.id, { desc: e.target.value }); }} style={inp} />)}
          <div style={{ fontSize: 8, color: '#a89a82', fontStyle: 'italic' }}>Этим кубиком игрок чинит броню (1 раз в день). У Ремесленника добавляется +CRA.</div>
        </div>
      );
    }
    if (it.cat === 'ammo') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {field('Название', <input value={it.name} onChange={function (e) { upd(it.id, { name: e.target.value }); }} placeholder="Стрелы / Болты / Патроны" style={inp} />)}
          <div style={{ display: 'flex', gap: 6 }}>
            {field('Тип снаряда', <select value={it.ptype || 'Стрела'} onChange={function (e) { upd(it.id, { ptype: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{PROJ_TYPES.map(function (p) { return <option key={p} value={p}>{p}</option>; })}</select>)}
            {field('Цена', <input value={it.price} onChange={function (e) { upd(it.id, { price: e.target.value }); }} style={inp} />)}
          </div>
          <div style={{ fontSize: 8, color: '#a89a82', fontStyle: 'italic' }}>Игрок берёт их в инвентарь; перезарядка оружия тратит снаряды нужного типа.</div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
        {field('Название', <input value={it.name} onChange={function (e) { upd(it.id, { name: e.target.value }); }} style={inp} />)}
        {field('Описание', <textarea value={it.desc} onChange={function (e) { upd(it.id, { desc: e.target.value }); }} style={Object.assign({}, inp, { minHeight: 40, resize: 'vertical' })} />)}
        {field('Цена', <input value={it.price} onChange={function (e) { upd(it.id, { price: e.target.value }); }} placeholder="напр. 50" style={inp} />)}
      </div>
    );
  }

  function itemRow(it) {
    const open = editId === it.id;
    return (
      <div key={it.id} style={{ border: '2px solid #322d24', borderRadius: 9, background: '#1d1a14', padding: '7px 9px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, color: '#ece5d8' }}>{it.name}{it.price ? <span style={{ fontSize: 9, color: '#d97706', marginLeft: 5 }}>{'💰 ' + it.price}</span> : null}</div>
            <div style={{ fontSize: 8, color: '#a89a82' }}>{summary(it)}</div>
          </div>
          <button onClick={function () { del(it.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>🗑</button>
          <button onClick={function () { setEditId(open ? null : it.id); }} style={{ padding: '4px 9px', borderRadius: 6, border: '1px solid ' + catColor + '40', background: catColor + '18', color: catColor, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>{open ? '✕' : '✏️'}</button>
        </div>
        {open && editForm(it)}
      </div>
    );
  }

  // группировка по подкатегориям
  const subs = SUBORDER[cat];
  let grouped = null;
  if (subs) {
    grouped = subs.map(function (sk) {
      const list = items.filter(function (i) { return subOf(i) === sk; });
      if (!list.length) return null;
      return (
        <div key={sk} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: catColor, marginTop: 4 }}>{SUBLABEL[cat][sk]}</div>
          {list.map(itemRow)}
        </div>
      );
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={pr.onBack} style={Object.assign({}, backBtn, { alignSelf: 'flex-start' })}>← Назад</button>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: 16, color: '#f0b352' }}>🛒 Магазин / Вещи</div>
        <div style={{ fontSize: 9, color: '#a89a82' }}>Добавляй вещи — игроки берут их из своего листа</div>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {CATS.map(function (cc) {
          const on = cat === cc.id;
          return <button key={cc.id} onClick={function () { setCat(cc.id); setEditId(null); }} style={{ flex: '1 1 40%', padding: '6px 2px', borderRadius: 7, border: '2px solid ' + cc.color + (on ? '' : '20'), background: on ? cc.color + '20' : '#1d1a14', color: cc.color, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>{cc.name}</button>;
        })}
      </div>

      <button onClick={add} style={{ padding: 9, borderRadius: 8, border: '2px dashed ' + catColor + '60', background: catColor + '12', color: catColor, fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>➕ Добавить</button>

      {items.length === 0 && <div style={{ textAlign: 'center', padding: 14, color: '#a89a82', fontSize: 11, fontStyle: 'italic' }}>Пусто — добавь первую вещь</div>}
      {grouped ? grouped : items.map(itemRow)}
    </div>
  );
}
