// WorkFormModal.tsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from './Modal';
import { workService } from '../services/workService';
import type { Work, GR } from '../types/work';

interface WorkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grs: GR[];  // ✅ ADD: List of GRs for dropdown
  editingWork?: Work | null;  // ✅ ADD: Work to edit (optional)
}

export const WorkFormModal: React.FC<WorkFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  grs,
  editingWork = null
}) => {
  const [formData, setFormData] = useState({
    workName: '',
    AA: '',
    RA: '',
    gr: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Populate form when editing
  useEffect(() => {
    if (editingWork) {
      setFormData({
        workName: editingWork.workName || '',
        AA: editingWork.AA?.toString() || '',
        RA: editingWork.RA?.toString() || '',
        gr: editingWork.gr?.toString() || ''
      });
    } else {
      // Reset form for new work
      setFormData({
        workName: '',
        AA: '',
        RA: '',
        gr: ''
      });
    }
    setError(null);
  }, [editingWork, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const workData: any = {
        name_of_work: formData.workName,
        aa: parseFloat(formData.AA),
        ra: parseFloat(formData.RA) || 0,
      };

      if (!editingWork) {
        workData.gr_id = parseInt(formData.gr);
      }

      if (editingWork) {
        // ✅ Update existing work
        await workService.updateWork(editingWork.id, workData);
      } else {
        // ✅ Create new work
        await workService.createWork(workData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving work:', err);
      setError(err.response?.data?.error || 'Failed to save work');
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
                {editingWork ? 'Edit Work' : 'Add New Work'}
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

              {/* Work Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.workName}
                  onChange={(e) => setFormData({ ...formData, workName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter work name"
                />
              </div>

              {/* GR Selection */}
              {!editingWork && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Government Resolution <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gr}
                    onChange={(e) => setFormData({ ...formData, gr: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select GR</option>
                    {grs.map((gr) => (
                      <option key={gr.id} value={gr.id}>
                        {gr.grNumber} - {new Date(gr.grDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* AA Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AA (Administrative Approval) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.AA}
                  onChange={(e) => setFormData({ ...formData, AA: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter AA amount"
                />
              </div>

              {/* RA Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RA (Revised Approval)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.RA}
                  onChange={(e) => setFormData({ ...formData, RA: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter RA amount (optional)"
                />
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
                  {loading ? 'Saving...' : editingWork ? 'Update Work' : 'Add Work'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkFormModal;
