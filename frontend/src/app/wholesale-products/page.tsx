"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  Package,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
  Tag,
  ChevronDown,
  User,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import ProductCard, { ProductCardData } from "@/components/products/ProductCard";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A → Z",
};

export default function WholesaleProductsPage() {
  const { items, getTotalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const cartQuantities = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach((it) => { m[it.id] = it.quantity; });
    return m;
  }, [items]);

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounce the search input so we don't hammer the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch categories once
  useEffect(() => {
    api.get("/products/categories")
      .then((r) => setCategories(r.data?.data || []))
      .catch(() => { /* non-fatal */ });
  }, []);

  // Fetch products whenever search/category change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.append("category", category);
        if (searchTerm) params.append("search", searchTerm);
        params.append("limit", "60");
        const res = await api.get(`/products?${params}`);
        if (!cancelled) setProducts(res.data?.data || []);
      } catch (e) {
        if (!cancelled) {
          const err = e as { response?: { data?: { error?: string } }; code?: string };
          setError(err.response?.data?.error || (err.code === "ERR_NETWORK" ? "Network error" : "Failed to load products"));
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [searchTerm, category]);

  // Client-side sort (so changing sort doesn't require a refetch)
  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sort) {
      case "price-asc": arr.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price-desc": arr.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "name-asc": arr.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return arr;
  }, [products, sort]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setCategory("all");
    setSort("newest");
  }, []);

  const activeFilterCount = (category !== "all" ? 1 : 0) + (searchTerm ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">Wholesale Products</h1>
            <p className="text-sm text-gray-500 hidden sm:block">Browse our catalog and order directly</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated && (
              <Link href="/profile?tab=orders">
                <Button size="sm" variant="outline" className="shadow-soft">
                  <User className="mr-1.5" size={16} />
                  <span className="hidden xs:inline">My Orders</span>
                </Button>
              </Link>
            )}
            <Link href="/cart">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-soft">
                <ShoppingBag className="mr-1.5" size={16} />
                <span className="hidden xs:inline">Cart</span>
                <span className="ml-1.5 inline-flex items-center justify-center bg-white text-red-600 rounded-full text-xs font-bold min-w-[20px] h-5 px-1.5">
                  {getTotalItems()}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Mobile sticky search + filter trigger */}
        <div className="md:hidden sticky top-14 z-30 -mx-4 px-4 py-3 bg-gray-50/90 backdrop-blur border-b border-gray-100 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products…"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-white text-base shadow-soft focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400"
              />
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative inline-flex items-center justify-center h-11 w-11 rounded-xl bg-white border border-gray-200 shadow-soft text-gray-700 hover:bg-gray-50"
              aria-label="Open filters"
            >
              <SlidersHorizontal size={18} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-64 lg:w-72 shrink-0">
            <div className="sticky top-20 space-y-5">
              <FilterPanel
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                category={category}
                setCategory={setCategory}
                categories={categories}
                sort={sort}
                setSort={setSort}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                <span className="text-gray-500">Filters:</span>
                {category !== "all" && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                    <Tag size={12} /> {category}
                    <button
                      onClick={() => setCategory("all")}
                      className="ml-0.5 hover:bg-slate-200 rounded-full p-0.5"
                      aria-label="Remove category filter"
                    ><X size={12} /></button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                    <Search size={12} /> &ldquo;{searchTerm}&rdquo;
                    <button
                      onClick={() => { setSearchInput(""); setSearchTerm(""); }}
                      className="ml-0.5 hover:bg-slate-200 rounded-full p-0.5"
                      aria-label="Remove search filter"
                    ><X size={12} /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-gray-500 hover:text-gray-700 underline underline-offset-2 ml-1">Clear all</button>
              </div>
            )}

            {/* Result count + desktop sort */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {loading ? "Loading…" : `${sortedProducts.length} product${sortedProducts.length === 1 ? "" : "s"}`}
              </p>
            </div>

            {error ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-8 text-center">
                <Package size={48} className="mx-auto text-red-400 mb-3" />
                <p className="text-red-600 font-medium mb-3">{error}</p>
                <Button onClick={() => setSearchInput((s) => s)}>Try again</Button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-soft animate-pulse">
                    <div className="h-44 sm:h-48 bg-gray-200 rounded-t-2xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-6 bg-gray-200 rounded w-1/2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-8 sm:p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-lg text-gray-700 font-medium">No products found</p>
                <p className="text-sm text-gray-500 mt-1">Try a different search or category</p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Clear filters</Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} quantity={cartQuantities[product.id]} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white shadow-soft-xl overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                category={category}
                setCategory={setCategory}
                categories={categories}
                sort={sort}
                setSort={setSort}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
                onApply={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Filter panel (shared between desktop sidebar and mobile drawer) ---------- */

function FilterPanel({
  searchInput, setSearchInput,
  category, setCategory,
  categories,
  sort, setSort,
  clearFilters, activeFilterCount,
  onApply,
}: {
  searchInput: string; setSearchInput: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  categories: string[];
  sort: SortOption; setSort: (v: SortOption) => void;
  clearFilters: () => void; activeFilterCount: number;
  onApply?: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Search (desktop only - mobile has its own sticky search) */}
      <div className="hidden md:block">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Sort by</label>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="w-full h-10 px-3 pr-9 rounded-xl border border-gray-200 bg-white text-sm shadow-soft appearance-none focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400"
          >
            {Object.entries(SORT_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Category</label>
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1 -mr-1">
          <CategoryItem label="All categories" value="all" current={category} onSelect={(v) => { setCategory(v); onApply?.(); }} />
          {categories.map((c) => (
            <CategoryItem key={c} label={c} value={c} current={category} onSelect={(v) => { setCategory(v); onApply?.(); }} />
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={() => { clearFilters(); onApply?.(); }}
          className="w-full inline-flex items-center justify-center h-10 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear all filters
        </button>
      )}
      {onApply && (
        <button
          onClick={onApply}
          className="w-full inline-flex items-center justify-center h-11 rounded-xl bg-slate-800 text-white text-sm font-semibold shadow-soft hover:bg-slate-900 active:scale-[0.98]"
        >
          Show results
        </button>
      )}
    </div>
  );
}

function CategoryItem({ label, value, current, onSelect }: { label: string; value: string; current: string; onSelect: (v: string) => void; }) {
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
        active
          ? "bg-slate-100 text-slate-900 font-semibold"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}
