import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { Calendar, ChevronDown, ChevronRight, FileText, Plus, Edit, Eye, Search, X, Filter } from 'lucide-react';
import { GRFormModal } from './GRFormModal';
import { ContextMenu } from './ContextMenu';
import { useNavigationContext } from '../contexts/NavigationContext';
import { getMediaUrl } from '../utils/apiUrl';

interface Work {
  id: number;
  workName: string;
  AA: number;
  RA: number;
  spills?: any[];
}

interface GR {
  id: number;
  grNumber: string;
  grDate: string;
  document?: string;
  works?: Work[];
}

interface GRTableProps {
  grs: GR[];
  isEditMode: boolean;
  onDataUpdate: () => void;
}

export const GRTable: React.FC<GRTableProps> = ({ grs, isEditMode, onDataUpdate }) => {
  const navigate = useNavigate();
  const { setNavigationPath, updateFilters } = useNavigationContext();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showGRModal, setShowGRModal] = useState(false);
  const [editingGR, setEditingGR] = useState<GR | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; grId: number } | null>(null);

  
  // ✅ NEW: Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasDocument, setHasDocument] = useState<'all' | 'yes' | 'no'>('all');

  // ✅ NEW: Filtered GRs using useMemo for performance
  const filteredGRs = useMemo(() => {
    return grs.filter((gr) => {
      // Search by GR Number
      if (searchTerm && !gr.grNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by date range
      if (startDate && new Date(gr.grDate) < new Date(startDate)) {
        return false;
      }
      if (endDate && new Date(gr.grDate) > new Date(endDate)) {
        return false;
      }

      // Filter by document status
      if (hasDocument === 'yes' && !gr.document) {
        return false;
      }
      if (hasDocument === 'no' && gr.document) {
        return false;
      }

      return true;
    });
  }, [grs, searchTerm, startDate, endDate, hasDocument]);

  // ✅ NEW: Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setHasDocument('all');
  };

  const hasActiveFilters = searchTerm || startDate || endDate || hasDocument !== 'all';

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Handle right-click on GR row
  const handleContextMenu = (e: React.MouseEvent, grId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, grId });
  };

  // Handle "View Works" navigation
  const handleViewWorks = (grId: number) => {
    // Use flushSync to prevent race conditions
    flushSync(() => {
      updateFilters({ 
        gr_id: grId, 
        work_id: null, 
        technical_sanction_id: null, 
        tender_id: null 
      });
    });
    // Navigate with query parameter - NavigationUrlSync will sync path and filters from URL
    // ContextMenu component will handle closing the menu after onClick completes
    navigate(`/works?gr=${grId}`);
  };

  const handleAddGR = () => {
    setEditingGR(null);
    setShowGRModal(true);
  };

  const handleEditGR = (gr: GR) => {
    setEditingGR(gr);
    setShowGRModal(true);
  };

  const handleViewDocument = (documentUrl: string) => {
    if (!documentUrl) return;
    
    const url = getMediaUrl(documentUrl);
    if (url) {
      window.open(url, '_blank');
    }
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (grs.length === 0) {
    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Government Records</h2>
            </div>
            {isEditMode && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddGR();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New GR</span>
              </button>
            )}
          </div>
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No government records found. Click "Add New GR" to create one.</p>
          </div>
        </div>

        {/* Render GRFormModal conditionally */}
        {showGRModal && (
          <GRFormModal
            isOpen={showGRModal}
          onClose={() => {
            setShowGRModal(false);
            setEditingGR(null);
          }}
          onSuccess={() => {
            onDataUpdate();
            setShowGRModal(false);
            setEditingGR(null);
          }}
            editingGR={editingGR}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Government Records</h2>
            <span className="text-sm text-gray-500">
              ({filteredGRs.length}{hasActiveFilters && ` of ${grs.length}`})
            </span>
          </div>
          {isEditMode && (
            <button
              onClick={handleAddGR}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New GR</span>
            </button>
          )}
        </div>

        {/* ✅ NEW: Filter Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search by GR Number */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search GR Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Start Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Document Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={hasDocument}
                onChange={(e) => setHasDocument(e.target.value as 'all' | 'yes' | 'no')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                <option value="all">All Documents</option>
                <option value="yes">Has Document</option>
                <option value="no">No Document</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  GR Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Works Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Document
                </th>
                {isEditMode && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGRs.length === 0 ? (
                <tr>
                  <td colSpan={isEditMode ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                    <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No GRs match your filters
                  </td>
                </tr>
              ) : (
                filteredGRs.map((gr) => {
                  const isExpanded = expandedRows.has(gr.id);
                  
                  return (
                    <React.Fragment key={gr.id}>
                      {/* Main Row */}
                      <tr 
                        className="hover:bg-gray-50 transition-colors"
                        onContextMenu={(e) => handleContextMenu(e, gr.id)}
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRowExpansion(gr.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{gr.grNumber}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(gr.grDate)}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {gr.works?.length || 0} work{(gr.works?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          {gr.document ? (
                            <button
                              onClick={() => handleViewDocument(gr.document!)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">View</span>
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">No document</span>
                          )}
                        </td>

                        {isEditMode && (
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleEditGR(gr)}
                              className="inline-flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          </td>
                        )}
                      </tr>

                      {/* Expanded Works Details */}
                      {isExpanded && gr.works && gr.works.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={isEditMode ? 6 : 5} className="px-4 py-4">
                            <div className="ml-8">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Works under this GR:</h4>
                              <div className="space-y-2">
                                {gr.works.map((work) => (
                                  <div
                                    key={work.id}
                                    className="bg-white p-3 rounded border border-gray-200"
                                  >
                                    <div className="font-medium text-sm text-gray-900 mb-2">
                                      {work.workName}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                                      <div>
                                        <span className="font-medium">AA:</span> {formatCurrency(work.AA || 0)}
                                      </div>
                                      <div>
                                        <span className="font-medium">RA:</span> {formatCurrency(work.RA || 0)}
                                      </div>
                                      <div>
                                        {work.spills && work.spills.length > 0 && (
                                          <span className="text-blue-600">
                                            {work.spills.length} spill{work.spills.length !== 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {isExpanded && (!gr.works || gr.works.length === 0) && (
                        <tr className="bg-gray-50">
                          <td colSpan={isEditMode ? 6 : 5} className="px-4 py-4">
                            <div className="ml-8 text-sm text-gray-500 italic">
                              No works under this GR yet
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
        </div>
      </div>

      {/* Render GRFormModal conditionally like WorkFormModal */}
      {showGRModal && (
        <GRFormModal
          isOpen={showGRModal}
          onClose={() => {
            setShowGRModal(false);
            setEditingGR(null);
          }}
          onSuccess={() => {
            onDataUpdate();
            setShowGRModal(false);
            setEditingGR(null);
          }}
          editingGR={editingGR}
        />
        )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: 'View Works',
              onClick: () => handleViewWorks(contextMenu.grId),
            },
          ]}
        />
      )}
    </>
  );
};
