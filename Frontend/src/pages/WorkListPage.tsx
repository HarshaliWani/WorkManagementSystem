import React from 'react';
import { ArrowLeft, FileText, Calendar, DollarSign } from 'lucide-react';
import { GR } from '../data/mockData';
import { WorkTable } from '../components/WorkTable';

interface WorkListPageProps {
  grs: GR[];
  selectedGR?: string | null;
  isEditMode: boolean;
  onBack: () => void;
}

export const WorkListPage: React.FC<WorkListPageProps> = ({ grs, selectedGR, isEditMode, onBack }) => {
  // Filter data based on selected GR
  const filteredGRs = selectedGR 
    ? grs.filter(gr => gr.grNumber === selectedGR)
    : grs;

  const totalWorks = filteredGRs.reduce((sum, gr) => sum + gr.works.length, 0);
  const totalAA = filteredGRs.reduce((sum, gr) => 
    sum + gr.works.reduce((workSum, work) => workSum + work.AA, 0), 0
  );
  const totalRA = filteredGRs.reduce((sum, gr) => 
    sum + gr.works.reduce((workSum, work) => workSum + work.RA, 0), 0
  );

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
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedGR ? `Works for ${selectedGR}` : 'Government Works List'}
            </h1>
            <p className="text-gray-600">
              {selectedGR 
                ? `Showing works for selected GR: ${selectedGR}`
                : 'Comprehensive view of all government works with expandable details'
              }
            </p>
          </div>
          
          {isEditMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 font-medium">
                Edit Mode Active
              </p>
              <p className="text-xs text-yellow-600">
                You can now add spills and modify work details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Works</p>
              <p className="text-2xl font-bold text-gray-900">{totalWorks}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total AA</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAA)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total RA</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRA)}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">How to use this page:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Expand" to view spills and nested sections for each work</li>
          <li>• In Edit Mode, use "Add Spill" to create new spills (only when RA + ARA &lt; AA)</li>
          <li>• Technical Sanctions, Tenders, and Bills are placeholders for future stages</li>
          <li>• Each spill shows detailed breakdown with expandable sections</li>
        </ul>
      </div>

      {/* Work Table */}
      <WorkTable grs={grs} selectedGR={selectedGR} isEditMode={isEditMode} />
    </div>
  );
};