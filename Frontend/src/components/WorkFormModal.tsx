// src/components/WorkFormModal.tsx - Delete button added to modal

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Search, ChevronDown } from 'lucide-react';
import { Work, GR } from '../types/work';

interface WorkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workData: Partial<Work>) => Promise<void>;
  onDelete?: (workId: number) => Promise<void>; // NEW: onDelete prop
  editingWork: Work | null;
  grs: GR[];
  onSuccess?: () => void; // Optional success callback
}

const WorkFormModal: React.FC<WorkFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete, // NEW: Destructure onDelete
  editingWork,
  grs,
}) => {
  const [formData, setFormData] = useState({
    workName: '',
    workDate: '',
    AA: '',
    RA: '',
    gr: '',
    is_cancelled: false,
    cancel_reason: '',
    cancel_details: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // GR searchable dropdown states
  const [grSearchQuery, setGrSearchQuery] = useState('');
  const [isGrDropdownOpen, setIsGrDropdownOpen] = useState(false);
  const grDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingWork) {
      setFormData({
        workName: editingWork.workName,
        workDate: editingWork.workDate,
        AA: editingWork.AA.toString(),
        RA: editingWork.RA.toString(),
        gr: editingWork.gr.toString(),
        is_cancelled: editingWork.isCancelled || false,
        cancel_reason: editingWork.cancelReason || '',
        cancel_details: editingWork.cancelDetails || '',
      });
    } else {
      setFormData({
        workName: '',
        workDate: '',
        AA: '',
        RA: '',
        gr: '',
        is_cancelled: false,
        cancel_reason: '',
        cancel_details: '',
      });
    }
    setError('');
    setGrSearchQuery('');
    setIsGrDropdownOpen(false);
  }, [editingWork, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (grDropdownRef.current && !grDropdownRef.current.contains(event.target as Node)) {
        setIsGrDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  // Filter GRs based on search query
  const filteredGRs = grs.filter((gr) => {
    const searchLower = grSearchQuery.toLowerCase();
    return (
      gr.grNumber.toLowerCase().includes(searchLower) ||
      new Date(gr.grDate).toLocaleDateString().includes(searchLower)
    );
  });

  // Handle GR selection
  const handleSelectGR = (grId: number) => {
    setFormData((prev) => ({
      ...prev,
      gr: grId.toString(),
    }));
    setIsGrDropdownOpen(false);
    setGrSearchQuery('');
    setError('');
  };

  // Get selected GR display text
  const getSelectedGRText = () => {
    if (!formData.gr) return 'Select GR';
    const gr = grs.find((g) => g.id === parseInt(formData.gr, 10));
    return gr ? `${gr.grNumber} - ${new Date(gr.grDate).toLocaleDateString()}` : 'Select GR';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.workName.trim()) {
      setError('Work name is required');
      return;
    }

    if (!formData.workDate) {
      setError('Work date is required');
      return;
    }

    if (!formData.AA || Number(formData.AA) <= 0) {
      setError('Administrative Approval (AA) must be greater than 0');
      return;
    }

    const raValue = formData.RA ? Number(formData.RA) : 0;
    if (raValue > Number(formData.AA)) {
      setError('RA must be less than or equal to AA');
      return;
    }

    if (!formData.gr) {
      setError('Please select a GR');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        id: editingWork?.id,
        name_of_work: formData.workName.trim(),
        date: formData.workDate,
        aa: parseFloat(formData.AA),
        ra: formData.RA ? parseFloat(formData.RA) : 0,
        gr_id: parseInt(formData.gr, 10),
        is_cancelled: formData.is_cancelled,
      };

      // Only include cancellation fields if work is cancelled
      if (formData.is_cancelled) {
        payload.cancel_reason = formData.cancel_reason || null;
        payload.cancel_details = formData.cancel_details || '';
      } else {
        payload.cancel_reason = null;
        payload.cancel_details = '';
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          err?.message || 
                          'Failed to save work. Please try again.';
      setError(errorMessage);
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Handle Delete
  const handleDelete = async () => {
    if (!editingWork) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${editingWork.workName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      if (onDelete) {
        await onDelete(editingWork.id);
      }
      onClose();
    } catch (err) {
      setError('Failed to delete work. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingWork ? 'Edit Work' : 'Add New Work'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {/* GR Selection - Searchable Dropdown */}
          <div ref={grDropdownRef} className="relative">
            <label htmlFor="gr" className="block text-sm font-medium text-gray-700 mb-2">
              GR <span className="text-red-500">*</span>
            </label>
            
            {/* Custom Dropdown Button */}
            <button
              type="button"
              onClick={() => !isSubmitting && setIsGrDropdownOpen(!isGrDropdownOpen)}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={formData.gr ? 'text-gray-900' : 'text-gray-500'}>
                {getSelectedGRText()}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isGrDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isGrDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={grSearchQuery}
                      onChange={(e) => setGrSearchQuery(e.target.value)}
                      placeholder="Search GR number or date..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredGRs.length > 0 ? (
                    filteredGRs.map((gr) => (
                      <div
                        key={gr.id}
                        onClick={() => handleSelectGR(gr.id)}
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                          formData.gr === gr.id.toString() ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{gr.grNumber}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(gr.grDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No GRs found matching "{grSearchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Work Name */}
          <div>
            <label htmlFor="workName" className="block text-sm font-medium text-gray-700 mb-2">
              Work Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="workName"
              name="workName"
              value={formData.workName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter work name"
              disabled={isSubmitting}
            />
          </div>

          {/* Work Date */}
          <div>
            <label htmlFor="workDate" className="block text-sm font-medium text-gray-700 mb-2">
              Work Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="workDate"
              name="workDate"
              value={formData.workDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Administrative Approval (AA) */}
          <div>
            <label htmlFor="AA" className="block text-sm font-medium text-gray-700 mb-2">
              Administrative Approval (AA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="AA"
              name="AA"
              value={formData.AA}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>

          {/* RA */}
          <div>
            <label htmlFor="AA" className="block text-sm font-medium text-gray-700 mb-2">
              RA <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="RA"
              name="RA"
              value={formData.RA}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>

          {/* Cancellation Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="is_cancelled"
                name="is_cancelled"
                checked={formData.is_cancelled}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                disabled={isSubmitting}
              />
              <label htmlFor="is_cancelled" className="ml-2 text-sm font-medium text-gray-700">
                Mark this work as cancelled
              </label>
            </div>

            {/* Conditional Cancellation Fields */}
            {formData.is_cancelled && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                {/* Cancel Reason Dropdown */}
                <div>
                  <label htmlFor="cancel_reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Reason
                  </label>
                  <select
                    id="cancel_reason"
                    name="cancel_reason"
                    value={formData.cancel_reason}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a reason...</option>
                    <option value="SHIFTED_TO_OTHER_WORK">Work shifted to another work name</option>
                    <option value="MOVED_TO_OTHER_DEPARTMENT">Work assigned to different department</option>
                  </select>
                </div>

                {/* Cancel Details Textarea */}
                <div>
                  <label htmlFor="cancel_details" className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Details
                  </label>
                  <textarea
                    id="cancel_details"
                    name="cancel_details"
                    value={formData.cancel_details}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Enter new work name / department / any extra remarks"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          
          {/* Footer with Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {/* Delete Button (Left Side - Only in Edit Mode) */}
            <div>
              {editingWork && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Work
                </button>
              )}
            </div>

            {/* Cancel & Submit Buttons (Right Side) */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingWork
                  ? 'Update Work'
                  : 'Add Work'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkFormModal;
