import { api, API_ENDPOINTS, handleApiError } from '../config/api';
import { AxiosError } from 'axios';

export interface DashboardStats {
  summary: {
    // Financial Metrics
    total_revenue: number;
    revenue_this_month: number;
    total_profit: number;
    profit_this_month: number;
    profit_margin: number;
    
    // Inventory Metrics
    total_vehicles: number;
    available_vehicles: number;
    total_inventory_value: number;
    average_days_on_lot: number;
    
    // Payment Metrics
    total_payments: number;
    pending_payments: number;
    outstanding_amount: number;
    
    // Profit Breakdown
    auction_profit: number;
    auction_roi: number;
    auction_vehicles_sold: number;
    individual_profit: number;
    individual_roi: number;
    individual_vehicles_sold: number;
    auction_investment: number;
  };
  vehicle_type_distribution: Array<{
    type: string;
    count: number;
  }>;
  sales_chart: Array<{
    week: string;
    sales_count: number;
    sales_amount: string;
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