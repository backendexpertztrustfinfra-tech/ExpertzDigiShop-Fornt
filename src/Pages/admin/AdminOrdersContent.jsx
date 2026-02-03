"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import api from "../../lib/api"
import { toast } from "react-toastify"
import { 
  Package, 
  IndianRupee, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  RefreshCw,
  Clock,
  ChevronRight,
  User,
  MapPin
} from "lucide-react"

export default function AdminOrderManagement() {
  const { userToken } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newStatus, setNewStatus] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    if (userToken) {
      fetchOrders()
    }
  }, [filter, page, userToken])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const statusParam = filter === "all" ? "" : `&status=${filter}`
      const response = await api.get(`/admin-order/all?page=${page}&limit=10${statusParam}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })

      if (response && response.success) {
        setOrders(response.data || [])
        setTotalPages(response.pages || 1)
        setTotalRevenue(response.totalRevenue || 0)
      } else {
        toast.error(response?.message || "Platform synchronization error")
      }
    } catch (error) {
      console.error("Sync Error:", error)
      toast.error("Cloud Synchronization Failed")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, status) => {
    if (!status) return toast.info("Please select a state")
    try {
      const response = await api.put(
        `/admin-order/${orderId}/status`,
        { status, notes: "Admin Dashboard Override" },
        { headers: { Authorization: `Bearer ${userToken}` } },
      )
      if (response && response.success) {
        toast.success(`Protocol: Order shifted to ${status.toUpperCase()}`)
        setSelectedOrder(null)
        fetchOrders()
      }
    } catch (error) {
      toast.error("Status Update Rejected by System")
    }
  }

  const cancelOrder = async (orderId) => {
    if (!window.confirm("FATAL: Terminate this order instance permanently?")) return
    try {
      const response = await api.put(
        `/admin-order/${orderId}/cancel`,
        { reason: "Admin Intervention" },
        { headers: { Authorization: `Bearer ${userToken}` } },
      )
      if (response && response.success) {
        toast.success("Order Instance Nullified")
        fetchOrders()
      }
    } catch (error) {
      toast.error("Cancellation Protocol Failed")
    }
  }

  const statusColors = {
    pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    shipped: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }

  return (
    <div className="p-8 bg-[#0b0f1a] min-h-screen text-slate-200">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter uppercase">
            Order Intelligence
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.2em] font-bold uppercase mt-1">Global Marketplace Controller</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-4">
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <IndianRupee size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gross Revenue</p>
                <p className="text-lg font-black tracking-tighter text-white">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Nodes</p>
                <p className="text-lg font-black tracking-tighter text-white">{orders.length} Active</p>
              </div>
            </div>
          </div>
          
          <button onClick={fetchOrders} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 text-white transition-all active:scale-95" disabled={loading}>
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Filter Nav */}
      <nav className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 mb-8 w-fit shadow-lg">
        <div className="flex items-center px-4 border-r border-slate-800 mr-2">
            <Filter size={14} className="text-orange-500 mr-2" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registry Filter</span>
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {["all", "pending", "confirmed", "processing", "shipped", "delivered"].map((f) => (
            <button 
              key={f} 
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                filter === f 
                ? "bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg shadow-orange-900/20" 
                : "text-slate-500 hover:text-slate-300"
              }`} 
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {f}
            </button>
          ))}
        </div>
      </nav>

      {/* Table Main Area */}
      <main className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
             <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase animate-pulse">Scanning Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-900/80 border-b border-slate-800/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer Entity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Financial Value</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Protocol State</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Timestamp</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {orders.length > 0 ? orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-900/60 transition-all group">
                    <td className="px-8 py-5 font-mono text-[11px] font-black text-orange-400 tracking-tighter uppercase">#{order.orderNumber}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-200 uppercase tracking-tight">{order.user?.name || "Unknown User"}</span>
                        <span className="text-[10px] font-bold text-slate-600">{order.user?.phone || "No Contact"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-white tracking-tighter">₹{order.totalAmount?.toFixed(2)}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        className="px-6 py-2.5 bg-slate-800 hover:bg-gradient-to-r hover:from-pink-600 hover:to-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95" 
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={14} className="inline mr-2" /> Inspect
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center py-32 text-slate-600 font-black uppercase tracking-[0.3em] italic">No Data Found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Pagination */}
      <footer className="mt-8 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button 
            key={i + 1} 
            className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${
              page === i + 1 
              ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-900/20" 
              : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-200"
            }`} 
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </footer>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#0f172a] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Invoice Node: #{selectedOrder.orderNumber}</h2>
                <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Official Fulfillment Verification Report</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all text-xl">×</button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner">
                  <h3 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6 flex items-center gap-2"><User size={16}/> Customer Intelligence</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-slate-800/50 py-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Legal Name</span>
                        <span className="text-xs font-black text-slate-200">{selectedOrder.user?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 py-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Access</span>
                        <span className="text-xs font-black text-slate-200">{selectedOrder.user?.email}</span>
                    </div>
                    <div className="mt-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-2 flex items-center gap-1"><MapPin size={10}/> Shipping Coordinate</p>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                            {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zipCode}
                        </p>
                    </div>
                  </div>
                </section>

                <section className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Package size={16}/> Inventory Breakdown</h3>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex justify-between items-center group">
                        <div className="max-w-[70%]">
                          <p className="text-xs font-black text-slate-200 group-hover:text-orange-400 transition-colors uppercase truncate">{item.product?.name}</p>
                          <p className="text-[9px] text-rose-500 font-black uppercase mt-1 tracking-tighter">VENDOR: {item.seller?.storeName || 'N/A'}</p>
                        </div>
                        <span className="text-[8px] font-black bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 uppercase">{item.sellerOrderStatus}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Action Zone inside modal */}
              <div className="bg-slate-900/80 p-8 rounded-[2rem] border border-slate-800 flex flex-col md:flex-row gap-6 items-center shadow-2xl">
                <div className="flex-1 w-full">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-1">Protocol Override</p>
                    <select 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)} 
                      className="w-full bg-slate-950 p-4 text-xs font-black border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 transition-all text-slate-300 uppercase tracking-widest appearance-none"
                    >
                      <option value="">Select New State</option>
                      {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                </div>
                <div className="flex gap-4 w-full md:w-auto mt-5 md:mt-0 pt-0 md:pt-6">
                  <button 
                    onClick={() => updateStatus(selectedOrder._id, newStatus)} 
                    className="flex-1 md:flex-none px-10 py-4 bg-gradient-to-r from-pink-600 via-orange-600 to-yellow-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Commit
                  </button>
                  <button 
                    onClick={() => cancelOrder(selectedOrder._id)} 
                    className="flex-1 md:flex-none px-10 py-4 bg-rose-600/5 text-rose-500 border border-rose-600/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all"
                  >
                    Nix Node
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}