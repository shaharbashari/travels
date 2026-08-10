// ============================================================================
//  views/days.js — מסלול יומי כציר זמן
//  · תצוגה לקוראים: קיבוץ לפי חלק היום, שעות, נקודות, קישורי מקומות, תמונות.
//  · מקטעי נסיעה (item.travel) בין פעילויות עוקבות.
//  · לעורכים: גרירה לשינוי סדר / שעה / יום (Pointer Events), והוספה/עריכה/מחיקה.
//  render(ctx) מחזיר מחרוזת HTML; mount(ctx, root) מחבר מאזינים. אין גישה ל-DOM בזמן import.
// ============================================================================
import { esc, fmtWeekday, fmtDateShort, thumb, PERIODS } from '../util.js';
import * as store from '../store.js';
import * as edit from '../edit.js';
import * as travel from '../travel.js';

// ---- מקטע נסיעה (איך מגיעים לפעילות הזו מהקודמת) --------------------------
//  הזמן נגזר אוטומטית מהגיאוגרפיה ומאמצעי ההגעה (travel.legFor), ולכן מתעדכן
//  לבד אחרי שינוי סדר / מעבר יום / החלפת אמצעי — בלי התערבות. ראו assets/js/travel.js.
function travelLeg(tour, dayItems, flatIndex, placesMap, canEdit) {
  // הפעילות הראשונה ביום אין אליה "נסיעה נכנסת".
  if (flatIndex <= 0) return '';
  const leg = travel.legFor(tour, dayItems, flatIndex, placesMap);

  // אין מקטע להצגה: לעורכים — כפתור "הוסף נסיעה"; לקוראים — כלום.
  if (!leg) {
    if (!canEdit) return '';
    return `
      <div class="tl-travel tl-travel--add" data-act="add-travel" data-i="${flatIndex}" role="button" tabindex="0" title="הוספת נסיעה">
        <div class="tl-travel__rail"><span class="tl-travel__pip tl-travel__pip--add">＋</span></div>
        <div class="tl-travel__main"><span class="tl-travel__chip tl-travel__chip--add">➕ הוסף נסיעה</span></div>
      </div>`;
  }

  const cls = ['tl-travel'];
  if (canEdit) cls.push('is-editable');
  if (leg.suggested) cls.push('is-suggested'); // מקטע מוצע אוטומטית, עוד לא נשמר
  const editable = canEdit
    ? ` data-act="edit-travel" data-i="${flatIndex}" role="button" tabindex="0" title="${leg.suggested ? 'הוספת הנסיעה המוצעת' : 'עריכת נסיעה'}"`
    : '';

  // תווית הבסיס בלי המשך — נוסיף אותו כאלמנט נפרד כדי לסמן שהוא מחושב אוטומטית.
  const label = travel.legLabel({ ...leg, text: '' });
  // משך: מחושב → "≈ 15 דק׳" עם רמז שהוא אוטומטי; ידני (computed=false) → כפי שהוזן, בלי ≈.
  const dur = leg.text
    ? `<span class="tl-travel__dur${leg.computed ? ' is-est' : ''}"${leg.computed ? ' title="זמן משוער — מחושב אוטומטית לפי המרחק ואמצעי ההגעה"' : ''}>`
      + `${leg.computed ? '≈ ' : ''}${esc(leg.text)}</span>`
    : '';
  const dist = leg.distanceM != null
    ? `<span class="tl-travel__dist">${esc(travel.formatDistance(leg.distanceM))}</span>`
    : '';

  return `
    <div class="${cls.join(' ')}"${editable}>
      <div class="tl-travel__rail"><span class="tl-travel__pip">${esc(leg.emoji)}</span></div>
      <div class="tl-travel__main">
        <span class="tl-travel__chip"><span class="tl-travel__label">${esc(label)}${dur ? ` · ${dur}` : ''}</span></span>
        ${dist}
        ${leg.note ? `<span class="tl-travel__note">${esc(leg.note)}</span>` : ''}
      </div>
    </div>`;
}

