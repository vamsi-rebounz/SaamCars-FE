import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X, Heart, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-700" />
            <span className="text-xl font-bold text-blue-700">Saam Cars</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-700 font-medium">
              Home
            </Link>
            <Link to="/inventory" className="text-gray-700 hover:text-blue-700 font-medium">
              Inventory
            </Link>
            {/* <Link to="/services" className="text-gray-700 hover:text-blue-700 font-medium">
              Services
            </Link> */}
            <Link to="/contact" className="text-gray-700 hover:text-blue-700 font-medium">
              Contact
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-blue-700 hover:text-blue-800 font-medium">
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/wishlist\" className="text-gray-700 hover:text-blue-700">
                  <Heart className="h-6 w-6" />
                </Link>
                <Link to="/account" className="text-gray-700 hover:text-blue-700 flex items-center space-x-1">
                  <User className="h-6 w-6" />
                  <span className="text-sm">{user?.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-700 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/wishlist" className="text-gray-700">
              <Heart className="h-6 w-6" />
            </Link>
            <button onClick={toggleMenu} className="text-gray-700">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/inventory" 
                className="text-gray-700 hover:text-blue-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Inventory
              </Link>
              <Link 
                to="/services" 
                className="text-gray-700 hover:text-blue-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-blue-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-blue-700 hover:text-blue-800 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/account" 
                    className="text-gray-700 hover:text-blue-700 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-700 font-medium text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-blue-700 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;