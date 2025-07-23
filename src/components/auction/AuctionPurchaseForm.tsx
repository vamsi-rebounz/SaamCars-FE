import React, { useState, useEffect } from 'react';
import { addAuctionPurchase, updateAuctionPurchase } from '../../services/auction';
import { 
  X, 
  DollarSign, 
  Car, 
  Calendar, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  Settings,
  Star
} from 'lucide-react';

interface ExistingImage {
  id?: string;
  url: string;
  toDelete?: boolean;
}

interface FormData {
  // Vehicle fields
  make: string;
  model: string;
  year: string;
  mileage: string;
  vin: string;
  exterior_color: string;
  interior_color: string;
  transmission: string;
  body_type: string;
  description: string;
  status: string;
  condition: string;
  fuel_type: string;
  tags: string[];
  carfax_link: string;
  // Auction fields
  purchase_date: string;
  purchase_price: string;
  additional_costs: string;
  list_price: string;
  sold_price: string;
  notes: string;
  features: string[];
  engine: string;
  location: string;
  stock_number: string;
  is_featured: boolean;
}

interface AuctionPurchaseFormProps {
  initialData?: any;
  onSuccess: () => void;
  isEditing?: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  make: '',
  model: '',
  year: '',
  mileage: '',
  vin: '',
  exterior_color: '',
  interior_color: '',
  transmission: '',
  body_type: '',
  description: '',
  status: 'reserved', // Changed from 'auction' to 'reserved'
  condition: 'used',
  fuel_type: '',
  tags: [],
  carfax_link: '',
  purchase_date: new Date().toISOString().split('T')[0],
  purchase_price: '',
  additional_costs: '',
  list_price: '',
  sold_price: '',
  notes: '',
  features: [],
  engine: '',
  location: '',
  stock_number: '',
  is_featured: false
};

