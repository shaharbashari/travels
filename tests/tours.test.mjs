import test from 'node:test';
import assert from 'node:assert/strict';
import tours from '../data/tours/index.js';
import { pid, CATEGORIES } from '../assets/js/util.js';
import { haversineM, legFor } from '../assets/js/travel.js';
import { render as renderInfo } from '../assets/js/views/info.js';
import { render as renderHome } from '../assets/js/views/home.js';
import { render as renderTrips } from '../assets/js/views/trips.js';
import { render as renderPlace } from '../assets/js/views/place.js';
import { render as renderExplore } from '../assets/js/views/explore.js';
import { mount as mountMap } from '../assets/js/views/map.js';

const bucharest = tours.find((tour) => tour.id === 'bucharest-2027');
const budapest = tours.find((tour) => tour.id === 'budapest-2026');

test('Bucharest itinerary links resolve to rich, geolocated place pages', () => {
  const tour = structuredClone(bucharest);
  tour.places.forEach((place) => { place.id = pid(place.name); });
  const byName = new Map(tour.places.map((place) => [place.name, place]));
  assert.equal(byName.size, tour.places.length);
  assert.equal(new Set(tour.places.map((place) => place.id)).size, tour.places.length);
  for (const day of tour.days) {
    for (const [index, item] of day.items.entries()) {
      if (item.place) {
        const place = byName.get(item.place);
        assert.ok(place, `Missing place for ${item.title}`);
        assert.ok(CATEGORIES[place.category]);
        assert.ok(Number.isFinite(place.lat) && Number.isFinite(place.lng));
        const html = renderPlace({ tour, place });
        assert.ok(html.includes(place.address));
        assert.ok(html.includes('detail-actions'));
        assert.ok(html.includes('detail-tips'));
      }
      if (item.travel) {
        const leg = legFor(tour, day.items, index);
        assert.ok(leg?.computed, `Missing travel coordinates for ${item.title}`);
        assert.ok(leg.distanceM < 40000, `Unexpected long-distance leg for ${item.title}`);
      }
    }
  }
});

test('phrasebook language follows the tour and preserves the Budapest default', () => {
  assert.ok(renderInfo({ tour: bucharest }).includes(`שיחון · ${bucharest.phrasebookLanguage}`));
  assert.ok(renderInfo({ tour: budapest }).includes('שיחון · הונגרית'));
  const html = renderInfo({ tour: { ...bucharest, phrasebookLanguage: '<script>' } });
  assert.ok(html.includes('שיחון · &lt;script&gt;'));
});

test('map starts in the selected destination and popup navigation uses that city', () => {
  const oldWindow = globalThis.window;
  const popups = [];
  let center;
  const map = {
    setView(coords) { center = coords; return this; },
    fitBounds() {},
    invalidateSize() {},
  };
  globalThis.window = {
    L: {
      map: () => map,
      tileLayer: () => ({ addTo() {} }),
      divIcon: () => ({}),
      marker: () => ({
        addTo() { return this; },
        bindPopup(html) { popups.push(html); },
      }),
    },
  };
  try {
    mountMap({ tour: bucharest }, { querySelector: () => ({}), querySelectorAll: () => [] });
    assert.deepEqual(center, [bucharest.destination.lat, bucharest.destination.lng]);
    assert.equal(popups.length, bucharest.places.length + 1);
    for (const html of popups) {
      const href = html.match(/href="(https:\/\/www\.google\.com\/maps[^"]+)"/)?.[1];
      const query = new URL(href.replaceAll('&amp;', '&').replaceAll('&#39;', "'")).searchParams.get('query');
      assert.ok(query.endsWith(`, ${bucharest.destination.city}`));
      assert.ok(!query.includes('Budapest'));
    }
  } finally {
    globalThis.window = oldWindow;
  }
});

