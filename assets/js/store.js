// ============================================================================
//  store.js — שכבת הנתונים.
//  מקור אמת = נתוני ה-seed הסטטיים (data/tours/*.js), ומעליהם שכבת "overlay":
//    · אם Firebase מוגדר → Firestore (collection 'tours'), עדכון חי + שמירה משותפת.
//    · אחרת → localStorage (עריכה מקומית בדפדפן).
//  התצוגות מקבלות תמיד אובייקטי טיול באותו מבנה — לכן קריאה עובדת גם בלי ענן.
// ============================================================================
import seedTours from '../../data/tours/index.js';
import { firebaseReady, configured } from './firebase.js';
import { pid } from './util.js';

const LS_KEY = 'travels_overlay_v1';
let overlay = { tours: {} };   // { [tourId]: fullTourDoc | { _deleted:true } }
let effective = [];            // מערך אפקטיבי לאחר מיזוג seed+overlay
const subs = new Set();

let _fs = null, _db = null;

export { configured };
export function isCloud() { return !!(configured && _db && _fs); }
export function onChange(fn) { subs.add(fn); return () => subs.delete(fn); }
function notify() { computeEffective(); subs.forEach((f) => { try { f(); } catch {} }); }

function assignIds(tour) {
  (tour.places || []).forEach((p) => { if (!p.id) p.id = pid(p.name || p.he || String(Math.random())); });
  (tour.days || []).forEach((d) => { if (d.index == null) d.index = 0; });
  return tour;
}

function clone(o) { return typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)); }

function computeEffective() {
  const byId = new Map();
  for (const t of seedTours) byId.set(t.id, clone(t));
  for (const [id, doc] of Object.entries(overlay.tours || {})) {
    if (doc && doc._deleted) byId.delete(id);
    else if (doc) byId.set(id, clone(doc));
  }
  effective = [...byId.values()].map(assignIds).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

// ---- קריאה --------------------------------------------------------------
export function getTours() { return effective; }
export function getTour(id) { return effective.find((t) => t.id === id) || null; }
export function getPlace(tourId, placeId) {
  const t = getTour(tourId); if (!t) return null;
  return (t.places || []).find((p) => p.id === placeId) || null;
}

// ---- אתחול --------------------------------------------------------------
function loadLocal() {
  try { const raw = localStorage.getItem(LS_KEY); if (raw) overlay = JSON.parse(raw); } catch {}
  if (!overlay.tours) overlay.tours = {};
}
function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(overlay)); } catch {} }

export async function loadAll() {
  if (configured) {
    const r = await firebaseReady;
    if (r.configured) {
      _fs = r.fs; _db = r.db;
      try {
        r.fs.onSnapshot(
          r.fs.collection(r.db, 'tours'),
          (snap) => { overlay.tours = {}; snap.forEach((d) => { overlay.tours[d.id] = d.data(); }); notify(); },
          (err) => { console.warn('[store] snapshot error', err); notify(); },
        );
      } catch (e) { console.warn('[store] subscribe failed', e); }
      computeEffective();
      return;
    }
  }
  loadLocal();
  computeEffective();
}

// ---- כתיבה (CRUD) -------------------------------------------------------
export async function saveTour(tour) {
  tour = assignIds(clone(tour));
  if (isCloud()) {
    await _fs.setDoc(_fs.doc(_db, 'tours', tour.id), tour);
    return { ok: true, backend: 'cloud' };
  }
  overlay.tours[tour.id] = tour; saveLocal(); notify();
  return { ok: true, backend: 'local' };
}

export async function deleteTour(id) {
  if (isCloud()) {
    // tombstone so seeded tours stay hidden too
    await _fs.setDoc(_fs.doc(_db, 'tours', id), { _deleted: true, id });
    return { ok: true };
  }
  overlay.tours[id] = { _deleted: true }; saveLocal(); notify();
  return { ok: true };
}

export async function addTour(tour) { return saveTour(tour); }

