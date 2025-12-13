// src/components/BillFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { billService } from '../services/billService';
import { tenderService } from '../services/tenderService';

interface Tender {
  id: number;
  tenderNumber: string;
  workId: number;
  workName: string;
}

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  editingBill?: any | null;
}

const BillFormModal: React.FC<BillFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBill = null,
}) => {
  // Base input values
  const [formData, setFormData] = useState({
    tender: '',
    bill_number: '',
    date: '',
    work_portion: '',
    royalty_and_testing: '',
    gst_percentage: '18',
    reimbursement_of_insurance: '',
    security_deposit: '',
    tds_percentage: '2',
    gst_on_workportion_percentage: '2',
    lwc_percentage: '1',
    insurance: '',
    royalty: '',
  });

  // Calculated values (can be overridden)
  const [calculatedValues, setCalculatedValues] = useState({
    gst: 0,
    bill_total: 0,
    tds: 0,
    gst_on_workportion: 0,
    lwc: 0,
    net_amount: 0,
  });

  // Override flags
  const [overrides, setOverrides] = useState({
    gst: false,
    bill_total: false,
    tds: false,
    gst_on_workportion: false,
    lwc: false,
    net_amount: false,
  });

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tenders on mount
  useEffect(() => {
    if (isOpen) {
      loadTenders();
    }
  }, [isOpen]);

  // ✅ INITIALIZE FORM WHEN EDITING
  useEffect(() => {
    if (editingBill && isOpen) {
      console.log('Editing bill:', editingBill);
      setFormData({
        tender: editingBill.tenderId?.toString() || '',
        bill_number: editingBill.billNumber || '',
        date: editingBill.billDate || '',
        work_portion: editingBill.workPortion?.toString() || '',
        royalty_and_testing: editingBill.RoyaltyAndTesting?.toString() || '0',
        gst_percentage: editingBill.gstPercentage?.toString() || '18',
        reimbursement_of_insurance: editingBill.ReimbursementOfInsurance?.toString() || '0',
        security_deposit: editingBill.SecurityDeposit?.toString() || '0',
        tds_percentage: editingBill.tdsPercentage?.toString() || '2',
        gst_on_workportion_percentage: editingBill.gstOnWorkportionPercentage?.toString() || '2',
        lwc_percentage: editingBill.lwcPercentage?.toString() || '1',
        insurance: editingBill.Insurance?.toString() || '0',
        royalty: editingBill.Royalty?.toString() || '0',
      });

      setCalculatedValues({
        gst: parseFloat(editingBill.gstAmount || editingBill.gst) || 0,
        bill_total: parseFloat(editingBill.billTotal || editingBill.bill_total) || 0,
        tds: parseFloat(editingBill.tdsAmount || editingBill.tds) || 0,
        gst_on_workportion: parseFloat(editingBill.gstOnWorkPortion) || editingBill.gst_on_workportion || 0,
        lwc: parseFloat(editingBill.lwcAmount || editingBill.lwc) || 0,
        net_amount: parseFloat(editingBill.netAmount || editingBill.net_amount) || 0,
      });

      // Reset overrides when editing
      setOverrides({
        gst: false,
        bill_total: false,
        tds: false,
        gst_on_workportion: false,
        lwc: false,
        net_amount: false,
      });
    } else if (!editingBill && isOpen) {
      // Reset form for new entry
      setFormData({
        tender: '',
        bill_number: '',
        date: '',
        work_portion: '',
        royalty_and_testing: '0',
        gst_percentage: '18',
        reimbursement_of_insurance: '0',
        security_deposit: '0',
        tds_percentage: '2',
        gst_on_workportion_percentage: '2',
        lwc_percentage: '1',
        insurance: '0',
        royalty: '0',
      });
      setCalculatedValues({
        gst: 0,
        bill_total: 0,
        tds: 0,
        gst_on_workportion: 0,
        lwc: 0,
        net_amount: 0,
      });
      setOverrides({
        gst: false,
        bill_total: false,
        tds: false,
        gst_on_workportion: false,
        lwc: false,
        net_amount: false,
      });
    }
  }, [editingBill, isOpen]);

  // ✅ DYNAMIC CALCULATIONS - Calculate all values whenever inputs change
  useEffect(() => {
    const workPortion = parseFloat(formData.work_portion) || 0;
    const royaltyTesting = parseFloat(formData.royalty_and_testing) || 0;
    const gstPercentage = parseFloat(formData.gst_percentage) || 0;
    const reimbursement = parseFloat(formData.reimbursement_of_insurance) || 0;
    const securityDeposit = parseFloat(formData.security_deposit) || 0;
    const tdsPercentage = parseFloat(formData.tds_percentage) || 0;
    const gstWorkPortionPercentage = parseFloat(formData.gst_on_workportion_percentage) || 0;
    const lwcPercentage = parseFloat(formData.lwc_percentage) || 0;
    const insurance = parseFloat(formData.insurance) || 0;
    const royalty = parseFloat(formData.royalty) || 0;

    // GST calculated on work_portion only
    const gst = !overrides.gst
      ? Number((workPortion * gstPercentage) / 100)
      : Number(calculatedValues.gst);

    // Bill Total = work_portion + royalty_and_testing + gst + reimbursement_of_insurance
    const billTotal = !overrides.bill_total
      ? Number(workPortion + royaltyTesting + gst + reimbursement)
      : Number(calculatedValues.bill_total);

    // TDS on work_portion
    const tds = !overrides.tds
      ? Number((workPortion * tdsPercentage) / 100)
      : Number(calculatedValues.tds);

    // GST on work portion
    const gstOnWorkPortion = !overrides.gst_on_workportion
      ? Number((workPortion * gstWorkPortionPercentage) / 100)
      : Number(calculatedValues.gst_on_workportion);

    // LWC on (work_portion + royalty_and_testing)
    const lwc = !overrides.lwc
      ? Number(((workPortion + royaltyTesting) * lwcPercentage) / 100)
      : Number(calculatedValues.lwc);

    // Net Amount = bill_total - tds - gst_on_workportion - security_deposit - lwc - insurance - royalty
    const netAmount = !overrides.net_amount
      ? (billTotal + tds + gstOnWorkPortion   + securityDeposit + lwc + insurance + royalty)
      : (calculatedValues.net_amount);

    setCalculatedValues({
      gst,
      bill_total: billTotal,
      tds,
      gst_on_workportion: gstOnWorkPortion,
      lwc,
      net_amount: netAmount,
    });
  }, [
    formData.work_portion,
    formData.royalty_and_testing,
    formData.gst_percentage,
    formData.reimbursement_of_insurance,
    formData.security_deposit,
    formData.tds_percentage,
    formData.gst_on_workportion_percentage,
    formData.lwc_percentage,
    formData.insurance,
    formData.royalty,
    overrides,
  ]);

  const loadTenders = async () => {
    try {
      const data = await tenderService.fetchAllTenders();
      setTenders(data);
    } catch (error) {
      console.error('Error loading tenders:', error);
      setError('Failed to load tenders');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        bill_number: formData.bill_number,
        date: formData.date || undefined,
        work_portion: parseFloat(formData.work_portion),
        royalty_and_testing: parseFloat(formData.royalty_and_testing) || 0,
        gst_percentage: parseFloat(formData.gst_percentage),
        reimbursement_of_insurance: parseFloat(formData.reimbursement_of_insurance) || 0,
        security_deposit: parseFloat(formData.security_deposit) || 0,
        tds_percentage: parseFloat(formData.tds_percentage),
        gst_on_workportion_percentage: parseFloat(formData.gst_on_workportion_percentage),
        lwc_percentage: parseFloat(formData.lwc_percentage),
        insurance: parseFloat(formData.insurance) || 0,
        royalty: parseFloat(formData.royalty) || 0,
      };

      // Add tender for new bills only
      if (!editingBill) {
        payload.tender = parseInt(formData.tender);
      }

      // Add overridden values if any
      if (overrides.gst) payload.gst = calculatedValues.gst;
      if (overrides.bill_total) payload.bill_total = calculatedValues.bill_total;
      if (overrides.tds) payload.tds = calculatedValues.tds;
      if (overrides.gst_on_workportion) payload.gst_on_workportion = calculatedValues.gst_on_workportion;
      if (overrides.lwc) payload.lwc = calculatedValues.lwc;
      if (overrides.net_amount) payload.net_amount = calculatedValues.net_amount;

      if (editingBill) {
        await billService.updateBill(editingBill.id.toString(), payload);
      } else {
        await billService.createBill(payload);
      }

      await onSubmit();
      onClose();
    } catch (err: any) {
      console.error('Error saving bill:', err);
      setError(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingBill ? 'Edit Bill' : 'Add Bill'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
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

          {/* Select Tender */}
          {!editingBill && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tender *
              </label>
              <select
                value={formData.tender}
                onChange={(e) => setFormData({ ...formData, tender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!editingBill}
              >
                <option value="">Select a tender</option>
                {tenders.map((tender) => (
                  <option key={tender.id} value={tender.id}>
                    {tender.tenderNumber} - {tender.workName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Basic Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Number *
              </label>
              <input
                type="text"
                value={formData.bill_number}
                onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!editingBill}
                placeholder="Enter bill number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Base Input Fields */}
          <div className="grid grid-cols-2 gap-4">
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
                Royalty & Testing
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.royalty_and_testing}
                onChange={(e) => setFormData({ ...formData, royalty_and_testing: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter royalty & testing amount"
              />
            </div>
          </div>

          {/* GST Section - FULL ROW */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">GST Calculation</h3>
            </div>
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
                  value={(calculatedValues.gst || 0).toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, gst: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, gst: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${overrides.gst ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                />
                {overrides.gst && (
                  <span className="text-xs text-yellow-600">Overridden</span>
                )}
              </div>
            </div>
          </div>

          {/* Reimbursement of Insurance - FULL ROW */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reimbursement of Insurance
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.reimbursement_of_insurance}
              onChange={(e) => setFormData({ ...formData, reimbursement_of_insurance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reimbursement amount"
            />
          </div>

          {/* Bill Total - FULL ROW */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Bill Total</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Total (Calculated)
              </label>
              <input
                type="number"
                step="0.01"
                value={(calculatedValues.bill_total || 0).toFixed(2)}
                onChange={(e) => {
                  setCalculatedValues({ ...calculatedValues, bill_total: parseFloat(e.target.value) || 0 });
                  setOverrides({ ...overrides, bill_total: true });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${overrides.bill_total ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                  }`}
              />
              {overrides.bill_total && (
                <span className="text-xs text-yellow-600">Overridden</span>
              )}
            </div>
          </div>

          {/* TDS Section - FULL ROW */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">TDS</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TDS % (default 2%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tds_percentage}
                  onChange={(e) => setFormData({ ...formData, tds_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TDS Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(calculatedValues.tds || 0).toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, tds: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, tds: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${overrides.tds ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                />
                {overrides.tds && (
                  <span className="text-xs text-yellow-600">Overridden</span>
                )}
              </div>
            </div>
          </div>

          {/* GST on Work Portion Section - FULL ROW */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">GST on Work Portion</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST on Work Portion % (default 2%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gst_on_workportion_percentage}
                  onChange={(e) => setFormData({ ...formData, gst_on_workportion_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST on Work Portion Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(calculatedValues.gst_on_workportion || 0).toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, gst_on_workportion: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, gst_on_workportion: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${overrides.gst_on_workportion ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                />
                {overrides.gst_on_workportion && (
                  <span className="text-xs text-yellow-600">Overridden</span>
                )}
              </div>
            </div>
          </div>

          {/* Security Deposit - FULL ROW */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Deposit
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.security_deposit}
              onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter security deposit"
            />
          </div>

          {/* LWC Section - FULL ROW */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-indigo-900">LWC (Labour Welfare Cess)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LWC % (default 1%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lwc_percentage}
                  onChange={(e) => setFormData({ ...formData, lwc_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LWC Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(calculatedValues.lwc || 0).toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, lwc: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, lwc: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${overrides.lwc ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                />
                {overrides.lwc && (
                  <span className="text-xs text-yellow-600">Overridden</span>
                )}
              </div>
            </div>
          </div>

          {/* Insurance and Royalty - TWO COLUMNS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter insurance amount"
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
          </div>

          {/* Net Amount - FULL ROW */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Totals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Net Amount</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={(calculatedValues.net_amount || 0).toFixed(2)}
                    onChange={(e) => {
                      setCalculatedValues({ ...calculatedValues, net_amount: parseFloat(e.target.value) || 0 });
                      setOverrides({ ...overrides, net_amount: true });
                    }}
                    className={`px-3 py-2 text-lg font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${overrides.net_amount ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                      }`}
                  />
                  {overrides.net_amount && (
                    <span className="text-xs text-yellow-600">Overridden</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingBill ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillFormModal;
