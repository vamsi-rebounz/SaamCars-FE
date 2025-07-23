import React, { useState, useEffect } from 'react';
import { getAuctionPurchases } from '../../services/auction';
import AuctionPurchaseForm from '../../components/auction/AuctionPurchaseForm';
import AlertState from '../../components/ErrorState';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Car,
  DollarSign,
  Calendar,
  Tag,
  TrendingUp,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuctionPurchase {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: string;
  purchase_date: string;
  purchase_price: number;
  list_price: number;
  images?: string[];
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_previous: boolean;
}

const AuctionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<AuctionPurchase | null>(null);
  const [auctions, setAuctions] = useState<AuctionPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('purchase_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        search: searchTerm,
        sort_by: sortField,
        sort_order: sortDirection,
        page: currentPage,
        limit: itemsPerPage,
        ...(filterStatus && { status: filterStatus }),
      };
      const response = await getAuctionPurchases(filters);
      console.log('Auctions API response:', response);
      if (response.success && response.purchases) {
        setAuctions(response.purchases);
        console.log('Setting pagination:', response.pagination);
        setPagination(response.pagination);
      } else {
        setError(response.error || 'Failed to fetch auctions');
      }
    } catch (err) {
      setError('An error occurred while fetching auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [searchTerm, sortField, sortDirection, currentPage, itemsPerPage, filterStatus]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setSelectedAuction(null);
    setSuccessMessage('Auction purchase saved successfully!');
    fetchAuctions();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleRowClick = (auctionId: string) => {
    navigate(`/admin/auctions/${auctionId}`);
  };

  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'sold': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert Messages */}
      <AlertState
        success={successMessage}
        error={error}
        variant="server"
        onClose={() => {
          setSuccessMessage(null);
          setError(null);
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Auction Purchases</h1>
                  <p className="text-gray-600 mt-1">Manage and track your auction vehicle purchases</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedAuction(null);
                setShowModal(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Auction
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
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                  <option value="reserved">Reserved</option>
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white shadow-xl rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedAuction ? 'Edit Auction Purchase' : 'Add New Auction Purchase'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAuction(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <AuctionPurchaseForm
                initialData={selectedAuction}
                onSuccess={handleFormSuccess}
                isEditing={!!selectedAuction}
              />
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-600 font-medium">Loading auction purchases...</p>
              </div>
            </div>
          ) : auctions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('make')}
                    >
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-gray-400" />
                        Vehicle
                        {sortField === 'make' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                            <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('purchase_date')}
                    >
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Purchase Date
                        {sortField === 'purchase_date' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                            <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('purchase_price')}
                    >
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        Purchase Price
                        {sortField === 'purchase_price' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                            <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-gray-400" />
                        Status
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('list_price')}
                    >
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        List Price
                        {sortField === 'list_price' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="inline h-4 w-4 ml-2 text-blue-600" /> : 
                            <ChevronDown className="inline h-4 w-4 ml-2 text-blue-600" />
                        )}
                      </div>
                    </th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auctions.map((auction) => (
                    <tr 
                      key={auction.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(auction.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            {auction.images?.[0] ? (
                              <img
                                className="h-12 w-12 rounded-xl object-cover border border-gray-200"
                                src={auction.images[0]}
                                alt={`${auction.make} ${auction.model}`}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                                <Car className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {auction.make} {auction.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {auction.year} • {auction.vin}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(auction.purchase_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${auction.purchase_price?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(auction.status)}`}>
                          {auction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${auction.list_price?.toLocaleString()}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
                        {/* Page Numbers Below Table */}
            {pagination && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2">
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
                    disabled={!pagination.has_next}
                    className={`p-2 rounded-lg border transition-colors ${
                      !pagination.has_next
                        ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                        : 'text-gray-500 border-gray-300 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400'
                    }`}
                    title="Next Page"
                  >
                    <ChevronDown className="h-5 w-5 -rotate-90" />
                  </button>
                </div>
                
                {/* Page Info */}
                <div className="text-center mt-3">
                  <p className="text-sm text-gray-600">
                    Page {pagination.current_page} of {pagination.total_pages} • {pagination.total_items} total auctions
                  </p>
                </div>
              </div>
            )}
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No auction purchases found</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first auction purchase.</p>
                <button
                  onClick={() => {
                    setSelectedAuction(null);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Purchase
                </button>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default AuctionsPage;