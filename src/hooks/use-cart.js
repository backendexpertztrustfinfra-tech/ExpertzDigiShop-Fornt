// import { create } from "zustand"
// import { persist } from "zustand/middleware"
// import { cartAPI } from "@/lib/api"

// const calculateTotals = (items) => {
//   const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
//   const discount = items.reduce((sum, item) => {
//     const itemDiscount = ((item.product?.discount || 0) / 100) * (item.price * item.quantity)
//     return sum + itemDiscount
//   }, 0)
//   const tax = (subtotal - discount) * 0.05
//   const shipping = subtotal > 500 ? 0 : 50
//   const total = subtotal - discount + tax + shipping

//   return {
//     subtotal: Math.round(subtotal * 100) / 100,
//     discount: Math.round(discount * 100) / 100,
//     tax: Math.round(tax * 100) / 100,
//     shipping,
//     total: Math.round(total * 100) / 100,
//     itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
//   }
// }

// export const useCart = create()(
//   persist(
//     (set, get) => ({
//       items: [],
//       subtotal: 0,
//       discount: 0,
//       tax: 0,
//       shipping: 0,
//       total: 0,
//       itemCount: 0,
//       isLoading: false,
//       error: null,

//       syncCart: async () => {
//         try {
//           set({ isLoading: true, error: null })
//           const response = await cartAPI.getCart()
//           const cartItems = response.success ? response.cart?.items : response.items || []
//           if (Array.isArray(cartItems)) {
//             const totals = calculateTotals(cartItems)
//             set({
//               items: cartItems,
//               ...totals,
//               isLoading: false,
//             })
//           }
//         } catch (error) {
//           console.error("[v0] Cart sync error:", error)
//           set({ isLoading: false, error: error.message })
//         }
//       },

//       addToCart: async (productId, quantity = 1) => {
//         try {
//           set({ isLoading: true, error: null })
//           const response = await cartAPI.addToCart({ productId, quantity })
//           const cartItems = response.success ? response.cart?.items : response.items || []
//           if (Array.isArray(cartItems)) {
//             const totals = calculateTotals(cartItems)
//             set({
//               items: cartItems,
//               ...totals,
//               isLoading: false,
//             })
//             return true
//           }
//           throw new Error("Invalid cart response")
//         } catch (error) {
//           console.error("[v0] Add to cart error:", error)
//           set({ isLoading: false, error: error.message })
//           return false
//         }
//       },

//       removeFromCart: async (productId) => {
//         try {
//           set({ isLoading: true, error: null })
//           const response = await cartAPI.removeFromCart(productId)
//           const cartItems = response.success ? response.cart?.items : response.items || []
//           if (Array.isArray(cartItems)) {
//             const totals = calculateTotals(cartItems)
//             set({
//               items: cartItems,
//               ...totals,
//               isLoading: false,
//             })
//           }
//         } catch (error) {
//           console.error("[v0] Remove from cart error:", error)
//           set({ isLoading: false, error: error.message })
//         }
//       },

//       updateQuantity: async (productId, quantity) => {
//         if (quantity <= 0) {
//           get().removeFromCart(productId)
//           return
//         }

//         try {
//           set({ isLoading: true, error: null })
//           const response = await cartAPI.updateCartItem(productId, quantity)
//           const cartItems = response.success ? response.cart.items : response.items || []
//           if (cartItems && cartItems.length >= 0) {
//             const totals = calculateTotals(cartItems)
//             set({
//               items: cartItems,
//               ...totals,
//               isLoading: false,
//             })
//           }
//         } catch (error) {
//           console.error("[v0] Update quantity error:", error)
//           set({ isLoading: false, error: error.message })
//         }
//       },

//       clearCart: async () => {
//         try {
//           set({ isLoading: true, error: null })
//           await cartAPI.clearCart()
//           set({
//             items: [],
//             subtotal: 0,
//             discount: 0,
//             tax: 0,
//             shipping: 0,
//             total: 0,
//             itemCount: 0,
//             isLoading: false,
//           })
//         } catch (error) {
//           console.error("[v0] Clear cart error:", error)
//           set({ isLoading: false, error: error.message })
//         }
//       },
//     }),
//     {
//       name: "cart-store",
//     },
//   ),
// )
