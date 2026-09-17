import React, { useState } from 'react';
import { PROFS, PROF_DESC } from '../../data/professions';
import { SD, SKD, skLabel } from '../../data/stats';

const backBtn = { padding: '5px 12px', borderRadius: 6, border: '2px solid #322d24', background: '#1d1a14', color: '#ece5d8', fontWeight: 700, fontSize: 11, cursor: 'pointer' };
const inp = { width: '100%', padding: '6px 8px', border: '2px solid #322d24', borderRadius: 6, fontSize: 12, fontFamily: "'Nunito',sans-serif", background: '#262219', color: '#ece5d8', outline: 'none' };
const lbl = { display: 'block', fontSize: 8, fontWeight: 700, color: '#a89a82', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 };
const CLR = '#a78bfa';

const ATYPES = [
  { id: 'flavor', name: 'Только описание (без механики)' },
  { id: 'custom_roll', name: '🎲 Кастомный бросок (кость+хар-ка+навык)' },
  { id: 'roll_charisma', name: 'Бросок Charisma +5 (1/день)' },
  { id: 'check', name: 'Проверка d10 ≥ 6' },
  { id: 'bonus_attack', name: '+5 к атаке (актив. в бою)' },
  { id: 'toggle', name: 'Переключатель (актив. в бою)' },
];

function genId() { return 'p_' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36); }

function normalize(profs) {
  const base = (Array.isArray(profs) && profs.length) ? profs.slice() : PROFS.slice();
  if (!base.find(function (p) { return p.id === 'none'; })) base.unshift(PROFS[0]);
  /* Подмешиваем встроенные описания, если у профессии их ещё нет — чтобы ГМ видел
     и мог редактировать реальный текст, а не пустые поля. */
  return base.map(function (p) {
    const d = PROF_DESC[p.id] || {};
    return Object.assign({ desc: d.desc || '', abilityDesc: d.abilityDesc || '', abilityType: d.abilityType || 'flavor' }, p);
  });
}

const ALL_SK = Object.keys(SKD).reduce(function (a, k) { return a.concat(SKD[k].map(function (s) { return s.name; })); }, []);

