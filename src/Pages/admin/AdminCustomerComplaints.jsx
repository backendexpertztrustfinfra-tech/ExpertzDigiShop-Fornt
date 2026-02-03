import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { io } from "socket.io-client"
import { 
  Send, Clock, CheckCircle, XCircle, 
  Store, User, AlertTriangle, ShieldCheck, 
  MessageSquare, ArrowRight, Phone, Mail,
  ShoppingBag, HelpCircle, Globe, Zap
} from "lucide-react"
import { toast } from "react-toastify"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const API_BASE = import.meta.env.VITE_API_URL
const SOCKET_URL = API_BASE.replace("/api", "")

const STATUS_COLORS = {
  open: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FORWARDED_TO_SELLER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-slate-800 text-slate-500 border-slate-700",
}

const AdminCustomerComplaints = () => {
  const { user, userToken } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState("")
  const [statusFilter, setStatusFilter] = useState("open")
  const [page, setPage] = useState(1)
  const socketRef = useRef(null)
  const chatEndRef = useRef(null)

  const fetchComplaints = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      const res = await axios.get(
        `${API_BASE}/support/admin/all?status=${statusFilter}&page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      const data = res.data.data || []
      setComplaints(data)
      
      if (selected) {
        const updated = data.find(c => c._id === selected._id)
        if (updated) setSelected(updated)
      }
    } catch (err) {
      if (err.response?.status === 401) toast.error("Unauthorized: Session Expired")
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [statusFilter, page, userToken, selected?._id])

  useEffect(() => {
    if (userToken) {
      fetchComplaints()
      socketRef.current = io(SOCKET_URL, { 
        auth: { token: userToken },
        transports: ["websocket"]
      })

      socketRef.current.on("connect", () => {
        if (user?._id || user?.id) {
          socketRef.current.emit("join", user._id || user.id);
        }
      });
      
      socketRef.current.on("new_customer_ticket", () => {
        toast.info("New Signal Detected: Client Complaint")
        fetchComplaints(true)
      })

      socketRef.current.on("new_customer_message", () => fetchComplaints(true))

      return () => { if (socketRef.current) socketRef.current.disconnect() }
    }
  }, [fetchComplaints, userToken, user?._id, user?.id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selected?.messages])

  const sendMessage = async () => {
    if (!message.trim()) return toast.error("Response Buffer Empty")
    try {
      await axios.post(
        `${API_BASE}/support/message/${selected._id}`,
        { message, senderRole: "admin" },
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      setMessage("")
      fetchComplaints(true)
    } catch {
      toast.error("Transmission Interrupted")
    }
  }

  const updateStatus = async (status) => {
    try {
      await axios.post(
        `${API_BASE}/support/admin/resolve/${selected._id}`,
        { message: `System Protocol: Status changed to ${status}`, status },
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      toast.success(`Protocol Refined: ${status}`)
      setSelected(null)
      fetchComplaints()
    } catch {
      toast.error("Protocol update failed")
    }
  }

  const forwardToSeller = async () => {
    const sellerId = selected.relatedSeller?._id || selected.relatedSeller || selected.order?.seller;
    if (!sellerId) return toast.warn("Origin restricted: No Merchant Link")
    try {
      await axios.patch(
        `${API_BASE}/support/admin/forward/${selected._id}`,
        { sellerId: sellerId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      toast.info("Relayed to Merchant Terminal")
      fetchComplaints()
    } catch {
      toast.error("Relay failed")
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="h-screen bg-[#0b0f1a] flex flex-col items-center justify-center gap-4 text-orange-500">
      <div className="w-12 h-12 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Dispute Core...</p>
    </div>
  )

  return (
    <div className="p-8 bg-[#0b0f1a] min-h-screen text-slate-200 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter uppercase flex items-center gap-3">
            <Zap className="text-orange-500 fill-orange-500/20" size={32} /> Dispute CommandCenter
          </h2>
          <p className="text-slate-500 text-[10px] tracking-[0.2em] font-bold uppercase mt-1">Authorized Protocol Management</p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 shadow-xl overflow-x-auto no-scrollbar">
          {Object.keys(STATUS_COLORS).map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                statusFilter === status 
                  ? "bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-900/80 border-b border-slate-800/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Source & Entity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Subject</th>
                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol State</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {complaints.map((c) => (
                <tr key={c._id} className="hover:bg-slate-900/60 transition-all group cursor-pointer" onClick={() => setSelected(c)}>
                  <td className="px-8 py-5">
                    <div className="text-xs text-orange-400 font-black tracking-tighter uppercase font-mono">#{c.ticketNumber}</div>
                    <div className={`text-[9px] font-black uppercase mt-1.5 flex items-center gap-1.5 ${c.order ? 'text-purple-400' : 'text-cyan-400'}`}>
                      {c.order ? <ShoppingBag size={10}/> : <Globe size={10}/>}
                      {c.order ? `REF: ${c.order.orderNumber}` : 'General Inquiry'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-xs font-black text-slate-200 uppercase tracking-tight italic flex items-center gap-2">
                      <User size={14} className="text-orange-500" /> {c.customerName || c.user?.name}
                    </div>
                    <div className="text-[10px] text-slate-600 font-bold mt-1.5 uppercase tracking-tighter flex items-center gap-2">
                      <Store size={12} className={c.order ? 'text-pink-500' : 'text-slate-700'} /> 
                      {c.order ? (c.relatedSeller?.storeName || c.order?.seller?.storeName || "Merchant Terminal") : "Direct Corporate Hub"}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-xs text-slate-300 font-bold uppercase tracking-tight">{c.subject}</div>
                    <div className="text-[9px] text-slate-600 font-black uppercase mt-1">{new Date(c.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block ${STATUS_COLORS[c.status] || "bg-slate-800"}`}>
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="px-5 py-2.5 bg-slate-800 hover:bg-gradient-to-r hover:from-pink-600 hover:to-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95">
                      <MessageSquare size={16} className="inline mr-2" /> Review Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {complaints.length === 0 && (
            <div className="text-center py-32 text-slate-600 font-black uppercase tracking-[0.3em] italic">No Active Signal Detected</div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={() => setSelected(null)}>
          <div className="bg-[#0f172a] w-full max-w-6xl rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-10 py-8 bg-slate-900/50 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-900/40"><ShieldCheck className="text-white" size={24} /></div>
                <div className="text-left">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                    {selected.order ? 'Investigation Node' : 'Corporate Inquiry'}
                  </h3>
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mt-2">Relay ID: {selected.ticketNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all text-xl">
                &times;
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-12 overflow-y-auto custom-scrollbar">
              <div className="space-y-6 text-left">
                <div className="bg-slate-950/60 p-8 rounded-[2.5rem] border border-slate-800/50 space-y-6 shadow-inner">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Client Signal Profile</h4>
                  <div className="space-y-4">
                    <p className="text-xl font-black text-white italic uppercase tracking-tight">{selected.customerName || selected.user?.name}</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider"><Mail size={12} className="text-orange-500"/> {selected.customerEmail || selected.user?.email}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider"><Phone size={12} className="text-orange-500"/> {selected.customerPhone || "Signal Lost"}</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 font-medium italic leading-relaxed">
                    "{selected.description}"
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col space-y-6">
                <div className="bg-slate-950 rounded-[2.5rem] p-8 h-[400px] overflow-y-auto space-y-5 border border-slate-800 custom-scrollbar shadow-inner relative">
                  {selected.messages?.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.senderRole === 'admin' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-5 rounded-[1.8rem] text-xs font-medium shadow-sm ${
                        m.senderRole === 'admin' 
                          ? 'bg-gradient-to-br from-pink-600 to-orange-600 text-white rounded-tr-none' 
                          : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'
                      }`}>
                        {m.message}
                      </div>
                      <span className="text-[8px] font-black uppercase mt-1.5 tracking-widest text-slate-600 italic px-2">
                        {m.senderRole} • {formatTime(m.createdAt || m.timestamp)}
                      </span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Input official corporate response..."
                      className="flex-1 px-8 py-4 bg-slate-950 border border-slate-800 rounded-[1.5rem] text-slate-200 font-bold focus:outline-none focus:border-orange-500/50 shadow-2xl placeholder:text-slate-800 text-xs"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage} className="p-4 bg-gradient-to-r from-pink-600 to-orange-600 rounded-[1.2rem] text-white shadow-xl active:scale-90 transition-all">
                      <Send size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => updateStatus("in_progress")} className="py-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all text-slate-300">Internal Review</button>
                    {selected.order ? (
                      <button onClick={forwardToSeller} className="py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        <ArrowRight size={14} /> Relay Merchant
                      </button>
                    ) : (
                      <div className="py-4 bg-slate-900 text-slate-700 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center opacity-40 cursor-not-allowed italic">HQ Only</div>
                    )}
                    <button onClick={() => updateStatus("resolved")} className="py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all">Resolve Signal</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCustomerComplaints