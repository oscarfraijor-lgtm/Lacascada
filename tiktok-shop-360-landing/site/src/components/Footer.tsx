import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#010101] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-heading text-2xl tracking-wide text-white">
                INDIE PRO
              </span>
              <span className="font-heading text-2xl tracking-wide text-[#ED2450]">
                MARKETING
              </span>
            </div>
            <p className="text-white/50 max-w-md mb-6 leading-relaxed">
              Your 360° TikTok Shop partner. We build, launch, and manage your
              entire TikTok Shop for brands in Mexico and the United States.
            </p>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Book Your Strategy Call
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>

          <div>
            <h4 className="font-heading text-lg text-white tracking-wide mb-4">
              SERVICES
            </h4>
            <ul className="space-y-3">
              {[
                "Shop Operations",
                "Affiliate Marketing",
                "Content Creation",
                "TikTok Ads",
                "Live Shopping",
                "Consulting",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#services"
                    className="text-white/50 hover:text-[#ED2450] transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg text-white tracking-wide mb-4">
              COMPANY
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Case Studies", href: "#case-studies" },
                { label: "Why Us", href: "#why-us" },
                { label: "Our Process", href: "#process" },
                { label: "FAQ", href: "#faq" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-white/50 hover:text-[#ED2450] transition-colors text-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} Indie Pro Marketing. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.indieproagency.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="https://www.indieproagency.com/terms-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
