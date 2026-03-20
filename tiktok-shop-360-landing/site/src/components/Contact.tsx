"use client";

import { useState } from "react";
import { Send, Calendar, ArrowRight } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    message: "",
    budget: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="py-24 bg-[#010101] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#ED2450] rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#00C1B2] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#00C1B2] text-sm font-semibold uppercase tracking-widest mb-4">
            Get Started
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-6">
            READY TO <span className="text-[#ED2450]">SCALE</span> YOUR
            <br />
            TIKTOK SHOP?
          </h2>
          <p className="max-w-2xl mx-auto text-white/60 text-lg">
            Book a free 30-minute strategy call or send us a message. Let&apos;s
            build your TikTok Shop growth engine.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <a
              href="https://www.indieproagency.com/booking-calendar/tiktok-shop-strategy-call-1"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-gradient-to-br from-[#ED2450] to-[#E4003B] rounded-2xl p-8 mb-8 hover:shadow-2xl hover:shadow-[#ED2450]/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <Calendar size={32} className="text-white" />
                <h3 className="font-heading text-2xl text-white tracking-wide">
                  BOOK A STRATEGY CALL
                </h3>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                Schedule a free 30-minute call with our team. We&apos;ll analyze
                your brand, discuss your goals, and outline a custom TikTok Shop
                strategy.
              </p>
              <div className="flex items-center gap-2 text-white font-semibold">
                <span>Schedule Now</span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </div>
            </a>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="font-heading text-xl text-white tracking-wide mb-4">
                WHY BRANDS CHOOSE US
              </h3>
              <ul className="space-y-3">
                {[
                  "Full 360° TikTok Shop management",
                  "Bilingual team (English & Spanish)",
                  "Serving brands in Mexico & the US",
                  "100+ qualified affiliate partnerships",
                  "Data-driven content strategy",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/60">
                    <span className="w-1.5 h-1.5 bg-[#00C1B2] rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          >
            <h3 className="font-heading text-xl text-white tracking-wide mb-6">
              SEND US A MESSAGE
            </h3>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00C1B2]/20 flex items-center justify-center">
                  <Send size={24} className="text-[#00C1B2]" />
                </div>
                <h4 className="text-white text-xl font-bold mb-2">
                  Message Sent!
                </h4>
                <p className="text-white/60">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ED2450]/50 transition-colors"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ED2450]/50 transition-colors"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ED2450]/50 transition-colors"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                  <input
                    type="url"
                    placeholder="Website URL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ED2450]/50 transition-colors"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/30 focus:outline-none focus:border-[#ED2450]/50 transition-colors appearance-none"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                >
                  <option value="" className="bg-[#010101]">
                    Monthly Budget Range
                  </option>
                  <option value="5k-10k" className="bg-[#010101] text-white">
                    $5,000 - $10,000
                  </option>
                  <option value="10k-25k" className="bg-[#010101] text-white">
                    $10,000 - $25,000
                  </option>
                  <option value="25k-50k" className="bg-[#010101] text-white">
                    $25,000 - $50,000
                  </option>
                  <option value="50k+" className="bg-[#010101] text-white">
                    $50,000+
                  </option>
                </select>
                <textarea
                  placeholder="Tell us about your brand and goals..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ED2450]/50 transition-colors resize-none"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
                <button
                  type="submit"
                  className="w-full gradient-primary text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
