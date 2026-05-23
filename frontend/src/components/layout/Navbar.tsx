"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, Facebook } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/wholesale-products", label: "Wholesale Products" },
    { href: "/product-request", label: "Product Request" },
    { href: "/tracking", label: "Track Shipment" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-md"}`}
    >
      <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a
              href="tel:+8801835220729"
              className="flex items-center gap-2 hover:text-yellow-300 transition-colors"
            >
              <Phone size={14} />
              <span>+880 1835220729</span>
            </a>
            <a
              href="mailto:helpandbenefit30@gmail.com"
              className="flex items-center gap-2 hover:text-yellow-300 transition-colors"
            >
              <Mail size={14} />
              <span>helpandbenefit30@gmail.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com/hbtradebd"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-300 transition-colors hover:scale-110 transform"
            >
              <Facebook size={16} />
            </a>
          </div>
        </div>
      </div>

      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo: tighter on mobile so menu button has room */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 overflow-hidden shrink-0">
              <Image
                src="/hbtrade_logo.png"
                alt="H&B Trade Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="leading-none whitespace-nowrap">
              <span className="text-xl sm:text-2xl md:text-3xl font-serif tracking-[-0.02em]">
                <span className="bg-gradient-to-b from-red-500 to-red-700 bg-clip-text text-transparent">H</span>
                <span className="bg-gradient-to-b from-red-500 to-red-700 bg-clip-text text-transparent">&</span>
                <span className="bg-gradient-to-b from-green-600 to-green-800 bg-clip-text text-transparent">B</span>
              </span>
              <span className="text-[11px] sm:text-sm md:text-base font-serif text-secondary/70 tracking-[0.15em] ml-1 sm:ml-1.5 font-medium">TRADE</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link-linear text-gray-600 hover:text-primary font-medium"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu trigger - 44px tap target */}
          <button
            className="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X size={24} className="text-primary" />
            ) : (
              <Menu size={24} className="text-primary" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 animate-fade-in">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center min-h-11 px-4 text-gray-700 hover:text-primary hover:bg-primary/5 active:bg-primary/10 font-medium rounded-xl transition-colors duration-150"
                onClick={() => setIsOpen(false)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
