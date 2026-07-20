// ============================================================================
//  תבנית לטיול חדש  ·  New-tour template
//  ----------------------------------------------------------------------------
//  איך מוסיפים טיול חדש:
//    1. העתיקו את הקובץ הזה ל: data/tours/<id>.js  (למשל paris-2027.js)
//    2. מלאו את השדות למטה. מחקו שדות שלא רלוונטיים — כולם אופציונליים חוץ מ:
//       id, title, destination, dates, days.
//    3. פתחו את data/tours/index.js, ייבאו את הקובץ והוסיפו אותו למערך `tours`.
//    4. זהו! רעננו את הדפדפן. הטיול יופיע אוטומטית ברשימת הטיולים ובניווט.
//
//  המבנה המלא מתועד גם ב-data/schema.md.
// ============================================================================

/**
 * @typedef {Object} Tour
 * @property {string} id                מזהה ייחודי (kebab-case), חייב להתאים לשם הקובץ
 * @property {'upcoming'|'active'|'past'} [status]  מחושב גם אוטומטית מהתאריכים
 * @property {number} [order]           סדר תצוגה ברשימה (קטן→גדול)
 * @property {{city:string,country:string,flag?:string}} destination
 * @property {string} title             שם הטיול (מוצג בכותרת)
 * @property {string} [subtitle]
 * @property {{start:string,end:string}} dates   תאריכים בפורמט 'YYYY-MM-DD'
 * @property {string[]} [travelers]     שמות הנוסעים
 * @property {{accent?:string,accent2?:string,gold?:string}} [theme]
 * @property {string} [emoji]
 * @property {string} [summary]
 * @property {Flight[]} [flights]
 * @property {{name:string,note?:string}} [transfer]
 * @property {Hotel} [hotel]
 * @property {Weather} [weather]
 * @property {PackBox[]} [packing]
 * @property {TransportSection[]} [transport]
 * @property {string[]} [transportTips]
 * @property {Phrase[]} [phrasebook]
 * @property {Day[]} days
 * @property {Place[]} [places]
 */

/** @type {Tour} */
const tourTemplate = {
  id: 'destination-year',            // ⬅️ שנו! חייב להיות זהה לשם הקובץ
  status: 'upcoming',
  order: 2,

  destination: { city: 'עיר', country: 'מדינה', flag: '🏳️' },
  title: 'שם הטיול',
  subtitle: 'תיאור קצר',
  dates: { start: '2027-01-01', end: '2027-01-05' },
  travelers: ['הדר'],              // תמיד כולל את הדר; אפשר להוסיף עוד

  theme: { accent: '#c8102e', accent2: '#1f6f8b', gold: '#d9a441' },
  emoji: '📍',
  summary: 'פסקה קצרה שמתארת את הטיול.',

  // ---- טיסות (0 או יותר) --------------------------------------------------
  flights: [
    {
      direction: 'outbound', label: 'טיסת הלוך', airline: 'אל-על', flightNo: 'LY0000',
      from: { code: 'TLV', city: 'תל אביב', airport: 'נתב״ג' },
      to: { code: 'XXX', city: 'יעד', airport: '' },
      date: '2027-01-01', depart: '00:00', arrive: '00:00', note: 'טיסה ישירה',
    },
    // { direction: 'return', ... }
  ],

  transfer: { name: 'שם חברת ההסעה', note: 'פרטים על ההגעה מהשדה.' },

  // ---- מלון ---------------------------------------------------------------
  hotel: {
    name: 'שם המלון', address: 'כתובת מלאה',
    lat: 0, lng: 0,                 // קואורדינטות למפה (אופציונלי)
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Name',
    nights: 4,
  },

  // ---- מזג אוויר ----------------------------------------------------------
  weather: {
    month: 'חודש', day: '00–00°', night: '00–00°',
    summary: 'משפט על מזג האוויר.',
    notes: ['הערה 1', 'הערה 2'],
  },

  // ---- אריזה (רשימות לפי קטגוריה) ----------------------------------------
  packing: [
    { title: 'ליום', emoji: '👕', items: ['פריט 1', 'פריט 2'], note: 'הערה אופציונלית' },
  ],

  // ---- תחבורה -------------------------------------------------------------
  transport: [
    {
      title: 'משדה התעופה', emoji: '🚕',
      items: [
        { name: 'אמצעי', badge: 'מומלץ', desc: 'תיאור', price: '00 ₪' },
      ],
    },
  ],
  transportTips: ['טיפ 1', 'טיפ 2'],

  // ---- שיחון --------------------------------------------------------------
  phrasebook: [
    { he: 'תודה', local: 'Thanks', translit: 'תַנקְס' },
  ],

  // ---- מסלול יומי (חובה) --------------------------------------------------
  // period: 'בוקר' | 'צהריים' | 'אחר הצהריים' | 'ערב'  (מקבץ את הפריטים בציר הזמן)
  // time: אופציונלי ('08:35'); place: שם שמקשר לכרטיס ב"מה עושים"
  days: [
    {
      index: 1, date: '2027-01-01',
      title: 'כותרת היום', subtitle: 'תיאור קצר',
      transport: ['ברגל'], lodging: 'שם המלון',
      items: [
        { period: 'בוקר', time: '', emoji: '🥐', title: 'פעילות', desc: 'פרטים', place: '' },
      ],
    },
  ],

  // ---- מה עושים (מקומות) --------------------------------------------------
  // category: 'attractions' | 'restaurants' | 'shopping' | 'sweets' | 'nightlife'
  places: [
    { name: 'שם המקום', he: '', category: 'attractions', emoji: '📍', day: 1,
      desc: 'תיאור קצר', badge: '', lat: 0, lng: 0 },
  ],
};

export default tourTemplate;
