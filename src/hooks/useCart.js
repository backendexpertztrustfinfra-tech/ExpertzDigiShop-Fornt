import { create } from "zustand"
import { persist } from "zustand/middleware"
import { calculateCartTotal, applyCoupon } from "@/lib/cart"
import { cartAPI } from "@/lib/api"

export const useCart = create()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      itemCount: 0,
      appliedCoupon: null,
      isLoading: false,

      getCartKey: (id, size, color) => {
        return `${id}-${size || "default"}-${color || "default"}`
      },

      // Sync cart with backend
      syncCart: async () => {
        try {
          set({ isLoading: true })
          const response = await cartAPI.getCart()
          if (response.success) {
            const { items, totalPrice } = response.cart
            const newState = calculateCartTotal(items, 0)
            set({ ...newState, isLoading: false })
          }
        } catch (error) {
          console.error("Error syncing cart:", error)
          set({ isLoading: false })
        }
      },

      addItem: async (newItem) => {
        try {
          set({ isLoading: true })
          // Try to add to backend
          const response = await cartAPI.addToCart({
            productId: newItem.id || newItem.productId,
            quantity: newItem.quantity || 1,
          })

          if (response.success) {
            const { items } = response.cart
            const newState = calculateCartTotal(items, 0)
            set({ ...newState, isLoading: false })
          }
        } catch (error) {
          console.error("Error adding to cart:", error)
          const { items, getCartKey } = get()
          const cartKey = getCartKey(newItem.id || newItem.productId, newItem.size, newItem.color)
          const existingItemIndex = items.findIndex(
            (item) => getCartKey(item.id || item.productId, item.size, item.color) === cartKey,
          )

          let updatedItems
          if (existingItemIndex >= 0) {
            updatedItems = items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: Math.min(item.quantity + (newItem.quantity || 1), item.maxQuantity || 999) }
                : item,
            )
          } else {
            updatedItems = [...items, { ...newItem, quantity: newItem.quantity || 1 }]
          }

          const couponDiscount = get().appliedCoupon
            ? applyCoupon(get().appliedCoupon, calculateCartTotal(updatedItems).subtotal)
            : 0

          const newState = calculateCartTotal(updatedItems, couponDiscount)
          set({ ...newState, appliedCoupon: get().appliedCoupon, isLoading: false })
        }
      },

      addToCart: async (newItem) => {
        get().addItem(newItem)
      },

      removeItem: async (id, size, color) => {
        try {
          set({ isLoading: true })
          const response = await cartAPI.removeFromCart(id)

          if (response.success) {
            const { items } = response.cart
            const newState = calculateCartTotal(items, 0)
            set({ ...newState, isLoading: false })
          }
        } catch (error) {
          console.error("Error removing from cart:", error)
          // Fallback to local state
          const { items, getCartKey } = get()
          const cartKey = getCartKey(id, size, color)
          const updatedItems = items.filter(
            (item) => getCartKey(item.id || item.productId, item.size, item.color) !== cartKey,
          )

          const couponDiscount = get().appliedCoupon
            ? applyCoupon(get().appliedCoupon, calculateCartTotal(updatedItems).subtotal)
            : 0

          const newState = calculateCartTotal(updatedItems, couponDiscount)
          set({ ...newState, appliedCoupon: get().appliedCoupon, isLoading: false })
        }
      },

      updateQuantity: async (id, quantity, size, color) => {
        if (quantity <= 0) {
          get().removeItem(id, size, color)
          return
        }

        try {
          set({ isLoading: true })
          const response = await cartAPI.updateCartItem(id, quantity)

          if (response.success) {
            const { items } = response.cart
            const newState = calculateCartTotal(items, 0)
            set({ ...newState, isLoading: false })
          }
        } catch (error) {
          console.error("Error updating cart:", error)
          // Fallback to local state
          const { items, getCartKey } = get()
          const cartKey = getCartKey(id, size, color)
          const updatedItems = items.map((item) =>
            getCartKey(item.id || item.productId, item.size, item.color) === cartKey
              ? { ...item, quantity: Math.min(quantity, item.maxQuantity || 999) }
              : item,
          )

          const couponDiscount = get().appliedCoupon
            ? applyCoupon(get().appliedCoupon, calculateCartTotal(updatedItems).subtotal)
            : 0

          const newState = calculateCartTotal(updatedItems, couponDiscount)
          set({ ...newState, appliedCoupon: get().appliedCoupon, isLoading: false })
        }
      },

      applyCouponCode: (code) => {
        const { subtotal } = get()
        const discount = applyCoupon(code, subtotal)

        if (discount > 0) {
          const newState = calculateCartTotal(get().items, discount)
          set({ ...newState, appliedCoupon: code })
          return true
        }
        return false
      },

      removeCoupon: () => {
        const newState = calculateCartTotal(get().items, 0)
        set({ ...newState, appliedCoupon: null })
      },

      clearCart: async () => {
        try {
          set({ isLoading: true })
          await cartAPI.clearCart()
          set({
            items: [],
            total: 0,
            subtotal: 0,
            discount: 0,
            shipping: 0,
            tax: 0,
            itemCount: 0,
            appliedCoupon: null,
            isLoading: false,
          })
        } catch (error) {
          console.error("Error clearing cart:", error)
          set({
            items: [],
            total: 0,
            subtotal: 0,
            discount: 0,
            shipping: 0,
            tax: 0,
            itemCount: 0,
            appliedCoupon: null,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
