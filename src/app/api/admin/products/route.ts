// src/app/api/admin/products/route.ts
export const runtime = "nodejs";          // להריץ על Node (לא Edge)
export const dynamic = "force-dynamic";   // להכריח יצירה דינמית בזמן פיתוח

import { NextResponse } from "next/server";
import { adminAuth, adminDb, adminApp } from "@/firebase/admin";  // ✅ הוספתי adminApp


// אימיילים שמורשים כאדמין (מוגדרים ב-ENV)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

type SizeOpt = { size: string; stock: number };
type Body = {
  title: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  category: string;
  images?: string[];
  colors?: string[];
  sizes?: SizeOpt[];
};

export async function POST(req: Request) {
  try {
    // ---- אימות לקוח (ID Token בכותרת Authorization) ----
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "Missing ID token" },
        { status: 401 }
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = (decoded.email || "").toLowerCase();

    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { ok: false, error: "Not authorized" },
        { status: 403 }
      );
    }

    // לוגים קצרים לאבחון — תראי בטרמינל בזמן "שמור מוצר"
console.log("[api] admin project:", adminApp.options?.projectId);
    console.log("[api] saving doc by:", email);

    // ---- פרסינג בטוח של גוף הבקשה (למנוע '<!DOCTYPE ...>' → JSON) ----
    let body: Partial<Body> = {};
    try {
      const text = await req.text();
      body = text ? (JSON.parse(text) as Partial<Body>) : {};
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // ---- ולידציה בסיסית ----
    if (!body?.title || typeof body.price === "undefined" || !body?.category) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields (title, price, category)" },
        { status: 400 }
      );
    }

    // ---- כתיבה ל-Firestore (Admin SDK) ----
    const now = Date.now();
    const ref = adminDb.collection("products").doc();

    const docToSave = {
      id: ref.id,
      title: String(body.title),
      description: body.description ?? null,
      price: Number(body.price),
      salePrice:
        body.salePrice === undefined || body.salePrice === null
          ? null
          : Number(body.salePrice),
      category: String(body.category).toLowerCase(),
      images: Array.isArray(body.images) ? body.images : [],
      colors: Array.isArray(body.colors) ? body.colors : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(docToSave);

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err: any) {
    // תמיד מחזירים JSON (גם כאשר ה-import נפל קודם)
    const msg = String(err?.message || err?.code || "Server error");
    const status =
      msg.toLowerCase().includes("auth") || msg.toLowerCase().includes("token")
        ? 401
        : 500;

    console.error("admin products POST error:", err);
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
