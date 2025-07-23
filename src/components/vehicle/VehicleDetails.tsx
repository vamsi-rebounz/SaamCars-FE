import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVehicleById } from '../../services/vehicle';
import { Vehicle } from '../../types/vehicle';
import { FaCarSide, FaTachometerAlt, FaCog, FaGasPump, FaCheckCircle } from 'react-icons/fa';

const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getVehicleById(id);
        
        if (response.success && response.vehicle) {
          setVehicle(response.vehicle);
        } else {
          setError(response.error || 'Failed to fetch vehicle details');
        }
      } catch (err) {
        setError('An error occurred while fetching vehicle details');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!vehicle) return <div className="text-gray-500 p-4 text-center">Vehicle not found</div>;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === vehicle.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? vehicle.images.length - 1 : prev - 1
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <div className="mt-2 flex items-center space-x-4">
              {vehicle.stock_number && (
                <span className="text-gray-600">Stock #: {vehicle.stock_number}</span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                {vehicle.status}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-3xl md:text-4xl font-bold text-blue-600">
              ${vehicle.price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="relative mb-8 bg-gray-100 rounded-xl overflow-hidden">
          {vehicle.images && vehicle.images.length > 0 ? (
            <>
              <img
                src={vehicle.images[currentImageIndex]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              {vehicle.images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white transition-all shadow-lg"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 text-gray-800 p-3 rounded-full hover:bg-white transition-all shadow-lg"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {vehicle.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-blue-600 w-8' : 'bg-white/70 hover:bg-white'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-[400px] md:h-[500px] bg-gray-200 rounded-xl flex items-center justify-center">
              <FaCarSide className="w-20 h-20 text-gray-400" />
            </div>
          )}
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <FaTachometerAlt className="text-blue-600 w-5 h-5" />
              <div>
                <div className="text-sm text-gray-600">Mileage</div>
                <div className="font-semibold">{vehicle.mileage?.toLocaleString() || 'N/A'} mi</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <FaCog className="text-blue-600 w-5 h-5" />
              <div>
                <div className="text-sm text-gray-600">Transmission</div>
                <div className="font-semibold">{vehicle.transmission || 'N/A'}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <FaGasPump className="text-blue-600 w-5 h-5" />
              <div>
                <div className="text-sm text-gray-600">Fuel Type</div>
                <div className="font-semibold">{vehicle.fuel_type || 'N/A'}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <FaCarSide className="text-blue-600 w-5 h-5" />
              <div>
                <div className="text-sm text-gray-600">Body Type</div>
                <div className="font-semibold">{vehicle.body_type || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Vehicle Specifications */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Vehicle Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">VIN</span>
                    <span className="font-medium">{vehicle.vin || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exterior Color</span>
                    <span className="font-medium">{vehicle.exterior_color || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interior Color</span>
                    <span className="font-medium">{vehicle.interior_color || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Engine</span>
                    <span className="font-medium">{vehicle.engine || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-medium">{vehicle.condition || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{vehicle.location || 'N/A'}</span>
                  </div>
                  {vehicle.carfax_link && (
                    <div className="pt-2">
                      <a
                        href={vehicle.carfax_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Carfax Report →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{vehicle.description}</p>
              </div>
            )}

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FaCheckCircle className="text-green-500 w-5 h-5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Call to Action Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="space-y-4">
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Contact Seller</span>
                </button>
                <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Schedule Test Drive</span>
                </button>
                {vehicle.carfax_link && (
                  <a
                    href={vehicle.carfax_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <span>View Carfax Report</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails; 