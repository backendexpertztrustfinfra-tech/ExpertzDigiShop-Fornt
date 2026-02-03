import Cookies from "js-cookie"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"

const getToken = () => Cookies.get("userToken")

const apiRequest = async (endpoint, options = {}, overrideToken = null) => {
  const headers = {
    ...(options.headers || {}),
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const token = overrideToken || getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    let data = null
    const text = await response.text().catch(() => null)
    if (text) {
      try {
        data = JSON.parse(text)
      } catch (parseErr) {
        console.warn("[apiRequest] Failed to parse JSON response:", parseErr)
        data = { success: false, raw: text }
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("[apiRequest] Unauthorized - clearing auth cookies")
        Cookies.remove("userToken")
        Cookies.remove("userRole")
        Cookies.remove("userData")
        Cookies.remove("sellerVerificationStatus")
      }
      const errorMsg = (data && data.message) || `API Error: ${response.status}`
      console.error("[apiRequest] API Error:", errorMsg)
      const err = new Error(errorMsg)
      err.response = response
      err.data = data
      throw err
    }

    return data
  } catch (error) {
    console.error("[apiRequest] Request Failed:", error.message || error)
    throw error
  }
}

// 🟢 NEW HELPER: For Dashboard Sync (Fixed api.get/api.put issues)
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { method: "POST", body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { method: "PUT", body: JSON.stringify(body), ...options }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { method: "DELETE", ...options }),
}

/* --- API Groups --- */
export const authAPI = {
  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  getCurrentUser: () => apiRequest("/auth/me"),
}

export const userAPI = {
  getProfile: () => apiRequest("/users/profile"),
  updateProfile: (userData) =>
    apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
  changePassword: (passwordData) =>
    apiRequest("/users/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    }),
  updatePreferences: (preferences) =>
    apiRequest("/users/preferences", {
      method: "PUT",
      body: JSON.stringify({ preferences }),
    }),
  addAddress: (addressData) =>
    apiRequest("/users/addresses", {
      method: "POST",
      body: JSON.stringify(addressData),
    }),
  updateAddress: (addressId, addressData) =>
    apiRequest(`/users/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(addressData),
    }),
  deleteAddress: (addressId) => apiRequest(`/users/addresses/${addressId}`, { method: "DELETE" }),
  addToWishlist: (productId) =>
    apiRequest("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  removeFromWishlist: (productId) =>
    apiRequest("/wishlist/remove", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  getWishlist: () => apiRequest("/wishlist"),
}

export const productAPI = {
  getAllProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/products${queryString ? "?" + queryString : ""}`)
  },
  getProductById: (id) => apiRequest(`/products/${id}`),
  getProductsByCategory: (category, params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/products/category/${category}${queryString ? "?" + queryString : ""}`)
  },
  getFeaturedProducts: () => apiRequest("/products/featured"),
  getTopProducts: () => apiRequest("/products/top"),
  getLatestProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/products/latest${queryString ? "?" + queryString : ""}`)
  },
  getDiscountedProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/products/discounted${queryString ? "?" + queryString : ""}`)
  },
  getCategoryProducts: (category, limit = 8, params = {}) => {
    const allParams = { limit, ...params }
    const queryString = new URLSearchParams(allParams).toString()
    return apiRequest(`/products/category-home/${category}${queryString ? "?" + queryString : ""}`)
  },
  getCategoriesWithCount: () => apiRequest("/products/categories-count"),
  createProduct: (formData) =>
  apiRequest("/products", {
    method: "POST",
    body: formData,
  }),
  updateProduct: (id, formData) =>
  apiRequest(`/products/${id}`, {
    method: "PUT",
    body: formData,
  }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: "DELETE" }),
}

export const cartAPI = {
  getCart: () => apiRequest("/cart"),
  addToCart: (cartData) => apiRequest("/cart/add", { method: "POST", body: JSON.stringify(cartData) }),
  removeFromCart: (productId) =>
    apiRequest("/cart/remove", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  updateCartItem: (productId, quantity) =>
    apiRequest("/cart/update", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
    }),
  clearCart: () => apiRequest("/cart/clear", { method: "POST" }),
}

export const orderAPI = {
  createOrder: (orderData, token = null) =>
    apiRequest("/orders", { method: "POST", body: JSON.stringify(orderData) }, token),
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/orders${queryString ? "?" + queryString : ""}`)
  },
  getOrderById: (id) => apiRequest(`/orders/${id}/detail`),
  updateOrderStatus: (id, statusData) =>
    apiRequest(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    }),
  cancelOrder: (id) => apiRequest(`/orders/${id}/cancel`, { method: "POST" }),
}

