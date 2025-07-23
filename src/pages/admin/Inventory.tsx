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
  Filter,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X
} from 'lucide-react';
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

const Inventory: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [sortField, setSortField] = useState('date_added');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  // Debounce search term
  const debouncedSearch = useDebounce(searchInput, 500);

  const navigate = useNavigate();

  console.log('Inventory component rendering with state:', { 
    loading, 
    error, 
    vehiclesCount: vehicles.length,
    searchInput,
    sortField,
    sortDirection,
    currentPage,
    filterStatus,
    pagination
  });

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    console.log('Fetching vehicles with filters:', {
      search: debouncedSearch,
      sort_by: sortField,
      sort_order: sortDirection,
      page: currentPage,
      limit: itemsPerPage,
      status: filterStatus
    });
    
    setLoading(true);
    setError(null);
    try {
      const validSortFields = ['date_added', 'price', 'year', 'mileage', 'make'];
      const filters = {
        search: debouncedSearch,
        sort_by: validSortFields.includes(sortField) ? sortField as any : 'date_added',
        sort_order: sortDirection,
        page: currentPage,
        limit: itemsPerPage,
        ...(filterStatus && { status: filterStatus }),
      };
      const response = await getInventory(filters);
      console.log('API response:', response);
      if (response.success && response.vehicles) {
        setVehicles(response.vehicles);
        setPagination(response.pagination || null);
      } else {
        setError(response.error || 'Failed to fetch vehicles');
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles when dependencies change
  useEffect(() => {
    fetchVehicles();
  }, [debouncedSearch, sortField, sortDirection, currentPage, itemsPerPage, filterStatus]);

  // Filter and sort vehicles (client-side fallback)
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchString = `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.vin}`.toLowerCase();
    return searchString.includes(searchInput.toLowerCase());
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let aValue: any = a[sortField as keyof typeof a];
    let bValue: any = b[sortField as keyof typeof b];

    if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    const fieldMap: { [key: string]: string } = {
      make: 'make',
      year: 'year',
      price: 'price',
      mileage: 'mileage',
      created_at: 'date_added',  // Map created_at to date_added
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
        await fetchVehicles(); // Refetch to sync with backend
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.error || 'Failed to delete vehicle');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete vehicle');
      console.error('Error deleting vehicle:', err);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSelectedVehicle(null);
  };

  const handlePageChange = (page: number) => {
    if (pagination && (page < 1 || page > pagination.total_pages)) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    setSelectedVehicle(null);
    fetchVehicles(); // Refresh the list after edit
    // Clear form messages after 3 seconds
    setTimeout(() => {
      setFormSuccessMessage(null);
      setFormErrorMessage(null);
    }, 3000);
  };

  const handleAddComplete = () => {
    setShowAddModal(false);
    setError(null); // Clear any previous error
    fetchVehicles(); // Refresh the list after add
    // Clear form messages after 3 seconds
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
    navigate(`/admin/inventory/${id}`);
  };

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
      case 'sold':
        return { icon: Tag, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
      case 'maintenance':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
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
                  <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                  <p className="text-gray-600 mt-1">Manage your vehicle inventory efficiently</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search vehicles by make, model, year, or VIN..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-3" />
                <select
                  value={filterStatus}
                  onChange={handleFilterChange}
                  className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Vehicles</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          </div>
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
              {error ? 'There was an issue loading the inventory. Please try refreshing the page.' : 'Get started by adding your first vehicle to the inventory.'}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => fetchVehicles()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Retry
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First Vehicle
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
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        Price
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
                      onClick={() => handleSort('mileage')}
                    >
                      <div className="flex items-center">
                        Mileage
                        {sortField === 'mileage' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                            <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                        )}
                      </div>
                    </th>
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
                            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-sm font-semibold text-gray-900">
                              ${vehicle.price.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Car className="h-4 w-4 mr-2 text-gray-400" />
                            {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Simple Page Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 mt-4">
              <div className="flex items-center justify-center space-x-4">
                {/* Left Arrow Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination?.has_previous}
                  className={`p-2 rounded-lg border transition-colors ${
                    !pagination?.has_previous
                      ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400'
                  }`}
                  title="Previous Page"
                >
                  <ChevronDown className="h-5 w-5 rotate-90" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-2">
                  {pagination ? (
                    (() => {
                      const pages = [];
                      const totalPages = pagination.total_pages;
                      const current = pagination.current_page;
                      
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
                    })()
                  ) : (
                    <span className="text-gray-500">Loading...</span>
                  )}
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
          </div>
        )}


      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeAddModal}></div>
          
          {/* Modal content */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors z-10"
                  onClick={closeAddModal}
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mr-4">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Add New Vehicle
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Fill out the form below to add a new vehicle to the inventory.
                    </p>
                  </div>
                </div>

                <AddVehicleForm
                  onSuccess={handleAddComplete}
                  isEditing={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

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

export default Inventory;