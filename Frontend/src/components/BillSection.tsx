import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Loader, Edit2, Receipt } from 'lucide-react';
import { Bill } from '../data/mockData';
import { billService } from '../services/billService';

interface BillSectionProps {
  tenderId?: string;
  isEditMode: boolean;
}

export const BillSection: React.FC<BillSectionProps> = ({
  tenderId,
  isEditMode,
}) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    billNumber: '',
    billDate: '',
    billAmount: '',
    billType: 'Running Account Bill' as 'Running Account Bill' | 'Final Bill',
    workCompletedPercentage: '',
    status: 'Pending' as 'Pending' | 'Approved' | 'Paid',
    approvalDate: '',
    paymentDate: '',
    remarks: '',
  });

  useEffect(() => {
    if (tenderId) {
      fetchBills();
    }
  }, [tenderId]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = tenderId
        ? await billService.getBillsByTender(tenderId)
        : await billService.getAllBills();
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
      billType: 'Running Account Bill',
      workCompletedPercentage: '',
      status: 'Pending',
      approvalDate: '',
      paymentDate: '',
      remarks: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setEditingBill(null);
    setIsAdding(true);
  };

  const handleEdit = (bill: Bill) => {
    setFormData({
      billNumber: bill.billNumber,
      billDate: bill.billDate?.split('T')[0] || '',
      billAmount: bill.billAmount?.toString() || '',
      billType: bill.billType || 'Running Account Bill',
      workCompletedPercentage: bill.workCompletedPercentage?.toString() || '',
      status: bill.status || 'Pending',
      approvalDate: bill.approvalDate?.split('T')[0] || '',
      paymentDate: bill.paymentDate?.split('T')[0] || '',
      remarks: bill.remarks || '',
    });
    setEditingBill(bill);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formData.billNumber || !formData.billAmount) {
      setError('Bill number and amount are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const billData = {
        billNumber: formData.billNumber,
        billDate: formData.billDate,
        billAmount: parseFloat(formData.billAmount),
        billType: formData.billType,
        workCompletedPercentage: parseFloat(formData.workCompletedPercentage) || 0,
        status: formData.status,
        approvalDate: formData.approvalDate || undefined,
        paymentDate: formData.paymentDate || undefined,
        remarks: formData.remarks,
      };

      if (editingBill) {
        await billService.updateBill(editingBill.id || '', billData);
      } else {
        await billService.createBill(tenderId || '', billData);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-50';
      case 'Approved': return 'text-blue-600 bg-blue-50';
      case 'Paid': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-600">Loading bills...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Existing Bills */}
      {bills.length === 0 && !isAdding && (
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-center">
          No bills found. {isEditMode && 'Click "Add Bill" to create one.'}
        </div>
      )}

      {bills.map((bill) => (
        <div key={bill.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-green-600" />
                <h5 className="font-semibold text-gray-900">{bill.billNumber}</h5>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(bill.status)}`}>
                  {bill.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{bill.billType}</p>
            </div>
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

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Bill Amount:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {formatCurrency(bill.billAmount || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Bill Date:</span>
              <span className="ml-2 text-gray-900">
                {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Work Completed:</span>
              <span className="ml-2 text-gray-900">{bill.workCompletedPercentage || 0}%</span>
            </div>
            {bill.status === 'Approved' && bill.approvalDate && (
              <div>
                <span className="text-gray-500">Approved On:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(bill.approvalDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {bill.status === 'Paid' && bill.paymentDate && (
              <div>
                <span className="text-gray-500">Paid On:</span>
                <span className="ml-2 text-green-600 font-semibold">
                  {new Date(bill.paymentDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {bill.remarks && (
            <div className="mt-3 text-sm">
              <span className="text-gray-500">Remarks:</span>
              <p className="text-gray-700 mt-1">{bill.remarks}</p>
            </div>
          )}
        </div>
      ))}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-4">
            {editingBill ? 'Edit Bill' : 'New Bill'}
          </h5>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Number <span className="text-red-500">*</span>
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.billAmount}
                  onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  disabled={saving}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Type
                </label>
                <select
                  value={formData.billType}
                  onChange={(e) => setFormData({ ...formData, billType: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={saving}
                >
                  <option value="Running Account Bill">Running Account Bill</option>
                  <option value="Final Bill">Final Bill</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Completed (%)
                </label>
                <input
                  type="number"
                  value={formData.workCompletedPercentage}
                  onChange={(e) => setFormData({ ...formData, workCompletedPercentage: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  disabled={saving}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={saving}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            {(formData.status === 'Approved' || formData.status === 'Paid') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Date
                  </label>
                  <input
                    type="date"
                    value={formData.approvalDate}
                    onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={saving}
                  />
                </div>

                {formData.status === 'Paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={saving}
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional notes..."
                disabled={saving}
                rows={2}
              />
            </div>
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
              disabled={saving || !formData.billNumber || !formData.billAmount}
              className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 mr-1" />
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
          className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </button>
      )}
    </div>
  );
};
