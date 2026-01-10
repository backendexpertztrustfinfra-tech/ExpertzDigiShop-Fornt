// // Authentication utilities and types

// // Mock user data for development
// export const mockUsers = [
//   {
//     id: "1",
//     email: "john@example.com",
//     firstName: "John",
//     lastName: "Doe",
//     phone: "+91 9876543210",
//     accountType: "buyer",
//     isEmailVerified: true,
//     createdAt: new Date("2024-01-15"),
//     updatedAt: new Date("2024-01-15"),
//   },
//   {
//     id: "2",
//     email: "seller@example.com",
//     firstName: "Jane",
//     lastName: "Smith",
//     phone: "+91 9876543211",
//     accountType: "seller",
//     isEmailVerified: true,
//     createdAt: new Date("2024-01-10"),
//     updatedAt: new Date("2024-01-10"),
//   },
// ]

// // Authentication functions (mock implementation)
// import { authAPI } from "./api.js"

// export const authService = {
//   async login(email, password) {
//     try {
//       const response = await authAPI.login({ email, password })
//       if (response.success) {
//         localStorage.setItem("token", response.token)
//         return {
//           user: response.user,
//           token: response.token,
//         }
//       }
//       throw new Error(response.message || "Login failed")
//     } catch (error) {
//       throw error
//     }
//   },

//   async register(userData) {
//     try {
//       const response = await authAPI.register(userData)
//       if (response.success) {
//         localStorage.setItem("token", response.token)
//         return {
//           user: response.user,
//           token: response.token,
//         }
//       }
//       throw new Error(response.message || "Registration failed")
//     } catch (error) {
//       throw error
//     }
//   },

//   async forgotPassword(email) {
//     try {
//       // This would be implemented in the backend
//       console.log(`Password reset email sent to ${email}`)
//     } catch (error) {
//       throw error
//     }
//   },

//   async logout() {
//     localStorage.removeItem("token")
//   },

//   async getCurrentUser() {
//     try {
//       const token = localStorage.getItem("token")
//       if (!token) return null

//       const response = await authAPI.getCurrentUser()
//       if (response.success) {
//         return response.user
//       }
//       return null
//     } catch (error) {
//       console.error("Error getting current user:", error)
//       return null
//     }
//   },
// }
