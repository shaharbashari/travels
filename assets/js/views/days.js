// ============================================================================
//  views/days.js — מסלול יומי כציר זמן
// ============================================================================
import { esc, fmtWeekday, fmtDateShort, thumb } from '../util.js';

function placeLookup(tour) {
  const map = new Map();
  (tour.places || []).forEach((p) => map.set(p.name, p));
  return map;
}

function timelineItem(tour, item, isLast, places) {
  const place = item.place ? places.get(item.place) : null;
  const placeLink = item.place
    ? (place
        ? `<a class="place-link" href="#/t/${encodeURIComponent(tour.id)}/place/${encodeURIComponent(place.id)}">📍 ${esc(item.place)} ›</a>`
        : `<span class="place-link" style="color:var(--ink-soft)">📍 ${esc(item.place)}</span>`)
    : '';
  return `
    <div class="tl-item">
      <div class="tl-rail">
        <div class="tl-time">${esc(item.time || '')}</div>
        <div class="tl-dot">${esc(item.emoji || '•')}</div>
        ${isLast ? '' : '<div class="tl-line"></div>'}
      </div>
      <div class="tl-card">
        <div class="tl-card__body">
          <div class="tl-card__title">${esc(item.title)}</div>
          ${item.desc ? `<div class="tl-card__desc">${esc(item.desc)}</div>` : ''}
          ${placeLink ? `<div class="tl-card__place">${placeLink}</div>` : ''}
        </div>
        ${item.img || (place && place.img) ? thumb(item.img || place.img, item.emoji, { color: 'var(--gold)' }) : ''}
      </div>
    </div>`;
}

function timeline(tour, day) {
  const places = placeLookup(tour);
  // קיבוץ לפי חלק היום, בסדר ההופעה
  const order = [];
  const groups = new Map();
  day.items.forEach((it) => {
    const p = it.period || '';
    if (!groups.has(p)) { groups.set(p, []); order.push(p); }
    groups.get(p).push(it);
  });

  return order.map((period) => {
    const items = groups.get(period);
    return `
      <div class="tl-group">
        ${period ? `<div class="tl-period">${esc(period)}</div>` : ''}
        <div class="timeline">
          ${items.map((it, i) => timelineItem(tour, it, i === items.length - 1, places)).join('')}
        </div>
      </div>`;
  }).join('');
}

function dayPicker(tour, current) {
  return `<div class="daypicker">${tour.days.map((d) => `
    <a class="daypick ${d.index === current ? 'is-active' : ''}" href="#/t/${encodeURIComponent(tour.id)}/days/${d.index}">
      <div class="d-lbl">${esc(fmtWeekday(d.date))}</div>
      <div class="d-num">יום ${d.index}</div>
      <div class="d-date">${esc(fmtDateShort(d.date))}</div>
    </a>`).join('')}</div>`;
}

const TRANSPORT_EMOJI = { 'ברגל': '🚶', 'מונית': '🚕', 'מטרו': '🚇', 'טראם': '🚋', 'אוטובוס': '🚌' };
const transportEmoji = (mode) => {
  for (const key in TRANSPORT_EMOJI) if (mode.includes(key)) return TRANSPORT_EMOJI[key];
  return '🚕';
};

export function render({ tour, route }) {
  const idx = Number(route.param) || tour.days[0].index;
  const day = tour.days.find((d) => d.index === idx) || tour.days[0];

  const meta = [
    ...(day.transport || []).map((tr) => `<span class="chip">${transportEmoji(tr)} ${esc(tr)}</span>`),
    day.lodging ? `<span class="chip">🛏️ ${esc(day.lodging)}</span>` : '',
  ].join('');

  return `
    <div class="day-layout">
      ${dayPicker(tour, day.index)}
      <div class="day-main">
        <div class="day-head">
          <div class="day-head__k">${esc(fmtWeekday(day.date))} · ${esc(fmtDateShort(day.date))}</div>
          <div class="day-head__title">${esc(day.title)}</div>
          ${day.subtitle ? `<div class="day-head__sub">${esc(day.subtitle)}</div>` : ''}
          <div class="day-head__meta">${meta}</div>
        </div>
        ${timeline(tour, day)}
      </div>
    </div>`;
}
