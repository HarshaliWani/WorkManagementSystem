// src/components/TechnicalSanctionsTable.tsx - Updated with Edit/Delete in expanded view
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { TechnicalSanction } from '../services/technicalSanctionService';

interface Props {
  technicalSanctions: TechnicalSanction[];
  onEdit: (ts: TechnicalSanction) => void;
  onDelete: (id: number) => void;
}

const TechnicalSanctionsTable: React.FC<Props> = ({ technicalSanctions, onEdit, onDelete }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN');
  };

  if (technicalSanctions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No technical sanctions found. Click "Add Technical Sanction" to create one.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Portion
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grand Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Final Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {technicalSanctions.map((ts) => (
            <React.Fragment key={ts.id}>
              {/* Main Row */}
              <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(ts.id)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {expandedRows.has(ts.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ts.work_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(ts.workPortionTotal)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(ts.grandTotal)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatCurrency(ts.finalTotal)}
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
                  <td colSpan={6} className="px-6 py-6 bg-gray-50">
                    <div className="space-y-6">
                      {/* Action Buttons */}
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
                            {formatCurrency(ts.Royalty || 0)}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase">Testing</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {formatCurrency(ts.Testing || 0)}
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
                            {formatCurrency(ts.Consultancy || 0)}
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
                              {ts.gstPercentage}%
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
                              {ts.contingencyPercentage}%
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
                              {ts.labourInsurancePercentage}%
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TechnicalSanctionsTable;
