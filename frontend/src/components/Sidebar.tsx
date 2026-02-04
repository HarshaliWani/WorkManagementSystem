import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { GR } from '../data/mockData';
import { useNavigationContext } from '../contexts/NavigationContext';

interface SidebarProps {
  grs: GR[];
  selectedGR: string | null;
  onGRSelect: (grNumber: string) => void;
  isEditMode?: boolean;
  onDataUpdate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const [showGRModal, setShowGRModal] = useState(false);
  const [editingGR, setEditingGR] = useState<GR | null>(null);
  const navigate = useNavigate();
  const { updateFilters, setNavigationPath } = useNavigationContext();


  

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        

        {/* ✅ ADD: Navigation Menu */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Navigation
          </h2>
          <nav className="space-y-1">
            <button
              onClick={() => {
                // Clear all filters by setting them to null
                updateFilters({ gr_id: null, work_id: null, technical_sanction_id: null, tender_id: null });
                setNavigationPath([{ name: 'Dashboard', id: null }]);
                navigate('/dashboard');
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">📊</span>
              Dashboard
            </button>
            <button
              onClick={() => {
                // Clear all filters by setting them to null
                updateFilters({ gr_id: null, work_id: null, technical_sanction_id: null, tender_id: null });
                setNavigationPath([{ name: 'Dashboard', id: null }, { name: 'Works', id: null }]);
                navigate('/works');
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">🏗️</span>
              Works
            </button>
            <button
              onClick={() => {
                // Clear all filters by setting them to null
                updateFilters({ gr_id: null, work_id: null, technical_sanction_id: null, tender_id: null });
                setNavigationPath([{ name: 'Dashboard', id: null }, { name: 'Technical Sanctions', id: null }]);
                navigate('/technical-sanctions');
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">📋</span>
              Technical Sanctions
            </button>
            <button
              onClick={() => {
                // Clear all filters by setting them to null
                updateFilters({ gr_id: null, work_id: null, technical_sanction_id: null, tender_id: null });
                setNavigationPath([{ name: 'Dashboard', id: null }, { name: 'Tenders', id: null }]);
                navigate('/tenders');
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">📄</span>
              Tenders
            </button>
            <button
              onClick={() => {
                // Clear all filters by setting them to null
                updateFilters({ gr_id: null, work_id: null, technical_sanction_id: null, tender_id: null });
                setNavigationPath([{ name: 'Dashboard', id: null }, { name: 'Bills', id: null }]);
                navigate('/bills');
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">💰</span>
              Bills
            </button>
            <button
              onClick={() => {
                // Clear all filters by setting them to null
                updateFilters({ gr_id: null, work_id: null, technical_sanction_id: null, tender_id: null });
                setNavigationPath([{ name: 'Dashboard', id: null }, { name: 'Status', id: null }]);
                navigate('/status');
              }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center text-sm text-gray-700"
            >
              <span className="mr-2">📈</span>
              Status
            </button>
          </nav>
        </div>
      </div>


      
    </>
  );
};
