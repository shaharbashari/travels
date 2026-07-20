// ============================================================================
//  Firebase config (PUBLIC — safe to commit; these are client keys, not secrets)
//  ----------------------------------------------------------------------------
//  האתר עובד גם בלי זה (קריאה-בלבד מנתוני ה-seed + עריכה מקומית בדפדפן).
//  כדי להפעיל התחברות Google + שמירה בענן המשותפת:
//   1. צרו פרויקט חינמי ב-https://console.firebase.google.com
//   2. Build → Firestore Database → Create (production mode)
//   3. Build → Authentication → Sign-in method → הפעילו Google
//   4. Authentication → Settings → Authorized domains → הוסיפו:
//        shaharbashari.github.io   (וגם localhost לפיתוח)
//   5. Project settings → General → "Your apps" → Web app → העתיקו את firebaseConfig
//      והדביקו כאן במקום הערכים למטה.
//   6. פרסמו את חוקי האבטחה מהקובץ firestore.rules (Firestore → Rules → Publish).
//  רק hadarlap@gmail.com ו-shahar.bashari@gmail.com יוכלו לערוך (ראו firestore.rules).
// ============================================================================

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

export default firebaseConfig;
