import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { GR } from '../data/mockData';
import { GRFormModal } from './GRFormModal';

interface SidebarProps {
  grs: GR[];
  selectedGR: string | null;
  onGRSelect: (grNumber: string) => void;
  isEditMode?: boolean;
  onDataUpdate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  grs,
  selectedGR,
  onGRSelect,
  isEditMode = false,
  onDataUpdate
}) => {
  const [expandedGRs, setExpandedGRs] = useState<Set<string>>(new Set());
  const [showGRModal, setShowGRModal] = useState(false);
  const [editingGR, setEditingGR] = useState<GR | null>(null);
  const navigate = useNavigate();

  const toggleGRExpansion = (e: React.MouseEvent, grNumber: string) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedGRs);
    if (newExpanded.has(grNumber)) {
      newExpanded.delete(grNumber);
    } else {
      newExpanded.add(grNumber);
    }
    setExpandedGRs(newExpanded);
  };

  const handleGRClick = (grNumber: string) => {
    onGRSelect(grNumber);
  };

  const handleAddGR = () => {
    setEditingGR(null);
    setShowGRModal(true);
  };

  const handleEditGR = (e: React.MouseEvent, gr: GR) => {
    e.stopPropagation();
    setEditingGR(gr);
    setShowGRModal(true);
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

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Government Records
          </h1>

          {isEditMode && (
            <button
              onClick={handleAddGR}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New GR</span>
            </button>
          )}
        </div>

        {/* ✅ ADD: Navigation Menu */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Navigation
          </h2>
          <nav className="space-y-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">📊</span>
              Dashboard
            </button>
            <button
              onClick={() => navigate('/works')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">🏗️</span>
              Works
            </button>
            <button
              onClick={() => navigate('/technical-sanctions')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">📋</span>
              Technical Sanctions
            </button>
            <button
              onClick={() => navigate('/tenders')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">📄</span>
              Tenders
            </button>
            <button
              onClick={() => navigate('/bills')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">💰</span>
              Bills
            </button>
            <button
              onClick={() => navigate('/final-bills')}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">✅</span>
              Final Bills
            </button>
          </nav>
        </div>

        {/* GR List */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Government Resolutions
          </h2>
          <div className="space-y-2">
            {grs.map((gr) => {
              const isExpanded = expandedGRs.has(gr.grNumber);
              const isSelected = selectedGR === gr.grNumber;

              return (
                <div key={gr.id}>
                  {/* GR Header */}
                  <button
                    onClick={() => handleGRClick(gr.grNumber)}
                    className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${isSelected
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div
                            onClick={(e) => toggleGRExpansion(e, gr.grNumber)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <span className="font-semibold text-gray-900">{gr.grNumber}</span>
                        </div>
                        <div className="flex items-center mt-1 ml-7 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(gr.grDate).toLocaleDateString()}
                        </div>
                        <div className="mt-1 ml-7 text-xs text-gray-600">
                          {gr.works?.length || 0} work{(gr.works?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {isEditMode && (
                        <button
                          onClick={(e) => handleEditGR(e, gr)}
                          className="ml-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit GR"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </button>

                  {/* Expanded Works List */}
                  {isExpanded && gr.works && gr.works.length > 0 && (
                    <div className="ml-4 mt-2 space-y-1">
                      {gr.works.map((work, workIndex) => (
                        <div
                          key={workIndex}
                          className="p-2 bg-gray-50 rounded-md text-xs border border-gray-200"
                        >
                          <div className="font-medium text-gray-800">{work.workName}</div>
                          <div className="mt-1 flex items-center justify-between text-gray-600">
                            <span>AA: {formatCurrency(work.AA || 0)}</span>
                            <span>RA: {formatCurrency(work.RA || 0)}</span>
                          </div>
                          {work.spills && Array.isArray(work.spills) && work.spills.length > 0 && (
                            <div className="mt-1 text-gray-500">
                              {work.spills.length} spill{work.spills.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show message if no works */}
                  {isExpanded && (!gr.works || gr.works.length === 0) && (
                    <div className="ml-4 mt-2 p-2 text-xs text-gray-500 italic">
                      No works yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>


      <GRFormModal
        isOpen={showGRModal}
        onClose={() => {
          setShowGRModal(false);
          setEditingGR(null);
        }}
        onSuccess={() => {
          if (onDataUpdate) {
            onDataUpdate();
          }
        }}
        editingGR={editingGR}
      />
    </>
  );
};
