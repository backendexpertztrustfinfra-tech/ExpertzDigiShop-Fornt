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
  REQUESTED: "bg-yellow-900/40 text-yellow-400 border border-yellow-500/30",
  APPROVED: "bg-blue-900/40 text-blue-400 border border-blue-500/30",
  PICKED_UP: "bg-purple-900/40 text-purple-400 border border-purple-500/30",
  RECEIVED_BY_SELLER: "bg-orange-900/40 text-orange-400 border border-orange-500/30",
  REPLACEMENT_SHIPPED: "bg-cyan-900/40 text-cyan-400 border border-cyan-500/30",
  REFUNDED: "bg-green-900/40 text-green-400 border border-green-500/30",
  REJECTED: "bg-red-900/40 text-red-400 border border-red-500/30",
  CLOSED: "bg-gray-700 text-gray-300",
}

const TYPE_BADGE = {
  RETURN: "bg-red-600/20 text-red-400 border border-red-500/20",
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
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen text-gray-100">
      {/* Header & Advanced Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
            <RotateCcw className="text-blue-500 w-8 h-8" />
            REVERSE LOGISTICS
          </h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Admin Central Control</p>
        </div>

        <div className="flex gap-1 bg-gray-900 p-1.5 rounded-2xl border border-gray-800 overflow-x-auto shadow-inner">
          {Object.keys(STATUS_COLORS).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-tighter transition-all whitespace-nowrap ${
                statusFilter === s
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-gray-800/40 border border-gray-700 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-2xl">
        {loading ? (
            <div className="p-20 text-center"><div className="animate-spin h-10 w-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto" /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase">Order Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase">Entities</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase text-center">Current State</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50 font-medium">
              {requests.map((r) => (
                <tr key={r._id} className="hover:bg-gray-700/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="text-sm text-blue-400 font-mono font-bold">#{r.orderId?.slice(-10)}</div>
                    <div className="text-[10px] text-gray-500 mt-1 uppercase">{new Date(r.createdAt).toDateString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                        <User size={14} className="text-gray-500" /> {r.customer?.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-orange-400 mt-1">
                        <Store size={14} /> {r.seller?.businessName}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-wider ${TYPE_BADGE[r.type]}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[r.status]}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => setSelected(r)}
                      className="p-3 bg-gray-700 group-hover:bg-blue-600 rounded-2xl text-white transition-all shadow-xl group-hover:scale-110"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Decision Engine Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gray-800 max-w-4xl w-full rounded-[3rem] border border-gray-700 overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* Evidence & Info Section */}
            <div className="w-full md:w-1/2 bg-gray-900/50 p-10 border-r border-gray-700 space-y-8 overflow-y-auto max-h-[85vh]">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-3xl ${TYPE_BADGE[selected.type]}`}>
                        {selected.type === 'RETURN' ? <RotateCcw size={24}/> : <ArrowRightLeft size={24}/>}
                    </div>
                    <h3 className="text-2xl font-black">CASE REVIEW</h3>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <ImageIcon size={12}/> Customer Evidence
                        </p>
                        <p className="text-sm text-gray-300 italic mb-4">"{selected.reason}"</p>
                        <div className="grid grid-cols-2 gap-2">
                             {/* Map through evidence images here if available */}
                             <div className="aspect-square bg-gray-950 rounded-2xl border border-gray-700 flex items-center justify-center text-gray-700">Image 1</div>
                             <div className="aspect-square bg-gray-950 rounded-2xl border border-gray-700 flex items-center justify-center text-gray-700">Image 2</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase">Product Identification</p>
                        <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-2xl">
                             <div className="w-12 h-12 bg-gray-950 rounded-lg"></div>
                             <p className="text-xs font-bold">{selected.productName || "Product Title Placeholder"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Flow Section */}
            <div className="flex-1 p-10 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-10">
                <span className="text-[10px] font-black bg-blue-600/10 text-blue-500 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                    Current Phase: {selected.status}
                </span>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                  <XCircle className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-400 mb-6">Select appropriate action to advance the workflow:</p>
                
                {/* State-Machine Logic: Only show buttons relevant to current status */}
                {selected.status === "REQUESTED" && (
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => updateStatus("APPROVED")} className="py-5 bg-blue-600 hover:bg-blue-700 rounded-3xl text-xs font-black uppercase flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20">
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button onClick={() => updateStatus("REJECTED")} className="py-5 bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white rounded-3xl text-xs font-black uppercase flex items-center justify-center gap-3 transition-all">
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}

                {selected.status === "APPROVED" && (
                  <button onClick={() => updateStatus("PICKED_UP")} className="w-full py-5 bg-purple-600 text-white rounded-3xl text-xs font-black uppercase flex items-center justify-center gap-3 shadow-lg shadow-purple-900/20">
                    <Truck size={20} /> Initiate Pickup Complete
                  </button>
                )}

                {selected.status === "RECEIVED_BY_SELLER" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-xs text-orange-400 font-medium">
                        Seller has confirmed receipt. Finalize the financial/inventory settlement.
                    </div>
                    {selected.type === "RETURN" ? (
                      <button onClick={() => updateStatus("REFUNDED")} className="w-full py-5 bg-green-600 text-white rounded-3xl text-xs font-black uppercase flex items-center justify-center gap-3">
                        <RotateCcw size={20} /> Authorize Refund
                      </button>
                    ) : (
                      <button onClick={() => updateStatus("REPLACEMENT_SHIPPED")} className="w-full py-5 bg-cyan-600 text-white rounded-3xl text-xs font-black uppercase flex items-center justify-center gap-3">
                        <ArrowRightLeft size={20} /> Authorize Replacement
                      </button>
                    )}
                  </div>
                )}

                {selected.status === "REPLACEMENT_SHIPPED" && (
                  <button onClick={() => updateStatus("CLOSED")} className="w-full py-5 bg-gray-700 hover:bg-green-600 rounded-3xl text-xs font-black uppercase flex items-center justify-center gap-3 transition-all">
                    <PackageCheck size={20} /> Mark Exchange Closed
                  </button>
                )}
                
                {/* Fallback info */}
                {["REFUNDED", "REJECTED", "CLOSED"].includes(selected.status) && (
                    <div className="text-center p-10 border-2 border-dashed border-gray-700 rounded-3xl">
                        <ShieldCheck className="mx-auto text-gray-600 mb-2" size={40}/>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Case Finalized</p>
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