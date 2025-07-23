import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('AdminLayout - Auth State:', {
      isAuthenticated,
      isAdmin,
      user,
      currentPath: location.pathname
    });
  }, [isAuthenticated, isAdmin, user, location]);

  // Redirect to login if not authenticated or not an admin
  if (!isAuthenticated) {
    console.log('AdminLayout - Not authenticated, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    console.log('AdminLayout - Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;