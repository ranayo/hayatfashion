import Image from "next/image";
import Header from "@/components/Header";
import Button from "@/components/Button";
import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";
import HeroCardOnImage from "@/components/HeroCardOnImage";

export default function Home() {
  return (
    <>
      <Header />

      <main className="bg-[#f6f2ef] text-[#1c1c1c] font-poppins">
        {/* Hero Section – מעוצב ככרטיס כהה מעל התמונה */}
        <HeroCardOnImage />

        {/* Category Navigation Section */}
        <section className="py-20 bg-[#f6f2ef] text-center">
          <h2 className="text-4xl font-elegant mb-12 text-[#1c1c1c]">Categories</h2>
          <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
            <Link href="/category/pants" className="flex flex-col items-center group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
                <Image src="/categories/pants.jpg" alt="Pants" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Pants</span>
            </Link>

            <Link href="/category/basics" className="flex flex-col items-center group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
                <Image src="/categories/basics.jpg" alt="Basics" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Basics</span>
            </Link>

            <Link href="/category/shirts" className="flex flex-col items-center group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
                <Image src="/categories/shirts.jpg" alt="Shirts" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Shirts</span>
            </Link>

            <Link href="/category/dresses" className="flex flex-col items-center group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
                <Image src="/categories/dresses.jpg" alt="Dresses" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Dresses</span>
            </Link>

            <Link href="/category/accessories" className="flex flex-col items-center group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
                <Image src="/categories/accessories.jpg" alt="Accessories" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Accessories</span>
            </Link>

            <Link href="/category/suits" className="flex flex-col items-center group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
                <Image src="/categories/suits.jpg" alt="Suits" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Suits</span>
            </Link>

            <Link href="/category/jackets" className="flex flex-col items-center group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
                <Image src="/categories/jackets.jpg" alt="Jackets" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Jackets</span>
            </Link>

            <Link href="/category/abayas" className="flex flex-col items-center group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
                <Image src="/categories/abayas.jpg" alt="Abayas" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Abayas</span>
            </Link>

            <Link href="/category/skirts" className="flex flex-col items-center group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition">
                <Image src="/categories/skirts.jpg" alt="Skirts" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <span className="mt-2 text-sm font-medium group-hover:text-[#7e6dc5] transition">Skirts</span>
            </Link>
          </div>
        </section>

        {/* Product Grid (demo) */}
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
                  <h3 className="font-elegant text-base text-gray-800 mb-1"></h3>
                  <p className="text-sm text-gray-600 mb-3">€120.00 EUR</p>
                  <Button className="w-full">Add to Cart</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Banner */}
        <section className="relative h-[60vh] text-center flex items-center justify-center bg-[#e6ddd2]" dir="ltr">
          <Image src="/sale.jpg" alt="Background" fill className="object-cover opacity-20" priority />
          <div className="relative z-10">
            <p className="text-sm text-[#7e6d65] mb-2">We’d love to hear from you</p>
            <h2 className="text-4xl font-elegant mb-8 text-[#1e1b18]">Contact Us</h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="https://www.instagram.com/hayatfashion123/?igsh=dDc0ODd4M2lxbTdn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-white/80 backdrop-blur text-[#4b3a2f] hover:bg-white transition shadow-sm"
              >
                <Instagram className="size-5" />
                <span>@hayatfashion123</span>
              </Link>
              <a
                href="mailto:hayatfashion402@gmail.com"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-[#c8a18d] text-white hover:bg-[#4b3a2f] transition shadow-sm"
              >
                <Mail className="size-5" />
                <span>hayatfashion402@gmail.com</span>
              </a>
              <a
                href="tel:+972525498323"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-white/80 backdrop-blur text-[#4b3a2f] hover:bg-white transition shadow-sm"
              >
                <Phone className="size-5" />
                <span>+972 52-549-8323</span>
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-[#f9f7f4] py-20">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-elegant text-[#4b3a2f] mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-[#6b5a50] italic mb-4">“Great quality clothes and fast delivery! I love shopping here.”</p>
                <div className="flex justify-center mb-2">{"⭐".repeat(5)}</div>
                <p className="text-sm text-[#4b3a2f] font-semibold">— Sarah L.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-[#6b5a50] italic mb-4">“Amazing designs and very comfortable fabrics. Totally recommend.”</p>
                <div className="flex justify-center mb-2">{"⭐".repeat(5)}</div>
                <p className="text-sm text-[#4b3a2f] font-semibold">— Dana M.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-[#6b5a50] italic mb-4">“Excellent service and unique style. My favorite fashion store!”</p>
                <div className="flex justify-center mb-2">{"⭐".repeat(5)}</div>
                <p className="text-sm text-[#4b3a2f] font-semibold">— Lina K.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="text-gray-600 body-font relative bg-[#f9f7f4]" id="location">
          <div className="container px-5 py-24 mx-auto">
            <h2 className="text-3xl font-semibold text-center text-[#4b3a2f] mb-8">Our Location</h2>
            <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d420.5485673353643!2d35.15495150863911!3d32.51576837904665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d00e41718cb4b%3A0x793708e7eeff60c5!2sAl%20Jabarin%20Road%20North!5e0!3m2!1sen!2sil!4v1756250018099!5m2!1sen!2sil"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Our Location"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
