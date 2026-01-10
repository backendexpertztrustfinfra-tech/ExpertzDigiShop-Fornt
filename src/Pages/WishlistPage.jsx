import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWishlist } from "../hooks/useWishlist"
import { useAuth } from "../context/AuthContext"
import ProductCard from "../components/products/ProductCard"

export default function WishlistPage() {
  const navigate = useNavigate()
  const { userToken } = useAuth()
  const { wishlist, isLoading, fetchWishlist, removeFromWishlist } = useWishlist()

  useEffect(() => {
    if (!userToken) {
      navigate("/login")
      return
    }
    fetchWishlist()
  }, [userToken, navigate, fetchWishlist])

  const items = (wishlist && wishlist.items) || []
  const isEmpty = items.length === 0

  const handleWishlistToggle = async (productId) => {
    try {
      await removeFromWishlist(productId)
    } catch {
      // Error handled in hook
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF5F7]">
        <Loader2 className="h-10 w-10 text-[#FF4E50] animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#E75480]">Syncing Archive...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-zinc-900 font-sans pb-20 selection:bg-[#FF4E50] selection:text-white">
      
      {/* 1. COMPACT HEADER */}
      <div className="bg-white border-b border-[#FAD0C4]/30 sticky top-0 z-40 pt-16 pb-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E75480] hover:text-[#FF4E50] transition-colors"
            >
              <ArrowLeft size={14} /> Back to gallery
            </button>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                Saved <span className="text-[#FF4E50] not-italic">Product</span>
                <Heart size={28} className="text-[#FF4E50] fill-[#FF4E50] drop-shadow-md" />
              </h1>
              <p className="text-[10px] font-black text-[#E75480] uppercase tracking-[0.2em] opacity-70">Personal Selection Registry</p>
            </div>
          </div>
          {!isEmpty && (
            <Badge className="bg-[#FF4E50] text-white rounded-full px-6 h-10 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#FF4E50]/20 border-none">
              {items.length} Units Secured
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {isEmpty ? (
          /* 2. PREMIUM EMPTY STATE */
          <div className="max-w-md mx-auto mt-10">
            <Card className="border-none shadow-2xl shadow-[#FF4E50]/5 rounded-[3rem] overflow-hidden bg-white ring-1 ring-[#FAD0C4]/20">
              <CardContent className="p-12 text-center space-y-8">
                <div className="relative inline-block">
                    <div className="h-24 w-24 bg-[#FFF5F7] rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                        <Heart size={40} className="text-[#FAD0C4]" strokeWidth={1.5} />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 text-[#FFD700] h-8 w-8 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic text-[#333]">Vault Empty</h2>
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                    Your personal collection hub is currently vacant. Curate your favorites from the live gallery.
                  </p>
                </div>

                <Link to="/products" className="block">
                  <Button className="w-full h-14 bg-zinc-950 hover:bg-[#FF4E50] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Start Curating
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* 3. PRODUCT GRID */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-16">
            {items.map((item) => {
              const product = item.product || item
              return (
                <div key={product._id || product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProductCard
                      product={product}
                      isWishlisted={true}
                      onWishlistToggle={handleWishlistToggle}
                    />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}