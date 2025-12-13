// WorkListPage.tsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Filter, Plus } from 'lucide-react';
import WorkTable from '../components/WorkTable';
import WorkFormModal from '../components/WorkFormModal';
import { workService } from '../services/workService';
import { grService } from '../services/grService';
import type { Work, GR } from '../types/work';
import { spillService } from '../services/spillService';

interface WorkListPageProps {
  isEditMode?: boolean;  // ✅ Receive from App.tsx
}

const WorkListPage: React.FC<WorkListPageProps> = ({ isEditMode = false }) => {
  const [works, setWorks] = useState<Work[]>([]);
  const [grs, setGrs] = useState<GR[]>([]);
  const [selectedGR, setSelectedGR] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [showWorkModal, setShowWorkModal] = useState(false);  // ✅ NEW

  useEffect(() => {
    fetchGRs();
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [selectedGR]);

  const fetchGRs = async () => {
    try {
      const data = await grService.fetchAllGRs();
      setGrs(data);
    } catch (err) {
      console.error('Error fetching GRs:', err);
    }
  };

  const fetchWorks = async () => {
    try {
      setLoading(true);
      setError(null);

      let apiData;
      if (selectedGR) {
        apiData = await grService.fetchWorksByGR(selectedGR.toString());
      } else {
        apiData = await workService.fetchAllWorks();
      }

      setWorks(apiData);
    } catch (err: any) {
      console.error('Error fetching works:', err);
      setError('Failed to load works');
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = () => {
    fetchWorks();
  };

  const handleEditWork = (work: Work) => {
    setEditingWork(work);
    setShowWorkModal(true);
  };

  const handleDeleteWork = async (workId: number) => {
    if (!window.confirm('Are you sure you want to delete this work? This will also delete all associated spills, tenders, bills, etc.')) {
      return;
    }

    try {
      setLoading(true);
      await workService.deleteWork(workId);
      await fetchWorks(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting work:', err);
      setError(err.response?.data?.message || 'Failed to delete work');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpill = async (spillId: number) => {
    if (!window.confirm('Are you sure you want to delete this spill?')) {
      return;
    }

    try {
      await spillService.deleteSpill(spillId.toString());
      await fetchWorks(); // Refresh to update spill totals
    } catch (err: any) {
      console.error('Error deleting spill:', err);
      setError(err.response?.data?.message || 'Failed to delete spill');
    }
  };

  const formatCurrency = (amount: number | string | null | undefined): string => {
    const numAmount = Number(amount) || 0;

    if (isNaN(numAmount)) {
      return '₹0.00';
    }

    if (numAmount >= 10000000) {
      return `₹${(numAmount / 10000000).toFixed(2)}Cr`;
    } else if (numAmount >= 100000) {
      return `₹${(numAmount / 100000).toFixed(2)}L`;
    } else if (numAmount >= 1000) {
      return `₹${(numAmount / 1000).toFixed(2)}K`;
    } else {
      return `₹${numAmount.toFixed(2)}`;
    }
  };

  const totalWorks = works.length;
  const totalAA = works.reduce((sum, work) => {
    const aa = Number(work.AA);
    return sum + (isNaN(aa) ? 0 : aa);
  }, 0);
  const totalRA = works.reduce((sum, work) => {
    const ra = Number(work.RA);
    return sum + (isNaN(ra) ? 0 : ra);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading works...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - ❌ REMOVED blue Edit Mode button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Management</h1>
          <p className="text-gray-600 mt-1">
            {selectedGR
              ? `Showing works for GR: ${grs.find(gr => gr.id === selectedGR)?.grNumber || selectedGR}`
              : 'Comprehensive view of all government works with expandable details'}
          </p>
        </div>

        {/* ✅ NEW: Add Work Button (only in Edit Mode) */}
        {isEditMode && (
          <button
            onClick={() => setShowWorkModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Work</span>
          </button>
        )}
      </div>

      {/* GR Filter */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Filter by GR:</label>
          <select
            value={selectedGR || ''}
            onChange={(e) => setSelectedGR(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Works (No Filter)</option>
            {grs.map((gr) => (
              <option key={gr.id} value={gr.id}>
                {gr.grNumber} - {new Date(gr.grDate).toLocaleDateString()}
              </option>
            ))}
          </select>
          {selectedGR && (
            <button
              onClick={() => setSelectedGR(null)}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Total Works</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalWorks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Total AA</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalAA)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Total RA</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRA)}</p>
        </div>
      </div>

      {/* Work Table */}
      <WorkTable
        works={works}
        grs={grs}
        isEditMode={isEditMode}
        onUpdate={handleDataUpdate}
        onEditWork={handleEditWork}
        onDelete={handleDeleteWork}        // ✅ NEW
        onDeleteSpill={handleDeleteSpill}
      />

      {/* ✅ NEW: Work Form Modal */}
      <WorkFormModal
        isOpen={showWorkModal}
        onClose={() => {
          setShowWorkModal(false);
          setEditingWork(null);
        }}
        onSuccess={() => {
          setShowWorkModal(false);
          setEditingWork(null);
          handleDataUpdate();
        }}
        grs={grs}
        editingWork={editingWork}
      />
    </div>
  );
};

export default WorkListPage;
