import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Loader, Edit2, Receipt } from 'lucide-react';
import { billService } from '../services/billService';

// ✅ FIX 1: Correct Bill interface matching backend GET response
interface Bill {
  id: string;
  billNumber: string;      // ✅ camelCase from backend
  billDate?: string;       // ✅ camelCase from backend
  billAmount?: number;     // ✅ camelCase from backend (net_amount)
  created_at?: string;
  updated_at?: string;
}

interface BillSectionProps {
  tenderId?: string;
  isEditMode: boolean;
}

export const BillSection: React.FC<BillSectionProps> = ({
  tenderId,
  isEditMode,
}) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [saving, setSaving] = useState(false);
  
  // ✅ Internal form state uses simple names
  const [formData, setFormData] = useState({
    billNumber: '',
    billDate: '',
    billAmount: '',
    workPortion: '',
    royaltyAndTesting: '',
    reimbursementOfInsurance: '',
    securityDeposit: '',
    insurance: '',
    royalty: '',
  });

  useEffect(() => {
    if (tenderId) {
      fetchBills();
    }
  }, [tenderId]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await billService.fetchAllBills();
      setBills(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      billNumber: '',
      billDate: '',
      billAmount: '',
      workPortion: '',
      royaltyAndTesting: '',
      reimbursementOfInsurance: '',
      securityDeposit: '',
      insurance: '',
      royalty: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setEditingBill(null);
    setIsAdding(true);
  };

  // ✅ FIX 2: Correct handleEdit using camelCase fields from backend
  const handleEdit = (bill: Bill) => {
    setFormData({
      billNumber: bill.billNumber,                          // ✅ Fixed
      billDate: bill.billDate?.split('T')[0] || '',        // ✅ Fixed
      billAmount: bill.billAmount?.toString() || '',        // ✅ Fixed
      workPortion: '',
      royaltyAndTesting: '',
      reimbursementOfInsurance: '',
      securityDeposit: '',
      insurance: '',
      royalty: '',
    });
    setEditingBill(bill);
    setIsAdding(true);
  };

  // ✅ FIX 3: Correct handleSave using snake_case fields for POST
  const handleSave = async () => {
    if (!formData.billNumber || !formData.billAmount) {
      setError('Bill number and amount are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const billData = {
        tender: parseInt(tenderId || ''),                    // ✅ Correct
        bill_number: formData.billNumber,                    // ✅ snake_case for POST
        date: formData.billDate || undefined,                // ✅ Correct
        work_portion: parseFloat(formData.workPortion || formData.billAmount),  // ✅ snake_case
        royalty_and_testing: formData.royaltyAndTesting      // ✅ snake_case
          ? parseFloat(formData.royaltyAndTesting)
          : undefined,
        reimbursement_of_insurance: formData.reimbursementOfInsurance  // ✅ snake_case
          ? parseFloat(formData.reimbursementOfInsurance)
          : undefined,
        security_deposit: formData.securityDeposit           // ✅ snake_case
          ? parseFloat(formData.securityDeposit)
          : undefined,
        insurance: formData.insurance                        // ✅ Correct
          ? parseFloat(formData.insurance)
          : undefined,
        royalty: formData.royalty                            // ✅ Correct
          ? parseFloat(formData.royalty)
          : undefined,
      };

      if (editingBill) {
        await billService.updateBill(editingBill.id, billData);
      } else {
        await billService.createBill(billData);
      }

      await fetchBills();
      setIsAdding(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving bill:', err);
      setError(err.response?.data?.error || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingBill(null);
    resetForm();
    setError(null);
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading bills...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Existing Bills */}
      {bills.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          No bills found. {isEditMode && 'Click "Add Bill" to create one.'}
        </div>
      )}

      {/* ✅ FIX 4: Correct bill display using camelCase fields */}
      {bills.map((bill) => (
        <div key={bill.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Receipt className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-semibold text-gray-900">{bill.billNumber}</div>  {/* ✅ Fixed */}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditMode && (
                <button
                  onClick={() => handleEdit(bill)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit bill"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Bill Amount:</span>
              <div className="font-semibold text-gray-900">
                {formatCurrency(bill.billAmount || 0)}  {/* ✅ Fixed */}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Bill Date:</span>
              <div className="font-semibold text-gray-900">
                {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : '-'}  {/* ✅ Fixed */}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-green-600" />
              <span>{editingBill ? 'Edit Bill' : 'New Bill'}</span>
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Number *
              </label>
              <input
                type="text"
                value={formData.billNumber}
                onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., BILL-2024-001"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Date
              </label>
              <input
                type="date"
                value={formData.billDate}
                onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Portion *
              </label>
              <input
                type="number"
                value={formData.workPortion}
                onChange={(e) => setFormData({ ...formData, workPortion: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                disabled={saving}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Royalty and Testing
              </label>
              <input
                type="number"
                value={formData.royaltyAndTesting}
                onChange={(e) => setFormData({ ...formData, royaltyAndTesting: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                disabled={saving}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reimbursement of Insurance
              </label>
              <input
                type="number"
                value={formData.reimbursementOfInsurance}
                onChange={(e) => setFormData({ ...formData, reimbursementOfInsurance: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                disabled={saving}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit
              </label>
              <input
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                disabled={saving}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance
              </label>
              <input
                type="number"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                disabled={saving}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Royalty
              </label>
              <input
                type="number"
                value={formData.royalty}
                onChange={(e) => setFormData({ ...formData, royalty: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                disabled={saving}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={saving}
            >
              <X className="w-4 h-4 inline mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 inline mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 inline mr-1" />
                  {editingBill ? 'Update' : 'Save'} Bill
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
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Bill</span>
        </button>
      )}
    </div>
  );
};
