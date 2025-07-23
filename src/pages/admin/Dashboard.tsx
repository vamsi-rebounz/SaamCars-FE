import React, { useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '../../services/dashboard';
import DashboardCharts from '../../components/admin/DashboardCharts';
import AlertState from '../../components/ErrorState';
import {
  DollarSign,
  Car,
  Users,
  TrendingUp,
  CreditCard,
  Calendar,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Tag,
  BarChart3,
  Gavel,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardStats();
        
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          setError(response.error || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('An error occurred while fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AlertState
          error={error || 'Failed to load dashboard data'}
          variant="server"
          title="Dashboard Error"
          description="We couldn't load the dashboard data. This might be due to a network issue or server problem."
        />
      </div>
    );
  }

  // Core Business Metrics - Most important KPIs
  const coreMetrics = [
    {
      title: 'Total Revenue',
      value: `$${dashboardData.summary.total_revenue.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-blue-600 to-blue-700',
      subtitle: `$${dashboardData.summary.revenue_this_month.toLocaleString()} this month`
    },
    {
      title: 'Total Vehicles',
      value: dashboardData.summary.total_vehicles.toString(),
      icon: <Car className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-green-600 to-green-700',
      subtitle: `${dashboardData.summary.available_vehicles} available`
    },
    {
      title: 'Total Users',
      value: dashboardData.summary.total_users.toString(),
      icon: <Users className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-purple-600 to-purple-700',
      subtitle: `${dashboardData.summary.new_users_this_month} new this month`
    },
    {
      title: 'Auction Profit',
      value: `$${dashboardData.summary.auction_profit.toLocaleString()}`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
      subtitle: `$${dashboardData.summary.auction_investment.toLocaleString()} invested`
    }
  ];

  // Financial Performance - Consolidated payment and auction data
  const financialMetrics = [
    {
      title: 'Completed Payments',
      value: (dashboardData.summary.total_payments - dashboardData.summary.pending_payments).toString(),
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      subtitle: 'Successful transactions'
    },
    {
      title: 'Pending Payments',
      value: dashboardData.summary.pending_payments.toString(),
      icon: <Clock className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      subtitle: 'Awaiting completion'
    },
    {
      title: 'Auction Purchases',
      value: dashboardData.summary.vehicles_purchased || 0,
      icon: <Gavel className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      subtitle: 'Vehicles acquired'
    },
    {
      title: 'Auction Sold',
      value: dashboardData.summary.vehicles_sold || 0,
      icon: <Award className="h-6 w-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-200',
      subtitle: 'Vehicles sold'
    }
  ];



  // Inventory Status - Simplified inventory overview
  const inventoryStatus = [
    {
      title: 'Available',
      value: dashboardData.summary.available_vehicles,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Sold',
      value: dashboardData.summary.sold_vehicles,
      icon: <Tag className="h-5 w-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Appointments',
      value: dashboardData.summary.total_appointments,
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Test Drives',
      value: dashboardData.summary.test_drives,
      icon: <Eye className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
                  <p className="text-gray-600 mt-1">Key performance indicators and business insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                {new Date(dashboardData.date_range.from).toLocaleDateString()} - {new Date(dashboardData.date_range.to).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Core Business Metrics */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Key Performance Indicators</h2>
            <div className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              This Month
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${metric.color}`}>
                      <div className="text-white">
                        {metric.icon}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                    </div>
                    <p className="text-xs text-gray-500">{metric.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Performance */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Financial Performance</h2>
            <div className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Live Data
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${metric.bgColor} rounded-xl`}>
                    <div className={metric.color}>
                      {metric.icon}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  {metric.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Inventory Status */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Inventory & Operations</h2>
            <div className="ml-3 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
              Status
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {inventoryStatus.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${metric.bgColor} border ${metric.borderColor}`}>
                    <div className={metric.color}>
                      {metric.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Analytics & Insights</h2>
            <div className="ml-3 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
              Visual Data
            </div>
          </div>
          <DashboardCharts 
            salesChart={dashboardData.sales_chart}
            inventoryBreakdown={dashboardData.inventory_breakdown}
          />
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <div className="ml-3 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
              Live Feed
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Latest Updates</h3>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recent_activity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'payment' && <div className="p-2 bg-green-100 rounded-lg border border-green-200"><CreditCard className="h-4 w-4 text-green-600" /></div>}
                      {activity.type === 'vehicle' && <div className="p-2 bg-blue-100 rounded-lg border border-blue-200"><Car className="h-4 w-4 text-blue-600" /></div>}
                      {activity.type === 'auction' && <div className="p-2 bg-amber-100 rounded-lg border border-amber-200"><TrendingUp className="h-4 w-4 text-amber-600" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Critical Alerts - Only show if there are critical alerts */}
        {dashboardData.alerts.filter(alert => alert.priority === 'critical' || alert.priority === 'high').length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Important Alerts</h2>
              <div className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                Critical
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">System Notifications</h3>
                  <AlertTriangle className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.alerts
                    .filter(alert => alert.priority === 'critical' || alert.priority === 'high')
                    .slice(0, 3)
                    .map((alert) => (
                    <div key={alert.alert_id} className={`p-4 rounded-xl border-l-4 ${
                      alert.priority === 'critical' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'
                    }`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {alert.priority === 'critical' ? 
                            <AlertTriangle className="h-5 w-5 text-red-500" /> : 
                            <Clock className="h-5 w-5 text-orange-500" />
                          }
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">{alert.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
