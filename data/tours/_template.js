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
 * @typedef {Object} PlaceLink
 * @property {string} label
 * @property {string} url
 * @property {'tickets'|'website'|'menu'|'info'} type
 */

/**
 * @typedef {Object} Place
 * @property {string} name
 * @property {string} [he]
 * @property {'attractions'|'restaurants'|'sweets'|'baths'|'museums'|'views'|'parks'|'shopping'|'nightlife'} category
 * @property {string} [emoji]
 * @property {number} [day]
 * @property {string} [desc]
 * @property {string} [long]           תיאור עשיר בן 2–4 משפטים
 * @property {string} [img]            התמונה הראשית לכרטיס
 * @property {string[]} [images]       גלריה של 1–4 תמונות; img ראשון
 * @property {PlaceLink[]} [links]     קישורים רשמיים, כרטיסים, תפריט או מידע
 * @property {string} [address]
 * @property {string[]} [tags]         2–4 תוויות קצרות
 * @property {string[]} [tips]         טיפים מפורטים
 * @property {string} [hours]
 * @property {string} [price]
 * @property {string} [tip]            טיפ קצר לתצוגה המקוצרת
 * @property {string} [badge]
 * @property {number} [lat]
 * @property {number} [lng]
 */

/**
 * @typedef {Object} ExtraInfoSection
 * @property {string} title
 * @property {string} [emoji]
 * @property {string} [body]
 * @property {{h:string,d:string}[]} items
 */

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
 * @property {string} [hero]            כתובת תמונת נושא (URL) — מוצגת ברקע ה-hero ובכרטיס הטיול
 * @property {string} [summary]
 * @property {Flight[]} [flights]
 * @property {{name:string,note?:string}} [transfer]
 * @property {Hotel} [hotel]
 * @property {Weather} [weather]
 * @property {PackBox[]} [packing]
 * @property {TransportSection[]} [transport]
 * @property {string[]} [transportTips]
 * @property {{currency:string,rate?:string,cards?:string,tipping?:string,notes?:string[]}} [money]
 * @property {string[]} [connectivity]  טיפים לתקשורת/אינטרנט
 * @property {{label:string,value:string}[]} [budget]     תקציב משוער ליום
 * @property {{label:string,value:string}[]} [emergency]  טלפוני חירום
 * @property {{name:string,desc?:string}[]} [apps]        אפליקציות שימושיות
 * @property {string[]} [beforeYouGo]   צ׳קליסט לפני הנסיעה
 * @property {ExtraInfoSection[]} [extraInfo] מדריכי עומק נוספים לעמוד המידע
 * @property {{t:string,by:string,lic:string,src:string}[]} [photoCredits]  קרדיטים לתמונות
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
  hero: 'https://upload.wikimedia.org/.../photo.jpg', // תמונת נושא (URL). מומלץ Wikimedia Commons ברישיון חופשי
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

  // ---- מידע פרקטי (הכול אופציונלי) ---------------------------------------
  money: {
    currency: 'שם המטבע · CODE',
    rate: '100 CODE ≈ 00 ₪',
    cards: 'משפט על תשלום בכרטיסי אשראי.',
    tipping: 'משפט על טיפים.',
    notes: ['הערה על מזומן/כספומטים'],
  },
  connectivity: ['eSIM/סים', 'Wi-Fi', 'אפליקציות מפה'],
  budget: [
    { label: 'ארוחות', value: '00–00 ₪' },
    { label: 'תחבורה', value: '00 ₪' },
  ],
  emergency: [
    { label: 'חירום כללי', value: '112' },
    { label: 'שגרירות ישראל', value: '+00-0-000-0000' },
  ],
  apps: [
    { name: 'שם האפליקציה', desc: 'למה היא שימושית.' },
  ],
  beforeYouGo: ['להזמין X מראש', 'להתקין eSIM', 'לבדוק תוקף דרכון'],
  extraInfo: [
    {
      title: 'מדריך עומק', emoji: '🧭',
      body: 'פתיח קצר ואופציונלי למדריך.',
      items: [
        { h: 'כותרת פריט', d: 'תיאור שימושי ומפורט.' },
      ],
    },
  ],

  // קרדיטים לתמונות (חובה אם משתמשים בתמונות ברישיון CC-BY / CC-BY-SA)
  photoCredits: [
    { t: 'שם/נושא', by: 'שם הצלם', lic: 'CC BY 4.0', src: 'https://commons.wikimedia.org/wiki/File:...' },
  ],

  // ---- שיחון --------------------------------------------------------------
  phrasebook: [
    { he: 'תודה', local: 'Thanks', translit: 'תַנקְס' },
  ],

  // ---- מסלול יומי (חובה) --------------------------------------------------
  // period: 'בוקר' | 'צהריים' | 'אחר הצהריים' | 'ערב'  (מקבץ את הפריטים בציר הזמן)
  // time: אופציונלי ('08:35'); place: שם שמקשר לכרטיס ב"מה עושים"
  // travel: הדרך אל הפריט מהפריט הקודם; mode: walk | metro | tram | bus | taxi | car | boat | train | funicular | bike
  days: [
    {
      index: 1, date: '2027-01-01',
      title: 'כותרת היום', subtitle: 'תיאור קצר',
      transport: ['ברגל'], lodging: 'שם המלון',
      items: [
        { period: 'בוקר', time: '', emoji: '🥐', title: 'פעילות', desc: 'פרטים', place: '' },
        { period: 'בוקר', time: '10:00', emoji: '📍', title: 'הפעילות הבאה', desc: 'פרטים', travel: { mode: 'walk', duration: '10 דק׳', note: 'הליכה נעימה דרך המרכז' }, place: '' },
      ],
    },
  ],

  // ---- מה עושים (מקומות) --------------------------------------------------
  // category: 'attractions' | 'restaurants' | 'sweets' | 'baths' | 'museums' |
  //           'views' | 'parks' | 'shopping' | 'nightlife'
  // שדות עשירים: long, images, links, address, tags, tips
  // שדות נוספים: img, hours, price, tip, badge, lat, lng
  places: [
    {
      name: 'שם המקום', he: '', category: 'attractions', emoji: '📍', day: 1,
      desc: 'תיאור קצר לכרטיס.',
      long: 'תיאור עשיר בן שניים עד ארבעה משפטים לעמוד המקום. כאן מוסיפים הקשר, אווירה וסיבה אמיתית להגיע.',
      img: 'https://upload.wikimedia.org/.../500px-photo.jpg',
      images: ['https://upload.wikimedia.org/.../500px-photo.jpg'],
      links: [{ label: 'האתר הרשמי', url: 'https://example.com/', type: 'website' }],
      address: 'כתובת רחוב מלאה',
      tags: ['קלאסי', 'לא לפספס', 'מצטלם'],
      tips: ['טיפ שימושי ראשון.', 'טיפ שימושי נוסף.'],
      hours: '', price: '', tip: '', badge: '', lat: 0, lng: 0,
    },
  ],
};

export default tourTemplate;
