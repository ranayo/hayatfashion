import Image from "next/image";
import Header from "@/components/Header";
import Button from "@/components/Button";

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
              The New Cindy Collection is live!
            </h1>
            <Button>SHOP NOW</Button>
          </div>
        </section>

        {/* Welcome Section */}
        <section className="py-20 text-center bg-[#c6a998] text-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <Image
                src="/product-4.png"
                alt="Welcome"
                width={350}
                height={450}
                className="rounded-lg mx-auto"
              />
              <div>
                <h2 className="text-4xl font-elegant mb-4">Welcome</h2>
                <p className="text-base mb-6">
                  Pair text with an image to focus on your chosen product,
                  collection, or blog post. Add details on availability, style,
                  or even provide a review.
                </p>
                <Button variant="outline">OUR MISSION</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="bg-[#f9f7f4] py-20 px-6">
          <h2 className="text-3xl font-elegant text-center mb-12">
            Choose your Adventure
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
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
                    You’re So Gorgeous
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
