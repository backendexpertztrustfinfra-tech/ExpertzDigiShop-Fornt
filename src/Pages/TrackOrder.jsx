import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Package, Truck, CheckCircle, Clock, AlertCircle, 
  MapPin, Phone, ArrowLeft, Search, Zap, 
  Box, CornerDownRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

// FIXED: Connect to live Render URLs instead of localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";

const getStatusColor = (status) => {
  const colors = {
    pending: "bg-[#FFF9F0] text-[#FFB800] border-[#FFD700]/30", // Golden Yellow
    accepted: "bg-[#FFF5F7] text-[#E75480] border-[#FAD0C4]", // Rose Pink
    preparing: "bg-[#FFF5F7] text-[#FF4E50] border-[#FAD0C4]", // Sunset Orange
    ready: "bg-purple-100 text-purple-700 border-purple-200",
    shipped: "bg-orange-100 text-orange-700 border-orange-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  }
  return colors[status] || "bg-zinc-100 text-zinc-600 border-zinc-200"
}

export default function TrackOrder() {
  const navigate = useNavigate()
  const [trackingNumber, setTrackingNumber] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const trackingParam = params.get("tracking")
    if (trackingParam) handleSearch(trackingParam)
  }, [])

  const handleSearch = async (trackNum = searchInput) => {
    if (!trackNum.trim()) {
      setError("Please enter a tracking number")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/orders/track/${trackNum.trim()}`)
      const data = await response.json()
      if (data.success) {
        setTrackingData(data.tracking)
        setTrackingNumber(trackNum)
      } else {
        setError(data.message || "Tracking number not found.")
      }
    } catch (err) {
      setError("Failed to fetch tracking information.")
    } finally {
      setLoading(false)
    }
  }

  const statusTimeline = [
    { status: "pending", label: "Order Received" },
    { status: "accepted", label: "Confirmed" },
    { status: "preparing", label: "Preparing" },
    { status: "ready", label: "Ready to Ship" },
    { status: "shipped", label: "In Transit" },
    { status: "delivered", label: "Delivered" },
  ]

  // --- 1. Search Entry Page ---
  if (!trackingData) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center px-6 selection:bg-[#FF4E50] selection:text-white">
        <div className="w-full max-w-lg space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-[#333]">Track <span className="text-[#FF4E50]">Order</span></h1>
            <p className="text-[10px] font-black text-[#E75480] uppercase tracking-[0.3em] leading-relaxed opacity-70">Monitor your package movement</p>
          </div>
          
          <Card className="border-[#FAD0C4]/30 shadow-2xl rounded-[2.5rem] p-8 bg-white overflow-hidden">
            <CardContent className="p-0 space-y-6">
              <div className="flex flex-col gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E75480]/40 group-focus-within:text-[#FF4E50] transition-colors" size={18}/>
                  <Input
                    placeholder="Enter Tracking ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="h-14 pl-12 rounded-2xl bg-[#FFF5F7]/30 border-[#FAD0C4]/50 focus-visible:ring-[#FF4E50] font-bold text-zinc-800 placeholder:text-zinc-300"
                  />
                </div>
                <Button 
                  onClick={() => handleSearch()} 
                  disabled={loading}
                  className="h-14 w-full bg-[#FF4E50] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-[#FF4E50]/20 hover:bg-[#E75480] transition-all transform active:scale-95"
                >
                  {loading ? "Searching..." : "Track Now"}
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 justify-center animate-pulse">
                  <AlertCircle size={14}/> {error}
                </div>
              )}
            </CardContent>
          </Card>
          
          <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase text-[#E75480] hover:text-[#FF4E50] tracking-widest transition-colors">
            Return to Store
          </button>
        </div>
      </div>
    )
  }

  // --- 2. Active Results Page ---
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20 selection:bg-[#FF4E50] selection:text-white">
      {/* Sticky Nav */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#FAD0C4]/30">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <button onClick={() => setTrackingData(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-[#E75480] hover:text-[#FF4E50] tracking-widest transition-colors">
            <ArrowLeft size={16}/> Back
          </button>
          <div className="text-center">
            <h1 className="text-xs font-black uppercase italic tracking-tighter text-[#333]">Tracking <span className="text-[#FF4E50]">Info</span></h1>
            <p className="text-[9px] font-mono text-zinc-400 font-bold">{trackingNumber}</p>
          </div>
          <Badge className="bg-[#FF4E50] text-white uppercase text-[8px] font-black h-6 px-3 border-none rounded-full shadow-lg shadow-[#FF4E50]/20 tracking-widest">Active</Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Delivery Location Summary */}
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
               <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-white to-[#FFF5F7]">
                  <div className="flex gap-4">
                     <div className="h-12 w-12 bg-[#FFF9F0] rounded-2xl flex items-center justify-center text-[#FFD700] shadow-inner">
                        <MapPin size={22} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Destination</p>
                        <p className="text-sm font-black uppercase tracking-tight italic text-[#333]">
                            {trackingData.shippingAddress?.city}, {trackingData.shippingAddress?.state}
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-4 sm:border-l-2 sm:pl-8 border-[#FAD0C4]/30">
                     <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">ETA</p>
                        <p className="text-sm font-black uppercase tracking-tight text-[#FF4E50] italic">
                            {new Date(trackingData.estimatedDelivery).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                     </div>
                  </div>
               </div>
            </Card>

            {/* ITEM STATUS CARDS */}
            <div className="space-y-6">
              {trackingData.items?.map((item, idx) => (
                <Card key={idx} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden transition-all hover:shadow-2xl">
                  <CardHeader className="bg-[#FFF5F7]/30 border-b border-[#FAD0C4]/10 p-6 flex flex-row items-center justify-between">
                     <h4 className="text-xs font-black uppercase tracking-tight italic truncate max-w-[70%] text-[#333]">{item.product?.name}</h4>
                     <Badge className={`text-[9px] font-black uppercase rounded-full px-4 h-6 border shadow-sm ${getStatusColor(item.status)}`}>
                       {item.status}
                     </Badge>
                  </CardHeader>
                  <CardContent className="p-8">
                    {/* Vertical Timeline */}
                    <div className="relative space-y-10 pl-6">
                      <div className="absolute left-[31px] top-2 bottom-2 w-[2px] bg-zinc-100 rounded-full" />
                      
                      {statusTimeline.map((step, sIdx) => {
                        const isCompleted = statusTimeline.slice(0, sIdx + 1).some((s) => s.status === item.status)
                        const isActive = step.status === item.status

                        return (
                          <div key={step.status} className={`flex gap-8 items-start transition-all duration-500 ${isCompleted || isActive ? 'opacity-100' : 'opacity-20'}`}>
                            <div className={`relative z-10 h-6 w-6 rounded-full border-4 border-white shadow-lg transition-all transform ${isCompleted || isActive ? 'bg-[#FF4E50] scale-125' : 'bg-zinc-200'}`}>
                               {isActive && <div className="absolute inset-0 bg-[#FFD700] rounded-full animate-ping opacity-75" />}
                            </div>
                            <div className="flex-1">
                               <p className={`text-[12px] font-black uppercase tracking-widest ${isActive ? 'text-[#FF4E50] italic' : 'text-zinc-800'}`}>{step.label}</p>
                               {isActive && <p className="text-[9px] text-[#E75480] font-black uppercase mt-1 tracking-wider">Active Status</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 overflow-hidden relative">
               <div className="absolute top-0 right-0 h-20 w-20 bg-[#FFD700]/5 rounded-full -mr-10 -mt-10" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E75480] mb-8 italic opacity-60">Logistics Node</h3>
               <div className="space-y-6">
                  <div className="flex gap-5 group">
                     <div className="h-11 w-11 bg-[#FFF5F7] rounded-2xl flex items-center justify-center text-[#E75480] flex-shrink-0 shadow-sm transition-transform group-hover:rotate-12">
                        <Phone size={18}/>
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Support</p>
                        <p className="text-xs font-black tracking-widest text-[#333]">{trackingData.shippingAddress?.phone}</p>
                     </div>
                  </div>
                  <div className="flex gap-5 group">
                     <div className="h-11 w-11 bg-[#FFF9F0] rounded-2xl flex items-center justify-center text-[#FFD700] flex-shrink-0 shadow-sm transition-transform group-hover:-rotate-12">
                        <Package size={18}/>
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Archive Count</p>
                        <p className="text-xs font-black tracking-widest text-[#333]">{trackingData.items?.length} Units Secured</p>
                     </div>
                  </div>
               </div>
               <Separator className="my-10 bg-[#FAD0C4]/20" />
               <div className="p-5 bg-[#FFF9F0]/50 rounded-[1.5rem] border border-[#FFD700]/10">
                  <p className="text-[9px] font-black text-[#E75480]/80 uppercase tracking-widest leading-relaxed">
                     Please check the archive seal before signing the handover document. Support is available via ID verification.
                  </p>
               </div>
            </Card>

            <Button 
              variant="outline" 
              className="w-full h-16 rounded-2xl border-[#FAD0C4] text-[#E75480] font-black uppercase text-[10px] tracking-widest hover:bg-[#FFF5F7] hover:text-[#FF4E50] transition-all shadow-sm" 
              onClick={() => navigate("/profile/orders")}
            >
                Return to My Orders
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}