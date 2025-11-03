import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Save, X, Loader, Edit2 } from 'lucide-react'; // ADD Edit2
import { GR, Work, Spill } from '../data/mockData';
import { TechnicalSanctionSection } from './TechnicalSanctions';
import { spillService } from '../services/spillService';
import { WorkFormModal } from './WorkFormModal'; 
import { TenderSection } from './TenderSection';
import { BillSection } from './BillSection';


interface WorkTableProps {
  grs: GR[];
  selectedGR?: string | null;
  isEditMode: boolean;
  onDataUpdate?: () => void;
}

interface ExpandedState {
  [key: string]: boolean;
}

interface EditingSpill {
  grIndex: number;
  workIndex: number;
  workId: string;
  spillIndex?: number;
  ara: string;
}

export const WorkTable: React.FC<WorkTableProps> = ({
  grs,
  selectedGR,
  isEditMode,
  onDataUpdate
}) => {
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const [editingSpill, setEditingSpill] = useState<EditingSpill | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ADD THESE NEW STATE VARIABLES FOR WORK MODAL
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [selectedGRForWork, setSelectedGRForWork] = useState<string>('');

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

  // ADD THESE NEW HANDLERS FOR WORK MANAGEMENT
  const handleAddWork = (grId: string) => {
    setEditingWork(null);
    setSelectedGRForWork(grId);
    setShowWorkModal(true);
  };

  const handleEditWork = (e: React.MouseEvent, work: Work) => {
    e.stopPropagation();
    setEditingWork(work);
    setSelectedGRForWork(''); // Not needed for edit
    setShowWorkModal(true);
  };

  const handleWorkModalClose = () => {
    setShowWorkModal(false);
    setEditingWork(null);
    setSelectedGRForWork('');
  };

  const handleWorkModalSuccess = () => {
    if (onDataUpdate) {
      onDataUpdate();
    }
    handleWorkModalClose();
  };

  // EXISTING SPILL HANDLERS - Keep as is
  const handleAddSpill = (grIndex: number, workIndex: number, work: Work) => {
    setEditingSpill({
      grIndex,
      workIndex,
      workId: work.id || '',
      ara: ''
    });
    setError(null);
  };

  const handleSaveSpill = async () => {
    if (!editingSpill || !editingSpill.ara) {
      setError('Please enter an ARA amount');
      return;
    }

    const araAmount = parseFloat(editingSpill.ara);
    if (isNaN(araAmount) || araAmount <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await spillService.createSpill(editingSpill.workId, araAmount);

      if (onDataUpdate) {
        onDataUpdate();
      }

      setEditingSpill(null);
    } catch (err: any) {
      console.error('Error creating spill:', err);
      setError(err.response?.data?.error || 'Failed to create spill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSpill = () => {
    setEditingSpill(null);
    setError(null);
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

  // EXISTING renderSpillRow - Keep as is
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
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                    Technical Sanctions
                  </h4>
                  <TechnicalSanctionSection
                    workId={spill.id}
                    isEditMode={isEditMode}
                  />
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                    Tenders
                  </h4>
                  <TenderSection
                    tsId={spill.id}
                    isEditMode={isEditMode}
                    onTenderSelect={(tenderId) => {
                      // Handle tender selection for bills view
                      console.log('Selected tender:', tenderId);
                    }}
                  />
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                    Bills
                  </h4>
                  <BillSection
                    tenderId={spill.id} // Or get from selected tender
                    isEditMode={isEditMode}
                  />
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // EXISTING renderAddSpillRow - Keep as is
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
          <div className="flex flex-col space-y-1">
            <input
              type="number"
              value={editingSpill.ara}
              onChange={(e) => setEditingSpill({ ...editingSpill, ara: e.target.value })}
              placeholder="Enter ARA amount"
              className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
              disabled={saving}
            />
            {error && (
              <span className="text-xs text-red-600">{error}</span>
            )}
          </div>
        </td>
        <td className="px-6 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveSpill}
              disabled={saving || !editingSpill.ara}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Save className="w-3 h-3 mr-1" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancelSpill}
              disabled={saving}
              className="flex items-center px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
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
    <>
      {/* MAIN TABLE */}
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
              {filteredGRs.map((gr, grIndex) => (
                <React.Fragment key={gr.grNumber}>
                  {/* ADD THIS: Add Work Row for Each GR (when in edit mode and GR has no works expanded) */}
                  {isEditMode && gr.works.length === 0 && (
                    <tr className="bg-yellow-50">
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleAddWork(gr.id || '')}
                          className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Work to {gr.grNumber}
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* ADD THIS: Show "Add Work" button before works if GR is expanded */}
                  {isEditMode && gr.works.length > 0 && expandedRows[`gr-header-${grIndex}`] && (
                    <tr className="bg-blue-50">
                      <td colSpan={6} className="px-6 py-2">
                        <button
                          onClick={() => handleAddWork(gr.id || '')}
                          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Work to {gr.grNumber}
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Existing Work Rows */}
                  {gr.works.map((work, workIndex) => {
                    const rowId = `work-${grIndex}-${workIndex}`;
                    const isExpanded = expandedRows[rowId];
                    const canAdd = canAddSpill(work);

                    return (
                      <React.Fragment key={`${gr.grNumber}-${workIndex}`}>
                        {/* Main Work Row - MODIFY THIS */}
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {gr.grNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(gr.grDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="flex items-center justify-between">
                              <span>{work.workName}</span>
                              {/* ADD EDIT BUTTON HERE */}
                              {isEditMode && (
                                <button
                                  onClick={(e) => handleEditWork(e, work)}
                                  className="ml-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit work"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
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
                                  onClick={() => handleAddSpill(grIndex, workIndex, work)}
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

                        {/* Expanded Content - Keep as is */}
                        {isExpanded && (
                          <>
                            {work.spills.map((spill, spillIndex) =>
                              renderSpillRow(spill, spillIndex, grIndex, workIndex)
                            )}

                            {renderAddSpillRow(grIndex, workIndex)}

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
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD WORK MODAL HERE - AT THE END */}
      <WorkFormModal
        isOpen={showWorkModal}
        onClose={handleWorkModalClose}
        onSuccess={handleWorkModalSuccess}
        grId={selectedGRForWork}
        editingWork={editingWork}
      />
    </>
  );
};
