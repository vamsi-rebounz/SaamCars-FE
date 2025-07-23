export interface Vehicle {
  id: string | number;
  make: string;
  model: string;
  year: number;
  price: number;
  sold_price?: number;
  mileage?: number;
  vin?: string;
  exterior_color?: string;
  interior_color?: string;
  transmission?: string;
  body_type?: string;
  fuel_type?: string;
  engine?: string;
  condition?: string;
  features?: string[];
  tags?: string[];
  images: string[];
  status: string;
  description?: string;
  stock_number?: string;
  location?: string;
  is_featured?: boolean;
  carfax_link?: string;
  created_at?: string;
  updated_at?: string;
} 