// src/pages/BillsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, X, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationContext } from '../contexts/NavigationContext';
import BillsTable from '../components/BillsTable';
import BillFormModal from '../components/BillFormModal';
import DemoBanner from '../components/DemoBanner';
import { billService } from '../services/billService';
import { workService } from '../services/workService';
import { grService } from '../services/grService';
import { tenderService } from '../services/tenderService';
import { Work } from '../types/work';
import type { GR } from '../types/work';
import { Tender } from './TendersPage';

export interface Bill {
  id: number;
  billNumber: string;
  billAmount?: number;
  billDate: string | null;
  status?: string;
  workId: number;
  workName: string;
  workDate?: string | null;
  // Work cancellation status
  work_is_cancelled?: boolean;
  work_cancel_reason?: string | null;
  work_cancel_details?: string | null;
  tenderId: number;
  tenderNumber?: string;
  agencyName?: string;
  grId?: number | null;
  // Bill calculation fields
  workPortion?: number;
  gstPercentage?: number;
  gstAmount?: number;
  RoyaltyAndTesting?: number;
  billTotal?: number;
  tdsPercentage?: number;
  tdsAmount?: number;
  gstOnWorkPortionPercentage?: number;
  gstOnWorkPortion?: number;
  lwcPercentage?: number;
  lwcAmount?: number;
  Insurance?: number;
  SecurityDeposit?: number;
  ReimbursementOfInsurance?: number;
  Royalty?: number;
  netAmount?: number;
  documentUrl?: string | null;
  paymentDoneFromGrId?: number | null;
  paymentDoneFromGrNumber?: string | null;
  // Status fields
  auditObjection?: boolean;
  auditObjectionDate?: string | null;
  clearAuditObjection?: boolean;
  clearAuditObjectionDate?: string | null;
  payment?: boolean;
  paymentDate?: string | null;
  created_at: string;
  updated_at: string;
}

interface BillsPageProps {
  isEditMode?: boolean;
}

