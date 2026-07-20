# מבנה הנתונים של טיול · Tour Data Schema

כל טיול הוא אובייקט JavaScript שמיוצא כברירת מחדל מקובץ תחת `data/tours/`.
שדות עם `?` הם אופציונליים. הערכים כאן הם דוגמאות.

## שדות ברמת הטיול

| שדה | סוג | חובה | תיאור |
|------|------|:---:|--------|
| `id` | string | ✅ | מזהה ייחודי, kebab-case, זהה לשם הקובץ. |
| `status?` | `'upcoming'\|'active'\|'past'` | | מחושב אוטומטית מהתאריכים; אפשר לדרוס. |
| `order?` | number | | סדר ברשימת הטיולים (קטן→גדול). |
| `destination` | `{city, country, flag?}` | ✅ | יעד הטיול. `flag` = אימוג׳י דגל. |
| `title` | string | ✅ | שם הטיול (כותרת ראשית). |
| `subtitle?` | string | | תת-כותרת קצרה. |
| `dates` | `{start, end}` | ✅ | פורמט `'YYYY-MM-DD'`. |
| `travelers?` | string[] | | שמות הנוסעים (מוצגים כצ׳יפים). |
| `theme?` | `{accent?, accent2?, gold?}` | | צבעים ייחודיים לטיול (עתידי). |
| `emoji?` | string | | אימוג׳י מייצג. |
| `summary?` | string | | פסקת תיאור. |
| `flights?` | `Flight[]` | | ראו למטה. |
| `transfer?` | `{name, note?}` | | הסעה משדה התעופה. |
| `hotel?` | `Hotel` | | ראו למטה. |
| `weather?` | `Weather` | | ראו למטה. |
| `packing?` | `PackBox[]` | | רשימות אריזה לפי קטגוריה. |
| `transport?` | `TransportSection[]` | | מדריך תחבורה. |
| `transportTips?` | string[] | | טיפים לתחבורה. |
| `hero?` | string | | כתובת תמונת נושא (URL) — רקע ה-hero ובכרטיס הטיול. |
| `money?` | `{currency, rate?, cards?, tipping?, notes?}` | | כספים ומטבע. |
| `connectivity?` | string[] | | טיפים לתקשורת/אינטרנט. |
| `budget?` | `{label, value}[]` | | תקציב יומי משוער. |
| `emergency?` | `{label, value}[]` | | טלפוני חירום. |
| `apps?` | `{name, desc?}[]` | | אפליקציות שימושיות. |
| `beforeYouGo?` | string[] | | צ׳קליסט לפני הנסיעה. |
| `photoCredits?` | `{t, by, lic, src}[]` | | קרדיטים לתמונות (חובה ל-CC-BY/CC-BY-SA). |
| `phrasebook?` | `Phrase[]` | | שיחון. |
| `days` | `Day[]` | ✅ | המסלול היומי. |
| `places?` | `Place[]` | | מקומות ל"מה עושים" ולמפה. |

## טיפוסים משניים

### Flight
```
{ direction:'outbound'|'return', label, airline, flightNo,
  from:{code, city, airport?}, to:{code, city, airport?},
  date:'YYYY-MM-DD', depart:'HH:MM', arrive?:'HH:MM'|null, note? }
```

### Hotel
```
{ name, address, lat?, lng?, mapUrl?, nights? }
```
`lat`/`lng` — קואורדינטות; אם קיימות, המלון מופיע על המפה (סיכה זהובה).

### Weather
```
{ month, day:'20–25°', night:'12–15°', summary, notes: string[] }
```

### PackBox
```
{ title, emoji?, items: string[], note? }
```

### TransportSection
```
{ title, emoji?, items: [ { name, badge?, desc?, price? } ] }
```

### Phrase
```
{ he, local, translit }   // עברית · שפת היעד · תעתיק בעברית
```

### Day
```
{ index:number, date:'YYYY-MM-DD', title, subtitle?,
  transport?: string[], lodging?: string,
  items: DayItem[] }
```

### DayItem
```
{ period?:'בוקר'|'צהריים'|'אחר הצהריים'|'ערב',
  time?:'HH:MM', emoji?, title, desc?, place? }
```
`period` מקבץ פריטים בציר הזמן. `place` — שם שמתאים ל-`name` של Place ויוצר קישור ל"מה עושים".

### Place
```
{ name, he?, category, emoji?, day?, desc?, badge?,
  img?, hours?, price?, tip?, lat?, lng? }
```
`category` ∈ `attractions` · `restaurants` · `sweets` · `baths` · `shopping` · `nightlife`
(מוגדר ב-`assets/js/util.js` → `CATEGORIES`; שם אפשר להוסיף קטגוריות חדשות).
`img` — כתובת תמונה (URL). מוצגת בכרטיס המקום, בציר הזמן ובחלון המפה; אם חסרה/נכשלת מוצג אימוג׳י.
`hours` / `price` / `tip` — שעות פתיחה, מחיר וטיפ (מוצגים כצ׳יפים/הערה).
אם קיימים `lat`/`lng` — המקום מופיע על המפה.
