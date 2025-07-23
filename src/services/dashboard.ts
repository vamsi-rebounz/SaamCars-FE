import { api, API_ENDPOINTS, handleApiError } from '../config/api';
import { AxiosError } from 'axios';

export interface DashboardStats {
  summary: {
    total_vehicles: number;
    available_vehicles: number;
    sold_vehicles: number;
    total_users: number;
    new_users_this_month: number;
    total_revenue: number;
    revenue_this_month: number;
    total_payments: number;
    pending_payments: number;
    auction_investment: number;
    auction_profit: number;
    vehicles_purchased: number;
    vehicles_sold: number;
    total_appointments: number;
    upcoming_appointments: number;
    test_drives: number;
    service_appointments: number;
  };
  inventory_breakdown: Array<{
    category: string;
    count: number;
    total_value: string;
  }>;
  sales_chart: Array<{
    week: string;
    sales_count: number;
    sales_amount: string;
  }>;
  recent_activity: Array<{
    type: string;
    id: number;
    description: string;
    timestamp: string;
    status: string;
  }>;
  alerts: Array<{
    alert_id: number;
    type: string;
    priority: string;
    title: string;
    message: string;
    created_at: string;
  }>;
  date_range: {
    from: string;
    to: string;
  };
}

interface DashboardResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

export const getDashboardStats = async (dateRange?: { start_date?: string; end_date?: string }): Promise<DashboardResponse> => {
  try {
    const response = await api.get(API_ENDPOINTS.DASHBOARD_STATS, {
      params: dateRange
    });

    if (response.data?.status === 'success') {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        error: response.data?.message || 'Failed to fetch dashboard statistics'
      };
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    const axiosError = error as AxiosError;
    return {
      success: false,
      error: handleApiError(axiosError)
    };
  }
}; 