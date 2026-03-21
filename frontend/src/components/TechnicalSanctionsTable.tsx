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
      <table className="min-w-full divide-y divide-gray-200 fixed-table">
        <thead className="bg-gray-50">
          <tr>
            <th className="col-xs px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {/* Expand Icon */}
            </th>
            <th className="col-expand px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Name
            </th>
            <th className="col-lg px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TS Sub Name
            </th>
            <th className="col-md px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              AA
            </th>
            <th className="col-md px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Final Total
            </th>
            <th className="col-md px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            <th className="col-sm px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="col-xs px-6 py-4 whitespace-nowrap">
                      {expandedRows.has(ts.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                    <td className="col-expand px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                    <td className="col-lg px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ts.subName || '-'}
                    </td>
                    <td className="col-md px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(group.aa)}
                    </td>
                    <td className="col-md px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(ts.finalTotal)}
                    </td>
                    <td className={`col-md px-6 py-4 whitespace-nowrap text-sm font-semibold ${balanceColor}`}>
                      {formatCurrency(group.balance)}
                    </td>
                    <td className="col-sm px-6 py-4 whitespace-nowrap text-sm">
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

                {/* Expanded Details Row - Recapitulation Sheet Style */}
                {expandedRows.has(ts.id) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 bg-gray-50">
                      <div className="max-w-3xl">
                        {/* Action Buttons */}
                        {isEditMode && (
                          <div className="flex items-center justify-between mb-6 pb-4 border-b">
                            
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
                          <div className="mb-6 pb-4 border-b">
                            <p className="text-sm font-semibold text-gray-600">Sub Name</p>
                            <p className="text-base text-gray-900 mt-1">{ts.subName}</p>
                          </div>
                        )}

                        {/* Recapitulation Sheet Layout */}
                        <div className="space-y-0 border border-gray-300 rounded-lg overflow-hidden">
                          {/* Row 1: Work Portion */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                            <span className="text-sm text-gray-700">Work Portion</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(ts.workPortion)}</span>
                          </div>

                          {/* Row 2: Royalty */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                            <span className="text-sm text-gray-700">Royalty Charges</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(ts.Royalty || ts.royalty || 0)}</span>
                          </div>

                          {/* Row 3: Testing */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                            <span className="text-sm text-gray-700">Quality Control Testing Charges</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(ts.Testing || ts.testing || 0)}</span>
                          </div>

                          {/* Subtotal 1: Work Portion Total */}
                          <div className="flex justify-between items-center px-4 py-3 bg-gray-200 border-b border-gray-300">
                            <span className="text-sm font-bold text-gray-900">TOTAL</span>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(ts.workPortionTotal)}</span>
                          </div>

                          {/* Row 4: GST */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                            <span className="text-sm text-gray-700">Add {typeof ts.gstPercentage === 'string' ? ts.gstPercentage : (ts.gstPercentage || '18')}% for G.S.T.</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(ts.gstAmount)}</span>
                          </div>

                          {/* Subtotal 2: Grand Total */}
                          <div className="flex justify-between items-center px-4 py-3 bg-gray-200 border-b border-gray-300">
                            <span className="text-sm font-bold text-gray-900">TOTAL</span>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(ts.grandTotal)}</span>
                          </div>

                          {/* Row 5: Labour Insurance */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                            <span className="text-sm text-gray-700">Add {typeof ts.labourInsurancePercentage === 'string' ? ts.labourInsurancePercentage : (ts.labourInsurancePercentage || '1')}% for Labour Insurance</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(ts.labourInsuranceAmount)}</span>
                          </div>

                          {/* Subtotal 3: After Labour Insurance */}
                          <div className="flex justify-between items-center px-4 py-3 bg-gray-200 border-b border-gray-300">
                            <span className="text-sm font-bold text-gray-900">TOTAL</span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(
                                (typeof ts.grandTotal === 'string' ? parseFloat(ts.grandTotal) : ts.grandTotal || 0) +
                                (typeof ts.labourInsuranceAmount === 'string' ? parseFloat(ts.labourInsuranceAmount) : ts.labourInsuranceAmount || 0)
                              )}
                            </span>
                          </div>

                          {/* Row 6: Contingency */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-green-50">
                            <span className="text-sm text-gray-700">Add {typeof ts.contingencyPercentage === 'string' ? ts.contingencyPercentage : (ts.contingencyPercentage || '4')}% for Contingency</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(ts.contingencyAmount)}</span>
                          </div>

                          {/* Row 7: Consultancy */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-green-50">
                            <span className="text-sm text-gray-700">Add Consultancy Charges</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(ts.Consultancy || ts.consultancy || 0)}</span>
                          </div>

                          {/* Subtotal 4: Before Say */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                            <span className="text-sm font-bold text-gray-900">TOTAL</span>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(ts.finalTotal)}</span>
                          </div>

                          {/* Final: Say (Final Total) */}
                          <div className="flex justify-between items-center px-4 py-3 bg-gray-200">
                            <span className="text-sm font-bold text-gray-900">Say</span>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(ts.finalTotal)}</span>
                          </div>
                        </div>

                        {/* Dates Section */}
                        <div className="mt-6 pt-4 border-t">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Noting Date</p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatDate(ts.notingDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Order Date</p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatDate(ts.orderDate)}
                              </p>
                            </div>
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
