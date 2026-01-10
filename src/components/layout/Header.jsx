import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Heart,
  LogOut,
  Store,
  ChevronDown,
  ArrowRight,
  PackageCheck,
  UserCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet"

import CartDrawer from "@/components/cart/CartDrawer"
import { useCart } from "../../hooks/useCart"
import { useAuth } from "@/context/AuthContext"
import NotificationBell from "@/components/notifications/NotificationBell"

/* --------------------------
    MEGA MENU DATA (UNCHANGED)
--------------------------- */
const megaMenuData = {
  makeup: {
    title: "Makeup",
    categories: [
      { title: "Face", items: ["Foundation", "Concealer", "Powder", "Blush", "Bronzer", "Highlighter"] },
      { title: "Eyes", items: ["Eyeshadow", "Eyeliner", "Mascara", "Eyebrows", "Eye Primer", "False Lashes"] },
      { title: "Lips", items: ["Lipstick", "Lip Gloss", "Lip Liner", "Lip Balm", "Liquid Lipstick", "Lip Stain"] },
      { title: "Tools & Brushes", items: ["Face Brushes", "Eye Brushes", "Sponges", "Makeup Bags", "Mirror", "Sharpeners"] },
    ],
  },
  westernWear: {
    title: "Western Wear",
    categories: [
      { title: "Topwear", items: ["T-Shirts", "Shirts", "Tops", "Blouses", "Sweaters", "Jackets"] },
      { title: "Dresses", items: ["Casual Dresses", "Party Dresses", "Maxi Dresses", "Mini Dresses"] },
      { title: "Bottom Wear", items: ["Jeans", "Trousers", "Shorts", "Skirts", "Leggings", "Palazzo"] },
      { title: "Winter Wear", items: ["Coats", "Jackets", "Sweaters", "Cardigans", "Hoodies", "Blazers"] },
    ],
  },
  indianWear: {
    title: "Indian Wear",
    categories: [
      { title: "Ethnic Sets", items: ["Kurta Sets", "Salwar Suits", "Lehenga Choli", "Sharara Sets"] },
      { title: "Sarees", items: ["Silk Sarees", "Cotton Sarees", "Designer Sarees", "Party Sarees"] },
      { title: "Kurtas", items: ["Cotton Kurtas", "Silk Kurtas", "Designer Kurtas", "Casual Kurtis"] },
      { title: "Ethnic Bottoms", items: ["Leggings", "Churidar", "Palazzo", "Dhoti Pants"] },
    ],
  },
  accessories: {
    title: "Accessories",
    categories: [
      { title: "Bags", items: ["Handbags", "Sling Bags", "Backpacks", "Wallets"] },
      { title: "Jewelry", items: ["Necklace", "Earrings", "Bracelets", "Rings"] },
      { title: "Men Accessories", items: ["Belts", "Watches", "Caps", "Sunglasses"] },
    ],
  },
  personalCare: {
    title: "Personal Care",
    categories: [
      { title: "Skin Care", items: ["Facewash", "Moisturizer", "Serum", "Sunscreen"] },
      { title: "Hair Care", items: ["Shampoo", "Conditioner", "Hair Oil", "Hair Serum"] },
      { title: "Fragrance", items: ["Perfume", "Deodorant", "Body Mists"] },
    ],
  },
}

const toKebab = (str) => String(str || "").replace(/([A-Z])/g, "-$1").replace(/\s+/g, "-").toLowerCase()

