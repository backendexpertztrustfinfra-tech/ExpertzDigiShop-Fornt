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
import { MessageCircle, Loader2, Send, ShieldCheck, Box, Headphones } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"

export default function ContactSupportModal({ isOpen, onClose, orderId, sellerId, userToken, orderNumber }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    description: "",
  })

  const categories = [
    { value: "delivery", label: "Delivery Related Issue" },
    { value: "product_quality", label: "Product Quality/Defect" },
    { value: "product_damage", label: "Damaged Product Received" },
    { value: "payment_issue", label: "Payment/Refund Related" },
    { value: "general", label: "General Inquiry" },
    { value: "other", label: "Other Issues" },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE_URL}/support`, {
        ...formData,
        orderId,
        sellerId, 
      }, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      })

      if (response.data.success) {
        toast.success(`Ticket Created! Reference ID: #${response.data.data.ticketNumber}`)
        setFormData({ subject: "", category: "general", description: "" })
        onClose()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-[2.5rem] border-none bg-white p-0 overflow-hidden shadow-2xl">
        
        {/* Professional Header Section */}
        <div className="bg-zinc-950 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px] rounded-full" />
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
               <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Headphones className="h-5 w-5 text-white" />
               </div>
               <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                 Help <span className="text-indigo-500">Center</span>
               </DialogTitle>
            </div>
            
            {/* Order Quick Info Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
               <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Box className="h-5 w-5 text-zinc-400" />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Issue regarding order</p>
                  <p className="text-sm font-bold text-zinc-200">ID: {orderNumber || orderId?.slice(-10).toUpperCase() || "NEW_REQUEST"}</p>
               </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-zinc-50/50">
          <div className="grid grid-cols-1 gap-6">
            
            {/* Category Selection */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Select Issue Category
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger className="h-14 rounded-2xl border-zinc-200 bg-white focus:ring-zinc-950 font-bold text-zinc-900 shadow-sm">
                  <SelectValue placeholder="What is the issue about?" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-white border-zinc-200 shadow-2xl">
                  {categories.map((cat) => (
                    <SelectItem 
                      key={cat.value} 
                      value={cat.value} 
                      className="font-bold py-3 text-sm focus:bg-zinc-100"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Input */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Problem Summary
              </Label>
              <Input
                placeholder="e.g., Wrong item delivered"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="h-14 rounded-2xl border-zinc-200 bg-white focus-visible:ring-zinc-950 font-bold shadow-sm"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Describe your issue in detail
              </Label>
              <Textarea
                placeholder="Please provide more details so our team can help you faster..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="rounded-[2rem] border-zinc-200 bg-white focus-visible:ring-zinc-950 font-bold resize-none shadow-sm p-5"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-16 rounded-2xl border-zinc-200 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-100 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-[2] h-16 rounded-2xl bg-[#FF4E50] hover:bg-[#E75480] text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-red-500/10 active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Ticket <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-zinc-400">
             <ShieldCheck size={12} className="text-green-500" />
             <p className="text-[9px] font-bold uppercase tracking-widest">
               Secured by DigiShop Protection Protocol
             </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}