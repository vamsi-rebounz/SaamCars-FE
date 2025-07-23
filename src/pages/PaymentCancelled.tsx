// src/pages/PaymentCancelled.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md text-center">
        <XCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-red-700 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-4">
          Your payment was not completed. You can try again later.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentCancelled;
