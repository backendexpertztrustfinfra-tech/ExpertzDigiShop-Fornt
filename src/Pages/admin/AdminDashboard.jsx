
import { useState, useEffect } from "react"
import axios from "axios"
import { Menu, X, LogOut, Settings, Home, Users, ShoppingCart, Package, Truck, IndianRupee, AlertCircle, ArrowUp, ArrowDown, TrendingUp } from "lucide-react"
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

// Vite specific API URL logic
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"

const AdminDashboard = () => {
  const { user, userToken, userRole, logout } = useAuth()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

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
    logout()
    window.location.href = "/admin/login"
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, description: "Overview & Analytics" },
    { id: "sellers", label: "Sellers", icon: Users, description: "Manage & Verify Sellers" },
    { id: "products", label: "products", icon: Package, description: "products Approval" },
    { id: "customer complaints", label: "Customer Complaints", icon: AlertCircle, description: "Handle Customer Issues" },
    { id: "seller complaints", label: "Seller Complaints", icon: AlertCircle, description: "Handle Seller Issues" },
    { id: "return exchange", label: "Return & Exchange", icon: AlertCircle, description: "Handle Return & Exchange" },
    { id: "orders", label: "Orders", icon: ShoppingCart, description: "Track Orders" },
    { id: "delivery", label: "Delivery", icon: Truck, description: "Manage Partners" },
    { id: "payments", label: "Payments", icon: IndianRupee, description: "Settlement & Payouts" },
  ]

  const StatCard = ({ title, value, change, icon: Icon, bgColor }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: bgColor }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value?.toLocaleString() || 0}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {change >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span className="ml-1">{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${bgColor}15` }}>
          <Icon size={24} style={{ color: bgColor }} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-800 border-r border-gray-700 transition-all duration-300 overflow-y-auto flex flex-col`}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  DigiShop
                </h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <div className="text-left">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-700 mt-auto">
          {sidebarOpen && user && (
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-sm font-semibold text-gray-100">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
              <p className="text-xs text-blue-400 mt-1">Super Admin</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold text-sm"
          >
            <LogOut size={18} />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {menuItems.find((item) => item.id === activeSection)?.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-700 rounded-lg transition">
                <Settings size={20} />
              </button>
              {sidebarOpen && (
                <div className="text-right">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-900">
          {activeSection === "dashboard" && (
            <div className="p-6 space-y-6">
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={stats?.revenue?.total}
                  change={12.5}
                  icon={TrendingUp}
                  bgColor="#3B82F6"
                />
                <StatCard
                  title="Total Orders"
                  value={stats?.orders?.total}
                  change={8.2}
                  icon={TrendingUp}
                  bgColor="#10B981"
                />
                <StatCard
                  title="Total Users"
                  value={stats?.users?.total}
                  change={5.1}
                  icon={TrendingUp}
                  bgColor="#F59E0B"
                />
                <StatCard
                  title="Active Sellers"
                  value={stats?.sellers?.verified}
                  change={3.4}
                  icon={TrendingUp}
                  bgColor="#8B5CF6"
                />
              </div>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Support Tickets</h4>
                  <p className="text-2xl font-bold text-red-600">{stats?.support?.openTickets || 0}</p>
                  <p className="text-xs text-gray-500 mt-2">Open tickets</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Seller Verification</h4>
                  <p className="text-2xl font-bold text-blue-600">{stats?.sellers?.pendingVerification || 0}</p>
                  <p className="text-xs text-gray-500 mt-2">Pending verification</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Avg Order Value</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{stats?.revenue?.avgOrderValue?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Average transaction</p>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-gray-800">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats?.recentOrders?.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderId}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.user?.name}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            ₹{order.totalAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.orderStatus === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.orderStatus === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.orderStatus === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
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
  )
}

export default AdminDashboard