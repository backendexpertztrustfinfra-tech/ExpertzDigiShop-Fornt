import React from "react"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Eye, Lock, Globe, Mail, ArrowRight } from "lucide-react"

export default function PrivacyPage() {
  const sections = [
    { id: "collect", title: "1. Information We Collect" },
    { id: "use", title: "2. How We Use Information" },
    { id: "sharing", title: "3. Information Sharing" },
    { id: "security", title: "4. Data Security" },
    { id: "rights", title: "5. Your Rights" },
    { id: "cookies", title: "6. Cookies & Tracking" },
    { id: "contact", title: "7. Contact Us" },
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
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-zinc-950 font-sans selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        
        {/* 1. HERO HEADER - Branded Colors */}
        <div className="bg-white border-b border-[#FAD0C4]/20 pt-20 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[#E75480] mb-4">
                  <ShieldCheck size={24} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Privacy Protocol</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
                  Privacy <span className="text-[#FF4E50] not-italic">Policy</span>
                </h1>
                <p className="text-[#E75480] font-bold text-[10px] uppercase tracking-widest mt-4 opacity-70">
                  Last updated: January 1, 2024 • Security Verified
                </p>
              </div>
              <div className="hidden lg:block">
                 <div className="p-4 bg-[#FFF5F7] rounded-2xl border border-[#FAD0C4]/30 flex items-center gap-4">
                    <Lock className="text-[#FFD700]" size={32} />
                    <p className="text-[10px] font-black text-zinc-400 uppercase leading-tight">
                       End-to-End<br/>Data Protection
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* 2. NAVIGATION (Sidebar with Branded Hovers) */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E75480] italic mb-4 opacity-50">Jump to Section</h3>
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
                  <section id="collect" className="scroll-mt-32">
                    <h2 className="text-2xl font-black text-zinc-950 tracking-tight uppercase italic flex items-center gap-3 mb-6">
                       <Eye size={22} className="text-[#FF4E50]" /> 1. Information We Collect
                    </h2>
                    <p className="text-zinc-600 leading-relaxed font-medium mb-8">
                      At Digishop, we collect information you provide directly to us when you create an account, make a purchase, or interact with our support nodes.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Name, Email & Phone Registry",
                        "Billing & Shipping Coordinates",
                        "Secure Payment Tokens",
                        "Order History & Logic"
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 p-5 bg-[#FFF5F7]/50 rounded-2xl text-[11px] font-black uppercase text-[#E75480] border border-[#FAD0C4]/20 shadow-sm transition-all hover:border-[#FF4E50]/30">
                           <span className="text-[#FFD700]">0{i+1}.</span> {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <Separator className="bg-[#FAD0C4]/20" />

                  {/* Section 2 */}
                  <section id="use" className="scroll-mt-32">
                    <h2 className="text-2xl font-black text-zinc-950 tracking-tight uppercase italic mb-6">2. How We Use Data</h2>
                    <div className="space-y-4 text-zinc-600 font-medium">
                      <p>We utilize your data to engineer a seamless shopping experience:</p>
                      <ul className="list-none space-y-3">
                        {["Fulfill logistics & orders", "Improve digital architecture", "Personalize user journeys"].map((text, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm">
                            <ArrowRight size={14} className="text-[#FF4E50]" /> {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* Section 4 - Dark Branded Mode */}
                  <section id="security" className="p-10 bg-zinc-950 rounded-[2.5rem] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <ShieldCheck size={120} />
                    </div>
                    <h2 className="text-xl font-black uppercase italic mb-4 flex items-center gap-3 relative z-10">
                       <Lock className="text-[#FFD700]" size={20} /> 4. Data Security
                    </h2>
                    <p className="text-[10px] text-[#FAD0C4] leading-relaxed font-bold uppercase tracking-[0.2em] relative z-10 opacity-80">
                      We implement 256-bit encryption and secure server protocols to protect your information. Regular security audits are conducted to ensure the integrity of our global data node.
                    </p>
                  </section>

                  {/* Section 7 - Contact Support Hub */}
                  <section id="contact" className="pt-8">
                    <div className="p-10 bg-gradient-to-br from-[#FFF9F0] to-white rounded-[2.5rem] border border-[#FFD700]/20 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
                       <div className="space-y-2 text-center md:text-left">
                          <h2 className="text-2xl font-black text-zinc-900 uppercase italic leading-none">Privacy Support</h2>
                          <p className="text-[10px] font-black text-[#E75480] uppercase tracking-widest opacity-60">Data Protection Officer Hub</p>
                       </div>
                       <div className="flex flex-col gap-3 w-full md:w-auto">
                          <a href="mailto:privacy@expertzdigishop.com" className="h-14 px-10 bg-zinc-950 text-white rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-[#FF4E50] transition-all transform active:scale-95">
                             Contact Registry
                          </a>
                          <p className="text-[9px] text-center font-bold text-zinc-400 tracking-widest uppercase italic ml-1">Address: Cyber City, Gurgaon, HR</p>
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