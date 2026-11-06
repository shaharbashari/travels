// ============================================================================
//  views/trips.js — רשימת כל הטיולים (עמוד הבית הראשי)
// ============================================================================
import { esc, fmtRange, nights, daysUntil, tourStatus, STATUS_LABELS, PALETTE } from '../util.js';
import { skyline } from '../svg.js';

function travelerChips(travelers = []) {
  return travelers.map((name, i) => `
    <span class="avatar-chip">
      <span class="dot" style="background:${PALETTE[i % PALETTE.length]}">${esc(name.trim().charAt(0))}</span>
      ${esc(name)}
    </span>`).join('');
}

function tripCard(tour) {
  const status = tourStatus(tour);
  const s = STATUS_LABELS[status];
  const n = nights(tour.dates?.start, tour.dates?.end);
  const dleft = daysUntil(tour.dates?.start);
  const countdown = status === 'upcoming' && dleft != null && dleft > 0
    ? `<span>⏳ עוד <b>${dleft}</b> ימים</span>` : '';

  return `
  <a class="trip-card" href="#/t/${encodeURIComponent(tour.id)}/home" aria-label="${esc(tour.title)}">
    <div class="trip-card__cover">
      ${tour.destination?.city === 'בודפשט' ? skyline({ reflection: true }) : ''}
      ${tour.hero ? `<img class="cover-photo" src="${esc(tour.hero)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="this.classList.add('is-loaded')" onerror="this.remove()">` : ''}
      <span class="trip-card__flag flag">${esc(tour.destination?.flag || '📍')}</span>
      <span class="trip-card__status"><span class="badge ${s.cls}">${esc(s.he)}</span></span>
    </div>
    <div class="trip-card__body">
      <div class="trip-card__title">${esc(tour.title)}
        <span class="country">${esc(tour.destination?.country || '')}</span>
      </div>
      <div class="trip-card__meta">
        <span>📅 <b>${esc(fmtRange(tour.dates?.start, tour.dates?.end))}</b></span>
        ${n != null ? `<span>🌙 ${n} לילות</span>` : ''}
        ${countdown}
      </div>
      <div class="trip-card__travelers">${travelerChips(tour.travelers)}</div>
    </div>
  </a>`;
}

export function render({ tours, config }) {
  const hasTours = tours && tours.length;
  return `
    <section class="brandhero">
      <div class="stamp">🧳✨</div>
      <h1>${esc(config.siteTitle)}</h1>
      <p>${esc(config.tagline)}</p>
    </section>

    ${hasTours ? `
      <div class="trip-grid stagger">
        ${tours.map(tripCard).join('')}
      </div>
      <p class="section-sub" style="text-align:center;margin-top:28px">
        ${tours.length} טיולים · מתעדכן לפני כל מסע
      </p>
    ` : `
      <div class="card" style="text-align:center;margin-top:20px">${esc(config.emptyState)}</div>
    `}
  `;
}
