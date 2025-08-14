type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline";
};

export default function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  const base = "px-6 py-2 rounded-full font-semibold transition";
  const styles =
    variant === "primary"
      ? "bg-[#c8a18d] text-white hover:bg-[#4b3a2f]"
      : "bg-white text-[#c8a18d] border border-[#c8a18d] hover:bg-[#c8a18d] hover:text-white";

  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
