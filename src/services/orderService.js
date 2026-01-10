import { orderAPI } from "../lib/api.js"

export const getOrders = async (params = {}) => {
  const res = await orderAPI.getOrders(params)
  if (Array.isArray(res)) return res
  return res.orders || res.data || []
}

export const getOrderById = async (id) => {
  const res = await orderAPI.getOrderById(id)
  return res.order || res.data || res
}

export const createOrder = async (orderData) => {
  const res = await orderAPI.createOrder(orderData)
  if (res.success) return res.order || res.data
  throw new Error(res.message || "Failed to create order")
}

export const cancelOrder = async (orderId) => {
  const res = await orderAPI.cancelOrder(orderId)
  return !!(res && (res.success === true || res.ok === true || res.status === "cancelled"))
}

export const updateOrderStatus = async (id, statusData) => {
  const res = await orderAPI.updateOrderStatus(id, statusData)
  return res
}
