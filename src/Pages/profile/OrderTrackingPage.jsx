// import { useState } from "react";
// import { ArrowLeft, Package, Truck, MapPin, Clock, CheckCircle, Circle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { SAMPLE_TRACKING, formatOrderStatus } from "@/lib/orders";
// import { Link } from "react-router-dom";
// import { useParams } from "react-router-dom";

// export default function OrderTrackingPage() {
//   const params = useParams();
//   const orderId = params.orderId;

//   const [tracking] = useState(SAMPLE_TRACKING[orderId]);

//   if (!tracking) {
//     return (
//       <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4">
//         <Card className="w-full max-w-md border-[#FAD0C4]">
//           <CardContent className="p-8 text-center">
//             <Package className="h-12 w-12 text-[#E75480]/30 mx-auto mb-4" />
//             <h3 className="text-lg font-black text-[#333] mb-2 uppercase tracking-tighter">Tracking not available</h3>
//             <p className="text-zinc-500 mb-6 text-sm">Tracking information is not available for this order.</p>
//             <Link to={`/profile/orders/${orderId}`}>
//               <Button className="bg-[#FF4E50] hover:bg-[#E75480] text-white rounded-full px-8 transition-all">
//                 Back to Order Details
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-zinc-50 selection:bg-[#FF4E50] selection:text-white">
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <Link to={`/profile/orders/${orderId}`}>
//             <Button variant="ghost" size="sm" className="hover:bg-[#FFF5F7] text-[#E75480] rounded-full">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-2xl font-black text-[#333] uppercase tracking-tighter italic">Track Your <span className="text-[#FF4E50]">Order</span></h1>
//             <p className="text-[#E75480] font-mono text-sm font-bold tracking-widest">{tracking.orderId}</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Tracking Timeline */}
//           <div className="lg:col-span-2">
//             <Card className="border-[#FAD0C4]/30 shadow-xl rounded-2xl overflow-hidden">
//               <CardHeader className="bg-[#FFF5F7]/50 border-b border-[#FAD0C4]/20">
//                 <CardTitle className="flex items-center gap-2 text-[#333] uppercase tracking-widest text-sm font-black">
//                   <Truck className="h-5 w-5 text-[#FF4E50]" />
//                   Journey Timeline
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-8">
//                 <div className="space-y-0">
//                   {tracking.timeline.map((event, index) => {
//                     const isCurrent = index === tracking.timeline.findIndex((e) => !e.isCompleted);
//                     return (
//                       <div key={event.id} className="flex gap-6 group">
//                         <div className="flex flex-col items-center">
//                           <div
//                             className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
//                               event.isCompleted
//                                 ? "bg-[#FF4E50] text-white"
//                                 : isCurrent
//                                 ? "bg-[#FFD700] text-black animate-pulse"
//                                 : "bg-gray-100 text-gray-400"
//                             }`}
//                           >
//                             {event.isCompleted ? (
//                               <CheckCircle className="h-5 w-5" />
//                             ) : (
//                               <Circle className="h-5 w-5 fill-current" />
//                             )}
//                           </div>
//                           {index < tracking.timeline.length - 1 && (
//                             <div
//                               className={`w-1 h-14 transition-all duration-700 ${
//                                 event.isCompleted ? "bg-[#FFD700]" : "bg-gray-100"
//                               }`}
//                             />
//                           )}
//                         </div>
//                         <div className="flex-1 pb-10">
//                           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
//                             <h4
//                               className={`text-sm font-black uppercase tracking-widest transition-colors ${
//                                 event.isCompleted
//                                   ? "text-[#333]"
//                                   : isCurrent
//                                   ? "text-[#FF4E50]"
//                                   : "text-gray-400"
//                               }`}
//                             >
//                               {event.status}
//                             </h4>
//                             {event.timestamp && (
//                               <span className="text-[10px] font-bold text-[#E75480] bg-[#FFF5F7] px-2 py-1 rounded-md">
//                                 {new Date(event.timestamp).toLocaleString("en-IN", {
//                                   day: "numeric",
//                                   month: "short",
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })}
//                               </span>
//                             )}
//                           </div>
//                           <p className="text-sm text-zinc-600 font-medium leading-relaxed">{event.description}</p>
//                           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">
//                             <MapPin className="h-3 w-3 text-[#FFD700]" />
//                             {event.location}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Tracking Info Panel */}
//           <div className="space-y-6">
//             <Card className="border-[#FAD0C4]/30 shadow-xl rounded-2xl overflow-hidden">
//               <CardHeader className="bg-[#FFF9F0] border-b border-[#FFD700]/20">
//                 <CardTitle className="text-sm font-black uppercase tracking-widest text-[#333]">Vitals</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6 pt-6">
//                 <div>
//                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Tracking Number</div>
//                   <div className="font-mono font-bold text-[#E75480] bg-[#FFF5F7] p-2 rounded-lg border border-[#FAD0C4]/30 break-all">
//                     {tracking.trackingNumber}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Current Status</div>
//                   <Badge className="bg-[#FF4E50] text-white border-none font-black uppercase text-[10px] px-3 py-1 tracking-widest rounded-full shadow-lg shadow-[#FF4E50]/20">
//                     {formatOrderStatus(tracking.status)}
//                   </Badge>
//                 </div>
//                 {tracking.currentLocation && (
//                   <div>
//                     <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Current Location</div>
//                     <div className="font-bold flex items-center gap-2 text-[#333] italic tracking-tighter text-lg">
//                       <MapPin className="h-5 w-5 text-[#FFD700]" />
//                       {tracking.currentLocation}
//                     </div>
//                   </div>
//                 )}
//                 <div>
//                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Expected Arrival</div>
//                   <div className="font-black flex items-center gap-2 text-[#FF4E50] italic tracking-tighter text-lg">
//                     <Clock className="h-5 w-5 text-[#FFD700]" />
//                     {new Date(tracking.estimatedDelivery).toLocaleDateString("en-IN", {
//                       weekday: "long",
//                       day: "numeric",
//                       month: "short",
//                     })}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Delivery Instructions */}
//             <Card className="border-[#FAD0C4]/30 shadow-xl rounded-2xl">
//               <CardHeader>
//                 <CardTitle className="text-sm font-black uppercase tracking-widest text-[#333]">Instructions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-5">
//                   {[
//                     { title: "Be available", desc: "Our partner will call you before delivery", iconColor: "bg-[#FF4E50]" },
//                     { title: "ID proof", desc: "Keep valid identification ready", iconColor: "bg-[#FFD700]" },
//                     { title: "Inspect", desc: "Check package condition before accepting", iconColor: "bg-[#E75480]" }
//                   ].map((item, i) => (
//                     <div key={i} className="flex items-start gap-3 group">
//                       <div className={`w-1.5 h-6 ${item.iconColor} rounded-full flex-shrink-0 transition-all group-hover:scale-y-125`} />
//                       <div>
//                         <div className="font-black uppercase text-[10px] tracking-widest text-[#333]">{item.title}</div>
//                         <div className="text-xs text-zinc-500 font-medium">{item.desc}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }