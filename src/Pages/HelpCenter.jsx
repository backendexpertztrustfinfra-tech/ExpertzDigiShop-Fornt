import React from "react";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const helpTopics = [
  {
    question: "How do I create an account?",
    answer: "To create an account, click on the 'Sign Up' button on the top-right corner, fill in your details, and verify your email to start shopping.",
  },
  {
    question: "How can I reset my password?",
    answer: "Click on 'Forgot Password' at the login page, enter your registered email, and follow the reset link sent to your inbox securely.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit/debit cards, net banking, UPI, and PayPal for safe and secure payments.",
  },
  {
    question: "How do I track my order?",
    answer: "After your order is shipped, a tracking link will be emailed to you. You can also view tracking details in your 'My Orders' section.",
  },
  {
    question: "How can I contact customer support?",
    answer: "You can reach us via live chat, email at support@expertzdigishop.com, or call our 24/7 customer care number 1800-123-4567.",
  },
  {
    question: "Can I cancel or modify my order?",
    answer: "Yes, orders can be modified or canceled within 30 minutes of placement. Visit the 'My Orders' section and click on 'Modify/Cancel'.",
  },
];

export default function HelpCenter() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-zinc-900 font-sans selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        
        {/* 1. COMPACT HERO SECTION */}
        <section className="relative py-16 bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
              Help <span className="text-[#FF4E50]">Center</span>
            </h1>
            <p className="max-w-xl mx-auto text-sm md:text-base font-bold text-[#FAD0C4] uppercase tracking-widest leading-relaxed">
              Find quick answers to your questions or reach out to our support team.
            </p>
            
            {/* Search Bar with Sunset Orange Focus */}
            <div className="max-w-md mx-auto relative group mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#FF4E50] transition-colors" size={18} />
              <Input 
                placeholder="Search for help..."
                className="h-12 pl-11 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-[#FF4E50] font-bold"
              />
            </div>
          </div>
        </section>

        {/* 2. FAQ GRID */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-[#FAD0C4]/20 pb-6 gap-4">
             <h2 className="text-2xl font-black uppercase tracking-tighter italic text-zinc-900">Frequently Asked Questions</h2>
             <div className="flex items-center gap-2 text-zinc-400">
                <ShieldCheck size={16} className="text-[#FFD700]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Solutions</span>
             </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {helpTopics.map((topic, index) => (
              <Card 
                key={index}
                className="border-none shadow-sm ring-1 ring-zinc-200 rounded-[2rem] bg-white hover:ring-[#FF4E50] transition-all duration-300 group overflow-hidden"
              >
                <CardHeader className="p-8 pb-4">
                  <div className="h-10 w-10 bg-[#FFF5F7] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF4E50] group-hover:text-white transition-all text-[#E75480]">
                    <Zap size={18} className="fill-current" />
                  </div>
                  <CardTitle className="text-lg font-black text-zinc-950 uppercase tracking-tight leading-tight group-hover:text-[#FF4E50] transition-colors">
                    {topic.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-sm font-medium text-zinc-500 leading-relaxed mb-6">
                    {topic.answer}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full h-10 rounded-xl border-[#FAD0C4] text-[#E75480] font-black uppercase text-[10px] tracking-widest hover:bg-[#FF4E50] hover:text-white transition-all"
                  >
                    Contact support
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. CONTACT BANNER */}
        <section className="bg-zinc-50 py-24 border-y border-zinc-100">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-gradient-to-br from-[#FF4E50] to-[#E75480] rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-[#FF4E50]/20 text-white relative overflow-hidden">
               {/* Background Icon Decor */}
               <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                  <MessageCircle size={240} />
               </div>
               
               <div className="relative z-10 text-center md:text-left space-y-4">
                  <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">
                    Still need help?
                  </h3>
                  <p className="text-[#FAD0C4] font-bold uppercase tracking-widest text-xs md:text-sm max-w-sm">
                    Our support team is available 24/7 to assist you with any inquiry.
                  </p>
               </div>

               <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <Button className="h-14 px-10 bg-white text-[#FF4E50] hover:bg-zinc-950 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95">
                    <MessageCircle size={16} className="mr-2" /> Live Chat
                  </Button>
                  <Button variant="outline" className="h-14 px-10 border-white text-white hover:bg-white hover:text-[#E75480] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all">
                    <Mail size={16} className="mr-2" /> Email Us
                  </Button>
               </div>
            </div>
          </div>
        </section>

        {/* 4. QUICK CHANNELS */}
        <section className="py-20 container mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-5 p-8 bg-white rounded-3xl border border-[#FAD0C4]/30 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-[#FFD700] rounded-2xl flex items-center justify-center text-black shadow-lg shadow-[#FFD700]/20"><Phone size={20}/></div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Toll Free Care</p>
                    <p className="text-lg font-black italic text-zinc-900 tracking-tight">1800-123-4567</p>
                  </div>
              </div>
              <div className="flex items-center gap-5 p-8 bg-white rounded-3xl border border-[#FAD0C4]/30 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-[#FF4E50] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#FF4E50]/20"><Mail size={20}/></div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Official Registry</p>
                    <p className="text-lg font-black italic text-zinc-900 tracking-tight">support@expertzdigishop.com</p>
                  </div>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}