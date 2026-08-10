// ============================================================================
//  placesearch.js — חיפוש מקומות עם השלמה אוטומטית ומילוי פרטים מלא.
//  ----------------------------------------------------------------------------
//  בלי מפתחות API ובלי שרת:
//    · השלמה תוך כדי הקלדה → Photon (בנוי לכך, מבוסס OpenStreetMap)
//    · פרטים על מקום שנבחר → Nominatim lookup (שעות פתיחה, אתר, מזהה Wikidata)
//    · תיאור ותמונה        → Wikidata → ויקיפדיה (עברית, ואם אין — אנגלית)
//    · תמונת גיבוי         → Wikimedia Commons
//  מחזיר שדות מוכנים להזרקה לטופס המקום: שם, שם לועזי, קטגוריה, אימוג׳י,
//  קואורדינטות, כתובת, תיאור קצר ומורחב, תמונה, שעות פתיחה וקישורים.
// ============================================================================
import { CATEGORIES, iconFor } from './util.js';

const PHOTON = 'https://photon.komoot.io/api/';
const NOMINATIM_LOOKUP = 'https://nominatim.openstreetmap.org/lookup';
const cache = new Map();

async function getJSON(url, signal) {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// ---- מיפוי סוג המקום ב-OSM לקטגוריה שלנו --------------------------------
const CAT_RULES = [
  [/^tourism$/, /^(museum|gallery)$/, 'museums'],
  [/^tourism$/, /^(viewpoint)$/, 'views'],
  [/^natural$/, /^(peak|volcano)$/, 'views'],
  [/^amenity$/, /^(restaurant|fast_food|food_court|biergarten)$/, 'restaurants'],
  [/^amenity$/, /^(cafe|ice_cream)$/, 'sweets'],
  [/^shop$/, /^(bakery|pastry|confectionery|chocolate)$/, 'sweets'],
  [/^amenity$/, /^(bar|pub|nightclub|casino)$/, 'nightlife'],
  [/^amenity$/, /^(spa|public_bath)$/, 'baths'],
  [/^leisure$/, /^(sauna|water_park)$/, 'baths'],
  [/^leisure$/, /^(park|garden|nature_reserve)$/, 'parks'],
  [/^natural$/, /^(wood|beach|water)$/, 'parks'],
  [/^shop$/, /.*/, 'shopping'],
  [/^amenity$/, /^(marketplace)$/, 'shopping'],
  [/^(historic|tourism|building|man_made|amenity|place|railway|waterway|bridge)$/, /.*/, 'attractions'],
];

function mapCategory(cls, type, name) {
  const hay = `${name || ''} ${type || ''}`.toLowerCase();
  if (/bath|f[üu]rd|thermal|spa|מרחצ/.test(hay)) return 'baths';
  if (/museum|múzeum|מוזיא/.test(hay)) return 'museums';
  for (const [c, t, cat] of CAT_RULES) {
    if (c.test(cls || '') && t.test(type || '')) return CATEGORIES[cat] ? cat : 'attractions';
  }
  return 'attractions';
}

/** כתובת קריאה מתוך רכיבי הכתובת של Nominatim. */
function formatAddress(a) {
  if (!a) return '';
  const street = [a.road, a.house_number].filter(Boolean).join(' ');
  const city = a.city || a.town || a.village || a.municipality || '';
  return [street, a.suburb || a.neighbourhood, city, a.postcode].filter(Boolean).join(', ');
}

/**
 * הצעות חיפוש (השלמה אוטומטית). מומלץ לקרוא עם debounce (~300ms) ומ-3 תווים.
 * @param {string} query
 * @param {{lat?:number,lng?:number,limit?:number,signal?:AbortSignal}} [opts]
 *        lat/lng — מרכז היעד, כדי להעדיף תוצאות קרובות.
 * @returns {Promise<Array>}
 */
export async function suggest(query, opts = {}) {
  const q = String(query || '').trim();
  if (q.length < 3) return [];
  const key = `${q}|${opts.lat ?? ''},${opts.lng ?? ''}`;
  if (cache.has(key)) return cache.get(key);

  const near = typeof opts.lat === 'number' && typeof opts.lng === 'number';
  const base = { q, limit: String(opts.limit || 8), lang: 'en' };

  // שלב 1: חיפוש מוגבל לאזור היעד — כך "New York Cafe" מחזיר את זה שבבודפשט
  // ולא רחוב בצרפת. שלב 2 (אם אין תוצאות): חיפוש עולמי עם הטיה ליעד.
  const attempts = [];
  if (near) {
    const d = 0.30;
    attempts.push({ ...base, bbox: `${opts.lng - d},${opts.lat - d},${opts.lng + d},${opts.lat + d}` });
    attempts.push({ ...base, lat: String(opts.lat), lon: String(opts.lng) });
  } else {
    attempts.push(base);
  }

  let raw = null;
  for (const params of attempts) {
    try {
      const j = await getJSON(`${PHOTON}?${new URLSearchParams(params).toString()}`, opts.signal);
      if (j?.features?.length) { raw = j; break; }
      raw = raw || j;
    } catch (e) {
      if (e?.name === 'AbortError') throw e;
      console.warn('[placesearch] suggest failed', e);
    }
  }
  if (!raw) return [];

  const out = (raw?.features || []).map((f) => {
    const p = f.properties || {};
    const [lng, lat] = f.geometry?.coordinates || [];
    const name = p.name || [p.street, p.housenumber].filter(Boolean).join(' ') || p.city || '';
    const where = [p.street && !p.name ? '' : p.street, p.district || p.city, p.country]
      .filter(Boolean).join(', ');
    return {
      id: `${p.osm_type || ''}${p.osm_id || ''}`,
      osmType: p.osm_type || '', osmId: p.osm_id || '',
      name: String(name).trim(),
      latin: String(name).trim(),
      sub: where,
      label: [name, where].filter(Boolean).join(' · '),
      lat: Number(lat), lng: Number(lng),
      osm: { class: p.osm_key, type: p.osm_value },
      category: mapCategory(p.osm_key, p.osm_value, `${name} ${p.osm_value || ''}`),
      address: [[p.street, p.housenumber].filter(Boolean).join(' '), p.district, p.city, p.postcode]
        .filter(Boolean).join(', '),
      extratags: {},
      wikidata: '',
      wikipedia: '',
    };
  }).filter((s) => s.name && Number.isFinite(s.lat) && Number.isFinite(s.lng));

  // הסרת כפילויות (אותו שם באותו מיקום בערך)
  const seen = new Set();
  const unique = out.filter((s) => {
    const k = `${s.name}|${s.lat.toFixed(3)},${s.lng.toFixed(3)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // דירוג לפי קרבה ליעד — כדי ש"New York Cafe" בבודפשט יופיע לפני עיר אחרת
  if (typeof opts.lat === 'number' && typeof opts.lng === 'number') {
    const dist = (s) => Math.hypot((s.lat - opts.lat) * 111, (s.lng - opts.lng) * 78);
    unique.forEach((s) => {
      s.km = Math.round(dist(s));
      // סימון ברור לתוצאה רחוקה, כדי שלא ייבחר מקום בעיר אחרת בטעות
      if (s.km > 100) s.sub = `${s.sub}${s.sub ? ' · ' : ''}⚠️ ${s.km.toLocaleString('he-IL')} ק״מ מהיעד`;
    });
    unique.sort((a, b) => {
      const near = (x) => (x.km <= 60 ? 0 : 1);   // קודם כל מה שבאזור היעד
      return near(a) - near(b) || a.km - b.km;
    });
  }

  cache.set(key, unique);
  return unique;
}

/** פרטים נוספים למקום שנבחר (שעות, אתר, Wikidata) — קריאה אחת ל-Nominatim. */
async function lookupDetails(sugg, signal) {
  if (!sugg?.osmType || !sugg?.osmId) return null;
  const ids = `${String(sugg.osmType).charAt(0).toUpperCase()}${sugg.osmId}`;
  const url = `${NOMINATIM_LOOKUP}?osm_ids=${encodeURIComponent(ids)}`
    + '&format=jsonv2&extratags=1&namedetails=1&addressdetails=1&accept-language=he,en';
  try {
    const j = await getJSON(url, signal);
    return Array.isArray(j) && j[0] ? j[0] : null;
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    return null;
  }
}

// ---- העשרה: ויקיפדיה (עברית קודם) ---------------------------------------
function cleanImg(u) { return typeof u === 'string' ? u.split('?')[0] : ''; }

async function wikiSummary(lang, title, signal) {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const j = await getJSON(url, signal);
    if (!j || j.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') return null;
    return {
      lang,
      title: j.title,
      extract: j.extract || '',
      img: cleanImg(j.thumbnail?.source || j.originalimage?.source || ''),
      url: j.content_urls?.desktop?.page || '',
    };
  } catch { return null; }
}

/** מ-Wikidata אל כותרות ויקיפדיה בעברית/אנגלית. */
async function wikidataTitles(id, signal) {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(id)}`
    + '&props=sitelinks%7Cdescriptions&sitefilter=hewiki%7Cenwiki&languages=he%7Cen&format=json&origin=*';
  try {
    const j = await getJSON(url, signal);
    const e = j?.entities?.[id];
    if (!e) return null;
    return {
      he: e.sitelinks?.hewiki?.title || '',
      en: e.sitelinks?.enwiki?.title || '',
      descHe: e.descriptions?.he?.value || '',
      descEn: e.descriptions?.en?.value || '',
    };
  } catch { return null; }
}

/** תמונת גיבוי מוויקישיתוף (רישיון חופשי). */
export async function commonsImage(query, signal) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search'
    + `&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=4`
    + '&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json&origin=*';
  try {
    const j = await getJSON(url, signal);
    const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
    const hit = pages.find((p) => p.imageinfo?.[0]?.thumburl);
    return hit ? hit.imageinfo[0].thumburl : '';
  } catch { return ''; }
}

const firstSentence = (s) => {
  const t = String(s || '').trim();
  if (!t) return '';
  const m = t.match(/^[\s\S]{20,180}?[.!?׃]\s/);
  return (m ? m[0] : t.slice(0, 180)).trim();
};

/**
 * מילוי אוטומטי של כל פרטי המקום מתוך הצעה שנבחרה.
 * @returns {Promise<object>} שדות מוכנים לטופס
 */
export async function details(sugg, opts = {}) {
  if (!sugg) return {};
  const signal = opts.signal;

  // קריאה אחת ל-Nominatim כדי להשלים שעות/אתר/Wikidata/כתובת מדויקת
  let extra = sugg.extratags || {};
  let addr = sugg.address || '';
  let heName = '';
  let wikidata = sugg.wikidata || '';
  let wikipedia = sugg.wikipedia || '';
  try {
    const look = await lookupDetails(sugg, signal);
    if (look) {
      extra = look.extratags || extra;
      addr = formatAddress(look.address) || addr;
      heName = look.namedetails?.['name:he'] || '';
      wikidata = extra.wikidata || wikidata;
      wikipedia = extra.wikipedia || wikipedia;
    }
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
  }

  const displayName = heName || sugg.name;
  const out = {
    name: displayName,
    he: sugg.latin && sugg.latin !== displayName ? sugg.latin : '',
    category: sugg.category,
    lat: sugg.lat,
    lng: sugg.lng,
    address: addr,
    links: [],
    tags: [],
  };
  out.emoji = iconFor(`${sugg.name} ${sugg.latin} ${sugg.osm?.type || ''}`, out.category);

  if (extra.website || extra['contact:website']) {
    out.links.push({ label: 'אתר רשמי', url: extra.website || extra['contact:website'], type: 'website' });
  }
  if (extra.opening_hours) out.hours = extra.opening_hours;
  if (extra.phone || extra['contact:phone']) out.phone = extra.phone || extra['contact:phone'];

  // ויקיפדיה: קודם דרך Wikidata, אחרת לפי התג wikipedia, אחרת לפי השם
  let summary = null;
  try {
    if (wikidata) {
      const t = await wikidataTitles(wikidata, signal);
      if (t?.he) summary = await wikiSummary('he', t.he, signal);
      if (!summary && t?.en) summary = await wikiSummary('en', t.en, signal);
      if (!summary && (t?.descHe || t?.descEn)) out.desc = t.descHe || t.descEn;
    }
    if (!summary && wikipedia && wikipedia.includes(':')) {
      const [lang, title] = wikipedia.split(':');
      summary = await wikiSummary(lang.trim(), title.trim(), signal);
    }
    if (!summary) summary = await wikiSummary('he', sugg.name, signal);
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
  }

  if (summary) {
    if (summary.extract) {
      out.long = summary.extract;
      out.desc = firstSentence(summary.extract);
    }
    if (summary.img) { out.img = summary.img; out.images = [summary.img]; }
    if (summary.url) out.links.push({ label: 'ויקיפדיה', url: summary.url, type: 'info' });
  }

  if (!out.img) {
    const q = `${sugg.latin || sugg.name} ${opts.city || ''}`.trim();
    const img = await commonsImage(q, signal);
    if (img) { out.img = img; out.images = [img]; }
  }

  return out;
}

export default { suggest, details, commonsImage };
