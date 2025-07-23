import { api, API_ENDPOINTS, handleApiError } from '../config/api';

export interface BusinessSettings {
    businessName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    businessHours: {
        [key: string]: { open: string | null; close: string | null; }
    };
    socialMedia: {
        facebook: string;
        twitter: string;
        instagram: string;
        linkedin: string;
    };
    updatedBy?: number;
    createdAt?: string;
    updatedAt?: string;
}

export const getBusinessSettings = async (): Promise<BusinessSettings> => {
    try {
        const response = await api.get(API_ENDPOINTS.BUSINESS_SETTINGS);
        if (!response.data?.data) {
            throw new Error('Invalid response format');
        }
        return response.data.data;
    } catch (error) {
        console.error('Error fetching business settings:', error);
        throw new Error(handleApiError(error));
    }
};

export const updateBusinessSettings = async (settings: Partial<BusinessSettings>): Promise<BusinessSettings> => {
    try {
        const response = await api.put(API_ENDPOINTS.UPDATE_BUSINESS_SETTINGS, settings);
        if (!response.data?.data) {
            throw new Error('Invalid response format');
        }
        return response.data.data;
    } catch (error) {
        console.error('Error updating business settings:', error);
        throw new Error(handleApiError(error));
    }
}; 