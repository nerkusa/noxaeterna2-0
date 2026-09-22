import React, { useState } from 'react';
import { getProfs } from '../../utils/profStore';
import { cF, mHP, xpProgress, levelUpReward } from '../../utils/character';
import BestiaryEditor from './BestiaryEditor';
import DonatePage from './DonatePage';
import GameView from '../GameView';
import GMRoll from './GMRoll';
import ChatTab from '../tabs/ChatTab';
import CoopRollPopup from '../combat/CoopRollPopup';
import RollPopup from '../combat/RollPopup';
import LoreEditor from './LoreEditor';
import ProfEditor from './ProfEditor';
import RaceEditor from './RaceEditor';
import ShopEditor from './ShopEditor';
import TraitEditor from './TraitEditor';

const NAV = [
  { id: 'overview', icon: '🎭', label: 'Обзор' },
  { id: 'chat', icon: '💬', label: 'Чат' },
  { id: 'history', icon: '📜', label: 'История ГМ' },
  { id: 'bestiary', icon: '👹', label: 'Бестиарий / NPC' },
  { id: 'lore', icon: '📚', label: 'Лорбук' },
  { id: 'races', icon: '🧬', label: 'Расы' },
  { id: 'profs', icon: '🧑‍🎓', label: 'Классы' },
  { id: 'shop', icon: '🛒', label: 'Магазин / Вещи' },
  { id: 'traits', icon: '💠', label: 'Черты' },
];

