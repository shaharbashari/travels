// ============================================================================
//  views/home.js — עמוד הבית של הטיול: ספירה לאחור, מסע, כרטיסים מהירים
// ============================================================================
import { esc, fmtRange, fmtDateShort, daysUntil, nights, countUp, PALETTE, CATEGORIES, thumb } from '../util.js';
import { skyline } from '../svg.js';
import { fetchWeather, tourCoords, forDate, coversTrip, describe, label } from '../weather.js';

function tempText(value) {
  return Number.isFinite(value) ? `${Math.round(value)}°` : '—';
}

function rainText(value) {
  return Number.isFinite(value) ? `${Math.round(value)}%` : '—';
}

function seasonalWeather(tour, loading = false) {
  return `
    <span class="glyph" aria-hidden="true">☀️</span>
    <div class="qcard__label">מזג אוויר · ${esc(tour.weather?.month || '')}</div>
    ${loading ? `
      <div class="weather-home__loading" role="status">
        <span class="weather-skeleton weather-skeleton--home-temp"></span>
        <span class="weather-skeleton weather-skeleton--home-copy"></span>
        <span class="weather-loading__text">טוען מזג אוויר חי…</span>
      </div>` : ''}
    <div class="weather-home__seasonal">
      <div class="qcard__value">${esc(tour.weather?.day || '')} <span class="weather-home__unit">ביום</span></div>
      <div class="qcard__sub">${esc(tour.weather?.night || '')} בלילה · ${esc(tour.weather?.summary || '')}</div>
    </div>`;
}

function liveWeather(tour, data) {
  const current = data?.current;
  const firstDay = coversTrip(data, tour) ? forDate(data, tour.dates?.start) : null;
  const city = tour.destination?.city || tour.title || 'היעד';
  const seasonal = `ממוצע ל${tour.weather?.month || 'עונה'}: ${tour.weather?.day || '—'} ביום · ${tour.weather?.night || '—'} בלילה`;

  if (firstDay) {
    const condition = describe(firstDay.code);
    return `
      <span class="glyph" aria-hidden="true">${esc(condition.emoji)}</span>
      <div class="qcard__label">תחזית ליום הראשון · ${esc(tour.weather?.month || '')}</div>
      <div class="weather-home__main">
        <span class="weather-home__temp" dir="ltr">${esc(`${tempText(firstDay.max)} / ${tempText(firstDay.min)}`)}</span>
        <span class="weather-home__condition">${esc(`${condition.emoji} ${condition.he}`)}</span>
      </div>
      <div class="weather-home__caption">${esc(fmtDateShort(firstDay.date))} · סיכוי לגשם ${esc(rainText(firstDay.rain))}</div>
      ${current ? `<div class="qcard__sub weather-home__now">עכשיו ב${esc(city)} · ${esc(label(current))}</div>` : ''}
      <div class="qcard__sub weather-home__seasonal-line">${esc(seasonal)}</div>`;
  }

  if (!current) return seasonalWeather(tour);
  const condition = describe(current.code);
  return `
    <span class="glyph" aria-hidden="true">${esc(condition.emoji)}</span>
    <div class="qcard__label">מזג אוויר · ${esc(tour.weather?.month || '')}</div>
    <div class="weather-home__main">
      <span class="weather-home__temp" dir="ltr">${esc(tempText(current.temp))}</span>
      <span class="weather-home__condition">${esc(`${condition.emoji} ${condition.he}`)}</span>
    </div>
    <div class="weather-home__caption">עכשיו ב${esc(city)}</div>
    <div class="qcard__sub weather-home__seasonal-line">${esc(seasonal)}</div>
    <div class="qcard__sub">${esc(tour.weather?.summary || '')}</div>`;
}

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
      <div class="qcard weather-home weather-is-loading" data-weather="home" aria-live="polite" aria-busy="true">
        ${seasonalWeather(tour, true)}
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

export async function mount(ctx, root) {
  try {
    root.querySelectorAll('[data-count]').forEach((el) => countUp(el, Number(el.dataset.count)));
  } catch {}

  const host = root?.querySelector?.('[data-weather="home"]');
  if (!host) return;
  const showFallback = () => {
    try {
      host.querySelector('.weather-home__loading')?.remove();
      host.classList.remove('weather-is-loading');
      host.removeAttribute('aria-busy');
    } catch {}
  };

  try {
    const coords = tourCoords(ctx?.tour);
    if (!coords) { showFallback(); return; }
    const data = await fetchWeather(coords.lat, coords.lng);
    if (!data) { showFallback(); return; }
    if (!host.isConnected) return;
    host.innerHTML = liveWeather(ctx.tour, data);
    host.classList.remove('weather-is-loading');
    host.removeAttribute('aria-busy');
  } catch {
    showFallback();
  }
}
