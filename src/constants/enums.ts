// User Roles
export const USER_ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin'
} as const;

// Appointment Statuses
export const APPOINTMENT_STATUSES = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled'
} as const;

// Payment Statuses
export const PAYMENT_STATUSES = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
} as const;

// Vehicle Statuses
export const VEHICLE_STATUSES = {
    AVAILABLE: 'available',
    SOLD: 'sold',
    UNDER_MAINTENANCE: 'under_maintenance',
    UNDER_INSPECTION: 'under_inspection',
    RESERVED: 'reserved'
} as const;

// Vehicle Conditions
export const VEHICLE_CONDITIONS = {
    NEW: 'new',
    USED: 'used',
    CERTIFIED_PRE_OWNED: 'certified_pre_owned',
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair'
} as const;

// Service Categories
export const SERVICE_CATEGORIES = {
    MAINTENANCE: 'maintenance',
    REPAIR: 'repair',
    INSPECTION: 'inspection',
    DETAILING: 'detailing',
    TIRE_SERVICE: 'tire_service'
} as const;

// Contact Methods
export const CONTACT_METHODS = {
    EMAIL: 'email',
    PHONE: 'phone',
    SMS: 'sms',
    WHATSAPP: 'whatsapp'
} as const;

// Fuel Types
export const FUEL_TYPES = {
    GASOLINE: 'gasoline',
    DIESEL: 'diesel',
    ELECTRIC: 'electric',
    HYBRID: 'hybrid',
    PLUG_IN_HYBRID: 'plug_in_hybrid'
} as const;

// Transmission Types
export const TRANSMISSION_TYPES = {
    MANUAL: 'manual',
    AUTOMATIC: 'automatic',
    CVT: 'cvt',
    AMT: 'amt',
    DCT: 'dct',
    DSG: 'dsg',
    SEMI_AUTOMATIC: 'semi_automatic',
    IVT: 'ivt',
    HYDROSTATIC: 'hydrostatic',
    MMT: 'mmt',
    HYBIRD: 'hybird',
    TORQUE_CONVERTER: 'torque_converter',
    TIP_TRONIC: 'tip_tronic'
} as const;

// Body Types
export const BODY_TYPES = {
    SPORTS: 'sports',
    SEDAN: 'sedan',
    HATCHBACK: 'hatchback',
    SUV: 'suv',
    COUPE: 'coupe',
    CONVERTIBLE: 'convertible',
    VAN: 'van',
    MINIVAN: 'minivan',
    WAGON: 'wagon',
    PICKUP_TRUCK: 'pickup_truck',
    CARGO_VAN: 'cargo_van',
    BUS: 'bus'
} as const;

// Type helpers for better TypeScript support
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type AppointmentStatus = typeof APPOINTMENT_STATUSES[keyof typeof APPOINTMENT_STATUSES];
export type PaymentStatus = typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES];
export type VehicleStatus = typeof VEHICLE_STATUSES[keyof typeof VEHICLE_STATUSES];
export type VehicleCondition = typeof VEHICLE_CONDITIONS[keyof typeof VEHICLE_CONDITIONS];
export type ServiceCategory = typeof SERVICE_CATEGORIES[keyof typeof SERVICE_CATEGORIES];
export type ContactMethod = typeof CONTACT_METHODS[keyof typeof CONTACT_METHODS];
export type FuelType = typeof FUEL_TYPES[keyof typeof FUEL_TYPES];
export type TransmissionType = typeof TRANSMISSION_TYPES[keyof typeof TRANSMISSION_TYPES];
export type BodyType = typeof BODY_TYPES[keyof typeof BODY_TYPES]; 