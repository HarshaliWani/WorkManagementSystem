// src/components/TSFormModal.tsx - COMPLETE FIX
import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { technicalSanctionService, TechnicalSanction } from '../services/technicalSanctionService';
import { Work } from '../types/work';

interface TSFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  works: Work[];
  editingTS?: TechnicalSanction | null;
}

const TSFormModal: React.FC<TSFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  works,
  editingTS = null
}) => {
  // Base input values
  const [formData, setFormData] = useState({
    work: '',
    work_portion: '',
    royalty: '',
    testing: '',
    consultancy: '',
    gst_percentage: '18',
    contingency_percentage: '4',
    labour_insurance_percentage: '1',
    noting: false,
    order: false,
  });

  // Calculated values (can be overridden)
  const [calculatedValues, setCalculatedValues] = useState({
    gst_amount: 0,
    contingency_amount: 0,
    labour_insurance_amount: 0,
    grand_total: 0,
    final_total: 0,
  });

  // Override flags
  const [overrides, setOverrides] = useState({
    gst_amount: false,
    contingency_amount: false,
    labour_insurance_amount: false,
    grand_total: false,
    final_total: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ INITIALIZE FORM WHEN EDITING (THIS WAS MISSING!)
  useEffect(() => {
    if (editingTS && isOpen) {
      setFormData({
        work: editingTS.work?.toString() || '',
        work_portion: editingTS.workPortion?.toString() || editingTS.work_portion?.toString() || '',
        royalty: editingTS.royalty?.toString() || '0',
        testing: editingTS.testing?.toString() || '0',
        consultancy: editingTS.consultancy?.toString() || '0',
        gst_percentage: editingTS.gstPercentage?.toString() || editingTS.gst_percentage?.toString() || '18',
        contingency_percentage: editingTS.contingencyPercentage?.toString() || editingTS.contingency_percentage?.toString() || '4',
        labour_insurance_percentage: editingTS.labourInsurancePercentage?.toString() || editingTS.labour_insurance_percentage?.toString() || '1',
        noting: editingTS.noting || false,
        order: editingTS.order || false,
      });
    } else if (!editingTS && isOpen) {
      // Reset form for new entry
      setFormData({
        work: '',
        work_portion: '',
        royalty: '0',
        testing: '0',
        consultancy: '0',
        gst_percentage: '18',
        contingency_percentage: '4',
        labour_insurance_percentage: '1',
        noting: false,
        order: false,
      });
      setOverrides({
        gst_amount: false,
        contingency_amount: false,
        labour_insurance_amount: false,
        grand_total: false,
        final_total: false,
      });
    }
  }, [editingTS, isOpen]);

  // Calculate all values whenever inputs change
  useEffect(() => {
    const workPortion = parseFloat(formData.work_portion) || 0;
    const royalty = parseFloat(formData.royalty) || 0;
    const testing = parseFloat(formData.testing) || 0;
    const consultancy = parseFloat(formData.consultancy) || 0;
    const gstPercentage = parseFloat(formData.gst_percentage) || 0;
    const contingencyPercentage = parseFloat(formData.contingency_percentage) || 0;
    const labourPercentage = parseFloat(formData.labour_insurance_percentage) || 0;

    // Calculate base amounts
    const baseAmount = workPortion + royalty + testing;

    // GST calculated on work_portion only
    const gstAmount = !overrides.gst_amount
      ? (workPortion * gstPercentage) / 100
      : calculatedValues.gst_amount;

    // Grand total
    const grandTotal = !overrides.grand_total
      ? baseAmount + gstAmount
      : calculatedValues.grand_total;

    // Contingency on grand total
    const contingencyAmount = !overrides.contingency_amount
      ? (grandTotal * contingencyPercentage) / 100
      : calculatedValues.contingency_amount;

    // Labour insurance on grand total
    const labourAmount = !overrides.labour_insurance_amount
      ? (grandTotal * labourPercentage) / 100
      : calculatedValues.labour_insurance_amount;

    // Final total
    const finalTotal = !overrides.final_total
      ? grandTotal + consultancy + contingencyAmount + labourAmount
      : calculatedValues.final_total;

    setCalculatedValues({
      gst_amount: gstAmount,
      contingency_amount: contingencyAmount,
      labour_insurance_amount: labourAmount,
      grand_total: grandTotal,
      final_total: finalTotal,
    });
  }, [
    formData.work_portion,
    formData.royalty,
    formData.testing,
    formData.consultancy,
    formData.gst_percentage,
    formData.contingency_percentage,
    formData.labour_insurance_percentage,
    overrides,
  ]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        work: parseInt(formData.work),
        work_portion: parseFloat(formData.work_portion),
        royalty: parseFloat(formData.royalty) || 0,
        testing: parseFloat(formData.testing) || 0,
        consultancy: parseFloat(formData.consultancy) || 0,
        gst_percentage: parseFloat(formData.gst_percentage),
        contingency_percentage: parseFloat(formData.contingency_percentage),
        labour_insurance_percentage: parseFloat(formData.labour_insurance_percentage),
        noting: formData.noting,
        order: formData.order,
      };

      if (editingTS) {
        await technicalSanctionService.updateTechnicalSanction(editingTS.id.toString(), payload);
      } else {
        await technicalSanctionService.createTechnicalSanction(payload);
      }

      // Call the onSubmit callback to refresh data
      await onSubmit();
      onClose();
    } catch (err: any) {
      console.error('Error saving technical sanction:', err);
      setError(err.response?.data?.message || 'Failed to save technical sanction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingTS ? 'Edit Technical Sanction' : 'Add Technical Sanction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Select Work */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Work *
            </label>
            <select
              value={formData.work}
              onChange={(e) => setFormData({ ...formData, work: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!editingTS}
            >
              <option value="">Select a work</option>
              {works.map((work) => (
                <option key={work.id} value={work.id}>
                  {work.workName || work.workName}
                </option>
              ))}
            </select>
          </div>

          {/* Base Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Portion *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.work_portion}
                onChange={(e) => setFormData({ ...formData, work_portion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter work portion amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Royalty
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.royalty}
                onChange={(e) => setFormData({ ...formData, royalty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter royalty amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testing
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.testing}
                onChange={(e) => setFormData({ ...formData, testing: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter testing amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultancy
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.consultancy}
                onChange={(e) => setFormData({ ...formData, consultancy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter consultancy amount"
              />
            </div>
          </div>

          {/* GST Section */}
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              GST Calculation
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST % (default 18%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gst_percentage}
                  onChange={(e) => setFormData({ ...formData, gst_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={calculatedValues.gst_amount.toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, gst_amount: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, gst_amount: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    overrides.gst_amount ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                  }`}
                />
                {overrides.gst_amount && (
                  <p className="text-xs text-yellow-600 mt-1">Overridden</p>
                )}
              </div>
            </div>
          </div>

          {/* Contingency Section */}
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-3">Contingency</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contingency % (default 4%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.contingency_percentage}
                  onChange={(e) => setFormData({ ...formData, contingency_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contingency Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={calculatedValues.contingency_amount.toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, contingency_amount: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, contingency_amount: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    overrides.contingency_amount ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Labour Insurance Section */}
          <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3">Labour Insurance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labour Insurance % (default 1%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.labour_insurance_percentage}
                  onChange={(e) => setFormData({ ...formData, labour_insurance_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labour Insurance Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={calculatedValues.labour_insurance_amount.toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, labour_insurance_amount: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, labour_insurance_amount: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    overrides.labour_insurance_amount ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-3">Totals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grand Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={calculatedValues.grand_total.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md text-lg font-semibold bg-gray-100 border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={calculatedValues.final_total.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md text-lg font-semibold bg-gray-100 border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Noting & Order Checkboxes */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.noting}
                onChange={(e) => setFormData({ ...formData, noting: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Noting</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Order</span>
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
              {loading ? 'Saving...' : editingTS ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TSFormModal;
