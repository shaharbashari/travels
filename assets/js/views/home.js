// ============================================================================
//  views/home.js — עמוד הבית של הטיול: ספירה לאחור, מסע, כרטיסים מהירים
// ============================================================================
import { esc, fmtRange, fmtDateShort, daysUntil, nights, countUp, PALETTE, CATEGORIES, thumb } from '../util.js';
import { skyline } from '../svg.js';

function countdownBlock(tour, status) {
  const dleft = daysUntil(tour.dates?.start);
  if (status === 'past') {
    return `<div class="countdown"><span class="countdown__num" style="color:var(--gold-deep)">💛</span>
      <span class="countdown__label">הטיול הסתיים — עד הפעם הבאה!</span></div>`;
  }
  if (status === 'active') {
    const dayNo = Math.max(1, (daysUntil(tour.dates?.start) * -1) + 1);
    return `<div class="countdown countdown--live"><span class="countdown__num" data-count="${dayNo}">0</span>
      <span class="countdown__label">היום — יום ${dayNo} בטיול ✨</span></div>`;
  }
  if (dleft === 0) {
    return `<div class="countdown"><span class="countdown__num">🛫</span>
      <span class="countdown__label">ממריאים היום! בון וויאז׳</span></div>`;
  }
  return `<div class="countdown"><span class="countdown__num" data-count="${dleft}">0</span>
    <span class="countdown__label">ימים עד הטיסה</span></div>`;
}

function journey(tour) {
  const stops = tour.days.map((d, i) => `
    <a class="journey__stop" href="#/t/${encodeURIComponent(tour.id)}/days/${d.index}">
      <span class="journey__dot" style="background:${PALETTE[i % PALETTE.length]}"></span>יום ${d.index}
    </a>`);
  return `<div class="journey">${stops.join('<span class="journey__arrow">·</span>')}</div>`;
}

function flightCard(f) {
  const dur = f.arrive ? '' : (f.note || '');
  return `
  <div class="qcard">
    <span class="glyph">✈️</span>
    <div class="qcard__label">${esc(f.label)}</div>
    <div class="qcard__value" style="font-family:var(--font-latin)">${esc(f.from.code)} → ${esc(f.to.code)}</div>
    <div class="qcard__sub">${esc(fmtDateShort(f.date))} · ${esc(f.depart)}${f.arrive ? '–' + esc(f.arrive) : ''} · ${esc(f.airline)} ${esc(f.flightNo)}</div>
  </div>`;
}

function highlights(tour) {
  const picks = tour.places.filter((p) => p.badge).slice(0, 8);
  if (!picks.length) return '';
  return `
    <h2 class="section-title"><span class="em">⭐</span> רגעים לא לפספס</h2>
    <div class="filter-chips" style="gap:14px">
      ${picks.map((p) => {
        const c = CATEGORIES[p.category] || {};
        return `<a class="place-card washi" style="--wc:${c.color};min-width:260px;flex:0 0 auto" href="#/t/${encodeURIComponent(tour.id)}/place/${encodeURIComponent(p.id)}">
          ${thumb(p.img, p.emoji || c.emoji, { color: c.color })}
          <div>
            <div class="place-card__name">${esc(p.name)}</div>
            <div class="place-card__desc">${esc(p.desc || '')}</div>
            <div class="place-card__foot"><span class="badge" style="background:color-mix(in srgb, ${c.color} 14%, #fff);color:${c.color};border-color:color-mix(in srgb, ${c.color} 30%, #fff)">${esc(p.badge)}</span></div>
          </div>
          <span class="place-card__cat" style="background:${c.color}"></span>
        </a>`;
      }).join('')}
    </div>`;
}

export function render({ tour, status }) {
  const out = tour.flights?.find((f) => f.direction === 'outbound');
  const ret = tour.flights?.find((f) => f.direction === 'return');
  const n = nights(tour.dates?.start, tour.dates?.end);

  return `
    <section class="hero">
      ${skyline({ reflection: true })}
      ${tour.hero ? `<img class="hero__photo" src="${esc(tour.hero)}" alt="" decoding="async" referrerpolicy="no-referrer" onload="this.classList.add('is-loaded')" onerror="this.remove()">` : ''}
      <div class="hero__scrim"></div>
      <div class="hero__inner">
        <div class="hero__eyebrow">${esc(tour.destination?.country || '')} · ${esc(fmtRange(tour.dates?.start, tour.dates?.end))}</div>
        <h1 class="hero__title">${esc(tour.title)}</h1>
        <p class="hero__sub">${esc(tour.subtitle || tour.summary || '')}</p>
        ${countdownBlock(tour, status)}
        ${journey(tour)}
      </div>
    </section>

    <h2 class="section-title"><span class="em">🎫</span> במבט מהיר</h2>
    <div class="quickgrid stagger">
      ${out ? flightCard(out) : ''}
      ${ret ? flightCard(ret) : ''}
      <div class="qcard">
        <span class="glyph">☀️</span>
        <div class="qcard__label">מזג אוויר · ${esc(tour.weather?.month || '')}</div>
        <div class="qcard__value">${esc(tour.weather?.day || '')} <span style="font-size:.9rem;color:var(--ink-soft)">ביום</span></div>
        <div class="qcard__sub">${esc(tour.weather?.night || '')} בלילה · ${esc(tour.weather?.summary || '')}</div>
      </div>
      <a class="qcard qcard--wide" href="${esc(tour.hotel?.mapUrl || '#')}" target="_blank" rel="noopener">
        <span class="glyph">🏨</span>
        <div class="qcard__label">מלון · ${n} לילות</div>
        <div class="qcard__value">${esc(tour.hotel?.name || '')}</div>
        <div class="qcard__sub">${esc(tour.hotel?.address || '')} · פתח במפות ›</div>
      </a>
    </div>

    ${highlights(tour)}

    <div style="text-align:center;margin-top:30px">
      <a class="btn" href="#/t/${encodeURIComponent(tour.id)}/days">למסלול המלא ›</a>
    </div>
  `;
}

export function mount(ctx, root) {
  root.querySelectorAll('[data-count]').forEach((el) => countUp(el, Number(el.dataset.count)));
}
