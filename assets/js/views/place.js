// ============================================================================
//  views/place.js — עמוד פרטי מקום/אטרקציה: כותרת-על (hero), עובדות, תיאור,
//  טיפים, גלריה עם לייטבוקס, מפה קטנה ומקומות קשורים.
//  חוזה: render(ctx) → HTML string · mount(ctx, root) → אינטראקטיביות.
//  ctx = { tour, place, tours, config, canEdit, route }
//  אין גישה ל-DOM בזמן import — רק בתוך render/mount.
// ============================================================================
import { esc, CATEGORIES, thumb } from '../util.js';

const gmaps = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const LINK_ICON = { tickets: '🎟️', website: '🌐', menu: '📋', map: '🗺️', info: 'ℹ️' };

/** תמונות המקום (גלריה, או נפילה ל-img בודד). */
function imagesOf(place) {
  if (Array.isArray(place.images) && place.images.length) return place.images.filter(Boolean);
  return place.img ? [place.img] : [];
}

/** טיפים כמערך (tips חדש, או tip בודד legacy). */
function tipsOf(place) {
  if (Array.isArray(place.tips) && place.tips.length) return place.tips.filter(Boolean);
  return place.tip ? [place.tip] : [];
}

/** פירוק תיאור ארוך לפסקאות לפי מעברי שורה. */
function paragraphs(text) {
  return String(text || '').split(/\r?\n+/).map((s) => s.trim()).filter(Boolean);
}

