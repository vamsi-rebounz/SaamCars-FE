export interface Payment {
  id: string;
  user_id?: string | number;
  customer?: string;
  email?: string;
  amount: number;
  description: string;
  type: 'purchase' | 'hold' | 'service' | 'manual' | string; // Updated to include new types
  date: string;
  status: string;
  payment_method?: string;
  paymentMethod?: string;
  transactionId?: string;
  receiptUrl?: string;
  is_manual?: boolean;
  is_stripe?: boolean;
  vehicle_id?: string | number;
  service_id?: string | number;
  vehicle?: {
    id: string | number;
    make?: string | null;
    model?: string | null;
    year?: number | null;
    stockNumber?: string | null;
    vin?: string | null;
    status?: string | null;
  };
  customer_data?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

// Payment type constants
export const PAYMENT_TYPES = {
  PURCHASE: 'purchase',
  HOLD: 'hold',
  SERVICE: 'service',
  MANUAL: 'manual'
} as const;

// Payment status constants
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const; 