import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, userRole, isLoading, sellerVerificationStatus } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    const isAdminPath = location.pathname.startsWith('/admin')
    const redirectPath = isAdminPath ? "/admin/login" : "/login"
    return <Navigate to={redirectPath} replace state={{ from: location }} />
  }

  if (requiredRole) {
    const normalizedUserRole = userRole ? String(userRole).toLowerCase() : null
    const normalizedRequiredRole = String(requiredRole).toLowerCase()

    if (normalizedUserRole !== normalizedRequiredRole) {
      return <Navigate to="/" replace />
    }

    if (normalizedRequiredRole === "seller" && sellerVerificationStatus === "pending") {
      if (!location.pathname.includes("/seller/verify")) {
        return <Navigate to="/seller/verify" replace />
      }
    }
  }

  return children
}

export default ProtectedRoute