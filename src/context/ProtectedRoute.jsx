import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userRole, isLoading, sellerVerificationStatus } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const normalizedUserRole = userRole ? String(userRole).toLowerCase() : null
    const normalizedRequiredRole = String(requiredRole).toLowerCase()

    if (normalizedUserRole !== normalizedRequiredRole) {
      console.log("Access denied. Required role:", normalizedRequiredRole, "User role:", normalizedUserRole)
      return <Navigate to="/" replace />
    }

    if (normalizedRequiredRole === "seller" && sellerVerificationStatus === "pending") {
      const currentPath = window.location.pathname
      // Allow access to verification page itself
      if (!currentPath.includes("/seller/verify")) {
        return <Navigate to="/seller/verify" replace />
      }
    }
  }

  return children
}

export default ProtectedRoute
