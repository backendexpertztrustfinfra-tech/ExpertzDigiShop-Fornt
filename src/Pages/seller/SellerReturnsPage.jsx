import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { RotateCcw, Search, X, Check, AlertCircle, Package, TrendingUp } from "lucide-react"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const STATUS_COLORS = {
  initiated: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  pickup_requested: "bg-yellow-100 text-yellow-800",
  picked_up: "bg-purple-100 text-purple-800",
  received: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  shipped_back: "bg-indigo-100 text-indigo-800",
}

const REASON_LABELS = {
  defective: "Product Defective",
  not_as_described: "Not As Described",
  size_mismatch: "Size Mismatch",
  changed_mind: "Changed Mind",
  other: "Other",
}

export default function SellerReturnsPage() {
  const { userToken } = useAuth()
  const [returns, setReturns] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [tabType, setTabType] = useState("returns")
  const [rejectReason, setRejectReason] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedForAction, setSelectedForAction] = useState(null)

  useEffect(() => {
    fetchData()
  }, [userToken])

  const fetchData = async () => {
    try {
      setLoading(true)

      const returnsRes = await fetch(`${API_BASE_URL}/returns/seller/returns`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      const returnsData = await returnsRes.json()
      if (returnsData.success) {
        setReturns(returnsData.returns || [])
      }

      const exchangesRes = await fetch(`${API_BASE_URL}/returns/seller/exchanges`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      const exchangesData = await exchangesRes.json()
      if (exchangesData.success) {
        setExchanges(exchangesData.exchanges || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching returns/exchanges:", error)
      toast.error("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (returnId, isExchange = false) => {
    try {
      const endpoint = isExchange
        ? `/returns/exchange/${returnId}/approve`
        : `/returns/${returnId}/approve`

      const body = trackingNumber ? { trackingNumber } : {}

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast.success(isExchange ? "Exchange approved" : "Return approved")
        setTrackingNumber("")
        setSelectedReturn(null)
        fetchData()
      } else {
        toast.error("Failed to approve")
      }
    } catch (error) {
      console.error("[v0] Error approving:", error)
      toast.error("Error approving request")
    }
  }

  const handleReject = async (returnId, isExchange = false) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    try {
      const endpoint = isExchange
        ? `/returns/exchange/${returnId}/reject`
        : `/returns/${returnId}/reject`

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      })

      if (response.ok) {
        toast.success(isExchange ? "Exchange rejected" : "Return rejected")
        setRejectReason("")
        setShowRejectModal(false)
        setSelectedReturn(null)
        fetchData()
      } else {
        toast.error("Failed to reject")
      }
    } catch (error) {
      console.error("[v0] Error rejecting:", error)
      toast.error("Error rejecting request")
    }
  }

  const currentData = tabType === "returns" ? returns : exchanges
  const totalRequests = currentData.length
  const pendingCount = currentData.filter((r) => r.status === "initiated").length
  const approvedCount = currentData.filter((r) => r.status === "approved").length
  const completedCount = currentData.filter((r) => r.status === "completed").length
  const rejectedCount = currentData.filter((r) => r.status === "rejected").length

  const filteredData = currentData.filter((item) => {
    if (!item) return false
    if (statusFilter !== "all" && item.status !== statusFilter) return false

    const searchLower = searchTerm.toLowerCase()
    return (
      item.returnNumber?.includes(searchTerm) ||
      item.reason?.toLowerCase().includes(searchLower) ||
      item.user?.name?.toLowerCase().includes(searchLower) ||
      item.user?.email?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Return & Exchange Requests
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all customer return and exchange requests
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-6 border-b mb-8 overflow-x-auto">
          <button
            onClick={() => {
              setTabType("returns")
              setStatusFilter("all")
            }}
            className={`pb-3 flex items-center gap-2 font-medium whitespace-nowrap transition
            ${
              tabType === "returns"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <RotateCcw size={18} />
            Returns ({returns.length})
          </button>

          <button
            onClick={() => {
              setTabType("exchanges")
              setStatusFilter("all")
            }}
            className={`pb-3 flex items-center gap-2 font-medium whitespace-nowrap transition
            ${
              tabType === "exchanges"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Package size={18} />
            Exchanges ({exchanges.length})
          </button>
        </div>

        {/* STATUS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            ["all", "Total", totalRequests, TrendingUp, "purple"],
            ["initiated", "Pending", pendingCount, AlertCircle, "blue"],
            ["approved", "Approved", approvedCount, Check, "green"],
            ["completed", "Completed", completedCount, Package, "emerald"],
            ["rejected", "Rejected", rejectedCount, X, "red"],
          ].map(([key, label, count, Icon, color]) => (
            <div
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`cursor-pointer bg-white rounded-xl p-4 border transition hover:shadow-lg
              ${
                statusFilter === key
                  ? `border-${color}-600`
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <Icon className={`text-${color}-600`} size={28} />
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by return number, reason or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* LIST */}
        {filteredData.length > 0 ? (
          <div className="space-y-4">
            {filteredData.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedReturn(item)}
                className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.returnNumber}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {item.user?.name} • {REASON_LABELS[item.reason]}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-16">
            No {tabType} found
          </p>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between">
              <div>
                <h2 className="font-bold text-lg">
                  {tabType === "exchanges" ? "Exchange" : "Return"} Details
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedReturn.returnNumber}
                </p>
              </div>
              <button onClick={() => setSelectedReturn(null)}>
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">
                  <b>Customer:</b> {selectedReturn.user?.name}
                </p>
                <p className="text-sm">
                  <b>Email:</b> {selectedReturn.user?.email}
                </p>
              </div>

              {selectedReturn.status === "initiated" && (
                <div className="border-t pt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Tracking number (optional)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleApprove(
                          selectedReturn._id,
                          tabType === "exchanges"
                        )
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedForAction(selectedReturn._id)
                        setShowRejectModal(true)
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b font-bold">Reject Request</div>
            <div className="p-6 space-y-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full border rounded-lg p-3 h-28"
              />
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleReject(
                      selectedForAction,
                      tabType === "exchanges"
                    )
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
