// WorkListPage.tsx - WITH SEARCHABLE GR FILTER
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationContext } from '../contexts/NavigationContext';
import { workService } from '../services/workService';
import { grService } from '../services/grService';
import { spillService } from '../services/spillService';
import WorkTable from '../components/WorkTable';
import WorkFormModal from '../components/WorkFormModal';
import DemoBanner from '../components/DemoBanner';
import type { Work, GR } from '../types/work';

interface WorkListPageProps {
  isEditMode?: boolean;
}

const WorkListPage: React.FC<WorkListPageProps> = ({ isEditMode = false }) => {
  const { isDemoMode } = useAuth();
  const { navigationPath, activeFilters } = useNavigationContext();
  const [searchParams] = useSearchParams();
  const [works, setWorks] = useState<Work[]>([]);
  const [grs, setGRs] = useState<GR[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);

  // Filter states
  const [selectedGR, setSelectedGR] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Track if filters have been initialized
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // ✅ NEW: GR search dropdown states
  const [grSearchQuery, setGrSearchQuery] = useState('');
  const [isGrDropdownOpen, setIsGrDropdownOpen] = useState(false);
  const grDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGRs();
    fetchWorks();
  }, [isDemoMode]);

  // Initialize filters from NavigationContext FIRST, then fall back to URL params
  useEffect(() => {
    if (!loading && grs.length > 0 && !filtersInitialized) {
      // Priority: activeFilters > URL params > navigationPath > default
      const grIdFromFilters = activeFilters.gr_id;
      const grIdFromUrl = searchParams.get('gr') ? parseInt(searchParams.get('gr')!) : null;
      const worksPathItem = navigationPath.find(item => item.name === 'Works');
      const grIdFromPath = worksPathItem?.gr_id;
      
      const grIdToSet = grIdFromFilters || grIdFromUrl || grIdFromPath || null;
      
      if (grIdToSet !== null && grIdToSet !== selectedGR) {
        setSelectedGR(grIdToSet);
      }
      
      setFiltersInitialized(true);
    }
  }, [loading, grs, searchParams, navigationPath, activeFilters, filtersInitialized, selectedGR]);

  // Fetch filtered data when activeFilters change (after initialization)
  useEffect(() => {
    if (filtersInitialized && activeFilters.gr_id) {
      // Refetch works to apply filter if needed
      // Note: The filtering is done client-side, so we just need to ensure data is loaded
      // If backend filtering is needed in the future, call fetchWorks() here
    }
  }, [activeFilters, filtersInitialized]);

  // ✅ NEW: Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (grDropdownRef.current && !grDropdownRef.current.contains(event.target as Node)) {
        setIsGrDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchGRs = async () => {
    try {
      const data = await grService.fetchAllGRs(isDemoMode);
      setGRs(data);
    } catch (error) {
      console.error('Error fetching GRs:', error);
    }
  };

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const data = await workService.fetchAllWorks(isDemoMode);
      setWorks(data);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWork = () => {
    setEditingWork(null);
    setShowModal(true);
  };

  const handleEditWork = (work: Work) => {
    setEditingWork(work);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditingWork(null);
    fetchWorks();
  };

  const handleDeleteWork = async (workId: number) => {
    if (window.confirm('Are you sure you want to delete this work?')) {
      try {
        await workService.deleteWork(workId, isDemoMode);
        fetchWorks();
      } catch (error) {
        console.error('Error deleting work:', error);
      }
    }
  };

  const handleAddSpill = async (workId: number, spillAmount: string) => {
    try {
      const amount = parseFloat(spillAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid spill amount greater than 0');
        return;
      }

      await spillService.createSpill(
        {
          work_id: workId,
          ara: amount,
        },
        isDemoMode
      );
      
      // Refresh works to show the new spill
      fetchWorks();
    } catch (error: any) {
      console.error('Error adding spill:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Failed to add spill. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDeleteSpill = async (spillId: number) => {
    if (window.confirm('Are you sure you want to delete this spill?')) {
      try {
        await spillService.deleteSpill(spillId.toString(), isDemoMode);
        fetchWorks();
      } catch (error) {
        console.error('Error deleting spill:', error);
        alert('Failed to delete spill. Please try again.');
      }
    }
  };

  const handleSubmit = async (workData: Partial<Work>) => {
    try {
      if (editingWork) {
        await workService.updateWork(editingWork.id, workData, isDemoMode);
      } else {
        await workService.createWork(workData, isDemoMode);
      }
      await fetchWorks();
      setShowModal(false);
      setEditingWork(null);
    } catch (error) {
      console.error('Error saving work:', error);
      throw error;
    }
  };

  // ✅ NEW: Filter GRs based on search query
  const filteredGRs = grs.filter((gr) => {
    const searchLower = grSearchQuery.toLowerCase();
    return (
      gr.grNumber.toLowerCase().includes(searchLower) ||
      new Date(gr.grDate).toLocaleDateString().includes(searchLower)
    );
  });

  // ✅ NEW: Handle GR selection
  const handleSelectGR = (grId: number | null) => {
    setSelectedGR(grId);
    setIsGrDropdownOpen(false);
    setGrSearchQuery('');
  };

  // ✅ NEW: Get selected GR display text
  const getSelectedGRText = () => {
    if (!selectedGR) return 'All Works (No Filter)';
    const gr = grs.find((g) => g.id === selectedGR);
    return gr ? `${gr.grNumber} - ${new Date(gr.grDate).toLocaleDateString()}` : 'Select GR';
  };

  // Enhanced filtering logic
  const filteredWorks = works.filter((work) => {
    if (selectedGR && work.gr !== selectedGR) {
      return false;
    }

    if (searchQuery && !work.workName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (startDate || endDate) {
      const workDate = new Date(work.workDate);

      if (startDate) {
        const start = new Date(startDate);
        if (workDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (workDate > end) return false;
      }
    }

    return true;
  });

  // Filter out cancelled works for card statistics (tables still show them)
  const activeFilteredWorks = filteredWorks.filter(work => !work.isCancelled);
  
  // Calculate totals from non-cancelled works only (for cards)
  const totalWorks = activeFilteredWorks.length;
  const totalAA = activeFilteredWorks.reduce((sum, work) => sum + Number(work.AA || 0), 0);
  const totalRA = activeFilteredWorks.reduce((sum, work) => {
    const ra = Number(work.RA || 0);
    const spillsTotal = work.spills?.reduce((spillSum, spill) => spillSum + Number(spill.ARA || 0), 0) || 0;
    return sum + ra + spillsTotal;
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleClearFilters = () => {
    setSelectedGR(null);
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setGrSearchQuery('');
  };

  const hasActiveFilters = selectedGR !== null || searchQuery || startDate || endDate;

  // Show loading spinner until data is loaded AND filters are initialized
  if (loading || !filtersInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">
            {loading ? 'Loading works...' : 'Initializing filters...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemoMode && <DemoBanner />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Management</h1>
          <p className="text-gray-600">
            {selectedGR
              ? `Showing works for GR: ${grs.find((gr) => gr.id === selectedGR)?.grNumber || selectedGR}`
              : 'Comprehensive view of all government works with expandable details'}
          </p>
        </div>
        {isEditMode && (
          <button
            onClick={handleAddWork}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <span className="text-xl">+</span>
            <span>Add New Work</span>
          </button>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ✅ ENHANCED: Searchable GR Filter */}
          <div ref={grDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by GR
            </label>
            
            {/* Custom Dropdown Button */}
            <button
              type="button"
              onClick={() => setIsGrDropdownOpen(!isGrDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
            >
              <span className={selectedGR ? 'text-gray-900' : 'text-gray-500'}>
                {getSelectedGRText()}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isGrDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isGrDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={grSearchQuery}
                      onChange={(e) => setGrSearchQuery(e.target.value)}
                      placeholder="Search GR number or date..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="max-h-60 overflow-y-auto">
                  {/* "All Works" Option */}
                  <div
                    onClick={() => handleSelectGR(null)}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                      selectedGR === null ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                    }`}
                  >
                    All Works (No Filter)
                  </div>

                  {/* Filtered GR Options */}
                  {filteredGRs.length > 0 ? (
                    filteredGRs.map((gr) => (
                      <div
                        key={gr.id}
                        onClick={() => handleSelectGR(gr.id)}
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                          selectedGR === gr.id ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{gr.grNumber}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(gr.grDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No GRs found matching "{grSearchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search by Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Work Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by work name..."
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

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {filteredWorks.length} of {works.length} works shown
            </span>
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <X className="w-4 h-4" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Works</div>
          <div className="text-3xl font-bold text-gray-900">{totalWorks}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total AA</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalAA)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total RA</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalRA)}</div>
        </div>
      </div>

      {/* WorkTable */}
      <WorkTable
        works={filteredWorks}
        isEditMode={isEditMode}
        onEdit={handleEditWork}
        onUpdate={() => fetchWorks()}
        onDeleteSpill={handleDeleteSpill}
        onAddSpill={handleAddSpill}
        grs={grs}
      />

      {/* Add/Edit Work Modal */}
      {showModal && (
        <WorkFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingWork(null);
          }}
          onSuccess={handleSuccess}
          onSubmit={handleSubmit}
          onDelete={handleDeleteWork}
          grs={grs}
          editingWork={editingWork}
        />
      )}
    </div>
  );
};

export default WorkListPage;
