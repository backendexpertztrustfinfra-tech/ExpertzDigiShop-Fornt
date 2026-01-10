"use client"

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Facebook, Twitter, Instagram, Youtube, 
  ChevronDown, ArrowRight, ShieldCheck, 
  Globe, CreditCard, Sparkles, Mail 
} from "lucide-react";

/* --- Bold Sharp Divider --- */
const Divider = ({ className = "" }) => <div className={`h-[1px] w-full bg-zinc-800 ${className}`} />;

/* --- Mobile Accordion (Sharp & Bold) --- */
const FooterAccordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden border-b border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-7 text-white font-black uppercase tracking-[0.2em] text-[12px]"
      >
        {title}
        <ChevronDown className={`h-5 w-5 transition-transform duration-500 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${open ? "max-h-96 opacity-100 pb-8" : "max-h-0 opacity-0"}`}>
        <div className="pl-1 space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-100 pt-20 pb-12 selection:bg-[#FF4E50] selection:text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* --- TOP: BRAND & VIBRANT NEWSLETTER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <Link to="/">
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
                  {/* Digi in White, Shop in Sunset Orange */}
                  Digi<span className="text-[#FF4E50] font-light not-italic font-serif">shop.</span>
                </h3>
              </Link>
              <p className="text-zinc-300 text-base md:text-lg max-w-md leading-relaxed font-medium">
                Designing the future of digital retail. A curated collection of global essentials delivered to your door.
              </p>
            </div>

            {/* Social Icons with Rose Pink hover */}
            <div className="flex gap-4">
              {[Instagram, Facebook, Youtube, Twitter].map((Icon, i) => (
                <Link key={i} to="#" className="h-12 w-12 flex items-center justify-center border-2 border-zinc-800 rounded-full text-white hover:bg-[#E75480] hover:text-white hover:border-[#E75480] transition-all duration-300 shadow-lg hover:shadow-[#E75480]/20">
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter Box with Sunset Orange & Rose Pink Theme */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900 border-2 border-zinc-800 relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                <div className="space-y-3">
                  <h4 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight">Stay in the loop</h4>
                  {/* Text in Golden Yellow */}
                  <p className="text-[#FFD700] text-xs font-black uppercase tracking-[0.3em]">Updates, Drops & 15% Off</p>
                </div>

                {/* Input underline focuses to Rose Pink */}
                <div className="flex items-center border-b-2 border-zinc-700 py-4 focus-within:border-[#E75480] transition-all">
                  <Mail className="h-5 w-5 mr-4 text-zinc-500 group-focus-within:text-[#E75480]" />
                  <input 
                    type="email" 
                    placeholder="YOUR EMAIL ADDRESS" 
                    className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-zinc-600 font-black tracking-widest text-white uppercase" 
                  />
                  {/* Join Button in Sunset Orange */}
                  <button className="flex items-center gap-2 text-white font-black text-xs tracking-widest hover:text-[#FF4E50] transition-colors">
                    JOIN <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {/* Sparkles icon in Golden Yellow tint */}
              <Sparkles className="absolute -bottom-4 -right-4 h-32 w-32 text-[#FFD700]/10" />
            </div>
          </div>
        </div>

        <Divider className="mb-20" />

        {/* --- MIDDLE: NAVIGATION --- */}
        
        {/* Mobile View */}
        <div className="lg:hidden space-y-2">
          <FooterAccordion title="Quick Links">
            <div className="grid grid-cols-1 gap-5 text-sm font-bold uppercase tracking-widest text-zinc-300">
              <Link to="/about" className="hover:text-[#FF4E50] transition-colors">About Us</Link>
              <Link to="/careers" className="hover:text-[#FF4E50] transition-colors">Careers</Link>
              <Link to="/blog" className="hover:text-[#FF4E50] transition-colors">Blogs</Link>
              <Link to="/contact" className="hover:text-[#FF4E50] transition-colors">Contact</Link>
              <Link to="/press" className="hover:text-[#FF4E50] transition-colors">Press</Link>
            </div>
          </FooterAccordion>
          <FooterAccordion title="Customer Service">
            <div className="grid grid-cols-1 gap-5 text-sm font-bold uppercase tracking-widest text-zinc-300">
              <Link to="/helpcenter" className="hover:text-[#FF4E50] transition-colors">Help & FAQ</Link>
              <Link to="/returns" className="hover:text-[#FF4E50] transition-colors">Returns</Link>
              <Link to="/shippinginfo" className="hover:text-[#FF4E50] transition-colors">Shipping Info</Link>
              <Link to="/trackorder" className="hover:text-[#FF4E50] transition-colors">Track Order</Link>
              <Link to="/sizeguide" className="hover:text-[#FF4E50] transition-colors">Size Guide</Link>
            </div>
          </FooterAccordion>

          <FooterAccordion title="Legal">
            <div className="grid grid-cols-1 gap-5 text-sm font-bold uppercase tracking-widest text-zinc-300">
              <Link to="/privacy" className="hover:text-[#FF4E50] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-[#FF4E50] transition-colors">Terms of Use</Link>
            </div>
          </FooterAccordion>
        </div>

        {/* Desktop View (Sharp & Clean) with Theme Hovers */}
        <div className="hidden lg:grid grid-cols-4 gap-12 mb-24">
          <div className="space-y-10">
            <h5 className="text-white text-xs font-black uppercase tracking-[0.4em]">Company</h5>
            <ul className="space-y-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              <li><Link to="/about" className="hover:text-[#E75480] transition-all">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-[#E75480] transition-all">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-[#E75480] transition-all"> Blog</Link></li>
              <li><Link to="/press" className="hover:text-[#E75480] transition-all">Press</Link></li>
              <li><Link to="/sizeguide" className="hover:text-[#E75480] transition-all">Size Guide</Link></li>
            </ul>
          </div>
          <div className="space-y-10">
            <h5 className="text-white text-xs font-black uppercase tracking-[0.4em]">Support</h5>
            <ul className="space-y-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              <li><Link to="/contact" className="hover:text-[#FF4E50] transition-all">Contact</Link></li>
              <li><Link to="/helpcenter" className="hover:text-[#FF4E50] transition-all">Help & FAQ</Link></li>
              <li><Link to="/shippinginfo" className="hover:text-[#FF4E50] transition-all">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-[#FF4E50] transition-all">Returns</Link></li>
              <li><Link to="/trackorder" className="hover:text-[#FF4E50] transition-all">Track Order</Link></li>
            </ul>
          </div> 
          <div className="space-y-10">
            <h5 className="text-white text-xs font-black uppercase tracking-[0.4em]">Legal</h5>
            <ul className="space-y-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              <li><Link to="/privacy" className="hover:text-[#FFD700] transition-all">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#FFD700] transition-all">Terms of Use</Link></li>
            </ul>
          </div>
          <div className="space-y-12">
            <div className="space-y-6">
              <h5 className="text-white text-xs font-black uppercase tracking-[0.4em]">Location</h5>
              {/* Globe in Golden Yellow */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-black text-white uppercase tracking-widest">
                <Globe className="h-4 w-4 text-[#FFD700]" /> India | EN
              </div>
            </div>
            <div className="space-y-6">
              <h5 className="text-white text-xs font-black uppercase tracking-[0.4em]">Secure</h5>
              <div className="flex gap-6 items-center">
                <CreditCard className="h-7 w-7 text-zinc-500" />
                <ShieldCheck className="h-7 w-7 text-zinc-500" />
                <span className="text-[10px] font-black border border-zinc-700 px-2 py-1 text-zinc-500 uppercase">SSL v3</span>
              </div>
            </div>
          </div>
        </div>

        <Divider className="mb-12" />

        {/* --- BOTTOM: FINAL FOOTNOTE --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white">
                © {new Date().getFullYear()} DIGISHOP GLOBAL
              </p>
              {/* Dot in Sunset Orange */}
              <div className="hidden md:block h-1.5 w-1.5 bg-[#FF4E50] rounded-full" />
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                Curated Excellence.
              </p>
           </div>
           
           <div className="flex gap-10 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
              <span className="hover:text-[#FFD700] transition-colors">Secure Server</span>
              <span className="hover:text-[#FFD700] transition-colors">Encrypted Payment</span>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;