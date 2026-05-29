"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

const EventPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      router.push("/events");
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isClosing ? "translate-y-full sm:scale-95 sm:translate-y-0 opacity-0" : "translate-y-0 sm:scale-100 opacity-100"}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors shadow-lg active:bg-slate-900"
          aria-label="Close popup"
        >
          <X size={20} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        <div className="relative cursor-pointer" onClick={handleClose}>
          <img
            src="/images/ciaafo_2026_popup_final.png"
            alt="CIAAF Zhengzhou 2026 - 24th China International Auto Aftermarket Fair"
            className="w-full h-auto max-h-[60vh] sm:max-h-none object-contain"
          />
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 sm:px-5 sm:py-4 text-center">
          <p className="text-white text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-3 leading-snug">
            Register now for the 24th China International Auto Aftermarket Fair
          </p>
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 active:from-orange-600 active:to-yellow-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Register Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;
