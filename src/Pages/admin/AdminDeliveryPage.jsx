import { useEffect, useState } from "react"
import { Search, ChevronLeft, ChevronRight, MapPin, Phone, Mail } from "lucide-react"
import axios from "axios"
import AdminDashboardLayout from "./AdminDashboardLayout"

const AdminDeliveryPage = () => {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("active")
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchDeliveryPartners()
  }, [currentPage, search, status])

  const fetchDeliveryPartners = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/delivery-partners`,
        {
          params: {
            page: currentPage,
            limit: 20,
            search,
            status,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      setPartners(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error("Failed to fetch delivery partners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (partnerId, currentStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/delivery-partners/${partnerId}`,
        { isActive: !currentStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      fetchDeliveryPartners()
    } catch (error) {
      console.error("Failed to update delivery partner:", error)
    }
  }

  return (
    <AdminDashboardLayout activeMenu="delivery">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Partners</h1>
          <div className="text-sm text-gray-600">
            Total Partners: <span className="font-bold text-blue-600">{pagination.total}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Delivery Partners Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {partners.map((partner) => (
                      <tr key={partner._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{partner.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          {partner.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          {partner.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          {partner.address?.city || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              partner.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {partner.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(partner.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleToggleStatus(partner._id, partner.isActive)}
                            className={`px-3 py-1 rounded text-xs font-semibold ${
                              partner.isActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {partner.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} partners
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  )
}

export default AdminDeliveryPage
