"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

export default function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Chat Box */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="font-semibold">H&B Trade</p>
                  <p className="text-xs text-white/80">Usually replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-700 mb-3">
              👋 Hi! How can we help you today? We're here for your China-Bangladesh trade needs!
            </p>
            <a
              href="https://wa.me/8801835220729?text=Hi%2C%20I%27m%20interested%20in%20your%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 text-white text-center py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group ${
          isVisible ? "animate-bounce-slow" : ""
        }`}
        style={{
          animation: isVisible ? "pulse-shadow 2s infinite" : "none",
        }}
      >
        <MessageCircle size={28} className="text-white" />
        
        {/* Notification dot */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
          1
        </span>

        {/* Tooltip */}
        {!isOpen && (
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with us! 💬
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></span>
          </span>
        )}
      </button>

      <style jsx>{`
        @keyframes pulse-shadow {
          0%, 100% {
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
          }
          50% {
            box-shadow: 0 4px 25px rgba(34, 197, 94, 0.8);
          }
        }
        .animate-bounce-slow {
          animation: pulse-shadow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
