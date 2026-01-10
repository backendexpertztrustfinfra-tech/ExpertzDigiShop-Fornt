// import { useState } from "react";
// import { useFirebaseRegister } from "@/hooks/useFirebaseRegister";
// import { toast } from "react-toastify";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// export default function SellerRegister() {
//   const firebase = useFirebaseRegister();
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [data, setData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     otp: "",
//     password: "",
//     storeName: "",
//     gstNumber: "",
//     panNumber: "",
//     bankAccount: "",
//     ifsc: "",
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

//   const submitSeller = async () => {
//     try {
//       if (!user) {
//         return toast.error("Please complete email & phone verification first");
//       }

//       await user.reload();

//       if (!user.emailVerified) {
//         return toast.error("Email not verified");
//       }

//       if (!user.phoneNumber) {
//         return toast.error("Phone not verified");
//       }

//       const firebaseToken = await user.getIdToken(true);

//       const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${firebaseToken}`,
//         },
//         body: JSON.stringify({
//           role: "seller",
//           name: data.name,
//           email: user.email,
//           phone: user.phoneNumber,
//           storeName: data.storeName,
//           gstNumber: data.gstNumber,
//           panNumber: data.panNumber,
//           password: data.password,
//           bankAccountNumber: data.bankAccount,
//           ifscCode: data.ifsc,
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

//       localStorage.setItem("token", dataRes.token);
//       localStorage.setItem("user", JSON.stringify(dataRes.user));

//       toast.success("Seller registered 🎉");
//       navigate("/seller/dashboard");
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
//           role: "seller",
//           name: user.displayName,
//           email: user.email,
//           phone: user.phoneNumber || null,
//           storeName: data.storeName || "",
//           gstNumber: data.gstNumber || "",
//           panNumber: data.panNumber || "",
//           bankAccountNumber: data.bankAccount || "",
//           ifscCode: data.ifsc || "",
//         }),
//       });

//       const dataRes = await res.json();
//       console.log(dataRes);
//       if (!res.ok) return toast.error(dataRes.message);
//       login(
//         dataRes.token,
//         dataRes.user.role,
//         dataRes.user,
//         dataRes.user.verificationStatus
//       );
//       toast.success("Seller registered with Google 🎉");
//       navigate("/seller/dashboard");
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-orange-50">
//       <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg space-y-4">
//         <h2 className="text-2xl font-bold text-center">Seller Registration</h2>

//         <input
//           className="input w-full p-2 bg-gray-100"
//           placeholder="Full Name"
//           onChange={(e) => setData({ ...data, name: e.target.value })}
//         />
//         <input
//           className="input w-full p-2 bg-gray-100"
//           placeholder="Email"
//           onChange={(e) => setData({ ...data, email: e.target.value })}
//         />

//         <div className="flex gap-2">
//           <button className="bg-black text-white p-2 w-full" onClick={sendEmail}>
//             Send Email
//           </button>
//           <button className="bg-black text-white p-2 w-full" onClick={verifyEmail}>
//             Verify
//           </button>
//         </div>

//         <input
//           className="input w-full p-2 bg-gray-100"
//           placeholder="Phone"
//           onChange={(e) => setData({ ...data, phone: e.target.value })}
//         />

//         <button className="bg-black text-white p-2 w-full" onClick={sendOtp}>
//           Send OTP
//         </button>

//         <input
//           className="input w-full p-2 bg-gray-100"
//           placeholder="OTP"
//           onChange={(e) => setData({ ...data, otp: e.target.value })}
//         />

//         <button className="bg-black  text-white p-2 w-full" onClick={verifyOtp}>
//           Verify OTP
//         </button>

//         <input
//           className="input w-full p-2 bg-gray-100"
//           placeholder="Store Name"
//           onChange={(e) => setData({ ...data, storeName: e.target.value })}
//         />

//         <input
//           className="input w-full p-2 bg-gray-100"
//           placeholder="GST Number"
//           onChange={(e) => setData({ ...data, gstNumber: e.target.value })}
//         />

//         <input
//           className="input w-full p-2 bg-gray-100"
//           placeholder="PAN Number"
//           onChange={(e) => setData({ ...data, panNumber: e.target.value })}
//         />
//         <input
//           type="password"
//           className="input w-full p-2 bg-gray-100" 
//           placeholder="Password"
//           onChange={(e) => setData({ ...data, password: e.target.value })}
//         />

//         <button className="bg-black text-white p-2 w-full" onClick={submitSeller}>
//           Register Seller
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
