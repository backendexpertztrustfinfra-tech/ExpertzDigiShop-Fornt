import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  RotateCcw, 
  RefreshCcw, 
  CreditCard, 
  Truck, 
  ArrowRight, 
  ShieldCheck, 
  Zap 
} from "lucide-react";

const returnPolicies = [
  {
    title: "Easy Returns",
    icon: <RotateCcw size={28} />,
    description:
      "Return any product within 30 days of delivery, no questions asked. Enjoy a smooth and stress-free return process that ensures your satisfaction every time.",
  },
  {
    title: "Refund Options",
    icon: <CreditCard size={28} />,
    description:
      "Refunds are processed directly to your original payment method within 5–7 business days after your return is approved. Simple and transparent.",
  },
  {
    title: "Return Pickup",
    icon: <Truck size={28} />,
    description:
      "Our logistics partner will pick up your return right from your doorstep. Choose a pickup time that’s convenient for you, hassle-free.",
  },
  {
    title: "Exchange Policy",
    icon: <RefreshCcw size={28} />,
    description:
      "Exchange your item easily if it’s defective or if you simply want another size or color. We’ll make sure it’s a smooth experience for you.",
  },
];

export default function Returns() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950 font-sans selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        
        {/* 1. HERO SECTION - Branded Colors */}
        <section className="relative py-24 bg-zinc-950 text-white overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="relative z-10 max-w-4xl mx-auto px-6"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Zap className="text-[#FF4E50]" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E75480]">Resolution Protocol</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
              Returns <span className="text-[#FF4E50]">&</span> Refunds
            </h1>
            <p className="max-w-2xl mx-auto text-sm md:text-lg font-bold text-[#FAD0C4] uppercase tracking-widest leading-relaxed opacity-80">
              Hassle-free returns, fast digital refunds, and seamless exchange policies designed for your confidence.
            </p>
          </motion.div>
        </section>

        {/* 2. POLICY GRID */}
        <section className="container mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-[#FAD0C4]/20 pb-6 gap-4">
             <h2 className="text-2xl font-black uppercase tracking-tighter italic text-zinc-900">Our Commitments</h2>
             <div className="flex items-center gap-2 text-[#E75480]/60">
                <ShieldCheck size={18} className="text-[#FFD700]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Guaranteed Satisfaction</span>
             </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {returnPolicies.map((policy, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-[2.5rem] border border-[#FAD0C4]/30 shadow-sm hover:shadow-2xl hover:border-[#FF4E50]/20 transition-all duration-500 flex flex-col group h-full"
              >
                <div className="h-16 w-16 bg-[#FFF5F7] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#FF4E50] group-hover:text-white transition-all duration-500 border border-[#FAD0C4]/20 shadow-sm">
                  <div className="text-[#E75480] group-hover:text-white transition-colors">
                    {policy.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-zinc-950 mb-4 uppercase tracking-tight italic group-hover:text-[#FF4E50] transition-colors">
                  {policy.title}
                </h3>
                
                <p className="text-sm font-medium text-zinc-500 leading-relaxed uppercase tracking-wider mb-10 flex-1">
                  {policy.description}
                </p>

                <div className="pt-6 border-t border-[#FAD0C4]/10">
                  <Button variant="outline" className="h-11 px-8 rounded-xl border-[#FF4E50] text-[#FF4E50] font-black uppercase text-[10px] tracking-widest hover:bg-[#FF4E50] hover:text-white transition-all shadow-sm group-hover:shadow-md">
                    Access Protocol <ArrowRight size={14} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 3. CONTACT SUPPORT HUB - Sunset Orange to Rose Pink Gradient */}
          <div className="mt-32">
            <div className="bg-gradient-to-br from-[#FF4E50] to-[#E75480] rounded-[3.5rem] p-12 md:p-20 shadow-2xl shadow-[#FF4E50]/20 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden text-white">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                <RotateCcw size={300} />
              </div>

              <div className="relative z-10 space-y-6 text-center lg:text-left">
                <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.5em]">Human Assistance Node</p>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                  Need Help With <br /> <span className="text-white/70">A Return?</span>
                </h2>
                <p className="max-w-md text-[#FFF5F7] font-bold uppercase tracking-[0.2em] text-xs opacity-90">
                  Our high-priority assistance nodes are active 24/7 to resolve return requests, refunds, or logistics anomalies.
                </p>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Button className="h-16 px-12 bg-white text-zinc-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-zinc-950 hover:text-white transition-all active:scale-95">
                  Contact support
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}