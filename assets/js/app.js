// ============================================================================
//  app.js — נקודת הכניסה: טוען נתונים (store), מנהל התחברות (auth),
//  בונה מסגרת (topbar + tabs), מרנדר מסך, ומחבר את שכבת העריכה (edit).
// ============================================================================
import config from '../../data/config.js';
import * as store from './store.js';
import * as auth from './auth.js';
import * as edit from './edit.js';
import { getRoute, onRouteChange, TABS } from './router.js';
import { esc, fmtRange, tourStatus } from './util.js';

import * as trips from './views/trips.js';
import * as home from './views/home.js';
import * as days from './views/days.js';
import * as explore from './views/explore.js';
import * as mapView from './views/map.js';
import * as info from './views/info.js';
import * as place from './views/place.js';

const VIEWS = { home, days, explore, map: mapView, info, place };

const TAB_META = {
  home: { ico: '🏠', label: 'בית' },
  days: { ico: '🗓️', label: 'מסלול' },
  explore: { ico: '🧭', label: 'מה עושים' },
  map: { ico: '🗺️', label: 'מפה' },
  info: { ico: '🎒', label: 'מידע' },
};

const app = document.getElementById('app');

// ---- אימות / בקרת עריכה בכותרת -----------------------------------------
function authControl() {
  const st = auth.state();
  if (st.canEdit) {
    const label = st.user ? (st.user.name || st.user.email) : 'מצב עריכה';
    const pic = st.user?.photo
      ? `<img class="pic" src="${esc(st.user.photo)}" alt="" referrerpolicy="no-referrer">`
      : `<span class="pic">✏️</span>`;
    return `<button class="authbtn is-editor" data-auth="out" title="יציאה ממצב עריכה">${pic}<span class="lbl">${esc(label)}</span></button>`;
  }
  const label = st.configured ? 'התחברות' : 'עריכה';
  const title = st.configured ? 'התחברות עם Google לעריכה' : 'מצב עריכה מקומי (נשמר בדפדפן)';
  return `<button class="authbtn" data-auth="in" title="${esc(title)}">🔑 <span class="lbl">${label}</span></button>`;
}

function wireChrome() {
  app.querySelectorAll('[data-auth]').forEach((b) => {
    b.addEventListener('click', () => (b.dataset.auth === 'in' ? auth.signIn() : auth.signOut()));
  });
}

// ---- כותרות ------------------------------------------------------------
function topbarTrips() {
  return `
    <header class="topbar">
      <div class="topbar__brand"><span class="torii">🧳</span>${esc(config.siteTitle)}</div>
      <div class="topbar__spacer"></div>
      ${authControl()}
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
      ${authControl()}
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

// ---- רינדור ------------------------------------------------------------
let _lastRouteKey = null;
function keepScroll(key) {
  // גלילה לראש הדף רק כשמסך משתנה — לא אחרי שמירה/עדכון חי (למשל גרירת פעילות)
  const changed = key !== _lastRouteKey;
  _lastRouteKey = key;
  if (changed) window.scrollTo(0, 0);
}

function renderTrips() {
  const ctx = { tours: store.getTours(), config, canEdit: auth.canEdit() };
  app.innerHTML = topbarTrips() + `<main class="container">${trips.render(ctx)}</main>`;
  trips.mount?.(ctx, app);
  wireChrome();
  edit.refresh?.({ route: { name: 'trips' }, canEdit: auth.canEdit() });
  keepScroll('trips');
}

function renderTour(route) {
  const tour = store.getTour(route.tourId);
  if (!tour) { location.hash = '#/'; return; }
  const status = tourStatus(tour);
  const ctx = { tour, tours: store.getTours(), config, route, status, canEdit: auth.canEdit() };

  let view = VIEWS[route.tab] || home;
  let activeTab = route.tab;
  if (route.tab === 'place') {
    const p = store.getPlace(tour.id, route.param);
    if (!p) { location.hash = `#/t/${encodeURIComponent(tour.id)}/explore`; return; }
    ctx.place = p;
    view = VIEWS.place;
    activeTab = 'explore';
  }

  app.innerHTML =
    topbarTour(tour) +
    tabbar(tour, activeTab) +
    `<main class="container"><div class="screen">${view.render(ctx)}</div></main>`;

  view.mount?.(ctx, app);
  wireChrome();
  edit.refresh?.({ route, tour, place: ctx.place, canEdit: auth.canEdit() });
  keepScroll(`${route.tourId}/${route.tab}/${route.param || ''}`);
}

function route() {
  const r = getRoute();
  document.title = r.name === 'tour'
    ? `${store.getTour(r.tourId)?.title || ''} · ${config.siteTitle}`
    : config.siteTitle;
  if (r.name === 'trips') renderTrips();
  else renderTour(r);
}

// ---- אתחול -------------------------------------------------------------
app.innerHTML = `<div class="container"><div class="screen" style="text-align:center;padding:64px 0;color:var(--ink-soft)">טוען…</div></div>`;

async function boot() {
  try { await store.loadAll(); } catch (e) { console.warn('store.loadAll', e); }
  try { await auth.initAuth(); } catch (e) { console.warn('auth.initAuth', e); }
  try { edit.init?.(app); } catch (e) { console.warn('edit.init', e); }
  onRouteChange(route);
  store.onChange(() => route());
  auth.onAuthChange(() => route());
  route();
}
boot();
