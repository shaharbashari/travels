// ============================================================================
//  edit.js — שכבת העריכה/הוספה (מוצגת רק לעורכים מורשים).
//  חוזה מול app.js:
//    init(rootEl)   — נקרא פעם אחת באתחול (rootEl = #app).
//    refresh(ctx)   — נקרא אחרי כל render.  ctx = { route, tour, place, canEdit }
//
//  כל העבודה על ה-DOM נעשית מאחורי init()/refresh() ומאחורי auth.canEdit(),
//  כדי שקוראים רגילים (שגם מייבאים את המודול) לא יראו כלום ולא יושפעו.
//  שכבת העריכה חיה ב-#edit-layer שמצורף ל-<body> ולכן שורדת render-ים חוזרים;
//  העפרונות פר-כרטיס מוזרקים מחדש ל-#app בכל refresh().
// ============================================================================
import * as store from './store.js';
import * as auth from './auth.js';
import { CATEGORIES, iconFor, pid, slugify, PERIODS, TRAVEL_MODES, travelLabel, fmtWeekday, fmtDateShort } from './util.js';
import { estimateFor, formatDistance } from './travel.js';

// ---- Wikimedia Commons (client-side, CORS-friendly) --------------------------
const COMMONS = (q) =>
  'https://commons.wikimedia.org/w/api.php?action=query&generator=search' +
  `&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=8` +
  '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=500&format=json&origin=*';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// ---- module state (no DOM access at import time) -----------------------------
let app = null;
let layer = null, fab = null, fabWrap = null, fabMenu = null, toastHost = null;
let modalEl = null, confirmEl = null;
let lastCtx = { route: { name: 'trips' }, canEdit: false };
let inited = false, menuOpen = false, submitting = false;
let prevOverflow = '', lastFocus = null, uid = 0;

// =============================================================================
//  tiny helpers
// =============================================================================
function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) n.setAttribute(k, '');
    else n.setAttribute(k, v);
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c == null || c === false) continue;
    n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return n;
}

function num(v) {
  const s = String(v == null ? '' : v).trim();
  if (s === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function gmapsLink(name, city) {
  const q = [name, city].filter(Boolean).join(', ');
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
}

function addDaysISO(iso, days) {
  if (!iso) return '';
  const parts = String(iso).split('-').map(Number);
  const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1, 12);
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function storeNoteText() {
  try {
    return store.isCloud()
      ? '☁️ השינויים נשמרים בענן ומשותפים לכל המכשירים'
      : '💾 השינויים נשמרים מקומית בדפדפן זה בלבד';
  } catch { return ''; }
}

function field(labelText, control, hint) {
  const wrap = el('div', { class: 'ed-field' });
  if (control && !control.id && /^(INPUT|SELECT|TEXTAREA)$/.test(control.tagName || '')) {
    control.id = 'ed-f-' + (++uid);
  }
  const lab = el('label', { class: 'ed-label' }, [labelText]);
  if (control && control.id) lab.setAttribute('for', control.id);
  wrap.append(lab, control);
  if (hint) wrap.appendChild(el('div', { class: 'ed-hint' }, [hint]));
  return wrap;
}

const row2 = (a, b) => el('div', { class: 'ed-row' }, [a, b]);

// =============================================================================
//  repeatable field rows
// =============================================================================
function repeatText(initial = [], opts = {}) {
  const rows = el('div', { class: 'ed-repeat__rows' });
  const addBtn = el('button', { type: 'button', class: 'ed-repeat__add', onclick: () => addRow('') },
    ['＋ ', opts.addLabel || 'הוסף']);
  const wrap = el('div', { class: 'ed-repeat' }, [rows, addBtn]);

  function addRow(v) {
    const inp = el('input', { class: 'ed-input', type: opts.type || 'text', value: v || '', placeholder: opts.placeholder || '' });
    if (opts.dir) inp.setAttribute('dir', opts.dir);
    const del = el('button', { type: 'button', class: 'ed-repeat__del', title: 'הסרה', 'aria-label': 'הסרה', onclick: () => row.remove() }, ['✕']);
    const row = el('div', { class: 'ed-repeat__row' }, [inp, del]);
    rows.appendChild(row);
    return inp;
  }
  (initial || []).forEach((v) => addRow(v));

  return {
    el: wrap,
    values: () => Array.prototype.map.call(rows.querySelectorAll('input'), (i) => i.value.trim()).filter(Boolean),
    add: (v) => {
      const val = (v || '').trim();
      if (!val) return;
      const have = Array.prototype.map.call(rows.querySelectorAll('input'), (i) => i.value.trim());
      if (have.indexOf(val) === -1) addRow(val);
    },
  };
}

function repeatLinks(initial = []) {
  const rows = el('div', { class: 'ed-repeat__rows' });
  const addBtn = el('button', { type: 'button', class: 'ed-repeat__add', onclick: () => addRow({}) }, ['＋ קישור']);
  const wrap = el('div', { class: 'ed-repeat' }, [rows, addBtn]);
  const TYPES = [['site', 'אתר'], ['map', 'מפה'], ['ticket', 'כרטיסים'], ['menu', 'תפריט'], ['social', 'רשת'], ['other', 'אחר']];

  function addRow(l) {
    l = l || {};
    const label = el('input', { class: 'ed-input', placeholder: 'תווית', value: l.label || '' });
    const url = el('input', { class: 'ed-input', type: 'url', placeholder: 'https://…', value: l.url || '', dir: 'ltr' });
    const type = el('select', { class: 'ed-select' });
    TYPES.forEach(([v, he]) => {
      const o = el('option', { value: v }, [he]);
      if ((l.type || 'site') === v) o.selected = true;
      type.appendChild(o);
    });
    const del = el('button', { type: 'button', class: 'ed-repeat__del', title: 'הסרה', 'aria-label': 'הסרה', onclick: () => row.remove() }, ['✕']);
    const row = el('div', { class: 'ed-repeat__row ed-repeat__row--link' }, [label, url, type, del]);
    rows.appendChild(row);
    return row;
  }
  (initial || []).forEach(addRow);

  return {
    el: wrap,
    values: () => Array.prototype.map.call(rows.querySelectorAll('.ed-repeat__row'), (r) => {
      const inputs = r.querySelectorAll('input');
      return { label: inputs[0].value.trim(), url: inputs[1].value.trim(), type: r.querySelector('select').value };
    }).filter((x) => x.url),
  };
}

// =============================================================================
//  Wikimedia Commons image suggestions
// =============================================================================
async function commonsSearch(query) {
  const res = await fetch(COMMONS(query));
  if (!res.ok) throw new Error('http ' + res.status);
  const data = await res.json();
  const pages = data && data.query && data.query.pages ? Object.values(data.query.pages) : [];
  pages.sort((a, b) => (a.index || 0) - (b.index || 0));
  const out = [];
  for (const p of pages) {
    const ii = p.imageinfo && p.imageinfo[0];
    if (ii && ii.thumburl) out.push({ thumb: ii.thumburl, title: p.title || '', page: ii.descriptionurl || '' });
    if (out.length >= 6) break;
  }
  return out;
}

async function runSuggest(box, query, onPick) {
  box.innerHTML = '';
  box.classList.add('is-active');
  box.appendChild(el('div', { class: 'ed-imgs__status' }, ['מחפש תמונות…']));
  try {
    const imgs = await commonsSearch(query);
    box.innerHTML = '';
    if (!imgs.length) { box.appendChild(el('div', { class: 'ed-imgs__empty' }, ['לא נמצאו תמונות'])); return; }
    const grid = el('div', { class: 'ed-imgs__grid' });
    imgs.forEach((im) => {
      const img = el('img', { src: im.thumb, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' });
      const btn = el('button', { type: 'button', class: 'ed-imgs__item', title: im.title, onclick: () => onPick(im) }, [img]);
      grid.appendChild(btn);
    });
    box.appendChild(grid);
    box.appendChild(el('div', { class: 'ed-imgs__hint' }, ['תמונות מ-Wikimedia Commons · לחצו לבחירה']));
  } catch (e) {
    box.innerHTML = '';
    box.appendChild(el('div', { class: 'ed-imgs__empty' }, ['לא נמצאו תמונות']));
  }
}

// =============================================================================
//  modal core
// =============================================================================
function focusables(root) {
  return Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE),
    (n) => n.offsetWidth > 0 || n.offsetHeight > 0 || n === document.activeElement);
}
function trapTab(e, root) {
  const f = focusables(root);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function openModal({ title, body, submitLabel = 'שמירה', onSubmit, extraLeft = null }) {
  ensureLayer();
  closeModal();
  lastFocus = document.activeElement;
  const titleId = 'ed-mtitle-' + (++uid);

  const closeBtn = el('button', { type: 'button', class: 'ed-modal__close', 'aria-label': 'סגירה', onclick: closeModal }, ['✕']);
  const head = el('div', { class: 'ed-modal__head' }, [el('h2', { class: 'ed-modal__title', id: titleId }, [title]), closeBtn]);

  const bodyWrap = el('div', { class: 'ed-modal__body' }, [body]);

  const cancelBtn = el('button', { type: 'button', class: 'ed-btn ed-btn--ghost', onclick: closeModal }, ['ביטול']);
  const primaryBtn = el('button', { type: 'submit', class: 'ed-btn ed-btn--primary' }, [submitLabel]);
  const actions = el('div', { class: 'ed-modal__actions' });
  if (extraLeft) actions.appendChild(extraLeft);
  actions.append(cancelBtn, primaryBtn);
  const foot = el('div', { class: 'ed-modal__foot' }, [el('div', { class: 'ed-note' }, [storeNoteText()]), actions]);

  const form = el('form', { class: 'ed-modal__form', novalidate: true }, [bodyWrap, foot]);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    submitting = true; primaryBtn.disabled = true; primaryBtn.classList.add('is-busy');
    try { await onSubmit(); }
    catch (err) { console.warn('[edit] save failed', err); toast('שגיאה בשמירה'); }
    finally { submitting = false; if (primaryBtn.isConnected) { primaryBtn.disabled = false; primaryBtn.classList.remove('is-busy'); } }
  });

  const panel = el('div', { class: 'ed-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, tabindex: '-1' }, [head, form]);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Tab') trapTab(e, panel); });

  const scrim = el('div', { class: 'ed-scrim' }, [panel]);
  scrim.addEventListener('mousedown', (e) => { if (e.target === scrim) closeModal(); });

  layer.appendChild(scrim);
  modalEl = scrim;
  prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    scrim.classList.add('is-in');
    const first = bodyWrap.querySelector('input, select, textarea');
    if (first) { try { first.focus(); } catch {} }
  });
}

