import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ThumbsUp, Clock, ArrowRight } from 'lucide-react';
import { getInventory, getDropdownOptions } from '../../services/inventory';
import VehicleCard from '../../components/VehicleCard';
import { Vehicle } from '../../types/vehicle';

const HomePage: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch dropdown options efficiently
        const dropdownResponse = await getDropdownOptions();
        if (!dropdownResponse.success) {
          console.warn('Failed to fetch dropdown options');
        }

        // Fetch featured vehicles (only 3 for display)
        const inventoryResponse = await getInventory({ 
          limit: 3, // Only fetch 3 for featured display
          page: 1, 
          sort_by: 'date_added', 
          sort_order: 'desc'
        });
        if (inventoryResponse.success && inventoryResponse.vehicles) {
          setFeaturedVehicles(inventoryResponse.vehicles);
        } else {
          setFeaturedVehicles([]);
          setError('No vehicles found.');
        }
      } catch (err) {
        setError('Failed to load data.');
        setFeaturedVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg')"
          }}
        ></div>
        
        <div className="container-custom relative z-10 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Car
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Quality pre-owned vehicles at unbeatable prices
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                to="/inventory" 
                className="px-8 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Inventory
              </Link>
              <Link 
                to="/contact" 
                className="px-8 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>

            {/* Quote Section */}
            <div className="border-t border-white/20 pt-8">
              <h2 className="text-xl font-medium text-blue-100 mb-2">
                "Your journey begins with the right car"
              </h2>
              <p className="text-blue-200">
                Driven by trust, powered by passion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Vehicles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked selection of our best pre-owned cars, ready for you to drive home today
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 flex justify-center items-center py-16">
                <span className="text-gray-500 text-lg">Loading featured vehicles...</span>
              </div>
            ) : error ? (
              <div className="col-span-3 flex justify-center items-center py-16">
                <span className="text-red-500 text-lg">{error}</span>
              </div>
            ) : featuredVehicles.length === 0 ? (
              <div className="col-span-3 flex justify-center items-center py-16">
                <span className="text-gray-500 text-lg">No featured vehicles available at the moment.</span>
              </div>
            ) : (
              featuredVehicles.map(vehicle => (
                <VehicleCard
                  key={vehicle.id}
                  id={vehicle.id}
                  make={vehicle.make}
                  model={vehicle.model}
                  year={vehicle.year}
                  price={vehicle.price}
                  mileage={vehicle.mileage}
                  image={vehicle.images && vehicle.images[0]}
                  condition={vehicle.condition}
                  tags={vehicle.tags || []}
                  status={vehicle.status}
                />
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/inventory" 
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              View All Inventory
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose SaamCars?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide quality vehicles, transparent pricing, and exceptional service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance</h3>
              <p className="text-gray-600 leading-relaxed">
                All vehicles undergo thorough inspections to ensure they meet our quality standards.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ThumbsUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Prices</h3>
              <p className="text-gray-600 leading-relaxed">
                We offer competitive pricing on all our vehicles, ensuring you get the best value.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Process</h3>
              <p className="text-gray-600 leading-relaxed">
                Our streamlined process ensures you can drive away in your new car quickly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;