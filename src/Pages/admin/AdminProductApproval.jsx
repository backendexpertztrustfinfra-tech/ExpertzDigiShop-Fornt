import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import api, { adminProductAPI } from "../../lib/api"
import { toast } from "react-toastify"

const isValueFilled = (val) => {
  if (val === null || val === undefined) return false
  if (typeof val === "string" && val.trim() === "") return false
  if (Array.isArray(val) && val.length === 0) return false
  if (typeof val === "object" && !Array.isArray(val)) {
    return Object.values(val).some(isValueFilled)
  }
  return true
}

const RenderObject = ({ data }) => {
  return (
    <div className="space-y-2">
      {Object.entries(data || {}).map(([key, value]) => {
        if (!isValueFilled(value)) return null
        if (Array.isArray(value)) {
          return (
            <div key={key} className="mt-3">
              <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">{key}</h4>
              {value.map((item, i) => (
                <div key={i} className="ml-2 border-l-2 border-slate-700 pl-4 my-2 py-1 bg-slate-800/30 rounded-r-lg">
                  <RenderObject data={item} />
                </div>
              ))}
            </div>
          )
        }
        if (typeof value === "object") {
          return (
            <div key={key} className="mt-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{key}</h4>
              <div className="ml-2 border-l-2 border-pink-500/30 pl-4">
                <RenderObject data={value} />
              </div>
            </div>
          )
        }
        return (
          <div key={key} className="flex justify-between items-start gap-4 py-1 border-b border-slate-800/50">
            <span className="text-xs font-medium text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
            <span className="text-xs font-semibold text-slate-200 text-right">{String(value)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminProductApproval() {
  const { userToken } = useContext(AuthContext)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("PENDING")
  const [page, setPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "")

  useEffect(() => { fetchProducts() }, [filter, page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let response
      if (filter === "PENDING") {
        response = await adminProductAPI.getPendingProducts({ page, limit: 12 })
      } else if (filter === "ALL") {
        response = await adminProductAPI.getAllProducts({ page, limit: 12 })
      } else {
        response = await adminProductAPI.getAllProducts({ status: filter, page, limit: 12 })
      }
      setProducts(response.data || [])
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedProduct) return
    try {
      await adminProductAPI.approveProduct(selectedProduct._id)
      toast.success("Product approved successfully")
      closeModal()
      fetchProducts()
    } catch (error) {
      toast.error("Approval failed")
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return toast.error("Rejection reason required")
    try {
      await adminProductAPI.rejectProduct(selectedProduct._id, rejectionReason)
      toast.success("Product rejected")
      closeModal()
      fetchProducts()
    } catch (error) {
      toast.error("Rejection failed")
    }
  }

  const closeModal = () => {
    setSelectedProduct(null)
    setRejectionReason("")
  }

  return (
    <div className="p-8 bg-[#0b0f1a] min-h-screen text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter">
            Product Approval
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.2em] font-bold uppercase mt-1">Manage Product Verifications</p>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 shadow-xl">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all duration-300 ${
                filter === f 
                ? "bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg shadow-orange-900/20" 
                : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-40">
           <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3 max-w-7xl mx-auto">
          {/* List Header - Professional Look */}
          <div className="hidden lg:grid grid-cols-12 px-8 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50 mb-4">
            <div className="col-span-1 text-center">Preview</div>
            <div className="col-span-4">Product & Category</div>
            <div className="col-span-2">Seller Info</div>
            <div className="col-span-2">Pricing</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right px-2">Actions</div>
          </div>

          {products.map((product) => (
            <div key={product._id} className="group bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 hover:border-orange-500/30 rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4">
                
                {/* 1. Image Section */}
                <div className="col-span-1 flex justify-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 shadow-inner group-hover:scale-105 transition-transform">
                    <img 
                      src={product.images?.primary ? `${BASE_URL}/${product.images.primary}` : "/placeholder.svg"} 
                      className="w-full h-full object-cover" 
                      alt={product.name} 
                      onError={(e) => { e.target.src = "/placeholder.svg" }}
                    />
                  </div>
                </div>

                {/* 2. Basic Details */}
                <div className="col-span-4 px-2">
                  <h3 className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors text-sm truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border border-slate-700">
                      {product.category || "General"}
                    </span>
                    {product.brand && <span className="text-[10px] text-slate-500 italic">#{product.brand}</span>}
                  </div>
                </div>

                {/* 3. Seller Details */}
                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-slate-300 truncate">{product.seller?.name || "Expertz Seller"}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5 truncate">{product.seller?.email || "verified_seller"}</p>
                </div>

                {/* 4. Pricing */}
                <div className="col-span-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white tracking-tighter">₹{product.pricing?.sellingPrice || "0"}</span>
                    <span className="text-[9px] text-slate-500 line-through decoration-pink-500/50">MRP ₹{product.pricing?.mrp || "0"}</span>
                  </div>
                </div>

                {/* 5. Status Badge */}
                <div className="col-span-1">
                   <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block ${
                     product.approvalStatus === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                     product.approvalStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                     'bg-rose-500/10 text-rose-400 border-rose-500/20'
                   }`}>
                     {product.approvalStatus}
                   </span>
                </div>

                {/* 6. Review Button */}
                <div className="col-span-2 text-right px-2">
                  <button 
                    onClick={() => setSelectedProduct(product)} 
                    className="w-full lg:w-auto bg-slate-800 hover:bg-gradient-to-r hover:from-pink-600 hover:to-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    Review Audit
                  </button>
                </div>

              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-32 border border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20">
              <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-sm italic">Queue Is Empty</p>
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL remains with the same high-end logic we built before */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl" onClick={closeModal}>
          <div className="bg-[#0f172a] w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">{selectedProduct.name}</h2>
                <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Official QC Verification Report</p>
              </div>
              <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all text-xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <section>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Gallery Assets</h3>
                <div className="flex flex-wrap gap-5">
                  {Object.entries(selectedProduct.images || {}).map(([key, img]) => (
                    img && (
                      <div key={key} className="relative group w-28 aspect-square rounded-2xl overflow-hidden border border-slate-800 hover:border-pink-500/50 transition-all">
                        <img src={`${BASE_URL}/${img}`} className="w-full h-full object-cover" onError={(e) => { e.target.src = "/placeholder.svg" }} />
                        <span className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-black text-white uppercase bg-black/40 backdrop-blur-sm py-1">{key}</span>
                      </div>
                    )
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner"><h3 className="text-[9px] font-black text-pink-500 uppercase tracking-widest mb-4">Identity</h3><RenderObject data={{ description: selectedProduct.description, category: selectedProduct.category, brand: selectedProduct.brand }} /></div>
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner"><h3 className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-4">Financials</h3><RenderObject data={selectedProduct.pricing} /></div>
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner"><h3 className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-4">Stock Data</h3><RenderObject data={selectedProduct.inventory} /></div>
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner"><h3 className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4">Tax Compliance</h3><RenderObject data={selectedProduct.compliance} /></div>
                </div>
                <div className="space-y-6">
                   <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner"><h3 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-4">Origins</h3><RenderObject data={selectedProduct.manufacturer} /></div>
                   <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner"><h3 className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-4">Logistics</h3><RenderObject data={selectedProduct.shipping} /></div>
                </div>
              </div>

              {selectedProduct.variants?.length > 0 && (
                <section className="bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800/50">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-6 border-l-4 border-orange-500 pl-3">Active SKU Variations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {selectedProduct.variants.map((v, i) => (
                      <div key={i} className="p-5 bg-slate-950/60 rounded-[1.5rem] border border-slate-800 hover:border-orange-500/20 transition-all shadow-sm">
                        <h4 className="text-[8px] font-black text-slate-500 mb-3 uppercase tracking-tighter">Line Record #{i + 1}</h4>
                        <RenderObject data={v} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="p-8 bg-slate-900/80 border-t border-slate-800 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full relative">
                <textarea 
                  className="w-full bg-slate-950 p-4 text-xs border border-slate-800 rounded-2xl outline-none focus:border-orange-500 transition-all text-slate-300 min-h-[60px] placeholder:text-slate-700"
                  placeholder="Official auditor feedback or rejection reason (Publicly visible to seller)..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button onClick={handleReject} className="flex-1 md:flex-none px-10 py-4 bg-rose-600/5 text-rose-500 border border-rose-600/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all">Reject</button>
                <button onClick={handleApprove} className="flex-1 md:flex-none px-10 py-4 bg-gradient-to-r from-pink-600 via-orange-600 to-yellow-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-900/10 hover:scale-[1.02] active:scale-95 transition-all">Publish Live</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}