import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { getBusinessSettings, type BusinessSettings } from '../services/businessSettings';

const Footer: React.FC = () => {
  const [businessData, setBusinessData] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    const fetchBusinessSettings = async () => {
      try {
        const settings = await getBusinessSettings();
        setBusinessData(settings);
      } catch (err) {
        console.error('Failed to fetch business settings:', err);
      } finally {
      }
    };

    fetchBusinessSettings();
  }, []);

  const formatAddress = () => {
    if (!businessData) return '123 Auto Drive, Cartown, CT 12345';
    return `${businessData.streetAddress}, ${businessData.city}, ${businessData.state} ${businessData.zipCode}`;
  };

  const formatBusinessHours = (day: string) => {
    if (!businessData?.businessHours?.[day]) {
      // Default hours
      if (day === 'sunday') return 'Closed';
      if (day === 'saturday') return '10:00 AM - 5:00 PM';
      return '9:00 AM - 7:00 PM';
    }
    const hours = businessData.businessHours[day];
    if (!hours.open || !hours.close) return 'Closed';
    return `${hours.open} - ${hours.close}`;
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Icon name="Car" size={32} className="text-blue-400" />
              <span className="text-xl font-bold">{businessData?.businessName || 'Saam Cars LLC'}</span>
            </div>
            <p className="text-gray-300 mb-4">
              Specializing in high-quality pre-owned vehicles at affordable prices. Your trusted partner in finding the perfect car.
            </p>
            <div className="flex space-x-4">
              {businessData?.socialMedia?.facebook && (
                <a href={businessData.socialMedia.facebook} className="text-gray-300 hover:text-blue-400" target="_blank" rel="noopener noreferrer">
                  <Icon name="Facebook" size={20} />
                </a>
              )}
              {businessData?.socialMedia?.twitter && (
                <a href={businessData.socialMedia.twitter} className="text-gray-300 hover:text-blue-400" target="_blank" rel="noopener noreferrer">
                  <Icon name="Twitter" size={20} />
                </a>
              )}
              {businessData?.socialMedia?.instagram && (
                <a href={businessData.socialMedia.instagram} className="text-gray-300 hover:text-blue-400" target="_blank" rel="noopener noreferrer">
                  <Icon name="Instagram" size={20} />
                </a>
              )}
              {businessData?.socialMedia?.linkedin && (
                <a href={businessData.socialMedia.linkedin} className="text-gray-300 hover:text-blue-400" target="_blank" rel="noopener noreferrer">
                  <Icon name="Linkedin" size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-blue-400">Home</Link>
              </li>
              <li>
                <Link to="/inventory" className="text-gray-300 hover:text-blue-400">Inventory</Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-blue-400">Services</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-blue-400">Contact Us</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-blue-400">Login</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Vehicle Sales</li>
              <li className="text-gray-300">Vehicle Maintenance</li>
              <li className="text-gray-300">Trade-In Appraisals</li>
              <li className="text-gray-300">Extended Warranties</li>
              <li className="text-gray-300">Vehicle Inspection</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Icon name="MapPin" size={20} className="text-blue-400 mt-0.5" />
                <span className="text-gray-300">{formatAddress()}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Icon name="Phone" size={20} className="text-blue-400" />
                <span className="text-gray-300">{businessData?.phone || '(555) 123-4567'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Icon name="Mail" size={20} className="text-blue-400" />
                <span className="text-gray-300">{businessData?.email || 'info@saamcars.com'}</span>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Business Hours:</h4>
              <p className="text-gray-300">Mon-Fri: {formatBusinessHours('monday')}</p>
              <p className="text-gray-300">Saturday: {formatBusinessHours('saturday')}</p>
              <p className="text-gray-300">Sunday: {formatBusinessHours('sunday')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {businessData?.businessName || 'Saam Cars LLC'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;