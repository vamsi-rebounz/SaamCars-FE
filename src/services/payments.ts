import { api, API_ENDPOINTS } from '../config/api';
import { AxiosError } from 'axios';

interface CheckoutSession {
  url: string;
  sessionId: string;
  type: 'purchase' | 'hold';
  amount: number;
}

interface CreateCheckoutSessionParams {
  vehicleId: string;
  userId: string;
  amount?: number;
  type: 'purchase' | 'hold';
}

export const createCheckoutSession = async ({
  vehicleId,
  userId,
  amount,
  type = 'purchase'
}: CreateCheckoutSessionParams): Promise<CheckoutSession> => {
  try {
    const response = await api.post(API_ENDPOINTS.CREATE_CHECKOUT_SESSION, {
      vehicle_id: vehicleId,
      user_id: userId,
      amount,
      type
    });
    
    if (!response.data?.url) {
      throw new Error('Invalid response from server');
    }
    
    return {
      url: response.data.url,
      sessionId: response.data.sessionId,
      type: response.data.type,
      amount: response.data.amount
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Payment failed');
    }
  }
};

// Create vehicle purchase checkout session
export const createVehiclePurchaseSession = async (vehicleId: string, userId: string): Promise<CheckoutSession> => {
  return createCheckoutSession({
    vehicleId,
    userId,
    type: 'purchase'
  });
};

// Create vehicle hold checkout session
export const createVehicleHoldSession = async (vehicleId: string, userId: string, depositAmount?: number): Promise<CheckoutSession> => {
  return createCheckoutSession({
    vehicleId,
    userId,
    amount: depositAmount,
    type: 'hold'
  });
};

export const verifyVin = async (lastFourDigits: string) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.VEHICLES}?vin=${lastFourDigits}`);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as any;
    return { success: false, error: axiosError.response?.data?.message || 'VIN verification failed' };
  }
};

// Fetch all payments with optional filters
export const fetchPayments = async (filters?: Record<string, any>) => {
  try {
    const response = await api.get(API_ENDPOINTS.PAYMENTS_ADMIN, { params: filters });
    return response.data; // Return the response directly since it already has the correct structure
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return { success: false, error: axiosError.response?.data?.message || 'Failed to fetch payments' };
  }
};

// Add a manual payment
export const addManualPayment = async (data: {
  user_id?: string;
  amount: number;
  payment_method: string;
  description: string;
  related_appointment_id?: number;
  related_appointment_type?: string;
  vehicle_id?: number;
  service_id?: number;
  status: string;
  date?: string;
  is_manual?: boolean;
  customer_data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}) => {
  try {
    const payload = { ...data, is_manual: true };
    const response = await api.post(API_ENDPOINTS.ADD_MANUAL_PAYMENT, payload);
    return response.data; // Return the response directly since it already has the correct structure
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return { success: false, error: axiosError.response?.data?.message || 'Failed to add manual payment' };
  }
};

// Update a payment
export const updatePayment = async (paymentId: string, data: {
  user_id?: string;
  amount: number;
  payment_method: string;
  description: string;
  related_appointment_id?: number;
  related_appointment_type?: string;
  vehicle_id?: number;
  service_id?: number;
  status: string;
  date?: string;
  is_manual?: boolean;
  customer_data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}) => {
  try {
    const payload = { ...data, is_manual: true };
    const response = await api.put(`${API_ENDPOINTS.PAYMENTS_ADMIN}/${paymentId}`, payload);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return { success: false, error: axiosError.response?.data?.message || 'Failed to update payment' };
  }
};

// Delete a payment
export const deletePayment = async (paymentId: string) => {
  try {
    const response = await api.delete(`${API_ENDPOINTS.PAYMENTS_ADMIN}/${paymentId}`);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return { success: false, error: axiosError.response?.data?.message || 'Failed to delete payment' };
  }
};

// Check if user has made a deposit payment for a specific vehicle
export const checkUserDepositPayment = async (vehicleId: string, userId: string) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.PAYMENTS_ADMIN}`, {
      params: {
        vehicle_id: vehicleId,
        user_id: userId,
        type: 'hold',
        status: 'completed',
        limit: 1
      }
    });
    
    if (response.data?.payments?.length > 0) {
      const depositPayment = response.data.payments[0];
      return {
        hasDeposit: true,
        depositAmount: depositPayment.amount,
        depositDate: depositPayment.date,
        paymentId: depositPayment.id
      };
    }
    
    return { hasDeposit: false };
  } catch (error: unknown) {
    console.error('Error checking deposit payment:', error);
    return { hasDeposit: false };
  }
};

// Get remaining balance for a vehicle after deposit payment
export const getRemainingBalance = async (vehicleId: string, userId: string, vehiclePrice: number) => {
  try {
    const depositInfo = await checkUserDepositPayment(vehicleId, userId);
    if (depositInfo.hasDeposit && depositInfo.depositAmount) {
      return vehiclePrice - depositInfo.depositAmount;
    }
    return vehiclePrice;
  } catch (error: unknown) {
    console.error('Error calculating remaining balance:', error);
    return vehiclePrice;
  }
};