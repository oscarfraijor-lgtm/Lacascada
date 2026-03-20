const caseStudies = [
  {
    brand: "Beauty Brand MX",
    category: "Beauty & Skincare",
    stats: [
      { value: "70%", label: "Growth month over month" },
      { value: "1,000+", label: "Monthly affiliates activated" },
      { value: "150K+", label: "Units sold" },
    ],
    description:
      "Full social commerce system with content, affiliates, and execution aligned to drive measurable GMV. Added a new best seller across all platforms due to TikTok Shop efforts.",
    color: "#ED2450",
  },
  {
    brand: "Fashion Brand US",
    category: "Fashion & Accessories",
    stats: [
      { value: "5X", label: "ROAS on TikTok Ads" },
      { value: "500+", label: "Creator partnerships" },
      { value: "$2M+", label: "Revenue generated" },
    ],
    description:
      "Scaled from zero to high six-figure monthly GMV within 90 days through strategic affiliate recruitment and optimized content production.",
    color: "#00C1B2",
  },
  {
    brand: "Wellness Brand",
    category: "Health & Wellness",
    stats: [
      { value: "40%", label: "Cross-channel lift" },
      { value: "300+", label: "Viral videos created" },
      { value: "85%", label: "Repeat purchase rate" },
    ],
    description:
      "Leveraged TikTok Shop success to boost Meta and Google performance by 40%, creating a true omnichannel growth engine.",
    color: "#FDD811",
  },
];

export default function CaseStudies() {
  return (
    <section id="case-studies" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#ED2450] text-sm font-semibold uppercase tracking-widest mb-4">
            Proven Results
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#010101] tracking-wide mb-6">
            REAL RESULTS FOR{" "}
            <span className="text-[#ED2450]">REAL BRANDS</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            When you win, we win. Here&apos;s how we&apos;ve driven measurable growth for
            our partners.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="group relative bg-[#010101] rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: study.color }}
              />

              <div className="p-8">
                <div className="mb-6">
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: study.color }}
                  >
                    {study.category}
                  </span>
                  <h3 className="font-heading text-2xl text-white tracking-wide mt-2">
                    {study.brand.toUpperCase()}
                  </h3>
                </div>

                <div className="space-y-4 mb-6">
                  {study.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="flex items-baseline gap-3">
                      <span
                        className="font-heading text-3xl tracking-wide"
                        style={{ color: study.color }}
                      >
                        {stat.value}
                      </span>
                      <span className="text-white/50 text-sm">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-white/40 text-sm leading-relaxed">
                  {study.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
