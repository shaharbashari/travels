# הטיולים של הדר · Hadar's Travels

יומן מסעות אישי — אתר רספונסיבי בעברית (RTL) לתכנון וצפייה בטיולים. מסלול יומי, טיסות, מלון, מזג אוויר, אריזה, תחבורה, שיחון ומפה אינטראקטיבית — לכל טיול. **אינטראקטיבי** (עמוד פרטים לכל מקום עם גלריה, טיפים וקישורים), **ניתן לעריכה מהדפדפן** (הוספת טיולים/מקומות בלחיצה) ועם **התחברות Google** לעורכים מורשים.

> **🌐 אתר חי:** `https://shaharbashari.github.io/travels/`

הטיול הראשון: **בודפשט 2026** 🇭🇺 (הדר ורז).

---

## ✨ למה זה בנוי ככה (מדריך למפתח / לסוכן הבא)

האתר **מבוסס-נתונים לחלוטין** וללא שלב build:

- **כל טיול הוא קובץ נתונים אחד** תחת `data/tours/`. כדי לשנות תוכן — עורכים את הקובץ. כדי להוסיף טיול — יוצרים קובץ חדש ורושמים אותו. זהו.
- **אין תלויות build / npm.** רק HTML, CSS ו-JavaScript (ES modules). המפה משתמשת ב-Leaflet מ-CDN.
- **הקוד (`assets/`) גנרי** — הוא מרנדר כל טיול שתואם לסכימה. בדרך כלל **לא צריך לגעת בו** כשמוסיפים טיול.

זה מאפשר לכל אחד (או לסוכן AI) להרחיב את האתר בבטחה בלי לשבור כלום.

---

## 📁 מבנה הפרויקט

```
travels/
├── index.html                 # שלד האפליקציה (טוען פונטים, Leaflet, והמודול הראשי)
├── .nojekyll                  # ל-GitHub Pages (מגיש קבצים שמתחילים ב-_ , מדלג על Jekyll)
├── firestore.rules            # חוקי אבטחה ל-Firestore (קריאה לכולם, כתיבה רק לעורכים)
├── README.md                  # הקובץ הזה
├── assets/
│   ├── css/
│   │   ├── styles.css         # מערכת העיצוב (טוקנים, רכיבים, רספונסיביות)
│   │   ├── detail.css         # עמוד פרטי מקום (גלריה, lightbox)
│   │   └── edit.css           # ממשק העריכה (כפתורי +, מודאלים) — לעורכים
│   ├── img/                   # favicon (איורי SVG מקוריים)
│   └── js/
│       ├── app.js             # נקודת כניסה: store+auth, topbar+טאבים, רינדור מסך
│       ├── store.js           # שכבת נתונים: seed + Firestore/localStorage (overlay) + CRUD
│       ├── auth.js            # התחברות Google + הרשאות עריכה (רשימת עורכים מורשים)
│       ├── firebase.js        # אתחול Firebase (רדום אם לא הוגדר — אז מצב מקומי)
│       ├── edit.js            # ממשק הוספה/עריכה (מוצג רק לעורכים)
│       ├── router.js          # ניתוב מבוסס-hash (כולל #/t/<id>/place/<placeId>)
│       ├── util.js            # תאריכים, קטגוריות, escaping, thumb(), pid/slug/iconFor
│       ├── svg.js             # קו רקיע SVG מקורי של בודפשט
│       └── views/             # מסך אחד לכל טאב + עמוד פרטי מקום
│           ├── trips.js  home.js  days.js  explore.js  map.js  info.js
│           └── place.js       #   עמוד פרטי מקום (גלריה, טיפים, קישורים, מפה קטנה)
└── data/
    ├── config.js              # הגדרות כלליות (שם האתר, סלוגן)
    ├── firebase-config.js     # קונפיג Firebase (ציבורי) — מלאו כדי להפעיל התחברות/ענן
    ├── schema.md              # תיעוד מלא של מבנה הנתונים של טיול
    └── tours/
        ├── index.js           # רישום הטיולים ⟵ מוסיפים כאן טיול חדש (בקוד)
        ├── _template.js       # תבנית לטיול חדש (להעתיק)
        └── budapest-2026.js   # נתוני טיול בודפשט (משמש כ-seed)
```

---

## ▶️ הרצה מקומית

צריך להגיש דרך שרת (ES modules לא עובדים מ-`file://`). כל שרת סטטי מתאים:

```powershell
cd travels
python -m http.server 8000
# פותחים בדפדפן: http://localhost:8000
```

---

## ➕ הוספת טיול חדש (3 צעדים)

1. **העתיקו את התבנית:**
   ```powershell
   Copy-Item data/tours/_template.js data/tours/paris-2027.js
   ```
