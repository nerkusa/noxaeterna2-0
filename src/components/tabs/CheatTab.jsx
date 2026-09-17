import React from 'react';
import { ZONES, ARMOR_T } from '../../data/combat';

const card = { background: '#262219', border: '2px solid #322d24', borderRadius: 10, padding: '10px 12px' };
const h = { fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 };
const th = { fontSize: 8, fontWeight: 700, color: '#a89a82', textTransform: 'uppercase', letterSpacing: 0.4, padding: '2px 4px', textAlign: 'left' };
const td = { fontSize: 11, padding: '3px 4px', color: '#cabfa9', borderTop: '1px solid #322d24' };

const DMG = [
  { k: 'К', name: 'Колющий', armor: '25%', hp: '50%', note: 'для любой брони' },
  { k: 'Р', name: 'Режущий', armor: '50%', hp: '50%', note: 'для любой брони' },
  { k: 'Д', name: 'Дробящий', armor: '100%', hp: '100%', note: 'бьёт и броню, и HP' },
  { k: 'С', name: 'Стрела', armor: '↓ зависит', hp: '↓ зависит', note: 'см. таблицу брони' },
  { k: 'П', name: 'Пуля', armor: '100%', hp: '100%', note: 'бьёт и броню, и HP' },
];

const ARROW = [
  { t: '🟢 Лёгкая', armor: '100%', hp: '100%' },
  { t: '🟡 Средняя', armor: '100%', hp: '50%' },
  { t: '🔴 Тяжёлая', armor: '50%', hp: 'блок (0)' },
];

const SHIELDS = [
  { t: 'Лёгкий (баклер)', a: '50%', body: '≥4' },
  { t: 'Средний', a: '75%', body: '≥6' },
  { t: 'Башенный', a: '100%', body: '≥8' },
];

