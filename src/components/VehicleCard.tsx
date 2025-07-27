import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gauge, Car } from 'lucide-react';

interface VehicleCardProps {
  id: string | number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image Section */}
      <div className="relative" style={{ paddingBottom: '65%' }}>
        <Link to={`/inventory/${id}`} className="block absolute inset-0">
          <img 
            src={image || defaultImage} 
            alt={`${year} ${make} ${model}`} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
        </Link>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5">
            {tags.includes('New Arrivals') && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-500 text-white shadow-sm">New</span>
            )}
            {tags.includes('Featured Vehicles') && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-500 text-white shadow-sm">Featured</span>
            )}
            {tags.includes('On Sale') && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-red-500 text-white shadow-sm">Sale</span>
            )}
            {tags.includes('Low Mileage') && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-purple-500 text-white shadow-sm">Low Mileage</span>
            )}
            {tags.includes('Certified Pre-Owned') && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-yellow-500 text-white shadow-sm">Certified</span>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Vehicle Title */}
        <Link to={`/inventory/${id}`} className="block mb-2">
          <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight">
            {year} {make} {model}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-4">
          <span className="text-xl font-bold text-blue-700">
            ${price.toLocaleString()}
          </span>
        </div>

        {/* Vehicle Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium">{year}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Gauge className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium">
              {mileage ? `${mileage.toLocaleString()} miles` : 'Mileage N/A'}
            </span>
          </div>
          
          {condition && (
            <div className="flex items-center gap-2 text-gray-600">
              <Car className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium capitalize">{condition} Condition</span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <Link 
          to={`/inventory/${id}`} 
          className="block w-full py-3 px-4 text-center text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;