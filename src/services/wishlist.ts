import { api } from '../config/api';

export interface WishlistVehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string;
  mileage: number;
  exterior_color: string;
  interior_color: string;
  transmission: string;
  fuel_type: string;
  body_type: string;
  vin: string;
  condition: string;
  status: string;
  description: string;
  images: string[];
  tags: string[];
  features: string[];
  carfax_link?: string;
  available: boolean;
  added_to_wishlist_at: string;
}

export interface WishlistResponse {
  success: boolean;
  vehicles?: WishlistVehicle[];
  message?: string;
}

export interface WishlistCheckResponse {
  isInWishlist: boolean;
  message?: string;
}

export const getWishlist = async (): Promise<WishlistResponse> => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return {
      success: false,
      message: 'Failed to fetch wishlist'
    };
  }
};

export const checkWishlist = async (vehicleId: string): Promise<WishlistCheckResponse> => {
  try {
    const response = await api.get(`/wishlist/check/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return { isInWishlist: false };
  }
};

export const addToWishlist = async (vehicleId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/wishlist/add', { vehicleId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (vehicleId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/wishlist/remove/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}; 