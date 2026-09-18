import React, { useState } from 'react';
import { emptyCurrency, toCopper, fmtCurrency } from '../utils/currency';

// Reusable "take from shop" picker.
// props: items, color, onPick(item), sub(item)->string, label,
//        optional grouping: subOf(item)->key, suborder[], sublabels{key:label}
export default function ShopPicker(pr) {
  const [open, setOpen] = useState(false);
  const items = pr.items || [];
  const color = pr.color || '#f59e0b';

  function priceOf(it) { return (it.price && typeof it.price === 'object') ? it.price : emptyCurrency(); }

  function row(it) {
    const price = priceOf(it);
    const cost = toCopper(price);
    return (
      <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1b1d29', border: '1px solid #34374a', borderRadius: 6, padding: '4px 7px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#e9e9ed' }}>{it.name}{cost > 0 ? <span style={{ fontSize: 8, color: '#d97706', marginLeft: 5 }}>{'💰 ' + fmtCurrency(price)}</span> : null}</div>
          {pr.sub && <div style={{ fontSize: 8, color: '#9397ab' }}>{pr.sub(it)}</div>}
        </div>
        <button onClick={function () { pr.onPick(it); setOpen(false); }} style={{ padding: '3px 9px', borderRadius: 5, border: 'none', background: color, color: '#161826', fontWeight: 700, fontSize: 9, cursor: 'pointer' }}>Взять</button>
      </div>
    );
  }

  let body;
  if (pr.suborder && pr.subOf) {
    body = pr.suborder.map(function (sk) {
      const list = items.filter(function (i) { return pr.subOf(i) === sk; });
      if (!list.length) return null;
      return (
        <div key={sk} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: color, marginTop: 3 }}>{(pr.sublabels && pr.sublabels[sk]) || sk}</div>
          {list.map(row)}
        </div>
      );
    });
  } else {
    body = items.map(row);
  }

  return (
    <div style={{ marginBottom: 6 }}>
      <button onClick={function () { setOpen(!open); }} style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px dashed ' + color + '60', background: color + '12', color: color, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>{open ? '✕ Закрыть магазин' : (pr.label || '🛒 Взять из магазина')}</button>
      {open && (
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {items.length === 0 && <div style={{ fontSize: 9, color: '#9397ab', fontStyle: 'italic', textAlign: 'center', padding: 6 }}>Пусто — ГМ ещё не добавил вещи этой категории</div>}
          {body}
        </div>
      )}
    </div>
  );
}
