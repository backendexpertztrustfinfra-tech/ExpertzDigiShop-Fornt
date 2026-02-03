import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import {
  MessageSquare,
  PlusCircle,
  Search,
  LifeBuoy,
  Clock,
  CheckCircle,
  ShieldCheck,
  X,
  ChevronRight,
  Send,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = API_BASE_URL.replace("/api", "");

const STATUS_THEMES = {
  OPEN: "bg-red-100 text-red-700 border-red-200",
  IN_REVIEW: "bg-blue-100 text-blue-700 border-blue-200",
  RESOLVED: "bg-green-100 text-green-700 border-green-200",
  CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
};

const SELLER_CATEGORIES = [
  { value: "listing_issue", label: "Catalog & Listing" },
  { value: "payment_issue", label: "Payments & Settlements" },
  { value: "delivery_issue", label: "Logistics & Pickup" },
  { value: "policy_issue", label: "Account & Policies" },
  { value: "return_dispute", label: "Return/Exchange Dispute" },
  { value: "other", label: "General Technical Support" },
];

export default function SellerSupport() {
  const { user, userToken } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    message: "",
  });
  const [replyMessage, setReplyMessage] = useState("");

  const fetchTickets = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const res = await fetch(`${API_BASE_URL}/seller/complaints`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        const data = await res.json();
        setTickets(data.data || []);

        if (selectedTicket) {
          const updated = data.data.find((t) => t._id === selectedTicket._id);
          if (updated) setSelectedTicket(updated);
        }
      } catch {
        toast.error("Compliance Hub unavailable");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [userToken, selectedTicket?._id],
  );

  useEffect(() => {
    fetchTickets();
    const socket = io(SOCKET_URL, { auth: { token: userToken } });
    socket.on("connect", () => {
      if (user?.id) socket.emit("join", user.id);
    });
    socket.on("new_message", () => {
      fetchTickets(false);
    });
    socket.on("status_updated", (data) => {
      fetchTickets(false);
      toast.info(`Ticket status updated to ${data.status}`);
    });
    return () => socket.disconnect();
  }, [fetchTickets, user?.id, userToken]);

  const handleCreateTicket = async () => {
    if (!formData.category || !formData.subject || !formData.message) {
      return toast.warn("Verification failed: All fields required");
    }
    try {
      const res = await fetch(`${API_BASE_URL}/seller/complaints`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Case documented: Admin notified");
        setOpenCreate(false);
        setFormData({ category: "", subject: "", message: "" });
        fetchTickets();
      }
    } catch {
      toast.error("System error: Ticket not raised");
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/seller/complaints/${selectedTicket._id}/reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: replyMessage }),
        },
      );
      if (res.ok) {
        setReplyMessage("");
        fetchTickets(false);
      }
    } catch {
      toast.error("Failed to send message");
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8f9fa]">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full" />
        <p className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Syncing Support Desk...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="text-indigo-600 w-7 h-7" /> Support Terminal
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">
              Manage your business disputes and queries
            </p>
          </div>
          <Button
            onClick={() => setOpenCreate(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12 font-bold shadow-lg transition-all active:scale-95"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Raise New Ticket
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "All Cases",
              val: tickets.length,
              color: "text-indigo-600",
            },
            {
              label: "Open",
              val: tickets.filter((t) => t.status === "OPEN").length,
              color: "text-rose-600",
            },
            {
              label: "In Review",
              val: tickets.filter((t) => t.status === "IN_REVIEW").length,
              color: "text-blue-600",
            },
            {
              label: "Resolved",
              val: tickets.filter((t) => t.status === "RESOLVED").length,
              color: "text-emerald-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by Ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition-all outline-none ring-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
            />
          </div>
          <Select onValueChange={setFilterStatus} defaultValue="all">
            <SelectTrigger className="w-full md:w-48 h-11 rounded-lg border-slate-200 bg-slate-50 font-semibold text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg shadow-xl border-slate-200">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredTickets.length ? (
            filteredTickets.map((ticket) => (
              <Card
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className="rounded-xl border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all shadow-sm group bg-white overflow-hidden"
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                      <MessageSquare className="text-indigo-600" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[11px] font-bold text-slate-400 tracking-tighter">
                          #{ticket.ticketNumber}
                        </span>
                        <Badge
                          className={`${STATUS_THEMES[ticket.status]} text-[10px] font-bold px-2 py-0.5 rounded-md border-none shadow-none`}
                        >
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-slate-800 text-[15px] group-hover:text-indigo-600 transition-colors leading-tight">
                        {ticket.subject}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1">
                        {
                          SELLER_CATEGORIES.find(
                            (c) => c.value === ticket.category,
                          )?.label
                        }{" "}
                        • {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                    size={20}
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-20 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold text-sm">
                No support records found
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-lg rounded-2xl p-0 border-none shadow-2xl overflow-hidden bg-white text-left">
          <div className="p-6 border-b bg-white">
            <DialogTitle className="text-xl font-bold text-slate-900 text-left">
              Raise New Ticket
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 font-medium mt-1 text-left">
              Provide details for faster resolution.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, category: val }))
                }
              >
                <SelectTrigger className="h-11 rounded-lg bg-white border-slate-200 font-semibold text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl">
                  {SELLER_CATEGORIES.map((c) => (
                    <SelectItem
                      key={c.value}
                      value={c.value}
                      className="font-medium text-sm"
                    >
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
                Subject
              </label>
              <Input
                placeholder="Short summary"
                className="h-11 rounded-lg bg-slate-50 border-slate-200 font-medium text-sm"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">
                Description
              </label>
              <Textarea
                placeholder="Details..."
                rows={4}
                className="rounded-lg bg-slate-50 border-slate-200 p-4 font-medium text-sm"
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
              />
            </div>
            <Button
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg mt-2"
              onClick={handleCreateTicket}
            >
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="max-w-2xl rounded-2xl p-0 border-none shadow-2xl overflow-hidden flex flex-col h-[85vh] bg-white">
          {selectedTicket && (
            <>
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0 text-left">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge
                      className={`${STATUS_THEMES[selectedTicket.status]} border-none text-[9px] font-bold px-1.5 h-5`}
                    >
                      {selectedTicket.status}
                    </Badge>
                    <span className="text-slate-500 font-mono text-[10px]">
                      #{selectedTicket.ticketNumber}
                    </span>
                  </div>
                  <DialogTitle className="text-[16px] font-bold leading-tight">
                    {selectedTicket.subject}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Conversation
                  </DialogDescription>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[#f0f2f5] space-y-5">
                <div className="flex flex-col items-end space-y-1">
                  <div className="p-3.5 bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-sm max-w-[80%] border border-indigo-500">
                    <p className="text-[9px] font-black uppercase opacity-60 tracking-wider mb-1">
                      Issue Logged
                    </p>
                    <p className="text-[13px] font-medium leading-relaxed">
                      {selectedTicket.description}
                    </p>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 px-1 uppercase">
                    {new Date(selectedTicket.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {selectedTicket.messages &&
                  selectedTicket.messages
                    .filter((msg) => msg.message !== selectedTicket.description) // ✅ DUPLICATE FILTER LOGIC
                    .map((msg, idx) => {
                      const isAdmin = msg.senderRole === "admin";
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col ${isAdmin ? "items-start text-left" : "items-end text-right"} space-y-1`}
                        >
                          <div
                            className={`p-3.5 rounded-2xl shadow-sm text-[13px] max-w-[80%] leading-relaxed border ${
                              isAdmin
                                ? "bg-white text-slate-800 border-slate-200 rounded-tl-none"
                                : "bg-indigo-600 text-white border-indigo-500 rounded-tr-none"
                            }`}
                          >
                            <p
                              className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isAdmin ? "text-indigo-600" : "text-white/60"}`}
                            >
                              {isAdmin ? "Admin Helpdesk" : "My Reply"}
                            </p>
                            <p className="font-medium">{msg.message}</p>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 px-1 uppercase">
                            {new Date(
                              msg.createdAt || selectedTicket.createdAt,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      );
                    })}
              </div>

              <div className="p-4 bg-white border-t shrink-0">
                {selectedTicket.status !== "CLOSED" &&
                selectedTicket.status !== "RESOLVED" ? (
                  <div className="flex gap-2 items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                    <Input
                      placeholder="Type message..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendReply()}
                      className="h-10 border-none bg-transparent focus-visible:ring-0 shadow-none font-medium text-sm"
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim()}
                      className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-0 shrink-0 shadow-md transition-all active:scale-90 disabled:opacity-50"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Ticket is locked
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