export default function ProfEditor(pr) {
  const saveProfs = pr.saveProfs;
  const profs = normalize(pr.profs);
  const [openId, setOpenId] = useState(null);
  const [showSk, setShowSk] = useState(false);

  const persist = function (arr) { saveProfs(arr); };
  const upd = function (id, patch) { persist(profs.map(function (p) { return p.id === id ? Object.assign({}, p, patch) : p; })); };
  const togglePS = function (id, key) {
    persist(profs.map(function (p) {
      if (p.id !== id) return p;
      const ps = (p.pS || []).slice();
      const i = ps.indexOf(key);
      if (i >= 0) ps.splice(i, 1); else ps.push(key);
      return Object.assign({}, p, { pS: ps });
    }));
  };
  const togglePSk = function (id, name) {
    persist(profs.map(function (p) {
      if (p.id !== id) return p;
      const ps = (p.pSk || []).slice();
      const i = ps.indexOf(name);
      if (i >= 0) ps.splice(i, 1); else ps.push(name);
      return Object.assign({}, p, { pSk: ps });
    }));
  };
  const addProf = function () {
    const np = { id: genId(), name: 'Новый класс', ab: '', abN: 'Способность', pS: [], pSk: [], desc: '', abilityDesc: '', abilityType: 'flavor' };
    persist(profs.concat([np]));
    setOpenId(np.id);
  };
  const delProf = function (id) { if (window.confirm('Удалить класс?')) { persist(profs.filter(function (p) { return p.id !== id; })); setOpenId(null); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={pr.onBack} style={Object.assign({}, backBtn, { alignSelf: 'flex-start' })}>← Назад</button>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: 16, color: CLR }}>🎭 Классы</div>
        <div style={{ fontSize: 9, color: '#a89a82' }}>Названия, способности, предпочтения для «Рандома»</div>
      </div>
      <button onClick={addProf} style={{ padding: 10, borderRadius: 9, border: '2px dashed ' + CLR + '60', background: '#1f1330', color: CLR, fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>➕ Добавить класс</button>

      {profs.map(function (p) {
        const isNone = p.id === 'none';
        const open = openId === p.id;
        return (
          <div key={p.id} style={{ border: '2px solid #322d24', borderRadius: 9, background: '#1d1a14', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 9px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, color: '#ece5d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 8, color: '#a89a82' }}>{isNone ? 'базовый' : (p.abN || '—') + (p.ab ? ' · ' + p.ab : '')}</div>
              </div>
              {!isNone && <button onClick={function () { delProf(p.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>🗑</button>}
              <button onClick={function () { setOpenId(open ? null : p.id); }} style={{ padding: '4px 9px', borderRadius: 6, border: '1px solid ' + CLR + '40', background: CLR + '18', color: CLR, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>{open ? '✕' : '✏️'}</button>
            </div>

            {open && !isNone && (
              <div style={{ padding: '0 9px 9px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div><label style={lbl}>Название</label><input value={p.name} onChange={function (e) { upd(p.id, { name: e.target.value }); }} style={inp} /></div>
                <div><label style={lbl}>Название способности</label><input value={p.abN || ''} onChange={function (e) { upd(p.id, { abN: e.target.value }); }} style={inp} /></div>
                <div><label style={lbl}>Способность кратко (в списке)</label><input value={p.ab || ''} placeholder="напр. +5 атака/день" onChange={function (e) { upd(p.id, { ab: e.target.value }); }} style={inp} /></div>
                <div><label style={lbl}>Описание класса</label><textarea value={p.desc || ''} onChange={function (e) { upd(p.id, { desc: e.target.value }); }} style={Object.assign({}, inp, { minHeight: 44, resize: 'vertical' })} /></div>
                <div><label style={lbl}>Описание способности</label><textarea value={p.abilityDesc || ''} onChange={function (e) { upd(p.id, { abilityDesc: e.target.value }); }} style={Object.assign({}, inp, { minHeight: 40, resize: 'vertical' })} /></div>
                <div>
                  <label style={lbl}>Тип способности</label>
                  <select value={p.abilityType || 'flavor'} onChange={function (e) { upd(p.id, { abilityType: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}>{ATYPES.map(function (t) { return <option key={t.id} value={t.id}>{t.name}</option>; })}</select>
                </div>
                {p.abilityType === 'custom_roll' && (
                  <div style={{ background: '#1c1530', borderRadius: 6, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 8, color: '#a78bfa', fontWeight: 700 }}>🎲 Параметры броска — кнопка появится в листе игрока</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div style={{ flex: 1 }}><label style={lbl}>Кость</label><input value={p.rollDice || ''} placeholder="1d8" onChange={function (e) { upd(p.id, { rollDice: e.target.value }); }} style={inp} /></div>
                      <div style={{ width: 64 }}><label style={lbl}>Бонус +</label><input type="number" value={p.rollBonus || 0} onChange={function (e) { upd(p.id, { rollBonus: parseInt(e.target.value) || 0 }); }} style={inp} /></div>
                    </div>
                    <div><label style={lbl}>+ Характеристика</label><select value={p.rollStat || ''} onChange={function (e) { upd(p.id, { rollStat: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}><option value="">— нет —</option>{SD.map(function (s) { return <option key={s.key} value={s.key}>{s.key + ' · ' + s.full}</option>; })}</select></div>
                    <div><label style={lbl}>+ Навык</label><select value={p.rollSkill || ''} onChange={function (e) { upd(p.id, { rollSkill: e.target.value }); }} style={Object.assign({}, inp, { cursor: 'pointer' })}><option value="">— нет —</option>{ALL_SK.map(function (n) { return <option key={n} value={n}>{skLabel(n)}</option>; })}</select></div>
                    <div style={{ fontSize: 8, color: '#8d8270' }}>Пример: «1d8 + INT + Lore». Бросает игрок со своими характеристиками.</div>
                  </div>
                )}
                <div>
                  <label style={lbl}>Предпочт. характеристики (для «Рандома»)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {SD.map(function (s) {
                      const on = (p.pS || []).indexOf(s.key) >= 0;
                      return <button key={s.key} onClick={function () { togglePS(p.id, s.key); }} style={{ padding: '3px 7px', borderRadius: 6, border: '2px solid ' + s.color + (on ? '' : '22'), background: on ? s.color + '22' : '#262219', color: s.color, fontWeight: 700, fontSize: 9, cursor: 'pointer' }}>{s.emoji + ' ' + s.key}</button>;
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <label style={Object.assign({}, lbl, { marginBottom: 0 })}>Предпочт. навыки</label>
                    <button onClick={function () { setShowSk(!showSk); }} style={{ background: 'none', border: 'none', color: CLR, fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>{showSk ? 'скрыть ▲' : 'показать ▼'}</button>
                  </div>
                  {!showSk && <div style={{ fontSize: 9, color: '#a89a82' }}>{(p.pSk || []).length ? (p.pSk || []).map(skLabel).join(', ') : 'не выбраны'}</div>}
                  {showSk && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {ALL_SK.map(function (n) {
                        const on = (p.pSk || []).indexOf(n) >= 0;
                        return <button key={n} onClick={function () { togglePSk(p.id, n); }} style={{ padding: '2px 6px', borderRadius: 5, border: '1px solid ' + (on ? CLR : '#322d24'), background: on ? CLR + '22' : '#262219', color: on ? CLR : '#a89a82', fontSize: 8, cursor: 'pointer' }}>{skLabel(n)}</button>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ fontSize: 9, color: '#a89a82', textAlign: 'center', padding: '4px 8px', fontStyle: 'italic' }}>
        Все типы способностей работают: «🎲 Кастомный бросок», «Charisma +5» и «Проверка d10≥6» — кнопки в листе персонажа; «+5 к атаке» (1/день) и «Переключатель» — карточки во вкладке Бой. Описания можно править даже у встроенных классов. «— Нет —» удалить нельзя.
      </div>
    </div>
  );
}
