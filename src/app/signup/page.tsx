"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created:", user);
      router.push("/"); // חזרה לדף הבית אחרי הרשמה
    } catch (error: any) {
      alert("Signup failed: " + error.message);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#f6f2ef] text-[#1c1c1c] font-poppins">
      <h1 className="text-4xl font-elegant mb-6">Create your HAYATFASHION Account</h1>

      <form onSubmit={handleSignup} className="flex flex-col w-full max-w-sm gap-4">
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
          Sign Up
        </button>
      </form>

      <p className="text-sm mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-[#7e6dc5] underline">
          Log in
        </Link>
      </p>

      {/* 🔙 כפתור חזרה לעמוד הראשי */}
      <Link
        href="/"
        className="mt-6 inline-block px-6 py-2 border border-[#c8a18d] text-[#c8a18d] rounded-full hover:bg-[#c8a18d] hover:text-white transition"
      >
        ← Back to Home
      </Link>
    </main>
  );
}
