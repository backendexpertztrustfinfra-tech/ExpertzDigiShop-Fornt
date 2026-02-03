import { create } from "zustand"
import { persist } from "zustand/middleware"
import { calculateCartTotal } from "@/lib/cart"
import { cartAPI } from "@/lib/api"

export const useCart = create()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      itemCount: 0,
      appliedCoupon: null,
      isLoading: false,

      // 🔥 SYNC CART FROM BACKEND (ON REFRESH / LOGIN)
      syncCart: async () => {
        try {
          set({ isLoading: true })

          const response = await cartAPI.getCart()

          if (response?.success && response.cart) {
            const items = response.cart.items || []

            const newState = calculateCartTotal(items, 0)

            set({
              ...newState,
              items,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error("Error syncing cart:", error)
          set({ isLoading: false })
        }
      },

      // 🟢 ADD ITEM (ONLY BACKEND DRIVEN)
      addItem: async ({ productId, quantity = 1 }) => {
        try {
          set({ isLoading: true })

          const response = await cartAPI.addToCart({
            productId,
            quantity,
          })

          if (response?.success) {
            const items = response.cart.items || []
            const newState = calculateCartTotal(items, 0)

            set({
              ...newState,
              items,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error("Error adding to cart:", error)
          set({ isLoading: false })
        }
      },

      // alias (safe)
      addToCart: async (item) => {
        await useCart.getState().addItem({
          productId: item.productId || item.id,
          quantity: item.quantity || 1,
        })
      },

      // 🟢 REMOVE ITEM
      removeItem: async (productId) => {
        try {
          set({ isLoading: true })

          const response = await cartAPI.removeFromCart(productId)

          if (response?.success) {
            const items = response.cart.items || []
            const newState = calculateCartTotal(items, 0)

            set({
              ...newState,
              items,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error("Error removing from cart:", error)
          set({ isLoading: false })
        }
      },

      // 🟢 UPDATE QUANTITY
      updateQuantity: async (productId, quantity) => {
        if (quantity < 1) return

        try {
          set({ isLoading: true })

          const response = await cartAPI.updateCartItem(productId, quantity)

          if (response?.success) {
            const items = response.cart.items || []
            const newState = calculateCartTotal(items, 0)

            set({
              ...newState,
              items,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error("Error updating cart:", error)
          set({ isLoading: false })
        }
      },

      // 🟢 CLEAR CART
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
    }
  )
)
