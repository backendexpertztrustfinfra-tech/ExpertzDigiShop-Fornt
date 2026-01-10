import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Briefcase, Search, Sparkles, ArrowRight, Zap, Globe, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const careers = [
  {
    title: "Frontend Developer",
    location: "Gurgaon, India",
    type: "Full-time",
    description: "Architect engaging user interfaces with React.js and Tailwind CSS. Focus on performance optimization and high-end aesthetics.",
  },
  {
    title: "Backend Developer",
    location: "Remote",
    type: "Full-time",
    description: "Build scalable API infrastructures and manage distributed data pipelines using Node.js and MongoDB.",
  },
  {
    title: "UI/UX Designer",
    location: "Gurgaon, India",
    type: "Full-time",
    description: "Define delightful user journeys and modern design systems. Proficiency in Figma and motion design is a prerequisite.",
  },
  {
    title: "Digital Marketing Manager",
    location: "Mumbai, India",
    type: "Full-time",
    description: "Drive growth through performance marketing and brand narratives across global digital channels.",
  },
  {
    title: "Content Strategist",
    location: "Remote",
    type: "Part-time",
    description: "Curate the brand voice across email, social, and long-form content. Master storyteller wanted.",
  },
  {
    title: "Customer Support Executive",
    location: "Bangalore, India",
    type: "Full-time",
    description: "Deliver premium post-purchase experiences. Ensure every customer interaction reflects our core values.",
  },
  {
    title: "Product Manager",
    location: "Gurgaon, India",
    type: "Full-time",
    description: "Orchestrate product roadmaps. Align engineering and design to launch world-class features.",
  },
  {
    title: "HR & Talent Partner",
    location: "Gurgaon, India",
    type: "Full-time",
    description: "Shape our organizational culture. Lead end-to-end recruitment for the most ambitious minds.",
  },
];

