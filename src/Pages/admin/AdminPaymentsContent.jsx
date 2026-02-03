"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import api from "../../lib/api"
import { toast } from "react-toastify"
import { 
  IndianRupee, 
  CreditCard, 
  ArrowRight, 
  CheckCircle, 
  RefreshCw, 
  Banknote,
  ShieldCheck,
  History
} from "lucide-react"

export default function AdminPaymentManagement() {
  const { userToken } = useContext(AuthContext)
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [transactionId, setTransactionId] = useState("")
  const [page, setPage] = useState(1)
  const [totalPending, setTotalPending] = useState(0)

  useEffect(() => {
    fetchPayouts()
  }, [page])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin-payment/payouts/pending?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })

      setPayouts(response.data.data)
      setTotalPending(response.data.totalPendingAmount)
    } catch (error) {
      toast.error("Failed to fetch payouts")
    } finally {
      setLoading(false)
    }
  }

  const releasePayout = async (payoutId) => {
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID")
      return
    }

    try {
      await api.put(
        `/admin-payment/payouts/release/${payoutId}`,
        { transactionId },
        { headers: { Authorization: `Bearer ${userToken}` } },
      )

      toast.success("Payout released successfully")
      setSelectedPayout(null)
      setTransactionId("")
      fetchPayouts()
    } catch (error) {
      toast.error("Failed to release payout")
    }
  }

  return (
    <div className="p-8 bg-[#0b0f1a] min-h-screen text-slate-200 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter uppercase">
            Payment & Settlement
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.2em] font-bold uppercase mt-1">
            Manage seller payouts and marketplace commissions
          </p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-center gap-6 shadow-xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Pending Payouts</p>
            <p className="text-2xl font-black tracking-tighter text-white">₹{totalPending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4 text-center">
            <div className="animate-spin h-10 w-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full" />
            <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase animate-pulse">Syncing Ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-900/80 border-b border-slate-800/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Payout ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Seller Entity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Commission</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {payouts.map((payout) => (
                  <tr key={payout._id} className="hover:bg-slate-900/60 transition-all group">
                    <td className="px-8 py-5 font-mono text-[11px] font-black text-orange-400 tracking-tighter uppercase">
                      #{payout.payoutId}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                          <CreditCard size={14} />
                        </div>
                        <span className="text-xs font-black text-slate-200 uppercase tracking-tight">
                          {payout.seller?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-white tracking-tighter">
                      ₹{payout.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-rose-400 tracking-tighter">
                      - ₹{payout.commission?.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-orange-500/10 text-orange-400 border-orange-500/20">
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        className="px-6 py-2.5 bg-slate-800 hover:bg-gradient-to-r hover:from-pink-600 hover:to-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                        onClick={() => setSelectedPayout(payout)}
                      >
                        Release <ArrowRight size={12} className="inline ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Release Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl" onClick={() => setSelectedPayout(null)}>
          <div className="bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight italic uppercase">Release Settlement</h2>
                <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Authorized Financial Disbursement</p>
              </div>
              <button onClick={() => setSelectedPayout(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all text-xl">×</button>
            </header>

            <div className="p-8 space-y-6">
              <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800/50 shadow-inner space-y-4">
                <div className="flex justify-between border-b border-slate-800/50 pb-3">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Recipient Seller</span>
                    <span className="text-xs font-black text-slate-200 uppercase">{selectedPayout.seller?.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-3">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Net Disbursement</span>
                    <span className="text-sm font-black text-emerald-400 tracking-tighter">₹{selectedPayout.payoutAmount?.toLocaleString()}</span>
                </div>
                <div className="pt-2">
                    <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Bank Verification Node</p>
                    <p className="text-xs text-slate-400 font-mono tracking-tighter bg-slate-900 p-3 rounded-xl border border-slate-800">
                        ACC: {selectedPayout.bankDetails?.accountNumber}
                    </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transaction Identity (Bank ID)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={16} />
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter external bank reference ID..."
                    className="w-full bg-slate-950 p-4 pl-12 text-xs font-black border border-slate-800 rounded-2xl outline-none focus:border-orange-500/50 transition-all text-slate-300 uppercase tracking-widest"
                  />
                </div>
              </div>

              <button 
                className="w-full py-5 bg-gradient-to-r from-pink-600 via-orange-600 to-yellow-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4"
                onClick={() => releasePayout(selectedPayout._id)}
              >
                Confirm Payout Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}