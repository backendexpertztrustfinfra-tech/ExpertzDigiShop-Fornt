// "use client"

// import { useState, useRef } from "react"
// import { useNavigate, Link } from "react-router-dom"
// import {
//   ArrowLeft,
//   Upload,
//   Package,
//   Info,
//   ChevronRight,
//   Search,
//   Plus,
//   HelpCircle,
//   AlertCircle,
//   X,
//   Check,
//   Calculator,
//   Trash2,
// } from "lucide-react"
// import { Button } from "@/Components/ui/button"
// import { Input } from "@/Components/ui/input"
// import { Label } from "@/Components/ui/label"
// import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
// import { Checkbox } from "@/Components/ui/checkbox"
// import { Textarea } from "@/Components/ui/textarea"
// import { useAuth } from "@/context/AuthContext"
// import { toast } from "react-toastify"
// import { ToastContainer } from "react-toastify"

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// const CATEGORY_STRUCTURE = {
//   "Women Fashion": {
//     Accessories: {
//       "Caps & Hats": ["Caps", "Hats"],
//       "Fashion Accessories": ["Belts", "Scarves"],
//       Jewellery: ["Earrings", "Necklaces"],
//     },
//     "Ethnic Wear": ["Sarees", "Kurtas", "Lehengas"],
//   },
//   "Industrial & Scientific Products": {
//     "Abrasive & Finishing Products": {
//       "Abrasive Accessories": ["Abrasive Belts", "Abrasive Wheels & Discs"],
//     },
//   },
//   Kids: {
//     Toys: {
//       Unisex: {
//         Puzzles: ["Educational Toys", "3D Puzzles"],
//       },
//     },
//   },
//   "Home & Kitchen": {
//     "Kitchen & Dining": {
//       Dinnerware: ["Dinner Sets", "Tea Pots", "Sugar Pots"],
//     },
//   },
// }

// const FormInput = ({ label, required, helpText, error, ...props }) => (
//   <div className="space-y-1.5">
//     <div className="flex items-center gap-1">
//       <Label className="text-[12px] font-bold text-gray-600 uppercase tracking-tight">
//         {label} {required && <span className="text-red-500 font-bold">*</span>}
//       </Label>
//       {helpText && (
//         <div className="group relative">
//           <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
//           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] p-2 rounded w-40 z-10">
//             {helpText}
//           </div>
//         </div>
//       )}
//     </div>
//     <Input
//       {...props}
//       className={`w-full border-gray-300 bg-white rounded h-10 text-[14px] font-medium focus:ring-1 focus:ring-blue-500 transition-all border shadow-sm ${error ? "border-red-500 ring-red-100" : ""}`}
//     />
//   </div>
// )

// const FormSelect = ({ label, required, options, value, onChange, placeholder }) => (
//   <div className="space-y-1.5">
//     <Label className="text-[12px] font-bold text-gray-600 uppercase tracking-tight">
//       {label} {required && <span className="text-red-500 font-bold">*</span>}
//     </Label>
//     <Select value={value} onValueChange={onChange}>
//       <SelectTrigger className="w-full border-gray-300 bg-white rounded h-10 text-[14px] font-medium border shadow-sm">
//         <SelectValue placeholder={placeholder} />
//       </SelectTrigger>
//       <SelectContent>
//         {options.map((opt) => (
//           <SelectItem key={opt.value} value={opt.value} className="text-sm">
//             {opt.label}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   </div>
// )

// export default function AddProductCatalog() {
//   const navigate = useNavigate()
//   const { userToken } = useAuth()
//   const fileInputRef = useRef(null)

//   const [step, setStep] = useState(1) // 1: Category, 2: Details
//   const [isLoading, setIsLoading] = useState(false)

//   // Category Selection State
//   const [catPath, setCatPath] = useState([])
//   const [searchQuery, setSearchQuery] = useState("")

//   // Catalog Management State
//   const [catalogItems, setCatalogItems] = useState([
//     {
//       id: Date.now(),
//       name: "",
//       description: "",
//       price: "",
//       originalPrice: "",
//       gst: "18",
//       hsn: "",
//       weight: "",
//       styleCode: "",
//       brand: "",
//       images: [],
//       previewImages: [],
//       variants: [{ size: "Free Size", stock: "", price: "", mrp: "", sku: "" }],
//       attributes: { color: "", material: "", pattern: "", trend: "" },
//     },
//   ])
//   const [activeItemIndex, setActiveItemIndex] = useState(0)
//   const [copyToAll, setCopyToAll] = useState(false)