function timelineItem(tour, entry, isLastInGroup, places, canEdit) {
  const { item, i } = entry;
  const place = item.place ? places.get(item.place) : null;
  const placeLink = item.place
    ? (place
        ? `<a class="place-link" href="#/t/${encodeURIComponent(tour.id)}/place/${encodeURIComponent(place.id)}">📍 ${esc(item.place)} ›</a>`
        : `<span class="place-link" style="color:var(--ink-soft)">📍 ${esc(item.place)}</span>`)
    : '';
  const period = item.period || '';
  const ops = canEdit
    ? `<div class="tl-card__ops">
        <button type="button" class="tl-op" data-act="edit-item" data-i="${i}" title="עריכת פעילות" aria-label="עריכת פעילות">✏️</button>
        <button type="button" class="tl-op tl-op--danger" data-act="del-item" data-i="${i}" title="מחיקת פעילות" aria-label="מחיקת פעילות">🗑️</button>
      </div>`
    : '';
  const handle = canEdit
    ? `<button type="button" class="tl-handle" data-act="drag" title="גררו לשינוי סדר / שעה / יום" aria-label="גרירה">⠿</button>`
    : '';
  return `
    <div class="tl-item" data-i="${i}" data-period="${esc(period)}">
      <div class="tl-rail">
        <div class="tl-time">${esc(item.time || '')}</div>
        <div class="tl-dot">${esc(item.emoji || '•')}</div>
        ${isLastInGroup ? '' : '<div class="tl-line"></div>'}
      </div>
      <div class="tl-card">
        ${handle}
        <div class="tl-card__body">
          <div class="tl-card__title">${esc(item.title)}</div>
          ${item.desc ? `<div class="tl-card__desc">${esc(item.desc)}</div>` : ''}
          ${placeLink ? `<div class="tl-card__place">${placeLink}</div>` : ''}
        </div>
        ${item.img || (place && place.img) ? thumb(item.img || place.img, item.emoji, { color: 'var(--gold)' }) : ''}
        ${ops}
      </div>
    </div>`;
}

// מבנה קיבוץ לפי חלק-היום, תוך שמירה על אינדקס שטוח (מיקום במערך day.items).
function buildGroups(day, canEdit) {
  const entries = (day.items || []).map((item, i) => ({ item, i }));
  const map = new Map();
  entries.forEach((e) => {
    const p = e.item.period || '';
    if (!map.has(p)) map.set(p, []);
    map.get(p).push(e);
  });
  // חלקי-יום לא-סטנדרטיים (כולל "ללא חלק יום" = '') בסדר הופעתם.
  const extras = [...map.keys()].filter((p) => !PERIODS.includes(p));
  // קוראים: סדר הופעה כמו במקור. עורכים: כל חלקי-היום הסטנדרטיים (גם ריקים,
  // כיעד גרירה/הוספה) בסדר הקנוני, ואחריהם החריגים.
  const order = canEdit
    ? [...PERIODS, ...extras]
    : [...map.keys()];
  return { entries, map, order };
}

function timeline(tour, day, canEdit, placesMap) {
  const places = placesMap;
  const { entries, map, order } = buildGroups(day, canEdit);

  return order.map((period) => {
    const groupEntries = map.get(period) || [];
    // מיקום ה"הוספה בסוף חלק-היום" כאינדקס שטוח.
    const at = groupEntries.length
      ? groupEntries[groupEntries.length - 1].i + 1
      : entries.length;
    const rows = groupEntries.map((e, k) =>
      travelLeg(tour, day.items, e.i, placesMap, canEdit) + timelineItem(tour, e, k === groupEntries.length - 1, places, canEdit),
    ).join('');
    const empty = (!groupEntries.length && canEdit)
      ? `<div class="tl-empty">גררו לכאן לשיבוץ ב${esc(period || 'חלק היום')}</div>`
      : '';
    const addBtn = canEdit
      ? `<div class="tl-group__add">
          <button type="button" class="tl-add" data-act="add-item" data-period="${esc(period)}" data-i="${at}">➕ פעילות</button>
        </div>`
      : '';
    return `
      <div class="tl-group" data-period="${esc(period)}">
        ${period ? `<div class="tl-period">${esc(period)}</div>` : ''}
        <div class="timeline">
          ${rows}${empty}
        </div>
        ${addBtn}
      </div>`;
  }).join('');
}

