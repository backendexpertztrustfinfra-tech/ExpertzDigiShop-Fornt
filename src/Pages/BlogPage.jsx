import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CalendarDays, User, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "Top 10 Fashion Trends for 2025",
    author: "Neeraj Chaurasiya",
    date: "Oct 18, 2025",
    excerpt: "From vibrant colors to minimalist silhouettes, here are the fashion trends defining 2025.",
    image: "https://images.unsplash.com/photo-1520975918311-7d7f3d1bcae9?auto=format&fit=crop&w=1200&q=80",
    category: "Trends",
  },
  {
    title: "Your Guide to Sustainable Shopping",
    author: "Priya Sharma",
    date: "Oct 10, 2025",
    excerpt: "Discover eco-friendly brands and how to build a wardrobe that’s stylish and sustainable.",
    image: "https://images.unsplash.com/photo-1618354691373-fd1d314d9c9d?auto=format&fit=crop&w=1200&q=80",
    category: "Sustainability",
  },
  {
    title: "The Art of Accessorizing",
    author: "Amit Mehta",
    date: "Sep 30, 2025",
    excerpt: "Accessories complete your look. Learn how to mix statement jewelry with subtle elegance.",
    image: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80",
    category: "Accessories",
  },
  {
    title: "Streetwear Reimagined for 2025",
    author: "Rahul Kumar",
    date: "Sep 15, 2025",
    excerpt: "Urban meets luxury — explore how streetwear continues to dominate modern fashion.",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    category: "Trends",
  },
  {
    title: "How to Build a Capsule Wardrobe",
    author: "Digishop Editorial",
    date: "Aug 25, 2025",
    excerpt: "Simplify your life and style with a timeless, versatile capsule wardrobe.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4c?auto=format&fit=crop&w=1200&q=80",
    category: "Style Tips",
  },
  {
    title: "Tech Meets Fashion: Virtual Try-Ons",
    author: "Digishop Team",
    date: "Aug 15, 2025",
    excerpt: "How AI and AR are revolutionizing the online shopping experience at Digishop.",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6b12c?auto=format&fit=crop&w=1200&q=80",
    category: "Tech in Fashion",
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Trends", "Style Tips", "Accessories", "Sustainability", "Tech in Fashion"];

  const filteredPosts = blogPosts.filter(
    (post) =>
      (selectedCategory === "All" || post.category === selectedCategory) &&
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        
        {/* 1. HERO SECTION */}
        <section className="relative py-24 bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="relative z-10 max-w-4xl mx-auto px-6 text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
              Digishop Fashion <span className="text-[#FF4E50]">Blog</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl font-bold text-[#FAD0C4] uppercase tracking-widest leading-relaxed">
              The ultimate destination for style inspiration, fashion insights, and trend updates.
            </p>
          </motion.div>
        </section>

        {/* 2. FILTERS & SEARCH */}
        <section className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#FAD0C4]/20 py-6 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all ${
                    selectedCategory === cat
                      ? "bg-[#FF4E50] text-white border-[#FF4E50] shadow-lg shadow-[#FF4E50]/20"
                      : "bg-[#FFF5F7] text-[#E75480] border-[#FAD0C4]/50 hover:border-[#FF4E50]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E75480]/50 group-focus-within:text-[#FF4E50] transition-colors" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-11 rounded-full border-[#FAD0C4] bg-white focus:ring-[#FF4E50] font-bold text-xs"
              />
            </div>
          </div>
        </section>

        {/* 3. BLOG GRID */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <AnimatePresence mode="popLayout">
            {filteredPosts.length > 0 ? (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    layout
                    key={post.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group bg-white rounded-[2rem] border border-[#FAD0C4]/20 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-2"
                  >
                    <div className="overflow-hidden aspect-video relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-[#FFD700] text-black font-black uppercase text-[8px] tracking-widest border-none">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-4 text-[10px] font-black text-[#E75480] uppercase tracking-widest mb-4 opacity-70">
                        <span className="flex items-center gap-1"><User size={14} className="text-[#FF4E50]"/> {post.author}</span>
                        <span className="flex items-center gap-1"><CalendarDays size={14} className="text-[#FF4E50]"/> {post.date}</span>
                      </div>
                      <h3 className="text-2xl font-black text-[#333] mb-4 uppercase tracking-tighter leading-tight group-hover:text-[#FF4E50] transition-colors italic">
                        {post.title}
                      </h3>
                      <p className="text-sm font-medium text-zinc-500 mb-8 flex-1 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <Button className="w-full h-12 bg-zinc-950 hover:bg-[#FF4E50] text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg hover:shadow-[#FF4E50]/20 group/btn">
                        Read More <ArrowRight size={14} className="ml-2 transition-transform group-hover/btn:translate-x-2" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-[#E75480] font-black uppercase tracking-[0.3em] opacity-40">No matching posts found in the archive.</p>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* 4. NEWSLETTER */}
        <section className="bg-gradient-to-br from-[#FF4E50] to-[#E75480] py-20 text-white text-center rounded-[3.5rem] mx-6 mb-20 shadow-2xl shadow-[#FF4E50]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase italic tracking-tighter">
              Join the Style Community 💌
            </h2>
            <p className="text-[#FFF5F7] mb-10 font-bold uppercase tracking-widest text-sm opacity-90">
              Subscribe for weekly fashion trends and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto bg-white p-2 rounded-2xl shadow-2xl">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full border-none shadow-none focus-visible:ring-0 text-zinc-900 font-bold placeholder:text-zinc-300"
              />
              <Button className="w-full sm:w-auto bg-[#FF4E50] hover:bg-zinc-950 text-white font-black uppercase px-10 py-6 rounded-xl transition-all shadow-lg">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}