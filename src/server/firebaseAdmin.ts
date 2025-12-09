import "server-only";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
    });
    console.log("[admin] initialized with FIREBASE_SERVICE_ACCOUNT");
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log("[admin] initialized with applicationDefault()");
  }
}

export const adminApp = admin.app();
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