export default function CareersPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const jobTypes = ["All", "Full-time", "Part-time", "Freelance", "Remote"];

  const filteredJobs = careers.filter(
    (job) =>
      (filter === "All" || job.type === filter) &&
      job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-zinc-950 font-sans selection:bg-[#FF4E50] selection:text-white pb-20">
      <main className="flex-1">
        
        {/* 1. EDITORIAL HERO SECTION */}
        <header className="bg-white border-b border-[#FAD0C4]/20 pt-24 pb-20 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-[#FF4E50] rounded-full"/>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E75480]">Join the Collective</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-zinc-950 tracking-tighter uppercase italic leading-none">
                Build the <span className="text-[#FFD700] not-italic">Future</span>
              </h1>
              <p className="max-w-xl text-zinc-500 font-medium text-sm md:text-base leading-relaxed tracking-wide">
                We are looking for ambitious individuals to redefine the intersection of luxury fashion and shopping technology.
              </p>
            </div>
            <div className="hidden lg:block p-6 bg-[#FFF5F7] rounded-[2.5rem] border border-[#FAD0C4]/30 shadow-sm">
               <Users size={32} className="text-[#FF4E50] mb-2" />
               <p className="text-[10px] font-black uppercase text-[#E75480] opacity-60 tracking-widest">Active Openings</p>
               <p className="text-xl font-black text-zinc-900">{careers.length} Roles</p>
            </div>
          </div>
        </header>

        {/* 2. WHY US: BENTO STYLE */}
        <section className="py-24 container mx-auto px-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E75480]/40 text-center mb-16 italic">The Digishop Protocol</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Globe size={20}/>, title: "Flexible Work", desc: "Remote-first culture.", color: "group-hover:bg-[#FF4E50]" },
              { icon: <TrendingUp size={20}/>, title: "Growth Plan", desc: "Structured leadership paths.", color: "group-hover:bg-[#FFD700]" },
              { icon: <Zap size={20}/>, title: "Employee Perks", desc: "Premium gear & credits.", color: "group-hover:bg-[#E75480]" },
              { icon: <Sparkles size={20}/>, title: "Inclusive", desc: "Diverse global perspectives.", color: "group-hover:bg-[#FF4E50]" },
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white border border-zinc-100 rounded-[2rem] shadow-sm hover:border-[#FF4E50]/30 hover:shadow-xl transition-all duration-500 group">
                <div className={`h-10 w-10 bg-[#FFF5F7] rounded-xl flex items-center justify-center text-[#E75480] transition-all mb-6 ${item.color} group-hover:text-white`}>
                   {item.icon}
                </div>
                <h3 className="font-black text-sm uppercase tracking-widest text-zinc-950 mb-2">{item.title}</h3>
                <p className="text-xs font-bold text-zinc-400 uppercase leading-relaxed tracking-wider">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. SEARCH & FILTERS HUB */}
        <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-y border-[#FAD0C4]/20 py-6 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {jobTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 border ${
                    filter === type
                      ? "bg-[#FF4E50] text-white border-[#FF4E50] shadow-lg shadow-[#FF4E50]/20"
                      : "bg-white text-[#E75480] border-[#FAD0C4]/40 hover:border-[#FF4E50] hover:text-[#FF4E50]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E75480]/40 group-focus-within:text-[#FF4E50] transition-colors" />
              <Input
                placeholder="Search Positions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-11 rounded-xl border-[#FAD0C4]/30 bg-[#FFF5F7]/30 focus-visible:ring-[#FF4E50] font-bold text-xs"
              />
            </div>
          </div>
        </section>

        {/* 4. OPPORTUNITIES FEED */}
        <section className="container mx-auto px-6 py-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job) => (
                <motion.div
                  layout
                  key={job.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-[2.5rem] border border-[#FAD0C4]/20 p-10 flex flex-col justify-between hover:shadow-2xl hover:border-[#FF4E50]/20 transition-all duration-500 relative group overflow-hidden"
                >
                  <div className="space-y-4">
                    <Badge className="bg-[#FFF9F0] text-[#FFB800] border-none px-3 h-6 text-[8px] font-black uppercase tracking-widest">
                        {job.type}
                    </Badge>
                    <h3 className="text-2xl font-black text-[#333] uppercase tracking-tight italic leading-none group-hover:text-[#FF4E50] transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex gap-4 items-center text-[10px] font-black text-[#E75480]/60 uppercase tracking-widest">
                       <span className="flex items-center gap-1"><MapPin size={12} className="text-[#FFD700]"/> {job.location}</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-wider line-clamp-3">
                      {job.description}
                    </p>
                  </div>
                  <Button className="mt-10 h-14 bg-zinc-950 hover:bg-[#FF4E50] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all group/btn shadow-zinc-200">
                    Submit Application <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filteredJobs.length === 0 && (
            <div className="text-center py-32 border-2 border-dashed border-[#FAD0C4]/30 rounded-[3rem] bg-[#FFF5F7]/30">
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E75480]/40 italic">No Registry Match</p>
            </div>
          )}
        </section>

        {/* 5. CULTURAL GALLERY */}
        <section className="bg-zinc-50 py-24 text-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E75480]/30 mb-16 italic">Life at DigiShop</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1400px] mx-auto px-6">
            {[
              "https://images.unsplash.com/photo-1581090700227-1e37b190418e",
              "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
              "https://images.unsplash.com/photo-1590650046871-92c887180603",
              "https://images.unsplash.com/photo-1521737604893-196e7f90ef49",
            ].map((src, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className="rounded-3xl overflow-hidden aspect-square shadow-sm border border-[#FAD0C4]/20">
                <img
                  src={`${src}?auto=format&fit=crop&w=800&q=80`}
                  alt="Gallery"
                  className="w-full h-full object-cover grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-700"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* 6. FINAL CTA NODE */}
        <section className="bg-zinc-950 py-32 text-center relative overflow-hidden rounded-t-[4rem]">
          <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12">
             <Briefcase size={400} strokeWidth={0.5} className="text-[#FFD700]" />
          </div>
          <div className="relative z-10 space-y-10 max-w-4xl mx-auto px-6">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-[#FFB800] uppercase tracking-[0.5em]">Future Recruitment</p>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Not seeing your <span className="text-[#FF4E50]">Perfect Match?</span>
                </h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm max-w-xl mx-auto">
                   We are always scouting for talent. Send us your portfolio and let's discuss your next chapter.
                </p>
             </div>
             <Button className="h-16 px-12 bg-white text-zinc-950 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#FF4E50] hover:text-white shadow-2xl transition-all active:scale-95">
                Send Spontaneous CV
             </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

const TrendingUp = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);