export async function upsertPlace(tourId, place) {
  const t = clone(getTour(tourId)); if (!t) return { ok: false };
  if (!place.id) place.id = pid(place.name || place.he || String(Math.random()));
  t.places = t.places || [];
  const i = t.places.findIndex((p) => p.id === place.id);
  if (i >= 0) t.places[i] = { ...t.places[i], ...place };
  else t.places.push(place);
  return saveTour(t);
}

export async function removePlace(tourId, placeId) {
  const t = clone(getTour(tourId)); if (!t) return { ok: false };
  t.places = (t.places || []).filter((p) => p.id !== placeId);
  return saveTour(t);
}

export async function updateTourFields(tourId, patch) {
  const t = clone(getTour(tourId)); if (!t) return { ok: false };
  return saveTour({ ...t, ...patch });
}

// ---- פריטי מסלול (ימים) -------------------------------------------------
function findDay(tour, dayIndex) {
  return (tour.days || []).find((d) => Number(d.index) === Number(dayIndex));
}

/** עדכון שדות של יום (כותרת, תת-כותרת, לינה וכו׳). */
export async function updateDay(tourId, dayIndex, patch) {
  const t = clone(getTour(tourId)); if (!t) return { ok: false };
  const d = findDay(t, dayIndex); if (!d) return { ok: false };
  Object.assign(d, patch);
  return saveTour(t);
}

/** הוספה/עדכון של פעילות ביום. itemIndex=null → הוספה בסוף (או במיקום at). */
export async function upsertDayItem(tourId, dayIndex, item, itemIndex = null, at = null) {
  const t = clone(getTour(tourId)); if (!t) return { ok: false };
  const d = findDay(t, dayIndex); if (!d) return { ok: false };
  d.items = d.items || [];
  if (itemIndex == null || itemIndex < 0 || itemIndex >= d.items.length) {
    if (at == null || at < 0 || at > d.items.length) d.items.push(item);
    else d.items.splice(at, 0, item);
  } else {
    d.items[itemIndex] = { ...d.items[itemIndex], ...item };
  }
  return saveTour(t);
}

/** מחיקת פעילות. */
export async function removeDayItem(tourId, dayIndex, itemIndex) {
  const t = clone(getTour(tourId)); if (!t) return { ok: false };
  const d = findDay(t, dayIndex); if (!d || !d.items) return { ok: false };
  d.items.splice(itemIndex, 1);
  return saveTour(t);
}

/**
 * העברת פעילות: בין ימים, בין חלקי היום, ושינוי סדר.
 * @param {string} tourId
 * @param {number} fromDay  index של היום המקורי
 * @param {number} fromItem אינדקס הפריט במערך items של אותו יום
 * @param {number} toDay    index של יום היעד (יכול להיות זהה)
 * @param {number|null} toItem מיקום היעד במערך items של יום היעד (null = לסוף)
 * @param {object} [patch]  שדות לעדכן תוך כדי (למשל { period:'ערב', time:'19:30' })
 */
export async function moveDayItem(tourId, fromDay, fromItem, toDay, toItem = null, patch = null) {
  const t = clone(getTour(tourId)); if (!t) return { ok: false };
  const src = findDay(t, fromDay); const dst = findDay(t, toDay);
  if (!src || !dst || !src.items || fromItem < 0 || fromItem >= src.items.length) return { ok: false };
  const [moved] = src.items.splice(fromItem, 1);
  if (patch) Object.assign(moved, patch);
  dst.items = dst.items || [];
  let at = toItem;
  if (at == null || at < 0 || at > dst.items.length) at = dst.items.length;
  dst.items.splice(at, 0, moved);
  return saveTour(t);
}

/** הוספת יום חדש בסוף המסלול. */
export async function addDay(tourId, day) {
  const t = clone(getTour(tourId)); if (!t) return { ok: false };
  t.days = t.days || [];
  const nextIndex = t.days.reduce((m, d) => Math.max(m, Number(d.index) || 0), 0) + 1;
  t.days.push({ index: nextIndex, date: '', title: `יום ${nextIndex}`, items: [], ...day });
  return saveTour(t);
}
