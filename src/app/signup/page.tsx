"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { auth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

export default function SignupPage() {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui state
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // complete redirect-based sign in if we arrived back from Google
  useEffect(() => {
    getRedirectResult(auth).catch(() => {
      /* ignore if not from redirect */
    });
  }, []);

  // -------- Email/Password sign up ----------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // minimal validation
    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoadingEmail(true);
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/"); // success
    } catch (err: any) {
      setErrorMsg(err?.message || "Signup failed");
    } finally {
      setLoadingEmail(false);
    }
  };

  // -------- Google sign in with popup → redirect fallback ----------
  const signInWithGoogle = async () => {
    setErrorMsg(null);
    setLoadingGoogle(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (e: any) {
      // fallback when popup is blocked/closed
      if (e?.code === "auth/popup-blocked" || e?.code === "auth/popup-closed-by-user") {
        await signInWithRedirect(auth, provider);
        return; // flow continues after redirect
      }
      setErrorMsg(e?.message || "Google sign-in failed");
      setLoadingGoogle(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#f6f2ef] text-[#1c1c1c] font-poppins pt-10 px-6">
      <h1 className="text-4xl font-elegant mb-2">Create your HAYATFASHION Account</h1>
      <p className="text-[#7e6d65] mb-6 text-center">
        Join us for elegant, everyday fashion you’ll love.
      </p>

      {/* error bubble */}
      {errorMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-white shadow text-sm text-red-600 max-w-sm">
          {errorMsg}
        </div>
      )}

      {/* Email/Password form */}
      <form onSubmit={handleSignup} className="flex flex-col w-full max-w-sm gap-4 bg-[#f9f7f4] p-6 rounded-2xl shadow">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 bg-white"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 bg-white"
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={loadingEmail}
          className="bg-[#c8a18d] text-white py-2 rounded-full hover:bg-[#4b3a2f] transition disabled:opacity-60"
        >
          {loadingEmail ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-4 text-sm text-[#7e6d65]">or</div>

      {/* Google sign-in */}
      <button
        onClick={signInWithGoogle}
        disabled={loadingGoogle}
        className="px-6 py-2 rounded-full border border-[#c8a18d] text-[#c8a18d] hover:bg-[#c8a18d] hover:text-white transition disabled:opacity-60"
      >
        {loadingGoogle ? "Connecting…" : "Continue with Google"}
      </button>

      <p className="text-sm mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-[#7e6dc5] underline">
          Log in
        </Link>
      </p>

      {/* Back to home */}
      <Link
        href="/"
        className="mt-6 inline-block px-6 py-2 border border-[#c8a18d] text-[#c8a18d] rounded-full hover:bg-[#c8a18d] hover:text-white transition"
      >
        ← Back to Home
      </Link>
    </main>
  );
}
