import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { workService } from '../services/grService';
import { Work } from '../data/mockData';
import { Save, Loader } from 'lucide-react';

interface WorkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grId: string;
  editingWork?: Work | null;
}

export const WorkFormModal: React.FC<WorkFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  grId,
  editingWork,
}) => {
  const [formData, setFormData] = useState({
    workName: '',
    AA: '',
    RA: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingWork) {
      setFormData({
        workName: editingWork.workName,
        AA: editingWork.AA.toString(),
        RA: editingWork.RA.toString(),
      });
    } else {
      setFormData({
        workName: '',
        AA: '',
        RA: '',
      });
    }
  }, [editingWork, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const aa = parseFloat(formData.AA);
    const ra = parseFloat(formData.RA);

    if (!formData.workName || isNaN(aa) || isNaN(ra)) {
      setError('Please fill in all fields with valid values');
      return;
    }

    if (ra > aa) {
      setError('RA cannot be greater than AA');
      return;
    }

    try {
      setSaving(true);
      
      if (editingWork) {
        await workService.updateWork(editingWork.id || '', {
          workName: formData.workName,
          AA: aa,
          RA: ra,
        });
      } else {
        await workService.createWork(grId, {
          workName: formData.workName,
          AA: aa,
          RA: ra,
        });
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving work:', err);
      setError(err.response?.data?.message || 'Failed to save work');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({ workName: '', AA: '', RA: '' });
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingWork ? 'Edit Work' : 'Add New Work'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.workName}
            onChange={(e) => setFormData({ ...formData, workName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter work name"
            disabled={saving}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Administrative Approval (AA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.AA}
              onChange={(e) => setFormData({ ...formData, AA: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter AA amount"
              disabled={saving}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revised Approval (RA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.RA}
              onChange={(e) => setFormData({ ...formData, RA: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter RA amount"
              disabled={saving}
              min="0"
              step="0.01"
            />
          </div>
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
                {editingWork ? 'Update Work' : 'Create Work'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
