import { useState, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Upload, X, Loader2, Package, Info, Truck, FileText, MapPin, User } from "lucide-react"
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

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"

const CATEGORIES = ["Fashion", "Electronics", "Toys", "Kids", "Beauty", "Sports", "Books", "Accessories", "Automotive"]

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size"]
const CLOSURES = ["Snap", "Zipper", "Button", "Velcro", "Drawstring", "None"]
const MATERIALS = ["Cotton", "Polyester", "Silk", "Wool", "Leather", "Denim", "Linen", "Synthetic"]

const CustomInput = (props) => (
  <Input
    {...props}
    className="w-full border-2 border-gray-300 bg-white rounded-lg h-11 text-gray-900 placeholder:text-gray-400 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
  />
)

const CustomTextarea = (props) => (
  <Textarea
    {...props}
    className="w-full border-2 border-gray-300 bg-white rounded-lg text-gray-900 placeholder:text-gray-400 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all p-3"
  />
)

const CustomSelectTrigger = (props) => (
  <SelectTrigger
    {...props}
    className="w-full border-2 border-gray-300 bg-white rounded-lg h-11 text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
  />
)

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex gap-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        className={`flex-1 h-2 rounded-full transition-all ${
          i < currentStep ? "bg-blue-600" : i === currentStep ? "bg-blue-400" : "bg-gray-300"
        }`}
      />
    ))}
  </div>
)

