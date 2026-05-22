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
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <Image
                  src="/hbtrade_logo.png"
                  alt="H&B Trade Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-white"><span className="text-red-500">H</span><span className="text-red-500">&</span><span className="text-green-500">B</span></span>
                <span className="text-xl font-bold text-secondary"> Trade</span>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner for China to Bangladesh product sourcing,
              wholesale supply, and logistics services.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/hbtradebd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-primary hover:to-primary-700 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://wa.me/8801835220729"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-green-500 hover:to-green-600 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
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
                    className="text-gray-400 hover:text-secondary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-secondary transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Our Services
            </h3>
            <ul className="space-y-2">
              {[
                "Product Sourcing",
                "Wholesale Supply",
                "Air Cargo",
                "Sea Shipping",
                "Hand Carry Service",
                "Canton Fair Support",
              ].map((service) => (
                <li
                  key={service}
                  className="text-gray-400 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                  <Phone
                    size={16}
                    className="text-primary group-hover:text-white transition-colors"
                  />
                </div>
                <div className="text-gray-400">
                  <p>+880 1835220729</p>
                  <p>+86 13071095097</p>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                  <Mail
                    size={16}
                    className="text-primary group-hover:text-white transition-colors"
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  helpandbenefit30@gmail.com
                </p>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                  <MapPin
                    size={16}
                    className="text-primary group-hover:text-white transition-colors"
                  />
                </div>
                <div className="text-gray-400 text-xs leading-relaxed">
                  <p className="font-semibold text-gray-300 mb-1">🇨🇳 China</p>
                  <p>Tahei Town, Baiyun District, Guangzhou</p>
                  <p className="font-semibold text-gray-300 mt-2 mb-1">
                    🇧🇩 Bangladesh
                  </p>
                  <p>Dhaka, Uttara, Sector 5, Road 3, House # 25</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {currentYear} H&B Trade. All rights reserved. Developed by{" "}
            <a
              href="https://www.linkedin.com/in/milton-babu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-yellow-300 transition-colors font-medium"
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
