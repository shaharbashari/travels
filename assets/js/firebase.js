// ============================================================================
//  firebase.js — אתחול Firebase (רק אם data/firebase-config.js הוגדר אמיתית).
//  אם לא הוגדר — האתר רץ ב"מצב מקומי" (seed + localStorage) ללא Firebase.
//  משתמש ב-SDK המודולרי מ-CDN (ללא build step).
// ============================================================================
import config from '../../data/firebase-config.js';

const looksReal = (c) =>
  !!c && !!c.apiKey && !!c.projectId &&
  !String(c.apiKey).includes('YOUR_') && !String(c.projectId).includes('YOUR_');

export const configured = looksReal(config);

const V = '10.12.5';
const CDN = (m) => `https://www.gstatic.com/firebasejs/${V}/firebase-${m}.js`;

let _app = null, _db = null, _auth = null;
export const dbRef = () => _db;
export const authRef = () => _auth;

// נפתר פעם אחת; מחזיר גם את פונקציות ה-SDK כדי שמודולים אחרים לא ייבאו שוב.
export const firebaseReady = (async () => {
  if (!configured) return { configured: false };
  try {
    const [appMod, fs, au] = await Promise.all([
      import(CDN('app')),
      import(CDN('firestore')),
      import(CDN('auth')),
    ]);
    _app = appMod.initializeApp(config);
    _db = fs.getFirestore(_app);
    _auth = au.getAuth(_app);
    return { configured: true, app: _app, db: _db, auth: _auth, fs, au };
  } catch (e) {
    console.warn('[firebase] init failed — running in local mode.', e);
    return { configured: false, error: e };
  }
})();
