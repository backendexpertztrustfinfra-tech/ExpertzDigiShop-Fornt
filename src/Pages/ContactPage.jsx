import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Headphones,
  ChevronDown,
  ArrowRight,
  Send,
} from "lucide-react";

export default function ContactPage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      q: "How can I track my order?",
      a: "You can track your order by logging into your account under 'My Orders' or using the tracking link sent to your email/SMS.",
    },
    {
      q: "Do you ship internationally?",
      a: "Currently, we deliver across India. International shipping options will be available soon.",
    },
    {
      q: "How can I return or exchange a product?",
      a: "Go to 'My Orders', select the product you wish to return, and follow the guided return process. Pickup will be arranged by our team.",
    },
    {
      q: "Can I visit your store in person?",
      a: "Yes! Visit our Faridabad showroom between 10 AM – 7 PM. You can explore products and get expert assistance.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-zinc-950 font-sans selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-24 pb-20 bg-zinc-950 text-white overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="relative z-10 max-w-4xl mx-auto px-6"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Headphones className="text-[#FF4E50]" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Communication Node</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
              Contact <span className="text-[#FF4E50]">DigiShop</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm md:text-lg font-bold text-[#FAD0C4] uppercase tracking-widest leading-relaxed">
              Synchronize with our support team for rapid inquiry resolution and feedback.
            </p>
          </motion.div>
        </section>

        {/* 2. CONTACT GRID */}
        <section className="container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left - Info Cards */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-xl ring-1 ring-[#FAD0C4]/30 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b border-[#FAD0C4]/10 bg-[#FFF5F7]/50">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-[#E75480]">Registry Details</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  {[
                    {
                      icon: <MapPin className="text-[#FF4E50]" size={20} />,
                      title: "Our HQ",
                      content: "27 Neelam Bata Road, Sector 15, Faridabad, Haryana 121007",
                    },
                    {
                      icon: <Phone className="text-[#FFB800]" size={20} />,
                      title: "Phone Node",
                      content: "Care: 1800-123-4567\nOffice: +91-9818-654-321",
                    },
                    {
                      icon: <Mail className="text-[#E75480]" size={20} />,
                      title: "Digital Mail",
                      content: "support@expertzdigishop.com",
                    },
                    {
                      icon: <Clock className="text-[#FFD700]" size={20} />,
                      title: "Sync Window",
                      content: "Mon - Sat: 9 AM - 8 PM\nSun: 10 AM - 6 PM",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="h-10 w-10 bg-[#FFF5F7] rounded-xl flex items-center justify-center border border-[#FAD0C4]/20 group-hover:bg-[#FF4E50] group-hover:text-white transition-all shadow-sm">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{item.title}</h4>
                        <p className="text-sm font-bold text-zinc-900 leading-relaxed whitespace-pre-line">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Instant Chat CTA - Sunset Orange to Rose Pink Gradient */}
              <div className="p-8 bg-gradient-to-br from-[#FF4E50] to-[#E75480] rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-[#FF4E50]/20">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Instant Assistance</p>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Live Support Node</h3>
                <div className="space-y-3">
                  <Button className="w-full h-12 bg-white text-zinc-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-950 hover:text-white transition-all">
                    <MessageCircle size={16} className="mr-2" /> Start Live Chat
                  </Button>
                  <Button variant="outline" className="w-full h-12 border-white/20 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
                    Request Sync Callback
                  </Button>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="lg:col-span-8">
              <Card className="border-none shadow-2xl ring-1 ring-[#FAD0C4]/20 rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className="p-10 md:p-16 pb-6">
                  <CardTitle className="text-3xl md:text-4xl font-black text-zinc-950 uppercase italic tracking-tighter">
                    Send a <span className="text-[#FF4E50]">Message</span>
                  </CardTitle>
                  <p className="text-[10px] font-black text-[#E75480] uppercase tracking-widest mt-2 opacity-70">Expected Response Time: 2-4 Hours</p>
                </CardHeader>
                <CardContent className="p-10 md:p-16 pt-0">
                  <form className="space-y-8 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">First Name *</Label>
                        <Input placeholder="John" className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50/50 focus-visible:ring-[#FF4E50] font-bold" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Name *</Label>
                        <Input placeholder="Doe" className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50/50 focus-visible:ring-[#FF4E50] font-bold" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Hub *</Label>
                        <Input type="email" placeholder="john@example.com" className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50/50 focus-visible:ring-[#FF4E50] font-bold" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Phone Signal</Label>
                        <Input type="tel" placeholder="+91 0000000000" className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50/50 focus-visible:ring-[#FF4E50] font-bold" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Subject Protocol *</Label>
                      <Select>
                        <SelectTrigger className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50/50 focus:ring-[#FF4E50] font-bold text-[#333]">
                          <SelectValue placeholder="Inquiry Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#FAD0C4]">
                          <SelectItem value="order">Order Inquiry</SelectItem>
                          <SelectItem value="refund">Returns & Refunds</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="collab">Collaborations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Detail *</Label>
                      <Textarea placeholder="How can we assist you?" rows={5} className="rounded-2xl border-[#FAD0C4]/40 bg-zinc-50/50 focus-visible:ring-[#FF4E50] font-bold resize-none" />
                    </div>

                    <Button className="w-full h-14 bg-zinc-950 hover:bg-[#FF4E50] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all group active:scale-[0.98]">
                      Transmit Message <Send size={14} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. FAQ SECTION */}
        <section className="py-24 bg-[#FFF5F7]/30 border-y border-[#FAD0C4]/20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center text-zinc-950 uppercase italic tracking-tighter mb-16">
              Frequently <span className="text-[#FF4E50]">Sync'd</span> Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="bg-white rounded-[2rem] border border-[#FAD0C4]/20 p-6 md:p-8 cursor-pointer hover:border-[#FF4E50]/40 transition-all shadow-sm group"
                >
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="font-bold text-zinc-900 text-sm md:text-base uppercase tracking-tight italic group-hover:text-[#FF4E50] transition-colors">{faq.q}</h3>
                    <ChevronDown
                      className={`h-5 w-5 text-[#E75480] transition-transform duration-500 ${openFAQ === i ? "rotate-180 text-[#FF4E50]" : ""}`}
                    />
                  </div>
                  <AnimatePresence>
                    {openFAQ === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-zinc-500 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed pt-4 border-t border-[#FFF5F7]">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. MAP SECTION */}
        <section className="relative h-[400px] w-full bg-zinc-200 grayscale contrast-125">
          <iframe
            title="Digishop Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112341.3448408381!2d77.23439904297805!3d28.369066600000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cdb0108343e8d%3A0xc48c0823e5904571!2sFaridabad%2C%20Haryana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            loading="lazy"
            className="border-none opacity-80"
          ></iframe>
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]"></div>
        </section>

        {/* 5. CTA NODE */}
        <section className="py-24 bg-zinc-950 text-white text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 space-y-10 relative z-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                Let's Build <span className="text-[#FF4E50]">Something Great</span>
              </h2>
              <p className="text-[#FAD0C4] font-bold uppercase tracking-[0.2em] text-xs max-w-xl mx-auto opacity-70">
                Join thousands of satisfied clients. We prioritize every communication signal.
              </p>
            </div>
            <Button className="h-16 px-12 bg-white text-zinc-950 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#FF4E50] hover:text-white transition-all active:scale-95 shadow-2xl">
              Initiate Contact Hub <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}