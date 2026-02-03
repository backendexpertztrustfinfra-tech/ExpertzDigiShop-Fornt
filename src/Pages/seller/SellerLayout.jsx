import { useState } from "react"
import { useNavigate, Outlet, useLocation } from "react-router-dom"
import {
  Home,
  Package,
  ShoppingCart,
  RotateCcw,
  BarChart2,
  HelpCircle,
  Star,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert, // Naya Icon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "../../context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SellerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  const menuItems = [
    { icon: Home, label: "Home", path: "/seller/dashboard" },
    { icon: Package, label: "Inventory", path: "/seller/inventory" },
    { icon: ShoppingCart, label: "Orders", path: "/seller/orders/list" },
    { icon: ShieldAlert, label: "Customer Disputes", path: "/seller/customer-disputes" }, // 👈 Ye add kiya
    { icon: RotateCcw, label: "Returns", path: "/seller/returns/requests" },
    { icon: BarChart2, label: "Analytics", path: "/seller/analytics/revenue" },
    { icon: HelpCircle, label: "Support", path: "/seller/support/tickets" },
    { icon: Star, label: "Ratings", path: "/seller/analytics/rating" },
    { icon: User, label: "Profile", path: "/seller/profile" },
  ]

  const isActive = (path) => {
    if (path === "/seller/dashboard") return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-full bg-white border-r border-gray-100 transition-all duration-300 z-50 flex-col ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6">
          {isSidebarOpen && (
            <h1 className="text-2xl font-black text-blue-600 tracking-tight italic">
              DigiShop
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-auto text-gray-400 hover:text-blue-600 hover:bg-blue-50"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            const isDispute = item.label === "Customer Disputes" // Check for dispute item

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100 font-bold"
                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-white" : "text-gray-400 group-hover:text-blue-600"
                  }`}
                />
                
                {/* 🔴 Red Dot Notification for Disputes */}
                {isDispute && !active && (
                   <span className="absolute top-3 left-7 flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                   </span>
                )}

                {isSidebarOpen && (
                  <span className="text-[14px] whitespace-nowrap tracking-tight">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 px-2 mb-4 text-left">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {user?.name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.storeName || user?.name}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`w-full flex items-center gap-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl py-6 ${
              !isSidebarOpen ? "justify-center px-0" : "justify-start px-4"
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="text-[15px] font-bold">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile menu and content remains same as your original file */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-50">
        <h1 className="text-xl font-bold text-blue-600 italic">DigiShop</h1>
        <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
          <Menu className="h-6 w-6 text-gray-600" />
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={toggleMobileMenu}>
          <aside
            className="fixed left-0 top-0 h-full w-72 bg-white flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50">
              <h1 className="text-2xl font-black text-blue-600 italic">DigiShop</h1>
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                <X className="h-6 w-6 text-gray-400" />
              </Button>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 text-left">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      toggleMobileMenu()
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                      active
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-100 font-bold"
                        : "text-gray-500 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[16px]">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        } pt-16 md:pt-0`}
      >
        <div className="min-h-screen p-4 md:p-10 lg:p-12 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}