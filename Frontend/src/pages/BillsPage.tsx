// src/pages/BillsPage.tsx
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import BillsTable from '../components/BillsTable';
import BillFormModal from '../components/BillFormModal';
import { billService } from '../services/billService';
import { workService } from '../services/workService';
import { Work } from '../types/work';

export interface Bill {
  id: number;
  billNumber: string;
  billAmount: number;
  billDate: string | null;
  status: string;
  workId: number;
  workName: string;
  grId: number | null;
  auditObjection: boolean;
  auditObjectionDate: string | null;
  clearAuditObjection: boolean;
  clearAuditObjectionDate: string | null;
  payment: boolean;
  paymentDate: string | null;
  created_at: string;
  updated_at: string;
}

const Bills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsData, worksData] = await Promise.all([
        billService.fetchAllBills(),
        workService.fetchAllWorks()
      ]);
      setBills(billsData);
      setWorks(worksData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = () => {
    setEditingBill(null);
    setIsModalOpen(true);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleDeleteBill = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await billService.deleteBill(id.toString());
        await fetchData();
      } catch (error) {
        console.error('Error deleting bill:', error);
        alert('Failed to delete bill');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBill(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading bills...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
        <button
          onClick={handleAddBill}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Bill
        </button>
      </div>

      <BillsTable
        bills={bills}
        onEdit={handleEditBill}
        onDelete={handleDeleteBill}
      />

      <BillFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={fetchData}
        works={works}
        editingBill={editingBill}
      />
    </div>
  );
};

export default Bills;
