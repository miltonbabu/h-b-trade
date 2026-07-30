"use client";

import Link from "next/link";
import { useState } from "react";
import { Package, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface ProductCardData {
  id: string;
  product_code?: string;
  productCode?: string;
  name: string;
  category?: string;
  price: number | string;
  moq?: number;
  image?: string;
  image2?: string;
  image3?: string;
  description?: string;
}

interface Props {
  product: ProductCardData;
  /** Currently selected quantity (batches) for this product, if any */
  quantity?: number;
  /** If true, render a compact variant suitable for the related-products grid */
  compact?: boolean;
  onAdd?: () => void;
}

export default function ProductCard({ product, quantity = 0, compact, onAdd }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = [product.image, product.image2, product.image3].filter((u): u is string => Boolean(u));
  const productCode = product.product_code || product.productCode;
  const price = Number(product.price ?? 0);
  const moq = product.moq ?? 1;

  return (
    <Card className="group overflow-hidden hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200">
      <Link href={`/wholesale-products/${product.id}`} className="block">
        <div className={`relative w-full ${compact ? "h-36" : "h-44 sm:h-48"} overflow-hidden bg-gray-100`}>
          {images.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={compact ? 32 : 48} className="text-gray-300" />
            </div>
          ) : (
            <>
              <img
                src={images[imgIdx]}
                alt={`${product.name} – image ${imgIdx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImgIdx((p) => (p === 0 ? images.length - 1 : p - 1));
                    }}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur hover:bg-white text-gray-700 p-1 rounded-full shadow-soft opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImgIdx((p) => (p === images.length - 1 ? 0 : p + 1));
                    }}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur hover:bg-white text-gray-700 p-1 rounded-full shadow-soft opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`block w-1.5 h-1.5 rounded-full ${i === imgIdx ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {product.category && (
            <span className="absolute top-2 left-2 inline-flex items-center bg-white/95 backdrop-blur text-gray-700 px-2.5 py-1 rounded-full text-[11px] font-medium shadow-soft">
              {product.category}
            </span>
          )}
          {quantity > 0 && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-accent text-white px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-soft">
              <ShoppingBag size={10} /> {quantity}
            </span>
          )}
        </div>

        <div className={`${compact ? "p-3" : "p-4"} flex flex-col`}>
          <h3 className={`font-semibold text-gray-900 ${compact ? "text-sm line-clamp-1" : "text-base line-clamp-2 mb-1"}`}>
            {product.name}
          </h3>
          {!compact && product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>
          )}
          <div className="flex items-end justify-between mt-1">
            <div>
              <p className={`${compact ? "text-base" : "text-xl"} font-bold text-amber-600`}>
                ৳{price.toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-500 leading-none">per unit</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-700">MOQ: {moq}</p>
              {productCode && <p className="text-[10px] text-gray-400 font-mono">{productCode}</p>}
            </div>
          </div>
        </div>
      </Link>
      {onAdd && !compact && (
        <div className="px-4 pb-4">
          <button
            onClick={onAdd}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-white text-sm font-semibold shadow-soft hover:bg-primary-600 hover:shadow-soft-lg transition-all active:scale-[0.98]"
          >
            <ShoppingBag size={16} /> Quick add
          </button>
        </div>
      )}
    </Card>
  );
}
