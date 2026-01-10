import { useEffect, useState } from "react"
import { Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import axios from "axios"
import AdminDashboardLayout from "./AdminDashboardLayout"

const AdminComplaintsPage = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState("")
  const [status, setStatus] = useState("")
  const [pagination, setPagination] = useState({})
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [currentPage, search, priority, status])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/tickets`,
        {
          params: {
            page: currentPage,
            limit: 20,
            search,
            priority,
            status,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      setTickets(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-red-100 text-red-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const handleUpdateTicket = async (ticketId, newStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/tickets/${ticketId}`,
        { status: newStatus, notes: "Updated by admin" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      setShowModal(false)
      fetchTickets()
    } catch (error) {
      console.error("Failed to update ticket:", error)
    }
  }

  return (
    <AdminDashboardLayout activeMenu="complaints">
      <div className="p-6 space-y-6">
        {/* Header with Alert */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={28} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Tickets & Complaints</h1>
              <p className="text-sm text-gray-600 mt-1">Manage customer complaints and support requests</p>
            </div>
          </div>
          <div className="text-center bg-red-50 px-4 py-2 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{pagination.total}</p>
            <p className="text-xs text-red-600">Total Tickets</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by ticket number or subject..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Tickets Table */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.ticketNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ticket.subject}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ticket.user?.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                              ticket.priority,
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket)
                              setShowModal(true)
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold hover:bg-blue-200"
                          >
                            View Details
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
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tickets
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

        {/* Ticket Details Modal */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Ticket ID</p>
                    <p className="font-semibold text-gray-900">{selectedTicket.ticketNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-semibold text-gray-900">{selectedTicket.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getPriorityColor(
                        selectedTicket.priority,
                      )}`}
                    >
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedTicket.description}</p>
                </div>

                {selectedTicket.status !== "closed" && (
                  <div className="mt-6 flex gap-3">
                    {selectedTicket.status !== "in_progress" && (
                      <button
                        onClick={() => handleUpdateTicket(selectedTicket._id, "in_progress")}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                      >
                        Mark In Progress
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateTicket(selectedTicket._id, "resolved")}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateTicket(selectedTicket._id, "closed")}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                    >
                      Close
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

export default AdminComplaintsPage
