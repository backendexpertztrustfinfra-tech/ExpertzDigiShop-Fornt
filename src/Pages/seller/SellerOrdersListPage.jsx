"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  RefreshCw,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthContext } from "@/context/AuthContext"
import { toast } from "react-toastify"
import api from "../../lib/api"

const UPLOAD_BASE_URL = "https://expertz-digishop.onrender.com";

const statusConfig = {
  pending: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock size={14}/> },
  confirmed: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle size={14}/> },
  processing: { color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: <Package size={14}/> },
  shipped: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Truck size={14}/> },
  delivered: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle size={14}/> },
}

export default function SellerOrdersListPage() {
  const navigate = useNavigate()
  const { userToken, user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)

  const getProductImage = (image) => {
    if (!image) return "/placeholder.svg"
    let path = String(image);
    if (path.startsWith("http")) return path.replace("http://localhost:5000", UPLOAD_BASE_URL);
    return `${UPLOAD_BASE_URL}/${path.replace(/\\/g, "/").replace(/^\/+/, "")}`;
  }

  const fetchSellerOrders = async () => {
    if (!userToken) return;
    setRefreshing(true)
    try {
      // 🟢 FIX: response hi asli data hai (Fetch API logic)
      const response = await api.get("/orders/seller/orders/dashboard")
      
      console.log("Seller API Debug:", response);

      if (response && response.success) {
        setOrders(response.orders || [])
      } else {
        toast.error("Failed to sync orders from Platform")
      }
    } catch (error) {
      console.error("Merchant Sync Error:", error)
      toast.error("Cloud synchronization failed")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!userToken) return navigate("/login");
    fetchSellerOrders()
    const interval = setInterval(fetchSellerOrders, 60000)
    return () => clearInterval(interval)
  }, [userToken])

  const handleUpdateStatus = async (orderId, itemIdx, newStatus) => {
    try {
      // 🟢 FIX: API Helper call structure
      const response = await api.put(`/orders/${orderId}/seller-status`, {
        itemIndex: itemIdx,
        sellerOrderStatus: newStatus
      })
      
      if (response && response.success) {
        toast.success(`Protocol: Order set to ${newStatus.toUpperCase()}`)
        fetchSellerOrders()
      }
    } catch (error) {
      toast.error("Status synchronization rejected")
    }
  }

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.orderStatus === filter)

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <RefreshCw className="animate-spin text-blue-600 mb-4" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing Merchant Hub...</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900">
              Merchant <span className="text-blue-600 underline decoration-zinc-200">Terminal</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 italic">Authorized Node: {user?.storeName || user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchSellerOrders} disabled={refreshing} className="rounded-full border-zinc-200 bg-white shadow-xl hover:bg-zinc-50 font-black uppercase text-[10px] px-8 h-12">
              <RefreshCw className={`mr-2 h-3 w-3 ${refreshing ? "animate-spin" : ""}`} /> Sync Registry
            </Button>
            <Button variant="ghost" onClick={() => navigate("/seller/dashboard")} className="rounded-full h-12 px-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {["all", "pending", "confirmed", "shipped", "delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === s ? "bg-zinc-900 text-white shadow-2xl" : "bg-white text-zinc-400 border border-zinc-100 hover:border-zinc-300"
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        <div className="grid gap-10">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => (
            <Card key={order._id} className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="bg-zinc-950 p-8 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Manifest Signature</span>
                    <h3 className="text-white font-mono text-xl font-bold tracking-tighter">#{order.orderNumber}</h3>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <span className="block text-[9px] font-black text-zinc-500 uppercase italic">Settlement</span>
                        <span className="text-blue-500 font-black text-2xl italic tracking-tighter">₹{order.totalAmount}</span>
                     </div>
                     <Badge className={`${statusConfig[order.orderStatus]?.color || 'bg-zinc-100'} border-none rounded-xl uppercase text-[9px] font-black px-6 py-3`}>
                        {order.orderStatus}
                     </Badge>
                  </div>
                </div>

                <div className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-zinc-100 pb-10">
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Consignee Coordinates</span>
                      <div className="p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100">
                        <p className="font-black text-sm uppercase text-zinc-800 tracking-tight">{order.customer?.name}</p>
                        <p className="text-xs text-zinc-500 font-bold mt-1 uppercase truncate">{order.customer?.email}</p>
                        <p className="text-xs text-zinc-400 mt-2 font-medium">{order.customer?.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-4 md:text-right">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Registry Timestamp</span>
                      <p className="text-xs font-black uppercase text-zinc-600 bg-zinc-100 inline-block px-4 py-2 rounded-full">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Inventory Allocation</span>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-[2.5rem] bg-[#FDFDFD] border border-zinc-100 transition-all hover:bg-white hover:shadow-xl group">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden border border-zinc-100 p-3 bg-white flex-shrink-0 group-hover:scale-105 transition-transform">
                          <img src={getProductImage(item.product?.images?.[0])} className="w-full h-full object-contain" alt="" />
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left min-w-0">
                          <h4 className="font-black text-sm uppercase text-zinc-800 truncate italic">{item.product?.name}</h4>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                            <Badge variant="outline" className="text-[9px] font-black uppercase border-zinc-200 px-4 py-1">Units: {item.quantity}</Badge>
                            <Badge variant="outline" className="text-[9px] font-black uppercase border-zinc-200 px-4 py-1">Unit Price: ₹{item.price}</Badge>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {item.sellerOrderStatus === "pending" ? (
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[10px] font-black uppercase px-10 h-14 shadow-2xl shadow-blue-500/20 active:scale-95"
                              onClick={() => handleUpdateStatus(order._id, idx, "confirmed")}
                            >
                              <Check className="mr-2" size={16} /> Accept Order
                            </Button>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2 italic">Transition State</span>
                              <select 
                                className="h-14 rounded-2xl border border-zinc-200 bg-white text-[10px] font-black uppercase px-8 outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer shadow-sm min-w-[180px] appearance-none text-center"
                                value={item.sellerOrderStatus}
                                onChange={(e) => handleUpdateStatus(order._id, idx, e.target.value)}
                              >
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-zinc-200 mt-6">
              <Package className="h-12 w-12 mx-auto text-zinc-200 mb-4" />
              <h2 className="text-sm font-black uppercase text-zinc-400 tracking-widest">No active manifests</h2>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
} 