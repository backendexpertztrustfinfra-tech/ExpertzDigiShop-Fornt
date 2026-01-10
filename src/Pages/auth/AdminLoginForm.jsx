import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const navigate = useNavigate()
  const { login, userRole } = useAuth()

  // If already admin, redirect to dashboard
  if (userRole === "admin") {
    navigate("/admin/dashboard")
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Login failed")
        return
      }

      const userRole = String(data.user.role).toLowerCase()
      if (userRole !== "admin") {
        toast.error("Access denied. Admin credentials required.")
        console.log("[v0] Non-admin user attempted admin login:", userRole)
        return
      }

      login(
        data.token,
        userRole,
        {
          email: data.user.email,
          name: data.user.name,
          id: data.user._id,
        },
        data.user.verificationStatus,
      )

      toast.success("Admin login successful!")

      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true })
      }, 500)
    } catch (error) {
      toast.error(error.message || "Login error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 px-4 py-10">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Admin Badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <Shield className="h-5 w-5 text-blue-300" />
            <span className="text-sm font-semibold text-white">Admin Portal</span>
          </div>
        </div>

        {/* Card */}
        <Card className="backdrop-blur-xl bg-white/95 shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
            <CardTitle className="text-3xl font-bold text-white mb-2">Admin Login</CardTitle>
            <CardDescription className="text-blue-100">Restricted access - authorized personnel only</CardDescription>
          </div>

          <CardContent className="space-y-6 pt-8">
            {/* Security Alert */}
            <Alert className="bg-amber-50 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800 ml-2">
                This is a restricted admin area. Unauthorized access attempts are logged.
              </AlertDescription>
            </Alert>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <Label className="text-gray-700 font-semibold">Admin Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    className="pl-11 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="admin@digishop.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-gray-700 font-semibold">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="pl-11 pr-12 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                disabled={isLoading}
                className="w-full py-3 text-base font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  "Login to Admin Panel"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-100 flex flex-col gap-3 py-4 text-center text-sm">
            <div className="text-gray-600">
              Not an admin?{" "}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                User Login
              </Link>
            </div>
            <div className="text-xs text-gray-500">
              All login attempts are monitored and logged for security purposes.
            </div>
          </CardFooter>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-blue-100/60">
          <p>DigiShop Admin Panel v1.0</p>
          <p className="mt-1">© 2025 All rights reserved</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginForm
