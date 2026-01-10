import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const businessTypes = [
  { value: "Individual/Sole Proprietorship", label: "Individual / Sole Proprietorship" },
  { value: "Partnership Firm", label: "Partnership Firm" },
  { value: "Private Limited Company", label: "Private Limited Company (Pvt Ltd)" },
  { value: "LLP", label: "Limited Liability Partnership (LLP)" },
  { value: "Other", label: "Other" },
]

export default function SellerVerificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const { user, userToken } = useAuth()

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

  const handleFileChange = (field, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit")
        return
      }
      setFormData((prev) => ({ ...prev, [field]: file }))
      setUploadedFiles((prev) => ({ ...prev, [field]: true }))
      toast.success(`${file.name} uploaded successfully`)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!formData.storeName.trim()) {
      toast.error("Store name is required")
      return false
    }
    if (!formData.storeDescription.trim()) {
      toast.error("Store description is required")
      return false
    }
    if (!formData.businessType) {
      toast.error("Business type is required")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      toast.error("Please fill in all address fields")
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!formData.bankAccountNumber.trim() || !formData.ifscCode.trim() || !formData.panNumber.trim()) {
      toast.error("Please fill in all required bank and tax fields")
      return false
    }
    if (!uploadedFiles.businessLicense || !uploadedFiles.panDocument || !uploadedFiles.bankProof) {
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
      const formDataToSend = new FormData()

      formDataToSend.append("storeName", formData.storeName)
      formDataToSend.append("storeDescription", formData.storeDescription)
      formDataToSend.append("businessType", formData.businessType)
      formDataToSend.append("address", formData.address)
      formDataToSend.append("city", formData.city)
      formDataToSend.append("state", formData.state)
      formDataToSend.append("pincode", formData.pincode)
      formDataToSend.append("bankAccountNumber", formData.bankAccountNumber)
      formDataToSend.append("ifscCode", formData.ifscCode)
      formDataToSend.append("panNumber", formData.panNumber)
      formDataToSend.append("gstNumber", formData.gstNumber)

      if (formData.businessLicense) {
        formDataToSend.append("businessLicense", formData.businessLicense)
      }
      if (formData.panDocument) {
        formDataToSend.append("panDocument", formData.panDocument)
      }
      if (formData.bankProof) {
        formDataToSend.append("bankProof", formData.bankProof)
      }

      const response = await fetch(`${API_BASE_URL}/sellers/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Verification submission failed")
        return
      }

      toast.success("Verification documents submitted successfully!")

      setTimeout(() => {
        navigate("/seller/dashboard", { replace: true })
      }, 1500)
    } catch (error) {
      toast.error(error.message || "Submission error")
      console.error("[v0] Verification error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-3 uppercase tracking-tight">Seller Verification</h1>
          <p className="text-slate-500 text-lg font-medium">Complete your seller verification to start selling on DigiShop</p>
        </div>

        {/* Info Alert */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8 flex gap-4 shadow-sm">
          <AlertCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-black text-indigo-900 uppercase tracking-wide">Verification Required</p>
            <p className="text-sm text-indigo-700 mt-1 font-medium leading-relaxed">
              Your account will be reviewed within 24-48 hours. Make sure all information is accurate to avoid delays.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
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
          {/* Step 1: Store Information */}
          {currentStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 space-y-7 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Store Information</h2>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Name</label>
                <input
                  type="text"
                  placeholder="Enter your store name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange("storeName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Store Description</label>
                <textarea
                  placeholder="Describe your store and what you sell"
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={formData.storeDescription}
                  onChange={(e) => handleInputChange("storeDescription", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Type</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none cursor-pointer"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange("businessType", e.target.value)}
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2)
                }}
                className="w-full bg-slate-900 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
              >
                Continue to Address
              </button>
            </div>
          )}

          {/* Step 2: Business Address */}
          {currentStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 space-y-7 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Business Address</h2>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Address</label>
                <input
                  type="text"
                  placeholder="Enter your business address"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pincode</label>
                <input
                  type="text"
                  placeholder="Pincode"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setCurrentStep(3)
                  }}
                  className="flex-1 bg-slate-900 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition shadow-lg active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Bank & Documents */}
          {currentStep === 3 && (
            <div className="space-y-8 pb-10">
              {/* Bank Information */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 space-y-7 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Bank Information</h2>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="Enter your bank account number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="Enter IFSC code"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">PAN Number</label>
                    <input
                      type="text"
                      placeholder="Enter PAN number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange("panNumber", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter GST number if applicable"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 space-y-7 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Upload Documents</h2>

                <div className="grid md:grid-cols-1 gap-6">
                  {/* Business License */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Business License / Registration</label>
                    <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 text-center hover:border-indigo-400 transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("businessLicense", e.target.files?.[0])}
                        className="hidden"
                        id="businessLicense"
                      />
                      <label htmlFor="businessLicense" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-3">
                          {uploadedFiles.businessLicense ? (
                            <>
                              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                              </div>
                              <span className="text-sm font-bold text-emerald-600 uppercase tracking-tight">
                                {formData.businessLicense?.name || "Uploaded"}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                              </div>
                              <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Select File</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">PDF, JPG, PNG (Max 5MB)</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* PAN Document */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">PAN Card / Tax Document</label>
                    <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 text-center hover:border-indigo-400 transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("panDocument", e.target.files?.[0])}
                        className="hidden"
                        id="panDocument"
                      />
                      <label htmlFor="panDocument" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-3">
                          {uploadedFiles.panDocument ? (
                            <>
                              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                              </div>
                              <span className="text-sm font-bold text-emerald-600 uppercase tracking-tight">
                                {formData.panDocument?.name || "Uploaded"}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                              </div>
                              <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Select File</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">PDF, JPG, PNG (Max 5MB)</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Bank Proof */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Bank Account Proof</label>
                    <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 text-center hover:border-indigo-400 transition-all cursor-pointer group">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("bankProof", e.target.files?.[0])}
                        className="hidden"
                        id="bankProof"
                      />
                      <label htmlFor="bankProof" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-3">
                          {uploadedFiles.bankProof ? (
                            <>
                              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                              </div>
                              <span className="text-sm font-bold text-emerald-600 uppercase tracking-tight">
                                {formData.bankProof?.name || "Uploaded"}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                              </div>
                              <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Select File</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">PDF, JPG, PNG (Max 5MB)</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
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