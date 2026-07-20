// ============================================================================
//  views/explore.js — קטגוריות ומקומות ("מה עושים")
// ============================================================================
import { esc, CATEGORIES, thumb } from '../util.js';

const gmaps = (name) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', Budapest')}`;

function countByCat(tour) {
  const counts = {};
  (tour.places || []).forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
  return counts;
}

function categoryGrid(tour) {
  const counts = countByCat(tour);
  const tiles = Object.keys(CATEGORIES)
    .filter((k) => counts[k])
    .map((k) => {
      const c = CATEGORIES[k];
      return `
        <a class="cat-tile" href="#/t/${encodeURIComponent(tour.id)}/explore/${k}"
           style="background:color-mix(in srgb, ${c.color} 12%, var(--surface));">
          <div class="cat-em">${c.emoji}</div>
          <div>
            <div class="cat-name" style="color:${c.color}">${esc(c.he)}</div>
            <div class="cat-count">${counts[k]} מקומות</div>
          </div>
        </a>`;
    }).join('');

  return `
    <h2 class="section-title"><span class="em">🧭</span> מה עושים ב${esc(tour.destination?.city || '')}?</h2>
    <p class="section-sub">כל ההמלצות מהמסלול — לחצו קטגוריה</p>
    <div class="cat-grid stagger">${tiles}</div>`;
}

function placeCard(tour, p) {
  const c = CATEGORIES[p.category] || {};
  const sub = p.he && p.he.trim();
  return `
    <div class="place-card washi" style="--wc:${c.color}">
      ${thumb(p.img, p.emoji || c.emoji, { color: c.color })}
      <div>
        <div class="place-card__name">${esc(p.name)} ${sub ? `<span class="lat">${esc(p.he)}</span>` : ''}</div>
        ${p.desc ? `<div class="place-card__desc">${esc(p.desc)}</div>` : ''}
        <div class="place-card__foot">
          ${p.badge ? `<span class="badge" style="background:color-mix(in srgb, ${c.color} 14%, #fff);color:${c.color};border-color:color-mix(in srgb, ${c.color} 30%, #fff)">${esc(p.badge)}</span>` : ''}
          ${p.hours ? `<span class="chip" style="padding:4px 11px;font-size:.78rem">🕒 ${esc(p.hours)}</span>` : ''}
          ${p.price ? `<span class="chip" style="padding:4px 11px;font-size:.78rem">💰 ${esc(p.price)}</span>` : ''}
          ${p.day ? `<span class="chip" style="padding:4px 11px;font-size:.78rem">יום ${p.day}</span>` : ''}
          <a class="place-link" href="${gmaps(p.name)}" target="_blank" rel="noopener">🗺️ במפות</a>
        </div>
        ${p.tip ? `<div class="place-tip">💡 ${esc(p.tip)}</div>` : ''}
      </div>
      <span class="place-card__cat" style="background:${c.color}"></span>
    </div>`;
}

function filterChips(tour, active) {
  const counts = countByCat(tour);
  const base = `#/t/${encodeURIComponent(tour.id)}/explore`;
  const all = `<a class="chip ${active === 'all' ? 'is-active' : ''}" href="${base}/all">הכל</a>`;
  const rest = Object.keys(CATEGORIES).filter((k) => counts[k]).map((k) => {
    const c = CATEGORIES[k];
    return `<a class="chip ${active === k ? 'is-active' : ''}" href="${base}/${k}">${c.emoji} ${esc(c.he)}</a>`;
  }).join('');
  return `<div class="filter-chips">${all}${rest}</div>`;
}

function listView(tour, cat) {
  const places = (tour.places || []).filter((p) => cat === 'all' || p.category === cat);
  const title = cat === 'all' ? 'כל המקומות' : (CATEGORIES[cat]?.he || '');
  return `
    <h2 class="section-title"><a href="#/t/${encodeURIComponent(tour.id)}/explore" class="place-link" style="font-size:.9rem;font-weight:700">‹ קטגוריות</a></h2>
    <h2 class="section-title" style="margin-top:2px"><span class="em">${cat === 'all' ? '📚' : CATEGORIES[cat]?.emoji || ''}</span> ${esc(title)}</h2>
    ${filterChips(tour, cat)}
    <div class="place-list stagger">${places.map((p) => placeCard(tour, p)).join('')}</div>`;
}

export function render({ tour, route }) {
  const param = route.param;
  if (!param) return categoryGrid(tour);
  if (param === 'all' || CATEGORIES[param]) return listView(tour, param);
  return categoryGrid(tour);
}
