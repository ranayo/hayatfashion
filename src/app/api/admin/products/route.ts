// src/app/api/admin/products/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/firebase/admin";

// אימיילים מורשים לאדמין (מה-ENV)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

type NewProductBody = {
  title: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  category: string; // slug: "dresses" / "pants" / ...
  images?: string[];
  colors?: string[];
  sizes?: Array<{ size: string; stock: number }>;
};

export async function POST(req: Request) {
  try {
    // ---- אימות מי שולח (ID Token) ----
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

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

    // ---- גוף הבקשה ----
    const body = (await req.json()) as Partial<NewProductBody>;

    // ---- ולידציה בסיסית ----
    if (!body?.title || !body?.price || !body?.category) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields (title, price, category)" },
        { status: 400 }
      );
    }

    const now = Date.now();

    // ---- יצירת מסמך ----
    const ref = adminDb.collection("products").doc();
    const docToSave = {
      id: ref.id,
      title: body.title,
      description: body.description ?? null,
      price: Number(body.price),
      salePrice:
        body.salePrice !== undefined && body.salePrice !== null
          ? Number(body.salePrice)
          : null,
      category: String(body.category).toLowerCase(), // נשמר כ-slug
      images: Array.isArray(body.images) ? body.images : [],
      colors: Array.isArray(body.colors) ? body.colors : [],
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(docToSave);

    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err: any) {
    console.error("admin products POST error:", err);
    // חשוב: תמיד להחזיר JSON כדי שלא יתקבל <!DOCTYPE ...>
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
