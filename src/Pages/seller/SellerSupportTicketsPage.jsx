import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { MessageSquare, Search } from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const STATUS_COLORS = {
  open: "bg-red-100 text-red-700 border border-red-200",
  in_progress: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  resolved: "bg-green-100 text-green-700 border border-green-200",
  closed: "bg-gray-100 text-gray-700 border border-gray-200",
}

const CATEGORY_ICONS = {
  product_quality: "Product Quality",
  shipping_issue: "Shipping Issue",
  damaged_product: "Damaged Product",
  wrong_item: "Wrong Item",
  payment_issue: "Payment Issue",
  other: "Other",
}

export default function SellerSupportTicketsPage() {
  const { userToken } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchTickets()
  }, [userToken])

  const fetchTickets = async () => {
    if (!userToken) return
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/support/seller/tickets`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      const data = await response.json()
      if (data.success) setTickets(data.tickets || [])
    } catch (error) {
      toast.error("Failed to load support tickets")
    } finally {
      setLoading(false)
    }
  }

  const handleResolveTicket = async (ticketId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/support/${ticketId}/resolve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        toast.success("Ticket marked as resolved")
        fetchTickets()
        setIsDialogOpen(false)
        setSelectedTicket(null)
      } else {
        toast.error("Failed to resolve ticket")
      }
    } catch {
      toast.error("Error resolving ticket")
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false
    return (
      ticket.orderId?.toString().includes(searchTerm) ||
      ticket.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const openTickets = tickets.filter((t) => t.status === "open").length
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading support tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 mt-1">
            Manage customer issues & support requests
          </p>
        </div>

        {/* STATUS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { key: "all", label: "All", value: tickets.length },
            { key: "open", label: "Open", value: openTickets },
            { key: "in_progress", label: "In Progress", value: inProgressTickets },
            { key: "resolved", label: "Resolved", value: resolvedTickets },
          ].map((tab) => (
            <div
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`cursor-pointer rounded-xl p-4 bg-white border transition hover:shadow-lg
              ${statusFilter === tab.key ? "border-purple-600 shadow-md" : "border-gray-200"}`}
            >
              <p className="text-sm text-gray-500">{tab.label}</p>
              <p className="text-3xl font-bold text-gray-900">{tab.value}</p>
            </div>
          ))}
        </div>

        {/* TICKETS */}
        <Card className="shadow-xl rounded-xl">
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <CardTitle className="text-xl">All Tickets</CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredTickets.length ? (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => {
                      setSelectedTicket(ticket)
                      setIsDialogOpen(true)
                    }}
                    className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-lg transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            Order #{ticket.orderId}
                          </h3>
                          <Badge className={STATUS_COLORS[ticket.status]}>
                            {ticket.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="font-medium text-gray-800">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Category: {CATEGORY_ICONS[ticket.category]}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14">
                <MessageSquare className="h-14 w-14 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No tickets found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ✅ MODAL – TRANSPARENCY FIXED */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="
            bg-white 
            opacity-100 
            shadow-2xl 
            border 
            rounded-xl 
            max-w-lg 
            max-h-[90vh] 
            overflow-y-auto
          "
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Ticket Details
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Customer support request
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-semibold">#{selectedTicket.orderId}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <p className="font-semibold">{selectedTicket.subject}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Message</p>
                <p className="text-sm bg-gray-100 p-3 rounded-lg text-gray-800">
                  {selectedTicket.message}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge className={STATUS_COLORS[selectedTicket.status]}>
                  {selectedTicket.status.replace(/_/g, " ")}
                </Badge>
              </div>

              {selectedTicket.status !== "resolved" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => handleResolveTicket(selectedTicket._id)}
                  >
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
