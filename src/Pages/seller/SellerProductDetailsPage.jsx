import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { useAuth } from "@/context/AuthContext"
import { Edit, ArrowLeft, Loader2, Package, Tag, DollarSign, Info } from "lucide-react" 
import { Separator } from "@/components/ui/separator"

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"

const UPLOAD_BASE_URL = "https://expertz-digishop.onrender.com"

const getAllImages = (product) => {
  if (!product?.images) return []
  return [
    product.images.primary,
    product.images.frontView,
    product.images.backView,
    product.images.sideView,
  ].filter(Boolean)
}

const getSellingPrice = (product) => {
  if (product?.variants?.length > 0) {
    return product.variants[0].sellingPrice || 0
  }
  return product?.pricing?.sellingPrice || 0
}

const getMRP = (product) => {
  if (product?.variants?.length > 0) {
    return product.variants[0].mrp || 0
  }
  return product?.pricing?.mrp || 0
}

const getStock = (product) => {
  if (product?.variants?.length > 0) {
    return product.variants[0].stock || 0
  }
  return product?.inventory?.totalStock || 0
}

const getSKU = (product) => {
  if (product?.variants?.length > 0) {
    return product.variants[0].sku || "N/A"
  }
  return product?.compliance?.sku || "N/A"
}

const DetailItem = ({ label, value, isPrimary = false }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className={`font-medium ${isPrimary ? 'text-lg text-gray-800' : 'text-sm text-gray-600'}`}>
        {label}
    </span>
    <span className={`text-right ${isPrimary ? 'text-xl font-bold text-primary' : 'text-sm text-gray-800'}`}>
        {value}
    </span>
  </div>
)

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

export default function SellerProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userToken } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState(null) 

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch product details")
        }
        const data = await res.json()
        const fetchedProduct = data.product
        setProduct(fetchedProduct)
        
        const imgs = getAllImages(fetchedProduct)
        if (imgs.length > 0) {
          setMainImage(imgs[0])
        }
      } catch (err) {
        toast.error("Error loading product details. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (userToken) fetchProductDetails()
  }, [id, userToken])

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.svg"
    
    let imagePath = String(img);

    if (imagePath.includes("localhost:5000")) {
      imagePath = imagePath.split("/uploads/")[1];
      return `${UPLOAD_BASE_URL}/uploads/${imagePath.replace(/\\/g, "/")}`;
    }

    if (imagePath.startsWith("http")) return imagePath;

    const cleanPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${UPLOAD_BASE_URL}/${cleanPath}`;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-700 font-medium">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20 px-4 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-4 text-red-600">Product Not Found!</h2>
        <p className="text-gray-700 mb-6">The requested product ID does not exist or access is denied.</p>
        <Link to="/seller/dashboard">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-gray-50">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-300 space-y-4 md:space-y-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 truncate max-w-[80%]">
          {product.name}
        </h1>
        <div className="flex space-x-3">
          <Link to="/seller/dashboard">
            <Button variant="outline" className="h-10 px-4 rounded-xl hidden sm:inline-flex border-2 shadow-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button 
            onClick={() => navigate(`/seller/edit-product/${product._id}`)} 
            className="bg-blue-600 hover:bg-blue-700 h-10 px-4 rounded-xl shadow-md font-bold"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Listing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="shadow-xl border-t-4 border-purple-600 rounded-xl">
            <CardHeader className="p-4 sm:p-5 bg-purple-50 rounded-t-xl border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-purple-700">
                    <Package className="h-5 w-5" /> Product Visuals
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                
                <div className="aspect-square w-full mb-4 overflow-hidden rounded-xl border-4 border-purple-200 shadow-lg group">
                    <img
                        src={getImageUrl(mainImage)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                        onError={(e) => { e.target.src = "/placeholder.svg" }}
                    />
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {getAllImages(product).map((img, i) => (
                        <img
                            key={i}
                            src={getImageUrl(img)}
                            alt={`thumb-${i}`}
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover cursor-pointer transition-all duration-200 border-2 shadow-sm ${mainImage === img ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
                            onClick={() => setMainImage(img)}
                            onError={(e) => { e.target.src = "/placeholder.svg" }}
                        />
                    ))}
                </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-t-4 border-emerald-600 rounded-xl">
            <CardHeader className="p-4 sm:p-5 bg-emerald-50 rounded-t-xl border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-emerald-700">
                    <Info className="h-5 w-5" /> Product Description
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 text-base text-gray-700 leading-relaxed">
              <p className="whitespace-pre-wrap">
                {product.description || "No detailed description provided for this product."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="p-4 sm:p-5 bg-blue-50 rounded-t-xl border-b">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-700">
                    <DollarSign className="h-5 w-5" /> Pricing & Inventory
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-lg font-extrabold text-gray-700">Product Status:</span>
                    <Badge 
                        variant={product.isActive ? "default" : "secondary"}
                        className={`text-base px-3 py-1.5 font-bold rounded-full ${product.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {product.isActive ? "ACTIVE (LIVE)" : "INACTIVE (DRAFT)"}
                    </Badge>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-xl font-bold text-gray-600">Selling Price:</span>
                        <span className="text-4xl font-extrabold text-blue-700">{formatPrice(getSellingPrice(product))}</span>
                    </div>
                    {getMRP(product) > getSellingPrice(product) && (
                        <div className="flex justify-between text-sm text-gray-500 italic pt-1">
                            <span>M.R.P.:</span>
                            <span className="line-through text-red-500 font-medium">{formatPrice(getMRP(product))}</span>
                        </div>
                    )}
                </div>
                
                <Separator className="my-3" />

                <DetailItem label="Current Stock" value={`${getStock(product)} units`} isPrimary={true} />
                <DetailItem label="Category" value={product.category || "N/A"} />
                <DetailItem label="Subcategory" value={product.subcategory || "N/A"} />
            </CardContent>
          </Card>

          <Card className="shadow-xl border-t-4 border-orange-600 rounded-xl">
            <CardHeader className="p-4 sm:p-5 bg-orange-50 rounded-t-xl border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-orange-700">
                    <Tag className="h-5 w-5" /> Technical Details
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-1">
              <DetailItem label="SKU" value={getSKU(product)} />
              <DetailItem label="HSN Code" value={product.compliance?.hsnCode || "N/A"} />
              <DetailItem label="GST Rate" value={`${product.compliance?.gst || 0}%`} />
              <DetailItem label="Weight" value={`${product.variants?.[0]?.weight || product.specifications?.weight || 0} kg`} />
              <DetailItem label="Dimensions (L x W x H)" value={`${product.variants?.[0]?.length || product.specifications?.dimensions?.length || 0} x ${product.variants?.[0]?.width || product.specifications?.dimensions?.width || 0} x ${product.variants?.[0]?.height || product.specifications?.dimensions?.height || 0} cm`} />
              <DetailItem 
                label="Created" 
                value={product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'} 
              />
              <DetailItem 
                label="Last Updated" 
                value={product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}