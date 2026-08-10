// ============================================================================
//  weather.js — מזג אוויר חי (Open-Meteo, ללא מפתח API, CORS פתוח).
//  ----------------------------------------------------------------------------
//  · מזג האוויר הנוכחי ביעד — תמיד זמין.
//  · תחזית יומית — עד 16 יום קדימה. אם הטיול רחוק יותר, מציגים את הממוצע
//    העונתי מתוך נתוני הטיול (tour.weather) עד שהתחזית תיפתח.
//  · תוצאות נשמרות במטמון לשעה, כדי לא להעמיס בקריאות.
// ============================================================================

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const CACHE_KEY = 'travels_weather_v1';
const TTL_MS = 60 * 60 * 1000; // שעה

/** קודי מזג אוויר של WMO → תיאור בעברית + אימוג׳י. */
const CODES = {
  0: ['בהיר', '☀️'], 1: ['בהיר בעיקר', '🌤️'], 2: ['מעונן חלקית', '⛅'], 3: ['מעונן', '☁️'],
  45: ['ערפל', '🌫️'], 48: ['ערפל מקפיא', '🌫️'],
  51: ['טפטוף קל', '🌦️'], 53: ['טפטוף', '🌦️'], 55: ['טפטוף חזק', '🌦️'],
  56: ['טפטוף קפוא', '🌧️'], 57: ['טפטוף קפוא', '🌧️'],
  61: ['גשם קל', '🌧️'], 63: ['גשם', '🌧️'], 65: ['גשם חזק', '🌧️'],
  66: ['גשם קפוא', '🌧️'], 67: ['גשם קפוא', '🌧️'],
  71: ['שלג קל', '🌨️'], 73: ['שלג', '🌨️'], 75: ['שלג כבד', '❄️'], 77: ['גרגרי שלג', '❄️'],
  80: ['ממטרים', '🌦️'], 81: ['ממטרים', '🌦️'], 82: ['ממטרים עזים', '⛈️'],
  85: ['ממטרי שלג', '🌨️'], 86: ['ממטרי שלג', '🌨️'],
  95: ['סופת רעמים', '⛈️'], 96: ['סופת רעמים וברד', '⛈️'], 99: ['סופת רעמים וברד', '⛈️'],
};

/** @returns {{he:string, emoji:string}} */
export function describe(code) {
  const c = CODES[code] || ['—', '🌡️'];
  return { he: c[0], emoji: c[1] };
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    const hit = all[key];
    if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  } catch {}
  return null;
}

function writeCache(key, data) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[key] = { at: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {}
}

/**
 * שליפת מזג אוויר ליעד.
 * @param {number} lat @param {number} lng
 * @returns {Promise<null|{current:{temp:number,code:number,wind:number},
 *                        daily:Array<{date:string,min:number,max:number,code:number,rain:number}>,
 *                        updatedAt:number}>}
 */
export async function fetchWeather(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = readCache(key);
  if (cached) return cached;

  const url = `${ENDPOINT}?latitude=${lat}&longitude=${lng}`
    + '&current=temperature_2m,weather_code,wind_speed_10m'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
    + '&timezone=auto&forecast_days=16';

  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(to);
    if (!res.ok) return null;
    const j = await res.json();
    const daily = (j.daily?.time || []).map((d, i) => ({
      date: d,
      min: Math.round(j.daily.temperature_2m_min?.[i]),
      max: Math.round(j.daily.temperature_2m_max?.[i]),
      code: j.daily.weather_code?.[i],
      rain: j.daily.precipitation_probability_max?.[i] ?? null,
    }));
    const data = {
      current: j.current ? {
        temp: Math.round(j.current.temperature_2m),
        code: j.current.weather_code,
        wind: Math.round(j.current.wind_speed_10m),
      } : null,
      daily,
      updatedAt: Date.now(),
    };
    writeCache(key, data);
    return data;
  } catch {
    return null; // אין רשת / חסימה → נופלים בחזרה לנתונים העונתיים
  }
}

/** קואורדינטות היעד של הטיול (יעד → מלון → מקום ראשון עם קואורדינטות). */
export function tourCoords(tour) {
  const d = tour?.destination;
  if (d && typeof d.lat === 'number' && typeof d.lng === 'number') return { lat: d.lat, lng: d.lng };
  const h = tour?.hotel;
  if (h && typeof h.lat === 'number' && typeof h.lng === 'number') return { lat: h.lat, lng: h.lng };
  const p = (tour?.places || []).find((x) => typeof x.lat === 'number' && typeof x.lng === 'number');
  return p ? { lat: p.lat, lng: p.lng } : null;
}

/** התחזית ליום מסוים ('YYYY-MM-DD') — או null אם מחוץ לטווח התחזית. */
export function forDate(data, iso) {
  if (!data || !iso) return null;
  return data.daily.find((d) => d.date === iso) || null;
}

/** האם תאריכי הטיול כבר בתוך חלון התחזית? */
export function coversTrip(data, tour) {
  if (!data?.daily?.length || !tour?.dates?.start) return false;
  return data.daily.some((d) => d.date === tour.dates.start)
      || data.daily.some((d) => d.date === tour.dates.end);
}

/** בעוד כמה ימים תיפתח התחזית לטיול (0 = כבר זמינה). */
export function daysUntilForecast(data, tour) {
  if (!data?.daily?.length || !tour?.dates?.start) return null;
  const last = data.daily[data.daily.length - 1].date;
  const lastMs = Date.parse(last + 'T12:00:00');
  const startMs = Date.parse(tour.dates.start + 'T12:00:00');
  if (Number.isNaN(lastMs) || Number.isNaN(startMs)) return null;
  const diff = Math.ceil((startMs - lastMs) / 86400000);
  return diff > 0 ? diff : 0;
}

/** תווית קצרה: "⛅ מעונן חלקית · 24°". */
export function label(entryOrCurrent) {
  if (!entryOrCurrent) return '';
  const d = describe(entryOrCurrent.code);
  const t = entryOrCurrent.temp != null
    ? `${entryOrCurrent.temp}°`
    : (entryOrCurrent.max != null ? `${entryOrCurrent.max}°/${entryOrCurrent.min}°` : '');
  return `${d.emoji} ${d.he}${t ? ' · ' + t : ''}`;
}
