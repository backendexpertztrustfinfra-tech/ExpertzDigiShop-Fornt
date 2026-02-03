import { useState, useEffect, useMemo } from "react";
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

const ImageUploader = ({ label, onChange, onClear, preview, isExisting = false }) => (
  <div className="space-y-2">
    <div className="flex justify-between">
        <label className="block text-sm font-semibold text-gray-700">
            {label} {isExisting && <span className="text-[10px] text-green-600 font-bold">(Existing)</span>}
        </label>
        {preview && <button type="button" onClick={onClear} className="text-[10px] text-red-500 font-bold hover:underline">Remove</button>}
    </div>
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
          <img src={preview} alt="Preview" className="h-40 mx-auto object-contain rounded-lg shadow-sm" />
          <p className="text-xs text-blue-600 font-bold group-hover:underline">Click to replace image</p>
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

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id: productId } = useParams();
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
    compliance: { hsnCode: "", gst: 18, countryOfOrigin: "India" },
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

  const steps = ["Basic Info", "Images", "Variants", "Legal & Policies"];

  // Logic: Check if variants exist to handle base price conflict
  const hasVariants = variants.length > 0;
  const calculatedTotalStock = useMemo(() => {
    return variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }, [variants]);

  useEffect(() => {
    if (productId) loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      
      if (!response.ok) throw new Error("Failed to load");

      const data = await response.json();
      const p = data.product || data;

      // Safe Mapping (Issue 1 fix: Defensive Coding)
      setFormData({
        name: p.name || "",
        description: p.description || "",
        category: p.category || "",
        brand: p.brand || "",
        material: p.material || "",
        images: {}, 
        pricing: {
          costPrice: p.pricing?.costPrice || 0,
          sellingPrice: p.pricing?.sellingPrice || 0,
          mrp: p.pricing?.mrp || 0,
          discount: p.pricing?.discount || 0
        },
        inventory: {
          totalStock: p.inventory?.totalStock ?? p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0
        },
        compliance: {
          hsnCode: p.compliance?.hsnCode || "",
          gst: p.compliance?.gst || 18,
          countryOfOrigin: p.compliance?.countryOfOrigin || "India"
        },
        manufacturer: {
          name: p.manufacturer?.name || "",
          address: p.manufacturer?.address || "",
          city: p.manufacturer?.city || "",
          state: p.manufacturer?.state || "",
          pincode: p.manufacturer?.pincode || "",
          phone: p.manufacturer?.phone || "",
          email: p.manufacturer?.email || "",
          licenseNumber: p.manufacturer?.licenseNumber || ""
        },
        packer: {
          name: p.packer?.name || "",
          address: p.packer?.address || "",
          city: p.packer?.city || "",
          state: p.packer?.state || "",
          pincode: p.packer?.pincode || "",
          phone: p.packer?.phone || ""
        },
        shipping: {
          weight: p.shipping?.weight || 0,
          shippingCharge: p.shipping?.shippingCharge || 0
        },
        policies: {
          returnDays: p.policies?.returnDays || 30,
          returnPolicy: p.policies?.returnPolicy || "",
          warranty: p.policies?.warranty || "",
          shippingPolicy: p.policies?.shippingPolicy || "",
          codAvailable: p.policies?.codAvailable ?? true
        }
      });

      setVariants(p.variants || []);

      if (p.images) {
        const BASE_IMAGE_URL = "https://expertz-digishop.onrender.com";
        const previews = {};
        ["primary", "frontView", "backView", "sideView"].forEach(key => {
            if (p.images[key]) {
                const path = p.images[key];
                previews[key] = path.startsWith("http") ? path : `${BASE_IMAGE_URL}/${path.replace(/\\/g, "/")}`;
            }
        });
        setImagePreviews(previews);
      }

      if (p.compliance?.countryOfOrigin) {
        setCityList(CITIES[p.compliance.countryOfOrigin] || []);
      }
      toast.success("Product Loaded");
    } catch (error) {
      toast.error("Error loading product");
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
    }
  };

  const handleImageUpload = (key, file) => {
    setFormData(prev => ({ ...prev, images: { ...prev.images, [key]: file } }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreviews(prev => ({ ...prev, [key]: e.target.result }));
    reader.readAsDataURL(file);
  };

  const clearImage = (key) => {
    setImagePreviews(prev => {
        const updated = {...prev};
        delete updated[key];
        return updated;
    });
    setFormData(prev => ({ ...prev, images: { ...prev.images, [key]: null } }));
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
      toast.error("Price and Stock are required for variant");
    }
  };

  const editVariant = (index) => {
    const vToEdit = variants[index];
    setNewVariant(vToEdit);
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category) return toast.error("Name and Category required");
    if (!imagePreviews.primary && !formData.images.primary) return toast.error("Primary image is required");
    if (!hasVariants && formData.pricing.sellingPrice <= 0) return toast.error("Base product price required if no variants");

    setIsLoading(true);
    try {
      const submissionData = new FormData();
      
      submissionData.append("name", formData.name);
      submissionData.append("description", formData.description);
      submissionData.append("category", formData.category);
      submissionData.append("brand", formData.brand);
      submissionData.append("material", formData.material);
      
      const finalInventory = hasVariants ? { totalStock: calculatedTotalStock } : formData.inventory;

      submissionData.append("variants", JSON.stringify(variants));
      submissionData.append("pricing", JSON.stringify(formData.pricing));
      submissionData.append("compliance", JSON.stringify(formData.compliance));
      submissionData.append("manufacturer", JSON.stringify(formData.manufacturer));
      submissionData.append("packer", JSON.stringify(formData.packer));
      submissionData.append("shipping", JSON.stringify(formData.shipping));
      submissionData.append("policies", JSON.stringify(formData.policies));
      submissionData.append("inventory", JSON.stringify(finalInventory));

      if (formData.images.primary) submissionData.append("primary", formData.images.primary);
      if (formData.images.frontView) submissionData.append("front", formData.images.frontView);
      if (formData.images.backView) submissionData.append("back", formData.images.backView);
      if (formData.images.sideView) submissionData.append("side", formData.images.sideView);

      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userToken}` },
        body: submissionData,
      });

      if (response.ok) {
        toast.success("Product Updated!");
        navigate("/seller/products");
      } else {
        const err = await response.json();
        toast.error(err.message || "Update Failed");
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Basic Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <input
                type="text"
                placeholder="Product Name *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-blue-500 transition shadow-sm bg-gray-50/50"
              />
              <textarea
                placeholder="Product Description *"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border-2 border-gray-100 rounded-2xl p-4 h-40 focus:outline-none focus:border-blue-500 transition shadow-sm bg-gray-50/50"
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
                        className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50/50 outline-none focus:border-blue-500 transition shadow-sm"
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
              <ImageUploader label="Primary Image *" onChange={(f) => handleImageUpload("primary", f)} onClear={() => clearImage("primary")} preview={imagePreviews.primary} isExisting={!!imagePreviews.primary && !formData.images.primary} />
              <ImageUploader label="Front View" onChange={(f) => handleImageUpload("frontView", f)} onClear={() => clearImage("frontView")} preview={imagePreviews.frontView} isExisting={!!imagePreviews.frontView && !formData.images.frontView} />
              <ImageUploader label="Back View" onChange={(f) => handleImageUpload("backView", f)} onClear={() => clearImage("backView")} preview={imagePreviews.backView} isExisting={!!imagePreviews.backView && !formData.images.backView} />
              <ImageUploader label="Side View" onChange={(f) => handleImageUpload("sideView", f)} onClear={() => clearImage("sideView")} preview={imagePreviews.sideView} isExisting={!!imagePreviews.sideView && !formData.images.sideView} />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-5 duration-500">
            <h2 className="text-2xl font-bold text-gray-800">Variants & Pricing</h2>
            
            <div className="bg-white p-6 rounded-[30px] border-2 border-gray-50 shadow-xl shadow-blue-900/5 space-y-6">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Step 1: Define New Variant</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SmartDropdown label="Color" value={newVariant.color} suggestions={COLOR_SUGGESTIONS} onChange={(v) => setNewVariant(p => ({ ...p, color: v }))} />
                <SmartDropdown label="Size" value={newVariant.size} suggestions={SIZE_SUGGESTIONS} onChange={(v) => setNewVariant(p => ({ ...p, size: v }))} />
                <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1.5 text-gray-500 uppercase tracking-tighter">Price *</label>
                    <input type="number" placeholder="₹" value={newVariant.sellingPrice || ""} onChange={e => setNewVariant(p => ({ ...p, sellingPrice: Number(e.target.value) }))} className="border-2 border-gray-100 rounded-xl p-2.5 bg-gray-50 focus:border-blue-400 outline-none transition" />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1.5 text-gray-500 uppercase tracking-tighter">Stock *</label>
                    <input type="number" placeholder="Qty" value={newVariant.stock || ""} onChange={e => setNewVariant(p => ({ ...p, stock: Number(e.target.value) }))} className="border-2 border-gray-100 rounded-xl p-2.5 bg-gray-50 focus:border-blue-400 outline-none transition" />
                </div>
              </div>
              <button type="button" onClick={addVariant} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100">
                + Update / Add Variant
              </button>
            </div>

            {variants.length > 0 && (
              <div className="overflow-hidden border-2 border-gray-100 rounded-[30px] shadow-sm bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 border-b">
                    <tr className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                      <th className="p-5 text-left">Color/Size</th>
                      <th className="p-5 text-left">Pricing</th>
                      <th className="p-5 text-left">Stock</th>
                      <th className="p-5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {variants.map((v, i) => (
                      <tr key={v.id || i} className="hover:bg-blue-50/30 transition">
                        <td className="p-5"><span className="font-black text-gray-900">{v.color}</span> / <span className="text-gray-500 font-bold">{v.size}</span></td>
                        <td className="p-5"><div className="font-black text-blue-600">₹{v.sellingPrice}</div></td>
                        <td className="p-5 font-black text-gray-700">{v.stock} pcs</td>
                        <td className="p-5 text-center flex justify-center gap-2">
                          <button type="button" onClick={() => editVariant(i)} className="text-blue-500 hover:bg-blue-100 p-2 rounded-xl transition">✏️</button>
                          <button type="button" onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-100 p-2 rounded-xl transition">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 p-8 rounded-[40px] text-white transition-opacity ${hasVariants ? 'bg-blue-900 opacity-60' : 'bg-gray-900'}`}>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Base Price {hasVariants && "(Locked)"}</label>
                  <input type="number" disabled={hasVariants} value={hasVariants ? variants[0]?.sellingPrice : formData.pricing.sellingPrice} onChange={e => setFormData(p => ({ ...p, pricing: { ...p.pricing, sellingPrice: Number(e.target.value) } }))} className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 disabled:cursor-not-allowed" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Base MRP</label>
                  <input type="number" disabled={hasVariants} value={hasVariants ? variants[0]?.mrp : formData.pricing.mrp} onChange={e => setFormData(p => ({ ...p, pricing: { ...p.pricing, mrp: Number(e.target.value) } }))} className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 disabled:cursor-not-allowed" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Total Stock</label>
                  <input type="number" disabled={hasVariants} value={hasVariants ? calculatedTotalStock : formData.inventory.totalStock} onChange={e => setFormData(p => ({ ...p, inventory: { totalStock: Number(e.target.value) } }))} className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 disabled:cursor-not-allowed" />
               </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-5 duration-500">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Legal & Policies</h2>
            <div className="bg-blue-50 p-6 rounded-[30px] border border-blue-100 flex items-center gap-4">
              <input type="checkbox" id="sameAsM" checked={isSameAsManufacturer} onChange={e => handleSameAsManufacturer(e.target.checked)} className="w-6 h-6 accent-blue-600 rounded-lg" />
              <label htmlFor="sameAsM" className="text-sm font-black text-blue-900 cursor-pointer">Packer details same as Manufacturer</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 p-8 bg-white border-2 border-gray-50 rounded-[40px] shadow-sm">
                <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest border-b border-gray-50 pb-4 mb-4">Manufacturer Info</h3>
                <input type="text" placeholder="Company Name" value={formData.manufacturer.name} onChange={e => setFormData(p => ({ ...p, manufacturer: { ...p.manufacturer, name: e.target.value } }))} className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50/50" />
                <SmartDropdown label="Country" value={formData.compliance.countryOfOrigin} suggestions={COUNTRIES} onChange={handleCountryChange} />
                <SmartDropdown label="City" value={formData.manufacturer.city} suggestions={cityList} onChange={v => setFormData(p => ({ ...p, manufacturer: { ...p.manufacturer, city: v } }))} />
                <input type="text" placeholder="Full Address" value={formData.manufacturer.address} onChange={e => setFormData(p => ({ ...p, manufacturer: { ...p.manufacturer, address: e.target.value } }))} className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50/50" />
              </div>

              <div className={`space-y-4 p-8 bg-white border-2 border-gray-50 rounded-[40px] shadow-sm transition-all duration-500 ${isSameAsManufacturer ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest border-b border-gray-50 pb-4 mb-4">Packer Info</h3>
                <input type="text" placeholder="Packer Name" value={formData.packer.name} onChange={e => setFormData(p => ({ ...p, packer: { ...p.packer, name: e.target.value } }))} className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50/50" />
                <input type="text" placeholder="Address" value={formData.packer.address} onChange={e => setFormData(p => ({ ...p, packer: { ...p.packer, address: e.target.value } }))} className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50/50" />
              </div>
            </div>
            <div className="bg-gray-50 p-10 rounded-[50px] space-y-8">
              <h3 className="font-black text-gray-900 text-lg tracking-tight">Shipping & Policies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <textarea placeholder="Return Policy" value={formData.policies.returnPolicy} onChange={e => setFormData(p => ({ ...p, policies: { ...p.policies, returnPolicy: e.target.value } }))} className="w-full border-2 border-white rounded-[30px] p-6 h-32 text-sm bg-white shadow-inner outline-none" />
                <textarea placeholder="Warranty Details" value={formData.policies.warranty} onChange={e => setFormData(p => ({ ...p, policies: { ...p.policies, warranty: e.target.value } }))} className="w-full border-2 border-white rounded-[30px] p-6 h-32 text-sm bg-white shadow-inner outline-none" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-4 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-gray-50 pb-8">
          <button onClick={() => navigate("/seller/products")} className="flex items-center text-[10px] font-black text-gray-300 hover:text-blue-600 transition group tracking-[0.2em]">
            <span className="mr-3 group-hover:-translate-x-2 transition-transform">←</span> BACK TO LIST
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">EDITING PRODUCT</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-2">STEP {currentStep} OF {steps.length}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 mb-12">
          <div className="flex gap-3">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-1000 ${i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-100"}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[60px] shadow-2xl shadow-blue-900/5 border border-gray-100 p-10 md:p-16 relative overflow-hidden">
          {renderStep()}
          <div className="flex items-center justify-between mt-16 pt-12 border-t border-gray-50">
            <button type="button" onClick={() => setCurrentStep(p => p - 1)} disabled={currentStep === 1} className="px-10 py-4 rounded-[25px] border-2 border-gray-100 text-xs font-black text-gray-300 hover:bg-gray-50 disabled:opacity-30 transition">Previous</button>
            {currentStep === steps.length ? (
              <button type="submit" disabled={isLoading} className="px-16 py-4 bg-blue-600 text-white rounded-[25px] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition shadow-2xl disabled:opacity-50">{isLoading ? "UPDATING..." : "UPDATE CHANGES"}</button>
            ) : (
              <button type="button" onClick={() => setCurrentStep(p => p + 1)} className="px-16 py-4 bg-gray-900 text-white rounded-[25px] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition shadow-2xl">SAVE & NEXT</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}