export default function AddProductForm() {
  const navigate = useNavigate()
  const { userToken } = useAuth()
  const fileInputRef = useRef(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState({
    main: [],
    front: null,
    back: null,
    side: null,
    top: null,
  })

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",

    // Step 2: Product Details
    size: "",
    color: "",
    material: "",
    pattern: "",
    trend: "",
    genericName: "",
    compartments: "",
    handles: "",
    closure: "",
    includedComponents: "",

    // Step 3: Pricing & Inventory
    price: "",
    originalPrice: "",
    discount: "0",
    gstRate: "18",
    hsnCode: "",
    stock: "",
    sku: "",

    // Step 4: Dimensions & Shipping
    weight: "",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "cm",
    shippingTime: "5-7 Days",
    freeShipping: false,
    shippingCharge: "0",

    // Step 5: Manufacturer Info
    manufacturerName: "",
    manufacturerAddress: "",
    manufacturerPincode: "",
    manufacturerCountry: "India",
    packerName: "",
    packerAddress: "",
    packerPincode: "",
    importerName: "",
    importerAddress: "",
    importerPincode: "",

    // Step 6: Returns & Warranty
    returnDays: "30",
    returnPolicy: "30-day return policy available",
    moneyBackGuarantee: true,
    warranty: "No warranty",
    warrantyPeriod: "",
    codAvailable: true,
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e, viewType = "main") => {
    const files = Array.from(e.target.files)

    if (viewType === "main") {
      if (files.length + images.main.length > 5) {
        toast.warn("Maximum 5 main images allowed")
        return
      }
      setImages((prev) => ({ ...prev, main: [...prev.main, ...files] }))
    } else {
      setImages((prev) => ({ ...prev, [viewType]: files[0] }))
    }

    e.target.value = null
  }

  const removeImage = (index) => {
    setImages((prev) => ({ ...prev, main: prev.main.filter((_, i) => i !== index) }))
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const validateStep = (step) => {
    const required = {
      0: ["name", "description", "category", "brand"],
      1: ["size", "color", "material"],
      2: ["price", "stock"],
      3: ["weight"],
      4: ["manufacturerName"],
      5: [],
    }

    const missing = (required[step] || []).filter((field) => !formData[field])

    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`)
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!userToken) {
      toast.error("Please login again")
      navigate("/login")
      return
    }

    setIsLoading(true)
    const payload = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value)
    })

    images.main.forEach((file) => payload.append("images", file))
    if (images.front) payload.append("images", images.front)
    if (images.back) payload.append("images", images.back)
    if (images.side) payload.append("images", images.side)
    if (images.top) payload.append("images", images.top)

    try {
      const response = await fetch(`${API_BASE_URL}/sellers/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
        body: payload,
      })

      const data = await response.json()

      if (!response.ok) {
        return toast.error(data.message || "Failed to add product")
      }

      toast.success("Product added successfully!")
      navigate("/seller/dashboard")
    } catch (error) {
      toast.error("Network error: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      title: "Basic Information",
      icon: <Info className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <CustomInput
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Premium Cotton T-Shirt"
              />
            </div>
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">
                Brand <span className="text-red-500">*</span>
              </Label>
              <CustomInput
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                placeholder="e.g., Nike, Adidas"
              />
            </div>
          </div>

          <div>
            <Label className="font-semibold text-gray-700 mb-2 block">
              Description <span className="text-red-500">*</span>
            </Label>
            <CustomTextarea
              rows={5}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe features, material, care instructions..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}>
                <CustomSelectTrigger>
                  <SelectValue placeholder="Select category" />
                </CustomSelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Subcategory</Label>
              <CustomInput
                value={formData.subcategory}
                onChange={(e) => handleInputChange("subcategory", e.target.value)}
                placeholder="e.g., Men's T-Shirts"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Product Details",
      icon: <Package className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">
                Size <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.size} onValueChange={(v) => handleInputChange("size", v)}>
                <CustomSelectTrigger>
                  <SelectValue placeholder="Select size" />
                </CustomSelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">
                Color <span className="text-red-500">*</span>
              </Label>
              <CustomInput
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                placeholder="e.g., Black, Blue"
              />
            </div>

            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">
                Material <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.material} onValueChange={(v) => handleInputChange("material", v)}>
                <CustomSelectTrigger>
                  <SelectValue placeholder="Select material" />
                </CustomSelectTrigger>
                <SelectContent>
                  {MATERIALS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Pattern</Label>
              <CustomInput
                value={formData.pattern}
                onChange={(e) => handleInputChange("pattern", e.target.value)}
                placeholder="e.g., Striped, Solid"
              />
            </div>
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Trend</Label>
              <CustomInput
                value={formData.trend}
                onChange={(e) => handleInputChange("trend", e.target.value)}
                placeholder="e.g., Casual, Formal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Generic Name</Label>
              <CustomInput
                value={formData.genericName}
                onChange={(e) => handleInputChange("genericName", e.target.value)}
                placeholder="e.g., Cotton T-Shirt"
              />
            </div>
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Compartments</Label>
              <CustomInput
                type="number"
                value={formData.compartments}
                onChange={(e) => handleInputChange("compartments", e.target.value)}
                placeholder="e.g., 3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Handles/Straps</Label>
              <CustomInput
                value={formData.handles}
                onChange={(e) => handleInputChange("handles", e.target.value)}
                placeholder="e.g., Long handles"
              />
            </div>
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Closure Type</Label>
              <Select value={formData.closure} onValueChange={(v) => handleInputChange("closure", v)}>
                <CustomSelectTrigger>
                  <SelectValue placeholder="Select closure" />
                </CustomSelectTrigger>
                <SelectContent>
                  {CLOSURES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="font-semibold text-gray-700 mb-2 block">Included Components</Label>
            <CustomInput
              value={formData.includedComponents}
              onChange={(e) => handleInputChange("includedComponents", e.target.value)}
              placeholder="e.g., Shirt, Care label"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Pricing & Inventory",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">
                Price (₹) <span className="text-red-500">*</span>
              </Label>
              <CustomInput
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Original Price (₹)</Label>
              <CustomInput
                type="number"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Discount (%)</Label>
              <CustomInput
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">GST Rate (%)</Label>
              <CustomInput
                type="number"
                value={formData.gstRate}
                onChange={(e) => handleInputChange("gstRate", e.target.value)}
                placeholder="18"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">HSN Code</Label>
              <CustomInput
                value={formData.hsnCode}
                onChange={(e) => handleInputChange("hsnCode", e.target.value)}
                placeholder="e.g., 6204"
              />
            </div>
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">
                Stock <span className="text-red-500">*</span>
              </Label>
              <CustomInput
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label className="font-semibold text-gray-700 mb-2 block">SKU</Label>
            <CustomInput
              value={formData.sku}
              onChange={(e) => handleInputChange("sku", e.target.value)}
              placeholder="Optional: Auto-generated if empty"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Dimensions & Shipping",
      icon: <Truck className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Physical Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">
                  Weight (g) <span className="text-red-500">*</span>
                </Label>
                <CustomInput
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Length</Label>
                <CustomInput
                  type="number"
                  value={formData.length}
                  onChange={(e) => handleInputChange("length", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Width</Label>
                <CustomInput
                  type="number"
                  value={formData.width}
                  onChange={(e) => handleInputChange("width", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Height</Label>
                <CustomInput
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Unit</Label>
                <Select value={formData.dimensionUnit} onValueChange={(v) => handleInputChange("dimensionUnit", v)}>
                  <CustomSelectTrigger>
                    <SelectValue />
                  </CustomSelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="inch">inch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Shipping Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Shipping Time</Label>
                <CustomInput
                  value={formData.shippingTime}
                  onChange={(e) => handleInputChange("shippingTime", e.target.value)}
                  placeholder="e.g., 5-7 Days"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Shipping Charge (₹)</Label>
                <CustomInput
                  type="number"
                  value={formData.shippingCharge}
                  onChange={(e) => handleInputChange("shippingCharge", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Checkbox
                checked={formData.freeShipping}
                onCheckedChange={(v) => handleInputChange("freeShipping", v)}
                id="freeShipping"
              />
              <Label htmlFor="freeShipping" className="font-semibold text-gray-700 cursor-pointer">
                Offer Free Shipping
              </Label>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Manufacturer & Packer Info",
      icon: <MapPin className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Manufacturer Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">
                  Manufacturer Name <span className="text-red-500">*</span>
                </Label>
                <CustomInput
                  value={formData.manufacturerName}
                  onChange={(e) => handleInputChange("manufacturerName", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Address</Label>
                <CustomInput
                  value={formData.manufacturerAddress}
                  onChange={(e) => handleInputChange("manufacturerAddress", e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="font-semibold text-gray-700 mb-2 block">Pincode</Label>
                  <CustomInput
                    value={formData.manufacturerPincode}
                    onChange={(e) => handleInputChange("manufacturerPincode", e.target.value)}
                    placeholder="6-digit pincode"
                  />
                </div>
                <div>
                  <Label className="font-semibold text-gray-700 mb-2 block">Country</Label>
                  <CustomInput
                    value={formData.manufacturerCountry}
                    onChange={(e) => handleInputChange("manufacturerCountry", e.target.value)}
                    placeholder="India"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Packer Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Packer Name</Label>
                <CustomInput
                  value={formData.packerName}
                  onChange={(e) => handleInputChange("packerName", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Address</Label>
                <CustomInput
                  value={formData.packerAddress}
                  onChange={(e) => handleInputChange("packerAddress", e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Pincode</Label>
                <CustomInput
                  value={formData.packerPincode}
                  onChange={(e) => handleInputChange("packerPincode", e.target.value)}
                  placeholder="6-digit pincode"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Importer Information (Optional)
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Importer Name</Label>
                <CustomInput
                  value={formData.importerName}
                  onChange={(e) => handleInputChange("importerName", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Address</Label>
                <CustomInput
                  value={formData.importerAddress}
                  onChange={(e) => handleInputChange("importerAddress", e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Pincode</Label>
                <CustomInput
                  value={formData.importerPincode}
                  onChange={(e) => handleInputChange("importerPincode", e.target.value)}
                  placeholder="6-digit pincode"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Returns & Warranty",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Return Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Return Days</Label>
                <CustomInput
                  type="number"
                  value={formData.returnDays}
                  onChange={(e) => handleInputChange("returnDays", e.target.value)}
                  placeholder="30"
                />
              </div>
              <div className="flex items-end pb-2">
                <Checkbox
                  checked={formData.moneyBackGuarantee}
                  onCheckedChange={(v) => handleInputChange("moneyBackGuarantee", v)}
                  id="moneyBack"
                />
                <Label htmlFor="moneyBack" className="font-semibold text-gray-700 cursor-pointer ml-3">
                  Money Back Guarantee
                </Label>
              </div>
            </div>
            <div>
              <Label className="font-semibold text-gray-700 mb-2 block">Return Policy Description</Label>
              <CustomTextarea
                rows={3}
                value={formData.returnPolicy}
                onChange={(e) => handleInputChange("returnPolicy", e.target.value)}
                placeholder="Describe your return policy..."
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Warranty</h3>
            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Warranty</Label>
                <CustomInput
                  value={formData.warranty}
                  onChange={(e) => handleInputChange("warranty", e.target.value)}
                  placeholder="e.g., 1-year manufacturer warranty"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-700 mb-2 block">Warranty Period</Label>
                <CustomInput
                  value={formData.warrantyPeriod}
                  onChange={(e) => handleInputChange("warrantyPeriod", e.target.value)}
                  placeholder="e.g., 12 months"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex items-center gap-3">
            <Checkbox
              checked={formData.codAvailable}
              onCheckedChange={(v) => handleInputChange("codAvailable", v)}
              id="codAvailable"
            />
            <Label htmlFor="codAvailable" className="font-semibold text-gray-700 cursor-pointer">
              Cash on Delivery Available
            </Label>
          </div>
        </div>
      ),
    },
    {
      title: "Product Images",
      icon: <Upload className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Main Images (up to 5)</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-4">Click or drag images here</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(e, "main")}
                className="hidden"
                ref={fileInputRef}
              />
              <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
                Upload Images
              </Button>
            </div>

            {images.main.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {images.main.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`preview-${i}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Product Views (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "front", label: "Front View" },
                { key: "back", label: "Back View" },
                { key: "side", label: "Side View" },
                { key: "top", label: "Top View" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label className="font-semibold text-gray-700 mb-2 block">{label}</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, key)}
                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                  />
                  {images[key] && (
                    <img
                      src={URL.createObjectURL(images[key]) || "/placeholder.svg"}
                      alt={key}
                      className="w-full h-32 object-cover rounded-lg mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      <ToastContainer position="top-right" autoClose={4000} />

      {isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-xl shadow-xl">
            <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
            <p className="text-gray-700 font-semibold">Publishing product...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-300">
          <Link to="/seller/dashboard">
            <Button variant="outline" size="icon" className="rounded-full bg-transparent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Add New Product</h1>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={steps.length} />

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-t-4 border-blue-600 rounded-xl shadow-lg">
            <CardHeader className="bg-blue-50 rounded-t-xl p-6 border-b">
              <div className="flex items-center gap-3">
                {steps[currentStep].icon}
                <CardTitle className="text-xl font-extrabold text-gray-900">{steps[currentStep].title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">{steps[currentStep].content}</CardContent>
          </Card>

          <div className="flex gap-4 justify-between">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              variant="outline"
              className="px-8 py-2 h-12 bg-transparent"
              type="button"
            >
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {isLoading ? "Publishing..." : "Publish Product"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="px-8 py-2 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                type="button"
              >
                Next Step
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}