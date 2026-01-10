import { auth } from "@/firebase/firebase"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export default function VerifyEmail({ email, password }) {
  const navigate = useNavigate()

  const sendVerification = async () => {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    await sendEmailVerification(userCred.user)
    toast.success("Verification email sent!")
  }

  const checkVerified = async () => {
    await auth.currentUser.reload()

    if (auth.currentUser.emailVerified) {
      navigate("/verify-phone")
    } else {
      toast.error("Email not verified yet")
    }
  }

  return (
    <>
      <button onClick={sendVerification}>Send Email</button>
      <button onClick={checkVerified}>I Verified</button>
    </>
  )
}