//   const activeItem = catalogItems[activeItemIndex]

//   const updateActiveItem = (updates) => {
//     const newItems = [...catalogItems]
//     newItems[activeItemIndex] = { ...newItems[activeItemIndex], ...updates }

//     // If copyToAll is on, sync common fields
//     if (copyToAll) {
//       const commonFields = ["gst", "hsn", "brand", "attributes"]
//       newItems.forEach((item, idx) => {
//         if (idx !== activeItemIndex) {
//           commonFields.forEach((field) => {
//             item[field] = newItems[activeItemIndex][field]
//           })
//         }
//       })
//     }
//     setCatalogItems(newItems)
//   }

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files)
//     if (!files.length) return

//     const newPreviewImages = files.map((file) => URL.createObjectURL(file))
//     updateActiveItem({
//       images: [...activeItem.images, ...files],
//       previewImages: [...activeItem.previewImages, ...newPreviewImages],
//     })
//   }

//   const removeImage = (idx) => {
//     const newImages = activeItem.images.filter((_, i) => i !== idx)
//     const newPreviews = activeItem.previewImages.filter((_, i) => i !== idx)
//     updateActiveItem({ images: newImages, previewImages: newPreviews })
//   }

//   const addVariant = () => {
//     const newVariants = [...activeItem.variants, { size: "", stock: "", price: "", mrp: "", sku: "" }]
//     updateActiveItem({ variants: newVariants })
//   }

//   const updateVariant = (idx, field, value) => {
//     const newVariants = [...activeItem.variants]
//     newVariants[idx][field] = value
//     updateActiveItem({ variants: newVariants })
//   }

//   const addNewProductToCatalog = () => {
//     setCatalogItems([
//       ...catalogItems,
//       {
//         id: Date.now(),
//         name: "",
//         description: "",
//         price: "",
//         originalPrice: "",
//         gst: catalogItems[0].gst,
//         hsn: catalogItems[0].hsn,
//         weight: "",
//         styleCode: "",
//         brand: catalogItems[0].brand,
//         images: [],
//         previewImages: [],
//         variants: [{ size: "Free Size", stock: "", price: "", mrp: "", sku: "" }],
//         attributes: { ...catalogItems[0].attributes },
//       },
//     ])
//     setActiveItemIndex(catalogItems.length)
//   }

//   const calculateSettlement = (price) => {
//     const val = Number.parseFloat(price) || 0
//     const gstVal = val * (Number.parseFloat(activeItem.gst) / 100)
//     // Simplified settlement calculation matching Meesho breakdown
//     const tcsTds = val * 0.02 // Approx 2% for TCS/TDS
//     return (val - gstVal - tcsTds).toFixed(2)
//   }

//   const handleSubmit = async () => {
//     if (!userToken) return toast.error("Please login first")

//     setIsLoading(true)
//     try {
//       // Logic from your original code (add-product-form-R4VeK.tsx)
//       // We process each item in the catalog
//       for (const item of catalogItems) {
//         const formData = new FormData()
//         formData.append("name", item.name)
//         formData.append("description", item.description)
//         formData.append("price", item.variants[0].price || item.price)
//         formData.append("originalPrice", item.variants[0].mrp || item.originalPrice)
//         formData.append("category", catPath[0])
//         formData.append("subcategory", catPath[catPath.length - 1])
//         formData.append("gst", item.gst)
//         formData.append("hsn", item.hsn)
//         formData.append("weight", item.weight)
//         formData.append("brand", item.brand)
//         formData.append("variants", JSON.stringify(item.variants))

//         item.images.forEach((img) => formData.append("images", img))

//         const res = await fetch(`${API_BASE_URL}/sellers/products`, {
//           method: "POST",
//           headers: { Authorization: `Bearer ${userToken}` },
//           body: formData,
//         })

//         if (!res.ok) throw new Error(`Failed to add ${item.name || "product"}`)
//       }

