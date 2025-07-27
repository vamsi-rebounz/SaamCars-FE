import { DollarSign, Wrench, X } from 'lucide-react';
import React, { useState } from 'react';
import { vehicles } from '../data/vehicles';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicles[0] | null>(null);
  // For alert pop message
  const [showHoldAlert, setShowHoldAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedVehicle) {
        throw new Error('Please check VIN first');
      }

      // const response = await makePayment({
      //   type: 'reserve',
      //   amount: parseFloat(amount),
      //   vehicle_id: selectedVehicle.id,
      // });

      // if (response.success && response.data?.url) {
      //   window.location.href = response.data.url;
      // } else {
      //   throw new Error(response.error || 'Payment initialization failed');
      // }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setAmount('');
    setSelectedVehicle(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Make a Payment</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Alert for hold with deposit in progress */}
          {showHoldAlert && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-center">
              This feature is in progress.
              <button
                className="ml-4 text-sm text-blue-700 underline"
                onClick={() => setShowHoldAlert(false)}
              >
                Close
              </button>
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-700 mb-4">
                <DollarSign className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-gray-600">
                Your vehicle reservation has been confirmed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="form-label">Payment Type</label>
                <div className="flex items-center p-4 rounded-lg border-2 border-blue-700 bg-blue-50">
                  <Wrench className="h-6 w-6 mr-2 text-blue-700" />
                  <span className="text-blue-700 font-medium">Pay for Service</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="form-label">Amount ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Make Payment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;