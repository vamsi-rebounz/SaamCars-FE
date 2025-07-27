import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, Download, AlertCircle, Code, Database, Globe, FileCode } from 'lucide-react';
import { exportPayments, PaymentExportData, ExportFormat, getFormatInfo } from '../../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentExportData[];
  onExportSuccess: (message: string) => void;
  onExportError: (message: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  payments,
  onExportSuccess,
  onExportError
}) => {
  const [exportType, setExportType] = useState<ExportFormat>('excel');
  const [isExporting, setIsExporting] = useState(false);
  const [filename, setFilename] = useState('payments');

  const handleExport = async () => {
    if (!filename.trim()) {
      onExportError('Please enter a filename');
      return;
    }

    setIsExporting(true);
    try {
      const result = exportPayments(payments, exportType, filename);

      if (result.success) {
        onExportSuccess(`${exportType.toUpperCase()} file exported successfully: ${result.filename}`);
        onClose();
      } else {
        onExportError(result.error || `Failed to export ${exportType.toUpperCase()} file`);
      }
    } catch (error) {
      console.error('Export error:', error);
      onExportError(`Failed to export ${exportType.toUpperCase()} file`);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="h-8 w-8" />;
      case 'pdf':
        return <FileText className="h-8 w-8" />;
      case 'csv':
        return <Database className="h-8 w-8" />;
      case 'json':
        return <Code className="h-8 w-8" />;
      case 'xml':
        return <FileCode className="h-8 w-8" />;
      case 'html':
        return <Globe className="h-8 w-8" />;
      case 'text':
        return <FileText className="h-8 w-8" />;
      default:
        return <Download className="h-8 w-8" />;
    }
  };

  const formatInfo = getFormatInfo(exportType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Payments</h2>
              <p className="text-sm text-gray-600">Choose export format and filename</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(['excel', 'pdf', 'csv', 'json', 'xml', 'html', 'text'] as ExportFormat[]).map((format) => {
                const info = getFormatInfo(format);
                return (
                  <button
                    key={format}
                    onClick={() => setExportType(format)}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                      exportType === format
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`${exportType === format ? 'text-blue-600' : 'text-gray-600'}`}>
                        {getFormatIcon(format)}
                      </div>
                      <div className="text-center">
                        <span className="font-medium text-sm">{info.name}</span>
                        <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Format Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${exportType === 'excel' ? 'bg-green-100 text-green-600' : 
                exportType === 'pdf' ? 'bg-red-100 text-red-600' :
                exportType === 'csv' ? 'bg-blue-100 text-blue-600' :
                exportType === 'json' ? 'bg-yellow-100 text-yellow-600' :
                exportType === 'xml' ? 'bg-purple-100 text-purple-600' :
                exportType === 'html' ? 'bg-indigo-100 text-indigo-600' :
                'bg-gray-100 text-gray-600'}`}>
                {getFormatIcon(exportType)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{formatInfo.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{formatInfo.description}</p>
                <p className="text-xs text-gray-500">
                  <strong>Best for:</strong> {formatInfo.useCase}
                </p>
              </div>
            </div>
          </div>

          {/* Filename Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              File will be saved as: {filename}_{new Date().toISOString().split('T')[0]}.{formatInfo.name.split('(')[1]?.replace(')', '') || 'txt'}
            </p>
          </div>

          {/* Export Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Export Details:</p>
                <ul className="space-y-1">
                  <li>• {payments.length} payment records</li>
                  <li>• Includes all payment information</li>
                  <li>• File will download automatically</li>
                  <li>• Format: {formatInfo.name}</li>
                  {exportType === 'excel' && (
                    <li>• Compatible with Excel, Google Sheets, and other spreadsheet applications</li>
                  )}
                  {exportType === 'pdf' && (
                    <li>• Professional document format with table layout</li>
                  )}
                  {exportType === 'csv' && (
                    <li>• Simple comma-separated values format for data analysis</li>
                  )}
                  {exportType === 'json' && (
                    <li>• Structured data format with metadata for API integrations</li>
                  )}
                  {exportType === 'xml' && (
                    <li>• Enterprise XML format for system integrations</li>
                  )}
                  {exportType === 'html' && (
                    <li>• Beautiful web report with styling and statistics</li>
                  )}
                  {exportType === 'text' && (
                    <li>• Simple text format for basic documentation</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !filename.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {exportType.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 