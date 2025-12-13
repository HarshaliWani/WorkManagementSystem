// WorkTable.tsx - COMPLETE WITH DOUBLE-CLICK EDIT
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { spillService } from '../services/spillService';
import WorkFormModal from './WorkFormModal';
import type { Work, GR } from '../types/work';
import { Edit2, Trash2 } from 'lucide-react';

interface WorkTableProps {
  works: Work[];
  grs: GR[];  // ✅ ADD: Pass GRs for the form modal
  isEditMode: boolean;
  onUpdate: () => void;
  onEditWork: (work: Work) => void;
  onDelete: (workId: number) => void;        // ✅ NEW
  onDeleteSpill: (spillId: number) => void;
}

const WorkTable: React.FC<WorkTableProps> = ({ works, grs, isEditMode, onUpdate, onEditWork, onDelete,
  onDeleteSpill }) => {
  const [visibleSpills, setVisibleSpills] = useState<Set<number>>(new Set());
  const [spillData, setSpillData] = useState<{ [key: number]: any[] }>({});
  const [newSpillData, setNewSpillData] = useState<{ [key: number]: string }>({});

  // ✅ State for editing work
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [showWorkModal, setShowWorkModal] = useState(false);

  const toggleSpillsVisibility = async (workId: number) => {
    const newVisibleSpills = new Set(visibleSpills);

    if (newVisibleSpills.has(workId)) {
      newVisibleSpills.delete(workId);
    } else {
      newVisibleSpills.add(workId);

      if (!spillData[workId]) {
        try {
          const spills = await spillService.fetchSpillsByWork(workId.toString());
          setSpillData(prev => ({ ...prev, [workId]: spills }));
        } catch (error) {
          console.error('Error fetching spills:', error);
        }
      }
    }

    setVisibleSpills(newVisibleSpills);
  };

  const handleAddSpill = async (workId: number) => {
    const araValue = newSpillData[workId];

    if (!araValue || isNaN(Number(araValue))) {
      alert('Please enter a valid ARA amount');
      return;
    }

    try {
      await spillService.createSpill({
        work_id: workId,
        ara: parseFloat(araValue)
      });

      setNewSpillData(prev => ({ ...prev, [workId]: '' }));

      const updatedSpills = await spillService.fetchSpillsByWork(workId.toString());
      setSpillData(prev => ({ ...prev, [workId]: updatedSpills }));

      onUpdate();
    } catch (error) {
      console.error('Error adding spill:', error);
      alert('Failed to add spill');
    }
  };

  const calculateTotalRA = (work: Work): number => {
    const ra = Number(work.RA) || 0;
    const spills = spillData[work.id] || [];
    const totalSpills = spills.reduce((sum, spill) => sum + (Number(spill.ARA) || 0), 0);
    return ra + totalSpills;
  };

  const calculateBalance = (work: Work): number => {
    const aa = Number(work.AA) || 0;
    const totalRA = calculateTotalRA(work);
    return aa - totalRA;
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // ✅ Handle double-click to edit
  const handleRowDoubleClick = (work: Work, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    if (isEditMode) {
      console.log('Work data:', work);  // ✅ Check what gr field contains
      console.log('GR value:', work.gr);
      setEditingWork(work);
      setShowWorkModal(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total RA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {works.map((work) => (
                <React.Fragment key={work.id}>
                  {/* ✅ Main Work Row - click to edit */}
                  <tr key={work.id} className='hover: bg-gray-50'>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {work.workName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(Number(work.AA) || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(Number(work.RA) || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(calculateTotalRA(work))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(calculateBalance(work))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSpillsVisibility(work.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                          title="View/Hide Spills"
                        >
                          {visibleSpills.has(work.id) ? 'Hide Spills' : 'View Spills'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Spills Section */}
                  {
                    visibleSpills.has(work.id) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Spills for {work.workName}
                              </h4>
                              {isEditMode && (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => onEditWork(work)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit Work</span>
                                  </button>

                                  <button
                                    onClick={() => onDelete(work.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Work</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Spills Table */}
                            {spillData[work.id] && spillData[work.id].length > 0 ? (
                              <table className="min-w-full divide-y divide-gray-300 mb-4">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                      Spill ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                      ARA Amount
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                      Created At
                                    </th>
                                    {isEditMode && (  // ✅ NEW: Actions column in edit mode
                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {spillData[work.id].map((spill: any) => (
                                    <tr key={spill.id}>
                                      <td className="px-4 py-2 text-sm text-gray-900">{spill.id}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        {formatCurrency(Number(spill.ARA) || 0)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {new Date(spill.created_at).toLocaleDateString()}
                                      </td>
                                      {isEditMode && (
                                        <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                          <button
                                            onClick={() => onDeleteSpill(spill.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Delete Spill"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-sm text-gray-500 mb-4">No spills added yet</p>
                            )}

                            {/* Add Spill (Edit Mode Only) */}
                            {isEditMode && (
                              <div className="flex items-center space-x-2 mt-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Enter ARA amount"
                                  value={newSpillData[work.id] || ''}
                                  onChange={(e) =>
                                    setNewSpillData(prev => ({
                                      ...prev,
                                      [work.id]: e.target.value
                                    }))
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => handleAddSpill(work.id)}
                                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Add Spill</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  }
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {works.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No works found</p>
          </div>
        )}
      </div >

      {/* ✅ Work Edit Modal */}
      < WorkFormModal
        isOpen={showWorkModal}
        onClose={() => {
          setShowWorkModal(false);
          setEditingWork(null);
        }}
        onSuccess={() => {
          setShowWorkModal(false);
          setEditingWork(null);
          onUpdate();
        }}
        grs={grs}
        editingWork={editingWork}
      />
    </>
  );
};

export default WorkTable;