function NavRail(pr) {
  return (
    <div style={{ width: 168, flexShrink: 0, borderRight: '1px solid var(--color-divider)', background: '#161826', display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: 3, overflowY: 'auto' }}>
      <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 14, color: '#7c3aed', textAlign: 'center', padding: '4px 0 10px' }}>🎭 ГМ-панель</div>
      {NAV.map(function (n) {
        const on = pr.section === n.id;
        return (
          <button key={n.id} onClick={function () { pr.setSection(n.id); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: '2px solid ' + (on ? 'var(--color-accent)' : 'transparent'), background: on ? 'rgba(145,132,217,.14)' : 'transparent', color: on ? 'var(--color-accent)' : '#c7cadb', fontFamily: "'Inter',sans-serif", fontWeight: on ? 700 : 600, fontSize: 12, cursor: 'pointer' }}>
            <span style={{ fontSize: 14 }}>{n.icon}</span><span>{n.label}</span>
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <button onClick={pr.onDonate} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #f0b35240', background: 'transparent', color: '#f0b352', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>💰 Донат</button>
    </div>
  );
}

/* ── Обзор партии: карточка персонажа (крупнее и нагляднее, чем раньше — сразу
   видно HP/Волю/опыт шкалами, а не текстом) ── */
function PartyCard(pr) {
  const c = pr.char;
  const inf = cF(c);
  const pf = getProfs().find(function (p) { return p.id === c.profId; }) || getProfs()[0];
  const mx = c.hpOv || mHP(inf.fs, c);
  const ch = c.curHp !== null && c.curHp !== undefined ? c.curHp : mx;
  const hpPct = mx > 0 ? Math.max(0, Math.min(100, (ch / mx) * 100)) : 0;
  const mxW = c.willOv || inf.fs.WILL || 1;
  const cw = c.curWill !== null && c.curWill !== undefined ? c.curWill : mxW;
  const wPct = mxW > 0 ? Math.max(0, Math.min(100, (cw / mxW) * 100)) : 0;
  const xpp = xpProgress(c);
  const [xg, setXg] = useState('');

  function log(label, detail) { if (pr.addGmLog) pr.addGmLog({ who: pr.myName || 'ГМ', target: c.name || '?', label: label, detail: detail || '' }); }
  function giveXp() {
    const amt = parseInt(xg) || 0;
    if (!amt) return;
    pr.saveChar(c._fbId, Object.assign({}, c, { xp: Math.max(0, (c.xp || 0) + amt) }));
    log('💫 Выдал опыт', c.name + ': ' + (amt > 0 ? '+' : '') + amt + ' XP');
    setXg('');
  }
  function levelUp() {
    const nl = c.level + 1;
    const rw = levelUpReward(nl);
    /* Фиксируем то, что уже потрачено/осталось ДО нового уровня — иначе очки
       с разных уровней накапливались бы в одном "полу-открытом" пуле навсегда
       и игрок мог бы бесконечно перекидывать даже самые старые из них
       (абуз прокачки). */
    pr.saveChar(c._fbId, Object.assign({}, c, { level: nl, lockedStats: Object.assign({}, c.stats), lockedSkills: Object.assign({}, c.skills), statPts: (c.statPts || 0) + rw.stat, skillPts: (c.skillPts || 0) + rw.skill, levelUpPending: { level: nl, stat: rw.stat, skill: rw.skill } }));
    log('⬆️ Поднял уровень', c.name + ': ур.' + c.level + ' → ' + nl + ' (+' + rw.stat + ' хар. очк., +' + rw.skill + ' нав. очк.)');
  }
  function rest() {
    pr.saveChar(c._fbId, Object.assign({}, c, { curHp: c.hpOv || mHP(cF(c).fs, c), curWill: c.willOv || cF(c).fs.WILL || 1 }));
    log('💤 Отдых', c.name);
  }
  function adjHp(d) {
    const mx2 = c.hpOv || mHP(cF(c).fs, c);
    const cur = c.curHp !== null && c.curHp !== undefined ? c.curHp : mx2;
    pr.saveChar(c._fbId, Object.assign({}, c, { curHp: Math.max(0, Math.min(mx2, cur + d)) }));
    log((d < 0 ? '🩸 Урон' : '❤️ Лечение'), c.name + ': ' + (d > 0 ? '+' : '') + d + ' HP');
  }
  function del() {
    if (!window.confirm('Удалить ' + c.name + '? Персонаж и его аккаунт (логин/пароль) будут удалены безвозвратно.')) return;
    log('🗑️ Удалил персонажа', c.name);
    pr.deleteChar(c._fbId);
  }

  return (
    <div style={{ background: '#1b1d29', border: '2px solid ' + (c.active ? '#10b98140' : '#c084fc18'), borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: c.portrait ? 'none' : 'linear-gradient(135deg,var(--color-accent-2),var(--color-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#161826', overflow: 'hidden' }}>{c.portrait ? <img src={c.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (c.name || '?')[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name || '?'}</div>
          <div style={{ fontSize: 9, color: '#9397ab' }}>{pf.name + ' · Ур.' + c.level}{c.active && <span style={{ fontSize: 7, background: '#10b981', color: '#fff', borderRadius: 3, padding: '1px 4px', marginLeft: 5 }}>В ИГРЕ</span>}</div>
        </div>
        <button onClick={function () { pr.saveChar(c._fbId, Object.assign({}, c, { active: !c.active })); }} style={{ padding: '3px 7px', borderRadius: 5, border: '1px solid ' + (c.active ? '#10b98140' : '#34374a'), background: c.active ? '#0e2018' : '#1b1d29', fontWeight: 700, fontSize: 8, color: c.active ? '#34d399' : '#9397ab', cursor: 'pointer' }}>{c.active ? '✓' : 'В игру'}</button>
        <button onClick={function () { pr.onOpen(c._fbId); }} style={{ padding: '3px 8px', borderRadius: 5, border: '1px solid #7c3aed28', background: '#1f1330', fontWeight: 700, fontSize: 9, color: '#7c3aed', cursor: 'pointer' }}>Открыть</button>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 1 }}><span style={{ color: '#9397ab' }}>❤️ HP</span><span style={{ fontWeight: 700 }}>{ch + '/' + mx}</span></div>
        <div style={{ height: 5, borderRadius: 3, background: '#0e0f16', overflow: 'hidden' }}><div style={{ width: hpPct + '%', height: '100%', background: 'linear-gradient(90deg,#ef4444,#f87171)' }} /></div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 1 }}><span style={{ color: '#9397ab' }}>🔥 Воля</span><span style={{ fontWeight: 700 }}>{cw + '/' + mxW}</span></div>
        <div style={{ height: 5, borderRadius: 3, background: '#0e0f16', overflow: 'hidden' }}><div style={{ width: wPct + '%', height: '100%', background: 'linear-gradient(90deg,var(--color-accent-2),var(--color-accent))' }} /></div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: xpp.ready ? '#34d399' : '#9397ab' }}><span>{'XP: ' + xpp.got + '/' + xpp.need + ' до ур.' + (xpp.level + 1)}</span>{xpp.ready && <span>✓ готов</span>}</div>
        <div style={{ height: 4, borderRadius: 2, background: '#0e0f16', overflow: 'hidden', marginTop: 1 }}><div style={{ width: xpp.pct + '%', height: '100%', background: xpp.ready ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} /></div>
        <div style={{ fontSize: 7, color: '#7c8299', marginTop: 2 }}>{'Награда за ур.' + (c.level + 1) + ': +' + levelUpReward(c.level + 1).stat + ' хар. очк. · +' + levelUpReward(c.level + 1).skill + ' нав. очк.'}</div>
      </div>

      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <button onClick={levelUp} title="Повысить уровень" style={{ padding: '3px 6px', borderRadius: 4, border: '1px solid ' + (xpp.ready ? '#10b981' : '#10b98128'), background: xpp.ready ? '#10b981' : '#0e2018', fontSize: 8, fontWeight: 700, color: xpp.ready ? '#fff' : '#34d399', cursor: 'pointer' }}>⬆️ Ур.+1</button>
        <button onClick={rest} style={{ padding: '3px 6px', borderRadius: 4, border: '1px solid #10b98128', background: '#0e2018', fontSize: 8, fontWeight: 700, color: '#34d399', cursor: 'pointer' }}>💤</button>
        {[-5, -1, 1, 5].map(function (d) { return <button key={d} onClick={function () { adjHp(d); }} style={{ padding: '3px 5px', borderRadius: 4, border: '1px solid #ef444420', background: d < 0 ? '#2a1414' : '#0e2018', fontSize: 8, fontWeight: 700, color: d < 0 ? '#ef4444' : '#10b981', cursor: 'pointer' }}>{'HP' + (d > 0 ? '+' : '') + d}</button>; })}
        <button onClick={del} style={{ padding: '3px 6px', borderRadius: 4, border: '1px solid #ef444440', background: '#2a1414', fontSize: 8, fontWeight: 700, color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
      </div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <span style={{ fontSize: 7, color: '#7c8299' }}>Опыт:</span>
        <input type="number" value={xg} onChange={function (e) { setXg(e.target.value); }} placeholder="±XP" style={{ width: 50, padding: '2px 4px', fontSize: 8, borderRadius: 4, border: '1px solid #34374a', background: '#161826', color: '#e9e9ed' }} />
        <button onClick={giveXp} style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #f0b35240', background: '#241c08', fontSize: 8, fontWeight: 700, color: '#f0b352', cursor: 'pointer' }}>Выдать</button>
      </div>
    </div>
  );
}

/* ── Обзор: панель партии целиком + быстрые командные действия ── */
function Overview(pr) {
  const [q, setQ] = useState('');
  const shown = q.trim() ? pr.characters.filter(function (c) { return (c.name || '').toLowerCase().includes(q.trim().toLowerCase()); }) : pr.characters;

  function restAll() {
    if (pr.characters.length === 0) return;
    if (!window.confirm('Полностью восстановить HP и Волю всем ' + pr.characters.length + ' персонажам партии?')) return;
    pr.characters.forEach(function (c) {
      const mx = c.hpOv || mHP(cF(c).fs, c);
      pr.saveChar(c._fbId, Object.assign({}, c, { curHp: mx, curWill: c.willOv || cF(c).fs.WILL || 1, shakenPenalty: 0, broken: false }));
    });
    if (pr.addGmLog) pr.addGmLog({ who: pr.myName || 'ГМ', label: '🌙 Отдых всей партии', detail: pr.characters.map(function (c) { return c.name || '?'; }).join(', ') });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={q} onChange={function (e) { setQ(e.target.value); }} placeholder="🔎 Поиск игрока по имени…" style={{ flex: '1 1 200px', padding: '7px 9px', border: '2px solid #34374a', borderRadius: 8, fontSize: 12, fontFamily: "'Inter',sans-serif", background: '#232532', color: '#e9e9ed', outline: 'none' }} />
        <button onClick={restAll} disabled={pr.characters.length === 0} style={{ padding: '7px 12px', borderRadius: 8, border: '2px solid #7c3aed40', background: 'rgba(124,58,237,.12)', color: '#a78bfa', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 11, cursor: pr.characters.length === 0 ? 'default' : 'pointer', opacity: pr.characters.length === 0 ? 0.5 : 1 }}>🌙 Отдых всей партии</button>
      </div>

      <GMRoll addLog={pr.addLog} />

      {pr.characters.length === 0 && <div style={{ textAlign: 'center', padding: 30, color: '#9397ab' }}>Ожидаем игроков...</div>}
      {pr.characters.length > 0 && shown.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: '#9397ab', fontStyle: 'italic' }}>Никого не найдено</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8 }}>
        {shown.map(function (c) { return <PartyCard key={c._fbId} char={c} saveChar={pr.saveChar} deleteChar={pr.deleteChar} onOpen={pr.onOpen} addGmLog={pr.addGmLog} myName={pr.myName} />; })}
      </div>
    </div>
  );
}

