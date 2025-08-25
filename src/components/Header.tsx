"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import useCart from "@/hooks/useCart";
import { useEffect, useState } from "react";

export default function Header() {
  const { items } = useCart();
  const count = items.reduce((sum, it) => sum + it.qty, 0);

  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);

  // בדיקה אם המשתמש מחובר
  useEffect(() => {
    const email = localStorage.getItem("hayat_logged_in");
    if (email) {
      setLoggedInEmail(email);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hayat_logged_in");
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold text-white">HAYATFASHION</span>
        </div>

        {/* Navigation */}
        <nav
          className="hidden md:flex space-x-8 text-sm font-medium text-white items-center"
          aria-label="Main navigation"
        >
          <Link href="/about" className="hover:text-[#dbcfc7] transition">
            About
          </Link>

          {loggedInEmail ? (
            <>
              <span className="text-xs text-[#f0e7e0]">
                👋 {loggedInEmail}
              </span>
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

          <Link href="/admin" className="text-sm underline">
            Admin
          </Link>

          {/* 🛒 Cart */}
          <Link href="/cart" className="relative flex items-center gap-1">
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-[#c8a18d] text-white text-xs rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
