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
  Loader2
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ContactPage() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userToken } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    category: "",
    message: ""
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.email || !formData.category || !formData.message) {
      return toast.error("Please fill all required fields (*)");
    }

    try {
      setLoading(true);

      // Professional Data Payload: Ab ye segmented format mein jayega
      const payload = {
        subject: `Contact Request: ${formData.category} from ${formData.firstName}`,
        category: formData.category,
        description: formData.message,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: formData.phone || "N/A"
      };

      const res = await axios.post(`${API_BASE}/support`, payload, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (res.data.success) {
        toast.success("Message Transmitted! Ticket Created Successfully.");
        setFormData({ firstName: "", lastName: "", email: "", phone: "", category: "", message: "" });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Transmission failed. Check connection.";
      toast.error(errorMsg);
      console.error("Submit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-zinc-950 font-sans selection:bg-[#FF4E50] selection:text-white text-left">
      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-20 bg-zinc-950 text-white overflow-hidden text-center border-b border-white/5">
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
              Synchronize with our support team for rapid inquiry resolution.
            </p>
          </motion.div>
        </section>

        {/* CONTACT GRID */}
        <section className="container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Info */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-xl ring-1 ring-[#FAD0C4]/30 rounded-[2.5rem] bg-white overflow-hidden text-left">
                <CardHeader className="p-8 pb-4 border-b border-[#FAD0C4]/10 bg-[#FFF5F7]/50">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-[#E75480]">Registry Details</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  {[
                    { icon: <MapPin className="text-[#FF4E50]" size={20} />, title: "Our HQ", content: "27 Neelam Bata Road, Sector 15, Faridabad, Haryana" },
                    { icon: <Phone className="text-[#FFB800]" size={20} />, title: "Phone Node", content: "Care: 1800-123-4567" },
                    { icon: <Mail className="text-[#E75480]" size={20} />, title: "Digital Mail", content: "support@expertzdigishop.com" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="h-10 w-10 bg-[#FFF5F7] rounded-xl flex items-center justify-center border border-[#FAD0C4]/20 group-hover:bg-[#FF4E50] group-hover:text-white transition-all shadow-sm">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{item.title}</h4>
                        <p className="text-sm font-bold text-zinc-900 leading-relaxed">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="p-8 bg-gradient-to-br from-[#FF4E50] to-[#E75480] rounded-[2.5rem] text-white space-y-6 shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Instant Assistance</p>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Live Support Node</h3>
                <Button className="w-full h-12 bg-white text-zinc-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-950 transition-all">
                   <MessageCircle size={16} className="mr-2" /> Start Live Chat
                </Button>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-8">
              <Card className="border-none shadow-2xl ring-1 ring-[#FAD0C4]/20 rounded-[3rem] bg-white">
                <CardHeader className="p-10 md:p-16 pb-6 text-left">
                  <CardTitle className="text-3xl md:text-4xl font-black text-zinc-950 uppercase italic tracking-tighter">
                    Send a <span className="text-[#FF4E50]">Message</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 md:p-16 pt-0">
                  <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">First Name *</Label>
                        <Input 
                          placeholder="John" 
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50 font-bold" 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Name</Label>
                        <Input 
                          placeholder="Doe" 
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50 font-bold" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Hub *</Label>
                        <Input 
                          type="email" 
                          placeholder="john@example.com" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50 font-bold" 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Phone Signal</Label>
                        <Input 
                          type="tel" 
                          placeholder="+91 0000000000" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50 font-bold" 
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Subject Protocol *</Label>
                      <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                        <SelectTrigger className="h-12 rounded-xl border-[#FAD0C4]/40 bg-zinc-50 font-bold">
                          <SelectValue placeholder="Inquiry Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white rounded-xl">
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="refund">Returns & Refunds</SelectItem>
                          <SelectItem value="collab">Collaborations</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Detail *</Label>
                      <Textarea 
                        placeholder="How can we assist you?" 
                        rows={5} 
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="rounded-2xl border-[#FAD0C4]/40 bg-zinc-50 font-bold resize-none" 
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-zinc-950 hover:bg-[#FF4E50] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all"
                    >
                      {loading ? <Loader2 className="animate-spin mr-2" /> : "Transmit Message"}
                      {!loading && <Send size={14} className="ml-2" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}