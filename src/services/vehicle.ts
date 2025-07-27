import { api, API_ENDPOINTS } from '../config/api';
import { AxiosError } from 'axios';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  vin: string;
  exterior_color?: string;
  interior_color?: string;
  transmission?: string;
  body_type?: string;
  fuel_type?: string;
  engine?: string;
  condition?: string;
  status: string;
  description: string;
  features?: string[];
  tags?: string[];
  images: string[];
  location?: string;
  is_featured?: boolean;
  stock_number?: string;
  created_at?: string;
  updated_at?: string;
  carfax_link?: string;
  available?: boolean;
}

interface ErrorResponse {
  message: string;
  error?: string;
}

interface GetVehicleResponse {
  success: boolean;
  vehicle?: Vehicle;
  error?: string;
}

const mapBackendVehicle = (v: any): Vehicle => ({
  id: v.vehicle_id?.toString() || v.id?.toString(),
  make: v.make,
  model: v.model,
  year: v.year,
  price: parseFloat(v.price),
  mileage: v.mileage,
  vin: v.vin,
  exterior_color: v.exterior_color || '',
  interior_color: v.interior_color || '',
  transmission: v.transmission || '',
  body_type: v.body_type || '',
  fuel_type: v.fuel_type || '',
  engine: v.engine || '',
  condition: v.condition || '',
  status: v.status || 'available',
  description: v.description || '',
  features: Array.isArray(v.features) ? v.features : (v.features ? JSON.parse(v.features) : []),
  tags: Array.isArray(v.tags) ? v.tags : (v.tags ? JSON.parse(v.tags) : []),
  images: Array.isArray(v.images) ? v.images : (v.images ? JSON.parse(v.images) : []),
  location: v.location || '',
  is_featured: v.is_featured || false,
  stock_number: v.stock_number || '',
  created_at: v.created_at,
  updated_at: v.updated_at,
  carfax_link: v.carfax_link || '',
  available: v.available || false,
});

export const getVehicleById = async (vehicleId: string): Promise<GetVehicleResponse> => {
  try {
    const response = await api.get(API_ENDPOINTS.VEHICLE_DETAILS(vehicleId));
    
    if (response.data.status === 'success' && response.data.data) {
      return { success: true, vehicle: mapBackendVehicle(response.data.data) };
    } else {
      return { 
        success: false, 
        error: response.data.message || 'Failed to fetch vehicle details' 
      };
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.message || axiosError.response?.data?.error || 'Failed to fetch vehicle details'
    };
  }
};