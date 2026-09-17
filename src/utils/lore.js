import { LORE_CH } from '../data/lore';

// metadata of legacy fixed chapters (for one-time migration of old rooms)
const LEGACY = {};
LORE_CH.forEach(function (c) { LEGACY[c.id] = c; });

export const MAP_META = LORE_CH.find(function (c) { return c.id === 'map'; })
  || { id: 'map', title: 'Карта Мидфаля', icon: '🗺️', color: '#10b981' };

export const LORE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#d97706', '#7c3aed', '#ec4899', '#64748b'];
export const LORE_ICONS = ['📖', '📜', '👥', '🛒', '🌍', '🏰', '🌊', '🧝', '⛏️', '🌙', '🐎', '🐉', '⚡', '💀', '⚔️', '👑', '🔮', '🗡️', '🛡️', '🏔️', '🌲', '🔥', '❄️', '🏛️'];

let _c = 0;
export function makeId() {
  return 's_' + Date.now().toString(36) + '_' + (_c++).toString(36);
}

export function newSection(order) {
  return { id: makeId(), title: 'Новый раздел', icon: '📖', color: '#8b5cf6', blocks: [{ type: 'text', value: '' }], order: order || 0 };
}

// returns a normalized, sorted array of sections from any lore shape (new or legacy)
export function normalizeSections(lore) {
  lore = lore || {};
  if (lore.sections && typeof lore.sections === 'object') {
    return Object.keys(lore.sections).map(function (id) {
      const s = lore.sections[id] || {};
      return {
        id: id,
        title: s.title || 'Без названия',
        icon: s.icon || '📖',
        color: s.color || '#8b5cf6',
        blocks: Array.isArray(s.blocks) ? s.blocks : (s.body ? [{ type: 'text', value: s.body }] : []),
        order: typeof s.order === 'number' ? s.order : 0,
      };
    }).sort(function (a, b) { return a.order - b.order; });
  }
  // legacy flat shape: { chapterId: "text", ... }
  return Object.keys(lore)
    .filter(function (k) { return k !== 'map' && typeof lore[k] === 'string' && lore[k].trim(); })
    .map(function (k) {
      const meta = LEGACY[k] || {};
      const idx = LORE_CH.findIndex(function (c) { return c.id === k; });
      return {
        id: k,
        title: meta.title || k,
        icon: meta.icon || '📖',
        color: meta.color || '#8b5cf6',
        blocks: [{ type: 'text', value: lore[k] }],
        order: idx < 0 ? 999 : idx,
      };
    })
    .sort(function (a, b) { return a.order - b.order; });
}

export function sectionsToObj(arr) {
  const obj = {};
  arr.forEach(function (s, i) {
    obj[s.id] = { title: s.title, icon: s.icon, color: s.color, blocks: s.blocks || [], order: i };
  });
  return obj;
}

// read an image File and return a downscaled JPEG data URL (keeps Realtime DB small)
export function downscaleImage(file, max, quality) {
  max = max || 1280;
  quality = quality || 0.82;
  return new Promise(function (resolve, reject) {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = function () {
      const img = new Image();
      img.onerror = function () { resolve(fr.result); };
      img.onload = function () {
        let w = img.width, h = img.height;
        if (w > max || h > max) {
          const r = Math.min(max / w, max / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        try {
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(cv.toDataURL('image/jpeg', quality));
        } catch (e) { resolve(fr.result); }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
