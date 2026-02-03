import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Star,
  ChevronLeft,
  Edit,
  Minus,
  Plus,
  Zap,
  Package,
  FileText,
  Building,
  MapPin,
  Tag,
} from "lucide-react";
import { productAPI, reviewAPI } from "../../lib/api";
import { useWishlist } from "../../hooks/useWishlist";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const BASE_URL =
  import.meta.env.VITE_API_URL.replace("/api", "/") ||
  "https://expertz-digishop.onrender.com/";

const getImageUrl = (imagePath) => {
  if (imagePath && typeof imagePath === "string") {
    const cleanPath = imagePath.replace(/\\/g, "/");
    const finalPath = cleanPath.startsWith("uploads")
      ? cleanPath
      : cleanPath.substring(1);
    return `${BASE_URL}${finalPath}`;
  }
  return "/placeholder.svg";
};

const normalizeProductForCustomer = (p) => {
  const hasVariants = p.variants && p.variants.length > 0;

  const imgArray = p.images
    ? typeof p.images === "object" && !Array.isArray(p.images)
      ? Object.values(p.images).filter(Boolean)
      : p.images
    : [];

  return {
    ...p,
    price: hasVariants
      ? p.variants[0]?.sellingPrice
      : p.pricing?.sellingPrice || p.price || 0,

    originalPrice: hasVariants
      ? p.variants[0]?.mrp
      : p.pricing?.mrp || p.originalPrice || 0,

    stock: hasVariants
      ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : p.inventory?.totalStock || p.stock || 0,

    returnDays: p.policies?.returnDays || p.returnDays || 30,
    warranty: p.policies?.warranty || p.warranty || "No warranty",
    images: imgArray,

    // Detailed Data Mapping
    brand: p.brand || "Generic",
    material: p.material || "Not Specified",
    category: p.category || "General",
    hsnCode: p.compliance?.hsnCode || "N/A",
    gst: Number(p.compliance?.gst ?? 0),
    countryOfOrigin: p.compliance?.countryOfOrigin || "India",
    manufacturer: p.manufacturer || {},
    packer: p.packer || {},
    shippingWeight: Number(p.shipping?.weight ?? 0),
    returnPolicy: p.policies?.returnPolicy || "Standard Return Policy",
  };
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userToken } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productResponse = await productAPI.getProductById(id);
        if (productResponse.success) {
          const normalized = normalizeProductForCustomer(
            productResponse.product,
          );
          setProduct(normalized);
          setWishlistStatus(isInWishlist(id));
        } else {
          toast.error("Product not found");
          navigate("/products");
        }

        const reviewsResponse = await reviewAPI.getProductReviews(id);
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.reviews || []);
        }
      } catch (error) {
        console.error("[Error fetching product]:", error);
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate, isInWishlist, userToken]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = async () => {
    if (!userToken) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      await addItem({
        id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        maxQuantity: product.stock || 1,
      });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!userToken) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    if (product.stock === 0) {
      toast.error("Out of stock");
      return;
    }

    navigate(`/checkout?productId=${id}&quantity=${quantity}&buyNow=true`);
  };

  const handleWishlist = async () => {
    if (!userToken) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    try {
      if (wishlistStatus) {
        await removeFromWishlist(id);
        toast.info("Removed from Wishlist");
      } else {
        await addToWishlist(id);
        toast.success("Added to Wishlist");
      }
      setWishlistStatus(!wishlistStatus);
    } catch (error) {
      toast.error(error.message || "Failed to update wishlist");
    }
  };

  const renderReviews = () => (
    <div className="space-y-6">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div
            key={review._id}
            className="border-b pb-4 last:border-0 border-zinc-100"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-zinc-700">
                  {review.user?.name || "Anonymous User"}
                </p>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? "fill-[#FFD700] text-[#FFD700]"
                          : "text-zinc-300"
                      }
                    />
                  ))}
                </div>
              </div>
              {review.verified && (
                <span className="text-xs bg-[#FFF5F7] text-[#E75480] px-3 py-1 rounded-full font-medium border border-[#FAD0C4]">
                  ✓ Verified Buyer
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-1 text-zinc-800">
              {review.title}
            </h3>
            <p className="text-zinc-600">{review.comment}</p>
          </div>
        ))
      ) : (
        <p className="text-zinc-500 text-center py-8">
          No reviews yet. Be the first to share your experience!
        </p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#FF4E50]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <h1 className="text-3xl font-bold mb-4 text-zinc-800">
          Product Not Found 😔
        </h1>
        <p className="text-zinc-600 mb-6">
          The item you are looking for may have been removed or is temporarily
          unavailable.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-[#FF4E50] text-white px-8 py-3 rounded-full hover:bg-[#E75480] transition-colors shadow-lg"
        >
          Explore Other Products
        </button>
      </div>
    );
  }

  const savings = product.originalPrice
    ? product.originalPrice - product.price
    : 0;
  const avgRating = product.rating || 0;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-8 selection:bg-[#FF4E50] selection:text-white">
      <div className="sticky top-0 z-10 bg-white border-b border-[#FAD0C4] lg:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-zinc-700 hover:text-[#FF4E50]"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="font-semibold text-lg truncate max-w-[60%] text-zinc-900">
            {product.name}
          </span>
          <button onClick={handleWishlist} className="text-zinc-700">
            <Heart
              size={24}
              className={
                wishlistStatus
                  ? "fill-[#E75480] text-[#E75480]"
                  : "text-zinc-400"
              }
            />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="hidden lg:flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-[#FF4E50] font-medium transition-colors"
          >
            <ChevronLeft size={20} />
            Back to Products
          </button>

          {user?.id === product?.seller?._id && (
            <Link
              to={`/seller/edit-product/${product._id}`}
              className="flex items-center gap-2 bg-[#333] text-white px-4 py-2 rounded-full hover:bg-[#FF4E50] font-medium transition-colors"
            >
              <Edit size={18} />
              Edit Product
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-xl lg:flex lg:flex-row-reverse lg:p-4 border border-[#FAD0C4]/30">
              <div className="lg:flex-1 aspect-square flex items-center justify-center p-4">
                <img
                  src={
                    getImageUrl(product.images?.[selectedImage]) ||
                    "/placeholder.svg"
                  }
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-500"
                />
              </div>
              <div className="p-4 lg:p-0 lg:w-32 flex gap-2 overflow-x-auto lg:grid lg:grid-cols-1 lg:gap-3 lg:pr-4">
                {product.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 lg:w-full lg:h-auto aspect-square rounded-lg overflow-hidden border-2 p-1 transition-all ${
                      selectedImage === idx
                        ? "border-[#FF4E50] shadow-md"
                        : "border-zinc-200 hover:border-[#FAD0C4]"
                    } bg-zinc-50 flex items-center justify-center`}
                  >
                    <img
                      src={getImageUrl(img) || "/placeholder.svg"}
                      alt={`Product view ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden lg:block bg-white p-6 rounded-xl shadow-lg border border-[#FAD0C4]/20 space-y-4">
              <h1 className="text-3xl font-extrabold text-zinc-900 mb-2 uppercase tracking-tighter italic">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.round(avgRating)
                          ? "fill-[#FFD700] text-[#FFD700]"
                          : "text-zinc-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#E75480]">
                  {avgRating.toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#FAD0C4]/20">
              <div className="flex border-b border-[#FAD0C4]/20">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`flex-1 py-3 px-6 text-sm font-black uppercase tracking-widest transition-colors ${
                    activeTab === "description"
                      ? "text-[#FF4E50] border-b-2 border-[#FF4E50] bg-[#FFF5F7]"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 py-3 px-6 text-sm font-black uppercase tracking-widest transition-colors ${
                    activeTab === "reviews"
                      ? "text-[#FF4E50] border-b-2 border-[#FF4E50] bg-[#FFF5F7]"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
              </div>
              <div className="p-6">
                {activeTab === "description" && (
                  <div className="space-y-8">
                    {/* Basic Product Info Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-zinc-400 font-medium">
                          Category
                        </span>
                        <span className="text-zinc-800 font-bold">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-zinc-400 font-medium">Brand</span>
                        <span className="text-zinc-800 font-bold">
                          {product.brand}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-zinc-400 font-medium">
                          Material
                        </span>
                        <span className="text-zinc-800 font-bold">
                          {product.material}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-zinc-400 font-medium">
                          Weight
                        </span>
                        <span className="text-zinc-800 font-bold">
                          {product.shippingWeight} kg
                        </span>
                      </div>
                    </div>

                    {/* Full Description */}
                    <div>
                      <h3 className="font-bold text-zinc-800 mb-2 flex items-center gap-2">
                        <FileText size={18} className="text-[#FF4E50]" />
                        About this item
                      </h3>
                      <p className="text-zinc-600 whitespace-pre-wrap leading-relaxed">
                        {product.description ||
                          "Detailed description is currently unavailable."}
                      </p>
                    </div>

                    {/* Manufacturer & Packer Details */}
                    <div className="bg-zinc-50 p-4 rounded-xl space-y-4">
                      <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                        <Building size={18} className="text-[#FF4E50]" />
                        Manufacturing Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className="text-zinc-400 uppercase text-[10px] font-bold tracking-widest mb-1">
                            Manufacturer
                          </p>
                          <p className="font-bold text-zinc-700">
                            {product.manufacturer?.name || "N/A"}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            {product.manufacturer?.address}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            {product.manufacturer?.city},{" "}
                            {product.manufacturer?.state}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-400 uppercase text-[10px] font-bold tracking-widest mb-1">
                            Packer
                          </p>
                          <p className="font-bold text-zinc-700">
                            {product.packer?.name || product.manufacturer?.name}
                          </p>
                          <p className="text-zinc-500 text-xs">
                            {product.packer?.address ||
                              product.manufacturer?.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Compliance & Taxes */}
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="bg-zinc-100 px-3 py-1 rounded-md text-zinc-600">
                        <span className="font-bold">HSN:</span>{" "}
                        {product.hsnCode}
                      </div>
                      <div className="bg-zinc-100 px-3 py-1 rounded-md text-zinc-600">
                        <span className="font-bold">GST:</span> {product.gst}%
                      </div>
                      <div className="bg-zinc-100 px-3 py-1 rounded-md text-zinc-600">
                        <span className="font-bold">Country of Origin:</span>{" "}
                        {product.countryOfOrigin}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "reviews" && renderReviews()}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#FAD0C4]/20">
              <h2 className="text-xl font-bold text-zinc-800 mb-6 uppercase tracking-tighter">
                Delivery & Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4 bg-[#FFF5F7] rounded-xl border border-[#FAD0C4]/30">
                  <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                    <Truck className="text-[#FF4E50]" size={28} />
                  </div>
                  <p className="font-bold text-zinc-800 text-sm uppercase">
                    {product.freeShipping ? "Free Delivery" : "Fast Delivery"}
                  </p>
                  <p className="text-xs text-[#E75480] font-medium mt-1">
                    {product.shippingTime || "5-7 Days"}
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-[#FFF9F0] rounded-xl border border-[#FFD700]/30">
                  <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                    <RotateCcw className="text-[#FFD700]" size={28} />
                  </div>
                  <p className="font-bold text-zinc-800 text-sm uppercase">
                    Easy Returns
                  </p>
                  <p className="text-xs text-[#E75480] font-medium mt-1">
                    {product.returnDays}-day return
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-[#FFF5F7] rounded-xl border border-[#FAD0C4]/30">
                  <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                    <Shield className="text-[#E75480]" size={28} />
                  </div>
                  <p className="font-bold text-zinc-800 text-sm uppercase">
                    Warranty
                  </p>
                  <p className="text-xs text-[#E75480] font-medium mt-1">
                    {product.warranty}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-xl border border-[#FAD0C4]/20">
                <div className="space-y-2 mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-[#FF4E50] italic tracking-tighter">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="text-xl text-zinc-300 line-through italic font-medium">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                  </div>
                  {savings > 0 && (
                    <p className="text-lg font-bold text-[#E75480]">
                      Save {formatPrice(savings)}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-[#FFD700]" : "bg-rose-500"}`}
                    ></div>
                    <span
                      className={`font-black uppercase text-[10px] tracking-widest ${product.stock > 0 ? "text-[#FFD700]" : "text-rose-600"}`}
                    >
                      {product.stock > 0
                        ? `In Stock (${product.stock} left)`
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-t border-[#FAD0C4]/20">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Quantity:
                  </label>

                  <div className="flex items-center border border-[#FAD0C4] rounded-full overflow-hidden">
                    {/* MINUS */}
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-[#FFF5F7] text-[#E75480] transition-colors"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="px-4 font-bold text-zinc-800">
                      {quantity}
                    </span>

                    {/* PLUS */}
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock || 1, q + 1))
                      }
                      disabled={product.stock === 0}
                      className="p-2 hover:bg-[#FFF5F7] text-[#E75480] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-6">
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
                      product.stock > 0
                        ? "bg-[#FF4E50] text-white hover:bg-[#E75480] shadow-[#FF4E50]/20"
                        : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    <Zap size={18} className="fill-current" />
                    Buy Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all border-2 ${
                      product.stock > 0
                        ? "border-[#FFD700] text-[#333] hover:bg-[#FFF9F0]"
                        : "border-zinc-200 text-zinc-300 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleWishlist}
                    className="w-full text-center py-2 text-[#E75480] hover:scale-105 font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <Heart
                      size={18}
                      className={wishlistStatus ? "fill-[#E75480]" : ""}
                    />
                    {wishlistStatus ? "Wishlisted" : "Add to Wishlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#FAD0C4] shadow-2xl p-4 lg:hidden z-20">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-[#FFF5F7] text-[#E75480] border border-[#FAD0C4]"
          >
            Add to Bag
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-[#FF4E50] text-white shadow-lg shadow-[#FF4E50]/20"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