function closeModal() {
  closeConfirm();
  if (!modalEl) return;
  const m = modalEl; modalEl = null;
  m.classList.remove('is-in'); m.classList.add('is-out');
  setTimeout(() => m.remove(), 180);
  document.body.style.overflow = prevOverflow || '';
  if (lastFocus && typeof lastFocus.focus === 'function') { try { lastFocus.focus(); } catch {} }
}

function openConfirm({ message, confirmLabel = 'אישור', danger = false, onConfirm }) {
  ensureLayer();
  closeConfirm();
  const cancel = el('button', { type: 'button', class: 'ed-btn ed-btn--ghost', onclick: closeConfirm }, ['ביטול']);
  const ok = el('button', { type: 'button', class: 'ed-btn ' + (danger ? 'ed-btn--danger' : 'ed-btn--primary') }, [confirmLabel]);
  ok.addEventListener('click', async () => {
    ok.disabled = true;
    try { await onConfirm(); } catch (e) { console.warn('[edit] confirm', e); toast('שגיאה'); ok.disabled = false; return; }
    closeConfirm();
  });
  const box = el('div', { class: 'ed-confirm', role: 'alertdialog', 'aria-modal': 'true', tabindex: '-1' },
    [el('div', { class: 'ed-confirm__msg' }, [message]), el('div', { class: 'ed-confirm__actions' }, [cancel, ok])]);
  box.addEventListener('keydown', (e) => { if (e.key === 'Tab') trapTab(e, box); });
  const scrim = el('div', { class: 'ed-scrim ed-scrim--confirm' }, [box]);
  scrim.addEventListener('mousedown', (e) => { if (e.target === scrim) closeConfirm(); });
  layer.appendChild(scrim);
  confirmEl = scrim;
  requestAnimationFrame(() => { scrim.classList.add('is-in'); try { ok.focus(); } catch {} });
}

function closeConfirm() {
  if (!confirmEl) return;
  const c = confirmEl; confirmEl = null;
  c.classList.remove('is-in'); c.classList.add('is-out');
  setTimeout(() => c.remove(), 150);
}

function afterSave(msg) {
  closeModal();
  // אם הענן מוגדר אך לא זמין — השמירה ירדה ל-localStorage; לא מציגים "נשמר ✓" מטעה
  const st = store.cloudStatus?.();
  if (st && st.configured && st.broken) toast('נשמר במכשיר זה בלבד — הענן לא זמין ⚠️');
  else toast(msg || 'נשמר ✓');
}

function toast(msg) {
  ensureLayer();
  const t = el('div', { class: 'ed-toast', role: 'status' }, [msg]);
  toastHost.appendChild(t);
  requestAnimationFrame(() => t.classList.add('is-in'));
  setTimeout(() => { t.classList.remove('is-in'); setTimeout(() => t.remove(), 300); }, 2200);
}

