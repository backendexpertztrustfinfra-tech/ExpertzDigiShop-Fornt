
import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { io } from "socket.io-client"
import {
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Store,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  Search,
  ChevronRight
} from "lucide-react"
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
  OPEN: "bg-yellow-900/40 text-yellow-500 border border-yellow-500/30",
  IN_REVIEW: "bg-blue-900/40 text-blue-500 border border-blue-500/30",
  RESOLVED: "bg-green-900/40 text-green-500 border border-green-500/30",
  CLOSED: "bg-gray-700/50 text-gray-400 border border-gray-600",
}

const PRIORITY_COLORS = {
  critical: "bg-red-900/50 text-red-400 border border-red-500/30",
  high: "bg-orange-900/50 text-orange-400 border border-orange-500/30",
  medium: "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30",
  low: "bg-blue-900/50 text-blue-400 border border-blue-500/30",
}

const AdminSellerComplaints = () => {
  const { user, userToken } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState("")
  const [statusFilter, setStatusFilter] = useState("OPEN")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchComplaints = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      const res = await axios.get(
        `${API_BASE}/admin/complaints/sellers?status=${statusFilter}&page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      const data = res.data.data || []
      setComplaints(data)
      
      if (selected) {
        const updated = data.find(c => c._id === selected._id)
        if (updated) setSelected(updated)
      }
    } catch (err) {
      console.error("Error fetching:", err)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [statusFilter, page, userToken, selected?._id])

  useEffect(() => {
    if (userToken) {
      fetchComplaints()
      const socket = io(SOCKET_URL, { auth: { token: userToken } })
      socket.on("connect", () => { if (user?.id) socket.emit("join", user.id) })
      socket.on("new_message", () => fetchComplaints(true))
      socket.on("new_ticket", () => fetchComplaints(true))
      return () => socket.disconnect()
    }
  }, [fetchComplaints, userToken, user?.id])

  useEffect(() => {
    if (selected) scrollToBottom()
  }, [selected?.messages])

  const sendMessage = async () => {
    if (!message.trim()) return
    try {
      await axios.post(
        `${API_BASE}/admin/complaints/${selected._id}/reply`,
        { message, senderRole: "admin" },
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      setMessage("")
      fetchComplaints(true)
    } catch (err) {
      console.error("Send error:", err)
    }
  }

  const updateStatus = async (status) => {
    try {
      await axios.patch(
        `${API_BASE}/admin/complaints/${selected._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      setSelected(null)
      fetchComplaints()
    } catch (err) {
      console.error("Status update error:", err)
    }
  }

  const filteredComplaints = complaints.filter(c => 
    c.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.seller?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatChatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-950 min-h-screen text-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
            <ShieldCheck className="text-orange-500 w-7 h-7 md:w-8 md:h-8" />
            Seller Support Hub
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Resolve disputes raised by your business partners</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search Ticket or Seller..." 
                    className="bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm w-full lg:w-64 text-white outline-none focus:border-orange-500 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex overflow-x-auto gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 no-scrollbar">
                {Object.keys(STATUS_COLORS).map((status) => (
                    <button
                        key={status}
                        onClick={() => { setStatusFilter(status); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all whitespace-nowrap ${
                            statusFilter === status ? "bg-orange-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        {status.replace("_", " ")}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
        {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin h-10 w-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full" />
                <p className="text-gray-500 text-xs animate-pulse">Fetching Seller Tickets...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-900/80 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Tracking</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Seller Entity</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-700/30 transition-all group cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-orange-400 font-mono font-bold tracking-tighter">#{c.ticketNumber}</div>
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                            <Store size={14} />
                        </div>
                        <div className="text-sm font-semibold text-gray-200">{c.seller?.businessName || c.seller?.name || "Unknown Seller"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 italic">
                      {c.subject?.length > 40 ? c.subject.substring(0, 40) + '...' : c.subject}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${STATUS_COLORS[c.status]}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2.5 bg-gray-700 group-hover:bg-orange-600 rounded-xl transition-all shadow-lg text-white">
                        <MessageSquare size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-5xl p-0 border-none shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh] bg-gray-800">
          {selected && (
            <>
              {/* Left Details Panel */}
              <div className="hidden md:flex w-full md:w-80 bg-gray-900/50 p-8 border-r border-gray-700 flex-col justify-between shrink-0 overflow-y-auto">
                <div className="space-y-6">
                    <DialogHeader>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">Ticket Owner</p>
                        <DialogTitle className="text-xl font-bold text-white break-words">{selected.seller?.businessName || selected.seller?.name || "Unknown Seller"}</DialogTitle>
                        <DialogDescription className="text-[10px] text-gray-500 mt-1 break-words">{selected.seller?.email}</DialogDescription>
                    </DialogHeader>
                    <div className="bg-gray-800/80 p-4 rounded-2xl border border-gray-700">
                        <div className="flex items-center gap-2 text-red-400 mb-2 text-[10px] font-bold uppercase">
                            <AlertTriangle size={14} /> Statement of Issue
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed italic break-words">"{selected.description || selected.subject}"</p>
                    </div>
                </div>
                <div className="pt-6 border-t border-gray-800 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Logged: {new Date(selected.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Right Chat Panel */}
              <div className="flex-1 flex flex-col min-w-0 bg-gray-800">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900 md:bg-transparent">
                  <h3 className="font-bold text-sm md:text-lg flex items-center gap-2 text-white">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Investigation Room
                  </h3>
                  <button onClick={() => setSelected(null)} className="p-2 hover:bg-red-500/20 rounded-full transition-colors group">
                      <XCircle size={20} className="text-gray-500 group-hover:text-red-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-950/20 custom-scrollbar">
                  {/* Seller Statement (Left) */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] space-y-1">
                      <div className="p-4 bg-gray-800 text-gray-100 rounded-2xl rounded-tl-none border border-gray-700 shadow-lg">
                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Seller Statement</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.description || selected.subject}</p>
                      </div>
                      <p className="text-[9px] font-bold text-gray-500 px-2">{formatChatTime(selected.createdAt)}</p>
                    </div>
                  </div>

                  {selected.messages?.map((m, i) => {
                    const isAdmin = m.senderRole === 'admin';
                    return (
                      <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className="max-w-[85%] space-y-1">
                          <div className={`p-4 rounded-2xl shadow-xl text-sm border ${
                            isAdmin 
                              ? 'bg-orange-600 text-white border-orange-500 rounded-tr-none' 
                              : 'bg-gray-800 text-gray-100 border-gray-700 rounded-tl-none'
                          }`}>
                            <p className={`text-[9px] font-black uppercase mb-1 opacity-70 tracking-widest ${isAdmin ? 'text-white' : 'text-orange-500'}`}>
                              {isAdmin ? 'Official Response' : 'Seller Feedback'}
                            </p>
                            <p className="break-words whitespace-pre-wrap leading-relaxed">{m.message}</p>
                          </div>
                          <p className={`text-[9px] font-bold text-gray-500 px-2 ${isAdmin ? 'text-right' : 'text-left'}`}>
                            {formatChatTime(m.createdAt || new Date())}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 md:p-6 bg-gray-800 border-t border-gray-700 shrink-0">
                  {selected.status !== "CLOSED" && selected.status !== "RESOLVED" ? (
                    <div className="space-y-4">
                      <div className="flex gap-3 bg-gray-900 border border-gray-700 rounded-2xl p-1.5 focus-within:border-orange-500 transition-all shadow-inner">
                        <input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type response to seller..."
                          className="flex-1 bg-transparent px-4 py-2 text-sm outline-none text-white placeholder:text-gray-600"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!message.trim()}
                          className="px-5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => updateStatus("IN_REVIEW")} className="py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-gray-600 transition-all text-white">
                          <Clock size={14} /> Processing
                        </button>
                        <button onClick={() => updateStatus("RESOLVED")} className="py-3 bg-green-600/10 text-green-500 border border-green-500/20 hover:bg-green-600 hover:text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg transition-all">
                          <CheckCircle size={14} /> Resolve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 py-4 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
                      <ShieldCheck size={18} className="text-gray-600" />
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                        This dispute is closed & locked <br/> Status: {selected.status}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminSellerComplaints