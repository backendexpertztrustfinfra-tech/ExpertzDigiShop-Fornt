import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { io } from "socket.io-client"
import { 
  MessageSquare, AlertTriangle, Send, User, 
  Clock, XCircle, Search, ShieldAlert 
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const API_BASE = import.meta.env.VITE_API_URL
const SOCKET_URL = API_BASE.replace("/api", "")

const SellerCustomerIssues = () => {
  const { user, userToken } = useAuth()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const chatEndRef = useRef(null)

  const fetchIssues = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      const res = await axios.get(`${API_BASE}/support/seller/tickets`, {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      const data = res.data.tickets || []
      setIssues(data)
      if (selected) {
        const updated = data.find(i => i._id === selected._id)
        if (updated) setSelected(updated)
      }
    } catch (err) {
      console.error("Fetch failed")
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [userToken, selected?._id])

  useEffect(() => {
    if (userToken) {
      fetchIssues()
      const socket = io(SOCKET_URL, { auth: { token: userToken } })
      socket.on("connect", () => { if (user?.id) socket.emit("join", user.id) })
      socket.on("new_customer_issue", () => fetchIssues(true))
      socket.on("new_customer_message", () => fetchIssues(true))
      return () => {
        socket.off("new_customer_issue")
        socket.off("new_customer_message")
        socket.disconnect()
      }
    }
  }, [fetchIssues, userToken, user?.id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selected?.messages])

  const sendResponse = async () => {
    if (!reply.trim()) return
    try {
      await axios.post(`${API_BASE}/support/seller/reply/${selected._id}`, 
        { message: reply, senderRole: "seller" }, 
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      setReply("")
      fetchIssues(true)
    } catch (err) {
      console.error("Reply failed")
    }
  }

  const filteredIssues = issues.filter(i => 
    i.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter">
            <ShieldAlert className="text-orange-600" size={28} />
            Customer Disputes
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Investigation Portal</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Search Ticket ID..." 
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-orange-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center animate-pulse text-slate-400 font-bold uppercase text-xs tracking-widest">Syncing Disputes...</div>
        ) : filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <div 
              key={issue._id} 
              onClick={() => setSelected(issue)} 
              className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm cursor-pointer hover:border-orange-400 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-orange-600 tracking-tighter">#{issue.ticketNumber}</span>
                  <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{issue.status}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-orange-600 transition-colors">{issue.subject}</h3>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                   <div className="flex items-center gap-1.5"><User size={12}/> {issue.user?.name}</div>
                   <div className="flex items-center gap-1.5"><Clock size={12}/> {new Date(issue.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <button className="h-10 w-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner">
                <MessageSquare size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] border border-dashed border-slate-300 p-20 text-center text-slate-400 font-black uppercase text-sm italic">
            No Active Disputes Forwarded
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl h-[85vh] flex flex-col md:flex-row bg-white rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selected && (
            <>
              <div className="hidden md:flex w-80 bg-slate-900 p-8 flex-col justify-between text-left">
                <div className="space-y-8 text-white">
                  <div>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-3">Incident Report</p>
                    <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-tight">{selected.subject}</DialogTitle>
                    <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase tracking-wide">Client: {selected.user?.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">Order: {selected.order?.orderNumber}</p>
                  </div>
                  <div className="bg-slate-800/80 p-5 rounded-[1.5rem] border border-slate-700/50 space-y-3">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={12}/> Customer Logic</p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium italic break-words">"{selected.description}"</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Logged: {new Date(selected.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-white min-w-0">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                   <h3 className="font-black text-sm text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Sync
                   </h3>
                   <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><XCircle size={24} className="text-slate-400" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                  {selected.messages?.map((m, i) => {
                    const isMe = m.senderRole === 'seller';
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] space-y-1 text-left`}>
                          <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium border ${
                            isMe ? 'bg-orange-600 text-white border-orange-500 rounded-tr-none' : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                          }`}>
                            <p className={`text-[9px] font-black uppercase mb-1 tracking-widest opacity-60`}>{m.senderRole}</p>
                            <p className="whitespace-pre-wrap break-words">{m.message}</p>
                          </div>
                          <p className={`text-[9px] font-bold text-slate-400 px-2`}>{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                  <div className="flex gap-3 bg-slate-100 p-2 rounded-[1.2rem] border border-slate-200 group focus-within:border-orange-500 transition-all">
                    <input 
                      value={reply} 
                      onChange={e => setReply(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && sendResponse()}
                      placeholder="Respond to Dispute..." 
                      className="flex-1 bg-transparent px-3 py-2 text-sm font-bold outline-none text-slate-900" 
                    />
                    <button onClick={sendResponse} disabled={!reply.trim()} className="bg-orange-600 text-white p-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"><Send size={18}/></button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SellerCustomerIssues