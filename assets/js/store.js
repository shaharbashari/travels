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
let cloudBroken = false;       // הענן מוגדר אך לא זמין (למשל: Firestore לא נוצר / חוקים חוסמים)
let lastError = null;

export { configured };
/** האם שמירה בפועל הולכת לענן (ולא ל-localStorage). */
export function isCloud() { return !!(configured && _db && _fs && !cloudBroken); }
/** מצב החיבור לענן — לשימוש ב-UI (באנר אזהרה). */
export function cloudStatus() {
  return { configured, connected: isCloud(), broken: cloudBroken, error: lastError };
}
export function onChange(fn) { subs.add(fn); return () => subs.delete(fn); }
function notify() { computeEffective(); subs.forEach((f) => { try { f(); } catch {} }); }

/** Firestore דוחה ערכי undefined — מנקים עומק מלא לפני כתיבה. */
function sanitize(v) {
  if (Array.isArray(v)) return v.filter((x) => x !== undefined).map(sanitize);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) if (val !== undefined) out[k] = sanitize(val);
    return out;
  }
  return v;
}

/**
 * ה-SDK של Firestore ממשיך לנסות לנצח כשאין גישה למסד (למשל: לא נוצר / אין רשת),
 * ואז ההבטחה לעולם לא נפתרת והממשק "נתקע" והשינוי נעלם.
 * לכן כל כתיבה מוגבלת בזמן — ואם לא הושלמה, שומרים מקומית.
 */
const WRITE_TIMEOUT_MS = 7000;
function withTimeout(promise, ms = WRITE_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      const e = new Error('cloud-write-timeout');
      e.code = 'timeout';
      reject(e);
    }, ms);
    promise.then(
      (v) => { if (!done) { done = true; clearTimeout(timer); resolve(v); } },
      (e) => { if (!done) { done = true; clearTimeout(timer); reject(e); } },
    );
  });
}

/** נפילה חיננית: אם הכתיבה לענן נכשלה — שומרים מקומית כדי לא לאבד את השינוי. */
function degradeToLocal(e, mutate) {
  cloudBroken = true;
  lastError = (e && (e.code || e.message)) ? String(e.code || e.message) : String(e);
  console.warn('[store] cloud write failed — saving locally instead.', e);
  loadLocal();
  mutate();
  saveLocal();
  notify();
  return { ok: true, backend: 'local', degraded: true, error: lastError };
}

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
          (snap) => {
            cloudBroken = false; lastError = null;
            overlay.tours = {};
            snap.forEach((d) => { overlay.tours[d.id] = d.data(); });
            notify();
          },
          (err) => {
            // אין גישה ל-Firestore (למשל: מסד לא נוצר / חוקים חוסמים) → עוברים למצב מקומי
            cloudBroken = true;
            lastError = String(err?.code || err?.message || err);
            console.warn('[store] Firestore unavailable — using local edits.', err);
            loadLocal();
            notify();
          },
        );
      } catch (e) {
        cloudBroken = true; lastError = String(e?.message || e);
        console.warn('[store] subscribe failed', e);
        loadLocal();
      }
      // בדיקת בריאות ברקע — לא חוסמת את הרינדור הראשון!
      // אם אין תשובה מהשרת תוך זמן קצר (למשל: מסד הנתונים לא נוצר) מסמנים
      // שהענן לא זמין, טוענים עריכות מקומיות ומרעננים את המסך.
      withTimeout(r.fs.getDocs(r.fs.collection(r.db, 'tours')), 8000).then(
        () => { cloudBroken = false; lastError = null; },
        (e) => {
          cloudBroken = true;
          lastError = String(e?.code || e?.message || e);
          console.warn('[store] Firestore not reachable — local mode.', lastError);
          loadLocal();
          notify();
        },
      );
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
    try {
      await withTimeout(_fs.setDoc(_fs.doc(_db, 'tours', tour.id), sanitize(tour)));
      return { ok: true, backend: 'cloud' };
    } catch (e) {
      return degradeToLocal(e, () => { overlay.tours[tour.id] = tour; });
    }
  }
  overlay.tours[tour.id] = tour; saveLocal(); notify();
  return { ok: true, backend: 'local' };
}

export async function deleteTour(id) {
  if (isCloud()) {
    try {
      // tombstone so seeded tours stay hidden too
      await withTimeout(_fs.setDoc(_fs.doc(_db, 'tours', id), { _deleted: true, id }));
      return { ok: true, backend: 'cloud' };
    } catch (e) {
      return degradeToLocal(e, () => { overlay.tours[id] = { _deleted: true }; });
    }
  }
  overlay.tours[id] = { _deleted: true }; saveLocal(); notify();
  return { ok: true, backend: 'local' };
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
