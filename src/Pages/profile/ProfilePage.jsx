import { useState, useEffect, useRef } from "react"
import { User, MapPin, Edit, Plus, Trash2, Home, Briefcase, Camera, Loader2, Save, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"

// FIXED: Using Render URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://expertz-digishop.onrender.com/api"
const IMAGE_BASE_URL = "https://expertz-digishop.onrender.com"

const INITIAL_FALLBACK_PROFILE = {
  firstName: "Guest",
  lastName: "User",
  email: "guest@example.com",
  phone: "",
  dateOfBirth: "",
  gender: "",
  profileImage: null,
  addresses: [],
  createdAt: new Date().toISOString(),
}

export default function ProfilePage() {
  const { user, userToken } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef(null)
  const [newAddress, setNewAddress] = useState({
    type: "home",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    landmark: "",
    isDefault: false,
  })
  const [error, setError] = useState(null)

  // FIXED: Image Resolution Logic
  const getImageUrl = (path) => {
    if (!path) return null
    let imagePath = String(path)
    
    if (imagePath.startsWith("http")) {
        // Replace localhost with Render URL if found in full URL
        if (imagePath.includes("localhost:5000")) {
            return imagePath.replace("http://localhost:5000", IMAGE_BASE_URL)
        }
        return imagePath
    }
    
    // Clean relative paths and join with live base URL
    const cleanPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "")
    return `${IMAGE_BASE_URL}/${cleanPath}`
  }

  useEffect(() => {
    const fetchProfile = async () => {
        if (!userToken) {
            setProfile(INITIAL_FALLBACK_PROFILE)
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setProfile({
                    ...data.user,
                    addresses: data.user.savedAddresses || [],
                })
            } else {
                const errorData = await response.json()
                setError(errorData.message || "Failed to fetch profile details.")
                setProfile({
                    ...INITIAL_FALLBACK_PROFILE,
                    email: user?.email || INITIAL_FALLBACK_PROFILE.email,
                })
                toast.error(errorData.message || "Could not load full profile.")
            }
        } catch (e) {
            setError("Network error. Could not connect to the server.")
            setProfile({
                ...INITIAL_FALLBACK_PROFILE,
                email: user?.email || INITIAL_FALLBACK_PROFILE.email,
            })
        } finally {
            setIsLoading(false)
        }
    }

    fetchProfile()
  }, [userToken, user])

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("profileImage", file)
      formData.append("firstName", profile.firstName || "")
      formData.append("lastName", profile.lastName || "")

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile((prev) => ({
          ...prev,
          ...data.user,
          addresses: data.user.savedAddresses || prev.addresses,
        }))
        toast.success("Profile image updated successfully!")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading profile image:", error)
      toast.error("An error occurred while uploading image")
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getAddressIcon = (type) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4 text-[#FF4E50]" />
      case "work":
        return <Briefcase className="h-4 w-4 text-[#E75480]" />
      default:
        return <MapPin className="h-4 w-4 text-[#FFD700]" />
    }
  }

  const handleProfileUpdate = async () => {
    if (!userToken) {
      toast.error("You need to be logged in to update your profile.")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          email: profile.email,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          preferences: profile.preferences,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setIsEditing(false)
        toast.success("Profile updated successfully!")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to update profile. Please try again.")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("An error occurred while updating your profile.")
    }
  }

  const handleAddAddress = async () => {
    if (!userToken) {
      toast.error("You need to be logged in to add an address.")
      return
    }

    if (
      !newAddress.firstName ||
      !newAddress.lastName ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipCode ||
      !newAddress.phone
    ) {
      toast.error("Please fill in all required address fields.")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(newAddress),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile({ ...profile, addresses: data.addresses })
        setNewAddress({
          type: "home",
          firstName: "",
          lastName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
          landmark: "",
          isDefault: false,
        })
        setShowAddressForm(false)
        toast.success("Address added successfully!")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to add address. Please try again.")
      }
    } catch (error) {
      console.error("Error adding address:", error)
      toast.error("An error occurred while adding the address.")
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!userToken) {
      toast.error("You need to be logged in to delete an address.")
      return
    }

    if (!addressId) {
      toast.error("Invalid address ID.")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile({ ...profile, addresses: data.addresses || [] })
        toast.success("Address deleted successfully!")
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to delete address. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("An error occurred while deleting the address.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF5F7]">
        <Loader2 className="h-8 w-8 text-[#FF4E50] animate-spin" />
        <span className="ml-3 text-lg text-[#E75480] font-bold">Syncing Profile...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="shadow-lg border-[#FAD0C4]">
          <CardContent className="p-6 text-center">
            <p className="text-[#FF4E50] font-bold">Profile data is unavailable. Please login again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profileImageUrl = getImageUrl(profile.profileImage)

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#FF4E50] selection:text-white">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#FAD0C4]">
          <h1 className="text-3xl sm:text-4xl font-black text-[#333] flex items-center gap-3 uppercase tracking-tighter italic">
            <User className="h-8 w-8 text-[#FF4E50]" />
            My <span className="text-[#FF4E50]">Profile</span>
          </h1>
          <Button
            className={`transition duration-300 transform hover:scale-[1.05] rounded-full px-6 font-bold uppercase tracking-widest text-[10px] shadow-lg ${isEditing ? 'bg-[#E75480] hover:bg-[#FF4E50]' : 'border-[#FF4E50] text-[#FF4E50] hover:bg-[#FFF5F7]'}`}
            variant={isEditing ? "default" : "outline"}
            onClick={() => (isEditing ? handleProfileUpdate() : setIsEditing(true))}
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? "Save Archive" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
            <Card className="shadow-2xl border-[#FAD0C4]/30 sticky top-24 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md">
              <CardContent className="p-8 text-center">
                <div className="relative inline-block group mb-6">
                  <Avatar className="h-36 w-36 mx-auto border-4 border-[#FFD700] shadow-xl">
                    {profileImageUrl ? (
                      <AvatarImage src={profileImageUrl} alt={profile.firstName} />
                    ) : null}
                    <AvatarFallback className="text-3xl bg-[#FFF9F0] text-[#FFB800] font-black uppercase italic">
                      {profile.firstName?.[0] || "G"}{profile.lastName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute bottom-3 right-0 bg-[#FF4E50] hover:bg-[#E75480] text-white p-2.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
                  >
                    {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </div>
                <h3 className="text-2xl font-black mb-1 text-[#333] uppercase tracking-tighter italic">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-[#E75480] font-bold text-xs tracking-widest uppercase mb-6 opacity-70">{profile.email}</p>

                <Separator className="my-6 bg-[#FAD0C4]/20" />

                <div className="text-left space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-[#FFD700]" /> Location
                    </span>
                    <span className="text-[#333]">India</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <User className="h-3 w-3 text-[#FFD700]" /> Joined
                    </span>
                    <span className="text-[#333]">
                      {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <Card className="shadow-xl border-[#FAD0C4]/30 rounded-[1.5rem] overflow-hidden">
              <CardHeader className="bg-[#FFF5F7]/50 border-b border-[#FAD0C4]/20">
                <CardTitle className="flex items-center gap-2 text-sm font-black text-[#E75480] uppercase tracking-widest">
                  <User className="h-4 w-4" />
                  Basic Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">First Name</Label>
                    <Input
                      className="h-12 rounded-xl bg-zinc-50 border-[#FAD0C4]/50 focus:ring-[#FF4E50] font-bold"
                      value={profile.firstName || ""}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Last Name</Label>
                    <Input
                      className="h-12 rounded-xl bg-zinc-50 border-[#FAD0C4]/50 focus:ring-[#FF4E50] font-bold"
                      value={profile.lastName || ""}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Archive Email</Label>
                    <Input value={profile.email || ""} disabled className="h-12 rounded-xl bg-[#FFF9F0] border-transparent font-bold text-zinc-400 italic" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Contact Node</Label>
                    <Input
                      className="h-12 rounded-xl bg-zinc-50 border-[#FAD0C4]/50 focus:ring-[#FF4E50] font-bold"
                      type="tel"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Timeline (DOB)</Label>
                    <Input
                      className="h-12 rounded-xl bg-zinc-50 border-[#FAD0C4]/50 focus:ring-[#FF4E50] font-bold"
                      type="date"
                      value={profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : ""}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Identity</Label>
                    <Select
                      value={profile.gender || ""}
                      onValueChange={(value) => setProfile({ ...profile, gender: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-[#FAD0C4]/50 font-bold">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-[#FAD0C4]">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {isEditing && (
                  <div className="pt-6 flex justify-end">
                    <Button onClick={handleProfileUpdate} className="bg-[#FF4E50] hover:bg-[#E75480] transition-all rounded-full px-8 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#FF4E50]/20">
                      <Save className="h-4 w-4 mr-2" /> Commit Profile Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-[#FAD0C4]/30 rounded-[1.5rem] overflow-hidden">
              <CardHeader className="bg-[#FFF9F0]/50 border-b border-[#FFD700]/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-black text-[#FFB800] uppercase tracking-widest">
                    <MapPin className="h-4 w-4" /> Archive Hubs (Addresses)
                  </CardTitle>
                  <Button
                    variant="default" size="sm"
                    className="bg-[#FF4E50] hover:bg-[#E75480] rounded-full font-black uppercase text-[9px] tracking-[0.2em] transition duration-300 shadow-md"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                  >
                    <Plus className="h-3 w-3 mr-2" /> {showAddressForm ? "Minimize" : "Secure New Hub"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {showAddressForm && (
                  <div className="mb-10 p-8 border-2 border-dashed border-[#FFD700]/30 rounded-[2rem] bg-[#FFF9F0]/30 transition-all duration-500 animate-in fade-in slide-in-from-top-4">
                    <h4 className="font-black text-lg mb-6 text-[#333] uppercase tracking-tighter italic">Enter Delivery Coordinates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Hub Type</Label>
                        <Select value={newAddress.type} onValueChange={(value) => setNewAddress({ ...newAddress, type: value })}>
                          <SelectTrigger className="h-11 rounded-xl bg-white border-[#FAD0C4]/50 font-bold">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#FAD0C4]">
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Phone Node *</Label>
                        <Input className="h-11 rounded-xl bg-white border-[#FAD0C4]/50 font-bold" type="tel" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">First Name *</Label>
                        <Input className="h-11 rounded-xl bg-white border-[#FAD0C4]/50 font-bold" value={newAddress.firstName} onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Name *</Label>
                        <Input className="h-11 rounded-xl bg-white border-[#FAD0C4]/50 font-bold" value={newAddress.lastName} onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })} />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Street / Suite *</Label>
                        <Input className="h-11 rounded-xl bg-white border-[#FAD0C4]/50 font-bold" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Navigational Landmark</Label>
                        <Input className="h-11 rounded-xl bg-white border-[#FAD0C4]/50 font-bold" value={newAddress.landmark} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">City *</Label>
                        <Input className="h-11 rounded-xl bg-white border-[#FAD0C4]/50 font-bold" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">State *</Label>
                        <Input className="h-11 rounded-xl bg-white border-[#FAD0C4]/50 font-bold" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ZIP *</Label>
                        <Input className="h-11 rounded-xl bg-white border-[#FAD0C4]/50 font-bold" type="number" value={newAddress.zipCode} onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-3 pt-4 md:col-span-2">
                        <Switch id="default-address-switch" className="data-[state=checked]:bg-[#FF4E50]" checked={newAddress.isDefault} onCheckedChange={(checked) => setNewAddress({ ...newAddress, isDefault: checked })} />
                        <Label htmlFor="default-address-switch" className="text-xs font-bold uppercase tracking-widest text-[#333]">Set as Primary Archive Hub</Label>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-8 pt-6 border-t border-[#FFD700]/10">
                      <Button onClick={handleAddAddress} className="bg-[#FF4E50] hover:bg-[#E75480] rounded-full px-8 font-black uppercase text-[10px] tracking-widest">
                        <Save className="h-4 w-4 mr-2" /> Save Coordinates
                      </Button>
                      <Button variant="ghost" onClick={() => setShowAddressForm(false)} className="text-[#E75480] font-black uppercase text-[10px] tracking-widest hover:bg-[#FFF5F7] rounded-full">Cancel</Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.addresses?.length > 0 ? (
                    profile.addresses.map((address) => (
                      <div key={address._id} className="group flex items-start justify-between p-6 border border-[#FAD0C4]/30 rounded-2xl bg-[#FFF5F7]/30 hover:shadow-2xl hover:bg-white hover:border-[#FF4E50]/50 transition-all duration-500 relative overflow-hidden">
                        {address.isDefault && (
                          <div className="absolute top-0 right-0 h-10 w-10 bg-[#FFD700] rounded-bl-3xl flex items-center justify-center shadow-sm">
                             <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="flex items-start gap-4 w-full">
                          <div className={`p-3 rounded-xl flex-shrink-0 shadow-inner ${address.type === 'home' ? 'bg-[#FFF9F0]' : 'bg-[#FFF5F7]'}`}>
                            {getAddressIcon(address.type)}
                          </div>
                          <div className="flex-grow">
                            <span className="font-black text-xs text-[#333] uppercase tracking-widest">{address.type} Hub</span>
                            <p className="text-[11px] font-black text-[#E75480] mb-2 uppercase italic">{address.firstName} {address.lastName}</p>
                            <p className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tighter">
                              {address.street}, {address.city}, {address.state} — <span className="text-[#333] font-black">{address.zipCode}</span>
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost" size="icon"
                          className="absolute bottom-4 right-4 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm border border-transparent hover:bg-red-50 group transition-all"
                          onClick={() => handleDeleteAddress(address._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400 group-hover:text-red-600" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#FAD0C4] rounded-[2rem] bg-[#FFF5F7]/30">
                       <MapPin className="h-10 w-10 text-[#FAD0C4] mb-4 opacity-40" />
                       <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#E75480]/60">No saved hubs detected.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}