// =============================================================================
//  PLACE form (add / edit / delete)
// =============================================================================
function openPlaceForm(tour, place) {
  const p = place || {};
  const isEdit = !!(place && place.id);
  const catKeys = Object.keys(CATEGORIES);
  const category0 = CATEGORIES[p.category] ? p.category : catKeys[0];

  const nameInput = el('input', { class: 'ed-input', type: 'text', value: p.name || '', placeholder: 'למשל: מוזיאון הזכוכית', required: true, list: 'ed-place-names', autocomplete: 'off' });
  const heInput = el('input', { class: 'ed-input', type: 'text', value: p.he || '', placeholder: 'שם/כותרת בלועזית (אופציונלי)' });

  const catSelect = el('select', { class: 'ed-select' });
  catKeys.forEach((k) => {
    const c = CATEGORIES[k];
    const o = el('option', { value: k }, [`${c.emoji} ${c.he}`]);
    if (k === category0) o.selected = true;
    catSelect.appendChild(o);
  });

  const emojiInput = el('input', { class: 'ed-input ed-input--emoji', type: 'text', value: p.emoji || iconFor(p.name || '', category0), maxlength: '8', 'aria-label': 'אימוג׳י' });
  let emojiTouched = !!p.emoji;
  emojiInput.addEventListener('input', () => { emojiTouched = true; });
  const autoEmoji = () => { if (!emojiTouched) emojiInput.value = iconFor(nameInput.value, catSelect.value); };
  nameInput.addEventListener('input', autoEmoji);
  catSelect.addEventListener('change', autoEmoji);

  const descInput = el('textarea', { class: 'ed-textarea', rows: '2', placeholder: 'משפט קצר שמופיע בכרטיס' }, [p.desc || '']);
  const longInput = el('textarea', { class: 'ed-textarea', rows: '4', placeholder: 'תיאור מורחב לעמוד המקום' }, [p.long || '']);

  const imgInput = el('input', { class: 'ed-input', type: 'url', value: p.img || '', placeholder: 'https://…', dir: 'ltr' });
  const imgsBox = el('div', { class: 'ed-imgs' });
  const imagesRepeat = repeatText(Array.isArray(p.images) ? p.images : [], { placeholder: 'https://…', addLabel: 'תמונה', dir: 'ltr' });
  const suggestBtn = el('button', { type: 'button', class: 'ed-btn ed-btn--ghost ed-btn--sm', onclick: () => suggestImages() }, ['🖼️ הצע תמונה']);
  function suggestImages() {
    const q = `${nameInput.value.trim()} ${tour.destination && tour.destination.city ? tour.destination.city : ''}`.trim();
    if (!q) return;
    runSuggest(imgsBox, q, (im) => { imgInput.value = im.thumb; imagesRepeat.add(im.thumb); });
  }
  nameInput.addEventListener('blur', () => {
    if (!imgInput.value.trim() && nameInput.value.trim().length > 2) suggestImages();
  });

  const hoursInput = el('input', { class: 'ed-input', type: 'text', value: p.hours || '', placeholder: 'למשל: ג׳–א׳ 10:00–18:00' });
  const priceInput = el('input', { class: 'ed-input', type: 'text', value: p.price || '', placeholder: 'למשל: כניסה ≈ 20€' });
  const addressInput = el('input', { class: 'ed-input', type: 'text', value: p.address || '', placeholder: 'רחוב ומספר' });
  const badgeInput = el('input', { class: 'ed-input', type: 'text', value: p.badge || '', placeholder: 'למשל: חובה / להזמין מראש' });
  const dayInput = el('input', { class: 'ed-input', type: 'number', min: '1', step: '1', value: p.day != null ? String(p.day) : '' });
  const latInput = el('input', { class: 'ed-input', type: 'number', step: 'any', value: p.lat != null ? String(p.lat) : '', placeholder: '47.4979', dir: 'ltr' });
  const lngInput = el('input', { class: 'ed-input', type: 'number', step: 'any', value: p.lng != null ? String(p.lng) : '', placeholder: '19.0402', dir: 'ltr' });

  const tips0 = Array.isArray(p.tips) ? p.tips : (p.tip ? [p.tip] : []);
  const tipsRepeat = repeatText(tips0, { placeholder: 'טיפ שימושי', addLabel: 'טיפ' });
  const linksRepeat = repeatLinks(Array.isArray(p.links) ? p.links : []);
  const tagsInput = el('input', { class: 'ed-input', type: 'text', value: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''), placeholder: 'תגיות מופרדות בפסיק' });

  const nameList = el('datalist', { id: 'ed-place-names' });
  (tour.places || []).forEach((pp) => { if (pp.id !== p.id && pp.name) nameList.appendChild(el('option', { value: pp.name })); });

  const body = el('div', { class: 'ed-form' }, [
    nameList,
    field('שם המקום', nameInput, 'שם שמופיע בכרטיס וברשימה'),
    row2(field('כותרת משנה (לועזית)', heInput), field('קטגוריה', catSelect)),
    row2(field('אימוג׳י', emojiInput, 'נבחר אוטומטית — אפשר לשנות'), field('יום במסלול', dayInput)),
    field('תיאור קצר', descInput),
    field('תיאור מורחב', longInput),
    field('תמונה ראשית (URL)', el('div', { class: 'ed-inline' }, [imgInput, suggestBtn]), 'לחצו "הצע תמונה" לבחירה אוטומטית'),
    imgsBox,
    field('גלריית תמונות', imagesRepeat.el),
    row2(field('שעות פתיחה', hoursInput), field('מחיר', priceInput)),
    row2(field('כתובת', addressInput), field('תג (badge)', badgeInput)),
    field('טיפים', tipsRepeat.el),
    field('קישורים', linksRepeat.el),
    field('תגיות', tagsInput),
    row2(field('קו רוחב (lat)', latInput), field('קו אורך (lng)', lngInput)),
  ]);

  const deleteBtn = isEdit ? el('button', {
    type: 'button', class: 'ed-btn ed-btn--danger ed-btn--pushstart',
    onclick: () => openConfirm({
      message: `למחוק את "${p.name}"? הפעולה אינה הפיכה.`,
      confirmLabel: 'מחיקה', danger: true,
      onConfirm: async () => { await store.removePlace(tour.id, place.id); afterSave('נמחק ✓'); },
    }),
  }, ['🗑️ מחיקה']) : null;

  openModal({
    title: isEdit ? 'עריכת מקום' : 'מקום חדש',
    body,
    submitLabel: isEdit ? 'שמירת שינויים' : 'הוספת מקום',
    extraLeft: deleteBtn,
    onSubmit: async () => {
      const name = nameInput.value.trim();
      if (!name) { nameInput.focus(); nameInput.classList.add('ed-input--err'); return; }
      const category = catSelect.value;
      const tips = tipsRepeat.values();
      const city = (tour.destination && tour.destination.city) || '';
      const out = {
        id: p.id || pid(name),
        name,
        he: heInput.value.trim(),
        category,
        emoji: emojiInput.value.trim() || iconFor(name, category),
        desc: descInput.value.trim(),
        long: longInput.value.trim(),
        img: imgInput.value.trim(),
        images: imagesRepeat.values(),
        hours: hoursInput.value.trim(),
        price: priceInput.value.trim(),
        address: addressInput.value.trim(),
        badge: badgeInput.value.trim(),
        tips,
        tip: tips[0] || '',
        links: linksRepeat.values(),
        tags: tagsInput.value.split(',').map((s) => s.trim()).filter(Boolean),
        day: num(dayInput.value) ?? null,
        lat: num(latInput.value) ?? null,
        lng: num(lngInput.value) ?? null,
        mapUrl: (p.mapUrl && p.mapUrl.trim()) || gmapsLink(name, city),
      };
      await store.upsertPlace(tour.id, out);
      afterSave('נשמר ✓');
    },
  });
}

