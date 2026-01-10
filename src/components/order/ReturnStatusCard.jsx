"use client"

import { 
  Package, CheckCircle2, Clock, TrendingUp, 
  AlertCircle, Truck, DollarSign, RefreshCw 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"

export default function ReturnStatusCard({ returnRequest, onRefresh }) {
  const getStatusConfig = (status) => {
    const configs = {
      initiated: { color: "bg-blue-50 text-blue-700 border-blue-100", icon: <Package size={14} /> },
      approved: { color: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: <CheckCircle2 size={14} /> },
      rejected: { color: "bg-red-50 text-red-700 border-red-100", icon: <AlertCircle size={14} /> },
      shipped_back: { color: "bg-zinc-100 text-zinc-800 border-zinc-200", icon: <Truck size={14} /> },
      received: { color: "bg-amber-50 text-amber-700 border-amber-100", icon: <CheckCircle2 size={14} /> },
      completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <DollarSign size={14} /> },
    }
    return configs[status] || { color: "bg-zinc-100 text-zinc-600", icon: <Clock size={14} /> }
  }

  const isExchange = returnRequest.type === "exchange"
  const statusInfo = getStatusConfig(returnRequest.status)

  return (
    <Card className="border-none shadow-sm ring-1 ring-zinc-200 rounded-[2rem] bg-white overflow-hidden">
      <CardHeader className="bg-zinc-50/50 p-6 border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2 text-zinc-950">
            {isExchange ? <TrendingUp size={18} className="text-indigo-600" /> : <Package size={18} className="text-indigo-600" />}
            {isExchange ? "Exchange Node" : "Return Protocol"}
          </CardTitle>
          <Badge className={`rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border ${statusInfo.color} shadow-none`}>
            {statusInfo.icon}
            <span className="ml-1.5">{returnRequest.status?.replace(/_/g, " ")}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        {/* Modern Status Timeline */}
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-z-10 before:h-full before:w-0.5 before:bg-zinc-100">
          {returnRequest.timeline?.map((event, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="flex gap-4"
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                  event.completed ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {event.completed ? <CheckCircle2 size={16} strokeWidth={3} /> : <Clock size={16} />}
              </div>
              <div className="flex-1 pt-0.5">
                <p className={`text-xs font-black uppercase tracking-tight ${event.completed ? "text-zinc-950" : "text-zinc-400"}`}>
                  {event.label}
                </p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                  {new Date(event.timestamp || event.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <Separator className="bg-zinc-100" />

        {/* Essential Metrics Grid */}
        <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Protocol ID</p>
            <p className="text-sm font-black font-mono text-zinc-900 tracking-tighter">#{returnRequest.returnNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Action Type</p>
            <p className="text-sm font-black text-indigo-600 uppercase tracking-tight italic">{returnRequest.type}</p>
          </div>

          {returnRequest.status === "approved" && returnRequest.pickupDate && (
            <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-zinc-200/50">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Scheduled Pickup</p>
                <p className="text-sm font-black text-zinc-900">{new Date(returnRequest.pickupDate).toLocaleDateString("en-IN")}</p>
              </div>
              {returnRequest.trackingNumber && (
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Transit ID</p>
                  <p className="text-sm font-mono font-black text-indigo-600">{returnRequest.trackingNumber}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Contextual Messages */}
        <div className="space-y-3">
          {returnRequest.status === "completed" && returnRequest.refundAmount && (
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Refund Credit</p>
              <p className="text-xl font-black text-emerald-600 italic tracking-tighter">₹{returnRequest.refundAmount.toLocaleString("en-IN")}</p>
            </div>
          )}

          {returnRequest.status === "rejected" && (
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1 italic">Rejection Anomaly</p>
              <p className="text-xs font-bold text-red-600 leading-relaxed uppercase tracking-tight">{returnRequest.rejectionReason}</p>
            </div>
          )}

          <div className={`p-4 rounded-2xl border text-[11px] font-bold uppercase tracking-wide leading-relaxed ${
            returnRequest.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
            returnRequest.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-800' :
            'bg-zinc-900 border-zinc-800 text-zinc-300'
          }`}>
             {returnRequest.status === "initiated" && "Awaiting vendor validation for return authorization."}
             {returnRequest.status === "approved" && "Authorization complete. Maintain item integrity for scheduled pickup."}
             {returnRequest.status === "shipped_back" && "Item in transit to primary processing node."}
             {returnRequest.status === "completed" && (isExchange ? "Exchange finalized. Replacement dispatched." : "Return finalized. Fund transfer complete.")}
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={onRefresh} 
          className="w-full h-12 rounded-xl border-zinc-200 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-950 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw size={14} className="mr-2" /> Refresh Node Status
        </Button>
      </CardContent>
    </Card>
  )
}