import React from "react"
import Footer from "../components/layout/Footer" 
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Scale, ScrollText, ArrowRight } from "lucide-react"

export default function TermsPage() {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "license", title: "2. Use License" },
    { id: "products", title: "3. Product Information" },
    { id: "pricing", title: "4. Pricing & Payment" },
    { id: "shipping", title: "5. Shipping & Delivery" },
    { id: "returns", title: "6. Returns & Refunds" },
    { id: "accounts", title: "7. User Accounts" },
    { id: "prohibited", title: "8. Prohibited Uses" },
    { id: "liability", title: "9. Limitation of Liability" },
    { id: "contact", title: "10. Contact Info" },
  ]

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] font-sans selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        
        {/* 1. HERO HEADER */}
        <div className="bg-white border-b border-[#FAD0C4]/20 pt-20 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[#FF4E50] mb-4">
                  <ScrollText size={24} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Legal Documentation</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
                  Terms <span className="text-[#FFB800] not-italic">&</span> Conditions
                </h1>
                <p className="text-[#E75480] font-bold text-[10px] uppercase tracking-widest mt-4 opacity-70">
                  Effective Date: January 1, 2024 • Version 2.1
                </p>
              </div>
              <div className="hidden lg:block">
                 <div className="p-4 bg-[#FFF5F7] rounded-2xl border border-[#FAD0C4]/30 flex items-center gap-4">
                    <ShieldCheck className="text-[#FF4E50]" size={32} />
                    <p className="text-[10px] font-black text-zinc-400 uppercase leading-tight">
                       Authorized &<br/>Legally Verified
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* 2. SIDEBAR NAVIGATION */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E75480] italic mb-4 opacity-50">On this page</h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="block w-full text-left px-4 py-2 text-[10px] font-black text-zinc-400 hover:text-[#FF4E50] hover:bg-[#FFF5F7] rounded-xl transition-all uppercase tracking-wider"
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* 3. POLICY CONTENT */}
            <div className="lg:col-span-9">
              <Card className="border-none shadow-2xl ring-1 ring-[#FAD0C4]/20 rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-8 md:p-16 space-y-16">
                  
                  {/* Section 1 */}
                  <section id="acceptance" className="scroll-mt-32">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic flex items-center gap-3 mb-6">
                       <Scale size={22} className="text-[#FF4E50]" /> Acceptance of Terms
                    </h2>
                    <p className="text-zinc-600 leading-relaxed font-medium">
                      By accessing and using <span className="text-zinc-950 font-bold underline decoration-[#FFD700] underline-offset-4">Digishop</span> (expertzdigishop.com), you accept and agree to be bound by the terms and provision of this agreement. Our services are provided under the strict adherence to digital commerce laws.
                    </p>
                  </section>

                  <Separator className="bg-[#FAD0C4]/20" />

                  {/* Section 2 */}
                  <section id="license" className="scroll-mt-32">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase italic mb-6">2. Use License</h2>
                    <div className="space-y-4">
                      <p className="text-zinc-600 leading-relaxed font-medium">
                        Permission is granted to temporarily download one copy of the materials for personal transitory viewing only:
                      </p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "Modify or copy the materials",
                          "Commercial use or public display",
                          "Reverse engineer software",
                          "Remove copyright notations"
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 p-5 bg-[#FFF5F7]/50 rounded-2xl text-[11px] font-black uppercase text-[#E75480] border border-[#FAD0C4]/20 shadow-sm transition-all hover:border-[#FF4E50]/30">
                             <span className="text-[#FFD700]">0{i+1}.</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* Section 3 & 4 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                     <section id="products">
                        <h3 className="text-lg font-black text-zinc-950 uppercase italic mb-4 border-l-4 border-[#FF4E50] pl-4">3. Product Info</h3>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider leading-relaxed">
                           We strive for accuracy in descriptions. However, we do not warrant that content is error-free. We reserve the right to correct omissions.
                        </p>
                     </section>
                     <section id="pricing">
                        <h3 className="text-lg font-black text-zinc-950 uppercase italic mb-4 border-l-4 border-[#FFB800] pl-4">4. Pricing</h3>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider leading-relaxed">
                           All prices are in INR. We accept Credit/Debit, Net Banking, and UPI for all secure transactions.
                        </p>
                     </section>
                  </div>

                  {/* Section 5 & 6 Branded Boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                     <section id="shipping" className="p-10 bg-zinc-950 rounded-[2.5rem] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck size={100} />
                        </div>
                        <h3 className="text-lg font-black uppercase italic mb-4 flex items-center gap-3">
                           <span className="text-[#FF4E50]">05.</span> Shipping
                        </h3>
                        <p className="text-[10px] text-[#FAD0C4] leading-relaxed font-bold uppercase tracking-widest opacity-80">
                           Delivery times vary by location. We are not responsible for delays caused by external logistics protocols.
                        </p>
                     </section>
                     <section id="returns" className="p-10 bg-[#FFF9F0] border border-[#FFD700]/30 rounded-[2.5rem]">
                        <h3 className="text-lg font-black text-zinc-950 uppercase italic mb-4">06. Returns</h3>
                        <p className="text-[10px] text-[#E75480] leading-relaxed font-bold uppercase tracking-widest">
                           30-day return policy applies. Items must be unworn and in original sealed packaging for valid refund processing.
                        </p>
                     </section>
                  </div>

                  {/* Section 10 - Support Hub */}
                  <section id="contact" className="pt-8">
                    <div className="p-10 bg-gradient-to-br from-[#FFF5F7] to-white rounded-[2.5rem] border border-[#FAD0C4]/30 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
                       <div className="space-y-2 text-center md:text-left">
                          <h2 className="text-2xl font-black text-zinc-900 uppercase italic leading-none">Legal Support</h2>
                          <p className="text-[10px] font-black text-[#E75480] uppercase tracking-widest opacity-60">Corporate Registry Hub</p>
                       </div>
                       <div className="flex flex-col gap-3 w-full md:w-auto">
                          <a href="mailto:legal@expertzdigishop.com" className="h-14 px-10 bg-zinc-950 text-white rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-[#FF4E50] transition-all transform active:scale-95">
                             Email Registry
                          </a>
                          <p className="text-[9px] text-center font-bold text-zinc-400 tracking-widest uppercase italic">Response node: 24-48 Hours</p>
                       </div>
                    </div>
                  </section>

                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}