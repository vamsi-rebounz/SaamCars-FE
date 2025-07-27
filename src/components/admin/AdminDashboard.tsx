import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/auth';
import { getDashboardStats, DashboardStats } from '../../services/dashboard';


const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          setError(response.error || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('An error occurred while fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-10 bg-gray-300 rounded w-1/3" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-6 animate-pulse mb-8">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded w-full mb-2" />
        ))}
      </div>
    </div>
  );
  if (error) return <div className="text-red-500 p-4 bg-red-50 border border-red-200 rounded">{error}</div>;
  if (!dashboardData) return <div className="text-gray-500 p-4">No dashboard data available.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      {/* Admin Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Admin Profile</h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          setProfileError(null);
          setProfileSuccess(null);
          setProfileLoading(true);
          if (!profileForm.name || !profileForm.email) {
            setProfileError('Name and email are required.');
            setProfileLoading(false);
            return;
          }
          if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmNewPassword) {
            setProfileError('New passwords do not match.');
            setProfileLoading(false);
            return;
          }
          const [firstName, ...rest] = profileForm.name.split(' ');
          const lastName = rest.join(' ');
          const response = await updateProfile({
            firstName: firstName,
            lastName: lastName,
            phone: profileForm.phone,
            // Remove currentPassword and newPassword from the payload to match the expected type
          });
          if (response.success && response.user) {
            setUser(response.user);
            setProfileSuccess('Profile updated successfully.');
          } else {
            setProfileError(response.error || 'Failed to update profile.');
          }
          setProfileLoading(false);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
                disabled={profileLoading}
              />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
                disabled={profileLoading}
              />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                disabled={profileLoading}
              />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="font-semibold mb-4">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={e => setProfileForm(f => ({ ...f, currentPassword: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  disabled={profileLoading}
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={e => setProfileForm(f => ({ ...f, newPassword: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={profileLoading}
                  />
                </div>
                <div>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={profileForm.confirmNewPassword}
                    onChange={e => setProfileForm(f => ({ ...f, confirmNewPassword: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={profileLoading}
                  />
                </div>
              </div>
            </div>
          </div>
          {(profileError || profileSuccess) && (
            <div className={`mt-4 p-2 rounded ${profileError ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>{profileError || profileSuccess}</div>
          )}
          <div className="flex justify-end mt-6">
            <button type="submit" className="btn-primary" disabled={profileLoading}>{profileLoading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Vehicles</h3>
          <p className="text-3xl font-bold text-blue-600">{dashboardData.summary.total_vehicles}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-green-600">{dashboardData.summary.total_users}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">${Number(dashboardData.summary.total_revenue).toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {dashboardData.recent_activity.length === 0 ? (
            <div className="p-6 text-gray-400 text-center">No recent activity to display.</div>
          ) : (
            dashboardData.recent_activity.map((activity: any) => (
              <div key={activity.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.type}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add New Vehicle
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Manage Users
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            View Reports
          </button>
          <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
            System Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 