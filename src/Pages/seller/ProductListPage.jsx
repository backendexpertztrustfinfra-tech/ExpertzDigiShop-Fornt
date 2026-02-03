"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useToast } from "../../hooks/use-toast"

const ProductListPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("-createdAt")
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [currentPage, filterStatus, searchTerm])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== "all" && { status: filterStatus }),
      })

      const response = await axios.get(`/api/products/seller/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        setProducts(response.data.products)
        setTotalPages(response.data.pagination.pages)
      }
    } catch (error) {
      console.error("[v0] Error loading products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        loadProducts()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    }

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.draft}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Products</h1>
            <p className="text-muted-foreground">Manage and sell your products</p>
          </div>
          <button
            onClick={() => navigate("/seller/add-product")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-pricing.sellingPrice">High Price</option>
              <option value="pricing.sellingPrice">Low Price</option>
              <option value="-rating">Most Rated</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">No products found</p>
            <button
              onClick={() => navigate("/seller/add-product")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Rating</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.primary && (
                            <img
                              src={product.images.primary || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.name.substring(0, 40)}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{product.compliance?.sku || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">₹{product.pricing?.sellingPrice || 0}</p>
                        {product.pricing?.discount > 0 && (
                          <p className="text-xs text-green-600">{product.pricing.discount}% off</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{product.inventory?.totalStock || 0}</p>
                          {product.inventory?.totalStock < (product.inventory?.reorderLevel || 10) && (
                            <p className="text-xs text-red-600">Low Stock</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{product.rating || 0}</span>
                          <span className="text-yellow-500">★</span>
                          <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/seller/product/${product._id}/edit`)}
                            className="px-3 py-1 text-sm border border-primary text-primary rounded hover:bg-primary/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product._id)}
                            className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  Previous
                </button>
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Delete Product?</h2>
            <p className="text-muted-foreground mb-6">
              This action cannot be undone. The product will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductListPage
