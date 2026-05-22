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
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <Image
                src="/hbtrade_logo.png"
                alt="H&B Trade Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-bold"><span className="text-red-600">H</span><span className="text-red-600">&</span><span className="text-green-600">B</span></span>
              <span className="text-xl font-bold text-secondary"> Trade</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-gray-700 hover:text-primary font-medium transition-colors group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X size={24} className="text-primary" />
            ) : (
              <Menu size={24} className="text-primary" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-4 text-gray-700 hover:text-primary hover:bg-primary/5 font-medium rounded-lg transition-colors"
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
