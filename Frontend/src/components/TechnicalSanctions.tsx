import React, { useState } from 'react';
import { Plus, Save, X, Check } from 'lucide-react';
import { TechnicalSanction, WorkPortionItem } from '../data/mockData';

interface TechnicalSanctionProps {
  technicalSanctions: TechnicalSanction[];
  isEditMode: boolean;
  onAddTS: (ts: TechnicalSanction) => void;
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

const emptyTS: TechnicalSanction = {
  id: '',
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
  technicalSanctions,
  isEditMode,
  onAddTS,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTS, setNewTS] = useState<TechnicalSanction>({ ...emptyTS });

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

  const handleSaveTS = () => {
    const updatedWorkPortion = calculateTotals(newTS.workPortion);
    const totalWorkAmount = updatedWorkPortion.reduce((sum, item) => sum + item.total, 0);
    
    const tsWithId: TechnicalSanction = {
      ...newTS,
      id: crypto.randomUUID(),
      workPortion: updatedWorkPortion,
      totalAmount: totalWorkAmount + newTS.consultancy + newTS.contingency + newTS.laborInsurance,
    };
    
    onAddTS(tsWithId);
    setIsAdding(false);
    setNewTS({ ...emptyTS });
  };

  return (
    <div className="space-y-4">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.cost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.royalty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.testing}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.subTotal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.gst}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

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

      {/* Add TS Form - To be implemented */}
    </div>
  );
};