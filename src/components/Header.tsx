import Image from "next/image";
import Link from "next/link";

export default function Header() {
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
          className="hidden md:flex space-x-8 text-sm font-medium text-white"
          aria-label="Main navigation"
        >
          <Link href="/women" className="hover:text-[#dbcfc7] transition">Women</Link>
          <Link href="/accessories" className="hover:text-[#dbcfc7] transition">Accessories</Link>
          <Link href="/sale" className="hover:text-[#dbcfc7] transition">Sale</Link>
          <Link href="/about" className="hover:text-[#dbcfc7] transition">About</Link>
        </nav>
      </div>
    </header>
  );
}
