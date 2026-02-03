import { useEffect, useState } from "react"
import axios from "axios"
import {
  RotateCcw,
  PackageCheck,
  Truck,
  XCircle,
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowRightLeft,
  Eye,
  Store,
  User,
  Image as ImageIcon
} from "lucide-react"
import { toast } from "react-toastify"

const API_BASE = import.meta.env.VITE_API_URL

const STATUS_COLORS = {
  REQUESTED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  APPROVED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PICKED_UP: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  RECEIVED_BY_SELLER: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  REPLACEMENT_SHIPPED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  REFUNDED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  CLOSED: "bg-slate-800 text-slate-500 border-slate-700",
}

const TYPE_BADGE = {
  RETURN: "bg-rose-600/20 text-rose-400 border border-rose-500/20",
  EXCHANGE: "bg-blue-600/20 text-blue-400 border border-blue-500/20",
}

const AdminReturnExchange = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [statusFilter, setStatusFilter] = useState("REQUESTED")
  const token = localStorage.getItem("userToken")

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${API_BASE}/admin/returns-exchanges?status=${statusFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRequests(res.data.data || [])
    } catch {
      toast.error("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status) => {
    try {
      await axios.patch(
        `${API_BASE}/admin/returns-exchanges/${selected._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Workflow Updated: ${status.replace(/_/g, " ")}`)
      setSelected(null)
      fetchRequests()
    } catch {
      toast.error("Failed to update process")
    }
  }

  return (
    <div className="p-8 bg-[#0b0f1a] min-h-screen text-slate-200">
      {/* Header & Advanced Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter uppercase flex items-center gap-3">
            <RotateCcw className="text-orange-500 w-8 h-8" />
            Reverse Logistics
          </h2>
          <p className="text-slate-500 text-[10px] tracking-[0.2em] font-bold uppercase mt-1">Admin Central Control Hub</p>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 shadow-xl overflow-x-auto no-scrollbar">
          {Object.keys(STATUS_COLORS).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                statusFilter === s
                  ? "bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg shadow-orange-900/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-2xl">
        {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4 text-center">
                <div className="animate-spin h-10 w-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full" />
                <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase animate-pulse">Scanning Return Registry...</p>
            </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-900/80 border-b border-slate-800/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entities</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Protocol State</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {requests.map((r) => (
                <tr key={r._id} className="hover:bg-slate-900/60 transition-all group cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="px-8 py-6">
                    <div className="text-xs text-orange-400 font-black tracking-tighter">#{r.orderId?.slice(-10).toUpperCase()}</div>
                    <div className="text-[9px] text-slate-500 mt-1 font-bold uppercase tracking-wider">{new Date(r.createdAt).toDateString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-200 uppercase tracking-tight">
                        <User size={14} className="text-slate-500" /> {r.customer?.name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-orange-500 font-bold mt-1 uppercase tracking-tighter">
                        <Store size={14} /> {r.seller?.businessName}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${TYPE_BADGE[r.type]}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block ${STATUS_COLORS[r.status]}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => setSelected(r)}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-gradient-to-r hover:from-pink-600 hover:to-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                    >
                      <Eye size={16} className="inline mr-2" /> Review Audit
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                    <td colSpan="5" className="text-center py-32 text-slate-600 font-black uppercase tracking-[0.3em] italic">Registry Is Empty</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Decision Engine Modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={() => setSelected(null)}>
          <div className="bg-[#0f172a] max-w-5xl w-full rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            
            {/* Evidence & Info Section */}
            <div className="w-full md:w-1/2 bg-slate-900/50 p-10 border-r border-slate-800 space-y-8 overflow-y-auto max-h-[85vh]">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-3xl ${TYPE_BADGE[selected.type]}`}>
                        {selected.type === 'RETURN' ? <RotateCcw size={28}/> : <ArrowRightLeft size={28}/>}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Case Review</h3>
                      <p className="text-[9px] text-orange-500 font-black uppercase tracking-[0.3em]">Official Evidence Audit</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <ImageIcon size={14}/> Statement & Media
                        </p>
                        <p className="text-xs text-slate-300 italic mb-6 leading-relaxed">"{selected.reason}"</p>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="aspect-square bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-700 text-[10px] font-black uppercase tracking-tighter">Media 01</div>
                             <div className="aspect-square bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-700 text-[10px] font-black uppercase tracking-tighter">Media 02</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Inventory Reference</p>
                        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800">
                             <div className="w-14 h-14 bg-slate-950 rounded-xl border border-slate-800 shadow-inner"></div>
                             <div>
                                <p className="text-xs font-black text-slate-200 uppercase tracking-tight">{selected.productName || "Product Title Placeholder"}</p>
                                <p className="text-[9px] text-orange-500 font-black uppercase mt-1">Order #{selected.orderId?.slice(-6).toUpperCase()}</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Flow Section */}
            <div className="flex-1 p-10 flex flex-col justify-between bg-[#0f172a]">
              <div className="flex justify-between items-center mb-10">
                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-widest ${STATUS_COLORS[selected.status]}`}>
                    Phase: {selected.status.replace(/_/g, " ")}
                </span>
                <button onClick={() => setSelected(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all text-xl">
                  &times;
                </button>
              </div>

              <div className="space-y-5">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Execution Commands:</p>
                
                {/* State-Machine Logic */}
                {selected.status === "REQUESTED" && (
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => updateStatus("APPROVED")} className="py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95">
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button onClick={() => updateStatus("REJECTED")} className="py-5 bg-rose-600/5 text-rose-500 border border-rose-600/10 hover:bg-rose-600 hover:text-white rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95">
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}

                {selected.status === "APPROVED" && (
                  <button onClick={() => updateStatus("PICKED_UP")} className="w-full py-5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                    <Truck size={20} /> Authorize Logistic Pickup
                  </button>
                )}

                {selected.status === "RECEIVED_BY_SELLER" && (
                  <div className="space-y-6">
                    <div className="p-5 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest leading-relaxed">
                        Verification Confirmed. Finalize the financial / inventory settlement to close case.
                    </div>
                    {selected.type === "RETURN" ? (
                      <button onClick={() => updateStatus("REFUNDED")} className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95">
                        <RotateCcw size={20} /> Release Refund
                      </button>
                    ) : (
                      <button onClick={() => updateStatus("REPLACEMENT_SHIPPED")} className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95">
                        <ArrowRightLeft size={20} /> Release Replacement
                      </button>
                    )}
                  </div>
                )}

                {selected.status === "REPLACEMENT_SHIPPED" && (
                  <button onClick={() => updateStatus("CLOSED")} className="w-full py-5 bg-slate-800 hover:bg-emerald-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
                    <PackageCheck size={20} /> Mark Transaction Closed
                  </button>
                )}
                
                {["REFUNDED", "REJECTED", "CLOSED"].includes(selected.status) && (
                    <div className="text-center p-12 bg-slate-950/40 border border-dashed border-slate-800 rounded-[2.5rem]">
                        <ShieldCheck className="mx-auto text-slate-700 mb-3" size={48}/>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Audit Trail Finalized</p>
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

export default AdminReturnExchange