export function render({ tour, place }) {
  if (!place) return `<div class="container"><p class="detail-empty">המקום לא נמצא.</p></div>`;

  const c = CATEGORIES[place.category] || {};
  const color = c.color || 'var(--gold)';
  const emoji = place.emoji || c.emoji || '📍';
  const city = tour?.destination?.city || '';
  const tourId = encodeURIComponent(tour.id);

  const images = imagesOf(place);
  const gallery = images.slice(1);
  const tips = tipsOf(place);
  const paras = paragraphs(place.long || place.desc || '');
  const heName = place.he && place.he.trim() ? place.he.trim() : '';

  // ---------- Hero ----------
  const hero = `
    <header class="detail-hero" style="--c:${color}">
      <div class="detail-hero__media${images.length ? ' is-zoom' : ''}"${images.length ? ' data-img="0" role="button" tabindex="0" aria-label="הגדלת התמונה"' : ''}>
        ${thumb(images[0] || '', emoji, { color, cls: 'detail-hero__img' })}
      </div>
      <div class="detail-hero__scrim"></div>
      <div class="detail-hero__cap">
        ${c.he ? `<span class="detail-chip" style="--c:${color}"><span class="detail-chip__em">${esc(emoji)}</span>${esc(c.he)}</span>` : ''}
        <h1 class="detail-hero__title">${esc(place.name)}${heName ? ` <span class="lat">${esc(heName)}</span>` : ''}</h1>
      </div>
      <div class="detail-hero__actions" data-place-actions data-place-id="${esc(place.id || '')}"></div>
    </header>`;

  // ---------- Meta chips ----------
  const metaBits = [];
  if (place.day) metaBits.push(`<span class="chip detail-daychip">📅 יום ${esc(place.day)}</span>`);
  if (place.rating) metaBits.push(`<span class="chip detail-rating">⭐ ${esc(place.rating)}</span>`);
  if (place.badge) metaBits.push(`<span class="badge detail-badge" style="--c:${color}">${esc(place.badge)}</span>`);
  (place.tags || []).forEach((t) => { if (t) metaBits.push(`<span class="chip detail-tag">#${esc(t)}</span>`); });
  const meta = metaBits.length ? `<div class="detail-meta">${metaBits.join('')}</div>` : '';

  // ---------- Facts ----------
  const factRows = [];
  if (place.hours)   factRows.push(`<div class="fact"><span class="fact__ic">🕒</span><span class="fact__k">שעות</span><span class="fact__v">${esc(place.hours)}</span></div>`);
  if (place.price)   factRows.push(`<div class="fact"><span class="fact__ic">💰</span><span class="fact__k">מחיר</span><span class="fact__v">${esc(place.price)}</span></div>`);
  if (place.address) factRows.push(`<div class="fact"><span class="fact__ic">📍</span><span class="fact__k">כתובת</span><span class="fact__v">${esc(place.address)}</span></div>`);
  const facts = factRows.length ? `<section class="detail-facts card">${factRows.join('')}</section>` : '';

  // ---------- Actions ----------
  const linkBtns = (place.links || []).filter((l) => l && l.url).map((l) => {
    const ic = LINK_ICON[l.type] || '🔗';
    return `<a class="detail-btn" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="detail-btn__ic">${ic}</span>${esc(l.label || 'קישור')}</a>`;
  });
  linkBtns.push(`<a class="detail-btn detail-btn--maps" href="${esc(gmaps(place.name + ', ' + city))}" target="_blank" rel="noopener"><span class="detail-btn__ic">🗺️</span>פתח ב-Google Maps</a>`);
  const actions = `<section class="detail-actions">${linkBtns.join('')}</section>`;

  // ---------- Prose ----------
  const prose = paras.length
    ? `<section class="detail-prose">${paras.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`
    : '';

  // ---------- Tips ----------
  const tipsHtml = tips.length ? `
    <section class="detail-tips">
      <h2 class="detail-h2"><span class="em">💡</span> טיפים</h2>
      <ul class="detail-tip-list">
        ${tips.map((t) => `<li class="detail-tip">${esc(t)}</li>`).join('')}
      </ul>
    </section>` : '';

  // ---------- Gallery ----------
  const galleryHtml = gallery.length ? `
    <section class="detail-gallery">
      <h2 class="detail-h2"><span class="em">📸</span> גלריה</h2>
      <div class="detail-gallery__grid">
        ${gallery.map((src, i) => `
          <button type="button" class="detail-shot" data-img="${i + 1}" aria-label="הגדלת תמונה ${i + 2}">
            ${thumb(src, emoji, { color, cls: 'detail-shot__img' })}
          </button>`).join('')}
      </div>
    </section>` : '';

  // ---------- Mini-map ----------
  const mapHtml = (place.lat && place.lng) ? `
    <section class="detail-mapwrap">
      <h2 class="detail-h2"><span class="em">🗺️</span> מיקום</h2>
      <div id="place-map" class="detail-map" data-lat="${esc(place.lat)}" data-lng="${esc(place.lng)}"></div>
    </section>` : '';

  // ---------- Related (same category) ----------
  const related = (tour.places || [])
    .filter((p) => p.category === place.category && p.id !== place.id)
    .slice(0, 6);
  const relatedHtml = related.length ? `
    <section class="detail-related">
      <h2 class="detail-h2"><span class="em">${esc(c.emoji || '✨')}</span> עוד ב${esc(c.he || 'אותה קטגוריה')}</h2>
      <div class="detail-related__grid stagger">
        ${related.map((r) => {
          const rc = CATEGORIES[r.category] || {};
          const rColor = rc.color || color;
          return `
            <a class="rel-card" href="#/t/${tourId}/place/${encodeURIComponent(r.id)}" style="--c:${rColor}">
              ${thumb(imagesOf(r)[0] || '', r.emoji || rc.emoji, { color: rColor, cls: 'rel-card__img' })}
              <div class="rel-card__body">
                <div class="rel-card__name">${esc(r.name)}</div>
                ${r.desc ? `<div class="rel-card__desc">${esc(r.desc)}</div>` : ''}
              </div>
            </a>`;
        }).join('')}
      </div>
    </section>` : '';

  return `
    <div class="container detail">
      <a class="place-link detail-back" href="#/t/${tourId}/explore">‹ חזרה למה עושים</a>
      <div class="detail-grid">
        <div class="detail-media">
          ${hero}
          ${galleryHtml}
          ${mapHtml}
        </div>
        <div class="detail-content">
          ${meta}
          ${facts}
          ${actions}
          ${prose}
          ${tipsHtml}
        </div>
      </div>
      ${relatedHtml}
    </div>`;
}

