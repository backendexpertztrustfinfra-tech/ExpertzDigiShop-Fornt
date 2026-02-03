
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
import "../../../src/Styles/admin-order-management.css"

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
    pending: "#F59E0B",
    confirmed: "#3B82F6",
    processing: "#8B5CF6",
    shipped: "#6366F1",
    delivered: "#10B981",
    cancelled: "#EF4444",
  }

  return (
    <div className="admin-order-container">
      <header className="admin-main-header">
        <div className="header-branding">
          <h1 className="font-black italic uppercase tracking-tighter text-3xl text-zinc-900">
            Order <span className="text-red-600">Intelligence</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Global Marketplace Controller</p>
        </div>

        <div className="analytics-dashboard-cards">
          <div className="analytic-card glass">
            <div className="analytic-icon-box bg-green-50 text-green-600"><IndianRupee size={22} /></div>
            <div className="analytic-content">
              <span className="label">Gross Revenue</span>
              <span className="value">₹{totalRevenue.toLocaleString()}</span>
            </div>
          </div>
          <div className="analytic-card glass">
            <div className="analytic-icon-box bg-blue-50 text-blue-600"><Package size={22} /></div>
            <div className="analytic-content">
              <span className="label">Total Nodes</span>
              <span className="value">{orders.length} Active</span>
            </div>
          </div>
          <button onClick={fetchOrders} className="refresh-btn-circular" disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <nav className="filter-registry">
        <span className="registry-label uppercase"><Filter size={12}/> Filter:</span>
        <div className="filter-nodes">
          {["all", "pending", "confirmed", "processing", "shipped", "delivered"].map((f) => (
            <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => { setFilter(f); setPage(1); }}>{f}</button>
          ))}
        </div>
      </nav>

      <main className="table-zone">
        {loading ? (
          <div className="scanning-overlay"><RefreshCw className="animate-spin text-red-500 mr-2" /><span>Scanning Database...</span></div>
        ) : (
          <div className="table-overflow-wrapper">
            <table className="admin-registry-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Control</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? orders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono text-[11px] font-black">#{order.orderNumber}</td>
                    <td>
                      <div className="user-entity">
                        <span className="entity-name">{order.user?.name || "User"}</span>
                        <span className="entity-sub">{order.user?.phone || ""}</span>
                      </div>
                    </td>
                    <td className="font-black text-zinc-900">₹{order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className="status-pill-solid" style={{ backgroundColor: `${statusColors[order.orderStatus]}20`, color: statusColors[order.orderStatus], border: `1px solid ${statusColors[order.orderStatus]}50` }}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="text-[11px] font-bold text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="inspect-node-btn" onClick={() => setSelectedOrder(order)}><Eye size={14}/> Inspect</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center py-10 font-bold text-zinc-400">NO DATA FOUND</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedOrder && (
        <div className="modal-portal" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => setSelectedOrder(null)}>
          <div className="modal-glass-content" style={{background:'#fff', padding:'30px', borderRadius:'20px', width:'90%', maxWidth:'800px', maxHeight:'90vh', overflowY:'auto'}} onClick={(e) => e.stopPropagation()}>
            <header style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', paddingBottom:'15px', marginBottom:'20px'}}>
              <h2 className="font-black uppercase tracking-tighter">Order Detail: #{selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{fontSize:'24px', fontWeight:'bold'}}>×</button>
            </header>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
              <section className="insight-section">
                <h3 className="section-title" style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'14px', fontWeight:'bold', marginBottom:'10px'}}><User size={16}/> Customer Info</h3>
                <div style={{background:'#f9f9f9', padding:'15px', borderRadius:'10px'}}>
                  <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  <p style={{marginTop:'10px', fontSize:'12px'}}><MapPin size={12} style={{display:'inline'}}/> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</p>
                </div>
              </section>

              <section className="insight-section">
                <h3 className="section-title" style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'14px', fontWeight:'bold', marginBottom:'10px'}}><Package size={16}/> Item List</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={{background:'#fff', border:'1px solid #eee', padding:'10px', borderRadius:'10px', display:'flex', justifyContent:'space-between'}}>
                      <div>
                        <p style={{fontSize:'12px', fontWeight:'bold'}}>{item.product?.name}</p>
                        <p style={{fontSize:'10px', color:'red'}}>Vendor: {item.seller?.storeName || 'N/A'}</p>
                      </div>
                      <span style={{fontSize:'10px', background:'#eee', padding:'2px 8px', borderRadius:'5px', height:'fit-content'}}>{item.sellerOrderStatus}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="command-override-actions" style={{marginTop:'30px', paddingTop:'20px', borderTop:'1px solid #eee', display:'flex', gap:'15px', alignItems:'center'}}>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{flex:1, padding:'10px', borderRadius:'10px', border:'1px solid #ddd'}}>
                    <option value="">Update System Status</option>
                    {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
                <button className="commit-action-btn" onClick={() => updateStatus(selectedOrder._id, newStatus)} style={{background:'#000', color:'#fff', padding:'10px 20px', borderRadius:'10px', fontWeight:'bold'}}>Commit</button>
                <button onClick={() => cancelOrder(selectedOrder._id)} style={{color:'red', fontWeight:'bold', fontSize:'12px'}}>Nix Order</button>
            </div>
          </div>
        </div>
      )}

      <footer className="pagination-registry">
        <div className="page-nodes">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} className={`node-dot ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
        </div>
      </footer>
    </div>
  )
}