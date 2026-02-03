"use client"

import { useState, useEffect } from "react"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import api from "../../lib/api"
import { toast } from "react-toastify"
import "../../../src/Styles/admin-product-approval.css"

export default function AdminProductApproval() {
  const { userToken } = useContext(AuthContext)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("pending")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [filter, page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const endpoint = filter === "pending" ? "pending" : "all"
      const response = await api.get(`/admin-product/${endpoint}?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })

      setProducts(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const approveProduct = async (productId) => {
    try {
      await api.put(
        `/admin-product/approve/${productId}`,
        { notes: approvalNotes },
        { headers: { Authorization: `Bearer ${userToken}` } },
      )

      toast.success("Product approved successfully")
      setSelectedProduct(null)
      fetchProducts()
    } catch (error) {
      toast.error("Failed to approve product")
    }
  }

  const rejectProduct = async (productId) => {
    try {
      await api.put(
        `/admin-product/reject/${productId}`,
        { rejectionReason },
        { headers: { Authorization: `Bearer ${userToken}` } },
      )

      toast.success("Product rejected successfully")
      setSelectedProduct(null)
      fetchProducts()
    } catch (error) {
      toast.error("Failed to reject product")
    }
  }

  return (
    <div className="admin-product-container">
      <div className="product-header">
        <h1>Product Approval</h1>
        <p>Review and approve products before going live</p>
      </div>

      <div className="product-controls">
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => {
            setFilter("pending")
            setPage(1)
          }}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === "approved" ? "active" : ""}`}
          onClick={() => {
            setFilter("approved")
            setPage(1)
          }}
        >
          Approved
        </button>
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => {
            setFilter("all")
            setPage(1)
          }}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <img src={product.image || "/placeholder.svg"} alt={product.title} className="product-image" />
              <div className="product-info">
                <h3>{product.title}</h3>
                <p className="seller-name">Seller: {product.seller?.name}</p>
                <p className="price">₹{product.price}</p>
                <span className={`status-badge ${product.status}`}>{product.status}</span>
              </div>

              {product.status === "pending" && (
                <div className="product-actions">
                  <button className="btn-approve" onClick={() => setSelectedProduct(product)}>
                    Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>
              ×
            </button>

            <div className="product-details">
              <img
                src={selectedProduct.image || "/placeholder.svg"}
                alt={selectedProduct.title}
                className="detail-image"
              />

              <div className="details-text">
                <h2>{selectedProduct.title}</h2>
                <p>{selectedProduct.description}</p>
                <p>
                  <strong>Price:</strong> ₹{selectedProduct.price}
                </p>
                <p>
                  <strong>Category:</strong> {selectedProduct.category}
                </p>
                <p>
                  <strong>Stock:</strong> {selectedProduct.stock}
                </p>
              </div>

              <div className="approval-form">
                {selectedProduct.status === "pending" && (
                  <>
                    <div className="form-group">
                      <label>Approval Notes</label>
                      <textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add notes for approval..."
                        rows="3"
                      />
                    </div>

                    <div className="action-buttons">
                      <button className="btn-approve" onClick={() => approveProduct(selectedProduct._id)}>
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => {
                          setApprovalNotes("")
                          setRejectionReason("")
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
