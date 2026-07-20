// ============================================================================
//  טיול: בודפשט 2026
//  ----------------------------------------------------------------------------
//  זהו קובץ תוכן בלבד (data). כדי לערוך את הטיול – שנו את הערכים כאן.
//  כדי להוסיף טיול חדש – העתיקו את data/tours/_template.js וקִראו את README.md.
//  המבנה המלא של האובייקט מתועד ב-data/schema.md.
// ============================================================================

/** @type {import('./_template.js').Tour} */
const budapest2026 = {
  id: 'budapest-2026',
  status: 'upcoming', // upcoming | active | past  (מחושב גם אוטומטית מהתאריכים)
  order: 1,

  destination: { city: 'בודפשט', country: 'הונגריה', flag: '🇭🇺' },
  title: 'בודפשט',
  subtitle: 'חמישה ימים על גדות הדנובה',
  dates: { start: '2026-09-04', end: '2026-09-08' },
  travelers: ['הדר', 'רז'],

  // ערכת צבעים ייחודית לטיול (זהב הדנובה בשקיעה + כחול הנהר + פפריקה)
  theme: { accent: '#c8102e', accent2: '#1f6f8b', gold: '#d9a441' },

  // תמונת נושא (SVG מקורי – קו רקיע של בודפשט)
  hero: 'assets/img/budapest-hero.svg',
  emoji: '🏛️',

  summary:
    'טיול בן חמישה ימים בבירת הונגריה — בין שני חלקי העיר שהדנובה מפרידה ביניהם. ' +
    'בודה ההיסטורית עם המצודה ובאסטיון הדייגים, פשט התוססת עם הפרלמנט, הרובע היהודי, ' +
    'שדרות אנדראשי, שווקים, שוקולד ושיט שקיעה על הנהר.',

  // ---- טיסות -------------------------------------------------------------
  flights: [
    {
      direction: 'outbound',
      label: 'טיסת הלוך',
      airline: 'אל-על',
      flightNo: 'LY2369',
      from: { code: 'TLV', city: 'תל אביב', airport: 'נתב״ג' },
      to: { code: 'BUD', city: 'בודפשט', airport: 'פרנץ ליסט' },
      date: '2026-09-04',
      depart: '08:35',
      arrive: '11:00',
      note: 'טיסה ישירה',
    },
    {
      direction: 'return',
      label: 'טיסת חזור',
      airline: 'אל-על',
      flightNo: 'LY2368',
      from: { code: 'BUD', city: 'בודפשט', airport: 'פרנץ ליסט' },
      to: { code: 'TLV', city: 'תל אביב', airport: 'נתב״ג' },
      date: '2026-09-08',
      depart: '23:15',
      arrive: null,
      note: 'טיסת לילה',
    },
  ],

  transfer: {
    name: 'Budapest 4 you Transfer',
    note: 'הנהג יחכה בשדה התעופה בבודפשט עם שלט בשם שלכם.',
  },

  // ---- מלון --------------------------------------------------------------
  hotel: {
    name: 'Leonardo Boutique Hotel Budapest M-Square',
    address: '1075 Budapest, Madách Tér 2, Hungary',
    lat: 47.4976,
    lng: 19.0585,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Leonardo+Boutique+Hotel+Budapest+M-Square',
    nights: 4,
  },

  // ---- מזג אוויר ---------------------------------------------------------
  weather: {
    month: 'ספטמבר',
    day: '20–25°',
    night: '12–15°',
    summary: 'מעבר נעים בין סוף הקיץ לתחילת הסתיו — רוב הזמן שמש ובריזה טובה.',
    notes: [
      'ביום נעים וחמים, לפעמים נושק ל-28°.',
      'בלילה קריר ונעים, סביב 12–15°.',
      'עונת הגשמים הכבדה מאחורינו, אבל אירופה יכולה להפתיע — כדאי מטרייה מתקפלת.',
    ],
  },

  // ---- מה לארוז ----------------------------------------------------------
  packing: [
    { title: 'לשעות היום', emoji: '👕', items: ['חולצות קצרות (T-shirts)', 'חולצות דקות שרוול ארוך', "ג'ינסים / מכנסי קז'ואל קלילים", 'זוג מכנסיים קצרים'] },
    { title: 'לערב וללילה', emoji: '🧥', items: ["ז'קט קליל (ג'ינס / עור / עליונית דקה)", "סוודר או קפוצ'ון"], note: 'אין צורך במעילי חורף עבים, כובעי צמר או כפפות.' },
    { title: 'הנעלה', emoji: '👟', items: ['נעלי הליכה או סניקרס נוחות (הולכים הרבה!)'] },
    { title: 'אביזרים למזג האוויר', emoji: '🕶️', items: ['משקפי שמש (חובה)', 'צעיף דק לרוח הערב', 'מטרייה מתקפלת קטנה'] },
    { title: 'לבילויים', emoji: '✨', items: ['לוק קז\'ואל-חכם: חולצה מכופתרת / פולו / חולצה יפה עם ג\'ינס'] },
    { title: 'טיפוח ובריאות', emoji: '🧴', items: ['קרם לחות לפנים', 'ליפסטיק / ליפ-בלם', 'תרופות בסיסיות / אקמול', 'קרם ידיים'] },
    { title: 'ציוד שימושי', emoji: '🎒', items: ['מטען נייד', 'שקית בד / קאנבס ליום-יום'] },
  ],

  // ---- תחבורה ------------------------------------------------------------
  transport: [
    {
      title: 'משדה התעופה לעיר',
      emoji: '🚕',
      items: [
        { name: 'Bolt', badge: 'הכי מומלץ', desc: 'האפליקציה הכי שימושית בבודפשט — זולה, זמינה ומהירה. מגיע תוך 2–5 דק׳.', price: '≈ 8,000–12,000 HUF · כ־80–120 ₪' },
        { name: 'מונית רשמית – Főtaxi', desc: 'עמדה מסודרת ביציאה מהטרמינל, אפשר לשלם בכרטיס אשראי.', price: 'מחירים דומים ל-Bolt' },
        { name: 'אוטובוס 100E', badge: 'תקציבי', desc: 'ישירות למרכז (Deák Ferenc tér), יוצא כל 10–15 דק׳, נסיעה 35–45 דק׳.', price: '2,200 HUF · ≈ 22 ₪' },
      ],
    },
    {
      title: 'מתניידים בתוך העיר',
      emoji: '🚇',
      items: [
        { name: 'מטרו (4 קווים)', desc: 'מגיע לכל נקודה מרכזית, מהיר ונעים, פועל עד חצות. קו M1 הצהוב — העתיק באירופה.' },
        { name: 'טראם (חשמלית)', badge: 'הכי יפה', desc: 'קו 2 לאורך הדנובה — שווה כמיני-סיור. פועל עד אחרי חצות.' },
        { name: 'אוטובוס 16', desc: 'הדרך הכי קלה לעלות למצודת בודה.' },
        { name: 'Bolt בתוך העיר', desc: 'מושלם בערב / קור / גשם.', price: '1,500–3,500 HUF · 15–35 ₪' },
      ],
    },
    {
      title: 'כרטיסים',
      emoji: '🎫',
      items: [
        { name: 'כרטיס בודד', desc: 'צריך להחתים במכונה הצהובה לפני הנסיעה.', price: '9–12 ₪' },
        { name: 'Travelcard 24 שעות', badge: 'משתלם', desc: 'כדאי אם עושים 2+ נסיעות ביום.', price: '2,500 HUF · ≈ 26 ₪' },
        { name: 'Travelcard 72 שעות', badge: 'הכי משתלם', desc: 'שווה מאוד לכמה ימים בעיר.', price: '5,500 HUF · ≈ 57 ₪' },
        { name: 'Budapest Card', desc: 'פחות משתלם לכם — בעיקר מוזיאונים ומרחצאות. הכרטיסים הרגילים מספיקים.' },
      ],
    },
  ],
  transportTips: [
    'קונים כרטיסים במכונות הסגולות בכל תחנת מטרו — יש אנגלית.',
    'כרטיס בודד חובה להחתים במכונה הצהובה. Travelcard לא צריך.',
    'התחבורה מאוד בטוחה — גם בלילה.',
    'Bolt זולה בהרבה מישראל — תרגישו חופשי.',
    'שומרים על המזוודות ברכבות/מטרו — בדרך כלל אין גניבות, אבל תמיד להיזהר.',
  ],

  // ---- שיחון (הונגרית) ---------------------------------------------------
  phrasebook: [
    { he: 'שלום / היי', local: 'Szia', translit: 'סִיָה' },
    { he: 'בוקר טוב', local: 'Jó reggelt', translit: 'יוֹ רֶגֶלְט' },
    { he: 'תודה', local: 'Köszönöm', translit: 'קֶסֶנֶם' },
    { he: 'בבקשה / על לא דבר', local: 'Szívesen', translit: 'סִיבֶשֶן' },
    { he: 'כן / לא', local: 'Igen / Nem', translit: 'אִיגֶן / נֶם' },
    { he: 'סליחה', local: 'Elnézést', translit: 'אֶלנֵזֵשְׁט' },
    { he: 'כמה זה עולה?', local: 'Mennyibe kerül?', translit: 'מֶניִבֶּה קֶרוּל' },
    { he: 'החשבון בבקשה', local: 'A számlát, kérem', translit: 'אָ סָאמְלָאט קֵרֶם' },
    { he: 'אתה מדבר אנגלית?', local: 'Beszél angolul?', translit: 'בֶּסֵל אָנגוֹלוּל' },
    { he: 'לחיים!', local: 'Egészségére!', translit: 'אֶגֵסֵגֵרֶה' },
  ],

  // ---- מסלול יומי --------------------------------------------------------
  days: [
    {
      index: 1,
      date: '2026-09-04',
      title: 'הדנובה, אזור הפרלמנט ומרכז העיר',
      subtitle: 'נחיתה, צ׳ק-אין וטעימה ראשונה מהעיר',
      transport: ['מונית', 'ברגל'],
      lodging: 'Leonardo Boutique Hotel Budapest M-Square',
      items: [
        { period: 'בוקר', time: '08:35', emoji: '✈️', title: 'טיסה ישירה לבודפשט', desc: 'המראה מנתב״ג ב-08:35, נחיתה בבודפשט ב-11:00.' },
        { period: 'בוקר', emoji: '🚕', title: 'מונית למלון וצ׳ק-אין', desc: 'נסיעה משדה התעופה למלון, השארת המזוודות.' },
        { period: 'צהריים', emoji: '🚶', title: 'כיכר Vörösmarty ורחוב Váci', desc: 'הליכה קצרה למרכז ההיסטורי ולרחוב הקניות המרכזי.', place: 'רחוב Váci' },
        { period: 'צהריים', emoji: '🍽️', title: 'ארוחת צהריים ב-Kiosk', desc: 'מסעדה מעולה קרובה לדנובה. קינוח קִיוּרְטוֹש ב-Molnár\'s.', place: 'Kiosk' },
        { period: 'אחר הצהריים', emoji: '🌊', title: 'טיילת הדנובה + אנדרטת הנעליים', desc: 'הליכה צפונה לאורך הנהר דרך אנדרטת הנעליים המרגשת.', place: 'אנדרטת הנעליים' },
        { period: 'אחר הצהריים', emoji: '🏛️', title: 'בניין הפרלמנט ההונגרי', desc: 'הבניין המרשים על גדת הנהר. סיור בפנים אופציונלי — כדאי להזמין מראש.', place: 'בניין הפרלמנט' },
        { period: 'ערב', emoji: '🎸', title: 'ארוחת ערב ב-Hard Rock Café', desc: '', place: 'Hard Rock Café' },
      ],
    },
    {
      index: 2,
      date: '2026-09-05',
      title: 'בודה ההיסטורית והאי מרגיט',
      subtitle: 'המצודה, התצפית הכי יפה, ופארק ירוק על הנהר',
      transport: ['ברגל', 'טראם / אוטובוס'],
      lodging: 'Leonardo Boutique Hotel Budapest M-Square',
      items: [
        { period: 'בוקר', emoji: '🥐', title: 'ארוחת בוקר במלון', desc: '' },
        { period: 'בוקר', emoji: '🌉', title: 'חוצים לבודה', desc: 'גשר השלשלאות (או אוטובוס 16 מהמלון) לצד בודה.', place: 'גשר השלשלאות' },
        { period: 'בוקר', emoji: '🏰', title: 'מצודת בודה וכנסיית מטיאש', desc: 'טיול בסמטאות המצודה וביקור בכנסייה המרשימה.', place: 'מצודת בודה' },
        { period: 'צהריים', emoji: '🔭', title: 'באסטיון הדייגים', desc: 'התצפית הכי יפה על העיר ועל פשט מעברו השני של הנהר.', place: 'באסטיון הדייגים' },
        { period: 'צהריים', emoji: '🌳', title: 'האי מרגיט', desc: 'טראם (או הליכה) לכיוון גשר מרגיט. פארק ירוק וגן יפני — אפשר לשכור אופניים זוגיים או רכב גולף ולהקיף את האי.', place: 'האי מרגיט' },
        { period: 'ערב', emoji: '⚔️', title: 'Sir Lancelot / Szimpla Kert', desc: 'מסעדת אבירים עם מופע, או ה"ריאין-בר" המפורסם ברובע היהודי.', place: 'Szimpla Kert' },
      ],
    },
    {
      index: 3,
      date: '2026-09-06',
      title: 'הרובע היהודי, שדרות אנדראשי וכיכר הגיבורים',
      subtitle: 'היסטוריה, יוקרה ופארק העיר',
      transport: ['ברגל'],
      lodging: 'Leonardo Boutique Hotel Budapest M-Square',
      items: [
        { period: 'בוקר', emoji: '🥐', title: 'ארוחת בוקר במלון', desc: '' },
        { period: 'בוקר', emoji: '🕍', title: 'בית הכנסת הגדול', desc: 'סיור מרתק במבנה המרשים, בחצר וב"עץ הזיכרון".', place: 'בית הכנסת הגדול' },
        { period: 'בוקר', emoji: '🏙️', title: 'שדרות אנדראשי', desc: 'השדרה הכי יוקרתית בבודפשט — בניין האופרה, חלונות ראווה ובתי קפה.', place: 'שדרות אנדראשי' },
        { period: 'צהריים', emoji: '🗽', title: 'כיכר הגיבורים ופארק העיר', desc: 'הכיכר העצומה, ומאחוריה פארק העיר וטירת Vajdahunyad.', place: 'כיכר הגיבורים' },
        { period: 'צהריים', emoji: '🌶️', title: 'ארוחת צהריים ב-Paprika', desc: 'אוכל הונגרי אותנטי בסמוך לפארק.', place: 'Paprika' },
        { period: 'אחר הצהריים', emoji: '🎡', title: 'מוזיאון האשליות / Flippermúzeum', desc: 'אופציונלי — מוזיאון האשליות או מוזיאון הפינבול והארקייד.', place: 'מוזיאון האשליות' },
        { period: 'ערב', emoji: '🌴', title: 'ארוחת ערב ב-Twentysix', desc: 'מסעדה שמעוצבת כמו ג\'ונגל אורבני. חובה להזמין מקום מראש.', place: 'Twentysix' },
      ],
    },
    {
      index: 4,
      date: '2026-09-07',
      title: 'שופינג ושיט שקיעה',
      subtitle: 'קניות, שוקולד ושעה זהובה על הנהר',
      transport: ['מטרו', 'ברגל'],
      lodging: 'Leonardo Boutique Hotel Budapest M-Square',
      items: [
        { period: 'בוקר', emoji: '🥐', title: 'ארוחת בוקר במלון', desc: '' },
        { period: 'בוקר', emoji: '🛍️', title: 'קניון Arena', desc: 'קו מטרו M2 ישירות ל-Arena Mall. שופינג ב-Primark ושאר המותגים.', place: 'Arena Mall' },
        { period: 'צהריים', emoji: '🍫', title: 'מסע בעקבות השוקולד', desc: 'חזרה למרכז לשופינג מתוקים — Ghraoui לפרלינים יוקרתיים ו-Stühmer ההונגרית הקלאסית.', place: 'Ghraoui' },
        { period: 'ערב', emoji: '🚢', title: 'שיט שקיעה על הדנובה', desc: 'שיט של שעה (כולל קוקטייל או כוס יין) בדיוק כשהשמש שוקעת והעיר נדלקת באורות זהובים.', place: 'שיט שקיעה על הדנובה' },
        { period: 'ערב', emoji: '🍽️', title: 'ארוחת ערב ב-Mazel Tov', desc: 'ברובע היהודי.', place: 'Mazel Tov' },
      ],
    },
    {
      index: 5,
      date: '2026-09-08',
      title: 'השוק המרכזי, הבזיליקה והשלמות',
      subtitle: 'יום אחרון — שוק, תצפית גג וטיסה הביתה',
      transport: ['ברגל', 'מונית'],
      lodging: 'טיסה חזרה לישראל',
      items: [
        { period: 'בוקר', emoji: '🥐', title: 'ארוחת בוקר במלון', desc: '' },
        { period: 'בוקר', emoji: '🏬', title: 'השוק המרכזי', desc: 'מבנה מקורה ויפהפה — פפריקה הונגרית, מזכרות, צבעים וריחות.', place: 'השוק המרכזי' },
        { period: 'צהריים', emoji: '⛪', title: 'בזיליקת סנט סטפן', desc: 'לא לוותר על העלייה לתצפית הגג — הנוף ביום בהיר עוצר נשימה.', place: 'בזיליקת סנט סטפן' },
        { period: 'צהריים', emoji: '🍔', title: 'המבורגר ב-Bamba Marha', desc: 'ממש קרוב לבזיליקה.', place: 'Bamba Marha' },
        { period: 'אחר הצהריים', emoji: '🛍️', title: 'זמן חופשי ב-Fashion Street', desc: 'להשלים קניות, או לשבת בבית קפה עם אווירה פריזאית.', place: 'Fashion Street' },
        { period: 'ערב', time: '19:30', emoji: '🚕', title: 'מונית לשדה התעופה', desc: 'יציאה מהמלול בסביבות 19:30.' },
        { period: 'ערב', time: '23:15', emoji: '✈️', title: 'טיסה חזרה לישראל', desc: 'המראה בשעה 23:15 מבודפשט.' },
      ],
    },
  ],

  // ---- מה עושים (מקומות לפי קטגוריה) -------------------------------------
  // category: restaurants | attractions | shopping | sweets | nightlife
  places: [
    // מסעדות
    { name: 'Kiosk', he: 'קיוסק', category: 'restaurants', emoji: '🍽️', day: 1, desc: 'מסעדה מעולה קרובה לדנובה, לארוחת צהריים קלילה.' },
    { name: 'Hard Rock Café', he: '', category: 'restaurants', emoji: '🎸', day: 1, desc: 'ארוחת ערב ביום הראשון.' },
    { name: 'Sir Lancelot', he: '', category: 'restaurants', emoji: '⚔️', day: 2, desc: 'מסעדת אבירים עם מופע.' },
    { name: 'Paprika', he: '', category: 'restaurants', emoji: '🌶️', day: 3, desc: 'אוכל הונגרי אותנטי ליד פארק העיר.' },
    { name: 'Twentysix', he: '', category: 'restaurants', emoji: '🌴', day: 3, desc: 'ג\'ונגל אורבני מעוצב. חובה להזמין מראש.', badge: 'להזמין מראש' },
    { name: 'Mazel Tov', he: '', category: 'restaurants', emoji: '🍽️', day: 4, desc: 'ברובע היהודי.' },
    { name: 'Bamba Marha', he: '', category: 'restaurants', emoji: '🍔', day: 5, desc: 'המבורגרים ליד הבזיליקה.' },

    // אתרים
    { name: 'בניין הפרלמנט', he: '', category: 'attractions', emoji: '🏛️', day: 1, desc: 'סמל העיר על גדת הדנובה. סיור פנים אופציונלי — להזמין מראש.', lat: 47.5072, lng: 19.0456 },
    { name: 'אנדרטת הנעליים', he: '', category: 'attractions', emoji: '👞', day: 1, desc: 'אנדרטה מרגשת על שפת הנהר.', lat: 47.5040, lng: 19.0447 },
    { name: 'מצודת בודה', he: 'Buda Castle', category: 'attractions', emoji: '🏰', day: 2, desc: 'העיר העתיקה על הגבעה בצד בודה.', lat: 47.4962, lng: 19.0397 },
    { name: 'כנסיית מטיאש', he: 'Matthias Church', category: 'attractions', emoji: '⛪', day: 2, desc: 'כנסייה ססגונית ומרשימה במצודה.', lat: 47.5020, lng: 19.0343 },
    { name: 'באסטיון הדייגים', he: "Fisherman's Bastion", category: 'attractions', emoji: '🔭', day: 2, desc: 'התצפית הכי יפה על העיר.', badge: 'תצפית', lat: 47.5025, lng: 19.0348 },
    { name: 'גשר השלשלאות', he: 'Chain Bridge', category: 'attractions', emoji: '🌉', day: 2, desc: 'הגשר המפורסם בין בודה לפשט.', lat: 47.4986, lng: 19.0436 },
    { name: 'האי מרגיט', he: 'Margaret Island', category: 'attractions', emoji: '🌳', day: 2, desc: 'פארק ירוק וגן יפני על הנהר.', lat: 47.5265, lng: 19.0490 },
    { name: 'בית הכנסת הגדול', he: 'Dohány St.', category: 'attractions', emoji: '🕍', day: 3, desc: 'בית הכנסת הגדול באירופה, עם "עץ הזיכרון".', lat: 47.4956, lng: 19.0610 },
    { name: 'שדרות אנדראשי', he: 'Andrássy', category: 'attractions', emoji: '🏙️', day: 3, desc: 'השדרה היוקרתית ובניין האופרה.', lat: 47.5029, lng: 19.0610 },
    { name: 'כיכר הגיבורים', he: "Heroes' Square", category: 'attractions', emoji: '🗽', day: 3, desc: 'כיכר עצומה בקצה השדרה.', lat: 47.5150, lng: 19.0777 },
    { name: 'פארק העיר', he: 'Vajdahunyad', category: 'attractions', emoji: '🏯', day: 3, desc: 'פארק וטירה, סביב Vajdahunyad.', lat: 47.5169, lng: 19.0820 },
    { name: 'מוזיאון האשליות', he: 'Museum of Illusions', category: 'attractions', emoji: '🎡', day: 3, desc: 'אשליות אופטיות מהנות — אופציונלי.', lat: 47.4979, lng: 19.0577 },
    { name: 'Flippermúzeum', he: 'פינבול וארקייד', category: 'attractions', emoji: '🕹️', day: 3, desc: 'מוזיאון פינבול וארקייד לשחק בו — אופציונלי.', lat: 47.5156, lng: 19.0498 },
    { name: 'שיט שקיעה על הדנובה', he: '', category: 'attractions', emoji: '🚢', day: 4, desc: 'שעה על הנהר עם השקיעה. תחנה: Vigadó tér.', badge: 'שקיעה', lat: 47.4956, lng: 19.0490 },
    { name: 'השוק המרכזי', he: 'Central Market', category: 'attractions', emoji: '🏬', day: 5, desc: 'שוק מקורה יפהפה — פפריקה ומזכרות.', lat: 47.4875, lng: 19.0586 },
    { name: 'בזיליקת סנט סטפן', he: "St. Stephen's", category: 'attractions', emoji: '⛪', day: 5, desc: 'עלייה לתצפית הגג — נוף עוצר נשימה.', badge: 'תצפית', lat: 47.5008, lng: 19.0537 },

    // שופינג
    { name: 'רחוב Váci', he: '', category: 'shopping', emoji: '🛍️', day: 1, desc: 'רחוב הקניות המרכזי וההיסטורי.', lat: 47.4930, lng: 19.0530 },
    { name: 'Arena Mall', he: '', category: 'shopping', emoji: '🏬', day: 4, desc: 'קניון גדול עם Primark ומותגים. מטרו M2.', lat: 47.5030, lng: 19.0997 },
    { name: 'Fashion Street', he: '', category: 'shopping', emoji: '👗', day: 5, desc: 'רחוב אופנה עם אווירה פריזאית.', lat: 47.4966, lng: 19.0525 },

    // מתוקים
    { name: "Molnár's", he: 'קיורטוש', category: 'sweets', emoji: '🍩', day: 1, desc: 'הקיורטוש (עוגת ארובה) הכי טוב.' },
    { name: 'Ghraoui', he: '', category: 'sweets', emoji: '🍫', day: 4, desc: 'פרלינים יוקרתיים.' },
    { name: 'Stühmer', he: '', category: 'sweets', emoji: '🍬', day: 4, desc: 'שוקולד הונגרי קלאסי.' },

    // בילוי
    { name: 'Szimpla Kert', he: '', category: 'nightlife', emoji: '🍺', day: 2, desc: 'ה"ריאין-בר" המפורסם ברובע היהודי.', badge: 'ריאין-בר', lat: 47.4970, lng: 19.0637 },
  ],
};

export default budapest2026;
