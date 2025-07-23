import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Gauge, Heart } from 'lucide-react';

interface VehicleCardProps {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  image?: string;
  condition?: string;
  tags: string[];
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  id,
  make,
  model,
  year,
  price,
  mileage,
  image,
  condition,
  tags
}) => {
  const defaultImage = 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className="relative overflow-hidden" style={{ paddingBottom: '66.67%' }}> {/* 3:2 aspect ratio */}
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-2">
            {tags.includes('New Arrivals') && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                New
              </span>
            )}
            {tags.includes('Featured Vehicles') && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Featured
              </span>
            )}
            {tags.includes('On Sale') && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Sale
              </span>
            )}
            {tags.includes('Low Mileage') && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                Low Mileage
              </span>
            )}
            {tags.includes('Certified Pre-Owned') && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Certified
              </span>
            )}
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            // Implement wishlist functionality
          }}
        >
          <Heart className="w-5 h-5" />
        </button>
        
        {/* Image */}
        <Link to={`/inventory/${id}`} className="block absolute inset-0">
          <img 
            src={image || defaultImage} 
            alt={`${year} ${make} ${model}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
        </Link>
      </div>
      
      <div className="p-4">
        {/* Title */}
        <Link to={`/inventory/${id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
            {year} {make} {model}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="mt-2 mb-4">
          <span className="text-2xl font-bold text-blue-600">
            ${price.toLocaleString()}
          </span>
        </div>
        
        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-gray-400" />
            <span>{mileage.toLocaleString()} mi</span>
          </div>
          {condition && (
            <div className="col-span-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{condition} Condition</span>
            </div>
          )}
        </div>
        
        {/* Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link 
            to={`/inventory/${id}`} 
            className="block w-full py-2.5 px-4 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;