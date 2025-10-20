import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit3, Save, X } from 'lucide-react';
import { GR, Work, Spill } from '../data/mockData';
import { TechnicalSanctionSection } from './TechnicalSanctions';

interface WorkTableProps {
  grs: GR[];
  selectedGR?: string | null;
  isEditMode: boolean;
}

interface ExpandedState {
  [key: string]: boolean;
}

interface EditingSpill {
  grIndex: number;
  workIndex: number;
  spillIndex?: number;
  ara: string;
}

export const WorkTable: React.FC<WorkTableProps> = ({ grs, selectedGR, isEditMode }) => {
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const [editingSpill, setEditingSpill] = useState<EditingSpill | null>(null);

  // Filter GRs based on selection
  const filteredGRs = selectedGR
    ? grs.filter(gr => gr.grNumber === selectedGR)
    : grs;

  const toggleExpansion = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const canAddSpill = (work: Work): boolean => {
    const totalARA = work.spills.reduce((sum, spill) => sum + spill.ARA, 0);
    return work.RA + totalARA < work.AA;
  };

  const handleAddSpill = (grIndex: number, workIndex: number) => {
    setEditingSpill({
      grIndex,
      workIndex,
      ara: ''
    });
  };

  const handleSaveSpill = () => {
    if (editingSpill && editingSpill.ara) {
      // In a real app, this would update the data store
      console.log('Adding spill:', editingSpill);
      setEditingSpill(null);
    }
  };

  const handleCancelSpill = () => {
    setEditingSpill(null);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
  };

  const renderSpillRow = (spill: Spill, spillIndex: number, grIndex: number, workIndex: number) => {
    const spillRowId = `spill-${grIndex}-${workIndex}-${spillIndex}`;
    const isExpanded = expandedRows[spillRowId];

    return (
      <React.Fragment key={spillIndex}>
        <tr className="bg-blue-50 border-l-4 border-blue-300">
          <td className="px-6 py-3 text-sm text-gray-600">—</td>
          <td className="px-6 py-3 text-sm text-gray-600">—</td>
          <td className="px-6 py-3 text-sm font-medium text-blue-800">
            Spill {spillIndex + 1}
          </td>
          <td className="px-6 py-3 text-sm text-gray-600">—</td>
          <td className="px-6 py-3 text-sm font-semibold text-blue-700">
            {formatCurrency(spill.ARA)}
          </td>
          <td className="px-6 py-3">
            <button
              onClick={() => toggleExpansion(spillRowId)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {isExpanded ? 'Collapse' : 'Expand'} Details
              </span>
            </button>
          </td>
        </tr>

        {isExpanded && (
          <tr className="bg-blue-25">
            <td colSpan={6} className="px-6 py-4">
              <div className="ml-8 space-y-4">
                {/* Technical Sanctions Placeholder */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                    Technical Sanctions
                  </h4>
                  <TechnicalSanctionSection
                    technicalSanctions={spill.technicalSanctions}
                    isEditMode={isEditMode}
                    onAddTS={(newTS) => {
                      // Handle adding new TS
                      console.log('New TS:', newTS);
                    }}
                  />
                </div>
                {/* Tenders Placeholder */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                    Tenders
                  </h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    Tender management will be implemented in Stage 4.
                  </div>
                </div>

                {/* Bills Placeholder */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                    Bills
                  </h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    Bill management will be implemented in Stage 5.
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const renderAddSpillRow = (grIndex: number, workIndex: number) => {
    if (!editingSpill || editingSpill.grIndex !== grIndex || editingSpill.workIndex !== workIndex) {
      return null;
    }

    return (
      <tr className="bg-green-50 border-l-4 border-green-300">
        <td className="px-6 py-3 text-sm text-gray-600">—</td>
        <td className="px-6 py-3 text-sm text-gray-600">—</td>
        <td className="px-6 py-3 text-sm font-medium text-green-800">
          New Spill
        </td>
        <td className="px-6 py-3 text-sm text-gray-600">—</td>
        <td className="px-6 py-3">
          <input
            type="number"
            value={editingSpill.ara}
            onChange={(e) => setEditingSpill({ ...editingSpill, ara: e.target.value })}
            placeholder="Enter ARA amount"
            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
        </td>
        <td className="px-6 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveSpill}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </button>
            <button
              onClick={handleCancelSpill}
              className="flex items-center px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GR Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Work Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGRs.map((gr, grIndex) =>
              gr.works.map((work, workIndex) => {
                const rowId = `work-${grIndex}-${workIndex}`;
                const isExpanded = expandedRows[rowId];
                const canAdd = canAddSpill(work);

                return (
                  <React.Fragment key={`${gr.grNumber}-${workIndex}`}>
                    {/* Main Work Row */}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {gr.grNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(gr.grDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {work.workName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(work.AA)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(work.RA)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleExpansion(rowId)}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 mr-1" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-1" />
                            )}
                            <span className="font-medium">
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                          </button>

                          {isEditMode && (
                            <button
                              onClick={() => handleAddSpill(grIndex, workIndex)}
                              disabled={!canAdd}
                              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${canAdd
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                              title={canAdd ? 'Add new spill' : 'Cannot add spill: RA + ARA >= AA'}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Spill
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <>
                        {/* Existing Spills */}
                        {work.spills.map((spill, spillIndex) =>
                          renderSpillRow(spill, spillIndex, grIndex, workIndex)
                        )}

                        {/* Add Spill Row */}
                        {renderAddSpillRow(grIndex, workIndex)}

                        {/* Summary Row */}
                        <tr className="bg-gray-100">
                          <td colSpan={6} className="px-6 py-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700">
                                Total Spills: {work.spills.length}
                              </span>
                              <span className="font-medium text-gray-700">
                                Total ARA: {formatCurrency(work.spills.reduce((sum, spill) => sum + spill.ARA, 0))}
                              </span>
                              <span className="font-medium text-gray-700">
                                Remaining: {formatCurrency(work.AA - work.RA - work.spills.reduce((sum, spill) => sum + spill.ARA, 0))}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};