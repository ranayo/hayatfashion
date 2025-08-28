// src/components/Button.tsx
"use client";
import * as React from "react";

type Variant = "primary" | "outline";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  isLoading?: boolean; // אופציונלי: אם תרצי מצב טעינה
};

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    isLoading = false,
    className = "",
    type,         // נאפשר לעבור type מבחוץ (submit/reset/button)
    disabled,
    children,
    ...rest
  } = props;

  const base = "inline-flex items-center justify-center px-6 py-2 rounded-full font-semibold transition";
  const variantStyles: Record<Variant, string> = {
    primary: "bg-[#c8a18d] text-white hover:bg-[#4b3a2f]",
    outline: "bg-white text-[#c8a18d] border border-[#c8a18d] hover:bg-[#c8a18d] hover:text-white",
  };
  const disabledStyles = "opacity-60 cursor-not-allowed";

  return (
    <button
      type={type ?? "button"} // ברירת מחדל בטוחה
      disabled={disabled || isLoading}
      className={`${base} ${variantStyles[variant]} ${disabled || isLoading ? disabledStyles : ""} ${className}`}
      {...rest}
    >
      {isLoading ? "..." : children}
    </button>
  );
}
