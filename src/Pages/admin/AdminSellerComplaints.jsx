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
  OPEN: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  IN_REVIEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-slate-800 text-slate-500 border-slate-700",
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
      
      return () => {
        socket.off("new_message")
        socket.off("new_ticket")
        socket.disconnect()
      }
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
    <div className="p-8 bg-[#0b0f1a] min-h-screen text-slate-200 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter uppercase flex items-center gap-3">
            <ShieldCheck className="text-orange-500 w-8 h-8" />
            Seller Support Hub
          </h2>
          <p className="text-slate-500 text-[10px] tracking-[0.2em] font-bold uppercase mt-1">Resolve disputes raised by your business partners</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search Ticket or Seller..." 
                    className="bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs w-full lg:w-64 text-white outline-none focus:border-orange-500/50 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 shadow-xl">
                {Object.keys(STATUS_COLORS).map((status) => (
                    <button
                        key={status}
                        onClick={() => { setStatusFilter(status); setPage(1); }}
                        className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
                            statusFilter === status 
                            ? "bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg" 
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        {status.replace("_", " ")}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-2xl">
        {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4 text-center">
                <div className="animate-spin h-10 w-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full" />
                <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase animate-pulse">Syncing Control Room...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-900/80 border-b border-slate-800/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tracking</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Seller Entity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/60 transition-all group cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-8 py-5">
                      <div className="text-xs text-orange-400 font-black tracking-tighter uppercase">#{c.ticketNumber}</div>
                      <div className="text-[9px] text-slate-600 font-bold mt-1 tracking-wider uppercase">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-orange-500 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                            <Store size={14} />
                        </div>
                        <div className="text-xs font-black text-slate-200 uppercase tracking-tight truncate max-w-[150px]">{c.seller?.businessName || c.seller?.name || "Unknown Seller"}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-400 italic font-medium truncate max-w-[200px]">
                      {c.subject}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block ${STATUS_COLORS[c.status]}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="px-5 py-2.5 bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-orange-600 rounded-xl transition-all shadow-lg text-white text-[10px] font-black uppercase tracking-widest">
                        <MessageSquare size={14} className="inline mr-2" /> Review Audit
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
        <DialogContent className="max-w-[95vw] md:max-w-6xl p-0 border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh] bg-[#0f172a] rounded-[2.5rem]">
          {selected && (
            <>
<div className="flex flex-col w-full md:w-80 bg-slate-900/50 p-10 border-r border-slate-800 justify-between shrink-0 overflow-y-auto">
                <div className="space-y-8">
                    <DialogHeader className="text-left">
                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] mb-2">Ticket Owner</p>
                        <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tight break-words">{selected.seller?.businessName || selected.seller?.name}</DialogTitle>
                        <DialogDescription className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 break-words">{selected.seller?.email}</DialogDescription>
                    </DialogHeader>
                    <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner">
                        <div className="flex items-center gap-2 text-pink-500 mb-3 text-[9px] font-black uppercase tracking-widest">
                            <AlertTriangle size={14} /> Statement
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic break-words">"{selected.description || selected.subject}"</p>
                    </div>
                </div>
                <div className="pt-6 border-t border-slate-800 text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">
                    Log: {new Date(selected.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a]">
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/30 md:bg-transparent shrink-0">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Investigation Room
                  </h3>
                  <button onClick={() => setSelected(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all text-xl">
                      &times;
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950/20 custom-scrollbar">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] space-y-2">
                      <div className="p-5 bg-slate-900/60 text-slate-100 rounded-[1.5rem] rounded-tl-none border border-slate-800/50 shadow-inner">
                        <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-2">Seller Initial Log</p>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">{selected.description || selected.subject}</p>
                      </div>
                      <p className="text-[8px] font-black text-slate-600 px-3 uppercase tracking-tighter">{formatChatTime(selected.createdAt)}</p>
                    </div>
                  </div>

                  {selected.messages?.filter(m => m.message !== selected.description).map((m, i) => {
                    const isAdmin = m.senderRole === 'admin';
                    return (
                      <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className="max-w-[85%] space-y-2">
                          <div className={`p-5 rounded-[1.5rem] shadow-xl text-xs border ${
                            isAdmin 
                              ? 'bg-gradient-to-br from-pink-600 to-orange-600 text-white border-none rounded-tr-none' 
                              : 'bg-slate-900/60 text-slate-100 border-slate-800 rounded-tl-none'
                          }`}>
                            <p className={`text-[8px] font-black uppercase mb-2 opacity-70 tracking-widest ${isAdmin ? 'text-white' : 'text-orange-500'}`}>
                              {isAdmin ? 'Official Resolution' : 'Seller Feedback'}
                            </p>
                            <p className="break-words whitespace-pre-wrap leading-relaxed font-medium">{m.message}</p>
                          </div>
                          <p className={`text-[8px] font-black text-slate-600 px-3 uppercase tracking-tighter ${isAdmin ? 'text-right' : 'text-left'}`}>
                            {formatChatTime(m.createdAt || new Date())}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-8 bg-slate-900/80 border-t border-slate-800 shrink-0">
                  {selected.status !== "CLOSED" && selected.status !== "RESOLVED" ? (
                    <div className="flex flex-col gap-6">
                      <div className="flex gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-2 focus-within:border-orange-500 transition-all shadow-inner">
                        <input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type official response..."
                          className="flex-1 bg-transparent px-4 py-3 text-xs outline-none text-white placeholder:text-slate-700 font-medium"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!message.trim()}
                          className="px-6 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-30"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => updateStatus("IN_REVIEW")} className="py-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-slate-700 transition-all text-white tracking-widest">
                          <Clock size={14} /> Processing
                        </button>
                        <button onClick={() => updateStatus("RESOLVED")} className="py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg transition-all tracking-widest">
                          <CheckCircle size={14} /> Resolve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 py-6 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                      <ShieldCheck size={20} className="text-slate-700" />
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] text-center leading-relaxed">
                        Dispute Closed & Locked <br/> Status: {selected.status}
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