"use client"

import { useState, useCallback } from "react"
import { orderAPI } from "../lib/api"
import { toast } from "react-toastify"

export const useOrders = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await orderAPI.getOrders()
      if (response.success) {
        setOrders(response.orders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchOrderById = useCallback(async (orderId) => {
    setIsLoading(true)
    try {
      const response = await orderAPI.getOrderById(orderId)
      if (response.success) {
        setSelectedOrder(response.order)
        return response.order
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      toast.error("Failed to load order details")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelOrder = useCallback(
    async (orderId) => {
      try {
        const response = await orderAPI.cancelOrder(orderId)
        if (response.success) {
          setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: "cancelled" } : o)))
          toast.success("Order cancelled successfully")
          return true
        }
      } catch (error) {
        console.error("Error cancelling order:", error)
        toast.error(error.message || "Failed to cancel order")
        return false
      }
    },
    [orders],
  )

  const updateOrderStatus = useCallback(
    async (orderId, statusData) => {
      try {
        const response = await orderAPI.updateOrderStatus(orderId, statusData)
        if (response.success) {
          setOrders(orders.map((o) => (o._id === orderId ? response.order : o)))
          toast.success("Order updated successfully")
          return true
        }
      } catch (error) {
        console.error("Error updating order:", error)
        toast.error("Failed to update order")
        return false
      }
    },
    [orders],
  )

  const getOrderStats = useCallback(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.orderStatus === "pending").length,
      processing: orders.filter((o) => o.orderStatus === "processing").length,
      shipped: orders.filter((o) => o.orderStatus === "shipped").length,
      delivered: orders.filter((o) => o.orderStatus === "delivered").length,
      cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
    }
  }, [orders])

  return {
    orders,
    selectedOrder,
    isLoading,
    fetchOrders,
    fetchOrderById,
    cancelOrder,
    updateOrderStatus,
    getOrderStats,
  }
}
