import React, { useState, useEffect } from 'react';
import { Mail, Phone, Save, Edit, X } from 'lucide-react';
import { getBusinessSettings, updateBusinessSettings, type BusinessSettings } from '../../services/businessSettings';

const defaultBusinessData: BusinessSettings = {
  businessName: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: '',
  businessHours: {
    monday: { open: '', close: '' },
    tuesday: { open: '', close: '' },
    wednesday: { open: '', close: '' },
    thursday: { open: '', close: '' },
    friday: { open: '', close: '' },
    saturday: { open: '', close: '' },
    sunday: { open: null, close: null }
  },
  socialMedia: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  }
};

const WEEKDAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const BusinessSettingsPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [businessData, setBusinessData] = useState<BusinessSettings>(defaultBusinessData);
  const [originalData, setOriginalData] = useState<BusinessSettings>(defaultBusinessData);

  useEffect(() => {
    const fetchBusinessSettings = async () => {
      try {
        setLoading(true);
        const settings = await getBusinessSettings();
        setBusinessData(settings);
        setOriginalData(settings);
      } catch (err) {
        console.error('Failed to fetch business settings:', err);
        setError('Failed to load business settings');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
  };

  const handleHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setBusinessData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [type]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateBusinessSettings(businessData);
      setSuccess(true);
      setIsEditing(false);
      setBusinessData(result);
      setOriginalData(result);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update business settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setBusinessData(originalData);
    setIsEditing(false);
    setError(null);
  };

  if (loading && !businessData.businessName) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-20 w-20 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
            <p className="mt-2 text-gray-600">Manage your business information and contact details</p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center shadow-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Settings
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center border border-gray-300 shadow-sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg animate-slide-in-right">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg animate-slide-in-right">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Save className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Business settings updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
        <div className="p-8">
          <div className="max-w-3xl">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    name="businessName"
                    value={businessData.businessName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isEditing
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : 'border-gray-200 bg-gray-50'
                    } transition-all duration-200`}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      id="streetAddress"
                      type="text"
                      name="streetAddress"
                      value={businessData.streetAddress}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isEditing
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-gray-200 bg-gray-50'
                      } transition-all duration-200`}
                      placeholder={isEditing ? "Enter street address" : ""}
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      value={businessData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isEditing
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-gray-200 bg-gray-50'
                      } transition-all duration-200`}
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={businessData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isEditing
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-gray-200 bg-gray-50'
                      } transition-all duration-200`}
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      name="zipCode"
                      value={businessData.zipCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      maxLength={5}
                      pattern="[0-9]{5}"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isEditing
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-gray-200 bg-gray-50'
                      } transition-all duration-200`}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Phone
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={businessData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : 'border-gray-200 bg-gray-50'
                        } transition-all duration-200`}
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={businessData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : 'border-gray-200 bg-gray-50'
                        } transition-all duration-200`}
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
                <div className="space-y-4">
                  {WEEKDAYS.map(({ key, label }) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="font-medium text-gray-700">{label}</div>
                      <div>
                        <input
                          type="time"
                          value={businessData.businessHours[key]?.open || ''}
                          onChange={(e) => handleHoursChange(key, 'open', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isEditing
                              ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                              : 'border-gray-200 bg-gray-50'
                          } transition-all duration-200`}
                        />
                      </div>
                      <div>
                        <input
                          type="time"
                          value={businessData.businessHours[key]?.close || ''}
                          onChange={(e) => handleHoursChange(key, 'close', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isEditing
                              ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                              : 'border-gray-200 bg-gray-50'
                          } transition-all duration-200`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      id="facebook"
                      type="url"
                      name="facebook"
                      value={businessData.socialMedia.facebook}
                      onChange={handleSocialMediaChange}
                      disabled={!isEditing}
                      placeholder="https://facebook.com/your-page"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isEditing
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-gray-200 bg-gray-50'
                      } transition-all duration-200`}
                    />
                  </div>

                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter
                    </label>
                    <input
                      id="twitter"
                      type="url"
                      name="twitter"
                      value={businessData.socialMedia.twitter}
                      onChange={handleSocialMediaChange}
                      disabled={!isEditing}
                      placeholder="https://twitter.com/your-handle"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isEditing
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-gray-200 bg-gray-50'
                      } transition-all duration-200`}
                    />
                  </div>

                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      id="instagram"
                      type="url"
                      name="instagram"
                      value={businessData.socialMedia.instagram}
                      onChange={handleSocialMediaChange}
                      disabled={!isEditing}
                      placeholder="https://instagram.com/your-handle"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isEditing
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-gray-200 bg-gray-50'
                      } transition-all duration-200`}
                    />
                  </div>

                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      id="linkedin"
                      type="url"
                      name="linkedin"
                      value={businessData.socialMedia.linkedin}
                      onChange={handleSocialMediaChange}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/company/your-company"
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        isEditing
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-gray-200 bg-gray-50'
                      } transition-all duration-200`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettingsPage; 