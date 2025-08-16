'use client';

import { auth } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      router.push("/"); // ניתוב הביתה אחרי התחברות
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      router.push("/"); // ניתוב הביתה אחרי התחברות
    } catch (error: any) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#f6f2ef] text-[#1c1c1c] font-poppins">
      <h1 className="text-4xl font-elegant mb-6">Login to HAYATFASHION</h1>

      {!user ? (
        <div className="flex flex-col items-center w-full max-w-sm gap-4">
          {/* Email/Password Form */}
          <form onSubmit={signInWithEmail} className="flex flex-col w-full gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2"
              required
            />
            <button
              type="submit"
              className="bg-[#c8a18d] text-white py-2 rounded-full hover:bg-[#4b3a2f] transition"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="text-gray-500 text-sm">or</div>

          {/* Google Sign-In */}
          <button
            onClick={signInWithGoogle}
            className="bg-[#c8a18d] text-white py-2 px-6 rounded-full hover:bg-[#4b3a2f] transition"
          >
            Sign in with Google
          </button>

          {/* Link to Sign up */}
          <p className="text-sm mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#7e6dc5] underline">
              Sign up
            </Link>
          </p>

          {/* Back to Home */}
          <Link
            href="/"
            className="mt-6 inline-block px-6 py-2 border border-[#c8a18d] text-[#c8a18d] rounded-full hover:bg-[#c8a18d] hover:text-white transition"
          >
            ← Back to Home
          </Link>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-2">Welcome, {user.displayName || user.email}!</p>
          <p className="text-sm text-gray-600">{user.email}</p>
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