test('Bucharest covers do not show the Budapest skyline; Budapest keeps its illustration', () => {
  for (const tour of [bucharest, budapest]) {
    const home = renderHome({ tour, status: 'upcoming' });
    const trips = renderTrips({ tours: [tour], config: {} });
    assert.equal(home.includes('class="hero__sky"'), tour === budapest);
    assert.equal(trips.includes('class="hero__sky"'), tour === budapest);
    assert.ok(home.includes(tour.hero));
    assert.ok(trips.includes(tour.hero));
  }
});

test('place-card map links use each tour destination', () => {
  for (const tour of [bucharest, budapest]) {
    const html = renderExplore({ tour, route: { param: 'all' } });
    const links = [...html.matchAll(/href="(https:\/\/www\.google\.com\/maps[^"]+)"/g)];
    assert.equal(links.length, tour.places.length);
    for (const [, href] of links) {
      const query = new URL(href.replaceAll('&amp;', '&').replaceAll('&#39;', "'")).searchParams.get('query');
      assert.ok(query.endsWith(`, ${tour.destination.city}`));
    }
  }
});

test('Friday keeps the meeting and extended shopping before Therme', () => {
  const friday = bucharest.days.find((day) => day.date === '2027-01-29');
  const meeting = friday.items.find((item) => item.title === 'הגעה ל-ParkLake לפי שעת התיאום');
  assert.ok(meeting, 'The fixed ParkLake meeting must remain on Friday');
  assert.equal(meeting.place, 'ParkLake Shopping Center');
  assert.equal(meeting.time, undefined, 'Do not invent a time for the privately coordinated meeting');
  assert.equal(friday.items.indexOf(meeting), 1, 'Sightseeing must not displace the morning meeting');

  const spaIndex = friday.items.findIndex((item) => item.place === 'Therme București');
  assert.ok(spaIndex > friday.items.indexOf(meeting));
  assert.ok(friday.items.slice(2, spaIndex).some((item) =>
    item.place === 'ParkLake Shopping Center' && item.period === 'אחר הצהריים'));
  assert.ok(!friday.items.some((item) => item.place === 'National Museum of Art of Romania'));
});

test('Primark and visitor-facing copy describe the trip, not previous revisions', () => {
  const friday = bucharest.days.find((day) => day.date === '2027-01-29');
  const shopping = friday.items.find((item) => item.place === 'Primark ParkLake');
  const primark = bucharest.places.find((place) => place.name === shopping.place);
  assert.ok(shopping.desc.includes('אחרי הפגישה'));
  assert.ok(primark.desc.includes('בנחת'));
  assert.ok(renderPlace({ tour: bucharest, place: primark }).includes(primark.address));
  const copy = JSON.stringify(bucharest);
  for (const leftover of ['אין מגבלת 45 דקות', 'בלי מגבלת 45 דקות',
    'בלי להקציב רק 45 דקות', 'הגרסה החדשה', 'בתוכנית החדשה',
    'מוזיאון אמנות שמחכה', 'מוזיאון אמנות שמתחבא', 'בלי מוזיאון באמצע',
    'בלי להתפנות למוזיאון באמצע', 'נבחר במקום בר הגג', 'הספא עובר לשישי',
    'הגלריה אינה המלצה', 'לא ביקור בגלריה', 'לא הוכח סניף ParkLake',
    'לא על מרכז תצוגת המפה']) {
    assert.ok(!copy.includes(leftover), `Leftover edit commentary: ${leftover}`);
  }
});

test('Red Goblin is absent from recommendations, directions and rendered pages', () => {
  for (const copy of [JSON.stringify(bucharest),
    renderHome({ tour: bucharest, status: 'upcoming' }),
    renderInfo({ tour: bucharest }),
    renderExplore({ tour: bucharest, route: { param: 'all' } }),
    ...bucharest.places.map((place) => renderPlace({ tour: bucharest, place }))]) {
    assert.ok(!/Red Goblin|redgoblin|רד גובלין|Știrbei Vodă 4/i.test(copy));
  }
});

