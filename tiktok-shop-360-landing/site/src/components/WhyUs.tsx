import {
  TrendingUp,
  Zap,
  Globe,
  BarChart3,
  Rocket,
} from "lucide-react";

const reasons = [
  {
    icon: TrendingUp,
    title: "Build a New Revenue Channel",
    description:
      "Stop treating TikTok Shop like an experiment. We turn social commerce into a predictable revenue channel that compounds monthly.",
  },
  {
    icon: Zap,
    title: "Deploy a 24/7 Content Machine",
    description:
      "Every creator video gets battle-tested on TikTok first. Winners immediately scale across your paid ads, email, landing pages, and product pages.",
  },
  {
    icon: Globe,
    title: "Unlock Cross-Channel Lift",
    description:
      "TikTok Shop doesn't just drive direct sales. The halo effect typically delivers 30-40%+ performance lift across Meta, Google, Amazon, and retail.",
  },
  {
    icon: BarChart3,
    title: "See Real Profit Impact",
    description:
      "Forget vanity metrics. We track contribution profit across all platforms so you know exactly how social commerce affects your bottom line.",
  },
  {
    icon: Rocket,
    title: "Scale Faster Than Competition",
    description:
      "We combine structured content testing with disciplined execution to identify winners quickly and scale what works — in both Mexico and the US.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="py-24 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#00C1B2] text-sm font-semibold uppercase tracking-widest mb-4">
            Why Choose Us
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#010101] tracking-wide mb-6">
            THE TIKTOK SHOP ENGINE
            <br />
            <span className="text-[#ED2450]">ACCELERATING</span> YOUR BUSINESS
          </h2>
        </div>

        <div className="space-y-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group flex flex-col sm:flex-row items-start gap-6 bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#ED2450]/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <span className="font-heading text-5xl text-gray-100 group-hover:text-[#ED2450]/20 transition-colors shrink-0">
                    0{index + 1}
                  </span>
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#010101] mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
