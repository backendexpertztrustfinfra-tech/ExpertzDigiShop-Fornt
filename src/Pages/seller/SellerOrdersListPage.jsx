import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ArrowLeft,
  Layers,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"

// FIXED: Using Render URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";
const UPLOAD_BASE_URL = "https://expertz-digishop.onrender.com";

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  processing: <Package className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
}
// jbshdfihsoij
// hlo one 2 3
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
}

export default function SellerOrdersListPage() {
  const navigate = useNavigate()
  const { userToken } = useAuth()

  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [autoRefresh, setAutoRefresh] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // FIXED: Image URL Helper logic for Production
  const getProductImage = (image) => {
    if (!image) return "/placeholder.svg"
    
    let imagePath = String(image);
    
    // Agar DB mein localhost hardcoded hai, toh use Render URL se replace karein
    if (imagePath.includes("localhost:5000")) {
      const splitPath = imagePath.split("/uploads/")[1];
      return `${UPLOAD_BASE_URL}/uploads/${splitPath.replace(/\\/g, "/")}`;
    }

    if (imagePath.startsWith("http")) return imagePath;

    const cleanPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${UPLOAD_BASE_URL}/${cleanPath}`;
  }

  useEffect(() => {
    if (!userToken) {
      navigate("/login")
      return
    }
    fetchSellerOrders()

    const interval = setInterval(fetchSellerOrders, 10000)
    return () => clearInterval(interval)
  }, [userToken, navigate])

  const fetchSellerOrders = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/orders`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setAutoRefresh(new Date().toLocaleTimeString())
      } else {
        toast.error("Failed to load orders")
      }
    } catch (error) {
      console.error("[v0] Error loading orders:", error)
      toast.error("Error loading orders")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/seller-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ itemIndex: 0, sellerOrderStatus: newStatus }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        toast.success(`Order marked as ${newStatus}`)
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, orderStatus: data.order.orderStatus } : order
          )
        )
        setTimeout(fetchSellerOrders, 500)
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to update order status")
      }
    } catch (error) {
      console.error("[v0] Error updating order:", error)
      toast.error("Error updating order status")
    }
  }

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => {
          if (filter === "pending") return o.orderStatus === "pending" || o.orderStatus === "confirmed"
          if (filter === "processing") return o.orderStatus === "processing"
          if (filter === "shipped") return o.orderStatus === "shipped"
          if (filter === "delivered") return o.orderStatus === "delivered"
          return true
        })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3 text-gray-900">
              <Layers className="h-7 w-7 text-blue-600" /> Customer Orders
              <span className="text-sm text-gray-500 font-medium ml-2">({filteredOrders.length})</span>
            </h1>
            {autoRefresh && (
              <p className="text-xs text-gray-500 mt-1">Last updated: {autoRefresh}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchSellerOrders}
              className="h-9 px-3 flex items-center gap-2"
              disabled={refreshing}
            >
              <RefreshCw className="h-4 w-4" />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>

            <Button variant="ghost" onClick={() => navigate("/seller/dashboard")} className="h-9 px-3">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "pending", "processing", "shipped", "delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full font-semibold text-sm transition ${
                filter === status
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-700 border border-gray-200 hover:shadow-sm"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 ? (
          <Card className="rounded-xl shadow-md">
            <CardContent className="p-8 sm:p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-2">No orders found</h2>
              <p className="text-gray-600 mb-4">You don't have any orders with this status yet.</p>
              <div className="flex justify-center">
                <Button onClick={() => navigate("/seller/add-product")} className="h-10">
                  Create Product
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const customerData = order.user || {}
              return (
                <Card key={order._id} className="rounded-xl shadow-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    {/* Top row: Order meta */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                            <p className="text-xs text-gray-500 mt-1">Order ID: {order.orderId || order._id}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>

                          <div className="flex items-start gap-3">
                            <Badge className={`px-3 py-1 rounded-full border ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                              <span className="inline-flex items-center gap-2 text-xs font-semibold">
                                <span className="flex items-center">{statusIcons[order.orderStatus]}</span>
                                <span className="uppercase">{order.orderStatus}</span>
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grid: Customer + Items + Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {/* Left: Customer and small details */}
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium text-gray-700">Customer</p>
                          <p className="text-sm text-gray-800 font-semibold">{customerData.name || "N/A"}</p>
                          <p className="text-xs text-gray-600">{customerData.email || "N/A"}</p>
                          <p className="text-xs text-gray-600">{customerData.phone || "N/A"}</p>
                        </div>

                        <div className="bg-white p-3 rounded-md border border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-2">Delivery</p>
                          <p className="text-sm text-gray-600">{order.shippingAddress?.addressLine1 || "Pickup / N/A"}</p>
                          {order.shippingAddress?.city && (
                            <p className="text-xs text-gray-500 mt-1">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Items list & totals */}
                      <div className="space-y-3">
                        <div className="border rounded-md p-3 bg-white max-h-40 overflow-y-auto">
                          <p className="text-sm font-medium text-gray-700 mb-2">Items ({order.items?.length || 0})</p>
                          <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  {item.product?.images?.[0] && (
                                    <img
                                      src={getProductImage(item.product.images[0])}
                                      alt={item.product?.name}
                                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                                      onError={(e) => {e.target.src = "/placeholder.svg"}}
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name || "Product"}</p>
                                    <p className="text-xs text-gray-500">{item.variant || ""}</p>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-700 whitespace-nowrap">
                                  ₹{item.price?.toLocaleString() || "0"} x {item.quantity}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-lg font-bold text-blue-700">₹{(order.totalAmount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Divider & Products (expanded list) */}
                    <div className="border-t mt-4 pt-4">
                      <p className="text-sm font-medium mb-3">Products</p>
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            {item.product?.images?.[0] && (
                              <img
                                src={getProductImage(item.product.images[0])}
                                alt={item.product?.name}
                                className="w-14 h-14 rounded object-cover flex-shrink-0"
                                onError={(e) => {e.target.src = "/placeholder.svg"}}
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{item.product?.name || "Product"}</p>
                              <p className="text-sm text-gray-600">₹{item.price?.toLocaleString() || 0} x {item.quantity}</p>
                              {item.sku && <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>}
                            </div>
                            <div className="text-sm text-gray-700 font-semibold whitespace-nowrap">
                              ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {!["delivered", "cancelled"].includes(order.orderStatus) && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium w-full md:w-auto">Update Status</p>

                        <div className="flex flex-wrap gap-2">
                          {["processing", "shipped", "delivered"].map((status) => {
                            if (status === order.orderStatus) return null
                            return (
                              <Button
                                key={status}
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateOrderStatus(order._id, status)}
                                className="capitalize h-9"
                              >
                                Mark as {status}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}