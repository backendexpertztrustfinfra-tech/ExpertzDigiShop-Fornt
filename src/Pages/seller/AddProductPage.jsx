import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";

// --- CONSTANTS ---
const COLOR_SUGGESTIONS = ["Red", "Blue", "Black", "White", "Green", "Yellow", "Pink", "Purple", "Gray", "Brown"];
const MATERIAL_SUGGESTIONS = ["Cotton", "Silk", "Polyester", "Wool", "Linen", "Denim", "Leather", "Synthetic", "Blend"];
const SIZE_SUGGESTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const COUNTRIES = ["India", "USA", "UK", "China", "Japan", "Germany", "France", "Australia", "Canada", "Brazil"];

const CITIES = {
  India: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"],
  USA: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  UK: ["London", "Manchester", "Birmingham", "Leeds"],
  China: ["Beijing", "Shanghai", "Shenzhen", "Guangzhou"],
  Japan: ["Tokyo", "Osaka", "Kyoto", "Yokohama"],
};

// --- HELPER COMPONENTS ---

const SmartDropdown = ({ label, value, suggestions, onChange, onCustomAdd, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);

  useEffect(() => {
    setFilteredSuggestions(suggestions.filter((s) => s.toLowerCase().includes(customInput.toLowerCase())));
  }, [customInput, suggestions]);

  const handleSelect = (suggestion) => {
    onChange(suggestion);
    setCustomInput("");
    setIsOpen(false);
  };

  const handleAddCustom = () => {
    if (customInput.trim()) {
      onChange(customInput);
      onCustomAdd?.(customInput);
      setCustomInput("");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <label className="block text-sm font-semibold mb-1.5 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className="border-2 border-gray-300 rounded-lg p-3 cursor-pointer bg-white hover:border-blue-500 transition shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={value ? "text-gray-900" : "text-gray-400"}>{value || "Select or type..."}</div>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          <input
            type="text"
            placeholder="Search or type custom..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="w-full p-3 border-b focus:outline-none sticky top-0 bg-white"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="p-1">
            {filteredSuggestions.map((suggestion) => (
              <div key={suggestion} onClick={() => handleSelect(suggestion)} className="p-2.5 hover:bg-blue-50 cursor-pointer rounded-md text-sm text-gray-700 transition">
                {suggestion}
              </div>
            ))}
            {customInput && !filteredSuggestions.includes(customInput) && (
              <button type="button" onClick={handleAddCustom} className="w-full p-2.5 mt-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-bold shadow-md">
                + Add "{customInput}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ImageUploader = ({ label, onChange, preview }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer relative group">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      {preview ? (
        <div className="space-y-2">
          <img src={preview || "/placeholder.svg"} alt="Preview" className="h-40 mx-auto object-contain rounded-lg shadow-sm" />
          <p className="text-xs text-blue-600 font-bold group-hover:underline">Click to change image</p>
        </div>
      ) : (
        <div className="py-4">
          <div className="text-3xl mb-2">📷</div>
          <p className="text-sm font-medium text-gray-600">Click or drag image here</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
        </div>
      )}
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function AddProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { userToken } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [variants, setVariants] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSameAsManufacturer, setIsSameAsManufacturer] = useState(false);
  const [cityList, setCityList] = useState(CITIES["India"]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    material: "",
    images: {},
    pricing: { costPrice: 0, sellingPrice: 0, mrp: 0, discount: 0 },
    inventory: { totalStock: 0 },
    compliance: { hsnCode: "", gst: "", countryOfOrigin: "India" },
    manufacturer: { name: "", address: "", city: "", state: "", pincode: "", phone: "", email: "", licenseNumber: "" },
    packer: { name: "", address: "", city: "", state: "", pincode: "", phone: "" },
    shipping: { weight: 0, shippingCharge: 0 },
    policies: { returnDays: 30, returnPolicy: "", warranty: "", shippingPolicy: "", codAvailable: true },
  });

  const [newVariant, setNewVariant] = useState({
    color: "", size: "", sku: "", barcode: "",
    costPrice: 0, mrp: 0, sellingPrice: 0, stock: 0,
    height: 0, width: 0, length: 0, weight: 0
  });

  const steps = ["Basic Info", "Images", "Variants", "Manufacturer & Policies"];

  useEffect(() => {
    if (productId) loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
            ...prev,
            ...data.product,
            pricing: { ...prev.pricing, ...data.product.pricing },
            compliance: { ...prev.compliance, ...data.product.compliance },
            manufacturer: { ...prev.manufacturer, ...data.product.manufacturer },
            packer: { ...prev.packer, ...data.product.packer },
            policies: { ...prev.policies, ...data.product.policies }
        }));
        setVariants(data.product.variants || []);
        if (data.product.compliance?.countryOfOrigin) {
          setCityList(CITIES[data.product.compliance.countryOfOrigin] || []);
        }
      }
    } catch (error) {
      toast.error("Failed to load product");
    }
  };

  const handleCountryChange = (country) => {
    setFormData(prev => ({
      ...prev,
      compliance: { ...prev.compliance, countryOfOrigin: country },
      manufacturer: { ...prev.manufacturer, city: "" }
    }));
    setCityList(CITIES[country] || []);
  };

  const handleSameAsManufacturer = (checked) => {
    setIsSameAsManufacturer(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, packer: { ...prev.manufacturer } }));
    } else {
      setFormData(prev => ({
        ...prev,
        packer: { name: "", address: "", city: "", state: "", pincode: "", phone: "" }
      }));
    }
  };

  const handleImageUpload = (key, file) => {
    setFormData(prev => ({ ...prev, images: { ...prev.images, [key]: file } }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreviews(prev => ({ ...prev, [key]: e.target.result }));
    reader.readAsDataURL(file);
  };

  const addVariant = () => {
    if (newVariant.color && newVariant.size && newVariant.sellingPrice > 0 && newVariant.stock > 0) {
      setVariants(prev => [...prev, { ...newVariant, id: Date.now() }]);
      setNewVariant({
        color: "", size: "", sku: "", barcode: "",
        costPrice: 0, mrp: 0, sellingPrice: 0, stock: 0,
        height: 0, width: 0, length: 0, weight: 0
      });
    } else {
      toast.error("Please fill required variant fields (Color, Size, Price, Stock)");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Removed variant requirement - now optional
    if (!formData.name || !formData.category) {
      toast.error("Please fill Name and Category fields.");
      return;
    }

    if (variants.length === 0 && (!formData.pricing.sellingPrice || formData.pricing.sellingPrice <= 0)) {
      toast.error("If no variants, please add pricing to the base product.");
      return;
    }

    setIsLoading(true);
    try {
      const submissionData = new FormData();
      // Basic Fields
      submissionData.append("name", formData.name);
      submissionData.append("description", formData.description);
      submissionData.append("category", formData.category);
      submissionData.append("brand", formData.brand);
      submissionData.append("material", formData.material);
      
      // JSON objects
      submissionData.append("variants", JSON.stringify(variants));
      submissionData.append("pricing", JSON.stringify(formData.pricing));
      submissionData.append("compliance", JSON.stringify(formData.compliance));
      submissionData.append("manufacturer", JSON.stringify(formData.manufacturer));
      submissionData.append("packer", JSON.stringify(formData.packer));
      submissionData.append("shipping", JSON.stringify(formData.shipping));
      submissionData.append("policies", JSON.stringify(formData.policies));

      // Images - FIXED: Use correct field names that match router (primary, front, back, side)
      if (formData.images.primary) submissionData.append("primary", formData.images.primary);
      if (formData.images.frontView) submissionData.append("front", formData.images.frontView);
      if (formData.images.backView) submissionData.append("back", formData.images.backView);
      if (formData.images.sideView) submissionData.append("side", formData.images.sideView);

      const response = await fetch(productId ? `${API_BASE_URL}/products/${productId}` : `${API_BASE_URL}/products`, {
        method: productId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${userToken}` },
        body: submissionData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(
  productId
    ? "Product updated & sent for re-approval"
    : "Product submitted for admin approval"
);
        navigate("/seller/inventory");
      } else {
        console.error("[v0] Error response:", data);
        toast.error(data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("[v0] Error:", error);
      toast.error(error.message || "Error saving product");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <input
                type="text"
                placeholder="Product Name *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border-2 border-gray-300 rounded-lg p-3.5 focus:outline-none focus:border-blue-500 transition shadow-sm"
              />
              <textarea
                placeholder="Product Description *"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border-2 border-gray-300 rounded-lg p-3.5 h-32 focus:outline-none focus:border-blue-500 transition shadow-sm"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SmartDropdown
                  label="Category *"
                  value={formData.category}
                  suggestions={["Fashion", "Electronics", "Toys", "Beauty", "Sports"]}
                  onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                  required
                />
                <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-700">Brand Name</label>
                    <input
                        type="text"
                        placeholder="Brand"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition shadow-sm"
                    />
                </div>
              </div>
              <SmartDropdown
                label="Material"
                value={formData.material}
                suggestions={MATERIAL_SUGGESTIONS}
                onChange={(val) => setFormData(prev => ({ ...prev, material: val }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Product Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader label="Primary Image *" onChange={(f) => handleImageUpload("primary", f)} preview={imagePreviews.primary} />
              <ImageUploader label="Front View" onChange={(f) => handleImageUpload("frontView", f)} preview={imagePreviews.frontView} />
              <ImageUploader label="Back View" onChange={(f) => handleImageUpload("backView", f)} preview={imagePreviews.backView} />
              <ImageUploader label="Side View" onChange={(f) => handleImageUpload("sideView", f)} preview={imagePreviews.sideView} />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-5 duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Variants & Pricing</h2>
            
            {/* VARIANT INPUT SECTION */}
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-md space-y-5">
              <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest">Step 1: Define New Variant</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SmartDropdown label="Color" value={newVariant.color} suggestions={COLOR_SUGGESTIONS} onChange={(v) => setNewVariant(p => ({ ...p, color: v }))} />
                <SmartDropdown label="Size" value={newVariant.size} suggestions={SIZE_SUGGESTIONS} onChange={(v) => setNewVariant(p => ({ ...p, size: v }))} />
                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-1 text-gray-600">Price *</label>
                    <input type="number" placeholder="₹ Price" value={newVariant.sellingPrice || ""} onChange={e => setNewVariant(p => ({ ...p, sellingPrice: Number(e.target.value) }))} className="border-2 border-gray-300 rounded-lg p-2.5 focus:border-blue-400 outline-none" />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-bold mb-1 text-gray-600">Stock *</label>
                    <input type="number" placeholder="Stock" value={newVariant.stock || ""} onChange={e => setNewVariant(p => ({ ...p, stock: Number(e.target.value) }))} className="border-2 border-gray-300 rounded-lg p-2.5 focus:border-blue-400 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="text" placeholder="SKU" value={newVariant.sku} onChange={e => setNewVariant(p => ({ ...p, sku: e.target.value }))} className="border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
                <input type="text" placeholder="Barcode" value={newVariant.barcode} onChange={e => setNewVariant(p => ({ ...p, barcode: e.target.value }))} className="border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
                <input type="number" placeholder="Cost Price" value={newVariant.costPrice || ""} onChange={e => setNewVariant(p => ({ ...p, costPrice: Number(e.target.value) }))} className="border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
                <input type="number" placeholder="MRP" value={newVariant.mrp || ""} onChange={e => setNewVariant(p => ({ ...p, mrp: Number(e.target.value) }))} className="border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
              </div>

              <h3 className="text-sm font-bold text-gray-500 border-t pt-4">Dimensions & Shipping Weight</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="number" placeholder="Height (cm)" value={newVariant.height || ""} onChange={e => setNewVariant(p => ({ ...p, height: Number(e.target.value) }))} className="border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
                <input type="number" placeholder="Width (cm)" value={newVariant.width || ""} onChange={e => setNewVariant(p => ({ ...p, width: Number(e.target.value) }))} className="border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
                <input type="number" placeholder="Length (cm)" value={newVariant.length || ""} onChange={e => setNewVariant(p => ({ ...p, length: Number(e.target.value) }))} className="border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
                <input type="number" placeholder="Weight (kg)" value={newVariant.weight || ""} onChange={e => setNewVariant(p => ({ ...p, weight: Number(e.target.value) }))} className="border-2 border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
              </div>

              <button type="button" onClick={addVariant} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                + Add This Variant to List
              </button>
            </div>

            {/* VARIANT TABLE */}
            {variants.length > 0 && (
              <div className="overflow-hidden border-2 border-gray-200 rounded-2xl shadow-sm bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2">
                    <tr className="text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-4 text-left">Color/Size</th>
                      <th className="p-4 text-left">Pricing (₹)</th>
                      <th className="p-4 text-left">Dims (cm/kg)</th>
                      <th className="p-4 text-left">Stock</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {variants.map((v, i) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition">
                        <td className="p-4">
                            <span className="font-bold text-gray-800">{v.color}</span> / <span className="text-gray-500">{v.size}</span>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{v.sku || 'No SKU'}</div>
                        </td>
                        <td className="p-4">
                            <div className="font-bold text-blue-600">Sell: ₹{v.sellingPrice}</div>
                            <div className="text-[10px] text-gray-400 line-through">MRP: ₹{v.mrp}</div>
                        </td>
                        <td className="p-4 text-gray-500">
                            {v.height}x{v.width}x{v.length} <br/>
                            <span className="text-[11px] font-bold">{v.weight} kg</span>
                        </td>
                        <td className="p-4 font-bold text-gray-700">{v.stock} pcs</td>
                        <td className="p-4 text-center">
                          <button type="button" onClick={() => setVariants(prev => prev.filter((item) => item.id !== v.id))} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* GLOBAL COMPLIANCE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
               <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">GST %</label>
                  <input type="number" placeholder="5" value={formData.compliance.gst} onChange={e => setFormData(p => ({ ...p, compliance: { ...p.compliance, gst: Number(e.target.value) } }))} className="w-full border-2 border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500" />
               </div>
               <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">HSN Code</label>
                  <input type="text" placeholder="6206" value={formData.compliance.hsnCode} onChange={e => setFormData(p => ({ ...p, compliance: { ...p.compliance, hsnCode: e.target.value } }))} className="w-full border-2 border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500" />
               </div>
               <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Global Discount %</label>
                  <input type="number" placeholder="10" value={formData.pricing.discount} onChange={e => setFormData(p => ({ ...p, pricing: { ...p.pricing, discount: Number(e.target.value) } }))} className="w-full border-2 border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500" />
               </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-5 duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Legal & Policies</h2>
            
            <div className="bg-orange-50 p-5 rounded-2xl border-2 border-orange-100 flex items-center gap-3">
              <input type="checkbox" id="sameAsM" checked={isSameAsManufacturer} onChange={e => handleSameAsManufacturer(e.target.checked)} className="w-5 h-5 accent-orange-600" />
              <label htmlFor="sameAsM" className="text-sm font-bold text-orange-800 cursor-pointer">Packer details same as Manufacturer (Auto-fill)</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-6 bg-white border-2 border-gray-200 rounded-2xl">
                <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest border-b pb-2">Manufacturer Info</h3>
                <input type="text" placeholder="Company Name" value={formData.manufacturer.name} onChange={e => setFormData(p => ({ ...p, manufacturer: { ...p.manufacturer, name: e.target.value } }))} className="w-full border-2 border-gray-200 rounded-lg p-3 shadow-sm" />
                <SmartDropdown label="Country" value={formData.compliance.countryOfOrigin} suggestions={COUNTRIES} onChange={handleCountryChange} />
                <SmartDropdown label="City" value={formData.manufacturer.city} suggestions={cityList} onChange={v => setFormData(p => ({ ...p, manufacturer: { ...p.manufacturer, city: v } }))} />
                <input type="text" placeholder="Full Office Address" value={formData.manufacturer.address} onChange={e => setFormData(p => ({ ...p, manufacturer: { ...p.manufacturer, address: e.target.value } }))} className="w-full border-2 border-gray-200 rounded-lg p-3 shadow-sm" />
              </div>

              <div className={`space-y-4 p-6 bg-white border-2 border-gray-200 rounded-2xl transition ${isSameAsManufacturer ? 'opacity-50 pointer-events-none grayscale bg-gray-50' : ''}`}>
                <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest border-b pb-2">Packer Info</h3>
                <input type="text" placeholder="Packer Company Name" value={formData.packer.name} onChange={e => setFormData(p => ({ ...p, packer: { ...p.packer, name: e.target.value } }))} className="w-full border-2 border-gray-200 rounded-lg p-3 shadow-sm" />
                <input type="text" placeholder="Address" value={formData.packer.address} onChange={e => setFormData(p => ({ ...p, packer: { ...p.packer, address: e.target.value } }))} className="w-full border-2 border-gray-200 rounded-lg p-3 shadow-sm" />
                <input type="text" placeholder="Pincode" value={formData.packer.pincode} onChange={e => setFormData(p => ({ ...p, packer: { ...p.packer, pincode: e.target.value } }))} className="w-full border-2 border-gray-200 rounded-lg p-3 shadow-sm" />
              </div>
            </div>

            <div className="bg-gray-100 p-8 rounded-3xl space-y-6">
              <h3 className="font-bold text-gray-800">Shipping & Return Policies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <textarea placeholder="Return Policy (e.g. 7 days exchange only)" value={formData.policies.returnPolicy} onChange={e => setFormData(p => ({ ...p, policies: { ...p.policies, returnPolicy: e.target.value } }))} className="w-full border-2 border-gray-200 rounded-xl p-4 h-28 text-sm focus:border-blue-500" />
                <textarea placeholder="Warranty (e.g. 6 Months brand warranty)" value={formData.policies.warranty} onChange={e => setFormData(p => ({ ...p, policies: { ...p.policies, warranty: e.target.value } }))} className="w-full border-2 border-gray-200 rounded-xl p-4 h-28 text-sm focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.policies.codAvailable} onChange={e => setFormData(p => ({ ...p, policies: { ...p.policies, codAvailable: e.target.checked } }))} className="w-5 h-5 accent-blue-600" />
                <span className="font-bold text-gray-700 text-sm">Enable Cash on Delivery (COD)</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-10 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 border-b pb-6">
          <button onClick={() => navigate("/seller/products")} className="flex items-center text-sm font-black text-gray-400 hover:text-blue-600 transition group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> PRODUCT LIST
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{productId ? "EDIT PRODUCT" : "NEW PRODUCT"}</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Status: Step {currentStep} of {steps.length}</p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-50 mb-10">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-700 ${i + 1 <= currentStep ? "bg-blue-600 shadow-md shadow-blue-100" : "bg-gray-100"}`} />
            ))}
          </div>
          <div className="flex justify-between mt-4">
             {steps.map((s, i) => (
               <span key={i} className={`text-[10px] font-black uppercase tracking-tighter ${i + 1 === currentStep ? "text-blue-600" : "text-gray-300"}`}>{s}</span>
             ))}
          </div>
        </div>

        {/* FORM BOX */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-gray-100 p-8 md:p-12">
          {renderStep()}

          {/* NAVIGATION */}
          <div className="flex items-center justify-between mt-12 pt-10 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep(p => p - 1)}
              disabled={currentStep === 1}
              className="px-8 py-3.5 rounded-2xl border-2 border-gray-100 text-sm font-bold text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition"
            >
              Previous
            </button>

            {currentStep === steps.length ? (
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-xl shadow-blue-200 disabled:opacity-50"
              >
                {isLoading ? "PUBLISHING..." : "FINISH & PUBLISH"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep(p => p + 1)}
                className="px-12 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition shadow-xl shadow-gray-200"
              >
                SAVE & NEXT
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
