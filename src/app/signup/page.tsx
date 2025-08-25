"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "@/firebase"; // הקליינט של Firebase שלך (כרגיל)

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("hayat_logged_in");
    if (user) setIsLoggedIn(true);
  }, []);

  const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  // שליחת OTP — רק אם האימייל לא קיים כבר (מקומי או Firebase)
  const handleSendOTP = async () => {
    if (!email) {
      toast.error("📩 יש להזין כתובת אימייל");
      return;
    }

    // 1) בדיקה ברשימה המקומית (מי שכבר עשה אצלך OTP בעבר)
    const localUsers = JSON.parse(localStorage.getItem("hayatfashion_users") || "[]");
    if (localUsers.includes(email)) {
      toast.error("⚠️ כתובת מייל זו כבר רשומה. בצעי Login במקום.");
      return;
    }

    // 2) בדיקה מול Firebase Authentication (מי שכבר קיים שם, למשל דרך Google)
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        toast.error("⚠️ כתובת מייל זו כבר קיימת ב-Firebase. בצעי Login במקום.");
        return;
      }
    } catch (error) {
      console.error("שגיאה בבדיקת אימייל ב-Firebase:", error);
      toast.error("⚠️ שגיאה בגישה לשרת. נסי שוב מאוחר יותר");
      return;
    }

    // שליחת קוד
    const otpCode = generateOTP();
    setOtp(otpCode);

    try {
      await emailjs.send(
        "service_j99xu9j",
        "template_qeltt0t",
        {
          email: email,
          user_name: email.split("@")[0],
          otp_code: otpCode,
        },
        "IhxqkYmoeZF4p4mZy"
      );

      toast.success("✅ קוד אימות נשלח למייל");
      setShowOtpInput(true);
    } catch (error) {
      console.error("❌ שגיאה בשליחת קוד אימות:", error);
      toast.error("⚠️ שגיאה בשליחת קוד. ודאי שהפרטים נכונים");
    }
  };

  // אימות ה-OTP ויצירת המשתמש ב-Firebase Auth דרך ה-API
  const handleVerifyOTP = async () => {
    if (userOtp !== otp) {
      toast.error("❌ קוד שגוי. נסי שוב");
      return;
    }

    // 1) יצירת/אישור המשתמש ב-Firebase Authentication (צד שרת)
    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "create-user-failed");
      }
      // data.status: "created" | "exists" — לשיקולך אם להראות הודעה שונה
    } catch (error) {
      console.error("❌ יצירת משתמש ב-Firebase נכשלה:", error);
      toast.error("⚠️ בעיית שרת בהרשמה. נסי שוב מאוחר יותר");
      return; // מונע המשך אם חשוב
    }

    // 2) המשך הלוגיקה שלך (ברוכים הבאים, שמירה מקומית וכו')
    toast.success("✅ אימות הצליח! ברוכה הבאה");

    // שמירה ברשימת הנרשמים המקומית (ללוגיקה הקיימת אצלך בלוגין)
    const users = JSON.parse(localStorage.getItem("hayatfashion_users") || "[]");
    if (!users.includes(email)) {
      users.push(email);
      localStorage.setItem("hayatfashion_users", JSON.stringify(users));
    }

    try {
      await emailjs.send(
        "service_j99xu9j",
        "template_m7jzwj6",
        {
          email: email,
          user_name: email.split("@")[0],
        },
        "IhxqkYmoeZF4p4mZy"
      );
    } catch (e) {
      console.warn("שגיאה בשליחת הודעת ברוכה הבאה:", e);
    }

    localStorage.setItem("hayat_logged_in", email);
    setIsLoggedIn(true);
    setShowOtpInput(false);
    setUserOtp("");
    setOtp("");
    toast.success("🎉 ברוכה הבאה! את מחוברת כעת");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f2ef] px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-6 text-center">
        <h2 className="text-2xl font-semibold text-[#4b3a2f]">
          Sign up to HAYATFASHION
        </h2>

        {isLoggedIn ? (
          <div className="text-[#4b3a2f] font-medium">
            👋 את מחוברת כעת בתור: <br />
            <span className="text-sm">{localStorage.getItem("hayat_logged_in")}</span>
          </div>
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="border px-4 py-2 rounded w-full text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {!showOtpInput ? (
              <button
                onClick={handleSendOTP}
                className="bg-[#4b3a2f] hover:bg-[#c8a18d] text-white px-6 py-2 rounded-full w-full transition"
              >
                Send Verification Code
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter the OTP code"
                  className="border px-4 py-2 rounded w-full text-left"
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value)}
                />
                <button
                  onClick={handleVerifyOTP}
                  className="bg-[#c8a18d] hover:bg-[#4b3a2f] text-white px-6 py-2 rounded-full w-full transition"
                >
                  Verify Code
                </button>
              </>
            )}
          </>
        )}

        <button
          onClick={() => router.push("/")}
          className="text-[#4b3a2f] underline mt-4"
        >
          ← חזרה לדף הבית
        </button>
      </div>
    </div>
  );
}
