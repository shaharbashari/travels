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
  apiKey: 'AIzaSyBsjU_9hEeH8c2bMPJzXwDRwJxoc2NeFZk',
  authDomain: 'hadar-travels.firebaseapp.com',
  projectId: 'hadar-travels',
  storageBucket: 'hadar-travels.firebasestorage.app',
  messagingSenderId: '367571481203',
  appId: '1:367571481203:web:91dd20d27fa293d5003006',
  measurementId: 'G-V7XD522EB0',
};

export default firebaseConfig;
