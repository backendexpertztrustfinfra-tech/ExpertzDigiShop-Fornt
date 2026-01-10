"use client"

import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, ArrowRight } from "lucide-react"
import { productAPI } from "@/lib/api"
import { useWishlist } from "@/hooks/useWishlist"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"
import ProductCard from "../products/ProductCard"

const CATEGORIES_TO_SHOW = [
  { name: "Fashion", desc: "Contemporary silhouettes for the modern wardrobe." },
  { name: "Beauty", desc: "Potent formulas for a natural, radiant glow." },
  { name: "Kids", desc: "Playful designs crafted for comfort and joy." },
  { name: "Toys", desc: "Igniting imagination through creative play." },
]

export default function CategoryShowcase() {
  const [categoryProducts, setCategoryProducts] = useState({})
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
        const results = {}
        await Promise.all(
          CATEGORIES_TO_SHOW.map(async (cat) => {
            const data = await productAPI.getCategoryProducts(cat.name, 4, { forHomepage: "true" })
            results[cat.name] = data?.products || []
          }),
        )
        if (active) setCategoryProducts(results)
      } catch {
        toast.error("Failed to load category products")
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

  if (isLoading)
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-[#FFF5F7] min-h-[400px]">
        {/* Loader in Sunset Orange */}
        <Loader2 className="h-10 w-10 animate-spin text-[#FF4E50]" />
        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.3em] text-[#E75480]">Curating Gallery</p>
      </div>
    )

  return (
    <section className="bg-white selection:bg-[#FF4E50] selection:text-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {CATEGORIES_TO_SHOW.map((cat, index) => {
          const products = categoryProducts[cat.name] || []
          if (!products.length) return null

          return (
            <div key={cat.name} className="py-16 sm:py-28 border-b border-[#FAD0C4] last:border-0 group/section">
              
              {/* --- CENTERED SECTION HEADER --- */}
              <div className="flex flex-col items-center text-center mb-12 sm:mb-20">
                <div className="flex items-center gap-3 mb-6">
                   {/* Lines in Golden Yellow */}
                   <span className="h-[1px] w-8 bg-[#FFD700]" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E75480]">Chapter 0{index + 1}</span>
                   <span className="h-[1px] w-8 bg-[#FFD700]" />
                </div>
                
                {/* Title in Deep Grey with Rose Pink Edition text */}
                <h2 className="text-4xl md:text-7xl font-bold tracking-tighter text-[#333] uppercase mb-4">
                  {cat.name} <span className="font-serif italic font-normal text-[#E75480]/40">Edition</span>
                </h2>
                
                {/* Description with Sunset Orange accent border */}
                <p className="text-[#333]/60 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] max-w-sm border-b border-[#FF4E50]/20 pb-4">
                  {cat.desc}
                </p>
              </div>

              {/* --- RESPONSIVE PRODUCT GRID --- */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-10 sm:gap-y-16">
                {products.map((p) => (
                  <div key={p._id} className="group relative flex flex-col items-center transition-all duration-500 hover:-translate-y-2">
                    {/* Card container with Rose Pink tint background */}
                    <div className="relative w-full overflow-hidden bg-[#FFF5F7] border border-transparent group-hover:border-[#FAD0C4] transition-all duration-700 rounded-xl sm:rounded-2xl group-hover:shadow-[0_20px_50px_rgba(231,84,128,0.1)]">
                      <ProductCard
                        product={p}
                        isWishlisted={wishlistSet.has(String(p._id))}
                        onWishlistToggle={toggleWishlist}
                      />
                    </div>
                    {/* Interaction Line - Sunset Orange on hover */}
                    <div className="mt-6 flex flex-col items-center w-full">
                       <div className="h-[1px] w-6 bg-[#FAD0C4] group-hover:w-full group-hover:bg-[#FF4E50] transition-all duration-700" />
                    </div>
                  </div>
                ))}
              </div>

              {/* --- CENTERED CTA BUTTON --- */}
              <div className="mt-16 flex justify-center">
                <Link to={`/products/${cat.name}`} className="group">
                  {/* Button with Golden Yellow border and Sunset Orange hover text */}
                  <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-[#333] border-b-2 border-[#FFD700] pb-2 hover:text-[#FF4E50] hover:border-[#FF4E50] hover:gap-6 transition-all duration-500">
                    Explore {cat.name} Collection
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}