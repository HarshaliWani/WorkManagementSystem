// src/pages/TendersPage.tsx
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TendersTable from '../components/TendersTable';
import TenderFormModal from '../components/TenderFormModal';
import { tenderService } from '../services/tenderService';
import { workService } from '../services/workService';
import { Work } from '../types/work';

export interface Tender {
  id: number;
  tenderNumber: string;
  tenderName: string;
  openingDate: string;
  status: string;
  technicalSanctionId: number | null;
  workOrderUrl: string | null;
  onlineOffline: boolean;
  onlineOfflineDate: string | null;
  technicalVerification: boolean;
  technicalVerificationDate: string | null;
  financialVerification: boolean;
  financialVerificationDate: string | null;
  loa: boolean;
  loaDate: string | null;
}

const Tenders: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tendersData, worksData] = await Promise.all([
        tenderService.fetchAllTenders(),
        workService.fetchAllWorks()
      ]);
      setTenders(tendersData);
      setWorks(worksData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTender = () => {
    setEditingTender(null);
    setIsModalOpen(true);
  };

  const handleEditTender = (tender: Tender) => {
    setEditingTender(tender);
    setIsModalOpen(true);
  };

  const handleDeleteTender = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tender?')) {
      try {
        await tenderService.deleteTender(id.toString());
        await fetchData();
      } catch (error) {
        console.error('Error deleting tender:', error);
        alert('Failed to delete tender');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTender(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tenders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tenders</h1>
        <button
          onClick={handleAddTender}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Tender
        </button>
      </div>

      <TendersTable
        tenders={tenders}
        onEdit={handleEditTender}
        onDelete={handleDeleteTender}
      />

      <TenderFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={fetchData}
        works={works}
        editingTender={editingTender}
      />
    </div>
  );
};

export default Tenders;