export default function Header() {
  const { itemCount, syncCart } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState(null)
  const [pinnedMenu, setPinnedMenu] = useState(null)
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, userRole } = useAuth()
  const containerRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated && userRole === "customer") syncCart()
  }, [isAuthenticated, userRole, syncCart])

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target) && activeMegaMenu) {
        setActiveMegaMenu(null)
        setPinnedMenu(null)
      }
    }
    if (pinnedMenu) document.addEventListener("click", onDocClick)
    else document.removeEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [activeMegaMenu, pinnedMenu])

  const handleMouseEnter = (menuKey) => { if (!pinnedMenu) setActiveMegaMenu(menuKey) }
  const handleMouseLeave = () => { if (!pinnedMenu) setActiveMegaMenu(null) }
  const handleTopClick = (menuKey) => {
    if (pinnedMenu === menuKey) { setPinnedMenu(null); setActiveMegaMenu(null) }
    else { setPinnedMenu(menuKey); setActiveMegaMenu(menuKey) }
  }

  const handleItemClickNavigate = (menuKey, item) => {
    const url = `/categories/${toKebab(menuKey)}?q=${encodeURIComponent(item.toLowerCase().replace(/\s+/g, "-"))}`
    navigate(url); setActiveMegaMenu(null); setPinnedMenu(null)
  }

  const handleLogout = () => { logout(); navigate("/", { replace: true }) }

  const normalizedRole = userRole ? String(userRole).toLowerCase() : null
  const isSeller = normalizedRole === "seller"
  const isCustomer = isAuthenticated && normalizedRole === "customer"

  return (
    <>
      <header
        ref={containerRef}
        className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-[#FAD0C4] bg-white shadow-lg shadow-black/5"
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            
            {/* Left Section */}
            <div className="flex items-center gap-2 md:gap-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden hover:bg-[#FFF5F7] rounded-xl">
                    <Menu className="h-6 w-6 text-zinc-800" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[310px] p-0 flex flex-col bg-white border-none shadow-2xl">
                  {/* Fixed Accessibility Warnings */}
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Browse categories and manage account</SheetDescription>
                  </SheetHeader>

                  {/* Sidebar Header Area */}
                  <div className="p-6 border-b bg-gradient-to-br from-[#FFF5F7] to-white">
                    <div className="flex items-center gap-4 mb-2">
                        <img src="/logo.jpeg" className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-md" />
                        <div>
                            <h2 className="font-black text-xl tracking-tighter uppercase italic text-zinc-900">Digishop</h2>
                            {isAuthenticated && <p className="text-[10px] font-bold text-[#E75480] truncate w-40">{user?.email}</p>}
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* ACCOUNT SECTION (Top of sidebar for phone) */}
                    <div className="px-4 py-4 space-y-1">
                       <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Account Registry</p>
                       {isAuthenticated ? (
                         <div className="grid grid-cols-1 gap-1">
                           <SheetClose asChild>
                             <button onClick={() => navigate(isSeller ? "/seller/dashboard" : "/profile")} className="flex items-center gap-4 w-full p-3 rounded-2xl text-sm font-bold text-zinc-700 hover:bg-[#FFF5F7] transition-all">
                                <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center border border-zinc-100 shadow-sm">
                                  {isSeller ? <Store size={20} className="text-[#FF4E50]"/> : <UserCircle size={20} className="text-[#FF4E50]"/>}
                                </div>
                                {isSeller ? "Seller Dashboard" : "My Profile"}
                             </button>
                           </SheetClose>
                           {isCustomer && (
                             <>
                               <SheetClose asChild>
                                 <button onClick={() => navigate("/profile/orders")} className="flex items-center gap-4 w-full p-3 rounded-2xl text-sm font-bold text-zinc-700 hover:bg-[#FFF5F7] transition-all">
                                    <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center border border-zinc-100 shadow-sm"><PackageCheck size={20} className="text-[#FF4E50]"/></div>
                                    My Orders
                                 </button>
                               </SheetClose>
                               <SheetClose asChild>
                                 <button onClick={() => navigate("/wishlist")} className="flex items-center gap-4 w-full p-3 rounded-2xl text-sm font-bold text-zinc-700 hover:bg-[#FFF5F7] transition-all">
                                    <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center border border-zinc-100 shadow-sm"><Heart size={20} className="text-[#FF4E50]"/></div>
                                    Wishlist
                                 </button>
                               </SheetClose>
                             </>
                           )}
                         </div>
                       ) : (
                         <div className="grid grid-cols-2 gap-3 px-2 mt-2">
                            <SheetClose asChild><Button onClick={() => navigate("/login")} className="bg-[#FF4E50] text-[10px] font-black uppercase h-11 rounded-xl">Login</Button></SheetClose>
                            <SheetClose asChild><Button onClick={() => navigate("/register")} variant="outline" className="text-[10px] font-black uppercase h-11 rounded-xl border-[#FAD0C4] text-[#E75480]">Create Account</Button></SheetClose>
                         </div>
                       )}
                    </div>

                    <DropdownMenuSeparator className="mx-6 my-2 bg-zinc-100" />

                    {/* CATEGORIES SECTION (Only if Customer) */}
                    {isCustomer && (
                      <div className="py-4">
                        <p className="px-8 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Categories</p>
                        {Object.entries(megaMenuData).map(([key, menu]) => (
                          <details key={key} className="group px-4 mb-2">
                            <summary className="flex justify-between items-center py-3 px-4 rounded-xl cursor-pointer hover:bg-[#FFF5F7] list-none font-semibold text-zinc-900">
                              {menu.title}
                              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 text-zinc-400" />
                            </summary>
                            <div className="mt-2 ml-4 space-y-4 border-l-2 border-[#FAD0C4] pl-4 py-2">
                              {menu.categories.map((category) => (
                                <div key={category.title} className="space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#E75480]">{category.title}</p>
                                  <div className="grid grid-cols-1 gap-2">
                                    {category.items.map((item) => (
                                      <SheetClose asChild key={item}>
                                        <button 
                                          onClick={() => handleItemClickNavigate(key, item)}
                                          className="text-left text-sm text-zinc-600 hover:text-[#FF4E50] py-1"
                                        >
                                          {item}
                                        </button>
                                      </SheetClose>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Logout Button Fixed at Bottom */}
                  {isAuthenticated && (
                    <div className="p-4 border-t bg-white mt-auto">
                        <button 
                            onClick={handleLogout} 
                            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-red-500 bg-red-50 hover:bg-red-100 transition-all shadow-inner"
                        >
                            <LogOut size={16}/> Logout 
                        </button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              <Link to="/" className="flex items-center gap-2 md:gap-3 group">
                <div className="h-9 w-9 md:h-11 md:w-11 rounded-xl overflow-hidden shadow-2xl border border-[#FAD0C4]/30 group-hover:scale-105 transition-transform">
                  <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" />
                </div>
                <span className="hidden sm:block text-xl md:text-2xl font-black text-zinc-900 tracking-tighter uppercase italic">
                  Digi<span className="text-[#FF4E50] font-light not-italic font-serif">shop</span>
                </span>
              </Link>
            </div>

            {/* Search (Only for Customers) */}
            {isCustomer && (
              <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-[#FF4E50] transition-colors" />
                  </div>
                  <Input
                    placeholder="What are you looking for?"
                    className="w-full bg-zinc-100 border-none h-12 pl-11 pr-24 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#FF4E50]/20 transition-all font-medium"
                  />
                  <Button className="absolute right-1.5 top-1.5 h-9 px-4 bg-[#FF4E50] text-white rounded-xl hover:bg-[#E75480] text-xs font-bold uppercase tracking-widest transition-colors">
                    Search
                  </Button>
                </div>
              </div>
            )}

            {/* Right Side Icons */}
            <div className="flex items-center gap-1 md:gap-4 ml-auto">
              {/* {isCustomer && isAuthenticated && (
                <div className="mr-1">
                  <NotificationBell userToken={user?.token} />
                </div>
              )} */}

              <div className="hidden sm:flex items-center gap-1">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 px-3 rounded-xl gap-2 hover:bg-[#FFF5F7]">
                      <User className="h-5 w-5 text-zinc-700" />
                      {isAuthenticated && <span className="text-xs font-bold truncate max-w-[80px]">{user?.name}</span>}
                    </Button>
                  </DropdownMenuTrigger>
                  
                  {/* FIXED BACKGROUND: bg-white and z-index to stop transparency */}
                  <DropdownMenuContent align="end" className="w-64 p-2 mt-2 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] bg-white border border-[#FAD0C4]/50 z-[60]">
                    {isAuthenticated ? (
                      <>
                        <div className="p-3 bg-[#FFF5F7] rounded-xl mb-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#E75480]/60">Account</p>
                            <p className="text-sm font-bold text-zinc-900 truncate">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator className="my-2" />
                        {isCustomer && (
                          <div className="space-y-1">
                            <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-lg py-2.5 cursor-pointer hover:bg-[#FFF5F7] bg-white">
                              <UserCircle className="h-4 w-4 mr-3 text-zinc-400" /> <span className="font-medium">My Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/profile/orders")} className="rounded-lg py-2.5 cursor-pointer hover:bg-[#FFF5F7] bg-white">
                              <ShoppingCart className="h-4 w-4 mr-3 text-zinc-400" /> <span className="font-medium">My Orders</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/wishlist")} className="rounded-lg py-2.5 cursor-pointer hover:bg-[#FFF5F7] bg-white">
                              <Heart className="h-4 w-4 mr-3 text-zinc-400" /> <span className="font-medium">Wishlist</span>
                            </DropdownMenuItem>
                          </div>
                        )}
                        {isSeller && (
                          <div className="space-y-1">
                            <DropdownMenuItem onClick={() => navigate("/seller/dashboard")} className="rounded-lg py-2.5 cursor-pointer text-white bg-zinc-900 hover:bg-zinc-800">
                              <Store className="h-4 w-4 mr-3 text-[#FFD700]" /> <span className="font-bold">Seller Dashboard</span>
                            </DropdownMenuItem>
                          </div>
                        )}
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={handleLogout} className="rounded-lg py-2.5 cursor-pointer text-red-500 hover:bg-red-50 bg-white">
                          <LogOut className="h-4 w-4 mr-3" /> <span className="font-bold">Logout</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <div className="p-1 space-y-1 bg-white">
                        <DropdownMenuItem onClick={() => navigate("/login")} className="rounded-lg py-3 justify-center font-black uppercase text-[10px] tracking-widest bg-[#FF4E50] text-white">
                          Login
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/register")} className="rounded-lg py-3 justify-center font-black uppercase text-[10px] tracking-widest border border-[#FAD0C4] hover:bg-[#FFF5F7]">
                          Create Account
                        </DropdownMenuItem>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {isCustomer && (
                  <Button variant="ghost" size="icon" onClick={() => navigate("/wishlist")} className="h-10 w-10 rounded-xl relative hover:bg-[#FFF5F7] group transition-colors">
                    <Heart className="h-5 w-5 text-zinc-700 group-hover:text-[#E75480] transition-colors" />
                  </Button>
                )}
              </div>

              {/* Cart Drawer (Only Customer) */}
              {isCustomer && (
                <Button 
                  onClick={() => setIsCartOpen(true)} 
                  className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl gap-2 bg-[#FF4E50] text-white hover:bg-[#E75480] shadow-xl transition-all active:scale-95"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-3 -right-3 h-5 w-5 flex items-center justify-center bg-[#FFD700] text-black text-[10px] font-black rounded-full ring-2 ring-white">
                        {itemCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">Cart</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu (Only Customer) */}
        {isCustomer && (
          <div className="hidden lg:block border-t border-[#FAD0C4] bg-white">
            <div className="max-w-[1440px] mx-auto px-8">
              <nav className="flex items-center gap-10 py-1">
                {Object.keys(megaMenuData).map((menuKey) => (
                  <div
                    key={menuKey}
                    className="relative py-3 group"
                    onMouseEnter={() => handleMouseEnter(menuKey)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      onClick={() => handleTopClick(menuKey)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#FF4E50] ${activeMegaMenu === menuKey ? 'text-[#FF4E50]' : 'text-zinc-500'}`}
                    >
                      {megaMenuData[menuKey].title}
                      <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${activeMegaMenu === menuKey ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`absolute bottom-0 left-0 h-[3px] bg-[#FF4E50] transition-all duration-300 ${activeMegaMenu === menuKey ? 'w-full' : 'w-0'}`} />
                  </div>
                ))}
              </nav>
            </div>

            {/* Mega Menu Overlay */}
            {activeMegaMenu && megaMenuData[activeMegaMenu] && (
              <div
                className="absolute top-full left-0 w-full bg-white border-b border-[#FAD0C4] shadow-[0_20px_50px_rgba(231,84,128,0.1)] z-50 animate-in fade-in slide-in-from-top-4 duration-300"
                onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
                onMouseLeave={() => { if (!pinnedMenu) setActiveMegaMenu(null) }}
              >
                <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-5 gap-12">
                  {megaMenuData[activeMegaMenu].categories.map((category, i) => (
                    <div key={i} className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E75480] bg-[#FFF5F7] px-2 py-1 inline-block rounded-md">{category.title}</h3>
                      <ul className="space-y-2">
                        {category.items.map((item, j) => (
                          <li key={j}>
                            <button
                              onClick={() => handleItemClickNavigate(activeMegaMenu, item)}
                              className="text-sm font-medium text-zinc-500 hover:text-[#FF4E50] transition-colors flex items-center group"
                            >
                              <span className="h-[1px] w-0 bg-[#FF4E50] group-hover:w-3 mr-0 group-hover:mr-2 transition-all"></span>
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="col-span-1 rounded-3xl bg-[#FFF5F7] p-6 flex flex-col justify-end relative overflow-hidden h-[300px] border border-[#FAD0C4]">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4E50]/10 blur-[60px] rounded-full" />
                      <div className="relative z-10">
                        <h4 className="text-[#333] text-xl font-black uppercase tracking-tighter italic leading-tight mb-2">Exclusive <br/><span className="text-[#FF4E50]">Collections</span></h4>
                        <p className="text-[#E75480] text-[10px] font-bold uppercase tracking-widest mb-4 leading-relaxed">Handpicked for you.</p>
                        <Button className="w-full h-10 bg-[#FF4E50] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#E75480] rounded-xl transition-colors shadow-lg shadow-[#FF4E50]/20" onClick={() => navigate("/products")}>
                          Shop Now <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}