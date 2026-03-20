"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Why Us", href: "#why-us" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Indie Pro Marketing"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[#ED2450] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="gradient-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Book a Call
            </a>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-base font-medium text-gray-700 hover:text-[#ED2450] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="block text-center gradient-primary text-white px-6 py-3 rounded-full text-sm font-semibold"
            onClick={() => setIsOpen(false)}
          >
            Book a Call
          </a>
        </div>
      )}
    </nav>
  );
}
