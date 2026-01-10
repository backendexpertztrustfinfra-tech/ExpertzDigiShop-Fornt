"use client";

import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Upload, Package, Info, ChevronRight, Search, Plus, 
  AlertCircle, X, Check, Calculator, Trash2, Loader2, 
  Truck, MapPin, FileText, Globe, InfoIcon
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import { Textarea } from "@/Components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProfessionalSellerForm() {
  const navigate = useNavigate();
  const { userToken } = useAuth();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Consolidated Logic from all your codes
  const [formData, setFormData] = useState({
    name: "", description: "", brand: "", category: "", subcategory: "",
    size: "", color: "", material: "", pattern: "", trend: "", genericName: "",
    price: "", originalPrice: "", discount: "0", gstRate: "18", hsnCode: "", stock: "", sku: "",
    weight: "", length: "", width: "", height: "", dimensionUnit: "cm",
    shippingTime: "5-7 Days", freeShipping: false, shippingCharge: "0",
    manufacturerName: "", manufacturerAddress: "", manufacturerPincode: "",
    packerName: "", packerAddress: "", importerName: "",
    returnDays: "30", returnPolicy: "30-day return policy available", codAvailable: true,
  });

  const [images, setImages] = useState({
    main: [], // Up to 5 images
    front: null, back: null, side: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (type === "main") {
      if (images.main.length + files.length > 5) return toast.warn("Max 5 images allowed");
      setImages(prev => ({ ...prev, main: [...prev.main, ...files] }));
    } else {
      setImages(prev => ({ ...prev, [type]: files[0] }));
    }
  };

  const calculateSettlement = () => {
    const p = Number(formData.price) || 0;
    const gst = p * (Number(formData.gstRate) / 100);
    const comm = p * 0.02; 
    return (p - gst - comm).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.stock) {
      return toast.error("Required fields (*) are missing");
    }
    setIsLoading(true);
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
    images.main.forEach((file) => payload.append("images", file));
    
    try {
      const res = await fetch(`${API_BASE_URL}/sellers/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
        body: payload,
      });
      if (res.ok) {
        toast.success("Catalog Submitted Successfully!");
        navigate("/seller/dashboard");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to add product");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-20">
      <ToastContainer position="top-right" />

      {/* TOP COMPACT NAV (Amazon Style) */}
      <nav className="bg-[#232F3E] text-white px-8 py-3 sticky top-0 z-[100] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 h-8 w-8 p-0">
            <ArrowLeft size={18} />
          </Button>
          <span className="font-bold text-sm uppercase tracking-widest border-l pl-6 border-white/20">Seller Central</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="bg-transparent border-white/30 text-white text-xs hover:bg-white/10 rounded-sm h-8 px-6">Save as Draft</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-[#FF9900] hover:bg-[#E68A00] text-black font-bold text-xs px-8 h-8 rounded-sm">
            {isLoading ? "Publishing..." : "Submit for QC"}
          </Button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: MAIN FORM (Meesho/Flipkart Style) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          <div className="bg-white p-6 rounded-sm border shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Add New Catalog</h1>
              <p className="text-xs text-slate-500 mt-1">Select category and fill technical product specifications</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-sm border border-blue-100">
               <InfoIcon size={14}/>
               <span className="text-[11px] font-bold uppercase">Listing Guidelines</span>
            </div>
          </div>

          {/* 1. Category & Basic Info */}
          <Card className="rounded-sm border shadow-sm">
            <CardHeader className="bg-slate-50/80 border-b py-3 px-6">
              <CardTitle className="text-sm font-bold uppercase text-slate-600 flex items-center gap-2">
                <Package size={16}/> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500">Product Name *</Label>
                <Input value={formData.name} onChange={e => handleInputChange("name", e.target.value)} placeholder="Enter full product name" className="rounded-sm h-10 border-slate-300" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500">Product Category *</Label>
                <Select value={formData.category} onValueChange={v => handleInputChange("category", v)}>
                  <SelectTrigger className="rounded-sm h-10 border-slate-300"><SelectValue placeholder="Select Category"/></SelectTrigger>
                  <SelectContent>{["Fashion", "Electronics", "Home"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500">Product Description *</Label>
                <Textarea value={formData.description} onChange={e => handleInputChange("description", e.target.value)} placeholder="Bullet points about fabric, material, size chart etc." className="rounded-sm border-slate-300 min-h-[100px]" />
              </div>
            </CardContent>
          </Card>

          {/* 2. Pricing & Tax (The Meesho Grid) */}
          <Card className="rounded-sm border shadow-sm">
            <CardHeader className="bg-slate-50/80 border-b py-3 px-6">
              <CardTitle className="text-sm font-bold uppercase text-slate-600 flex items-center gap-2">
                <Calculator size={16}/> Price, Inventory & Tax
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-4 gap-6">
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500">Selling Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                    <Input type="number" value={formData.price} onChange={e => handleInputChange("price", e.target.value)} className="pl-7 rounded-sm border-slate-300 font-bold" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500">MRP *</Label>
                  <Input type="number" value={formData.originalPrice} onChange={e => handleInputChange("originalPrice", e.target.value)} className="rounded-sm border-slate-300" />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500">Stock Quantity *</Label>
                  <Input type="number" value={formData.stock} onChange={e => handleInputChange("stock", e.target.value)} className="rounded-sm border-slate-300" />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500">GST %</Label>
                  <Select value={formData.gstRate} onValueChange={v => handleInputChange("gstRate", v)}>
                    <SelectTrigger className="rounded-sm border-slate-300"><SelectValue/></SelectTrigger>
                    <SelectContent>{["5", "12", "18", "28"].map(g => <SelectItem key={g} value={g}>{g}%</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500">HSN Code *</Label>
                  <Input value={formData.hsnCode} onChange={e => handleInputChange("hsnCode", e.target.value)} className="rounded-sm border-slate-300 uppercase" />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500">SKU ID</Label>
                  <Input value={formData.sku} onChange={e => handleInputChange("sku", e.target.value)} className="rounded-sm border-slate-300 uppercase" placeholder="Unique ID" />
               </div>
            </CardContent>
          </Card>

          {/* 3. Shipping & Compliance (Amazon Style) */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="rounded-sm border shadow-sm">
              <CardHeader className="bg-slate-50/80 border-b py-3 px-6">
                <CardTitle className="text-sm font-bold uppercase text-slate-600 flex items-center gap-2">
                  <Truck size={16}/> Logistics & Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500">Weight (gms) *</Label>
                    <Input type="number" value={formData.weight} onChange={e => handleInputChange("weight", e.target.value)} className="rounded-sm h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-500">Shipping Time</Label>
                    <Input value={formData.shippingTime} onChange={e => handleInputChange("shippingTime", e.target.value)} className="rounded-sm h-9" />
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-2">
                   <div className="flex items-center gap-2">
                     <Checkbox id="cod" checked={formData.codAvailable} onCheckedChange={v => handleInputChange("codAvailable", v)} />
                     <Label htmlFor="cod" className="text-xs font-bold text-slate-600">COD Available</Label>
                   </div>
                   <div className="flex items-center gap-2">
                     <Checkbox id="free" checked={formData.freeShipping} onCheckedChange={v => handleInputChange("freeShipping", v)} />
                     <Label htmlFor="free" className="text-xs font-bold text-slate-600">Free Shipping</Label>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-sm border shadow-sm">
              <CardHeader className="bg-slate-50/80 border-b py-3 px-6">
                <CardTitle className="text-sm font-bold uppercase text-slate-600 flex items-center gap-2">
                  <Globe size={16}/> Manufacturing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500">Manufacturer Name *</Label>
                  <Input value={formData.manufacturerName} onChange={e => handleInputChange("manufacturerName", e.target.value)} className="rounded-sm h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500">Country of Origin</Label>
                  <Input value={formData.countryOfOrigin} onChange={e => handleInputChange("countryOfOrigin", e.target.value)} className="rounded-sm h-9" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY UTILITIES (Flipkart/Meesho Style) */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          
          {/* Earning Breakdown Card */}
          <Card className="rounded-sm border border-blue-200 bg-[#F7FAFF] shadow-sm sticky top-20">
            <CardHeader className="py-3 px-4 border-b border-blue-100 flex flex-row items-center justify-between bg-white">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Settlement</span>
              <Calculator size={14} className="text-blue-600" />
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Price</span>
                <span>₹{formData.price || 0}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-red-500">
                <span>GST ({formData.gstRate}%)</span>
                <span>-₹{(Number(formData.price) * (Number(formData.gstRate) / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Marketplace Fee (2%)</span>
                <span>-₹{(Number(formData.price) * 0.02).toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-blue-100 flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Settlement</span>
                <span className="text-3xl font-black text-blue-700">₹{calculateSettlement()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Professional Image Upload Area */}
          <Card className="rounded-sm border shadow-sm bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-600">Product Images</span>
              <span className="text-[10px] text-slate-400">{images.main.length}/5</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {images.main.map((file, i) => (
                <div key={i} className="relative aspect-[3/4] border rounded-sm overflow-hidden bg-slate-50 group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                  <button onClick={() => setImages(p => ({...p, main: p.main.filter((_, idx) => idx !== i)}))} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">
                    <X size={10} />
                  </button>
                </div>
              ))}
              {images.main.length < 5 && (
                <div 
                  onClick={() => fileInputRef.current.click()} 
                  className="aspect-[3/4] border-2 border-dashed border-slate-200 rounded-sm bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                   <Upload size={20} className="text-slate-300" />
                   <span className="text-[8px] font-bold uppercase text-slate-400 mt-2">Add Image</span>
                </div>
              )}
              <input type="file" multiple hidden ref={fileInputRef} onChange={e => handleImageChange(e, "main")} accept="image/*" />
            </div>

            {/* Quality Note */}
            <div className="bg-amber-50 p-3 rounded-sm border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700 text-[10px] font-bold uppercase mb-1">
                <AlertCircle size={12}/> Primary Image
              </div>
              <p className="text-[10px] text-amber-800/70 leading-relaxed">
                Primary images must have a plain white background without watermarks or text.
              </p>
            </div>
          </Card>
        </aside>

      </div>
    </div>
  );
}