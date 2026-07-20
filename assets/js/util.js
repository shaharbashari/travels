// ============================================================================
//  util.js — עזרי תצוגה, תאריכים, קטגוריות
// ============================================================================

/** בריחה מ-HTML (מונע הזרקה). */
export function esc(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** ניתוח תאריך ISO בבטחה (בצהריים, כדי לנטרל אזורי זמן). */
export function parseDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

const heDate = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
const heDateShort = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' });
const heWeekday = new Intl.DateTimeFormat('he-IL', { weekday: 'long' });

export const fmtDate = (iso) => { const d = parseDate(iso); return d ? heDate.format(d) : ''; };
export const fmtDateShort = (iso) => { const d = parseDate(iso); return d ? heDateShort.format(d) : ''; };
export const fmtWeekday = (iso) => { const d = parseDate(iso); return d ? heWeekday.format(d) : ''; };

export function fmtRange(startIso, endIso) {
  const s = parseDate(startIso), e = parseDate(endIso);
  if (!s) return '';
  if (!e) return heDate.format(s);
  return `${heDateShort.format(s)} – ${heDate.format(e)}`;
}

/** מספר הימים עד תאריך (0 = היום, שלילי = עבר). */
export function daysUntil(iso) {
  const d = parseDate(iso); if (!d) return null;
  const today = new Date(); today.setHours(12, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

/** מספר הלילות בין שני תאריכים. */
export function nights(startIso, endIso) {
  const s = parseDate(startIso), e = parseDate(endIso);
  if (!s || !e) return null;
  return Math.max(0, Math.round((e - s) / 86400000));
}

/** סטטוס הטיול לפי התאריכים (גובר על status אם קיים). */
export function tourStatus(tour) {
  const startIn = daysUntil(tour.dates?.start);
  const endIn = daysUntil(tour.dates?.end);
  if (endIn != null && endIn < 0) return 'past';
  if (startIn != null && startIn <= 0 && endIn >= 0) return 'active';
  return 'upcoming';
}

export const STATUS_LABELS = {
  upcoming: { he: 'בקרוב', cls: 'badge--danube' },
  active: { he: 'עכשיו בטיול', cls: 'badge--sage' },
  past: { he: 'הסתיים', cls: '' },
};

/** קטגוריות "מה עושים" — תווית, אימוג׳י, צבע. */
export const CATEGORIES = {
  attractions: { he: 'אתרים ומקומות', emoji: '🏛️', color: 'var(--c-attractions)' },
  restaurants: { he: 'מסעדות', emoji: '🍽️', color: 'var(--c-restaurants)' },
  sweets: { he: 'מתוקים ובתי קפה', emoji: '🍰', color: 'var(--c-sweets)' },
  baths: { he: 'מרחצאות תרמיים', emoji: '🧖', color: 'var(--c-baths)' },
  shopping: { he: 'שופינג', emoji: '🛍️', color: 'var(--c-shopping)' },
  nightlife: { he: 'בילוי וברים', emoji: '🍹', color: 'var(--c-nightlife)' },
};

/** צבע לפי אינדקס (לנקודות מסע / פינים) — פלטה בהירה. */
export const PALETTE = ['#ff4d67', '#2aa6e8', '#ffc233', '#7b5ce0', '#23c98a', '#ff8a3d', '#12c2b3'];

/**
 * תמונה ממוזערת עם נפילה חיננית לאימוג׳י אם אין תמונה / התמונה נכשלת.
 * @param {string} [img]   כתובת תמונה
 * @param {string} [emoji] אימוג׳י נפילה
 * @param {{cls?:string,color?:string}} [o]
 */
export function thumb(img, emoji, o = {}) {
  const style = o.color ? ` style="--c:${o.color}"` : '';
  const im = img
    ? `<img src="${esc(img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="this.classList.add('is-loaded')" onerror="this.remove()">`
    : '';
  return `<div class="thumb ${o.cls || ''}"${style}><span class="thumb__em">${esc(emoji || '📍')}</span>${im}</div>`;
}

/** צור אלמנט מ-HTML string. */
export function fromHTML(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** אנימציית ספירה למספר. */
export function countUp(el, to, dur = 900) {
  if (!el) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || to <= 0) { el.textContent = String(to); return; }
  const start = performance.now();
  function step(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(to * eased));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