// =============================================================================
//  TRIP form (add / edit / delete)
// =============================================================================
function openTripForm(tour) {
  const t = tour || {};
  const isEdit = !!(tour && tour.id);
  const dest = t.destination || {};

  const titleInput = el('input', { class: 'ed-input', type: 'text', value: t.title || '', placeholder: 'למשל: רומא', required: true });
  const cityInput = el('input', { class: 'ed-input', type: 'text', value: dest.city || '', placeholder: 'עיר' });
  const countryInput = el('input', { class: 'ed-input', type: 'text', value: dest.country || '', placeholder: 'מדינה' });
  const flagInput = el('input', { class: 'ed-input ed-input--emoji', type: 'text', value: dest.flag || '', placeholder: '🏳️', maxlength: '8' });
  const startInput = el('input', { class: 'ed-input', type: 'date', value: (t.dates && t.dates.start) || '' });
  const endInput = el('input', { class: 'ed-input', type: 'date', value: (t.dates && t.dates.end) || '' });
  const subtitleInput = el('input', { class: 'ed-input', type: 'text', value: t.subtitle || '', placeholder: 'תת-כותרת קצרה' });
  const travelersInput = el('input', { class: 'ed-input', type: 'text', value: Array.isArray(t.travelers) ? t.travelers.join(', ') : 'הדר', placeholder: 'שמות מופרדים בפסיק' });
  const idInput = el('input', { class: 'ed-input', type: 'text', value: t.id || '', placeholder: 'destination-year', dir: 'ltr', autocomplete: 'off' });
  if (isEdit) { idInput.disabled = true; idInput.value = t.id; }

  let idTouched = isEdit;
  idInput.addEventListener('input', () => { idTouched = true; });
  const autoId = () => {
    if (idTouched) return;
    const base = (cityInput.value || titleInput.value || '').trim();
    const year = (startInput.value || '').slice(0, 4);
    idInput.value = slugify(base + (year ? ' ' + year : ''));
  };
  titleInput.addEventListener('input', autoId);
  cityInput.addEventListener('input', autoId);
  startInput.addEventListener('change', autoId);

  const heroInput = el('input', { class: 'ed-input', type: 'url', value: t.hero || '', placeholder: 'https://…', dir: 'ltr' });
  const heroBox = el('div', { class: 'ed-imgs' });
  const heroSuggest = el('button', {
    type: 'button', class: 'ed-btn ed-btn--ghost ed-btn--sm',
    onclick: () => {
      const q = `${cityInput.value.trim()} ${countryInput.value.trim()}`.trim() || titleInput.value.trim();
      if (q) runSuggest(heroBox, q, (im) => { heroInput.value = im.thumb; });
    },
  }, ['🖼️ הצע תמונה']);

  const body = el('div', { class: 'ed-form' }, [
    field('שם הטיול', titleInput),
    row2(field('עיר', cityInput), field('מדינה', countryInput)),
    row2(field('דגל', flagInput), field('מזהה (URL)', idInput, isEdit ? 'לא ניתן לשינוי אחרי יצירה' : 'נוצר אוטומטית — ניתן לעריכה')),
    row2(field('תאריך התחלה', startInput), field('תאריך סיום', endInput)),
    field('תת-כותרת', subtitleInput),
    field('נוסעים', travelersInput, 'למשל: הדר, רז'),
    field('תמונת נושא (URL)', el('div', { class: 'ed-inline' }, [heroInput, heroSuggest])),
    heroBox,
  ]);

  const deleteBtn = isEdit ? el('button', {
    type: 'button', class: 'ed-btn ed-btn--danger ed-btn--pushstart',
    onclick: () => openConfirm({
      message: `למחוק את הטיול "${t.title}"? כל התוכן שלו יוסר.`,
      confirmLabel: 'מחיקת הטיול', danger: true,
      onConfirm: async () => { await store.deleteTour(t.id); closeModal(); toast('נמחק ✓'); location.hash = '#/'; },
    }),
  }, ['🗑️ מחיקת הטיול']) : null;

  openModal({
    title: isEdit ? 'עריכת הטיול' : 'טיול חדש',
    body,
    submitLabel: isEdit ? 'שמירת שינויים' : 'יצירת טיול',
    extraLeft: deleteBtn,
    onSubmit: async () => {
      const title = titleInput.value.trim();
      if (!title) { titleInput.focus(); titleInput.classList.add('ed-input--err'); return; }
      const travelers = travelersInput.value.split(',').map((s) => s.trim()).filter(Boolean);
      if (!travelers.length) travelers.push('הדר');
      const destination = { city: cityInput.value.trim(), country: countryInput.value.trim(), flag: flagInput.value.trim() || '📍' };
      const dates = { start: startInput.value || '', end: endInput.value || '' };
      const hero = heroInput.value.trim();
      const subtitle = subtitleInput.value.trim();

      if (isEdit) {
        await store.saveTour({ ...t, id: t.id, destination, title, subtitle, dates, travelers, hero });
        afterSave('נשמר ✓');
        return;
      }
      let id = idInput.value.trim() || slugify(destination.city || title);
      const taken = new Set(store.getTours().map((x) => x.id));
      if (taken.has(id)) { let i = 2; while (taken.has(id + '-' + i)) i++; id = id + '-' + i; }
      const order = Math.max(0, ...store.getTours().map((x) => x.order ?? 0)) + 1;
      const newTour = {
        id, order, destination, title, subtitle, dates, travelers, hero,
        emoji: '📍',
        days: [{ index: 1, date: dates.start || '', title: 'יום 1', subtitle: '', items: [] }],
        places: [],
      };
      await store.addTour(newTour);
      closeModal();
      toast('נוצר ✓');
      location.hash = '#/t/' + encodeURIComponent(id) + '/home';
    },
  });
}

