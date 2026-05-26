"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, Facebook, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/hooks/useSettings";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const settings = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const hasVisited = localStorage.getItem('customer_user') || localStorage.getItem('hb_visited');
    if (hasVisited) {
      setIsReturningUser(true);
    } else {
      setIsReturningUser(false);
    }
  }, [isAuthenticated]);

  const markVisited = () => {
    localStorage.setItem('hb_visited', '1');
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/wholesale-products", label: "Wholesale Products" },
    { href: "/product-request", label: "Product Request" },
    { href: "/tracking", label: "Track Shipment" },
    { href: "/contact", label: "Contact" },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-md"}`}
    >
      <div className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 hover:text-yellow-300 transition-colors"
            >
              <Phone size={14} />
              <span>{settings.phone}</span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-2 hover:text-yellow-300 transition-colors"
            >
              <Mail size={14} />
              <span>{settings.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={settings.facebook_page}
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
          <Link href="/" className="flex items-center group min-w-0">
            <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 overflow-hidden shrink-0" suppressHydrationWarning>
              <Image
                src="/hbtrade_logo.png"
                alt="H&B Trade Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
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
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="hidden lg:inline">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href={isReturningUser ? '/login' : '/signup'}
                onClick={markVisited}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
              >
                <User size={16} />
                {isReturningUser ? 'Login' : 'Sign Up'}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && user ? (
              <Link href="/profile" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition" onClick={() => setIsOpen(false)}>
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                  <User size={14} className="text-primary" />
                </div>
              </Link>
            ) : (
              <Link
                href={isReturningUser ? '/login' : '/signup'}
                onClick={() => { markVisited(); setIsOpen(false); }}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-600"
              >
                <User size={20} />
              </Link>
            )}
            <button
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X size={22} className="text-primary" />
              ) : (
                <Menu size={22} className="text-primary" />
              )}
            </button>
          </div>
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
            <div className="border-t border-gray-100 mt-2 pt-2">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 min-h-11 px-4 text-gray-700 hover:text-primary hover:bg-primary/5 font-medium rounded-xl transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-xs">{user.name?.charAt(0) || 'U'}</span>
                    </div>
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 min-h-11 px-4 w-full text-red-500 hover:bg-red-50 font-medium rounded-xl transition"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={isReturningUser ? '/login' : '/signup'}
                    className="flex items-center gap-3 min-h-11 px-4 text-primary hover:bg-primary/5 font-medium rounded-xl transition"
                    onClick={() => { markVisited(); setIsOpen(false); }}
                  >
                    <User size={18} />
                    <span>{isReturningUser ? 'Login' : 'Sign Up'}</span>
                  </Link>
                  {isReturningUser && (
                    <Link
                      href="/signup"
                      className="flex items-center gap-3 min-h-11 px-4 text-gray-500 hover:bg-gray-50 font-medium rounded-xl transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <User size={18} />
                      <span>Create Account</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
