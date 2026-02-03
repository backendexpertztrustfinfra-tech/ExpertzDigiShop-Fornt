import { useState, useEffect } from "react"
import axios from "axios"
import { 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  Home, 
  Users, 
  ShoppingCart, 
  Package, 
  Truck, 
  IndianRupee, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  TrendingUp,
  ShieldCheck 
} from "lucide-react"
import { useAuth } from "@/context/AuthContext" 
import AdminSellersContent from "./AdminSellersContent"
import AdminCustomerComplaints from "./AdminCustomerComplaints"
import AdminSellerComplaints from "./AdminSellerComplaints"
import AdminReturnExchange from "./AdminReturnExchange"
import AdminOrdersContent from "./AdminOrdersContent"
import AdminDeliveryContent from "./AdminDeliveryContent"
import AdminPaymentsContent from "./AdminPaymentsContent"
import AdminProductApproval from "./AdminProductApproval"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"

const AdminDashboard = () => {
  const { user, userToken, userRole, logout } = useAuth()
  
  const [activeSection, setActiveSection] = useState(() => {
    const saved = localStorage.getItem("adminActiveSection")
    return saved || "dashboard"
  })
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    localStorage.setItem("adminActiveSection", activeSection)
  }, [activeSection])

  useEffect(() => {
    if (userToken && userRole === "admin") {
      fetchDashboardStats()
    }
  }, [userToken, userRole])

  const fetchDashboardStats = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/dashboard/stats`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        },
      )
      setStats(response.data.data)
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminActiveSection") 
    logout()
    window.location.href = "/admin/login"
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, description: "Overview & Analytics" },
    { id: "sellers", label: "Sellers", icon: Users, description: "Manage & Verify Sellers" },
    { id: "products", label: "Products", icon: Package, description: "Product Approval" },
    { id: "customer complaints", label: "Customer Complaints", icon: AlertCircle, description: "Handle Customer Issues" },
    { id: "seller complaints", label: "Seller Complaints", icon: AlertCircle, description: "Handle Seller Issues" },
    { id: "return exchange", label: "Return & Exchange", icon: AlertCircle, description: "Handle Return & Exchange" },
    { id: "orders", label: "Orders", icon: ShoppingCart, description: "Track Orders" },
    { id: "delivery", label: "Delivery", icon: Truck, description: "Manage Partners" },
    { id: "payments", label: "Payments", icon: IndianRupee, description: "Settlement & Payouts" },
  ]

  const StatCard = ({ title, value, change, icon: Icon, bgColor, targetSection }) => (
    <div 
      onClick={() => targetSection && setActiveSection(targetSection)}
      className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm group hover:border-orange-500/30 transition-all duration-300 cursor-pointer active:scale-95"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-white mt-2 tracking-tighter">
            {title.includes("Revenue") ? "₹" : ""}{value?.toLocaleString() || 0}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-[10px] font-bold ${change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              <span className="ml-1 uppercase tracking-tighter">{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl border border-slate-700 bg-slate-800/50 group-hover:scale-110 transition-transform shadow-inner" style={{ color: bgColor }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#0b0f1a] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-24"
        } bg-[#0f172a] border-r border-slate-800 transition-all duration-500 overflow-y-auto flex flex-col z-50 shadow-2xl`}
      >
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter uppercase">
                  DigiShop
                </h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Super Admin Hub</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700"
            >
              {sidebarOpen ? <X size={20} className="text-slate-400" /> : <Menu size={20} className="text-slate-400" />}
            </button>
          </div>
        </div>

        <nav className="p-6 space-y-3 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 relative group ${
                  isActive
                    ? "bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg shadow-orange-900/20"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <div className="text-left">
                    <p className={`font-black text-[10px] uppercase tracking-widest ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                      {item.label}
                    </p>
                  </div>
                )}
                {isActive && <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />}
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-slate-800 mt-auto bg-slate-900/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-rose-600/10 text-rose-500 border border-rose-600/20 hover:bg-rose-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <LogOut size={16} />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <div className="bg-[#0f172a]/50 backdrop-blur-md border-b border-slate-800/50 px-10 py-6 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">
                {menuItems.find((item) => item.id === activeSection)?.description}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <button className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 shadow-xl group">
                <Settings size={18} className="text-slate-400 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#0b0f1a] p-10">
          {activeSection === "dashboard" && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* KPIs - Clickable */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total Revenue" value={stats?.revenue?.total} change={12.5} icon={IndianRupee} bgColor="#ec4899" targetSection="payments" />
                <StatCard title="Total Orders" value={stats?.orders?.total} change={8.2} icon={ShoppingCart} bgColor="#f97316" targetSection="orders" />
                <StatCard title="Total Users" value={stats?.users?.total} change={5.1} icon={Users} bgColor="#eab308" />
                <StatCard title="Active Sellers" value={stats?.sellers?.verified} change={3.4} icon={ShieldCheck} bgColor="#8b5cf6" targetSection="sellers" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Revenue Flow Graph
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats?.monthlyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="_id" stroke="#475569" fontSize={10} tick={{ fontWeight: 'bold' }} />
                      <YAxis stroke="#475569" fontSize={10} tick={{ fontWeight: 'bold' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} dot={{ r: 6, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Fulfillment Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Delivered", value: stats?.orders?.completed || 0 },
                          { name: "Pending", value: stats?.orders?.pending || 0 },
                          { name: "Cancelled", value: stats?.orders?.cancelled || 0 },
                        ]}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={10} dataKey="value" stroke="none"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="px-10 py-8 border-b border-slate-800 bg-slate-900/20">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Live Transaction Stream</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-slate-300">
                    <thead className="bg-slate-950/50 border-b border-slate-800">
                      <tr>
                        <th className="px-10 py-5 text-left text-[9px] font-black uppercase tracking-widest">Order ID</th>
                        <th className="px-10 py-5 text-left text-[9px] font-black uppercase tracking-widest">Entity</th>
                        <th className="px-10 py-5 text-left text-[9px] font-black uppercase tracking-widest">Credit</th>
                        <th className="px-10 py-5 text-center text-[9px] font-black uppercase tracking-widest">Status</th>
                        <th className="px-10 py-5 text-right text-[9px] font-black uppercase tracking-widest">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {stats?.recentOrders?.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-800/30 transition-all group">
                          <td className="px-10 py-5 font-mono text-[10px] font-black text-orange-500">#{order.orderId}</td>
                          <td className="px-10 py-5 text-[10px] font-bold uppercase tracking-tighter text-slate-200">{order.user?.name}</td>
                          <td className="px-10 py-5 text-xs font-black text-white tracking-tighter">₹{order.totalAmount?.toLocaleString()}</td>
                          <td className="px-10 py-5 text-center">
                            <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                order.orderStatus === "delivered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                order.orderStatus === "pending" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-10 py-5 text-[10px] font-black text-slate-500 text-right uppercase italic">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Render Sections */}
          <div className="animate-in slide-in-from-right-10 duration-500">
            {activeSection === "sellers" && <AdminSellersContent />}
            {activeSection === "products" && <AdminProductApproval />}
            {activeSection === "customer complaints" && <AdminCustomerComplaints />}
            {activeSection === "seller complaints" && <AdminSellerComplaints />}
            {activeSection === "return exchange" && <AdminReturnExchange />}
            {activeSection === "orders" && <AdminOrdersContent />}
            {activeSection === "delivery" && <AdminDeliveryContent />}
            {activeSection === "payments" && <AdminPaymentsContent />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard