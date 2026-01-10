"use client"

import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { productAPI } from "@/lib/api"
import { useWishlist } from "@/hooks/useWishlist"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"
import ProductCard from "../products/ProductCard"

const INITIAL_VISIBLE_COUNT = 8

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()
  const { userToken } = useAuth()
  const { wishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlist()

  const wishlistIds = useMemo(() => wishlist?.items?.map((i) => String(i.product?._id || i._id)) || [], [wishlist])
  const wishlistSet = new Set(wishlistIds)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await productAPI.getFeaturedProducts()
        if (active) setProducts(data?.products || [])
      } catch {
        toast.error("Failed to load featured products")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => (active = false)
  }, [])

  useEffect(() => {
    if (userToken) fetchWishlist?.()
  }, [userToken])

  const toggleWishlist = async (id) => {
    if (!userToken) return navigate("/login")
    try {
      wishlistSet.has(String(id)) ? await removeFromWishlist(id) : await addToWishlist(id)
      fetchWishlist()
    } catch {
      toast.error("Wishlist update failed")
    }
  }

  const list = showAll ? products : products.slice(0, INITIAL_VISIBLE_COUNT)

  if (isLoading)
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-[#FFF5F7]">
        {/* Loader in Sunset Orange */}
        <Loader2 className="h-8 w-8 animate-spin text-[#FF4E50]" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#E75480]">Consulting Trends</p>
      </div>
    )

  return (
    <section className="py-20 sm:py-32 bg-white selection:bg-[#FF4E50] selection:text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* --- MINIMALIST HEADER --- */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-24 space-y-4">
          {/* Badge: Golden Yellow background tint with Rose Pink text */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FAD0C4] bg-[#FFF9F0] text-[#E75480]">
             <Star className="h-3 w-3 fill-[#FFD700] text-[#FFD700]" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Customer Choice</span>
          </div>
          
          {/* Title: Black with Rose Pink Signature and Sunset Orange Vault */}
          <h2 className="text-4xl md:text-7xl font-light tracking-tighter uppercase leading-none text-[#333]">
            The <span className="font-serif italic text-[#E75480]">Signature</span> <br /> 
            <span className="font-black text-[#FF4E50]">Featured Vault</span>
          </h2>
          
          <p className="text-[#333]/60 text-sm md:text-lg max-w-lg font-medium leading-relaxed">
            Our most coveted pieces, handpicked for their exceptional quality and timeless design.
          </p>
        </div>

        {/* --- PREMIUM PRODUCT GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-10 sm:gap-y-20">
          {list.map((p, index) => (
            <div 
              key={p._id} 
              className="relative transition-all duration-700 hover:-translate-y-2"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {/* Added a subtle Rose Pink ring on hover through ProductCard container if possible */}
              <ProductCard
                product={p}
                isWishlisted={wishlistSet.has(String(p._id))}
                onWishlistToggle={toggleWishlist}
              />
            </div>
          ))}
        </div>

        {/* --- HIGH-END CTA --- */}
        {!showAll && products.length > INITIAL_VISIBLE_COUNT && (
          <div className="mt-20 flex flex-col items-center">
             {/* Gradient line from Sunset Orange to Transparent */}
             <div className="w-[1px] h-20 bg-gradient-to-b from-[#FF4E50] to-transparent mb-10" />
             
             {/* Pill-shaped Button: Sunset Orange with Rose Pink Hover */}
             <Button
                onClick={() => setShowAll(true)}
                className="group h-16 px-12 bg-[#FF4E50] text-white hover:bg-[#E75480] transition-all duration-500 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-[#FF4E50]/20"
             >
                View Full Selection
                <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-2 transition-transform" />
             </Button>
          </div>
        )}

        {/* Mobile Mini Link in Sunset Orange */}
        <div className="text-center mt-12 sm:hidden">
          <Link
            to="/products"
            className="text-[10px] font-black uppercase tracking-widest border-b border-[#FF4E50] pb-1 text-[#FF4E50]"
          >
            Explore All 
          </Link>
        </div>
      </div>
    </section>
  )
}