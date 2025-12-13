// tenderSection.tsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Loader, Edit2, FileText, CheckCircle } from 'lucide-react';
import { tenderService } from '../services/tenderService';

// ✅ CORRECT Tender interface matching backend serializer
interface Tender {
  id: number;
  // Backend GET response fields (camelCase)
  tenderNumber: string;
  tenderName: string;
  openingDate?: string;
  status?: string;
  technicalSanctionId?: number | null;
  workOrderUrl?: string | null;
  onlineOffline?: boolean;
  onlineOfflineDate?: string | null;
  technicalVerification?: boolean;
  technicalVerificationDate?: string | null;
  financialVerification?: boolean;
  financialVerificationDate?: string | null;
  loa?: boolean;
  loaDate?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface TenderSectionProps {
  workId?: string;  // ✅ CHANGED: Tenders belong to Works, not Technical Sanctions
  isEditMode: boolean;
  onTenderSelect?: (tenderId: string) => void;
}

export const TenderSection: React.FC<TenderSectionProps> = ({
  workId,
  isEditMode,
  onTenderSelect,
}) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [saving, setSaving] = useState(false);

  // ✅ CORRECT: Form data matching backend POST fields (snake_case)
  const [formData, setFormData] = useState({
    tender_id: '',
    agency_name: '',
    date: '',
  });

  useEffect(() => {
    if (workId) {
      fetchTenders();
    }
  }, [workId]);

  // ✅ FIXED: Use correct service method
  const fetchTenders = async () => {
    try {
      setLoading(true);
      const data = workId
        ? await tenderService.fetchTendersByWork(workId)  // ✅ CORRECT method exists
        : await tenderService.fetchAllTenders();
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
      tender_id: '',
      agency_name: '',
      date: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setEditingTender(null);
    setIsAdding(true);
  };

  // ✅ FIXED: Map backend fields correctly
  const handleEdit = (tender: Tender) => {
    setFormData({
      tender_id: tender.tenderNumber,
      agency_name: tender.tenderName || '',
      date: tender.openingDate?.split('T')[0] || '',
    });
    setEditingTender(tender);
    setIsAdding(true);
  };

  // ✅ FIXED: Correct save logic matching backend expectations
  const handleSave = async () => {
    if (!formData.tender_id || !formData.agency_name) {
      setError('Tender ID and agency name are required');
      return;
    }

    if (!workId) {
      setError('Work ID is required to create a tender');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // ✅ CORRECT: Object matching backend serializer expectations
      const tenderData = {
        tender_id: formData.tender_id,
        agency_name: formData.agency_name,
        date: formData.date || undefined,
        work: parseInt(workId),  // ✅ Send work ID
      };

      if (editingTender) {
        await tenderService.updateTender(editingTender.id.toString(), tenderData);
      } else {
        await tenderService.createTender(tenderData);  // ✅ FIXED: Correct signature
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Open': return 'text-blue-600 bg-blue-50';
      case 'Closed': return 'text-gray-600 bg-gray-50';
      case 'Awarded': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading tenders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Empty State */}
      {tenders.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No tenders found. {isEditMode && 'Click "Add Tender" to create one.'}</p>
        </div>
      )}

      {/* Existing Tenders */}
      {tenders.map((tender) => (
        <div
          key={tender.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {tender.tenderNumber}
                </h3>
                {tender.status && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      tender.status
                    )}`}
                  >
                    {tender.status}
                  </span>
                )}
              </div>
              {tender.tenderName && (
                <p className="text-sm text-gray-600 mt-1">{tender.tenderName}</p>
              )}
            </div>

            {/* Edit Button */}
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

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Opening Date:</span>
              <span className="ml-2 text-gray-900 font-medium">
                {tender.openingDate ? new Date(tender.openingDate).toLocaleDateString() : '-'}
              </span>
            </div>

            {tender.technicalSanctionId && (
              <div>
                <span className="text-gray-500">TS ID:</span>
                <span className="ml-2 text-gray-900 font-medium">
                  {tender.technicalSanctionId}
                </span>
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="mt-3 flex flex-wrap gap-2">
            {tender.onlineOffline && (
              <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online/Offline
                {tender.onlineOfflineDate && (
                  <span className="ml-1 text-green-600">
                    ({new Date(tender.onlineOfflineDate).toLocaleDateString()})
                  </span>
                )}
              </div>
            )}

            {tender.technicalVerification && (
              <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3 mr-1" />
                Technical Verification
                {tender.technicalVerificationDate && (
                  <span className="ml-1 text-green-600">
                    ({new Date(tender.technicalVerificationDate).toLocaleDateString()})
                  </span>
                )}
              </div>
            )}

            {tender.financialVerification && (
              <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3 mr-1" />
                Financial Verification
                {tender.financialVerificationDate && (
                  <span className="ml-1 text-green-600">
                    ({new Date(tender.financialVerificationDate).toLocaleDateString()})
                  </span>
                )}
              </div>
            )}

            {tender.loa && (
              <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3 mr-1" />
                LOA
                {tender.loaDate && (
                  <span className="ml-1 text-green-600">
                    ({new Date(tender.loaDate).toLocaleDateString()})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Work Order Link */}
          {tender.workOrderUrl && (
            <div className="mt-3">
              <a
                href={tender.workOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                View Work Order
              </a>
            </div>
          )}

          {/* View Bills Button */}
          {onTenderSelect && (
            <button
              onClick={() => onTenderSelect(tender.id.toString())}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View Bills →
            </button>
          )}
        </div>
      ))}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            {editingTender ? 'Edit Tender' : 'New Tender'}
          </h3>

          <div className="space-y-3">
            {/* Tender ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tender ID *
              </label>
              <input
                type="text"
                value={formData.tender_id}
                onChange={(e) => setFormData({ ...formData, tender_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., TND-2024-001"
                disabled={saving}
              />
            </div>

            {/* Agency Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agency Name *
              </label>
              <input
                type="text"
                value={formData.agency_name}
                onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contractor/Agency name"
                disabled={saving}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              <X className="w-4 h-4 inline mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
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
          className="w-full py-3 text-sm font-medium text-blue-600 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Tender
        </button>
      )}
    </div>
  );
};