const Bills: React.FC<BillsPageProps> = ({ isEditMode = false }) => {
  const { isDemoMode } = useAuth();
  const { navigationPath, activeFilters } = useNavigationContext();
  const [searchParams] = useSearchParams();
  const [bills, setBills] = useState<Bill[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [grs, setGrs] = useState<GR[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Filter states
  const [selectedWork, setSelectedWork] = useState<number | null>(null);
  const [selectedGR, setSelectedGR] = useState<number | null>(null);
  const [selectedTender, setSelectedTender] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Track if filters have been initialized
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Work dropdown states
  const [workSearchQuery, setWorkSearchQuery] = useState('');
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = useState(false);
  const workDropdownRef = useRef<HTMLDivElement>(null);

  // GR dropdown states
  const [grSearchQuery, setGrSearchQuery] = useState('');
  const [isGRDropdownOpen, setIsGRDropdownOpen] = useState(false);
  const grDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [isDemoMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workDropdownRef.current && !workDropdownRef.current.contains(event.target as Node)) {
        setIsWorkDropdownOpen(false);
      }
      if (grDropdownRef.current && !grDropdownRef.current.contains(event.target as Node)) {
        setIsGRDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsData, worksData, grsData, tendersData] = await Promise.all([
        billService.fetchAllBills(isDemoMode),
        workService.fetchAllWorks(isDemoMode),
        grService.fetchAllGRs(isDemoMode),
        tenderService.fetchAllTenders(isDemoMode)
      ]);
      setBills(billsData);
      setWorks(worksData);
      setGrs(grsData);
      setTenders(tendersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize filters from NavigationContext FIRST, then fall back to URL params
  useEffect(() => {
    if (!loading && !filtersInitialized) {
      // Priority: activeFilters > URL params > navigationPath > default
      const grIdFromFilters = activeFilters.gr_id;
      const workIdFromFilters = activeFilters.work_id;
      const tenderIdFromFilters = activeFilters.tender_id;
      const grIdFromUrl = searchParams.get('gr') ? parseInt(searchParams.get('gr')!) : null;
      const workIdFromUrl = searchParams.get('work') ? parseInt(searchParams.get('work')!) : null;
      const tenderIdFromUrl = searchParams.get('tender') ? parseInt(searchParams.get('tender')!) : null;
      const billsPathItem = navigationPath.find(item => item.name === 'Bills');
      const grIdFromPath = billsPathItem?.gr_id;
      const workIdFromPath = billsPathItem?.work_id;
      const tenderIdFromPath = billsPathItem?.tender_id;
      
      const grIdToSet = grIdFromFilters || grIdFromUrl || grIdFromPath || null;
      const workIdToSet = workIdFromFilters || workIdFromUrl || workIdFromPath || null;
      const tenderIdToSet = tenderIdFromFilters || tenderIdFromUrl || tenderIdFromPath || null;
      
      if (grIdToSet !== null && grIdToSet !== selectedGR) {
        setSelectedGR(grIdToSet);
      }
      
      if (workIdToSet !== null && workIdToSet !== selectedWork) {
        setSelectedWork(workIdToSet);
      }
      
      if (tenderIdToSet !== null && tenderIdToSet !== selectedTender) {
        setSelectedTender(tenderIdToSet);
      }
      
      setFiltersInitialized(true);
    }
  }, [loading, searchParams, navigationPath, activeFilters, filtersInitialized, selectedGR, selectedWork, selectedTender]);

  // Fetch filtered data when activeFilters change (after initialization)
  useEffect(() => {
    if (filtersInitialized && (activeFilters.gr_id || activeFilters.work_id || activeFilters.tender_id)) {
      // Refetch bills to apply filter if needed
      // Note: The filtering is done client-side, so we just need to ensure data is loaded
      // If backend filtering is needed in the future, call fetchData() here
    }
  }, [activeFilters, filtersInitialized]);

  // Filter works based on search query and selected GR
  const filteredWorks = works.filter((work) => {
    const matchesSearch = work.workName.toLowerCase().includes(workSearchQuery.toLowerCase());
    const matchesGR = !selectedGR || work.gr === selectedGR;
    return matchesSearch && matchesGR;
  });

  // Filter GRs based on search query
  const filteredGRs = grs.filter((gr) => {
    const searchLower = grSearchQuery.toLowerCase();
    return gr.grNumber.toLowerCase().includes(searchLower);
  });

  // Handle work selection
  const handleSelectWork = (workId: number | null) => {
    setSelectedWork(workId);
    setIsWorkDropdownOpen(false);
    setWorkSearchQuery('');
  };

  // Handle GR selection
  const handleSelectGR = (grId: number | null) => {
    setSelectedGR(grId);
    setSelectedWork(null); // Reset work filter when GR changes
    setIsGRDropdownOpen(false);
    setGrSearchQuery('');
  };

  // Get selected work display text
  const getSelectedWorkText = () => {
    if (!selectedWork) return 'All Works (No Filter)';
    const work = works.find((w) => w.id === selectedWork);
    return work ? work.workName : 'Select Work';
  };

  // Get selected GR display text
  const getSelectedGRText = () => {
    if (!selectedGR) return 'All GRs (No Filter)';
    const gr = grs.find((g) => g.id === selectedGR);
    return gr ? gr.grNumber : 'Select GR';
  };

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    if (selectedWork && bill.workId !== selectedWork) return false;
    if (selectedGR) {
      const work = works.find((w) => w.id === bill.workId);
      if (!work || work.gr !== selectedGR) return false;
    }
    if (selectedTender && bill.tenderId !== selectedTender) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesBillNumber = bill.billNumber.toLowerCase().includes(searchLower);
      if (!matchesBillNumber) return false;
    }
    if (startDate || endDate) {
      const billDate = bill.billDate ? new Date(bill.billDate) : null;
      if (!billDate) return false;
      if (startDate && billDate < new Date(startDate)) return false;
      if (endDate && billDate > new Date(endDate)) return false;
    }
    if (selectedStatus && bill.status !== selectedStatus) return false;
    return true;
  });

  const handleClearFilters = () => {
    setSelectedWork(null);
    setSelectedGR(null);
    setSelectedTender(null);
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSelectedStatus('');
    setWorkSearchQuery('');
    setGrSearchQuery('');
  };

  const hasActiveFilters = selectedWork !== null || selectedGR !== null || selectedTender !== null || searchQuery || startDate || endDate || selectedStatus;

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
        await billService.deleteBill(id.toString(), isDemoMode);
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

  // Show loading spinner until data is loaded AND filters are initialized
  if (loading || !filtersInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">
            {loading ? 'Loading bills...' : 'Initializing filters...'}
          </div>
        </div>
      </div>
    );
  }

  // Filter out bills from cancelled works for card statistics (tables still show them)
  const activeFilteredBills = filteredBills.filter(bill => !bill.work_is_cancelled);
  
  // Calculate summary statistics from non-cancelled works only (for cards)
  const totalBills = activeFilteredBills.length;
  const paidBills = activeFilteredBills.filter(b => b.status === 'Paid').length;
  const auditClearedBills = activeFilteredBills.filter(b => b.status === 'Audit Cleared').length;
  const auditObjectionBills = activeFilteredBills.filter(b => b.status === 'Audit Objection').length;
  const pendingBills = activeFilteredBills.filter(b => b.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemoMode && <DemoBanner />}
      
      {/* Page Title */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
            <p className="text-gray-600 mt-2">
              {selectedWork
                ? `Showing bills for: ${works.find((w) => w.id === selectedWork)?.workName || selectedWork}`
                : selectedGR
                  ? `Showing bills for GR: ${grs.find((g) => g.id === selectedGR)?.grNumber || selectedGR}`
                  : 'Manage all bills for government works'}
            </p>
          </div>
          {isEditMode && (
            <button
              onClick={handleAddBill}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Bill
            </button>
          )}
        </div>
      </div>
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filter by GR */}
          <div ref={grDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by GR
            </label>
            <button
              onClick={() => setIsGRDropdownOpen(!isGRDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
            >
              <span className="truncate">{getSelectedGRText()}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {isGRDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="sticky top-0 bg-white p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={grSearchQuery}
                      onChange={(e) => setGrSearchQuery(e.target.value)}
                      placeholder="Search GR..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div
                  onClick={() => handleSelectGR(null)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedGR === null ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                    }`}
                >
                  All GRs (No Filter)
                </div>
                {filteredGRs.length > 0 ? (
                  filteredGRs.map((gr) => (
                    <div
                      key={gr.id}
                      onClick={() => handleSelectGR(gr.id)}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedGR === gr.id ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                        }`}
                    >
                      {gr.grNumber}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    No GRs found matching "{grSearchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter by Work */}
          <div ref={workDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Work
            </label>
            <button
              onClick={() => setIsWorkDropdownOpen(!isWorkDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
            >
              <span className="truncate">{getSelectedWorkText()}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {isWorkDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="sticky top-0 bg-white p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={workSearchQuery}
                      onChange={(e) => setWorkSearchQuery(e.target.value)}
                      placeholder="Search work..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div
                  onClick={() => handleSelectWork(null)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedWork === null ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                    }`}
                >
                  All Works (No Filter)
                </div>
                {filteredWorks.length > 0 ? (
                  filteredWorks.map((work) => (
                    <div
                      key={work.id}
                      onClick={() => handleSelectWork(work.id)}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedWork === work.id ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                        }`}
                    >
                      {work.workName}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    No works found matching "{workSearchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search by Bill Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Bill Number
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter bill number..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Bills</div>
          <div className="text-2xl font-bold text-gray-900">{totalBills}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Paid</div>
          <div className="text-2xl font-bold text-green-600">{paidBills}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Audit Cleared</div>
          <div className="text-2xl font-bold text-blue-600">{auditClearedBills}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Audit Objection</div>
          <div className="text-2xl font-bold text-yellow-600">{auditObjectionBills}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-gray-600">{pendingBills}</div>
        </div>
      </div>



      <BillsTable
        bills={filteredBills}
        onEdit={handleEditBill}
        onDelete={handleDeleteBill}
        isEditMode={isEditMode}
      />

      <BillFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={fetchData}
        editingBill={editingBill}
      />
    </div>
  );
};

export default Bills;
