import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { getBusinessSettings, type BusinessSettings } from '../../services/businessSettings';

const WEEKDAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBusinessSettings = async () => {
      try {
        const settings = await getBusinessSettings();
        setBusinessData(settings);
      } catch (err) {
        console.error('Failed to fetch business settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const formatBusinessHours = (day: string) => {
    if (!businessData?.businessHours?.[day]) {
      if (day === 'sunday') return 'Closed';
      if (day === 'saturday') return '10:00 AM - 5:00 PM';
      return '9:00 AM - 7:00 PM';
    }
    const hours = businessData.businessHours[day];
    if (!hours.open || !hours.close) return 'Closed';
    return `${hours.open} - ${hours.close}`;
  };

  const formatAddress = () => {
    if (!businessData) return '123 Auto Drive, Cartown, CT 12345';
    return `${businessData.streetAddress}, ${businessData.city}, ${businessData.state} ${businessData.zipCode}`;
  };

  const getDirectionsUrl = () => {
    if (!businessData) return '';
    const address = encodeURIComponent(formatAddress());
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  const getMapEmbedUrl = () => {
    if (!businessData) return '';
    const address = encodeURIComponent(formatAddress());
    // Using Google Maps search URL which doesn't require an API key
    return `https://maps.google.com/maps?q=${address}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-700 py-16">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100">
              Have questions or need assistance? We're here to help!
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Information */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="text-gray-600 mb-2">Sales Department</p>
              <a href={`tel:${businessData?.phone}`} className="text-blue-700 font-medium">
                {businessData?.phone || '(555) 123-4567'}
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600 mb-2">General Inquiries</p>
              <a href={`mailto:${businessData?.email}`} className="text-blue-700 font-medium">
                {businessData?.email || 'info@samcars.com'}
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <p className="text-gray-600 mb-2">{businessData?.businessName || 'Main Dealership'}</p>
              <p className="text-gray-800">{businessData?.streetAddress || '123 Auto Drive'}</p>
              <p className="text-gray-800">
                {businessData ? `${businessData.city}, ${businessData.state} ${businessData.zipCode}` : 'Cartown, CT 12345'}
              </p>
              <a 
                href={getDirectionsUrl()}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-700 font-medium inline-block mt-2 hover:text-blue-800 transition-colors"
              >
                Get Directions
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-700 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
              <div className="text-gray-600">
                {WEEKDAYS.map(({ key, label }) => (
                  <p key={key} className="mb-1">
                    <span className="font-medium">{label}:</span> {formatBusinessHours(key)}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Map and Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative" style={{ paddingBottom: '75%', height: 0 }}>
                {!loading && (
                  <iframe
                    src={getMapEmbedUrl()}
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0 
                    }}
                    allowFullScreen
                    loading="lazy"
                    title={`${businessData?.businessName || 'SaamCars'} Location`}
                  ></iframe>
                )}
              </div>
              <div className="p-4 border-t border-gray-100">
                <div className="max-w-lg mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-1">Our Location</h3>
                  <p className="text-gray-600 mb-1">{businessData?.businessName || 'SaamCars'}</p>
                  <p className="text-gray-800 font-medium mb-3">{formatAddress()}</p>
                  <div className="flex justify-center gap-6">
                    <a 
                      href={getDirectionsUrl()}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-700 font-medium inline-flex items-center hover:text-blue-800 transition-colors"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Get Directions
                    </a>
                    <a 
                      href={`https://maps.google.com/maps?q=${encodeURIComponent(formatAddress())}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-700 font-medium inline-flex items-center hover:text-blue-800 transition-colors"
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="h-4 w-4 mr-1"
                      >
                        <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                      </svg>
                      View Larger Map
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              
              {formSubmitted ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Thank you for your message! We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="phone" className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="form-label">Subject</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      >
                        <option value="">Select a subject</option>
                        <option value="Sales Inquiry">Sales Inquiry</option>
                        <option value="Service Request">Service Request</option>
                        <option value="Parts Inquiry">Parts Inquiry</option>
                        <option value="Test Drive">Test Drive</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;