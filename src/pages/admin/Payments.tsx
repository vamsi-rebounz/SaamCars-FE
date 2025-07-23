import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Download, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  FileText,
  Plus,
  User,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  Car,
  Receipt,
  ExternalLink,
  Edit,
  Trash2,
  XCircle,
  Wrench
} from 'lucide-react';
import { fetchPayments, deletePayment } from '../../services/payments';
import ManualPaymentModal from '../../components/admin/ManualPaymentModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import ExportModal from '../../components/admin/ExportModal';
import AlertState from '../../components/ErrorState';
import Toast from '../../components/Toast';
import { Payment } from '../../types/payment';
import { PaymentExportData } from '../../utils/exportUtils';

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_previous: boolean;
}

const Payments: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  
  // Replace mock payments data with real data and loading/error state
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchAllPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        search: searchTerm,
        sort_by: sortField,
        sort_order: sortDirection,
        page: currentPage,
        limit: itemsPerPage,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterType !== 'all' && { type: filterType }),
      };
      
      const response = await fetchPayments(filters);
      console.log('Payments API response:', response);
      
      if (response.success && response.data && Array.isArray(response.data.payments)) {
        setPayments(response.data.payments);
        
        // Use server-side pagination if available, otherwise calculate client-side
        if (response.data.pagination) {
          console.log('Using server pagination:', response.data.pagination);
          setPagination(response.data.pagination);
        } else {
          console.log('Calculating client-side pagination');
          const totalPages = Math.ceil(response.data.payments.length / itemsPerPage);
          setPagination({
            current_page: currentPage,
            total_pages: totalPages,
            total_items: response.data.payments.length,
            items_per_page: itemsPerPage,
            has_next: currentPage < totalPages,
            has_previous: currentPage > 1
          });
        }
      } else {
        setError(response.error || 'Failed to fetch payments');
      }
    } catch (err) {
      setError('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPayments();
  }, [searchTerm, sortField, sortDirection, currentPage, itemsPerPage, filterStatus, filterType]);
  
  // Filter payments based on search term and filters
  const filteredPayments = payments.filter(payment => {
    const searchString = `${payment.customer} ${payment.description} ${payment.transactionId}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status.toLowerCase() === filterStatus.toLowerCase();
    
    // Enhanced type filtering
    let matchesType = true;
    if (filterType !== 'all') {
      if (filterType === 'stripe') {
        matchesType = payment.is_stripe === true;
      } else {
        matchesType = payment.type.toLowerCase() === filterType.toLowerCase();
      }
    }
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'date' || sortField === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    console.log('handlePageChange called with page:', page);
    console.log('Current pagination:', pagination);
    
    if (pagination && (page < 1 || page > pagination.total_pages)) {
      console.log('Page change blocked - invalid page number');
      return;
    }
    
    console.log('Setting current page to:', page);
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

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };
  
  const handleViewPayment = (payment: any) => {
    console.log('Opening payment details for:', payment);
    setSelectedPayment(payment);
  };
  
  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportSuccess = (message: string) => {
    setToastMessage(message);
    setToastType('success');
  };

  const handleExportError = (message: string) => {
    setToastMessage(message);
    setToastType('error');
  };

  // Convert payments to export format
  const getExportData = (): PaymentExportData[] => {
    return sortedPayments.map(payment => ({
      id: payment.id,
      customer: payment.customer,
      description: payment.description,
      amount: payment.amount,
      date: payment.date,
      status: payment.status,
      type: payment.type,
      transactionId: payment.transactionId,
      is_stripe: payment.is_stripe,
      vehicle_id: payment.vehicle_id,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    }));
  };

  const handleViewVehicleDetails = (vehicleId: string) => {
    navigate(`/admin/inventory/${vehicleId}`);
    setSelectedPayment(null); // Close the payment modal
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;
    try {
      const response = await deletePayment(selectedPayment.id);
      if (response.success) {
        setToastMessage('Payment deleted successfully');
        setToastType('success');
        fetchAllPayments();
      } else {
        setToastMessage(response.error || 'Failed to delete payment');
        setToastType('error');
      }
    } catch (err) {
      setToastMessage('Failed to delete payment');
      setToastType('error');
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
    setSelectedPayment(null); // Close the payment details modal
  };

  const handleDeleteClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDeleteConfirmation(true);
  };



  return (
    <>
      <div className="px-6 py-8 w-full max-w-9xl mx-auto bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div className="ml-5">
              <h1 className="text-3xl font-bold text-gray-900">Payment Manager</h1>
              <p className="text-gray-600 mt-1">Manage and track all payment transactions</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowManualPaymentModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Manual Payment
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
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
                placeholder="Search by customer, description, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-3" />
              <select
                value={filterType}
                onChange={handleTypeFilterChange}
                className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="stripe">Stripe</option>
                <option value="manual">Manual</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
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
      
      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Loading, Error, and Empty States */}
          {loading && (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading payments...</p>
            </div>
          )}
          
          {error && (
            <div className="p-12 text-center">
              <AlertState
                error={error}
                variant="server"
                title="Failed to Load Payments"
                description="We couldn't load the payment data. This might be due to a network issue or server problem."
              />
            </div>
          )}
          
          {!loading && !error && payments.length === 0 && (
            <div className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No payments found</p>
              <p className="text-gray-500 text-sm mt-1">Start by adding a manual payment or wait for online payments</p>
            </div>
          )}
          
          {!loading && !error && payments.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('customer')}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Customer
                      {sortField === 'customer' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Description
                      {sortField === 'description' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Amount
                      {sortField === 'amount' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50" onClick={() => handleSort('date')}>
                    <div className="flex items-center">
                      Date
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50" onClick={() => handleSort('status')}>
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedPayments.map((payment) => (
                  <tr 
                    key={payment.id}
                    onClick={() => handleViewPayment(payment)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{payment.customer}</div>
                          <div className="text-sm text-gray-500">{payment.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.description}</div>
                      <div className="text-sm text-gray-500 capitalize">{payment.type}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        {payment.is_manual && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            Manual
                          </span>
                        )}
                        {payment.is_stripe && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Stripe
                          </span>
                        )}
                        {payment.vehicle && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <Car className="h-3 w-3 mr-1" />
                            {payment.vehicle.year} {payment.vehicle.make} {payment.vehicle.model}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewVehicleDetails(payment.vehicle.id || payment.vehicle.vehicle_id);
                              }}
                              className="ml-1 p-0.5 hover:bg-green-200 rounded-full transition-colors"
                              title="View Vehicle Details"
                            >
                              <ExternalLink className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.currency || 'USD'}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(payment.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(payment.date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        payment.status.toLowerCase() === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status.toLowerCase() === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : payment.status.toLowerCase() === 'refunded'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status.toLowerCase() === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
                        {payment.status.toLowerCase() === 'pending' && <Clock className="h-4 w-4 mr-1" />}
                        {payment.status.toLowerCase() === 'refunded' && <RefreshCw className="h-4 w-4 mr-1" />}
                        {payment.status.toLowerCase() === 'failed' && <XCircle className="h-4 w-4 mr-1" />}
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
        
        {/* Simple Page Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 mt-4">
          <div className="flex items-center justify-center space-x-4">
            {/* Left Arrow Button */}
            <button
              onClick={() => {
                console.log('Previous button clicked, current page:', currentPage);
                handlePageChange(currentPage - 1);
              }}
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
              onClick={() => {
                console.log('Next button clicked, current page:', currentPage);
                handlePageChange(currentPage + 1);
              }}
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
                Page {pagination.current_page} of {pagination.total_pages} • {pagination.total_items} total payments
              </p>

            </div>
          )}
        </div>
      </div>
      
      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed z-50 inset-0 overflow-y-auto" style={{ zIndex: 9999 }}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" 
              aria-hidden="true"
              onClick={() => {
                console.log('Background clicked, closing modal');
                setSelectedPayment(null);
              }}
            >
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal content */}
            <div 
              className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                      <CreditCard className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                      <p className="text-gray-600">Payment ID: #{selectedPayment.id}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditPayment(selectedPayment)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(selectedPayment)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        console.log('Closing payment modal');
                        setSelectedPayment(null);
                      }}
                      className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Status Banner */}
                <div className={`mb-8 p-6 rounded-xl border-l-4 ${
                  selectedPayment.status?.toLowerCase() === 'completed' 
                    ? 'bg-green-50 border-green-400' 
                    : selectedPayment.status?.toLowerCase() === 'pending'
                    ? 'bg-yellow-50 border-yellow-400'
                    : selectedPayment.status?.toLowerCase() === 'refunded'
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-center">
                    {selectedPayment.status?.toLowerCase() === 'completed' && <CheckCircle className="h-6 w-6 text-green-600 mr-3" />}
                    {selectedPayment.status?.toLowerCase() === 'pending' && <Clock className="h-6 w-6 text-yellow-600 mr-3" />}
                    {selectedPayment.status?.toLowerCase() === 'refunded' && <RefreshCw className="h-6 w-6 text-blue-600 mr-3" />}
                    {selectedPayment.status?.toLowerCase() === 'failed' && <XCircle className="h-6 w-6 text-red-600 mr-3" />}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{selectedPayment.status || 'Unknown'}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedPayment.status?.toLowerCase() === 'completed' && 'Payment has been successfully processed'}
                        {selectedPayment.status?.toLowerCase() === 'pending' && 'Payment is awaiting processing'}
                        {selectedPayment.status?.toLowerCase() === 'refunded' && 'Payment has been refunded to customer'}
                        {selectedPayment.status?.toLowerCase() === 'failed' && 'Payment processing failed'}
                        {!selectedPayment.status && 'Payment status unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Payment Information */}
                  <div className="space-y-6">
                    {/* Payment Amount */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                        Payment Amount
                      </h3>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        ${selectedPayment.amount?.toFixed(2) || '0.00'}
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedPayment.currency || 'USD'} • {selectedPayment.payment_method || 'Payment Method'}
                      </p>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="h-5 w-5 text-gray-600 mr-2" />
                        Customer Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Name</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedPayment.customer || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Email</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedPayment.email || 'N/A'}</span>
                        </div>
                        {selectedPayment.phone && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Phone</span>
                            <span className="text-sm font-semibold text-gray-900">{selectedPayment.phone}</span>
                          </div>
                        )}
                        {selectedPayment.user_id && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-gray-600">Customer ID</span>
                            <span className="text-sm font-semibold text-gray-900">#{selectedPayment.user_id}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                        Payment Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Payment Method</span>
                          <span className="text-sm font-semibold text-gray-900 capitalize">{selectedPayment.payment_method || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Payment Type</span>
                          <span className="text-sm font-semibold text-gray-900 capitalize">{selectedPayment.type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">Transaction Date</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {selectedPayment.date ? new Date(selectedPayment.date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm font-medium text-gray-600">Transaction Time</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {selectedPayment.date ? new Date(selectedPayment.date).toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Additional Information */}
                  <div className="space-y-6">
                    {/* Payment Description */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 text-gray-600 mr-2" />
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedPayment.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Payment Method Details */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                        Payment Method Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          {selectedPayment.is_manual && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                              <Wrench className="h-4 w-4 mr-1" />
                              Manual Payment
                            </span>
                          )}
                          {selectedPayment.is_stripe && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                              <CreditCard className="h-4 w-4 mr-1" />
                              Stripe Payment
                            </span>
                          )}
                        </div>
                        {selectedPayment.transactionId && (
                          <div className="flex justify-between items-center py-2 border-t border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Transaction ID</span>
                            <span className="text-sm font-semibold text-gray-900 font-mono">{selectedPayment.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Receipt Section */}
                    {selectedPayment.receiptUrl && (
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Receipt className="h-5 w-5 text-gray-600 mr-2" />
                          Receipt
                        </h3>
                        <button 
                          onClick={() => window.open(selectedPayment.receiptUrl, '_blank')}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Details Section - Only show if payment is related to a vehicle */}
                {selectedPayment.vehicle && (
                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Car className="h-6 w-6 text-blue-600 mr-3" />
                      Related Vehicle
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-2">
                          {selectedPayment.vehicle.year} {selectedPayment.vehicle.make} {selectedPayment.vehicle.model}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {selectedPayment.vehicle.stockNumber && `Stock #${selectedPayment.vehicle.stockNumber}`}
                          {selectedPayment.vehicle.vin && `VIN: ${selectedPayment.vehicle.vin}`}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleViewVehicleDetails(selectedPayment.vehicle.id || selectedPayment.vehicle.vehicle_id)}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        View Vehicle Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      
      {/* Manual Payment Modal */}
      {showManualPaymentModal && (
        <ManualPaymentModal
          isOpen={showManualPaymentModal}
          onClose={() => setShowManualPaymentModal(false)}
          onSuccess={() => {
            setShowManualPaymentModal(false);
            fetchAllPayments();
          }}
        />
      )}

      {/* Edit Payment Modal */}
      {showEditModal && editingPayment && (
        <ManualPaymentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPayment(null);
          }}
          onSuccess={(updatedPayment) => {
            setShowEditModal(false);
            setEditingPayment(null);
            if (updatedPayment) {
              // Update the specific payment in the list
              setPayments(prevPayments => 
                prevPayments.map(payment => 
                  payment.id === updatedPayment.id ? updatedPayment : payment
                )
              );
            } else {
              // Fallback to refreshing all payments
              fetchAllPayments();
            }
          }}
          editingPayment={editingPayment}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          payments={getExportData()}
          onExportSuccess={handleExportSuccess}
          onExportError={handleExportError}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDeletePayment}
          title="Delete Payment"
          message={`Are you sure you want to delete payment #${selectedPayment?.id}? This action cannot be undone.`}
        />
      )}

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
};

export default Payments;