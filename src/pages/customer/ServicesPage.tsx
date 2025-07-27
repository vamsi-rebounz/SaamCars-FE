import React, { useState } from 'react';
import { Wrench, X, Calendar } from 'lucide-react';
import { services, getServicesByCategory } from '../../data/services';
import ServiceCard from '../../components/ServiceCard';
import { useAuth } from '../../contexts/AuthContext';
import PaymentModal from '../../components/PaymentModal';

const ServicesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { isAuthenticated } = useAuth();
  
  const filteredServices = activeCategory === 'all' 
    ? services 
    : getServicesByCategory(activeCategory as any);
  
  const selectedServiceDetails = services.find(service => service.id === selectedService);
  
  const handleServiceSelect = (id: string) => {
    setSelectedService(id);
  };
  
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the data to the server
    setBookingSubmitted(true);
    setTimeout(() => {
      setSelectedService(null);
      setBookingSubmitted(false);
      setBookingDate('');
      setBookingTime('');
    }, 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">
              Professional Auto Services
            </h1>
            <p className="text-xl mb-0">
              Keep your vehicle running at its best with our comprehensive maintenance and repair services.
            </p>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <div className="container-custom py-12">
        {/* Payment Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="btn-primary"
          >
            Make a Payment
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeCategory === 'all'
                ? 'bg-blue-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => setActiveCategory('maintenance')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeCategory === 'maintenance'
                ? 'bg-blue-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Maintenance
          </button>
          <button
            onClick={() => setActiveCategory('repair')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeCategory === 'repair'
                ? 'bg-blue-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Repairs
          </button>
          <button
            onClick={() => setActiveCategory('cosmetic')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeCategory === 'cosmetic'
                ? 'bg-blue-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cosmetic
          </button>
          <button
            onClick={() => setActiveCategory('inspection')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeCategory === 'inspection'
                ? 'bg-blue-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Inspections
          </button>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              description={service.description}
              price={service.price}
              duration={service.duration}
              image={service.image}
              onSelect={handleServiceSelect}
            />
          ))}
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
        
        {/* Service Booking Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Book Service</h2>
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {bookingSubmitted ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-700 mb-4">
                      <Wrench className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-600">
                      Your service has been scheduled. We'll contact you to confirm the details.
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedServiceDetails && (
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <Wrench className="h-5 w-5 text-blue-700 mr-2" />
                          <h3 className="font-semibold">{selectedServiceDetails.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{selectedServiceDetails.description}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price: <span className="font-semibold text-blue-700">${selectedServiceDetails.price.toFixed(2)}</span></span>
                          <span className="text-gray-600">Duration: <span className="font-semibold">{selectedServiceDetails.duration}</span></span>
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={handleBookingSubmit}>
                      {!isAuthenticated && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                          <h4 className="font-medium mb-2">Your Information</h4>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Full Name"
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <input
                              type="email"
                              placeholder="Email Address"
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <input
                              type="tel"
                              placeholder="Phone Number"
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium mb-2">Vehicle Information</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="form-label">Make</label>
                            <input
                              type="text"
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                          </div>
                          <div>
                            <label className="form-label">Model</label>
                            <input
                              type="text"
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                          </div>
                          <div>
                            <label className="form-label">Year</label>
                            <input
                              type="number"
                              min="1900"
                              max={new Date().getFullYear()}
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium mb-2">Appointment Details</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="form-label">Preferred Date</label>
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                              <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="form-label">Preferred Time</label>
                            <select
                              value={bookingTime}
                              onChange={(e) => setBookingTime(e.target.value)}
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            >
                              <option value="">Select a time</option>
                              <option value="9:00 AM">9:00 AM</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="11:00 AM">11:00 AM</option>
                              <option value="12:00 PM">12:00 PM</option>
                              <option value="1:00 PM">1:00 PM</option>
                              <option value="2:00 PM">2:00 PM</option>
                              <option value="3:00 PM">3:00 PM</option>
                              <option value="4:00 PM">4:00 PM</option>
                              <option value="5:00 PM">5:00 PM</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Additional Notes</label>
                            <textarea
                              rows={3}
                              placeholder="Any specific issues or concerns..."
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setSelectedService(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Why Choose Our Services */}
      <section className="bg-white py-12">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="heading-lg mb-4">Why Choose Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional service and value to our customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Technicians</h3>
              <p className="text-gray-600">
                Our ASE-certified technicians have years of experience and ongoing training to stay current with the latest automotive technology.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Parts</h3>
              <p className="text-gray-600">
                We use only high-quality OEM or equivalent parts for all repairs and maintenance to ensure reliability and performance.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Warranty</h3>
              <p className="text-gray-600">
                All our services come with a warranty on both parts and labor, giving you peace of mind and protection for your investment.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-12">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Schedule a Service?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Book your appointment today and keep your vehicle running at its best.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-secondary"
          >
            View Services
          </button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;