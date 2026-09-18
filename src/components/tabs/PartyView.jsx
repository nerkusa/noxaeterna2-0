import React, { useState } from 'react';
import { cF, mHP } from '../../utils/character';
import { SD, skLabel } from '../../data/stats';
import { getProfs } from '../../utils/profStore';

export default function PartyView(pr) {
  var chars = (pr.characters || []).filter(function (c) { return c._fbId !== pr.selfId; });
  var _o = useState(null); var openId = _o[0]; var setOpen = _o[1];
  if (chars.length === 0) return <div style={{ padding: 20, textAlign: 'center', color: '#9397ab', fontStyle: 'italic', fontSize: 11 }}>Нет других персонажей</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 9, color: '#9397ab', textAlign: 'center', fontStyle: 'italic' }}>👀 Только просмотр — чужих персонажей менять нельзя</div>
      {chars.map(function (c) {
        var inf = cF(c); var fs = inf.fs; var es = inf.eSk;
        var pf = getProfs().find(function (p) { return p.id === c.profId; });
        var mx = c.hpOv || mHP(fs); var hp = (c.curHp !== null && c.curHp !== undefined) ? c.curHp : mx;
        var mxW = c.willOv || fs.WILL || 1; var w = (c.curWill !== null && c.curWill !== undefined) ? c.curWill : mxW;
        var open = openId === c._fbId;
        return (
          <div key={c._fbId} style={{ border: '2px solid #34374a', borderRadius: 9, background: '#1b1d29', overflow: 'hidden' }}>
            <button onClick={function () { setOpen(open ? null : c._fbId); }} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 9px', border: 'none', background: 'none', cursor: 'pointer' }}>
              <span style={{ textAlign: 'left' }}><b style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#e9e9ed' }}>{c.name || '?'}</b> <span style={{ fontSize: 8, color: '#9397ab' }}>{((inf.race && inf.race.name) || '') + ' · ' + ((pf && pf.name) || '') + ' · Ур.' + c.level + (c.active ? '' : ' · не в игре')}</span></span>
              <span style={{ fontSize: 9, color: '#9397ab', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </button>
            <div style={{ padding: '0 9px 7px', fontSize: 10, color: '#b2b6ca' }}>{'❤️ ' + hp + '/' + mx + '   🔥 ' + w + '/' + mxW}</div>
            {open && (
              <div style={{ padding: '0 9px 9px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {(c.portrait || c.hair) && <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{c.portrait && <img src={c.portrait} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #34374a', flexShrink: 0 }} />}{c.hair && <div style={{ fontSize: 8, color: '#9397ab', fontStyle: 'italic', flex: 1, lineHeight: 1.5 }}>{c.hair}</div>}</div>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>{SD.map(function (s) { return <span key={s.key} style={{ fontSize: 8, fontWeight: 700, color: s.color, background: s.color + '14', borderRadius: 5, padding: '2px 5px' }}>{s.emoji + ' ' + s.key + ' ' + (fs[s.key] || 0)}</span>; })}</div>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: '#9397ab', marginBottom: 2 }}>Навыки</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>{Object.keys(es).filter(function (k) { return es[k] > 0; }).map(function (k) { return <span key={k} style={{ fontSize: 8, background: '#232532', borderRadius: 4, padding: '1px 5px', color: '#b2b6ca' }}>{skLabel(k) + ' ' + es[k]}</span>; })}</div>
                </div>
                {(c.weapons || []).length > 0 && <div style={{ fontSize: 8, color: '#9397ab' }}>{'⚔️ ' + (c.weapons || []).map(function (x) { return x.name; }).join(', ')}</div>}
                {(c.armors || []).length > 0 && <div style={{ fontSize: 8, color: '#9397ab' }}>{'🛡️ ' + (c.armors || []).map(function (x) { return x.name; }).join(', ')}</div>}
                {c.bio && <div style={{ fontSize: 8, color: '#9397ab', fontStyle: 'italic', lineHeight: 1.5 }}>{c.bio}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
