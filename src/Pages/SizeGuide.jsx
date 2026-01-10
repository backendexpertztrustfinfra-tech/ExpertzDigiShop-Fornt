import React from "react";
import { Ruler, Info, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card"; 
import { Separator } from "@/components/ui/separator";

export default function SizeGuide() {
  const sizeData = [
    {
      type: "Upperwear",
      sub: "T-Shirts / Shirts / Jackets",
      icon: "https://cdn-icons-png.flaticon.com/512/3144/3144448.png",
      sizes: ["S", "M", "L", "XL", "XXL"],
      note: "Standard unisex fit. Choose your regular size for an optimal silhouette.",
    },
    {
      type: "Bottomwear",
      sub: "Jeans / Trousers / Shorts",
      icon: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
      sizes: ["28", "30", "32", "34", "36", "38"],
      note: "Precision tailored fits. For a relaxed aesthetic, we recommend sizing up.",
    },
    {
      type: "Footwear",
      sub: "Sneakers / Formal / Boots",
      icon: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
      sizes: ["6", "7", "8", "9", "10", "11"],
      note: "True to scale. If between sizes, select the larger increment.",
    },
    {
      type: "Dresses",
      sub: "Skirts / One-Piece / Gowns",
      icon: "https://cdn-icons-png.flaticon.com/512/2331/2331970.png",
      sizes: ["XS", "S", "M", "L", "XL"],
      note: "Contoured engineering. Refer to the model reference chart for length.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-zinc-900 font-sans pb-24 selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        
        {/* 1. EDITORIAL HERO HEADER */}
        <header className="bg-white border-b border-[#FAD0C4]/20 pt-24 pb-16 px-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-[#FF4E50] rounded-full"/>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E75480]">Fitting Protocol</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-zinc-950 tracking-tighter uppercase italic leading-none">
              Size <span className="text-[#FFB800] not-italic">Reference</span>
            </h1>
            <p className="max-w-xl text-zinc-500 font-medium text-sm md:text-base leading-relaxed uppercase tracking-wide opacity-80">
              Ensure the perfect fit. Our standardized metrics are engineered to provide comfort and precision across all collections.
            </p>
          </div>
        </header>

        {/* 2. SIZE ARCHIVE GRID */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid gap-8 md:grid-cols-2">
            {sizeData.map((item, index) => (
              <Card 
                key={index}
                className="border-none shadow-sm ring-1 ring-[#FAD0C4]/30 rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-[#FF4E50]/5 hover:ring-[#FF4E50]/50 transition-all duration-500 group"
              >
                <CardContent className="p-10 space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight italic leading-none">
                        {item.type}
                      </h2>
                      <p className="text-[10px] font-black text-[#E75480] uppercase tracking-widest opacity-60">{item.sub}</p>
                    </div>
                    <div className="h-16 w-16 bg-[#FFF5F7] rounded-2xl flex items-center justify-center p-3 grayscale group-hover:grayscale-0 transition-all duration-500 border border-[#FAD0C4]/20 shadow-inner">
                      <img src={item.icon} alt={item.type} className="w-full h-full object-contain" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.sizes.map((size, i) => (
                      <div
                        key={i}
                        className="h-12 w-12 rounded-xl border border-zinc-100 flex items-center justify-center text-xs font-black text-zinc-400 group-hover:text-zinc-600 hover:!bg-zinc-950 hover:!text-white hover:!border-zinc-950 transition-all cursor-default shadow-sm bg-zinc-50/50"
                      >
                        {size}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-[#FFF9F0] rounded-2xl border border-[#FFD700]/20 flex gap-3">
                    <Info size={16} className="text-[#FFB800] flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-[#E75480] uppercase leading-relaxed tracking-wider">
                      {item.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 3. MEASUREMENT PROTOCOLS */}
          <div className="mt-32 space-y-16">
            <div className="text-center space-y-4">
               <h2 className="text-3xl md:text-5xl font-black text-zinc-950 uppercase tracking-tighter italic">
                 Measuring <span className="text-[#FF4E50] not-italic">Manual</span>
               </h2>
               <div className="h-1.5 w-16 bg-[#FFD700] mx-auto rounded-full shadow-[0_0_15px_rgba(255,215,0,0.3)]"/>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                {
                  title: "Chest",
                  desc: "fullest part / parallel to floor",
                  img: "https://cdn-icons-png.flaticon.com/512/1830/1830839.png",
                },
                {
                  title: "Waist",
                  desc: "natural line / above navel",
                  img: "https://cdn-icons-png.flaticon.com/512/1830/1830866.png",
                },
                {
                  title: "Hips",
                  desc: "feet together / fullest point",
                  img: "https://cdn-icons-png.flaticon.com/512/2223/2223261.png",
                },
                {
                  title: "Inseam",
                  desc: "crotch to bottom of ankle",
                  img: "https://cdn-icons-png.flaticon.com/512/2756/2756897.png",
                },
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#FAD0C4]/10 text-center space-y-4 hover:border-[#FF4E50]/30 transition-all duration-500 shadow-sm group hover:shadow-xl">
                  <div className="h-16 w-16 bg-[#FFF5F7] rounded-2xl flex items-center justify-center mx-auto grayscale group-hover:grayscale-0 transition-all">
                    <img src={item.img} alt={item.title} className="w-10 h-10 opacity-30 group-hover:opacity-100" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-zinc-950 uppercase tracking-widest mb-1">{item.title}</h3>
                    <p className="text-[9px] font-black text-[#E75480] uppercase tracking-tighter leading-tight opacity-60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Trust Note - High Contrast Branded */}
            <div className="max-w-2xl mx-auto p-10 bg-zinc-950 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Ruler size={120} className="text-[#FFD700] rotate-45" />
               </div>
               <div className="relative z-10 space-y-6">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-[#FFB800] uppercase tracking-[0.5em]">Confidential Fit Guarantee</p>
                    <h4 className="text-white text-xl font-black uppercase italic tracking-tighter leading-tight">Still uncertain about your <br/> optimal measurements?</h4>
                 </div>
                 <button className="px-10 h-14 bg-white text-zinc-950 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#FF4E50] hover:text-white transition-all active:scale-95 shadow-xl">
                    Contact Specialist
                 </button>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}