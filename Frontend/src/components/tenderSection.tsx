import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Loader, Edit2, FileText } from 'lucide-react';
import { Tender } from '../data/mockData';
import { tenderService } from '../services/tenderService';

interface TenderSectionProps {
  tsId?: string; // Technical Sanction ID
  isEditMode: boolean;
  onTenderSelect?: (tenderId: string) => void;
}

export const TenderSection: React.FC<TenderSectionProps> = ({
  tsId,
  isEditMode,
  onTenderSelect,
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    tenderNumber: '',
    tenderName: '',
    estimatedAmount: '',
    openingDate: '',
    closingDate: '',
    status: 'Open' as 'Open' | 'Closed' | 'Awarded',
    contractorName: '',
    awardedAmount: '',
    workOrderNumber: '',
    workOrderDate: '',
  });

  useEffect(() => {
    if (tsId) {
      fetchTenders();
    }
  }, [tsId]);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const data = tsId 
        ? await tenderService.getTendersByTS(tsId)
        : await tenderService.getAllTenders();
      setTenders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setError('Failed to load tenders');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenderNumber: '',
      tenderName: '',
      estimatedAmount: '',
      openingDate: '',
      closingDate: '',
      status: 'Open',
      contractorName: '',
      awardedAmount: '',
      workOrderNumber: '',
      workOrderDate: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setEditingTender(null);
    setIsAdding(true);
  };

  const handleEdit = (tender: Tender) => {
    setFormData({
      tenderNumber: tender.tenderNumber,
      tenderName: tender.tenderName || '',
      estimatedAmount: tender.estimatedAmount?.toString() || '',
      openingDate: tender.openingDate?.split('T')[0] || '',
      closingDate: tender.closingDate?.split('T')[0] || '',
      status: tender.status || 'Open',
      contractorName: tender.contractorName || '',
      awardedAmount: tender.awardedAmount?.toString() || '',
      workOrderNumber: tender.workOrderNumber || '',
      workOrderDate: tender.workOrderDate?.split('T')[0] || '',
    });
    setEditingTender(tender);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formData.tenderNumber) {
      setError('Tender number is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const tenderData = {
        tenderNumber: formData.tenderNumber,
        tenderName: formData.tenderName,
        estimatedAmount: parseFloat(formData.estimatedAmount) || 0,
        openingDate: formData.openingDate,
        closingDate: formData.closingDate,
        status: formData.status,
        contractorName: formData.contractorName,
        awardedAmount: parseFloat(formData.awardedAmount) || 0,
        workOrderNumber: formData.workOrderNumber,
        workOrderDate: formData.workOrderDate,
      };

      if (editingTender) {
        await tenderService.updateTender(editingTender.id || '', tenderData);
      } else {
        await tenderService.createTender(tsId || '', tenderData);
      }

      await fetchTenders();
      setIsAdding(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving tender:', err);
      setError(err.response?.data?.error || 'Failed to save tender');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingTender(null);
    resetForm();
    setError(null);
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-blue-600 bg-blue-50';
      case 'Closed': return 'text-gray-600 bg-gray-50';
      case 'Awarded': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-600">Loading tenders...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Existing Tenders */}
      {tenders.length === 0 && !isAdding && (
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-center">
          No tenders found. {isEditMode && 'Click "Add Tender" to create one.'}
        </div>
      )}

      {tenders.map((tender) => (
        <div key={tender.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h5 className="font-semibold text-gray-900">{tender.tenderNumber}</h5>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(tender.status)}`}>
                  {tender.status}
                </span>
              </div>
              {tender.tenderName && (
                <p className="text-sm text-gray-600 mt-1">{tender.tenderName}</p>
              )}
            </div>
            {isEditMode && (
              <button
                onClick={() => handleEdit(tender)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit tender"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Estimated Amount:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatCurrency(tender.estimatedAmount || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Opening Date:</span>
              <span className="ml-2 text-gray-900">
                {tender.openingDate ? new Date(tender.openingDate).toLocaleDateString() : '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Closing Date:</span>
              <span className="ml-2 text-gray-900">
                {tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : '-'}
              </span>
            </div>
            {tender.status === 'Awarded' && tender.contractorName && (
              <>
                <div>
                  <span className="text-gray-500">Contractor:</span>
                  <span className="ml-2 text-gray-900">{tender.contractorName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Awarded Amount:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {formatCurrency(tender.awardedAmount || 0)}
                  </span>
                </div>
                {tender.workOrderNumber && (
                  <div>
                    <span className="text-gray-500">Work Order:</span>
                    <span className="ml-2 text-gray-900">{tender.workOrderNumber}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {onTenderSelect && (
            <button
              onClick={() => onTenderSelect(tender.id || '')}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Bills →
            </button>
          )}
        </div>
      ))}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-4">
            {editingTender ? 'Edit Tender' : 'New Tender'}
          </h5>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tender Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tenderNumber}
                  onChange={(e) => setFormData({ ...formData, tenderNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TND-2024-001"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tender Name
                </label>
                <input
                  type="text"
                  value={formData.tenderName}
                  onChange={(e) => setFormData({ ...formData, tenderName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Amount
                </label>
                <input
                  type="number"
                  value={formData.estimatedAmount}
                  onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  disabled={saving}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Awarded">Awarded</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Date
                </label>
                <input
                  type="date"
                  value={formData.openingDate}
                  onChange={(e) => setFormData({ ...formData, openingDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closing Date
                </label>
                <input
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
            </div>

            {formData.status === 'Awarded' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contractor Name
                    </label>
                    <input
                      type="text"
                      value={formData.contractorName}
                      onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contractor name"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Awarded Amount
                    </label>
                    <input
                      type="number"
                      value={formData.awardedAmount}
                      onChange={(e) => setFormData({ ...formData, awardedAmount: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      disabled={saving}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Order Number
                    </label>
                    <input
                      type="text"
                      value={formData.workOrderNumber}
                      onChange={(e) => setFormData({ ...formData, workOrderNumber: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="WO-2024-001"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Order Date
                    </label>
                    <input
                      type="date"
                      value={formData.workOrderDate}
                      onChange={(e) => setFormData({ ...formData, workOrderDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.tenderNumber}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 mr-1" />
                  {editingTender ? 'Update' : 'Save'} Tender
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {isEditMode && !isAdding && (
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tender
        </button>
      )}
    </div>
  );
};