2. **מלאו את הנתונים** ב-`paris-2027.js` (ראו `_template.js` ו-`data/schema.md`). ודאו ש-`id` זהה לשם הקובץ (`paris-2027`).
3. **רשמו את הטיול** ב-`data/tours/index.js`:
   ```js
   import paris2027 from './paris-2027.js';
   export const tours = [ budapest2026, paris2027 ];
   ```

רעננו — הטיול מופיע אוטומטית. אין צורך לגעת ב-`assets/`.

## ✏️ עריכת טיול קיים

יש **שתי דרכים** לערוך תוכן:

**א. מהדפדפן (הכי קל — להדר):** נכנסים לאתר, מתחברים (כפתור 🔑 בכותרת), ואז מופיעים כפתורי **➕** ועפרונות ✏️. אפשר להוסיף/לערוך טיולים, אטרקציות, מסעדות וכו׳ בטופס ידידותי — עם השלמה אוטומטית, מילוי אייקון אוטומטי, והצעות תמונה אוטומטיות (מ-Wikimedia). השינויים נשמרים בענן ומופיעים לכולם.

**ב. בקוד:** עורכים את הקובץ המתאים תחת `data/tours/` (למשל `budapest-2026.js`). קובץ ה-seed הוא נקודת ההתחלה; עריכות בענן "גוברות" עליו.

---

## 🔐 התחברות Google + עריכה בענן (הגדרה חד-פעמית)

האתר עובד **מיד** גם בלי הגדרה — קריאה לכולם, ו"מצב עריכה מקומי" שנשמר בדפדפן שלך בלבד. כדי להפעיל **התחברות Google** ו**שמירה משותפת בענן** (כך שרק `hadarlap@gmail.com` ו-`shahar.bashari@gmail.com` יוכלו לערוך, וכולם יראו את השינויים) — הגדירו Firebase פעם אחת (חינם):

1. צרו פרויקט ב-[Firebase Console](https://console.firebase.google.com) → **Add project**.
2. **Build → Firestore Database → Create database** (מצב Production).
3. **Build → Authentication → Get started → Sign-in method → Google → Enable**.
4. **Authentication → Settings → Authorized domains** → הוסיפו `shaharbashari.github.io` (ו-`localhost` לפיתוח).
5. **Project settings ⚙️ → General → Your apps → Web app (</>)** → צרו אפליקציית web והעתיקו את אובייקט `firebaseConfig`. הדביקו אותו ב-`data/firebase-config.js` (במקום ערכי ה-`YOUR_...`). זה מידע **ציבורי** — מותר להעלות ל-git.
6. **Firestore → Rules** → הדביקו את התוכן של `firestore.rules` (בשורש הריפו) → **Publish**. החוקים מרשים קריאה לכולם וכתיבה רק לשני המיילים.
7. `git push` — וזהו. לחצו 🔑 באתר, התחברו עם Google, וכפתורי העריכה יופיעו.

> רוצים להוסיף עורך? הוסיפו את המייל ב-**שני** מקומות: `EDITOR_EMAILS` ב-`assets/js/auth.js` וברשימה שב-`firestore.rules` (ואז Publish מחדש).

---

## 🚀 פריסה (GitHub Pages)

האתר מתארח ב-GitHub Pages מתוך ה-branch `main` (תיקיית שורש). **כל push ל-`main` מעדכן את האתר החי** תוך דקה-שתיים.

```powershell
git add -A
git commit -m "עדכון טיול"
git push
```

הפעלה חד-פעמית (אם צריך): Settings → Pages → Source = Deploy from a branch → `main` / root.

---

## 🎨 עיצוב וגישה

- **RTL + עברית** לאורך כל האתר; בהיר, צבעוני ומשחקי.
- **רספונסיבי:** בנייד — סרגל טאבים תחתון; בדסקטופ — ניווט עליון ופריסות רחבות.
- **תמיד בהיר** (ללא dark mode) — לפי בקשת המשתמשת.
- **נגישות:** HTML סמנטי, `dir="rtl"`, מצבי focus, כיבוד `prefers-reduced-motion`.
- **פונטים משחקיים:** Varela Round (כותרות), Rubik (גוף), Fredoka (מספרים/לועזי) — מ-Google Fonts.
- **תמונות:** צילומים אמיתיים ברישיון חופשי מ-Wikimedia Commons (עם קרדיטים בטאב "מידע"), עם נפילה חיננית לאימוג׳י אם תמונה חסרה. איורי SVG מקוריים ל-favicon/hero.

---

## 🧩 טכנולוגיה

Vanilla JS (ES modules) · CSS מודרני (custom properties, logical properties, `color-mix`) · Leaflet + OpenStreetMap למפה · **Firebase (Auth + Firestore)** להתחברות Google ולשמירה בענן (אופציונלי; נטען מ-CDN, ללא build) · ללא framework וללא שלב build.
