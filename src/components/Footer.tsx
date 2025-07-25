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
      }
    };

    fetchBusinessSettings();
  }, []);

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
              Specializing in high-quality vehicles at affordable prices. Your trusted partner in finding the perfect car.
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
                <Link to="/" className="text-gray-300 hover:text-blue-400" onClick={() => window.scrollTo(0, 0)}>Home</Link>
              </li>
              <li>
                <Link to="/inventory" className="text-gray-300 hover:text-blue-400">Inventory</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-blue-400">Contact Us</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-blue-400">Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-300 mb-4">
              <li>1166 Schulte Hill Dr, Saint Louis, MO 63043</li>
              <li>314-358-6905</li>
              <li>krishnarebounz@gmail.com</li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Business Hours</h4>
            <ul className="text-gray-300">
              <li>Mon-Fri: 09:00 - 17:00</li>
              <li>Saturday: 19:49 - 19:49</li>
              <li>Sunday: Closed</li>
            </ul>
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