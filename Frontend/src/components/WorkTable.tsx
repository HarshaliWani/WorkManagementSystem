// src/components/WorkTable.tsx - Delete button removed from Actions column

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { ChevronDown, ChevronRight, Edit2, Plus } from 'lucide-react';
import { Work } from '../types/work';
import { ContextMenu } from './ContextMenu';
import { useNavigationContext } from '../contexts/NavigationContext';

interface WorkTableProps {
  works: Work[];
  onEdit: (work: Work) => void;
  onUpdate: () => void;
  onDeleteSpill: (workId: number, spillId: number) => Promise<void>;
  onAddSpill: (workId: number, spillAmount: string) => Promise<void>;
  isEditMode: boolean;
  grs?: { id: number; grNumber: string }[];
}

const WorkTable: React.FC<WorkTableProps> = ({
  works,
  onEdit,
  onUpdate,
  grs,
  onDeleteSpill,
  onAddSpill,
  isEditMode,
}) => {
  const navigate = useNavigate();
  const { setNavigationPath, updateFilters } = useNavigationContext();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [newSpillData, setNewSpillData] = useState<{ [key: number]: string }>({});
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; work: Work } | null>(null);

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTotalRA = (work: Work) => {
    if (!work.spills || work.spills.length === 0) {
      return Number(work.RA);
    }

    return work.spills.reduce(
      (sum, spill) => sum + Number(spill.ARA),
      Number(work.RA)
    );
    // return work.spills.reduce((sum, spill) => sum + Number(spill.ARA) + Number(work.RA), 0);
  };

  const calculateBalance = (work: Work) => {
    const totalRA = calculateTotalRA(work);
    return Number(work.AA) - totalRA;
  };

  const handleAddSpill = async (workId: number) => {
    const amount = newSpillData[workId];
    if (!amount || amount.trim() === '') {
      alert('Please enter a spill amount');
      return;
    }

    try {
      await onAddSpill(workId, amount);
      setNewSpillData({ ...newSpillData, [workId]: '' });
    } catch (error) {
      console.error('Error adding spill:', error);
    }
  };

  // Handle right-click on Work row
  const handleContextMenu = (e: React.MouseEvent, work: Work) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, work });
  };

  // Handle "View Technical Sanctions" navigation
  const handleViewTechnicalSanctions = (work: Work) => {
    const grId = work.gr;
    // Use flushSync to prevent race conditions
    flushSync(() => {
      updateFilters({ 
        gr_id: grId, 
        work_id: work.id, 
        technical_sanction_id: null, 
        tender_id: null 
      });
    });
    // Navigate with query parameters - NavigationUrlSync will sync path and filters from URL
    // ContextMenu component will handle closing the menu after onClick completes
    navigate(`/technical-sanctions?gr=${grId}&work=${work.id}`);
  };

  if (works.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No works found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              AA
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total RA
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            {isEditMode && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {works.map((work) => {
            const balance = calculateBalance(work);
            const isExpanded = expandedRows.has(work.id);

            return (
              <React.Fragment key={work.id}>
                {/* Main Row */}
                <tr 
                  className={`hover:bg-gray-50 cursor-pointer ${work.isCancelled ? 'bg-gray-50 opacity-75' : ''}`} 
                  onClick={() => toggleRow(work.id)}
                  onContextMenu={(e) => handleContextMenu(e, work)}
                  title={work.isCancelled && work.cancelReason ? `Cancelled: ${work.cancelReason === 'SHIFTED_TO_OTHER_WORK' ? 'Work shifted to another work' : 'Work assigned to different department'}` : undefined}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <span className={work.isCancelled ? 'text-gray-500' : 'text-gray-900'}>
                        {work.workName}
                      </span>
                      {work.isCancelled && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${work.isCancelled ? 'text-gray-500' : 'text-gray-700'}`}>
                    {work.workDate}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${work.isCancelled ? 'text-gray-500' : 'text-blue-900'}`}>
                    {formatCurrency(Number(work.AA) || 0)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${work.isCancelled ? 'text-gray-500' : 'text-green-900'}`}>
                    {formatCurrency(calculateTotalRA(work))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`font-bold ${work.isCancelled ? 'text-gray-500' : balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(calculateBalance(work))}
                    </span>
                  </td>
                  {isEditMode && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(work);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit Work"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>

                {/* Expanded Spills Row */}
                {isExpanded && (
                  <tr>
                    <td colSpan={isEditMode ? 7 : 6} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">
                          Spills for {work.workName}
                        </h4>

                        {work.spills && work.spills.length > 0 ? (
                          <div className="space-y-2">
                            {work.spills.map((spill) => (
                              <div
                                key={spill.id}
                                className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200"
                              >
                                <div>
                                  <p className="text-sm text-gray-600">ARA Amount</p>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(Number(spill.ARA))}
                                  </p>
                                </div>
                                {isEditMode && (
                                  <button
                                    onClick={() => onDeleteSpill(work.id, spill.id)}
                                    className="text-red-600 hover:text-red-900 text-sm px-3 py-1 rounded hover:bg-red-50"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            {isEditMode && 'No spills added yet'}
                          </p>
                        )}

                        {/* Add Spill (Edit Mode Only) */}
                        {isEditMode && (
                          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                            <input
                              type="number"
                              placeholder="Enter spill amount..."
                              value={newSpillData[work.id] || ''}
                              onChange={(e) =>
                                setNewSpillData((prev) => ({
                                  ...prev,
                                  [work.id]: e.target.value,
                                }))
                              }
                              disabled={work.isCancelled}
                              className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${work.isCancelled ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}`}
                            />
                            <div className="relative group">
                              <button
                                onClick={() => handleAddSpill(work.id)}
                                disabled={work.isCancelled}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                  work.isCancelled 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                                title={work.isCancelled ? 'This work has been cancelled. Create a new work for further processing.' : 'Add Spill'}
                              >
                                <Plus className="w-4 h-4" />
                                Add Spill
                              </button>
                              {work.isCancelled && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                  This work has been cancelled. Create a new work for further processing.
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: 'View Technical Sanctions',
              onClick: () => handleViewTechnicalSanctions(contextMenu.work),
            },
          ]}
        />
      )}
    </div>
  );
};

export default WorkTable;
