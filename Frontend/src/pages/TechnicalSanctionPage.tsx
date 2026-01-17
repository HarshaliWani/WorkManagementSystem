// TechnicalSanctionPage.tsx - UPDATED WITH GR FETCHING

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Search, X, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationContext } from '../contexts/NavigationContext';
import TechnicalSanctionsTable from '../components/TechnicalSanctionsTable';
import TSFormModal from '../components/TSFormModal';
import DemoBanner from '../components/DemoBanner';
import { technicalSanctionService, TechnicalSanction } from '../services/technicalSanctionService';
import { workService } from '../services/workService';
import { grService } from '../services/grService';
import type { Work } from '../types/work';
import type { GR } from '../types/work';

interface TechnicalSanctionPageProps {
  onBack: () => void;
  isEditMode: boolean;
}

export const TechnicalSanctionPage: React.FC<TechnicalSanctionPageProps> = ({
  onBack,
  isEditMode
}) => {
  const { isDemoMode } = useAuth();
  const { navigationPath, activeFilters } = useNavigationContext();
  const [searchParams] = useSearchParams();
  // State management
  const [technicalSanctions, setTechnicalSanctions] = useState<TechnicalSanction[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [grs, setGrs] = useState<GR[]>([]); // NEW: GR state
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTS, setEditingTS] = useState<TechnicalSanction | null>(null);

  // Filter states
  const [selectedWork, setSelectedWork] = useState<number | null>(null);
  const [selectedGR, setSelectedGR] = useState<number | null>(null); // NEW: GR filter
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

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [isDemoMode]);

  // Initialize filters from NavigationContext FIRST, then fall back to URL params
  useEffect(() => {
    if (!loading && grs.length > 0 && works.length > 0 && !filtersInitialized) {
      // Priority: activeFilters > URL params > navigationPath > default
      const grIdFromFilters = activeFilters.gr_id;
      const workIdFromFilters = activeFilters.work_id;
      const grIdFromUrl = searchParams.get('gr') ? parseInt(searchParams.get('gr')!) : null;
      const workIdFromUrl = searchParams.get('work') ? parseInt(searchParams.get('work')!) : null;
      const tsPathItem = navigationPath.find(item => item.name === 'Technical Sanctions');
      const grIdFromPath = tsPathItem?.gr_id;
      const workIdFromPath = tsPathItem?.work_id;
      
      const grIdToSet = grIdFromFilters || grIdFromUrl || grIdFromPath || null;
      const workIdToSet = workIdFromFilters || workIdFromUrl || workIdFromPath || null;
      
      if (grIdToSet !== null && grIdToSet !== selectedGR) {
        setSelectedGR(grIdToSet);
      }
      
      if (workIdToSet !== null && workIdToSet !== selectedWork) {
        setSelectedWork(workIdToSet);
      }
      
      setFiltersInitialized(true);
    }
  }, [loading, grs, works, searchParams, navigationPath, activeFilters, filtersInitialized, selectedGR, selectedWork]);

  // Fetch filtered data when activeFilters change (after initialization)
  useEffect(() => {
    if (filtersInitialized && (activeFilters.gr_id || activeFilters.work_id)) {
      // Refetch technical sanctions to apply filter if needed
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
    try {
      setLoading(true);
      const [tsData, worksData, grsData] = await Promise.all([
        technicalSanctionService.fetchAllTechnicalSanctions(isDemoMode),
        workService.fetchAllWorks(isDemoMode),
        grService.fetchAllGRs(isDemoMode), // NEW: Fetch GRs
      ]);
      setTechnicalSanctions(tsData);
      setWorks(worksData);
      setGrs(grsData); // NEW: Set GRs
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter works based on search query
  const filteredWorks = works.filter((work) => {
    const searchLower = workSearchQuery.toLowerCase();
    return work.workName.toLowerCase().includes(searchLower);
  });

  // NEW: Filter GRs based on search query
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

  // NEW: Handle GR selection
  const handleSelectGR = (grId: number | null) => {
    setSelectedGR(grId);
    setIsGRDropdownOpen(false);
    setGrSearchQuery('');
  };

  // Get selected work display text
  const getSelectedWorkText = () => {
    if (!selectedWork) return 'All Works (No Filter)';
    const work = works.find((w) => w.id === selectedWork);
    return work ? work.workName : 'Select Work';
  };

  // NEW: Get selected GR display text
  const getSelectedGRText = () => {
    if (!selectedGR) return 'All GRs (No Filter)';
    const gr = grs.find((g) => g.id === selectedGR);
    return gr ? gr.grNumber : 'Select GR';
  };

  // Filter technical sanctions
  const filteredTechnicalSanctions = technicalSanctions.filter((ts) => {
    if (selectedWork && ts.work !== selectedWork) return false;
    if (selectedGR && ts.gr_id !== selectedGR) return false; // NEW: Filter by GR
    if (searchQuery && !(ts.subName || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (startDate || endDate) {
      const tsDate = new Date(ts.notingDate || ts.orderDate || ts.created_at);
      if (startDate && tsDate < new Date(startDate)) return false;
      if (endDate && tsDate > new Date(endDate)) return false;
    }
    return true;
  });

  // Handlers
  const handleAdd = () => {
    setEditingTS(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ts: TechnicalSanction) => {
    setEditingTS(ts);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this technical sanction?')) return;
    try {
      await technicalSanctionService.deleteTechnicalSanction(id, isDemoMode);
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

  const handleClearFilters = () => {
    setSelectedWork(null);
    setSelectedGR(null); // NEW: Clear GR filter
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setWorkSearchQuery('');
    setGrSearchQuery('');
  };

  const hasActiveFilters = selectedWork !== null || selectedGR !== null || searchQuery || startDate || endDate;

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  // Filter out technical sanctions from cancelled works for card statistics (tables still show them)
  const activeFilteredTechnicalSanctions = filteredTechnicalSanctions.filter(ts => !ts.work_is_cancelled);
  
  // Calculate totals from non-cancelled works only (for cards)
  const totalTS = activeFilteredTechnicalSanctions.length;
  const totalGrandTotal = activeFilteredTechnicalSanctions.reduce((sum, ts) => sum + Number(ts.grandTotal || 0), 0);
  const totalFinalTotal = activeFilteredTechnicalSanctions.reduce((sum, ts) => sum + Number(ts.finalTotal || 0), 0);
  const totalAA = activeFilteredTechnicalSanctions.reduce((sum, ts) => sum + Number(ts.aa || 0), 0);
  const totalBalance = totalAA - totalFinalTotal;

  // Show loading spinner until data is loaded AND filters are initialized
  if (loading || !filtersInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">
            {loading ? 'Loading technical sanctions...' : 'Initializing filters...'}
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
            <h1 className="text-3xl font-bold text-gray-900">Technical Sanctions</h1>
            <p className="text-gray-600 mt-2">
              {selectedWork
                ? `Showing TS for: ${works.find((w) => w.id === selectedWork)?.workName || selectedWork}`
                : selectedGR
                ? `Showing TS for GR: ${grs.find((g) => g.id === selectedGR)?.grNumber || selectedGR}`
                : 'Manage technical sanctions for all government works'}
            </p>
          </div>

          {/* Add button (controlled by isEditMode from App) */}
          {isEditMode && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Technical Sanction
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* NEW: Searchable GR Filter */}
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

          {/* Searchable Work Filter */}
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

          {/* Search by TS Sub Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search TS Sub Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by TS sub name..."
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
              {filteredTechnicalSanctions.length} of {technicalSanctions.length} technical sanctions shown
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
          <p className="text-sm text-gray-600 mb-1">Total Technical Sanctions</p>
          <p className="text-3xl font-bold text-gray-900">{totalTS}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total AA</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalAA)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Final Total</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(totalFinalTotal)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Balance</p>
          <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Table */}
      <TechnicalSanctionsTable
        technicalSanctions={filteredTechnicalSanctions}
        works={works} 
        onEdit={handleEdit}
        onDelete={handleDelete}
        isEditMode={isEditMode}
      />

      {/* Modal */}
      {isModalOpen && (
        <TSFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          works={works}
          editingTS={editingTS}
        />
      )}
    </div>
  );
};

export default TechnicalSanctionPage;
