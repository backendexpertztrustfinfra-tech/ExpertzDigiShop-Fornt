"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { CheckCircle, XCircle, Clock, Eye, Download } from "lucide-react"
import { toast } from "react-toastify"

const AdminSellersContent = () => {
  const { userToken } = useAuth()
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState("pending")
  const [page, setPage] = useState(1)
  const [verificationNotes, setVerificationNotes] = useState("")

  useEffect(() => {
    fetchSellers()
  }, [filterStatus, page])

  const fetchSellers = async () => {
    try {
      setLoading(true)

      if (!userToken) {
        console.error("[v0] No token found in AuthContext")
        toast.error("Authentication token missing. Please login again.")
        return
      }

      let url

      if (filterStatus === "pending") {
        url = `${import.meta.env.VITE_API_URL}/admin-seller/pending?page=${page}&limit=10`
      } else {
        url = `${import.meta.env.VITE_API_URL}/admin-seller/all?status=${filterStatus}&page=${page}&limit=10`
      }

      console.log("[v0] Fetching sellers from:", url)
      console.log("[v0] Token present:", !!userToken)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Sellers response:", data)
      setSellers(data.data || [])
    } catch (error) {
      console.error("[v0] Fetch sellers error:", error)
      toast.error("Failed to fetch sellers: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSeller = async (sellerId) => {
    try {
      console.log("[v0] Approving seller:", sellerId)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin-seller/approve/${sellerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ verificationNotes }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      toast.success("Seller approved successfully!")
      setShowModal(false)
      setVerificationNotes("")
      fetchSellers()
    } catch (error) {
      console.error("[v0] Approve seller error:", error)
      toast.error("Failed to approve seller: " + error.message)
    }
  }

  const handleRejectSeller = async (sellerId) => {
    try {
      console.log("[v0] Rejecting seller:", sellerId)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin-seller/reject/${sellerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ rejectionReason: verificationNotes }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      toast.success("Seller rejected successfully!")
      setShowModal(false)
      setVerificationNotes("")
      fetchSellers()
    } catch (error) {
      console.error("[v0] Reject seller error:", error)
      toast.error("Failed to reject seller: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading sellers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Seller Management</h2>
        <div className="flex gap-2">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Seller Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Business Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sellers && sellers.length > 0 ? (
                sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-300">{seller.seller?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{seller.seller?.email || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{seller.businessName || "N/A"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                          seller.status === "approved"
                            ? "bg-green-900 text-green-200"
                            : seller.status === "rejected"
                              ? "bg-red-900 text-red-200"
                              : "bg-yellow-900 text-yellow-200"
                        }`}
                      >
                        {seller.status === "approved" ? (
                          <CheckCircle size={16} />
                        ) : seller.status === "rejected" ? (
                          <XCircle size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                        {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedSeller(seller)
                          setShowModal(true)
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No sellers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Seller Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Seller Info */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-white font-medium">{selectedSeller.seller?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white font-medium">{selectedSeller.seller?.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p className="text-white font-medium">{selectedSeller.seller?.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Business Name</label>
                  <p className="text-white font-medium">{selectedSeller.businessName || "N/A"}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="mt-6">
                <h4 className="text-lg font-bold text-white mb-4">Documents</h4>
                <div className="grid grid-cols-1 gap-3">
                  {selectedSeller.businessLicense && (
                    <a
                      href={selectedSeller.businessLicense}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Download size={16} className="text-blue-400" />
                      <span className="text-white">Business License</span>
                    </a>
                  )}
                  {selectedSeller.panDocument && (
                    <a
                      href={selectedSeller.panDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Download size={16} className="text-blue-400" />
                      <span className="text-white">PAN Document</span>
                    </a>
                  )}
                  {selectedSeller.bankProof && (
                    <a
                      href={selectedSeller.bankProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Download size={16} className="text-blue-400" />
                      <span className="text-white">Bank Proof</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Verification Notes */}
              {selectedSeller.status === "pending" && (
                <div className="mt-6">
                  <label className="block text-sm text-gray-400 mb-2">Verification Notes</label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add your verification notes here..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    rows="4"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedSeller.status === "pending" && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectSeller(selectedSeller._id)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApproveSeller(selectedSeller._id)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSellersContent
