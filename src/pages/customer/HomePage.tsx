import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ThumbsUp, Clock, ArrowRight } from 'lucide-react';
import { getInventory } from '../../services/inventory';
import VehicleCard from '../../components/VehicleCard';
import { Vehicle } from '../../types/vehicle';

// Helper to get unique values case-insensitively, preserving first occurrence's case
function getUniqueCaseInsensitive(arr: string[]) {
  const seen = new Set();
  const result: string[] = [];
  for (const item of arr) {
    const lower = item.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(item);
    }
  }
  return result;
}

const HomePage: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMake, setSearchMake] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [makeOptions, setMakeOptions] = useState<string[]>([]);
  const [searchYear, setSearchYear] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch vehicles and filterStats
        const response = await getInventory({ 
          limit: 1000, // fetch more to get all makes/models/years
          page: 1, 
          sort_by: 'date_added', 
          sort_order: 'desc'
        });
        if (response.success && response.vehicles) {
          setFeaturedVehicles(response.vehicles.slice(0, 3));
          // Extract unique makes, models, years (case-insensitive)
          const uniqueMakes = getUniqueCaseInsensitive(response.vehicles.map((v: Vehicle) => v.make).filter(Boolean));
          setMakeOptions(uniqueMakes);
          // No need to setModelOptions or setYearOptions here, handled below
        } else {
          setFeaturedVehicles([]);
          setMakeOptions([]);
          setError('No vehicles found.');
        }
      } catch (err) {
        setError('Failed to load featured vehicles.');
        setFeaturedVehicles([]);
        setMakeOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Independent options for make, model, year
  const modelOptions = getUniqueCaseInsensitive(featuredVehicles.map((v: Vehicle) => v.model).filter(Boolean));
  const yearOptions = Array.from(new Set(featuredVehicles.map((v: Vehicle) => v.year).filter(Boolean))).sort((a, b) => b - a).map(String);

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

      {/* Featured Vehicles */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <section className="quote-section" style={{backgroundColor: 'transparent', color: '#111', padding: '50px 20px', textAlign: 'center', fontFamily: `'Helvetica Neue', Arial, sans-serif`}}>
            <h2 style={{fontSize: '2rem', fontWeight: 600, marginBottom: 10}}>
              "Your journey begins with the right car – drive your dream today."
            </h2>
            <p style={{fontSize: '1rem', color: '#111', marginTop: 10}}>
              Driven by trust, powered by passion.
            </p>
          </section>
          <div className="w-full mb-12">
            <div className="bg-white border border-blue-200 rounded-xl shadow-md p-6 mb-8 w-full">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                <select
                  value={searchMake}
                  onChange={e => setSearchMake(e.target.value)}
                  className="w-full px-4 py-2 border-b-[1.5px] border-blue-600 rounded-none bg-transparent placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors text-base"
                >
                  <option value="">Vehicle Make</option>
                  {makeOptions.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
                <select
                  value={searchModel}
                  onChange={e => setSearchModel(e.target.value)}
                  className="w-full px-4 py-2 border-b-[1.5px] border-blue-600 rounded-none bg-transparent placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors text-base"
                >
                  <option value="">Vehicle Model</option>
                  {modelOptions.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <select
                  value={searchYear}
                  onChange={e => setSearchYear(e.target.value)}
                  className="w-full px-4 py-2 border-b-[1.5px] border-blue-600 rounded-none bg-transparent placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors text-base"
                >
                  <option value="">Vehicle Year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-base"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (searchMake) params.append('make', searchMake);
                    if (searchModel) params.append('model', searchModel);
                    if (searchYear) params.append('year', searchYear);
                    navigate(`/inventory?${params.toString()}`);
                  }}
                  disabled={!searchMake}
                >
                  View Your Matching Car
                </button>
              </div>
            </div>
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