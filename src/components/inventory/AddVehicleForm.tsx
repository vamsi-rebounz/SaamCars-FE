import {
  Calendar,
  Car,
  CheckCircle,
  DollarSign,
  FileText,
  Fuel,
  Gauge,
  Hash,
  Image as ImageIcon,
  MapPin,
  Palette,
  Plus,
  Settings,
  Shield,
  Star,
  Tag,
  Upload,
  Wrench,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { addVehicle, updateVehicle } from '../../services/inventory';
import { Vehicle } from '../../types/vehicle';

interface ExistingImage {
  id?: string;
  url: string;
  toDelete?: boolean;
}

interface AddVehicleFormProps {
  initialData?: Vehicle;
  onSuccess: () => void;
  isEditing?: boolean;
}

const AddVehicleForm: React.FC<AddVehicleFormProps> = ({
  initialData,
  onSuccess,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    vin: '',
    exterior_color: '',
    interior_color: '',
    transmission: '',
    body_type: '',
    description: '',
    status: 'available',
    tags: [] as string[],
    images: [] as File[],
    carfax_link: '',
    fuel_type: '',
    engine: '',
    condition: '',
    features: [] as string[],
    location: '',
    stock_number: '',
    is_featured: false,
    sold_price: String(initialData?.sold_price || '')
  });

  const [loading, setLoading] = useState(false);

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (initialData) {
      setFormData({
        make: initialData.make,
        model: initialData.model,
        year: initialData.year.toString(),
        price: initialData.price.toString(),
        mileage: initialData.mileage ? initialData.mileage.toString() : '',
        vin: initialData.vin || '',
        exterior_color: initialData.exterior_color || '',
        interior_color: initialData.interior_color || '',
        transmission: initialData.transmission || '',
        body_type: initialData.body_type || '',
        description: initialData.description || '',
        status: initialData.status || 'available',
        tags: initialData.tags || [],
        images: [],
        carfax_link: initialData.carfax_link || '',
        fuel_type: initialData.fuel_type || '',
        engine: initialData.engine || '',
        condition: initialData.condition || '',
        features: initialData.features || [],
        location: initialData.location || '',
        stock_number: initialData.stock_number || '',
        is_featured: initialData.is_featured || false,
        sold_price: String(initialData.sold_price || '')
      });
      
      // Load existing images for edit - handle both string array and object array formats
      if (initialData.images && Array.isArray(initialData.images)) {
        const processedImages = initialData.images.map((img: any, index: number) => ({
          id: `existing-${index}`,
          url: typeof img === 'string' ? img : (img.url || img.image_url || ''),
          toDelete: false,
        })).filter(img => img.url); // Filter out any empty URLs
        setExistingImages(processedImages);
      } else {
        setExistingImages([]);
      }
      
      // Reset new images and previews
      setNewImages([]);
      setPreviewUrls([]);
      setImageLoadErrors(new Set());
    } else {
      // Reset form for new vehicle
      setFormData({
        make: '',
        model: '',
        year: '',
        price: '',
        mileage: '',
        vin: '',
        exterior_color: '',
        interior_color: '',
        transmission: '',
        body_type: '',
        description: '',
        status: 'available',
        tags: [],
        images: [],
        carfax_link: '',
        fuel_type: '',
        engine: '',
        condition: '',
        features: [],
        location: '',
        stock_number: '',
        is_featured: false,
        sold_price: ''
      });
      setExistingImages([]);
      setNewImages([]);
      setPreviewUrls([]);
      setImageLoadErrors(new Set());
    }
    
    // Clear any previous error or success messages
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        // Only HTMLInputElement has 'checked'
        const checkbox = e.target as HTMLInputElement;
        const checked = checkbox.checked;
        if (name === 'tags') {
            const currentTags = formData.tags;
            if (checked) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...currentTags, value]
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    tags: currentTags.filter(tag => tag !== value)
                }));
            }
        } else if (name === 'features') {
            const currentFeatures = formData.features;
            if (checked) {
                setFormData(prev => ({
                    ...prev,
                    features: [...currentFeatures, value]
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    features: currentFeatures.filter(f => f !== value)
                }));
            }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);   

    // Basic validation
    if (!formData.make || !formData.model || !formData.year || !formData.price || !formData.vin || !formData.mileage || !formData.transmission || !formData.body_type || !formData.fuel_type || !formData.condition || !formData.description) {
      alert('Please fill in all required fields (Make, Model, Year, Price, VIN, Mileage, Transmission, Body Type, Fuel Type, Condition, Description)');
      setLoading(false);
      return;
    }

    // VIN validation (if provided)
    if (formData.vin && formData.vin.length < 10) {
      alert('VIN must be at least 10 characters long');
      setLoading(false);
      return;
    }

    // Carfax link validation (if provided)
    if (formData.carfax_link && formData.carfax_link.trim() !== '') {
      try {
        new URL(formData.carfax_link);
      } catch (error) {
        alert('Please enter a valid Carfax URL');
        setLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') return; // Handle images separately
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          // Handle empty strings properly - send empty string instead of "undefined" or "null"
          const stringValue = value?.toString() || '';
          formDataToSend.append(key, stringValue);
        }
      });

      // Add new images
      newImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Add list of existing images to delete
      const imagesToDelete = existingImages
        .filter(img => img.toDelete)
        .map(img => img.url);
      
      if (imagesToDelete.length > 0) {
        formDataToSend.append('images_to_delete', JSON.stringify(imagesToDelete));
      }

      // Add list of existing images to keep
      const existingImagesToKeep = existingImages
        .filter(img => !img.toDelete)
        .map(img => img.url);
      
      if (existingImagesToKeep.length > 0) {
        formDataToSend.append('existing_images', JSON.stringify(existingImagesToKeep));
      }

      console.log('Submitting form data:', {
        isEditing,
        formData: Object.fromEntries(formDataToSend.entries())
      });

      if (isEditing && initialData) {
        formDataToSend.append('id', initialData.id.toString());
        const response = await updateVehicle(formDataToSend);
        console.log('Update response:', response);
        
        if (response.success) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          console.error('Update failed:', response.error);
          alert(response.error || 'Failed to update vehicle');
        }
      } else {
        const response = await addVehicle(formDataToSend);
        console.log('Add response:', response);
        console.log('Response success:', response.success);
        console.log('Response error:', response.error);
        console.log('Response vehicle:', response.vehicle);
        
        if (response.success) {
          console.log('Setting success message');
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          console.error('Add failed:', response.error);
          alert(response.error || 'Failed to add vehicle');
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      alert('An error occurred while saving the vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Update Vehicle' : 'Add New Vehicle'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditing ? 'Update vehicle information and details' : 'Add a new vehicle to your inventory'}
                </p>
                <p className="text-sm text-red-600 mt-2">
                  * Required fields
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="h-4 w-4 inline mr-2 text-gray-400" />
                  Make *
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Toyota, Honda, Ford"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="h-4 w-4 inline mr-2 text-gray-400" />
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Camry, Civic, F-150"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2 text-gray-400" />
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder="e.g., 2023"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-2 text-gray-400" />
                  VIN *
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  required
                  maxLength={17}
                  placeholder="17-character VIN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Gauge className="h-4 w-4 inline mr-2 text-gray-400" />
                  Mileage *
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-2 text-gray-400" />
                  Stock Number
                </label>
                <input
                  type="text"
                  name="stock_number"
                  value={formData.stock_number}
                  onChange={handleInputChange}
                  placeholder="e.g., STK001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Status Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Pricing & Status</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2 text-gray-400" />
                  List Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g., 25000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2 text-gray-400" />
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
                  placeholder="e.g., 24000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-2 text-gray-400" />
                  Status *
                </label>
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
                  <option value="auction">Auction</option>
                </select>
              </div>

              <div className="flex items-center justify-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Vehicle Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Vehicle Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="h-4 w-4 inline mr-2 text-gray-400" />
                  Exterior Color
                </label>
                <input
                  type="text"
                  name="exterior_color"
                  value={formData.exterior_color}
                  onChange={handleInputChange}
                  placeholder="e.g., Pearl White"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="h-4 w-4 inline mr-2 text-gray-400" />
                  Interior Color
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Settings className="h-4 w-4 inline mr-2 text-gray-400" />
                  Transmission *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="h-4 w-4 inline mr-2 text-gray-400" />
                  Body Type *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Fuel className="h-4 w-4 inline mr-2 text-gray-400" />
                  Fuel Type *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Wrench className="h-4 w-4 inline mr-2 text-gray-400" />
                  Engine
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="h-4 w-4 inline mr-2 text-gray-400" />
                  Condition *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2 text-gray-400" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Lot, Service Bay"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-2 text-gray-400" />
                  Carfax Link
                </label>
                <input
                  type="text"
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
              <div className="p-2 bg-amber-100 rounded-lg mr-3">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Features & Tags</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Zap className="h-4 w-4 inline mr-2 text-gray-400" />
                  Vehicle Features
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Bluetooth', 'Backup Camera', 'Navigation', 'Heated Seats', 'Sunroof', 'Remote Start', 'Blind Spot Monitor', 'Apple CarPlay', 'Android Auto'].map(feature => (
                    <label key={feature} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        name="features"
                        value={feature}
                        checked={formData.features.includes(feature)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Tag className="h-4 w-4 inline mr-2 text-gray-400" />
                  Vehicle Tags
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['New Arrival', 'Featured', 'Price Drop', 'Low Mileage', 'Certified', 'One Owner', 'Clean History'].map(tag => (
                    <label key={tag} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        name="tags"
                        value={tag}
                        checked={formData.tags.includes(tag)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Description & Notes</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                placeholder="Describe the vehicle's condition, history, and any special features..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Vehicle Images Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                <ImageIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Vehicle Images</h2>
            </div>
            
            <div className="space-y-6">
              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Vehicle Images
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isEditing 
                      ? "Select new images to add to existing images. Use the × button on existing images to remove them."
                      : "Select multiple images to upload. Supported formats: JPG, PNG, GIF"
                    }
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Choose Images
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {(existingImages.length > 0 || previewUrls.length > 0) && (
                <div className="space-y-6">
                  {isEditing && existingImages.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800">
                        <strong>Image Management:</strong> New images will be added to your existing images. 
                        To remove existing images, click the × button on them. Images marked with red border will be deleted.
                      </p>
                    </div>
                  )}
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Current Images</h4>
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
                                onLoad={() => {
                                  setImageLoadErrors(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(idx);
                                    return newSet;
                                  });
                                }}
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-200 rounded-xl border-2 border-gray-300 flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Failed to load</span>
                              </div>
                            )}
                            <div className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded-lg ${
                              image.toDelete ? 'bg-red-600' : 'bg-gray-600'
                            }`}>
                              {image.toDelete ? 'To Delete' : 'Current'}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExistingImageForDeletion(idx);
                              }}
                              className={`absolute top-2 right-2 text-white p-1 rounded-full transition-colors duration-200 w-6 h-6 flex items-center justify-center text-xs ${
                                image.toDelete 
                                  ? 'bg-green-500 hover:bg-green-600' 
                                  : 'bg-red-500 hover:bg-red-600'
                              }`}
                              title={image.toDelete ? 'Keep this image' : 'Mark for deletion'}
                            >
                              {image.toDelete ? '✓' : '×'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  {previewUrls.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-600 mb-3">
                        New Images (will be added to existing images)
                      </h4>
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
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200 w-6 h-6 flex items-center justify-center text-xs"
                              title="Remove image"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg">
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
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Vehicle' : 'Add Vehicle'}
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

export default AddVehicleForm; 