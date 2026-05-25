"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  MessageCircle,
  Package,
  Check,
  Tag,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import ProductCard, { ProductCardData } from "@/components/products/ProductCard";

interface ProductDetail {
  id: string;
  product_code?: string;
  name: string;
  category?: string;
  price: number | string;
  moq?: number;
  image?: string;
  image2?: string;
  image3?: string;
  description?: string;
  created_at?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { addItem, items } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [batches, setBatches] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${id}`);
        if (cancelled) return;
        setProduct(res.data.data);
        setRelated(res.data.related || []);
      } catch (e) {
        if (cancelled) return;
        const err = e as { response?: { status?: number; data?: { error?: string } } };
        if (err.response?.status === 404) setError("Product not found");
        else setError(err.response?.data?.error || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    return [product.image, product.image2, product.image3].filter((u): u is string => Boolean(u));
  }, [product]);

  const price = Number(product?.price ?? 0);
  const moq = product?.moq ?? 1;
  const inCart = items.find((it) => it.id === id);
  const totalUnits = batches * moq;
  const totalPrice = totalUnits * price;

  function handleAddToCart() {
    if (!product) return;
    addItem({
      id: product.id,
      productCode: product.product_code,
      name: product.name,
      price,
      image: product.image || "",
      description: product.description || "",
      moq,
    }, batches);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  function handleOrderNow() {
    handleAddToCart();
    setTimeout(() => router.push("/cart"), 200);
  }

  function shareOnWhatsApp() {
    if (!product) return;
    const url = `${window.location.origin}/wholesale-products/${product.id}`;
    const text = `Hello, I'm interested in this product:\n\n${product.name}\nPrice: ৳${price.toFixed(2)}/unit (MOQ ${moq})\n\n${url}`;
    window.open(`https://wa.me/8801835220729?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-10 animate-pulse">
            <div className="h-72 sm:h-96 rounded-2xl bg-gray-200" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-24 bg-gray-100 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 sm:py-16 text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={72} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || "Product not found"}</h1>
          <p className="text-gray-600 mb-6">It may have been removed or the link is incorrect.</p>
          <Link href="/wholesale-products">
            <Button><ChevronLeft className="mr-1.5" size={16} /> Back to products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center gap-1.5 text-sm">
          <Link href="/wholesale-products" className="text-gray-500 hover:text-primary inline-flex items-center gap-1">
            <ChevronLeft size={14} /> Wholesale Products
          </Link>
          {product.category && (
            <>
              <span className="text-gray-300">/</span>
              <Link href={`/wholesale-products?category=${encodeURIComponent(product.category)}`} className="text-gray-500 hover:text-primary truncate">
                {product.category}
              </Link>
            </>
          )}
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-5 sm:py-8">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative w-full aspect-square sm:aspect-[4/3] bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[imgIdx]}
                  alt={product.name}
                  fetchPriority="high"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={72} className="text-gray-300" />
                </div>
              )}
              {product.category && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur text-gray-700 px-3 py-1 rounded-full text-xs font-medium shadow-soft">
                  <Tag size={12} /> {product.category}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? "border-primary ring-2 ring-primary/30" : "border-gray-200 hover:border-gray-300"}`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info + order panel */}
          <div className="space-y-5">
            <div>
              {product.product_code && (
                <p className="text-xs font-mono text-gray-400 mb-1">SKU · {product.product_code}</p>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-3xl sm:text-4xl font-bold text-orange-600">৳{price.toFixed(2)}</p>
              <span className="text-sm text-gray-500">per unit</span>
            </div>

            {/* Key facts */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-3">
                <p className="text-xs text-gray-500">MOQ (1 batch)</p>
                <p className="font-semibold text-gray-900 mt-0.5">{moq} units</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-3">
                <p className="text-xs text-gray-500">Batch price</p>
                <p className="font-semibold text-gray-900 mt-0.5">৳{(moq * price).toFixed(2)}</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Order panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 sm:p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Quantity</p>
                <p className="text-xs text-gray-500 mb-3">Sold in batches of {moq} units</p>
                <div className="inline-flex items-center bg-gray-50 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setBatches((b) => Math.max(1, b - 1))}
                    disabled={batches <= 1}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-l-xl text-gray-700 hover:bg-gray-100 disabled:opacity-40 active:scale-95 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="w-16 text-center">
                    <p className="font-bold text-lg leading-none">{batches}</p>
                    <p className="text-[10px] text-gray-500 leading-none mt-0.5">batch{batches === 1 ? "" : "es"}</p>
                  </div>
                  <button
                    onClick={() => setBatches((b) => b + 1)}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-r-xl text-white bg-primary hover:bg-primary-600 active:scale-95 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-700">Total: <span className="font-medium">{totalUnits} units</span></p>
                </div>
                <p className="text-xl font-bold text-orange-600">৳{totalPrice.toFixed(2)}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full"
                  disabled={justAdded}
                >
                  {justAdded ? (
                    <><Check className="mr-1.5" size={16} /> Added!</>
                  ) : (
                    <><ShoppingBag className="mr-1.5" size={16} /> Add to cart</>
                  )}
                </Button>
                <Button onClick={handleOrderNow} className="w-full bg-orange-500 hover:bg-orange-600">
                  Order now →
                </Button>
              </div>

              {inCart && !justAdded && (
                <p className="text-xs text-center text-gray-500">
                  You already have <span className="font-semibold text-gray-900">{inCart.quantity}</span> {inCart.quantity === 1 ? "batch" : "batches"} of this in your cart.
                  {" "}<Link href="/cart" className="text-primary underline">View cart</Link>
                </p>
              )}

              <button
                onClick={shareOnWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm shadow-soft hover:shadow-soft-lg transition-all active:scale-[0.98]"
              >
                <MessageCircle size={16} /> Inquire on WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">More from {product.category || "this category"}</h2>
              <Link href={`/wholesale-products${product.category ? `?category=${encodeURIComponent(product.category)}` : ""}`} className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
