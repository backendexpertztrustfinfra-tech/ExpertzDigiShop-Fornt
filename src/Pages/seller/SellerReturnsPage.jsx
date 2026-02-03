import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import {
  Package, Truck, ArrowRightLeft, Eye, CheckCircle,
  X, Info, Clock, History, Box, BadgeCheck, BadgeX,
  Download, User, ClipboardList, AlertTriangle, ExternalLink
} from "lucide-react"
import { toast } from "react-toastify"

const API_BASE = import.meta.env.VITE_API_URL

const STATUS_BADGE = {
  REQUESTED: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  APPROVED: "bg-blue-100 text-blue-700 border border-blue-200",
  PICKED_UP: "bg-purple-100 text-purple-700 border border-purple-200",
  RECEIVED_BY_SELLER: "bg-orange-100 text-orange-700 border border-orange-200",
  QC_PASSED: "bg-green-100 text-green-700 border border-green-200",
  QC_FAILED: "bg-red-100 text-red-700 border border-red-200",
  REPLACEMENT_SHIPPED: "bg-cyan-100 text-cyan-700 border border-cyan-200",
  REFUNDED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
}

export default function SellerReturnPanel() {
  const { userToken } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => { fetchItems() }, [filter])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/seller/returns-exchanges?status=${filter}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      const data = await res.json()
      setItems(data.data || [])
    } catch {
      toast.error("Reverse Logistics sync failed")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status, extra = {}) => {
    try {
      const res = await fetch(
        `${API_BASE}/seller/returns-exchanges/${selected._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, ...extra }),
        }
      )
      if (res.ok) {
        toast.success(`Marketplace Updated: ${status.replace(/_/g, " ")}`)
        setSelected(null)
        fetchItems()
      }
    } catch {
      toast.error("Action rejected by Marketplace Policy")
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full" />
        <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">Marketplace Syncing...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Reverse Logistics</h1>
            <p className="text-gray-500 font-medium">Standard Managed Marketplace Returns</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
            {["all", "APPROVED", "PICKED_UP", "RECEIVED_BY_SELLER"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === f ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {f === "all" ? "All Requests" : f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* List of Return/Exchange Items */}
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              onClick={() => setSelected(item)}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row justify-between items-center group"
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${item.type === 'RETURN' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                    {item.type === 'RETURN' ? <RotateCcw size={24}/> : <ArrowRightLeft size={24}/>}
                </div>
                <div>
                  <p className="font-mono font-black text-gray-900 text-lg uppercase tracking-tighter">#{item.orderId?.slice(-12)}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    <User size={12}/> {item.customer?.name}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${STATUS_BADGE[item.status]}`}>
                  {item.status.replace(/_/g, " ")}
                </span>
                <div className="p-3 bg-gray-50 group-hover:bg-purple-600 group-hover:text-white rounded-2xl transition-all">
                  <Eye size={20} />
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100">
                  <Package className="mx-auto text-gray-200 mb-4" size={64} />
                  <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm">No Pending Actions</p>
              </div>
          )}
        </div>
      </div>

      {/* MODAL - WORKFLOW CONTROL TOWER */}
      {selected && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full rounded-[3rem] overflow-hidden shadow-2xl border flex flex-col animate-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="p-8 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200"><ClipboardList size={24}/></div>
                 <div>
                    <h2 className="font-black text-gray-900 uppercase tracking-widest text-sm">Logistic Compliance</h2>
                    <p className="font-mono text-xs text-gray-400">Transaction ID: {selected.orderId}</p>
                 </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white rounded-full transition-all">
                <X size={24} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              
              {/* Marketplace Stepper Visual */}
              

              {/* Courier Simulation Box */}
              {["APPROVED", "PICKED_UP"].includes(selected.status) && (
                <div className="bg-blue-900 text-white p-6 rounded-[2rem] space-y-4 shadow-xl shadow-blue-200 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-2">Marketplace Logistics Assigned</p>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xl font-black italic tracking-tighter">DELHIVERY XPRESS</p>
                            <p className="text-[10px] opacity-80 mt-1 font-mono tracking-widest font-bold">AWB: RTN-AMZ-99021</p>
                        </div>
                        <Truck size={40} className="opacity-40" />
                    </div>
                  </div>
                  <div className="absolute right-[-10px] bottom-[-10px] text-white opacity-10 rotate-12"><Package size={100}/></div>
                </div>
              )}

              {/* Reason Box */}
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Info size={12}/> Item Problem Statement
                  </p>
                  <p className="text-sm font-bold text-gray-700 italic">"{selected.reason || "Product quality not as per standard"}"</p>
              </div>

              {/* ACTION ENGINE - STATE MACHINE LOGIC */}
              <div className="pt-4">
                {selected.status === "REQUESTED" && (
                  <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] text-center space-y-3">
                    <Clock className="mx-auto text-amber-500 animate-pulse" size={40} />
                    <p className="text-sm font-black text-amber-800 uppercase tracking-widest">Verification Pending</p>
                    <p className="text-[10px] text-amber-600 font-bold leading-relaxed">Admin is verifying customer proof. Please wait for official approval to initiate pickup.</p>
                  </div>
                )}

                {selected.status === "APPROVED" && (
                  <div className="space-y-4">
                    <button
                        onClick={() => updateStatus("PICKED_UP")}
                        className="w-full py-6 bg-purple-600 hover:bg-purple-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <Truck size={20} /> Acknowledge Courier Pickup
                    </button>
                    <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Mark this once the courier partner collects the item</p>
                  </div>
                )}

                {selected.status === "PICKED_UP" && (
                  <button
                    onClick={() => updateStatus("RECEIVED_BY_SELLER")}
                    className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    <Package size={20} /> Item Arrived at Warehouse
                  </button>
                )}

                {/* UNBOXING & QUALITY CHECK (The Amazon 'Disposition' Logic) */}
                {selected.status === "RECEIVED_BY_SELLER" && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-2 px-2">
                        <BadgeCheck size={16} className="text-purple-500"/>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Quality Disposition (Mandatory)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => updateStatus("QC_PASSED")}
                          className="py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <BadgeCheck size={18} /> QC Passed
                        </button>
                        <button
                          onClick={() => updateStatus("QC_FAILED")}
                          className="py-5 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <BadgeX size={18} /> QC Failed
                        </button>
                    </div>
                  </div>
                )}

                {/* Fulfillment Logic after QC */}
                {selected.status === "QC_PASSED" && (
                  <div className="space-y-4">
                    {selected.type === "EXCHANGE" ? (
                      <div className="space-y-3">
                        <button className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest border border-dashed border-gray-300">
                          <Download size={18} /> Download Exchange Label
                        </button>
                        <button
                          onClick={() => updateStatus("REPLACEMENT_SHIPPED")}
                          className="w-full py-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
                        >
                          <ArrowRightLeft size={20} /> Dispatch Replacement Item
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] text-center space-y-4">
                         <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle size={32}/></div>
                         <div>
                            <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Disposition: Authentic Return</p>
                            <p className="text-[10px] text-emerald-600 font-bold italic mt-2 leading-relaxed uppercase">Admin notified for automated refund processing.</p>
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {selected.status === "QC_FAILED" && (
                   <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-start gap-4 animate-in shake">
                      <AlertTriangle className="text-rose-500 flex-shrink-0" size={24}/>
                      <div>
                         <p className="text-xs font-black text-rose-800 uppercase tracking-widest mb-1">Dispute Triggered</p>
                         <p className="text-[10px] text-rose-600 font-bold leading-relaxed">Product failed warehouse inspection. Please upload unboxing video to Admin ticket within 24 hours.</p>
                      </div>
                   </div>
                )}

                {["REFUNDED", "CLOSED", "REPLACEMENT_SHIPPED"].includes(selected.status) && (
                  <div className="text-center py-12 space-y-4 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                    <CheckCircle className="mx-auto text-emerald-500" size={48} />
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Lifecycle Complete</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">Marketplace case archived</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}