//       toast.success("All products in catalog submitted successfully!")
//       navigate("/seller/dashboard")
//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const renderCategoryColumn = (data, depth) => {
//     const keys = Array.isArray(data) ? data : Object.keys(data)
//     return (
//       <div className="border-r h-full overflow-y-auto p-1 bg-white">
//         {depth === 0 && (
//           <div className="px-4 py-3 text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
//             Your Categories
//           </div>
//         )}
//         {keys.map((key) => (
//           <button
//             key={key}
//             onClick={() => {
//               const newPath = catPath.slice(0, depth)
//               newPath[depth] = key
//               setCatPath(newPath)
//             }}
//             className={`w-full text-left px-4 py-2.5 rounded text-sm transition-all flex items-center justify-between group ${
//               catPath[depth] === key ? "bg-blue-600 text-white font-bold" : "text-gray-700 hover:bg-gray-50"
//             }`}
//           >
//             {key}
//             {!Array.isArray(data) && typeof data[key] === "object" && (
//               <ChevronRight
//                 className={`h-3.5 w-3.5 ${catPath[depth] === key ? "text-white" : "text-gray-300 group-hover:text-blue-400"}`}
//               />
//             )}
//           </button>
//         ))}
//       </div>
//     )
//   }

//   const getCurrentLevelData = () => {
//     let current = CATEGORY_STRUCTURE
//     for (let i = 0; i < catPath.length; i++) {
//       if (current[catPath[i]]) {
//         current = current[catPath[i]]
//       }
//     }
//     return current
//   }

//   return (
//     <div className="min-h-screen bg-[#F0F2F5] selection:bg-blue-100">
//       {/* Sticky Top Header */}
//       <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-[60] shadow-sm">
//         <div className="flex items-center gap-6">
//           <Link to="/seller/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//             <ArrowLeft className="h-5 w-5 text-gray-700" />
//           </Link>
//           <div className="flex flex-col">
//             <h1 className="text-xl font-extrabold text-[#2E3192] tracking-tight">Add Single Catalog</h1>
//             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Step {step} of 2</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-4">
//           <Button variant="ghost" className="text-blue-600 font-bold gap-2 text-sm hover:bg-blue-50">
//             <HelpCircle className="h-4 w-4" /> Need Help?
//           </Button>
//           <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-2 rounded border border-red-100 shadow-sm cursor-pointer hover:bg-red-100 transition-colors">
//             <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
//             <span className="text-xs font-bold uppercase tracking-wider">Watch Tutorial</span>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-[1440px] mx-auto px-8 py-8">
//         {/* Step Indicator */}
//         <div className="flex items-center gap-0 mb-10 bg-white p-1 rounded-lg border shadow-sm w-fit">
//           <button
//             onClick={() => setStep(1)}
//             className={`flex items-center gap-3 px-8 py-3 rounded-md transition-all ${
//               step === 1 ? "bg-[#2E3192] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
//             }`}
//           >
//             <div
//               className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
//                 step === 1 ? "bg-white text-[#2E3192]" : "bg-gray-200"
//               }`}
//             >
//               1
//             </div>
//             <span className="font-bold text-sm tracking-tight uppercase">Select Category</span>
//           </button>
//           <button
//             disabled={!catPath.length}
//             onClick={() => setStep(2)}
//             className={`flex items-center gap-3 px-8 py-3 rounded-md transition-all ${
//               step === 2 ? "bg-[#2E3192] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
//             }`}
//           >
//             <div
//               className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
//                 step === 2 ? "bg-white text-[#2E3192]" : "bg-gray-200"
//               }`}
//             >
//               2
//             </div>
//             <span className="font-bold text-sm tracking-tight uppercase">Add Product Details</span>
//           </button>
//         </div>

//         {step === 1 ? (
//           /* STEP 1: DRILL DOWN CATEGORY UI */
//           <div className="bg-white rounded-xl border shadow-xl min-h-[600px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <div className="p-8 border-b bg-gray-50/50">
//               <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
//                 <Search className="h-5 w-5 text-blue-600" /> Search Category
//               </h2>
//               <div className="relative max-w-2xl group">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
//                 <Input
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Try Sarees, Toys, Charger, Mugs and more..."
//                   className="pl-12 h-14 border-gray-300 rounded-xl text-lg shadow-sm focus:ring-4 focus:ring-blue-100 transition-all"
//                 />
//               </div>
//             </div>

