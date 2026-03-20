import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#010101] pt-20">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#ED2450] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00C1B2] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FDD811] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
          <span className="w-2 h-2 bg-[#00C1B2] rounded-full animate-pulse" />
          <span className="text-white/80 text-sm font-medium">
            Your 360° TikTok Shop Partner
          </span>
        </div>

        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[0.95] tracking-wide mb-8">
          WE BUILD, LAUNCH
          <br />
          <span className="text-gradient">&amp; MANAGE</span> YOUR
          <br />
          ENTIRE <span className="text-[#00C1B2]">TIKTOK SHOP</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/60 font-light mb-12 leading-relaxed">
          End-to-end TikTok Shop management that lowers acquisition costs,
          scales profitably, and compounds every other sales channel for brands
          in Mexico &amp; the US.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="group gradient-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#ED2450]/30"
          >
            Book Your Strategy Call
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
          <a
            href="#case-studies"
            className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors px-6 py-4"
          >
            <span className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:border-[#ED2450] transition-colors">
              <Play size={16} className="ml-0.5" />
            </span>
            <span className="font-medium">See Our Results</span>
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
