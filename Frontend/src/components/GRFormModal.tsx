// GRFormModal.tsx - UPDATED WITH FILE UPLOAD
import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Modal } from './Modal';
import { grService } from '../services/grService';

interface GRFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingGR?: any | null;
}

export const GRFormModal: React.FC<GRFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingGR = null
}) => {
  const [formData, setFormData] = useState({
    grNumber: '',
    grDate: ''
  });
  const [file, setFile] = useState<File | null>(null);  // ✅ NEW: File state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingGR) {
      setFormData({
        grNumber: editingGR.grNumber || '',
        grDate: editingGR.grDate || ''
      });
    } else {
      setFormData({
        grNumber: '',
        grDate: ''
      });
      setFile(null);  // ✅ Reset file
    }
    setError(null);
  }, [editingGR, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validate file type
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Only PDF files are allowed');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ Create FormData for file upload
      const submitData = new FormData();
      submitData.append('gr_number', formData.grNumber);
      submitData.append('gr_date', formData.grDate);
      
      if (file) {
        submitData.append('document', file);
      }

      if (editingGR) {
        await grService.updateGR(editingGR.id, submitData);
      } else {
        await grService.createGR(submitData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving GR:', err);
      setError(err.response?.data?.error || 'Failed to save GR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen ? null : (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingGR ? 'Edit GR' : 'Add New GR'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* GR Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GR Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.grNumber}
                  onChange={(e) => setFormData({ ...formData, grNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., 125GRQ"
                />
              </div>

              {/* GR Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GR Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.grDate}
                  onChange={(e) => setFormData({ ...formData, grDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* ✅ NEW: File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GR Document (PDF)
                </label>
                <div className="flex items-center space-x-2">
                  <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {file ? file.name : 'Choose PDF file'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {file && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ File selected: {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {loading ? 'Saving...' : editingGR ? 'Update GR' : 'Create GR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
