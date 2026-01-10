import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Tag, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/hooks/use-cart"
import { applyCoupon, COUPON_CODES } from "@/lib/cart"
import { formatPrice } from "@/lib/utils"

const IMAGE_ROOT_URL = "http://localhost:5000"

const getFullImageUrl = (imagePath) => {
    if (imagePath && typeof imagePath === 'string') {
        const cleanedPath = imagePath.replace(/\\/g, "/")
        const finalPath = cleanedPath.startsWith('uploads/') ? cleanedPath : `uploads/${cleanedPath}`
        return `${IMAGE_ROOT_URL}/${finalPath.replace(/^\/+/, '')}`
    }
    return "/placeholder.svg"
}

export default function CartPage() {
  const navigate = useNavigate()
  const { items, total, subtotal, discount, shipping, tax, itemCount, removeFromCart, updateQuantity, clearCart } =
    useCart()
  const [couponCode, setCouponCode] = useState("")
  const [couponError, setCouponError] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  const handleApplyCoupon = () => {
    setCouponError("")
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    const discount = applyCoupon(couponCode, subtotal)
    if (discount > 0) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount })
      setCouponCode("")
    } else {
      setCouponError("Invalid coupon code or minimum amount not met")
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] py-12 selection:bg-[#FF4E50] selection:text-white">
        <div className="max-w-7xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 hover:bg-white text-[#E75480]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col items-center justify-center min-h-96 text-center">
            <div className="relative mb-6">
               <ShoppingBag className="h-24 w-24 text-[#FAD0C4] mx-auto opacity-50" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 bg-[#FFD700] rounded-full animate-ping opacity-20" />
               </div>
            </div>
            <h1 className="text-4xl font-black text-[#333] mb-3 uppercase tracking-tighter italic">Your Cart is <span className="text-[#FF4E50]">Empty</span></h1>
            <p className="text-lg text-[#E75480] font-medium mb-8 max-w-md uppercase tracking-wide opacity-70">
              Looks like you haven't added any items to your archive yet.
            </p>
            <Button size="lg" className="bg-[#FF4E50] hover:bg-[#E75480] text-white rounded-full px-10 shadow-xl shadow-[#FF4E50]/20 transition-all font-black uppercase tracking-widest text-xs" onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 selection:bg-[#FF4E50] selection:text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-[#FAD0C4]/30 pb-6">
          <div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-4 hover:bg-[#FFF5F7] text-[#E75480] font-bold">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
            <h1 className="text-4xl font-black text-[#333] uppercase tracking-tighter italic">Shopping <span className="text-[#FF4E50]">Bag</span></h1>
            <p className="text-[#E75480] font-black uppercase tracking-[0.2em] text-[10px] mt-1 opacity-70">{itemCount} units secured in archive</p>
          </div>
          <Button variant="outline" onClick={clearCart} className="border-[#FAD0C4] text-[#E75480] hover:bg-red-50 hover:text-red-600 rounded-full font-bold uppercase text-[10px] tracking-widest">
            Clear Archive
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <Card key={item.product._id} className="group border-[#FAD0C4]/20 hover:shadow-2xl hover:shadow-[#FF4E50]/5 transition-all duration-500 rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Image */}
                    <Link
                      to={`/product/${item.product._id}`}
                      className="flex-shrink-0 h-28 w-28 rounded-2xl overflow-hidden bg-[#FFF5F7] border border-[#FAD0C4]/30 p-2 shadow-inner group-hover:scale-105 transition-transform"
                    >
                      <img
                        src={getFullImageUrl(item.product.images?.[0]) || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-full h-full object-contain transition-transform"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product._id}`}
                        className="block font-black text-lg text-[#333] uppercase tracking-tighter italic hover:text-[#FF4E50] mb-1 truncate transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#E75480] mb-3 opacity-60">{item.product.brand || "Digishop"}</p>

                      {/* Price Section */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="font-black text-xl text-[#FF4E50] italic tracking-tighter">{formatPrice(item.price)}</span>
                        {item.product.originalPrice && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-300 line-through font-bold">
                              {formatPrice(item.product.originalPrice)}
                            </span>
                            <Badge className="bg-[#FFF9F0] text-[#FFB800] border-[#FFD700]/30 text-[9px] font-black uppercase rounded-full">
                              {item.product.discount || 0}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E75480] bg-[#FFF5F7] inline-block px-3 py-1 rounded-full">
                        Line Total: {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end justify-between py-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-full h-10 w-10 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>

                      <div className="flex items-center bg-[#FFF5F7] border border-[#FAD0C4]/30 rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="px-3 py-2 text-[#E75480] hover:bg-white transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 font-black text-sm text-[#333]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="px-3 py-2 text-[#FF4E50] hover:bg-white transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coupon Card */}
            <Card className="border-[#FAD0C4]/30 rounded-[1.5rem] shadow-xl overflow-hidden">
              <CardHeader className="bg-[#FFF5F7]/50 border-b border-[#FAD0C4]/20 p-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-[#E75480]">
                  <Tag className="h-4 w-4 text-[#FF4E50]" />
                  Discount Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-4 bg-[#FFF9F0] rounded-xl border border-[#FFD700]/30 animate-in zoom-in-95">
                    <div>
                        <span className="text-[10px] font-black uppercase text-[#FFB800] block mb-1">Active Reward</span>
                        <span className="font-black text-[#333] tracking-widest">{appliedCoupon.code}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-[#FF4E50] hover:bg-white font-bold text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        placeholder="ENTER CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 rounded-xl border-[#FAD0C4]/50 font-black uppercase tracking-widest text-xs h-12 focus:ring-[#FF4E50]"
                      />
                      <Button onClick={handleApplyCoupon} disabled={!couponCode.trim()} className="bg-[#FF4E50] hover:bg-[#E75480] text-white rounded-xl font-bold uppercase text-xs h-12 transition-all">
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <Alert className="bg-red-50 border-red-100 py-2">
                        <AlertDescription className="text-[10px] font-bold uppercase text-red-600 tracking-tight">{couponError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-3 pt-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Available Promotions:</p>
                      <div className="space-y-1.5">
                        {Object.values(COUPON_CODES).map((coupon) => (
                          <div key={coupon.code} className="flex justify-between items-center p-2 bg-[#FFF5F7]/30 rounded-lg border border-[#FAD0C4]/10 text-[10px]">
                            <span className="font-black text-[#E75480] tracking-widest">{coupon.code}</span>
                            <span className="font-bold text-zinc-500 italic">
                              {coupon.type === "percentage" ? `${coupon.discount}% off` : `₹${coupon.discount} off`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order Summary Card */}
            <Card className="sticky top-24 border-[#FAD0C4]/30 rounded-[2rem] shadow-2xl shadow-[#FF4E50]/5 overflow-hidden">
              <CardHeader className="bg-[#FFF5F7]/50 border-b border-[#FAD0C4]/20 p-6">
                <CardTitle className="text-lg font-black uppercase tracking-widest text-[#333] italic">Final <span className="text-[#FF4E50]">Tally</span></CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Archive Value ({itemCount} units)</span>
                    <span className="text-[#333]">{formatPrice(subtotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-green-600 bg-green-50/50 p-2 rounded-lg border border-green-100">
                      <span>Reward Applied</span>
                      <span>-{formatPrice(appliedCoupon.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Shipping node</span>
                    <span>
                      {shipping === 0 ? <span className="text-green-600 font-black italic">GRATIS</span> : formatPrice(shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Surcharge (Tax)</span>
                    <span className="text-[#333]">{formatPrice(tax)}</span>
                  </div>

                  <div className="flex justify-between font-black text-2xl border-t border-[#FAD0C4]/20 pt-6 bg-[#FFF9F0] -mx-6 px-6 py-4 mt-2">
                    <span className="uppercase tracking-tighter italic text-[#333]">Total</span>
                    <span className="text-[#FF4E50] tracking-tighter italic">{formatPrice(total)}</span>
                  </div>
                </div>

                {subtotal < 499 && (
                  <Alert className="bg-[#FFF9F0] border-[#FFD700]/30 rounded-2xl">
                    <Gift className="h-4 w-4 text-[#FFB800]" />
                    <AlertDescription className="text-[10px] font-black uppercase tracking-tight text-[#FFB800]">
                      Add {formatPrice(499 - subtotal)} more for gratis shipping!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3 pt-2">
                    <Button size="lg" className="w-full bg-[#FF4E50] hover:bg-[#E75480] text-white rounded-2xl h-14 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#FF4E50]/20 transition-all active:scale-95" onClick={() => navigate("/checkout")}>
                    Checkout Archive
                    </Button>

                    <Button variant="outline" className="w-full h-12 bg-transparent border-[#FAD0C4] text-[#E75480] hover:bg-[#FFF5F7] rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors" onClick={() => navigate("/products")}>
                    Return to Gallery
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}