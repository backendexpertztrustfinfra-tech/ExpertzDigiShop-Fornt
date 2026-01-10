"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, AlertCircle, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function ReturnExchangeModal({ isOpen, onClose, order, userToken }) {
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    reason: "defective",
    description: "",
  })

  const reasons = [
    { value: "defective", label: "Defective Product" },
    { value: "not_as_described", label: "Not as Described" },
    { value: "size_mismatch", label: "Size Mismatch" },
    { value: "changed_mind", label: "Changed Mind" },
    { value: "other", label: "Other Reason" },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedItem) {
      toast.error("Please select a product")
      return
    }
    if (!formData.description || formData.description.length < 10) {
      toast.error("Please provide a detailed description (min 10 chars)")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/returns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order._id,
          itemId: selectedItem._id,
          reason: formData.reason,
          description: formData.description,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Request failed")

      toast.success(`Return Request Created: #${data.returnRequest.returnNumber}`)
      setFormData({ reason: "defective", description: "" })
      setSelectedItem(null)
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-md rounded-[2.5rem] border-none bg-white p-0 shadow-2xl max-h-[90vh] flex flex-col overflow-visible"
        style={{ zIndex: 9999 }}
      >
        
        {/* Header Section */}
        <div className="bg-zinc-950 p-8 text-white relative overflow-hidden rounded-t-[2.5rem]">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <RefreshCw size={120} />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-indigo-500" />
              Return Hub
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
              Node: #{order?._id?.slice(-8) || "N/A"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Policy Banner */}
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-4">
            <AlertCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-900 leading-tight">
              30-Day Policy: Eligible for full refund or exchange
            </p>
          </div>

          {/* Item Selection */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Select Item *</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {order.items?.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedItem?._id === item._id
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md"
                      : "border-zinc-100 bg-zinc-50/30 hover:border-zinc-200"
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-sm font-black uppercase tracking-tight ${selectedItem?._id === item._id ? "text-indigo-900" : "text-zinc-950"}`}>
                      {item.product?.name}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                  {selectedItem?._id === item._id && <CheckCircle2 className="text-indigo-600 h-5 w-5" />}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {selectedItem && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                onSubmit={handleSubmit}
                className="space-y-6 pt-6 border-t border-zinc-100"
              >
                {/* Reason Dropdown - FIXED OVERLAP */}
                <div className="space-y-2 relative">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Return Reason *</Label>
                  <Select 
                    value={formData.reason} 
                    onValueChange={(val) => setFormData({ ...formData, reason: val })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-sm text-zinc-900 focus:ring-zinc-950 shadow-none">
                      <SelectValue placeholder="Select Reason" />
                    </SelectTrigger>
                    
                    {/* Fixed Content: Solid background, High Z-Index, and Pointer events */}
                    <SelectContent 
                      position="popper" 
                      sideOffset={5}
                      className="z-[10005] min-w-[var(--radix-select-trigger-width)] bg-white border border-zinc-200 rounded-xl shadow-2xl opacity-100"
                    >
                      {reasons.map((r) => (
                        <SelectItem 
                          key={r.value} 
                          value={r.value} 
                          className="font-bold py-3 uppercase text-[10px] tracking-widest focus:bg-zinc-950 focus:text-white cursor-pointer"
                        >
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Textarea */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Detailed Explanation *</Label>
                  <Textarea
                    placeholder="Min. 10 characters..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="rounded-2xl border-zinc-100 bg-zinc-50 focus-visible:ring-zinc-950 font-bold placeholder:text-zinc-300 resize-none p-4"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest text-zinc-400 hover:text-zinc-950">
                    Dismiss
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.description || formData.description.length < 10}
                    className="flex-1 h-12 rounded-2xl bg-zinc-950 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Request Return <ArrowRight size={14} className="ml-2" /></>}
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