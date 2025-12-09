import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

/**
 * 🧩 אתחול Firebase Admin (פעם אחת בלבד)
 * משתמש ב־FIREBASE_SERVICE_ACCOUNT — JSON מלא כפי שמוגדר בקובץ .env.local
 */
function initAdminOnce() {
  if (admin.apps.length) return; // כבר מאותחל? דלג

  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!svc) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT לא הוגדר ב־.env.local");
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(svc);
  } catch (e) {
    console.error("❌ שגיאה בפענוח FIREBASE_SERVICE_ACCOUNT:", e);
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    }),
  });

  console.log("✅ Firebase Admin initialized successfully");
}

initAdminOnce();

/**
 * 🪪 שליפת משתמש מהבקשה ובדיקת הרשאת אדמין
 */
export async function getAdminUserFromRequest(req: Request) {
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice("Bearer ".length) : null;
  if (!token) return { uid: null, isAdmin: false };

  const decoded = await getAuth().verifyIdToken(token);
  const isAdmin = !!decoded.admin; // custom claim: { admin: true }
  return { uid: decoded.uid, isAdmin };
}

/**
 * 🚨 מאמת שהמשתמש הוא אדמין, אחרת זורק שגיאה 403
 * נוח לשימוש בתוך API routes:
 * 
 *   await ensureAdmin(req);
 */
export async function ensureAdmin(req: Request) {
  const { isAdmin, uid } = await getAdminUserFromRequest(req);
  if (!isAdmin) {
    const err: any = new Error("forbidden");
    err.status = 403;
    throw err;
  }
  return uid;
}