//             <div className="flex-1 grid grid-cols-5 h-full divide-x">
//               {renderCategoryColumn(CATEGORY_STRUCTURE, 0)}
//               {catPath[0] && renderCategoryColumn(CATEGORY_STRUCTURE[catPath[0]], 1)}
//               {catPath[1] && renderCategoryColumn(CATEGORY_STRUCTURE[catPath[0]][catPath[1]], 2)}
//               {catPath[2] &&
//                 Array.isArray(CATEGORY_STRUCTURE[catPath[0]][catPath[1]][catPath[2]]) &&
//                 renderCategoryColumn(CATEGORY_STRUCTURE[catPath[0]][catPath[1]][catPath[2]], 3)}

//               <div className="col-span-2 p-10 flex flex-col items-center justify-center text-center bg-[#F8FAFC]">
//                 {catPath.length > 0 ? (
//                   <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
//                     <div className="bg-white p-6 rounded-2xl shadow-2xl border border-blue-50 mb-8 transform hover:scale-[1.02] transition-transform">
//                       <div className="w-full aspect-square bg-blue-50 rounded-xl mb-6 flex items-center justify-center border-2 border-dashed border-blue-200 overflow-hidden relative group">
//                         <img src="/product-preview.png" className="object-contain" alt="Preview" />
//                         <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
//                       </div>
//                       <div className="text-left space-y-2">
//                         <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
//                           Selected Path
//                         </div>
//                         <p className="text-sm font-bold text-gray-800 leading-tight">{catPath.join(" / ")}</p>
//                       </div>
//                     </div>
//                     <Button
//                       onClick={() => setStep(2)}
//                       className="w-full bg-[#2E3192] hover:bg-[#1e206b] h-14 text-lg font-extrabold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all gap-3"
//                     >
//                       <Plus className="h-6 w-6" /> Add Product Images
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="space-y-4 opacity-50">
//                     <Package className="h-24 w-24 text-gray-300 mx-auto" />
//                     <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
//                       Select a category to continue
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           /* STEP 2: PROFESSIONAL PRODUCT DETAILS FORM */
//           <div className="grid grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <div className="col-span-8 space-y-8">
//               {/* Product Switcher/Tabs */}
//               <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4 overflow-x-auto scrollbar-hide">
//                 {catalogItems.map((item, idx) => (
//                   <div
//                     key={item.id}
//                     onClick={() => setActiveItemIndex(idx)}
//                     className={`flex items-center gap-4 p-3 pr-8 rounded-xl border-2 cursor-pointer transition-all min-w-[220px] group relative ${
//                       activeItemIndex === idx
//                         ? "bg-blue-50 border-[#2E3192] shadow-md"
//                         : "bg-white border-gray-100 hover:border-blue-200"
//                     }`}
//                   >
//                     <div className="h-14 w-14 bg-gray-50 rounded-lg border flex items-center justify-center overflow-hidden ring-1 ring-gray-100 group-hover:ring-blue-200 transition-all">
//                       {item.previewImages[0] ? (
//                         <img src={item.previewImages[0] || "/placeholder.svg"} className="w-full h-full object-cover" />
//                       ) : (
//                         <Package className="h-7 w-7 text-gray-300" />
//                       )}
//                     </div>
//                     <div className="flex flex-col">
//                       <span
//                         className={`text-[10px] font-bold uppercase tracking-widest ${activeItemIndex === idx ? "text-[#2E3192]" : "text-gray-400"}`}
//                       >
//                         Item 0{idx + 1}
//                       </span>
//                       <span className="text-sm font-extrabold text-gray-800 truncate w-24">
//                         {item.name || "Untitled Product"}
//                       </span>
//                     </div>
//                     {catalogItems.length > 1 && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           const newItems = catalogItems.filter((_, i) => i !== idx)
//                           setCatalogItems(newItems)
//                           setActiveItemIndex(0)
//                         }}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <Button
//                   onClick={addNewProductToCatalog}
//                   variant="outline"
//                   className="h-20 w-20 flex-shrink-0 border-dashed border-2 rounded-xl text-blue-600 hover:bg-blue-50 flex flex-col gap-1 font-bold text-[10px] uppercase tracking-tighter bg-transparent"
//                 >
//                   <Plus className="h-5 w-5" /> Add New
//                 </Button>
//               </div>