export function mount({ tour, place }, root) {
  if (!place) return;
  const images = imagesOf(place);

  // ---------- Lightbox (fullscreen gallery) ----------
  if (images.length) {
    let idx = 0;
    let overlay = null;
    let keyHandler = null;
    let hashHandler = null;

    const paint = () => {
      if (!overlay) return;
      overlay.querySelector('.lightbox__img').src = images[idx];
      overlay.querySelector('.lightbox__count').textContent = `${idx + 1} / ${images.length}`;
    };
    const move = (delta) => { idx = (idx + delta + images.length) % images.length; paint(); };
    const close = () => {
      if (keyHandler) document.removeEventListener('keydown', keyHandler);
      if (hashHandler) window.removeEventListener('hashchange', hashHandler);
      keyHandler = hashHandler = null;
      document.body.classList.remove('lightbox-open');
      if (overlay) { overlay.remove(); overlay = null; }
    };
    const open = (i) => {
      close();
      idx = ((i % images.length) + images.length) % images.length;
      overlay = document.createElement('div');
      overlay.className = 'lightbox is-open';
      const multi = images.length > 1;
      overlay.innerHTML = `
        <button type="button" class="lightbox__close" aria-label="סגירה">×</button>
        <button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="הקודם" style="${multi ? '' : 'display:none'}">‹</button>
        <img class="lightbox__img" src="" alt="" referrerpolicy="no-referrer">
        <button type="button" class="lightbox__nav lightbox__nav--next" aria-label="הבא" style="${multi ? '' : 'display:none'}">›</button>
        <div class="lightbox__count"></div>`;
      document.body.appendChild(overlay);
      document.body.classList.add('lightbox-open');
      paint();

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.lightbox__close')) close();
      });
      overlay.querySelector('.lightbox__nav--prev').addEventListener('click', (e) => { e.stopPropagation(); move(-1); });
      overlay.querySelector('.lightbox__nav--next').addEventListener('click', (e) => { e.stopPropagation(); move(1); });

      keyHandler = (e) => {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight') move(-1); // RTL: ימין = הקודם
        else if (e.key === 'ArrowLeft') move(1);   // RTL: שמאל = הבא
      };
      hashHandler = () => close();
      document.addEventListener('keydown', keyHandler);
      window.addEventListener('hashchange', hashHandler);
    };

    root.querySelectorAll('[data-img]').forEach((el) => {
      const i = Number(el.dataset.img) || 0;
      el.addEventListener('click', () => open(i));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });
  }

  // ---------- Mini-map (Leaflet) ----------
  const mapEl = root.querySelector('#place-map');
  if (mapEl && place.lat && place.lng) {
    const L = window.L;
    if (!L) {
      mapEl.innerHTML = '<div class="detail-map__fallback">לא ניתן לטעון את המפה (אין חיבור לאינטרנט).</div>';
    } else {
      const c = CATEGORIES[place.category] || {};
      const color = c.color || 'var(--gold)';
      const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true })
        .setView([place.lat, place.lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap', maxZoom: 19,
      }).addTo(map);
      const html = `<div class="map-pin" style="background:${color}"><span>${esc(place.emoji || c.emoji || '📍')}</span></div>`;
      const icon = L.divIcon({ html, className: '', iconSize: [30, 30], iconAnchor: [15, 28], popupAnchor: [0, -28] });
      L.marker([place.lat, place.lng], { icon }).addTo(map)
        .bindPopup(`<div style="text-align:right;direction:rtl;font-weight:700">${esc(place.name)}</div>`);
      setTimeout(() => map.invalidateSize(), 60);
    }
  }
}
