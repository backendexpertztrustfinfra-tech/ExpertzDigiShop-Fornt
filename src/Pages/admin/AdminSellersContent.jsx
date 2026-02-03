import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle, XCircle, Clock, Eye, Download, Landmark, FileText, User as UserIcon, Store, Mail, Phone, Briefcase } from "lucide-react";
import { toast } from "react-toastify";

const IMAGE_BASE_URL = "https://expertz-digishop.onrender.com";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};

const AdminSellersContent = () => {
  const { userToken } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [verificationNotes, setVerificationNotes] = useState("");

  useEffect(() => {
    fetchSellers();
  }, [filterStatus, page]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const url = filterStatus === "pending"
        ? `${import.meta.env.VITE_API_URL}/admin-seller/pending?page=${page}&limit=10`
        : `${import.meta.env.VITE_API_URL}/admin-seller/all?status=${filterStatus}&page=${page}&limit=10`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const data = await response.json();
      setSellers(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (sellerId, action) => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const body = action === 'approve' 
        ? { verificationNotes } 
        : { rejectionReason: verificationNotes };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin-seller/${endpoint}/${sellerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Update failed");

      toast.success(`Seller ${action}d successfully!`);
      setShowModal(false);
      setVerificationNotes("");
      fetchSellers();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-8 bg-[#0b0f1a] min-h-screen text-slate-200">
      {/* Header & Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter">
            SELLER VERIFICATION
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.2em] font-bold uppercase mt-1">Manage Onboarding & Compliance</p>
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 shadow-xl">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setPage(1); }}
              className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all duration-300 ${
                filterStatus === status 
                ? "bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg" 
                : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-40">
           <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3 max-w-7xl mx-auto">
          {/* Professional Table Header */}
          <div className="hidden lg:grid grid-cols-12 px-8 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50 mb-4">
            <div className="col-span-4">Store & Merchant</div>
            <div className="col-span-3">Contact Details</div>
            <div className="col-span-2">Business Type</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right">Audit</div>
          </div>

          {sellers.map((item) => (
            <div key={item._id} className="group bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 hover:border-orange-500/30 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4">
                
                {/* 1. Store Info */}
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-orange-500 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm truncate uppercase tracking-tight">{item.seller?.storeName || "N/A"}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <UserIcon size={12} /> {item.seller?.name}
                    </div>
                  </div>
                </div>

                {/* 2. Contact Details */}
                <div className="col-span-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <Mail size={12} className="text-slate-500" /> {item.seller?.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Phone size={12} /> {item.seller?.phone}
                    </div>
                  </div>
                </div>

                {/* 3. Business Type */}
                <div className="col-span-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <Briefcase size={12} /> {item.businessType}
                  </div>
                </div>

                {/* 4. Status */}
                <div className="col-span-2 text-center">
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${
                     item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                     item.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                     'bg-rose-500/10 text-rose-400 border-rose-500/20'
                   }`}>
                     {item.status}
                   </span>
                </div>

                {/* 5. Action Button */}
                <div className="col-span-1 text-right">
                  <button 
                    onClick={() => { setSelectedSeller(item); setShowModal(true); }}
                    className="p-3 bg-slate-800 hover:bg-gradient-to-r hover:from-pink-600 hover:to-orange-600 text-white rounded-xl transition-all shadow-lg active:scale-90"
                  >
                    <Eye size={18} />
                  </button>
                </div>

              </div>
            </div>
          ))}

          {sellers.length === 0 && (
            <div className="text-center py-32 border border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20">
              <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-sm italic font-sans">No Merchants in queue</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedSeller && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0f172a] w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden flex flex-col scale-in" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{selectedSeller.seller?.storeName}</h2>
                <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">Merchant Verification Audit</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 transition-all text-xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column: Business & Bank */}
                <div className="space-y-6">
                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner">
                    <h4 className="text-pink-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText size={14}/> Registration Data
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2"><span className="text-slate-500 text-[11px] font-bold">GST:</span> <span className="text-white font-mono text-xs">{selectedSeller.gstNumber || "EXEMPT"}</span></div>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2"><span className="text-slate-500 text-[11px] font-bold">PAN:</span> <span className="text-white font-mono text-xs uppercase">{selectedSeller.panNumber}</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500 text-[11px] font-bold">Type:</span> <span className="text-orange-400 text-xs font-black uppercase">{selectedSeller.businessType}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/50 shadow-inner">
                    <h4 className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Landmark size={14}/> Settlement Account
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2"><span className="text-slate-500 text-[11px] font-bold">Account:</span> <span className="text-white font-bold text-xs">{selectedSeller.bankAccountNumber}</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500 text-[11px] font-bold">IFSC:</span> <span className="text-white font-bold text-xs">{selectedSeller.bankIfsc || selectedSeller.seller?.ifscCode}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Documents */}
                <div className="space-y-4">
                  <h4 className="text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-4">KYC Documents</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(selectedSeller.documents || {}).map(([key, path]) => (
                      path && typeof path === 'string' && (
                        <div key={key} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-orange-500/50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><FileText size={18}/></div>
                            <span className="capitalize text-[11px] font-black text-slate-300 tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</span>
                          </div>
                          <a 
                            href={getImageUrl(path)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-800 hover:bg-orange-600 text-white text-[9px] font-black rounded-xl transition-all uppercase tracking-widest"
                          >
                            Download
                          </a>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            {selectedSeller.status === "pending" && (
              <div className="p-8 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full">
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 outline-none focus:border-orange-500 transition-all min-h-[60px] placeholder:text-slate-700"
                    placeholder="Enter verification notes or rejection reason (Visible to merchant)..."
                  />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => handleAction(selectedSeller._id, 'reject')}
                    className="flex-1 md:flex-none px-10 py-4 bg-rose-600/5 text-rose-500 border border-rose-600/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction(selectedSeller._id, 'approve')}
                    className="flex-1 md:flex-none px-10 py-4 bg-gradient-to-r from-pink-600 via-orange-600 to-yellow-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-900/10 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Verify Merchant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellersContent;