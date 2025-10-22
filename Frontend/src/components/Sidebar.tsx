import React, { useState } from 'react';
import { Calendar, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { GR } from '../data/mockData';

interface SidebarProps {
  grs: GR[];
  selectedGR: string | null;
  onGRSelect: (grNumber: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ grs, selectedGR, onGRSelect }) => {
  const [expandedGRs, setExpandedGRs] = useState<Set<string>>(new Set());

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
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Government Records
        </h2>
      </div>
      
      <div className="p-2">
        {grs.map((gr) => {
          const isExpanded = expandedGRs.has(gr.grNumber);
          const isSelected = selectedGR === gr.grNumber;
          
          return (
            <div key={gr.grNumber} className="mb-2">
              {/* GR Header */}
              <button
                onClick={() => handleGRClick(gr.grNumber)}
                className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <button
                        onClick={(e) => toggleGRExpansion(e, gr.grNumber)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      <p className={`text-sm font-medium truncate ml-1 ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {gr.grNumber}
                      </p>
                    </div>
                    <div className="flex items-center mt-1 ml-6">
                      <Calendar className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                      <p className="text-xs text-gray-500">
                        {new Date(gr.grDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-6">
                      {gr.works.length} work{gr.works.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>

              {/* Expanded Works List */}
              {isExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {gr.works.map((work, workIndex) => (
                    <div
                      key={workIndex}
                      className="p-2 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {work.workName}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          AA: {formatCurrency(work.AA)}
                        </span>
                        <span className="text-xs text-gray-500">
                          RA: {formatCurrency(work.RA)}
                        </span>
                      </div>
                      {work.spills.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          {work.spills.length} spill{work.spills.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};