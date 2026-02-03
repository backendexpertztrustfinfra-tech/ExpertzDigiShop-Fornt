"use client"

import React from "react"
import { 
  Truck, 
  Users, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  MoreVertical,
  Zap
} from "lucide-react"

const AdminDeliveryContent = () => {
  // Mock data for the UI
  const partners = [
    { id: "DLV-001", name: "Delhivery Express", zones: "North India", status: "Active", fleet: 120, rating: 4.8 },
    { id: "DLV-002", name: "BlueDart Prime", zones: "Pan India", status: "Active", fleet: 450, rating: 4.9 },
    { id: "DLV-003", name: "ShadowFax", zones: "Metropolitan", status: "Maintenance", fleet: 85, rating: 4.2 },
  ]

  return (
    <div className="p-8 bg-[#0b0f1a] min-h-screen text-slate-200 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter uppercase flex items-center gap-3">
            <Truck className="text-orange-500 w-8 h-8" />
            Logistic Control
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.2em] font-bold uppercase mt-1">
            Manage delivery partners and global shipment nodes
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-900/50 p-4 px-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Fleets</p>
            <p className="text-xl font-black tracking-tighter text-white">1,240 Units</p>
          </div>
          <button className="bg-gradient-to-r from-pink-600 to-orange-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 active:scale-95 transition-all">
            Add Partner
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {[
          { label: "On-Time Rate", value: "98.2%", icon: Zap, color: "text-emerald-500" },
          { label: "Pending Pickups", value: "452", icon: Clock, color: "text-orange-500" },
          { label: "Active Zones", value: "24/28", icon: MapPin, color: "text-blue-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 shadow-xl backdrop-blur-sm group hover:border-orange-500/30 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-white mt-1 tracking-tighter">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-slate-800/50 border border-slate-700 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Partners Table */}
      <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="px-10 py-8 border-b border-slate-800 bg-slate-900/20 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Partner Registry</h3>
          <ShieldCheck className="text-emerald-500/50" size={20} />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-10 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Partner ID</th>
                <th className="px-10 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Business Entity</th>
                <th className="px-10 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Service Zones</th>
                <th className="px-10 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Protocol Status</th>
                <th className="px-10 py-5 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-all group">
                  <td className="px-10 py-6 font-mono text-[10px] font-black text-orange-500 tracking-tighter">#{p.id}</td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-200 uppercase tracking-tight">{p.name}</span>
                      <span className="text-[9px] font-bold text-slate-600 mt-1">FLEET: {p.fleet} UNITS</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                    {p.zones}
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      p.status === "Active" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 text-slate-400 hover:text-white active:scale-95">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-10 text-center border-t border-slate-800 bg-slate-900/10">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">
            End of Logistic Registry
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDeliveryContent