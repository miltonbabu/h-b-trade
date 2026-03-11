'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">H&B</span>
                <span className="text-xl font-bold text-secondary"> Trade</span>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner for China to Bangladesh product sourcing, wholesale supply, and logistics services.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/hbtrade"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://wa.me/8801234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white transition">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/product-request" className="text-gray-400 hover:text-white transition">
                  Product Request
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-gray-400 hover:text-white transition">
                  Track Shipment
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Product Sourcing</li>
              <li className="text-gray-400">Wholesale Supply</li>
              <li className="text-gray-400">Air Cargo</li>
              <li className="text-gray-400">Sea Shipping</li>
              <li className="text-gray-400">Hand Carry Service</li>
              <li className="text-gray-400">Canton Fair Support</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone size={20} className="text-primary mt-1" />
                <div>
                  <p className="text-gray-400">+880 1234-567890</p>
                  <p className="text-gray-400">+86 1234-5678-90</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={20} className="text-primary mt-1" />
                <p className="text-gray-400">info@hbtrade.com</p>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-primary mt-1" />
                <div className="text-gray-400">
                  <p>123 Trade Center, Guangzhou, China</p>
                  <p>456 Business Hub, Dhaka, Bangladesh</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} H&B Trade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
