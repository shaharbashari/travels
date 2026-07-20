// ============================================================================
//  router.js — ניתוב מבוסס hash (ללא תלויות)
//  #/                         → רשימת הטיולים
//  #/t/<id>                   → עמוד הבית של הטיול
//  #/t/<id>/<tab>             → tab ∈ home | days | explore | map | info
//  #/t/<id>/<tab>/<param>     → למשל days/2 או explore/restaurants
// ============================================================================

export const TABS = ['home', 'days', 'explore', 'map', 'info'];

export function getRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);

  if (parts.length === 0) return { name: 'trips' };

  if (parts[0] === 't' && parts[1]) {
    const tourId = parts[1];
    const seg = parts[2] || 'home';
    // עמוד פרטי מקום: #/t/<id>/place/<placeId>
    if (seg === 'place') return { name: 'tour', tourId, tab: 'place', param: parts[3] || null };
    let tab = TABS.includes(seg) ? seg : 'home';
    const param = parts[3] || null;
    return { name: 'tour', tourId, tab, param };
  }
  return { name: 'trips' };
}

export function navigate(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

let _render = () => {};
export function onRouteChange(fn) {
  _render = fn;
  window.addEventListener('hashchange', fn);
  window.addEventListener('DOMContentLoaded', fn);
}
export function render() { _render(); }
