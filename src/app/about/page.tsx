import Image from "next/image";
import Header from "@/components/Header";
import Button from "@/components/Button";

export default function AboutPage() {
  return (
    <>
      <Header />

      {/* Background blobs for soft motion */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full blur-3xl bg-[#dbcfc7] opacity-40 animate-pulse-soft" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full blur-3xl bg-[#c8a18d] opacity-30 animate-pulse-soft" />
      </div>

      <main className="bg-[#f6f2ef] min-h-screen text-[#1c1c1c] font-poppins pt-28 pb-24">
        {/* HERO */}
        <section className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.jpg"
              alt="HAYATFASHION Logo"
              width={120}
              height={120}
              className="rounded-full shadow-md animate-float"
              priority
            />
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl font-elegant animate-fade-up">
            About <span className="tracking-wide">HAYATFASHION</span>
          </h1>

          <p className="mt-4 text-[17px] leading-8 text-[#574c47] max-w-3xl mx-auto animate-fade-up [animation-delay:.15s]">
            Hi, we’re <b>HAYATFASHION</b> — a home for effortless, feminine style.
            We believe in everyday beauty: pieces that feel good, fit beautifully,
            and let you be confidently yourself. Every item is thoughtfully
            selected for flattering cuts, soft textures, and timeless neutrals
            you’ll love reaching for again and again.
          </p>

          <div className="mt-8 flex justify-center gap-4 animate-fade-up [animation-delay:.25s]">
            <a href="/women" className="inline-block">
              <Button>Discover the Collection</Button>
            </a>
            <a href="/sale" className="inline-block">
              <Button variant="outline">Hot Offers</Button>
            </a>
          </div>
        </section>

        {/* 3 CARDS */}
        <section className="max-w-6xl mx-auto px-6 mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article className="bg-[#f9f7f4] rounded-2xl shadow hover:shadow-lg transition p-6 animate-fade-up">
            <h3 className="text-xl font-elegant mb-2">What We Value</h3>
            <p className="text-[#574c47] leading-7">
              Clothing that looks polished and feels gentle on the skin.
              Quality you can sense, in calming, elegant tones that soften every look.
            </p>
          </article>

          <article className="bg-[#f9f7f4] rounded-2xl shadow hover:shadow-lg transition p-6 animate-fade-up [animation-delay:.1s]">
            <h3 className="text-xl font-elegant mb-2">How We Curate</h3>
            <p className="text-[#574c47] leading-7">
              Our collections are globally inspired and made for real life:
              work, study, special moments — and everything in between.
            </p>
          </article>

          <article className="bg-[#f9f7f4] rounded-2xl shadow hover:shadow-lg transition p-6 animate-fade-up [animation-delay:.2s]">
            <h3 className="text-xl font-elegant mb-2">Here for You</h3>
            <p className="text-[#574c47] leading-7">
              Not sure about sizing? Need styling advice? We’re happy to help
              and put together a look that feels perfectly you.
            </p>
          </article>
        </section>

        {/* “Signature” strip */}
        <section className="max-w-5xl mx-auto px-6 mt-16">
          <div className="rounded-2xl border border-[#e7e0db] bg-white/70 backdrop-blur p-7 text-center shadow-sm animate-fade-up">
            <p className="text-[16px] text-[#7e6d65]">
              “Fashion that feels like you.”
            </p>
          </div>
        </section>

        {/* CONTACT / CTA */}
        <section className="max-w-4xl mx-auto px-6 mt-16 text-center animate-fade-up">
          <h2 className="text-2xl font-elegant mb-3">Let’s Talk</h2>
          <p className="text-[#574c47] mb-6">
            Need a recommendation or a personalized fit? We’re one message away.
          </p>
          <a href="mailto:hayatfashion402@gmail.com">
            <Button>Contact Us</Button>
          </a>
        </section>
      </main>
    </>
  );
}
