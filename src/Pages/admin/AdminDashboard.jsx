import { useEffect, useState } from "react"
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
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react"
import axios from "axios"
import AdminDashboardLayout from "./AdminDashboardLayout"

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/dashboard/stats`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      setStats(response.data.data)
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminDashboardLayout activeMenu="dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminDashboardLayout>
    )
  }

  const StatCard = ({ title, value, change, icon: Icon, bgColor }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: bgColor }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value?.toLocaleString()}</p>
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
    <AdminDashboardLayout activeMenu="dashboard">
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
          <StatCard title="Total Users" value={stats?.users?.total} change={5.1} icon={TrendingUp} bgColor="#F59E0B" />
          <StatCard
            title="Active Sellers"
            value={stats?.sellers?.verified}
            change={3.4}
            icon={TrendingUp}
            bgColor="#8B5CF6"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 12 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Completed", value: stats?.orders?.completed, fill: "#10B981" },
                    { name: "Pending", value: stats?.orders?.pending, fill: "#F59E0B" },
                    { name: "Cancelled", value: stats?.orders?.cancelled, fill: "#EF4444" },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[{ fill: "#10B981" }, { fill: "#F59E0B" }, { fill: "#EF4444" }].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Support Tickets</h4>
            <p className="text-2xl font-bold text-red-600">{stats?.support?.openTickets}</p>
            <p className="text-xs text-gray-500 mt-2">Open tickets</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Seller Verification</h4>
            <p className="text-2xl font-bold text-blue-600">{stats?.sellers?.pendingVerification}</p>
            <p className="text-xs text-gray-500 mt-2">Pending verification</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Avg Order Value</h4>
            <p className="text-2xl font-bold text-green-600">₹{stats?.revenue?.avgOrderValue?.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Average transaction</p>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
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
    </AdminDashboardLayout>
  )
}

export default AdminDashboard