export default function CheatTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: 17 }}>📋 Памятка боя</div>
        <div style={{ fontSize: 9, color: '#a89a82' }}>Как считается урон и броня</div>
      </div>

      <div style={card}>
        <div style={h}>🎯 Зоны удара <span style={{ fontSize: 9, color: '#a89a82', fontWeight: 400 }}>(бросок 1d6)</span></div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>🎲</th><th style={th}>Зона</th><th style={th}>Множ.</th><th style={th}>Броня</th></tr></thead>
          <tbody>
            {ZONES.map(function (z) {
              return (
                <tr key={z.r}>
                  <td style={td}>{z.r}</td>
                  <td style={td}>{z.e + ' ' + z.name}</td>
                  <td style={Object.assign({}, td, { fontWeight: 900, color: z.mult >= 3 ? '#f87171' : z.mult === 2 ? '#f0b352' : '#cabfa9' })}>{'×' + z.mult}</td>
                  <td style={Object.assign({}, td, { fontSize: 9 })}>{z.ignoreArmor ? '🔓 игнор → HP' : z.slot === 'head' ? 'шлем' : 'нагрудник'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <div style={h}>🗡️ Типы урона <span style={{ fontSize: 9, color: '#a89a82', fontWeight: 400 }}>(после множителя зоны)</span></div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Тип</th><th style={th}>В броню</th><th style={th}>В HP</th></tr></thead>
          <tbody>
            {DMG.map(function (d) {
              return (
                <tr key={d.k}>
                  <td style={Object.assign({}, td, { fontWeight: 700 })}><b style={{ color: '#ece5d8' }}>{d.k}</b> <span style={{ fontSize: 9, color: '#a89a82' }}>{d.name}</span></td>
                  <td style={td}>{d.armor}</td>
                  <td style={td}>{d.hp}<div style={{ fontSize: 8, color: '#8d8270' }}>{d.note}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <div style={h}>🏹 Стрелы (С) по типу брони</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Броня</th><th style={th}>В броню</th><th style={th}>В HP</th></tr></thead>
          <tbody>
            {ARROW.map(function (a) {
              return <tr key={a.t}><td style={td}>{a.t}</td><td style={td}>{a.armor}</td><td style={Object.assign({}, td, { fontWeight: 700, color: a.hp.indexOf('блок') >= 0 ? '#34d399' : '#cabfa9' })}>{a.hp}</td></tr>;
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 9, color: '#8d8270', marginTop: 5 }}>Тяжёлая броня лучше всего держит стрелы. Тип брони влияет на расчёт <b>только для стрел</b> — для К/Р/Д/П разбивка одинаковая.</div>
      </div>

      <div style={card}>
        <div style={h}>🛡️ Броня</div>
        <div style={{ fontSize: 10, color: '#cabfa9', lineHeight: 1.6 }}>
          • Требование к <b>Телу</b>: лёгкая <b>≥4</b>, средняя <b>≥6</b>, тяжёлая <b>≥8</b>.<br />
          • У брони свой <b>запас прочности (HP)</b>. Урон «в броню» снижает его; на <b>0</b> броня ломается — дальше весь урон идёт в HP.<br />
          • <b>Пах</b> и сломанная броня — урон идёт прямо в HP.
        </div>
      </div>

      <div style={card}>
        <div style={h}>🛡 Щиты <span style={{ fontSize: 9, color: '#a89a82', fontWeight: 400 }}>(поглощают HP-урон)</span></div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Щит</th><th style={th}>Поглощ.</th><th style={th}>Тело</th></tr></thead>
          <tbody>
            {SHIELDS.map(function (s) { return <tr key={s.t}><td style={td}>{s.t}</td><td style={Object.assign({}, td, { fontWeight: 700, color: '#38bdf8' })}>{s.a}</td><td style={td}>{s.body}</td></tr>; })}
          </tbody>
        </table>
        <div style={{ fontSize: 9, color: '#8d8270', marginTop: 5 }}>Недоступен с двуручным оружием. Имеет свой запас HP.</div>
      </div>

      <div style={Object.assign({}, card, { borderColor: '#7c3aed40' })}>
        <div style={Object.assign({}, h, { color: '#a78bfa' })}>✨ Чудеса (магия)</div>
        <div style={{ fontSize: 10, color: '#cabfa9', lineHeight: 1.7 }}>
          Это не магия, а <b>чудо</b> — творится <b>Волей (WILL)</b>.<br /><br />
          <b style={{ color: '#a78bfa' }}>Творение чуда — по шагам:</b><br />
          • Стоит <b>−1 WILL</b>. Опиши, что делаешь («Создал фаербол и метнул…»).<br />
          • Урон чуда: <b>3d12 + 1d6</b> (+1d6, если активен Хаот. Всплеск).<br /><br />
          <b style={{ color: '#f59e0b' }}>1) Проверка контроля — бросок 1d6:</b><br />
          • <b>1–2 — срыв на СЕБЯ</b> (урон чуда по кастующему).<br />
          • <b>3 — срыв на СОЮЗНИКА</b> (по случайному своему).<br />
          • <b>4–6 — каст удался</b> → идём к защите цели.<br /><br />
          <b style={{ color: '#34d399' }}>2) Защита цели — Miracle Resist:</b><br />
          • Кастующий кидает <b>d10 + WILL + Miracle</b>.<br />
          • Цель кидает <b>d10 + WILL + Miracle Resist</b>.<br />
          • Если <b>≥ броска чуда — устояла</b> (урона нет), иначе <b>урон проходит</b>.<br />
          • <b>Враги-NPC и игроки</b> кастуют и защищаются одинаково. 🌟 крит чуда даёт ×1.5.
        </div>
      </div>

      <div style={Object.assign({}, card, { borderColor: '#f59e0b30' })}>
        <div style={h}>📐 Порядок расчёта</div>
        <div style={{ fontSize: 10, color: '#cabfa9', lineHeight: 1.7 }}>
          1. Бросок <b>зоны</b> (1d6) → множитель.<br />
          2. Урон оружия <b>× множитель зоны</b>.<br />
          3. Разбивка по <b>типу урона</b> → в броню / в HP.<br />
          4. <b>Щит</b> поглощает часть HP-урона.<br />
          5. Прочность брони и HP уменьшаются.
        </div>
      </div>
    </div>
  );
}
