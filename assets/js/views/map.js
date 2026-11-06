// ============================================================================
//  views/map.js — מפת היעד אינטראקטיבית (Leaflet + OpenStreetMap)
// ============================================================================
import { esc, CATEGORIES } from '../util.js';

const gmaps = (name, city) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, city].filter(Boolean).join(', '))}`;

/** אוסף כל הנקודות עם קואורדינטות (המלון + מקומות). */
function points(tour) {
  const pts = [];
  if (tour.hotel?.lat && tour.hotel?.lng) {
    pts.push({ name: tour.hotel.name, lat: tour.hotel.lat, lng: tour.hotel.lng, emoji: '🏨',
      color: 'var(--gold-deep)', catLabel: 'מלון', desc: tour.hotel.address, hotel: true });
  }
  (tour.places || []).forEach((p) => {
    if (p.lat && p.lng) {
      const c = CATEGORIES[p.category] || {};
      pts.push({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, emoji: p.emoji || c.emoji,
        color: c.color, catLabel: c.he, desc: p.desc, img: p.img });
    }
  });
  return pts;
}

export function render({ tour }) {
  const pts = points(tour);
  return `
    <h2 class="section-title"><span class="em">🗺️</span> מפת ${esc(tour.destination?.city || '')}</h2>
    <p class="section-sub">המלון וכל התחנות במסלול — לחצו על סיכה או על שם ברשימה</p>
    <div id="map" data-tour="${esc(tour.id)}"></div>
    <div class="stop-list stagger">
      ${pts.map((p, i) => `
        <button class="stop-row" data-i="${i}" data-lat="${p.lat}" data-lng="${p.lng}">
          <span class="num" style="background:${p.color}">${p.hotel ? '🏨' : i}</span>
          <span class="info"><b>${esc(p.name)}</b><small>${esc(p.catLabel || '')}${p.desc ? ' · ' + esc(p.desc) : ''}</small></span>
          <span style="color:var(--ink-faint)">‹</span>
        </button>`).join('')}
    </div>`;
}

export function mount({ tour }, root) {
  const el = root.querySelector('#map');
  const L = window.L;
  if (!el) return;
  if (!L) { el.innerHTML = '<div style="padding:24px;text-align:center;color:var(--ink-soft)">לא ניתן לטעון את המפה (אין חיבור לאינטרנט).</div>'; return; }

  const pts = points(tour);
  const map = L.map(el, { scrollWheelZoom: false, zoomControl: true })
    .setView([tour.destination?.lat ?? tour.hotel?.lat ?? 47.4979,
      tour.destination?.lng ?? tour.hotel?.lng ?? 19.0402], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap', maxZoom: 19,
  }).addTo(map);

  const markers = [];
  const bounds = [];
  pts.forEach((p, i) => {
    const html = `<div class="map-pin" style="background:${p.color}"><span>${p.hotel ? '🏨' : i}</span></div>`;
    const icon = L.divIcon({ html, className: '', iconSize: [30, 30], iconAnchor: [15, 28], popupAnchor: [0, -28] });
    const m = L.marker([p.lat, p.lng], { icon }).addTo(map);
    m.bindPopup(`<div style="text-align:right;direction:rtl;min-width:170px">
        ${p.img ? `<img src="${esc(p.img)}" alt="" referrerpolicy="no-referrer" style="width:100%;height:96px;object-fit:cover;border-radius:12px;margin-bottom:8px" onerror="this.remove()">` : ''}
        <strong>${esc(p.name)}</strong><br>
        <span style="color:#6c6156;font-size:.85em">${esc(p.catLabel || '')}</span>
        ${p.desc ? `<br><span style="font-size:.85em">${esc(p.desc)}</span>` : ''}
        ${p.id ? `<br><a href="#/t/${encodeURIComponent(tour.id)}/place/${encodeURIComponent(p.id)}">פרטים ›</a>` : ''}
        <br><a href="${esc(gmaps(p.name, tour.destination?.city))}" target="_blank" rel="noopener">פתח במפות ›</a>
      </div>`);
    markers.push(m);
    bounds.push([p.lat, p.lng]);
  });

  if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
  setTimeout(() => map.invalidateSize(), 60);

  root.querySelectorAll('.stop-row').forEach((row) => {
    row.addEventListener('click', () => {
      const i = Number(row.dataset.i);
      const lat = Number(row.dataset.lat), lng = Number(row.dataset.lng);
      map.flyTo([lat, lng], 16, { duration: 0.6 });
      markers[i]?.openPopup();
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}
