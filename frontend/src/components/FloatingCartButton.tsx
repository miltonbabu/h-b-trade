"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function FloatingCartButton() {
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const totalItems = getTotalItems();

  useEffect(() => {
    setIsVisible(!pathname.startsWith("/admin") && !pathname.startsWith("/cart"));
  }, [pathname]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isVisible || !isMobile) return null;

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 right-24 z-50 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="View Cart"
    >
      <ShoppingBag size={24} className="text-white" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