//               {/* Main Form Content */}
//               <Card className="rounded-xl border shadow-sm overflow-hidden">
//                 <CardHeader className="bg-white border-b py-6 px-8 flex flex-row items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="h-8 w-1 bg-[#2E3192] rounded-full" />
//                     <CardTitle className="text-xl font-extrabold text-gray-800 tracking-tight">
//                       Product Details
//                     </CardTitle>
//                   </div>
//                   <div className="flex items-center gap-3 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
//                     <Checkbox
//                       id="copyToAll"
//                       checked={copyToAll}
//                       onCheckedChange={setCopyToAll}
//                       className="border-blue-300 data-[state=checked]:bg-[#2E3192] data-[state=checked]:border-[#2E3192]"
//                     />
//                     <label
//                       htmlFor="copyToAll"
//                       className="text-[11px] font-bold text-[#2E3192] uppercase tracking-wide cursor-pointer"
//                     >
//                       Copy details to all products
//                     </label>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="p-10 space-y-12">
//                   {/* Basic Identifiers */}
//                   <div className="grid grid-cols-2 gap-x-12 gap-y-8">
//                     <FormInput
//                       label="Product Name"
//                       required
//                       value={activeItem.name}
//                       onChange={(e) => updateActiveItem({ name: e.target.value })}
//                       placeholder="e.g. Designer Embroidered Saree"
//                     />
//                     <FormInput
//                       label="Style Code / SKU"
//                       value={activeItem.styleCode}
//                       onChange={(e) => updateActiveItem({ styleCode: e.target.value })}
//                       placeholder="Optional"
//                     />
//                     <div className="col-span-2">
//                       <Label className="text-[12px] font-bold text-gray-600 uppercase tracking-tight mb-2 block">
//                         Description *
//                       </Label>
//                       <Textarea
//                         value={activeItem.description}
//                         onChange={(e) => updateActiveItem({ description: e.target.value })}
//                         placeholder="Detail the fabric, weave, occasion and care instructions..."
//                         className="min-h-[120px] border-gray-300 rounded-lg shadow-sm focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>

//                   {/* Tax & Logistics */}
//                   <div className="space-y-6 pt-6 border-t">
//                     <h3 className="text-sm font-extrabold text-[#2E3192] uppercase tracking-widest flex items-center gap-2">
//                       <Calculator className="h-4 w-4" /> Tax & Logistics
//                     </h3>
//                     <div className="grid grid-cols-3 gap-8">
//                       <FormSelect
//                         label="GST Rate (%)"
//                         required
//                         options={[
//                           { label: "18%", value: "18" },
//                           { label: "12%", value: "12" },
//                           { label: "5%", value: "5" },
//                         ]}
//                         value={activeItem.gst}
//                         onChange={(v) => updateActiveItem({ gst: v })}
//                       />
//                       <FormInput
//                         label="HSN Code"
//                         required
//                         value={activeItem.hsn}
//                         onChange={(e) => updateActiveItem({ hsn: e.target.value })}
//                         placeholder="e.g. 6206"
//                       />
//                       <FormInput
//                         label="Net Weight (gms)"
//                         required
//                         type="number"
//                         value={activeItem.weight}
//                         onChange={(e) => updateActiveItem({ weight: e.target.value })}
//                         placeholder="0"
//                       />
//                     </div>
//                   </div>

