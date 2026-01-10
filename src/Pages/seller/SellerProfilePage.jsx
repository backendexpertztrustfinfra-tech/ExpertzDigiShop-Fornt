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

// FIXED URLS
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api";
const IMAGE_BASE_URL = "https://expertz-digishop.onrender.com";

const documentTypes = [
  { key: "businessLicense", label: "Business License" },
  { key: "panDocument", label: "PAN Document" },
  { key: "bankProof", label: "Bank Proof" },
];

export default function SellerProfilePage() {
  const { user, userToken } = useAuth();
  const [profile, setProfile] = useState(null);
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

  // FIXED IMAGE HELPER
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
          setProfile(data.seller || data);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch seller profile");
          toast.error(errorData.message || "Could not load seller profile");
        }
      } catch (e) {
        setError("Network error. Could not connect to the server.");
        toast.error("Could not load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userToken]);

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

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
        toast.success("Profile image updated successfully!");
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("An error occurred while uploading image");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleProfileUpdate = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    setIsUploading((prev) => ({ ...prev, save: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/sellers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          storeName: profile.storeName,
          storeDescription: profile.storeDescription,
          businessType: profile.businessType,
          bankAccountNumber: profile.bankAccountNumber,
          ifscCode: profile.ifscCode,
          panNumber: profile.panNumber,
          gstNumber: profile.gstNumber,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.seller || profile);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setIsUploading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDocumentUpload = async (docType) => {
    const file = docFiles[docType];
    if (!file) {
      toast.warn(`Please select a file first.`);
      return;
    }

    setIsUploading((prev) => ({ ...prev, [docType]: true }));
    const formData = new FormData();
    formData.append("document", file);
    const uploadUrl = `${API_BASE_URL}/sellers/upload-document/${docType}`;

    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userToken}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Uploaded successfully!`);
        setProfile((prev) => ({
          ...prev,
          verificationDocuments: {
            ...prev.verificationDocuments,
            [docType]: data.documentUrl,
          },
        }));
        setDocFiles((prev) => {
          const newState = { ...prev };
          delete newState[docType];
          return newState;
        });
      } else {
        toast.error(data.message || `Failed to upload`);
      }
    } catch (error) {
      toast.error("Network error during document upload.");
    } finally {
      setIsUploading((prev) => ({ ...prev, [docType]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium tracking-tight">
          Syncing your seller console...
        </p>
      </div>
    );
  }

  const profileImageUrl = getImageUrl(profile?.profileImage);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-jakarta">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 sm:flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Seller Account
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Identity and business verification
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              className={`h-11 px-8 rounded-full font-bold uppercase text-[11px] tracking-widest transition-all duration-300 shadow-lg ${
                isEditing
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
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

      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2.5rem] border border-slate-200/50 shadow-xl shadow-slate-200/40 bg-white overflow-hidden relative">
              <div className="absolute top-12 -right-8 opacity-[0.03] pointer-events-none select-none">
                <h1 className="text-7xl font-black rotate-90 uppercase tracking-tighter">
                  Console
                </h1>
              </div>

              <CardContent className="p-10 text-left relative z-10">
                <div className="relative inline-block mb-10">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-[2rem] p-1 bg-white border border-slate-100 shadow-md overflow-hidden">
                      <Avatar className="h-full w-full rounded-[1.8rem]">
                        {profileImageUrl ? (
                          <AvatarImage
                            src={profileImageUrl}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="text-2xl bg-slate-50 text-blue-600 font-black uppercase">
                          {profile?.storeName?.[0] ||
                            profile?.firstName?.[0] ||
                            "S"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="absolute -bottom-1 -right-1 bg-slate-900 text-white h-8 w-8 flex items-center justify-center rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1 mb-10">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
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

                <div className="space-y-6 pt-10 border-t border-slate-50">
                  <div className="group">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 ml-1">
                      Registered Account
                    </p>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-100 transition-all duration-300">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-bold text-slate-700 truncate">
                        {profile?.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </span>
                    <div
                      className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-tighter border ${
                        profile?.isVerified
                          ? "text-green-600 border-green-200 bg-green-50/50"
                          : "text-amber-500 border-amber-200 bg-amber-50/50"
                      }`}
                    >
                      {profile?.isVerified ? "Verified" : "Pending"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="px-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Console Live
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-300">
                v2.4.0
              </span>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Tabs defaultValue="personal" className="space-y-8">
              <TabsList className="bg-slate-200/50 p-1.5 rounded-full border border-slate-200 w-fit flex gap-1 shadow-inner">
                <TabsTrigger
                  value="personal"
                  className="px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg"
                >
                  Identity
                </TabsTrigger>
                <TabsTrigger
                  value="business"
                  className="px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg"
                >
                  Business
                </TabsTrigger>
                <TabsTrigger
                  value="banking"
                  className="px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg"
                >
                  Settlements
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="personal"
                className="animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <Card className="shadow-xl shadow-slate-200/40 border-none rounded-[2rem] p-8 md:p-10 bg-white">
                  <CardHeader className="p-0 mb-8 border-b border-slate-50 pb-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-800">
                      <User className="h-5 w-5 text-blue-600" /> Merchant
                      Identity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          First Name
                        </Label>
                        <Input
                          disabled={!isEditing}
                          value={profile?.firstName || ""}
                          onChange={(e) =>
                            handleProfileUpdate("firstName", e.target.value)
                          }
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold text-slate-800"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Last Name
                        </Label>
                        <Input
                          disabled={!isEditing}
                          value={profile?.lastName || ""}
                          onChange={(e) =>
                            handleProfileUpdate("lastName", e.target.value)
                          }
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold text-slate-800"
                        />
                      </div>
                      <div className="space-y-3 opacity-60">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1 italic">
                          Verified Email
                        </Label>
                        <Input
                          disabled
                          value={profile?.email || ""}
                          className="bg-slate-200 border-none px-6 rounded-2xl h-14 font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Contact Phone
                        </Label>
                        <Input
                          disabled={!isEditing}
                          value={profile?.phone || ""}
                          onChange={(e) =>
                            handleProfileUpdate("phone", e.target.value)
                          }
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="business"
                className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <Card className="shadow-xl shadow-slate-200/40 border-none rounded-[2rem] p-8 md:p-10 bg-white">
                  <CardHeader className="p-0 mb-8 border-b border-slate-50 pb-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-800">
                      <Store className="h-5 w-5 text-indigo-600" /> Business
                      Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Public Store Name
                        </Label>
                        <Input
                          disabled={!isEditing}
                          value={profile?.storeName || ""}
                          onChange={(e) =>
                            handleProfileUpdate("storeName", e.target.value)
                          }
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Business Structure
                        </Label>
                        <Select
                          disabled={!isEditing}
                          value={profile?.businessType || ""}
                          onValueChange={(v) =>
                            handleProfileUpdate("businessType", v)
                          }
                        >
                          <SelectTrigger className="rounded-2xl h-14 bg-slate-50 border-slate-100 px-6 font-bold">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl font-bold">
                            <SelectItem value="individual">
                              Proprietorship
                            </SelectItem>
                            <SelectItem value="company">
                              Limited Company
                            </SelectItem>
                            <SelectItem value="partnership">
                              Partnership Firm
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          About the Store
                        </Label>
                        <Textarea
                          disabled={!isEditing}
                          value={profile?.storeDescription || ""}
                          onChange={(e) =>
                            handleProfileUpdate(
                              "storeDescription",
                              e.target.value
                            )
                          }
                          className="rounded-[2rem] border-slate-100 bg-slate-50 p-8 min-h-[160px] font-semibold text-slate-700 leading-relaxed resize-none shadow-inner"
                          placeholder="Describe your brand's mission..."
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          PAN Identification
                        </Label>
                        <Input
                          disabled={!isEditing}
                          value={profile?.panNumber || ""}
                          onChange={(e) =>
                            handleProfileUpdate("panNumber", e.target.value)
                          }
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold uppercase"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          GST Registration
                        </Label>
                        <Input
                          disabled={!isEditing}
                          value={profile?.gstNumber || ""}
                          onChange={(e) =>
                            handleProfileUpdate("gstNumber", e.target.value)
                          }
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold uppercase"
                        />
                      </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                        Verification Vault
                      </h4>
                      <div className="grid gap-6">
                        {documentTypes.map((doc) => (
                          <div
                            key={doc.key}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] group hover:bg-white hover:shadow-xl transition-all"
                          >
                            <div className="mb-4 sm:mb-0">
                              <Label className="font-black text-xs uppercase tracking-widest text-slate-700">
                                {doc.label}
                              </Label>
                              {profile?.verificationDocuments?.[doc.key] ? (
                                <a
                                  href={getImageUrl(profile.verificationDocuments[doc.key])}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-blue-600 flex items-center gap-1.5 mt-2 font-black uppercase hover:underline"
                                >
                                  <LinkIcon className="h-3 w-3" /> View Uploaded
                                </a>
                              ) : (
                                <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase italic tracking-tighter">
                                  Awaiting Upload
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                onChange={(e) =>
                                  setDocFiles((prev) => ({
                                    ...prev,
                                    [doc.key]: e.target.files?.[0],
                                  }))
                                }
                                className="max-w-[200px] h-10 text-[10px] bg-white rounded-full"
                              />
                              <Button
                                onClick={() => handleDocumentUpload(doc.key)}
                                disabled={
                                  !docFiles[doc.key] || isUploading[doc.key]
                                }
                                className="h-11 w-11 bg-slate-900 text-white rounded-full hover:scale-110 shadow-lg"
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

              <TabsContent
                value="banking"
                className="animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <Card className="shadow-xl shadow-slate-200/40 border-none rounded-[2rem] p-8 md:p-10 bg-white">
                  <CardHeader className="p-0 mb-8 border-b border-slate-50 pb-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-800">
                      <Landmark className="h-5 w-5 text-emerald-600" /> Payout
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Account Number
                        </Label>
                        <Input
                            disabled={!isEditing}
                            value={profile?.bankAccountNumber || ""}
                            onChange={(e) =>
                            handleProfileUpdate(
                                "bankAccountNumber",
                                e.target.value
                            )
                            }
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold"
                        />
                        </div>
                        <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            IFSC Code
                        </Label>
                        <Input
                            disabled={!isEditing}
                            value={profile?.ifscCode || ""}
                            onChange={(e) =>
                            handleProfileUpdate("ifscCode", e.target.value)
                            }
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold uppercase"
                        />
                        </div>
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