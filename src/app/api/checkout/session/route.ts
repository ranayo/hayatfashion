import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover" as any, // ✅ מתוקן לגרסה החדשה
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${siteUrl}/checkout/success`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      line_items: body.items || [],
      metadata: {
        orderId: body.orderId || "",
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (err: any) {
    console.error("❌ Checkout session error:", err);
    return NextResponse.json(
      { error: "Checkout session error", details: err.message },
      { status: 500 }
    );
  }
}
