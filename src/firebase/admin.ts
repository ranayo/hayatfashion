// src/firebase/admin.ts
import { getApps, initializeApp, cert, applicationDefault, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type Svc = { project_id?: string; private_key?: string; client_email?: string; [k: string]: any };

const RAW = process.env.FIREBASE_SERVICE_ACCOUNT;
let app: App;

if (!getApps().length) {
  if (RAW) {
    const svc = JSON.parse(RAW) as Svc;
    if (svc.private_key) svc.private_key = svc.private_key.replace(/\\n/g, "\n");

    // ⚠️ חשוב: להגדיר projectId מפורש
    app = initializeApp({
      credential: cert({
        projectId: svc.project_id,
        clientEmail: svc.client_email,
        privateKey: svc.private_key!,
      }),
      projectId: svc.project_id,
    });
    console.log(
      "[admin] initialized with service account:",
      svc.client_email,
      "project:",
      svc.project_id
    );
  } else {
    // רק אם יש לך GOOGLE_APPLICATION_CREDENTIALS או ריצה בענן
    app = initializeApp({ credential: applicationDefault() });
    console.log("[admin] initialized with applicationDefault()");
  }
} else {
  app = getApps()[0]!;
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
// לא לקרוא ל-settings יותר מפעם אחת. אם צריך:
// adminDb.settings({ ignoreUndefinedProperties: true });

export { app as adminApp };
