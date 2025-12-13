// src/components/TenderFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { tenderService } from '../services/tenderService';
import { Work } from '../types/work';
import { Tender } from '../pages/Tenders';

interface TenderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  works: Work[];
  editingTender?: Tender | null;
}

const TenderFormModal: React.FC<TenderFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  works,
  editingTender = null
}) => {
  const [formData, setFormData] = useState({
    work: '',
    tender_id: '',
    agency_name: '',
    date: '',
    online_offline: false,
    technical_verification: false,
    financial_verification: false,
    loa: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when editing
  useEffect(() => {
    if (editingTender && isOpen) {
      setFormData({
        work: '', // Work cannot be changed when editing
        tender_id: editingTender.tenderNumber || '',
        agency_name: editingTender.tenderName || '',
        date: editingTender.openingDate || '',
        online_offline: editingTender.onlineOffline || false,
        technical_verification: editingTender.technicalVerification || false,
        financial_verification: editingTender.financialVerification || false,
        loa: editingTender.loa || false,
      });
    } else if (!editingTender && isOpen) {
      // Reset form for new entry
      setFormData({
        work: '',
        tender_id: '',
        agency_name: '',
        date: '',
        online_offline: false,
        technical_verification: false,
        financial_verification: false,
        loa: false,
      });
    }
  }, [editingTender, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        tender_id: formData.tender_id,
        agency_name: formData.agency_name,
        date: formData.date || undefined,
        online_offline: formData.online_offline,
        technical_verification: formData.technical_verification,
        financial_verification: formData.financial_verification,
        loa: formData.loa,
      };

      if (editingTender) {
        await tenderService.updateTender(editingTender.id.toString(), payload);
      } else {
        payload.work = parseInt(formData.work);
        await tenderService.createTender(payload);
      }

      await onSubmit();
      onClose();
    } catch (err: any) {
      console.error('Error saving tender:', err);
      setError(err.response?.data?.message || 'Failed to save tender');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingTender ? 'Edit Tender' : 'Add Tender'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Select Work - only for new tenders */}
          {!editingTender && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Work *
              </label>
              <select
                value={formData.work}
                onChange={(e) => setFormData({ ...formData, work: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                <option value="" className="text-gray-900">Select a work</option>
                {works.map((work) => (
                  <option key={work.id} value={work.id}>
                    {work.workName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tender ID *
            </label>
            <input
              type="text"
              value={formData.tender_id}
              onChange={(e) => setFormData({ ...formData, tender_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!editingTender}
              placeholder="Enter tender ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agency Name *
            </label>
            <input
              type="text"
              value={formData.agency_name}
              onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter agency name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Checkboxes for stages */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-gray-900">Tender Stages</h3>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.online_offline}
                onChange={(e) => setFormData({ ...formData, online_offline: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Online/Offline</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.technical_verification}
                onChange={(e) => setFormData({ ...formData, technical_verification: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Technical Verification</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.financial_verification}
                onChange={(e) => setFormData({ ...formData, financial_verification: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Financial Verification</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.loa}
                onChange={(e) => setFormData({ ...formData, loa: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">LOA (Letter of Acceptance)</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingTender ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenderFormModal;
