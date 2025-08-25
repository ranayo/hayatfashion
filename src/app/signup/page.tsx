"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";

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

  const handleSendOTP = async () => {
    if (!email) {
      alert("📩 יש להזין כתובת אימייל");
      return;
    }

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

      alert("✅ קוד אימות נשלח למייל");
      setShowOtpInput(true);
    } catch (error) {
      console.error("❌ שגיאה בשליחת קוד אימות:", JSON.stringify(error));
      alert("⚠️ שגיאה בשליחת קוד. ודאי שהפרטים נכונים");
    }
  };

  const handleVerifyOTP = async () => {
    if (userOtp === otp) {
      alert("✅ אימות הצליח! ברוכה הבאה");

      // ✅ הוספה לרשימת המשתמשים
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
        console.log("📬 הודעת ברוכה הבאה נשלחה");

        // שמירת המשתמש כמחובר
        localStorage.setItem("hayat_logged_in", email);
        setIsLoggedIn(true);
        setShowOtpInput(false);
        setUserOtp("");
        setOtp("");
        alert("🎉 ברוכה הבאה! את מחוברת כעת");
      } catch (error) {
        console.error("❌ שגיאה בשליחת הודעת ברוכה הבאה:", error);
      }
    } else {
      alert("❌ קוד שגוי. נסי שוב");
    }
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
                className="bg-[#c8a18d] hover:bg-[#4b3a2f] text-white px-6 py-2 rounded-full w-full"
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
                  className="bg-[#c8a18d] hover:bg-[#4b3a2f] text-white px-6 py-2 rounded-full w-full"
                >
                  Verify Code
                </button>
              </>
            )}
          </>
        )}

        {/* כפתור חזרה לבית */}
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
