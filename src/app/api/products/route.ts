import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { adminDb, adminBucket } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1) קולט טופס
    const form = await req.formData();

    const name = String(form.get("name") || "");
    const description = String(form.get("description") || "");
    const category = String(form.get("category") || "pants");
    const price = parseFloat(String(form.get("price") || "0"));
    const sizes = String(form.get("sizes") || "")
      .split(",").map(s => s.trim()).filter(Boolean);
    const colors = String(form.get("colors") || "")
      .split(",").map(c => c.trim()).filter(Boolean);

    const image = form.get("image") as File | null;
    if (!image) return NextResponse.json({ error: "Missing image" }, { status: 400 });

    // 2) העלאה ל-Storage ב-Admin (אין בעיית הרשאות)
    const bytes = Buffer.from(await image.arrayBuffer());
    const ext = (image.type?.split("/")[1] || "jpg").toLowerCase();
    const objectPath = `products/${uuidv4()}.${ext}`;

    const file = adminBucket.file(objectPath);
    // בלי public:true (עלול ליפול בבאקטים מסוימים). ניצור Signed URL במקום.
    await file.save(bytes, { contentType: image.type || "application/octet-stream" });

    // URL לקריאה (חתום לזמן ארוך; אפשר לשנות תאריך)
    const [imageUrl] = await file.getSignedUrl({
      action: "read",
      expires: "2099-12-31",
    });

    // 3) שמירה ל-Firestore
    const docRef = await adminDb.collection("products").add({
      name, description, category, price, sizes, colors, imageUrl, createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: docRef.id, imageUrl });
  } catch (err: any) {
    // שגיאה ברורה לעזרה בדיבוג
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
