// ============================================================================
//  app.js — נקודת הכניסה: טוען נתונים, בונה מסגרת (topbar + tabs) ומרנדר מסך.
// ============================================================================
import config from '../../data/config.js';
import tours from '../../data/tours/index.js';
import { getRoute, onRouteChange, TABS } from './router.js';
import { esc, fmtRange, tourStatus } from './util.js';

import * as trips from './views/trips.js';
import * as home from './views/home.js';
import * as days from './views/days.js';
import * as explore from './views/explore.js';
import * as mapView from './views/map.js';
import * as info from './views/info.js';

const VIEWS = { home, days, explore, map: mapView, info };

const TAB_META = {
  home: { ico: '🏠', label: 'בית' },
  days: { ico: '🗓️', label: 'מסלול' },
  explore: { ico: '🧭', label: 'מה עושים' },
  map: { ico: '🗺️', label: 'מפה' },
  info: { ico: '🎒', label: 'מידע' },
};

const app = document.getElementById('app');
const sortedTours = () => [...tours].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

function topbarTrips() {
  return `
    <header class="topbar">
      <div class="topbar__brand"><span class="torii">🧳</span>${esc(config.siteTitle)}</div>
      <div class="topbar__spacer"></div>
    </header>`;
}

function topbarTour(tour) {
  return `
    <header class="topbar">
      <a class="topbar__back" href="#/">‹ הטיולים</a>
      <div class="topbar__spacer"></div>
      <div class="topbar__brand" style="font-size:1.05rem">
        <span class="flag">${esc(tour.destination?.flag || '📍')}</span>${esc(tour.title)}
      </div>
      <div class="topbar__spacer"></div>
      <div class="topbar__date">${esc(fmtRange(tour.dates?.start, tour.dates?.end))}</div>
    </header>`;
}

function tabbar(tour, activeTab) {
  return `<nav class="tabbar" aria-label="ניווט">` + TABS.map((tab) => {
    const m = TAB_META[tab];
    const active = tab === activeTab ? ' is-active' : '';
    return `<a class="tab${active}" href="#/t/${encodeURIComponent(tour.id)}/${tab}"${tab === activeTab ? ' aria-current="page"' : ''}>
      <span class="ico">${m.ico}</span><span>${m.label}</span></a>`;
  }).join('') + `</nav>`;
}

function renderTrips() {
  const ctx = { tours: sortedTours(), config };
  app.innerHTML = topbarTrips() + `<main class="container">${trips.render(ctx)}</main>`;
  trips.mount?.(ctx, app);
  window.scrollTo(0, 0);
}

function renderTour(route) {
  const tour = tours.find((t) => t.id === route.tourId);
  if (!tour) { location.hash = '#/'; return; }
  const status = tourStatus(tour);
  const ctx = { tour, tours: sortedTours(), config, route, status };
  const view = VIEWS[route.tab] || home;

  app.innerHTML =
    topbarTour(tour) +
    tabbar(tour, route.tab) +
    `<main class="container"><div class="screen">${view.render(ctx)}</div></main>`;

  view.mount?.(ctx, app);
  window.scrollTo(0, 0);
}

function route() {
  const r = getRoute();
  document.title = r.name === 'tour'
    ? `${tours.find((t) => t.id === r.tourId)?.title || ''} · ${config.siteTitle}`
    : config.siteTitle;
  if (r.name === 'trips') renderTrips();
  else renderTour(r);
}

onRouteChange(route);
route();
