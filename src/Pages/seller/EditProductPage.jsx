import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, Upload, X, Loader2, DollarSign, Package, Tag, Info, Truck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/AuthContext"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// FIXED: Using Render URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"
const UPLOAD_BASE_URL = "https://expertz-digishop.onrender.com"

export default function EditProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userToken } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "0",
    category: "",
    subcategory: "",
    brand: "",
    inventory: "",
    sku: "",
    gst: "18",
    hsn: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    shippingTime: "5-7 Days",
    freeShipping: false,
    shippingCharge: "0",
    returnDays: "30",
    returnPolicy: "30-day return policy available",
    moneyBackGuarantee: true,
    warranty: "No warranty",
    warrantyPeriod: "",
    codAvailable: true,
    manufacturerName: "",
    countryOfOrigin: "India",
    packerName: "",
  })

  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { value: "Fashion", label: "Fashion" },
    { value: "Electronics", label: "Electronics" },
    { value: "Toys", label: "Toys" },
    { value: "Kids", label: "Kids" },
    { value: "Beauty", label: "Beauty & Health" },
    { value: "Sports", label: "Sports & Fitness" },
    { value: "Books", label: "Books" },
    { value: "Accessories", label: "Accessories" },
    { value: "Automotive", label: "Automotive" },
  ]

  // FIXED: Robust Image Helper
  const getCleanImageUrl = (img) => {
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

  useEffect(() => {
    const fetchProduct = async () => {
      if (!userToken) {
        toast.error("Please login")
        navigate("/login")
        return
      }
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        })
        const data = await res.json()
        if (!res.ok || !data.product) {
          toast.error(data.message || "Product not found")
          navigate("/seller/dashboard")
          return
        }

        if (!user || String(user.id) !== String(data.product.seller?._id)) {
          toast.error("You can only edit your own products")
          navigate("/seller/dashboard")
          return
        }

        const p = data.product
        setFormData({
          name: p.name || "",
          description: p.description || "",
          price: p.price || "",
          originalPrice: p.originalPrice || "",
          discount: p.discount || "0",
          category: p.category || "",
          subcategory: p.subcategory || "",
          brand: p.brand || "",
          inventory: p.stock ?? p.inventory ?? "",
          sku: p.sku || "",
          gst: p.gst || "18",
          hsn: p.hsn || "",
          weight: p.weight || "",
          length: p.length || "",
          width: p.width || "",
          height: p.height || "",
          shippingTime: p.shippingTime || "5-7 Days",
          freeShipping: p.freeShipping || false,
          shippingCharge: p.shippingCharge || "0",
          returnDays: p.returnDays || "30",
          returnPolicy: p.returnPolicy || "30-day return policy available",
          moneyBackGuarantee: p.moneyBackGuarantee !== undefined ? p.moneyBackGuarantee : true,
          warranty: p.warranty || "No warranty",
          warrantyPeriod: p.warrantyPeriod || "",
          codAvailable: p.codAvailable !== undefined ? p.codAvailable : true,
          manufacturerName: p.manufacturerName || "",
          countryOfOrigin: p.countryOfOrigin || "India",
          packerName: p.packerName || "",
        })

        const cleanedImages = (p.images || []).map(img => getCleanImageUrl(img))
        setExistingImages(cleanedImages)

      } catch (err) {
        console.error("Error loading product for edit:", err)
        toast.error("Failed to load product")
        navigate("/seller/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id, navigate, user, userToken])

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files)
    if (existingImages.length + newImages.length + files.length > 5) {
      toast.warn("Maximum 5 images allowed in total.")
      return
    }
    setNewImages((prev) => [...prev, ...files])
    e.target.value = null
  }

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index) => setNewImages((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userToken) {
      toast.error("Please login")
      navigate("/login")
      return
    }

    if (!formData.name?.trim() || !formData.description?.trim() || !formData.price || !formData.inventory) {
      toast.error("Please fill required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = new FormData()
      newImages.forEach((file) => payload.append("images", file))
      existingImages.forEach((imgUrl) => payload.append("existingImages", imgUrl))

      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          const key = k === "inventory" ? "stock" : k
          payload.append(key, String(v))
        }
      })

      const res = await fetch(`${API_BASE_URL}/sellers/products/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userToken}` },
        body: payload,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || "Failed to update product")
        setIsSubmitting(false)
        return
      }

      toast.success("Product updated successfully")
      navigate(`/seller/product-details/${id}`)
    } catch (err) {
      console.error("Error updating product:", err)
      toast.error("Network error while updating product")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24 font-sans">
      <ToastContainer position="top-right" autoClose={4000} />

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-xl">
            <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
            <p className="text-gray-700 font-semibold text-lg">Updating product...</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-300">
          <Link to={`/seller/product-details/${id}`}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full text-gray-700 hover:bg-gray-200 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <h1 className="text-3xl font-extrabold text-gray-900">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Details Section */}
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="bg-blue-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" /> Basic Details
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div>
                <Label className="font-semibold">Product Name *</Label>
                <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
              </div>

              <div>
                <Label className="font-semibold">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Subcategory</Label>
                  <Input
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange("subcategory", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Brand</Label>
                  <Input value={formData.brand} onChange={(e) => handleInputChange("brand", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold">SKU</Label>
                  <Input value={formData.sku} onChange={(e) => handleInputChange("sku", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Manufacturer Name</Label>
                  <Input
                    value={formData.manufacturerName}
                    onChange={(e) => handleInputChange("manufacturerName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Country of Origin</Label>
                  <Input
                    value={formData.countryOfOrigin}
                    onChange={(e) => handleInputChange("countryOfOrigin", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="bg-blue-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" /> Product Images (Max 5)
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="flex gap-3 flex-wrap">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative w-28 h-28 overflow-hidden rounded">
                    <img src={url || "/placeholder.svg"} alt={`existing-${i}`} className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {newImages.map((file, i) => (
                  <div key={i} className="relative w-28 h-28 overflow-hidden rounded">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`new-${i}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <label className="w-28 h-28 flex items-center justify-center border-2 border-dashed rounded cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleNewImages} />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Discount Section */}
          <Card className="shadow-xl border-t-4 border-emerald-600 rounded-xl">
            <CardHeader className="bg-emerald-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" /> Pricing & Discount
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold">Selling Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">MRP / Original Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Discount (%)</Label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount: e.target.value }))}
                    max="100"
                    min="0"
                  />
                  <p className="text-xs text-emerald-600 font-semibold">
                    {formData.discount > 0 ? `${formData.discount}% off - Will show in Hot Deals!` : "No discount"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Stock *</Label>
                <Input
                  type="number"
                  value={formData.inventory}
                  onChange={(e) => setFormData((prev) => ({ ...prev, inventory: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Section */}
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="bg-blue-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" /> Shipping
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold">Shipping Time</Label>
                  <Input
                    value={formData.shippingTime}
                    onChange={(e) => handleInputChange("shippingTime", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Free Shipping</Label>
                  <Checkbox
                    checked={formData.freeShipping}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, freeShipping: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Shipping Charge (₹)</Label>
                  <Input
                    type="number"
                    value={formData.shippingCharge}
                    onChange={(e) => handleInputChange("shippingCharge", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Policy Section */}
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="bg-blue-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" /> Return Policy
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold">Return Days</Label>
                  <Input
                    value={formData.returnDays}
                    onChange={(e) => handleInputChange("returnDays", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Return Policy</Label>
                  <Textarea
                    value={formData.returnPolicy}
                    onChange={(e) => handleInputChange("returnPolicy", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Money Back Guarantee</Label>
                  <Checkbox
                    checked={formData.moneyBackGuarantee}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, moneyBackGuarantee: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty Section */}
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="bg-blue-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" /> Warranty
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold">Warranty</Label>
                  <Input value={formData.warranty} onChange={(e) => handleInputChange("warranty", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Warranty Period</Label>
                  <Input
                    value={formData.warrantyPeriod}
                    onChange={(e) => handleInputChange("warrantyPeriod", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Section */}
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="bg-blue-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" /> Tax
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold">GST (%)</Label>
                  <Input
                    type="number"
                    value={formData.gst}
                    onChange={(e) => handleInputChange("gst", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">HSN Code</Label>
                  <Input value={formData.hsn} onChange={(e) => handleInputChange("hsn", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensions Section */}
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="bg-blue-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" /> Dimensions
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold">Weight (kg)</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Length (cm)</Label>
                  <Input
                    type="number"
                    value={formData.length}
                    onChange={(e) => handleInputChange("length", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Width (cm)</Label>
                  <Input
                    type="number"
                    value={formData.width}
                    onChange={(e) => handleInputChange("width", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Height (cm)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COD Availability Section */}
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="bg-blue-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" /> COD Availability
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="space-y-2 flex items-center gap-2">
                <Checkbox
                  checked={formData.codAvailable}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, codAvailable: checked }))}
                  id="cod"
                />
                <Label htmlFor="cod" className="font-semibold">Cash On Delivery Available</Label>
              </div>
            </CardContent>
          </Card>

          {/* Packer Name Section */}
          <Card className="shadow-xl border-t-4 border-blue-600 rounded-xl">
            <CardHeader className="bg-blue-50 rounded-t-xl p-5 border-b">
              <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" /> Packer Name
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="font-semibold">Packer Name</Label>
                <Input value={formData.packerName} onChange={(e) => handleInputChange("packerName", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 text-lg rounded-xl shadow-xl"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/seller/product-details/${id}`)}
              className="px-8 py-6 text-lg rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}