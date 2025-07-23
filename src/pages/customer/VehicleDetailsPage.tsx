import { ArrowLeft, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VehicleActions from '../../components/vehicle/VehicleActions';
import VehicleImageGallery from '../../components/vehicle/VehicleImageGallery';
import { getVehicleById } from '../../services/vehicle';
import { checkWishlist } from '../../services/wishlist';
import AlertState from '../../components/ErrorState';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string;
  mileage: number;
  exterior_color: string;
  interior_color: string;
  transmission: string;
  fuel_type: string;
  engine: string;
  body_type: string;
  vin: string;
  condition: string;
  status: string;
  description: string;
  featured: boolean;
  carfax_link: string;
  available: boolean;
  images: string[];
  features: string[];
  tags: string[];
  stock_number?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setError('Vehicle not found');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await getVehicleById(id);
        if (response.success && response.vehicle) {
          setVehicle(response.vehicle as unknown as Vehicle);
          
          // Check if vehicle is in user's wishlist
          if (isAuthenticated) {
            const wishlistStatus = await checkWishlist(id);
            setIsInWishlist(wishlistStatus.isInWishlist);
          }
        } else {
          setError(response.error || 'Failed to fetch vehicle details');
        }
      } catch (err) {
        setError('Failed to fetch vehicle details');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertState
            error={error || 'Vehicle not found'}
            variant={error ? 'server' : 'not-found'}
            title={error ? 'Failed to Load Vehicle' : 'Vehicle Not Found'}
            description={error ? 'We couldn\'t load the vehicle details. This might be due to a network issue or server problem.' : 'The requested vehicle could not be found in our inventory.'}
          />
          <Link
            to="/inventory"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/inventory" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Inventory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Takes up 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery Section */}
            {vehicle && (
              <VehicleImageGallery
                images={vehicle?.images || []}
                make={vehicle?.make || ''}
                model={vehicle?.model || ''}
              />
            )}

            {/* Basic Vehicle Details Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-l-4 border-blue-600 pl-4 py-4 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  {vehicle && `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </h2>
              </div>
              <div className="p-6">
                <dl className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Stock Number</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.stock_number}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.location}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Mileage</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.mileage.toLocaleString()} miles</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">VIN</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.vin}</dd>
                  </div>
                  {vehicle?.created_at && (
                    <div className="flex justify-between items-center py-2">
                      <dt className="text-sm font-medium text-gray-500">Listed On</dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {new Date(vehicle.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Technical Details Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-l-4 border-blue-600 pl-4 py-4">
                <h2 className="text-xl font-semibold text-gray-900">Technical Details</h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Transmission</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.transmission}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.fuel_type}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Exterior Color</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.exterior_color}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Interior Color</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.interior_color}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Engine</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.engine}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Body Type</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.body_type}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Condition</dt>
                    <dd className="text-sm font-semibold text-gray-900">{vehicle?.condition}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Description Section */}
            {vehicle?.description && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-l-4 border-blue-600 pl-4 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">Description</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
                </div>
              </div>
            )}

            {/* Features Section */}
            {vehicle?.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-l-4 border-blue-600 pl-4 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">Features</h2>
                </div>
                <div className="p-6">
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicle.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="lg:col-span-1">
            {vehicle && (
              <VehicleActions
                vehicleId={id || ''}
                price={parseFloat(vehicle.price)}
                isAvailable={vehicle.available}
                carfaxLink={vehicle.carfax_link}
                isInWishlist={isInWishlist}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
