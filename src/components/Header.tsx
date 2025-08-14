import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="rounded-full" />
          <span className="text-xl font-bold">HAYATFASHION</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-[#7e6dc5]">Women</a>
          <a href="#" className="hover:text-[#7e6dc5]">Accessories</a>
          <a href="#" className="hover:text-[#7e6dc5]">Sale</a>
          <a href="#" className="hover:text-[#7e6dc5]">About</a>
        </nav>
      </div>
    </header>
  );
}
