"use client";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HeroSection from "./components/home/HeroSection";
import CategoryGrid from "./components/home/CategoryGrid";
import LatestProducts from "./components/home/LatestProducts";
import DiscountedProducts from "./components/home/DiscountedProducts";
import CategoryShowcase from "./components/home/CategoryShowcase";
import FeaturedProducts from "./components/home/FeaturedProducts";
import SellerDashboardPage from "./Pages/seller/SellerDashboardPage";
import SellerProductInventoryPage from "./Pages/seller/SellerProductInventoryPage";
import SellerOrdersListPage from "./Pages/seller/SellerOrdersListPage";
import SellerRevenuePage from "./Pages/seller/SellerRevenuePage";
import SellerRatingPage from "./Pages/seller/SellerRatingPage";
import SellerCustomerPage from "./Pages/seller/SellerCustomerPage";
import SellerSetupPage from "./Pages/seller/SellerSetupPage";
import SellerVerificationPage from "./Pages/seller/SellerVerificationPage";
import SellerProfilePage from "./Pages/seller/SellerProfilePage";
import AddProductPage from "./Pages/seller/AddProductForm";
import EditProductPage from "./Pages/seller/EditProductPage";
import SellerProductDetailsPage from "./Pages/seller/SellerProductDetailsPage";
import ProfilePage from "./Pages/profile/ProfilePage";
import OrderDetailPage from "./Pages/profile/OrderDetailPage";
import OrdersPage from "./Pages/profile/OrdersPage";
import WishlistPage from "./Pages/WishlistPage";
import ProductsPage from "./components/products/ProductsPage";
import ProductDetailsPage from "./components/products/ProductDetailsPage";
import CheckoutPage from "./Pages/CheckoutPage";
import OrderSuccessPage from "./Pages/OrderSuccessPage";
import AboutPage from "./Pages/AboutPage";
import ContactPage from "./Pages/ContactPage";
import CareersPage from "./Pages/CareersPage";
import BlogPage from "./Pages/BlogPage";
import PressPage from "./Pages/PressPage";
import HelpCenter from "./Pages/HelpCenter";
import Returns from "./Pages/Returns";
import ShippingInfo from "./Pages/ShippingInfo";
import TrackOrder from "./Pages/TrackOrder";
import SizeGuide from "./Pages/SizeGuide";
import PrivacyPage from "./Pages/PrivacyPage";
import TermsPage from "./Pages/TermsPage";
import ScrollToTop from "./components/layout/ScrollToTop";
import ProtectedRoute from "./context/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerSupportTicketsPage from "./Pages/seller/SellerSupportTicketsPage";
import SellerReturnsPage from "./Pages/seller/SellerReturnsPage";
import SellerReviewsPage from "./Pages/seller/SellerReviewsPage";
import NotificationsPage from "./components/notifications/NotificationsPage";
import CategoryProducts from "./components/home/CategoryProducts";
import CartPage from "./components/cart/cart";
import SellerLayout from "./Pages/seller/SellerLayout";
import LoginPage from "./Pages/auth/LoginPage";
import RegisterPage from "./Pages/auth/RegisterPage";
import ForgotPasswordPage from "./Pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./Pages/auth/ResetPasswordPage";
import FirebasePasswordResetSuccess from "./Pages/auth/FirebasePasswordResetSuccess";
import AdminDashboard from "./Pages/admin/AdminDashboard";
import AdminUsersPage from "./Pages/admin/AdminUsersPage";
import AdminSellersPage from "./Pages/admin/AdminSellersPage";
import AdminOrdersPage from "./Pages/admin/AdminOrdersPage";
import AdminComplaintsPage from "./Pages/admin/AdminComplaintsPage";
import AdminDeliveryPage from "./Pages/admin/AdminDeliveryPage";
import AdminLoginForm from "./Pages/auth/AdminLoginForm";

const HomePage = () => (
  <>
    <HeroSection />
    <CategoryGrid />
    <LatestProducts />
    <DiscountedProducts />
    <CategoryShowcase />
    <FeaturedProducts />
  </>
);

function App() {
  const { isLoading } = useAuth();
  const location = useLocation();

  const isDashboardArea =
    location.pathname.startsWith("/seller") ||
    location.pathname.startsWith("/admin");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboardArea && <Header />}

      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:category" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/shippinginfo" element={<ShippingInfo />} />
          <Route path="/trackorder" element={<TrackOrder />} />
          <Route path="/sizeguide" element={<SizeGuide />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* --- AUTH ROUTES --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/register"
            element={<Navigate to="/register/role" replace />}
          />
          <Route path="/register/role" element={<RegisterPage />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/auth/password-reset-success"
            element={<FirebasePasswordResetSuccess />}
          />

          <Route path="/admin/login" element={<AdminLoginForm />} />

          {/* --- USER PROTECTED ROUTES --- */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success/:id"
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* --- SELLER DASHBOARD NESTED ROUTES --- */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<SellerDashboardPage />} />
            <Route path="inventory" element={<SellerProductInventoryPage />} />
            <Route path="orders/list" element={<SellerOrdersListPage />} />
            <Route path="analytics/revenue" element={<SellerRevenuePage />} />
            <Route path="analytics/rating" element={<SellerRatingPage />} />
            <Route
              path="analytics/customers"
              element={<SellerCustomerPage />}
            />
            <Route path="add-product" element={<AddProductPage />} />
            <Route
              path="product-details/:id"
              element={<SellerProductDetailsPage />}
            />
            <Route path="edit-product/:id" element={<EditProductPage />} />
            <Route path="analytics/reviews" element={<SellerReviewsPage />} />
            <Route
              path="support/tickets"
              element={<SellerSupportTicketsPage />}
            />
            <Route path="returns/requests" element={<SellerReturnsPage />} />
            <Route path="profile" element={<SellerProfilePage />} />
            <Route path="setup" element={<SellerSetupPage />} />
            <Route path="verify" element={<SellerVerificationPage />} />
          </Route>

          {/* --- ADMIN PROTECTED ROUTES --- */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sellers"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSellersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/delivery"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDeliveryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories/:categoryName"
            element={<CategoryProducts />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isDashboardArea && <Footer />}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
