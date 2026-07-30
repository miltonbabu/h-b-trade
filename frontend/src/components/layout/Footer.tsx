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
import { useSettings } from "@/hooks/useSettings";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const settings = useSettings();

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
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Subtle glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(30,58,95,0.2)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(4,120,87,0.1)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden bg-white rounded-xl p-1.5 shadow-lg">
                <Image
                  src="/hbtrade_logo.png"
                  alt="H&B Trade Logo"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  H<span className="text-red-400">&</span>B
                </span>
                <span className="text-xs sm:text-sm font-bold text-white/70 tracking-[0.2em] ml-1.5 block">TRADE</span>
              </div>
            </div>
            <p className="text-gray-300 mb-5 text-sm leading-relaxed">
              Your trusted partner for China to Bangladesh product sourcing,
              wholesale supply, and logistics services.
            </p>
            <div className="flex gap-3">
              <a
                href={settings.facebook_page}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-linear w-10 h-10 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 text-gray-300 hover:text-white transition-all duration-300"
              >
                <Facebook size={17} strokeWidth={1.5} />
              </a>
              <a
                href={settings.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-linear w-10 h-10 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 text-gray-300 hover:text-white transition-all duration-300"
              >
                <MessageCircle size={17} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-white tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="space-y-3">
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
                    className="footer-link-linear text-gray-300 hover:text-white text-sm transition-colors duration-200 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-white tracking-wider uppercase">
              Our Services
            </h3>
            <ul className="space-y-3">
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
                    className="footer-link-linear text-gray-300 hover:text-white text-sm flex items-center gap-2.5 transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-white tracking-wider uppercase">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 group-hover:border-red-400/30 transition-all duration-300">
                  <Phone
                    size={15}
                    strokeWidth={1.5}
                    className="text-gray-300 group-hover:text-red-400 transition-colors duration-300"
                  />
                </div>
                <div className="pt-1">
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="text-gray-300 hover:text-white text-sm transition-colors block">{settings.phone}</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/30 transition-all duration-300">
                  <Mail
                    size={15}
                    strokeWidth={1.5}
                    className="text-gray-300 group-hover:text-emerald-400 transition-colors duration-300"
                  />
                </div>
                <div className="pt-1 min-w-0">
                  <a href={`mailto:${settings.email}`} className="text-gray-300 hover:text-white text-sm transition-colors block break-all">{settings.email}</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500/20 group-hover:border-sky-400/30 transition-all duration-300">
                  <MapPin
                    size={15}
                    strokeWidth={1.5}
                    className="text-gray-300 group-hover:text-sky-400 transition-colors duration-300"
                  />
                </div>
                <div className="text-gray-300 text-xs sm:text-sm leading-relaxed pt-1">
                  {settings.office_address.split('|').map((addr, i) => (
                    <p key={i} className="mb-0.5">{addr.trim()}</p>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} H&B Trade. All rights reserved. Developed by{" "}
            <a
              href="https://www.linkedin.com/in/milton-babu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-300"
            >
              Milton Babu
            </a>
          </p>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-[60] ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ArrowUp size={22} className="text-white" />
      </button>
    </footer>
  );
}
