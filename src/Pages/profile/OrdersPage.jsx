import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  Eye,
  Download,
  RefreshCw,
  Truck,
  Calendar,
  CreditCard,
  AlertCircle,
  TrendingUp,
  XCircle,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

// FIXED: Using Render URLs for production
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";
const API_IMAGE_BASE = "https://expertz-digishop.onrender.com";

const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase();
  const colorMap = {
    pending: "bg-[#FFF9F0] text-[#FFB800] border-[#FFD700]", 
    confirmed: "bg-[#FFF5F7] text-[#E75480] border-[#FAD0C4]", 
    processing: "bg-[#FFF5F7] text-[#FF4E50] border-[#FAD0C4]", 
    shipped: "bg-blue-50 text-blue-700 border-blue-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    returned: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return colorMap[statusLower] || "bg-gray-100 text-gray-800 border-gray-300";
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

// FIXED: Helper to resolve Image Paths correctly
const resolveImagePath = (imagePath) => {
    if (!imagePath) return "/placeholder.svg";
    
    let path = String(imagePath);
    
    // 1. If path contains localhost, replace it with Render URL
    if (path.includes("localhost:5000")) {
        const splitPart = path.split("/uploads/")[1];
        return `${API_IMAGE_BASE}/uploads/${splitPart.replace(/\\/g, "/")}`;
    }

    // 2. If it's already an HTTP URL (Cloudinary etc.), return as is
    if (path.startsWith("http")) return path;

    // 3. Clean standard relative paths
    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${API_IMAGE_BASE}/${cleanPath}`;
}

const handleDownloadInvoice = async (orderId, userToken) => {
  try {
    const invoicesResponse = await fetch(
      `${API_BASE_URL}/invoices/order/${orderId}`,
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    const invoiceData = await invoicesResponse.json();

    if (invoiceData.invoices && invoiceData.invoices.length > 0) {
      const invoiceId = invoiceData.invoices[0]._id;
      const downloadResponse = await fetch(
        `${API_BASE_URL}/invoices/${invoiceId}/download`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (!downloadResponse.ok) throw new Error("Failed to download invoice");
      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${orderId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully");
    } else {
      toast.error("Invoice not available yet");
    }
  } catch (error) {
    console.error("Error downloading invoice:", error);
    toast.error("Failed to download invoice");
  }
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { userToken } = useAuth();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalSpent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchOrdersData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter === "all" ? "" : statusFilter,
        page: 1,
        limit: 50,
      });
      const response = await fetch(
        `${API_BASE_URL}/orders/filtered?${params}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      toast.error("Error loading orders");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/stats`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (!userToken) {
      navigate("/login");
      return;
    }
    fetchOrdersData();
    fetchOrderStats();
    const interval = setInterval(() => {
      fetchOrdersData();
      fetchOrderStats();
    }, 60000);
    return () => clearInterval(interval);
  }, [userToken, navigate]);

  useEffect(() => {
    if (userToken) fetchOrdersData();
  }, [statusFilter]);

  const handleFilterClick = (status) => {
    setStatusFilter(status);
    setSearchTerm("");
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const handleCancelOrder = async (orderId) => {
    if (
      !confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    )
      return;
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.ok) {
        toast.success("Order cancelled successfully");
        fetchOrdersData();
        fetchOrderStats();
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (error) {
      toast.error("Error cancelling order");
    }
  };

  const statsMap = [
    {
      key: "totalOrders",
      label: "Total Orders",
      icon: <Package className="h-5 w-5 text-[#FF4E50]" />,
      color: "bg-[#FFF5F7]",
      status: "all",
    },
    {
      key: "pending",
      label: "Awaiting",
      icon: <Clock className="h-5 w-5 text-[#FFD700]" />,
      color: "bg-[#FFF9F0]",
      status: "pending",
    },
    {
      key: "shipped",
      label: "On the Way",
      icon: <Truck className="h-5 w-5 text-blue-600" />,
      color: "bg-blue-50",
      status: "shipped",
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      color: "bg-green-50",
      status: "delivered",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      icon: <XCircle className="h-5 w-5 text-[#E75480]" />,
      color: "bg-[#FFF5F7]",
      status: "cancelled",
    },
  ];

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-4 border-[#FF4E50] rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-[#E75480] uppercase tracking-tighter italic">
            Digishop Archive...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-[#FF4E50] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b border-[#FAD0C4] pb-6">
          <div>
            <h1 className="text-4xl font-black text-[#333] uppercase tracking-tighter italic">
              My <span className="text-[#FF4E50]">Orders</span>
            </h1>
            <p className="text-[#E75480] font-bold text-sm mt-1 uppercase tracking-widest opacity-70">
              Track and manage your purchase history
            </p>
            {lastUpdate && (
              <p className="text-[10px] text-zinc-400 mt-2 font-mono uppercase tracking-widest">
                Auto-Synced: {lastUpdate}
              </p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={fetchOrdersData}
            disabled={isLoading}
            className="mt-4 sm:mt-0 bg-white hover:bg-[#FFF5F7] border-[#FAD0C4] text-[#FF4E50] font-bold rounded-xl"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh List
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {statsMap.map((stat) => (
            <Card
              key={stat.key}
              onClick={() => handleFilterClick(stat.status)}
              className={`cursor-pointer transition-all border-2 rounded-2xl ${
                statusFilter === stat.status
                  ? "border-[#FF4E50] shadow-lg shadow-[#FF4E50]/10 bg-white"
                  : "border-transparent hover:border-[#FAD0C4] bg-white shadow-sm"
              }`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-black text-[#333] tracking-tighter">
                    {stats[stat.key] || 0}
                  </div>
                  <div className="text-[10px] text-[#E75480] font-black uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-10 p-5 shadow-xl border-[#FAD0C4]/20 rounded-2xl bg-white/80 backdrop-blur-md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#E75480] group-focus-within:text-[#FF4E50] transition-colors" />
              <Input
                placeholder="Search by Order ID or Product Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-base border-[#FAD0C4]/50 focus:ring-[#FF4E50] focus:border-[#FF4E50] rounded-xl bg-white font-medium"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleFilterClick}>
              <SelectTrigger className="w-full md:w-64 h-14 text-sm font-bold uppercase tracking-widest border-[#FAD0C4]/50 bg-white rounded-xl text-[#E75480]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#FAD0C4]">
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="space-y-8">
          {isLoading && orders.length > 0 && (
            <div className="text-center p-4 text-[#FF4E50] font-bold animate-pulse uppercase tracking-[0.3em] text-[10px]">
              Updating Vault...
            </div>
          )}

          {filteredOrders.length === 0 && !isLoading ? (
            <Card className="border-dashed border-2 border-[#FAD0C4] bg-[#FFF5F7]/30 rounded-[2rem]">
              <CardContent className="p-16 text-center text-zinc-500">
                <AlertCircle className="h-16 w-16 mx-auto mb-6 text-[#FAD0C4]" />
                <h3 className="text-2xl font-black text-[#333] uppercase tracking-tighter">
                  No Matching Orders
                </h3>
                <p className="text-[#E75480]/60 font-medium">
                  Try adjusting your search query or filter settings.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card
                key={order._id}
                className="overflow-hidden shadow-sm border-[#FAD0C4]/30 hover:shadow-2xl transition-all duration-500 rounded-[1.5rem] group bg-white"
              >
                <CardHeader className="p-5 bg-[#FFF5F7]/50 flex flex-col md:flex-row md:items-center justify-between border-b border-[#FAD0C4]/20">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="font-mono text-base font-black text-[#FF4E50] italic tracking-widest">
                      #{order.orderNumber}
                    </div>
                    <Separator
                      orientation="vertical"
                      className="hidden sm:block h-6 bg-[#FAD0C4]"
                    />
                    <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#E75480] flex gap-6">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 opacity-60" />
                        Placed:{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5 opacity-60" />
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <Badge
                      className={`uppercase font-black text-[10px] tracking-widest px-4 py-1.5 border shadow-sm rounded-full ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 sm:p-8 bg-white">
                  <div className="space-y-8">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-6 border-b border-[#FAD0C4]/10 pb-6 last:border-none last:pb-0 group/item"
                      >
                        <div className="h-24 w-24 flex-shrink-0 rounded-2xl border border-[#FAD0C4]/20 bg-white overflow-hidden shadow-inner p-2 group-hover/item:scale-105 transition-transform">
                          <img
                            src={resolveImagePath(item.product?.images?.[0])}
                            alt={item.product?.name}
                            className="h-full w-full object-contain"
                            onError={(e) => (e.target.src = "/placeholder.svg")}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-lg text-[#333] truncate uppercase tracking-tighter italic">
                            {item.product?.name}
                          </h4>
                          <p className="text-[10px] text-[#E75480] font-bold uppercase tracking-widest mt-2">
                            Seller:{" "}
                            <span className="text-[#333] opacity-60">
                              {item.seller?.storeName ||
                                item.seller?.name ||
                                "Seller"}
                            </span>
                          </p>
                          <Badge
                            className={`mt-3 uppercase text-[8px] font-black tracking-widest border shadow-none bg-white ${getStatusColor(
                              item.sellerOrderStatus
                            )}`}
                          >
                            {item.sellerOrderStatus || "Confirmed"}
                          </Badge>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Qty: {item.quantity}
                          </div>
                          <div className="font-black text-xl text-[#FF4E50] mt-1 italic tracking-tighter">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#FAD0C4]/20 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="order-2 sm:order-1 flex gap-4 flex-wrap mt-6 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 font-black uppercase tracking-widest text-[10px] border-[#FF4E50] text-[#FF4E50] hover:bg-[#FFF5F7] rounded-full h-10 px-6"
                        onClick={() => navigate(`/profile/orders/${order._id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Button>

                      {order.orderStatus === "delivered" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-2 bg-[#E75480] hover:bg-[#FF4E50] text-white font-black uppercase tracking-widest text-[10px] rounded-full h-10 px-6 transition-all"
                          onClick={() =>
                            handleDownloadInvoice(order._id, userToken)
                          }
                        >
                          <Download className="h-3.5 w-3.5" /> Invoice
                        </Button>
                      )}

                      {["pending", "confirmed", "processing"].includes(
                        order.orderStatus
                      ) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2 font-black uppercase tracking-widest text-[10px] rounded-full h-10 px-6 shadow-lg shadow-red-100 bg-red-600 text-white hover:bg-red-700 transition-all border-none"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          <XCircle className="h-3.5 w-3.5 text-white" />
                          <span className="text-white">Cancel</span>
                        </Button>
                      )}
                    </div>

                    <div className="order-1 sm:order-2 text-right bg-[#FFF9F0] px-6 py-4 rounded-2xl border border-[#FFD700]/30 shadow-inner">
                      <div className="text-[10px] font-black text-[#E75480] uppercase tracking-[0.2em] mb-1">
                        Final Amount
                      </div>
                      <div className="text-3xl font-black text-[#FF4E50] tracking-tighter italic">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}