"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Package,
  Filter,
  Search,
  Minus,
  Plus,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Product {
  id: string;
  productCode?: string;
  name: string;
  category: string;
  price: number | string;
  moq: number;
  image: string;
  image2?: string;
  image3?: string;
  description: string;
}

const ProductImageSlider = memo(function ProductImageSlider({ images, productName, category }: { images: string[], productName: string, category?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultipleImages = images.length > 1;

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0 || !images[0]) {
    return (
      <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
        <Package size={48} className="text-gray-400" />
        {category && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            {category}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 overflow-hidden">
      <img
        src={images[currentIndex]}
        alt={`${productName} - Image ${currentIndex + 1}`}
        loading="lazy"
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      
      {category && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
          {category}
        </div>
      )}

      {hasMultipleImages && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors z-10"
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>

          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded text-xs z-10">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
});

export default function WholesaleProductsPage() {
  const { items, addItem, updateQuantity, getTotalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const cartFromItems: { [key: string]: number } = {};
    items.forEach((item) => {
      cartFromItems[item.id] = item.quantity;
    });
    setCart(cartFromItems);
  }, [items]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedCategory !== "All")
        params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const response = await api.get(`/products?${params}`);
      setProducts(response.data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      
      let errorMessage = "Failed to load products. Please try again.";
      
      if (err.response) {
        errorMessage = err.response.data?.error || errorMessage;
      } else if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/products/categories");
      setCategories(["All", ...(response.data?.data || [])]);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const updateCart = (productId: string, change: number) => {
    const current = cart[productId] || 0;
    const newQuantity = Math.max(0, current + change);

    setCart((prev) => ({ ...prev, [productId]: newQuantity }));

    if (change > 0) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        addItem(
          {
            id: product.id,
            productCode: product.productCode,
            name: product.name,
            price: Number(product.price ?? 0),
            image: product.image,
            description: product.description,
            moq: product.moq,
          },
          change,
        );
      }
    } else if (change < 0 && newQuantity >= 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const shareOnWhatsApp = (product: Product) => {
    const productUrl = `${window.location.origin}/wholesale-products?product=${product.id}`;
    const text = `Check out this product: ${product.name}\nPrice: ৳${Number(product.price ?? 0).toFixed(2)}\nLink: ${productUrl}`;
    const whatsappUrl = `https://wa.me/8801835220729?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-3 sm:py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                Wholesale Products
              </h1>
              <p className="hidden sm:block text-base sm:text-lg md:text-xl opacity-90">
                Premium quality products at competitive prices
              </p>
            </div>
            <Link href="/cart">
              <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-6 py-4 shadow-xl">
                <ShoppingBag className="mr-2" size={24} />
                Cart ({getTotalItems()})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
            <form onSubmit={handleSearch} className="relative flex-1 w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </form>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6 sm:py-8 md:py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 sm:py-8 md:py-12">
            <Package size={64} className="mx-auto text-red-400 mb-4" />
            <p className="text-xl text-red-600">{error}</p>
            <Button onClick={fetchProducts} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => {
                const images = [product.image, product.image2, product.image3].filter((img): img is string => Boolean(img));
                
                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <ProductImageSlider images={images} productName={product.name} category={product.category} />
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-800">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description || 'No description available'}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            ৳{Number(product.price ?? 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">per unit</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700">
                            MOQ: {product.moq ?? 1}
                          </p>
                          <p className="text-xs text-gray-500">min. order</p>
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-2 mb-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">1 batch = {product.moq ?? 1} units</span>
                          <span className="font-semibold text-orange-700">
                            ৳{((product.moq ?? 1) * Number(product.price ?? 0)).toFixed(2)}/batch
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => shareOnWhatsApp(product)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white mb-3 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={18} />
                        Inquiry to Seller
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => updateCart(product.id, -1)}
                          disabled={!cart[product.id]}
                          className="w-10 h-10 p-0 bg-gray-200 hover:bg-gray-300 text-gray-700"
                        >
                          <Minus size={18} />
                        </Button>
                        <div className="flex-1 text-center">
                          <span className="font-bold text-lg">{cart[product.id] || 0}</span>
                          <span className="text-xs text-gray-500 block">batches</span>
                        </div>
                        <Button
                          onClick={() => updateCart(product.id, 1)}
                          className="w-10 h-10 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <Plus size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {products.length === 0 && (
              <div className="text-center py-6 sm:py-8 md:py-12">
                <Package size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-600">No products found</p>
                <p className="text-gray-500">
                  Try adjusting your search or filter
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
