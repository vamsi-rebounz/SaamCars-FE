import {
  AlertCircle,
  Car,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Search,
  User,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getInventory } from '../../services/inventory';
import { addManualPayment, updatePayment } from '../../services/payments';
import { fetchAllUsers } from '../../services/user';
import { Payment } from '../../types/payment';
import { Vehicle } from '../../types/vehicle';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPayment?: Payment) => void;
  editingPayment?: Payment | null;
}

interface CustomerForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface PaymentForm {
  user_id: string;
  amount: string;
  payment_method: string;
  description: string;
  status: string;
  date: string;
  type: string;
  vehicle_id?: string;
  service_id?: string;
}

const ManualPaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  editingPayment,
}: ManualPaymentModalProps) => {
  const [step, setStep] = useState<'customer' | 'payment'>('customer');
  const [customerType, setCustomerType] = useState<'registered' | 'unregistered'>('registered');
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form states
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    user_id: '',
    amount: '',
    payment_method: 'cash',
    description: '',
    status: 'completed',
    date: new Date().toISOString().split('T')[0],
    type: 'service'
  });

  // Fetch users when modal opens and customerType is 'registered'
  useEffect(() => {
    if (isOpen && customerType === 'registered') {
      fetchUsers();
    }
  }, [isOpen, customerType]);

  // Fetch vehicles when modal opens and payment type is 'vehicle_hold' or 'vehicle_purchase'
  useEffect(() => {
    if (isOpen && (paymentForm.type === 'vehicle_hold' || paymentForm.type === 'vehicle_purchase')) {
      fetchVehicles();
    }
  }, [isOpen, paymentForm.type]);

  // Initialize form with existing payment data if editing
  useEffect(() => {
    if (isOpen && editingPayment && vehicles.length > 0) {
      initializeFormWithPayment(editingPayment);
    }
  }, [isOpen, editingPayment, vehicles]);

  const initializeFormWithPayment = (payment: Payment) => {
    // Map backend payment type to frontend form type
    let paymentType = 'service';
    if (payment.type) {
      if (payment.type.toLowerCase().includes('vehicle hold') || payment.type.toLowerCase().includes('hold')) {
        paymentType = 'vehicle_hold';
      } else if (payment.type.toLowerCase().includes('vehicle purchase') || payment.type.toLowerCase().includes('purchase')) {
        paymentType = 'vehicle_purchase';
      } else if (payment.type.toLowerCase().includes('service')) {
        paymentType = 'service';
      }
    }
    
    // Set customer type based on whether user_id exists
    if (payment.user_id) {
      setCustomerType('registered');
      setPaymentForm(prev => ({
        ...prev,
        user_id: payment.user_id?.toString() || '',
        amount: payment.amount.toString(),
        payment_method: payment.payment_method || 'cash',
        description: payment.description || '',
        status: payment.status || 'completed',
        date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: paymentType,
        vehicle_id: payment.vehicle_id?.toString() || undefined,
        service_id: payment.service_id?.toString() || undefined
      }));
    } else {
      setCustomerType('unregistered');
      if (typeof payment.customer === 'object' && payment.customer !== null) {
        setCustomerForm({
          first_name: (payment.customer as any).first_name || '',
          last_name: (payment.customer as any).last_name || '',
          email: (payment.customer as any).email || '',
          phone: (payment.customer as any).phone || ''
        });
      } else {
        setCustomerForm({
          first_name: '',
          last_name: '',
          email: '',
          phone: ''
        });
      }
      setPaymentForm(prev => ({
        ...prev,
        amount: payment.amount.toString(),
        payment_method: payment.payment_method || 'cash',
        description: payment.description || '',
        status: payment.status || 'completed',
        date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: paymentType,
        vehicle_id: payment.vehicle_id?.toString() || undefined,
        service_id: payment.service_id?.toString() || undefined
      }));
    }
    
    // Set selected vehicle if vehicle_id exists
    if (payment.vehicle_id) {
      // First, try to find the vehicle in the vehicles list
      const vehicle = vehicles.find(v => v.id === payment.vehicle_id || v.id.toString() === payment.vehicle_id?.toString());
      if (vehicle) {
        setSelectedVehicle(vehicle);
      } else {
        // Create a virtual vehicle object from payment data for display
        if (payment.vehicle) {
          const virtualVehicle = {
            id: payment.vehicle_id,
            make: payment.vehicle.make || 'Unknown',
            model: payment.vehicle.model || 'Unknown',
            year: payment.vehicle.year || 'Unknown',
            stock_number: payment.vehicle.stockNumber || 'N/A',
            vin: payment.vehicle.vin || 'N/A',
            price: 0, // Default price for virtual vehicle
            status: payment.vehicle.status || 'unknown',
            images: [],
            mileage: 0,
            exterior_color: 'Unknown',
            transmission: 'Unknown',
            fuel_type: 'Unknown',
            body_type: 'Unknown'
          };
          // Ensure 'year' is a number for Vehicle type compatibility
          if (typeof virtualVehicle.year === 'string') {
            virtualVehicle.year = parseInt(virtualVehicle.year) || 0;
          }
          setSelectedVehicle(virtualVehicle as Vehicle);
        } else {
          // If no vehicle data in payment, create a basic virtual vehicle
          const basicVirtualVehicle = {
            id: payment.vehicle_id,
            make: 'Unknown',
            model: 'Unknown',
            year: 'Unknown',
            stock_number: 'N/A',
            vin: 'N/A',
            price: 0,
            status: 'unknown',
            images: [],
            mileage: 0,
            exterior_color: 'Unknown',
            transmission: 'Unknown',
            fuel_type: 'Unknown',
            body_type: 'Unknown'
          };
          // Ensure 'year' is a number for Vehicle type compatibility
          let yearValue: number = 0;
          if (typeof basicVirtualVehicle.year === 'string') {
            yearValue = parseInt(basicVirtualVehicle.year) || 0;
          } else if (typeof basicVirtualVehicle.year === 'number') {
            yearValue = basicVirtualVehicle.year;
          }
          setSelectedVehicle({
            ...basicVirtualVehicle,
            year: yearValue
          } as unknown as Vehicle);
        }
      }
    }
    // Go directly to payment step when editing
    setStep('payment');
  };

  const fetchUsers = async () => {
    try {
      const response = await fetchAllUsers();
      if (response.success) {
        setUsers(response.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      // When editing, fetch all vehicles to ensure we can find the selected vehicle
      const response = await getInventory({ 
        status: editingPayment ? 'all' : 'available', 
        limit: 100 
      });
      if (response.success && response.vehicles) {
        setVehicles(response.vehicles);
        console.log('Fetched vehicles:', response.vehicles.length);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchString = `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.stock_number} ${vehicle.vin}`.toLowerCase();
    return searchString.includes(vehicleSearchTerm.toLowerCase());
  });

  // Auto-update amount when vehicle is selected
  useEffect(() => {
    if (selectedVehicle && (paymentForm.type === 'vehicle_purchase' || paymentForm.type === 'vehicle_hold')) {
      if (paymentForm.type === 'vehicle_purchase') {
        setPaymentForm(prev => ({ ...prev, amount: selectedVehicle.price.toString() }));
      } else if (paymentForm.type === 'vehicle_hold') {
        // For vehicle hold, typically 5-10% of vehicle price
        const holdAmount = selectedVehicle.price * 0.05; // 5%
        setPaymentForm(prev => ({ ...prev, amount: holdAmount.toString() }));
      }
    }
  }, [selectedVehicle, paymentForm.type]);

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (customerType === 'unregistered') {
      // Validate customer form
      if (!customerForm.first_name || !customerForm.last_name || !customerForm.email) {
        setError('Please fill in all required customer fields');
        return;
      }
    } else {
      // Validate user selection
      if (!paymentForm.user_id) {
        setError('Please select a customer');
        return;
      }
    }
    
    setError(null);
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare payment data
      const paymentData: any = {
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        description: paymentForm.description,
        status: paymentForm.status,
        date: paymentForm.date,
        type: paymentForm.type, // Include payment type for vehicle status updates
        vehicle_id: selectedVehicle ? selectedVehicle.id : undefined,
        service_id: paymentForm.service_id ? parseInt(paymentForm.service_id) : undefined
      };

      // Add user_id or customer_data based on customer type
      if (customerType === 'registered') {
        paymentData.user_id = paymentForm.user_id ? parseInt(paymentForm.user_id) : undefined;
      } else {
        // For unregistered customers, send customer data
        paymentData.customer_data = {
          first_name: customerForm.first_name,
          last_name: customerForm.last_name,
          email: customerForm.email,
          phone: customerForm.phone || undefined
        };
      }

      let response;
      if (editingPayment) {
        console.log('Updating payment with data:', paymentData);
        response = await updatePayment(editingPayment.id, paymentData);
      } else {
        console.log('Adding new payment with data:', paymentData);
        response = await addManualPayment(paymentData);
      }

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          // Pass the updated payment data to the success callback
          if (editingPayment && response.payment) {
            onSuccess(response.payment);
          } else {
            onSuccess();
          }
          handleClose();
        }, 2000);
      } else {
        setError(response.error || `Failed to ${editingPayment ? 'update' : 'add'} payment`);
      }
    } catch (err) {
      setError(`An error occurred while ${editingPayment ? 'updating' : 'adding'} the payment`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('customer');
    setCustomerType('registered');
    setCustomerForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    });
    setPaymentForm({
      user_id: '',
      amount: '',
      payment_method: 'cash',
      description: '',
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      type: 'service'
    });
    setSelectedVehicle(null);
    setVehicleSearchTerm('');
    setError(null);
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  const isVehiclePayment = paymentForm.type === 'vehicle_purchase' || paymentForm.type === 'vehicle_hold';

  if (!isOpen) return null;

  return (
    <>
      {/* Fixed Alert Messages at Top of Page */}
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] max-w-md w-full mx-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-800">
                  {editingPayment ? 'Payment Updated Successfully!' : 'Payment Added Successfully!'}
                </h3>
                <p className="text-xs text-green-700 mt-1">
                  The payment has been recorded in the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] max-w-md w-full mx-4">
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">
                  Error
                </h3>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-xl bg-white">
          <div className="mt-3">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingPayment ? 'Edit Payment' : 'Add Manual Payment'}
                  </h2>
                  <p className="text-gray-600">
                    {editingPayment ? `Payment ID: ${editingPayment.id}` : 'Create a new manual payment record'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-sm ${
                  step === 'customer' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-green-600 border-green-600 text-white'
                }`}>
                  <CheckCircle className="h-7 w-7" />
                </div>
                <div className={`ml-4 text-sm font-semibold ${
                  step === 'customer' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  Customer Details
                </div>
              </div>
              <div className="mx-8 w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-sm ${
                  step === 'payment' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-200 border-gray-300 text-gray-600'
                }`}>
                  {step === 'payment' ? (
                    <CheckCircle className="h-7 w-7" />
                  ) : (
                    <span className="text-sm font-bold">2</span>
                  )}
                </div>
                <div className={`ml-4 text-sm font-semibold ${
                  step === 'payment' ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  Payment Details
                </div>
              </div>
            </div>

          {/* Customer Details Step */}
          {step === 'customer' && (
            <form onSubmit={handleCustomerSubmit}>
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="h-6 w-6 text-blue-600 mr-3" />
                  Customer Information
                </h4>
                
                {/* Customer Type Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Customer Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      customerType === 'registered' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}>
                      <input
                        type="radio"
                        value="registered"
                        checked={customerType === 'registered'}
                        onChange={(e) => setCustomerType(e.target.value as 'registered' | 'unregistered')}
                        className="sr-only"
                      />
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4 ${
                        customerType === 'registered' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {customerType === 'registered' && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">Registered Customer</div>
                        <div className="text-sm text-gray-600 mt-1">Select from existing customers in the system</div>
                      </div>
                    </label>
                    <label className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      customerType === 'unregistered' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}>
                      <input
                        type="radio"
                        value="unregistered"
                        checked={customerType === 'unregistered'}
                        onChange={(e) => setCustomerType(e.target.value as 'registered' | 'unregistered')}
                        className="sr-only"
                      />
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4 ${
                        customerType === 'unregistered' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {customerType === 'unregistered' && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">New Customer</div>
                        <div className="text-sm text-gray-600 mt-1">Create new customer account automatically</div>
                      </div>
                    </label>
                  </div>
                </div>

                {customerType === 'registered' ? (
                  /* Registered Customer Selection */
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Customer *
                    </label>
                    <select
                      value={paymentForm.user_id}
                      onChange={(e) => setPaymentForm({ ...paymentForm, user_id: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                      required
                    >
                      <option value="">Select a customer from the list...</option>
                      {users.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.first_name} {user.last_name} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  /* New Customer Form */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={customerForm.first_name}
                        onChange={(e) => setCustomerForm({ ...customerForm, first_name: e.target.value })}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={customerForm.last_name}
                        onChange={(e) => setCustomerForm({ ...customerForm, last_name: e.target.value })}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center shadow-sm"
                >
                  Next: Payment Details
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </form>
          )}

          {/* Payment Details Step */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                  Payment Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount ($) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-semibold">$</span>
                      </div>
                      <input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={paymentForm.payment_method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Type *
                    </label>
                    <select
                      value={paymentForm.type}
                      onChange={(e) => {
                        setPaymentForm({ ...paymentForm, type: e.target.value });
                        setSelectedVehicle(null); // Reset vehicle selection when type changes
                      }}
                      className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                      required
                    >
                      <option value="service">Service</option>
                      <option value="vehicle_purchase">Vehicle Purchase</option>
                      <option value="vehicle_hold">Vehicle Hold</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Status *
                    </label>
                    <select
                      value={paymentForm.status}
                      onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                      required
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                      required
                    />
                  </div>
                </div>

                {/* Vehicle Selection for Vehicle Payments */}
                {isVehiclePayment && (
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Vehicle *
                    </label>
                    
                    {/* Vehicle Search */}
                    <div className="mb-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search vehicles by make, model, year, stock number, or VIN..."
                          value={vehicleSearchTerm}
                          onChange={(e) => setVehicleSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Vehicle List */}
                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                      {filteredVehicles.length === 0 ? (
                        <div className="p-8 text-center">
                          <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">
                            {vehicleSearchTerm ? 'No vehicles found matching your search.' : 'No available vehicles found.'}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {vehicleSearchTerm ? 'Try adjusting your search terms.' : 'Add some vehicles to your inventory first.'}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {filteredVehicles.map((vehicle) => (
                            <div
                              key={vehicle.id}
                              onClick={() => setSelectedVehicle(vehicle)}
                              className={`p-4 cursor-pointer transition-all duration-200 ${
                                selectedVehicle?.id === vehicle.id || 
                                selectedVehicle?.id?.toString() === vehicle.id?.toString()
                                  ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm'
                                  : 'hover:bg-gray-50 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start space-x-4">
                                {/* Vehicle Image */}
                                <div className="flex-shrink-0">
                                  <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    {vehicle.images && vehicle.images.length > 0 ? (
                                      <img
                                        src={vehicle.images[0]}
                                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center ${vehicle.images && vehicle.images.length > 0 ? 'hidden' : ''}`}>
                                      <Car className="h-8 w-8 text-gray-400" />
                                    </div>
                                  </div>
                                </div>

                                {/* Vehicle Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                      </h4>
                                      {(selectedVehicle?.id === vehicle.id || 
                                        selectedVehicle?.id?.toString() === vehicle.id?.toString()) && (
                                        <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                          <CheckCircle className="h-3 w-3" />
                                          <span>Selected</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-gray-900">
                                        ${vehicle.price.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {paymentForm.type === 'vehicle_purchase' ? 'Full Price' : '5% Hold'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-500">Stock:</span>
                                        <span className="font-medium text-gray-900">{vehicle.stock_number || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-500">VIN:</span>
                                        <span className="font-mono text-gray-900 text-xs">{vehicle.vin || 'N/A'}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-500">Mileage:</span>
                                        <span className="font-medium text-gray-900">
                                          {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-500">Color:</span>
                                        <span className="font-medium text-gray-900">{vehicle.exterior_color || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Additional Details */}
                                  {(vehicle.transmission || vehicle.fuel_type || vehicle.body_type) && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {vehicle.transmission && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          {vehicle.transmission}
                                        </span>
                                      )}
                                      {vehicle.fuel_type && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          {vehicle.fuel_type}
                                        </span>
                                      )}
                                      {vehicle.body_type && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          {vehicle.body_type}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Vehicle Details */}
                    {selectedVehicle && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl shadow-sm">
                        <div className="flex items-start space-x-4">
                          {/* Selected Vehicle Image */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-20 bg-white rounded-lg overflow-hidden border-2 border-green-200 shadow-sm">
                              {selectedVehicle.images && selectedVehicle.images.length > 0 ? (
                                <img
                                  src={selectedVehicle.images[0]}
                                  alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full flex items-center justify-center ${selectedVehicle.images && selectedVehicle.images.length > 0 ? 'hidden' : ''}`}>
                                <Car className="h-10 w-10 text-gray-400" />
                              </div>
                            </div>
                          </div>

                          {/* Selected Vehicle Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <h4 className="text-lg font-bold text-gray-900">
                                Selected Vehicle
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-semibold text-gray-900 text-lg">
                                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Stock #{selectedVehicle.stock_number} • VIN: {selectedVehicle.vin}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {selectedVehicle.mileage ? `${selectedVehicle.mileage.toLocaleString()} miles` : 'Mileage N/A'} • {selectedVehicle.exterior_color || 'Color N/A'}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                  ${selectedVehicle.price.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {paymentForm.type === 'vehicle_purchase' ? 'Full Purchase Price' : 'Hold Deposit (5%)'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {paymentForm.type === 'vehicle_hold' && `Hold amount: $${(selectedVehicle.price * 0.05).toLocaleString()}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}


                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Description *
                  </label>
                  <textarea
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-base"
                    placeholder={
                      selectedVehicle 
                        ? `${paymentForm.type === 'vehicle_purchase' ? 'Vehicle purchase' : 'Vehicle hold'} for ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                        : "Enter detailed payment description..."
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setStep('customer')}
                  className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold flex items-center"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {editingPayment ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {editingPayment ? 'Update Payment' : 'Add Payment'}
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
export default ManualPaymentModal;