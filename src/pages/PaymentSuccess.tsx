// src/pages/PaymentSuccess.tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      console.log('Payment session ID:', sessionId);
      // Optional: send sessionId to backend for verification
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md text-center">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-green-700 mb-2">Payment Successful</h1>
        <p className="text-gray-600 mb-4">
          Thank you! Your payment has been processed successfully.
        </p>
        {/* {sessionId && (
          <p className="text-sm text-gray-500 mb-6">Session ID: {sessionId}</p>
        )} */}
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
