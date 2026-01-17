import React from 'react';
import { FileText, Briefcase, ClipboardCheck, Gavel, Receipt, TrendingUp } from 'lucide-react';

interface OverallStatsCardsProps {
  total_grs: number;
  active_works: number;
  technical_sanctions: number;
  tenders: number;
  bills: number;
  completionPercentage: number;
}

export const OverallStatsCards: React.FC<OverallStatsCardsProps> = ({
  total_grs,
  active_works,
  technical_sanctions,
  tenders,
  bills,
  completionPercentage,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total GRs */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Total GRs</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{total_grs}</p>
          </div>
          <FileText className="w-12 h-12 text-blue-500" />
        </div>
      </div>

      {/* Active Works */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">Active Works</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{active_works}</p>
          </div>
          <Briefcase className="w-12 h-12 text-green-500" />
        </div>
      </div>

      {/* Technical Sanctions */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium">Technical Sanctions</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">{technical_sanctions}</p>
          </div>
          <ClipboardCheck className="w-12 h-12 text-purple-500" />
        </div>
      </div>

      {/* Tenders */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-600 font-medium">Tenders</p>
            <p className="text-3xl font-bold text-indigo-900 mt-2">{tenders}</p>
          </div>
          <Gavel className="w-12 h-12 text-indigo-500" />
        </div>
      </div>

      {/* Bills */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-600 font-medium">Bills</p>
            <p className="text-3xl font-bold text-orange-900 mt-2">{bills}</p>
          </div>
          <Receipt className="w-12 h-12 text-orange-500" />
        </div>
      </div>

      {/* Completion % */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-600 font-medium">Completion %</p>
            <p className="text-3xl font-bold text-emerald-900 mt-2">{completionPercentage}%</p>
          </div>
          <TrendingUp className="w-12 h-12 text-emerald-500" />
        </div>
      </div>
    </div>
  );
};

