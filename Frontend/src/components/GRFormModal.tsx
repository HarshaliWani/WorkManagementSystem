import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { grService } from '../services/grService';
import { GR } from '../data/mockData';
import { Save, Loader } from 'lucide-react';

interface GRFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingGR?: GR | null;
}

export const GRFormModal: React.FC<GRFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingGR,
}) => {
  const [formData, setFormData] = useState({
    grNumber: '',
    grDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingGR) {
      setFormData({
        grNumber: editingGR.grNumber,
        grDate: editingGR.grDate.split('T')[0], // Format for date input
      });
    } else {
      setFormData({
        grNumber: '',
        grDate: '',
      });
    }
  }, [editingGR, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.grNumber || !formData.grDate) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSaving(true);
      
      if (editingGR) {
        await grService.updateGR(editingGR.id, formData);
      } else {
        await grService.createGR(formData);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving GR:', err);
      setError(err.response?.data?.message || 'Failed to save GR');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({ grNumber: '', grDate: '' });
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingGR ? 'Edit Government Record' : 'Add New Government Record'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GR Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.grNumber}
            onChange={(e) => setFormData({ ...formData, grNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., GR-2024-001"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GR Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.grDate}
            onChange={(e) => setFormData({ ...formData, grDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {editingGR ? 'Update GR' : 'Create GR'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
