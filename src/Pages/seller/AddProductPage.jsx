// "use client"

// import { useState, useRef } from "react"
// import { useNavigate, Link } from "react-router-dom"
// import { ArrowLeft, Upload, X, Loader2, ChevronRight, Check } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import { useAuth } from "@/context/AuthContext"
// import { toast, ToastContainer } from "react-toastify"
// import "react-toastify/dist/ReactToastify.css"

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// export default function AddProductPage() {
//   const navigate = useNavigate()
//   const { userToken } = useAuth()
//   const fileInputRef = useRef(null)

//   const [currentStep, setCurrentStep] = useState(1)
//   const [formData, setFormData] = useState({
//     // Basic Info
//     name: "",
//     genericName: "",
//     description: "",
//     brand: "",
//     category: "",
//     subcategory: "",

//     // Product Details
//     size: "",
//     color: "",
//     material: "",
//     pattern: "",
//     trends: "",
//     occasion: "",
//     compartments: "",
//     handles: "",
//     netQuantity: "",

//     // Pricing & Inventory
//     price: "",
//     originalPrice: "",
//     discount: "0",
//     stock: "",
//     sku: "",

//     // Tax & Compliance
//     gst: "18",
//     hsn: "",
//     countryOfOrigin: "India",

//     // Dimensions & Weight
//     weight: "",
//     length: "",
//     width: "",
//     height: "",
//     productDimensions: "",

//     // Manufacturer/Packer/Importer
//     manufacturerName: "",
//     manufacturerAddress: "",
//     manufacturerPincode: "",
//     packerName: "",
//     packerAddress: "",
//     packerPincode: "",
//     importerName: "",
//     importerAddress: "",
//     importerPincode: "",

//     // Shipping & Returns
//     shippingTime: "5-7 Days",
//     freeShipping: false,
//     shippingCharge: "0",
//     returnDays: "30",
//     returnPolicy: "30-day return policy available",
//     codAvailable: true,
//   })

//   const [images, setImages] = useState({
//     frontView: null,
//     backView: null,
//     sideView: null,
//     additional: [],
//   })

//   const [isLoading, setIsLoading] = useState(false)

