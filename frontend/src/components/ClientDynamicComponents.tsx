"use client";

import dynamic from "next/dynamic";

const WhatsAppButton = dynamic(() => import("@/components/WhatsAppButton"), {
  loading: () => null,
  ssr: false,
});
const FloatingCartButton = dynamic(() => import("@/components/FloatingCartButton"), {
  loading: () => null,
  ssr: false,
});

export default function ClientDynamicComponents() {
  return (
    <>
      <FloatingCartButton />
      <WhatsAppButton />
    </>
  );
}
