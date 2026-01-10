import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "../../firebase/firebase"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify"


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const firebaseToken = await result.user.getIdToken(true)
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Login failed")
        return
      }

      const userRole = String(data.user.role).toLowerCase()

      login(data.token, userRole, {
        email: data.user.email,
        name: data.user.name,
        id: data.user.id || data.user._id,
      })

      toast.success("Login successful!")

      setTimeout(() => {
        navigate("/")
      }, 300)
    } catch (err) {
      console.error("[v0] Login error:", err)
      toast.error(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const firebaseToken = await result.user.getIdToken(true)

      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({ name: result.user.displayName, role: "customer" }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Google login failed")
        return
      }

      const userRole = String(data.user.role).toLowerCase()

      login(data.token, userRole, {
        email: data.user.email,
        name: data.user.name,
        id: data.user.id || data.user._id,
      })

      toast.success("Login successful!")

      setTimeout(() => {
        navigate("/")
      }, 300)
    } catch (err) {
      console.error("[v0] Google login error:", err)
      toast.error(err.message || "Google login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#333] mb-2">Digi<span className="text-[#FF4E50]">Shop</span></h1>
          <p className="text-[#333]/60 font-medium">Welcome back to your marketplace</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#FAD0C4] rounded-[2rem] shadow-xl p-8 space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#333]/70 ml-1 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
              <input
                type="email"
                className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-xl pl-12 pr-4 py-3 text-[#333] placeholder-[#333]/30 focus:outline-none focus:ring-2 focus:ring-[#FF4E50] transition"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#333]/70 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-xl pl-12 pr-12 py-3 text-[#333] placeholder-[#333]/30 focus:outline-none focus:ring-2 focus:ring-[#FF4E50] transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333]/40 hover:text-[#E75480] transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox and Forgot Password Link */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-[#333] cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-[#FF4E50]" />
              <span className="ml-2 text-sm font-medium">Remember me</span>
            </label>
            <button 
                type="button"
                onClick={() => navigate("/auth/forgot-password")}
                className="text-[#E75480] hover:text-[#FF4E50] text-sm font-bold transition"
              >
                Forgot Password?
              </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-[#FF4E50] hover:bg-[#E75480] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-4 rounded-full transition shadow-lg shadow-[#FF4E50]/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#FAD0C4]"></div>
            <span className="text-[10px] font-bold text-[#333]/40 uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-[#FAD0C4]"></div>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-[#FFF9F0] border border-[#FAD0C4] text-[#333] font-bold py-3 rounded-full transition flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Footer Links */}
          <div className="space-y-3 pt-2">
            <Link to="/register" className="block text-center text-sm font-bold text-[#E75480] hover:text-[#FF4E50] transition">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}