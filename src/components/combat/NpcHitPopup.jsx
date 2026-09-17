import React from 'react';

export default function NpcHitPopup(pr) {
  const events = pr.events || {};
  const entries = Object.entries(events).sort(function (a, b) { return (a[1].ts || 0) - (b[1].ts || 0); });
  if (!entries.length) return null;
  const id = entries[0][0];
  const ev = entries[0][1];
  const dead = ev.newHp <= 0;
  const clr = function () { if (pr.onClear) pr.onClear(id); };
  return (
    <div onClick={clr} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 996, animation: 'fadeIn 0.15s' }}>
      <div onClick={function (e) { e.stopPropagation(); }} style={{ background: 'linear-gradient(135deg,#262219,#1d1a14)', border: '3px solid ' + (dead ? '#f59e0b' : '#ef4444'), borderRadius: 16, padding: '16px 22px', textAlign: 'center', minWidth: 250, maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'popIn 0.3s' }}>
        <div style={{ fontSize: 30, marginBottom: 2 }}>{dead ? '💀' : '💥'}</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: 15, color: '#ef4444', marginBottom: 2 }}>{(ev.attackerName || '???') + ' → ' + ev.npcName}</div>
        <div style={{ fontSize: 9, color: '#a89a82', marginBottom: 8 }}>{(ev.srcLabel ? ev.srcLabel + ' · ' : '') + (ev.dmgType || '')}</div>

        <div style={{ background: '#1a1410', border: '1px solid #322d24', borderRadius: 10, padding: '8px 12px', marginBottom: 8 }}>
          <div style={{ fontSize: 9, color: '#a89a82', marginBottom: 3 }}>{(ev.zoneE || '') + ' ' + (ev.zone || '') + ' ×' + (ev.zoneMult || 1)}</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 30, fontWeight: 900, color: '#dc2626' }}>{'−' + ev.dmg + ' HP'}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, color: '#a89a82' }}>{ev.oldHp}</span>
            <span style={{ fontSize: 13, color: '#a89a82' }}>→</span>
            <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: 20, color: dead ? '#f59e0b' : '#ece5d8' }}>{ev.newHp}</span>
          </div>
          {ev.desc && <div style={{ fontSize: 8, color: '#8d8270', marginTop: 3, fontFamily: 'monospace' }}>{ev.desc}</div>}
        </div>

        {dead && <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 8 }}>{ev.npcName + ' повержен!'}</div>}
        {entries.length > 1 && <div style={{ fontSize: 8, color: '#a89a82', marginBottom: 6 }}>{'ещё событий: ' + (entries.length - 1)}</div>}
        <button onClick={clr} style={{ width: '100%', padding: 8, borderRadius: 8, border: '2px solid #3a3429', background: '#1d1a14', color: '#ece5d8', fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>OK</button>
      </div>
    </div>
  );
}
