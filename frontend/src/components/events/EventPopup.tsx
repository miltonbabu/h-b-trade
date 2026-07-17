"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const EventPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if popup was already shown in this session
    const alreadyShown = sessionStorage.getItem("eventPopupShown");

    if (alreadyShown) {
      return; // Don't show again
    }

    // Show popup after 1.5s
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    // Auto-hide after 2.5s (1s after showing)
    const hideTimer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("eventPopupShown", "true");
      }, 300);
    }, 2500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleRegisterClick = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("eventPopupShown", "true");
      router.push("/events");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
    >
      <div
        className={`relative w-full sm:max-w-xs bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isClosing ? "translate-y-full sm:scale-95 sm:translate-y-0 opacity-0" : "translate-y-0 sm:scale-100 opacity-100"}`}
      >
        <div className="relative cursor-pointer" onClick={handleRegisterClick}>
          <img
            src="/images/ciaafo_2026_popup_final.png"
            alt="CIAAF Zhengzhou 2026 - 24th China International Auto Aftermarket Fair"
            className="w-full h-auto max-h-[60vh] sm:max-h-[50vh] object-contain"
          />
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-2 sm:px-4 sm:py-3 text-center">
          <p className="text-white text-[10px] sm:text-xs md:text-sm font-medium mb-1.5 sm:mb-2 leading-snug">
            Register now for the 24th China International Auto Aftermarket Fair
          </p>
          <button
            onClick={handleRegisterClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 active:from-orange-600 active:to-yellow-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Register Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;
