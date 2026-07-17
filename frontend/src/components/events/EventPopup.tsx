"use client";

import { useEffect, useState } from "react";
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

  const handleRegisterClick = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      router.push("/events");
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
    >
      <div
        className={`relative w-full h-full flex flex-col transition-all duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
      >
        <div
          className="relative flex-1 flex items-center justify-center overflow-auto cursor-pointer"
          onClick={handleRegisterClick}
        >
          <img
            src="/images/ciaafo_2026_popup_final.png"
            alt="CIAAF Zhengzhou 2026 - 24th China International Auto Aftermarket Fair"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-4 sm:px-5 sm:py-6 text-center">
          <p className="text-white text-sm sm:text-base md:text-lg font-medium mb-3 sm:mb-4 leading-snug">
            Register now for the 24th China International Auto Aftermarket Fair
          </p>
          <button
            onClick={handleRegisterClick}
            className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 active:from-orange-600 active:to-yellow-600 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Register Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;
