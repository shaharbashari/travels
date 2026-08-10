// ============================================================================
//  travel.js — חישוב אוטומטי של זמני נסיעה בין פעילויות.
//  ----------------------------------------------------------------------------
//  הרעיון: זמן הנסיעה נגזר מהגיאוגרפיה (קואורדינטות של המקומות) ומאמצעי ההגעה,
//  ולכן הוא מתעדכן לבד כשמשנים סדר פעילויות, מעבירים ליום אחר או מחליפים אמצעי
//  תחבורה — בלי שאף אחד צריך לעדכן ידנית.
//
//  עדיפות התצוגה:
//    1. travel.manual === true  → הערך שהוזן ידנית מנצח (המשתמש קובע).
//    2. יש קואורדינטות לשתי הפעילויות → חישוב דינמי.
//    3. אחרת → מה שכתוב ב-travel.duration (טקסט חופשי), אם קיים.
// ============================================================================
import { TRAVEL_MODES } from './util.js';

/**
 * פרופיל לכל אמצעי תחבורה:
 *  kmh      — מהירות אפקטיבית "מדלת לדלת" בעיר.
 *  overhead — דקות קבועות (המתנה, ירידה לתחנה, הזמנת רכב, חניה).
 *  detour   — מקדם עקיפה: הדרך בפועל ארוכה מקו אווירי ישר.
 *  boost    — כמה המהירות עולה בנסיעות ארוכות (כביש מהיר / קו ישיר).
 */
const PROFILE = {
  walk: { kmh: 4.6, overhead: 0, detour: 1.25, boost: 0 },
  bike: { kmh: 13, overhead: 3, detour: 1.25, boost: 0 },
  tram: { kmh: 16, overhead: 5, detour: 1.30, boost: 0.25 },
  bus: { kmh: 14, overhead: 6, detour: 1.35, boost: 0.30 },
  metro: { kmh: 26, overhead: 6, detour: 1.25, boost: 0.50 },
  taxi: { kmh: 22, overhead: 4, detour: 1.35, boost: 0.80 },
  car: { kmh: 24, overhead: 5, detour: 1.35, boost: 0.80 },
  train: { kmh: 55, overhead: 12, detour: 1.20, boost: 1.00 },
  boat: { kmh: 15, overhead: 10, detour: 1.10, boost: 0 },
  funicular: { kmh: 8, overhead: 5, detour: 1.00, boost: 0 },
};
const DEFAULT_MODE = 'walk';

/** מרחק קו-אווירי במטרים בין שתי נקודות. */
export function haversineM(a, b) {
  if (!a || !b) return null;
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))));
}

/** הערכת זמן נסיעה בדקות לפי מרחק ואמצעי. */
export function estimateMinutes(distanceM, mode) {
  if (distanceM == null) return null;
  const p = PROFILE[mode] || PROFILE[DEFAULT_MODE];
  const km = (distanceM * p.detour) / 1000;
  // בנסיעות ארוכות המהירות האפקטיבית עולה (כביש מהיר, קו ישיר ללא עצירות).
  const longFactor = Math.max(0, Math.min(1, (km - 3) / 15));
  const kmh = p.kmh * (1 + (p.boost || 0) * longFactor);
  const minutes = p.overhead + (km / kmh) * 60;
  if (minutes <= 0) return 0;
  // עיגול ידידותי: עד שעה — לכפולות של 5 דק׳ (מינימום 5), מעבר לכך — ל-10 דק׳.
  if (minutes < 60) return Math.max(5, Math.round(minutes / 5) * 5);
  return Math.round(minutes / 10) * 10;
}

