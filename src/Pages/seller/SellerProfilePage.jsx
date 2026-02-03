import { useState, useEffect, useRef } from "react";
import {
  User,
  Store,
  Edit,
  TrendingUp,
  Upload,
  Loader2,
  LinkIcon,
  Camera,
  Mail,
  Phone,
  ShieldCheck,
  Landmark,
  CheckCircle,
  Clock,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

// API Config
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";
const IMAGE_BASE_URL = "https://expertz-digishop.onrender.com";

const documentTypes = [
  { key: "businessLicense", label: "Business License" },
  { key: "panDocument", label: "PAN Document" },
  { key: "bankProof", label: "Bank Proof" },
];

const businessTypes = [
  { value: "sole_proprietor", label: "Individual / Sole Proprietorship" },
  { value: "partnership", label: "Partnership Firm" },
  { value: "pvt_ltd", label: "Private Limited Company (Pvt Ltd)" },
  { value: "opc", label: "One Person Company (OPC)" },
];

export default function SellerProfilePage() {
  const { user, userToken } = useAuth();
  const [profile, setProfile] = useState({
  verificationDocuments: {},
  storeName: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: ""
});

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [docFiles, setDocFiles] = useState({});
  const [isUploading, setIsUploading] = useState({
    businessLicense: false,
    panDocument: false,
    bankProof: false,
    save: false,
  });

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) {
      if (path.includes("localhost:5000")) {
        return path.replace("http://localhost:5000", IMAGE_BASE_URL);
      }
      return path;
    }
    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  // FIXED LOGIC INTEGRATION
  const getVerificationUI = () => {
    if (!profile) {
      return {
        label: "Pending",
        color: "text-amber-500 border-amber-200 bg-amber-50",
        Icon: Clock,
      };
    }

    switch (profile.verificationStatus) {
      case "approved":
      case "verified":
        return {
          label: "Verified",
          color: "text-green-600 border-green-200 bg-green-50",
          Icon: CheckCircle,
        };
      case "rejected":
        return {
          label: "Rejected",
          color: "text-red-600 border-red-200 bg-red-50",
          Icon: AlertTriangle,
        };
      case "blocked":
        return {
          label: "Blocked",
          color: "text-red-700 border-red-300 bg-red-100",
          Icon: ShieldCheck,
        };
      default:
        return {
          label: "Pending",
          color: "text-amber-500 border-amber-200 bg-amber-50",
          Icon: Clock,
        };
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userToken) {
        setIsLoading(false);
        setError("Not authenticated");
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/sellers/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          const seller = data.seller;

          setProfile({
            ...seller,
            address: seller.address?.street || "",
            city: seller.address?.city || "",
            state: seller.address?.state || "",
            pincode: seller.address?.zipCode || "",
          });

          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch profile");
        }
      } catch (e) {
        setError("Network error. Could not connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userToken]);

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const response = await fetch(`${API_BASE_URL}/sellers/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userToken}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setProfile((prev) => ({ ...prev, ...data.seller }));
        toast.success("Profile image updated!");
      }
    } catch (error) {
      toast.error("Upload error occurred");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileUpdate = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    const required = [
      "storeName",
      "businessType",
      "address",
      "city",
      "state",
      "pincode",
      "bankAccountNumber",
      "ifscCode",
      "panNumber",
    ];

    const missing = required.filter(
      (key) => !profile[key] || profile[key].toString().trim() === "",
    );

    if (missing.length > 0) {
      toast.error(
        `Please fill: ${missing.join(", ").replace(/([A-Z])/g, " $1")}`,
      );
      return;
    }

    setIsUploading((prev) => ({ ...prev, save: true }));

    try {
      const payload = {
        ...profile,
        address: {
          street: profile.address,
          city: profile.city,
          state: profile.state,
          zipCode: profile.pincode,
        },
      };

      delete payload.city;
      delete payload.state;
      delete payload.pincode;

      const response = await fetch(`${API_BASE_URL}/sellers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.seller || payload);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsUploading((prev) => ({ ...prev, save: false }));
    }
  };

const handleDocumentUpload = async (docType) => {
    const file = docFiles[docType];
    if (!file) {
      toast.warn("Select a file first.");
      return;
    }

    setIsUploading((prev) => ({ ...prev, [docType]: true }));
    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sellers/upload-document/${docType}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${userToken}` },
          body: formData,
        },
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(`Document uploaded!`);
        
        // Update state safely using data.documentUrl from backend
        setProfile((prev) => ({
          ...prev,
          verificationDocuments: {
            ...(prev?.verificationDocuments || {}),
            [docType]: data.documentUrl || data.documentPath
          },
          verificationStatus: "pending_review"
        }));

        setDocFiles((prev) => {
          const newState = { ...prev };
          delete newState[docType];
          return newState;
        });
      }
    } catch (error) {
      toast.error("Upload error");
    } finally {
      setIsUploading((prev) => ({ ...prev, [docType]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500">Syncing seller console...</p>
      </div>
    );
  }

  const profileImageUrl = getImageUrl(profile?.profileImage);
  const statusInfo = getVerificationUI(); // Helper for status
  const StatusIcon = statusInfo.Icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-jakarta">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Seller Account
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Identity and business verification
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <Button
              className={`w-full sm:w-auto h-10 sm:h-11 px-8 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-lg ${
                isEditing
                  ? "bg-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
              onClick={() =>
                isEditing ? handleSaveChanges() : setIsEditing(true)
              }
              disabled={isUploading.save}
            >
              {isUploading.save ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Save Profile" : "Modify Details"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/50 shadow-xl bg-white overflow-hidden relative">
              <div className="absolute top-12 -right-8 opacity-[0.03] select-none hidden sm:block">
                <h1 className="text-7xl font-black rotate-90 uppercase">
                  Console
                </h1>
              </div>
              <CardContent className="p-6 sm:p-10 relative z-10">
                <div className="relative inline-block mb-8">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl p-1 bg-white border border-slate-100 shadow-md">
                    <Avatar className="h-full w-full rounded-xl sm:rounded-[1.8rem]">
                      <AvatarImage
                        src={profileImageUrl}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl bg-slate-50 text-blue-600 font-black uppercase">
                        {profile?.storeName?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-slate-900 text-white h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg sm:rounded-xl border-2 border-white"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1 mb-8">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                      {profile?.storeName || "Unnamed Store"}
                    </h3>
                    {profile?.isVerified && (
                      <ShieldCheck className="h-5 w-5 text-blue-600 fill-blue-50" />
                    )}
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    Certified Merchant
                  </p>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="group">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 ml-1">
                      Registered Account
                    </p>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                      <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-slate-700 truncate">
                        {profile?.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Verification
                    </span>
                    {/* UPDATED UI BLOCK */}
                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase border ${statusInfo.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* REJECTION NOTICES */}
                  {profile?.verificationStatus === "rejected" && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl mt-4">
                      <p className="text-[10px] font-bold text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" /> Your account was rejected. Please update documents.
                      </p>
                    </div>
                  )}
                  {profile?.verificationStatus === "blocked" && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-xl mt-4">
                      <p className="text-[10px] font-bold text-red-800 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" /> Account Blocked. Contact Support.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Tabs defaultValue="personal" className="space-y-6 sm:space-y-8">
              <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="bg-slate-200/50 p-1 rounded-full border border-slate-200 min-w-full sm:min-w-fit flex">
                  <TabsTrigger
                    value="personal"
                    className="flex-1 sm:px-10 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
                  >
                    Identity
                  </TabsTrigger>
                  <TabsTrigger
                    value="business"
                    className="flex-1 sm:px-10 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
                  >
                    Business
                  </TabsTrigger>
                  <TabsTrigger
                    value="banking"
                    className="flex-1 sm:px-10 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
                  >
                    Settlements
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="personal">
                <Card className="shadow-xl border-none rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 bg-white">
                  <CardHeader className="p-0 mb-6 sm:mb-8 border-b border-slate-50 pb-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-800">
                      <User className="h-5 w-5 text-blue-600" /> Merchant Identity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</Label>
                      <Input
                        disabled={!isEditing}
                        value={profile?.firstName || ""}
                        onChange={(e) => handleProfileUpdate("firstName", e.target.value)}
                        className="h-12 sm:h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</Label>
                      <Input
                        disabled={!isEditing}
                        value={profile?.lastName || ""}
                        onChange={(e) => handleProfileUpdate("lastName", e.target.value)}
                        className="h-12 sm:h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold"
                      />
                    </div>
                    <div className="space-y-3 opacity-60">
                      <Label className="text-[10px] font-black uppercase text-blue-600 ml-1 italic">Verified Email</Label>
                      <Input disabled value={profile?.email || ""} className="bg-slate-200 border-none px-6 rounded-2xl h-12 sm:h-14 font-bold" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contact Phone</Label>
                      <Input
                        disabled={!isEditing}
                        value={profile?.phone || ""}
                        onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                        className="h-12 sm:h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="business" className="space-y-8 animate-in fade-in duration-500">
                <Card className="shadow-xl border-none rounded-[2rem] p-6 sm:p-10 bg-white">
                  <CardHeader className="p-0 mb-8 border-b border-slate-50 pb-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-800">
                      <Store className="h-5 w-5 text-indigo-600" /> Business Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Public Store Name *</Label>
                        <Input
                          disabled={!isEditing}
                          value={profile?.storeName || ""}
                          onChange={(e) => handleProfileUpdate("storeName", e.target.value)}
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Structure *</Label>
                        <Select
                          disabled={!isEditing}
                          value={profile?.businessType || ""}
                          onValueChange={(v) => handleProfileUpdate("businessType", v)}
                        >
                          <SelectTrigger className="rounded-2xl h-14 bg-slate-50 border-slate-100 px-6 font-bold">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="font-bold">
                            {businessTypes.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Store Description</Label>
                        <Textarea
                          disabled={!isEditing}
                          value={profile?.storeDescription || ""}
                          onChange={(e) => handleProfileUpdate("storeDescription", e.target.value)}
                          className="rounded-[2rem] border-slate-100 bg-slate-50 p-6 min-h-[120px] font-semibold text-slate-700 leading-relaxed resize-none shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 space-y-6">
                      <h4 className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Registered Address
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Street Address *</Label>
                          <Input
                            disabled={!isEditing}
                            value={profile?.address || ""}
                            onChange={(e) => handleProfileUpdate("address", e.target.value)}
                            className="h-14 rounded-2xl bg-slate-50 px-6"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">City *</Label>
                          <Input
                            disabled={!isEditing}
                            value={profile?.city || ""}
                            onChange={(e) => handleProfileUpdate("city", e.target.value)}
                            className="h-14 rounded-2xl bg-slate-50 px-6"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">State *</Label>
                          <Input
                            disabled={!isEditing}
                            value={profile?.state || ""}
                            onChange={(e) => handleProfileUpdate("state", e.target.value)}
                            className="h-14 rounded-2xl bg-slate-50 px-6"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pincode *</Label>
                          <Input
                            disabled={!isEditing}
                            value={profile?.pincode || ""}
                            onChange={(e) => handleProfileUpdate("pincode", e.target.value)}
                            className="h-14 rounded-2xl bg-slate-50 px-6"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50">
                      <h4 className="text-[11px] font-black uppercase text-slate-400 mb-8 flex items-center gap-3">Verification Vault</h4>
                      <div className="grid gap-4">
                        {documentTypes.map((doc) => (
                          <div
                            key={doc.key}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:bg-white transition-all gap-4"
                          >
                            <div>
                              <Label className="font-black text-xs uppercase text-slate-700 block">{doc.label}</Label>
                              {profile?.verificationDocuments?.[doc.key] ? (
                                <a
                                  href={getImageUrl(profile.verificationDocuments[doc.key])}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-blue-600 flex items-center gap-1.5 mt-1 font-black uppercase hover:underline"
                                >
                                  <LinkIcon className="h-3 w-3" /> View Uploaded
                                </a>
                              ) : (
                                <p className="text-[10px] text-slate-300 mt-1 font-bold italic">Awaiting Upload</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Input
                                type="file"
                                onChange={(e) => setDocFiles((p) => ({ ...p, [doc.key]: e.target.files?.[0] }))}
                                className="max-w-[140px] sm:max-w-[180px] h-10 text-[10px] bg-white rounded-full border-slate-200"
                              />
                              <Button
                                onClick={() => handleDocumentUpload(doc.key)}
                                disabled={!docFiles[doc.key] || isUploading[doc.key]}
                                className="h-11 w-11 bg-slate-900 text-white rounded-full shadow-lg"
                              >
                                {isUploading[doc.key] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="banking">
                <Card className="shadow-xl border-none rounded-[2rem] p-6 sm:p-10 bg-white">
                  <CardHeader className="p-0 mb-8 border-b border-slate-50 pb-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-800">
                      <Landmark className="h-5 w-5 text-emerald-600" /> Payout Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">PAN Identification *</Label>
                      <Input
                        disabled={!isEditing}
                        value={profile?.panNumber || ""}
                        onChange={(e) => handleProfileUpdate("panNumber", e.target.value)}
                        className="h-14 rounded-2xl bg-slate-50 px-6 font-bold uppercase"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">GST Registration</Label>
                      <Input
                        disabled={!isEditing}
                        value={profile?.gstNumber || ""}
                        onChange={(e) => handleProfileUpdate("gstNumber", e.target.value)}
                        className="h-14 rounded-2xl bg-slate-50 px-6 font-bold uppercase"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Account Number *</Label>
                      <Input
                        disabled={!isEditing}
                        value={profile?.bankAccountNumber || ""}
                        onChange={(e) => handleProfileUpdate("bankAccountNumber", e.target.value)}
                        className="h-12 sm:h-14 rounded-2xl bg-slate-50 px-6 font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">IFSC Code *</Label>
                      <Input
                        disabled={!isEditing}
                        value={profile?.ifscCode || ""}
                        onChange={(e) => handleProfileUpdate("ifscCode", e.target.value)}
                        className="h-12 sm:h-14 rounded-2xl bg-slate-50 px-6 font-bold uppercase"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}