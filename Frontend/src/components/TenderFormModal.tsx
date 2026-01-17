// src/components/TenderFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown, Upload, FileText } from 'lucide-react';
import { tenderService } from '../services/tenderService';
import { grService } from '../services/grService';
import { technicalSanctionService } from '../services/technicalSanctionService';
import { useAuth } from '../contexts/AuthContext';
import { Work } from '../types/work';
import { GR } from '../types/work';
import { TechnicalSanction } from '../services/technicalSanctionService';
import { Tender } from '../pages/TendersPage';

interface TenderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  works: Work[];
  editingTender?: Tender | null;
}

const TenderFormModal: React.FC<TenderFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  works,
  editingTender = null
}) => {
  const { isDemoMode } = useAuth();
  const [formData, setFormData] = useState({
    gr: '',
    work: '',
    technical_sanction: '',
    tender_id: '',
    agency_name: '',
    date: '',
    online: false,
    offline: false,
    online_date: '',
    offline_date: '',
    technical_verification: false,
    technical_verification_date: '',
    financial_verification: false,
    financial_verification_date: '',
    loa: false,
    loa_date: '',
    work_order_tick: false,
    work_order_tick_date: '',
    emd_supporting: false,
    supporting_date: '',
    emd_awarded: false,
    awarded_date: '',
    work_order: false,
    work_order_date: '',

  });

  const [grs, setGrs] = useState<GR[]>([]);
  const [technicalSanctions, setTechnicalSanctions] = useState<TechnicalSanction[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown states
  const [grSearchQuery, setGrSearchQuery] = useState('');
  const [isGrDropdownOpen, setIsGrDropdownOpen] = useState(false);
  const grDropdownRef = useRef<HTMLDivElement>(null);

  const [workSearchQuery, setWorkSearchQuery] = useState('');
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = useState(false);
  const workDropdownRef = useRef<HTMLDivElement>(null);

  const [tsSearchQuery, setTsSearchQuery] = useState('');
  const [isTsDropdownOpen, setIsTsDropdownOpen] = useState(false);
  const tsDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch GRs on mount
  useEffect(() => {
    if (isOpen) {
      fetchGRs();
    }
  }, [isOpen]);

  // Fetch works when GR is selected
  useEffect(() => {
    if (formData.gr && isOpen) {
      fetchWorks();
    }
  }, [formData.gr, isOpen]);

  // Fetch all technical sanctions when modal opens (for searching by TS subname)
  useEffect(() => {
    if (isOpen) {
      fetchAllTechnicalSanctions();
    }
  }, [isOpen]);

  // Fetch technical sanctions when work is selected (for filtering)
  useEffect(() => {
    if (formData.work && isOpen) {
      fetchTechnicalSanctionsForWork(formData.work);
    } else if (!formData.work && isOpen) {
      // If work is cleared, fetch all TS
      fetchAllTechnicalSanctions();
    }
  }, [formData.work, isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (grDropdownRef.current && !grDropdownRef.current.contains(event.target as Node)) {
        setIsGrDropdownOpen(false);
      }
      if (workDropdownRef.current && !workDropdownRef.current.contains(event.target as Node)) {
        setIsWorkDropdownOpen(false);
      }
      if (tsDropdownRef.current && !tsDropdownRef.current.contains(event.target as Node)) {
        setIsTsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-fill dates when checkboxes are checked
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (formData.online && !formData.online_date) {
      setFormData(prev => ({ ...prev, online_date: today }));
    }
    if (formData.offline && !formData.offline_date) {
      setFormData(prev => ({ ...prev, offline_date: today }));
    }
    if (formData.technical_verification && !formData.technical_verification_date) {
      setFormData(prev => ({ ...prev, technical_verification_date: today }));
    }
    if (formData.financial_verification && !formData.financial_verification_date) {
      setFormData(prev => ({ ...prev, financial_verification_date: today }));
    }
    if (formData.loa && !formData.loa_date) {
      setFormData(prev => ({ ...prev, loa_date: today }));
    }
    if (formData.work_order && !formData.work_order_date) {
      setFormData(prev => ({ ...prev, work_order_date: today }));
    }
    if (formData.work_order_tick && !formData.work_order_tick_date) {
      setFormData(prev => ({ ...prev, work_order_tick_date: today }));
    }
    if (formData.emd_supporting && !formData.supporting_date) {
      setFormData(prev => ({ ...prev, supporting_date: today }));
    }
    if (formData.emd_awarded && !formData.awarded_date) {
      setFormData(prev => ({ ...prev, awarded_date: today }));
    }
  }, [formData.online, formData.offline, formData.technical_verification, formData.financial_verification, formData.loa, formData.work_order, formData.work_order_tick, formData.emd_supporting, formData.emd_awarded]);

  const fetchGRs = async () => {
    try {
      const data = await grService.fetchAllGRs(isDemoMode);
      setGrs(data);
    } catch (error) {
      console.error('Error fetching GRs:', error);
    }
  };

  const fetchWorks = async () => {
    try {
      // Works are already available from props, no need to fetch again
      // The filtering happens in the filteredWorks computed value
    } catch (error) {
      console.error('Error fetching works:', error);
    }
  };

  const fetchAllTechnicalSanctions = async () => {
    try {
      const data = await technicalSanctionService.fetchAllTechnicalSanctions(isDemoMode);
      setTechnicalSanctions(data);
    } catch (error) {
      console.error('Error fetching all technical sanctions:', error);
      setTechnicalSanctions([]);
    }
  };

  const fetchTechnicalSanctionsForWork = async (workId: string) => {
    try {
      // Fetch technical sanctions for the specific work
      const workTSData = await technicalSanctionService.fetchTechnicalSanctionsByWork(workId, isDemoMode);
      
      // Ensure we have an array - DRF returns array directly when no pagination
      const tsArray = Array.isArray(workTSData) ? workTSData : (workTSData?.results || []);
      
      setTechnicalSanctions(tsArray);
    } catch (error: any) {
      console.error('Error fetching technical sanctions for work:', error);
      console.error('Error details:', error.response?.data || error.message);
      setTechnicalSanctions([]);
    }
  };

  // Initialize form when editing
  useEffect(() => {
    if (editingTender && isOpen) {
      // Find work and GR from editingTender
      const work = works.find(w => w.id === editingTender.workId);
      const grId = work?.gr;
      
      setFormData({
        gr: grId?.toString() || '',
        work: editingTender.workId?.toString() || '',
        technical_sanction: editingTender.technicalSanctionId?.toString() || '',
        tender_id: editingTender.tenderNumber || '',
        agency_name: editingTender.tenderName || '',
        date: editingTender.openingDate?.split('T')[0] || '',
        online: editingTender.Online || false,
        offline: editingTender.Offline || false, 
        online_date: editingTender.onlineDate?.split('T')[0] || '',
        offline_date: editingTender.offlineDate?.split('T')[0] || '',
        technical_verification: !!editingTender.technicalVerification,
        technical_verification_date: editingTender.technicalVerificationDate?.split('T')[0] || '',
        financial_verification: editingTender.financialVerification || false,
        financial_verification_date: editingTender.financialVerificationDate?.split('T')[0] || '',
        loa: editingTender.loa || false,
        loa_date: editingTender.loaDate?.split('T')[0] || '',
        work_order: !!editingTender.workOrderUrl,
        work_order_date: '',
        work_order_tick: editingTender.workOrderTick || false,
        work_order_tick_date: editingTender.workOrderTickDate?.split('T')[0] || '',
        emd_supporting: editingTender.emdSupporting || false,
        supporting_date: editingTender.supportingDate?.split('T')[0] || '',
        emd_awarded: editingTender.emdAwarded || false,
        awarded_date: editingTender.awardedDate?.split('T')[0] || '',
      });
      
      // Fetch technical sanctions for the work
      if (editingTender.workId) {
        fetchTechnicalSanctionsForWork(editingTender.workId.toString());
      }
    } else if (!editingTender && isOpen) {
      // Reset form for new entry
      setFormData({
        gr: '',
        work: '',
        technical_sanction: '',
        tender_id: '',
        agency_name: '',
        date: '',
        online: false,
        offline: false,
        online_date: '',
        offline_date: '',
        technical_verification: false,
        technical_verification_date: '',
        financial_verification: false,
        financial_verification_date: '',
        loa: false,
        loa_date: '',
        work_order: false,
        work_order_date: '',
        work_order_tick: false,
        work_order_tick_date: '',
        emd_supporting: false,
        supporting_date: '',
        emd_awarded: false,
        awarded_date: '',
      });
      setFile(null);
      setTechnicalSanctions([]);
    }
  }, [editingTender, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Only PDF files are allowed');
        setFile(null);
      }
    }
  };

  // Filter functions
  const filteredGRs = grs.filter((gr) => {
    const searchLower = grSearchQuery.toLowerCase();
    return gr.grNumber.toLowerCase().includes(searchLower);
  });

  const filteredWorks = works.filter((work) => {
    const matchesGR = !formData.gr || work.gr === parseInt(formData.gr);
    const matchesSearch = work.workName.toLowerCase().includes(workSearchQuery.toLowerCase());
    return matchesGR && matchesSearch;
  });

  const filteredTechnicalSanctions = technicalSanctions.filter((ts) => {
    const searchLower = tsSearchQuery.toLowerCase();
    const matchesSearch = (ts.subName || '').toLowerCase().includes(searchLower) || 
                         ts.id.toString().includes(searchLower);
    // If work is selected, filter by work; otherwise show all
    // Handle both number and string comparisons
    const tsWorkId = typeof ts.work === 'number' ? ts.work : parseInt(ts.work);
    const formWorkId = parseInt(formData.work);
    const matchesWork = !formData.work || tsWorkId === formWorkId;
    return matchesSearch && matchesWork;
  });

  // Get display text functions
  const getSelectedGRText = () => {
    if (!formData.gr) return 'Select GR';
    const gr = grs.find((g) => g.id === parseInt(formData.gr));
    return gr ? `${gr.grNumber} - ${new Date(gr.grDate).toLocaleDateString()}` : 'Select GR';
  };

  const getSelectedWorkText = () => {
    if (!formData.work) return 'Select Work';
    const work = works.find((w) => w.id === parseInt(formData.work));
    return work ? work.workName : 'Select Work';
  };

   const getSelectedTSText = () => {
     if (!formData.technical_sanction) return 'Select TS Sub Name';
     const ts = technicalSanctions.find((t) => t.id === parseInt(formData.technical_sanction));
     return ts ? ts.subName : 'Select TS Sub Name';
   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('tender_id', formData.tender_id);
      submitData.append('agency_name', formData.agency_name);
      if (formData.date) {
        submitData.append('date', formData.date);
      }
      
      if (!editingTender) {
        submitData.append('work', formData.work);
      }
      
       // Technical sanction is required
       if (!formData.technical_sanction) {
         setError('Please select a Technical Sanction Sub Name');
         setLoading(false);
         return;
       }
       submitData.append('technical_sanction', formData.technical_sanction);

      // Handle online/offline - send separately
      submitData.append('online', formData.online.toString());
      if (formData.online && formData.online_date) {
        submitData.append('online_date', formData.online_date);
      }
      
      submitData.append('offline', formData.offline.toString());
      if (formData.offline && formData.offline_date) {
        submitData.append('offline_date', formData.offline_date);
      }

      submitData.append('technical_verification', formData.technical_verification.toString());
      if (formData.technical_verification && formData.technical_verification_date) {
        submitData.append('technical_verification_date', formData.technical_verification_date);
      }

      submitData.append('financial_verification', formData.financial_verification.toString());
      if (formData.financial_verification && formData.financial_verification_date) {
        submitData.append('financial_verification_date', formData.financial_verification_date);
      }

      submitData.append('loa', formData.loa.toString());
      if (formData.loa && formData.loa_date) {
        submitData.append('loa_date', formData.loa_date);
      }
      submitData.append('work_order_tick', formData.work_order_tick.toString());
      if (formData.work_order_tick && formData.work_order_tick_date) {
        submitData.append('work_order_tick_date', formData.work_order_tick_date);
      }
      submitData.append('emd_supporting', formData.emd_supporting.toString());
      if (formData.emd_supporting && formData.supporting_date) {
        submitData.append('supporting_date', formData.supporting_date);
      }
      submitData.append('emd_awarded', formData.emd_awarded.toString());
      if (formData.emd_awarded && formData.awarded_date) {
        submitData.append('awarded_date', formData.awarded_date);
      }

      // Work order file upload
      if (file) {
        submitData.append('work_order', file);
      } else if (formData.work_order && editingTender && editingTender.workOrderUrl) {
        // If work_order is checked but no new file, keep existing file (backend will handle this)
        // We don't need to send anything if file already exists and no new file is selected
      }

      if (editingTender) {
        await tenderService.updateTender(editingTender.id.toString(), submitData as any, isDemoMode);
      } else {
        await tenderService.createTender(submitData as any, isDemoMode);
      }

      await onSubmit();
      onClose();
    } catch (err: any) {
      console.error('Error saving tender:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save tender');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingTender ? 'Edit Tender' : 'Add Tender'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* GR Selection - Searchable Dropdown */}
          {!editingTender && (
            <div ref={grDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select GR <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsGrDropdownOpen(!isGrDropdownOpen)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={formData.gr ? 'text-gray-900' : 'text-gray-500'}>
                  {getSelectedGRText()}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isGrDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {isGrDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
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
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredGRs.length > 0 ? (
                      filteredGRs.map((gr) => (
                        <div
                          key={gr.id}
                          onClick={() => {
                            setFormData({ ...formData, gr: gr.id.toString(), work: '', technical_sanction: '' });
                            setIsGrDropdownOpen(false);
                            setGrSearchQuery('');
                            // Clear TS list when GR changes (work will be cleared)
                            setTechnicalSanctions([]);
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                            formData.gr === gr.id.toString() ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
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
          )}

          {/* Work Selection - Searchable Dropdown */}
          {!editingTender && (
            <div ref={workDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Work <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsWorkDropdownOpen(!isWorkDropdownOpen)}
                disabled={loading || !formData.gr}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={formData.work ? 'text-gray-900' : 'text-gray-500'}>
                  {getSelectedWorkText()}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isWorkDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {isWorkDropdownOpen && formData.gr && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={workSearchQuery}
                        onChange={(e) => setWorkSearchQuery(e.target.value)}
                        placeholder="Search work name..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredWorks.length > 0 ? (
                      filteredWorks.map((work) => {
                        const isCancelled = work.isCancelled || false;
                        return (
                          <div
                            key={work.id}
                            onClick={() => {
                              if (isCancelled) return;
                              // Auto-fill GR when work is selected
                              const newWorkId = work.id.toString();
                              setFormData({ 
                                ...formData, 
                                gr: work.gr.toString(),
                                work: newWorkId, 
                                technical_sanction: '' // Clear TS selection when work changes
                              });
                              setIsWorkDropdownOpen(false);
                              setWorkSearchQuery('');
                              // Clear TS list first, then fetch for the selected work
                              setTechnicalSanctions([]);
                              // Fetch technical sanctions for the selected work
                              // The useEffect will also trigger, but calling it here ensures immediate update
                              fetchTechnicalSanctionsForWork(newWorkId);
                            }}
                            className={`px-4 py-2 ${
                              isCancelled 
                                ? 'cursor-not-allowed opacity-50 bg-gray-50' 
                                : 'cursor-pointer hover:bg-blue-50'
                            } ${
                              formData.work === work.id.toString() ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                            }`}
                            title={isCancelled ? 'This work has been cancelled. Create a new work for further processing.' : undefined}
                          >
                            <div className="flex items-center gap-2">
                              <span>{work.workName}</span>
                              {isCancelled && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No works found matching "{workSearchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

           {/* TS Sub Name Selection - Searchable Dropdown */}
           <div ref={tsDropdownRef} className="relative">
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Select TS Sub Name <span className="text-red-500">*</span>
             </label>
            <button
              type="button"
              onClick={() => setIsTsDropdownOpen(!isTsDropdownOpen)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={formData.technical_sanction ? 'text-gray-900' : 'text-gray-500'}>
                {getSelectedTSText()}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isTsDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isTsDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={tsSearchQuery}
                      onChange={(e) => setTsSearchQuery(e.target.value)}
                      placeholder="Search TS sub name..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>
                 <div className="max-h-60 overflow-y-auto">
                   {filteredTechnicalSanctions.length > 0 ? (
                    filteredTechnicalSanctions.map((ts) => {
                      // Find the work and GR for this TS
                      const tsWork = works.find(w => w.id === ts.work);
                      const tsGR = tsWork ? grs.find(g => g.id === tsWork.gr) : null;
                      
                      return (
                        <div
                          key={ts.id}
                          onClick={() => {
                            // Auto-fill GR and Work when TS is selected
                            if (tsWork && tsGR) {
                              setFormData({ 
                                ...formData, 
                                gr: tsGR.id.toString(),
                                work: tsWork.id.toString(),
                                technical_sanction: ts.id.toString() 
                              });
                            } else {
                              setFormData({ ...formData, technical_sanction: ts.id.toString() });
                            }
                            setIsTsDropdownOpen(false);
                            setTsSearchQuery('');
                            // When TS is selected and work is auto-filled, fetch TS for that work
                            if (tsWork) {
                              fetchTechnicalSanctionsForWork(tsWork.id.toString());
                            }
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                            formData.technical_sanction === ts.id.toString() ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{ts.subName || `TS #${ts.id}`}</span>
                            {tsWork && (
                              <span className="text-xs text-gray-500 ml-2">
                                {tsWork.workName}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      {tsSearchQuery ? `No TS found matching "${tsSearchQuery}"` : 'No technical sanctions available'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tender ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.tender_id}
              onChange={(e) => setFormData({ ...formData, tender_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!!editingTender}
              placeholder="Enter tender ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agency Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.agency_name}
              onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter agency name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tender Stages with Dates */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-gray-900 text-lg">Tender Stages</h3>
            
            {/* Online */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="online"
                  checked={formData.online}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      online: e.target.checked,
                      offline: e.target.checked ? false : formData.offline
                    });
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="online" className="text-sm font-medium text-gray-700">
                  Online
                </label>
              </div>
              {formData.online && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Online Date
                  </label>
                  <input
                    type="date"
                    value={formData.online_date}
                    onChange={(e) => setFormData({ ...formData, online_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fill with today's date
                  </p>
                </div>
              )}
            </div>

            {/* Offline */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
              <input
                type="checkbox"
                  id="offline"
                  checked={formData.offline}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      offline: e.target.checked,
                      online: e.target.checked ? false : formData.online
                    });
                  }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
                <label htmlFor="offline" className="text-sm font-medium text-gray-700">
                  Offline
                </label>
              </div>
              {formData.offline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offline Date
            </label>
                  <input
                    type="date"
                    value={formData.offline_date}
                    onChange={(e) => setFormData({ ...formData, offline_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fill with today's date
                  </p>
                </div>
              )}
            </div>

            {/* Technical Verification */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
              <input
                type="checkbox"
                  id="technical_verification"
                checked={formData.technical_verification}
                onChange={(e) => setFormData({ ...formData, technical_verification: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
                <label htmlFor="technical_verification" className="text-sm font-medium text-gray-700">
                  Technical Verification
                </label>
              </div>
              {formData.technical_verification && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technical Verification Date
            </label>
                  <input
                    type="date"
                    value={formData.technical_verification_date}
                    onChange={(e) => setFormData({ ...formData, technical_verification_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fill with today's date
                  </p>
                </div>
              )}
            </div>

            {/* Financial Verification */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
              <input
                type="checkbox"
                  id="financial_verification"
                checked={formData.financial_verification}
                onChange={(e) => setFormData({ ...formData, financial_verification: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
                <label htmlFor="financial_verification" className="text-sm font-medium text-gray-700">
                  Financial Verification
                </label>
              </div>
              {formData.financial_verification && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Financial Verification Date
            </label>
                  <input
                    type="date"
                    value={formData.financial_verification_date}
                    onChange={(e) => setFormData({ ...formData, financial_verification_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fill with today's date
                  </p>
                </div>
              )}
            </div>

            {/* LOA */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
              <input
                type="checkbox"
                  id="loa"
                checked={formData.loa}
                onChange={(e) => setFormData({ ...formData, loa: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
                <label htmlFor="loa" className="text-sm font-medium text-gray-700">
                  LOA (Letter of Acceptance)
                </label>
              </div>
              {formData.loa && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LOA Date
                  </label>
                  <input
                    type="date"
                    value={formData.loa_date}
                    onChange={(e) => setFormData({ ...formData, loa_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fill with today's date
                  </p>
                </div>
              )}
            </div>

            {/* Work Order */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="work_order"
                  checked={formData.work_order}
                  onChange={(e) => setFormData({ ...formData, work_order: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="work_order" className="text-sm font-medium text-gray-700">
                  Work Order
                </label>
              </div>
              {formData.work_order && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Order Date
                  </label>
                  <input
                    type="date"
                    value={formData.work_order_date}
                    onChange={(e) => setFormData({ ...formData, work_order_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fill with today's date
                  </p>
                </div>
              )}
            </div>

            {/* Work Order Tick */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="work_order_tick"
                  checked={formData.work_order_tick}
                  onChange={(e) => setFormData({ ...formData, work_order_tick: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="work_order_tick" className="text-sm font-medium text-gray-700">
                  Work Order Tick
                </label>
              </div>
              {formData.work_order_tick && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Order Tick Date
                  </label>
                  <input
                    type="date"
                    value={formData.work_order_tick_date}
                    onChange={(e) => setFormData({ ...formData, work_order_tick_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fill with today's date
                  </p>
                </div>
              )}
            </div>

            {/* EMD Supporting */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emd_supporting"
                  checked={formData.emd_supporting}
                  onChange={(e) => setFormData({ ...formData, emd_supporting: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="emd_supporting" className="text-sm font-medium text-gray-700">
                  EMD Supporting
                </label>
              </div>
              {formData.emd_supporting && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Date
                  </label>
                  <input
                    type="date"
                    value={formData.supporting_date}
                    onChange={(e) => setFormData({ ...formData, supporting_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fill with today's date
                  </p>
                </div>
              )}
            </div>

            {/* EMD Awarded */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emd_awarded"
                  checked={formData.emd_awarded}
                  onChange={(e) => setFormData({ ...formData, emd_awarded: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="emd_awarded" className="text-sm font-medium text-gray-700">
                  EMD Awarded
                </label>
              </div>
              {formData.emd_awarded && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Awarded Date
                  </label>
                  <input
                    type="date"
                    value={formData.awarded_date}
                    onChange={(e) => setFormData({ ...formData, awarded_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fill with today's date
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PDF Upload for Work Order */}
          {formData.work_order && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Work Order PDF
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="work-order-file-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="work-order-file-upload"
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {file ? file.name : editingTender?.workOrderUrl ? 'Replace PDF file' : 'Choose PDF file'}
                  </span>
            </label>
          </div>
              {file && (
                <p className="mt-2 text-xs text-green-600">
                  ✓ File selected: {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
              {editingTender?.workOrderUrl && !file && (
                <div className="mt-2">
                  <p className="text-xs text-blue-600 mb-1">
                    Current: {editingTender.workOrderUrl.split('/').pop()}
                  </p>
                  <a
                    href={editingTender.workOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    View Current PDF
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingTender ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenderFormModal;
