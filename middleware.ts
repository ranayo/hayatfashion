// middleware.ts
import { NextResponse } from "next/server";

const CATEGORY_SLUGS = [
  "shirts", "basics", "pants", "suits",
  "accessories", "dresses", "skirts",
  "abayas", "jackets",
];

export function middleware(req: Request) {
  const url = new URL(req.url);
  const slug = url.pathname.slice(1).toLowerCase(); // "/dresses" -> "dresses"

  if (CATEGORY_SLUGS.includes(slug)) {
    // שינוי כתובת (redirect) לנתיב הרשמי
    url.pathname = `/category/${slug}`;
    return NextResponse.redirect(url); // אם מעדיפים להשאיר URL כמו שהוא, אפשר rewrite
    // return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"], // להפעיל על כל הנתיבים
};
