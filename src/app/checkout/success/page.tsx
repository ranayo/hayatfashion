export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f2ef] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-[#4b3a2f] mb-4">
          ✅ התשלום עבר בהצלחה!
        </h1>
        <p className="text-gray-700 mb-6">
          תודה על ההזמנה שלך! אנו מכינים את החבילה שלך למשלוח.  
          מייל אישור נשלח אליך עם פרטי ההזמנה.
        </p>
        <a
          href="/thank-you"
          className="inline-block mt-2 px-6 py-3 bg-[#4b3a2f] text-white rounded-full hover:opacity-90 transition"
        >
          המשך לעמוד תודה
        </a>
      </div>
    </main>
  );
}
