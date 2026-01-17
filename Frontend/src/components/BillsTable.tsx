// src/components/BillsTable.tsx
import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Receipt, ChevronDown, ChevronRight, ExternalLink, FileText } from 'lucide-react';
import { Bill } from '../pages/BillsPage';
import { getMediaUrl } from '../utils/apiUrl';

interface BillsTableProps {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: number) => void;
  isEditMode?: boolean;
}

interface GroupedBill {
  workName: string;
  workDate: string | null;
  bills: Bill[];
}

const BillsTable: React.FC<BillsTableProps> = ({ bills, onEdit, onDelete, isEditMode = false }) => {
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getDocumentUrl = (url: string | null | undefined) => {
    if (!url) return null;
    return getMediaUrl(url);
  };

  // Group and sort bills by work name, sorted by work date (most recent first)
  const sortedBills = useMemo(() => {
    const groups = new Map<string, GroupedBill>();
    
    // Group bills by work name
    bills.forEach((bill) => {
      const workName = bill.workName || 'Unknown Work';
      const groupKey = workName;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          workName,
          workDate: bill.workDate || null,
          bills: [],
        });
      }
      
      groups.get(groupKey)!.bills.push(bill);
    });
    
    // Sort groups by work date (most recent first)
    const sortedGroups = Array.from(groups.values()).sort((a, b) => {
      if (!a.workDate && !b.workDate) return 0;
      if (!a.workDate) return 1;
      if (!b.workDate) return -1;
      return new Date(b.workDate).getTime() - new Date(a.workDate).getTime();
    });
    
    // Flatten groups into a single array, keeping bills grouped together
    const flattened: Bill[] = [];
    sortedGroups.forEach((group) => {
      // Sort bills within group by created_at (newest first)
      const sortedBillsInGroup = [...group.bills].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      flattened.push(...sortedBillsInGroup);
    });
    
    return flattened;
  }, [bills]);

  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No bills found. Add your first bill to get started.</p>
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
              Bill Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tender ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agency Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bill Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedBills.map((bill) => (
            <React.Fragment key={bill.id}>
              {/* Main Row */}
              <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(bill.id)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {expandedRows.has(bill.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bill.billNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <span className={bill.work_is_cancelled ? 'text-gray-500' : 'text-gray-900'}>
                      {bill.workName || '-'}
                    </span>
                    {bill.work_is_cancelled && (
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                        title={bill.work_cancel_reason ? 
                          (bill.work_cancel_reason === 'SHIFTED_TO_OTHER_WORK' ? 'Work shifted to another work' : 'Work assigned to different department') + 
                          (bill.work_cancel_details ? `: ${bill.work_cancel_details}` : '') 
                          : 'Work cancelled'}
                      >
                        Work cancelled
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bill.tenderNumber || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bill.agencyName || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatCurrency(bill.billTotal || bill.netAmount || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bill.documentUrl ? (
                    <a
                      href={getDocumentUrl(bill.documentUrl) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View PDF
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>

              {/* Expanded Details Row */}
              {expandedRows.has(bill.id) && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 bg-gray-50">
                    <div className="space-y-6">
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between border-b pb-4">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          Complete Bill Details
                        </h4>
                        {isEditMode && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(bill);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(bill.id);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Bill Number</p>
                          <p className="text-lg font-semibold text-gray-900">{bill.billNumber}</p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Bill Date</p>
                          <p className="text-lg font-semibold text-gray-900">{formatDate(bill.billDate)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Work Name</p>
                          <p className="text-lg font-semibold text-gray-900">{bill.workName || '-'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Tender ID</p>
                          <p className="text-lg font-semibold text-gray-900">{bill.tenderNumber || '-'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Agency Name</p>
                          <p className="text-lg font-semibold text-gray-900">{bill.agencyName || '-'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Payment Done From GR</p>
                          <p className="text-lg font-semibold text-gray-900">{bill.paymentDoneFromGrNumber || '-'}</p>
                        </div>
                      </div>

                      {/* Bill Calculations - Bill Total Components */}
                      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <h5 className="font-semibold text-gray-900 mb-3">Bill Total Components</h5>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Work Portion</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {formatCurrency(bill.workPortion)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Royalty & Testing</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {formatCurrency(bill.RoyaltyAndTesting)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">
                              GST ({bill.gstPercentage || 18}%)
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {formatCurrency(bill.gstAmount)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Reimbursement of Insurance</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {formatCurrency(bill.ReimbursementOfInsurance)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-300">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-gray-700">Bill Total</p>
                            <p className="text-xl font-bold text-gray-900">
                              {formatCurrency(bill.billTotal)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="bg-red-50 p-4 rounded-md border border-red-200">
                        <h5 className="font-semibold text-gray-900 mb-3">Deductions</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">
                              TDS ({bill.tdsPercentage || 0}%)
                            </p>
                            <p className="text-lg font-semibold text-red-600 mt-1">
                              -{formatCurrency(bill.tdsAmount)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">
                              GST on Work Portion ({bill.gstOnWorkPortionPercentage || 0}%)
                            </p>
                            <p className="text-lg font-semibold text-red-600 mt-1">
                              -{formatCurrency(bill.gstOnWorkPortion)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Security Deposit</p>
                            <p className="text-lg font-semibold text-red-600 mt-1">
                              -{formatCurrency(bill.SecurityDeposit)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">
                              LWC ({bill.lwcPercentage || 0}%)
                            </p>
                            <p className="text-lg font-semibold text-red-600 mt-1">
                              -{formatCurrency(bill.lwcAmount)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Insurance</p>
                            <p className="text-lg font-semibold text-red-600 mt-1">
                              -{formatCurrency(bill.Insurance)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Royalty</p>
                            <p className="text-lg font-semibold text-red-600 mt-1">
                              -{formatCurrency(bill.Royalty)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Net Amount */}
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-semibold text-gray-700">Net Amount</p>
                          <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(bill.netAmount)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Net Amount = Bill Total - TDS - GST on Work Portion - Security Deposit - LWC - Insurance - Royalty
                        </p>
                      </div>

                      {/* Document */}
                      {bill.documentUrl && (
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Bill Document</span>
                            </div>
                            <a
                              href={getDocumentUrl(bill.documentUrl) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View PDF
                            </a>
                          </div>
                        </div>
                      )}
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

export default BillsTable;
