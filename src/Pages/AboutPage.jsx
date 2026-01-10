import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Truck, Shield, Linkedin, Instagram, Star, Heart } from "lucide-react"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans selection:bg-[#FF4E50] selection:text-white">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] overflow-hidden flex items-center justify-center text-white">
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
            autoPlay
            muted
            loop
            playsInline
            src="https://videos.pexels.com/video-files/853889/853889-hd_1280_720_25fps.mp4"
          ></video>
          {/* Branded Overlay */}
          <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px]"></div>

          <div className="relative z-10 text-center px-6">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic"
            >
              Discover <span className="text-[#FF4E50]">Digishop</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg md:text-2xl max-w-3xl mx-auto font-bold uppercase tracking-widest text-[#FAD0C4] mb-8"
            >
              Fashion meets technology — creating a new way to shop, express, and experience style.
            </motion.p>
            <Badge className="bg-[#FFD700] text-zinc-950 text-sm font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-xl hover:bg-[#FF4E50] hover:text-white transition-all border-none">
              Established 2020 ✨
            </Badge>
          </div>
        </section>

        {/* About Mission Section */}
        <section className="py-24 bg-white border-b border-[#FAD0C4]/20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-5xl font-black mb-10 text-zinc-900 tracking-tighter uppercase italic">
              Our <span className="text-[#E75480]">Mission</span>
            </h2>
            <p className="max-w-4xl mx-auto text-zinc-600 text-lg font-medium leading-relaxed mb-8 uppercase tracking-wide">
              At <strong className="text-[#FF4E50] font-black">Digishop</strong>, we believe fashion is more than just clothing — it’s an identity, a voice, a
              statement. Our mission is to democratize fashion by blending smart technology, sustainable sourcing, and
              global design influences.
            </p>
            <div className="grid md:grid-cols-3 gap-10 mt-16">
              {[
                { icon: <Star className="w-10 h-10 text-[#FFD700] mx-auto mb-3" />, title: "Premium Quality", text: "Curated collections from top designers and verified brands." },
                { icon: <Heart className="w-10 h-10 text-[#E75480] mx-auto mb-3" />, title: "Sustainability", text: "Ethically sourced and environmentally conscious manufacturing." },
                { icon: <Truck className="w-10 h-10 text-[#FF4E50] mx-auto mb-3" />, title: "Seamless Experience", text: "From browse to doorstep — shopping made effortless." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 rounded-3xl bg-[#FFF5F7] shadow-sm border border-[#FAD0C4]/30 hover:border-[#FF4E50]/50 transition-all">
                    <CardContent className="pt-0">
                      {item.icon}
                      <h3 className="text-xl font-black mb-2 text-zinc-900 uppercase tracking-tight">{item.title}</h3>
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest leading-relaxed">{item.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Animated Stats */}
        <section className="py-24 bg-zinc-950 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-black mb-14 text-[#FF4E50] uppercase tracking-tighter italic">Impact Registry</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {[
                { value: "5M+", label: "Happy Customers", color: "text-[#FFD700]" },
                { value: "50K+", label: "Products", color: "text-[#FF4E50]" },
                { value: "1000+", label: "Brands", color: "text-[#E75480]" },
                { value: "500+", label: "Cities Served", color: "text-[#FFD700]" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
                >
                  <div className={`text-5xl font-black ${stat.color} mb-2 tracking-tighter`}>{stat.value}</div>
                  <div className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-5xl font-black text-center mb-16 text-zinc-900 tracking-tighter uppercase italic">
              Why <span className="text-[#FF4E50]">Customers</span> Love Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                {
                  icon: <Users className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />,
                  title: "Customer First",
                  text: "We prioritize satisfaction — always listening, adapting, and delivering.",
                },
                {
                  icon: <Award className="h-12 w-12 text-[#E75480] mx-auto mb-4" />,
                  title: "Quality Assured",
                  text: "Every product meets our high standard of authenticity and durability.",
                },
                {
                  icon: <Truck className="h-12 w-12 text-[#FF4E50] mx-auto mb-4" />,
                  title: "Next-Day Delivery",
                  text: "Quick dispatch with real-time tracking — because waiting is overrated.",
                },
                {
                  icon: <Shield className="h-12 w-12 text-[#FFD700] mx-auto mb-4" />,
                  title: "Secure Payments",
                  text: "Protected transactions with 256-bit encryption and trusted gateways.",
                },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -8 }}>
                  <Card className="text-center p-8 rounded-3xl shadow-sm bg-[#FFF9F0]/50 border border-[#FFD700]/20 hover:border-[#FF4E50]/40 transition-all">
                    <CardContent className="pt-0">
                      {item.icon}
                      <h3 className="text-xl font-black mb-3 text-zinc-900 uppercase tracking-tight">{item.title}</h3>
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{item.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-[#FFF5F7] text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-5xl font-black mb-16 text-zinc-900 tracking-tighter uppercase italic">Voices of <span className="text-[#E75480]">Digishop</span></h2>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  name: "Neha Verma",
                  feedback: "Digishop has completely changed how I shop. The quality, delivery, and support are unmatched!",
                },
                {
                  name: "Amit Tandon",
                  feedback: "I love how easy it is to find stylish and affordable outfits. Feels premium every time!",
                },
                {
                  name: "Simran Kaur",
                  feedback: "From makeup to ethnic wear — everything I ordered has been perfect. Totally recommend!",
                },
              ].map((testi, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-[#FAD0C4]/30"
                >
                  <p className="text-zinc-600 italic font-medium mb-6">“{testi.feedback}”</p>
                  <h4 className="text-sm font-black text-[#FF4E50] uppercase tracking-widest">{testi.name}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-5xl font-black text-center mb-16 text-zinc-900 tracking-tighter uppercase italic">Our <span className="text-[#FFD700]">Leadership</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {[
                { name: "Rahul Kumar", role: "Founder & CEO", initials: "RK" },
                { name: "Priya Sharma", role: "Head of Fashion", initials: "PS" },
                { name: "Amit Mehta", role: "CTO", initials: "AM" },
              ].map((member, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="group text-center"
                >
                  <Card className="rounded-3xl shadow-sm overflow-hidden bg-zinc-50 border border-zinc-100 hover:border-[#FFD700]/50 transition-all">
                    <CardContent className="pt-10 pb-10 relative">
                      <div className="w-28 h-28 bg-zinc-950 rounded-full mx-auto mb-6 flex items-center justify-center text-[#FFD700] text-3xl font-black shadow-lg italic border-2 border-[#FFD700]/20">
                        {member.initials}
                      </div>
                      <h3 className="text-xl font-black text-zinc-900 mb-1 uppercase tracking-tight">{member.name}</h3>
                      <p className="text-[#FF4E50] font-black text-[10px] uppercase tracking-widest mb-3">{member.role}</p>
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4 leading-relaxed px-4">
                        Innovating fashion through technology and creativity.
                      </p>
                      <div className="flex justify-center space-x-4 opacity-100 transition-all duration-500">
                        <Linkedin className="h-5 w-5 text-zinc-400 hover:text-[#FF4E50] cursor-pointer transition-colors" />
                        <Instagram className="h-5 w-5 text-zinc-400 hover:text-[#E75480] cursor-pointer transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}