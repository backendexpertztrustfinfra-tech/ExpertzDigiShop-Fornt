import React from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Truck, ShieldCheck, Globe, Package, Clock, MapPin, ArrowRight, Zap } from "lucide-react"

const shippingPolicies = [
  {
    title: "Fast & Reliable Delivery",
    description: "Get your orders delivered quickly with real-time tracking updates and trusted delivery partners across India.",
    icon: <Zap className="w-10 h-10" />,
  },
  {
    title: "Free Shipping Options",
    description: "Enjoy free delivery on eligible products and exclusive shipping benefits for premium members.",
    icon: <ShieldCheck className="w-10 h-10" />,
  },
  {
    title: "International Shipping",
    description: "We deliver to 100+ countries with customs-friendly packaging and transparent international rates.",
    icon: <Globe className="w-10 h-10" />,
  },
  {
    title: "Safe Packaging",
    description: "Every item is carefully packed with protective materials to ensure it reaches you in perfect condition.",
    icon: <Package className="w-10 h-10" />,
  },
];

export default function ShippingInfo() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] font-sans selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        
        {/* 1. COMPACT PREMIUM HERO - Branded */}
        <section className="bg-zinc-950 text-white pt-24 pb-20 text-center relative overflow-hidden border-b border-zinc-800">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 px-6 space-y-4"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-[2px] w-8 bg-[#FFD700] rounded-full"/>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Logistics Node</span>
                <span className="h-[2px] w-8 bg-[#FFD700] rounded-full"/>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
              Shipping <span className="text-[#FF4E50]">Protocols</span>
            </h1>
            <p className="max-w-xl mx-auto text-sm md:text-base font-bold text-[#FAD0C4] uppercase tracking-widest leading-relaxed opacity-80">
              Global delivery standards, real-time tracking, and premium safety measures for every package.
            </p>
          </motion.div>
        </section>

        {/* 2. SHIPPING POLICIES - GRID ENHANCED */}
        <section className="container mx-auto px-6 py-24">
          <div className="grid gap-8 md:grid-cols-2">
            {shippingPolicies.map((policy, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2.5rem] border border-[#FAD0C4]/20 shadow-sm hover:shadow-2xl hover:shadow-[#FF4E50]/5 hover:border-[#FF4E50]/30 transition-all duration-500 group"
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="h-20 w-20 bg-[#FFF5F7] rounded-2xl flex items-center justify-center border border-[#FAD0C4]/30 group-hover:bg-[#FF4E50] group-hover:text-white transition-all duration-500 shadow-sm">
                    {React.cloneElement(policy.icon, { className: "w-10 h-10 text-[#E75480] group-hover:text-white transition-colors" })}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-zinc-950 uppercase tracking-tight italic">
                        {policy.title}
                    </h3>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider leading-relaxed max-w-xs mx-auto">
                        {policy.description}
                    </p>
                  </div>
                  <Button variant="ghost" className="text-[#FF4E50] font-black uppercase text-[10px] tracking-widest hover:bg-[#FFF5F7] rounded-full">
                    Learn Protocol <ArrowRight size={14} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 3. TIMELINES SECTION */}
          <div className="mt-32 relative">
            <div className="text-center space-y-4 mb-16">
               <h2 className="text-3xl md:text-5xl font-black text-zinc-950 uppercase italic tracking-tighter">
                 Estimated <span className="text-[#FFB800] not-italic">Delivery</span>
               </h2>
               <div className="h-1.5 w-16 bg-[#FF4E50] mx-auto rounded-full shadow-[0_0_10px_rgba(255,78,80,0.4)]"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Local Orders", time: "2 - 3 Days", icon: <MapPin size={24}/>, color: "text-[#FF4E50]" },
                { label: "Domestic", time: "3 - 7 Days", icon: <Truck size={24}/>, color: "text-[#FFB800]" },
                { label: "International", time: "7 - 15 Days", icon: <Globe size={24}/>, color: "text-[#E75480]" }
              ].map((item, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-[#FAD0C4]/20 text-center space-y-4 hover:border-[#FF4E50]/30 transition-all duration-500 shadow-sm group hover:shadow-xl">
                   <div className="h-14 w-14 bg-zinc-950 rounded-2xl flex items-center justify-center text-white mx-auto group-hover:bg-[#FF4E50] transition-all duration-500">
                      {item.icon}
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{item.label}</p>
                     <p className={`text-2xl font-black italic tracking-tighter ${item.color}`}>{item.time}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. CONTACT SUPPORT HUB - Ultra Branded */}
          <div className="mt-32 bg-zinc-950 rounded-[3.5rem] p-12 md:p-24 shadow-2xl relative overflow-hidden text-center border-t border-[#FF4E50]/20">
            <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
               <Clock size={400} strokeWidth={0.5} className="text-[#FFD700]" />
            </div>
            
            <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.5em]">Global Support Hub</p>
                    <h2 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Missing <span className="text-[#FF4E50]">Package?</span>
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs md:text-sm max-w-xl mx-auto leading-relaxed opacity-80">
                        Our 24/7 logistics nodes are ready to assist with real-time delivery anomalies or shipping queries.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="h-16 px-12 bg-white text-zinc-950 hover:bg-[#FF4E50] hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl transition-all active:scale-95 border-none">
                        Initialize Contact
                    </Button>
                    <Button variant="outline" className="h-16 px-12 border-zinc-800 text-[#FAD0C4] hover:text-white hover:border-[#FF4E50] rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all">
                        Registry Data
                    </Button>
                </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}