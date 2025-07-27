import React from 'react';
import { Heart } from 'lucide-react';

const WishlistPage: React.FC = () => {
  // Always show coming soon message in the page (not as an alert)
  const comingSoonBanner = (
    <div className="flex flex-col items-center justify-center py-16">
      <Heart className="h-12 w-12 text-blue-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Wishlist Feature Coming Soon</h2>
      <p className="text-gray-600 text-lg max-w-xl text-center">
        You will be able to save and manage your favorite vehicles in a future update. Stay tuned!
      </p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <div className="flex items-center mb-8">
          <Heart className="h-6 w-6 text-red-500 mr-2" />
          <h1 className="heading-lg">My Wishlist</h1>
        </div>
        {comingSoonBanner}
      </div>
    </div>
  );
};

export default WishlistPage;