//                   {/* Dynamic Variants Table */}
//                   <div className="space-y-6 pt-6 border-t">
//                     <div className="flex items-center justify-between">
//                       <h3 className="text-sm font-extrabold text-[#2E3192] uppercase tracking-widest flex items-center gap-2">
//                         <Package className="h-4 w-4" /> Size, Stock & Pricing
//                       </h3>
//                       <Button
//                         variant="ghost"
//                         onClick={addVariant}
//                         className="text-blue-600 font-bold text-xs gap-1 hover:bg-blue-50"
//                       >
//                         <Plus className="h-4 w-4" /> Add Size
//                       </Button>
//                     </div>
//                     <div className="border rounded-xl overflow-hidden shadow-sm ring-1 ring-gray-100">
//                       <table className="w-full text-sm">
//                         <thead className="bg-[#F8FAFC] text-[10px] font-extrabold text-gray-500 uppercase tracking-widest border-b">
//                           <tr>
//                             <th className="px-6 py-4 text-left">Size</th>
//                             <th className="px-6 py-4 text-left">My Price (₹)</th>
//                             <th className="px-6 py-4 text-left">MRP (₹)</th>
//                             <th className="px-6 py-4 text-left">Inventory</th>
//                             <th className="px-6 py-4 text-center">Action</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-50">
//                           {activeItem.variants.map((v, idx) => (
//                             <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
//                               <td className="px-6 py-4">
//                                 <Input
//                                   className="h-9 w-24 font-bold border-gray-200"
//                                   value={v.size}
//                                   onChange={(e) => updateVariant(idx, "size", e.target.value)}
//                                   placeholder="S, M, L"
//                                 />
//                               </td>
//                               <td className="px-6 py-4">
//                                 <Input
//                                   className="h-9 w-28 font-bold text-green-600 border-gray-200"
//                                   type="number"
//                                   value={v.price}
//                                   onChange={(e) => updateVariant(idx, "price", e.target.value)}
//                                   placeholder="199"
//                                 />
//                               </td>
//                               <td className="px-6 py-4">
//                                 <Input
//                                   className="h-9 w-28 font-bold text-gray-400 border-gray-200"
//                                   type="number"
//                                   value={v.mrp}
//                                   onChange={(e) => updateVariant(idx, "mrp", e.target.value)}
//                                   placeholder="299"
//                                 />
//                               </td>
//                               <td className="px-6 py-4">
//                                 <Input
//                                   className="h-9 w-24 font-bold border-gray-200"
//                                   type="number"
//                                   value={v.stock}
//                                   onChange={(e) => updateVariant(idx, "stock", e.target.value)}
//                                   placeholder="100"
//                                 />
//                               </td>
//                               <td className="px-6 py-4 text-center">
//                                 {activeItem.variants.length > 1 && (
//                                   <button
//                                     onClick={() => {
//                                       const newV = activeItem.variants.filter((_, i) => i !== idx)
//                                       updateActiveItem({ variants: newV })
//                                     }}
//                                     className="text-red-400 hover:text-red-600 transition-colors"
//                                   >
//                                     <Trash2 className="h-4 w-4" />
//                                   </button>
//                                 )}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>

//                   {/* Attributes */}
//                   <div className="space-y-6 pt-6 border-t">
//                     <h3 className="text-sm font-extrabold text-[#2E3192] uppercase tracking-widest">
//                       Other Attributes
//                     </h3>
//                     <div className="grid grid-cols-2 gap-12">
//                       <FormSelect
//                         label="Color"
//                         required
//                         options={[
//                           { label: "Red", value: "red" },
//                           { label: "Blue", value: "blue" },
//                           { label: "Multi", value: "multi" },
//                         ]}
//                         value={activeItem.attributes.color}
//                         onChange={(v) => updateActiveItem({ attributes: { ...activeItem.attributes, color: v } })}
//                       />
//                       <FormSelect
//                         label="Material"
//                         required
//                         options={[
//                           { label: "Silk", value: "silk" },
//                           { label: "Cotton", value: "cotton" },
//                           { label: "Denim", value: "denim" },
//                         ]}
//                         value={activeItem.attributes.material}
//                         onChange={(v) => updateActiveItem({ attributes: { ...activeItem.attributes, material: v } })}
//                       />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Action Buttons */}
//               <div className="flex items-center justify-between bg-white p-6 rounded-xl border shadow-sm">
//                 <Button
//                   variant="outline"
//                   className="border-gray-200 h-12 px-10 font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all rounded-lg bg-transparent"
//                 >
//                   Discard Catalog
//                 </Button>
//                 <div className="flex gap-4">
//                   <Button
//                     variant="outline"
//                     className="border-[#2E3192] text-[#2E3192] h-12 px-10 font-bold hover:bg-blue-50 transition-all rounded-lg bg-transparent"
//                   >
//                     Save as Draft
//                   </Button>
//                   <Button
//                     disabled={isLoading}
//                     onClick={handleSubmit}
//                     className="bg-[#2E3192] hover:bg-[#1e206b] h-12 px-12 font-extrabold shadow-lg hover:shadow-xl transition-all rounded-lg gap-2"
//                   >
//                     {isLoading ? (
//                       <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
//                     ) : (
//                       <Check className="h-5 w-5" />
//                     )}
//                     Submit Catalog
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             {/* RIGHT SIDEBAR: Guidelines & Calculations */}
//             <div className="col-span-4 space-y-6 sticky top-[100px]">
//               {/* Guidelines Card */}
//               <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-6 rounded-2xl shadow-sm">
//                 <div className="flex items-center gap-3 text-[#B45309] font-extrabold text-xs uppercase tracking-widest mb-6">
//                   <AlertCircle className="h-5 w-5" /> Quality Check Guidelines
//                 </div>
//                 <div className="space-y-6">
//                   {[
//                     "Primary images must not have any text, logos or watermarks.",
//                     "Ensure product occupies 80% of the image frame.",
//                     "Multiple color variants should be added as separate catalog items.",
//                   ].map((text, i) => (
//                     <div key={i} className="flex gap-4 group">
//                       <div className="h-6 w-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-[10px] font-black border border-blue-100 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
//                         {i + 1}
//                       </div>
//                       <p className="text-[11px] text-gray-700 leading-relaxed font-bold">{text}</p>
//                     </div>
//                   ))}
//                 </div>
//                 <Button
//                   variant="link"
//                   className="w-full text-blue-600 font-extrabold p-0 text-[10px] uppercase tracking-widest mt-6 hover:no-underline"
//                 >
//                   View Full Policy <ChevronRight className="h-3 w-3" />
//                 </Button>
//               </div>

