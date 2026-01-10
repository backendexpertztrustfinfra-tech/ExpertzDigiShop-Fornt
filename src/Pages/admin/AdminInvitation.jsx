import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import "../../Styles/admin-invitation.css"

const AdminInvitation = () => {
  const [step, setStep] = useState(1) // 1: Send Invitation, 2: Verify OTP, 3: Create Account
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
      // Validate email domain
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
      // Validate password
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
        // Store token and redirect
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
      const response = await axios.post("/api/admin-auth/resend-otp", {
        inviteCode,
      })
      if (response.data.success) {
        toast.success("OTP resent to your email")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-invitation-container">
      <div className="admin-invitation-card">
        <div className="invitation-header">
          <h1>DigiShop Admin Portal</h1>
          <p className="subtitle">Secure Admin Account Setup</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleInviteSubmit} className="invitation-form">
            <h2>Send Admin Invitation</h2>
            <p className="form-description">Invite a team member to join the admin panel</p>

            <div className="form-group">
              <label htmlFor="email">Company Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="employee@digishop.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                required
              />
              <small>Must use company email domain (@digishop.com)</small>
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value,
                  })
                }
              >
                <option value="support">Support</option>
                <option value="operations">Operations</option>
                <option value="analytics">Analytics</option>
                <option value="management">Management</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Invitation"}
            </button>

            <div className="security-note">
              <strong>🔒 Security Note:</strong> Only company email addresses can receive invitations. An OTP will be
              sent to the registered email for verification.
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOTPSubmit} className="invitation-form">
            <h2>Verify OTP</h2>
            <p className="form-description">Enter the 6-digit OTP sent to your email</p>

            <div className="invite-code-display">
              <p>
                Invite Code: <code>{inviteCode}</code>
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="otp">One-Time Password (OTP)</label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                maxLength="6"
                value={otpData.otp}
                onChange={(e) =>
                  setOtpData({
                    otp: e.target.value.replace(/\D/g, ""),
                  })
                }
                required
              />
              <small>6-digit code (expires in 10 minutes)</small>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button type="button" className="btn-secondary" onClick={handleResendOTP} disabled={loading}>
              Resend OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleAccountSubmit} className="invitation-form">
            <h2>Create Admin Account</h2>
            <p className="form-description">Complete your admin account setup</p>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={accountData.name}
                onChange={(e) =>
                  setAccountData({
                    ...accountData,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={accountData.password}
                onChange={(e) =>
                  setAccountData({
                    ...accountData,
                    password: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={accountData.confirmPassword}
                onChange={(e) =>
                  setAccountData({
                    ...accountData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="security-note">
              <strong>✓ Account Security:</strong> Your admin account will be created and you will be logged in
              immediately. Keep your credentials secure.
            </div>
          </form>
        )}

        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <span>1</span>
            <label>Invite</label>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <span>2</span>
            <label>Verify</label>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span>3</span>
            <label>Account</label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminInvitation
