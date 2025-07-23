import React, { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import VehicleCard from '../../components/VehicleCard';
import { getInventory, type InventoryFilters, type PaginationInfo, type FilterStats } from '../../services/inventory';
import { Vehicle as VehicleType } from '../../types/vehicle';
import AlertState from '../../components/ErrorState';
import useDebounce from '../../hooks/useDebounce';

interface Vehicle extends VehicleType {
  // Add any additional properties that might be returned from the backend
}

const InventoryPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed unused isFilterOpen state
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filterStats, setFilterStats] = useState<FilterStats | null>(null);
  const [searchInput, setSearchInput] = useState('');
  
  const [filters, setFilters] = useState<InventoryFilters>({
    category: 'all',
    limit: 9,
    page: 1,
    search: '',
    sort_by: 'date_added',
    sort_order: 'desc',
    status: 'available'
  });

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
        console.log('Fetching vehicles with filters:', filters);
        const response = await getInventory(filters);
        console.log('Got response:', response);
        if (response.success) {
          setVehicles(response.vehicles || []);
          setPagination(response.pagination || null);
          setFilterStats(response.filter_stats || null);
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

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchInput(value);
    } else {
      setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
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
      category: 'all',
      limit: 9,
      page: 1,
      search: '',
      sort_by: 'date_added',
      sort_order: 'desc',
      status: 'available'
    });
  };

  // Results per page options
  const resultsPerPageOptions = [5, 10, 25, 50, 100];

  // Handle results per page change
  const handleResultsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
          <div className="border-l-4 border-blue-600 pl-4">
            <h1 className="text-3xl font-bold text-gray-900">Our Inventory</h1>
            <p className="mt-2 text-gray-600">
          Browse our selection of quality pre-owned vehicles.
        </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="p-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    Filters
                  </h2>
              <button 
                onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                    Reset All
              </button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Category Filter */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select 
                    name="category" 
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="all">All Categories ({filterStats?.total_available || 0})</option>
                    {filterStats?.categories && Object.entries(filterStats.categories)
                      .filter(([_, count]) => count > 0)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([category, count]) => {
                        // Format category name for display
                        const displayName = category
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ');
                        
                        return (
                          <option key={category} value={category}>
                            {displayName} ({count})
                          </option>
                        );
                      })
                    }
                    {(!filterStats?.categories || Object.keys(filterStats.categories).length === 0) && (
                      <option value="" disabled>No categories available</option>
                    )}
                  </select>
              </div>

                {/* Search */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search make, model, or year"
                    value={searchInput}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
              </div>

                {/* Sort By */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                <select 
                    name="sort_by"
                    value={filters.sort_by}
                  onChange={handleFilterChange}
                    className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                <select 
                    name="sort_order"
                    value={filters.sort_order}
                  onChange={handleFilterChange}
                    className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="desc">High to Low</option>
                    <option value="asc">Low to High</option>
                </select>
              </div>

                {/* Status */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                    </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="all">All Vehicles</option>
                    <option value="available">Available ({filterStats?.total_available || 0})</option>
                    <option value="sold">Sold ({filterStats?.total_sold || 0})</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Summary and Results Per Page */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <span className="text-gray-600">
                Showing {vehicles.length} of {pagination?.total_items || 0} vehicles
              </span>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <label htmlFor="results-per-page" className="text-sm text-gray-700 mr-2 whitespace-nowrap">Results per page:</label>
                <select
                  id="results-per-page"
                  value={String(filters.limit)}
                  onChange={handleResultsPerPageChange}
                  className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 text-sm w-full md:w-auto"
                >
                  {resultsPerPageOptions.map(opt => (
                    <option key={opt} value={String(opt)}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-lg text-gray-600">No vehicles found matching your criteria.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* Pagination (always show, even if only one page or no results) */}
                {pagination && (
                  <div className="mt-8 flex justify-center items-center gap-2 w-full">
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page <= 1}
                      className={`p-2 rounded-lg border bg-white ${
                        pagination.current_page > 1
                          ? 'border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600'
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
                          className={`min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            pagination.current_page === i + 1
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-200'
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
                      className={`p-2 rounded-lg border bg-white ${
                        pagination.current_page < (pagination.total_pages || 1)
                          ? 'border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600'
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