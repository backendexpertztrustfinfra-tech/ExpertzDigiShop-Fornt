"use client"
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productAPI } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SlidersHorizontal, Info } from "lucide-react";

const categoryKeywords = {
  "indian-wear": ["saree", "kurta", "lehenga", "salwar", "ethnic", "traditional", "dupatta", "anarkali", "churidar", "gown"],
  "western-wear": ["jeans", "denim", "jacket", "t-shirt", "shirt", "top", "skirt", "hoodie", "crop", "pant"],
  makeup: ["lipstick", "foundation", "eyeliner", "concealer", "beauty", "makeup", "compact"],
  accessories: ["bag", "watch", "jewelry", "ring", "necklace", "bracelet"],
  sportswear: ["gym", "active", "fitness", "running", "sports", "track"],
  "personal-care": ["cream", "soap", "shampoo", "skincare", "hair", "lotion"],
};

export default function CategoryProducts() {
  const { categoryName } = useParams();
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await productAPI.getFeaturedProducts();
        const list = Array.isArray(data) ? data : data?.products || [];
        const keywords = (categoryKeywords[categoryName] || []).map((k) => k.toLowerCase());
        const catLower = categoryName.toLowerCase();

        const result = list.filter((p) => {
          const name = (p.name || "").toLowerCase();
          const desc = (p.description || "").toLowerCase();
          const cat = (p.category || "").toLowerCase();
          if (cat.includes(catLower)) return true;
          return keywords.some((kw) => name.includes(kw) || desc.includes(kw));
        });
        setFiltered(result);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryName]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FFF5F7]">
        {/* Animated Loader with Sunset Orange border top */}
        <div className="w-12 h-12 border-2 border-[#FAD0C4] border-t-[#FF4E50] rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#E75480]">Curating Collection...</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-white selection:bg-[#FF4E50] selection:text-white">
      {/* --- PREMIUM STICKY HEADER --- */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#FAD0C4]">
        <div className="max-w-[1440px] mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2">
            <div className="p-2 group-hover:bg-[#FF4E50] group-hover:text-white rounded-full transition-all duration-300 text-[#333]">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block text-[#333]">Back to Gallery</span>
          </Link>

          {/* Title in Rose Pink with Sunset Orange count */}
          <h1 className="text-sm sm:text-lg font-black uppercase tracking-[0.4em] text-center flex-1 text-[#E75480]">
            {categoryName.replace("-", " ")} <span className="text-[#FFD700] ml-2 font-light">({filtered.length})</span>
          </h1>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#FFF5F7] rounded-full transition-all text-[#FF4E50]">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-10 lg:py-16">
        
        {/* --- EMPTY STATE --- */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="w-20 h-20 bg-[#FFF5F7] rounded-full flex items-center justify-center">
                <Info className="h-8 w-8 text-[#FFD700]" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-light uppercase tracking-tighter text-[#333]">No items found in this vault</h2>
                <p className="text-[#E75480]/60 text-sm max-w-xs mx-auto">Our current season's collection for this category has been exhausted. Check back soon.</p>
            </div>
            <Link to="/">
              {/* Button in Sunset Orange with Rose Pink Hover */}
              <Button className="h-12 px-8 rounded-full bg-[#FF4E50] text-white hover:bg-[#E75480] uppercase text-[10px] font-black tracking-[0.2em] transition-all">
                Explore New Arrivals
              </Button>
            </Link>
          </div>
        )}

        {/* --- MINIMALIST PRODUCT GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-10 sm:gap-y-20">
          {filtered.map((product) => (
            <div key={product._id || product.id} className="group flex flex-col space-y-4">
              {/* Image Container with Rose Pink subtle border */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#FFF5F7] ring-1 ring-[#FAD0C4] group-hover:ring-[#FF4E50] transition-all duration-500">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- FOOTER DECOR --- */}
      {filtered.length > 0 && (
          <div className="py-20 flex flex-col items-center border-t border-[#FAD0C4]">
              {/* Vertical line in Golden Yellow */}
              <div className="h-12 w-[1px] bg-[#FFD700] mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E75480]/40">End of Collection</p>
          </div>
      )}
    </section>
  );
}