// =============================================================================
//  DAY form (bonus — append a day to the itinerary)
// =============================================================================
function openDayForm(tour) {
  const days = Array.isArray(tour.days) ? tour.days : [];
  const maxIndex = days.reduce((m, d) => Math.max(m, Number(d.index) || 0), 0);
  const nextIndex = maxIndex + 1;
  const lastDate = days.length ? days[days.length - 1].date : (tour.dates && tour.dates.start) || '';

  const dateInput = el('input', { class: 'ed-input', type: 'date', value: addDaysISO(lastDate, 1) || ((tour.dates && tour.dates.start) || '') });
  const titleInput = el('input', { class: 'ed-input', type: 'text', value: 'יום ' + nextIndex, placeholder: 'כותרת היום' });
  const subInput = el('input', { class: 'ed-input', type: 'text', value: '', placeholder: 'תיאור קצר (אופציונלי)' });

  const body = el('div', { class: 'ed-form' }, [
    field('מספר יום', el('input', { class: 'ed-input', type: 'text', value: 'יום ' + nextIndex, disabled: true })),
    field('תאריך', dateInput),
    field('כותרת', titleInput),
    field('תת-כותרת', subInput),
  ]);

  openModal({
    title: 'יום חדש למסלול',
    body,
    submitLabel: 'הוספת יום',
    onSubmit: async () => {
      const newDay = { index: nextIndex, date: dateInput.value || '', title: titleInput.value.trim() || ('יום ' + nextIndex), subtitle: subInput.value.trim(), items: [] };
      await store.updateTourFields(tour.id, { days: [...days, newDay] });
      afterSave('נוסף יום ✓');
    },
  });
}

// =============================================================================
//  day-item helpers  (activities inside a day's timeline)
// =============================================================================
function normTime(v) {
  const s = String(v == null ? '' : v).trim();
  if (!s) return '';
  const m = s.match(/^(\d{1,2})\s*[:.]?\s*(\d{2})$/);
  if (!m) return s.slice(0, 5);
  const h = Math.min(23, parseInt(m[1], 10));
  const mi = Math.min(59, parseInt(m[2], 10));
  return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0');
}

function resolveDay(tourId, dayIndex) {
  const tour = store.getTour(tourId);
  if (!tour) return null;
  const day = (tour.days || []).find((d) => Number(d.index) === Number(dayIndex));
  if (!day) return null;
  return { tour, day };
}

// Shared travel controls (mode chips + duration/line/note). Used by the travel
// editor and, embedded, inside the activity editor. values() → travel obj | null.
//
// המשך נגזר אוטומטית מהגיאוגרפיה + האמצעי (ראו travel.js): שדה "משך" נשאר ריק =
// מצב "אוטומטי" (הציר מחשב לבד ולא נשמר משך מיושן); הקלדת ערך = "ידני" (manual).
// opts.estimate?(mode) → {minutes, text, distanceM}|null — הערכה חיה לפי האמצעי
// הנבחר; חסר/מחזיר null ⇒ אין קואורדינטות (או פעילות חדשה) ומציגים הודעה מתאימה.
function buildTravelControls(travel, opts = {}) {
  const t = travel || {};
  const allowNone = opts.allowNone !== false;
  const estimate = typeof opts.estimate === 'function' ? opts.estimate : null;
  let selected = TRAVEL_MODES[t.mode] ? t.mode
    : (TRAVEL_MODES[opts.defaultMode] ? opts.defaultMode : null);

  const chips = el('div', { class: 'ed-modes', role: 'radiogroup', 'aria-label': 'אמצעי הגעה' });
  const btns = {};
  Object.keys(TRAVEL_MODES).forEach((key) => {
    const m = TRAVEL_MODES[key];
    const b = el('button', {
      type: 'button', class: 'ed-mode', role: 'radio', 'data-mode': key,
      onclick: () => setMode(selected === key && allowNone ? null : key),
    }, [
      el('span', { class: 'ed-mode__emoji', 'aria-hidden': 'true' }, [m.emoji]),
      el('span', {}, [m.he]),
    ]);
    btns[key] = b;
    chips.appendChild(b);
  });

  // "משך" מוקדם רק כשהוזן ידנית — מקטע אוטומטי מוצג ריק (placeholder עם ההערכה).
  const isManualInit = !!(t.manual && t.duration);
  const durationInput = el('input', { class: 'ed-input', type: 'text', value: isManualInit ? String(t.duration) : '', placeholder: 'אוטומטי' });
  durationInput.id = 'ed-f-' + (++uid);
  const lineInput = el('input', { class: 'ed-input', type: 'text', value: t.line || '', placeholder: 'למשל: 2 / M1', dir: 'ltr' });
  const noteInput = el('input', { class: 'ed-input', type: 'text', value: t.note || '', placeholder: 'הערה (אופציונלי)' });

  // תג "אוטומטי / ידני" ליד תווית המשך.
  const badge = el('span', { class: 'ed-travel-badge' }, ['אוטומטי']);
  const durLabel = el('label', { class: 'ed-label ed-label--row', for: durationInput.id }, ['משך', badge]);

  // שורת הערכה חיה + כפתור "חשב אוטומטית".
  const estVal = el('span', { class: 'ed-travel-est__val' }, ['']);
  const autoBtn = el('button', {
    type: 'button', class: 'ed-travel-est__auto', title: 'נקה את המשך הידני וחזור לחישוב אוטומטי',
    onclick: () => { durationInput.value = ''; refreshEst(); durationInput.focus(); },
  }, ['↻ חשב אוטומטית']);
  const estLine = el('div', { class: 'ed-travel-est', 'aria-live': 'polite' }, [estVal, autoBtn]);

  const durField = el('div', { class: 'ed-field' }, [durLabel, durationInput, estLine]);
  const rows = el('div', { class: 'ed-travel__rows' }, [
    row2(durField, field('קו', lineInput)),
    field('הערה', noteInput),
  ]);

  function currentEstimate() {
    if (!estimate || selected == null) return null;
    try { return estimate(selected); } catch { return null; }
  }
  // מרענן את התג, ה-placeholder ושורת ההערכה לפי האמצעי הנבחר והמצב (אוטו/ידני).
  function refreshEst() {
    const manual = durationInput.value.trim() !== '';
    badge.textContent = manual ? 'ידני' : 'אוטומטי';
    badge.classList.toggle('is-manual', manual);
    badge.classList.toggle('is-auto', !manual);
    autoBtn.disabled = !manual || selected == null;

    if (selected == null) { estLine.hidden = true; return; }
    estLine.hidden = false;
    estLine.classList.toggle('is-overridden', manual);

    if (!estimate) {
      estVal.textContent = 'זמן הנסיעה יחושב אוטומטית לאחר שמירת הפעילות';
      estLine.dataset.state = 'pending';
      if (!manual) durationInput.placeholder = 'אוטומטי';
      return;
    }
    const est = currentEstimate();
    if (!est || est.minutes == null) {
      estVal.textContent = 'לא ניתן לחשב אוטומטית — אפשר להזין ידנית';
      estLine.dataset.state = 'none';
      if (!manual) durationInput.placeholder = 'אוטומטי (אין קואורדינטות)';
    } else {
      const dist = est.distanceM != null ? ' · ' + formatDistance(est.distanceM) : '';
      estVal.textContent = `זמן משוער: ≈ ${est.text}${dist}`;
      estLine.dataset.state = 'ok';
      if (!manual) durationInput.placeholder = `אוטומטי: ≈ ${est.text}`;
    }
  }

  function updateEnabled() {
    const dis = selected == null;
    [durationInput, lineInput, noteInput].forEach((i) => { i.disabled = dis; });
    rows.classList.toggle('is-disabled', dis);
  }
  function setMode(k) {
    selected = k;
    Object.keys(btns).forEach((key) => {
      const on = key === selected;
      btns[key].classList.toggle('is-on', on);
      btns[key].setAttribute('aria-checked', on ? 'true' : 'false');
    });
    updateEnabled();
    refreshEst();
  }
  durationInput.addEventListener('input', refreshEst);
  setMode(selected);

  const wrap = el('div', { class: 'ed-travel' }, [
    el('div', { class: 'ed-label' }, ['אמצעי הגעה']),
    chips,
    rows,
  ]);

  return {
    el: wrap,
    values: () => {
      if (selected == null) return null;
      const out = { mode: selected };
      const l = lineInput.value.trim(); if (l) out.line = l;
      const n = noteInput.value.trim(); if (n) out.note = n;
      // משך ריק ⇒ אוטומטי: לא שומרים duration/manual (הציר מחשב לבד).
      // משך שהוקלד ⇒ עדיפות ידנית: manual:true + הטקסט כפי שהוא.
      const d = durationInput.value.trim();
      if (d) { out.manual = true; out.duration = d; }
      return out;
    },
  };
}

