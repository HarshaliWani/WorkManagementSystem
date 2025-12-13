// TechnicalSanctions.tsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TechnicalSanctionsTable from './TechnicalSanctionsTable';
import TSFormModal from './TSFormModal';
import { technicalSanctionService, TechnicalSanction } from '../services/technicalSanctionService';
import { workService } from '../services/workService';
import { Work } from '../types/work';

interface TechnicalSanctionsProps {
  isEditMode: boolean;
}

const TechnicalSanctions: React.FC = () => {
  const [technicalSanctions, setTechnicalSanctions] = useState<TechnicalSanction[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTS, setEditingTS] = useState<TechnicalSanction | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tsData, worksData] = await Promise.all([
        technicalSanctionService.fetchAllTechnicalSanctions(),
        workService.fetchAllWorks()
      ]);

      setTechnicalSanctions(tsData);
      setWorks(worksData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTS(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ts: TechnicalSanction) => {
    setEditingTS(ts);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this technical sanction?')) {
      return;
    }

    try {
      await technicalSanctionService.deleteTechnicalSanction(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting technical sanction:', error);
      alert('Failed to delete technical sanction');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTS(null);
  };

  const handleSubmit = async () => {
    await fetchData();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technical Sanctions</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage technical sanctions for all government works with detailed TS management capabilities.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Technical Sanction
        </button>
      </div>

      {/* Table */}
      <TechnicalSanctionsTable
        technicalSanctions={technicalSanctions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      {isModalOpen && (
        <TSFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          editingTS={editingTS}
          works={works}
        />
      )}
    </div>
  );
};

export default TechnicalSanctions;