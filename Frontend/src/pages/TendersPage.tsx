// src/pages/TendersPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, X, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationContext } from '../contexts/NavigationContext';
import TendersTable from '../components/TendersTable';
import TenderFormModal from '../components/TenderFormModal';
import DemoBanner from '../components/DemoBanner';
import { tenderService } from '../services/tenderService';
import { workService } from '../services/workService';
import { grService } from '../services/grService';
import { Work } from '../types/work';
import type { GR } from '../types/work';

export interface Tender {
  id: number;
  tenderNumber: string;
  tenderName: string;
  openingDate: string;
  status: string;
  technicalSanctionId: number;
  technicalSanctionSubName: string;
  workOrderUrl: string | null;
  workOrderUploaded: boolean;
  workId?: number;
  workName?: string;
  workDate?: string;
  // Work cancellation status
  work_is_cancelled?: boolean;
  work_cancel_reason?: string | null;
  work_cancel_details?: string | null;
  Online?: boolean;
  onlineDate?: string | null;
  Offline?: boolean;
  offlineDate?: string | null;
  technicalVerification: boolean;
  technicalVerificationDate: string | null;
  financialVerification: boolean;
  financialVerificationDate: string | null;
  loa: boolean;
  loaDate: string | null;
  workOrderTick?: boolean;
  workOrderTickDate?: string | null;
  emdSupporting?: boolean;
  supportingDate?: string | null;
  emdAwarded?: boolean;
  awardedDate?: string | null;
}

interface TendersPageProps {
  isEditMode?: boolean;
}

