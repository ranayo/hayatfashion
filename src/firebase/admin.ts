// src/firebase/admin.ts
import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountLike = {
  project_id?: string;
  private_key?: string;
  client_email?: string;
  [k: string]: any;
};

// טוען את ה-Service Account מתוך .env.local (כשורה אחת)
const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount: ServiceAccountLike | undefined;

if (raw) {
  try {
    const parsed = JSON.parse(raw) as ServiceAccountLike;
    if (parsed.private_key) {
      // חשוב: להמיר \\n ל־\n
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    serviceAccount = parsed;
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e);
  }
}


const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(
        serviceAccount
          ? { credential: cert(serviceAccount as any) }
          : { credential: applicationDefault() }
      );

// exports
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

// לא לשמור undefined בפיירסטור
adminDb.settings({ ignoreUndefinedProperties: true });

export { adminApp };
