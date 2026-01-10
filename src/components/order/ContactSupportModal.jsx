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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessageCircle, Loader2, Send } from "lucide-react"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function ContactSupportModal({ isOpen, onClose, orderId, userToken }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    description: "",
  })

  const categories = [
    { value: "delivery", label: "Delivery Issue" },
    { value: "product_quality", label: "Product Quality" },
    { value: "product_damage", label: "Product Damage" },
    { value: "payment_issue", label: "Payment Issue" },
    { value: "general", label: "General Inquiry" },
    { value: "other", label: "Other" },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/support`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          orderId,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to create ticket")

      toast.success(`Ticket created! #${data.ticket.ticketNumber}`)
      setFormData({ subject: "", category: "general", description: "" })
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Note: 'overflow-visible' added to DialogContent to prevent dropdown clipping 
      */}
      <DialogContent className="max-w-[95vw] sm:max-w-md rounded-3xl border-zinc-200 bg-white p-0 overflow-visible shadow-2xl">
        
        {/* Header Section */}
        <div className="bg-zinc-950 p-6 text-white rounded-t-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase italic tracking-tighter">
              <MessageCircle className="h-6 w-6 text-indigo-500" />
              Contact Support
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium uppercase text-[10px] tracking-widest">
              Resolution Node • ID: {orderId?.slice(-6) || "GENERAL"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Issue Category Dropdown */}
          <div className="space-y-2 relative">
            <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
              Issue Category *
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => setFormData({ ...formData, category: val })}
            >
              <SelectTrigger className="h-12 rounded-xl border-zinc-200 bg-zinc-50 focus:ring-indigo-600 font-bold text-zinc-900 shadow-sm">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              
              {/* Fix: added 'z-[100]' and 'position relative' to ensure it stays on top 
              */}
              <SelectContent className="z-[100] rounded-xl border-zinc-200 shadow-2xl bg-white min-w-[var(--radix-select-trigger-width)]">
                {categories.map((cat) => (
                  <SelectItem 
                    key={cat.value} 
                    value={cat.value} 
                    className="font-bold py-3 uppercase text-[11px] tracking-wide focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer"
                  >
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
              Subject *
            </Label>
            <Input
              id="subject"
              placeholder="Summary of your issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="h-12 rounded-xl border-zinc-200 bg-zinc-50 focus-visible:ring-indigo-600 font-bold placeholder:text-zinc-400"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
              Detailed Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the problem in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="rounded-2xl border-zinc-200 bg-zinc-50 focus-visible:ring-indigo-600 font-bold placeholder:text-zinc-400 resize-none p-4"
            />
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-12 rounded-2xl border-zinc-200 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50"
            >
              Discard
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 h-12 rounded-2xl bg-zinc-950 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}