//   const categories = [
//     { value: "Fashion", label: "Fashion" },
//     { value: "Electronics", label: "Electronics" },
//     { value: "Toys", label: "Toys" },
//     { value: "Kids", label: "Kids" },
//     { value: "Beauty", label: "Beauty & Health" },
//     { value: "Sports", label: "Sports & Fitness" },
//     { value: "Books", label: "Books" },
//     { value: "Accessories", label: "Accessories" },
//     { value: "Automotive", label: "Automotive" },
//   ]

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleImageUpload = (type, file) => {
//     if (type === "additional") {
//       if (images.additional.length >= 3) {
//         toast.warn("Maximum 3 additional images allowed")
//         return
//       }
//       setImages((prev) => ({
//         ...prev,
//         additional: [...prev.additional, file],
//       }))
//     } else {
//       setImages((prev) => ({ ...prev, [type]: file }))
//     }
//   }

//   const removeImage = (type, index = null) => {
//     if (type === "additional" && index !== null) {
//       setImages((prev) => ({
//         ...prev,
//         additional: prev.additional.filter((_, i) => i !== index),
//       }))
//     } else {
//       setImages((prev) => ({ ...prev, [type]: null }))
//     }
//   }

//   const validateStep = (step) => {
//     if (step === 1) {
//       const required = ["category"]
//       const missing = required.filter((f) => !formData[f])
//       if (missing.length) {
//         toast.error("Please select a category")
//         return false
//       }
//     } else if (step === 2) {
//       const required = ["name", "description", "price", "stock"]
//       const missing = required.filter((f) => !formData[f])
//       if (missing.length) {
//         toast.error(`Please fill: ${missing.join(", ")}`)
//         return false
//       }
//     }
//     return true
//   }

//   const nextStep = () => {
//     if (validateStep(currentStep)) {
//       setCurrentStep((prev) => Math.min(prev + 1, 3))
//     }
//   }

//   const prevStep = () => {
//     setCurrentStep((prev) => Math.max(prev - 1, 1))
//   }

//   const handleSubmit = async () => {
//     if (!validateStep(2)) return

//     if (!userToken) {
//       toast.error("Please login again")
//       navigate("/login")
//       return
//     }

//     setIsLoading(true)
//     const payload = new FormData()

//     // Add all images
//     const allImages = [images.frontView, images.backView, images.sideView, ...images.additional].filter(Boolean)
//     allImages.forEach((file) => payload.append("images", file))

//     // Add all form data
//     Object.entries(formData).forEach(([key, value]) => {
//       if (value !== "" && value !== null && value !== undefined) {
//         payload.append(key, value)
//       }
//     })

//     try {
//       const response = await fetch(`${API_BASE_URL}/sellers/products`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${userToken}` },
//         body: payload,
//       })

//       const data = await response.json()
//       if (!response.ok) return toast.error(data.message || "Failed to add product")

//       toast.success("Product added successfully!")
//       setTimeout(() => navigate("/seller/dashboard"), 1500)
//     } catch (error) {
//       toast.error("Network error while adding product")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const steps = [
//     { number: 1, title: "Select Category", subtitle: "Choose product category" },
//     { number: 2, title: "Add Product Details", subtitle: "Fill all product information" },
//     { number: 3, title: "Upload Images", subtitle: "Add product photos" },
//   ]

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans">
//       <ToastContainer position="top-right" autoClose={4000} />

//       {isLoading && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
//           <div className="flex items-center gap-3 bg-white px-8 py-5 rounded-2xl shadow-2xl">
//             <Loader2 className="animate-spin text-indigo-600 w-7 h-7" />
//             <p className="text-gray-800 font-semibold text-lg">Creating product...</p>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
//         <div className="max-w-6xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Link to="/seller/dashboard">
//                 <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
//                   <ArrowLeft className="h-5 w-5 text-gray-700" />
//                 </Button>
//               </Link>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Add Single Catalog</h1>
//                 <p className="text-sm text-gray-600 mt-0.5">Fill product details to list on your store</p>
//               </div>
//             </div>
//             <a
//               href="https://www.youtube.com/watch?v=example"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
//             >
//               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm3.5 10.5l-5 3.5V7l5 3.5z" />
//               </svg>
//               Learn to upload single catalog?
//             </a>
//           </div>

//           {/* Progress Steps */}
//           <div className="flex items-center justify-center gap-4 mt-6">
//             {steps.map((step, idx) => (
//               <div key={step.number} className="flex items-center">
//                 <div className="flex flex-col items-center">
//                   <div
//                     className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
//                       currentStep > step.number
//                         ? "bg-green-500 text-white"
//                         : currentStep === step.number
//                           ? "bg-indigo-600 text-white"
//                           : "bg-gray-200 text-gray-500"
//                     }`}
//                   >
//                     {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
//                   </div>
//                   <div className="text-center mt-2">
//                     <p
//                       className={`text-sm font-semibold ${
//                         currentStep >= step.number ? "text-gray-900" : "text-gray-500"
//                       }`}
//                     >
//                       {step.title}
//                     </p>
//                     <p className="text-xs text-gray-500">{step.subtitle}</p>
//                   </div>
//                 </div>
//                 {idx < steps.length - 1 && (
//                   <ChevronRight
//                     className={`w-6 h-6 mx-4 ${currentStep > step.number ? "text-green-500" : "text-gray-300"}`}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         {/* Step 1: Select Category */}
//         {currentStep === 1 && (
//           <Card className="shadow-lg border-0">
//             <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
//               <CardTitle className="text-xl font-bold text-gray-900">Search Category</CardTitle>
//             </CardHeader>
//             <CardContent className="p-8">
//               <div className="mb-6">
//                 <Input
//                   type="text"
//                   placeholder="Try Sarees, Toys, Charger, Mugs and more..."
//                   className="h-12 text-base border-2 border-gray-300 focus:border-indigo-500 rounded-lg"
//                 />
//               </div>

//               <div className="space-y-3">
//                 <div className="flex items-center gap-2 mb-4">
//                   <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">
//                     <span className="text-indigo-600 font-bold text-sm">★</span>
//                   </div>
//                   <h3 className="font-bold text-gray-900">Your Categories</h3>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   {categories.map((cat) => (
//                     <button
//                       key={cat.value}
//                       onClick={() => {
//                         handleInputChange("category", cat.value)
//                         nextStep()
//                       }}
//                       className={`flex items-center justify-between p-4 border-2 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition ${
//                         formData.category === cat.value ? "border-indigo-600 bg-indigo-50" : "border-gray-200 bg-white"
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
//                           <span className="text-2xl">{cat.value === "Fashion" ? "👕" : "📦"}</span>
//                         </div>
//                         <span className="font-semibold text-gray-900">{cat.label}</span>
//                       </div>
//                       <ChevronRight className="w-5 h-5 text-gray-400" />
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Step 2: Add Product Details */}
//         {currentStep === 2 && (
//           <div className="space-y-6">
//             {/* Product, Size and Inventory Section */}
//             <Card className="shadow-lg border-0">
//               <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
//                 <CardTitle className="text-lg font-bold text-gray-900">Product, Size and Inventory</CardTitle>
//               </CardHeader>
//               <CardContent className="p-6 space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">
//                       Product Name <span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       value={formData.name}
//                       onChange={(e) => handleInputChange("name", e.target.value)}
//                       placeholder="Enter Product Name"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Size</Label>
//                     <Select value={formData.size} onValueChange={(v) => handleInputChange("size", v)}>
//                       <SelectTrigger className="h-11 border-2">
//                         <SelectValue placeholder="Select" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="S">Small</SelectItem>
//                         <SelectItem value="M">Medium</SelectItem>
//                         <SelectItem value="L">Large</SelectItem>
//                         <SelectItem value="XL">Extra Large</SelectItem>
//                         <SelectItem value="Free Size">Free Size</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm font-semibold text-gray-700">
//                     Product Description <span className="text-red-500">*</span>
//                   </Label>
//                   <Textarea
//                     rows={4}
//                     value={formData.description}
//                     onChange={(e) => handleInputChange("description", e.target.value)}
//                     placeholder="Enter Description"
//                     className="border-2 focus:border-indigo-500 resize-none"
//                   />
//                   <p className="text-xs text-gray-500">0/1400</p>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">
//                       GST <span className="text-red-500">*</span>
//                     </Label>
//                     <Select value={formData.gst} onValueChange={(v) => handleInputChange("gst", v)}>
//                       <SelectTrigger className="h-11 border-2">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="0">0%</SelectItem>
//                         <SelectItem value="5">5%</SelectItem>
//                         <SelectItem value="12">12%</SelectItem>
//                         <SelectItem value="18">18%</SelectItem>
//                         <SelectItem value="28">28%</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">
//                       HSN Code <span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       value={formData.hsn}
//                       onChange={(e) => handleInputChange("hsn", e.target.value)}
//                       placeholder="Enter HSN Code"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                     <a href="#" className="text-xs text-indigo-600 hover:underline">
//                       Find Relevant HSN Code →
//                     </a>
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">
//                       Net Weight (gms) <span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       type="number"
//                       value={formData.weight}
//                       onChange={(e) => handleInputChange("weight", e.target.value)}
//                       placeholder="Enter Net Weight (gms)"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Style code/ Product ID (optional)</Label>
//                     <Input
//                       value={formData.sku}
//                       onChange={(e) => handleInputChange("sku", e.target.value)}
//                       placeholder="Enter Style code/ Product ID (optional)"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">
//                       Stock Quantity <span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       type="number"
//                       value={formData.stock}
//                       onChange={(e) => handleInputChange("stock", e.target.value)}
//                       placeholder="0"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Product Details Section */}
//             <Card className="shadow-lg border-0">
//               <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50">
//                 <CardTitle className="text-lg font-bold text-gray-900">Product Details</CardTitle>
//               </CardHeader>
//               <CardContent className="p-6 space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Trends</Label>
//                     <Input
//                       value={formData.trends}
//                       onChange={(e) => handleInputChange("trends", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Generic Name</Label>
//                     <Input
//                       value={formData.genericName}
//                       onChange={(e) => handleInputChange("genericName", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Compartment Closure</Label>
//                     <Input
//                       value={formData.compartments}
//                       onChange={(e) => handleInputChange("compartments", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Handles</Label>
//                     <Input
//                       value={formData.handles}
//                       onChange={(e) => handleInputChange("handles", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Net Quantity (N)</Label>
//                     <Input
//                       value={formData.netQuantity}
//                       onChange={(e) => handleInputChange("netQuantity", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Occasion</Label>
//                     <Input
//                       value={formData.occasion}
//                       onChange={(e) => handleInputChange("occasion", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Pattern</Label>
//                     <Input
//                       value={formData.pattern}
//                       onChange={(e) => handleInputChange("pattern", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Product Dimension Unit</Label>
//                     <Input
//                       value={formData.productDimensions}
//                       onChange={(e) => handleInputChange("productDimensions", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Product Height</Label>
//                     <Input
//                       type="number"
//                       value={formData.height}
//                       onChange={(e) => handleInputChange("height", e.target.value)}
//                       placeholder="Enter Product Height"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Product Length</Label>
//                     <Input
//                       type="number"
//                       value={formData.length}
//                       onChange={(e) => handleInputChange("length", e.target.value)}
//                       placeholder="Enter Product Length"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Product Width</Label>
//                     <Input
//                       type="number"
//                       value={formData.width}
//                       onChange={(e) => handleInputChange("width", e.target.value)}
//                       placeholder="Enter Product Width"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Country Of Origin</Label>
//                     <Input
//                       value={formData.countryOfOrigin}
//                       onChange={(e) => handleInputChange("countryOfOrigin", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Brand</Label>
//                     <Input
//                       value={formData.brand}
//                       onChange={(e) => handleInputChange("brand", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Color</Label>
//                     <Input
//                       value={formData.color}
//                       onChange={(e) => handleInputChange("color", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Material</Label>
//                     <Input
//                       value={formData.material}
//                       onChange={(e) => handleInputChange("material", e.target.value)}
//                       placeholder="Select"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Manufacturer/Packer/Importer Section */}
//             <Card className="shadow-lg border-0">
//               <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50">
//                 <CardTitle className="text-lg font-bold text-gray-900">
//                   Manufacturer / Packer / Importer Details
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-6 space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Manufacturer Name</Label>
//                     <Input
//                       value={formData.manufacturerName}
//                       onChange={(e) => handleInputChange("manufacturerName", e.target.value)}
//                       placeholder="Enter Manufacturer Name"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Manufacturer Address</Label>
//                     <Input
//                       value={formData.manufacturerAddress}
//                       onChange={(e) => handleInputChange("manufacturerAddress", e.target.value)}
//                       placeholder="Enter Manufacturer Address"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Manufacturer Pincode</Label>
//                     <Input
//                       value={formData.manufacturerPincode}
//                       onChange={(e) => handleInputChange("manufacturerPincode", e.target.value)}
//                       placeholder="Enter Manufacturer Pincode"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <Checkbox id="sameAsManufacturer" />
//                   <Label htmlFor="sameAsManufacturer" className="text-sm text-gray-700 cursor-pointer">
//                     Same as Manufacturer Details
//                   </Label>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Packer Name</Label>
//                     <Input
//                       value={formData.packerName}
//                       onChange={(e) => handleInputChange("packerName", e.target.value)}
//                       placeholder="Enter Packer Name"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Packer Address</Label>
//                     <Input
//                       value={formData.packerAddress}
//                       onChange={(e) => handleInputChange("packerAddress", e.target.value)}
//                       placeholder="Enter Packer Address"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Packer Pincode</Label>
//                     <Input
//                       value={formData.packerPincode}
//                       onChange={(e) => handleInputChange("packerPincode", e.target.value)}
//                       placeholder="Enter Packer Pincode"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Importer Name</Label>
//                     <Input
//                       value={formData.importerName}
//                       onChange={(e) => handleInputChange("importerName", e.target.value)}
//                       placeholder="Enter Importer Name"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Importer Address</Label>
//                     <Input
//                       value={formData.importerAddress}
//                       onChange={(e) => handleInputChange("importerAddress", e.target.value)}
//                       placeholder="Enter Importer Address"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Importer Pincode</Label>
//                     <Input
//                       value={formData.importerPincode}
//                       onChange={(e) => handleInputChange("importerPincode", e.target.value)}
//                       placeholder="Enter Importer Pincode"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Pricing Section */}
//             <Card className="shadow-lg border-0">
//               <CardHeader className="border-b bg-gradient-to-r from-rose-50 to-pink-50">
//                 <CardTitle className="text-lg font-bold text-gray-900">Pricing & Discount</CardTitle>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">
//                       Selling Price <span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       type="number"
//                       value={formData.price}
//                       onChange={(e) => handleInputChange("price", e.target.value)}
//                       placeholder="0"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">MRP / Original Price</Label>
//                     <Input
//                       type="number"
//                       value={formData.originalPrice}
//                       onChange={(e) => handleInputChange("originalPrice", e.target.value)}
//                       placeholder="0"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">Discount %</Label>
//                     <Input
//                       type="number"
//                       value={formData.discount}
//                       onChange={(e) => handleInputChange("discount", e.target.value)}
//                       placeholder="0"
//                       className="h-11 border-2 focus:border-indigo-500"
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Compliance Notice */}
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-gray-700 leading-relaxed">
//               By listing your products on Meesho's platform, you agree to comply with the applicable T&C of the
//               platform, as updated from time to time. You confirm that all product information, including labels,
//               claims, and disclosures etc., complies with the Legal Metrology Act, 2009, Bureau of Indian Standards Act,
//               2016 read with applicable Quality Control Orders, and all other applicable laws, rules and regulations.
//               You also confirm that you are authorized to list and sell your products and hold all necessary licenses,
//               registrations, and permits as required under applicable law. You accept full responsibility for your
//               listings, and Meesho bears no liability for any of your acts or omissions.
//             </div>
//           </div>
//         )}

