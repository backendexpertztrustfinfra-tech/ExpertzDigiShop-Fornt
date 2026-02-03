import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"

const businessTypes = [
  { value: "sole_proprietor", label: "Individual / Sole Proprietorship" },
  { value: "partnership", label: "Partnership Firm" },
  { value: "pvt_ltd", label: "Private Limited Company (Pvt Ltd)" },
  { value: "opc", label: "One Person Company (OPC)" },
]

export default function SellerVerificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const { user, userToken, updateSellerVerificationStatus } = useAuth()

   const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    businessType: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bankAccountNumber: "",
    ifscCode: "",
    panNumber: "",
    gstNumber: "",
    businessLicense: null,
    panDocument: null,
    bankProof: null,
  })

  const [uploadedFiles, setUploadedFiles] = useState({
    businessLicense: false,
    panDocument: false,
    bankProof: false,
  })

  useEffect(() => {
    const status = user?.verificationStatus
    if (status === "pending_review" || status === "verified") {
      navigate("/seller/dashboard", { replace: true })
    }
  }, [user, navigate])

  const handleFileChange = (field, file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit")
      return
    }
    setFormData((prev) => ({ ...prev, [field]: file }))
    setUploadedFiles((prev) => ({ ...prev, [field]: true }))
    toast.success(`${file.name} uploaded successfully`)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // STEP VALIDATIONS
  const validateStep1 = () => {
    if (
      !formData.storeName.trim() ||
      !formData.storeDescription.trim() ||
      !formData.businessType
    ) {
      toast.error("Please fill in all store information fields")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    const pincodeRegex = /^[1-9][0-9]{5}$/
    if (
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim()
    ) {
      toast.error("Please fill in all address fields")
      return false
    }
    if (!pincodeRegex.test(formData.pincode)) {
      toast.error("Please enter a valid 6-digit Pincode")
      return false
    }
    return true
  }

const validateStep3 = () => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

    if (
      !formData.bankAccountNumber.trim() ||
      !formData.panNumber.trim() ||
      !formData.ifscCode.trim()
    ) {
      toast.error("Please fill in all required bank and tax fields")
      return false
    }

    if (!ifscRegex.test(formData.ifscCode.toUpperCase())) {
      toast.error("Invalid IFSC format")
      return false
    }

    if (!panRegex.test(formData.panNumber.toUpperCase())) {
      toast.error("Invalid PAN format")
      return false
    }

    if (
      !uploadedFiles.businessLicense ||
      !uploadedFiles.panDocument ||
      !uploadedFiles.bankProof
    ) {
      toast.error("Please upload all required documents")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep3()) return
    setIsLoading(true)

    try {
      const fd = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (["ifscCode", "panNumber", "gstNumber"].includes(key)) {
            fd.append(key, value.toString().toUpperCase())
          } else {
            fd.append(key, value)
          }
        }
      })

     const res = await fetch(`${API_BASE_URL}/seller-kyc/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: fd,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Submission failed")


     /* FIX 2: local auth state sync */
      updateSellerVerificationStatus?.("pending_review")

      toast.success("Submitted successfully! Redirecting...")
      setTimeout(() => {
        navigate("/seller/dashboard", { replace: true })
      }, 800)
    } catch (err) {
      toast.error(err.message || "Submission error")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-3 uppercase tracking-tight">Seller Verification</h1>
          <p className="text-slate-500 text-lg font-medium">Complete your seller verification to start selling on DigiShop</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8 flex gap-4 shadow-sm">
          <AlertCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-black text-indigo-900 uppercase tracking-wide">Verification Required</p>
            <p className="text-sm text-indigo-700 mt-1 font-medium leading-relaxed">
              Your account will be reviewed within 24-48 hours. Make sure all information is accurate to avoid delays.
            </p>
          </div>
        </div>

        {/* Multi-Step Tabs UI */}
        <div className="flex gap-3 md:gap-6 mb-10">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1">
              <button
                type="button"
                onClick={() => currentStep >= step && setCurrentStep(step)}
                className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${
                  currentStep === step
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-y-[-2px]"
                    : currentStep > step
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-100"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Step {step}
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: Store Information */}
          {currentStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 space-y-7 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Store Information</h2>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Name</label>
                <input type="text" placeholder="Enter your store name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.storeName} onChange={(e) => handleInputChange("storeName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                <textarea placeholder="Describe your store" rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.storeDescription} onChange={(e) => handleInputChange("storeDescription", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Type</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-medium appearance-none outline-none" value={formData.businessType} onChange={(e) => handleInputChange("businessType", e.target.value)}>
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={() => validateStep1() && setCurrentStep(2)} className="w-full bg-slate-900 hover:bg-indigo-700 text-white font-black uppercase text-xs py-5 rounded-2xl transition-all shadow-lg active:scale-95">Continue to Address</button>
            </div>
          )}

          {/* STEP 2: Business Address */}
          {currentStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 space-y-7 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Business Address</h2>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Address</label>
                <input type="text" placeholder="Full address" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-medium" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <input type="text" placeholder="City" className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-medium" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} />
                <input type="text" placeholder="State" className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-medium" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} />
              </div>
              <input type="text" placeholder="6-digit Pincode" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-medium" value={formData.pincode} onChange={(e) => handleInputChange("pincode", e.target.value)} />
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setCurrentStep(1)} className="flex-1 bg-slate-100 text-slate-600 font-black uppercase text-xs py-5 rounded-2xl transition">Back</button>
                <button type="button" onClick={() => validateStep2() && setCurrentStep(3)} className="flex-1 bg-slate-900 text-white font-black uppercase text-xs py-5 rounded-2xl shadow-lg active:scale-95">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 3: Bank Details & Upload */}
          {currentStep === 3 && (
            <div className="space-y-8 pb-10">
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 space-y-7 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Bank Information</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Account Number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-medium" value={formData.bankAccountNumber} onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)} />
                  <div className="grid md:grid-cols-2 gap-5">
                    <input type="text" placeholder="IFSC Code" className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-medium" value={formData.ifscCode} onChange={(e) => handleInputChange("ifscCode", e.target.value)} />
                    <input type="text" placeholder="PAN Number" className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-medium" value={formData.panNumber} onChange={(e) => handleInputChange("panNumber", e.target.value)} />
                  </div>
                  <input type="text" placeholder="GST Number (Optional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-medium" value={formData.gstNumber} onChange={(e) => handleInputChange("gstNumber", e.target.value)} />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 space-y-7 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Upload Documents</h2>
                <div className="grid md:grid-cols-1 gap-6">
                  {["businessLicense", "panDocument", "bankProof"].map((doc) => (
                    <div key={doc} className="group">
                      <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 text-center hover:border-indigo-400 transition-all cursor-pointer group">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(doc, e.target.files?.[0])} className="hidden" id={doc} />
                        <label htmlFor={doc} className="cursor-pointer">
                          <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-black uppercase text-slate-500">{doc.replace(/([A-Z])/g, ' $1')}</span>
                            {uploadedFiles[doc] ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />}
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setCurrentStep(2)} className="flex-1 bg-slate-100 text-slate-600 font-black uppercase text-xs py-5 rounded-2xl transition">Back</button>
                  <button type="submit" disabled={isLoading} className="flex-1 bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 text-white font-black uppercase text-xs py-5 rounded-2xl transition shadow-xl flex items-center justify-center gap-3">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Application"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
} 