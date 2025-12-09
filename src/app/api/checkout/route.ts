import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

// 🟡 נוספה בדיקת מפתח Stripe
console.log("🔑 STRIPE SECRET KEY:", process.env.STRIPE_SECRET_KEY?.slice(0, 10));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover" as any, // ✅ פתרון קבוע ל-Type error
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📦 Received checkout body:", body);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const line_items = body.items.map((item: any) => ({
      price_data: {
        currency: item.currency?.toLowerCase() || "ils",
        product_data: {
          name: item.title,
          images: [
            item.image?.startsWith("http")
              ? item.image
              : `${siteUrl}${item.image}`,
          ],
        },
        unit_amount: Math.round((item.salePrice ?? item.price) * 100),
      },
      quantity: item.quantity || item.qty || 1,
    }));

    console.log("🧾 Line items:", line_items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${siteUrl}/checkout/success`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      line_items,
      metadata: {
        orderId: body.orderId || "",
        userId: body.userId || "",
        phone: body.phone || "",
        email: body.email || "",
      },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "משלוח עד הבית",
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round((body.shipping || 20) * 100),
              currency: "ils",
            },
          },
        },
      ],
    });

    console.log("🔑 STRIPE SECRET KEY:", process.env.STRIPE_SECRET_KEY);
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe Checkout Error:", err);
    return NextResponse.json(
      { error: "Checkout session error", details: err.message },
      { status: 500 }
    );
  }
}
