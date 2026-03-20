import {
  Store,
  Users,
  Video,
  Target,
  Radio,
  MessageCircle,
} from "lucide-react";

const services = [
  {
    icon: Store,
    number: "01",
    title: "TikTok Shop Operations",
    description:
      "From setup to daily management, we align your shop with the market, algorithms, and trends — keeping your audience one click from checkout.",
  },
  {
    icon: Users,
    number: "02",
    title: "Affiliate Marketing",
    description:
      "With years of experience, our team knows exactly the influencer and affiliate profiles that align best with your brand and the platform.",
  },
  {
    icon: Video,
    number: "03",
    title: "Content Creation",
    description:
      "With our extensive creator network, a dedicated creative team, and data-driven experts, we create standout content that drives real engagement.",
  },
  {
    icon: Target,
    number: "04",
    title: "TikTok Shop Ads",
    description:
      "TikTok Ads boost visibility and power your brand. Our data-driven approach ensures every dollar counts, maximizing impact and success.",
  },
  {
    icon: Radio,
    number: "05",
    title: "Live Shopping",
    description:
      "We create impactful real-time connections through live promotions, generating 30% more engagement and instant purchases while growing your community.",
  },
  {
    icon: MessageCircle,
    number: "06",
    title: "TikTok Shop Consulting",
    description:
      "Prefer to manage things in-house? We guide you step-by-step through the entire process for effective, sustainable growth.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#ED2450] text-sm font-semibold uppercase tracking-widest mb-4">
            What We Do
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#010101] tracking-wide mb-6">
            WE TRANSFORM YOUR TIKTOK
            <br />
            SHOP INTO A{" "}
            <span className="text-[#ED2450]">SALES MACHINE</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            End-to-end services designed to maximize your TikTok Shop revenue
            from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.number}
                className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#ED2450]/20 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="font-heading text-5xl text-gray-100 group-hover:text-[#ED2450]/20 transition-colors leading-none">
                    {service.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#010101] mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