const AuctionPurchaseForm: React.FC<AuctionPurchaseFormProps> = ({
  initialData,
  onSuccess,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...INITIAL_FORM_DATA,
        ...initialData,
        year: initialData.year?.toString() || '',
        mileage: initialData.mileage?.toString() || '',
        purchase_price: initialData.purchase_price?.toString() || '',
        additional_costs: initialData.additional_costs?.toString() || '',
        list_price: initialData.list_price?.toString() || '',
        sold_price: initialData.sold_price?.toString() || '',
        purchase_date: initialData.purchase_date ? new Date(initialData.purchase_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
        features: Array.isArray(initialData.features) ? initialData.features : [],
        is_featured: initialData.is_featured || false
      });

      if (initialData.images && Array.isArray(initialData.images)) {
        const processedImages = initialData.images
          .map((img: any, index: number) => ({
            id: `existing-${index}`,
            url: typeof img === 'string' ? img : (img.url || img.image_url || ''),
            toDelete: false,
          }))
          .filter((img: ExistingImage) => img.url);
        setExistingImages(processedImages);
      }
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const checked = checkbox.checked;
      if (name === 'tags') {
        setFormData(prev => ({
          ...prev,
          tags: checked 
            ? [...prev.tags, value]
            : prev.tags.filter(tag => tag !== value)
        }));
      } else if (name === 'features') {
        setFormData(prev => ({
          ...prev,
          features: checked 
            ? [...prev.features, value]
            : prev.features.filter(feature => feature !== value)
        }));
      } else if (name === 'is_featured') {
        setFormData(prev => ({
          ...prev,
          is_featured: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...filesArray]);
      const urls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...urls]);
    }
  };

  const removeNewImage = (index: number) => {
    const urlToRevoke = previewUrls[index];
    URL.revokeObjectURL(urlToRevoke);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageError = (index: number, type: 'existing' | 'new') => {
    if (type === 'existing') {
      setImageLoadErrors(prev => new Set(prev).add(index));
    }
  };

  const toggleExistingImageForDeletion = (index: number) => {
    setExistingImages(prev => 
      prev.map((img, i) => 
        i === index ? { ...img, toDelete: !img.toDelete } : img
      )
    );
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();

      console.log('Form data before submission:', formData);

      // Append all fields except images
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images') {
          if (key === 'tags' || key === 'features') {
            formDataToSend.append(key, JSON.stringify(value || []));
          } else if (key === 'is_featured') {
            formDataToSend.append(key, value ? 'true' : 'false');
          } else {
            formDataToSend.append(key, value as string);
          }
        }
      });

      // Append new images
      newImages.forEach((file: File) => {
        formDataToSend.append('images', file);
      });

      // Handle existing images
      const imagesToDelete = existingImages
        .filter(img => img.toDelete)
        .map(img => img.url);
      
      if (imagesToDelete.length > 0) {
        formDataToSend.append('images_to_delete', JSON.stringify(imagesToDelete));
      }

      const existingImagesToKeep = existingImages
        .filter(img => !img.toDelete)
        .map(img => img.url);
      
      if (existingImagesToKeep.length > 0) {
        formDataToSend.append('existing_images', JSON.stringify(existingImagesToKeep));
      }

      // Debug FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      if (isEditing && initialData?.id) {
        formDataToSend.append('id', initialData.id.toString());
        const response = await updateAuctionPurchase(formDataToSend);
        if (response.success) {
          setSuccess('Auction purchase updated successfully!');
          onSuccess();
        } else {
          setError(response.error || 'Failed to update auction purchase');
        }
      } else {
        const response = await addAuctionPurchase(formDataToSend);
        console.log('Add auction purchase response:', response);
        if (response.success) {
          setSuccess('Auction purchase added successfully!');
          onSuccess();
        } else {
          setError(response.error || 'Failed to add auction purchase');
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An error occurred while saving the auction purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Fixed Alert Messages at Top of Page */}
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] max-w-md w-full mx-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-green-800">Success!</h3>
                  <p className="text-xs text-green-700 mt-1">{success}</p>
                </div>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="flex-shrink-0 ml-4 text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] max-w-md w-full mx-4">
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-800">Error</h3>
                  <p className="text-xs text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 ml-4 text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Auction Purchase' : 'Add Auction Purchase'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditing ? 'Update auction purchase details' : 'Record a new vehicle purchase from auction'}
                </p>
              </div>
            </div>
          </div>

          {/* Auction Purchase Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Auction Purchase Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2 text-gray-500" />
                  Purchase Date *
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2 text-gray-500" />
                  Purchase Price *
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2 text-gray-500" />
                  Additional Costs
                </label>
                <input
                  type="number"
                  name="additional_costs"
                  value={formData.additional_costs}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2 text-gray-500" />
                  List Price
                </label>
                <input
                  type="number"
                  name="list_price"
                  value={formData.list_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2 text-gray-500" />
                  Sold Price
                </label>
                <input
                  type="number"
                  name="sold_price"
                  value={formData.sold_price}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      sold_price: value,
                      status: value && parseFloat(value) > 0 ? 'sold' : prev.status
                    }));
                  }}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Car className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Make *</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Toyota"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Camry"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder="2023"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage *</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="50000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">VIN *</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  required
                  maxLength={17}
                  placeholder="1HGBH41JXMN109186"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Number *</label>
                <input
                  type="text"
                  name="stock_number"
                  value={formData.stock_number}
                  onChange={handleInputChange}
                  required
                  placeholder="STK123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission *</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select transmission</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="cvt">CVT</option>
                  <option value="semi_automatic">Semi-Automatic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Body Type *</label>
                <select
                  name="body_type"
                  value={formData.body_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select body type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="minivan">Minivan</option>
                  <option value="van">Van</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type *</label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select fuel type</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="plug_in_hybrid">Plug-in Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="certified_pre_owned">Certified Pre-Owned</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exterior Color</label>
                <input
                  type="text"
                  name="exterior_color"
                  value={formData.exterior_color}
                  onChange={handleInputChange}
                  placeholder="e.g., White"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Interior Color</label>
                <input
                  type="text"
                  name="interior_color"
                  value={formData.interior_color}
                  onChange={handleInputChange}
                  placeholder="e.g., Black"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Engine</label>
                <input
                  type="text"
                  name="engine"
                  value={formData.engine}
                  onChange={handleInputChange}
                  placeholder="e.g., 2.5L 4-Cylinder"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Auction House Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Carfax Report Link</label>
                <input
                  type="url"
                  name="carfax_link"
                  value={formData.carfax_link}
                  onChange={handleInputChange}
                  placeholder="https://www.carfax.com/vehicle/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Features & Tags Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Features & Tags</h2>
            </div>

            {/* Featured Checkbox */}
            <div className="mb-6">
              <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3 flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm font-semibold text-gray-700">Mark as Featured Vehicle</span>
                </div>
              </label>
            </div>

            {/* Features */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Vehicle Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {['Bluetooth', 'Backup Camera', 'Navigation', 'Heated Seats', 'Sunroof', 'Remote Start', 'Blind Spot Monitor', 'Apple CarPlay', 'Android Auto'].map(feature => (
                  <label key={feature} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      name="features"
                      value={feature}
                      checked={formData.features.includes(feature)}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Vehicle Tags</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {['New Arrival', 'Featured', 'Price Drop', 'Low Mileage', 'Certified', 'One Owner', 'Clean History'].map(tag => (
                  <label key={tag} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      name="tags"
                      value={tag}
                      checked={formData.tags.includes(tag)}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Description & Notes Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Description & Notes</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Describe the vehicle's features, condition, and any notable details..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Auction Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Add any additional notes about the auction purchase, repairs needed, or special considerations..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <ImageIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Vehicle Images</h2>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {isEditing 
                  ? "Select new images to add to existing images. Use the × button on existing images to remove them."
                  : "Select multiple images to upload. Supported formats: JPG, PNG, GIF"
                }
              </p>
            </div>

            {/* Image Preview */}
            {(existingImages.length > 0 || previewUrls.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Preview</h3>
                
                {isEditing && existingImages.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <strong>Image Management:</strong> New images will be added to your existing images. 
                      To remove existing images, click the × button on them. Images marked with red border will be deleted.
                    </p>
                  </div>
                )}
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-600 mb-3">Current Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {existingImages.map((image, idx) => (
                        <div key={`existing-${idx}`} className="relative group">
                          {!imageLoadErrors.has(idx) ? (
                            <img
                              src={image.url}
                              alt={`Existing vehicle image ${idx + 1}`}
                              className={`w-full h-32 object-cover rounded-xl border-2 ${
                                image.toDelete ? 'border-red-300 opacity-50' : 'border-gray-200'
                              }`}
                              onError={() => handleImageError(idx, 'existing')}
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded-xl border-2 border-gray-300 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">Failed to load</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleExistingImageForDeletion(idx)}
                            className={`absolute top-2 right-2 p-1 rounded-full ${
                              image.toDelete 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-red-500 text-white hover:bg-red-600'
                            } transition-colors duration-200`}
                            title={image.toDelete ? 'Keep image' : 'Remove image'}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full ${
                            image.toDelete ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                          }`}>
                            {image.toDelete ? 'To Delete' : 'Current'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {previewUrls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-600 mb-3">New Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {previewUrls.map((url, idx) => (
                        <div key={`preview-${idx}`} className="relative group">
                          <img
                            src={url}
                            alt={`New vehicle image ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-xl border-2 border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {isEditing ? 'Update Auction Purchase' : 'Add Auction Purchase'}
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuctionPurchaseForm; 