const Tenders: React.FC<TendersPageProps> = ({ isEditMode = false }) => {
  const { isDemoMode } = useAuth();
  const { navigationPath, activeFilters } = useNavigationContext();
  const [searchParams] = useSearchParams();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [grs, setGrs] = useState<GR[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);

  // Filter states
  const [selectedWork, setSelectedWork] = useState<number | null>(null);
  const [selectedGR, setSelectedGR] = useState<number | null>(null);
  const [selectedTechnicalSanction, setSelectedTechnicalSanction] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
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

  // Initialize filters from NavigationContext FIRST, then fall back to URL params
  useEffect(() => {
    if (!loading && !filtersInitialized) {
      // Priority: activeFilters > URL params > navigationPath > default
      const grIdFromFilters = activeFilters.gr_id;
      const workIdFromFilters = activeFilters.work_id;
      const tsIdFromFilters = activeFilters.technical_sanction_id;
      const grIdFromUrl = searchParams.get('gr') ? parseInt(searchParams.get('gr')!) : null;
      const workIdFromUrl = searchParams.get('work') ? parseInt(searchParams.get('work')!) : null;
      const tsIdFromUrl = searchParams.get('technical_sanction') ? parseInt(searchParams.get('technical_sanction')!) : null;
      const tendersPathItem = navigationPath.find(item => item.name === 'Tenders');
      const grIdFromPath = tendersPathItem?.gr_id;
      const workIdFromPath = tendersPathItem?.work_id;
      const tsIdFromPath = tendersPathItem?.technical_sanction_id;
      
      const grIdToSet = grIdFromFilters || grIdFromUrl || grIdFromPath || null;
      const workIdToSet = workIdFromFilters || workIdFromUrl || workIdFromPath || null;
      const tsIdToSet = tsIdFromFilters || tsIdFromUrl || tsIdFromPath || null;
      
      if (grIdToSet !== null && grIdToSet !== selectedGR) {
        setSelectedGR(grIdToSet);
      }
      
      if (workIdToSet !== null && workIdToSet !== selectedWork) {
        setSelectedWork(workIdToSet);
      }
      
      if (tsIdToSet !== null && tsIdToSet !== selectedTechnicalSanction) {
        setSelectedTechnicalSanction(tsIdToSet);
      }
      
      setFiltersInitialized(true);
    }
  }, [loading, searchParams, navigationPath, activeFilters, filtersInitialized, selectedGR, selectedWork, selectedTechnicalSanction]);

  // Fetch filtered data when activeFilters change (after initialization)
  useEffect(() => {
    if (filtersInitialized && (activeFilters.gr_id || activeFilters.work_id || activeFilters.technical_sanction_id)) {
      // Refetch tenders to apply filter if needed
      // Note: The filtering is done client-side, so we just need to ensure data is loaded
      // If backend filtering is needed in the future, call fetchData() here
    }
  }, [activeFilters, filtersInitialized]);

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
      const [tendersData, worksData, grsData] = await Promise.all([
        tenderService.fetchAllTenders(isDemoMode),
        workService.fetchAllWorks(isDemoMode),
        grService.fetchAllGRs(isDemoMode)
      ]);
      setTenders(tendersData);
      setWorks(worksData);
      setGrs(grsData);
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
        await tenderService.deleteTender(id.toString(), isDemoMode);
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

  // Filter tenders
  const filteredTenders = tenders.filter((tender) => {
    if (selectedWork && tender.workId !== selectedWork) return false;
    if (selectedGR) {
      const work = works.find((w) => w.id === tender.workId);
      if (!work || work.gr !== selectedGR) return false;
    }
    if (selectedTechnicalSanction && tender.technicalSanctionId !== selectedTechnicalSanction) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesTenderNumber = tender.tenderNumber.toLowerCase().includes(searchLower);
      const matchesAgencyName = (tender.tenderName || '').toLowerCase().includes(searchLower);
      if (!matchesTenderNumber && !matchesAgencyName) return false;
    }
    if (startDate || endDate) {
      const tenderDate = tender.openingDate ? new Date(tender.openingDate) : null;
      if (!tenderDate) return false;
      if (startDate && tenderDate < new Date(startDate)) return false;
      if (endDate && tenderDate > new Date(endDate)) return false;
    }
    return true;
  });

  const handleClearFilters = () => {
    setSelectedWork(null);
    setSelectedGR(null);
    setSelectedTechnicalSanction(null);
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setWorkSearchQuery('');
    setGrSearchQuery('');
  };

  const hasActiveFilters = selectedWork !== null || selectedGR !== null || selectedTechnicalSanction !== null || searchQuery || startDate || endDate;

  // Filter out tenders from cancelled works for card statistics (tables still show them)
  const activeFilteredTenders = filteredTenders.filter(tender => !tender.work_is_cancelled);
  
  // Calculate summary statistics from non-cancelled works only (for cards)
  const totalTenders = activeFilteredTenders.length;
  const openTenders = activeFilteredTenders.filter(t => t.status === 'Open').length;
  const closedTenders = activeFilteredTenders.filter(t => t.status === 'Closed').length;
  const awardedTenders = activeFilteredTenders.filter(t => t.status === 'Awarded').length;

  // Show loading spinner until data is loaded AND filters are initialized
  if (loading || !filtersInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">
            {loading ? 'Loading tenders...' : 'Initializing filters...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemoMode && <DemoBanner />}
      
      {/* Page Title */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenders</h1>
            <p className="text-gray-600 mt-2">
              {selectedWork
                ? `Showing tenders for: ${works.find((w) => w.id === selectedWork)?.workName || selectedWork}`
                : selectedGR
                ? `Showing tenders for GR: ${grs.find((g) => g.id === selectedGR)?.grNumber || selectedGR}`
                : 'Manage all tenders for government works'}
            </p>
          </div>
          {isEditMode && (
            <button
              onClick={handleAddTender}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Tender
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
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
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    selectedGR === null ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                  }`}
                >
                  All GRs (No Filter)
                </div>
                {filteredGRs.length > 0 ? (
                  filteredGRs.map((gr) => (
                    <div
                      key={gr.id}
                      onClick={() => handleSelectGR(gr.id)}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                        selectedGR === gr.id ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
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
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    selectedWork === null ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                  }`}
                >
                  All Works (No Filter)
                </div>
                {filteredWorks.length > 0 ? (
                  filteredWorks.map((work) => (
                    <div
                      key={work.id}
                      onClick={() => handleSelectWork(work.id)}
                      className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                        selectedWork === work.id ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
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

          {/* Search by Tender ID or Agency Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Tender
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tender ID or agency..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Start Date */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-900">
              {filteredTenders.length} of {tenders.length} tenders shown
            </p>
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Tenders</p>
          <p className="text-3xl font-bold text-gray-900">{totalTenders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Open</p>
          <p className="text-2xl font-bold text-blue-900">{openTenders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Closed</p>
          <p className="text-2xl font-bold text-gray-900">{closedTenders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Awarded</p>
          <p className="text-2xl font-bold text-green-900">{awardedTenders}</p>
        </div>
      </div>

      {/* Table */}
      <TendersTable
        tenders={filteredTenders}
        onEdit={handleEditTender}
        onDelete={handleDeleteTender}
        isEditMode={isEditMode}
        works={works}
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
