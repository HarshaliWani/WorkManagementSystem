import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Check, Trash2 } from 'lucide-react';
import { TechnicalSanction, WorkPortionItem } from '../data/mockData';
import { technicalSanctionService } from '../services/technicalSanctionService';

interface TechnicalSanctionProps {
  workId?: string; // Optional: filter by work
  isEditMode: boolean;
}

const emptyWorkPortion: WorkPortionItem = {
  item: '',
  cost: 0,
  royalty: 0,
  testing: 0,
  subTotal: 0,
  gst: 0,
  total: 0,
};

const emptyTS: Omit<TechnicalSanction, 'id'> = {
  tsName: '',
  workPortion: [{ ...emptyWorkPortion }],
  consultancy: 0,
  contingency: 0,
  laborInsurance: 0,
  notingDone: false,
  orderDone: false,
  tenders: [],
  totalAmount: 0
};

export const TechnicalSanctionSection: React.FC<TechnicalSanctionProps> = ({
  workId,
  isEditMode,
}) => {
  const [technicalSanctions, setTechnicalSanctions] = useState<TechnicalSanction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTS, setNewTS] = useState<Omit<TechnicalSanction, 'id'>>({ ...emptyTS });
  const [saving, setSaving] = useState(false);

  // Fetch technical sanctions on mount
  useEffect(() => {
    fetchTechnicalSanctions();
  }, [workId]);

  const fetchTechnicalSanctions = async () => {
    try {
      setLoading(true);
      const data = workId 
        ? await technicalSanctionService.getTSByWork(workId)
        : await technicalSanctionService.getAllTS();
      setTechnicalSanctions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching technical sanctions:', err);
      setError('Failed to load technical sanctions');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (items: WorkPortionItem[]) => {
    return items.map(item => ({
      ...item,
      subTotal: (item.cost || 0) + (item.royalty || 0) + (item.testing || 0),
      gst: ((item.cost || 0) + (item.royalty || 0) + (item.testing || 0)) * 0.18,
      total: ((item.cost || 0) + (item.royalty || 0) + (item.testing || 0)) * 1.18
    }));
  };

  const handleAddRow = () => {
    setNewTS(prev => ({
      ...prev,
      workPortion: [...prev.workPortion, { ...emptyWorkPortion }],
    }));
  };

  const handleRemoveRow = (index: number) => {
    setNewTS(prev => ({
      ...prev,
      workPortion: prev.workPortion.filter((_, i) => i !== index),
    }));
  };

  const handleWorkPortionChange = (index: number, field: keyof WorkPortionItem, value: string | number) => {
    setNewTS(prev => {
      const updatedWorkPortion = [...prev.workPortion];
      updatedWorkPortion[index] = {
        ...updatedWorkPortion[index],
        [field]: value,
      };
      return {
        ...prev,
        workPortion: calculateTotals(updatedWorkPortion),
      };
    });
  };

  const handleSaveTS = async () => {
    try {
      setSaving(true);
      const createdTS = await technicalSanctionService.createTS(newTS);
      setTechnicalSanctions(prev => [...prev, createdTS]);
      setIsAdding(false);
      setNewTS({ ...emptyTS });
      setError(null);
    } catch (err) {
      console.error('Error creating technical sanction:', err);
      setError('Failed to create technical sanction');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTS({ ...emptyTS });
  };

  if (loading) {
    return <div className="p-4">Loading technical sanctions...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Existing TS List */}
      {technicalSanctions.map((ts) => (
        <div key={ts.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">TS: {ts.tsName}</h4>
            <div className="flex items-center space-x-4">
              <span className={`flex items-center ${ts.notingDone ? 'text-green-600' : 'text-gray-400'}`}>
                <Check className="w-4 h-4 mr-1" />
                Noting
              </span>
              <span className={`flex items-center ${ts.orderDone ? 'text-green-600' : 'text-gray-400'}`}>
                <Check className="w-4 h-4 mr-1" />
                Order
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Portion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Royalty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Testing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sub Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST (18%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ts.workPortion.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.item}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.royalty.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.testing.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.subTotal.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.gst.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Consultancy:</span>
                <span className="ml-2 font-semibold">₹{ts.consultancy.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Contingency:</span>
                <span className="ml-2 font-semibold">₹{ts.contingency.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Labor Insurance:</span>
                <span className="ml-2 font-semibold">₹{ts.laborInsurance.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <span className="ml-2 font-bold text-lg text-blue-600">₹{ts.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add New TS Form */}
      {isAdding && (
        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-4">New Technical Sanction</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TS Name
            </label>
            <input
              type="text"
              value={newTS.tsName}
              onChange={(e) => setNewTS(prev => ({ ...prev, tsName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter TS name"
            />
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Portion</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Royalty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Testing</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sub Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newTS.workPortion.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => handleWorkPortionChange(index, 'item', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Item name"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.cost}
                        onChange={(e) => handleWorkPortionChange(index, 'cost', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.royalty}
                        onChange={(e) => handleWorkPortionChange(index, 'royalty', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.testing}
                        onChange={(e) => handleWorkPortionChange(index, 'testing', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      ₹{item.subTotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      ₹{item.gst.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                      ₹{item.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      {newTS.workPortion.length > 1 && (
                        <button
                          onClick={() => handleRemoveRow(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleAddRow}
            className="mb-4 flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Row
          </button>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultancy
              </label>
              <input
                type="number"
                value={newTS.consultancy}
                onChange={(e) => setNewTS(prev => ({ ...prev, consultancy: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contingency
              </label>
              <input
                type="number"
                value={newTS.contingency}
                onChange={(e) => setNewTS(prev => ({ ...prev, contingency: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labor Insurance
              </label>
              <input
                type="number"
                value={newTS.laborInsurance}
                onChange={(e) => setNewTS(prev => ({ ...prev, laborInsurance: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelAdd}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSaveTS}
              disabled={saving || !newTS.tsName}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save TS'}
            </button>
          </div>
        </div>
      )}

      {/* Add New TS Button */}
      {isEditMode && !isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Technical Sanction
        </button>
      )}
    </div>
  );
};
