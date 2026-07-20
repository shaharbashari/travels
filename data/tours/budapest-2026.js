// ============================================================================
//  טיול: בודפשט 2026
//  ----------------------------------------------------------------------------
//  זהו קובץ תוכן בלבד (data). כדי לערוך את הטיול – שנו את הערכים כאן.
//  כדי להוסיף טיול חדש – העתיקו את data/tours/_template.js וקִראו את README.md.
//  המבנה המלא של האובייקט מתועד ב-data/schema.md.
// ============================================================================

// ---- תמונות (Wikimedia Commons, רישיון חופשי). ראו photoCredits בהמשך. ----
const P = {
  hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Budapest_Danube_panorama_1.jpg/1280px-Budapest_Danube_panorama_1.jpg',
  parliament: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Parliament_Building_Budapest_Hungary.jpg/500px-Parliament_Building_Budapest_Hungary.jpg',
  fishermans: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Fisherman%27s_Bastion_2014.jpg/500px-Fisherman%27s_Bastion_2014.jpg',
  budacastle: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Buda_Castle_%28Royal_Palace%29_from_across_the_Danube%2C_Budapest_%282025%29.jpg/500px-Buda_Castle_%28Royal_Palace%29_from_across_the_Danube%2C_Budapest_%282025%29.jpg',
  chainbridge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sz%C3%A9chenyi_Chain_Bridge_in_Budapest_at_night.jpg/500px-Sz%C3%A9chenyi_Chain_Bridge_in_Budapest_at_night.jpg',
  basilica: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/St._Stephen%27s_Basilica_Budapest_%2814703750557%29.jpg/500px-St._Stephen%27s_Basilica_Budapest_%2814703750557%29.jpg',
  matthias: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Matthias_Church_2014_01.jpg/500px-Matthias_Church_2014_01.jpg',
  heroes: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Budapest_Heroes_square_II_Andras.jpg/500px-Budapest_Heroes_square_II_Andras.jpg',
  vajdahunyad: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Vajdahunyad_v%C3%A1ra_Budapest_September_2013.jpg/500px-Vajdahunyad_v%C3%A1ra_Budapest_September_2013.jpg',
  market: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Light_streaming_into_the_interior_of_Budapest_Great_Market_Hall%2C_Winter_2010.jpg/500px-Light_streaming_into_the_interior_of_Budapest_Great_Market_Hall%2C_Winter_2010.jpg',
  synagogue: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Dohany-Street-Synagogue-Budapest.jpg/500px-Dohany-Street-Synagogue-Budapest.jpg',
  opera: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Hungarian_State_Opera._Monument_ID_695._The_fa%C3%A7ade%27s_composer_statues._Statues_of_Claudio_Monteverdi_by_J%C3%B3zsef_Isp%C3%A1nki_%26_Scarlatti_by_Dezs%C5%91_Gy%C5%91ri._-_Budapest_District_VI._Andr%C3%A1ssy_Ave_22.jpg/500px-thumbnail.jpg',
  szechenyibath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Budapest_Sz%C3%A9chenyi_Baths_R04.jpg/500px-Budapest_Sz%C3%A9chenyi_Baths_R04.jpg',
  gellertbath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Budapest_Gell%C3%A9rt_Thermal_Bath_%2854330017385%29.jpg/500px-Budapest_Gell%C3%A9rt_Thermal_Bath_%2854330017385%29.jpg',
  shoes: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Girl_contemplates_Shoes_on_the_Danube_Bank_%28Budapest%2C_Hungary%29.jpg/500px-Girl_contemplates_Shoes_on_the_Danube_Bank_%28Budapest%2C_Hungary%29.jpg',
  margaret: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Margaret_Island_2014.jpg/500px-Margaret_Island_2014.jpg',
  szimpla: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Szimpla_Kert_Ruin_Bar_Trabant_%2829100178258%29.jpg/500px-Szimpla_Kert_Ruin_Bar_Trabant_%2829100178258%29.jpg',
  newyorkcafe: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Interior_of_New_York_Palace%2C_Cafe_Budapest_%288344808702%29.jpg/500px-Interior_of_New_York_Palace%2C_Cafe_Budapest_%288344808702%29.jpg',
  gerbeaud: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Budapest%2C_Gerbeaud-h%C3%A1z.jpg/500px-Budapest%2C_Gerbeaud-h%C3%A1z.jpg',
  vaci: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Vaci_utca_2014_2.jpg/500px-Vaci_utca_2014_2.jpg',
  kurtos: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Oreo_chimney_cake_-_Yummy_K%C5%A9rt%C3%B5s_2025-04-10.jpg/500px-Oreo_chimney_cake_-_Yummy_K%C5%A9rt%C3%B5s_2025-04-10.jpg',
  gellerthill: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Liberty_Statue_at_The_Citadella_on_Gellert_Hill_%2842972655021%29.jpg/500px-Liberty_Statue_at_The_Citadella_on_Gellert_Hill_%2842972655021%29.jpg',
};

