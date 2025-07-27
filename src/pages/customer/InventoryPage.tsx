import React, { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight, Search, Car } from 'lucide-react';
import VehicleCard from '../../components/VehicleCard';
import { getInventory, getCategories, getVehicleStatuses, type InventoryFilters, type PaginationInfo } from '../../services/inventory';
import { Vehicle as VehicleType } from '../../types/vehicle';
import AlertState from '../../components/ErrorState';
import useDebounce from '../../hooks/useDebounce';
import { useSearchParams } from 'react-router-dom';

interface Vehicle extends VehicleType {
  // Add any additional properties that might be returned from the backend
}

const InventoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [categories, setCategories] = useState<{ bodyTypes: { [key: string]: number }; fuelTypes: { [key: string]: number } }>({ bodyTypes: {}, fuelTypes: {} }); // Updated state for separated categories
  const [vehicleStatuses, setVehicleStatuses] = useState<{ [key: string]: number }>({}); // New state for vehicle statuses
  
  // Initialize search input from URL parameters
  const getInitialSearchInput = (): string => {
    const make = searchParams.get('make') || '';
    const model = searchParams.get('model') || '';
    const year = searchParams.get('year') || '';
    const searchTerms = [make, model, year].filter(Boolean);
    return searchTerms.join(' ');
  };
  
  const [searchInput, setSearchInput] = useState(getInitialSearchInput);
  
  // Initialize filters from URL parameters
  const getInitialFilters = (): InventoryFilters => {
    const make = searchParams.get('make') || '';
    const model = searchParams.get('model') || '';
    const year = searchParams.get('year') || '';
    const bodyType = searchParams.get('body_type') || 'all';
    const fuelType = searchParams.get('fuel_type') || 'all';
    const minPrice = searchParams.get('min_price') || '';
    const maxPrice = searchParams.get('max_price') || '';
    
    // Combine make, model, year into search term
    const searchTerms = [make, model, year].filter(Boolean);
    const search = searchTerms.length > 0 ? searchTerms.join(' ') : '';
    
    return {
      body_type: bodyType === 'all' ? undefined : bodyType,
      fuel_type: fuelType === 'all' ? undefined : fuelType,
      limit: 12,
      page: 1,
      search: search,
      sort_by: 'date_added',
      sort_order: 'desc',
      status: 'available',
      min_price: minPrice ? parseFloat(minPrice) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice) : undefined
    };
  };
  
  const [filters, setFilters] = useState<InventoryFilters>(getInitialFilters);

  // Debounce search term
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        console.log('Fetching vehicles with filters:', JSON.stringify(filters, null, 2));
        const response = await getInventory(filters);
        console.log('Got response:', response);
        if (response.success) {
          setVehicles(response.vehicles || []);
          setPagination(response.pagination || null);
          setError(null);
        } else {
          setError(response.error || 'Failed to load vehicles');
        }
      } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          console.error('Failed to load categories:', response.error);
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch vehicle statuses on component mount
  useEffect(() => {
    const fetchVehicleStatuses = async () => {
      try {
        const response = await getVehicleStatuses();
        if (response.success && response.data) {
          setVehicleStatuses(response.data);
        } else {
          console.error('Failed to load vehicle statuses:', response.error);
        }
      } catch (err: any) {
        console.error('Error fetching vehicle statuses:', err);
      }
    };
    fetchVehicleStatuses();
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchInput(value);
    } else {
      // Handle body_type and fuel_type filters - convert 'all' to undefined
      let filterValue: string | undefined;
      if ((name === 'body_type' || name === 'fuel_type') && value === 'all') {
        filterValue = undefined;
      } else {
        filterValue = value;
      }
      console.log(`Filter change - ${name}:`, value, '->', filterValue);
      setFilters(prev => ({ ...prev, [name]: filterValue, page: 1 }));
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!pagination || newPage <= pagination.total_pages)) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      body_type: undefined,
      fuel_type: undefined,
      limit: 12,
      page: 1,
      search: '',
      sort_by: 'date_added',
      sort_order: 'desc',
      status: 'available'
    });
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  // Results per page options
  const resultsPerPageOptions = [6, 12, 24, 48];

  // Handle results per page change
  const handleResultsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="animate-pulse">
                  <div className="aspect-[16/10] bg-gray-200" />
                  <div className="p-4 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AlertState
          error={error}
          variant="server"
          title="Failed to Load Inventory"
          description="We couldn't load the vehicle inventory. This might be due to a network issue or server problem."
        />
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Vehicle Inventory</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our carefully selected collection of quality pre-owned vehicles. Find your perfect car with confidence.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Filter className="w-5 h-5" />
                    Filters
                  </h2>
                  <button 
                    onClick={resetFilters}
                    className="text-sm text-blue-100 hover:text-white font-medium transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    Search Vehicles
                  </label>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search make, model, or year..."
                    value={searchInput}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    Vehicle Body Type
                  </label>
                  <select 
                    name="body_type" 
                    value={filters.body_type || 'all'}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Body Types</option>
                    {Object.entries(categories.bodyTypes || {}).map(([bodyType, count]) => (
                      <option key={bodyType} value={bodyType}>
                        {bodyType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({count})
                      </option>
                    ))}
                    {(!categories.bodyTypes || Object.keys(categories.bodyTypes).length === 0) && (
                      <option value="" disabled>No body types available</option>
                    )}
                  </select>
                </div>

                {/* Fuel Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    Fuel Type
                  </label>
                  <select 
                    name="fuel_type" 
                    value={filters.fuel_type || 'all'}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Fuel Types</option>
                    {Object.entries(categories.fuelTypes || {}).map(([fuelType, count]) => (
                      <option key={fuelType} value={fuelType}>
                        {fuelType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({count})
                      </option>
                    ))}
                    {(!categories.fuelTypes || Object.keys(categories.fuelTypes).length === 0) && (
                      <option value="" disabled>No fuel types available</option>
                    )}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sort By
                  </label>
                  <select 
                    name="sort_by"
                    value={filters.sort_by}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="date_added">Newest Arrivals</option>
                    <option value="price">Price</option>
                    <option value="year">Year</option>
                    <option value="mileage">Mileage</option>
                    <option value="make">Make</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sort Order
                  </label>
                  <select 
                    name="sort_order"
                    value={filters.sort_order}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="desc">High to Low</option>
                    <option value="asc">Low to High</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Vehicle Status
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Vehicles</option>
                    {Object.entries(vehicleStatuses).map(([status, count]) => (
                      <option key={status} value={status}>
                        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({count})
                      </option>
                    ))}
                    {Object.keys(vehicleStatuses).length === 0 && (
                      <option value="" disabled>No statuses available</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Summary and Results Per Page */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{vehicles.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{pagination?.total_items || 0}</span> vehicles
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="results-per-page" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Results per page:
                  </label>
                  <select
                    id="results-per-page"
                    value={String(filters.limit)}
                    onChange={handleResultsPerPageChange}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  >
                    {resultsPerPageOptions.map(opt => (
                      <option key={opt} value={String(opt)}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-600 mb-6">No vehicles match your current search criteria.</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {vehicles.map(vehicle => (
                    <VehicleCard
                      key={vehicle.id}
                      id={Number(vehicle.id)}
                      make={vehicle.make}
                      model={vehicle.model}
                      year={vehicle.year ?? 0}
                      price={vehicle.price}
                      mileage={vehicle.mileage ?? 0}
                      image={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : ''}
                      condition={vehicle.condition ?? ''}
                      tags={vehicle.tags ?? []}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page <= 1}
                      className={`p-3 rounded-lg border transition-colors ${
                        pagination.current_page > 1
                          ? 'border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50'
                          : 'border-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(Math.max(1, pagination.total_pages))].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`min-w-[3rem] h-12 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            pagination.current_page === i + 1
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
                          }`}
                          aria-current={pagination.current_page === i + 1 ? 'page' : undefined}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page >= (pagination.total_pages || 1)}
                      className={`p-3 rounded-lg border transition-colors ${
                        pagination.current_page < (pagination.total_pages || 1)
                          ? 'border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50'
                          : 'border-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;