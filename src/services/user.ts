import { api, API_ENDPOINTS } from '../config/api';
import { AxiosError } from 'axios';

interface User {
  userId: string | number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  driverLicense?: string;
  dateOfBirth?: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersResponse {
  status: 'success' | 'error';
  data?: {
    users: User[];
  };
  message?: string;
}

interface ErrorResponse {
  status: 'error';
  message: string;
}

export const fetchAllUsers = async () => {
  try {
    const response = await api.get<UsersResponse>(API_ENDPOINTS.USERS_LIST);
    if (response.data.status === 'success' && response.data.data?.users) {
      return {
        success: true,
        users: response.data.data.users.map(user => ({
          ...user,
          name: `${(user as any).firstName || (user as any).first_name || ''} ${(user as any).lastName || (user as any).last_name || ''}`.trim() || 'Unknown User',
          displayName: `${(user as any).firstName || (user as any).first_name || ''} ${(user as any).lastName || (user as any).last_name || ''}`.trim() ? `${(user as any).firstName || (user as any).first_name || ''} ${(user as any).lastName || (user as any).last_name || ''} (${user.email})` : user.email
        }))
      };
    }
    throw new Error(response.data.message || 'Failed to fetch users');
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.message || 'Failed to fetch users',
      users: []
    };
  }
};

export const fetchUserById = async (userId: string | number) => {
  try {
    const response = await api.get<UsersResponse>(`${API_ENDPOINTS.USER_PROFILE}/${userId}`);
    
    if (response.data.status === 'success' && response.data.data?.users) {
      return response.data.data.users;
    }
    
    throw new Error(response.data.message || 'Failed to fetch user');
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.message || 'Failed to fetch user'
    };
  }
}; 