// קרדיטים לצילומים — כולם ברישיון חופשי (CC / נחלת הכלל) מ-Wikimedia Commons.
const photoCredits = [
  { t: 'בודפשט – פנורמה על הדנובה', by: 'Karelj', lic: 'Public domain', src: 'https://commons.wikimedia.org/wiki/File:Budapest_Danube_panorama_1.jpg' },
  { t: 'בניין הפרלמנט', by: 'Ercsaba74', lic: 'Public domain', src: 'https://commons.wikimedia.org/wiki/File:Parliament_Building_Budapest_Hungary.jpg' },
  { t: 'באסטיון הדייגים', by: 'Perituss', lic: 'CC0', src: 'https://commons.wikimedia.org/wiki/File:Fisherman%27s_Bastion_2014.jpg' },
  { t: 'מצודת בודה', by: 'Paul Colin Hennig', lic: 'CC BY-SA 4.0', src: 'https://commons.wikimedia.org/wiki/File:Buda_Castle_(Royal_Palace)_from_across_the_Danube,_Budapest_(2025).jpg' },
  { t: 'גשר השלשלאות', by: 'Wilfredor', lic: 'CC0', src: 'https://commons.wikimedia.org/wiki/File:Sz%C3%A9chenyi_Chain_Bridge_in_Budapest_at_night.jpg' },
  { t: 'בזיליקת סנט סטפן', by: 'Benjamin Balázs', lic: 'CC0', src: 'https://commons.wikimedia.org/wiki/File:St._Stephen%27s_Basilica_Budapest_(14703750557).jpg' },
  { t: 'כנסיית מטיאש', by: 'Perituss', lic: 'CC0', src: 'https://commons.wikimedia.org/wiki/File:Matthias_Church_2014_01.jpg' },
  { t: 'כיכר הגיבורים', by: 'Karelj', lic: 'Public domain', src: 'https://commons.wikimedia.org/wiki/File:Budapest_Heroes_square_II_Andras.jpg' },
  { t: 'טירת ויידהוניאד · פארק העיר', by: 'Felix König', lic: 'CC BY 3.0', src: 'https://commons.wikimedia.org/wiki/File:Vajdahunyad_v%C3%A1ra_Budapest_September_2013.jpg' },
  { t: 'השוק המרכזי', by: 'Erudy', lic: 'Public domain', src: 'https://commons.wikimedia.org/wiki/File:Light_streaming_into_the_interior_of_Budapest_Great_Market_Hall,_Winter_2010.jpg' },
  { t: 'בית הכנסת הגדול', by: 'Acediscovery', lic: 'CC BY 4.0', src: 'https://commons.wikimedia.org/wiki/File:Dohany-Street-Synagogue-Budapest.jpg' },
  { t: 'בית האופרה · שדרות אנדראשי', by: 'Globetrotter19', lic: 'CC BY-SA 4.0', src: 'https://commons.wikimedia.org/wiki/File:Hungarian_State_Opera._Monument_ID_695.' },
  { t: 'מרחצאות סצ׳ני', by: 'Marc Ryckaert (MJJR)', lic: 'CC BY 3.0', src: 'https://commons.wikimedia.org/wiki/File:Budapest_Sz%C3%A9chenyi_Baths_R04.jpg' },
  { t: 'מרחצאות גלרט', by: 'Jorge Franganillo', lic: 'CC BY 2.0', src: 'https://commons.wikimedia.org/wiki/File:Budapest_Gell%C3%A9rt_Thermal_Bath_(54330017385).jpg' },
  { t: 'אנדרטת הנעליים', by: 'Jules Verne Times Two', lic: 'CC BY-SA 4.0', src: 'https://commons.wikimedia.org/wiki/File:Girl_contemplates_Shoes_on_the_Danube_Bank_(Budapest,_Hungary).jpg' },
  { t: 'האי מרגיט', by: 'Perituss', lic: 'CC0', src: 'https://commons.wikimedia.org/wiki/File:Margaret_Island_2014.jpg' },
  { t: 'Szimpla Kert', by: 'Nan Palmero', lic: 'CC BY 2.0', src: 'https://commons.wikimedia.org/wiki/File:Szimpla_Kert_Ruin_Bar_Trabant_(29100178258).jpg' },
  { t: 'New York Café', by: 'Sandy Horvath-Dori', lic: 'CC BY 2.0', src: 'https://commons.wikimedia.org/wiki/File:Interior_of_New_York_Palace,_Cafe_Budapest_(8344808702).jpg' },
  { t: 'Café Gerbeaud', by: 'Random photos 1989', lic: 'CC0', src: 'https://commons.wikimedia.org/wiki/File:Budapest,_Gerbeaud-h%C3%A1z.jpg' },
  { t: 'רחוב Váci', by: 'Perituss', lic: 'CC0', src: 'https://commons.wikimedia.org/wiki/File:Vaci_utca_2014_2.jpg' },
  { t: 'קִיוּרְטוֹשׁ קָלָאץ׳', by: 'Andy Li', lic: 'CC0', src: 'https://commons.wikimedia.org/wiki/File:Oreo_chimney_cake_-_Yummy_K%C5%A9rt%C3%B5s_2025-04-10.jpg' },
  { t: 'גבעת גלרט והציטדלה', by: 'Nan Palmero', lic: 'CC BY 2.0', src: 'https://commons.wikimedia.org/wiki/File:Liberty_Statue_at_The_Citadella_on_Gellert_Hill_(42972655021).jpg' },
];

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

  // תמונת נושא — פנורמת בודפשט על הדנובה (Wikimedia Commons, נחלת הכלל)
  hero: P.hero,
  emoji: '🏛️',
  photoCredits,

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

  // ---- כספים ומטבע -------------------------------------------------------
  money: {
    currency: 'פורינט הונגרי · HUF (Ft)',
    rate: '1,000 HUF ≈ 10–11 ₪ (בקירוב; בדקו שער עדכני)',
    cards: 'כרטיסי אשראי מתקבלים כמעט בכל מקום — כולל תחבורה וחנויות קטנות.',
    tipping: 'טיפ מקובל 10%–12% במסעדות; בדקו אם כבר נוסף "service charge" לחשבון.',
    notes: [
      'מושכים מזומן מכספומט של בנק (OTP, K&H, Erste) — לא ממכונות Euronet הצהובות (עמלות גבוהות).',
      'תמיד בוחרים לחייב ב-HUF ולא בשקלים/יורו (שער ההמרה שלהם גרוע).',
      'שומרים מעט מזומן קטן לשווקים, לדוכני לנגוש ולטיפים.',
    ],
  },

  // ---- תקשורת ואינטרנט ---------------------------------------------------
  connectivity: [
    'eSIM זול ונוח (Airalo / Holafly וכו׳) — מפעילים לפני הנסיעה ומגיעים עם אינטרנט מהרגע הראשון.',
    'הונגריה באיחוד האירופי — חבילת גלישה אירופית עובדת מצוין.',
    'Wi-Fi חופשי כמעט בכל בית קפה, מסעדה ומלון.',
    'מורידים מראש מפת Google לא-מקוונת של בודפשט ואת אפליקציית BudapestGO.',
  ],

  // ---- תקציב משוער ליום (לאדם) -------------------------------------------
  budget: [
    { label: 'ארוחות (צהריים + ערב + נשנוש)', value: '15,000–25,000 HUF · ≈ 160–260 ₪' },
    { label: 'תחבורה ציבורית', value: '≈ 2,500 HUF (Travelcard יומי) · ≈ 26 ₪' },
    { label: 'כניסות ואטרקציות', value: '5,000–15,000 HUF · ≈ 50–160 ₪' },
    { label: 'קפה, מתוקים ומזכרות', value: '3,000–6,000 HUF · ≈ 32–63 ₪' },
  ],

  // ---- טלפונים לשעת חירום ------------------------------------------------
  emergency: [
    { label: 'חירום כללי (משטרה · אמבולנס · כבאות)', value: '112' },
    { label: 'משטרה', value: '107' },
    { label: 'אמבולנס', value: '104' },
    { label: 'שגרירות ישראל בבודפשט', value: '+36-1-461-6800' },
  ],

  // ---- אפליקציות שימושיות ------------------------------------------------
  apps: [
    { name: 'Bolt', desc: 'מוניות זולות ומהירות — הכי שימושי בעיר.' },
    { name: 'BudapestGO', desc: 'התחבורה הציבורית הרשמית — מסלולים וכרטיסים דיגיטליים.' },
    { name: 'Google Maps', desc: 'ניווט; מורידים מפה לא-מקוונת מראש.' },
    { name: 'Google Translate', desc: 'הונגרית לא-מקוונת + תרגום מצלמה לתפריטים.' },
    { name: 'Revolut / Wise', desc: 'תשלום והמרת מטבע בשער טוב, בלי עמלות מיותרות.' },
  ],

  // ---- לפני שיוצאים (צ׳קליסט) --------------------------------------------
  beforeYouGo: [
    'להזמין מראש: סיור בפרלמנט, מסעדת Twentysix, ואם רוצים — סיור בבית הכנסת הגדול.',
    'לבדוק את שעת השקיעה ולהזמין שיט שמסתיים בשעה הזהובה.',
    'להתקין eSIM ולהוריד מפות לא-מקוונות + BudapestGO.',
    'לוודא תוקף דרכון וביטוח נסיעות תקף.',
    'לשמור אישורי טיסה, מלון והזמנות — בטלפון וגם מודפס.',
    'למשוך מעט מזומן HUF ליום הראשון (מונית / דוכנים).',
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
        { period: 'אחר הצהריים', emoji: '🗻', title: 'אופציונלי: שקיעה מגבעת גלרט', desc: 'טיפוס קצר אל פסל החירות והציטדלה — התצפית הפנורמית השלמה על שני חלקי העיר, קסום במיוחד לקראת השקיעה.', place: 'גבעת גלרט והציטדלה' },
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
        { period: 'אחר הצהריים', emoji: '🧖', title: 'אופציונלי: מרחצאות סצ׳ני', desc: 'הבריכות התרמיות המפורסמות נמצאות ממש בפארק העיר — הזדמנות מושלמת להירגע במים החמים בין הסיורים.', place: 'מרחצאות סצ׳ני' },
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
  // category: attractions | restaurants | sweets | baths | shopping | nightlife
  // שדות אופציונליים לכל מקום: img, hours, price, tip, badge, lat, lng
  places: [
    // מסעדות
    { name: 'Kiosk', he: 'קיוסק', category: 'restaurants', emoji: '🍽️', day: 1, desc: 'ביסטרו אירופאי תוסס בכיכר Március 15, צעד מהדנובה — מושלם לצהריים ראשון בעיר.', lat: 47.4931, lng: 19.0522 },
    { name: 'Hard Rock Café', he: '', category: 'restaurants', emoji: '🎸', day: 1, desc: 'המבורגרים ואווירה אמריקאית במרכז, ליד הבזיליקה.', lat: 47.5007, lng: 19.0524 },
    { name: 'Sir Lancelot', he: '', category: 'restaurants', emoji: '⚔️', day: 2, desc: 'מסעדת אבירים ימי-ביניימית עם מנות ענק ומופע חי — חוויה שלמה.', tip: 'כדאי להזמין שולחן מראש, במיוחד לערב עם מופע.', lat: 47.5060, lng: 19.0609 },
    { name: 'Paprika', he: '', category: 'restaurants', emoji: '🌶️', day: 3, desc: 'אוכל הונגרי ביתי ואותנטי (גולאש, לנגוש) בסמוך לכיכר הגיבורים.', lat: 47.5138, lng: 19.0765 },
    { name: 'Twentysix', he: '', category: 'restaurants', emoji: '🌴', day: 3, desc: "מסעדה שכולה ג'ונגל אורבני עם צמחייה עד התקרה — יפהפייה ומצטלמת.", badge: 'להזמין מראש', tip: 'מהמקומות הכי מבוקשים בעיר — הזמינו מקום כמה ימים מראש.', lat: 47.5028, lng: 19.0509 },
    { name: 'Mazel Tov', he: '', category: 'restaurants', emoji: '🥙', day: 4, desc: 'אוכל ים-תיכוני בריא בחצר ruin-bar מוארת נורות — מהמקומות האהובים ברובע היהודי.', badge: 'להזמין מראש', lat: 47.4972, lng: 19.0616 },
    { name: 'Bamba Marha', he: '', category: 'restaurants', emoji: '🍔', day: 5, desc: 'רשת ההמבורגרים ההונגרית האהובה — עסיסי וטרי, צעד מהבזיליקה.', lat: 47.5006, lng: 19.0530 },

    // אתרים
    { name: 'בניין הפרלמנט', he: 'Parliament', category: 'attractions', emoji: '🏛️', day: 1, img: P.parliament, desc: 'סמל העיר — ארמון ניאו-גותי מפואר על גדת הדנובה, שלישי בגודלו בעולם.', price: 'סיור מודרך ≈ 12,000 HUF', tip: 'כרטיסי הסיור אוזלים מראש — הזמינו אונליין באתר הרשמי (jegymester).', badge: 'להזמין מראש', lat: 47.5072, lng: 19.0456 },
    { name: 'אנדרטת הנעליים', he: 'Shoes on the Danube', category: 'attractions', emoji: '👞', day: 1, img: P.shoes, desc: '60 זוגות נעליים מברזל על שפת הנהר — אנדרטה מצמררת לזכר יהודי בודפשט.', lat: 47.5040, lng: 19.0447 },
    { name: 'מצודת בודה', he: 'Buda Castle', category: 'attractions', emoji: '🏰', day: 2, img: P.budacastle, desc: 'הארמון המלכותי על גבעת בודה — סמטאות, חצרות ונוף פנורמי לפשט.', tip: 'עולים ברכבל (Sikló) מכיכר קלארק, או באוטובוס 16 — חוסך טיפוס.', lat: 47.4962, lng: 19.0397 },
    { name: 'כנסיית מטיאש', he: 'Matthias Church', category: 'attractions', emoji: '⛪', day: 2, img: P.matthias, desc: 'כנסייה גותית עם גג רעפים ססגוני ופנים מעוטר להפליא, בלב מצודת בודה.', price: 'כניסה ≈ 2,900 HUF', lat: 47.5020, lng: 19.0343 },
    { name: 'באסטיון הדייגים', he: "Fisherman's Bastion", category: 'attractions', emoji: '🔭', day: 2, img: P.fishermans, desc: 'מגדלים לבנים כמו מתוך אגדה, עם התצפית הכי יפה על הפרלמנט והדנובה.', badge: 'תצפית', price: 'צריחים עליונים ≈ 1,500 HUF · הטרסה התחתונה חינם', tip: 'מגיעים מוקדם בבוקר — כמעט ריק והאור זהוב.', lat: 47.5025, lng: 19.0348 },
    { name: 'גשר השלשלאות', he: 'Chain Bridge', category: 'attractions', emoji: '🌉', day: 2, img: P.chainbridge, desc: 'הגשר האייקוני של בודפשט עם האריות — יפה במיוחד כשנדלק באורות בלילה.', lat: 47.4986, lng: 19.0436 },
    { name: 'האי מרגיט', he: 'Margaret Island', category: 'attractions', emoji: '🌳', day: 2, img: P.margaret, desc: 'ריאה ירוקה באמצע הדנובה — מזרקה מוזיקלית, גן יפני וחורבות מנזר.', tip: 'אפשר לשכור אופניים זוגיים (Bringóhintó) ולהקיף את האי.', lat: 47.5265, lng: 19.0490 },
    { name: 'בית הכנסת הגדול', he: 'Dohány St.', category: 'attractions', emoji: '🕍', day: 3, img: P.synagogue, desc: 'בית הכנסת הגדול באירופה (מבנה מרהיב בסגנון מורי), עם מוזיאון ו"עץ הזיכרון".', price: 'כניסה ≈ 9,000 HUF (כולל סיור)', tip: 'הכניסה כוללת סיור מודרך — שווה מאוד.', lat: 47.4956, lng: 19.0610 },
    { name: 'שדרות אנדראשי', he: 'Andrássy', category: 'attractions', emoji: '🏙️', day: 3, img: P.opera, desc: 'השדרה היוקרתית (אתר מורשת עולמית) — בית האופרה, בוטיקים ובתי קפה.', lat: 47.5029, lng: 19.0610 },
    { name: 'כיכר הגיבורים', he: "Heroes' Square", category: 'attractions', emoji: '🗽', day: 3, img: P.heroes, desc: 'כיכר ענקית עם עמוד המילניום ופסלי מלכי הונגריה — הכי מרשימה בקצה השדרה.', lat: 47.5150, lng: 19.0777 },
    { name: 'פארק העיר', he: 'Városliget', category: 'attractions', emoji: '🏯', day: 3, img: P.vajdahunyad, desc: 'פארק העיר וטירת ויידהוניאד הרומנטית — אגם, גשרים ואווירה קסומה.', lat: 47.5169, lng: 19.0820 },
    { name: 'מוזיאון האשליות', he: 'Museum of Illusions', category: 'attractions', emoji: '🌀', day: 3, desc: 'אשליות אופטיות וחדרים מתעתעים — כיף ומצחיק לצילומים. אופציונלי.', price: 'כניסה ≈ 3,700 HUF', lat: 47.4979, lng: 19.0577 },
    { name: 'Flippermúzeum', he: 'פינבול וארקייד', category: 'attractions', emoji: '🕹️', day: 3, desc: 'מוזיאון פינבול חי — עשרות מכונות שאפשר לשחק בהן ללא הגבלה. אופציונלי.', price: 'כניסה חופשית למשחק ≈ 3,500 HUF', lat: 47.5156, lng: 19.0498 },
    { name: 'שיט שקיעה על הדנובה', he: 'Danube cruise', category: 'attractions', emoji: '🚢', day: 4, desc: 'שעה על הנהר בדיוק בשעה הזהובה — הפרלמנט והגשרים נדלקים באורות. תחנה: Vigadó tér.', badge: 'שקיעה', price: '≈ 6,000–9,000 HUF כולל משקה', tip: 'בודקים את שעת השקיעה ומזמינים שיט שמתחיל כ-30 דק׳ לפניה.', lat: 47.4956, lng: 19.0490 },
    { name: 'גבעת גלרט והציטדלה', he: 'Gellért Hill', category: 'attractions', emoji: '🗻', img: P.gellerthill, desc: 'הטיפוס אל פסל החירות והמצודה — התצפית הפנורמית הכי שלמה על שני חלקי העיר.', badge: 'תצפית', tip: 'מטפסים לקראת השקיעה — הנוף על הגשרים המוארים בלתי נשכח.', lat: 47.4869, lng: 19.0464 },
    { name: 'השוק המרכזי', he: 'Central Market', category: 'attractions', emoji: '🏬', day: 5, img: P.market, desc: 'שוק מקורה ניאו-גותי בן שלוש קומות — פפריקה, סלאמי, מזכרות ודוכני לנגוש למעלה.', hours: 'ב׳–ו׳ 06:00–18:00 · שבת עד 15:00 · א׳ סגור', tip: 'הקומה העליונה = דוכני אוכל וטוקאי; קונים פפריקה וטוקאי כמתנות.', lat: 47.4875, lng: 19.0586 },
    { name: 'בזיליקת סנט סטפן', he: "St. Stephen's", category: 'attractions', emoji: '⛪', day: 5, img: P.basilica, desc: 'הכנסייה הגדולה בבודפשט — פאר פנימי ותצפית 360° מהכיפה על כל העיר.', badge: 'תצפית', price: 'תצפית הכיפה ≈ 3,000 HUF', tip: 'תזמנו לשקיעה — האור על הגגות קסום.', lat: 47.5008, lng: 19.0537 },

    // מרחצאות תרמיים
    { name: 'מרחצאות סצ׳ני', he: 'Széchenyi', category: 'baths', emoji: '🧖', img: P.szechenyibath, desc: 'המרחצאות המפורסמים בעולם — ארמון צהוב ניאו-בארוק עם בריכות חוץ חמות ואדים בפארק העיר.', badge: 'חובה', price: 'כרטיס יום ≈ 12,000–13,000 HUF', tip: 'לוקחים כפכפים, כובע ים וכפפת שחייה; אפשר לשכור מגבת ולוקר במקום.', lat: 47.5188, lng: 19.0819 },
    { name: 'מרחצאות גלרט', he: 'Gellért', category: 'baths', emoji: '♨️', img: P.gellertbath, desc: 'פנינת ארט-נובו עם אריחי זולנאי, פסיפסים ובריכות מפוארות — האלגנטיים בעיר.', price: 'כרטיס יום ≈ 11,000 HUF', tip: 'בצד בודה, למרגלות גבעת גלרט — משלבים עם הטיפוס לציטדלה.', lat: 47.4835, lng: 19.0517 },

    // שופינג
    { name: 'רחוב Váci', he: 'Váci utca', category: 'shopping', emoji: '🛍️', day: 1, img: P.vaci, desc: 'רחוב הקניות המרכזי וההיסטורי — חנויות, קפה ואווירת מרכז תוססת.', lat: 47.4930, lng: 19.0530 },
    { name: 'Arena Mall', he: '', category: 'shopping', emoji: '🏬', day: 4, desc: 'קניון גדול עם Primark וכל המותגים — נגיש ישירות בקו המטרו M2.', lat: 47.5030, lng: 19.0997 },
    { name: 'Fashion Street', he: '', category: 'shopping', emoji: '👗', day: 5, desc: 'רחוב מותגים אלגנטי ליד הבזיליקה, עם אווירה פריזאית ובתי קפה.', lat: 47.4966, lng: 19.0525 },

    // מתוקים ובתי קפה
    { name: "Molnár's Kürtőskalács", he: 'קיורטוש', category: 'sweets', emoji: '🥮', day: 1, img: P.kurtos, desc: 'הקִיוּרְטוֹשׁ (עוגת הארובה) הכי טוב בעיר — נאפה טרי, מצופה סוכר/קינמון/אגוזים.', lat: 47.4927, lng: 19.0533 },
    { name: 'New York Café', he: '', category: 'sweets', emoji: '☕', img: P.newyorkcafe, desc: '"בית הקפה היפה בעולם" — אולם ניאו-בארוק מוזהב עם נברשות, קפה ועוגות.', badge: 'חובה', tip: 'תור ארוך — מגיעים עם הפתיחה (09:00) או אחה״צ מאוחר.', lat: 47.4972, lng: 19.0703 },
    { name: 'Café Gerbeaud', he: '', category: 'sweets', emoji: '🍰', img: P.gerbeaud, desc: 'ממתקייה אגדית מ-1858 בכיכר Vörösmarty — עוגות קלאסיות ואווירה מלכותית.', lat: 47.4966, lng: 19.0522 },
    { name: 'Ruszwurm', he: '', category: 'sweets', emoji: '🧁', desc: 'בית הקפה העתיק בעיר (1827) במצודת בודה — זעיר, קסום, עם שטרודל מפורסם.', tip: 'קטנטן ומבוקש — שווה להיכנס בין אתרי המצודה.', lat: 47.5018, lng: 19.0335 },
    { name: 'Ghraoui', he: '', category: 'sweets', emoji: '🍫', day: 4, desc: 'שוקולטייה יוקרתית עם פרלינים מעשה-יד ואריזות מהממות למתנות.', lat: 47.4990, lng: 19.0530 },
    { name: 'Stühmer', he: '', category: 'sweets', emoji: '🍬', day: 4, desc: 'מותג שוקולד הונגרי קלאסי ואהוב — מושלם לקנייה מהירה של מתוקים.', lat: 47.4966, lng: 19.0540 },

    // בילוי וברים
    { name: 'Szimpla Kert', he: 'Ruin Bar', category: 'nightlife', emoji: '🍺', day: 2, img: P.szimpla, desc: 'ה-ruin-bar המקורי והמפורסם — חצר תעשייתית עם ריהוט גרוטאות, אמנות ואווירה מטורפת.', badge: 'ריאין-בר', tip: 'הכי כיף בערב; ביום ראשון יש שוק איכרים בבוקר.', lat: 47.4970, lng: 19.0637 },
    { name: 'Gozsdu Udvar', he: '', category: 'nightlife', emoji: '🍸', desc: 'שדרת חצרות מקורה ברובע היהודי — שרשרת ברים, מסעדות ומוזיקה, לב חיי הלילה.', lat: 47.4972, lng: 19.0605 },
  ],
};

export default budapest2026;
