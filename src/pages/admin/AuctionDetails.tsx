import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Image as ImageIcon, ChevronLeft, ChevronRight, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { getAuctionById, deleteAuction } from '../../services/auction';
import AuctionPurchaseForm from '../../components/auction/AuctionPurchaseForm';
import AlertState from '../../components/ErrorState';

interface AuctionPurchase {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: string;
  purchase_date: string;
  purchase_price: number;
  list_price: number;
  images?: string[];
  description?: string;
  condition?: string;
  mileage?: number;
  location?: string;
  carfax_link?: string;
  sold_price?: number | null;
  stock_number?: string;
  engine?: string;
  transmission?: string;
  fuel_type?: string;
  features?: string[];
  exterior_color?: string;
  interior_color?: string;
  body_type?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

const AuctionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<AuctionPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const fetchAuction = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await getAuctionById(id);
      if (response.success && response.purchase) {
        setAuction(response.purchase);
      } else {
        setError(response.error || 'Failed to fetch auction details');
      }
    } catch (err) {
      console.error('Error fetching auction:', err);
      setError('An error occurred while fetching auction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [id]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const nextImage = () => {
    if (auction?.images) {
      setCurrentImageIndex((prev) => 
        prev === auction.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (auction?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? auction.images!.length - 1 : prev - 1
      );
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    setSuccessMessage('Auction updated successfully!');
    setTimeout(() => {
      fetchAuction();
    }, 300);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      const response = await deleteAuction(id);
      if (response.success) {
        navigate('/admin/auctions', { 
          state: { message: 'Auction deleted successfully' }
        });
      } else {
        setError(response.error || 'Failed to delete auction');
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error('Error deleting auction:', err);
      setError('An error occurred while deleting the auction');
      setShowDeleteModal(false);
    }
  };

  const handleCarfax = () => {
    if (auction?.carfax_link) {
      window.open(auction.carfax_link, '_blank');
    }
  };

  const handleBack = () => {
    navigate('/admin/auctions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Auction not found'}</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert Messages */}
      <AlertState
        success={successMessage}
        error={error}
        variant="server"
        onClose={() => {
          setSuccessMessage(null);
          setError(null);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Auctions
          </button>
          
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {auction.make} {auction.model} {auction.year}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600">VIN: {auction.vin || 'N/A'}</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  auction.status === 'available' ? 'bg-green-100 text-green-800' :
                  auction.status === 'sold' ? 'bg-red-100 text-red-800' :
                  auction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  auction.status === 'reserved' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {auction.carfax_link && (
                <button
                  onClick={handleCarfax}
                  className="flex items-center bg-white text-blue-600 px-4 py-2 rounded border border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Carfax Report
                </button>
              )}
              <button
                onClick={handleEdit}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center bg-white text-red-600 px-4 py-2 rounded border border-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Images Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Images</h2>
              <div className="text-sm text-gray-500">
                {auction?.images && auction.images.length > 0 && (
                  <span>Image {currentImageIndex + 1} of {auction.images.length}</span>
                )}
              </div>
            </div>
            
            {auction?.images && auction.images.length > 0 ? (
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                  {!imageErrors.has(currentImageIndex) ? (
                    <img
                      src={auction.images[currentImageIndex]}
                      alt={`${auction.make} ${auction.model} - Image ${currentImageIndex + 1}`}
                      className="w-full h-[400px] object-contain rounded-lg"
                      onError={() => handleImageError(currentImageIndex)}
                    />
                  ) : (
                    <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {auction.images.length > 1 && (
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                    <button
                      onClick={previousImage}
                      className="bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-all shadow-lg"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-all shadow-lg"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                )}
                
                {/* Thumbnail Navigation */}
                <div className="flex justify-center mt-4 space-x-2 overflow-x-auto py-2">
                  {auction.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>

          {/* Auction Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Purchase Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-2 h-6 bg-blue-600 rounded mr-3"></span>
                Purchase Details
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {new Date(auction.purchase_date).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Purchase Price</dt>
                  <dd className="text-sm font-semibold text-gray-900">${auction.purchase_price.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">List Price</dt>
                  <dd className="text-sm font-semibold text-gray-900">${auction.list_price.toLocaleString()}</dd>
                </div>
                {auction.sold_price && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Sold Price</dt>
                    <dd className="text-sm font-semibold text-green-600">${auction.sold_price.toLocaleString()}</dd>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      auction.status === 'available' ? 'bg-green-100 text-green-800' :
                      auction.status === 'sold' ? 'bg-red-100 text-red-800' :
                      auction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      auction.status === 'reserved' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                    </span>
                  </dd>
                </div>
                {auction.created_at && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {new Date(auction.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {auction.updated_at && (
                  <div className="flex justify-between items-center py-2">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {new Date(auction.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Basic Vehicle Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-2 h-6 bg-blue-600 rounded mr-3"></span>
                Basic Vehicle Details
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Make & Model</dt>
                  <dd className="text-sm font-semibold text-gray-900">{auction.make} {auction.model}</dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Year</dt>
                  <dd className="text-sm font-semibold text-gray-900">{auction.year}</dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">VIN</dt>
                  <dd className="text-sm font-semibold text-gray-900">{auction.vin || 'N/A'}</dd>
                </div>
                {auction.stock_number && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Stock Number</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.stock_number}</dd>
                  </div>
                )}
                {auction.mileage && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Mileage</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.mileage.toLocaleString()} miles</dd>
                  </div>
                )}
                {auction.location && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.location}</dd>
                  </div>
                )}
                {auction.condition && (
                  <div className="flex justify-between items-center py-2">
                    <dt className="text-sm font-medium text-gray-500">Condition</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.condition}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Technical Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-2 h-6 bg-blue-600 rounded mr-3"></span>
                Technical Details
              </h2>
              <dl className="space-y-3">
                {auction.engine && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Engine</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.engine}</dd>
                  </div>
                )}
                {auction.transmission && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Transmission</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.transmission}</dd>
                  </div>
                )}
                {auction.fuel_type && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.fuel_type}</dd>
                  </div>
                )}
                {auction.body_type && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Body Type</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.body_type}</dd>
                  </div>
                )}
                {auction.exterior_color && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Exterior Color</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.exterior_color}</dd>
                  </div>
                )}
                {auction.interior_color && (
                  <div className="flex justify-between items-center py-2">
                    <dt className="text-sm font-medium text-gray-500">Interior Color</dt>
                    <dd className="text-sm font-semibold text-gray-900">{auction.interior_color}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Description */}
          {auction.description && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-2 h-6 bg-blue-600 rounded mr-3"></span>
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{auction.description}</p>
            </div>
          )}

          {/* Features */}
          {auction.features && auction.features.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-2 h-6 bg-blue-600 rounded mr-3"></span>
                Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {auction.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {auction.tags && auction.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="inline-block w-2 h-6 bg-blue-600 rounded mr-3"></span>
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {auction.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Auction Modal */}
        {showEditModal && auction && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                  <button
                    className="absolute top-4 right-4 text-gray-700 hover:text-red-600 bg-white rounded-full p-1 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                    onClick={() => setShowEditModal(false)}
                    aria-label="Close Edit Auction Form"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Edit className="h-6 w-6 text-blue-700" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Edit Auction
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Update the auction information below.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-4">
                    <AuctionPurchaseForm
                      initialData={auction}
                      onSuccess={handleEditComplete}
                      isEditing={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Auction
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this auction? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetails; 