/* ── История ГМ: свои же действия (выдал XP, поднял уровень, лечил/бил,
   удалил персонажа...) отдельно от общего чата/бросков — чтобы можно было
   отследить, что сам менял игрокам. ── */
function HistoryPanel(pr) {
  const entries = pr.gmLog || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 15, color: '#7c3aed' }}>📜 История действий ГМ</div>
        {pr.clearGmLog && entries.length > 0 && <button onClick={function () { if (window.confirm('Очистить историю действий ГМ?')) pr.clearGmLog(); }} style={{ fontSize: 9, background: '#2a1414', border: '1px solid #ef444420', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>🗑️ Очистить</button>}
      </div>
      {entries.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: '#9397ab', fontStyle: 'italic', fontSize: 11 }}>Пока пусто — здесь будут появляться твои действия (выдача опыта, уровни, урон/лечение, удаления)</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {entries.map(function (e, i) {
          return (
            <div key={i} style={{ background: '#1b1d29', border: '1px solid #34374a20', borderRadius: 7, padding: '6px 9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: 11, color: '#e9e9ed' }}>{e.label}</span>
                {e.ts && <span style={{ fontSize: 8, color: '#7c8299' }}>{new Date(e.ts).toLocaleTimeString()}</span>}
              </div>
              {e.detail && <div style={{ fontSize: 10, color: '#9397ab', marginTop: 1 }}>{e.detail}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatSection(pr) {
  const [chatRoll, setChatRoll] = useState(null);
  const [chatCoopRoll, setChatCoopRoll] = useState(null);
  const [speakAs, setSpeakAs] = useState('Мастер');
  const spawnedList = Object.entries(pr.spawned || {}).filter(function (e) { var hp = e[1].hp !== undefined ? e[1].hp : e[1].maxHp; return hp > 0; });
  const speakOptions = ['Мастер'].concat(spawnedList.map(function (e) { return e[1].name; }));
  const activeSpeaker = speakOptions.indexOf(speakAs) >= 0 ? speakAs : 'Мастер';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <RollPopup roll={chatRoll} onClose={function () { setChatRoll(null); }} />
      <CoopRollPopup roll={chatCoopRoll} onClose={function () { setChatCoopRoll(null); }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 15, color: 'var(--color-accent)', flex: 1 }}>💬 Чат</span>
        {pr.clearChat && <button onClick={function () { if (!window.confirm('Очистить весь чат (сообщения и броски)?')) return; pr.clearChat(); if (pr.clearLogs) pr.clearLogs(); }} className="n-btn" style={{ padding: '4px 8px', fontSize: 11, color: '#ef4444' }}>Очистить</button>}
      </div>
      {spawnedList.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: '#9397ab', fontWeight: 700 }}>🎭 Говорю за:</span>
          {speakOptions.map(function (name) {
            const on = activeSpeaker === name;
            return <button key={name} onClick={function () { setSpeakAs(name); }} style={{ padding: '3px 9px', borderRadius: 6, border: '2px solid ' + (on ? (name === 'Мастер' ? '#7c3aed' : '#ef4444') : '#34374a'), background: on ? (name === 'Мастер' ? '#1f1330' : '#2a1414') : '#1b1d29', color: on ? (name === 'Мастер' ? '#a78bfa' : '#ef4444') : '#9397ab', fontWeight: on ? 700 : 400, fontSize: 10, cursor: 'pointer' }}>{name === 'Мастер' ? '🎙 Мастер' : '👹 ' + name}</button>;
          })}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatTab chat={pr.chat} logs={pr.logs} sendChat={pr.sendChat} addLog={pr.addLog} onRoll={setChatRoll} onCoopRoll={setChatCoopRoll} characters={pr.characters} spawned={pr.spawned} who={activeSpeaker} />
      </div>
    </div>
  );
}

function GMPanel(pr) {
  const [sid, setSid] = useState(null);
  const [section, setSection] = useState('overview');
  const [showDonate, setShowDonate] = useState(false);

  const sel = pr.characters.find(function (c) { return c._fbId === sid; });
  if (sel) return <GameView char={sel} save={function (d) { pr.saveChar(sel._fbId, d); }} onBack={function () { setSid(null); }} isGM={true} logs={pr.logs} addLog={pr.addLog} chat={pr.chat} sendChat={pr.sendChat} lore={pr.lore} mapData={pr.mapData} saveMap={pr.saveMap} characters={pr.characters} spawned={pr.spawned} saveSpawned={pr.saveSpawned} pendAtk={pr.pendAtk} clearPendingAttack={pr.clearPendingAttack} room={pr.roomCode} savePendingAttack={pr.savePendingAttack} saveNpcHit={pr.saveNpcHit} shop={pr.shop} initiative={pr.initiative} saveInitiative={pr.saveInitiative} traits={pr.traits} />;

  const backToOverview = function () { setSection('overview'); };

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
      {showDonate && <DonatePage onClose={function () { setShowDonate(false); }} isGM={true} saveMap={pr.saveMap} mapData={pr.mapData} />}
      <NavRail section={section} setSection={setSection} onDonate={function () { setShowDonate(true); }} />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 12 }}>
        {section === 'overview' && <Overview characters={pr.characters} saveChar={pr.saveChar} deleteChar={pr.deleteChar} onOpen={function (id) { setSid(id); }} addLog={pr.addLog} addGmLog={pr.addGmLog} myName={pr.myName} />}
        {section === 'chat' && <ChatSection chat={pr.chat} logs={pr.logs} sendChat={pr.sendChat} addLog={pr.addLog} clearChat={pr.clearChat} clearLogs={pr.clearLogs} characters={pr.characters} spawned={pr.spawned} />}
        {section === 'history' && <HistoryPanel gmLog={pr.gmLog} clearGmLog={pr.clearGmLog} />}
        {section === 'bestiary' && <BestiaryEditor npcTempl={pr.npcTempl} saveNpcTempl={pr.saveNpcTempl} spawned={pr.spawned} saveSpawned={pr.saveSpawned} onBack={backToOverview} addLog={pr.addLog} characters={pr.characters} roomCode={pr.roomCode} savePendingAttack={pr.savePendingAttack} clearPendingAttack={pr.clearPendingAttack} pendAtk={pr.pendAtk} logs={pr.logs} initiative={pr.initiative} saveInitiative={pr.saveInitiative} shop={pr.shop} />}
        {section === 'lore' && <LoreEditor lore={pr.lore} saveLore={pr.saveLore} mapData={pr.mapData} saveMap={pr.saveMap} characters={pr.characters} onBack={backToOverview} />}
        {section === 'races' && <RaceEditor races={pr.races} saveRaces={pr.saveRaces} onBack={backToOverview} />}
        {section === 'profs' && <ProfEditor profs={pr.profs} saveProfs={pr.saveProfs} onBack={backToOverview} />}
        {section === 'shop' && <ShopEditor shop={pr.shop} saveShop={pr.saveShop} onBack={backToOverview} />}
        {section === 'traits' && <TraitEditor traits={pr.traits} saveTraits={pr.saveTraits} onBack={backToOverview} />}
      </div>
    </div>
  );
}

export default GMPanel;
