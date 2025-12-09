import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/server/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // --- AUTH CHECK ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase();

    const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    if (!email || !admins.includes(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // --- LOAD ORDERS ---
    const snap = await adminDb
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const items = snap.docs.map((doc) => {
      const data = doc.data();

      /* ---------- FIX DATES ---------- */
      let createdAt = null;
      if (data.createdAt?.seconds) {
        const d = new Date(data.createdAt.seconds * 1000);
        createdAt = {
          iso: d.toISOString(),
          human: d.toLocaleString("he-IL"),
        };
      }

      /* ---------- FIX DELIVERY ADDRESS ---------- */
      const da = data.deliveryAddress || {};
      const deliveryAddress = {
        fullName: da.fullName || "",
        phone: da.phone || "",
        city: da.city || "",
        street: da.street || "",
        houseNumber: da.houseNumber || "",
      };

      /* ---------- FIX ITEMS ---------- */
      const items = (data.items || []).map((i: any) => ({
        title: i.title,
        quantity: i.quantity || i.qty || 1,
        color: i.color || "",
        size: i.size || "",
        price: i.salePrice || i.price || 0,
        image: i.image || "",
      }));

      return {
        id: doc.id,
        createdAt,

        /* Status */
        status: data.status || "awaiting_payment",
        paymentStatus: data.paymentStatus || "pending",

        /* Payment */
        paymentMethod: data.paymentMethod || data.payment || "COD",

        /* Totals */
        subtotal: data.subtotal || data.amount || 0,
        total: data.total || data.amount || 0,
        shipping: data.shipping || 0,
        currency: data.currency || "ILS",

        /* Customer */
        phone: deliveryAddress.phone,
        deliveryAddress,

        /* Items */
        items,
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("ORDER LIST ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}