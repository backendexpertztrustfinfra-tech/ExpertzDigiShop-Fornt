import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Mail } from "lucide-react"

export default function FirebasePasswordResetSuccess() {
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Get email from sessionStorage if available
    const storedEmail = sessionStorage.getItem("passwordResetEmail")
    if (storedEmail) {
      setEmail(storedEmail)
      sessionStorage.removeItem("passwordResetEmail")
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] border border-[#FAD0C4] p-8 text-center shadow-xl shadow-[#FF4E50]/5">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#FFF9F0] rounded-full flex items-center justify-center border border-[#FAD0C4]">
              <CheckCircle className="w-8 h-8 text-[#FF4E50]" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-[#333] mb-2 uppercase tracking-tighter italic">
            Reset Email <span className="text-[#FF4E50]">Sent</span>
          </h1>

          <div className="bg-[#FFF9F0]/50 border border-[#FAD0C4] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-[#E75480] mr-2" />
              <p className="text-[#333] font-bold text-sm truncate">{email || "your email"}</p>
            </div>

            <p className="text-[#333]/60 text-xs font-medium uppercase tracking-widest mb-4 leading-relaxed">
              Firebase has sent you a password reset link. Follow these steps:
            </p>

            <ol className="text-left text-xs text-[#333]/70 space-y-3 list-decimal list-inside font-medium uppercase tracking-tight">
              <li>
                Check your <strong className="text-[#E75480]">inbox</strong> for an email from Firebase
              </li>
              <li>
                Look in <strong className="text-[#E75480]">spam/junk</strong> folder if you don't see it
              </li>
              <li>
                Click the <strong className="text-[#E75480]">reset password link</strong> in the email
              </li>
              <li>Follow instructions to set a new password</li>
              <li>You'll be redirected to login with your new password</li>
            </ol>
          </div>

          <div className="bg-[#FFF5F7] border border-[#FAD0C4]/60 rounded-xl p-4 mb-6 text-xs text-[#E75480] font-bold uppercase tracking-wider">
            <p className="mb-1">Important Note:</p>
            <p className="opacity-70 text-[10px]">The reset link is valid for 24 hours. After that, you must request a new one.</p>
          </div>

          <button
            onClick={() => navigate("/auth/login")}
            className="w-full bg-[#FF4E50] hover:bg-[#E75480] text-white font-black uppercase tracking-widest py-4 rounded-full transition shadow-lg shadow-[#FF4E50]/20 active:scale-95 duration-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}