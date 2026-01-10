import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CalendarDays, ArrowRight, Newspaper } from "lucide-react";

const pressArticles = [
  {
    title: "Digishop Launches New Fashion Line",
    date: "Oct 10, 2025",
    excerpt: "Digishop proudly introduces its latest fashion collection featuring sustainable fabrics and bold designs. This collection emphasizes eco-friendly production.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Awarded Best E-Commerce Platform 2025",
    date: "Sep 25, 2025",
    excerpt: "We are honored to receive the 'Best E-Commerce Platform 2025' award for our commitment to innovation and customer satisfaction.",
    image: "https://images.unsplash.com/photo-1556767576-cfba2f2b14f9?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Expanding to International Markets",
    date: "Sep 10, 2025",
    excerpt: "Digishop is expanding its operations to international markets, offering a seamless online shopping experience across Europe and Asia.",
    image: "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Partnership with Local Artisans Announced",
    date: "Aug 20, 2025",
    excerpt: "We’ve partnered with talented artisans from rural areas to bring handcrafted goods to a global audience, empowering local creators.",
    image: "https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Digishop Introduces AI-Powered Assistant",
    date: "Jul 15, 2025",
    excerpt: "With our latest AI-powered shopping assistant, customers can now enjoy personalized recommendations and a smoother checkout process.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Reaching 10 Million Happy Customers",
    date: "Jun 5, 2025",
    excerpt: "We’re thrilled to announce that Digishop has reached a milestone of 10 million active users worldwide, redefining e-commerce.",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
  },
];

export default function PressPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950 font-sans selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        
        {/* 1. HERO SECTION - CLEAN & SHARP */}
        <section className="relative py-24 bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="relative z-10 max-w-4xl mx-auto px-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              {/* Icon in Sunset Orange */}
              <Newspaper className="text-[#FF4E50]" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Media Center</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
              Press <span className="text-[#FF4E50]">&</span> Media
            </h1>
            <p className="max-w-2xl mx-auto text-sm md:text-lg font-bold text-[#FAD0C4] uppercase tracking-widest leading-relaxed">
              Discover Digishop’s latest milestones, achievements, and global news updates.
            </p>
          </motion.div>
        </section>

        {/* 2. ARTICLES GRID */}
        <section className="container mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-[#FAD0C4]/20 pb-6 gap-4">
             <h2 className="text-2xl font-black uppercase tracking-tighter italic text-zinc-900">Latest Announcements</h2>
             {/* Text in Rose Pink */}
             <span className="text-[10px] font-black uppercase text-[#E75480] tracking-widest opacity-60">{pressArticles.length} Entries Found</span>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pressArticles.map((article, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[2rem] border border-[#FAD0C4]/30 overflow-hidden flex flex-col group hover:shadow-2xl hover:border-[#FF4E50]/30 transition-all duration-500 h-full"
              >
                <div className="overflow-hidden aspect-video relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute top-4 left-4">
                    {/* Golden Yellow Badge */}
                     <span className="bg-[#FFD700] text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">News Release</span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-black text-[#E75480] uppercase tracking-widest mb-4">
                    {/* Icon in Sunset Orange */}
                    <CalendarDays size={14} className="text-[#FF4E50]" />
                    {article.date}
                  </div>
                  
                  <h3 className="text-xl font-black text-zinc-900 mb-4 uppercase tracking-tight leading-tight group-hover:text-[#FF4E50] transition-colors italic">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-wider mb-8 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <Button className="mt-auto w-full h-12 bg-zinc-950 hover:bg-[#FF4E50] text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 group/btn">
                    Read Story <ArrowRight size={14} className="ml-2 transition-transform group-hover/btn:translate-x-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. CONTACT MEDIA HUB */}
        <section className="bg-[#FFF5F7] py-24 border-y border-[#FAD0C4]/20 mb-10">
          <div className="max-w-4xl mx-auto px-6 text-center">
             <div className="p-10 bg-white rounded-[2.5rem] shadow-xl border border-[#FAD0C4]/40 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left space-y-2">
                   <h3 className="text-2xl font-black uppercase tracking-tighter italic text-zinc-900">Media Relations</h3>
                   <p className="text-[10px] font-black text-[#E75480] uppercase tracking-widest opacity-60">For press inquiries and brand assets</p>
                </div>
                <a href="mailto:press@digishop.com">
                   <Button variant="outline" className="h-14 px-8 rounded-xl border-[#FF4E50] text-[#FF4E50] font-black uppercase text-[10px] tracking-widest hover:bg-[#FF4E50] hover:text-white transition-all shadow-lg shadow-[#FF4E50]/10">
                      press@digishop.com
                   </Button>
                </a>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}