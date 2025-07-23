import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import React, { useState } from 'react';

interface VehicleImageGalleryProps {
  images: string[];
  make: string;
  model: string;
}

const VehicleImageGallery: React.FC<VehicleImageGalleryProps> = ({ images, make, model }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (!images) return;
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    if (!images) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        {/* Main Image Container */}
        <div 
          className="relative w-full bg-gray-100"
          style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio for modern look
        >
          {images && images.length > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={images[currentImageIndex]}
                alt={`${make} ${model}`}
                className="w-full h-full object-contain bg-gray-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
                }}
              />

              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <button
                    onClick={previousImage}
                    className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}

              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images && images.length > 1 && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto py-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${make} ${model} thumbnail ${index + 1}`}
                    className="w-full h-full object-contain bg-gray-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/80x80?text=NA';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleImageGallery; 