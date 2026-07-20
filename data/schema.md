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
{ name, he?, category, emoji?, day?, desc?, badge?, lat?, lng? }
```
`category` ∈ `attractions` · `restaurants` · `shopping` · `sweets` · `nightlife`
(מוגדר ב-`assets/js/util.js` → `CATEGORIES`; שם אפשר להוסיף קטגוריות חדשות).
אם קיימים `lat`/`lng` — המקום מופיע על המפה.
