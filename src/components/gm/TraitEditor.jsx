import React, { useState } from 'react';
import { TRAITS, TRAIT_CATEGORIES, TRAIT_EFFECT_TYPES, genId } from '../../data/traits';
import { SD, SKD, skLabel } from '../../data/stats';
import LiveField from '../LiveField';

const backBtn = { padding: '5px 12px', borderRadius: 6, border: '2px solid #34374a', background: '#1b1d29', color: '#e9e9ed', fontWeight: 700, fontSize: 11, cursor: 'pointer' };
const inp = { width: '100%', padding: '6px 8px', border: '2px solid #34374a', borderRadius: 6, fontSize: 12, fontFamily: "'Inter',sans-serif", background: '#232532', color: '#e9e9ed', outline: 'none' };
const lbl = { display: 'block', fontSize: 8, fontWeight: 700, color: '#9397ab', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 };
const CLR = '#f0b352';

const ALL_SK = Object.keys(SKD).reduce(function (a, k) { return a.concat(SKD[k].map(function (s) { return s.name; })); }, []);

function normalize(traits) { return (Array.isArray(traits) && traits.length) ? traits : TRAITS.slice(); }

/* Одна черта теперь может нести НЕСКОЛЬКО эффектов сразу — например,
   минус к одному навыку и плюс к другому, или минус к навыку и минус к
   характеристике одновременно (как просил ГМ: не только «в одну сторону»). */