test('requested venues and the hotel-first airport transfer remain intact', () => {
  assert.deepEqual(bucharest.dates, { start: '2027-01-28', end: '2027-01-30' });
  assert.equal(bucharest.hotel.name, 'Hilton Garden Inn Bucharest Old Town');
  assert.equal(bucharest.hotel.address, 'Strada Doamnei 12, Sector 3, Bucharest, Romania');
  const scheduled = bucharest.days.flatMap((day) => day.items);
  for (const name of ['MINISO ParkLake', 'OTOTO Amzei', 'Museum of Senses', 'Sippers']) {
    assert.ok(bucharest.places.some((place) => place.name === name));
    assert.ok(scheduled.some((item) => item.place === name));
  }
  const saturday = bucharest.days.find((day) => day.date === '2027-01-30');
  const transferIndex = saturday.items.findIndex((item) =>
    item.title === 'יציאה מהמלון לשדה התעופה אוטופני');
  assert.ok(transferIndex > 0);
  assert.equal(saturday.items[transferIndex].time, '17:00');
  assert.equal(saturday.items[transferIndex].travel.mode, 'taxi');
  assert.equal(saturday.items[transferIndex - 1].time, '16:30');
  assert.ok(saturday.items[transferIndex - 1].title.includes('מהמלון'));
  assert.equal(bucharest.flights.find((flight) => flight.direction === 'return').depart, '21:45');
  assert.ok(bucharest.places.some((place) => place.name === 'AlbAlb'));
  assert.ok(bucharest.places.some((place) => place.name === 'MINA Museum'));
});

test('new alternatives have rich, sourced place pages in the existing clusters', () => {
  const tour = structuredClone(bucharest);
  tour.places.forEach((place) => { place.id = pid(place.name); });
  const expected = [
    ['Romanian Boutique', 'www.romanianboutique.ro', { lat: 44.430958, lng: 26.104041 }],
    ['LEGO Certified Store ParkLake', 'brickdepot.ro', { lat: 44.4206655, lng: 26.149631 }],
    ['ProfiArt AFI Cotroceni', 'www.aficotroceni.ro', { lat: 44.4303333, lng: 26.0522045 }],
    ['TRICKSHOT AFI Cotroceni', 'trickshot.ro', { lat: 44.4303333, lng: 26.0522045 }],
  ];
  for (const [name, sourceHost, coords] of expected) {
    const place = tour.places.find((entry) => entry.name === name);
    assert.ok(place, `Missing new alternative: ${name}`);
    assert.deepEqual({ lat: place.lat, lng: place.lng }, coords);
    assert.ok(place.address && place.hours && place.price && place.long);
    assert.ok(place.tips.length >= 2 && place.tags.length >= 2);
    assert.equal(place.rating, undefined, `Do not invent a rating for ${name}`);
    assert.ok(/לבחירה|חלופה/.test(place.badge));
    assert.ok(place.links.some((link) =>
      link.type === 'website' && new URL(link.url).hostname === sourceHost));
    const html = renderPlace({ tour, place });
    assert.ok(html.includes(place.address));
    assert.ok(html.includes('detail-mapwrap'));
    assert.ok(html.includes('detail-tips'));
    for (const link of place.links) {
      assert.equal(new URL(link.url).protocol, 'https:');
      assert.ok(html.includes(link.url.replaceAll('&', '&amp;')));
    }
  }
  const boutique = tour.places.find((place) => place.name === 'Romanian Boutique');
  assert.ok(haversineM(tour.hotel, boutique) < 500, 'The replacement must be in the hotel walking cluster');
  assert.ok(boutique.links.some((link) => link.url.includes('query_place_id=ChIJDzU6XD7_sUAR7mllnhXAmNA')));
  for (const name of ['ProfiArt AFI Cotroceni', 'TRICKSHOT AFI Cotroceni']) {
    assert.ok(tour.places.find((place) => place.name === name).hours.includes('לא אומתו'));
  }
  assert.ok(!JSON.stringify(tour).includes('MaxFun'), 'Do not recommend the permanently closed AFI venue');
});

