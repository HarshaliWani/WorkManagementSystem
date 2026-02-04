// GRFormModal.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { grService } from '../services/grService';
import { useAuth } from '../contexts/AuthContext';

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
  const { isDemoMode } = useAuth();
  const [formData, setFormData] = useState({
    grNumber: '',
    grDate: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      setFile(null);
    }
    setError(null);
    setShowDeleteConfirm(false);
  }, [editingGR, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
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
      const submitData = new FormData();
      submitData.append('gr_number', formData.grNumber);
      submitData.append('date', formData.grDate);
      
      if (file) {
        submitData.append('document', file);
      }

      if (editingGR) {
        await grService.updateGR(editingGR.id, submitData, isDemoMode);
      } else {
        await grService.createGR(submitData, isDemoMode);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving GR:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.gr_number) {
          setError(Array.isArray(errorData.gr_number) ? errorData.gr_number[0] : errorData.gr_number);
        } else if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError('Failed to save GR. Please check your input and try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingGR) return;
    
    setDeleting(true);
    setError(null);

    try {
      await grService.deleteGR(editingGR.id.toString(), isDemoMode);
      onSuccess();
    } catch (err: any) {
      console.error('Error deleting GR:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 404) {
        setError('GR not found. It may have been already deleted.');
      } else {
        setError('Failed to delete GR. It may have associated works.');
      }
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={editingGR ? 'Edit GR' : 'Add New GR'}
    >
      {/* Form Content */}
      <form onSubmit={handleSubmit} className="px-6 py-4">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* GR Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GR Number *
          </label>
          <input
            type="text"
            value={formData.grNumber}
            onChange={(e) => setFormData({ ...formData, grNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="e.g., GR/2025/001"
            disabled={loading || deleting}
          />
        </div>

        {/* GR Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GR Date *
          </label>
          <input
            type="date"
            value={formData.grDate}
            onChange={(e) => setFormData({ ...formData, grDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading || deleting}
          />
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GR Document (PDF)
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="gr-file-upload"
              disabled={loading || deleting}
            />
            <label
              htmlFor="gr-file-upload"
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {file ? file.name : editingGR?.document ? 'Replace PDF file' : 'Choose PDF file'}
              </span>
            </label>
          </div>
          {file && (
            <p className="mt-2 text-xs text-green-600">
              ✓ File selected: {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
          {editingGR?.document && !file && (
            <p className="mt-2 text-xs text-blue-600">
              Current: {editingGR.document.split('/').pop()}
            </p>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 mb-3">
              Are you sure you want to delete this GR? This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between space-x-3 pt-4 border-t border-gray-200">
          {/* Delete Button (Only in Edit Mode) */}
          {editingGR && !showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || deleting}
              className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          ) : (
            <div></div>
          )}

          {/* Cancel & Save Buttons */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || deleting}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || deleting || showDeleteConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingGR ? 'Update GR' : 'Create GR'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
