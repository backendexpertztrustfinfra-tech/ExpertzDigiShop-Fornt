import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Heart, Star, ShoppingCart, TrendingDown, Zap } from "lucide-react"
import { useCart } from "../../hooks/useCart"
import { useAuth } from "../../context/AuthContext"
import { useWishlist } from "../../hooks/useWishlist"
import { toast } from "react-toastify"

const IMAGE_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "https://expertz-digishop.onrender.com"

const getImageUrl = (img) => {
  if (!img) return "/placeholder.svg"
  const clean = img.replace(/\\/g, "/")
  if (clean.startsWith("http")) return clean
  const base = IMAGE_BASE.endsWith("/") ? IMAGE_BASE.slice(0, -1) : IMAGE_BASE
  const path = clean.startsWith("/") ? clean : `/${clean}`
  return `${base}${path}`
}

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

// --- LOGIC ADDED: NORMALIZATION FUNCTION ---
const normalizeProduct = (p) => {
  if (!p) return null;
  const hasVariants = p.variants && p.variants.length > 0;

  // Convert images object/array to simple array
  const imagesArray = p.images && typeof p.images === "object"
    ? Object.values(p.images).filter(Boolean)
    : Array.isArray(p.images) ? p.images : [];

  return {
    ...p,
    brand: p.brand || "Digishop",
    price: hasVariants ? p.variants[0]?.sellingPrice : (p.pricing?.sellingPrice || p.price || 0),
    originalPrice: hasVariants ? p.variants[0]?.mrp : (p.pricing?.mrp || p.originalPrice || 0),
    stock: hasVariants 
      ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) 
      : (p.inventory?.totalStock || p.stock || 0),
    images: imagesArray
  };
};

export default function ProductCard({
  product: rawProduct,
  isWishlisted: externalWishlisted,
  onWishlistToggle,
}) {
  const navigate = useNavigate()
  const { addToCart, addItem } = useCart()
  const { userToken } = useAuth()
  const { addToWishlist, removeFromWishlist, fetchWishlist } = useWishlist()

  // --- LOGIC ADDED: APPLY NORMALIZATION ---
  const product = normalizeProduct(rawProduct);
  const [localWish, setLocalWish] = useState(false)

  if (!product) return null;

  const isWishlisted = externalWishlisted !== undefined ? externalWishlisted : localWish
  const isOut = product.stock === 0

  // Updated image logic to use the first image from normalized array
  const img = getImageUrl(product.images?.[0])

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOut) return toast.error("Product is out of stock")

    if (addItem) {
      addItem({
        productId: product._id,
        id: product._id,
        quantity: 1,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        maxQuantity: product.stock,
      })
    } else if (addToCart) {
      addToCart(product._id, 1)
    }

    toast.success(`${product.name} added to cart`)
  }

  const handleBuyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userToken) {
      toast.info("Please login to continue")
      return navigate("/login")
    }

    if (isOut) return toast.error("Product is out of stock")

    navigate(`/checkout?productId=${product._id}&quantity=1&buyNow=true`)
  }

  const handleWishlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (onWishlistToggle) {
      onWishlistToggle(product._id)
      return
    }

    if (!userToken) {
      toast.info("Please login to manage wishlist")
      return navigate("/login")
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist?.(product._id)
        setLocalWish(false)
        toast.info("Removed from Wishlist")
      } else {
        await addToWishlist?.(product._id)
        setLocalWish(true)
        toast.success("Added to Wishlist")
      }
      fetchWishlist?.()
    } catch {
      toast.error("Failed to update wishlist")
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col border border-[#FAD0C4]/30 h-full">
      <Link to={`/product/${product._id}`} className="relative group block">
        <div className="h-48 sm:h-56 bg-[#FFF5F7] overflow-hidden">
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />

          {isOut && (
            <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-base font-bold">
              Out of Stock
            </div>
          )}
        </div>

        {discountPercent > 0 && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-[#FF4E50] to-[#E75480] text-white px-3 py-1 text-xs sm:text-sm shadow-lg font-bold flex items-center gap-1 z-10 rounded-br-xl">
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
            {discountPercent}% OFF
          </div>
        )}

        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-md w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center hover:scale-110 transition z-10"
        >
          <Heart
            className={`h-4 w-4 sm:h-5 sm:w-5 ${
              isWishlisted
                ? "fill-[#E75480] text-[#E75480]"
                : "text-gray-700"
            }`}
          />
        </button>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-[10px] text-[#E75480] uppercase font-black tracking-widest italic mb-1">
          {product.brand}
        </p>

        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 mt-1 line-clamp-2 hover:text-[#E75480] transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  i < Math.floor(product.rating || 0)
                    ? "text-[#FFD700] fill-current"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 ml-1 font-bold">
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="mt-2 sm:mt-3 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-lg sm:text-xl font-black text-[#FF4E50] italic">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs sm:text-sm text-gray-300 line-through italic">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <button
            disabled={isOut}
            onClick={handleAddToCart}
            className={`w-full py-2.5 sm:py-3 text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all shadow-lg text-[10px] sm:text-xs ${
              isOut
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#FF4E50] hover:bg-[#E75480]"
            }`}
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            Add to Bag
          </button>

          <button
            disabled={isOut}
            onClick={handleBuyNow}
            className={`w-full py-2.5 sm:py-3 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs border-2 ${
              isOut
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-[#FFD700] text-[#333] hover:bg-[#FFF9F0]"
            }`}
          >
            <Zap className="h-4 w-4 inline-block mr-1 fill-[#FFD700] text-[#FFD700]" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}