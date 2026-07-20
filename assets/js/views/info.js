// ============================================================================
//  views/info.js — מידע: טיסות, מלון, מזג אוויר, אריזה, תחבורה, שיחון
// ============================================================================
import { esc, fmtDate, fmtWeekday } from '../util.js';

function flightCard(f) {
  return `
    <div class="flight-card">
      <div class="flight-card__top"><span>${esc(f.label)}</span><span>${esc(f.airline)} · ${esc(f.flightNo)}</span></div>
      <div class="flight-card__body">
        <div class="flight-end"><div class="code">${esc(f.from.code)}</div><div class="city">${esc(f.from.city)}</div></div>
        <div class="flight-mid">
          <span class="plane">✈️</span>
          <div class="line"></div>
          <div class="dur">${esc(f.depart)}${f.arrive ? ' – ' + esc(f.arrive) : ''}</div>
        </div>
        <div class="flight-end"><div class="code">${esc(f.to.code)}</div><div class="city">${esc(f.to.city)}</div></div>
      </div>
      <div class="flight-card__foot"><span>${esc(fmtWeekday(f.date))} · ${esc(fmtDate(f.date))}</span><span>${esc(f.note || '')}</span></div>
    </div>`;
}

function section(title, em, inner) {
  return `<h2 class="section-title"><span class="em">${em}</span> ${esc(title)}</h2>${inner}`;
}

