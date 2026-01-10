"use client"

import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, ArrowRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { productAPI } from "@/lib/api"
import { useWishlist } from "@/hooks/useWishlist"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"
import ProductCard from "../products/ProductCard"

export default function DiscountedProducts() {
  const [products, setProducts] = useState([])
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
        const data = await productAPI.getDiscountedProducts({ forHomepage: "true", limit: 12, minDiscount: 10 })
        if (active) setProducts(data?.products || [])
      } catch {
        toast.error("Failed to load discounted products")
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
    if (!userToken) {
      toast.info("Please login to manage wishlist")
      return navigate("/login")
    }
    try {
      if (wishlistSet.has(String(id))) {
        await removeFromWishlist(id)
        toast.info("Removed from Wishlist")
      } else {
        await addToWishlist(id)
        toast.success("Added to Wishlist")
      }
      fetchWishlist()
    } catch {
      toast.error("Failed to update wishlist")
    }
  }

  if (isLoading)
    return (
      <section className="py-8 bg-[#FFF5F7] text-center">
        {/* Loader in Sunset Orange */}
        <Loader2 className="h-8 w-8 animate-spin text-[#FF4E50] mx-auto" />
        <p className="mt-2 text-[#E75480] text-xs font-bold uppercase tracking-widest">Loading deals...</p>
      </section>
    )

  if (!products.length) return null

  return (
    <section className="py-8 sm:py-12 bg-white selection:bg-[#FF4E50] selection:text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Background Gradient: Rose Pink to Sunset Orange tint */}
        <div className="bg-gradient-to-r from-[#FFF5F7] to-[#FFF9F0] rounded-2xl p-4 sm:p-8 border border-[#FAD0C4]">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-3xl font-black text-[#333] uppercase tracking-tighter flex items-center gap-2">
                {/* Icon in Sunset Orange */}
                <Tag className="h-6 w-6 text-[#FF4E50]" />
                Hot <span className="text-[#E75480] italic font-serif font-light lowercase">Deals</span>
              </h2>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#E75480]/60 mt-1">
                Amazing discounts you can't miss
              </p>
            </div>

            <Link to="/products?discounted=true" className="hidden sm:block">
              {/* Button with Sunset Orange text and Golden Yellow hover */}
              <Button variant="link" className="text-[#FF4E50] hover:text-[#FFD700] font-bold uppercase text-[10px] tracking-widest transition-colors">
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {products.slice(0, 12).map((p) => (
              <div key={p._id} className="transition-transform duration-500 hover:-translate-y-1">
                <ProductCard
                  product={p}
                  isWishlisted={wishlistSet.has(String(p._id))}
                  onWishlistToggle={toggleWishlist}
                />
              </div>
            ))}
          </div>

          {/* Mobile View All link in Sunset Orange */}
          <div className="text-center mt-6 sm:hidden">
            <Link to="/products?discounted=true" className="text-[#FF4E50] font-bold uppercase text-[10px] tracking-[0.2em]">
              View All Deals <ArrowRight className="h-3 w-3 inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}