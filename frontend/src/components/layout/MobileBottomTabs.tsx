"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, PlusCircle, PackageSearch, Phone } from "lucide-react";

const tabs = [
  {
    label: "Home",
    icon: Home,
    href: "/",
    match: (pathname: string) => pathname === "/",
  },
  {
    label: "Products",
    icon: ShoppingBag,
    href: "/wholesale-products",
    match: (pathname: string) => pathname.startsWith("/wholesale-products"),
  },
  {
    label: "Request",
    icon: PlusCircle,
    href: "/product-request",
    match: (pathname: string) => pathname.startsWith("/product-request"),
  },
  {
    label: "Track",
    icon: PackageSearch,
    href: "/tracking",
    match: (pathname: string) => pathname.startsWith("/tracking"),
  },
  {
    label: "Contact",
    icon: Phone,
    href: "/contact",
    match: (pathname: string) => pathname.startsWith("/contact"),
  },
];

export default function MobileBottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="mobile-tab-bar">
      <div className="flex items-center justify-around h-14 px-1">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "mobile-tab-active"
                  : "text-gray-400 hover:text-gray-500"
              }`}
            >
              <tab.icon
                className={`mobile-tab-icon ${isActive ? "text-primary" : "text-gray-400"}`}
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}