/** "12 דק׳" / "1 שע׳ 10 דק׳" */
export function formatMinutes(min) {
  if (min == null) return '';
  if (min < 60) return `${min} דק׳`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} שע׳ ${m} דק׳` : `${h} שע׳`;
}

/** "700 מ׳" / "2.4 ק״מ" */
export function formatDistance(m) {
  if (m == null) return '';
  if (m < 1000) return `${Math.round(m / 50) * 50} מ׳`;
  return `${(m / 1000).toFixed(1)} ק״מ`;
}

/** בחירת אמצעי הגעה סבירה לפי מרחק (כשלא נבחר אמצעי במפורש). */
export function suggestMode(distanceM) {
  if (distanceM == null) return DEFAULT_MODE;
  if (distanceM < 1300) return 'walk';
  if (distanceM < 6000) return 'metro';
  return 'taxi';
}

/** מפת מקומות לפי שם (name → place). */
export function placesByName(tour) {
  const m = new Map();
  (tour?.places || []).forEach((p) => m.set(p.name, p));
  return m;
}

const HOTEL_RE = /מלון|לינה|hotel|צ׳ק-אין|צ'ק-אין|check-?in|check-?out/i;
const AIRPORT_RE = /שדה התעופה|נמל התעופה|טרמינל|airport|טיסה|flight|ממריא|נחית/i;

/** נקודת עוגן (שדה תעופה / מלון) לפי טקסט. היעד = האזכור המאוחר יותר. */
function anchorFrom(text, tour) {
  if (!text) return null;
  const air = tour?.airport;
  const hotel = tour?.hotel;
  const hasAir = air && typeof air.lat === 'number' && typeof air.lng === 'number';
  const hasHotel = hotel && typeof hotel.lat === 'number' && typeof hotel.lng === 'number';
  const ai = hasAir ? text.search(AIRPORT_RE) : -1;
  const hi = hasHotel ? text.search(HOTEL_RE) : -1;
  if (ai < 0 && hi < 0) return null;
  const useAirport = hi < 0 || (ai >= 0 && ai > hi);
  return useAirport ? { lat: air.lat, lng: air.lng } : { lat: hotel.lat, lng: hotel.lng };
}

/**
 * איתור קואורדינטות של פעילות:
 *  1. item.lat/lng מפורשים
 *  2. המקום המקושר (item.place) מתוך places
 *  3. עוגן לפי הכותרת (שדה תעופה / מלון) — הכותרת מנצחת את התיאור
 *  4. עוגן לפי התיאור, רק אם הכותרת לא רומזת דבר
 */
export function itemCoords(tour, item, places) {
  if (!item) return null;
  if (typeof item.lat === 'number' && typeof item.lng === 'number') return { lat: item.lat, lng: item.lng };
  const map = places || placesByName(tour);
  const p = item.place ? map.get(item.place) : null;
  if (p && typeof p.lat === 'number' && typeof p.lng === 'number') return { lat: p.lat, lng: p.lng };
  return anchorFrom(`${item.title || ''} ${item.place || ''}`, tour)
      || anchorFrom(item.desc || '', tour);
}

/**
 * מקטע הנסיעה לפעילות שבאינדקס i (מהפעילות הקודמת אליה).
 * מחזיר null כשאין מה להציג.
 *
 * @returns {{mode:string, emoji:string, modeHe:string, line?:string, note?:string,
 *            minutes:number|null, text:string, distanceM:number|null,
 *            computed:boolean, suggested:boolean}|null}
 */
export function legFor(tour, items, i, places) {
  if (!Array.isArray(items) || i <= 0 || i >= items.length) return null;
  const map = places || placesByName(tour);
  const item = items[i];
  const prev = items[i - 1];
  const t = item?.travel || null;

  const from = itemCoords(tour, prev, map);
  const to = itemCoords(tour, item, map);
  const distanceM = from && to ? haversineM(from, to) : null;

  // אין נתוני נסיעה: מציעים מקטע רק אם באמת יש מרחק משמעותי.
  if (!t) {
    if (distanceM == null || distanceM < 250) return null;
    const mode = suggestMode(distanceM);
    const minutes = estimateMinutes(distanceM, mode);
    const m = TRAVEL_MODES[mode] || TRAVEL_MODES.walk;
    return {
      mode, emoji: m.emoji, modeHe: m.he, minutes,
      text: formatMinutes(minutes), distanceM, computed: true, suggested: true,
    };
  }

  const mode = TRAVEL_MODES[t.mode] ? t.mode : suggestMode(distanceM);
  const m = TRAVEL_MODES[mode];

  // הזנה ידנית מנצחת.
  if (t.manual && t.duration) {
    return {
      mode, emoji: m.emoji, modeHe: m.he, line: t.line, note: t.note,
      minutes: null, text: String(t.duration), distanceM, computed: false, suggested: false,
    };
  }

  if (distanceM != null) {
    const minutes = estimateMinutes(distanceM, mode);
    return {
      mode, emoji: m.emoji, modeHe: m.he, line: t.line, note: t.note,
      minutes, text: formatMinutes(minutes), distanceM, computed: true, suggested: false,
    };
  }

  // אין קואורדינטות — נשארים עם מה שכתוב.
  return {
    mode, emoji: m.emoji, modeHe: m.he, line: t.line, note: t.note,
    minutes: null, text: t.duration ? String(t.duration) : '', distanceM: null,
    computed: false, suggested: false,
  };
}

/** תווית מלאה למקטע: "🚶 ברגל · קו 2 · 12 דק׳". */
export function legLabel(leg) {
  if (!leg) return '';
  const bits = [`${leg.emoji} ${leg.modeHe}`];
  if (leg.line) bits.push(`קו ${leg.line}`);
  if (leg.text) bits.push(leg.text);
  return bits.join(' · ');
}

/**
 * הערכה חיה עבור טופס העריכה: כמה ייקח להגיע לפעילות i באמצעי נתון.
 * @returns {{minutes:number|null, text:string, distanceM:number|null}}
 */
export function estimateFor(tour, items, i, mode) {
  const map = placesByName(tour);
  const from = itemCoords(tour, items?.[i - 1], map);
  const to = itemCoords(tour, items?.[i], map);
  const distanceM = from && to ? haversineM(from, to) : null;
  const minutes = distanceM == null ? null : estimateMinutes(distanceM, mode || suggestMode(distanceM));
  return { minutes, text: formatMinutes(minutes), distanceM };
}