test('extra shops stay optional and do not add taxi detours or a packed flight day', () => {
  const optionalNames = new Set(['Romanian Boutique', 'LEGO Certified Store ParkLake',
    'ProfiArt AFI Cotroceni', 'TRICKSHOT AFI Cotroceni']);
  const scheduled = bucharest.days.flatMap((day) => day.items);
  const extraStops = scheduled.filter((item) => optionalNames.has(item.place));
  assert.equal(extraStops.length, 2, 'Other additions belong in the alternatives, not extra scheduled stops');
  for (const item of extraStops) {
    assert.ok(item.title.includes('לבחירה'));
    assert.notEqual(item.travel?.mode, 'taxi');
  }
  const thursday = bucharest.days.find((day) => day.date === '2027-01-28');
  assert.ok(!thursday.items.some((item) =>
    item.period === 'אחר הצהריים' && item.travel?.mode === 'taxi'));
  const friday = bucharest.days.find((day) => day.date === '2027-01-29');
  const legoIndex = friday.items.findIndex((item) => item.place === 'LEGO Certified Store ParkLake');
  const spaIndex = friday.items.findIndex((item) => item.place === 'Therme București');
  assert.ok(legoIndex > 1 && legoIndex < spaIndex);
  assert.equal(friday.items[legoIndex].time, undefined);
  const saturday = bucharest.days.find((day) => day.date === '2027-01-30');
  const byName = new Map(bucharest.places.map((place) => [place.name, place]));
  assert.deepEqual(saturday.items.filter((item) =>
    byName.get(item.place)?.category === 'attractions').map((item) => item.place), ['Museum of Senses']);
  assert.ok(saturday.items.some((item) => item.time === '15:00' && item.title.includes('למלון')));
});

test('flight day has breakfast coffee, modern activities and no spa or collections museum', () => {
  const saturday = bucharest.days.find((day) => day.date === '2027-01-30');
  const places = new Map(bucharest.places.map((place) => [place.name, place]));
  assert.ok(!saturday.items.some((item) => item.place === 'Therme București'));
  assert.ok(!saturday.items.some((item) => item.place === 'Museum of Romanian Records'));
  assert.ok(!saturday.items.some((item) => item.period === 'בוקר' &&
    places.get(item.place)?.category === 'sweets'), 'Do not reintroduce a separate morning cafe');
  assert.ok(saturday.items.some((item) =>
    ['attractions', 'museums'].includes(places.get(item.place)?.category)));
});

test('specialty shopping and walkable cocktails replace the old museum-heavy route', () => {
  const places = new Map(bucharest.places.map((place) => [place.name, place]));
  const scheduled = bucharest.days.flatMap((day) => day.items);
  const shops = new Set(scheduled.map((item) => item.place).filter((name) =>
    places.get(name)?.category === 'shopping' && !/ParkLake|Primark|AFI/.test(name)));
  assert.ok(shops.size >= 2, 'Include real specialty shops beyond malls');
  const bars = scheduled.filter((item) => places.get(item.place)?.category === 'nightlife');
  assert.ok(bars.length);
  for (const item of bars) {
    assert.equal(item.travel.mode, 'walk');
    assert.ok(haversineM(bucharest.hotel, places.get(item.place)) < 800);
  }
  for (const day of bucharest.days) {
    for (const [index, item] of day.items.entries()) {
      if (item.travel?.mode === 'walk') {
        assert.ok(legFor(bucharest, day.items, index)?.distanceM < 900,
          `Use a taxi rather than a long winter walk to ${item.title}`);
      }
    }
  }
  for (const name of ['Suțu Palace', 'National Museum of Art of Romania',
    'Museum of Romanian Records', 'Art Collections Museum', 'Ceaușescu Spring Palace', 'The Escape Room']) {
    assert.ok(!scheduled.some((item) => item.place === name));
    assert.ok(!places.has(name));
  }
});