export function render({ tour }) {
  const flights = tour.flights || [];
  const packing = tour.packing || [];
  const transport = tour.transport || [];

  return `
    ${section('טיסות', '✈️', `
      <div class="quickgrid stagger" style="grid-template-columns:1fr">
        ${flights.map(flightCard).join('')}
      </div>
      ${tour.transfer ? `<div class="info-card" style="margin-top:14px">
        <div class="info-card__head"><span class="em">🚕</span><h3>העברה משדה התעופה</h3></div>
        <div class="kv"><span class="k">חברה</span><span class="v" style="direction:ltr">${esc(tour.transfer.name)}</span></div>
        <p class="section-sub" style="margin:10px 0 0">${esc(tour.transfer.note)}</p>
      </div>` : ''}
    `)}

    ${section('מקום לינה', '🏨', `
      <div class="info-card">
        <div class="info-card__head"><span class="em">🛏️</span><h3>${esc(tour.hotel?.name || '')}</h3></div>
        <div class="kv"><span class="k">כתובת</span><span class="v" style="direction:ltr">${esc(tour.hotel?.address || '')}</span></div>
        <div class="kv"><span class="k">לילות</span><span class="v">${esc(tour.hotel?.nights ?? '')}</span></div>
        <a class="btn btn--ghost" style="margin-top:14px" href="${esc(tour.hotel?.mapUrl || '#')}" target="_blank" rel="noopener">🗺️ פתח במפות ›</a>
      </div>
    `)}

    ${section(`מזג אוויר · ${tour.weather?.month || ''}`, '☀️', `
      <div class="info-card">
        <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:baseline">
          <div><span style="font-family:var(--font-display);font-size:2rem;font-weight:800">${esc(tour.weather?.day || '')}</span> <span style="color:var(--ink-soft)">ביום</span></div>
          <div><span style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--danube)">${esc(tour.weather?.night || '')}</span> <span style="color:var(--ink-soft)">בלילה</span></div>
        </div>
        <p class="section-sub" style="margin:12px 0 6px">${esc(tour.weather?.summary || '')}</p>
        <ul class="tips">${(tour.weather?.notes || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
    `)}

    ${section('מה לארוז', '🧳', `
      <div class="pack-grid stagger">
        ${packing.map((box) => `
          <div class="pack-box">
            <h4>${esc(box.emoji || '')} ${esc(box.title)}</h4>
            <ul>${(box.items || []).map((it) => `<li>${esc(it)}</li>`).join('')}</ul>
            ${box.note ? `<div class="note">${esc(box.note)}</div>` : ''}
          </div>`).join('')}
      </div>
    `)}

    ${section('תחבורה', '🚇', `
      ${transport.map((sec) => `
        <div class="info-card">
          <div class="info-card__head"><span class="em">${esc(sec.emoji || '')}</span><h3>${esc(sec.title)}</h3></div>
          ${(sec.items || []).map((it) => `
            <div class="trans-item">
              <div class="trans-item__h">${esc(it.name)} ${it.badge ? `<span class="badge">${esc(it.badge)}</span>` : ''}</div>
              ${it.desc ? `<div class="trans-item__d">${esc(it.desc)}</div>` : ''}
              ${it.price ? `<span class="trans-item__p">${esc(it.price)}</span>` : ''}
            </div>`).join('')}
        </div>`).join('')}
      ${(tour.transportTips || []).length ? `<div class="info-card">
        <div class="info-card__head"><span class="em">💡</span><h3>טיפים</h3></div>
        <ul class="tips">${tour.transportTips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>` : ''}
    `)}

    ${tour.money ? section('כספים ומטבע', '💳', `
      <div class="info-card">
        <div class="kv"><span class="k">מטבע</span><span class="v">${esc(tour.money.currency || '')}</span></div>
        ${tour.money.rate ? `<div class="kv"><span class="k">שער חליפין</span><span class="v" style="font-family:var(--font-latin)">${esc(tour.money.rate)}</span></div>` : ''}
        ${tour.money.cards ? `<div class="kv"><span class="k">אשראי</span><span class="v" style="max-width:62%">${esc(tour.money.cards)}</span></div>` : ''}
        ${tour.money.tipping ? `<div class="kv"><span class="k">טיפים</span><span class="v" style="max-width:62%">${esc(tour.money.tipping)}</span></div>` : ''}
        ${(tour.money.notes || []).length ? `<ul class="tips" style="margin-top:10px">${tour.money.notes.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      </div>
    `) : ''}

    ${(tour.connectivity || []).length ? section('תקשורת ואינטרנט', '📶', `
      <div class="info-card"><ul class="tips">${tour.connectivity.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
    `) : ''}

    ${(tour.budget || []).length ? section('תקציב משוער ליום', '🧮', `
      <div class="info-card">
        ${tour.budget.map((b) => `<div class="kv"><span class="k">${esc(b.label)}</span><span class="v" style="font-family:var(--font-latin)">${esc(b.value)}</span></div>`).join('')}
        <p class="section-sub" style="margin:10px 0 0">הערכה בלבד לזוג-משפרים; משתנה לפי סגנון.</p>
      </div>
    `) : ''}

    ${(tour.apps || []).length ? section('אפליקציות שימושיות', '📱', `
      <div class="info-card">
        ${tour.apps.map((a) => `<div class="trans-item"><div class="trans-item__h">${esc(a.name)}</div><div class="trans-item__d">${esc(a.desc || '')}</div></div>`).join('')}
      </div>
    `) : ''}

    ${(tour.emergency || []).length ? section('טלפונים לשעת חירום', '🆘', `
      <div class="info-card">
        ${tour.emergency.map((e) => `<div class="kv"><span class="k">${esc(e.label)}</span><span class="v" style="font-family:var(--font-latin);direction:ltr">${esc(e.value)}</span></div>`).join('')}
      </div>
    `) : ''}

    ${(tour.beforeYouGo || []).length ? section('לפני שיוצאים', '✅', `
      <div class="info-card"><ul class="checklist">${tour.beforeYouGo.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
    `) : ''}

    ${(tour.phrasebook || []).length ? section('שיחון · הונגרית', '🗣️', `
      <div class="info-card">
        ${tour.phrasebook.map((p) => `
          <div class="phrase-row">
            <span class="he">${esc(p.he)}</span>
            <span class="lp"><span class="local">${esc(p.local)}</span><br><span class="translit">${esc(p.translit)}</span></span>
          </div>`).join('')}
      </div>
    `) : ''}

    ${(tour.extraInfo || []).map((sec) => section(sec.title, sec.emoji || '📌', `
      <div class="info-card">
        ${sec.body ? `<p class="section-sub" style="margin-top:0">${esc(sec.body)}</p>` : ''}
        ${(sec.items || []).map((it) => `<div class="trans-item"><div class="trans-item__h">${esc(it.h || it.name || '')}</div>${(it.d || it.desc) ? `<div class="trans-item__d">${esc(it.d || it.desc)}</div>` : ''}</div>`).join('')}
      </div>
    `)).join('')}

    ${(tour.photoCredits || []).length ? section('קרדיטים לצילומים', '📷', `
      <div class="info-card">
        <p class="section-sub" style="margin-top:0">כל התמונות מ־Wikimedia Commons, ברישיון חופשי (CC / נחלת הכלל).</p>
        <ul class="credits">${tour.photoCredits.map((c) => `<li><a href="${esc(c.src)}" target="_blank" rel="noopener">${esc(c.t)}</a> — ${esc(c.by)} · ${esc(c.lic)}</li>`).join('')}</ul>
      </div>
    `) : ''}
  `;
}
