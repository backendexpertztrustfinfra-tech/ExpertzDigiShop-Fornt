import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Star,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  Users,
  X,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import DashboardGraphs from "../../Pages/seller/DashboardGraphs";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";
const UPLOAD_BASE_URL = API_BASE_URL.replace("/api", "");

const formatPrice = (price) => {
  const val = Number(price) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

const generateChartData = (monthlyRevenue) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toISOString().slice(0, 7);
    const month = months[date.getMonth()];

    data.push({
      month,
      revenue: Math.round((monthlyRevenue[key] || 0) / 1000),
      orders: Math.floor(Math.random() * 50) + 5,
    });
  }
  return data;
};

const exportToCSV = (data, filename, headers) => {
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const value = row[h];
          if (typeof value === "string" && value.includes(","))
            return `"${value}"`;
          return value || "";
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ------------------------------------------------------
// SELLER DASHBOARD PAGE (UI PREMIUM UPGRADE VERSION)
// ------------------------------------------------------

export default function SellerDashboardPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalCustomers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();
  const { userToken } = useAuth();

  // -------------------------
  // Handlers
  // -------------------------
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleFilterChange = (status) => setFilterStatus(status);

  const handleViewDetails = useCallback(
    (id) => navigate(`/seller/product-details/${id}`),
    [navigate]
  );

  const handleEditProduct = useCallback(
    (id) => navigate(`/seller/edit-product/${id}`),
    [navigate]
  );

  const handleGoToOrders = useCallback(
    () => navigate("/seller/orders/list"),
    [navigate]
  );
  const handleGoToInventory = useCallback(
    () => navigate("/seller/inventory"),
    [navigate]
  );
  const handleGoToRevenue = useCallback(
    () => navigate("/seller/analytics/revenue"),
    [navigate]
  );
  const handleGoToRating = useCallback(
    () => navigate("/seller/analytics/rating"),
    [navigate]
  );
  const handleGoToCustomers = useCallback(
    () => navigate("/seller/analytics/customers"),
    [navigate]
  );

  const handleExportReports = useCallback(() => {
    const reportData = [
      { Metric: "Total Products", Value: stats.totalProducts },
      { Metric: "Active Products", Value: stats.activeProducts },
      { Metric: "Total Orders", Value: stats.totalOrders },
      { Metric: "Delivered Orders", Value: stats.deliveredOrders },
      { Metric: "Pending Orders", Value: stats.pendingOrders },
      { Metric: "Monthly Revenue", Value: `₹${stats.monthlyRevenue}` },
      { Metric: "Total Revenue", Value: `₹${stats.totalRevenue}` },
      { Metric: "Average Rating", Value: stats.averageRating },
      { Metric: "Total Customers", Value: stats.totalCustomers },
      { Metric: "Report Date", Value: new Date().toLocaleDateString("en-IN") },
    ];

    exportToCSV(
      reportData,
      `dashboard_report_${new Date().toISOString().split("T")[0]}.csv`,
      ["Metric", "Value"]
    );

    toast.success("Dashboard report exported successfully");
  }, [stats]);

  // ------------------------------------------------------
  // FETCH DASHBOARD DATA
  // ------------------------------------------------------
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!userToken) {
        navigate("/login");
        return;
      }

      try {
        const [dashboardRes, productsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/sellers/dashboard`, {
            headers: { Authorization: `Bearer ${userToken}` },
          }),
          fetch(`${API_BASE_URL}/sellers/products`, {
            headers: { Authorization: `Bearer ${userToken}` },
          }),
          fetch(`${API_BASE_URL}/sellers/orders`, {
            headers: { Authorization: `Bearer ${userToken}` },
          }),
        ]);

        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setStats(dashboardData.dashboard);

          if (dashboardData.dashboard?.monthlyRevenue) {
            setChartData(
              generateChartData(dashboardData.dashboard.monthlyRevenue)
            );
          }
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const allProducts = productsData.products || [];

          setProducts(allProducts);
          setLowStockProducts(
            allProducts.filter((p) => p.stock < 10).slice(0, 5)
          );
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (error) {
        toast.error("Failed to load seller data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, [userToken, navigate]);

  // ------------------------------------------------------
  // FILTER PRODUCTS
  // ------------------------------------------------------
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((p) =>
        filterStatus === "active" ? p.isActive : !p.isActive
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterStatus, products]);

  // ------------------------------------------------------
  // IMAGE HANDLER
  // ------------------------------------------------------
const getProductImage = (product) => {
  if (product.images?.length > 0) {
    const imagePath = product.images[0];
    if (imagePath.startsWith("http")) return imagePath;

    return `${UPLOAD_BASE_URL}${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath.replace(/\\/g, "/")}`;
  }
  return "/placeholder.svg";
};


  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-300",
      inactive: "bg-gray-100 text-gray-800 border-gray-300",
      out_of_stock: "bg-red-100 text-red-800 border-red-300",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      processing: "bg-purple-100 text-purple-800 border-purple-300",
      shipped: "bg-cyan-100 text-cyan-800 border-cyan-300",
      delivered: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // ------------------------------------------------------
  // LOADING SCREEN
  // ------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardGraphsSection = (
    <DashboardGraphs userToken={userToken} apiBaseUrl={API_BASE_URL} />
  );

  // ------------------------------------------------------
  // MAIN RETURN UI (PREMIUM)
  // ------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        {/* ----------------------- HEADER ----------------------- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-6 border-b border-gray-300 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Welcome back!
            </h1>
            <p className="text-gray-500 mt-1 text-base">
              Manage your store, products & growth
            </p>
          </div>

         <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
            {/* Export Button - Outline Style with Soft Gray */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                 className="flex-1 sm:w-auto flex items-center justify-center gap-2 h-11 px-4 sm:px-6 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
                >
                  <Download className="h-[18px] w-[18px] stroke-[1.5]" />
                  <span className="ffont-medium text-xs sm:text-sm">
                    Export Data
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-60 p-2 rounded-2xl border-slate-100 shadow-xl shadow-slate-200/50"
              >
                <DropdownMenuItem
                  onClick={handleExportReports}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors focus:bg-blue-50 group"
                >
                  <div className="p-2 bg-slate-100 rounded-lg group-focus:bg-blue-100 transition-colors">
                    <Download className="h-4 w-4 text-slate-600 group-focus:text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-slate-700">
                      Detailed Report
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Download as CSV file
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Product Button - Gradient & Shadow Style */}
            <Link to="/seller/add-product" className="flex-1 sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-4 sm:px-8 h-11 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform border-none">
                <Plus className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Add New Product</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ------------------- KEY METRICS CARDS ------------------- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {/* Total Products */}
          <Card
            onClick={handleGoToInventory}
            className="cursor-pointer transition-all hover:shadow-xl border-l-4 border-blue-600 shadow-md rounded-xl"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">
                Total Products
              </CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>

            <CardContent className="pt-1">
              <div className="text-3xl font-bold text-gray-900 leading-none">
                {stats.totalProducts}
              </div>
              <p className="text-xs text-green-600 mt-2">
                {stats.activeProducts} active listings
              </p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card
            onClick={handleGoToOrders}
            className="cursor-pointer transition-all hover:shadow-xl border-l-4 border-purple-600 shadow-md rounded-xl"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-5 w-5 text-purple-600" />
            </CardHeader>

            <CardContent className="pt-1">
              <div className="text-3xl font-bold text-gray-900 leading-none">
                {stats.totalOrders}
              </div>
              <p className="text-xs text-red-600 mt-2">
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card
            onClick={handleGoToRevenue}
            className="cursor-pointer transition-all hover:shadow-xl border-l-4 border-emerald-600 shadow-md rounded-xl"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </CardHeader>

            <CardContent className="pt-1">
              <div className="text-3xl font-bold text-gray-900 leading-none">
                {formatPrice(stats.monthlyRevenue).split(".")[0]}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Total: {formatPrice(stats.totalRevenue).split(".")[0]}
              </p>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card
            onClick={handleGoToRating}
            className="cursor-pointer transition-all hover:shadow-xl border-l-4 border-yellow-600 shadow-md rounded-xl"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">
                Customer Rating
              </CardTitle>
              <Star className="h-5 w-5 text-yellow-600" />
            </CardHeader>

            <CardContent className="pt-1">
              <div className="text-3xl font-bold text-yellow-600 leading-none flex items-center gap-1">
                {stats.averageRating}
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Average rating</p>
            </CardContent>
          </Card>

          {/* Customers */}
          <Card
            onClick={handleGoToCustomers}
            className="cursor-pointer transition-all hover:shadow-xl border-l-4 border-cyan-600 shadow-md rounded-xl"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">
                Customers
              </CardTitle>
              <Users className="h-5 w-5 text-cyan-600" />
            </CardHeader>

            <CardContent className="pt-1">
              <div className="text-3xl font-bold text-gray-900 leading-none">
                {stats.totalCustomers}
              </div>
              <p className="text-xs text-gray-500 mt-2">Unique buyers</p>
            </CardContent>
          </Card>
        </div>

        {/* ------------------- GRAPHS + LOW STOCK SECTION ------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Revenue Graphs */}
          <Card className="lg:col-span-2 shadow-xl rounded-xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-xl font-bold text-gray-800">
                Revenue Performance (Last 12 Months)
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">{dashboardGraphsSection}</CardContent>
          </Card>

          {/* Low Stock */}
          <Card className="shadow-lg border-none rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-50 pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <AlertTriangle className="h-5 w-5 text-red-600" /> Low Stock
                Alert
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-4 p-3 border border-red-100 bg-red-50/50 rounded-2xl shadow-sm transition-hover hover:shadow-md"
                    >
                      <img
                        src={getProductImage(product)}
                        className="h-12 w-12 rounded-xl object-cover border border-white shadow-sm"
                        alt={product.name}
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {product.name}
                        </p>
                        {/* Boxy Badge ko Pill Badge banaya */}
                        <Badge className="mt-1 bg-red-600 hover:bg-red-700 text-white border-none rounded-full px-3 py-0.5 text-[10px] font-bold">
                          Only {product.stock} left
                        </Badge>
                      </div>

                      {/* Edit Button ko Rounded/Pill shape kiya */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product._id)}
                        className="rounded-full h-9 w-9 p-0 flex items-center justify-center border-slate-200 text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Main Button ko Pill Shape aur Shadow di */}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4 rounded-full h-11 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                    onClick={handleGoToInventory}
                  >
                    Manage Inventory
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-sm font-medium">
                    All products have sufficient stock.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ------------------- TABS ------------------- */}
        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="inline-flex h-auto p-1.5 bg-slate-100/50 backdrop-blur-md rounded-full border border-slate-200 shadow-inner gap-1">
            <TabsTrigger
              value="products"
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 
      data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 
      data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200 
      text-slate-600 hover:text-blue-600 group"
            >
              <div className="flex items-center gap-2.5">
                <span>Products</span>
                <span className="flex items-center justify-center bg-slate-200 text-slate-700 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white min-w-[24px] h-6 px-2 rounded-full text-[13px] font-bold transition-colors">
                  {products.length}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="orders"
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 
      data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 
      data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200 
      text-slate-600 hover:text-blue-600 group"
            >
              <div className="flex items-center gap-2.5">
                <span>Recent Orders</span>
                <span className="flex items-center justify-center bg-slate-200 text-slate-700 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white min-w-[24px] h-6 px-2 rounded-full text-[13px] font-bold transition-colors">
                  {orders.length}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="analytics"
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 
      data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 
      data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200 
      text-slate-600 hover:text-blue-600"
            >
              Analytics Summary
            </TabsTrigger>
          </TabsList>

          {/* ------------------- PRODUCTS TAB ------------------- */}
          <TabsContent value="products" className="space-y-6">
            <Card className="shadow-xl rounded-xl">
              <CardHeader className="border-b pb-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Product Inventory
                  </CardTitle>

                  <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 h-11 rounded-lg"
                      />
                    </div>

                    {/* Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-11 px-4 font-semibold"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Status:
                          <span className="font-bold ml-1">
                            {filterStatus.charAt(0).toUpperCase() +
                              filterStatus.slice(1)}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleFilterChange("all")}
                        >
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFilterChange("active")}
                        >
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleFilterChange("inactive")}
                        >
                          Inactive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {products.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 text-lg font-medium mb-4">
                      No products available.
                    </p>
                    <Link to="/seller/add-product">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Add Product
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="min-w-[200px] font-semibold">
                            Product
                          </TableHead>
                          <TableHead className="font-semibold">
                            Category
                          </TableHead>
                          <TableHead className="font-semibold">Price</TableHead>
                          <TableHead className="text-center font-semibold">
                            Stock
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow
                            key={product._id}
                            className="hover:bg-gray-50 transition-all p-2"
                          >
                            {/* Product Image + Name */}
                            <TableCell>
                              <div className="flex items-center gap-4">
                                <img
                                  src={getProductImage(product)}
                                  className="h-14 w-14 rounded object-cover border"
                                />
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    SKU: {product.sku}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-sm text-gray-700">
                              {product.category}
                            </TableCell>

                            <TableCell className="text-gray-900 font-semibold">
                              {formatPrice(product.price)}
                            </TableCell>

                            <TableCell className="text-center">
                              <span
                                className={`font-semibold ${
                                  product.stock < 10
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {product.stock}
                              </span>
                            </TableCell>

                            <TableCell>
                              <Badge
                                className={getStatusColor(
                                  product.isActive ? "active" : "inactive"
                                )}
                              >
                                {product.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-gray-100"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleViewDetails(product._id)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditProduct(product._id)
                                    }
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------- ORDERS TAB ------------------- */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="shadow-xl rounded-xl">
              <CardHeader className="border-b pb-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Recent Orders
                  </CardTitle>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-10 h-11 rounded-lg"
                      placeholder="Search orders..."
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {orders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 text-lg font-medium mb-4">
                      No recent orders found.
                    </p>

                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={handleGoToOrders}
                    >
                      View All Orders
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="font-semibold">
                            Order ID
                          </TableHead>
                          <TableHead className="font-semibold min-w-[160px]">
                            Customer
                          </TableHead>
                          <TableHead className="font-semibold">Total</TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold min-w-[100px]">
                            Date
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {orders.slice(0, 10).map((order) => (
                          <TableRow
                            key={order._id}
                            className="hover:bg-gray-50 transition-all"
                          >
                            <TableCell className="font-mono text-xs">
                              {order.orderNumber}
                            </TableCell>

                            <TableCell>
                              <div className="text-sm">
                                <p className="font-semibold text-gray-900">
                                  {order.user?.name || "Guest"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.user?.email}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="font-semibold text-gray-900">
                              {formatPrice(order.totalAmount)}
                            </TableCell>

                            <TableCell>
                              <Badge
                                className={getStatusColor(order.orderStatus)}
                              >
                                {order.orderStatus}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={handleGoToOrders}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------- ANALYTICS TAB ------------------- */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 shadow-xl rounded-xl">
                <CardHeader className="pb-4 border-b">
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Key Metrics Summary
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                  {/* Performance Cards */}
                  <div className="grid grid-cols-2 gap-6 border-b pb-6">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">
                        Avg Order Value
                      </p>
                      <p className="font-bold text-xl text-gray-900">
                        {formatPrice(
                          stats.totalOrders
                            ? stats.totalRevenue / stats.totalOrders
                            : 0
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">
                        Customer Satisfaction
                      </p>
                      <p className="font-bold text-xl text-yellow-600 flex items-center gap-1">
                        {stats.averageRating}
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      </p>
                    </div>
                  </div>

                  {/* Product Health */}
                  <div className="pt-6">
                    <p className="text-lg font-semibold text-gray-800 mb-4">
                      Product Health
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Active Listings</span>
                        <span className="font-bold text-green-600">
                          {stats.activeProducts}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Inactive Listings</span>
                        <span className="font-semibold text-gray-500">
                          {stats.totalProducts - stats.activeProducts}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
