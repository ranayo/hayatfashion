export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f2ef] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-[#4b3a2f] mb-4">
          ❌ התשלום בוטל
        </h1>
        <p className="text-gray-700 mb-6">
          נראה שהתשלום בוטל. אל דאגה — אפשר לנסות שוב בכל רגע.
        </p>
        <a
          href="/cart"
          className="inline-block px-6 py-3 bg-[#c8a18d] text-white rounded-full hover:bg-[#4b3a2f] transition"
        >
          חזרה לעגלת הקניות
        </a>
      </div>
    </main>
  );
}
