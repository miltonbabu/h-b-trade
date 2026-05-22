"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  MessageCircle,
  ArrowUp,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
                <Image
                  src="/hbtrade_logo.png"
                  alt="H&B Trade Logo"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-serif tracking-[-0.02em]"><span className="bg-gradient-to-b from-red-400 to-red-600 bg-clip-text text-transparent">H</span><span className="bg-gradient-to-b from-red-400 to-red-600 bg-clip-text text-transparent">&</span><span className="bg-gradient-to-b from-green-500 to-green-700 bg-clip-text text-transparent">B</span></span>
                <span className="text-sm md:text-base font-serif text-secondary/50 tracking-[0.15em] ml-1.5 font-medium">TRADE</span>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner for China to Bangladesh product sourcing,
              wholesale supply, and logistics services.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/hbtradebd"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-linear w-9 h-9 bg-white/[0.06] border border-white/[0.06] rounded-lg flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 text-gray-400 hover:text-white"
              >
                <Facebook size={16} strokeWidth={1.5} />
              </a>
              <a
                href="https://wa.me/8801835220729"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-linear w-9 h-9 bg-white/[0.06] border border-white/[0.06] rounded-lg flex items-center justify-center hover:bg-green-500/20 hover:border-green-500/30 text-gray-400 hover:text-white"
              >
                <MessageCircle size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white/80 tracking-[-0.01em] uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/services", label: "Our Services" },
                { href: "/product-request", label: "Product Request" },
                { href: "/tracking", label: "Track Shipment" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="footer-link-linear text-gray-500 hover:text-secondary text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white/80 tracking-[-0.01em] uppercase">
              Our Services
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/services/product-sourcing", label: "Product Sourcing" },
                { href: "/services/wholesale-supply", label: "Wholesale Supply" },
                { href: "/services/air-cargo", label: "Air Cargo" },
                { href: "/services/sea-shipping", label: "Sea Shipping" },
                { href: "/services/hand-carry", label: "Hand Carry Service" },
                { href: "/services/canton-fair", label: "Canton Fair Support" },
              ].map((service) => (
                <li key={service.href}>
                  <Link
                    href={service.href}
                    className="footer-link-linear text-gray-500 hover:text-secondary text-sm flex items-center gap-2.5"
                  >
                    <span className="w-1 h-1 bg-primary/60 rounded-full"></span>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-white/80 tracking-[-0.01em] uppercase">
              Contact Us
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3 group">
                <a href="tel:+8801835220729" className="footer-icon-linear w-8 h-8 bg-white/[0.04] border border-white/[0.06] rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30">
                  <Phone
                    size={14}
                    strokeWidth={1.5}
                    className="text-gray-500 group-hover:text-primary transition-colors duration-300"
                  />
                </a>
                <div className="text-gray-500 text-sm">
                  <a href="tel:+8801835220729" className="hover:text-secondary transition-colors">+880 1835220729</a><br />
                  <a href="tel:+8613071095097" className="hover:text-secondary transition-colors">+86 13071095097</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <a href="mailto:helpandbenefit30@gmail.com" className="footer-icon-linear w-8 h-8 bg-white/[0.04] border border-white/[0.06] rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30">
                  <Mail
                    size={14}
                    strokeWidth={1.5}
                    className="text-gray-500 group-hover:text-primary transition-colors duration-300"
                  />
                </a>
                <a href="mailto:helpandbenefit30@gmail.com" className="text-gray-500 text-sm hover:text-secondary transition-colors">
                  helpandbenefit30@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <a href="https://maps.google.com/?q=Tahei+Town+Baiyun+District+Guangzhou" target="_blank" rel="noopener noreferrer" className="footer-icon-linear w-8 h-8 bg-white/[0.04] border border-white/[0.06] rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30">
                  <MapPin
                    size={14}
                    strokeWidth={1.5}
                    className="text-gray-500 group-hover:text-primary transition-colors duration-300"
                  />
                </a>
                <div className="text-gray-500 text-xs leading-relaxed">
                  <p className="font-medium text-gray-400 mb-0.5">
                    <a href="https://maps.google.com/?q=Tahei+Town+Baiyun+District+Guangzhou" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">🇨🇳 China</a>
                  </p>
                  <p>
                    <a href="https://maps.google.com/?q=Tahei+Town+Baiyun+District+Guangzhou" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Tahei Town, Baiyun District, Guangzhou</a>
                  </p>
                  <p className="font-medium text-gray-400 mt-1.5 mb-0.5">
                    <a href="https://maps.google.com/?q=Dhaka+Uttora+Sector+5+Road+3+House+25" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">🇧🇩 Bangladesh</a>
                  </p>
                  <p>
                    <a href="https://maps.google.com/?q=Dhaka+Uttora+Sector+5+Road+3+House+25" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Dhaka, Uttara, Sector 5, Road 3, House # 25</a>
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] mt-8 pt-8 text-center text-gray-600 text-sm">
          <p>
            &copy; {currentYear} H&B Trade. All rights reserved. Developed by{" "}
            <a
              href="https://www.linkedin.com/in/milton-babu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary/80 hover:text-secondary transition-colors duration-300"
            >
              Milton Babu
            </a>
          </p>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 w-12 h-12 bg-gradient-to-br from-primary to-primary-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-[60] ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ArrowUp size={24} className="text-white" />
      </button>
    </footer>
  );
}