//         {/* Step 3: Upload Images */}
//         {currentStep === 3 && (
//           <Card className="shadow-lg border-0">
//             <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-purple-50">
//               <CardTitle className="text-lg font-bold text-gray-900">Upload Product Images</CardTitle>
//               <p className="text-sm text-gray-600 mt-2">Follow guidelines to reduce quality check failure</p>
//             </CardHeader>
//             <CardContent className="p-6 space-y-6">
//               {/* Image Guidelines */}
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <h4 className="font-semibold text-gray-900 mb-2">Image Guidelines</h4>
//                 <ul className="text-sm text-gray-700 space-y-1">
//                   <li>1. Images with text/Watermark are not acceptable in primary images.</li>
//                   <li>2. Product image should not have any text</li>
//                   <li>3. Please add solo product image without any props.</li>
//                 </ul>
//                 <a href="#" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
//                   View Full Image Guidelines →
//                 </a>
//               </div>

//               {/* Image Upload Sections */}
//               <div className="space-y-4">
//                 <div className="text-sm font-semibold text-gray-700 mb-3">Add images with details listed here</div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* Front View */}
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">
//                       Front View <span className="text-red-500">*</span>
//                     </Label>
//                     <div className="relative">
//                       {!images.frontView ? (
//                         <label
//                           htmlFor="frontView"
//                           className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition"
//                         >
//                           <Upload className="w-8 h-8 text-gray-400 mb-2" />
//                           <p className="text-sm text-gray-600">Upload front view image</p>
//                           <input
//                             id="frontView"
//                             type="file"
//                             accept="image/*"
//                             className="hidden"
//                             onChange={(e) => e.target.files[0] && handleImageUpload("frontView", e.target.files[0])}
//                           />
//                         </label>
//                       ) : (
//                         <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-green-500">
//                           <img
//                             src={URL.createObjectURL(images.frontView) || "/placeholder.svg"}
//                             alt="Front view"
//                             className="w-full h-full object-cover"
//                           />
//                           <button
//                             onClick={() => removeImage("frontView")}
//                             className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Back View */}
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">
//                       Back View <span className="text-red-500">*</span>
//                     </Label>
//                     <div className="relative">
//                       {!images.backView ? (
//                         <label
//                           htmlFor="backView"
//                           className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition"
//                         >
//                           <Upload className="w-8 h-8 text-gray-400 mb-2" />
//                           <p className="text-sm text-gray-600">Upload Back View Image</p>
//                           <input
//                             id="backView"
//                             type="file"
//                             accept="image/*"
//                             className="hidden"
//                             onChange={(e) => e.target.files[0] && handleImageUpload("backView", e.target.files[0])}
//                           />
//                         </label>
//                       ) : (
//                         <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-green-500">
//                           <img
//                             src={URL.createObjectURL(images.backView) || "/placeholder.svg"}
//                             alt="Back view"
//                             className="w-full h-full object-cover"
//                           />
//                           <button
//                             onClick={() => removeImage("backView")}
//                             className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Side View */}
//                   <div className="space-y-2">
//                     <Label className="text-sm font-semibold text-gray-700">
//                       Side View <span className="text-red-500">*</span>
//                     </Label>
//                     <div className="relative">
//                       {!images.sideView ? (
//                         <label
//                           htmlFor="sideView"
//                           className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition"
//                         >
//                           <Upload className="w-8 h-8 text-gray-400 mb-2" />
//                           <p className="text-sm text-gray-600">Upload side view angle</p>
//                           <input
//                             id="sideView"
//                             type="file"
//                             accept="image/*"
//                             className="hidden"
//                             onChange={(e) => e.target.files[0] && handleImageUpload("sideView", e.target.files[0])}
//                           />
//                         </label>
//                       ) : (
//                         <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-green-500">
//                           <img
//                             src={URL.createObjectURL(images.sideView) || "/placeholder.svg"}
//                             alt="Side view"
//                             className="w-full h-full object-cover"
//                           />
//                           <button
//                             onClick={() => removeImage("sideView")}
//                             className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Uploaded Images Section */}
//                 {images.additional.length > 0 && (
//                   <div className="mt-6">
//                     <Label className="text-sm font-semibold text-gray-700 mb-3 block">Uploaded Images</Label>
//                     <div className="flex gap-4 flex-wrap">
//                       {images.additional.map((file, idx) => (
//                         <div
//                           key={idx}
//                           className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300"
//                         >
//                           <img
//                             src={URL.createObjectURL(file) || "/placeholder.svg"}
//                             alt={`Additional ${idx + 1}`}
//                             className="w-full h-full object-cover"
//                           />
//                           <button
//                             onClick={() => removeImage("additional", idx)}
//                             className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full"
//                           >
//                             <X className="w-3 h-3" />
//                           </button>
//                         </div>
//                       ))}

