// import { useState } from "react";
// import { useFirebaseRegister } from "@/hooks/useFirebaseRegister";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// export default function CustomerRegister() {
//   const firebase = useFirebaseRegister();
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [data, setData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     otp: "",
//     password: "",
//   });

//   const [user, setUser] = useState(null);
//   const [otpResult, setOtpResult] = useState(null);

//   const sendEmail = async () => {
//     const u = await firebase.sendEmail(data.email);
//     setUser(u);
//     toast.success("Verification email sent");
//   };

//   const verifyEmail = async () => {
//     const verified = await firebase.verifyEmail(user);
//     if (!verified) return toast.error("Verify email first");
//     toast.success("Email verified");
//   };

//   const sendOtp = async () => {
//     const result = await firebase.sendOtp(data.phone);
//     setOtpResult(result);
//     toast.success("OTP sent");
//   };

//   const verifyOtp = async () => {
//     await firebase.verifyOtp(user, otpResult, data.otp);
//     toast.success("Phone verified");
//   };

//   const submitCustomer = async () => {
//     try {
//       const firebaseToken = await user.getIdToken(true);
//       const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${firebaseToken}`,
//         },
//         body: JSON.stringify({
//           role: "customer",
//           name: data.name,
//           email: user.email,
//           phone: user.phoneNumber,
//           password: data.password,
//         }),
//       });
//       const dataRes = await res.json();
//       console.log("Backend response:", dataRes);
//       if (!res.ok) return toast.error(dataRes.message);
//       login(
//         dataRes.token,
//         dataRes.user.role,
//         dataRes.user,
//         dataRes.user.verificationStatus
//       );
//       toast.success("Customer registered 🎉");
//       navigate("/profile");
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   const continueWithGoogle = async () => {
//     try {
//       const user = await firebase.googleSignup();
//       const token = await user.getIdToken(true);

//       const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           role: "customer",
//           name: user.displayName,
//           email: user.email,
//           phone: user.phoneNumber || null,
//         }),
//       });

//       const dataRes = await res.json();
//       if (!res.ok) return toast.error(dataRes.message);
//       login(
//         dataRes.token,
//         dataRes.user.role,
//         dataRes.user,
//         dataRes.user.verificationStatus
//       );

//       toast.success("Customer registered with Google 🎉");
//       navigate("/profile");
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
//         <h2 className="text-2xl font-bold text-center">
//           Customer Registration
//         </h2>

//         <input
//           className="input p-2 w-full bg-gray-100"
//           placeholder="Full Name"
//           onChange={(e) => setData({ ...data, name: e.target.value })}
//         />

//         <input
//           className="input  p-2 w-full bg-gray-100"
//           placeholder="Email"
//           onChange={(e) => setData({ ...data, email: e.target.value })}
//         />

//         <div className="flex gap-2">
//           <button className="bg-black p-2 text-white w-full" onClick={sendEmail}>
//             Send Email
//           </button>
//           <button className="bg-black p-2 text-white  w-full" onClick={verifyEmail}>
//             Verify
//           </button>
//         </div>

//         <input
//           className="input w-full  p-2 bg-gray-100"
//           placeholder="Phone"
//           onChange={(e) => setData({ ...data, phone: e.target.value })}
//         />

//         <button className="w-full bg-black p-2 text-white" onClick={sendOtp}>
//           Send OTP
//         </button>

//         <input
//           className="input w-full p-2 bg-gray-100"
//           placeholder="OTP"
//           onChange={(e) => setData({ ...data, otp: e.target.value })}
//         />

//         <button className="bg-black p-2 text-white w-full" onClick={verifyOtp}>
//           Verify OTP
//         </button>

//         <input
//           type="password  p-2 bg-gray-100"
//           className="input"
//           placeholder="Password"
//           onChange={(e) => setData({ ...data, password: e.target.value })}
//         />

//         <button className="btn-primary w-full" onClick={submitCustomer}>
//           Register Customer
//         </button>

//         <div className="flex items-center gap-2">
//           <div className="flex-1 h-px bg-gray-300" />
//           <span className="text-sm text-gray-500">OR</span>
//           <div className="flex-1 h-px bg-gray-300" />
//         </div>

//         <button
//           onClick={continueWithGoogle}
//           className="w-full border rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-50"
//         >
//           <img
//             src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
//             className="h-5"
//           />
//           Continue with Google
//         </button>

//         <div id="recaptcha-container" />
//       </div>
//     </div>
//   );
// }
