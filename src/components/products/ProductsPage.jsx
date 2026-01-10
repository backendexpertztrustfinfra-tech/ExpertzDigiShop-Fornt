"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import ProductCard from "../products/ProductCard"
import { productAPI } from "@/lib/api"
import { useWishlist } from "../../hooks/useWishlist"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify"
import { 
  SlidersHorizontal, X, RotateCcw, 
  Grid2X2, Grid3X3, Star, Check, 
  Zap, ChevronDown, PackageCheck
} from "lucide-react"

const UPLOAD_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000"

const getProductImageUrl = (imagePath) => {
  if (imagePath && typeof imagePath === "string") {
    const clean = imagePath.replace(/\\/g, "/")
    return clean.startsWith("http") ? clean : `${UPLOAD_BASE_URL}/${clean}`
  }
  return "/placeholder.svg"
}

export default function ProductsPage() {
  const { category } = useParams()
  const [searchParams] = useSearchParams()
  const { userToken } = useAuth()
  const { wishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlist()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [gridSize, setGridSize] = useState(4)

  const [sortBy, setSortBy] = useState("popular")
  const [priceRange, setPriceRange] = useState(100000)
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [selectedRating, setSelectedRating] = useState(null)
  const [inStockOnly, setInStockOnly] = useState(false)

  const wishlistSet = useMemo(() => 
    new Set(wishlist?.items?.map((i) => String(i.product?._id || i._id)) || []), 
  [wishlist])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await productAPI.getAllProducts()
        const productList = Array.isArray(data) ? data : data?.products || []
        setProducts(productList.map(p => ({ ...p, _id: p._id || p.id, images: p.images?.map(getProductImageUrl) || [] })))
      } catch (err) { toast.error("Database Link Error") } finally { setLoading(false) }
    }
    fetchProducts()
  }, [])

  useEffect(() => { if (userToken) fetchWishlist?.() }, [userToken])

  const toggleWishlist = async (id) => {
    if (!userToken) return toast.info("Please login")
    try {
      wishlistSet.has(String(id)) ? await removeFromWishlist(id) : await addToWishlist(id)
      fetchWishlist()
    } catch { toast.error("Wishlist error") }
  }

  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))], [products])

  const filteredProducts = useMemo(() => {
    let list = [...products]
    if (category) list = list.filter(p => p.category?.toLowerCase() === category.toLowerCase())
    list = list.filter(p => p.price <= priceRange)
    if (selectedBrands.length > 0) list = list.filter(p => selectedBrands.includes(p.brand))
    if (selectedSizes.length > 0) list = list.filter(p => selectedSizes.includes(p.size))
    if (selectedRating) list = list.filter(p => Math.round(p.rating) >= selectedRating)
    if (inStockOnly) list = list.filter(p => p.stock > 0)

    if (sortBy === "price-low") list.sort((a, b) => a.price - b.price)
    else if (sortBy === "price-high") list.sort((a, b) => b.price - a.price)
    return list
  }, [products, category, sortBy, priceRange, selectedBrands, selectedSizes, selectedRating, inStockOnly])

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E75480]/60">Value & Status</h4>
        <input type="range" min="0" max="100000" step="500" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none accent-[#FF4E50] cursor-pointer" />
        <p className="text-3xl font-black italic text-[#FFD700] tracking-tighter">Under {formatPrice(priceRange)}</p>
        <button onClick={() => setInStockOnly(!inStockOnly)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${inStockOnly ? "text-[#FF4E50]" : "text-zinc-500"}`}>
          <PackageCheck size={16}/> {inStockOnly ? "In Stock Secured" : "Show All Archive"}
        </button>
      </div>

      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E75480]/60">Brand</h4>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-hide">
          {allBrands.map(brand => (
            <button key={brand} onClick={() => setSelectedBrands(p => p.includes(brand) ? p.filter(b => b !== brand) : [...p, brand])} 
            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all ${selectedBrands.includes(brand) ? "bg-[#FF4E50] text-white border-[#FF4E50] shadow-lg" : "border-zinc-800 text-zinc-500"}`}>{brand}</button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E75480]/60">Parameters</h4>
        <div className="grid grid-cols-3 gap-2">
          {["S", "M", "L", "XL", "XXL"].map(size => (
            <button key={size} onClick={() => setSelectedSizes(p => p.includes(size) ? p.filter(s => s !== size) : [...p, size])} 
            className={`h-9 rounded-lg text-[10px] font-black border transition-all ${selectedSizes.includes(size) ? "bg-[#FFD700] text-black border-[#FFD700]" : "border-zinc-800 text-zinc-500"}`}>{size}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {[4, 3].map(r => (
            <button key={r} onClick={() => setSelectedRating(r === selectedRating ? null : r)} className={`flex-1 py-2 rounded-lg border text-[10px] font-black flex items-center justify-center gap-1 transition-all ${selectedRating === r ? "bg-[#E75480] text-white border-[#E75480]" : "border-zinc-800 text-zinc-500"}`}>
              {r}.0 <Star size={10} className="fill-current"/>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-end gap-3">
        <button onClick={() => {setPriceRange(100000); setSelectedBrands([]); setSelectedSizes([]); setSelectedMaterials([]); setSelectedRating(null); setInStockOnly(false)}} className="w-full py-4 rounded-2xl bg-zinc-800 text-white font-black text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center justify-center gap-2">
          <RotateCcw size={14}/> Reset Hub
        </button>
        <button onClick={() => setIsFilterVisible(false)} className="w-full py-4 rounded-2xl bg-[#FF4E50] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#E75480] transition-all flex items-center justify-center gap-2 shadow-xl">
          Apply Selection <Zap size={14} className="fill-white" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white selection:bg-[#FF4E50] selection:text-white">
      <div className="pt-16 pb-6 px-6 border-b border-[#FAD0C4] bg-white">
        <div className="max-w-[1600px] mx-auto flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tighter uppercase italic flex items-center gap-3">
              {category ? category.replace("-", " ") : "The Archive"}
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF4E50]" />
            </h1>
            <p className="text-[10px] font-black text-[#E75480] uppercase tracking-widest">{filteredProducts.length} Results Found</p>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-[#FFF5F7] p-1 rounded-xl border border-[#FAD0C4]">
             <button onClick={() => setGridSize(3)} className={`p-2 rounded-lg ${gridSize === 3 ? "bg-white text-[#FF4E50] shadow-sm" : "text-zinc-300"}`}><Grid2X2 size={16}/></button>
             <button onClick={() => setGridSize(4)} className={`p-2 rounded-lg ${gridSize === 4 ? "bg-white text-[#FF4E50] shadow-sm" : "text-zinc-300"}`}><Grid3X3 size={16}/></button>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#FAD0C4]">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => setIsFilterVisible(!isFilterVisible)} className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${isFilterVisible ? "bg-[#FF4E50] text-white" : "bg-[#FFF5F7] text-[#FF4E50] border border-[#FAD0C4]"}`}>
            <SlidersHorizontal size={14} /> {isFilterVisible ? "Close" : "Filter"}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-[#E75480]/60 uppercase tracking-widest hidden sm:block">Sort By</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-[10px] font-black uppercase tracking-widest outline-none bg-[#FFF5F7] px-3 py-2 rounded-lg border border-[#FAD0C4] cursor-pointer text-[#FF4E50]">
              <option value="popular">Popularity</option>
              <option value="price-low">Price: Low</option>
              <option value="price-high">Price: High</option>
            </select>
          </div>
        </div>

        <div className={`hidden lg:block overflow-hidden transition-all duration-700 ease-in-out bg-zinc-950 ${isFilterVisible ? "max-h-[1000px] opacity-100 border-b border-[#FF4E50]" : "max-h-0 opacity-0"}`}>
          <div className="max-w-[1600px] mx-auto px-10 py-12 text-white">
            {FilterContent}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-6 md:py-12">
        {loading ? (
          <div className={`grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-${gridSize}`}>
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-[#FFF5F7] rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          <div className={`grid gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-16 grid-cols-2 md:grid-cols-3 lg:grid-cols-${gridSize}`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} isWishlisted={wishlistSet.has(String(product._id))} onWishlistToggle={toggleWishlist} />
            ))}
          </div>
        )}
      </div>

      {isFilterVisible && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterVisible(false)} />
          <div className="relative w-full bg-zinc-950 rounded-t-[2.5rem] p-8 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-500 text-white border-t border-[#FF4E50]">
            <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-4">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#FFD700]">Archive Hub</h2>
               <button onClick={() => setIsFilterVisible(false)} className="h-10 w-10 flex items-center justify-center bg-zinc-800 rounded-full text-white"><X size={20}/></button>
            </div>
            {FilterContent}
          </div>
        </div>
      )}
    </div>
  )
}