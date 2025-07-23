import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Customer Views
import Layout from './components/Layout';
import HomePage from './pages/customer/HomePage';
import InventoryPage from './pages/customer/InventoryPage';
import VehicleDetailsPage from './pages/customer/VehicleDetailsPage';
import ServicesPage from './pages/customer/ServicesPage';
import ContactPage from './pages/customer/ContactPage';
import AccountPage from './pages/customer/AccountPage';
import WishlistPage from './pages/customer/WishlistPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import SellCarPage from './pages/customer/SellCarPage';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Admin Views
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInventory from './pages/admin/Inventory';
import AdminVehicleDetails from './pages/admin/VehicleDetails';
import AdminPayments from './pages/admin/Payments';
import AdminAuctions from './pages/admin/Auctions';
import AdminAuctionDetails from './pages/admin/AuctionDetails';
import AdminServices from './pages/admin/Services';
import AdminLogin from './pages/admin/Login';
import AdminProfile from './pages/admin/Profile';
import BusinessSettings from './pages/admin/BusinessSettings';
import AdminRoute from './components/auth/AdminRoute';

// Components
import LoadingSpinner from './components/LoadingSpinner';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import PaymentCancelled from './pages/PaymentCancelled';
import PaymentSuccess from './pages/PaymentSuccess';

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <CartProvider>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/:id" element={<VehicleDetailsPage />} />
          <Route path="sell-car" element={<SellCarPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="login" element={<AdminLogin />} />
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="inventory/:id" element={<AdminVehicleDetails />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="auctions" element={<AdminAuctions />} />
              <Route path="auctions/:id" element={<AdminAuctionDetails />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="business-settings" element={<BusinessSettings />} />
            </Route>
          </Route>
        </Route>
        
        {/* Payment Routes */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancelled" element={<PaymentCancelled />} />
      </Routes>
    </CartProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;