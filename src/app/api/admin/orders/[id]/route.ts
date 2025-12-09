import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/server/firebaseAdmin";

export const runtime = "nodejs";

type OrderStatus =
  | "awaiting_payment"
  | "awaiting_courier"
  | "paid"
  | "shipped"
  | "cancelled"
  | "refunded";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const docSnap = await adminDb.collection("orders").doc(params.id).get();

    if (!docSnap.exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const orderId = params.id;

    if (!status)
      return NextResponse.json({ error: "Missing status" }, { status: 400 });

    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const order = orderSnap.data();

    // ================================
    // 🔥 עדכון מלאי - רק אם נשלחה
    // ================================
    if (status === "shipped") {
      const items = order?.items || [];

      await adminDb.runTransaction(async (transaction) => {
        for (const item of items) {
          const pRef = adminDb.collection("products").doc(item.productId);
          const pSnap = await transaction.get(pRef);

          if (!pSnap.exists) {
            throw new Error(`המוצר "${item.title}" לא נמצא.`);
          }

          const pData = pSnap.data();
          if (!pData) {
            throw new Error(`שגיאה בנתוני המוצר "${item.title}".`);
          }

          // -------------------------------
          // מלאי לפי מידה
          // -------------------------------
          if (Array.isArray(pData.sizes)) {
            const sizes = [...pData.sizes];
            const index = sizes.findIndex((s: any) => s.size === item.size);

            if (index === -1) {
              throw new Error(`המידה ${item.size} לא קיימת במוצר "${item.title}".`);
            }

            if (sizes[index].stock < item.qty) {
              throw new Error(
                `אין מספיק מלאי למוצר "${item.title}" במידה ${item.size}.`
              );
            }

            sizes[index].stock -= item.qty;

            transaction.update(pRef, { sizes });
          }

          // -------------------------------
          // מלאי כולל totalStock
          // -------------------------------
          else {
            const stock = pData.totalStock ?? 0;

            if (stock < item.qty) {
              throw new Error(`אין מספיק מלאי למוצר "${item.title}".`);
            }

            transaction.update(pRef, {
              totalStock: stock - item.qty,
            });
          }
        }

        transaction.update(orderRef, {
          status,
          updatedAt: Date.now(),
          shippedAt: Date.now(),
        });
      });

      return NextResponse.json({ ok: true, stockUpdated: true }, { status: 200 });
    }

    // ================================
    // 🔵 עדכון רגיל
    // ================================
    const updateData: any = {
      status,
      updatedAt: Date.now(),
    };

    if (status === "paid") updateData.paymentStatus = "paid";
    if (status === "cancelled") updateData.paymentStatus = "failed";
    if (status === "refunded") updateData.paymentStatus = "refunded";

    await orderRef.update(updateData);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await adminDb.collection("orders").doc(params.id).delete();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}