// =============================================================================
//  ACTIVITY editor (add / edit a day item)   ← public: openDayItemEditor
// =============================================================================
export function openDayItemEditor(opts) {
  opts = opts || {};
  const { tourId, dayIndex } = opts;
  const itemIndex = opts.itemIndex == null ? null : opts.itemIndex;
  const period0 = opts.period || '';
  const at = opts.at == null ? null : opts.at;

  if (!auth.canEdit()) { console.warn('[edit] openDayItemEditor: editing not allowed'); return; }
  const ctx = resolveDay(tourId, dayIndex);
  if (!ctx) { console.warn('[edit] openDayItemEditor: invalid tour/day', tourId, dayIndex); return; }
  const { tour, day } = ctx;
  const isEdit = itemIndex != null;
  let item = {};
  if (isEdit) {
    const items = day.items || [];
    if (itemIndex < 0 || itemIndex >= items.length) { console.warn('[edit] openDayItemEditor: invalid itemIndex', itemIndex); return; }
    item = items[itemIndex] || {};
  }
  const origDay = Number(dayIndex);

  const titleInput = el('input', { class: 'ed-input', type: 'text', value: item.title || '', placeholder: 'למשל: ארוחת בוקר במאפייה', required: true });
  titleInput.addEventListener('input', () => titleInput.classList.remove('ed-input--err'));
  const descInput = el('textarea', { class: 'ed-textarea', rows: '2', placeholder: 'תיאור קצר (אופציונלי)' }, [item.desc || '']);

  const emojiInput = el('input', { class: 'ed-input ed-input--emoji', type: 'text', value: item.emoji || iconFor(item.title || ''), maxlength: '8', 'aria-label': 'אימוג׳י' });
  let emojiTouched = !!item.emoji;
  emojiInput.addEventListener('input', () => { emojiTouched = true; });
  titleInput.addEventListener('input', () => { if (!emojiTouched) emojiInput.value = iconFor(titleInput.value); });

  const timeInput = el('input', { class: 'ed-input', type: 'time', value: normTime(item.time), step: '60' });

  const periodSelect = el('select', { class: 'ed-select' });
  periodSelect.appendChild(el('option', { value: '' }, ['— חלק היום —']));
  const curPeriod = item.period != null && item.period !== '' ? item.period : period0;
  PERIODS.forEach((p) => {
    const o = el('option', { value: p }, [p]);
    if (p === curPeriod) o.selected = true;
    periodSelect.appendChild(o);
  });

  const daySelect = el('select', { class: 'ed-select' });
  (tour.days || []).forEach((d) => {
    const wk = fmtWeekday(d.date); const dt = fmtDateShort(d.date);
    const label = `יום ${d.index}` + (wk || dt ? ` · ${[wk, dt].filter(Boolean).join(' ')}` : '');
    const o = el('option', { value: String(d.index) }, [label]);
    if (Number(d.index) === origDay) o.selected = true;
    daySelect.appendChild(o);
  });

  const placeSelect = el('select', { class: 'ed-select' });
  placeSelect.appendChild(el('option', { value: '' }, ['— ללא מקום מקושר —']));
  const curPlace = item.place || '';
  const placeNames = (tour.places || []).map((p) => p.name).filter(Boolean);
  let hasCur = false;
  placeNames.forEach((n) => {
    const o = el('option', { value: n }, [n]);
    if (n === curPlace) { o.selected = true; hasCur = true; }
    placeSelect.appendChild(o);
  });
  if (curPlace && !hasCur) {
    const o = el('option', { value: curPlace }, [curPlace]);
    o.selected = true;
    placeSelect.appendChild(o);
  }

  const imgInput = el('input', { class: 'ed-input', type: 'url', value: item.img || '', placeholder: 'https://…', dir: 'ltr' });
  const imgsBox = el('div', { class: 'ed-imgs' });
  const suggestBtn = el('button', {
    type: 'button', class: 'ed-btn ed-btn--ghost ed-btn--sm',
    onclick: () => {
      const city = (tour.destination && tour.destination.city) || '';
      const q = `${titleInput.value.trim()} ${city}`.trim();
      if (q) runSuggest(imgsBox, q, (im) => { imgInput.value = im.thumb; });
    },
  }, ['🖼️ הצע תמונה']);

  // הערכה חיה: תמיד לפי המיקום הנוכחי של הפעילות (dayIndex/itemIndex) מהחנות.
  // לפעילות חדשה (בלי אינדקס) אין עדיין קואורדינטות משלה — נסתיר את ההערכה עד לשמירה.
  const travelEstimate = isEdit
    ? (mode) => {
        const c = resolveDay(tourId, dayIndex);
        return c ? estimateFor(c.tour, c.day.items || [], itemIndex, mode) : null;
      }
    : null;
  const travelControls = buildTravelControls(item.travel, { allowNone: true, estimate: travelEstimate });
  const summaryKids = [el('span', {}, ['🚕 נסיעה לפעילות הזו'])];
  if (item.travel) summaryKids.push(el('span', { class: 'ed-travel-embed__cur' }, [travelLabel(item.travel)]));
  const details = el('details', { class: 'ed-travel-embed' }, [
    el('summary', { class: 'ed-travel-embed__summary' }, summaryKids),
    el('div', { class: 'ed-travel-embed__body' }, [
      el('div', { class: 'ed-hint' }, ['איך מגיעים לפעילות הזו מהקודמת בציר הזמן']),
      travelControls.el,
    ]),
  ]);
  if (item.travel) details.setAttribute('open', '');

  const body = el('div', { class: 'ed-form' }, [
    field('כותרת הפעילות', titleInput, 'שדה חובה'),
    field('תיאור', descInput),
    row2(field('אימוג׳י', emojiInput, 'נבחר אוטומטית — ניתן לשנות'), field('שעה', timeInput)),
    row2(field('חלק היום', periodSelect), field('יום במסלול', daySelect)),
    field('מקום מקושר', placeSelect, 'הכרטיס יקשר לעמוד המקום'),
    field('תמונה (URL)', el('div', { class: 'ed-inline' }, [imgInput, suggestBtn]), 'אופציונלי'),
    imgsBox,
    details,
  ]);

  const deleteBtn = isEdit ? el('button', {
    type: 'button', class: 'ed-btn ed-btn--danger ed-btn--pushstart',
    onclick: () => openConfirm({
      message: `למחוק את "${item.title || 'הפעילות'}"?`,
      confirmLabel: 'מחיקה', danger: true,
      onConfirm: async () => { await store.removeDayItem(tourId, origDay, itemIndex); afterSave('נמחק ✓'); },
    }),
  }, ['🗑️ מחיקה']) : null;

  openModal({
    title: isEdit ? 'עריכת פעילות' : 'פעילות חדשה',
    body,
    submitLabel: isEdit ? 'שמירת שינויים' : 'הוספת פעילות',
    extraLeft: deleteBtn,
    onSubmit: async () => {
      const title = titleInput.value.trim();
      if (!title) { titleInput.focus(); titleInput.classList.add('ed-input--err'); return; }
      const chosenDay = Number(daySelect.value);
      const travel = travelControls.values();
      const out = {
        title,
        desc: descInput.value.trim(),
        emoji: emojiInput.value.trim() || iconFor(title),
        period: periodSelect.value,
        time: normTime(timeInput.value),
        place: placeSelect.value,
        img: imgInput.value.trim(),
      };
      if (travel) out.travel = travel;
      else if (isEdit) out.travel = null;

      if (isEdit && chosenDay !== origDay) {
        await store.moveDayItem(tourId, origDay, itemIndex, chosenDay, null, out);
      } else if (isEdit) {
        await store.upsertDayItem(tourId, origDay, out, itemIndex);
      } else {
        const atPos = chosenDay === origDay ? at : null;
        await store.upsertDayItem(tourId, chosenDay, out, null, atPos);
      }
      afterSave('נשמר ✓');
    },
  });
}

