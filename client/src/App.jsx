import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { applySiteSettings } from './utils/brand';
import { settingsAPI } from './services/api';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import Order from './pages/Order';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailed from './pages/OrderFailed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Account from './pages/Account';
import Invoice from './pages/Invoice';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminGallery from './pages/admin/AdminGallery';
import AdminReviews from './pages/admin/AdminReviews';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminOverview from './pages/admin/AdminOverview';
import AdminSettings from './pages/admin/AdminSettings';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ProtectedRoute, AdminProtectedRoute, UserProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  // Load admin-edited site settings once, then re-render so the whole
  // site (navbar, footer, contact info) reflects name/tagline/phone edits.
  const [, setBrandVersion] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        const r = await settingsAPI.get();
        if (r.success && r.data) {
          applySiteSettings(r.data);
          setBrandVersion((v) => v + 1);
        }
      } catch { /* offline — hardcoded brand defaults stay */ }
    })();
  }, []);

  // After admin saves settings, localStorage.refresh_settings is set.
  // Re-fetch settings so the whole site immediately reflects the edits.
  useEffect(() => {
    if (localStorage.getItem('refresh_settings') === '1') {
      localStorage.removeItem('refresh_settings');
      (async () => {
        try {
          const r = await settingsAPI.get();
          if (r.success && r.data) {
            applySiteSettings(r.data);
            setBrandVersion((v) => v + 1);
          }
        } catch { /* offline — hardcoded brand defaults stay */ }
      })();
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <AdminAuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="about" element={<About />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="contact" element={<Contact />} />
              <Route path="order" element={<Order />} />
              <Route path="order/success" element={<OrderSuccess />} />
              <Route path="order/failed" element={<OrderFailed />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route
                path="account"
                element={
                  <UserProtectedRoute>
                    <Account />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="invoice/:orderId"
                element={
                  <UserProtectedRoute>
                    <Invoice />
                  </UserProtectedRoute>
                }
              />
            </Route>

            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="menu" element={<AdminMenu />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AdminAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;