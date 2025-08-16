import Image from "next/image";
import Header from "@/components/Header";
import Button from "@/components/Button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />

      <main className="bg-[#f6f2ef] text-[#1c1c1c] font-poppins">
        {/* Hero Section */}
        <section className="relative h-[90vh] flex items-center justify-center text-center bg-[#dbcfc7] text-white">
          <Image
            src="/hero.jpg"
            alt="Hero"
            fill
            className="object-cover opacity-30"
          />
          <div className="relative z-10 px-4">
            <h1 className="text-4xl sm:text-6xl font-elegant mb-4 text-white">
              The New Collection is live!
            </h1>
            <Button>SHOP NOW</Button>
          </div>
        </section>

        {/* Category Navigation Section */}
<section className="py-20 bg-[#f6f2ef] text-center">
  <h2 className="text-4xl font-elegant mb-12 text-[#1c1c1c]"> Categories</h2>
  <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
    
    {/* Pants */}
    <Link href="/pants" className="flex flex-col items-center group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
        <Image src="/categories/pants.jpg" alt="Pants" width={112} height={112} className="object-cover w-full h-full" />
      </div>
      <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Pants</span>
    </Link>

    {/* Basics */}
    <Link href="/basics" className="flex flex-col items-center group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
        <Image src="/categories/basics.jpg" alt="Basics" width={112} height={112} className="object-cover w-full h-full" />
      </div>
      <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Basics</span>
    </Link>

    {/* Shirts */}
    <Link href="/shirts" className="flex flex-col items-center group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
        <Image src="/categories/shirts.jpg" alt="Shirts" width={112} height={112} className="object-cover w-full h-full" />
      </div>
      <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Shirts</span>
    </Link>

    {/* Dresses */}
    <Link href="/dresses" className="flex flex-col items-center group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
        <Image src="/categories/dresses.jpg" alt="Dresses" width={112} height={112} className="object-cover w-full h-full" />
      </div>
      <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Dresses</span>
    </Link>

    {/* Accessories */}
    <Link href="/accessories" className="flex flex-col items-center group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
        <Image src="/categories/accessories.jpg" alt="Accessories" width={112} height={112} className="object-cover w-full h-full" />
      </div>
      <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Accessories</span>
    </Link>

    {/* Suits */}
    <Link href="/suits" className="flex flex-col items-center group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
        <Image src="/categories/suits.jpg" alt="Suits" width={112} height={112} className="object-cover w-full h-full" />
      </div>
      <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Suits</span>
    </Link>

    {/* Jackets */}
    <Link href="/jackets" className="flex flex-col items-center group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
        <Image src="/categories/jackets.jpg" alt="Jackets" width={112} height={112} className="object-cover w-full h-full" />
      </div>
      <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Jackets</span>
    </Link>

    {/* Abayas */}
    <Link href="/abayas" className="flex flex-col items-center group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
        <Image src="/categories/abayas.jpg" alt="Abayas" width={112} height={112} className="object-cover w-full h-full" />
      </div>
      <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Abayas</span>
    </Link>

    {/* Skirts */}
    <Link href="/skirts" className="flex flex-col items-center group">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
        <Image src="/categories/skirts.jpg" alt="Skirts" width={112} height={112} className="object-cover w-full h-full" />
      </div>
      <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Skirts</span>
    </Link>
  </div>
</section>

        {/* Product Grid */}
        <section className="bg-[#f9f7f4] py-20 px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
                <div className="relative group overflow-hidden">
                  <Image
                    src={`/product-${i + 1}.png`}
                    alt={`Product ${i + 1}`}
                    width={300}
                    height={300}
                    className="mx-auto duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 text-sm mb-1">
                    <span>★</span>
                    <span>{(4.3 + i * 0.1).toFixed(1)}</span>
                  </div>
                  <h3 className="font-elegant text-base text-gray-800 mb-1">
                   
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">€120.00 EUR</p>
                  <Button className="w-full">Add to Cart</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sale Section */}
        <section className="relative h-[60vh] text-center flex items-center justify-center bg-[#e6ddd2]">
          <Image
            src="/sale.jpg"
            alt="Sale"
            fill
            className="object-cover opacity-20"
          />
          <div className="relative z-10">
            <p className="text-sm text-[#7e6d65] mb-2">So many deals!</p>
            <h2 className="text-4xl font-elegant mb-4">ON SALE</h2>
            <Button>SHOP NOW</Button>
          </div>
        </section>
      </main>
    </>
  );
}