// =============================================================================
//  TRAVEL editor (the leg leading TO an activity)   ← public: openTravelEditor
// =============================================================================
export function openTravelEditor(opts) {
  opts = opts || {};
  const { tourId, dayIndex, itemIndex } = opts;
  if (!auth.canEdit()) { console.warn('[edit] openTravelEditor: editing not allowed'); return; }
  const ctx = resolveDay(tourId, dayIndex);
  if (!ctx) { console.warn('[edit] openTravelEditor: invalid tour/day', tourId, dayIndex); return; }
  const items = ctx.day.items || [];
  if (itemIndex == null || itemIndex < 0 || itemIndex >= items.length) {
    console.warn('[edit] openTravelEditor: invalid itemIndex', itemIndex); return;
  }
  const item = items[itemIndex];
  const controls = buildTravelControls(item.travel, {
    defaultMode: item.travel ? item.travel.mode : 'walk',
    estimate: (mode) => estimateFor(ctx.tour, ctx.day.items || [], itemIndex, mode),
  });

  const body = el('div', { class: 'ed-form' }, [
    el('div', { class: 'ed-travel__lead' }, [`איך מגיעים אל: ${item.title || 'הפעילות'}`]),
    controls.el,
  ]);

  const removeBtn = el('button', {
    type: 'button', class: 'ed-btn ed-btn--danger ed-btn--pushstart',
    onclick: async () => { await store.upsertDayItem(tourId, dayIndex, { travel: null }, itemIndex); afterSave('הנסיעה הוסרה ✓'); },
  }, ['הסר נסיעה']);

  openModal({
    title: 'נסיעה לפעילות',
    body,
    submitLabel: 'שמירה',
    extraLeft: removeBtn,
    onSubmit: async () => {
      await store.upsertDayItem(tourId, dayIndex, { travel: controls.values() }, itemIndex);
      afterSave('נשמר ✓');
    },
  });
}

// =============================================================================
//  DAY editor (edit an existing day's meta)   ← public: openDayEditor
// =============================================================================
export function openDayEditor(opts) {
  opts = opts || {};
  const { tourId, dayIndex } = opts;
  if (!auth.canEdit()) { console.warn('[edit] openDayEditor: editing not allowed'); return; }
  const ctx = resolveDay(tourId, dayIndex);
  if (!ctx) { console.warn('[edit] openDayEditor: invalid tour/day', tourId, dayIndex); return; }
  const day = ctx.day;

  const titleInput = el('input', { class: 'ed-input', type: 'text', value: day.title || '', placeholder: 'כותרת היום', required: true });
  titleInput.addEventListener('input', () => titleInput.classList.remove('ed-input--err'));
  const subInput = el('input', { class: 'ed-input', type: 'text', value: day.subtitle || '', placeholder: 'תת-כותרת (אופציונלי)' });
  const dateInput = el('input', { class: 'ed-input', type: 'date', value: day.date || '' });
  const lodgingInput = el('input', { class: 'ed-input', type: 'text', value: day.lodging || '', placeholder: 'למשל: מלון בעיר העתיקה' });
  const transportInput = el('input', { class: 'ed-input', type: 'text', value: Array.isArray(day.transport) ? day.transport.join(', ') : (day.transport || ''), placeholder: 'למשל: מטרו, ברגל' });

  const body = el('div', { class: 'ed-form' }, [
    field('כותרת', titleInput, 'שדה חובה'),
    field('תת-כותרת', subInput),
    row2(field('תאריך', dateInput), field('לינה', lodgingInput)),
    field('תחבורה', transportInput, 'אמצעי תחבורה מופרדים בפסיק'),
  ]);

  openModal({
    title: 'עריכת היום',
    body,
    submitLabel: 'שמירת שינויים',
    onSubmit: async () => {
      const title = titleInput.value.trim();
      if (!title) { titleInput.focus(); titleInput.classList.add('ed-input--err'); return; }
      await store.updateDay(tourId, dayIndex, {
        title,
        subtitle: subInput.value.trim(),
        date: dateInput.value || '',
        lodging: lodgingInput.value.trim(),
        transport: transportInput.value.split(',').map((s) => s.trim()).filter(Boolean),
      });
      afterSave('נשמר ✓');
    },
  });
}

