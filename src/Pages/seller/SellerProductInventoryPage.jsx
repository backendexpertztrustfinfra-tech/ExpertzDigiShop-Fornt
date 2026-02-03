import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Filter,
  Search,
  Download,
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
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";
const UPLOAD_BASE_URL = "https://expertz-digishop.onrender.com";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const getProductPrice = (product) => {
  if (product?.variants && product.variants.length > 0) {
    return (
      product.variants[0].sellingPrice ??
      product.variants[0].pricing?.sellingPrice ??
      0
    );
  }
  return product?.pricing?.sellingPrice ?? product?.price ?? 0;
};

const getProductStock = (product) => {
  if (product?.variants && product.variants.length > 0) {
    return (
      product.variants[0].stock ?? product.variants[0].inventory?.quantity ?? 0
    );
  }
  return product?.inventory?.totalStock ?? product?.stock ?? 0;
};

const getProductImage = (product) => {
  let imagePath =
    product?.images?.primary ||
    product?.images?.frontView ||
    product?.variants?.[0]?.image ||
    product?.variants?.[0]?.images?.[0] ||
    null;

  if (!imagePath) return "/placeholder.svg";

  imagePath = String(imagePath);

  if (imagePath.includes("localhost:5000")) {
    imagePath = imagePath.split("/uploads/")[1];
    return `${UPLOAD_BASE_URL}/uploads/${imagePath.replace(/\\/g, "/")}`;
  }

  if (imagePath.startsWith("http")) return imagePath;

  const cleanPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${UPLOAD_BASE_URL}/${cleanPath}`;
};

const getStatusColor = (status) => {
  const colors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const exportToCSV = (data, filename, headers) => {
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const value = row[h];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value || "";
        })
        .join(","),
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

export default function SellerProductInventoryPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const { userToken } = useAuth();

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };
  const handleViewDetails = useCallback(
    (productId) => {
      navigate(`/seller/product-details/${productId}`);
    },
    [navigate],
  );
  const handleEditProduct = useCallback(
    (productId) => {
      navigate(`/seller/edit-product/${productId}`);
    },
    [navigate],
  );

  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    const exportData = products.map((p) => ({
      SKU: p.variants?.[0]?.sku || p.compliance?.sku || "N/A",
      Product: p.name,
      Category: p.category,
      Price: getProductPrice(p),
      Stock: getProductStock(p),
      Status: p.isActive ? "Active" : "Inactive",
      Brand: p.brand || p.specifications?.brand || "N/A",
      CreatedDate: new Date(p.createdAt).toLocaleDateString("en-IN"),
    }));
    exportToCSV(
      exportData,
      `inventory_${new Date().toISOString().split("T")[0]}.csv`,
      [
        "SKU",
        "Product",
        "Category",
        "Price",
        "Stock",
        "Status",
        "Brand",
        "CreatedDate",
      ],
    );
    toast.success("Products exported successfully!");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userToken) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/products/seller/all`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          toast.error("Failed to load product inventory.");
        }
      } catch (error) {
        toast.error("Error fetching product data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [userToken, navigate]);

  useEffect(() => {
    let filtered = [...products];
    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((p) =>
        filterStatus === "active" ? p.isActive : !p.isActive,
      );
    }
    setFilteredProducts(filtered);
  }, [searchTerm, filterStatus, products]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getApprovalBadge = (product) => {
    if (product.approvalStatus === "PENDING") {
      return {
        label: "Under QC",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      };
    }

    if (product.approvalStatus === "REJECTED") {
      return {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (product.approvalStatus === "APPROVED" && product.isActive) {
      return {
        label: "Live",
        className: "bg-green-50 text-green-700 border-green-200",
      };
    }

    return {
      label: "Inactive",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    };
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" /> Product Inventory (
            {filteredProducts.length} of {products.length})
          </h1>
          <Link to="/seller/add-product">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <CardTitle className="text-xl font-semibold">
                Inventory List
              </CardTitle>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    className="pl-10 w-64 h-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Status:{" "}
                      {filterStatus.charAt(0).toUpperCase() +
                        filterStatus.slice(1)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleFilterChange("all")}>
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
                <Button
                  variant="outline"
                  className="h-10 bg-transparent"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground mb-4 font-medium">
                  Your inventory is empty.
                </p>
                <Link to="/seller/add-product">
                  <Button variant="outline">Add Your First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[400px]">Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow
                        key={product._id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-lg overflow-hidden border bg-white shadow-sm shrink-0">
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-slate-800 truncate">
                                {product.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                SKU:{" "}
                                {product.variants?.[0]?.sku ||
                                  product.compliance?.sku ||
                                  "N/A"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-600">
                          {product.category}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {formatPrice(getProductPrice(product))}
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              getProductStock(product) < 10
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}
                          >
                            {getProductStock(product)} units
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const badge = getApprovalBadge(product);
                            return (
                              <Badge
                                variant="outline"
                                className={`${badge.className} border font-bold`}
                              >
                                {badge.label}
                              </Badge>
                            );
                          })()}
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(product._id)}
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2 text-blue-500" />{" "}
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditProduct(product._id)}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2 text-amber-500" />{" "}
                                Edit Product
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
      </div>
    </div>
  );
}
