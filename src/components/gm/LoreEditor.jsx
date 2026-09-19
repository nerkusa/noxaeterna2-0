import React, { useState, useRef, useEffect } from 'react';
import MapView from '../tabs/MapView';
import LoreContent from '../LoreContent';
import { normalizeSections, sectionsToObj, newSection, downscaleImage, MAP_META, LORE_COLORS, LORE_ICONS } from '../../utils/lore';
import LiveField from '../LiveField';

const backBtn = { padding: '5px 12px', borderRadius: 6, border: '2px solid #34374a', background: '#1b1d29', color: '#e9e9ed', fontWeight: 700, fontSize: 11, cursor: 'pointer' };
const lbl = { display: 'block', fontSize: 9, fontWeight: 700, color: '#9397ab', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 };
const inp = { width: '100%', padding: '7px 8px', border: '2px solid #34374a', borderRadius: 6, fontSize: 12, fontFamily: "'Inter',sans-serif", background: '#232532', color: '#e9e9ed', outline: 'none' };
const addBtn = { flex: 1, padding: '9px', borderRadius: 8, border: '2px solid #8b5cf640', background: '#1f1330', color: '#a78bfa', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'block', textAlign: 'center' };
const blockWrap = { background: '#1b1d29', border: '2px solid #34374a', borderRadius: 10, padding: 10 };
const miniBtn = { width: 24, height: 22, borderRadius: 5, border: '1px solid #34374a', background: '#232532', color: '#9397ab', fontSize: 11, cursor: 'pointer', lineHeight: 1, padding: 0 };
const fmtBtn = { padding: '4px 8px', borderRadius: 5, border: '1px solid #34374a', background: '#232532', color: '#b2b6ca', fontSize: 11, cursor: 'pointer' };

function BlockEditor(pr) {
  const block = pr.block;
  const ref = useRef(null);
  /* Локальный буфер текста — та же защита от гонки, что и в LiveField
     (входящее block.value из пропсов не перетирает то, что ГМ ещё
     печатает), но textarea держим "ручной", а не через LiveField,
     потому что кнопкам разметки (Ж/К/H1/…) нужен прямой ref на DOM-узел
     для позиции курсора — через forwardRef это делать сложнее, чем
     просто продублировать логику буфера здесь. */
  const [text, setText] = useState(block.value || '');
  const focusedRef = useRef(false);
  useEffect(function () { if (!focusedRef.current) setText(block.value || ''); }, [block.value]);
  const wrap = function (pre, post) {
    const ta = ref.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd, v = text;
    const sel = v.slice(s, e) || 'текст';
    const nv = v.slice(0, s) + pre + sel + post + v.slice(e);
    setText(nv);
    pr.onChange({ value: nv });
    setTimeout(function () { ta.focus(); ta.selectionStart = s + pre.length; ta.selectionEnd = s + pre.length + sel.length; }, 0);
  };
  const prefixLine = function (pre) {
    const ta = ref.current; if (!ta) return;
    const v = text, s = ta.selectionStart;
    const ls = v.lastIndexOf('\n', s - 1) + 1;
    const nv = v.slice(0, ls) + pre + v.slice(ls);
    setText(nv);
    pr.onChange({ value: nv });
    setTimeout(function () { ta.focus(); }, 0);
  };
  const ctrls = (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <button onClick={function () { pr.onMove(-1); }} disabled={pr.idx === 0} style={Object.assign({}, miniBtn, { opacity: pr.idx === 0 ? 0.3 : 1 })}>↑</button>
      <button onClick={function () { pr.onMove(1); }} disabled={pr.idx === pr.total - 1} style={Object.assign({}, miniBtn, { opacity: pr.idx === pr.total - 1 ? 0.3 : 1 })}>↓</button>
      <button onClick={pr.onDelete} style={Object.assign({}, miniBtn, { color: '#ef4444' })}>🗑</button>
    </div>
  );

  if (block.type === 'image') {
    return (
      <div style={blockWrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 9, color: '#9397ab', fontWeight: 700 }}>🖼️ Изображение</span>{ctrls}</div>
        {block.value && <img src={block.value} alt="" style={{ width: '100%', borderRadius: 8, border: '2px solid #34374a', marginBottom: 6, display: 'block' }} />}
        <label style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 6, border: '1px solid #8b5cf640', background: '#1f1330', color: '#a78bfa', fontSize: 10, fontWeight: 700, cursor: 'pointer', marginBottom: 6 }}>🔄 Заменить<input type="file" accept="image/*" style={{ display: 'none' }} onChange={function (e) { const f = e.target.files && e.target.files[0]; if (f) pr.onReplaceImage(f); }} /></label>
        <LiveField placeholder="Подпись (необязательно)" value={block.caption || ''} onCommit={function (val) { pr.onChange({ caption: val }); }} style={inp} />
      </div>
    );
  }

  return (
    <div style={blockWrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}><span style={{ fontSize: 9, color: '#9397ab', fontWeight: 700 }}>📝 Текст</span>{ctrls}</div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4, flexWrap: 'wrap' }}>
        <button onMouseDown={function (e) { e.preventDefault(); }} onClick={function () { wrap('**', '**'); }} style={fmtBtn}><b>Ж</b></button>
        <button onMouseDown={function (e) { e.preventDefault(); }} onClick={function () { wrap('*', '*'); }} style={fmtBtn}><i>К</i></button>
        <button onMouseDown={function (e) { e.preventDefault(); }} onClick={function () { prefixLine('## '); }} style={fmtBtn}>H1</button>
        <button onMouseDown={function (e) { e.preventDefault(); }} onClick={function () { prefixLine('### '); }} style={fmtBtn}>H2</button>
        <button onMouseDown={function (e) { e.preventDefault(); }} onClick={function () { prefixLine('- '); }} style={fmtBtn}>• Список</button>
        <button onMouseDown={function (e) { e.preventDefault(); }} onClick={function () { prefixLine('---\n'); }} style={fmtBtn}>― Линия</button>
      </div>
      <textarea ref={ref} value={text} onChange={function (e) { setText(e.target.value); pr.onChange({ value: e.target.value }); }} onFocus={function () { focusedRef.current = true; }} onBlur={function () { focusedRef.current = false; setText(block.value || ''); }} style={Object.assign({}, inp, { minHeight: 130, resize: 'vertical', lineHeight: 1.5, fontSize: 12, padding: 8 })} />
    </div>
  );
}

