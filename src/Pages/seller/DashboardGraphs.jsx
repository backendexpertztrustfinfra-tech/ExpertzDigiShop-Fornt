import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Clock,
} from "lucide-react";

import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

// FIXED: Using Render URL instead of localhost
const UPLOAD_BASE_URL = "https://expertz-digishop.onrender.com";

const formatPriceINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const SalesTrendTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-xl shadow-lg text-sm font-sans">
        <p className="font-bold mb-1">{data.month}</p>
        <p className="text-emerald-600 flex items-center gap-1">
          <TrendingUp size={14} /> Revenue: ₹
          {(data.revenue * 1000).toLocaleString()}
        </p>
        <p className="text-blue-600 flex items-center gap-1">
          <ShoppingCart size={14} /> Orders: {data.orders}
        </p>
      </div>
    );
  }
  return null;
};

const OrderVsRevenueTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-xl shadow-xl text-sm font-sans">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((item, index) => (
          <p
            key={index}
            className="flex items-center gap-2 font-medium"
            style={{ color: item.color }}
          >
            {item.name === "Revenue" ? (
              <DollarSign size={14} />
            ) : (
              <ShoppingCart size={14} />
            )}
            {item.name}:{" "}
            {item.name === "Revenue"
              ? formatPriceINR(item.value * 1000)
              : item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardGraphs = ({ userToken, apiBaseUrl }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userToken) return;
      try {
        const response = await fetch(
          `${apiBaseUrl}/sellers/analytics/dashboard`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const result = await response.json();
        setAnalyticsData(result.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userToken, apiBaseUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-400 bg-red-100 shadow-xl rounded-xl">
        <CardContent className="pt-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-700" />
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) return null;

  const { salesTrend, lowStockAlerts, ordersVsRevenue } = analyticsData;

  // FIXED: Image URL Helper to handle localhost and relative paths
  const getAlertImage = (image) => {
    if (!image) return "/placeholder.svg";
    if (image.startsWith("http")) {
      // If it's a localhost URL stored in DB, replace it with Render URL
      if (image.includes("localhost:5000")) {
        return image.replace("http://localhost:5000", UPLOAD_BASE_URL);
      }
      return image;
    }
    // Handle relative paths and Windows backslashes
    const cleanPath = image.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${UPLOAD_BASE_URL}/${cleanPath}`;
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Sales Trend (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 px-2 sm:px-6">
          {salesTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={salesTrend}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<SalesTrendTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Revenue (₹1000s)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No sales data yet</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 pb-5 pt-6 px-6">
          <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-800 tracking-tight">
            <div className="p-2 bg-rose-50 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            Stock Alerts
            <span className="ml-1 text-slate-400 font-medium text-sm">
              ({lowStockAlerts?.length || 0} items)
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 px-6 pb-6 space-y-4">
          {lowStockAlerts?.length > 0 ? (
            <div className="space-y-4">
              {lowStockAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${
                    alert.severity === "critical"
                      ? "bg-rose-50/40 border-rose-100"
                      : "bg-amber-50/40 border-amber-100"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white shadow-sm bg-white">
                      <img
                        src={getAlertImage(alert.image)}
                        alt={alert.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p className="font-bold text-base text-slate-900 truncate tracking-tight">
                          {alert.name}
                        </p>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${
                            alert.severity === "critical"
                              ? "bg-rose-600 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {alert.category}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                        <p className="text-sm font-bold text-slate-700">
                          Stock:{" "}
                          <span
                            className={
                              alert.severity === "critical"
                                ? "text-rose-600"
                                : "text-amber-600"
                            }
                          >
                            {alert.stock} units
                          </span>
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-white/60 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Clock size={13} className="text-blue-500" />
                          <span>Out in {alert.daysUntilOutOfStock} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <span className="text-2xl text-emerald-600">✓</span>
              </div>
              <p className="text-slate-500 font-bold text-sm">
                All stock levels are optimal at the moment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardGraphs;