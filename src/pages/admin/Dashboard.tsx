import React, { useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '../../services/dashboard';
import DashboardCharts from '../../components/admin/DashboardCharts';
import AlertState from '../../components/ErrorState';
import {
  DollarSign,
  Car,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Tag,
  BarChart3,
  Award,
  Target,
  Percent,
  Users,
  AlertTriangle,
  TrendingDown
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

  // Key Business Metrics
  const keyMetrics = [
    {
      title: 'Total Revenue',
      value: `$${dashboardData.summary.total_revenue.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-green-600 to-green-700',
      subtitle: `$${dashboardData.summary.revenue_this_month.toLocaleString()} this month`
    },
    {
      title: 'Total Profit',
      value: `$${dashboardData.summary.total_profit.toLocaleString()}`,
      icon: dashboardData.summary.total_profit >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />,
      color: dashboardData.summary.profit_margin >= 0 ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' : 'bg-gradient-to-r from-red-600 to-red-700',
      subtitle: `${dashboardData.summary.profit_margin >= 0 ? '+' : ''}${dashboardData.summary.profit_margin}% ROI`
    },
    {
      title: 'Inventory Value',
      value: `$${dashboardData.summary.total_inventory_value.toLocaleString()}`,
      icon: <Tag className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-purple-600 to-purple-700',
      subtitle: 'Available vehicles'
    },
    {
      title: 'Total Vehicles',
      value: dashboardData.summary.total_vehicles.toString(),
      icon: <Car className="h-6 w-6" />,
      color: 'bg-gradient-to-r from-blue-600 to-blue-700',
      subtitle: `${dashboardData.summary.available_vehicles} available`
    }
  ];

  // Profit Breakdown
  const profitBreakdown = [
    {
      title: 'Auction Profit',
      value: `$${dashboardData.summary.auction_profit.toLocaleString()}`,
      icon: <Award className="h-6 w-6" />,
      color: dashboardData.summary.auction_roi >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: dashboardData.summary.auction_roi >= 0 ? 'bg-green-100' : 'bg-red-100',
      borderColor: dashboardData.summary.auction_roi >= 0 ? 'border-green-200' : 'border-red-200',
      subtitle: `${dashboardData.summary.auction_vehicles_sold} vehicles • ${dashboardData.summary.auction_roi >= 0 ? '+' : ''}${dashboardData.summary.auction_roi}% ROI`
    },
    {
      title: 'Individual Profit',
      value: `$${dashboardData.summary.individual_profit.toLocaleString()}`,
      icon: <Users className="h-6 w-6" />,
      color: dashboardData.summary.individual_roi >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: dashboardData.summary.individual_roi >= 0 ? 'bg-blue-100' : 'bg-red-100',
      borderColor: dashboardData.summary.individual_roi >= 0 ? 'border-blue-200' : 'border-red-200',
      subtitle: `${dashboardData.summary.individual_vehicles_sold} vehicles • ${dashboardData.summary.individual_roi >= 0 ? '+' : ''}${dashboardData.summary.individual_roi}% ROI`
    }
  ];



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

        {/* Key Business Metrics */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Key Business Metrics</h2>
            <div className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              Overview
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric, index) => (
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
                    <p className={`text-xs ${metric.title === 'Total Profit' ? (dashboardData.summary.profit_margin >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                      {metric.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Breakdown */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Profit Breakdown</h2>
            <div className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Analysis
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profitBreakdown.map((metric, index) => (
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
                    <p className={`text-xs mt-1 ${
                      metric.title === 'Auction Profit' ? 
                        (dashboardData.summary.auction_roi >= 0 ? 'text-green-600' : 'text-red-600') :
                      metric.title === 'Individual Profit' ? 
                        (dashboardData.summary.individual_roi >= 0 ? 'text-blue-600' : 'text-red-600') :
                      'text-gray-500'
                    }`}>
                      {metric.subtitle}
                    </p>
                  )}
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
            vehicleTypeDistribution={dashboardData.vehicle_type_distribution}
          />
        </div>


      </div>
    </div>
  );
};

export default Dashboard;
