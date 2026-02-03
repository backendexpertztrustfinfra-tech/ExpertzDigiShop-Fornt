import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Key, 
  ArrowRight, 
  RefreshCcw,
  CheckCircle2 
} from "lucide-react"

const AdminInvitation = () => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    department: "support",
  })
  const [otpData, setOtpData] = useState({
    otp: "",
  })
  const [accountData, setAccountData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  })
  const navigate = useNavigate()

  const handleInviteSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!formData.email.endsWith("@digishop.com")) {
        toast.error("Only company email addresses (@digishop.com) can be invited")
        setLoading(false)
        return
      }
      const response = await axios.post("/api/admin-auth/invite", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })
      if (response.data.success) {
        setInviteCode(response.data.inviteCode)
        toast.success("Invitation sent! Check your email for OTP")
        setStep(2)
        setFormData({ email: "", department: "support" })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation")
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post("/api/admin-auth/verify-otp", {
        inviteCode,
        otp: otpData.otp,
      })
      if (response.data.success) {
        toast.success("OTP verified successfully!")
        setStep(3)
        setOtpData({ otp: "" })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleAccountSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (accountData.password.length < 6) {
        toast.error("Password must be at least 6 characters")
        setLoading(false)
        return
      }
      if (accountData.password !== accountData.confirmPassword) {
        toast.error("Passwords do not match")
        setLoading(false)
        return
      }
      const response = await axios.post("/api/admin-auth/create-account", {
        inviteCode,
        name: accountData.name,
        password: accountData.password,
      })
      if (response.data.success) {
        localStorage.setItem("userToken", response.data.token)
        localStorage.setItem("userRole", "admin")
        toast.success("Admin account created successfully!")
        setTimeout(() => {
          navigate("/admin/dashboard")
        }, 1500)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      const response = await axios.post("/api/admin-auth/resend-otp", { inviteCode })
      if (response.data.success) toast.success("OTP resent to your email")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-[#0f172a] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Header Section */}
        <div className="p-10 border-b border-slate-800 bg-slate-900/50 text-center">
          <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter uppercase italic">
            DigiShop Admin Portal
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            Secure Admin Account Setup
          </p>
        </div>

        <div className="p-10">
          {step === 1 && (
            <form onSubmit={handleInviteSubmit} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-orange-500" size={24} />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Send Invitation</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="email"
                      placeholder="employee@digishop.com"
                      className="w-full bg-slate-950 p-4 pl-12 text-xs font-black border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 transition-all text-slate-300"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                  <select
                    className="w-full bg-slate-950 p-4 text-xs font-black border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 transition-all text-slate-300 uppercase tracking-widest appearance-none"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="support">Support</option>
                    <option value="operations">Operations</option>
                    <option value="analytics">Analytics</option>
                    <option value="management">Management</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 bg-gradient-to-r from-pink-600 via-orange-600 to-yellow-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                {loading ? "Initializing..." : "Send Protocol Invitation"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="text-orange-500" size={24} />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Verify Identity</h2>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-center mb-6">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Invite Code</p>
                <code className="text-sm font-black text-orange-400">{inviteCode}</code>
              </div>

              <div className="space-y-2 text-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength="6"
                  className="w-full bg-slate-950 p-6 text-2xl font-black border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 transition-all text-white text-center tracking-[0.5em]"
                  placeholder="000000"
                  value={otpData.otp}
                  onChange={(e) => setOtpData({ otp: e.target.value.replace(/\D/g, "") })}
                  required
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={loading} className="flex-1 py-5 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                  Verify Node
                </button>
                <button type="button" onClick={handleResendOTP} className="px-6 bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl hover:text-white transition-all">
                  <RefreshCcw size={18} />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleAccountSubmit} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="text-orange-500" size={24} />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Finalize Account</h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-slate-950 p-4 pl-12 text-xs font-black border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 transition-all text-slate-300 uppercase"
                    value={accountData.name}
                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="password"
                    placeholder="Create Password"
                    className="w-full bg-slate-950 p-4 pl-12 text-xs font-black border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 transition-all text-slate-300"
                    value={accountData.password}
                    onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full bg-slate-950 p-4 pl-12 text-xs font-black border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 transition-all text-slate-300"
                    value={accountData.confirmPassword}
                    onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                {loading ? "Syncing..." : "Initialize Admin Access"}
              </button>
            </form>
          )}

          {/* Stepper Logic */}
          <div className="mt-12 flex items-center justify-between px-4">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                  step >= s ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "bg-slate-900 border-slate-800 text-slate-600"
                }`}>
                  {step > s ? <CheckCircle2 size={20} /> : <span className="text-xs font-black">{s}</span>}
                </div>
                {i < 2 && (
                  <div className={`h-[2px] flex-1 mx-4 transition-all duration-500 ${step > s ? "bg-orange-500" : "bg-slate-800"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="p-8 bg-slate-900/30 border-t border-slate-800">
           <div className="flex gap-4 items-start bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10">
              <ShieldCheck className="text-orange-500 shrink-0" size={16} />
              <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                <span className="text-orange-500">Security Node:</span> Internal invitations are limited to official domains. 
                Full audit logs are generated for every administrative account creation.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}

export default AdminInvitation