import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <div className="bg-[#EF0107]">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-3">
            Arsenal FC
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight leading-none">
            Get Parade Ready
          </h1>
          <p className="text-white/80 mt-3 text-lg">Campaign Audience Research</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Help shape our next campaign
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            You&apos;ll watch two short videos for an upcoming Arsenal campaign and share
            your reaction to each one. The whole thing takes under 5 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-gray-50 rounded-2xl p-7 mb-10 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5 text-sm uppercase tracking-wide">
            What to expect
          </h3>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Watch Video 1 and share your reaction' },
              { step: '2', text: 'Watch Video 2 and share your reaction' },
              { step: '3', text: 'Tell us which video you preferred overall' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4">
                <div className="w-9 h-9 bg-[#EF0107] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-sm font-black">{step}</span>
                </div>
                <p className="text-gray-700 font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <Link href="/test">
          <button className="w-full bg-[#EF0107] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#C40106] transition-colors shadow-sm">
            Start →
          </button>
        </Link>

        <p className="text-center text-gray-400 text-sm mt-6 leading-relaxed">
          Your responses are anonymous and will only be used for campaign research purposes.
        </p>
      </div>
    </div>
  );
}
