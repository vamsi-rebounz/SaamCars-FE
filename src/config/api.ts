import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration and refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Try to refresh the token
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await api.post('/auth/refresh-token', { refreshToken });
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                    
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    
                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axios(originalRequest);
                } catch (refreshError) {
                    // If refresh fails, logout
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const handleApiError = (error: any) => {
    if (error.response) {
        console.error('API Error Response:', error.response.data);
        return error.response.data.message || 'An error occurred';
    } else if (error.request) {
        console.error('API Error Request:', error.request);
        return 'No response from server';
    } else {
        console.error('API Error:', error.message);
        return error.message;
    }
};

export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
    REQUEST_VERIFICATION: '/auth/request-verification',
    VERIFY_EMAIL: '/auth/verify-email',
    
    // Users
    USER_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile/update',
    USERS_LIST: '/users/list',
    USER_STATUS: (userId: string) => `/users/${userId}/status`,
    
    // Vehicles
    VEHICLES: '/vehicles',
    VEHICLE_DETAILS: (id: string) => `/vehicles/${id}`,
    
    // Inventory
    INVENTORY: '/inventory',
    INVENTORY_ITEM: (id: string) => `/inventory/${id}`,
    ADD_VEHICLE: '/inventory/add-vehicle',
    UPDATE_VEHICLE: (id: string) => `/inventory/vehicles/update?id=${id}`,
    DELETE_VEHICLE: (id: string) => `/inventory/vehicles/delete/${id}`,
    
    // Auction
    AUCTIONS: '/auction-tracker',
    AUCTION_DETAILS: (id: string) => `/auction-tracker/${id}`,
    AUCTION_DASHBOARD: '/auction-tracker/dashboard',
    AUCTION_DASHBOARD_SUMMARY: '/auction-tracker/dashboard-summary',
    ADD_AUCTION_PURCHASE: '/auction-tracker/add-new',
    UPDATE_AUCTION_PURCHASE: () => `/auction-tracker/update`,
    DELETE_AUCTION_PURCHASE: (id: string) => `/auction-tracker/delete/${id}`,
    FETCH_AUCTION_PURCHASES: '/auction-tracker/fetch-all',
    
    // Payments
    CREATE_CHECKOUT_SESSION: '/payments/create-checkout-session',
    PAYMENTS_ADMIN: '/payments/admin',
    ADD_MANUAL_PAYMENT: '/payments/admin/manual',

    // Wishlist
    WISHLIST: '/wishlist',
    WISHLIST_ITEM: (id: number) => `/wishlist/${id}`,
    CHECK_WISHLIST: (id: number) => `/wishlist/check/${id}`,

    // Business Settings
    BUSINESS_SETTINGS: '/business-settings',
    UPDATE_BUSINESS_SETTINGS: '/business-settings',

    // Dashboard
    DASHBOARD_STATS: '/dashboard/stats'
};