import { api, API_ENDPOINTS } from '../config/api';
import { AxiosError } from 'axios';

interface AuctionPurchase {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin: string;
  exterior_color: string;
  interior_color: string;
  transmission: string;
  body_type: string;
  description: string;
  status: string;
  condition: string;
  fuel_type: string;
  engine: string;
  stock_number: string;
  location: string;
  carfax_link: string;
  purchase_price: number;
  purchase_date: string;
  additional_costs: number;
  list_price: number;
  sold_price: number | null;
  notes: string;
  images: string[];
  primary_image_index: number;
  features: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ErrorResponse {
  message: string;
  error?: string;
}

interface AddAuctionPurchaseResponse {
  success: boolean;
  purchase?: AuctionPurchase;
  error?: string;
}

interface GetAuctionPurchasesResponse {
  success: boolean;
  purchases?: AuctionPurchase[];
  pagination?: any;
  error?: string;
}

interface AuctionDashboardResponse {
  success: boolean;
  data?: {
    totalInvestment: number;
    totalProfit: number;
    vehiclesPurchased: number;
    vehiclesSold: number;
    avgDaysToSell: string;
    ageAnalysis: Array<{
      ageRange: string;
      count: number;
      totalInvestment: string;
    }>;
    recentActivity: Array<{
      auctionId: number;
      purchaseDate: string;
      purchasePrice: string;
      additionalCosts: string;
      soldPrice: string | null;
      listPrice: string;
      make: string;
      model: string;
      year: number;
      status: string;
      vin: string;
      primaryImage: string | null;
      profit: string;
    }>;
    profitByMonth: Array<{
      month: string;
      vehiclesPurchased: string;
      vehiclesSold: string;
      totalPurchaseAmount: string;
      totalAdditionalCosts: string;
      totalSalesAmount: string;
      profit: string;
    }>;
  };
  error?: string;
}

const mapBackendAuctionPurchase = (v: any): AuctionPurchase => ({
  id: v.auction_id?.toString() || v.id?.toString(),
  make: v.make || '',
  model: v.model || '',
  year: parseInt(v.year) || 0,
  mileage: parseInt(v.mileage) || 0,
  vin: v.vin || '',
  exterior_color: v.exterior_color || '',
  interior_color: v.interior_color || '',
  transmission: v.transmission || '',
  body_type: v.body_type || '',
  description: v.description || '',
  status: v.status || '',
  condition: v.condition || '',
  fuel_type: v.fuel_type || '',
  engine: v.engine || '',
  stock_number: v.stock_number || '',
  location: v.location || '',
  carfax_link: v.carfax_link || '',
  purchase_price: parseFloat(v.purchase_price) || 0,
  purchase_date: v.purchase_date || '',
  additional_costs: parseFloat(v.additional_costs || '0'),
  list_price: parseFloat(v.list_price || '0'),
  sold_price: v.sold_price ? parseFloat(v.sold_price) : null,
  notes: v.notes || '',
  images: Array.isArray(v.images) ? v.images : [],
  primary_image_index: parseInt(v.primary_image_index) || 0,
  features: Array.isArray(v.features) ? v.features : [],
  tags: Array.isArray(v.tags) ? v.tags : [],
  created_at: v.created_at || '',
  updated_at: v.updated_at || ''
});

export const addAuctionPurchase = async (purchaseData: FormData): Promise<AddAuctionPurchaseResponse> => {
  try {
    console.log('Sending auction purchase data to backend...');
    
    const response = await api.post(API_ENDPOINTS.ADD_AUCTION_PURCHASE, purchaseData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Backend response:', response.data);
    
    if (response.data.success === true) {
      return { 
        success: true, 
        purchase: response.data.data ? mapBackendAuctionPurchase(response.data.data) : undefined 
      };
    } else {
      return { 
        success: false, 
        error: response.data.message || response.data.error || 'Failed to add auction purchase' 
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Add auction purchase error:', axiosError.response?.data);
    
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.response?.data?.error || 'Failed to add auction purchase'
    };
  }
};

export const getAuctionPurchases = async (filters?: Record<string, any>): Promise<GetAuctionPurchasesResponse> => {
  try {
    const response = await api.get(API_ENDPOINTS.FETCH_AUCTION_PURCHASES, { params: filters });
    
    console.log('Get auction purchases response:', response.data);
    
    // Handle different response structures
    if (response.data.success && response.data.data) {
      // Check if data has vehicles or purchases
      const vehicles = Array.isArray(response.data.data.vehicles) 
        ? response.data.data.vehicles.map(mapBackendAuctionPurchase)
        : Array.isArray(response.data.data.purchases)
        ? response.data.data.purchases.map(mapBackendAuctionPurchase)
        : [];
      
      console.log('Mapped vehicles:', vehicles);
      
      return { 
        success: true, 
        purchases: vehicles,
        pagination: response.data.data.pagination
      };
    } else if (response.data.status === 'success' && response.data.data) {
      // Fallback for old format
      const vehicles = Array.isArray(response.data.data.vehicles) 
        ? response.data.data.vehicles.map(mapBackendAuctionPurchase)
        : [];
      
      console.log('Mapped vehicles (fallback):', vehicles);
      
      return { 
        success: true, 
        purchases: vehicles,
        pagination: response.data.data.pagination
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch auction purchases'
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.response?.data?.error || 'Failed to fetch auction purchases'
    };
  }
};

export const getAuctionDashboard = async (): Promise<AuctionDashboardResponse> => {
  try {
    const response = await api.get(API_ENDPOINTS.AUCTION_DASHBOARD_SUMMARY);
    
    if (response.data.status === 'success') {
      return { 
        success: true, 
        data: {
          totalInvestment: response.data.data.summary.total_investment,
          totalProfit: response.data.data.summary.total_profit,
          vehiclesPurchased: response.data.data.summary.vehicles_purchased,
          vehiclesSold: response.data.data.summary.vehicles_sold,
          avgDaysToSell: response.data.data.summary.avg_days_to_sell,
          ageAnalysis: response.data.data.age_analysis.map((item: any) => ({
            ageRange: item.age_range,
            count: item.count,
            totalInvestment: item.total_investment
          })),
          recentActivity: response.data.data.recent_transactions.map((item: any) => ({
            auctionId: item.auction_id,
            purchaseDate: item.purchase_date,
            purchasePrice: item.purchase_price,
            additionalCosts: item.additional_costs,
            soldPrice: item.sold_price,
            listPrice: item.list_price,
            make: item.make,
            model: item.model,
            year: item.year,
            status: item.status,
            vin: item.vin,
            primaryImage: item.primary_image,
            profit: item.profit
          })),
          profitByMonth: response.data.data.profit_by_month.map((item: any) => ({
            month: item.month,
            vehiclesPurchased: item.vehicles_purchased,
            vehiclesSold: item.vehicles_sold,
            totalPurchaseAmount: item.total_purchase_amount,
            totalAdditionalCosts: item.total_additional_costs,
            totalSalesAmount: item.total_sales_amount,
            profit: item.profit
          }))
        }
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch auction dashboard'
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error fetching auction dashboard:', axiosError.response?.data);
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.response?.data?.error || 'Failed to fetch auction dashboard'
    };
  }
};

export const updateAuctionPurchase = async (purchaseData: FormData): Promise<AddAuctionPurchaseResponse> => {
  try {
    const auctionId = purchaseData.get('id') as string;
    if (!auctionId) {
      return { success: false, error: 'Auction ID is required for update' };
    }

    // Keep id in formData as it's needed in the backend
    const response = await api.put(`${API_ENDPOINTS.UPDATE_AUCTION_PURCHASE()}?auction_id=${auctionId}`, purchaseData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Update auction purchase response:', response.data);
    
    if (response.data.success === true || response.data.status === 'success') {
      return { success: true, purchase: mapBackendAuctionPurchase(response.data.data) };
    } else {
      return { success: false, error: response.data.message || 'Failed to update auction purchase' };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Update auction purchase error:', axiosError.response?.data);
    
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.response?.data?.error || 'Failed to update auction purchase'
    };
  }
};

export const deleteAuctionPurchase = async (auctionId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await api.delete(API_ENDPOINTS.DELETE_AUCTION_PURCHASE(auctionId));
    
    if (response.data.status === 'success') {
      return { success: true };
    } else {
      return { success: false, error: response.data.message || 'Failed to delete auction purchase' };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.response?.data?.error || 'Failed to delete auction purchase'
    };
  }
};

export const getAuctionById = async (auctionId: string): Promise<{ success: boolean; purchase?: AuctionPurchase; error?: string }> => {
  try {
    // Validate that the ID is a positive number
    const numericId = parseInt(auctionId, 10);
    if (isNaN(numericId) || numericId <= 0) {
      return {
        success: false,
        error: 'Invalid auction ID. Please provide a valid positive numeric ID.'
      };
    }

    const response = await api.get(API_ENDPOINTS.AUCTION_DETAILS(auctionId));
    
    if (response.data.status === 'success' && response.data.data) {
      return { 
        success: true, 
        purchase: mapBackendAuctionPurchase(response.data.data)
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch auction details'
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.response?.data?.error || 'Failed to fetch auction details'
    };
  }
};

export const getAuctions = async (params?: any) => {
  try {
    const response = await api.get('/auctions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return { success: false, error: 'Failed to fetch auctions' };
  }
};

export const deleteAuction = async (id: string) => {
  try {
    const response = await api.delete(`/auctions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting auction:', error);
    return { success: false, error: 'Failed to delete auction' };
  }
};