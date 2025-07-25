import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Customer Views
import Layout from './components/Layout';
import HomePage from './pages/customer/HomePage';
import InventoryPage from './pages/customer/InventoryPage';
import VehicleDetailsPage from './pages/customer/VehicleDetailsPage';
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

// Add a simple 404 component
const NotFound: React.FC = () => (
  <div style={{ minHeight: '100vh', backgroundColor: '#f5f9ff', color: '#0a3d62', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: `'Helvetica Neue', Arial, sans-serif` }}>
    <div style={{ maxWidth: 700, padding: 20, textAlign: 'center' }}>
      <h1 style={{ fontSize: '5rem', marginBottom: 10, color: '#1e3799' }}>404</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: 20, color: '#0a3d62' }}>Oops! The page you're looking for doesn't exist.</p>
      <p style={{ fontSize: '1.2rem', marginBottom: 20, color: '#0a3d62' }}>Don't worry, your dream car is still waiting for you!</p>
      <a href="/" style={{ textDecoration: 'none', backgroundColor: '#1e3799', color: 'white', padding: '12px 25px', borderRadius: 6, fontWeight: 'bold', transition: 'background-color 0.3s' }}
        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#0c2461')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#1e3799')}
      >Back to Home</a>
      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 15, flexWrap: 'wrap' }} className="car-images">
        <img src="https://via.placeholder.com/150x90?text=Car+1" alt="Car 1" style={{ width: 150, borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transition: 'transform 0.3s ease' }} />
        <img src="https://via.placeholder.com/150x90?text=Car+2" alt="Car 2" style={{ width: 150, borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transition: 'transform 0.3s ease' }} />
        <img src="https://via.placeholder.com/150x90?text=Car+3" alt="Car 3" style={{ width: 150, borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transition: 'transform 0.3s ease' }} />
      </div>
    </div>
  </div>
);

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
          <Route path="login" element={<NotFound />} />
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="inventory/:id" element={<AdminVehicleDetails />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="auctions" element={<AdminAuctions />} />
              <Route path="auctions/:id" element={<AdminAuctionDetails />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="business-settings" element={<BusinessSettings />} />
            </Route>
          </Route>
        </Route>
        
        {/* Payment Routes */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancelled" element={<PaymentCancelled />} />
        <Route path="*" element={<NotFound />} />
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