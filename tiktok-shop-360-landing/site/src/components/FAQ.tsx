"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What makes Indie Pro Marketing different from other TikTok Shop agencies?",
    answer:
      "We're a true 360° partner — not just an agency that handles one piece. We manage everything from shop setup and operations to affiliate recruitment, content creation, ads, and live shopping. Plus, we serve brands in both Mexico and the US, giving us unique cross-border expertise.",
  },
  {
    question: "Who is Indie Pro Marketing best suited for?",
    answer:
      "We work best with established brands that want to build TikTok Shop into a serious revenue channel. Whether you're launching from scratch or looking to scale an existing shop, our end-to-end approach is designed for brands ready to invest in growth.",
  },
  {
    question: "Do you require minimum budgets or revenue thresholds?",
    answer:
      "We work with brands at various stages. During our free strategy call, we'll assess your current position and recommend the right package and investment level to achieve your goals.",
  },
  {
    question: "Do you manage TikTok Shop end to end or only specific functions?",
    answer:
      "We offer full end-to-end management — from store setup and product uploads to affiliate programs, content production, paid ads, and live shopping. You can also choose specific services if you prefer to handle some areas in-house.",
  },
  {
    question: "What does the first 30-60 days typically look like?",
    answer:
      "In the first 30 days, we strategize, set up your shop, and begin recruiting affiliates. By day 60, we're actively scaling content, running ads, and building momentum. Most brands see significant traction within the first 90 days.",
  },
  {
    question: "How do you measure success and ROI?",
    answer:
      "We track contribution profit across all platforms — not just vanity metrics. You'll see exactly how TikTok Shop impacts your bottom line, including cross-channel lift on Meta, Google, Amazon, and retail.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#ED2450] text-sm font-semibold uppercase tracking-widest mb-4">
            FAQ
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#010101] tracking-wide">
            YOU HAVE <span className="text-[#ED2450]">QUESTIONS</span>
            <br />
            WE HAVE ANSWERS
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-[#ED2450]/30 transition-colors"
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <span className="text-base sm:text-lg font-semibold text-[#010101] pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-[#ED2450] transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 pb-6" : "max-h-0"
                }`}
              >
                <p className="px-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
