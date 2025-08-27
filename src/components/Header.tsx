"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react"; // ← הוספתי Heart
import useCart from "@/hooks/useCart";
import { useEffect, useState } from "react";
import KebabMenu from "@/components/KebabMenu";
import CartDrawer from "@/components/CartDrawer";

export default function Header() {
  const { items } = useCart() as any;
  const count = (items ?? []).reduce(
    (sum: number, it: any) => sum + (Number(it?.qty) || 0),
    0
  );

  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("hayat_logged_in");
    if (email) setLoggedInEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hayat_logged_in");
    window.location.reload();
  };

  const menuItems = [
    { label: "About", href: "/about" },
    { label: "Dresses", href: "/category/dresses" },
    { label: "Pants", href: "/category/pants" },
    { label: "Shirts", href: "/category/shirts" },
    { label: "Skirts", href: "/category/skirts" },
    { label: "Abayas", href: "/category/abayas" },
    { label: "Accessories", href: "/category/accessories" },
    { label: "Jackets", href: "/category/jackets" },
    { label: "Suits", href: "/category/suits" },
    
   
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo -> Home */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="HAYATFASHION Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-white">HAYATFASHION</span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium text-white"
            aria-label="Main navigation"
          >
          

            {loggedInEmail ? (
              <>
                <span className="text-xs text-[#f0e7e0]">👋 {loggedInEmail}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-1 border border-[#c8a18d] rounded-full hover:bg-[#c8a18d] hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-[#c8a18d] transition">
                  Login
                </Link>
                <Link href="/signup" className="hover:text-[#c8a18d] transition">
                  Signup
                </Link>
              </>
            )}

           

            {/* 🛒 Cart – badge לבן בצורת pill */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1 hover:text-[#dbcfc7] transition"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {count > 0 && (
                <span
                  className="
                    absolute -top-2 -right-4 
                    bg-white text-[#4b3a2f] text-[11px] font-semibold
                    rounded-full px-2 py-[2px] leading-none
                    shadow-sm ring-1 ring-white/60
                  "
                >
                  {count}
                </span>
              )}
            </button>
              {/* ❤️ לב בלי עיגול */}
            <Link
              href="/favorites"
              aria-label="Favorites"
              className="inline-flex items-center hover:text-[#dbcfc7] transition"
            >
              <Heart className="w-6 h-6" />
            </Link>

            {/* ⋮ */}
            <KebabMenu items={menuItems} />
          </nav>
        </div>

        {/* Mobile actions */}
        <div className="md:hidden mt-3 flex items-center justify-end gap-3 text-white">
          <Link
            href="/favorites"
            aria-label="Favorites"
            className="inline-flex items-center hover:text-[#dbcfc7] transition"
          >
            <Heart className="w-6 h-6" />
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span
                className="
                  absolute -top-2 -right-4 
                  bg-white text-[#4b3a2f] text-[11px] font-semibold
                  rounded-full px-2 py-[2px] leading-none
                  shadow-sm ring-1 ring-white/60
                "
              >
                {count}
              </span>
            )}
          </button>

          <KebabMenu items={menuItems} />
        </div>
      </div>

      {/* Drawer של העגלה */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
