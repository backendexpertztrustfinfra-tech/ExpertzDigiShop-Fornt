// "use client";

// import { useState } from "react";
// import { Star, ThumbsUp, Edit, Trash2, Search } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { SAMPLE_REVIEWS, calculateAverageRating } from "@/lib/reviews";

// export default function ReviewsPage() {
//   const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [ratingFilter, setRatingFilter] = useState("all");

//   const filteredReviews = reviews.filter((review) => {
//     const matchesSearch =
//       review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       review.title.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter;
//     return matchesSearch && matchesRating;
//   });

//   const averageRating = calculateAverageRating(reviews);

//   const renderStars = (rating, size = "sm") => {
//     const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
//     return (
//       <div className="flex items-center gap-1">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <Star
//             key={star}
//             className={`${sizeClass} ${star <= rating ? "fill-[#FFD700] text-[#FFD700]" : "text-zinc-200"}`}
//           />
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-zinc-50 selection:bg-[#FF4E50] selection:text-white">
//       <div className="max-w-6xl mx-auto px-4 py-12">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-[#FAD0C4] pb-8">
//           <div>
//             <h1 className="text-4xl font-black text-[#333] uppercase tracking-tighter italic">
//               My <span className="text-[#FF4E50]">Reviews</span>
//             </h1>
//             <p className="text-[#E75480] font-bold text-xs uppercase tracking-widest mt-1 opacity-70">
//               Manage your product reviews and ratings
//             </p>
//           </div>
//           <Button className="bg-[#FF4E50] hover:bg-[#E75480] rounded-full px-8 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#FF4E50]/20">
//             Write a Review
//           </Button>
//         </div>

//         {/* Stats Section */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
//           {[
//             { label: "Total Reviews", value: reviews.length, color: "text-[#FF4E50]" },
//             { label: "Average Rating", value: averageRating, color: "text-[#FFB800]", isRating: true },
//             { label: "Helpful Votes", value: reviews.reduce((sum, review) => sum + review.helpfulCount, 0), color: "text-[#E75480]" },
//             { label: "With Photos", value: reviews.filter((r) => r.images?.length > 0).length, color: "text-[#333]" }
//           ].map((stat, i) => (
//             <Card key={i} className="border-[#FAD0C4]/30 shadow-xl rounded-2xl overflow-hidden group hover:border-[#FF4E50]/50 transition-all">
//               <CardContent className="p-6 text-center bg-white group-hover:bg-[#FFF5F7]/30 transition-colors">
//                 <div className={`text-3xl font-black italic tracking-tighter mb-1 ${stat.color} flex items-center justify-center gap-2`}>
//                   {stat.value}
//                   {stat.isRating && <Star className="h-6 w-6 fill-[#FFD700] text-[#FFD700]" />}
//                 </div>
//                 <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Filters */}
//         <Card className="mb-8 p-1 border-[#FAD0C4]/30 shadow-lg rounded-2xl overflow-hidden">
//           <CardContent className="p-4 bg-white">
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-1">
//                 <div className="relative group">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#E75480]/40 group-focus-within:text-[#FF4E50] transition-colors" />
//                   <Input
//                     placeholder="Search reviews by product name or title..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10 h-12 rounded-xl border-[#FAD0C4]/50 focus-visible:ring-[#FF4E50] font-medium"
//                   />
//                 </div>
//               </div>
//               <Select value={ratingFilter} onValueChange={setRatingFilter}>
//                 <SelectTrigger className="w-full md:w-56 h-12 rounded-xl border-[#FAD0C4]/50 font-bold uppercase text-[10px] tracking-widest text-[#E75480]">
//                   <SelectValue placeholder="Filter by rating" />
//                 </SelectTrigger>
//                 <SelectContent className="rounded-xl border-[#FAD0C4]">
//                   <SelectItem value="all">All Ratings</SelectItem>
//                   <SelectItem value="5">5 Stars</SelectItem>
//                   <SelectItem value="4">4 Stars</SelectItem>
//                   <SelectItem value="3">3 Stars</SelectItem>
//                   <SelectItem value="2">2 Stars</SelectItem>
//                   <SelectItem value="1">1 Star</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Reviews List */}
//         <div className="space-y-6">
//           {filteredReviews.length === 0 ? (
//             <Card className="border-dashed border-2 border-[#FAD0C4] bg-[#FFF5F7]/30 rounded-[2rem]">
//               <CardContent className="p-16 text-center">
//                 <Star className="h-16 w-16 text-[#FAD0C4] mx-auto mb-4 opacity-40" />
//                 <h3 className="text-xl font-black text-[#333] uppercase tracking-tighter italic">No reviews found</h3>
//                 <p className="text-[#E75480]/60 font-medium mb-8">
//                   {searchTerm || ratingFilter !== "all"
//                     ? "Try adjusting your search or filters"
//                     : "You haven't written any reviews yet"}
//                 </p>
//                 <a href="/profile/orders">
//                   <Button className="bg-[#FF4E50] hover:bg-[#E75480] rounded-full px-8 uppercase text-[10px] font-black tracking-widest">Review Your Orders</Button>
//                 </a>
//               </CardContent>
//             </Card>
//           ) : (
//             filteredReviews.map((review) => (
//               <Card key={review.id} className="border-[#FAD0C4]/30 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[1.5rem] overflow-hidden">
//                 <CardContent className="p-6 sm:p-8 bg-white">
//                   <div className="flex flex-col sm:flex-row gap-6">
//                     <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-[#FAD0C4]/30 flex-shrink-0 shadow-inner p-1 bg-white">
//                       <img
//                         src={review.productImage || "/placeholder.svg"}
//                         alt={review.productName}
//                         className="object-contain h-full w-full"
//                       />
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between mb-4 gap-4">
//                         <div className="min-w-0">
//                           <h3 className="font-black text-lg text-[#333] truncate uppercase tracking-tighter italic">{review.productName}</h3>
//                           <div className="flex flex-wrap items-center gap-4 mt-2">
//                             {renderStars(review.rating)}
//                             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
//                               {new Date(review.createdAt).toLocaleDateString("en-IN")}
//                             </span>
//                             {review.isVerifiedPurchase && (
//                               <Badge className="bg-[#FFF5F7] text-[#E75480] border-[#FAD0C4] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
//                                 Verified Purchase
//                               </Badge>
//                             )}
//                           </div>
//                         </div>
//                         <div className="flex gap-1">
//                           <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0 hover:bg-[#FFF5F7] text-zinc-400 hover:text-[#E75480]">
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button variant="ghost" size="sm" className="rounded-full h-9 w-9 p-0 hover:bg-red-50 text-zinc-400 hover:text-red-500">
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>

//                       <h4 className="font-bold text-zinc-800 mb-2 uppercase text-xs tracking-wide">{review.title}</h4>
//                       <p className="text-sm text-zinc-500 leading-relaxed font-medium mb-6 italic">"{review.comment}"</p>

//                       {review.images && review.images.length > 0 && (
//                         <div className="flex gap-3 mb-6">
//                           {review.images.map((image, index) => (
//                             <div key={index} className="relative h-20 w-20 rounded-xl overflow-hidden border border-[#FAD0C4]/20 shadow-sm">
//                               <img
//                                 src={image || "/placeholder.svg"}
//                                 alt={`Review image ${index + 1}`}
//                                 className="object-cover h-full w-full"
//                               />
//                             </div>
//                           ))}
//                         </div>
//                       )}

//                       <div className="flex items-center justify-between pt-6 border-t border-zinc-100 mt-auto">
//                         <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
//                           <span className="flex items-center gap-2 text-[#E75480]">
//                             <div className="bg-[#FFF5F7] p-1.5 rounded-lg">
//                               <ThumbsUp className="h-3 w-3" />
//                             </div>
//                             {review.helpfulCount} helpful
//                           </span>
//                           <span className="text-zinc-300">ID: {review.orderId}</span>
//                         </div>
//                         <a href={`/product/${review.productId}`}>
//                           <Button variant="outline" size="sm" className="rounded-full border-[#FFD700] text-[#333] hover:bg-[#FFF9F0] font-black uppercase text-[9px] tracking-[0.2em] h-9 px-5 transition-all">
//                             View Product
//                           </Button>
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }