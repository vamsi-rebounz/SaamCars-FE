import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item?',
  itemName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all max-w-lg w-full mx-auto">
          {/* Header */}
          <div className="bg-red-50 p-6">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold leading-6 text-red-800">
                {title}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {message}
              </p>
              {itemName && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {itemName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="inline-flex w-full justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 sm:w-auto"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 