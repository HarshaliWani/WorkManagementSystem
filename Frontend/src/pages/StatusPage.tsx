import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, ClipboardCheck, Gavel, Receipt, CheckCircle2, Clock, AlertCircle, RefreshCw, ChevronDown, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationContext } from '../contexts/NavigationContext';
import { statusService, StatusData } from '../services/statusService';
import { grService } from '../services/grService';
import DemoBanner from '../components/DemoBanner';
import { OverallStatsCards } from '../components/OverallStatsCards';
import { WorksProgressCards } from '../components/WorksProgressCards';
import { WorksProgressBar } from '../components/WorksProgressBar';
import { StatusSection } from '../components/StatusSection';
import type { GR } from '../types/work';

const StatusPage: React.FC<{ isEditMode?: boolean }> = ({ isEditMode = false }) => {
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const { activeFilters, updateFilters, setNavigationPath } = useNavigationContext();
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grs, setGrs] = useState<GR[]>([]);
  
  // GR filter dropdown states
  const [selectedGR, setSelectedGR] = useState<number | null>(null);
  const [grSearchQuery, setGrSearchQuery] = useState('');
  const [isGrDropdownOpen, setIsGrDropdownOpen] = useState(false);
  const grDropdownRef = useRef<HTMLDivElement>(null);

  // Get GR filter from navigation context or local state
  const grFilter = selectedGR !== null ? selectedGR : (activeFilters?.gr_id ? parseInt(activeFilters.gr_id.toString(), 10) : undefined);

  // Fetch GRs on mount
  useEffect(() => {
    fetchGRs();
  }, [isDemoMode]);

  // Set navigation path on mount or when grFilter changes
  useEffect(() => {
    const path = grFilter
      ? [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, gr_id: grFilter }]
      : [{ name: 'Dashboard', id: null }, { name: 'Status', id: null }];
    setNavigationPath(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grFilter]); // setNavigationPath is stable, so we can exclude it from deps

  // Initialize GR filter from navigation context
  useEffect(() => {
    if (grs.length > 0 && selectedGR === null && activeFilters?.gr_id) {
      setSelectedGR(activeFilters.gr_id);
    }
  }, [grs, activeFilters, selectedGR]);

  // Fetch status data when filters change
  useEffect(() => {
    fetchStatusData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, grFilter]);

  // Close dropdown when clicking outside
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
      const grsData = await grService.fetchAllGRs(isDemoMode);
      setGrs(grsData);
    } catch (err) {
      console.error('Error fetching GRs:', err);
    }
  };

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = grFilter ? { gr: grFilter } : undefined;
      const data = await statusService.fetchStatus(isDemoMode, params);
      setStatusData(data);
    } catch (err: any) {
      console.error('Error fetching status data:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to load status data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = (): number => {
    if (!statusData) return 0;
    const { active_works, works_status } = statusData;
    if (active_works === 0) return 0;
    const completed = works_status.completed || 0;
    return Math.round((completed / active_works) * 100);
  };

  const handleSelectGR = (grId: number | null) => {
    setSelectedGR(grId);
    setIsGrDropdownOpen(false);
    setGrSearchQuery('');
    const path = grId
      ? [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, gr_id: grId }]
      : [{ name: 'Dashboard', id: null }, { name: 'Status', id: null }];
    setNavigationPath(path);
    if (grId !== null) {
      updateFilters({ gr_id: grId });
    } else {
      updateFilters({ gr_id: null });
    }
  };

  const getSelectedGRText = () => {
    if (!selectedGR) return 'All GRs (No Filter)';
    const gr = grs.find((g) => g.id === selectedGR);
    return gr ? gr.grNumber : 'Select GR';
  };

  const filteredGRs = grs.filter((gr) => {
    const searchLower = grSearchQuery.toLowerCase();
    return gr.grNumber.toLowerCase().includes(searchLower);
  });

  // Handle card clicks for navigation with proper hierarchy
  const handleCardClick = (type: string, filterKey: string, filterValue?: any) => {
    const filters: any = {};
    const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null }];
    
    if (grFilter) {
      filters.gr_id = grFilter;
      path[1] = { ...path[1], gr_id: grFilter };
    }

    if (type === 'tenders') {
      // Build navigation path: Dashboard > Status > Tenders
      const tendersPath = [...path, { name: 'Tenders', id: null, gr_id: grFilter || undefined }];
      setNavigationPath(tendersPath);

      // Build query parameters for URL
      const params = new URLSearchParams();
      if (grFilter) params.set('gr', grFilter.toString());
      if (filterKey === 'tenders_awarded') {
        filters.work_order_tick = true;
      }

      // Update filters and navigate with query parameters
      updateFilters(filters);
      navigate(`/tenders${params.toString() ? `?${params.toString()}` : ''}`);
    } else if (type === 'bills') {
      // Build navigation path: Dashboard > Status > Bills
      const billsPath = [...path, { name: 'Bills', id: null, gr_id: grFilter || undefined }];
      setNavigationPath(billsPath);

      // Build query parameters for URL
      const params = new URLSearchParams();
      if (grFilter) params.set('gr', grFilter.toString());
      if (filterKey === 'bills_pending') {
        filters.payment_done_from_gr = null;
      } else if (filterKey === 'payment_completed') {
        filters.payment_done_from_gr = 'not_null';
      }

      // Update filters and navigate with query parameters
      updateFilters(filters);
      navigate(`/bills${params.toString() ? `?${params.toString()}` : ''}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading status dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {isDemoMode && <DemoBanner />}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Workflow Status Dashboard</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchStatusData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="space-y-6">
        {isDemoMode && <DemoBanner />}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Workflow Status Dashboard</h1>
        </div>
        <div className="text-gray-600">No status data available</div>
      </div>
    );
  }

  const { 
    total_grs = 0, 
    active_works = 0, 
    technical_sanctions = 0, 
    tenders = 0, 
    bills = 0,
    works_status = {},
    ts_status = {},
    tenders_status = {},
    bills_status = {}
  } = statusData || {};

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemoMode && <DemoBanner />}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Workflow Status Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive overview of workflow progress and statistics
          {grFilter && <span className="ml-2 text-blue-600">(Filtered by GR)</span>}
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* GR Filter Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by GR
            </label>
            <div className="relative" ref={grDropdownRef}>
              <button
                onClick={() => setIsGrDropdownOpen(!isGrDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-sm text-gray-700">{getSelectedGRText()}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isGrDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {isGrDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={grSearchQuery}
                        onChange={(e) => setGrSearchQuery(e.target.value)}
                        placeholder="Search GR..."
                        className="w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {grSearchQuery && (
                        <button
                          onClick={() => setGrSearchQuery('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="max-h-48 overflow-y-auto">
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
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{gr.grNumber}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(gr.grDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No GRs found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Demo Mode Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              {isDemoMode ? 'Demo Mode' : 'Production Mode'}
            </span>
            <div className={`w-3 h-3 rounded-full ${isDemoMode ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchStatusData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full md:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Row 1: Overall Stats Cards */}
      <OverallStatsCards
        total_grs={total_grs}
        active_works={active_works}
        technical_sanctions={technical_sanctions}
        tenders={tenders}
        bills={bills}
        completionPercentage={completionPercentage}
      />

      {/* Row 2: Works Progress Visualization */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Works Progress</h2>
        <WorksProgressBar works_status={works_status} active_works={active_works} />
        <WorksProgressCards
          works_status={works_status}
          active_works={active_works}
          tenders={tenders}
          bills={bills}
          onCardClick={handleCardClick}
          grFilter={grFilter}
          onContextMenu={(type, filterKey) => {
            const menuItems = [];
            
            if (type === 'tenders') {
              menuItems.push({
                label: `View All ${filterKey === 'tenders_open' ? 'Open' : 'Awarded'} Tenders`,
                onClick: () => handleCardClick(type, filterKey),
              });
              if (grFilter) {
                menuItems.push({
                  label: `View GR Details`,
                  onClick: () => {
                    const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, gr_id: grFilter }, { name: 'Works', id: null, gr_id: grFilter }];
                    setNavigationPath(path);
                    updateFilters({ gr_id: grFilter });
                    navigate(`/works?gr=${grFilter}`);
                  },
                });
              }
              menuItems.push({
                label: 'View All Tenders',
                onClick: () => {
                  const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null }, { name: 'Tenders', id: null }];
                  setNavigationPath(path);
                  const filters = grFilter ? { gr_id: grFilter } : {};
                  updateFilters(filters);
                  navigate(grFilter ? `/tenders?gr=${grFilter}` : '/tenders');
                },
              });
            } else if (type === 'bills') {
              menuItems.push({
                label: `View ${filterKey === 'bills_pending' ? 'Pending' : 'Completed'} Bills`,
                onClick: () => handleCardClick(type, filterKey),
              });
              if (grFilter) {
                menuItems.push({
                  label: `View GR Details`,
                  onClick: () => {
                    const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, gr_id: grFilter }, { name: 'Works', id: null, gr_id: grFilter }];
                    setNavigationPath(path);
                    updateFilters({ gr_id: grFilter });
                    navigate(`/works?gr=${grFilter}`);
                  },
                });
              }
              menuItems.push({
                label: 'View All Bills',
                onClick: () => {
                  const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null }, { name: 'Bills', id: null }];
                  setNavigationPath(path);
                  const filters = grFilter ? { gr_id: grFilter } : {};
                  updateFilters(filters);
                  navigate(grFilter ? `/bills?gr=${grFilter}` : '/bills');
                },
              });
            }
            
            return menuItems;
          }}
        />
      </div>

      {/* Row 3: Detailed Status Sections */}
      <div className="space-y-4">
        <StatusSection
          title="Technical Sanctions Status"
          icon={ClipboardCheck}
          iconColor="text-purple-600"
          statusData={ts_status}
          total={technical_sanctions}
          items={[
            { key: 'noting_stage', label: 'Noting Stage', color: 'pending', icon: Clock },
            { key: 'ordering_stage', label: 'Ordering Stage', color: 'info', icon: CheckCircle2 },
          ]}
        />

        <StatusSection
          title="Tenders Status"
          icon={Gavel}
          iconColor="text-indigo-600"
          statusData={tenders_status}
          total={tenders}
          items={[
            { key: 'online_pending', label: 'Online Pending', color: 'stalled', icon: AlertCircle, clickable: false },
            { key: 'technical_verification', label: 'Tech Verification', color: 'pending', icon: Clock, clickable: false },
            { key: 'financial_verification', label: 'Financial Verification', color: 'pending', icon: Clock, clickable: false },
            { key: 'loa_issued', label: 'LOA Issued', color: 'info', icon: CheckCircle2, clickable: false },
            { 
              key: 'work_order_issued', 
              label: 'Work Order Issued', 
              color: 'good', 
              icon: CheckCircle2,
              clickable: true,
              navigateTo: 'tenders',
              filterKey: 'work_order_tick',
              filterValue: true,
            },
          ]}
          onItemClick={(navigateTo, filterKey, filterValue) => {
            const filters: any = {};
            if (grFilter) filters.gr_id = grFilter;
            if (filterKey === 'work_order_tick') {
              filters.work_order_tick = true;
            }
            const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, ...(grFilter ? { gr_id: grFilter } : {}) }, { name: 'Tenders', id: null, ...(grFilter ? { gr_id: grFilter } : {}) }];
            setNavigationPath(path);
            updateFilters(filters);
            const params = new URLSearchParams();
            if (grFilter) params.set('gr', grFilter.toString());
            navigate(`/${navigateTo}${params.toString() ? `?${params.toString()}` : ''}`);
          }}
          onContextMenu={(navigateTo, filterKey, filterValue) => {
            const menuItems = [];
            menuItems.push({
              label: `View ${filterKey === 'work_order_tick' ? 'Work Orders Issued' : 'All'} Tenders`,
              onClick: () => {
                const filters: any = {};
                if (grFilter) filters.gr_id = grFilter;
                if (filterKey === 'work_order_tick') {
                  filters.work_order_tick = true;
                }
                const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, ...(grFilter ? { gr_id: grFilter } : {}) }, { name: 'Tenders', id: null, ...(grFilter ? { gr_id: grFilter } : {}) }];
                setNavigationPath(path);
                updateFilters(filters);
                const params = new URLSearchParams();
                if (grFilter) params.set('gr', grFilter.toString());
                navigate(`/${navigateTo}${params.toString() ? `?${params.toString()}` : ''}`);
              },
            });
            if (grFilter) {
              menuItems.push({
                label: 'View GR Details',
                onClick: () => {
                  const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, gr_id: grFilter }, { name: 'Works', id: null, gr_id: grFilter }];
                  setNavigationPath(path);
                  updateFilters({ gr_id: grFilter });
                  navigate(`/works?gr=${grFilter}`);
                },
              });
            }
            menuItems.push({
              label: 'View All Tenders',
              onClick: () => {
                const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null }, { name: 'Tenders', id: null }];
                setNavigationPath(path);
                const filters = grFilter ? { gr_id: grFilter } : {};
                updateFilters(filters);
                navigate(grFilter ? `/tenders?gr=${grFilter}` : '/tenders');
              },
            });
            return menuItems;
          }}
        />

        <StatusSection
          title="Bills Status"
          icon={Receipt}
          iconColor="text-orange-600"
          statusData={bills_status}
          total={bills}
          onItemClick={(navigateTo, filterKey, filterValue) => {
            const filters: any = {};
            if (grFilter) filters.gr_id = grFilter;
            if (filterKey === 'payment_done_from_gr') {
              if (filterValue === null) {
                filters.payment_done_from_gr = null;
              } else {
                filters.payment_done_from_gr = 'not_null';
              }
            }
            const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, ...(grFilter ? { gr_id: grFilter } : {}) }, { name: 'Bills', id: null, ...(grFilter ? { gr_id: grFilter } : {}) }];
            setNavigationPath(path);
            updateFilters(filters);
            const params = new URLSearchParams();
            if (grFilter) params.set('gr', grFilter.toString());
            navigate(`/${navigateTo}${params.toString() ? `?${params.toString()}` : ''}`);
          }}
          onContextMenu={(navigateTo, filterKey, filterValue) => {
            const menuItems = [];
            menuItems.push({
              label: `View ${filterKey === 'payment_done_from_gr' && filterValue === null ? 'Pending' : 'Completed'} Bills`,
              onClick: () => {
                const filters: any = {};
                if (grFilter) filters.gr_id = grFilter;
                if (filterKey === 'payment_done_from_gr') {
                  if (filterValue === null) {
                    filters.payment_done_from_gr = null;
                  } else {
                    filters.payment_done_from_gr = 'not_null';
                  }
                }
                const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, ...(grFilter ? { gr_id: grFilter } : {}) }, { name: 'Bills', id: null, ...(grFilter ? { gr_id: grFilter } : {}) }];
                setNavigationPath(path);
                updateFilters(filters);
                const params = new URLSearchParams();
                if (grFilter) params.set('gr', grFilter.toString());
                navigate(`/${navigateTo}${params.toString() ? `?${params.toString()}` : ''}`);
              },
            });
            if (grFilter) {
              menuItems.push({
                label: 'View GR Details',
                onClick: () => {
                  const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null, gr_id: grFilter }, { name: 'Works', id: null, gr_id: grFilter }];
                  setNavigationPath(path);
                  updateFilters({ gr_id: grFilter });
                  navigate(`/works?gr=${grFilter}`);
                },
              });
            }
            menuItems.push({
              label: 'View All Bills',
              onClick: () => {
                const path = [{ name: 'Dashboard', id: null }, { name: 'Status', id: null }, { name: 'Bills', id: null }];
                setNavigationPath(path);
                const filters = grFilter ? { gr_id: grFilter } : {};
                updateFilters(filters);
                navigate(grFilter ? `/bills?gr=${grFilter}` : '/bills');
              },
            });
            return menuItems;
          }}
          items={[
            { 
              key: 'pending_payment', 
              label: 'Pending Payment', 
              color: 'pending', 
              icon: Clock,
              clickable: true,
              navigateTo: 'bills',
              filterKey: 'payment_done_from_gr',
              filterValue: null,
            },
            { 
              key: 'payment_completed', 
              label: 'Payment Completed', 
              color: 'good', 
              icon: CheckCircle2,
              clickable: true,
              navigateTo: 'bills',
              filterKey: 'payment_done_from_gr',
              filterValue: 'not_null',
            },
          ]}
        />
      </div>
    </div>
  );
};

export default StatusPage;

