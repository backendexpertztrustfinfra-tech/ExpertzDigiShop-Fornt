import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  UserCheck,
  DollarSign,
  TrendingUp,
  Search,
  Clock,
  SortAsc,
  Users2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
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
import { Separator } from "@/components/ui/separator";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-IN", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default function SellerCustomerPage() {
  const navigate = useNavigate();
  const { userToken } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("totalSpent");

  const fetchCustomerData = useCallback(async () => {
    if (!userToken) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/sellers/analytics/customers`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
        setTotalCustomers(data.totalCustomers || 0);
        
        // Calculate total revenue from fetched customers
        const calculatedRevenue = data.customers?.reduce((sum, c) => sum + (c.totalSpent || 0), 0) || 0;
        setTotalRevenue(calculatedRevenue);

      } else {
        toast.error("Failed to load customer data.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error fetching customer analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [userToken, navigate]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  // Stats Logic
  const totalOrdersCount = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const avgOrdersPerCustomer =
    totalCustomers > 0 ? (totalOrdersCount / totalCustomers).toFixed(2) : 0;
  const avgOrderValue =
    totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Filter & Sort Logic (Client-side)
  const filteredCustomers = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (filterBy === "totalSpent") return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (filterBy === "totalOrders") return (b.totalOrders || 0) - (a.totalOrders || 0);
      if (filterBy === "lastOrderDate")
        return new Date(b.lastOrderDate || 0) - new Date(a.lastOrderDate || 0);
      return 0;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
          <p className="text-gray-600 text-sm font-medium">
            Fetching customer analytics...
          </p>
        </div>
      </div>
    );
  }

  // --- Mobile Card View for Customer List ---
  const MobileCustomerCard = ({ customer }) => (
    <Card className="shadow-sm border-l-4 border-blue-400 p-4 mb-3 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div className="font-extrabold text-gray-900 text-base">{customer.name}</div>
        <div className="text-lg font-bold text-green-700">
          {formatPrice(customer.totalSpent)}
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-2">{customer.email}</p>
      <Separator className="my-2" />
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-700 font-medium">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold">{customer.totalOrders || 0}</span>
          Orders
        </div>
        <div className="flex flex-col items-center border-l border-r">
          <span className="text-sm font-bold">AOV</span>
          {formatPrice((customer.totalSpent || 0) / (customer.totalOrders || 1))}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold">
            {formatDate(customer.lastOrderDate)}
          </span>
          Last Order
        </div>
      </div>
    </Card>
  );


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* ---------------------- HEADER ---------------------- */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 mb-8">
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-gray-900">
            <Users className="h-8 w-8 text-blue-600" /> Customer Analytics
          </h1>

          <Button
            variant="outline"
            onClick={() => navigate("/seller/dashboard")}
            className="mt-4 sm:mt-0 h-10 flex items-center gap-2 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* ---------------------- STATS CARDS ---------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {/* Total Buyers */}
          <Card className="shadow-lg border-t-4 border-blue-600 rounded-xl transition-transform hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                TOTAL UNIQUE BUYERS
                <Users className="h-5 w-5 text-blue-600" />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-4xl font-extrabold text-blue-700">
                {totalCustomers}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Count of all buyers
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="shadow-lg border-t-4 border-green-600 rounded-xl transition-transform hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                TOTAL REVENUE
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-extrabold text-green-700">
                {formatPrice(totalRevenue)}
              </div>
              <p className="text-xs text-gray-500 mt-2">Revenue from all customers</p>
            </CardContent>
          </Card>

          {/* Avg Order Value */}
          <Card className="shadow-lg border-t-4 border-orange-600 rounded-xl transition-transform hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                AVG. ORDER VALUE
                <DollarSign className="h-5 w-5 text-orange-600" />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-extrabold text-orange-700">
                {formatPrice(avgOrderValue)}
              </div>
              <p className="text-xs text-gray-500 mt-2">Revenue per order</p>
            </CardContent>
          </Card>
          
          {/* Orders Per Buyer */}
          <Card className="shadow-lg border-t-4 border-purple-600 rounded-xl transition-transform hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                ORDERS PER BUYER
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-4xl font-extrabold text-purple-700">
                {avgOrdersPerCustomer}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Average repeat purchase rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ---------------------- CUSTOMER TABLE / CARD VIEW ---------------------- */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="border-b bg-gray-50 pb-5 rounded-t-xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <UserCheck className="h-6 w-6 text-blue-600" />
                Customer List ({filteredCustomers.length})
              </CardTitle>

              {/* Search + Sort */}
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search name or email..."
                    className="pl-9 h-10 w-full rounded-xl border-2 shadow-sm focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 font-semibold rounded-xl border-2 shadow-sm flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Sort By
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="z-50 bg-white shadow-xl rounded-lg">
                    <DropdownMenuItem onClick={() => setFilterBy("totalSpent")} className={filterBy === "totalSpent" ? "bg-gray-100 font-bold text-green-700" : ""}>
                      Total Spent (High to Low)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterBy("totalOrders")} className={filterBy === "totalOrders" ? "bg-gray-100 font-bold text-blue-700" : ""}>
                      Total Orders (High to Low)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterBy("lastOrderDate")} className={filterBy === "lastOrderDate" ? "bg-gray-100 font-bold text-purple-700" : ""}>
                      Last Order Date (Newest)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          {/* Table Body (Desktop View) */}
          <CardContent className="p-0 hidden lg:block">
            {filteredCustomers.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-lg">
                No matching customers found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader className="bg-gray-100">
                    <TableRow className="hover:bg-gray-100">
                      <TableHead className="w-[20%] text-sm font-bold text-gray-700">Customer Name</TableHead>
                      <TableHead className="w-[30%] text-sm font-bold text-gray-700">Email</TableHead>
                      <TableHead className="w-[15%] text-sm font-bold text-gray-700 text-center">Total Orders</TableHead>
                      <TableHead className="w-[20%] text-sm font-bold text-gray-700">Total Spent</TableHead>
                      <TableHead className="w-[15%] text-sm font-bold text-gray-700">Last Order</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredCustomers.map((c) => (
                      <TableRow
                        key={c._id}
                        className="hover:bg-blue-50/50 transition duration-150 cursor-pointer"
                        onClick={() => toast.info(`Viewing details for ${c.name}`)}
                      >
                        <TableCell className="font-semibold text-gray-800">
                          {c.name}
                        </TableCell>

                        <TableCell className="text-gray-600 text-sm">
                          {c.email}
                        </TableCell>

                        <TableCell className="text-center font-extrabold text-blue-700">
                          {c.totalOrders || 0}
                        </TableCell>

                        <TableCell className="font-extrabold text-green-700 text-base">
                          {formatPrice(c.totalSpent || 0)}
                        </TableCell>

                        <TableCell className="text-gray-600 text-sm">
                          {formatDate(c.lastOrderDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          
          {/* Card View (Mobile View) */}
          <CardContent className="p-4 lg:hidden">
            {filteredCustomers.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-base">
                No matching customers found.
              </div>
            ) : (
                <div className="space-y-4">
                    {filteredCustomers.map(c => (
                        <MobileCustomerCard key={c._id} customer={c} />
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}