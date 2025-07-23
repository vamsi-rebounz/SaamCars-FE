import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User, CreditCard, LogOut, Clock, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, fetchUserProfile, requestEmailVerification } from '../../services/auth';
import Toast from '../../components/Toast';

const AccountPage: React.FC = () => {
  const { user, isAuthenticated, logout, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Helper function to format date for input field
  const formatDateForInput = (dateString: string | undefined) => {
    console.log('Formatting date:', dateString);
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.log('Invalid date:', dateString);
      return '';
    }
    const formattedDate = date.toISOString().split('T')[0];
    console.log('Formatted date:', formattedDate);
    return formattedDate;
  };

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    driverLicense: user?.driverLicense || '',
    dateOfBirth: formatDateForInput(user?.dateOfBirth) || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError] = useState<string | null>(null);
  const [profileSuccess] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Fetch complete profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchUserProfile();
        if (response.success && response.user) {
          setUser(response.user);
          setProfileForm({
            firstName: response.user.firstName || '',
            lastName: response.user.lastName || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
            driverLicense: response.user.driverLicense || '',
            dateOfBirth: formatDateForInput(response.user.dateOfBirth) || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, setUser]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        driverLicense: user.driverLicense || '',
        dateOfBirth: formatDateForInput(user.dateOfBirth) || ''
      });
    }
  }, [user]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  const handleVerificationRequest = async () => {
    setVerificationLoading(true);
    try {
      const response = await requestEmailVerification();
      if (response.success) {
        showToast('Verification email sent! Please check your inbox.', 'success');
      } else {
        showToast(response.message || 'Failed to send verification email.', 'error');
      }
    } catch (error) {
      showToast('Failed to send verification email. Please try again.', 'error');
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(t => ({ ...t, show: false }))}
        />
      )}
      
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-blue-700 text-white">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-blue-700">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="font-semibold text-lg truncate">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-blue-100 text-sm truncate" title={user?.email}>
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                        activeTab === 'profile'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User className="h-5 w-5 mr-3" />
                      <span>Profile</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('payments')}
                      className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
                        activeTab === 'payments'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mr-3" />
                      <span>Payments</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="w-full flex items-center px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="border-b border-gray-200">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                      <p className="mt-1 text-sm text-gray-500">Update your personal information and contact details.</p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Account Status */}
                    <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Account Status</h3>
                          <div className="flex items-center mt-1">
                            <div className={`flex items-center ${user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                              {user?.emailVerified ? (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              <span className="text-sm">
                                {user?.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!user?.emailVerified && (
                        <button 
                          onClick={handleVerificationRequest}
                          disabled={verificationLoading}
                          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verificationLoading ? 'Sending...' : 'Verify Email'}
                        </button>
                      )}
                    </div>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setProfileLoading(true);

                      if (!profileForm.firstName || !profileForm.lastName) {
                        showToast('First name and last name are required.', 'error');
                        setProfileLoading(false);
                        return;
                      }

                      try {
                        console.log('Submitting profile update:', profileForm);
                        const response = await updateProfile({
                          firstName: profileForm.firstName,
                          lastName: profileForm.lastName,
                          phone: profileForm.phone,
                          driverLicense: profileForm.driverLicense,
                          dateOfBirth: profileForm.dateOfBirth
                        });
                        console.log('Profile update response:', response);

                        if (response.success && response.user) {
                          setUser(response.user);
                          showToast('Profile updated successfully.', 'success');
                          
                          // Update form with new values
                          setProfileForm({
                            firstName: response.user.firstName || '',
                            lastName: response.user.lastName || '',
                            email: response.user.email || '',
                            phone: response.user.phone || '',
                            driverLicense: response.user.driverLicense || '',
                            dateOfBirth: formatDateForInput(response.user.dateOfBirth) || ''
                          });
                        } else {
                          showToast(response.error || 'Failed to update profile.', 'error');
                        }
                      } catch (error) {
                        console.error('Profile update error:', error);
                        showToast('Failed to update profile. Please try again.', 'error');
                      } finally {
                        setProfileLoading(false);
                      }
                    }}>
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                              <input
                                type="text"
                                value={profileForm.firstName}
                                onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                required
                                disabled={profileLoading}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                              <input
                                type="text"
                                value={profileForm.lastName}
                                onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                required
                                disabled={profileLoading}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                              <div className="flex">
                                <input
                                  type="email"
                                  value={profileForm.email}
                                  disabled
                                  className="w-full rounded-md border-gray-300 bg-gray-50 text-gray-500"
                                />
                                {user?.emailVerified && (
                                  <div className="ml-2 flex items-center text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                Contact support to change your email address.
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                              <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholder="(123) 456-7890"
                                disabled={profileLoading}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Driver's License</label>
                              <input
                                type="text"
                                value={profileForm.driverLicense}
                                onChange={e => setProfileForm(f => ({ ...f, driverLicense: e.target.value }))}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholder="DL12345678"
                                disabled={profileLoading}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                              <input
                                type="date"
                                value={profileForm.dateOfBirth}
                                onChange={e => setProfileForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                disabled={profileLoading}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Account Information */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                              <div className="flex items-center space-x-2 text-gray-700">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <span className="capitalize">{user?.role}</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                              <div className="flex items-center space-x-2 text-gray-700">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <span>{user?.lastLogin ? formatDate(user.lastLogin) : 'Not available'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {(profileError || profileSuccess) && (
                          <div className={`p-4 rounded-md ${
                            profileError 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {profileError || profileSuccess}
                          </div>
                        )}

                        <div className="flex justify-end pt-6 border-t border-gray-200">
                          <button 
                            type="submit" 
                            className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            disabled={profileLoading}
                          >
                            {profileLoading ? 'Saving Changes...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment History</h2>
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No payment history available.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;