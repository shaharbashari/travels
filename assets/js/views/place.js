// ============================================================================
//  views/place.js — עמוד פרטי מקום/אטרקציה (בסיס; מורחב ע"י שכבת הפרטים).
//  חוזה: render(ctx) → HTML string.  ctx = { tour, place, tours, config, canEdit, route }
//  mount?(ctx, root) — אופציונלי (למפה קטנה וכו').
// ============================================================================
import { esc, CATEGORIES, thumb } from '../util.js';

const gmaps = (name, city) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((name || '') + ', ' + (city || ''))}`;

export function render({ tour, place }) {
  if (!place) return `<div class="container"><p>המקום לא נמצא.</p></div>`;
  const c = CATEGORIES[place.category] || {};
  const city = tour?.destination?.city || '';
  return `
    <div class="container">
      <a class="place-link" href="#/t/${encodeURIComponent(tour.id)}/explore">‹ חזרה למה עושים</a>
      <h1 class="section-title" style="margin-top:10px"><span class="em">${esc(place.emoji || c.emoji || '📍')}</span> ${esc(place.name)}</h1>
      ${place.desc ? `<p class="section-sub">${esc(place.desc)}</p>` : ''}
      <div style="max-width:520px;margin:14px 0">${thumb(place.img, place.emoji || c.emoji, { color: c.color, cls: 'thumb--hero' })}</div>
      ${place.long ? `<p>${esc(place.long)}</p>` : ''}
      <a class="btn" style="margin-top:14px" href="${gmaps(place.name, city)}" target="_blank" rel="noopener">🗺️ פתח במפות</a>
    </div>`;
}
