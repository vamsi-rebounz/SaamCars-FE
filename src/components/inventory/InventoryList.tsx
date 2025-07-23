import { Edit, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { deleteVehicle, getInventory } from '../../services/inventory';
import { Vehicle } from '../../types/vehicle';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

interface InventoryListProps {
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRefresh?: () => void;
}

const InventoryList: React.FC<InventoryListProps> = ({
  onEdit,
  onDelete,
  onRefresh
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInventory();
      if (response.success && response.vehicles) {
        setVehicles(response.vehicles);
      } else {
        setError(response.error || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError('An error occurred while fetching vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleEdit = (vehicle: Vehicle) => {
    if (onEdit) {
      onEdit(vehicle);
    }
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicle) return;

    try {
      const response = await deleteVehicle(String(selectedVehicle.id));
      if (response.success) {
        // Remove the vehicle from the list
        setVehicles(prev => prev.filter(v => v.id !== selectedVehicle.id));
        if (onDelete) {
          onDelete(selectedVehicle);
        }
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setError(response.error || 'Failed to delete vehicle');
      }
    } catch (err) {
      setError('An error occurred while deleting the vehicle');
    } finally {
      setDeleteModalOpen(false);
      setSelectedVehicle(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-16 w-16 flex-shrink-0">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <img
                        className="h-16 w-16 rounded-lg object-cover"
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      {vehicle.year}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">VIN: {vehicle.vin}</div>
                <div className="text-sm text-gray-500">
                  {vehicle.mileage?.toLocaleString()} miles
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                  vehicle.status === 'sold' ? 'bg-red-100 text-red-800' :
                  vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {vehicle.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${vehicle.price?.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(vehicle)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedVehicle(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone and will remove all associated data including images, features, and sales history."
        itemName={selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year}) - VIN: ${selectedVehicle.vin}` : ''}
      />
    </div>
  );
};

export default InventoryList;