export const reviewAPI = {
  createReview: (reviewData) =>
    apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
  getProductReviews: (productId, params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/reviews/product/${productId}${queryString ? "?" + queryString : ""}`)
  },
  deleteReview: (id) => apiRequest(`/reviews/${id}`, { method: "DELETE" }),
  markHelpful: (id) => apiRequest(`/reviews/${id}/helpful`, { method: "POST" }),
  canReviewProduct: (productId, orderId) => apiRequest(`/reviews/can-review/${productId}/${orderId}`),
  canReviewByProduct: (productId) => apiRequest(`/reviews/check/${productId}`),
}

export const wishlistAPI = {
  getWishlist: () => apiRequest("/wishlist"),
  addToWishlist: (productId) =>
    apiRequest("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  removeFromWishlist: (productId) =>
    apiRequest("/wishlist/remove", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
}

export const sellerAPI = {
  getDashboard: () => apiRequest("/sellers/dashboard"),
  getProfile: () => apiRequest("/sellers/profile"),
  updateProfile: (profileData) =>
    apiRequest("/sellers/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/sellers/products${queryString ? "?" + queryString : ""}`)
  },
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    // 🟢 UPDATED: Syncing with Platform logic route
    return apiRequest(`/orders/seller/orders/dashboard${queryString ? "?" + queryString : ""}`)
  },
  createProduct: (productData) =>
    apiRequest("/sellers/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),
  updateProduct: (id, productData) =>
    apiRequest(`/sellers/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),
  deleteProduct: (id) => apiRequest(`/sellers/products/${id}`, { method: "DELETE" }),
  verifySeller: (verificationData) =>
    apiRequest("/sellers/verify", {
      method: "POST",
      body: JSON.stringify(verificationData),
    }),
  exportOrders: (format = "json") => apiRequest(`/sellers/export/orders?format=${format}`),
}

/* ---------- PAYMENT API ---------- */

export const paymentAPI = {
  createOrderForPayment: (paymentData, token = null) =>
    apiRequest(
      "/payments/create",
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      },
      token,
    ).then((res) => {
      if (res && res.success && !res.orderData) {
        console.warn("[paymentAPI.createOrderForPayment] server did not return orderData. Response:", res)
      }
      return res
    }),

  verifyPayment: (verificationData, token = null) =>
    apiRequest(
      "/payments/verify",
      {
        method: "POST",
        body: JSON.stringify(verificationData),
      },
      token,
    ),

  finalizeOrder: (finalizeData, token = null) =>
    apiRequest(
      "/payments/finalize",
      {
        method: "POST",
        body: JSON.stringify(finalizeData),
      },
      token,
    ),

  // invoices
  downloadInvoice: (invoiceId) => apiRequest(`/invoices/${invoiceId}/download`, { method: "GET" }),
  getInvoice: (invoiceId) => apiRequest(`/invoices/${invoiceId}`),
}

export const supportAPI = {
  createTicket: (ticketData) =>
    apiRequest("/support", {
      method: "POST",
      body: JSON.stringify(ticketData),
    }),
  getTickets: () => apiRequest("/support"),
  getTicketById: (id) => apiRequest(`/support/${id}`),
  addMessage: (id, message) =>
    apiRequest(`/support/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  closeTicket: (id) => apiRequest(`/support/${id}/close`, { method: "POST" }),
}

export const returnAPI = {
  createReturn: (returnData) =>
    apiRequest("/returns", {
      method: "POST",
      body: JSON.stringify(returnData),
    }),
  getReturns: () => apiRequest("/returns"),
  getReturnById: (id) => apiRequest(`/returns/${id}`),
  updateReturn: (id, updateData) =>
    apiRequest(`/returns/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),
}

export const adminAPI = {
  getSellers: (status, params = {}) => {
    const queryString = new URLSearchParams({ ...params }).toString()
    if (status === "pending") {
      return apiRequest(`/admin-seller/pending${queryString ? "?" + queryString : ""}`)
    }
    return apiRequest(`/admin-seller/all?status=${status}${queryString ? "&" + queryString : ""}`)
  },

  getSellerDetails: (kycId) =>
    apiRequest(`/admin-seller/kyc/${kycId}`),

  approveSeller: (sellerId, notes) =>
    apiRequest(`/admin-seller/approve/${sellerId}`, {
      method: "PUT",
      body: JSON.stringify({ verificationNotes: notes }),
    }),

  rejectSeller: (sellerId, reason) =>
    apiRequest(`/admin-seller/reject/${sellerId}`, {
      method: "PUT",
      body: JSON.stringify({ rejectionReason: reason }),
    }),

  getComplaints: (status, params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/admin-complaint/complaints?status=${status}${queryString ? "&" + queryString : ""}`)
  },
}


export const adminProductAPI = {
  getPendingProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/admin-product/pending${queryString ? "?" + queryString : ""}`)
  },

  getAllProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/admin-product/all${queryString ? "?" + queryString : ""}`)
  },

  approveProduct: (productId) =>
    apiRequest(`/admin-product/approve/${productId}`, {
      method: "PUT",
    }),

  rejectProduct: (productId, rejectionReason) =>
    apiRequest(`/admin-product/reject/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ rejectionReason }),
    }),
}

const defaultExport = {
  authAPI,
  userAPI,
  productAPI,
  cartAPI,
  orderAPI,
  reviewAPI,
  wishlistAPI,
  sellerAPI,
  paymentAPI,
  supportAPI,
  returnAPI,
  adminAPI,
  adminProductAPI,
}

export default api;