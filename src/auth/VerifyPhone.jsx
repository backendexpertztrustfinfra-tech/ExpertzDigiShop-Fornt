import { auth } from "@/firebase/firebase"
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth"
import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL

export default function VerifyPhone() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [confirmation, setConfirmation] = useState(null)

  const sendOtp = async () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    )

    const result = await signInWithPhoneNumber(
      auth,
      phone,
      window.recaptchaVerifier
    )

    setConfirmation(result)
    toast.success("OTP sent")
  }

  const verifyOtpAndRegister = async () => {
    await confirmation.confirm(otp)

    // 🔐 Firebase token
    const token = await auth.currentUser.getIdToken()

    // ✅ FINAL BACKEND CALL
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: state.name,
        role: state.role,
        password: "handled-by-firebase", // backend ignores for google
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.message)
      return
    }

    toast.success("Account created successfully!")
    navigate("/")
  }

  return (
    <>
      <input placeholder="+91XXXXXXXXXX" onChange={(e) => setPhone(e.target.value)} />
      <button onClick={sendOtp}>Send OTP</button>

      <input placeholder="OTP" onChange={(e) => setOtp(e.target.value)} />
      <button onClick={verifyOtpAndRegister}>Verify & Continue</button>

      <div id="recaptcha-container"></div>
    </>
  )
}
