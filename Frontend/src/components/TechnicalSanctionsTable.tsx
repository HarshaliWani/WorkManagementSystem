// src/components/TechnicalSanctionsTable.tsx - RESTORED PREVIOUS UI
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { TechnicalSanction } from '../services/technicalSanctionService';
import { ContextMenu } from './ContextMenu';
import { useNavigationContext } from '../contexts/NavigationContext';

interface TechnicalSanctionsTableProps {
  technicalSanctions: TechnicalSanction[];
  works: any[];
  onEdit: (ts: TechnicalSanction) => void;
  onDelete: (id: number) => void;
  isEditMode: boolean;
}

interface GroupedTS {
  workName: string;
  workDate: string;
  aa: number;
  totalFinalTotal: number;
  balance: number;
  items: TechnicalSanction[];
}

const TechnicalSanctionsTable: React.FC<TechnicalSanctionsTableProps> = ({
  technicalSanctions,
  works,
  onEdit,
  onDelete,
  isEditMode,
}) => {
  const navigate = useNavigate();
  const { updateFilters } = useNavigationContext();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; ts: TechnicalSanction } | null>(null);

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Handle right-click on Technical Sanction row
  const handleContextMenu = (e: React.MouseEvent, ts: TechnicalSanction) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, ts });
  };

  // Handle "View Tenders" navigation
  const handleViewTenders = (ts: TechnicalSanction) => {
    const grId = ts.gr_id;
    const workId = ts.work;
    const tsId = ts.id;
    // Use flushSync to prevent race conditions
    flushSync(() => {
      updateFilters({ 
        gr_id: grId, 
        work_id: workId, 
        technical_sanction_id: tsId, 
        tender_id: null 
      });
    });
    // Navigate with query parameters - NavigationUrlSync will sync path and filters from URL
    // ContextMenu component will handle closing the menu after onClick completes
    navigate(`/tenders?gr=${grId}&work=${workId}&technical_sanction=${tsId}`);
  };

  const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
      return '₹0.00';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
      return '₹0.00';
    }
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };


  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN');
  };

  // Group by work name and sort by latest work date first
  const groupedTechnicalSanctions = useMemo(() => {
    const grouped = technicalSanctions.reduce((acc, ts) => {
      const workName = ts.work_name;
      
      if (!acc[workName]) {
        const work = works.find(w => w.id === ts.work);
        const workDate = work?.workDate || ts.created_at;
        const aa = parseFloat(ts.aa) || 0;
        
        acc[workName] = {
          workName: workName,
          workDate: workDate,
          aa: aa,
          totalFinalTotal: 0, // Will be calculated later
          balance: 0, // Will be calculated later
          items: [],
        };
      }
      
      acc[workName].items.push(ts);
      return acc;
    }, {} as Record<string, GroupedTS>);

    // Calculate total final total and balance for each group, then sort
    return Object.values(grouped)
      .map(group => {
        // Calculate sum of all final totals for this work
        const totalFinalTotal = group.items.reduce((sum, ts) => {
          const finalTotal = ts.finalTotal === null || ts.finalTotal === undefined 
            ? 0 
            : typeof ts.finalTotal === 'string' 
              ? parseFloat(ts.finalTotal) 
              : ts.finalTotal;
          return sum + (isNaN(finalTotal) ? 0 : finalTotal);
        }, 0);
        
        // Calculate balance: AA - sum of all final totals
        const balance = group.aa - totalFinalTotal;
        
        return {
          ...group,
          totalFinalTotal,
          balance,
          items: group.items.sort((a, b) => {
            // Sort items within group by created_at (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
        };
      })
      .sort((a, b) => {
        return new Date(b.workDate).getTime() - new Date(a.workDate).getTime();
      });
  }, [technicalSanctions, works]);

  if (technicalSanctions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No technical sanctions found. {isEditMode && 'Click "Add Technical Sanction" to create one.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {/* Expand Icon */}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TS Sub Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              AA
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Final Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groupedTechnicalSanctions.map((group) =>
            group.items.map((ts) => {
              // Balance is the same for all rows in the same work group
              const balanceColor = group.balance >= 0 ? 'text-green-600' : 'text-red-600';
              
              return (
                <React.Fragment key={ts.id}>
                  {/* Main Row */}
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => toggleRow(ts.id)}
                    onContextMenu={(e) => handleContextMenu(e, ts)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expandedRows.has(ts.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span className={ts.work_is_cancelled ? 'text-gray-500' : 'text-gray-900'}>
                          {ts.work_name}
                        </span>
                        {ts.work_is_cancelled && (
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                            title={ts.work_cancel_reason ? 
                              (ts.work_cancel_reason === 'SHIFTED_TO_OTHER_WORK' ? 'Work shifted to another work' : 'Work assigned to different department') + 
                              (ts.work_cancel_details ? `: ${ts.work_cancel_details}` : '') 
                              : 'Work cancelled'}
                          >
                            Work cancelled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ts.subName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(group.aa)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(ts.finalTotal)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${balanceColor}`}>
                      {formatCurrency(group.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={ts.noting}
                            disabled
                            className="w-4 h-4 text-green-600 border-gray-300 rounded cursor-not-allowed"
                          />
                          <span className="ml-1 text-gray-700">Noting</span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={ts.order}
                            disabled
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-not-allowed"
                          />
                          <span className="ml-1 text-gray-700">Order</span>
                        </div>
                      </div>
                    </td>
                  </tr>

                {/* Expanded Details Row */}
                {expandedRows.has(ts.id) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 bg-gray-50">
                      <div className="space-y-6">
                        {/* Action Buttons */}
                        {isEditMode && (
                          <div className="flex items-center justify-between border-b pb-4">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              Complete Technical Sanction Details
                            </h4>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(ts);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(ts.id);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}

                        {/* TS Sub Name (if exists) */}
                        {ts.subName && (
                          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                            <p className="text-sm text-gray-600">TS Sub Name</p>
                            <p className="text-lg font-semibold text-gray-900">{ts.subName}</p>
                          </div>
                        )}

                        {/* Basic Amounts */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Work Portion</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {formatCurrency(ts.workPortion)}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Royalty</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {formatCurrency(ts.Royalty || ts.royalty || 0)}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Testing</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {formatCurrency(ts.Testing || ts.testing || 0)}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Work Portion Total</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {formatCurrency(ts.workPortionTotal)}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Consultancy</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {formatCurrency(ts.Consultancy || ts.consultancy || 0)}
                            </p>
                          </div>
                        </div>

                        {/* GST Details */}
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                          <h5 className="font-semibold text-gray-900 mb-3">GST Details</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">GST Percentage</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {ts.gstPercentage || '18'}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">GST Amount</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(ts.gstAmount)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Contingency Details */}
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                          <h5 className="font-semibold text-gray-900 mb-3">Contingency Details</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Contingency Percentage</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {ts.contingencyPercentage || '4'}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Contingency Amount</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(ts.contingencyAmount)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Labour Insurance Details */}
                        <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                          <h5 className="font-semibold text-gray-900 mb-3">Labour Insurance Details</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Labour Insurance Percentage</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {ts.labourInsurancePercentage || '1'}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Labour Insurance Amount</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(ts.labourInsuranceAmount)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Noting Date</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatDate(ts.notingDate)}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Order Date</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatDate(ts.orderDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })
          )}
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
              label: 'View Tenders',
              onClick: () => handleViewTenders(contextMenu.ts),
            },
          ]}
        />
      )}
    </div>
  );
};

export default TechnicalSanctionsTable;
