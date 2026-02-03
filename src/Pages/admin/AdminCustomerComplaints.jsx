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

const API_BASE = import.meta.env.VITE_API_URL
const SOCKET_URL = API_BASE.replace("/api", "")

const STATUS_COLORS = {
  open: "bg-yellow-900/30 text-yellow-500 border border-yellow-500/50",
  in_progress: "bg-blue-900/30 text-blue-500 border border-blue-500/50",
  FORWARDED_TO_SELLER: "bg-purple-900/30 text-purple-500 border border-purple-500/50",
  resolved: "bg-green-900/30 text-green-500 border border-green-500/50",
  closed: "bg-gray-700 text-gray-300",
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

  if (loading) return <div className="h-screen bg-gray-950 flex items-center justify-center text-blue-500 font-black">SYNCING DISPUTE CORE...</div>

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen text-gray-100 text-left font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-900 pb-8">
        <h2 className="text-3xl font-black flex items-center gap-3 uppercase italic tracking-tighter">
          <Zap className="text-yellow-500 fill-yellow-500" size={32} /> Dispute CommandCenter
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {Object.keys(STATUS_COLORS).map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-6 py-2 rounded-2xl text-[10px] font-black transition-all border uppercase tracking-[0.2em] ${
                statusFilter === status 
                  ? "bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-900/40" 
                  : "bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300"
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-3xl backdrop-blur-xl">
        <table className="w-full">
          <thead className="bg-gray-950/80">
            <tr>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-gray-800">Operational ID</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-gray-800">Source & Entity</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-gray-800">Signal Subject</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-gray-800">Priority</th>
              <th className="px-8 py-6 text-right text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-gray-800">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {complaints.map((c) => (
              <tr key={c._id} className="hover:bg-blue-500/5 transition-all group">
                <td className="px-8 py-5">
                  <div className="text-xs text-blue-400 font-mono font-black">#{c.ticketNumber}</div>
                  <div className={`text-[9px] font-black uppercase mt-1.5 flex items-center gap-1.5 ${c.order ? 'text-purple-400' : 'text-cyan-400'}`}>
                    {c.order ? <ShoppingBag size={10}/> : <Globe size={10}/>}
                    {c.order ? `REF: ${c.order.orderNumber}` : 'General Inquiry'}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-sm text-gray-200 font-black italic">
                    <User size={14} className="text-blue-500" /> {c.customerName || c.user?.name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1.5 font-bold uppercase tracking-tighter">
                    <Store size={12} className={c.order ? 'text-orange-500' : 'text-gray-700'} /> 
                    {c.order ? (c.relatedSeller?.storeName || c.order?.seller?.storeName || "Authorized Merchant") : "Direct Corporate Hub"}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-xs text-gray-300 font-bold uppercase tracking-tight leading-none">{c.subject}</div>
                  <div className="text-[9px] text-gray-600 font-black uppercase mt-1">{new Date(c.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-8 py-5">
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${STATUS_COLORS[c.status] || "bg-gray-700"}`}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => setSelected(c)} className="p-3 bg-gray-800 group-hover:bg-blue-600 rounded-2xl text-white transition-all shadow-xl hover:scale-105 active:scale-95">
                    <MessageSquare size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-800 w-full max-w-5xl rounded-[3rem] border border-gray-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-10 py-8 bg-gray-900 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/40"><ShieldCheck className="text-white" size={24} /></div>
                <div className="text-left">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">
                    {selected.order ? 'Investigation Node' : 'Corporate Inquiry'}
                  </h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">Relay ID: {selected.ticketNumber}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-3 bg-gray-700 rounded-full hover:bg-red-500 transition-all active:rotate-90">
                <XCircle className="text-white" size={24} />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-12 overflow-y-auto custom-scrollbar">
              <div className="space-y-6 text-left">
                <div className="bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-700 space-y-6 shadow-inner">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Client Signal Profile</h4>
                   <div className="space-y-4">
                      <p className="text-lg font-black text-white italic leading-none">{selected.customerName || selected.user?.name}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold tracking-tight"><Mail size={12} className="text-blue-500"/> {selected.customerEmail || selected.user?.email}</div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold tracking-tight"><Phone size={12} className="text-blue-500"/> {selected.customerPhone || "Signal Lost"}</div>
                      </div>
                   </div>
                   <div className="pt-6 border-t border-gray-800 text-[11px] text-gray-400 font-bold italic leading-relaxed">
                     "{selected.description}"
                   </div>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col space-y-6">
                <div className="bg-gray-950 rounded-[2.5rem] p-8 h-[400px] overflow-y-auto space-y-5 border border-gray-700 custom-scrollbar shadow-inner">
                  {selected.messages?.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.senderRole === 'admin' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[75%] p-5 rounded-[1.8rem] text-[12px] font-bold shadow-sm ${
                        m.senderRole === 'admin' ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/30' : 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'
                      }`}>
                        {m.message}
                      </div>
                      <span className="text-[8px] opacity-40 font-black uppercase mt-1 tracking-widest italic px-2">
                        {m.senderRole} • {formatTime(m.createdAt || m.timestamp)}
                      </span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 text-left">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Input official corporate response..."
                      className="flex-1 px-8 py-5 bg-gray-900 border border-gray-700 rounded-3xl text-gray-100 font-bold focus:outline-none focus:border-blue-500 shadow-2xl placeholder:text-gray-700 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage} className="p-5 bg-blue-600 hover:bg-blue-700 rounded-[2rem] text-white shadow-xl shadow-blue-900/30 transition-all active:scale-90">
                      <Send size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => updateStatus("in_progress")} className="py-5 bg-gray-700 hover:bg-gray-600 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] border border-gray-600 transition-all">Internal Review</button>
                    {selected.order ? (
                      <button onClick={forwardToSeller} className="py-5 bg-orange-600 text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-900/30 hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                        <ArrowRight size={14} /> Relay to Merchant
                      </button>
                    ) : (
                      <div className="py-5 bg-gray-900/50 text-gray-700 border border-gray-800 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center opacity-40 cursor-not-allowed italic">HQ Only Protocol</div>
                    )}
                    <button onClick={() => updateStatus("resolved")} className="py-5 bg-green-600 text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-900/30 hover:bg-green-700 transition-all">Resolve Signal</button>
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