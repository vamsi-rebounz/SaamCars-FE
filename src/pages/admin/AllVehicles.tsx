import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Edit,
  Image as ImageIcon,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertState from '../../components/ErrorState';
import AddVehicleForm from '../../components/inventory/AddVehicleForm';
import useDebounce from '../../hooks/useDebounce';
import { deleteVehicle, getInventory } from '../../services/inventory';
import { Vehicle as VehicleType } from '../../types/vehicle';

type Vehicle = VehicleType;

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_previous: boolean;
}

const AllVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [sortField, setSortField] = useState('date_added');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [purchaseType, setPurchaseType] = useState('');
  
  // Price range filters
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minPurchaseCost, setMinPurchaseCost] = useState<number | undefined>(undefined);
  const [maxPurchaseCost, setMaxPurchaseCost] = useState<number | undefined>(undefined);
  const [minAdditionalCosts, setMinAdditionalCosts] = useState<number | undefined>(undefined);
  const [maxAdditionalCosts, setMaxAdditionalCosts] = useState<number | undefined>(undefined);
  const [minSoldPrice, setMinSoldPrice] = useState<number | undefined>(undefined);
  const [maxSoldPrice, setMaxSoldPrice] = useState<number | undefined>(undefined);
  const [minProfit, setMinProfit] = useState<number | undefined>(undefined);
  const [maxProfit, setMaxProfit] = useState<number | undefined>(undefined);
  
  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term
  const debouncedSearch = useDebounce(searchInput, 500);

  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
              const validSortFields = isAdmin 
          ? ['date_added', 'price', 'year', 'make', 'bought_price', 'repair_costs', 'sold_price', 'profit']
          : ['date_added', 'price', 'year', 'make'];
      
      const filters = {
        search: debouncedSearch,
        sort_by: validSortFields.includes(sortField) ? sortField as any : 'date_added',
        sort_order: sortDirection,
        page: currentPage,
        limit: itemsPerPage,
        ...(isAdmin && purchaseType && { purchase_type: purchaseType }),
        ...(isAdmin && minPrice !== undefined && { min_price: minPrice }),
        ...(isAdmin && maxPrice !== undefined && { max_price: maxPrice }),
        ...(isAdmin && minPurchaseCost !== undefined && { min_purchase_cost: minPurchaseCost }),
        ...(isAdmin && maxPurchaseCost !== undefined && { max_purchase_cost: maxPurchaseCost }),
        ...(isAdmin && minAdditionalCosts !== undefined && { min_additional_costs: minAdditionalCosts }),
        ...(isAdmin && maxAdditionalCosts !== undefined && { max_additional_costs: maxAdditionalCosts }),
        ...(isAdmin && minSoldPrice !== undefined && { min_sold_price: minSoldPrice }),
        ...(isAdmin && maxSoldPrice !== undefined && { max_sold_price: maxSoldPrice }),
        ...(isAdmin && minProfit !== undefined && { min_profit: minProfit }),
        ...(isAdmin && maxProfit !== undefined && { max_profit: maxProfit }),
      };
      const response = await getInventory(filters);
      if (response.success && response.vehicles) {
        setVehicles(response.vehicles);
        setPagination(response.pagination || null);
      } else {
        setError(response.error || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [debouncedSearch, sortField, sortDirection, currentPage, itemsPerPage, purchaseType, minPrice, maxPrice, minPurchaseCost, maxPurchaseCost, minAdditionalCosts, maxAdditionalCosts, minSoldPrice, maxSoldPrice, minProfit, maxProfit]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const searchString = `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.vin}`.toLowerCase();
    return searchString.includes(searchInput.toLowerCase());
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let aValue: any = a[sortField as keyof typeof a];
    let bValue: any = b[sortField as keyof typeof b];
    
    // Handle date sorting
    if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Handle financial fields - treat null/undefined as 0 for sorting
    const financialFields = ['bought_price', 'repair_costs', 'sold_price', 'profit'];
    if (financialFields.includes(sortField)) {
      aValue = aValue || 0;
      bValue = bValue || 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    // Restrict financial fields to admin users only
    const financialFields = ['bought_price', 'repair_costs', 'sold_price', 'profit'];
    if (financialFields.includes(field) && !isAdmin) {
      return; // Prevent non-admin users from sorting by financial fields
    }
    
    const fieldMap: { [key: string]: string } = {
      make: 'make',
      year: 'year',
      price: 'price',
      created_at: 'date_added',
      ...(isAdmin && {
        bought_price: 'bought_price',
        repair_costs: 'repair_costs',
        sold_price: 'sold_price',
        profit: 'profit',
      }),
    };
    const apiField = fieldMap[field] || field;
    if (apiField === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(apiField);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    if (!selectedVehicleId) return;
    try {
      const response = await deleteVehicle(selectedVehicleId);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedVehicleId(null);
        setSuccessMessage('Vehicle deleted successfully!');
        await fetchVehicles();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.error || 'Failed to delete vehicle');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete vehicle');
    }
  };

  const handlePageChange = (page: number) => {
    if (pagination && (page < 1 || page > pagination.total_pages)) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    setSelectedVehicle(null);
    fetchVehicles();
    setTimeout(() => {
      setFormSuccessMessage(null);
      setFormErrorMessage(null);
    }, 3000);
  };

  const handleImageError = (vehicleId: string | number) => {
    setImageErrors(prev => ({
      ...prev,
      [vehicleId.toString()]: true
    }));
  };

  const handleVehicleClick = (id: string | number) => {
    navigate(`/admin/inventory/${id}`, { state: { from: 'all-vehicles' } });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
      case 'sold':
        return { icon: Tag, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
      case 'under_maintenance':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
      case 'under_inspection':
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
      case 'reserved':
        return { icon: Tag, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Form Success/Error Messages - Top of Page */}
      {formSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{formSuccessMessage}</span>
            </div>
            <button
              onClick={() => setFormSuccessMessage(null)}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {formErrorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{formErrorMessage}</span>
            </div>
            <button
              onClick={() => setFormErrorMessage(null)}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <AlertState
          variant="success"
          success={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Error Alert */}
      {error && (
        <AlertState
          variant="server"
          error={error}
          onClose={() => setError(null)}
          onRetry={fetchVehicles}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <div>
                                <h1 className="text-3xl font-bold text-gray-900">Sales Tracker</h1>
              <p className="text-gray-600 mt-1">Track sales performance, profits, and vehicle transaction history</p>
                </div>
              </div>
            </div>
            {/* Add Vehicle button removed for All Vehicles tab */}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search VIN, Make, Model"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="block w-full pl-12 pr-4 py-2 border-b-[1.5px] border-blue-600 rounded-none bg-transparent placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors text-sm"
                />
              </div>
            </div>
            {/* Purchase type - Admin Only */}
            {isAdmin && (
              <div className="flex items-center min-w-[180px]">
                <select
                  value={purchaseType}
                  onChange={e => setPurchaseType(e.target.value)}
                  className="block w-full pl-4 pr-8 py-2 text-sm border-b-[1.5px] border-blue-600 rounded-none bg-transparent focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors"
                >
                  <option value="" disabled>Purchase Type</option>
                  <option value="all">All</option>
                  <option value="auction">Bought in Auction</option>
                  <option value="individual">Bought from Individual</option>
                </select>
              </div>
            )}
            {/* Items per page */}
            <div className="flex items-center min-w-[160px] md:ml-4">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="block w-full pl-4 pr-8 py-2 text-sm border-b-[1.5px] border-blue-600 rounded-none bg-transparent focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          {/* Price Range Filters - Admin Only */}
          {isAdmin && (
            <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Financial Filters</h3>
                <p className="text-sm text-gray-600 mt-1">Filter vehicles by financial metrics and price ranges</p>
              </div>
              <div className="flex items-center space-x-3">
                {showFilters && (
                  <button
                    onClick={() => {
                      setMinPrice(undefined);
                      setMaxPrice(undefined);
                      setMinPurchaseCost(undefined);
                      setMaxPurchaseCost(undefined);
                      setMinAdditionalCosts(undefined);
                      setMaxAdditionalCosts(undefined);
                      setMinSoldPrice(undefined);
                      setMaxSoldPrice(undefined);
                      setMinProfit(undefined);
                      setMaxProfit(undefined);
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  {showFilters ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Filters
                    </>
                  )}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* List Price Range */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">List Price</h4>
                      <p className="text-xs text-gray-500">Current selling price</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        placeholder="$0"
                        value={minPrice || ''}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        placeholder="No limit"
                        value={maxPrice || ''}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Purchase Cost Range */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Purchase Cost</h4>
                      <p className="text-xs text-gray-500">Cost to acquire vehicle</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        placeholder="$0"
                        value={minPurchaseCost || ''}
                        onChange={(e) => setMinPurchaseCost(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        placeholder="No limit"
                        value={maxPurchaseCost || ''}
                        onChange={(e) => setMaxPurchaseCost(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Costs Range */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Additional Costs</h4>
                      <p className="text-xs text-gray-500">Repair & maintenance costs</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        placeholder="$0"
                        value={minAdditionalCosts || ''}
                        onChange={(e) => setMinAdditionalCosts(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        placeholder="No limit"
                        value={maxAdditionalCosts || ''}
                        onChange={(e) => setMaxAdditionalCosts(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Sold Price Range */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Sold Price</h4>
                      <p className="text-xs text-gray-500">Final sale price</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        placeholder="$0"
                        value={minSoldPrice || ''}
                        onChange={(e) => setMinSoldPrice(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        placeholder="No limit"
                        value={maxSoldPrice || ''}
                        onChange={(e) => setMaxSoldPrice(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Profit Range */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Profit</h4>
                      <p className="text-xs text-gray-500">Calculated profit margin</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        placeholder="$0"
                        value={minProfit || ''}
                        onChange={(e) => setMinProfit(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        placeholder="No limit"
                        value={maxProfit || ''}
                        onChange={(e) => setMaxProfit(e.target.value ? Number(e.target.value) : undefined)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Summary */}
            {(minPrice !== undefined || maxPrice !== undefined || minPurchaseCost !== undefined || maxPurchaseCost !== undefined || minAdditionalCosts !== undefined || maxAdditionalCosts !== undefined || minSoldPrice !== undefined || maxSoldPrice !== undefined || minProfit !== undefined || maxProfit !== undefined) && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Tag className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                  </div>
                  <button
                    onClick={() => {
                      setMinPrice(undefined);
                      setMaxPrice(undefined);
                      setMinPurchaseCost(undefined);
                      setMaxPurchaseCost(undefined);
                      setMinAdditionalCosts(undefined);
                      setMaxAdditionalCosts(undefined);
                      setMinSoldPrice(undefined);
                      setMaxSoldPrice(undefined);
                      setMinProfit(undefined);
                      setMaxProfit(undefined);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {minPrice !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Min Price: ${minPrice ? minPrice.toLocaleString() : '0'}
                    </span>
                  )}
                  {maxPrice !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Max Price: ${maxPrice ? maxPrice.toLocaleString() : '0'}
                    </span>
                  )}
                  {minPurchaseCost !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Min Purchase: ${minPurchaseCost ? minPurchaseCost.toLocaleString() : '0'}
                    </span>
                  )}
                  {maxPurchaseCost !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Max Purchase: ${maxPurchaseCost ? maxPurchaseCost.toLocaleString() : '0'}
                    </span>
                  )}
                  {minAdditionalCosts !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Min Costs: ${minAdditionalCosts ? minAdditionalCosts.toLocaleString() : '0'}
                    </span>
                  )}
                  {maxAdditionalCosts !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Max Costs: ${maxAdditionalCosts ? maxAdditionalCosts.toLocaleString() : '0'}
                    </span>
                  )}
                  {minSoldPrice !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Min Sold: ${minSoldPrice ? minSoldPrice.toLocaleString() : '0'}
                    </span>
                  )}
                  {maxSoldPrice !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Max Sold: ${maxSoldPrice ? maxSoldPrice.toLocaleString() : '0'}
                    </span>
                  )}
                  {minProfit !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Min Profit: ${minProfit ? minProfit.toLocaleString() : '0'}
                    </span>
                  )}
                  {maxProfit !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Max Profit: ${maxProfit ? maxProfit.toLocaleString() : '0'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-gray-300 h-16 w-16"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <Car className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error ? 'Error loading vehicles' : 'No vehicles found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {error ? 'There was an issue loading the inventory. Please try refreshing the page.' : 'No vehicles found.'}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => fetchVehicles()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Table */}
        {!loading && vehicles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Date Added
                        {sortField === 'date_added' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                            <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    {isAdmin && (
                      <>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('bought_price')}
                        >
                          <div className="flex items-center">
                            Purchase Cost
                            {sortField === 'bought_price' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                                <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('repair_costs')}
                        >
                          <div className="flex items-center">
                            Additional Costs
                            {sortField === 'repair_costs' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                                <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('price')}
                        >
                          <div className="flex items-center">
                            List Price
                            {sortField === 'price' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                                <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('sold_price')}
                        >
                          <div className="flex items-center">
                            Sold Price
                            {sortField === 'sold_price' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                                <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('profit')}
                        >
                          <div className="flex items-center">
                            Profit
                            {sortField === 'profit' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                                <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                            )}
                          </div>
                        </th>
                      </>
                    )}

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedVehicles.map((vehicle) => {
                    const statusInfo = getStatusInfo(vehicle.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <tr 
                        key={vehicle.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => handleVehicleClick(vehicle.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              {!imageErrors[vehicle.id] && vehicle.images && vehicle.images[0] ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                  src={vehicle.images[0]}
                                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                  onError={() => handleImageError(vehicle.id)}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                VIN: {vehicle.vin}
                              </div>
                              {vehicle.stock_number && (
                                <div className="text-xs text-gray-400">
                                  Stock: {vehicle.stock_number}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {vehicle.status === 'available' ? 'Available for Sale' :
                             vehicle.status === 'reserved' ? 'Reserved - Pending' :
                             vehicle.status === 'sold' ? 'Sold - Completed' :
                             vehicle.status === 'under_maintenance' ? 'In Service - Maintenance' :
                             vehicle.status === 'under_inspection' ? 'In Service - Inspection' :
                             vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                          </div>
                        </td>
                        {isAdmin && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-orange-600 mr-1" />
                                <span className="text-sm text-gray-900">
                                  {vehicle.bought_price ? vehicle.bought_price.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-yellow-600 mr-1" />
                                <span className="text-sm text-gray-900">
                                  {vehicle.repair_costs ? vehicle.repair_costs.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-blue-600 mr-1" />
                                <span className="text-sm font-semibold text-gray-900">
                                  {vehicle.price ? vehicle.price.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                <span className="text-sm text-gray-900">
                                  {vehicle.sold_price ? vehicle.sold_price.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <DollarSign className={`h-4 w-4 mr-1 ${vehicle.sold_price && vehicle.bought_price ? (vehicle.sold_price - vehicle.bought_price - (vehicle.repair_costs || 0)) > 0 ? 'text-green-600' : 'text-red-600' : 'text-gray-600'}`} />
                                <span className={`text-sm font-semibold ${vehicle.sold_price && vehicle.bought_price ? (vehicle.sold_price - vehicle.bought_price - (vehicle.repair_costs || 0)) > 0 ? 'text-green-600' : 'text-red-600' : 'text-gray-600'}`}>
                                  {vehicle.sold_price && vehicle.bought_price ? (vehicle.sold_price - vehicle.bought_price - (vehicle.repair_costs || 0)).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            </td>
                          </>
                        )}

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls (move to below table, center) */}
            {pagination && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 mt-4">
                <div className="flex items-center justify-center space-x-4">
                  {/* Left Arrow Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.has_previous}
                    className={`p-2 rounded-lg border transition-colors ${
                      !pagination.has_previous
                        ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                        : 'text-gray-500 border-gray-300 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400'
                    }`}
                    title="Previous Page"
                  >
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const pages = [];
                      const totalPages = pagination.total_pages;
                      const current = currentPage;
                      // Always show first page
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            current === 1
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                              : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          1
                        </button>
                      );
                      // Show ellipsis if there's a gap after page 1
                      if (current > 3) {
                        pages.push(
                          <span key="ellipsis-1" className="px-3 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      // Show pages around current page
                      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                        if (i !== 1 && i !== totalPages) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                current === i
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                      }
                      // Show ellipsis if there's a gap before last page
                      if (current < totalPages - 2) {
                        pages.push(
                          <span key="ellipsis-2" className="px-3 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      // Always show last page (if there is more than one page)
                      if (totalPages > 1) {
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              current === totalPages
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            {totalPages}
                          </button>
                        );
                      }
                      return pages;
                    })()}
                  </div>
                  {/* Right Arrow Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination?.has_next}
                    className={`p-2 rounded-lg border transition-colors ${
                      !pagination?.has_next
                        ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                        : 'text-gray-500 border-gray-300 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400'
                    }`}
                    title="Next Page"
                  >
                    <ChevronDown className="h-5 w-5 -rotate-90" />
                  </button>
                </div>
                {/* Page Info */}
                {pagination && (
                  <div className="text-center mt-3">
                    <p className="text-sm text-gray-600">
                      Page {pagination.current_page} of {pagination.total_pages} • {pagination.total_items} total vehicles
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}


      </div>

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
          
          {/* Modal content */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors z-10"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mr-4">
                    <Edit className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Edit Vehicle
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Update the vehicle information below.
                    </p>
                  </div>
                </div>

                <AddVehicleForm
                  initialData={selectedVehicle}
                  onSuccess={handleEditComplete}
                  isEditing={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Vehicle
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this vehicle? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllVehicles; 