function dayPicker(tour, current) {
  return `<div class="daypicker">${tour.days.map((d) => `
    <a class="daypick ${d.index === current ? 'is-active' : ''}" data-day="${d.index}" href="#/t/${encodeURIComponent(tour.id)}/days/${d.index}">
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

export function render({ tour, route, canEdit }) {
  const idx = Number(route.param) || tour.days[0].index;
  const day = tour.days.find((d) => d.index === idx) || tour.days[0];
  const editable = !!canEdit;
  // מפת מקומות (name → place) — נבנית פעם אחת לכל render, לחישוב מרחקים וקישורי מקום.
  const placesMap = travel.placesByName(tour);

  const meta = [
    ...(day.transport || []).map((tr) => `<span class="chip">${transportEmoji(tr)} ${esc(tr)}</span>`),
    day.lodging ? `<span class="chip">🛏️ ${esc(day.lodging)}</span>` : '',
  ].join('');

  return `
    <div class="day-layout${editable ? ' is-editable' : ''}">
      ${dayPicker(tour, day.index)}
      <div class="day-main">
        <div class="day-head">
          <div class="day-head__k">${esc(fmtWeekday(day.date))} · ${esc(fmtDateShort(day.date))}</div>
          <div class="day-head__title">${esc(day.title)}</div>
          ${day.subtitle ? `<div class="day-head__sub">${esc(day.subtitle)}</div>` : ''}
          <div class="day-head__meta">${meta}</div>
          ${editable ? `<button type="button" class="day-head__edit" data-act="edit-day" title="עריכת היום" aria-label="עריכת היום">✏️</button>` : ''}
        </div>
        ${editable ? `<div class="day-hint">✋ החזיקו וגררו כדי לשנות סדר, שעה או יום</div>` : ''}
        ${timeline(tour, day, editable, placesMap)}
      </div>
    </div>`;
}

// ============================================================================
//  mount — מאזינים (עריכה + גרירה). הכול נבנה מחדש בכל render, לכן אין ניקוי ידני
//  של מאזינים שמחוברים לאלמנטים בתוך #app; מאזיני document בזמן גרירה הם זמניים.
// ============================================================================
export function mount(ctx, root) {
  const { tour, route } = ctx;
  const canEdit = !!ctx.canEdit;
  if (!tour || !tour.days || !tour.days.length) return;
  const idx = Number(route.param) || tour.days[0].index;
  const day = tour.days.find((d) => Number(d.index) === idx) || tour.days[0];
  const dayIndex = day.index;
  const tourId = tour.id;

  const layout = root.querySelector('.day-layout');
  if (!layout) return;

  // ---- קליקים מוזרמים (עריכה/הוספה/מחיקה/נסיעה/עריכת יום) ------------------
  function handleAct(act, el) {
    const raw = el.dataset.i;
    const i = (raw != null && raw !== '') ? Number(raw) : null;
    const period = el.dataset.period != null ? el.dataset.period : '';
    switch (act) {
      case 'edit-item': edit.openDayItemEditor?.({ tourId, dayIndex, itemIndex: i }); break;
      case 'add-item': edit.openDayItemEditor?.({ tourId, dayIndex, itemIndex: null, period, at: i }); break;
      case 'del-item':
        if (i != null && window.confirm('למחוק את הפעילות מהמסלול?')) {
          Promise.resolve(store.removeDayItem(tourId, dayIndex, i)).catch(() => {});
        }
        break;
      case 'edit-day': edit.openDayEditor?.({ tourId, dayIndex }); break;
      case 'edit-travel':
      case 'add-travel': edit.openTravelEditor?.({ tourId, dayIndex, itemIndex: i }); break;
      default: break;
    }
  }
  layout.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || !layout.contains(el)) return;
    if (el.dataset.act === 'drag') return; // ידית הגרירה — מטופלת ב-pointer
    handleAct(el.dataset.act, el);
  });
  layout.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest('.tl-travel[data-act]');
    if (!el) return;
    e.preventDefault();
    handleAct(el.dataset.act, el);
  });

  if (!canEdit) return; // קוראים: ציר זמן רגיל, ללא גרירה.

  // ==========================================================================
  //  גרירה ושחרור (Pointer Events) — עכבר ומגע.
  //  · לחיצה ארוכה (~250ms) על כרטיס, או גרירה מיידית מהידית ⠿.
  //  · תזוזה אנכית >10px לפני שהגרירה החלה = המשתמש רוצה לגלול → ביטול.
  //  · preventDefault/pointer-capture רק אחרי שהגרירה החלה בפועל.
  // ==========================================================================
  let hold = null;   // שלב ההחזקה/גרירה: { id, item, x0,y0, x,y, onHandle, fromItem, fromPeriod, timer }
  let drag = null;   // === hold ברגע שהגרירה פעילה (מוסיף grab/מידות)
  let source = null; // ה-.tl-item הנגרר
  let clone = null;  // עותק צף שעוקב אחרי המצביע
  let indicator = null; // קו חיווי נקודת השחרור
  let curGroup = null, curChip = null;

  const HOLD_MS = 250;
  const SCROLL_CANCEL = 10;

  function onPointerDown(e) {
    if (hold || drag) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const item = e.target.closest('.tl-item');
    if (!item || !layout.contains(item)) return;
    const onHandle = !!e.target.closest('.tl-handle');
    // קליקים על קישורים/כפתורים/מקטע-נסיעה — פעולה רגילה, לא גרירה.
    if (!onHandle && e.target.closest('a, button, .tl-travel')) return;
    hold = {
      id: e.pointerId, item,
      x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY,
      onHandle, fromItem: Number(item.dataset.i), fromPeriod: item.dataset.period || '',
      timer: null,
    };
    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerCancel);
    // חוסמים סימון טקסט כבר מרגע ההחזקה — אחרת הגרירה "צובעת" את המסך.
    document.addEventListener('selectstart', blockSelect, true);
    if (onHandle) startDrag();
    else hold.timer = setTimeout(() => { if (hold && !drag) startDrag(); }, HOLD_MS);
  }

  function blockSelect(e) { e.preventDefault(); }

  function onPointerMove(e) {
    if (!hold || e.pointerId !== hold.id) return;
    hold.x = e.clientX; hold.y = e.clientY;
    if (!drag) {
      // עדיין מחזיקים — לא חוסמים גלילה; תזוזה אנכית = כוונה לגלול → ביטול.
      if (Math.abs(e.clientY - hold.y0) > SCROLL_CANCEL) cleanup();
      return;
    }
    e.preventDefault(); // מכאן הגרירה שלנו
    moveClone();
    updateTarget();
  }

  function startDrag() {
    if (!hold) return;
    clearTimeout(hold.timer);
    drag = hold;
    source = drag.item;
    try { source.setPointerCapture(drag.id); } catch {}
    const card = source.querySelector('.tl-card');
    const r = card.getBoundingClientRect();
    drag.grabDX = drag.x - r.left;
    drag.grabDY = drag.y - r.top;
    clone = card.cloneNode(true);
    clone.classList.add('is-dragging');
    clone.style.width = r.width + 'px';
    clone.style.pointerEvents = 'none';
    document.body.appendChild(clone);
    source.classList.add('is-source');
    indicator = document.createElement('div');
    indicator.className = 'tl-drop-line';
    document.body.appendChild(indicator);
    layout.classList.add('is-reordering');
    document.body.classList.add('tl-no-select');
    // ההחזקה לפני תחילת הגרירה עלולה לסמן טקסט — מנקים את הסימון.
    try { window.getSelection()?.removeAllRanges(); } catch {}
    document.addEventListener('keydown', onKeyDown, true);
    moveClone();
    updateTarget();
  }

  function moveClone() {
    if (!clone) return;
    clone.style.left = (drag.x - drag.grabDX) + 'px';
    clone.style.top = (drag.y - drag.grabDY) + 'px';
  }

  // מוצא את יעד השחרור: צ'יפ יום אחר (daypicker) או קבוצת חלק-יום בציר.
  function pickTarget(x, y) {
    const under = document.elementFromPoint(x, y);
    if (!under) return null;
    const dp = under.closest && under.closest('.daypicker');
    if (dp) {
      const chip = under.closest('.daypick');
      if (chip && chip.dataset.day != null && Number(chip.dataset.day) !== Number(dayIndex)) {
        return { kind: 'day', day: Number(chip.dataset.day), chip };
      }
      return null; // מעל היום הנוכחי / רווח בין צ'יפים — אין יעד
    }
    const groups = [...layout.querySelectorAll('.tl-group')];
    if (!groups.length) return null;
    let group = groups.find((g) => {
      const r = g.getBoundingClientRect();
      return y >= r.top && y <= r.bottom;
    });
    if (!group) {
      group = (y < groups[0].getBoundingClientRect().top) ? groups[0] : groups[groups.length - 1];
    }
    return { kind: 'slot', group, period: group.dataset.period || '', ...computeSlot(group, y) };
  }

  // חישוב מיקום ההכנסה בתוך קבוצה, והאינדקס השטוח (במערך items הנוכחי, לפני ההסרה).
  function computeSlot(group, y) {
    const cards = [...group.querySelectorAll('.tl-item')].filter((el) => el !== source);
    let k = cards.length;
    for (let idx = 0; idx < cards.length; idx++) {
      const r = cards[idx].getBoundingClientRect();
      if (y < r.top + r.height / 2) { k = idx; break; }
    }
    let rawInsert;
    if (cards.length === 0) rawInsert = (day.items || []).length; // חלק-יום ריק → לסוף המערך
    else if (k < cards.length) rawInsert = Number(cards[k].dataset.i);
    else rawInsert = Number(cards[cards.length - 1].dataset.i) + 1;
    return { cards, k, rawInsert };
  }

  function updateTarget() {
    const t = pickTarget(drag.x, drag.y);
    if (curGroup && (!t || t.group !== curGroup)) curGroup.classList.remove('is-drop-target');
    if (curChip && (!t || t.chip !== curChip)) curChip.classList.remove('is-drop-target');
    curGroup = curChip = null;
    drag.target = t || null;
    if (!t) { hideIndicator(); return; }
    if (t.kind === 'day') { t.chip.classList.add('is-drop-target'); curChip = t.chip; hideIndicator(); return; }
    t.group.classList.add('is-drop-target'); curGroup = t.group;
    showIndicator(t);
  }

  function showIndicator(t) {
    if (!indicator) return;
    let top, left, width;
    if (t.cards.length === 0) {
      const gr = (t.group.querySelector('.timeline') || t.group).getBoundingClientRect();
      top = gr.top + 8; left = gr.left + 4; width = Math.max(120, gr.width - 8);
    } else if (t.k < t.cards.length) {
      const r = t.cards[t.k].querySelector('.tl-card').getBoundingClientRect();
      top = r.top - 7; left = r.left; width = r.width;
    } else {
      const r = t.cards[t.cards.length - 1].querySelector('.tl-card').getBoundingClientRect();
      top = r.bottom - 5; left = r.left; width = r.width;
    }
    indicator.style.left = left + 'px';
    indicator.style.top = top + 'px';
    indicator.style.width = width + 'px';
    indicator.style.display = 'block';
  }

  function hideIndicator() { if (indicator) indicator.style.display = 'none'; }

  function onPointerUp(e) {
    if (!hold || e.pointerId !== hold.id) return;
    const wasDragging = !!drag;
    const target = drag && drag.target;
    const fromItem = hold.fromItem;
    const fromPeriod = hold.fromPeriod;
    cleanup();
    if (!wasDragging) return;      // לחיצה/החזקה בלבד — לא קרה כלום
    suppressNextClick();           // בולם את הקליק הסינתטי שאחרי הגרירה
    if (target) performDrop(target, fromItem, fromPeriod);
  }

  function onPointerCancel(e) {
    if (!hold || e.pointerId !== hold.id) return;
    cleanup();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape' && drag) { e.preventDefault(); e.stopPropagation(); cleanup(); }
  }

  function performDrop(t, fromItem, fromPeriod) {
    if (t.kind === 'day') {
      // העברה ליום אחר: מוסיפים לסוף היום, שומרים על חלק-היום.
      Promise.resolve(store.moveDayItem(tourId, dayIndex, fromItem, t.day, null, { period: fromPeriod }))
        .catch(() => {});
      return;
    }
    // שחרור בתוך אותו יום. moveDayItem מסיר את הפריט לפני ההכנסה, ובאותו יום
    // מדובר באותו מערך — לכן אם נקודת ההכנסה (rawInsert) גדולה מהמקור, כל מה
    // שאחרי המקור "יזוז" שמאלה ב-1 אחרי ההסרה, ולכן מפחיתים 1 מהאינדקס.
    const rawInsert = t.rawInsert;
    const toIndex = rawInsert > fromItem ? rawInsert - 1 : rawInsert;
    const newPeriod = t.period || '';
    if (newPeriod === (fromPeriod || '') && toIndex === fromItem) return; // ללא שינוי
    Promise.resolve(store.moveDayItem(tourId, dayIndex, fromItem, dayIndex, toIndex, { period: newPeriod }))
      .catch(() => {});
  }

  function suppressNextClick() {
    const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    document.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => document.removeEventListener('click', swallow, { capture: true }), 350);
  }

  function cleanup() {
    if (hold && hold.timer) clearTimeout(hold.timer);
    document.removeEventListener('pointermove', onPointerMove, { passive: false });
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerCancel);
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('selectstart', blockSelect, true);
    if (drag && source) { try { source.releasePointerCapture(drag.id); } catch {} }
    if (clone) { clone.remove(); clone = null; }
    if (indicator) { indicator.remove(); indicator = null; }
    if (curGroup) curGroup.classList.remove('is-drop-target');
    if (curChip) curChip.classList.remove('is-drop-target');
    curGroup = curChip = null;
    if (source) source.classList.remove('is-source');
    layout.classList.remove('is-reordering');
    document.body.classList.remove('tl-no-select');
    hold = null; drag = null; source = null;
  }

  layout.addEventListener('pointerdown', onPointerDown);
}
