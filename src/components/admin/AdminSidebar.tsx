import {
  Building,
  Car,
  DollarSign,
  Gavel,
  Home,
  LayoutDashboard,
  LogOut,
  User
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/inventory', icon: <Car size={20} />, label: 'Inventory' },
    // { path: '/admin/appointments', icon: <Calendar size={20} />, label: 'Appointments' },
    { path: '/admin/payments', icon: <DollarSign size={20} />, label: 'Payments' },
    { path: '/admin/auctions', icon: <Gavel size={20} />, label: 'Auctions' },
    // { path: '/admin/services', icon: <Wrench size={20} />, label: 'Services' },
  ];

  const settingsItems = [
    { path: '/admin/profile', icon: <User size={20} />, label: 'Profile' },
    { path: '/admin/business-settings', icon: <Building size={20} />, label: 'Business Settings' },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 flex-shrink-0 hidden md:block">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <Link to="/admin" className="flex items-center">
          <Car className="h-8 w-8 text-blue-400 mr-2" />
          <span className="text-xl font-bold">Sam Cars Admin</span>
        </Link>
      </div>
      
      <nav className="mt-5">
        <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">
          Main
        </div>
        
        <ul className="mt-2">
          {navItems.map((item) => (
            <li key={item.path} className="px-2 py-1">
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="px-4 py-2 mt-8 text-xs text-gray-400 uppercase tracking-wider">
          Settings
        </div>
        
        <ul className="mt-2">
          {settingsItems.map((item) => (
            <li key={item.path} className="px-2 py-1">
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li className="px-2 py-1">
            <Link
              to="/"
              className="flex items-center px-4 py-3 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <span className="mr-3">
                <Home size={20} />
              </span>
              <span>Return to Main Site</span>
            </Link>
          </li>
          <li className="px-2 py-1">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <span className="mr-3">
                <LogOut size={20} />
              </span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;