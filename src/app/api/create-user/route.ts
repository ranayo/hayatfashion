import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "missing-email" }, { status: 400 });
    }

    // אם כבר קיים — מחזירים exists ולא יוצרים שוב
    try {
      const existing = await adminAuth.getUserByEmail(email);
      return NextResponse.json({ ok: true, status: "exists", uid: existing.uid });
    } catch {
      // לא קיים — נייצר חדש
    }

    const user = await adminAuth.createUser({
      email,
      emailVerified: true, // ה-OTP אצלך עבר, מסמנים כמאומת
      disabled: false,
    });

    return NextResponse.json({ ok: true, status: "created", uid: user.uid });
  } catch (e) {
    console.error("create-user error:", e);
    return NextResponse.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}
