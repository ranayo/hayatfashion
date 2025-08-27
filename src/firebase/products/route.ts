import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { adminDb, adminBucket } from "@/lib/firebaseAdmin";

export const runtime = "nodejs"; // נדרש לעבודה עם Buffer

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const name = String(form.get("name") || "");
    const description = String(form.get("description") || "");
    const category = String(form.get("category") || "pants");
    const price = parseFloat(String(form.get("price") || "0"));

    const sizes = String(form.get("sizes") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const colors = String(form.get("colors") || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const image = form.get("image") as File | null;
    if (!image) return NextResponse.json({ error: "Missing image" }, { status: 400 });

    // העלאה ל-Storage דרך Admin (עוקף rules בצד לקוח)
    const bytes = Buffer.from(await image.arrayBuffer());
    const ext = (image.type?.split("/")[1] || "jpg").toLowerCase();
    const objectPath = `products/${uuidv4()}.${ext}`;

    const file = adminBucket.file(objectPath);
    await file.save(bytes, {
      contentType: image.type || "image/jpeg",
      public: true, // נוח להצגה ישירה; אפשר להסיר ולהשתמש ב-signURL אם תרצי
    });

    const imageUrl = `https://storage.googleapis.com/${adminBucket.name}/${encodeURIComponent(objectPath)}`;

    // שמירה ל-Firestore
    const docRef = await adminDb.collection("products").add({
      name,
      description,
      category,
      price,
      sizes,
      colors,
      imageUrl,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: docRef.id, imageUrl });
  } catch (err) {
    console.error("POST /api/products error", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