function EditCard(pr) {
  const meta = pr.meta;
  const color = meta.color || '#8b5cf6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 9, border: '2px solid ' + color + '20', background: color + '0c' }}>
      <div style={{ width: 30, height: 30, borderRadius: 6, background: color + '1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{meta.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 11, color: '#e9e9ed', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.title}</div>
        {pr.subtitle && <div style={{ fontSize: 8, color: '#9397ab' }}>{pr.subtitle}</div>}
      </div>
      {!pr.locked && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={pr.onUp} disabled={pr.first} style={Object.assign({}, miniBtn, { opacity: pr.first ? 0.3 : 1 })}>↑</button>
          <button onClick={pr.onDown} disabled={pr.last} style={Object.assign({}, miniBtn, { opacity: pr.last ? 0.3 : 1 })}>↓</button>
        </div>
      )}
      <button onClick={pr.onOpen} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid ' + color + '40', background: color + '18', color: color, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>✏️</button>
    </div>
  );
}

export default function LoreEditor(pr) {
  const lore = pr.lore || {};
  const saveLore = pr.saveLore;
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(false);
  const sections = normalizeSections(lore);
  const persist = function (arr) { saveLore({ sections: sectionsToObj(arr) }); };

  const updateSection = function (id, patch) { persist(sections.map(function (s) { return s.id === id ? Object.assign({}, s, patch) : s; })); };
  const moveSection = function (id, dir) {
    const arr = sections.slice();
    const i = arr.findIndex(function (s) { return s.id === id; });
    const j = i + dir; if (j < 0 || j >= arr.length) return;
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    persist(arr);
  };
  const addSection = function () {
    const arr = sections.slice();
    const s = newSection(arr.length);
    arr.push(s); persist(arr); setEditId(s.id);
  };
  const deleteSection = function (id) {
    if (!window.confirm('Удалить раздел целиком?')) return;
    persist(sections.filter(function (s) { return s.id !== id; }));
    setEditId(null);
  };

  // ---- Map editor (kept intact) ----
  if (editId === 'map') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={function () { setEditId(null); }} style={backBtn}>← Назад</button>
        <MapView mapData={pr.mapData} saveMap={pr.saveMap} characters={pr.characters} isGM={true} />
      </div>
    );
  }

  // ---- Section editor ----
  const sec = sections.find(function (s) { return s.id === editId; });
  if (sec) {
    const blocks = sec.blocks || [];
    const setBlocks = function (b) { updateSection(sec.id, { blocks: b }); };
    const updBlock = function (i, patch) { setBlocks(blocks.map(function (b, k) { return k === i ? Object.assign({}, b, patch) : b; })); };
    const delBlock = function (i) { setBlocks(blocks.filter(function (_, k) { return k !== i; })); };
    const moveBlock = function (i, dir) { const j = i + dir; if (j < 0 || j >= blocks.length) return; const a = blocks.slice(); const t = a[i]; a[i] = a[j]; a[j] = t; setBlocks(a); };
    const addText = function () { setBlocks(blocks.concat([{ type: 'text', value: '' }])); };
    const addImage = function (file) { if (!file) return; downscaleImage(file).then(function (url) { setBlocks(blocks.concat([{ type: 'image', value: url, caption: '' }])); }); };

    if (preview) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={function () { setPreview(false); }} style={Object.assign({}, backBtn, { color: '#a78bfa', alignSelf: 'flex-start' })}>← Редактировать</button>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 28 }}>{sec.icon}</div><div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 16, color: sec.color }}>{sec.title}</div></div>
          <LoreContent section={sec} />
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={function () { setEditId(null); }} style={backBtn}>← Разделы</button>
          <button onClick={function () { setPreview(true); }} style={Object.assign({}, backBtn, { color: '#34d399', borderColor: '#10b98140' })}>👁 Превью</button>
        </div>
        <div style={{ background: '#1b1d29', border: '2px solid #34374a', borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={lbl}>Название</label>
            <LiveField value={sec.title} onCommit={function (val) { updateSection(sec.id, { title: val }); }} style={inp} />
          </div>
          <div>
            <label style={lbl}>Иконка</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {LORE_ICONS.map(function (ic) {
                return <button key={ic} onClick={function () { updateSection(sec.id, { icon: ic }); }} style={{ width: 30, height: 30, borderRadius: 6, border: '2px solid ' + (sec.icon === ic ? sec.color : '#34374a'), background: sec.icon === ic ? sec.color + '22' : '#232532', fontSize: 15, cursor: 'pointer' }}>{ic}</button>;
              })}
            </div>
          </div>
          <div>
            <label style={lbl}>Цвет</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {LORE_COLORS.map(function (c) {
                return <button key={c} onClick={function () { updateSection(sec.id, { color: c }); }} style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid ' + (sec.color === c ? '#e9e9ed' : 'transparent'), background: c, cursor: 'pointer', padding: 0 }} />;
              })}
            </div>
          </div>
        </div>

        {blocks.map(function (b, i) {
          return <BlockEditor key={i} block={b} idx={i} total={blocks.length}
            onChange={function (patch) { updBlock(i, patch); }}
            onDelete={function () { delBlock(i); }}
            onMove={function (dir) { moveBlock(i, dir); }}
            onReplaceImage={function (file) { downscaleImage(file).then(function (url) { updBlock(i, { value: url }); }); }} />;
        })}

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={addText} style={addBtn}>➕ Текст</button>
          <label style={addBtn}>🖼️ Изображение<input type="file" accept="image/*" style={{ display: 'none' }} onChange={function (e) { addImage(e.target.files && e.target.files[0]); }} /></label>
        </div>
        <button onClick={function () { deleteSection(sec.id); }} style={{ padding: 9, borderRadius: 8, border: '2px solid #ef444440', background: '#2a1414', color: '#ef4444', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>🗑️ Удалить раздел</button>
      </div>
    );
  }

  // ---- Section list ----
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ textAlign: 'center', padding: '6px 0' }}>
        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 16, color: '#a78bfa' }}>📚 Редактор</div>
      </div>
      <button onClick={addSection} style={{ padding: 10, borderRadius: 9, border: '2px dashed #8b5cf660', background: '#1f1330', color: '#a78bfa', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>➕ Новый раздел</button>
      <EditCard meta={MAP_META} subtitle="🗺️ Карта мира — нажми, чтобы открыть" onOpen={function () { setEditId('map'); }} locked />
      {sections.map(function (s, i) {
        const imgs = (s.blocks || []).filter(function (b) { return b.type === 'image'; }).length;
        const txt = (s.blocks || []).filter(function (b) { return b.type === 'text' && b.value && b.value.trim(); }).length;
        return <EditCard key={s.id} meta={s} subtitle={'📝 ' + txt + ' · 🖼️ ' + imgs}
          onOpen={function () { setEditId(s.id); }}
          onUp={function () { moveSection(s.id, -1); }}
          onDown={function () { moveSection(s.id, 1); }}
          first={i === 0} last={i === sections.length - 1} />;
      })}
      {sections.length === 0 && <div style={{ textAlign: 'center', padding: 16, color: '#9397ab', fontSize: 11 }}>Разделов пока нет — создай первый кнопкой выше</div>}
    </div>
  );
}
