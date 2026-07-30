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
    setIsReturningUser(!!hasVisited);
  }, [isAuthenticated]);

  const markVisited = () => {
    localStorage.setItem('hb_visited', '1');
  };

  const navLinks = [
    { href: "/", label: "Home", shortLabel: "Home" },
    { href: "/about", label: "About", shortLabel: "About" },
    { href: "/services", label: "Services", shortLabel: "Services" },
    { href: "/wholesale-products", label: "Wholesale", shortLabel: "Wholesale" },
    { href: "/product-request", label: "Request Product", shortLabel: "Request" },
    { href: "/tracking", label: "Track", shortLabel: "Track" },
    { href: "/contact", label: "Contact", shortLabel: "Contact" },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-md"}`}
    >
      {/* Top info bar - hidden on small mobile, visible on md+ */}
      <div className="bg-slate-800 text-white py-1.5 hidden sm:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs lg:text-sm">
          <div className="flex items-center gap-3 lg:gap-6">
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 hover:text-white/80 transition-colors"
            >
              <Phone size={13} />
              <span className="truncate max-w-[140px] lg:max-w-none">{settings.phone}</span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="hidden md:flex items-center gap-1.5 hover:text-white/80 transition-colors"
            >
              <Mail size={13} />
              <span className="truncate max-w-[180px] lg:max-w-none">{settings.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={settings.facebook_page}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80 transition-colors hover:scale-110 transform"
            >
              <Facebook size={14} />
            </a>
          </div>
        </div>
      </div>

      <nav className="container mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center group min-w-0 shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 overflow-hidden" suppressHydrationWarning>
              <Image
                src="/hbtrade_logo.png"
                alt="H&B Trade Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="ml-2 font-bold text-slate-800 text-sm sm:text-base lg:text-lg leading-tight hidden sm:inline-block">
              H&B<span className="text-red-600">Trade</span>
            </span>
          </Link>

          {/* Desktop nav links - hidden below lg (1024px) to prevent crowding */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link-linear text-gray-600 hover:text-slate-800 font-medium text-sm whitespace-nowrap transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: Auth + Hamburger */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop auth buttons - lg+ */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-gray-600 hover:text-slate-800 font-medium transition text-sm"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                      <User size={16} className="text-slate-700" />
                    </div>
                    <span className="hidden xl:inline">{user.name}</span>
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
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition font-medium text-sm shadow-md"
                >
                  <User size={15} />
                  {isReturningUser ? 'Login' : 'Sign Up'}
                </Link>
              )}
            </div>

            {/* Tablet auth icon - md to lg */}
            <div className="hidden md:flex lg:hidden items-center">
              {isAuthenticated && user ? (
                <Link href="/profile" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                    <User size={14} className="text-slate-700" />
                  </div>
                </Link>
              ) : (
                <Link
                  href={isReturningUser ? '/login' : '/signup'}
                  onClick={markVisited}
                  className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-slate-700"
                >
                  <User size={20} />
                </Link>
              )}
            </div>

            {/* Mobile auth icon - below md */}
            <div className="flex md:hidden items-center">
              {isAuthenticated && user ? (
                <Link href="/profile" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition" onClick={() => setIsOpen(false)}>
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                    <User size={14} className="text-slate-700" />
                  </div>
                </Link>
              ) : (
                <Link
                  href={isReturningUser ? '/login' : '/signup'}
                  onClick={() => { markVisited(); setIsOpen(false); }}
                  className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-slate-700"
                >
                  <User size={19} />
                </Link>
              )}
            </div>

            {/* Hamburger menu button - visible below lg (1024px) */}
            <button
              className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X size={22} className="text-slate-700" />
              ) : (
                <Menu size={22} className="text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet dropdown menu */}
        {isOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100 animate-fade-in max-h-[70vh] overflow-y-auto">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center min-h-[44px] px-4 text-gray-700 hover:text-slate-800 hover:bg-gray-50 active:bg-gray-100 font-medium rounded-xl transition-colors duration-150"
                onClick={() => setIsOpen(false)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              {/* Contact quick actions on mobile */}
              <div className="sm:hidden px-4 pb-2 flex gap-3">
                <a
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-slate-800 transition"
                >
                  <Phone size={14} />
                  <span>Call</span>
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-slate-800 transition"
                >
                  <Mail size={14} />
                  <span>Email</span>
                </a>
              </div>
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 min-h-[44px] px-4 text-gray-700 hover:text-slate-800 hover:bg-gray-50 font-medium rounded-xl transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-slate-700 font-bold text-xs">{user.name?.charAt(0) || 'U'}</span>
                    </div>
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 min-h-[44px] px-4 w-full text-red-500 hover:bg-red-50 font-medium rounded-xl transition"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={isReturningUser ? '/login' : '/signup'}
                    className="flex items-center gap-3 min-h-[44px] px-4 text-slate-800 hover:bg-gray-50 font-semibold rounded-xl transition"
                    onClick={() => { markVisited(); setIsOpen(false); }}
                  >
                    <User size={18} />
                    <span>{isReturningUser ? 'Login' : 'Sign Up'}</span>
                  </Link>
                  {isReturningUser && (
                    <Link
                      href="/signup"
                      className="flex items-center gap-3 min-h-[44px] px-4 text-gray-500 hover:bg-gray-50 font-medium rounded-xl transition"
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
