"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, Loader2, ShoppingBag, MessageSquare, CheckCircle2 } from "lucide-react"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function RateReviewModal({ isOpen, onClose, order, userToken }) {
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    comment: "",
  })
  const [hoveredRating, setHoveredRating] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setFormData({ rating: 0, title: "", comment: "" })
      setSelectedItem(null)
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedItem) {
      toast.error("Please select a product to review")
      return
    }

    if (formData.rating === 0 || !formData.title || !formData.comment) {
      toast.error("Please fill in all review fields")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedItem.product._id || selectedItem.productId,
          orderId: order._id,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to submit review")

      toast.success("Experience Recorded. Thank you!")
      setFormData({ rating: 0, title: "", comment: "" })
      setSelectedItem(null)
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!order || order.orderStatus !== "delivered") return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-[2.5rem] border-none bg-white p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header - Zinc Dark Style */}
        <div className="bg-zinc-950 p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Star className="h-6 w-6 text-indigo-500 fill-indigo-500" />
              Rate & Review
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
              Order Verified • Share your honest experience
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Product Selection Grid */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              Select Product to Review *
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {order?.items?.map((item) => (
                <motion.div
                  key={item._id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedItem(item)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                    selectedItem?._id === item._id
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md"
                      : "border-zinc-100 hover:border-zinc-200 bg-zinc-50/30"
                  }`}
                >
                  <div className="h-12 w-12 rounded-xl bg-zinc-200 overflow-hidden flex-shrink-0">
                    {item.product?.image ? (
                        <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                            <ShoppingBag size={20} />
                        </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black uppercase tracking-tight truncate ${selectedItem?._id === item._id ? "text-indigo-900" : "text-zinc-900"}`}>
                      {item.product?.name}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400">Price: ₹{item.price}</p>
                  </div>
                  {selectedItem?._id === item._id && (
                    <CheckCircle2 className="text-indigo-600 h-5 w-5" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedItem && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6 pt-6 border-t border-zinc-100"
              >
                {/* Star Rating Section */}
                <div className="text-center space-y-4 py-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Overall Satisfaction *
                  </Label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          className={`h-10 w-10 transition-all duration-200 ${
                            star <= (hoveredRating || formData.rating)
                              ? "fill-indigo-500 text-indigo-500 drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                              : "text-zinc-200 fill-transparent"
                          }`}
                          strokeWidth={formData.rating >= star ? 0 : 2}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Review Title *</Label>
                    <Input
                      placeholder="e.g. Exceptional quality, highly recommend"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-12 rounded-xl border-zinc-100 bg-zinc-50 focus-visible:ring-indigo-600 font-bold placeholder:text-zinc-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Your Feedback *</Label>
                    <Textarea
                      placeholder="Describe your experience with the product..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      rows={4}
                      className="rounded-2xl border-zinc-100 bg-zinc-50 focus-visible:ring-indigo-600 font-bold placeholder:text-zinc-300 resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onClose} 
                    className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest text-zinc-400"
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || formData.rating === 0 || !formData.title || formData.comment.length < 10}
                    className="flex-1 h-12 rounded-2xl bg-zinc-950 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}