"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth"
import { auth } from "../../firebase/firebase"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function RegisterPage() {
  const [step, setStep] = useState("role")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [userExists, setUserExists] = useState(false)
  const [verificationId, setVerificationId] = useState(null)
  const [otpCode, setOtpCode] = useState("")
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const confirmationResultRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (field, value) => {
    if (field === "phone") {
      // Format phone number to international format with +
      let formatted = value.replace(/\D/g, "") // Remove non-digits
      if (formatted && !formatted.startsWith("+")) {
        // Ensure it starts with country code (e.g., +91 for India)
        if (!formatted.startsWith("91") && formatted.length <= 10) {
          // If it's a 10-digit Indian number without country code
          formatted = "91" + formatted
        }
        formatted = "+" + formatted
      }
      setFormData({ ...formData, [field]: formatted })
    } else {
      setFormData({ ...formData, [field]: value })
    }
  }

  const checkUserExists = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      })
      const data = await response.json()
      return data.exists
    } catch (err) {
      console.error("[v0] Check user error:", err)
      return false
    }
  }

  const handleFirebaseSignup = async (e) => {
    e.preventDefault()

    // Check if user already exists
    const exists = await checkUserExists(formData.email)
    if (exists) {
      toast.error("Email already registered. Please login instead.")
      navigate("/login")
      return
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    if (!formData.agreeToTerms) {
      toast.error("Please accept the terms")
      return
    }

    setIsLoading(true)

    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      setFirebaseUser(result.user)

      // Send email verification
      await sendEmailVerification(result.user)
      toast.success("Verification email sent! Check your inbox")
      setStep("verify-email-phone")
    } catch (err) {
      console.error("[v0] Firebase signup error:", err)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!firebaseUser || !formData.phone) {
      toast.error("Please provide a phone number")
      return
    }

    // Validate phone number format
    if (!/^\+\d{10,15}$/.test(formData.phone)) {
      toast.error("Please enter a valid phone number with country code (e.g., +919876543210)")
      return
    }

    setIsLoading(true)

    try {
      const recaptchaContainer = document.getElementById("recaptcha-container")
      if (!recaptchaContainer) {
        console.error("[v0] Recaptcha container not found")
        toast.error("Recaptcha not initialized. Please refresh the page.")
        return
      }

      const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          console.log("[v0] Recaptcha verified:", response)
        },
        "expired-callback": () => {
          console.log("[v0] Recaptcha expired")
        },
      })

      console.log("[v0] Sending OTP to:", formData.phone)
      const result = await signInWithPhoneNumber(auth, formData.phone, recaptchaVerifier)
      confirmationResultRef.current = result
      setVerificationId(result.verificationId)
      toast.success("OTP sent to " + formData.phone)
    } catch (err) {
      console.error("[v0] OTP send error:", err.message)
      // Check if it's a test number error (Firebase free tier)
      if (err.message.includes("too many requests") || err.message.includes("quota")) {
        toast.error("Too many requests. Please try again later.")
      } else if (err.message.includes("invalid")) {
        toast.error("Invalid phone number format. Use +country code format (e.g., +919876543210)")
      } else {
        toast.error("Failed to send OTP: " + err.message)
      }
      // Clear recaptcha on error
      window.recaptchaVerifier.clear()
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!confirmationResultRef.current || !otpCode) {
      toast.error("Please enter the OTP code")
      return
    }

    if (otpCode.length !== 6) {
      toast.error("OTP must be 6 digits")
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Verifying OTP code with confirmation result")
      // Call confirm() on the confirmationResult object, not create a credential
      const result = await confirmationResultRef.current.confirm(otpCode)
      console.log("[v0] Phone verification successful:", result.user.phoneNumber)
      setPhoneVerified(true)
      setOtpCode("")
      toast.success("Phone number verified successfully!")
    } catch (err) {
      console.error("[v0] OTP verify error:", err.message)
      if (err.message.includes("invalid")) {
        toast.error("Invalid OTP code. Please check and try again.")
      } else if (err.message.includes("expired")) {
        toast.error("OTP has expired. Please request a new one.")
      } else {
        toast.error("Failed to verify OTP: " + err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteRegistration = async () => {
    if (!firebaseUser) {
      toast.error("Please sign up with email first")
      return
    }

    await firebaseUser.reload()

    if (!firebaseUser.emailVerified) {
      toast.error("Please verify your email first")
      return
    }

    if (!phoneVerified) {
      toast.error("Please verify your phone number")
      return
    }

    setIsLoading(true)

    try {
      const firebaseToken = await firebaseUser.getIdToken(true)

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: selectedRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Registration failed")
        return
      }

      const userRole = String(data.user.role).toLowerCase()

      login(data.token, userRole, {
        email: data.user.email,
        name: data.user.name,
        id: data.user.id || data.user._id,
      })

      toast.success("Registration successful!")

      setTimeout(() => {
        if (userRole === "seller") {
          navigate("/seller/verify")
        } else {
          navigate("/")
        }
      }, 300)
    } catch (err) {
      console.error("[v0] Registration error:", err)
      toast.error(err.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    if (!selectedRole) {
      toast.error("Please select a role first")
      return
    }

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
        body: JSON.stringify({ name: result.user.displayName, role: selectedRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Google signup failed")
        return
      }

      const userRole = String(data.user.role).toLowerCase()
      const isNewUser = data.isNewUser // Check if new user from backend

      login(data.token, userRole, {
        email: data.user.email,
        name: data.user.name,
        id: data.user.id || data.user._id,
      })

      toast.success("Authentication successful!")

      setTimeout(() => {
        if (userRole === "seller" && isNewUser) {
          navigate("/seller/verify")
        } else {
          navigate("/")
        }
      }, 300)
    } catch (err) {
      console.error("[v0] Google signup error:", err)
      toast.error(err.message || "Google signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Role selection screen
  if (step === "role") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Join DigiShop</h1>
            <p className="text-slate-400">Choose your account type to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setSelectedRole("customer")
                setStep("customer-signup")
              }}
              className="bg-slate-800 border-2 border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-left transition transform hover:scale-105 shadow-xl"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Shop Online</h2>
              <p className="text-slate-400 text-sm">Browse and purchase products from our marketplace</p>
              <div className="mt-6 text-blue-400 font-semibold flex items-center gap-2">
                Continue as Customer <span className="text-lg">→</span>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedRole("seller")
                setStep("customer-signup")
              }}
              className="bg-slate-800 border-2 border-slate-700 hover:border-purple-500 rounded-2xl p-8 text-left transition transform hover:scale-105 shadow-xl"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Start Selling</h2>
              <p className="text-slate-400 text-sm">Become a seller and grow your business on our platform</p>
              <div className="mt-6 text-purple-400 font-semibold flex items-center gap-2">
                Continue as Seller <span className="text-lg">→</span>
              </div>
            </button>
          </div>

          <p className="text-center text-slate-400 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Signup form screen
  if (step === "customer-signup") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Sign up as a {selectedRole}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="tel"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-12 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-blue-500"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
              />
              <span className="text-sm text-slate-400">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              onClick={handleFirebaseSignup}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-xs text-slate-400 uppercase">Or</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-3 border border-slate-600"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
              Sign up with Google
            </button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Email & Phone verification screen
  if (step === "verify-email-phone") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10">
        {/* Recaptcha Container for Firebase */}
        <div id="recaptcha-container"></div>

        <div className="w-full max-w-2xl space-y-6">
          {/* Progress Indicator */}
          <div className="flex gap-2 justify-center mb-8">
            <div className={`flex-1 h-1 rounded-full ${emailVerified ? "bg-green-500" : "bg-slate-600"}`}></div>
            <div className={`flex-1 h-1 rounded-full ${phoneVerified ? "bg-green-500" : "bg-slate-600"}`}></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Email Verification Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Email</h2>
                <p className="text-slate-400 text-sm">{formData.email}</p>
              </div>

              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  {emailVerified ? "✓ Email verified!" : "Check your email for the verification link"}
                </p>
              </div>

              {emailVerified ? (
                <div className="text-green-400 font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Verified
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (firebaseUser) {
                      firebaseUser.reload().then(() => {
                        if (firebaseUser.emailVerified) {
                          setEmailVerified(true)
                          toast.success("Email verification confirmed!")
                        } else {
                          toast.error("Email not verified yet. Check your inbox.")
                        }
                      })
                    }
                  }}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      Checking...
                    </>
                  ) : (
                    "I've Verified My Email"
                  )}
                </button>
              )}
            </div>

            {/* Phone OTP Verification Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8 text-purple-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Phone</h2>
                <p className="text-slate-400 text-sm">{formData.phone}</p>
              </div>

              {!verificationId ? (
                <button
                  onClick={handleSendOTP}
                  disabled={isLoading || !formData.phone}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP Code"
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 block mb-2">Enter OTP Code</label>
                    <input
                      type="text"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-center text-3xl font-bold tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="000000"
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    />
                    <p className="text-xs text-slate-400 mt-2">Check your phone for the 6-digit code</p>
                  </div>

                  {phoneVerified ? (
                    <div className="text-green-400 font-semibold flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Phone Verified
                    </div>
                  ) : (
                    <button
                      onClick={handleVerifyOTP}
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>
                  )}

                  {!phoneVerified && (
                    <button
                      onClick={() => {
                        setVerificationId(null)
                        setOtpCode("")
                      }}
                      disabled={isLoading}
                      className="w-full text-purple-400 hover:text-purple-300 font-semibold py-2"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Complete Registration Button */}
          {emailVerified && phoneVerified && (
            <div className="mt-8">
              <button
                onClick={handleCompleteRegistration}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-bold py-4 rounded-lg text-lg transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Completing Registration...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </button>
            </div>
          )}

          {/* Info Box for Testing */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
            <p className="text-xs text-slate-400">For testing, use these test numbers with code 123456:</p>
            <p className="text-xs text-slate-300 mt-1 font-mono">+91 89204 11042 | +91 99119 00710</p>
          </div>
        </div>
      </div>
    )
  }
}
