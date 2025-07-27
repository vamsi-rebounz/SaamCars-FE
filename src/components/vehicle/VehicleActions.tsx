import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createCheckoutSession } from '../../services/payments';
import { stripePromise } from '../../config/stripe';
import { Heart, Share2, FileText, DollarSign, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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
      const session = await createCheckoutSession({
        vehicleId,
        userId: user.userId,
        type: 'purchase'
      });
      if (session.url) {
        window.location.href = session.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
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
            <button
              onClick={handlePurchase}
              disabled={loading || !stripePromise || !isAvailable}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                isAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center">
                <DollarSign className="w-5 h-5 mr-2" />
                <span>{loading ? 'Processing...' : 'Purchase Now'}</span>
              </div>
            </button>

            <button
              disabled
              className="w-full py-4 px-6 rounded-xl font-semibold text-base bg-gray-200 text-gray-400 flex items-center justify-center cursor-not-allowed opacity-70"
              onClick={() => setShowAlert(true)}
            >
              <ShieldCheck className="w-5 h-5 mr-2" />
              Hold with $500 Deposit (Coming Soon)
            </button>
            {showAlert && (
              <Alert
                type="info"
                message="The hold with deposit feature is currently disabled and will be available in a future update."
                onClose={() => setShowAlert(false)}
              />
            )}

            {/* Payment Information */}
            {isAvailable && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-center text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
                  <span>Secure Payment via Stripe</span>
                </div>
                <div className="flex items-center justify-center text-xs text-gray-600">
                  <span>• Deposit is fully refundable •</span>
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