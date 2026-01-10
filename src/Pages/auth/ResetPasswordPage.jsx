import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"
import { auth } from "../../firebase/firebase"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [isValidating, setIsValidating] = useState(true)
  const navigate = useNavigate()

  const token = searchParams.get("token")

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false)
        setIsValidating(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/validate-reset-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          setTokenValid(false)
        }
      } catch (error) {
        console.error("[v0] Token validation error:", error)
        setTokenValid(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const validatePassword = () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return false
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return false
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validatePassword()) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        try {
          const firebaseUser = await auth.currentUser
          if (firebaseUser) {
            const firebaseToken = await firebaseUser.getIdToken(true)
            await fetch(`${API_BASE_URL}/auth/sync-password-reset`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${firebaseToken}`,
              },
              body: JSON.stringify({ newPassword: password }),
            })
            console.log("[v0] Password synced with MongoDB")
          }
        } catch (syncErr) {
          console.log("[v0] Sync error (non-blocking):", syncErr.message)
        }

        setResetComplete(true)
        toast.success("Password reset successfully!")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        toast.error(data.message || "Failed to reset password")
      }
    } catch (error) {
      console.error("[v0] Reset password error:", error)
      toast.error("Error resetting password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4E50]"></div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-[#FAD0C4] p-8 text-center shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#333] mb-2">Invalid Link</h1>
            <p className="text-[#333]/60 mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block w-full bg-[#FF4E50] hover:bg-[#E75480] text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (resetComplete) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-[#FAD0C4] p-8 text-center shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#333] mb-2">Password Reset Successful</h1>
            <p className="text-[#333]/60 mb-8">
              Your password has been changed. You can now login with your new password.
            </p>
            <Link
              to="/login"
              className="inline-block w-full bg-[#FF4E50] hover:bg-[#E75480] text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[#FAD0C4] p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#333] mb-2">Reset Password</h1>
            <p className="text-[#333]/60">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-lg pl-12 pr-12 py-3 text-[#333] placeholder-[#333]/30 focus:outline-none focus:border-[#FF4E50] focus:ring-1 focus:ring-[#FF4E50] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333]/40 hover:text-[#FF4E50]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-lg pl-12 pr-12 py-3 text-[#333] placeholder-[#333]/30 focus:outline-none focus:border-[#FF4E50] focus:ring-1 focus:ring-[#FF4E50] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333]/40 hover:text-[#FF4E50]"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF4E50] hover:bg-[#E75480] disabled:bg-zinc-200 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}