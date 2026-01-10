"use client"

import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { productAPI } from "@/lib/api"
import { useWishlist } from "@/hooks/useWishlist"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"
import ProductCard from "../products/ProductCard"

export default function LatestProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()
  const { userToken } = useAuth()
  const { wishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlist()

  const wishlistIds = useMemo(
    () => wishlist?.items?.map((i) => String(i.product?._id || i._id)) || [],
    [wishlist]
  )
  const wishlistSet = new Set(wishlistIds)

  useEffect(() => {
    let active = true
    async function loadProducts() {
      try {
        const data = await productAPI.getLatestProducts({
          forHomepage: "true",
          limit: 8,
        })
        if (active) setProducts(data?.products || [])
      } catch {
        toast.error("Failed to load latest arrivals")
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadProducts()
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

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-[#FFF5F7] min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF4E50]" />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E75480]">Syncing Collection</p>
      </div>
    )
  }

  if (!products.length) return null

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-[#FAD0C4] selection:bg-[#FF4E50] selection:text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* --- CENTERED HEADER --- */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E75480] italic">Seasonal Drop</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter text-[#333] uppercase">
            New <span className="font-serif italic font-normal text-[#FF4E50]">Arrivals</span>
          </h2>
          
          {/* Decorative line in Sunset Orange */}
          <div className="mt-6 h-[1.5px] w-16 bg-[#FF4E50]" />
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-10 sm:gap-y-16">
          {products.map((product) => (
            <div key={product._id} className="group relative flex flex-col items-center">
               <div className="relative w-full overflow-hidden bg-[#FFF5F7] border border-transparent group-hover:border-[#FAD0C4] transition-all duration-700">
                  <ProductCard
                    product={product}
                    isWishlisted={wishlistSet.has(String(product._id))}
                    onWishlistToggle={toggleWishlist}
                  />
                  
                  {/* Tag in Sunset Orange */}
                  <div className="absolute top-0 left-0">
                     <span className="bg-[#FF4E50] text-white text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5">
                        Recent
                     </span>
                  </div>
               </div>

               {/* Interaction Line - Transitions to Sunset Orange */}
               <div className="mt-6 flex flex-col items-center w-full">
                  <div className="h-[1px] w-6 bg-[#FAD0C4] group-hover:w-full group-hover:bg-[#FF4E50] transition-all duration-700" />
               </div>
            </div>
          ))}
        </div>

        {/* --- CLEAN CENTERED CTA --- */}
        <div className="mt-16 flex justify-center">
           <Link to="/products?sort=newest" className="group">
              <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-[#333] border-b-2 border-[#FFD700] pb-2 hover:text-[#FF4E50] hover:border-[#FF4E50] hover:gap-6 transition-all duration-500">
                  Explore Full Collection
                  <ArrowRight className="h-4 w-4" />
              </button>
           </Link>
        </div>
      </div>
    </section>
  )
}