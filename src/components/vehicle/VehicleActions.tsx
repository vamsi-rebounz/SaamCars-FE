import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createVehiclePurchaseSession, createVehicleHoldSession, checkUserDepositPayment } from '../../services/payments';
import { stripePromise } from '../../config/stripe';
import { Heart, Share2, FileText, DollarSign, Phone, ShieldCheck, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { addToWishlist, removeFromWishlist } from '../../services/wishlist';
import Alert from '../Alert';

interface VehicleActionsProps {
  vehicleId: string;
  price: number;
  isAvailable?: boolean;
  carfaxLink?: string;
  isInWishlist?: boolean;
}

const VehicleActions: React.FC<VehicleActionsProps> = ({ 
  vehicleId, 
  price, 
  isAvailable = true,
  carfaxLink,
  isInWishlist = false
}) => {
  const [loading, setLoading] = useState(false);
  const [holdLoading, setHoldLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [depositInfo, setDepositInfo] = useState<{
    hasDeposit: boolean;
    depositAmount?: number;
    depositDate?: string;
    paymentId?: string;
  } | null>(null);
  const [checkingDeposit, setCheckingDeposit] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Check if user has already made a deposit payment for this vehicle
  useEffect(() => {
    const checkDepositPayment = async () => {
      if (!isAuthenticated || !user?.userId || !isAvailable) {
        return;
      }

      try {
        setCheckingDeposit(true);
        const result = await checkUserDepositPayment(vehicleId, user.userId);
        setDepositInfo(result);
      } catch (error) {
        console.error('Error checking deposit payment:', error);
      } finally {
        setCheckingDeposit(false);
      }
    };

    checkDepositPayment();
  }, [vehicleId, user?.userId, isAuthenticated, isAvailable]);

  const handlePurchase = async () => {
    if (!isAuthenticated || !user?.userId) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (!isAvailable) {
      setError('This vehicle is not available for purchase.');
      return;
    }

    if (!stripePromise) {
      setError('Payment system is not configured. Please try again later.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create purchase session (backend will handle deposit calculation)
      const session = await createVehiclePurchaseSession(vehicleId, user.userId);
      if (session.url) {
        window.location.href = session.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHold = async () => {
    if (!isAuthenticated || !user?.userId) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (!isAvailable) {
      setError('This vehicle is not available for hold.');
      return;
    }

    if (!stripePromise) {
      setError('Payment system is not configured. Please try again later.');
      return;
    }

    try {
      setHoldLoading(true);
      setError(null);
      const depositAmount = Math.round(price * 0.05); // 5% deposit
      const session = await createVehicleHoldSession(vehicleId, user.userId, depositAmount);
      if (session.url) {
        window.location.href = session.url;
      } else {
        setError('Failed to create hold session');
      }
    } catch (err: any) {
      console.error('Hold payment error:', err);
      setError(err.message || 'Failed to process hold payment. Please try again.');
    } finally {
      setHoldLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      setWishlistLoading(true);
      if (inWishlist) {
        await removeFromWishlist(vehicleId);
        setInWishlist(false);
      } else {
        await addToWishlist(vehicleId);
        setInWishlist(true);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this vehicle',
        text: 'I found this great vehicle on SaamCars!',
        url: window.location.href,
      }).catch((error) => {
        if (error.name === 'AbortError') {
          // User cancelled the share dialog
          navigator.clipboard.writeText(window.location.href);
          setAlertMessage('Link copied to clipboard!');
          setShowAlert(true);
        }
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setAlertMessage('Link copied to clipboard!');
      setShowAlert(true);
    }
  };

  return (
    <>
      {showAlert && (
        <Alert
          message={alertMessage}
          type="success"
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Price and Status Section */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wider mb-1 text-blue-100">Price</p>
            <p className="text-4xl font-bold">${price.toLocaleString()}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10">
              {isAvailable ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                  Available Now
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                  Not Available
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Primary Actions */}
        <div className="p-6 space-y-4">
          {/* Payment Buttons */}
          <div className="space-y-3">
            {/* Deposit Status Alert */}
            {depositInfo?.hasDeposit && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <div className="text-sm">
                    <p className="text-green-800 font-medium">Deposit Paid</p>
                    <p className="text-green-600 text-xs">
                      You paid ${depositInfo.depositAmount?.toLocaleString()} on {new Date(depositInfo.depositDate || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={loading || !isAvailable || checkingDeposit}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                isAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center">
                <DollarSign className="w-5 h-5 mr-2" />
                <span>
                  {loading ? 'Processing...' : 
                   checkingDeposit ? 'Checking...' :
                   depositInfo?.hasDeposit && depositInfo.depositAmount ? 
                     `Complete Purchase - $${(price - depositInfo.depositAmount).toLocaleString()} Remaining` : 
                     'Purchase Now'
                  }
                </span>
              </div>
            </button>

            <button
              onClick={handleHold}
              disabled={holdLoading || !isAvailable || checkingDeposit || depositInfo?.hasDeposit}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                isAvailable && !depositInfo?.hasDeposit
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>
                  {holdLoading ? 'Holding...' : 
                   checkingDeposit ? 'Checking...' :
                   depositInfo?.hasDeposit ? 'Deposit Already Paid' :
                   `Hold with $${Math.round(price * 0.05).toLocaleString()} Deposit`
                  }
                </span>
              </div>
            </button>

            {/* Debug Information */}
            {!stripePromise && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
                  <p className="text-xs text-yellow-700">Stripe not configured - buttons enabled for testing</p>
                </div>
              </div>
            )}



            {/* Payment Information */}
            {isAvailable && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-center text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
                  <span>Secure Payment via Stripe</span>
                </div>
                <div className="text-xs text-gray-600 text-center space-y-1">
                  {depositInfo?.hasDeposit && depositInfo.depositAmount ? (
                    <>
                      <div>• Original price: ${price.toLocaleString()}</div>
                      <div>• Deposit paid: ${depositInfo.depositAmount.toLocaleString()}</div>
                      <div>• Remaining balance: ${(price - depositInfo.depositAmount).toLocaleString()}</div>
                    </>
                  ) : (
                    <>
                      <div>• Full purchase: ${price.toLocaleString()}</div>
                      <div>• Hold deposit: ${Math.round(price * 0.05).toLocaleString()} (5%)</div>
                      <div>• Deposit refundable within 24 hours</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
            {/* CARFAX Report */}
            {carfaxLink && (
              <a
                href={carfaxLink}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200 group"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span>View CARFAX Report</span>
                <span className="ml-1 text-sm text-blue-600 group-hover:underline">Free</span>
              </a>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                inWishlist 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              <span>{inWishlist ? 'Saved' : 'Save'}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Contact Action */}
          <button
            onClick={() => navigate('/contact')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            <Phone className="w-5 h-5" />
            <span>Contact Dealer</span>
          </button>
        </div>

        {/* Additional Information */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
            <span>Secure transaction · Money-back guarantee</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleActions; 