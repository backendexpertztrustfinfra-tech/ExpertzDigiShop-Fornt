import { useEffect, useState } from "react"
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react"
import axios from "axios"
import AdminDashboardLayout from "./AdminDashboardLayout"

const AdminSellersPage = () => {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [verificationStatus, setVerificationStatus] = useState("")
  const [pagination, setPagination] = useState({})
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchSellers()
  }, [currentPage, search, verificationStatus])

  const fetchSellers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/sellers`,
        {
          params: {
            page: currentPage,
            limit: 20,
            search,
            status: verificationStatus,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      setSellers(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error("Failed to fetch sellers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySeller = async (sellerId, status) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/sellers/${sellerId}/verify`,
        { status, notes: "Verified by admin" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      setShowModal(false)
      fetchSellers()
    } catch (error) {
      console.error("Failed to verify seller:", error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle size={20} className="text-green-600" />
      case "pending_review":
        return <Clock size={20} className="text-yellow-600" />
      case "rejected":
        return <XCircle size={20} className="text-red-600" />
      default:
        return null
    }
  }

  return (
    <AdminDashboardLayout activeMenu="sellers">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Seller Management</h1>
          <div className="text-sm text-gray-600">
            Total Sellers: <span className="font-bold text-blue-600">{pagination.total}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by store name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={verificationStatus}
            onChange={(e) => {
              setVerificationStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending_review">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Sellers Table */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sellers.map((seller) => (
                      <tr key={seller._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{seller.storeName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{seller.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{seller.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{seller.gstNumber || "N/A"}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(seller.verificationStatus)}
                            <span className="capitalize text-xs font-semibold">
                              {seller.verificationStatus?.replace(/_/g, " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="font-semibold">{seller.averageRating?.toFixed(1)}</span>
                          <span className="text-yellow-400 ml-1">★</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => {
                              setSelectedSeller(seller)
                              setShowModal(true)
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold hover:bg-blue-200"
                          >
                            {seller.verificationStatus === "verified" ? "View" : "Verify"}
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
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} sellers
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

        {/* Seller Details Modal */}
        {showModal && selectedSeller && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedSeller.storeName}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Owner Name</p>
                    <p className="font-semibold text-gray-900">{selectedSeller.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{selectedSeller.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedSeller.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="font-semibold text-gray-900">{selectedSeller.gstNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="font-semibold text-gray-900">{selectedSeller.panNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank Account</p>
                    <p className="font-semibold text-gray-900">{selectedSeller.bankAccountNumber}</p>
                  </div>
                </div>

                {selectedSeller.verificationDocuments && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Verification Documents</h3>
                    <div className="space-y-2">
                      {selectedSeller.verificationDocuments.businessLicense && (
                        <p className="text-sm text-gray-600">
                          Business License:{" "}
                          <a
                            href={selectedSeller.verificationDocuments.businessLicense}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedSeller.verificationStatus === "pending_review" && (
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleVerifySeller(selectedSeller._id, "verified")}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifySeller(selectedSeller._id, "rejected")}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}

export default AdminSellersPage
