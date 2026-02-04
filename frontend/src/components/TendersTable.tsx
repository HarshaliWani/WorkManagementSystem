// src/components/TendersTable.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { Edit2, Trash2, FileText, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { Tender } from '../pages/TendersPage';
import { Work } from '../types/work';
import { ContextMenu } from './ContextMenu';
import { useNavigationContext } from '../contexts/NavigationContext';
import { getMediaUrl } from '../utils/apiUrl';

interface TendersTableProps {
  tenders: Tender[];
  onEdit: (tender: Tender) => void;
  onDelete: (id: number) => void;
  isEditMode?: boolean;
  works?: Work[]; // Added to get GR ID from work
}

interface GroupedTender {
  workName: string;
  tsSubName: string;
  workDate: string | null;
  tenders: Tender[];
}

const TendersTable: React.FC<TendersTableProps> = ({ tenders, onEdit, onDelete, isEditMode = false, works = [] }) => {
  const navigate = useNavigate();
  const { setNavigationPath, updateFilters } = useNavigationContext();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tender: Tender } | null>(null);

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Handle right-click on Tender row
  const handleContextMenu = (e: React.MouseEvent, tender: Tender) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, tender });
  };

  // Handle "View Bills" navigation
  const handleViewBills = (tender: Tender) => {
    const workId = tender.workId;
    const tenderId = tender.id;
    const tsId = tender.technicalSanctionId; // Include technical_sanction ID
    // Find the work to get GR ID
    const work = works.find(w => w.id === workId);
    const grId = work?.gr;
    
    if (!grId) {
      console.error('GR ID not found for work:', workId);
      return;
    }
    
    // Use flushSync to prevent race conditions
    flushSync(() => {
      updateFilters({ 
        gr_id: grId, 
        work_id: workId, 
        technical_sanction_id: tsId, 
        tender_id: tenderId 
      });
    });
    // Navigate with ALL ancestor query parameters - NavigationUrlSync will sync path and filters from URL
    // ContextMenu component will handle closing the menu after onClick completes
    navigate(`/bills?gr=${grId}&work=${workId}&technical_sanction=${tsId}&tender=${tenderId}`);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getDocumentUrl = (url: string | null) => {
    if (!url) return null;
    return getMediaUrl(url);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Awarded': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Open': 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Group and sort tenders - flatten into a single list but keep them grouped together
  const sortedTenders = useMemo(() => {
    const groups = new Map<string, GroupedTender>();
    
    // Group tenders by work name and TS sub name
    tenders.forEach((tender) => {
      const workName = tender.workName || 'Unknown Work';
      const tsSubName = tender.technicalSanctionSubName || 'No TS Sub Name';
      const groupKey = `${workName}|||${tsSubName}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          workName,
          tsSubName,
          workDate: tender.workDate || null,
          tenders: [],
        });
      }
      
      groups.get(groupKey)!.tenders.push(tender);
    });
    
    // Sort groups by work date (most recent first)
    const sortedGroups = Array.from(groups.values()).sort((a, b) => {
      if (!a.workDate && !b.workDate) return 0;
      if (!a.workDate) return 1;
      if (!b.workDate) return -1;
      return new Date(b.workDate).getTime() - new Date(a.workDate).getTime();
    });
    
    // Flatten groups into a single array, keeping tenders grouped together
    const flattened: Tender[] = [];
    sortedGroups.forEach((group) => {
      flattened.push(...group.tenders);
    });
    
    return flattened;
  }, [tenders]);

  if (tenders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No tenders found. Add your first tender to get started.</p>
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
              Tender ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TS Sub Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agency Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              LOA
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedTenders.map((tender) => (
                  <React.Fragment key={tender.id}>
                    {/* Main Row */}
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer" 
                      onClick={() => toggleRow(tender.id)}
                      onContextMenu={(e) => handleContextMenu(e, tender)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {expandedRows.has(tender.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tender.tenderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span className={tender.work_is_cancelled ? 'text-gray-500' : 'text-gray-900'}>
                            {tender.workName || '-'}
                          </span>
                          {tender.work_is_cancelled && (
                            <span 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                              title={tender.work_cancel_reason ? 
                                (tender.work_cancel_reason === 'SHIFTED_TO_OTHER_WORK' ? 'Work shifted to another work' : 'Work assigned to different department') + 
                                (tender.work_cancel_details ? `: ${tender.work_cancel_details}` : '') 
                                : 'Work cancelled'}
                            >
                              Work cancelled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tender.technicalSanctionSubName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tender.tenderName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tender.loa ? (
                          <div>
                            <span className="text-green-600">✓</span>
                            <div className="text-xs">{formatDate(tender.loaDate)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tender.workOrderUploaded ? (
                          <span className="text-green-600">✓ Done</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tender.workOrderUrl ? (
                          <a
                            href={getDocumentUrl(tender.workOrderUrl) || '#'}
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
                    {expandedRows.has(tender.id) && (
                      <tr>
                        <td colSpan={8} className="px-6 py-6 bg-gray-50">
                    <div className="space-y-6">
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between border-b pb-4">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          Complete Tender Details
                        </h4>
                        {isEditMode && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(tender);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(tender.id);
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
                          <p className="text-xs text-gray-500 uppercase mb-1">Tender ID</p>
                          <p className="text-lg font-semibold text-gray-900">{tender.tenderNumber}</p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Agency Name</p>
                          <p className="text-lg font-semibold text-gray-900">{tender.tenderName}</p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Opening Date</p>
                          <p className="text-lg font-semibold text-gray-900">{formatDate(tender.openingDate)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(tender.status)}`}>
                            {tender.status}
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">Work Name</p>
                          <p className="text-lg font-semibold text-gray-900">{tender.workName || '-'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase mb-1">TS Sub Name</p>
                          <p className="text-lg font-semibold text-gray-900">{tender.technicalSanctionSubName || '-'}</p>
                        </div>
                      </div>

                      {/* Tender Stages */}
                      <div className="space-y-4">
                        <h5 className="font-semibold text-gray-900 text-md">Tender Stages</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Online/Offline */}
                          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700">Online/Offline</p>
                              <div className="flex gap-4">
                                {tender.Online && (
                                  <span className="text-green-600 text-sm">✓ Online</span>
                                )}
                                {tender.Offline && (
                                  <span className="text-green-600 text-sm">✓ Offline</span>
                                )}
                                {!tender.Online && !tender.Offline && (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </div>
                            </div>
                            {tender.Online && tender.onlineDate && (
                              <p className="text-xs text-gray-600">Online Date: {formatDate(tender.onlineDate)}</p>
                            )}
                            {tender.Offline && tender.offlineDate && (
                              <p className="text-xs text-gray-600">Offline Date: {formatDate(tender.offlineDate)}</p>
                            )}
                          </div>

                          {/* Technical Verification */}
                          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700">Technical Verification</p>
                              {tender.technicalVerification ? (
                                <span className="text-green-600 text-sm">✓ Done</span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </div>
                            {tender.technicalVerificationDate && (
                              <p className="text-xs text-gray-600">Date: {formatDate(tender.technicalVerificationDate)}</p>
                            )}
                          </div>

                          {/* Financial Verification */}
                          <div className="bg-green-50 p-4 rounded-md border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700">Financial Verification</p>
                              {tender.financialVerification ? (
                                <span className="text-green-600 text-sm">✓ Done</span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </div>
                            {tender.financialVerificationDate && (
                              <p className="text-xs text-gray-600">Date: {formatDate(tender.financialVerificationDate)}</p>
                            )}
                          </div>

                          {/* LOA */}
                          <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700">LOA (Letter of Acceptance)</p>
                              {tender.loa ? (
                                <span className="text-green-600 text-sm">✓ Done</span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </div>
                            {tender.loaDate && (
                              <p className="text-xs text-gray-600">Date: {formatDate(tender.loaDate)}</p>
                            )}
                          </div>

                          {/* Work Order Tick */}
                          {tender.workOrderTick !== undefined && (
                            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-700">Work Order Tick</p>
                                {tender.workOrderTick ? (
                                  <span className="text-green-600 text-sm">✓ Done</span>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </div>
                              {tender.workOrderTickDate && (
                                <p className="text-xs text-gray-600">Date: {formatDate(tender.workOrderTickDate)}</p>
                              )}
                            </div>
                          )}

                          {/* EMD Supporting */}
                          {tender.emdSupporting !== undefined && (
                            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-700">EMD Supporting</p>
                                {tender.emdSupporting ? (
                                  <span className="text-green-600 text-sm">✓ Done</span>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </div>
                              {tender.supportingDate && (
                                <p className="text-xs text-gray-600">Date: {formatDate(tender.supportingDate)}</p>
                              )}
                            </div>
                          )}

                          {/* EMD Awarded */}
                          {tender.emdAwarded !== undefined && (
                            <div className="bg-pink-50 p-4 rounded-md border border-pink-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-700">EMD Awarded</p>
                                {tender.emdAwarded ? (
                                  <span className="text-green-600 text-sm">✓ Done</span>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </div>
                              {tender.awardedDate && (
                                <p className="text-xs text-gray-600">Date: {formatDate(tender.awardedDate)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Work Order Document */}
                      {tender.workOrderUrl && (
                        <div className="bg-white p-4 rounded-md border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Work Order Document</p>
                          <a
                            href={getDocumentUrl(tender.workOrderUrl) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                          >
                            <FileText className="w-5 h-5" />
                            <span>View Work Order PDF</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: 'View Bills',
              onClick: () => handleViewBills(contextMenu.tender),
            },
          ]}
        />
      )}
    </div>
  );
};

export default TendersTable;
