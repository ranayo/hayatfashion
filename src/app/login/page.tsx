"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/firebase";
import Link from "next/link";

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("hayat_logged_in");
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      // בדיקה אם המשתמש רשום
      const registeredUsers = JSON.parse(localStorage.getItem("hayatfashion_users") || "[]");
      if (!registeredUsers.includes(email)) {
        alert("❌ המשתמש לא רשום. נא להירשם קודם");
        return;
      }

      setUser(result.user);
      localStorage.setItem("hayat_logged_in", email || "");
      router.push("/");
    } catch (err) {
      console.error("Google sign-in error:", err);
      alert("⚠️ שגיאה בהתחברות עם גוגל");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#f6f2ef] text-[#1c1c1c] font-poppins px-4">
      <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-center">
        Login to HAYATFASHION
      </h1>

      {!user ? (
        <div className="flex flex-col items-center w-full max-w-sm gap-4">

          <button
            onClick={signInWithGoogle}
            className="bg-[#c8a18d] text-white py-2 px-6 rounded-full hover:bg-[#4b3a2f] transition"
          >
            Sign in with Google
          </button>

          <p className="text-sm mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#7e6dc5] underline">
              Sign up
            </Link>
          </p>

          <Link
            href="/"
            className="mt-6 inline-block px-6 py-2 border border-[#c8a18d] text-[#c8a18d] rounded-full hover:bg-[#c8a18d] hover:text-white transition"
          >
            ← Back to Home
          </Link>
        </div>
      ) : (
        <div className="text-center text-[#4b3a2f]">
          <p className="mb-2 text-lg">🎉 Welcome back!</p>
          <p className="text-sm text-gray-600">{user.email || user}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 underline text-[#7e6dc5]"
          >
            Go to Homepage
          </button>
        </div>
      )}
    </main>
  );
}