// =============================================================================
//  Floating Action Button (context-aware)
// =============================================================================
function fabActions() {
  const ctx = lastCtx || {};
  const r = ctx.route || {};
  if (r.name === 'trips') {
    return [{ emoji: '➕', label: 'טיול חדש', fn: () => openTripForm(null) }];
  }
  if (r.name === 'tour' && ctx.tour) {
    const tour = ctx.tour;
    const days = Array.isArray(tour.days) ? tour.days : [];
    const onDays = r.tab === 'days';
    const curDay = (onDays && r.param != null && days.some((d) => Number(d.index) === Number(r.param)))
      ? Number(r.param)
      : (days[0] ? days[0].index : 1);
    const addActivity = { emoji: '➕', label: 'פעילות למסלול', fn: () => openDayItemEditor({ tourId: tour.id, dayIndex: curDay, itemIndex: null }) };

    const acts = [];
    if (r.tab === 'place' && ctx.place) acts.push({ emoji: '✏️', label: 'עריכת מקום', fn: () => openPlaceForm(tour, ctx.place) });
    if (onDays) {
      acts.push(addActivity);
      acts.push({ emoji: '✏️', label: 'עריכת היום', fn: () => openDayEditor({ tourId: tour.id, dayIndex: curDay }) });
    }
    acts.push({ emoji: '➕', label: 'מקום חדש', fn: () => openPlaceForm(tour, null) });
    if (!onDays) acts.push(addActivity);
    acts.push({ emoji: '🗓️', label: 'יום למסלול', fn: () => openDayForm(tour) });
    acts.push({ emoji: '✏️', label: 'עריכת הטיול', fn: () => openTripForm(tour) });
    return acts;
  }
  return [];
}

function onFabClick(e) {
  e.preventDefault();
  const acts = fabActions();
  if (!acts.length) return;
  if (acts.length === 1) { closeMenu(); acts[0].fn(); return; }
  if (menuOpen) closeMenu(); else openMenu(acts);
}

function openMenu(acts) {
  fabMenu.innerHTML = '';
  acts.forEach((a) => {
    const b = el('button', { type: 'button', class: 'ed-fab__item', role: 'menuitem', onclick: () => { closeMenu(); a.fn(); } }, [
      el('span', { class: 'ed-fab__item-emoji', 'aria-hidden': 'true' }, [a.emoji]),
      el('span', {}, [a.label]),
    ]);
    fabMenu.appendChild(b);
  });
  fabMenu.appendChild(el('div', { class: 'ed-note ed-note--menu' }, [storeNoteText()]));
  fabMenu.classList.add('is-open');
  fab.setAttribute('aria-expanded', 'true');
  fab.classList.add('is-open');
  menuOpen = true;
}

function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  if (fabMenu) fabMenu.classList.remove('is-open');
  if (fab) { fab.setAttribute('aria-expanded', 'false'); fab.classList.remove('is-open'); }
}

function updateFab() {
  if (!fab) return;
  const acts = fabActions();
  if (!acts.length) { fab.style.display = 'none'; closeMenu(); return; }
  fab.style.display = '';
  fab.setAttribute('aria-label', acts[0].label);
  fab.title = acts[0].label;
  fab.classList.toggle('ed-fab--single', acts.length === 1);
}

// =============================================================================
//  per-place pencils (injected fresh into #app each refresh)
// =============================================================================
function makePencil(label, onClick) {
  const b = el('button', { type: 'button', class: 'edit-pencil', title: label || 'עריכה', 'aria-label': label || 'עריכה' }, ['✏️']);
  b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick(e); });
  return b;
}

function matchPlace(tour, card) {
  const places = tour.places || [];
  const a = card.querySelector('a[href*="/place/"]');
  if (a) {
    const m = (a.getAttribute('href') || '').match(/\/place\/([^/?#]+)/);
    if (m) { const id = decodeURIComponent(m[1]); const hit = places.find((p) => p.id === id); if (hit) return hit; }
  }
  const nameEl = card.querySelector('.place-card__name');
  if (!nameEl) return null;
  const cl = nameEl.cloneNode(true);
  cl.querySelectorAll('.lat').forEach((n) => n.remove());
  const name = cl.textContent.trim();
  return places.find((p) => (p.name || '').trim() === name) || null;
}

function injectPencils(ctx) {
  const root = app || document.getElementById('app');
  if (!root || !ctx) return;
  const r = ctx.route || {};
  if (r.name !== 'tour' || !ctx.tour) return;

  if (r.tab === 'place' && ctx.place) {
    const title = root.querySelector('.section-title');
    if (title && !title.querySelector('.edit-pencil')) {
      title.appendChild(makePencil('עריכת מקום', () => openPlaceForm(ctx.tour, ctx.place)));
    }
    return;
  }
  if (r.tab !== 'explore') return;

  root.querySelectorAll('.place-card').forEach((card) => {
    if (card.querySelector('.edit-pencil')) return;
    const place = matchPlace(ctx.tour, card);
    if (!place) return;
    card.classList.add('ed-has-pencil');
    card.appendChild(makePencil('עריכת מקום', () => openPlaceForm(ctx.tour, place)));
  });
}

// =============================================================================
//  layer lifecycle + visibility
// =============================================================================
function ensureLayer() {
  if (layer || !document.body) return layer;
  fabMenu = el('div', { class: 'ed-fab__menu', role: 'menu' });
  fab = el('button', { type: 'button', class: 'ed-fab', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-label': 'הוספה', onclick: onFabClick }, [
    el('span', { class: 'ed-fab__plus', 'aria-hidden': 'true' }, ['＋']),
  ]);
  fabWrap = el('div', { class: 'ed-fab__wrap' }, [fabMenu, fab]);
  toastHost = el('div', { class: 'ed-toasts', 'aria-live': 'polite' });
  layer = el('div', { id: 'edit-layer' }, [fabWrap, toastHost]);
  document.body.appendChild(layer);

  document.addEventListener('click', (e) => {
    if (menuOpen && fabWrap && !fabWrap.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (confirmEl) closeConfirm();
    else if (modalEl) closeModal();
    else if (menuOpen) closeMenu();
  });
  return layer;
}

function syncVisibility() {
  const can = auth.canEdit();
  if (can) {
    ensureLayer();
    if (layer) layer.style.display = 'block';
    updateFab();
  } else {
    closeMenu(); closeModal(); closeConfirm();
    if (layer) layer.style.display = 'none';
  }
}

// =============================================================================
//  public API (called by app.js)
// =============================================================================
export function init(rootEl) {
  if (inited) return;
  inited = true;
  app = rootEl || document.getElementById('app');
  try { auth.onAuthChange(() => syncVisibility()); } catch {}
  syncVisibility();
}

export function refresh(ctx) {
  if (ctx) lastCtx = ctx;
  const can = ctx && ('canEdit' in ctx) ? ctx.canEdit : auth.canEdit();
  if (!can) { syncVisibility(); return; }
  ensureLayer();
  if (layer) layer.style.display = 'block';
  updateFab();
  try { injectPencils(lastCtx); } catch (e) { console.warn('[edit] pencils', e); }
}
