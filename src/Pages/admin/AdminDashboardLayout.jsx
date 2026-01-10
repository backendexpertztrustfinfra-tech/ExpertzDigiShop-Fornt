import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  MessageSquare,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"

const AdminDashboardLayout = ({ children, activeMenu }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== "admin") {
      navigate("/")
    }

    // Check screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [user, navigate])

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "sellers", label: "Sellers", icon: ShoppingCart, path: "/admin/sellers" },
    { id: "orders", label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { id: "complaints", label: "Support Tickets", icon: MessageSquare, path: "/admin/complaints" },
    { id: "delivery", label: "Delivery Partners", icon: Truck, path: "/admin/delivery" },
    { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 overflow-hidden`}
      >
        {/* Logo/Brand */}
        <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex items-center justify-between px-4">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-blue-700 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeMenu === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  isActive ? "bg-blue-50 border-r-4 border-blue-600 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <>
                    <span className="ml-4 flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={18} />}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Profile at bottom */}
        <div className="absolute bottom-0 w-full border-t bg-white">
          {sidebarOpen && (
            <div className="p-4 border-b">
              <p className="text-sm font-semibold text-gray-700 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-4">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {menuItems.find((item) => item.id === activeMenu)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <img
              src={user?.profileImage || "/placeholder.svg?height=40&width=40&query=profile"}
              alt="Admin"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}

export default AdminDashboardLayout
