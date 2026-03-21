// src/components/TSFormModal.tsx - COMPLETE WITH ALL NEW FEATURES

import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, Search, ChevronDown } from 'lucide-react';
import { technicalSanctionService, TechnicalSanction } from '../services/technicalSanctionService';
import { grService } from '../services/grService';
import { useAuth } from '../contexts/AuthContext';
import { Work } from '../types/work';
import { GR } from '../types/work';

interface TSFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  works: Work[];
  editingTS?: TechnicalSanction | null;
}

const TSFormModal: React.FC<TSFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  works,
  editingTS = null
}) => {
  const { isDemoMode } = useAuth();
  // Base input values
  const [formData, setFormData] = useState({
    work: '',
    sub_name: '',  // NEW: TS Sub Name
    work_portion: '',
    royalty: '',
    testing: '',
    consultancy: '',
    gst_percentage: '18',
    contingency_percentage: '4',
    labour_insurance_percentage: '1',
    noting: false,
    order: false,
    noting_date: '',  // NEW: Manual date
    order_date: '',   // NEW: Manual date
  });

  // Calculated values (can be overridden)
  const [calculatedValues, setCalculatedValues] = useState({
    gst_amount: 0,
    contingency_amount: 0,
    labour_insurance_amount: 0,
    grand_total: 0,
    final_total: 0,
  });

  // NEW: GR selection state
  const [grs, setGrs] = useState<GR[]>([]);
  const [selectedGR, setSelectedGR] = useState<number | null>(null);
  const [loadingGRs, setLoadingGRs] = useState(false);
  
  // Dropdown states for GR
  const [grSearchQuery, setGrSearchQuery] = useState('');
  const [isGrDropdownOpen, setIsGrDropdownOpen] = useState(false);
  const grDropdownRef = useRef<HTMLDivElement>(null);
  
  // Dropdown states for Work
  const [workSearchQuery, setWorkSearchQuery] = useState('');
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = useState(false);
  const workDropdownRef = useRef<HTMLDivElement>(null);

  // Filter works by selected GR and search query
  const filteredWorks = works.filter((work) => {
    const matchesGR = !selectedGR || work.gr === selectedGR;
    const matchesSearch = work.workName.toLowerCase().includes(workSearchQuery.toLowerCase());
    return matchesGR && matchesSearch;
  });
  
  // Filter GRs by search query
  const filteredGRs = grs.filter((gr) => {
    const searchLower = grSearchQuery.toLowerCase();
    return gr.grNumber.toLowerCase().includes(searchLower);
  });

  // Override flags
  const [overrides, setOverrides] = useState({
    gst_amount: false,
    contingency_amount: false,
    labour_insurance_amount: false,
    grand_total: false,
    final_total: false,
  });

  // Track if form is initialized to prevent premature calculations
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NEW: Fetch GRs on mount
  useEffect(() => {
    const fetchGRs = async () => {
      try {
        setLoadingGRs(true);
        const grsData = await grService.fetchAllGRs(isDemoMode);
        setGrs(grsData);
      } catch (error) {
        console.error('Error fetching GRs:', error);
      } finally {
        setLoadingGRs(false);
      }
    };
    
    if (isOpen) {
      fetchGRs();
    }
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (grDropdownRef.current && !grDropdownRef.current.contains(event.target as Node)) {
        setIsGrDropdownOpen(false);
      }
      if (workDropdownRef.current && !workDropdownRef.current.contains(event.target as Node)) {
        setIsWorkDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      initializationRef.current = false;
    }
  }, [isOpen]);

  // Initialize form when editing or opening
  useEffect(() => {
    if (editingTS && isOpen) {
      // Editing mode: populate all fields
      const selectedWork = works.find(w => w.id === editingTS.work);
      
      const workPortion = parseFloat(editingTS.workPortion?.toString() || editingTS.work_portion?.toString() || '0');
      // API returns capitalized fields (Royalty, Testing, Consultancy) as read-only
      const royalty = parseFloat(editingTS.Royalty?.toString() || editingTS.royalty?.toString() || '0');
      const testing = parseFloat(editingTS.Testing?.toString() || editingTS.testing?.toString() || '0');
      const consultancy = parseFloat(editingTS.Consultancy?.toString() || editingTS.consultancy?.toString() || '0');
      const gstPercentage = parseFloat(editingTS.gstPercentage?.toString() || '18');
      const contingencyPercentage = parseFloat(editingTS.contingencyPercentage?.toString() || '4');
      const labourPercentage = parseFloat(editingTS.labourInsurancePercentage?.toString() || '1');
      
      // Get actual values from API - these are the saved values
      const actualGst = parseFloat(editingTS.gstAmount?.toString() || '0');
      const actualGrandTotal = parseFloat(editingTS.grandTotal?.toString() || '0');
      const actualContingency = parseFloat(editingTS.contingencyAmount?.toString() || '0');
      const actualLabourInsurance = parseFloat(editingTS.labourInsuranceAmount?.toString() || '0');
      const actualFinalTotal = parseFloat(editingTS.finalTotal?.toString() || '0');
      
      setFormData({
        work: editingTS.work?.toString() || '',
        sub_name: editingTS.subName || '',
        work_portion: workPortion.toString(),
        royalty: royalty.toString(),
        testing: testing.toString(),
        consultancy: consultancy.toString(),
        gst_percentage: gstPercentage.toString(),
        contingency_percentage: contingencyPercentage.toString(),
        labour_insurance_percentage: labourPercentage.toString(),
        noting: editingTS.noting || false,
        order: editingTS.order || false,
        noting_date: editingTS.notingDate || '',
        order_date: editingTS.orderDate || '',
      });

      // Set ALL override flags to FALSE when editing
      // This allows dynamic recalculation when user changes any field
      // If user manually edits a calculated field, that override will be set to true via the onChange handler
      setOverrides({
        gst_amount: false,
        contingency_amount: false,
        labour_insurance_amount: false,
        grand_total: false,
        final_total: false,
      });

      // Initialize calculated values with actual API values
      // The calculation useEffect will then recalculate when formData changes
      setCalculatedValues({
        gst_amount: actualGst,
        contingency_amount: actualContingency,
        labour_insurance_amount: actualLabourInsurance,
        grand_total: actualGrandTotal,
        final_total: actualFinalTotal,
      });

      // Mark as initialized AFTER all state is set
      initializationRef.current = true;
      setIsInitialized(true);

      // Set the GR if editing
      if (selectedWork) {
        setSelectedGR(selectedWork.gr);
      }
    } else if (!editingTS && isOpen) {
      // Reset form for new entry
      setFormData({
        work: '',
        sub_name: '',
        work_portion: '',
        royalty: '0',
        testing: '0',
        consultancy: '0',
        gst_percentage: '18',
        contingency_percentage: '4',
        labour_insurance_percentage: '1',
        noting: false,
        order: false,
        noting_date: '',
        order_date: '',
      });
      setSelectedGR(null);
      setGrSearchQuery('');
      setWorkSearchQuery('');
      setOverrides({
        gst_amount: false,
        contingency_amount: false,
        labour_insurance_amount: false,
        grand_total: false,
        final_total: false,
      });
      initializationRef.current = true;
      setIsInitialized(true);
    }
  }, [editingTS, isOpen, works]);
  
  // Get display text functions
  const getSelectedGRText = () => {
    if (!selectedGR) return 'Select GR';
    const gr = grs.find((g) => g.id === selectedGR);
    return gr ? `${gr.grNumber} - ${new Date(gr.grDate).toLocaleDateString()}` : 'Select GR';
  };

  const getSelectedWorkText = () => {
    if (!formData.work) return 'Select Work';
    const work = works.find((w) => w.id === parseInt(formData.work));
    return work ? `${work.workName} (AA: ₹${Number(work.AA).toLocaleString('en-IN')})` : 'Select Work';
  };

  // Calculate all values whenever inputs change
  useEffect(() => {
    // Don't calculate until form is initialized (prevents overwriting values when editing)
    // Also check if formData has valid values (not empty strings)
    if (!isInitialized || !initializationRef.current) return;
    if (!formData.work_portion || formData.work_portion === '') return;

    const workPortion = parseFloat(formData.work_portion) || 0;
    const royalty = parseFloat(formData.royalty) || 0;
    const testing = parseFloat(formData.testing) || 0;
    const consultancy = parseFloat(formData.consultancy) || 0;
    const gstPercentage = parseFloat(formData.gst_percentage) || 0;
    const contingencyPercentage = parseFloat(formData.contingency_percentage) || 0;
    const labourPercentage = parseFloat(formData.labour_insurance_percentage) || 0;

    // Use functional update to read current state and preserve overridden values
    setCalculatedValues((prevValues) => {
      // GST calculated on work_portion only
      const gstAmount = !overrides.gst_amount
        ? (workPortion * gstPercentage) / 100
        : prevValues.gst_amount;

      // Grand total = work_portion + royalty + testing + gst
      // Use calculated gst if not overridden, otherwise use preserved gst
      const gstForGrandTotal = !overrides.gst_amount ? gstAmount : prevValues.gst_amount;
      const calculatedGrandTotal = workPortion + royalty + testing + gstForGrandTotal;
      const grandTotal = !overrides.grand_total
        ? calculatedGrandTotal
        : prevValues.grand_total;

      // Contingency calculated on work_portion only (NOT on grand_total)
      // Matching backend: calculate_contingency() uses work_portion
      const calculatedContingency = (workPortion * contingencyPercentage) / 100;
      const contingencyAmount = !overrides.contingency_amount
        ? calculatedContingency
        : prevValues.contingency_amount;

      // Labour insurance calculated on work_portion only (NOT on grand_total)
      // Matching backend: calculate_labour_insurance() uses work_portion
      const calculatedLabourInsurance = (workPortion * labourPercentage) / 100;
      const labourAmount = !overrides.labour_insurance_amount
        ? calculatedLabourInsurance
        : prevValues.labour_insurance_amount;

      // Final total = work_portion + royalty + testing + gst + consultancy + contingency + labour_insurance
      // Matching backend: calculate_final_total()
      const calculatedFinalTotal = workPortion + royalty + testing + gstForGrandTotal + consultancy + contingencyAmount + labourAmount;
      const finalTotal = !overrides.final_total
        ? calculatedFinalTotal
        : prevValues.final_total;

      return {
        gst_amount: gstAmount,
        contingency_amount: contingencyAmount,
        labour_insurance_amount: labourAmount,
        grand_total: grandTotal,
        final_total: finalTotal,
      };
    });
  }, [
    formData.work_portion,
    formData.royalty,
    formData.testing,
    formData.consultancy,
    formData.gst_percentage,
    formData.contingency_percentage,
    formData.labour_insurance_percentage,
    overrides.gst_amount,
    overrides.grand_total,
    overrides.contingency_amount,
    overrides.labour_insurance_amount,
    overrides.final_total,
    isInitialized,
  ]);

  // NEW: Auto-fill today's date when checkbox is checked without date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (formData.noting && !formData.noting_date) {
      setFormData(prev => ({ ...prev, noting_date: today }));
    }
    if (formData.order && !formData.order_date) {
      setFormData(prev => ({ ...prev, order_date: today }));
    }
  }, [formData.noting, formData.order]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        work: parseInt(formData.work),
        sub_name: formData.sub_name || '',  // NEW: Include sub_name
        work_portion: parseFloat(formData.work_portion),
        royalty: parseFloat(formData.royalty) || 0,
        testing: parseFloat(formData.testing) || 0,
        consultancy: parseFloat(formData.consultancy) || 0,
        gst_percentage: parseFloat(formData.gst_percentage),
        contingency_percentage: parseFloat(formData.contingency_percentage),
        labour_insurance_percentage: parseFloat(formData.labour_insurance_percentage),
        noting: formData.noting,
        order: formData.order,
        noting_date: formData.noting_date || null,  // NEW: Include noting_date
        order_date: formData.order_date || null,    // NEW: Include order_date
      };

      // Always send calculated values - backend will use them if override flags are False
      // Only set override flags if user has manually edited those fields
      // The backend serializer will set override flags based on whether these fields are in the payload
      // If a field is NOT in the payload, the backend will clear its override flag and recalculate
      
      // For override fields: only include if override flag is true (user manually edited)
      // This tells the backend to set the override flag and use this value
      if (overrides.gst_amount) {
        payload.gst = calculatedValues.gst_amount;
      }
      if (overrides.grand_total) {
        payload.grand_total = calculatedValues.grand_total;
      }
      if (overrides.contingency_amount) {
        payload.contingency = calculatedValues.contingency_amount;
      }
      if (overrides.labour_insurance_amount) {
        payload.labour_insurance = calculatedValues.labour_insurance_amount;
      }
      if (overrides.final_total) {
        payload.final_total = calculatedValues.final_total;
      }
      
      // Note: If override flags are false, we don't send these fields,
      // which tells the backend to clear the override flags and recalculate

      if (editingTS) {
        await technicalSanctionService.updateTechnicalSanction(editingTS.id.toString(), payload, isDemoMode);
      } else {
        await technicalSanctionService.createTechnicalSanction(payload, isDemoMode);
      }

      // Call the onSubmit callback to refresh data
      await onSubmit();
      onClose();
    } catch (err: any) {
      console.error('Error saving technical sanction:', err);
      setError(err.response?.data?.message || 'Failed to save technical sanction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingTS ? 'Edit Technical Sanction' : 'Add Technical Sanction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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

          {/* NEW: GR Selection - Searchable Dropdown */}
          {!editingTS && (
            <div ref={grDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select GR (Government Resolution) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsGrDropdownOpen(!isGrDropdownOpen)}
                disabled={loading || loadingGRs}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={selectedGR ? 'text-gray-900' : 'text-gray-500'}>
                  {loadingGRs ? 'Loading GRs...' : getSelectedGRText()}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isGrDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {isGrDropdownOpen && !loadingGRs && (
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
                            setSelectedGR(gr.id);
                            setFormData({ ...formData, work: '' }); // Reset work when GR changes
                            setIsGrDropdownOpen(false);
                            setGrSearchQuery('');
                          }}
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
                        {grSearchQuery ? `No GRs found matching "${grSearchQuery}"` : 'No GRs available'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!selectedGR && !loadingGRs && (
                <p className="mt-1 text-sm text-gray-500">
                  Please select a GR to see related works
                </p>
              )}
            </div>
          )}

          {/* Select Work - Searchable Dropdown */}
          {!editingTS && (
            <div ref={workDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Work <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsWorkDropdownOpen(!isWorkDropdownOpen)}
                disabled={loading || !selectedGR}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={formData.work ? 'text-gray-900' : 'text-gray-500'}>
                  {getSelectedWorkText()}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isWorkDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>

              {isWorkDropdownOpen && selectedGR && (
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
                              setSelectedGR(work.gr);
                              setFormData({ ...formData, work: work.id.toString() });
                              setIsWorkDropdownOpen(false);
                              setWorkSearchQuery('');
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
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span>{work.workName}</span>
                                {isCancelled && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    Cancelled
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                AA: ₹{Number(work.AA).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        {workSearchQuery ? `No works found matching "${workSearchQuery}"` : 'No works found for selected GR'}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {filteredWorks.length === 0 && selectedGR && !isWorkDropdownOpen && (
                <p className="mt-1 text-sm text-red-500">
                  No works found for selected GR
                </p>
              )}
            </div>
          )}
          
          {/* Show work as read-only when editing */}
          {editingTS && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work
              </label>
              <input
                type="text"
                value={works.find(w => w.id === editingTS.work)?.workName || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          )}

          {/* TS Sub Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TS Sub Name (Optional)
            </label>
            <input
              type="text"
              value={formData.sub_name}
              onChange={(e) => setFormData({ ...formData, sub_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Phase 1, Section A, etc."
            />
          </div>

          {/* Recapitulation Sheet Layout - Following Financial Statement Flow */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Sanction Amounts (Recapitulation Sheet)</h3>
            
            {/* Row 1: Work Portion */}
            <div className="border border-gray-300 rounded-t-lg overflow-hidden">
              <div className="flex items-center bg-white">
                <div className="flex-1 px-4 py-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Portion *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.work_portion}
                    onChange={(e) => setFormData({ ...formData, work_portion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Enter work portion"
                  />
                </div>
              </div>

              {/* Row 2: Royalty */}
              <div className="flex items-center bg-white border-t">
                <div className="flex-1 px-4 py-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Royalty Charges
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.royalty}
                    onChange={(e) => setFormData({ ...formData, royalty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter royalty"
                  />
                </div>
              </div>

              {/* Row 3: Testing */}
              <div className="flex items-center bg-white border-t">
                <div className="flex-1 px-4 py-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Control Testing Charges
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.testing}
                    onChange={(e) => setFormData({ ...formData, testing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter testing"
                  />
                </div>
              </div>

              {/* Subtotal 1 */}
              <div className="flex items-center bg-gray-200 border-t font-bold">
                <div className="flex-1 px-4 py-3">
                  <span className="text-sm text-gray-900">TOTAL (Work Portion)</span>
                </div>
                <div className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-900">
                    ₹{((parseFloat(formData.work_portion) || 0) + (parseFloat(formData.royalty) || 0) + (parseFloat(formData.testing) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Row 4: GST */}
              <div className="flex items-center bg-white border-t">
                <div className="flex-1 px-4 py-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add <span className="text-blue-600 font-semibold">{formData.gst_percentage || '18'}%</span> for G.S.T.
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.gst_percentage}
                    onChange={(e) => setFormData({ ...formData, gst_percentage: e.target.value })}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="18"
                  />
                  <span className="ml-2 text-xs text-gray-600">%</span>
                </div>
                <div className="px-4 py-3 text-right min-w-[150px]">
                  <input
                    type="number"
                    step="0.01"
                    value={calculatedValues.gst_amount.toFixed(2)}
                    onChange={(e) => {
                      setCalculatedValues({ ...calculatedValues, gst_amount: parseFloat(e.target.value) || 0 });
                      setOverrides({ ...overrides, gst_amount: true });
                    }}
                    className={`w-full px-3 py-1 border rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      overrides.gst_amount ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Subtotal 2 */}
              <div className="flex items-center bg-gray-200 border-t font-bold">
                <div className="flex-1 px-4 py-3">
                  <span className="text-sm text-gray-900">TOTAL (Grand Total)</span>
                </div>
                <div className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-900">
                    ₹{calculatedValues.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Row 5: Labour Insurance */}
              <div className="flex items-center bg-white border-t">
                <div className="flex-1 px-4 py-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add <span className="text-purple-600 font-semibold">{formData.labour_insurance_percentage || '1'}%</span> Labour Insurance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.labour_insurance_percentage}
                    onChange={(e) => setFormData({ ...formData, labour_insurance_percentage: e.target.value })}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1"
                  />
                  <span className="ml-2 text-xs text-gray-600">%</span>
                </div>
                <div className="px-4 py-3 text-right min-w-[150px]">
                  <input
                    type="number"
                    step="0.01"
                    value={calculatedValues.labour_insurance_amount.toFixed(2)}
                    onChange={(e) => {
                      setCalculatedValues({ ...calculatedValues, labour_insurance_amount: parseFloat(e.target.value) || 0 });
                      setOverrides({ ...overrides, labour_insurance_amount: true });
                    }}
                    className={`w-full px-3 py-1 border rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      overrides.labour_insurance_amount ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Subtotal 3 */}
              <div className="flex items-center bg-gray-200 border-t font-bold">
                <div className="flex-1 px-4 py-3">
                  <span className="text-sm text-gray-900">TOTAL (After Labour Insurance)</span>
                </div>
                <div className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-900">
                    ₹{(calculatedValues.grand_total + calculatedValues.labour_insurance_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Row 6: Contingency (Green) */}
              <div className="flex items-center bg-green-50 border-t">
                <div className="flex-1 px-4 py-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add <span className="text-green-600 font-semibold">{formData.contingency_percentage || '4'}%</span> Contingency
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.contingency_percentage}
                    onChange={(e) => setFormData({ ...formData, contingency_percentage: e.target.value })}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="4"
                  />
                  <span className="ml-2 text-xs text-gray-600">%</span>
                </div>
                <div className="px-4 py-3 text-right min-w-[150px]">
                  <input
                    type="number"
                    step="0.01"
                    value={calculatedValues.contingency_amount.toFixed(2)}
                    onChange={(e) => {
                      setCalculatedValues({ ...calculatedValues, contingency_amount: parseFloat(e.target.value) || 0 });
                      setOverrides({ ...overrides, contingency_amount: true });
                    }}
                    className={`w-full px-3 py-1 border rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      overrides.contingency_amount ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Row 7: Consultancy (Green) */}
              <div className="flex items-center bg-green-50 border-t">
                <div className="flex-1 px-4 py-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Consultancy Charges
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.consultancy}
                    onChange={(e) => setFormData({ ...formData, consultancy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter consultancy"
                  />
                </div>
              </div>

              {/* Subtotal 4 */}
              <div className="flex items-center bg-gray-200 border-t font-bold">
                <div className="flex-1 px-4 py-3">
                  <span className="text-sm text-gray-900">TOTAL</span>
                </div>
                <div className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-900">
                    ₹{calculatedValues.final_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Final Say */}
              <div className="flex items-center bg-gray-300 border-t rounded-b-lg font-bold">
                <div className="flex-1 px-4 py-3">
                  <span className="text-sm text-gray-900">Say (Final Total)</span>
                </div>
                <div className="px-4 py-3 text-right text-lg text-gray-900">
                  ₹{calculatedValues.final_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Dates */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status & Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Noting */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="noting"
                    checked={formData.noting}
                    onChange={(e) => setFormData({ ...formData, noting: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Noting</span>
                </label>
                {formData.noting && (
                  <input
                    type="date"
                    value={formData.noting_date}
                    onChange={(e) => setFormData({ ...formData, noting_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ml-7"
                  />
                )}
              </div>

              {/* Order */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="order"
                    checked={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Order</span>
                </label>
                {formData.order && (
                  <input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ml-7"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingTS ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TSFormModal;
