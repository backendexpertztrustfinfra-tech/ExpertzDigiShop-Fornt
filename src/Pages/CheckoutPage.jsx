import { useState, useEffect } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, CreditCard, Truck, Shield, MapPin, Phone, Loader, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "../hooks/useCart"
import { useAuth } from "../context/AuthContext"
import { orderAPI, paymentAPI, productAPI } from "../lib/api"
import { toast } from "react-toastify"

// FIXED: Live Render Backend URL
const BACKEND_URL = "https://expertz-digishop.onrender.com"

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price)

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    items: cartItems,
    total: cartTotal,
    subtotal: cartSubtotal,
    tax: cartTax,
    shipping: cartShipping,
    clearCart,
    isLoading: cartLoading,
  } = useCart()
  const { user, userToken, isAuthenticated } = useAuth()

  const buyNowParam = searchParams.get("buyNow")
  const productIdParam = searchParams.get("productId")
  const quantityParam = searchParams.get("quantity")
  const isBuyNowFromUrl = buyNowParam === "true" && productIdParam

  const [isBuyNowMode, setIsBuyNowMode] = useState(!!isBuyNowFromUrl)
  const [buyNowProduct, setBuyNowProduct] = useState(null)
  const [buyNowQuantity, setBuyNowQuantity] = useState(Number.parseInt(quantityParam) || 1)
  const [buyNowLoading, setBuyNowLoading] = useState(!!isBuyNowFromUrl)

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || (user?.name ? user.name.split(" ")[0] : "") || "",
    lastName: user?.lastName || (user?.name ? user.name.split(" ")[1] : "") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
    landmark: "",
  })

  const items =
    isBuyNowMode && buyNowProduct
      ? [
          {
            product: buyNowProduct,
            productId: buyNowProduct._id,
            quantity: buyNowQuantity,
            price: buyNowProduct.price,
          },
        ]
      : cartItems

  const calculateBuyNowTotals = () => {
    if (!buyNowProduct) return { subtotal: 0, tax: 0, shipping: 0, total: 0 }
    const subtotal = buyNowProduct.price * buyNowQuantity
    const tax = subtotal * 0.05 // 5% tax
    const shipping = subtotal > 500 ? 0 : 50
    const total = subtotal + tax + shipping
    return { subtotal, tax, shipping, total }
  }

  const buyNowTotals = calculateBuyNowTotals()
  const subtotal = isBuyNowMode ? buyNowTotals.subtotal : cartSubtotal
  const tax = isBuyNowMode ? buyNowTotals.tax : cartTax
  const shipping = isBuyNowMode ? buyNowTotals.shipping : cartShipping
  const total = isBuyNowMode ? buyNowTotals.total : cartTotal

  useEffect(() => {
    if (isBuyNowFromUrl && productIdParam) {
      setIsBuyNowMode(true)
      setBuyNowLoading(true)

      const fetchProduct = async () => {
        try {
          const response = await productAPI.getProductById(productIdParam)
          if (response.success && response.product) {
            setBuyNowProduct(response.product)
          } else {
            toast.error("Product not found")
            navigate("/")
          }
        } catch (error) {
          console.error("Error fetching product:", error)
          toast.error("Failed to load product")
          navigate("/")
        } finally {
          setBuyNowLoading(false)
        }
      }
      fetchProduct()
    } else {
      setIsBuyNowMode(false)
      setBuyNowLoading(false)
    }
  }, [isBuyNowFromUrl, productIdParam, navigate])

  useEffect(() => {
    if (!isAuthenticated || !userToken) {
      navigate("/login", { replace: true })
      return
    }

    if (isBuyNowFromUrl) {
      setIsLoading(false)
      return
    }

    if (!cartLoading && cartItems.length === 0) {
      navigate("/", { replace: true })
      return
    }

    setIsLoading(false)
  }, [isAuthenticated, userToken, cartItems, navigate, cartLoading, isBuyNowFromUrl])

  const handleInputChange = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = () => {
    const requiredFields = ["firstName", "phone", "street", "city", "state", "zipCode"]
    for (const field of requiredFields) {
      if (!shippingInfo[field] || String(shippingInfo[field]).trim() === "") return false
    }
    return true
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleVerification = async (razorpayResponse, orderData) => {
    setIsProcessing(true)
    try {
      const response = await paymentAPI.verifyPayment(
        {
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          orderData: orderData,
        },
        userToken,
      )

      if (response.success && response.order && response.order._id) {
        toast.success("Payment successful! Order placed.")
        if (!isBuyNowMode) {
          clearCart()
        }
        navigate(`/order-success/${response.order._id}`, { state: { order: response.order } })
      } else {
        throw new Error(response.message || "Payment verification failed")
      }
    } catch (error) {
      console.error("Verification error:", error)
      toast.error(error.message || "Failed to process payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRazorpayPayment = async (orderCreationResponse) => {
    if (!orderCreationResponse || !orderCreationResponse.id) {
      toast.error("Payment initiation failed: invalid server response.")
      return
    }

    if (!orderCreationResponse.orderData) {
      console.error("Missing orderData from server response")
      toast.error("Unable to start payment: missing order context. Try again.")
      return
    }

    const isScriptLoaded = await loadRazorpayScript()
    if (!isScriptLoaded) {
      toast.error("Failed to load payment gateway")
      return
    }

    const { id, amount, currency, key, userDetails, orderData } = orderCreationResponse

    const options = {
      key: key,
      amount: amount,
      currency: currency,
      name: "DigiShop",
      description: "Order Payment",
      order_id: id,
      handler: async (response) => {
        await handleVerification(response, orderData)
      },
      prefill: userDetails,
      modal: {
        onclose: () => {
          setIsProcessing(false)
          toast.info("Payment window closed.")
        },
      },
      theme: { color: "#FF4E50" },
    }

    try {
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Razorpay initialization error:", error)
      toast.error("Payment initialization failed")
      setIsProcessing(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsProcessing(true)

    const itemsData = items.map((item) => ({
      product: item.product?._id || item.productId,
      seller: item.product?.seller?._id,
      quantity: item.quantity,
      price: item.price || item.product?.price,
      subtotal: (item.price || item.product?.price) * item.quantity,
      gst: item.product?.gst || 0,
      category: item.product?.category,
    }))

    const finalOrderData = {
      items: itemsData,
      shippingAddress: shippingInfo,
      totalAmount: total,
      subtotal,
      taxAmount: tax,
      shippingCost: shipping,
      isBuyNow: isBuyNowMode,
    }

    if (paymentMethod === "cod") {
      try {
        const response = await orderAPI.createOrder(
          {
            ...finalOrderData,
            paymentMethod: "cod",
          },
          userToken,
        )

        if (response.success && response.order && response.order._id) {
          toast.success("COD Order placed successfully!")
          if (!isBuyNowMode) {
            clearCart()
          }
          navigate(`/order-success/${response.order._id}`, { state: { order: response.order } })
        } else {
          throw new Error(response.message || "Failed to place COD order.")
        }
      } catch (error) {
        toast.error(error.message || "Failed to place order")
      } finally {
        setIsProcessing(false)
      }
    } else {
      try {
        const response = await paymentAPI.createOrderForPayment(
          {
            amount: total,
            orderData: finalOrderData,
          },
          userToken,
        )

        if (response.success && response.id) {
          if (!response.orderData) {
            throw new Error("Payment initialization failed (missing order data).")
          }
          await handleRazorpayPayment(response)
        } else {
          throw new Error(response.message || "Failed to initiate payment.")
        }
      } catch (error) {
        toast.error(error.message || "Failed to initialize payment.")
        setIsProcessing(false)
      }
    }
  }

  const handleStep1Submit = () => {
    if (isFormValid()) {
      setStep(2)
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fill in all required shipping fields.")
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg"
    let path = String(imagePath);
    
    if (path.startsWith("http")) {
      if (path.includes("localhost:5000")) {
        return path.replace("http://localhost:5000", BACKEND_URL);
      }
      return path;
    }
    
    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${BACKEND_URL}/${cleanPath}`;
  }

  if (isLoading || cartLoading || buyNowLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader className="animate-spin text-[#FF4E50]" size={40} />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#E75480]">Verifying Archive...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#333] selection:bg-[#FF4E50] selection:text-white">
      {/* Navbar Header */}
      <div className="bg-white border-b border-[#FAD0C4]/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="font-bold text-[#E75480] hover:bg-[#FFF5F7] rounded-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-sm font-black uppercase tracking-[0.2em] italic">Checkout <span className="text-[#FF4E50]">Protocol</span></h1>
          <Badge variant="outline" className="border-[#FAD0C4] text-[#E75480] font-black uppercase text-[10px]">
            {isBuyNowMode ? "Single Item" : `${items.length} Units`}
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Shipping */}
            {step === 1 && (
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="bg-[#FFF5F7]/50 border-b border-[#FAD0C4]/20">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-[#E75480]">
                    <MapPin className="h-5 w-5 text-[#FF4E50]" /> Delivery Hub
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">First Name *</Label>
                      <Input
                        className="h-12 rounded-xl border-[#FAD0C4]/50 bg-zinc-50/50 focus:ring-[#FF4E50] font-bold"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Last Name</Label>
                      <Input
                        className="h-12 rounded-xl border-[#FAD0C4]/50 bg-zinc-50/50 focus:ring-[#FF4E50] font-bold"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Archive Email</Label>
                      <Input className="h-12 bg-[#FFF9F0] text-zinc-400 border-transparent rounded-xl font-bold" value={shippingInfo.email} disabled />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Phone Node *</Label>
                      <Input
                        className="h-12 rounded-xl border-[#FAD0C4]/50 bg-zinc-50/50 focus:ring-[#FF4E50] font-bold"
                        value={shippingInfo.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Shipping Coordinates *</Label>
                    <Textarea
                      className="border-[#FAD0C4]/50 bg-zinc-50/50 rounded-xl min-h-[100px] resize-none font-bold"
                      value={shippingInfo.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      placeholder="House No., Building, Area..."
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">City *</Label>
                      <Input className="h-12 border-[#FAD0C4]/50 rounded-xl font-bold" value={shippingInfo.city} onChange={(e) => handleInputChange("city", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">State *</Label>
                      <Input className="h-12 border-[#FAD0C4]/50 rounded-xl font-bold" value={shippingInfo.state} onChange={(e) => handleInputChange("state", e.target.value)} />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">ZIP *</Label>
                      <Input className="h-12 border-[#FAD0C4]/50 rounded-xl font-bold" value={shippingInfo.zipCode} onChange={(e) => handleInputChange("zipCode", e.target.value)} />
                    </div>
                  </div>

                  <Button onClick={handleStep1Submit} className="w-full h-14 bg-[#FF4E50] hover:bg-[#E75480] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-[#FF4E50]/20 transition-all transform active:scale-95">
                    Select Funding Method
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="bg-[#FFF5F7]/50 border-b border-[#FAD0C4]/20">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-[#E75480]">
                    <CreditCard className="h-5 w-5 text-[#FF4E50]" /> Payment Gateway
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-5">
                    <Label htmlFor="razorpay" className={`flex items-center justify-between p-6 border rounded-[1.5rem] cursor-pointer transition-all duration-300 ${paymentMethod === 'razorpay' ? 'border-[#FF4E50] bg-[#FFF5F7] shadow-lg shadow-[#FF4E50]/5' : 'border-zinc-100 hover:border-[#FAD0C4]'}`}>
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value="razorpay" id="razorpay" className="text-[#FF4E50] border-[#FF4E50]" />
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight text-[#333]">Pay Securely Online</p>
                          <p className="text-[10px] font-bold text-[#E75480] uppercase tracking-widest">Instant verification — All Cards & UPI</p>
                        </div>
                      </div>
                      <CreditCard size={24} className={paymentMethod === 'razorpay' ? "text-[#FF4E50]" : "text-zinc-200"} />
                    </Label>

                    <Label htmlFor="cod" className={`flex items-center justify-between p-6 border rounded-[1.5rem] cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-[#FFB800] bg-[#FFF9F0] shadow-lg shadow-[#FFB800]/5' : 'border-zinc-100 hover:border-[#FAD0C4]'}`}>
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value="cod" id="cod" className="text-[#FFB800] border-[#FFB800]" />
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight text-[#333]">Cash on Delivery</p>
                          <p className="text-[10px] font-bold text-[#FFB800] uppercase tracking-widest">Settlement upon safe arrival</p>
                        </div>
                      </div>
                      <Truck size={24} className={paymentMethod === 'cod' ? "text-[#FFB800]" : "text-zinc-200"} />
                    </Label>
                  </RadioGroup>

                  <div className="flex gap-4 mt-10">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-[#FAD0C4] text-[#E75480] hover:bg-[#FFF5F7]">
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-[2] h-14 bg-[#FF4E50] hover:bg-[#E75480] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-[#FF4E50]/20 transition-all">
                      Final Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Final Review */}
            {step === 3 && (
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="bg-[#FFF5F7]/50 border-b border-[#FAD0C4]/20">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-[#E75480]">
                    <Shield className="h-5 w-5 text-[#FF4E50]" /> Order Validation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Handover node</h3>
                      <div className="p-6 bg-[#FFF5F7]/50 rounded-2xl border border-[#FAD0C4]/30 shadow-inner">
                        <p className="font-black text-sm uppercase leading-none mb-3 text-[#333]">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                        <p className="text-xs text-zinc-500 font-bold leading-relaxed">{shippingInfo.street}, {shippingInfo.city}</p>
                        <p className="text-xs text-[#E75480] font-black mt-1 uppercase tracking-widest">{shippingInfo.state} — {shippingInfo.zipCode}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Funding Method</h3>
                      <div className="p-6 bg-[#FFF9F0]/50 rounded-2xl border border-[#FFD700]/30 h-full flex items-center gap-4">
                         <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border border-[#FFD700]/20 shadow-sm">
                            {paymentMethod === 'cod' ? <Truck size={20} className="text-[#FFB800]"/> : <CreditCard size={20} className="text-[#FF4E50]"/>}
                         </div>
                         <span className="font-black text-xs uppercase tracking-[0.1em] text-[#333]">
                            {paymentMethod === "razorpay" ? "Secure Digital Pay" : "COD (Settlement)"}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-[#FAD0C4]/20">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest text-[#E75480] border-[#FAD0C4]">
                      Back
                    </Button>
                    <Button 
                        onClick={handlePlaceOrder} 
                        disabled={isProcessing} 
                        className="flex-[2] h-16 bg-zinc-950 hover:bg-[#FF4E50] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all transform active:scale-95"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            Archiving...
                        </div>
                      ) : (
                        `Confirm Order — ${formatPrice(total)}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Summary (Right) */}
          <div className="lg:col-span-4">
            <Card className="border-none shadow-2xl rounded-[2.5rem] sticky top-24 overflow-hidden bg-white">
              <CardHeader className="bg-zinc-950 p-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFD700] text-center">Summary Registry</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-5 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-5 group">
                      <div className="h-16 w-16 rounded-2xl bg-[#FFF5F7] border border-[#FAD0C4]/30 overflow-hidden flex-shrink-0 p-2 shadow-inner group-hover:scale-105 transition-transform">
                        <img 
                          src={getImageUrl(item.product?.images?.[0] || item.image)} 
                          className="h-full w-full object-contain" 
                          alt={item.product?.name || "Product"}
                          onError={(e) => { e.target.src = "/placeholder.svg" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-black text-[#333] uppercase tracking-tight line-clamp-1 italic group-hover:text-[#FF4E50] transition-colors">{item.product?.name || item.name}</h4>
                        <div className="flex justify-between items-center mt-1.5">
                          <p className="text-[9px] font-black text-[#E75480] uppercase tracking-widest opacity-60">Qty: {item.quantity}</p>
                          <p className="text-xs font-black text-[#333] italic tracking-tighter">{formatPrice((item.price || item.product?.price) * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-[#FAD0C4]/10">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Registry Subtotal</span>
                    <span className="text-[#333] font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Logistics node</span>
                    <span className={shipping === 0 ? "text-green-600 font-black italic" : "text-[#333] font-bold"}>
                        {shipping === 0 ? "GRATIS" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Tax Surcharge (5%)</span>
                    <span className="text-[#333] font-bold">{formatPrice(tax)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t-2 border-[#FFD700] pt-6 mt-6 bg-[#FFF9F0] -mx-8 px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E75480]">Total</span>
                    <span className="text-3xl font-black text-[#FF4E50] tracking-tighter italic">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="bg-[#FFF5F7] p-4 rounded-2xl flex items-center gap-4 border border-[#FAD0C4]/40">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-[#FAD0C4]/20">
                    <Shield className="h-5 w-5 text-[#FF4E50]" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#E75480] leading-relaxed opacity-80">
                    End-to-end encryption secured by Razorpay Cloud
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FIXED CSS BLOCK (REPLACED STYLE JSX GLOBAL) */}
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
          body {
            font-family: "Plus Jakarta Sans", sans-serif;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #FAD0C4;
            border-radius: 10px;
          }
        `}
      </style>
    </div>
  )
}