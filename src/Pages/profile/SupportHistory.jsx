import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Send, 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";
const SOCKET_URL = API_BASE.replace("/api", "");

export default function SupportHistory() {
  const { userToken, user } = useAuth(); // User object se ID nikalne ke liye
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  const fetchTickets = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await axios.get(`${API_BASE}/support`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const data = res.data.data;
      setTickets(data);
      
      // Agar ticket khula hai, toh usey real-time update karein
      if (selectedTicket) {
        const updated = data.find(t => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      if (!isSilent) toast.error("Failed to load support history");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchTickets();

      // Socket Setup
      socketRef.current = io(SOCKET_URL, { 
        auth: { token: userToken },
        transports: ["websocket"] 
      });

      // Join personal room based on User ID
      socketRef.current.on("connect", () => {
        if (user?._id || user?.id) {
          socketRef.current.emit("join", user._id || user.id);
        }
      });

      // Listen for Admin's message or status update
      socketRef.current.on("new_customer_message", () => fetchTickets(true));
      socketRef.current.on("status_updated", () => fetchTickets(true));

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [userToken, user?.id, user?._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  const handleSendMessage = async () => {
    if (!reply.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/support/message/${selectedTicket._id}`, 
        { message: reply, senderRole: "customer" },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (res.data.success) {
        setReply("");
        fetchTickets(true); 
      }
    } catch (err) {
      toast.error("Message not sent");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-20 text-center font-bold text-[#E75480] animate-pulse">SYNCING SUPPORT CORE...</div>;

  return (
    <div className="min-h-screen bg-[#FFF5F7] p-4 sm:p-8 text-left selection:bg-[#FF4E50] selection:text-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-[#333] uppercase italic tracking-tighter mb-8 flex items-center gap-3">
          <MessageSquare className="text-[#FF4E50]" /> My Support <span className="text-[#FF4E50]">Tickets</span>
        </h2>

        {!selectedTicket ? (
          <div className="grid gap-4">
            {tickets.length > 0 ? tickets.map(ticket => (
              <div 
                key={ticket._id} 
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white p-6 rounded-[2rem] border border-[#FAD0C4] shadow-sm hover:shadow-md hover:border-[#FF4E50] cursor-pointer transition-all flex justify-between items-center group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-[#E75480] uppercase tracking-widest">#{ticket.ticketNumber}</span>
                    <Badge className={`text-[8px] uppercase font-black tracking-widest ${ticket.status === 'resolved' ? 'bg-green-500' : 'bg-[#FF4E50]'}`}>{ticket.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <h3 className="font-bold text-lg text-zinc-800 group-hover:text-[#FF4E50]">{ticket.subject}</h3>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-tighter mt-1 italic">
                    Signal Active: {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
                <Button variant="ghost" className="rounded-full h-12 w-12 hover:bg-[#FFF5F7] text-[#FF4E50]"><ArrowRight size={24} /></Button>
              </div>
            )) : (
              <div className="text-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-[#FAD0C4]">
                <p className="font-black text-zinc-300 uppercase tracking-widest italic">No Active Communication Channels</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border border-[#FAD0C4]/30 shadow-2xl overflow-hidden flex flex-col h-[650px] animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b bg-zinc-950 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Button onClick={() => setSelectedTicket(null)} variant="ghost" className="text-white hover:bg-zinc-800 rounded-full h-10 w-10 p-0"><ArrowLeft size={20}/></Button>
                  <div>
                    <h4 className="font-black uppercase italic tracking-tighter text-sm">Dispute Signal Node</h4>
                    <p className="text-[10px] text-[#FF4E50] font-black uppercase tracking-widest italic">#{selectedTicket.ticketNumber}</p>
                  </div>
               </div>
               {selectedTicket.status === 'resolved' && <Badge className="bg-green-500 gap-1 font-black uppercase tracking-widest text-[8px] px-3"><CheckCircle size={10}/> Solved</Badge>}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FFF5F7]/30 custom-scrollbar">
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-[1.8rem] border border-[#FAD0C4]/40 text-[11px] font-bold text-zinc-500 mb-8 shadow-inner">
                <span className="text-[#FF4E50] uppercase font-black tracking-[0.2em] block mb-2 border-b border-[#FAD0C4]/20 pb-1">Transmission Subject: {selectedTicket.subject}</span>
                "{selectedTicket.description}"
              </div>
              
              {selectedTicket.messages.map((m, i) => {
                const isMe = m.senderRole === 'customer';
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-[1.5rem] shadow-sm relative ${
                      isMe 
                      ? 'bg-[#FF4E50] text-white rounded-tr-none' 
                      : 'bg-white border border-[#FAD0C4] text-zinc-800 rounded-tl-none'
                    }`}>
                      <p className="text-sm font-bold leading-relaxed">{m.message}</p>
                    </div>
                    <span className="text-[8px] font-black text-zinc-400 mt-1.5 uppercase tracking-[0.1em] px-2 italic">
                      {m.senderRole} • {formatTime(m.createdAt || m.timestamp)}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {selectedTicket.status !== 'resolved' ? (
              <div className="p-4 border-t bg-white flex gap-2">
                <input 
                  className="flex-1 bg-zinc-50 px-6 rounded-full text-sm font-bold outline-none border border-zinc-100 focus:border-[#FF4E50] transition-all placeholder:text-zinc-300"
                  placeholder="Input official response..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!reply.trim()} className="bg-zinc-950 hover:bg-[#FF4E50] rounded-full h-12 w-12 p-0 shadow-xl active:scale-90 transition-all">
                  <Send size={18}/>
                </Button>
              </div>
            ) : (
              <div className="p-5 bg-[#F0FFF4] text-center border-t border-green-100">
                <p className="text-[9px] font-black text-green-600 uppercase tracking-[0.3em]">Protocol Success: Communication Channel Terminated (Resolved)</p>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-center text-[8px] font-black text-zinc-300 uppercase tracking-[0.5em] mt-12 italic">DigiShop Support Protocol v2.0</p>
    </div>
  );
}