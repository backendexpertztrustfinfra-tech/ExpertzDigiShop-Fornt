import { createContext, useContext, useState, useEffect } from "react"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userToken, setUserToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [sellerVerificationStatus, setSellerVerificationStatus] = useState(null)

  // Initialize auth state from cookies
  useEffect(() => {
    const initializeAuth = () => {
      const userTokenCookie = Cookies.get("userToken")
      const adminTokenCookie = Cookies.get("adminToken")
      const role = Cookies.get("userRole")
      const userData = Cookies.get("userData")
      const verificationStatus = Cookies.get("sellerVerificationStatus")

      const token = adminTokenCookie || userTokenCookie

      if (token && role) {
        try {
          const decoded = jwtDecode(token)
          const parsedUserData = userData ? JSON.parse(userData) : {}

          const userInfo = {
            id: decoded._id || decoded.id,
            email: decoded.email || parsedUserData.email,
            name: decoded.name || parsedUserData.name,
            role: role,
            ...parsedUserData,
          }

          setUser(userInfo)
          setUserToken(token)
          setUserRole(role)
          if (verificationStatus) {
            setSellerVerificationStatus(verificationStatus)
          }
          console.log("[v0] Auth initialized with role:", role)
        } catch (error) {
          console.error("[v0] Invalid token:", error)
          Cookies.remove("userToken")
          Cookies.remove("adminToken")
          Cookies.remove("userRole")
          Cookies.remove("userData")
          Cookies.remove("sellerVerificationStatus")
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = (token, role, userData = {}, verificationStatus = null) => {
    console.log("[v0] Login called with role:", role)

    const normalizedRole = String(role).toLowerCase()

    if (normalizedRole === "admin" || normalizedRole === "super_admin") {
      Cookies.set("adminToken", token, { expires: 7, secure: true, sameSite: "None" })
    } else {
      Cookies.set("userToken", token, { expires: 7, secure: true, sameSite: "None" })
    }

    Cookies.set("userRole", normalizedRole, { expires: 7 })
    Cookies.set("userData", JSON.stringify(userData), { expires: 7 })
    if (verificationStatus) {
      Cookies.set("sellerVerificationStatus", verificationStatus, { expires: 7 })
    }

    try {
      const decoded = jwtDecode(token)
      const userInfo = {
        id: decoded._id || decoded.id,
        email: decoded.email || userData.email,
        name: decoded.name || userData.name,
        role: normalizedRole,
        ...userData,
      }
      setUser(userInfo)
      setUserToken(token)
      setUserRole(normalizedRole)
      setSellerVerificationStatus(verificationStatus)
      console.log("[v0] User logged in with role:", normalizedRole, "Verification:", verificationStatus)
    } catch (error) {
      console.error("[v0] Error decoding token:", error)
    }
  }

  const logout = () => {
    Cookies.remove("userToken")
    Cookies.remove("adminToken")
    Cookies.remove("userRole")
    Cookies.remove("userData")
    Cookies.remove("sellerVerificationStatus")
    setUser(null)
    setUserToken(null)
    setUserRole(null)
    setSellerVerificationStatus(null)
    console.log("[v0] User logged out")
  }

  const updateSellerVerificationStatus = (status) => {
    setSellerVerificationStatus(status)
    Cookies.set("sellerVerificationStatus", status, { expires: 7 })
  }

  const value = {
    user,
    userToken,
    isLoading,
    userRole,
    sellerVerificationStatus,
    login,
    logout,
    updateSellerVerificationStatus,
    isAuthenticated: !!userToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export default AuthContext