//                       {images.additional.length < 3 && (
//                         <label
//                           htmlFor="additionalImages"
//                           className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer"
//                         >
//                           <div className="text-center">
//                             <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
//                             <p className="text-xs text-indigo-600 font-semibold">+ Add Images</p>
//                           </div>
//                           <input
//                             id="additionalImages"
//                             type="file"
//                             accept="image/*"
//                             className="hidden"
//                             onChange={(e) => e.target.files[0] && handleImageUpload("additional", e.target.files[0])}
//                           />
//                         </label>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* Front Image Section */}
//                 {!images.additional.length && (
//                   <div className="mt-6">
//                     <Label className="text-sm font-semibold text-gray-700 mb-3 block">
//                       Front Image <span className="text-red-500">*</span>
//                     </Label>
//                     <p className="text-xs text-gray-600 mb-2">Please provide only front image for each product</p>
//                     <div className="flex items-center gap-4">
//                       <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
//                         {images.frontView ? (
//                           <img
//                             src={URL.createObjectURL(images.frontView) || "/placeholder.svg"}
//                             alt="Front"
//                             className="w-full h-full object-cover rounded-lg"
//                           />
//                         ) : (
//                           <div className="text-center text-gray-400 text-xs">Front Image</div>
//                         )}
//                       </div>
//                       <label
//                         htmlFor="additionalImages"
//                         className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-indigo-400 rounded-lg hover:bg-indigo-50 cursor-pointer"
//                       >
//                         <Upload className="w-8 h-8 text-indigo-600 mb-2" />
//                         <p className="text-sm text-indigo-600 font-semibold">+ Add Images</p>
//                         <input
//                           id="additionalImages"
//                           type="file"
//                           accept="image/*"
//                           className="hidden"
//                           onChange={(e) => e.target.files[0] && handleImageUpload("additional", e.target.files[0])}
//                         />
//                       </label>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Navigation Buttons */}
//         <div className="flex items-center justify-between mt-8 pb-8">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={currentStep === 1 ? () => navigate("/seller/dashboard") : prevStep}
//             className="px-8 h-12 text-base font-semibold border-2"
//           >
//             {currentStep === 1 ? "Discard Catalog" : "Go Back"}
//           </Button>

//           {currentStep < 3 ? (
//             <Button
//               type="button"
//               onClick={nextStep}
//               className="px-10 h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
//             >
//               Continue
//             </Button>
//           ) : (
//             <Button
//               type="button"
//               onClick={handleSubmit}
//               disabled={isLoading}
//               className="px-10 h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
//             >
//               {isLoading ? "Submitting..." : "Submit Catalog"}
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
