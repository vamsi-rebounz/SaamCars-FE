import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ThumbsUp, Clock, ArrowRight } from 'lucide-react';
import { getInventory } from '../../services/inventory';
import VehicleCard from '../../components/VehicleCard';

const HomePage: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Remove all state and logic related to the search section

  // Removed unused modelOptions, priceRanges, and navigate

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch vehicles with 'Featured' tag, sorted by date_added descending
        const response = await getInventory({ 
          limit: 3, 
          page: 1, 
          sort_by: 'date_added', 
          sort_order: 'desc'
        });
        if (response.success && response.vehicles) {
          setFeaturedVehicles(response.vehicles);
        } else {
          setFeaturedVehicles([]);
          setError('No vehicles found.');
        }
      } catch (err) {
        setError('Failed to load featured vehicles.');
        setFeaturedVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Remove the search handler

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg')",
            backgroundBlendMode: "overlay"
          }}
        ></div>
        <div className="container-custom relative z-10 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Top Pre-Owned Cars at Unbeatable Prices!
            </h1>
            <p className="text-xl mb-8">
              Find your perfect ride from our carefully selected inventory of quality pre-owned vehicles.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/inventory" className="btn-secondary">
                Browse Inventory
              </Link>
              <Link to="/contact" className="bg-white text-blue-700 hover:bg-gray-100 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Remove the search section JSX */}

      {/* Search Results or Featured Vehicles */}
      {/* The search results section is removed as per the edit hint. */}

      {/* Featured Vehicles */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4">Featured Vehicles</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our handpicked selection of premium pre-owned vehicles, each thoroughly inspected and ready for the road.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[220px]">
            {loading ? (
              <div className="col-span-3 flex justify-center items-center min-h-[180px]">
                <span className="text-gray-400 text-lg">Loading...</span>
              </div>
            ) : error ? (
              <div className="col-span-3 flex justify-center items-center min-h-[180px]">
                <span className="text-red-500">{error}</span>
              </div>
            ) : featuredVehicles.length === 0 ? (
              <div className="col-span-3 flex justify-center items-center min-h-[180px]">
                <span className="text-gray-400">No vehicles found.</span>
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
                />
              ))
            )}
          </div>
          <div className="text-center mt-10">
            <Link to="/inventory" className="btn-primary inline-flex items-center">
              View All Inventory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4">Why Choose Sam Cars</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional service and value to our customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <ThumbsUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Vehicles</h3>
              <p className="text-gray-600">
                Every vehicle undergoes a comprehensive inspection before joining our inventory.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Warranty Options</h3>
              <p className="text-gray-600">
                Extended warranty options available for additional peace of mind.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent Process</h3>
              <p className="text-gray-600">
                Clear pricing and detailed vehicle history reports available for all our inventory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers have to say.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">John D.</h4>
                  <div className="flex text-amber-400">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "I had an amazing experience buying my Toyota Camry from Sam Cars. The staff was knowledgeable and not pushy. The process was smooth, and I got a great deal!"
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Sarah M.</h4>
                  <div className="flex text-amber-400">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "As a first-time car buyer, I was nervous about the process. The team at Sam Cars made it easy and stress-free. They answered all my questions and helped me find the perfect car within my budget."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  R
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Robert T.</h4>
                  <div className="flex text-amber-400">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "I've bought several cars over the years, and my experience with Sam Cars was by far the best. The vehicle was exactly as described, and the after-sale service has been excellent."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Car?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Visit our dealership today or browse our inventory online. Our team is ready to help you find the perfect vehicle.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/inventory" className="btn-secondary">
              Browse Inventory
            </Link>
            <Link to="/contact" className="bg-white text-blue-700 hover:bg-gray-100 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;