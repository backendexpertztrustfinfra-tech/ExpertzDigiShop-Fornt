import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../../firebase/firebase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase())
      setEmailSent(true)
      toast.success("Password reset email sent! Check your inbox.")
      console.log("[v0] Firebase password reset email sent to:", email)
    } catch (error) {
      console.error("[v0] Firebase forgot password error:", error)

      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email address")
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address")
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later")
      } else {
        toast.error("Error sending reset email. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[2rem] border border-[#FAD0C4] p-8 text-center shadow-xl shadow-[#FF4E50]/5">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FFF9F0] rounded-full flex items-center justify-center border border-[#FAD0C4]">
                <CheckCircle className="w-8 h-8 text-[#FF4E50]" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-[#333] mb-2 uppercase tracking-tighter italic">Check Your <span className="text-[#FF4E50]">Email</span></h1>
            <p className="text-[#333]/60 mb-6 font-medium">
              We've sent a password reset link to <span className="font-bold text-[#E75480]">{email}</span>
            </p>
            <div className="bg-[#FFF9F0]/50 border border-[#FAD0C4] rounded-2xl p-4 mb-6 text-left text-sm text-[#333]/70 font-medium uppercase tracking-tight">
              <p className="font-black text-[#E75480] mb-2">📧 Next Steps:</p>
              <ul className="space-y-2">
                <li>
                  Check your <strong className="text-[#333]">inbox</strong> for the email
                </li>
                <li>
                  If not there, check <strong className="text-[#333]">spam/junk</strong>
                </li>
                <li>Click the link to reset password</li>
                <li>
                  Link expires in <strong className="text-[#333]">24 hours</strong>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full bg-[#FF4E50] hover:bg-[#E75480] text-white font-black uppercase tracking-widest py-3 rounded-full transition-all shadow-lg shadow-[#FF4E50]/20 mb-4"
            >
              Back to Login
            </button>
            <button
              onClick={() => setEmailSent(false)}
              className="w-full text-[#E75480] hover:text-[#FF4E50] font-black uppercase tracking-widest text-xs transition-colors"
            >
              Didn't get email? Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] border border-[#FAD0C4] p-8 shadow-xl shadow-[#FF4E50]/5">
          <Link to="/auth/login" className="flex items-center text-[#333]/40 hover:text-[#E75480] mb-8 transition-colors font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#333] mb-2 uppercase tracking-tighter italic">Forgot <span className="text-[#FF4E50]">Password?</span></h1>
            <p className="text-[#333]/60 font-medium text-sm leading-relaxed">
              Enter your email address and we'll send you a link to reset your password via Firebase.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#333]/40 ml-1 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E75480]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#FFF9F0]/50 border border-transparent border-b-[#FAD0C4] rounded-xl pl-12 pr-4 py-3 text-[#333] placeholder-[#333]/20 focus:outline-none focus:border-b-[#FF4E50] transition-all font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF4E50] hover:bg-[#E75480] disabled:bg-zinc-200 text-white font-black uppercase tracking-widest py-4 rounded-full transition-all shadow-lg shadow-[#FF4E50]/20 flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <p className="text-center text-[#333]/40 text-[10px] font-black uppercase tracking-widest mt-6">
            Remembered password?{" "}
            <Link to="/auth/login" className="text-[#E75480] hover:text-[#FF4E50] border-b border-[#E75480] pb-0.5 transition-all">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}