export default function TraitEditor(pr) {
  const saveTraits = pr.saveTraits;
  const traits = normalize(pr.traits);
  const [openId, setOpenId] = useState(null);
  const [catFilter, setCatFilter] = useState('all');

  const persist = function (arr) { saveTraits(arr); };
  const upd = function (id, patch) { persist(traits.map(function (t) { return t.id === id ? Object.assign({}, t, patch) : t; })); };
  const addEffect = function (id) {
    const t = traits.find(function (x) { return x.id === id; });
    upd(id, { effects: (t.effects || []).concat([{ type: 'none' }]) });
  };
  const updEffectAt = function (id, idx, patch) {
    const t = traits.find(function (x) { return x.id === id; });
    const effs = (t.effects || []).slice();
    effs[idx] = Object.assign({}, effs[idx], patch);
    upd(id, { effects: effs });
  };
  const delEffectAt = function (id, idx) {
    const t = traits.find(function (x) { return x.id === id; });
    const effs = (t.effects || []).slice();
    effs.splice(idx, 1);
    upd(id, { effects: effs });
  };
  const add = function () {
    const nt = { id: genId(), cat: 'positive', group: '', name: 'Новая черта', desc: '', how: '', effects: [] };
    persist(traits.concat([nt]));
    setOpenId(nt.id);
  };
  const del = function (id) { if (window.confirm('Удалить черту из каталога?')) { persist(traits.filter(function (t) { return t.id !== id; })); setOpenId(null); } };

  const shown = catFilter === 'all' ? traits : traits.filter(function (t) { return t.cat === catFilter; });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={pr.onBack} style={Object.assign({}, backBtn, { alignSelf: 'flex-start' })}>← Назад</button>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 16, color: CLR }}>🧬 Черты</div>
        <div style={{ fontSize: 9, color: '#9397ab' }}>Выдаются вручную персонажам за события в игре — не покупаются очками</div>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button onClick={function () { setCatFilter('all'); }} style={{ flex: '1 1 22%', padding: '5px 2px', borderRadius: 7, border: '2px solid ' + CLR + (catFilter === 'all' ? '' : '20'), background: catFilter === 'all' ? CLR + '20' : '#1b1d29', color: CLR, fontWeight: 700, fontSize: 9, cursor: 'pointer' }}>Все</button>
        {TRAIT_CATEGORIES.map(function (c) {
          const on = catFilter === c.id;
          return <button key={c.id} onClick={function () { setCatFilter(c.id); }} style={{ flex: '1 1 22%', padding: '5px 2px', borderRadius: 7, border: '2px solid ' + c.color + (on ? '' : '20'), background: on ? c.color + '20' : '#1b1d29', color: c.color, fontWeight: 700, fontSize: 9, cursor: 'pointer' }}>{c.name}</button>;
        })}
      </div>

      <button onClick={add} style={{ padding: 9, borderRadius: 8, border: '2px dashed ' + CLR + '60', background: CLR + '12', color: CLR, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>➕ Добавить черту</button>

      {shown.length === 0 && <div style={{ textAlign: 'center', padding: 14, color: '#9397ab', fontSize: 11, fontStyle: 'italic' }}>Пусто</div>}
      {shown.map(function (t) {
        const open = openId === t.id;
        const catDef = TRAIT_CATEGORIES.find(function (c) { return c.id === t.cat; }) || TRAIT_CATEGORIES[0];
        const effs = t.effects || [];
        const mechCount = effs.filter(function (e) { return e.type !== 'none'; }).length;
        return (
          <div key={t.id} style={{ border: '2px solid #34374a', borderRadius: 9, background: '#1b1d29', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 9px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, color: '#e9e9ed' }}>{t.name}<span style={{ fontSize: 8, color: catDef.color, marginLeft: 6 }}>{catDef.name}</span>{mechCount > 0 && <span style={{ fontSize: 8, color: CLR, marginLeft: 6 }}>{'⚙ механик: ' + mechCount}</span>}</div>
                <div style={{ fontSize: 8, color: '#9397ab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</div>
              </div>
              <button onClick={function () { del(t.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>🗑</button>
              <button onClick={function () { setOpenId(open ? null : t.id); }} style={{ padding: '4px 9px', borderRadius: 6, border: '1px solid ' + CLR + '40', background: CLR + '18', color: CLR, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>{open ? '✕' : '✏️'}</button>
            </div>

            {open && (
              <div style={{ padding: '0 9px 9px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div><label style={lbl}>Название</label><LiveField value={t.name} onCommit={function (val) { upd(t.id, { name: val }); }} style={inp} /></div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ flex: 1 }}><label style={lbl}>Категория</label><select value={t.cat} onChange={function (e) { upd(t.id, { cat: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{TRAIT_CATEGORIES.map(function (c) { return <option key={c.id} value={c.id}>{c.name}</option>; })}</select></div>
                  <div style={{ flex: 1 }}><label style={lbl}>Группа (необязательно)</label><LiveField value={t.group || ''} placeholder="напр. Физические" onCommit={function (val) { upd(t.id, { group: val }); }} style={inp} /></div>
                </div>
                <div><label style={lbl}>Эффект (для игрока, в листе)</label><LiveField tag="textarea" value={t.desc || ''} onCommit={function (val) { upd(t.id, { desc: val }); }} style={Object.assign({}, inp, { minHeight: 44, resize: 'vertical' })} /></div>
                <div><label style={lbl}>Как получить</label><LiveField tag="textarea" value={t.how || ''} onCommit={function (val) { upd(t.id, { how: val }); }} style={Object.assign({}, inp, { minHeight: 32, resize: 'vertical' })} /></div>
                <div style={{ background: '#1c1804', borderRadius: 6, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 8, color: CLR, fontWeight: 700 }}>⚙ Механика — считается автоматически на листе персонажа. Можно добавить несколько эффектов сразу (напр. минус к навыку и минус к характеристике, или несколько навыков разом).</div>
                  {effs.length === 0 && <div style={{ fontSize: 9, color: '#75798c', fontStyle: 'italic' }}>Пока без механики — только описание</div>}
                  {effs.map(function (eff, idx) {
                    return (
                      <div key={idx} style={{ border: '1px solid #34374a', borderRadius: 6, padding: 6, display: 'flex', flexDirection: 'column', gap: 6, background: '#171308' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <select value={eff.type} onChange={function (e) { updEffectAt(t.id, idx, { type: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer', flex: 1 })}>{TRAIT_EFFECT_TYPES.map(function (x) { return <option key={x.id} value={x.id}>{x.name}</option>; })}</select>
                          <button onClick={function () { delEffectAt(t.id, idx); }} title="Убрать этот эффект" style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                        </div>
                        {eff.type === 'stat_bonus' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ flex: 1 }}><label style={lbl}>Характеристика</label><select value={eff.stat || 'BODY'} onChange={function (e) { updEffectAt(t.id, idx, { stat: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{SD.map(function (s) { return <option key={s.key} value={s.key}>{s.key + ' · ' + s.full}</option>; })}</select></div>
                            <div style={{ width: 70 }}><label style={lbl}>Кол-во (± )</label><LiveField type="number" value={eff.amount || 0} onCommit={function (val) { updEffectAt(t.id, idx, { amount: parseInt(val) || 0 }); }} style={inp} /></div>
                          </div>
                        )}
                        {eff.type === 'skill_bonus' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ flex: 1 }}><label style={lbl}>Навык</label><select value={eff.skill || ALL_SK[0]} onChange={function (e) { updEffectAt(t.id, idx, { skill: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{ALL_SK.map(function (n) { return <option key={n} value={n}>{skLabel(n)}</option>; })}</select></div>
                            <div style={{ width: 70 }}><label style={lbl}>Кол-во (± )</label><LiveField type="number" value={eff.amount || 0} onCommit={function (val) { updEffectAt(t.id, idx, { amount: parseInt(val) || 0 }); }} style={inp} /></div>
                          </div>
                        )}
                        {eff.type === 'hp_flat' && (
                          <div><label style={lbl}>± ХП</label><LiveField type="number" value={eff.amount || 0} onCommit={function (val) { updEffectAt(t.id, idx, { amount: parseInt(val) || 0 }); }} style={inp} /></div>
                        )}
                        {eff.type === 'dual_wield' && (
                          <div style={{ fontSize: 9, color: '#9397ab' }}>Персонаж с этой чертой сможет снарядить второе одноручное оружие и атаковать им во вкладке «Бой».</div>
                        )}
                        {eff.type === 'armor_effectiveness' && (
                          <div>
                            <label style={lbl}>Доля защиты брони (1 = норма, 0.667 = 2/3, 0.5 = половина)</label>
                            <LiveField type="number" step="0.01" min="0" max="1" value={eff.value != null ? eff.value : 1} onCommit={function (val) { updEffectAt(t.id, idx, { value: Math.max(0, Math.min(1, parseFloat(val))) || 0 }); }} style={inp} />
                          </div>
                        )}
                        {eff.type === 'cancels' && (
                          <div>
                            <label style={lbl}>Отменяет черту (протез компенсирует увечье)</label>
                            <select value={eff.target || ''} onChange={function (e) { updEffectAt(t.id, idx, { target: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>
                              <option value="">— выбери черту —</option>
                              {traits.filter(function (x) { return x.id !== t.id; }).map(function (x) { return <option key={x.id} value={x.id}>{x.name}</option>; })}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={function () { addEffect(t.id); }} style={{ padding: '5px 8px', borderRadius: 6, border: '1px dashed ' + CLR + '60', background: 'transparent', color: CLR, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>➕ Добавить ещё эффект</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ fontSize: 9, color: '#9397ab', textAlign: 'center', padding: '4px 8px', fontStyle: 'italic' }}>
        Выдать/снять черту конкретному персонажу — открой его лист («Открыть» в списке партии) → вкладка «Профиль» → блок «Черты».
      </div>
    </div>
  );
}
