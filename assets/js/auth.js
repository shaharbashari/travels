// ============================================================================
//  auth.js — התחברות Google + הרשאות עריכה.
//  עורכים מורשים: hadarlap@gmail.com, shahar.bashari@gmail.com בלבד.
//  ללא Firebase מוגדר → "מצב עריכה מקומי" (נשמר רק בדפדפן הזה).
// ============================================================================
import { firebaseReady, configured } from './firebase.js';

export const EDITOR_EMAILS = ['hadarlap@gmail.com', 'shahar.bashari@gmail.com'];
export function isEditor(email) {
  return !!email && EDITOR_EMAILS.includes(String(email).toLowerCase());
}

let _user = null;        // { email, name, photo, verified }
let _localEdit = false;  // fallback עריכה מקומית כשאין Firebase
const subs = new Set();
function notify() { subs.forEach((f) => { try { f(); } catch {} }); }

export function onAuthChange(fn) { subs.add(fn); return () => subs.delete(fn); }
export function getUser() { return _user; }
export const isConfigured = () => configured;

export function canEdit() {
  if (configured) return !!(_user && isEditor(_user.email));
  return _localEdit;
}

/** מצב נוכחי לצריכת ה-UI. */
export function state() {
  return { configured, user: _user, localEdit: _localEdit, canEdit: canEdit(), emails: EDITOR_EMAILS };
}

export async function initAuth() {
  if (!configured) {
    try { _localEdit = localStorage.getItem('travels_localedit') === '1'; } catch {}
    notify();
    return;
  }
  const r = await firebaseReady;
  if (!r.configured) { notify(); return; }
  r.au.onAuthStateChanged(r.auth, (u) => {
    _user = u ? { email: u.email, name: u.displayName, photo: u.photoURL, verified: u.emailVerified } : null;
    notify();
  });
}

export async function signIn() {
  if (!configured) {
    _localEdit = true;
    try { localStorage.setItem('travels_localedit', '1'); } catch {}
    notify();
    return;
  }
  const r = await firebaseReady;
  const provider = new r.au.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await r.au.signInWithPopup(r.auth, provider);
  } catch (e) {
    console.warn('[auth] sign-in failed', e);
    alert('ההתחברות נכשלה: ' + (e?.message || e));
  }
}

export async function signOut() {
  if (!configured) {
    _localEdit = false;
    try { localStorage.removeItem('travels_localedit'); } catch {}
    notify();
    return;
  }
  const r = await firebaseReady;
  await r.au.signOut(r.auth);
}
