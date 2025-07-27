import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between h-20 sm:h-16">
            <div className="flex flex-col items-start justify-center py-2 sm:py-0">
              <div className="flex items-center mb-2 sm:mb-0">
                <span className="flex items-center text-2xl font-extrabold text-blue-700 space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-1 text-blue-500">
                    <path d="M3 13v-2l1-5c.2-.9 1-1.5 1.9-1.5h12.2c.9 0 1.7.6 1.9 1.5l1 5v2c.6 0 1 .4 1 1v3c0 .6-.4 1-1 1h-1c0 1.1-.9 2-2 2s-2-.9-2-2H8c0 1.1-.9 2-2 2s-2-.9-2-2H3c-.6 0-1-.4-1-1v-3c0-.6.4-1 1-1zm2.2-6c-.1 0-.2.1-.2.2L4 11h16l-1-3.8c0-.1-.1-.2-.2-.2H5.2zM19 17c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1zm-12 0c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z" />
                  </svg>
                  <span>SaamCars Admin</span>
                </span>
              </div>
              <div className="flex-shrink-0 flex items-center sm:hidden mt-2">
                {/* Mobile: Navigation links will go here if needed */}
              </div>
            </div>
            <div className="flex-1 flex items-center justify-between sm:justify-end">
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/inventory"
                  className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Inventory
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/add-vehicle"
                      className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Add Vehicle
                    </Link>
                    <Link
                      to="/auction/add"
                      className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Add Auction
                    </Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    Welcome, {user?.firstName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-lg mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 SaamCars. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 