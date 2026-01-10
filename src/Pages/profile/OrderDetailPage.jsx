import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Truck,
  MapPin,
  CreditCard,
  Clock,
  Download,
  MessageCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  Package,
  Star,
  XCircle,
  Box,
  CornerDownRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"
import ContactSupportModal from "@/components/order/ContactSupportModal"
import RateReviewModal from "@/components/order/RateReviewModal"
import ReturnExchangeModal from "@/components/order/ReturnExchangeModal"
import ReturnStatusCard from "@/components/order/ReturnStatusCard"

// FIXED: Using Render URLs instead of localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"
const IMAGE_BASE = "https://expertz-digishop.onrender.com"

const getImageUrl = (img) => {
  if (!img) return "/placeholder.svg"
  
  let imagePath = String(img);
  
  // 1. Agar path mein localhost hai, toh use live URL se badlein
  if (imagePath.includes("localhost:5000")) {
      const splitPart = imagePath.split("/uploads/")[1];
      return `${IMAGE_BASE}/uploads/${splitPart.replace(/\\/g, "/")}`;
  }

  // 2. Agar path pehle se hi HTTP hai, toh wahi return karein
  if (imagePath.startsWith("http")) return imagePath;

  // 3. Normal relative path ko clean karke base URL lagayein
  const cleanPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${IMAGE_BASE}/${cleanPath}`;
}

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price)

const getStatusColor = (s) => {
    const statusLower = s?.toLowerCase()
    const c = {
      pending: "bg-[#FFD700] text-black", // Golden Yellow
      confirmed: "bg-[#FF4E50] text-white", // Sunset Orange
      processing: "bg-[#E75480] text-white", // Rose Pink
      shipped: "bg-cyan-600 text-white",
      delivered: "bg-green-600 text-white",
      cancelled: "bg-zinc-900 text-white",
      returned: "bg-orange-600 text-white",
    }
    return c[statusLower] || "bg-gray-500 text-white"
}

const handleDownloadInvoice = async (order, userToken) => {
  if (!order) {
    toast.error("Order data not available")
    return
  }
  try {
    if (!userToken) throw new Error("No authentication token found")
    let invoiceId
    
    const invoicesResponse = await fetch(`${API_BASE_URL}/invoices/order/${order._id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })
    const invoiceData = await invoicesResponse.json()
    
    if (invoiceData.invoices && invoiceData.invoices.length > 0) {
      invoiceId = invoiceData.invoices[0]._id
    } else {
      toast.info("Generating invoice...")
      const generateResponse = await fetch(`${API_BASE_URL}/invoices/generate/${order._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}`, "Content-Type": "application/json" },
      })
      const newInvoice = await generateResponse.json()
      if (!generateResponse.ok) throw new Error(newInvoice.message || "Failed to generate invoice")
      invoiceId = newInvoice.invoice._id
    }

    const downloadResponse = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/download`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })
    if (!downloadResponse.ok) throw new Error("Failed to download invoice")
    const blob = await downloadResponse.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Invoice-${order.orderNumber || order._id}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Invoice downloaded successfully")
  } catch (err) {
    toast.error(err.message || "Error downloading invoice")
  }
}

const DeliveryNotificationBanner = ({ order }) => {
  if (order.orderStatus !== "delivered") return null
  return (
    <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-green-50 to-white border-l-4 border-green-600 rounded-xl shadow-md">
      <div className="flex items-start gap-4">
        <CheckCircle2 className="h-6 w-6 text-green-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-green-900 mb-1 text-lg">Delivered!</h3>
          <p className="text-sm text-green-800 mb-2">
            Your order was successfully delivered on **{new Date(order.deliveredAt || order.updatedAt).toLocaleDateString("en-IN")}**.
          </p>
          <p className="text-xs text-green-700">Please check the items and use the actions panel for reviews or returns.</p>
        </div>
      </div>
    </div>
  )
}

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"]

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userToken } = useAuth()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [returnRequest, setReturnRequest] = useState(null)
  const [loadingReturn, setLoadingReturn] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)

  const fetchReturnRequest = async () => {
    if (!order?._id) return
    try {
      setLoadingReturn(true)
      const response = await fetch(`${API_BASE_URL}/returns/order/${order._id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setReturnRequest(data.return || null)
      }
    } finally {
      setLoadingReturn(false)
    }
  }

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/orders/${id}/detail`, {
        headers: { Authorization: `Bearer ${userToken}`, "Content-Type": "application/json" },
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to fetch order")
      }
      const data = await response.json()
      setOrder(data.order || data)
    } catch (error) {
      setError(error.message)
      toast.error(error.message)
      setTimeout(() => navigate("/profile/orders"), 3000) 
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    if (!userToken) {
      navigate("/login")
      return
    }
    fetchOrderDetails()
  }, [id, userToken, navigate])

  useEffect(() => {
    if (order?._id) fetchReturnRequest()
  }, [order?._id])

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be reversed.")) return
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
      })
      if (response.ok) {
        toast.success("Order cancelled successfully")
        fetchOrderDetails()
      } else {
        const err = await response.json()
        toast.error(err.message)
      }
    } catch {
      toast.error("Error cancelling order")
    }
  }

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#FFF5F7] py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#FF4E50] mx-auto mb-4"></div>
          <p className="text-[#E75480] font-medium uppercase tracking-widest text-xs">Accessing Order Vault...</p>
        </div>
      </div>
    )

  if (error || !order)
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-lg border-[#FAD0C4]">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-[#FF4E50] mx-auto mb-4 opacity-70" />
              <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">Unable to Load Order</h3>
              <p className="text-gray-600 mb-4">{error || "The order could not be retrieved."}</p>
              <Button onClick={() => navigate("/profile/orders")} className="bg-[#FF4E50] hover:bg-[#E75480] transition-colors rounded-full">
                Back to Orders List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )

  const currentStepIndex = statusSteps.indexOf(order.orderStatus)
  const isCancellable = ["pending", "confirmed", "processing"].includes(order.orderStatus)
  const isDelivered = order.orderStatus === "delivered"

  const renderActionButtons = () => (
    <div className="space-y-3 pt-3">
        {isDelivered && (
            <Button
                className="w-full bg-[#E75480] hover:bg-[#FF4E50] font-bold rounded-full transition-all"
                onClick={() => handleDownloadInvoice(order, userToken)}
            >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
            </Button>
        )}

        <Button variant="outline" className="w-full font-bold rounded-full border-[#FF4E50] text-[#FF4E50] hover:bg-[#FFF5F7]" onClick={() => setShowSupportModal(true)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Need Help? Contact Support
        </Button>

        {isDelivered && (
            <Button variant="outline" className="w-full font-bold border-[#FFD700] text-[#E75480] hover:bg-[#FFF9F0] rounded-full" onClick={() => setShowReviewModal(true)}>
                <Star className="h-4 w-4 mr-2 fill-[#FFD700] text-[#FFD700]" />
                Write a Review
            </Button>
        )}

        {isCancellable && (
            <Button variant="destructive" className="w-full font-bold rounded-full" onClick={handleCancelOrder}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
            </Button>
        )}

        {isDelivered && !returnRequest && (
            <Button variant="outline" className="w-full font-bold border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full" onClick={() => setShowReturnModal(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Initiate Return / Exchange
            </Button>
        )}
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-8 selection:bg-[#FF4E50] selection:text-white">
      
      {/* Header and Back Button (Sticky Top) */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#FAD0C4] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/profile/orders")} className="p-2 hover:bg-[#FFF5F7] text-[#E75480] rounded-full">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-lg sm:text-xl font-black text-[#333] uppercase tracking-tighter italic">Order Detail</h1>
                <p className="text-[#E75480] font-mono text-xs sm:text-sm font-bold">ID: {order.orderNumber}</p>
            </div>
            <Badge className={`uppercase font-bold text-xs sm:text-sm ml-auto px-4 py-1.5 border shadow-sm rounded-full ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
            </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            <DeliveryNotificationBanner order={order} />
            
            {returnRequest && !loadingReturn && (
              <ReturnStatusCard returnRequest={returnRequest} onRefresh={fetchReturnRequest} />
            )}

            {/* Order Items */}
            <Card className="shadow-xl border-[#FAD0C4]/30 overflow-hidden rounded-2xl">
              <CardHeader className="p-4 sm:p-6 pb-4 border-b border-[#FAD0C4]/20 bg-[#FFF5F7]/30">
                <CardTitle className="text-lg flex items-center gap-2 font-black text-[#333] uppercase tracking-widest">
                  <Box className="h-5 w-5 text-[#FF4E50]" />
                  Order Items ({order.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-6">
                  {order.items?.map((item, index) => (
                    <div key={item._id || index} className="border-b border-[#FAD0C4]/20 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-4">
                        <img
                          src={getImageUrl(item.product?.images?.[0])}
                          alt={item.product?.name}
                          className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-contain border border-[#FAD0C4] p-1 bg-white flex-shrink-0 shadow-sm"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg"
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate hover:text-[#E75480] transition-colors">{item.product?.name}</h4>
                          <p className="text-xs sm:text-sm text-[#E75480] mt-1 font-bold italic uppercase tracking-tighter">
                            Sold By: {item.seller?.storeName || item.seller?.name || 'Seller'}
                          </p>
                          <Badge className={`mt-2 uppercase text-[10px] font-black border shadow-sm rounded-full ${getStatusColor(item.sellerOrderStatus || order.orderStatus)}`}>
                            {item.sellerOrderStatus || order.orderStatus}
                          </Badge>
                        </div>
                        <div className="text-right whitespace-nowrap flex-shrink-0">
                          <div className="font-black text-base sm:text-xl text-[#FF4E50] italic tracking-tighter">
                            {formatPrice(item.subtotal || item.price * item.quantity)}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Delivery Status Timeline */}
            <Card className="shadow-xl border-[#FAD0C4]/30 rounded-2xl">
              <CardHeader className="p-4 sm:p-6 pb-4 border-b border-[#FAD0C4]/20 bg-[#FFF5F7]/30">
                <CardTitle className="text-lg flex items-center gap-2 font-black text-[#333] uppercase tracking-widest">
                  <Truck className="h-5 w-5 text-[#FF4E50]" />
                  Delivery Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between relative mb-8">
                  {statusSteps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center flex-1 z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all duration-500 ${
                          index <= currentStepIndex ? "bg-[#FF4E50] scale-110" : "bg-gray-200"
                        }`}
                      >
                        {index <= currentStepIndex ? <CheckCircle2 className="h-6 w-6" /> : index + 1}
                      </div>
                      <p className={`text-[10px] sm:text-xs text-center uppercase tracking-tighter mt-3 ${index <= currentStepIndex ? "text-[#FF4E50] font-black italic" : "text-gray-400 font-bold"}`}>{step}</p>
                    </div>
                  ))}
                  <div className="absolute top-5 left-[calc(100%/10)] right-[calc(100%/10)] h-1 bg-gray-100 z-0 rounded-full">
                    <div 
                      className="h-full bg-[#FFD700] transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]" 
                      style={{width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`}}
                    ></div>
                  </div>
                </div>

                <Separator className="my-6 bg-[#FAD0C4]/20" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="border-r border-[#FAD0C4]/20 pr-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Date</div>
                    <div className="font-bold text-zinc-800">{new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="border-r border-[#FAD0C4]/20 pr-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Est. Delivery</div>
                      <div className="font-black text-[#FF4E50] italic">
                        {new Date(order.estimatedDelivery).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tracking ID</div>
                      <div className="font-mono font-bold text-xs sm:text-sm break-all text-[#E75480]">{order.trackingNumber}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="shadow-xl border-[#FAD0C4]/30 rounded-2xl overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-4 border-b border-[#FAD0C4]/20 bg-[#FFF5F7]/30">
                <CardTitle className="text-lg flex items-center gap-2 font-black text-[#333] uppercase tracking-widest">
                  <MapPin className="h-5 w-5 text-[#FF4E50]" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="bg-[#FFF5F7] p-5 rounded-2xl border border-[#FAD0C4]/50 shadow-inner">
                  <div className="space-y-2 text-gray-800">
                    <div className="font-black text-lg uppercase tracking-tighter text-[#333]">
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </div>
                    <div className="text-sm space-y-1 font-medium">
                      <div className="flex items-center gap-2">
                        <CornerDownRight className="h-4 w-4 text-[#E75480]" />
                        <span className="text-zinc-600">
                            {order.shippingAddress?.street}, {order.shippingAddress?.landmark && order.shippingAddress.landmark + ', '}
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} - <span className="font-black">{order.shippingAddress?.zipCode}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <div className="bg-white p-1.5 rounded-lg border border-[#FAD0C4]">
                          <Phone className="h-4 w-4 text-[#FF4E50]" />
                        </div>
                        <span className="font-black tracking-widest text-zinc-800">{order.shippingAddress?.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl lg:hidden border-[#FAD0C4]/30 rounded-2xl">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg font-black text-[#333] uppercase tracking-widest">
                    Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                {renderActionButtons()}
              </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <div className="sticky top-24 space-y-6 sm:space-y-8">
                {/* Price Summary */}
                <Card className="shadow-xl border-[#FAD0C4]/30 rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 pb-4 border-b border-[#FAD0C4]/20 bg-[#FFF5F7]/30">
                        <CardTitle className="text-lg flex items-center gap-2 font-black text-[#333] uppercase tracking-widest">
                            <FileText className="h-5 w-5 text-[#FF4E50]" />
                            Price Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 bg-white">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            <span>Subtotal</span>
                            <span className="text-zinc-800">{formatPrice(order.subtotal || 0)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#FF4E50]">
                                <span>Savings</span>
                                <span>-{formatPrice(order.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            <span>Shipping</span>
                            <span className="text-green-600">
                                {order.shippingCost === 0 ? "FREE" : formatPrice(order.shippingCost)}
                            </span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400 pb-2">
                            <span>Tax</span>
                            <span className="text-zinc-800">{formatPrice(order.taxAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between font-black text-xl bg-[#FFF9F0] p-4 rounded-xl border border-[#FFD700]/30 shadow-inner">
                            <span className="uppercase tracking-tighter italic">Total</span>
                            <span className="text-[#FF4E50] italic tracking-tighter">{formatPrice(order.totalAmount)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment & Actions (Desktop) */}
                <Card className="shadow-xl border-[#FAD0C4]/30 rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 pb-4 border-b border-[#FAD0C4]/20 bg-[#FFF5F7]/30">
                        <CardTitle className="text-lg flex items-center gap-2 font-black text-[#333] uppercase tracking-widest">
                            <CreditCard className="h-5 w-5 text-[#FF4E50]" />
                            Payment info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</span>
                            <Badge
                                className={`uppercase font-black text-[10px] tracking-widest rounded-full px-3 ${getStatusColor(order.paymentStatus)}`}
                            >
                                {order.paymentStatus?.replace("_", " ").toUpperCase()}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Method</span>
                            <span className="font-bold text-xs uppercase text-zinc-800">
                                {order.paymentMethod?.replace("_", " ")}
                            </span>
                        </div>
                        {order.paymentId && (
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transaction ID</span>
                                <div className="font-mono text-[10px] mt-1.5 p-2.5 bg-[#FFF5F7] rounded-xl border border-[#FAD0C4]/50 break-all text-[#E75480] font-bold">
                                    {order.paymentId}
                                </div>
                            </div>
                        )}
                        <div className="hidden lg:block pt-2">
                            {renderActionButtons()}
                        </div>
                    </CardContent>
                </Card>
                
                {/* Timeline (Desktop) */}
                {order.timeline?.length > 0 && (
                    <Card className="shadow-xl border-[#FAD0C4]/30 rounded-2xl">
                        <CardHeader className="p-4 pb-4 border-b border-[#FAD0C4]/20 bg-[#FFF5F7]/30">
                            <CardTitle className="text-lg flex items-center gap-2 font-black text-[#333] uppercase tracking-widest">
                                <Clock className="h-5 w-5 text-[#FF4E50]" />
                                History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-4 text-sm max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {order.timeline.map((event, idx) => (
                                    <div key={idx} className="flex gap-4 relative border-l-2 border-[#FAD0C4]/30 pl-4 ml-2 pb-2 last:pb-0">
                                        <div
                                            className={`w-3 h-3 rounded-full absolute -left-[7.5px] top-0 shadow-sm transition-colors ${
                                                event.completed ? "bg-[#FF4E50]" : "bg-gray-200"
                                            }`}
                                        ></div>
                                        <div>
                                            <p className={`text-xs font-black uppercase tracking-tighter ${event.completed ? 'text-zinc-800' : 'text-zinc-400'}`}>{event.label}</p>
                                            <p className="text-[10px] font-bold text-[#E75480] mt-0.5">
                                                {new Date(event.timestamp).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Fixed Action Bar (Sticky Footer) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#FAD0C4] shadow-[0_-10px_30px_rgba(0,0,0,0.1)] p-4 z-20 lg:hidden rounded-t-[2rem]">
          <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Final Amount</span>
              <span className="text-2xl font-black text-[#FF4E50] italic tracking-tighter">{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 font-black uppercase tracking-widest text-[10px] border-[#FF4E50] text-[#FF4E50] hover:bg-[#FFF5F7] h-12 rounded-xl" 
                onClick={() => setShowSupportModal(true)}
              >
                  Support
              </Button>
              {isCancellable && (
                  <Button 
                    variant="destructive" 
                    className="flex-1 font-black uppercase tracking-widest text-[10px] h-12 rounded-xl" 
                    onClick={handleCancelOrder}
                  >
                      Cancel
                  </Button>
              )}
              {isDelivered && (
                  <Button
                      className="flex-1 font-black uppercase tracking-widest text-[10px] bg-[#E75480] hover:bg-[#FF4E50] h-12 rounded-xl transition-all shadow-lg shadow-[#E75480]/20"
                      onClick={() => handleDownloadInvoice(order, userToken)}
                  >
                      Invoice
                  </Button>
              )}
          </div>
      </div>


      {/* Modals */}
      <ContactSupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        orderId={order?._id}
        userToken={userToken}
      />

      <RateReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        order={order}
        userToken={userToken}
      />

      <ReturnExchangeModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        order={order}
        userToken={userToken}
      />
    </div>
  )
}