//               {/* Image Upload Area */}
//               <Card className="rounded-2xl border shadow-sm p-6 space-y-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <Label className="text-[12px] font-black text-gray-800 uppercase tracking-widest">
//                     Images ({activeItem.images.length}/5)
//                   </Label>
//                   <button
//                     onClick={() => fileInputRef.current?.click()}
//                     className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:underline"
//                   >
//                     Add More
//                   </button>
//                 </div>
//                 <input type="file" multiple hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />

//                 <div className="grid grid-cols-2 gap-3">
//                   {activeItem.previewImages.length > 0 ? (
//                     activeItem.previewImages.map((src, i) => (
//                       <div
//                         key={i}
//                         className="relative aspect-square rounded-xl border-2 border-gray-100 overflow-hidden group"
//                       >
//                         <img src={src || "/placeholder.svg"} className="w-full h-full object-cover" />
//                         <button
//                           onClick={() => removeImage(i)}
//                           className="absolute top-1 right-1 bg-white/90 backdrop-blur rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                         >
//                           <X className="h-3 w-3 text-red-500" />
//                         </button>
//                       </div>
//                     ))
//                   ) : (
//                     <div
//                       onClick={() => fileInputRef.current?.click()}
//                       className="col-span-2 aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-all"
//                     >
//                       <Upload className="h-8 w-8 text-gray-300" />
//                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                         Click to upload catalog images
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </Card>

//               {/* Financial Breakdown Card */}
//               <Card className="rounded-2xl border shadow-xl overflow-hidden bg-white">
//                 <div className="bg-[#F8FAFC] py-4 px-6 border-b">
//                   <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
//                     <Calculator className="h-4 w-4 text-blue-600" /> Bank Settlement
//                   </h3>
//                 </div>
//                 <div className="p-6 space-y-4">
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="text-gray-500 font-bold">Your listing price</span>
//                     <span className="font-extrabold text-gray-800">₹{activeItem.variants[0].price || 0}</span>
//                   </div>
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="text-gray-500 font-bold">GST ({activeItem.gst}%)</span>
//                     <span className="font-bold text-red-500">
//                       -₹{((activeItem.variants[0].price || 0) * (activeItem.gst / 100)).toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="text-gray-500 font-bold">Marketplace Fee</span>
//                     <span className="font-bold text-green-600">₹0.00</span>
//                   </div>
//                   <div className="pt-4 border-t flex justify-between items-end">
//                     <div className="flex flex-col">
//                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">You earn</span>
//                       <span className="text-2xl font-black text-[#2E3192]">
//                         ₹{calculateSettlement(activeItem.variants[0].price)}
//                       </span>
//                     </div>
//                     <div className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-1 rounded-full border border-green-100 uppercase tracking-widest">
//                       Verified
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </div>
//           </div>
//         )}
//       </div>
//       <ToastContainer position="bottom-right" />
//     </div>
//   )
// }
