import React from 'react';

export default function InitiativeBar(pr) {
  const init = pr.initiative;
  if (!init || !Array.isArray(init.list) || !init.list.length) return null;
  const turn = init.turn || 0;
  return (
    <div style={{ border: '2px solid #f59e0b40', borderRadius: 9, padding: '6px 8px', background: '#231b08' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 11, color: '#f0b352' }}>⚔️ Инициатива</span>
        <span style={{ fontSize: 9, color: '#a89a82' }}>Раунд {init.round || 1}</span>
      </div>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
        {init.list.map(function (e, i) {
          const cur = i === turn;
          return (
            <div key={e.id + '_' + i} style={{ flexShrink: 0, minWidth: 56, padding: '3px 8px', borderRadius: 7, border: '2px solid ' + (cur ? '#f59e0b' : (e.kind === 'npc' ? '#ef444430' : '#3b82f630')), background: cur ? '#f59e0b22' : (e.kind === 'npc' ? '#2a1414' : '#0e1a2b'), textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: cur ? 900 : 600, color: cur ? '#f0b352' : (e.kind === 'npc' ? '#ef4444' : '#60a5fa'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>{(e.kind === 'npc' ? '👹 ' : '🛡 ') + e.name}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 900, color: '#ece5d8' }}>{e.init}</div>
              {cur && <div style={{ fontSize: 7, color: '#f0b352', fontWeight: 700 }}>● ХОД</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
