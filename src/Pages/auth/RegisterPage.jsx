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
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7] px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#333] mb-2 font-sans tracking-tight leading-none">Join <span className="text-[#FF4E50]">DigiShop</span></h1>
            <p className="text-[#333]/60 font-medium">Choose your account type to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setSelectedRole("customer")
                setStep("customer-signup")
              }}
              className="bg-white border-2 border-[#FAD0C4] hover:border-[#FF4E50] rounded-2xl p-8 text-left transition transform hover:scale-105 shadow-xl shadow-[#FF4E50]/5"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-[#FFF9F0] rounded-lg flex items-center justify-center mb-4 border border-[#FAD0C4]">
                  <User className="w-6 h-6 text-[#E75480]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mb-2 uppercase tracking-tight">Shop Online</h2>
              <p className="text-[#333]/60 text-sm">Browse and purchase products from our marketplace</p>
              <div className="mt-6 text-[#FF4E50] font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
                Continue as Customer <span className="text-lg">→</span>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedRole("seller")
                setStep("customer-signup")
              }}
              className="bg-white border-2 border-[#FAD0C4] hover:border-[#E75480] rounded-2xl p-8 text-left transition transform hover:scale-105 shadow-xl shadow-[#E75480]/5"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-[#FFF5F7] rounded-lg flex items-center justify-center mb-4 border border-[#FAD0C4]">
                  <User className="w-6 h-6 text-[#FF4E50]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#333] mb-2 uppercase tracking-tight">Start Selling</h2>
              <p className="text-[#333]/60 text-sm">Become a seller and grow your business on our platform</p>
              <div className="mt-6 text-[#E75480] font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
                Continue as Seller <span className="text-lg">→</span>
              </div>
            </button>
          </div>

          <p className="text-center text-[#333]/60 mt-8 font-bold uppercase tracking-widest text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-[#E75480] hover:text-[#FF4E50] border-b border-[#E75480] pb-0.5 transition-colors">
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7] px-4 py-10 font-sans">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#333] mb-2 uppercase tracking-tighter italic">Create Account</h1>
            <p className="text-[#333]/60 font-medium">Sign up as a {selectedRole}</p>
          </div>

          <div className="bg-white border border-[#FAD0C4] rounded-2xl shadow-2xl p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#333]/70 ml-1 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
                <input
                  type="text"
                  className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-lg pl-12 pr-4 py-3 text-[#333] placeholder-[#333]/30 focus:outline-none focus:ring-2 focus:ring-[#FF4E50] transition"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#333]/70 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
                <input
                  type="email"
                  className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-lg pl-12 pr-4 py-3 text-[#333] placeholder-[#333]/30 focus:outline-none focus:ring-2 focus:ring-[#FF4E50] transition"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#333]/70 ml-1 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
                <input
                  type="tel"
                  className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-lg pl-12 pr-4 py-3 text-[#333] placeholder-[#333]/30 focus:outline-none focus:ring-2 focus:ring-[#FF4E50] transition"
                  placeholder="+91..."
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#333]/70 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-lg pl-12 pr-12 py-3 text-[#333] placeholder-[#333]/30 focus:outline-none focus:ring-2 focus:ring-[#FF4E50] transition"
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

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#333]/70 ml-1 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-lg pl-12 pr-12 py-3 text-[#333] placeholder-[#333]/30 focus:outline-none focus:ring-2 focus:ring-[#FF4E50] transition"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333]/40 hover:text-[#E75480] transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded accent-[#FF4E50]"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
              />
              <span className="text-sm text-[#333]/60 font-medium">
                I agree to the{" "}
                <Link to="/terms" className="text-[#E75480] hover:text-[#FF4E50] font-bold underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-[#E75480] hover:text-[#FF4E50] font-bold underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              onClick={handleFirebaseSignup}
              disabled={isLoading}
              className="w-full bg-[#FF4E50] hover:bg-[#E75480] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 rounded-lg transition shadow-lg shadow-[#FF4E50]/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-[#FAD0C4]"></div>
              <span className="text-[10px] font-bold text-[#333]/40 uppercase tracking-widest">Or</span>
              <div className="flex-1 h-px bg-[#FAD0C4]"></div>
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full bg-white hover:bg-[#FFF9F0] border border-[#FAD0C4] text-[#333] font-bold py-3 rounded-full transition flex items-center justify-center gap-3 active:scale-95 duration-500 shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Sign up with Google
            </button>

            <p className="text-center text-sm text-[#333]/60 pt-2 font-bold uppercase tracking-tight">
              Already have an account?{" "}
              <Link to="/login" className="text-[#E75480] hover:text-[#FF4E50] font-semibold underline">
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7] px-4 py-10 font-sans text-[#333]">
        {/* Recaptcha Container for Firebase */}
        <div id="recaptcha-container"></div>

        <div className="w-full max-w-2xl space-y-6">
          {/* Progress Indicator */}
          <div className="flex gap-2 justify-center mb-8 px-10">
            <div className={`flex-1 h-1 rounded-full transition-all duration-1000 ${emailVerified ? "bg-[#FF4E50]" : "bg-[#FAD0C4]"}`}></div>
            <div className={`flex-1 h-1 rounded-full transition-all duration-1000 ${phoneVerified ? "bg-[#FF4E50]" : "bg-[#FAD0C4]"}`}></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Email Verification Card */}
            <div className="bg-white border border-[#FAD0C4] rounded-2xl shadow-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-[#FFF9F0] rounded-full flex items-center justify-center mx-auto border border-[#FAD0C4]">
                <Mail className="w-8 h-8 text-[#E75480]" />
              </div>

              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Verify Email</h2>
                <p className="text-[#333]/60 text-sm truncate">{formData.email}</p>
              </div>

              <div className="bg-[#FFF9F0] border border-[#FAD0C4]/50 rounded-lg p-4 font-bold uppercase text-[10px] tracking-widest text-[#E75480]">
                {emailVerified ? "✓ Email verified!" : "Check inbox for link"}
              </div>

              {emailVerified ? (
                <div className="text-emerald-500 font-bold flex items-center justify-center gap-2">
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
                  className="w-full bg-[#333] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-lg transition"
                >
                  I've Verified Email
                </button>
              )}
            </div>

            {/* Phone OTP Verification Card */}
            <div className="bg-white border border-[#FAD0C4] rounded-2xl shadow-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-[#FFF5F7] rounded-full flex items-center justify-center mx-auto border border-[#FAD0C4]">
                <Phone className="w-8 h-8 text-[#FF4E50]" />
              </div>

              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Verify Phone</h2>
                <p className="text-[#333]/60 text-sm">{formData.phone}</p>
              </div>

              {!verificationId ? (
                <button
                  onClick={handleSendOTP}
                  disabled={isLoading || !formData.phone}
                  className="w-full bg-[#FF4E50] hover:bg-[#E75480] text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-lg transition"
                >
                  {isLoading ? "Sending..." : "Send OTP Code"}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#333]/40 block mb-2 text-left ml-1">OTP Code</label>
                    <input
                      type="text"
                      className="w-full bg-[#FFF9F0] border border-[#FAD0C4] rounded-lg px-4 py-3 text-[#333] text-center text-3xl font-black tracking-widest outline-none focus:ring-2 focus:ring-[#FF4E50]"
                      placeholder="000000"
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  {phoneVerified ? (
                    <div className="text-emerald-500 font-bold flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Verified
                    </div>
                  ) : (
                    <button
                      onClick={handleVerifyOTP}
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full bg-[#333] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-lg transition"
                    >
                      Verify OTP
                    </button>
                  )}

                  {!phoneVerified && (
                    <button
                      onClick={() => {
                        setVerificationId(null)
                        setOtpCode("")
                      }}
                      disabled={isLoading}
                      className="w-full text-[#E75480] hover:text-[#FF4E50] font-black uppercase tracking-widest text-[10px] py-2 transition-colors"
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
                className="w-full bg-[#FF4E50] hover:bg-[#E75480] text-white font-black uppercase tracking-widest py-4 rounded-full text-lg shadow-xl shadow-[#FF4E50]/30 transition-all active:scale-95"
              >
                {isLoading ? "Finishing..." : "Complete Registration"}
              </button>
            </div>
          )}

          {/* Info Box for Testing */}
          <div className="bg-white/50 border border-[#FAD0C4] rounded-lg p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#333]/40">Testing Credentials:</p>
            <p className="text-[10px] font-bold text-[#E75480] mt-1 font-mono tracking-widest">+91 89204 11042 | +91 99119 00710 (Code: 123456)</p>
          </div>
        </div>
      </div>
    )
  }
}