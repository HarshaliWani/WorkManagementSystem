// src/components/BillFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, Search, ChevronDown, Upload, FileText } from 'lucide-react';
import { billService } from '../services/billService';
import { tenderService } from '../services/tenderService';
import { grService } from '../services/grService';
import { workService } from '../services/workService';
import { useAuth } from '../contexts/AuthContext';
import { GR } from '../types/work';
import { Work } from '../types/work';
import { getMediaUrl } from '../utils/apiUrl';

interface Tender {
  id: number;
  tenderNumber: string;
  tenderName: string;
  workId: number;
  workName: string;
}

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  editingBill?: any | null;
}

const BillFormModal: React.FC<BillFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBill = null,
}) => {
  const { isDemoMode } = useAuth();
  // Base input values
  const [formData, setFormData] = useState({
    gr: '',
    work: '',
    tender: '',
    bill_number: '',
    date: '',
    payment_done_from_gr: '',
    work_portion: '',
    royalty_and_testing: '',
    gst_percentage: '18',
    reimbursement_of_insurance: '',
    security_deposit: '',
    tds_percentage: '2',
    gst_on_workportion_percentage: '2',
    lwc_percentage: '1',
    insurance: '',
    royalty: '',
  });

  const [grs, setGrs] = useState<GR[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Dropdown states for GR
  const [grSearchQuery, setGrSearchQuery] = useState('');
  const [isGrDropdownOpen, setIsGrDropdownOpen] = useState(false);
  const grDropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown states for Work
  const [workSearchQuery, setWorkSearchQuery] = useState('');
  const [isWorkDropdownOpen, setIsWorkDropdownOpen] = useState(false);
  const workDropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown states for Tender
  const [tenderSearchQuery, setTenderSearchQuery] = useState('');
  const [isTenderDropdownOpen, setIsTenderDropdownOpen] = useState(false);
  const tenderDropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown states for Payment Done From GR
  const [paymentGrSearchQuery, setPaymentGrSearchQuery] = useState('');
  const [isPaymentGrDropdownOpen, setIsPaymentGrDropdownOpen] = useState(false);
  const paymentGrDropdownRef = useRef<HTMLDivElement>(null);

  // Calculated values (can be overridden)
  const [calculatedValues, setCalculatedValues] = useState({
    gst: 0,
    bill_total: 0,
    tds: 0,
    gst_on_workportion: 0,
    lwc: 0,
    net_amount: 0,
  });

  // Override flags
  const [overrides, setOverrides] = useState({
    gst: false,
    bill_total: false,
    tds: false,
    gst_on_workportion: false,
    lwc: false,
    net_amount: false,
  });

  // Track if form is initialized to prevent premature calculations
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch GRs on mount
  useEffect(() => {
    if (isOpen) {
      fetchGRs();
      fetchWorks();
      loadTenders();
    }
  }, [isOpen]);

  // Fetch works when GR is selected
  useEffect(() => {
    if (formData.gr && isOpen) {
      fetchWorksByGR();
    }
  }, [formData.gr, isOpen]);

  // Fetch tenders when work is selected
  useEffect(() => {
    if (formData.work && isOpen) {
      fetchTendersByWork();
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
      if (tenderDropdownRef.current && !tenderDropdownRef.current.contains(event.target as Node)) {
        setIsTenderDropdownOpen(false);
      }
      if (paymentGrDropdownRef.current && !paymentGrDropdownRef.current.contains(event.target as Node)) {
        setIsPaymentGrDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchGRs = async () => {
    try {
      const data = await grService.fetchAllGRs();
      setGrs(data);
    } catch (error) {
      console.error('Error fetching GRs:', error);
    }
  };

  const fetchWorks = async () => {
    try {
      const data = await workService.fetchAllWorks();
      setWorks(data);
    } catch (error) {
      console.error('Error fetching works:', error);
    }
  };

  const fetchWorksByGR = async () => {
    try {
      const data = await workService.fetchAllWorks();
      setWorks(data.filter((w: Work) => w.gr === parseInt(formData.gr)));
    } catch (error) {
      console.error('Error fetching works:', error);
    }
  };

  const fetchTendersByWork = async () => {
    try {
      const data = await tenderService.fetchAllTenders(isDemoMode);
      setTenders(data.filter((t: Tender) => t.workId === parseInt(formData.work)));
    } catch (error) {
      console.error('Error fetching tenders:', error);
    }
  };

  // Filtered lists for dropdowns
  const filteredGRs = grs.filter((gr) => {
    const searchLower = grSearchQuery.toLowerCase();
    return gr.grNumber.toLowerCase().includes(searchLower);
  });

  const filteredWorks = works.filter((work) => {
    const matchesSearch = work.workName.toLowerCase().includes(workSearchQuery.toLowerCase());
    const matchesGR = !formData.gr || work.gr === parseInt(formData.gr);
    return matchesSearch && matchesGR;
  });

  const filteredTenders = tenders.filter((tender) => {
    const searchLower = tenderSearchQuery.toLowerCase();
    const matchesTenderNumber = tender.tenderNumber.toLowerCase().includes(searchLower);
    const matchesWork = !formData.work || tender.workId === parseInt(formData.work);
    return matchesTenderNumber && matchesWork;
  });

  const filteredPaymentGRs = grs.filter((gr) => {
    const searchLower = paymentGrSearchQuery.toLowerCase();
    return gr.grNumber.toLowerCase().includes(searchLower);
  });

  // Helper functions for dropdowns
  const getSelectedGRText = () => {
    if (!formData.gr) return 'Select GR';
    const gr = grs.find((g) => g.id === parseInt(formData.gr));
    return gr ? `${gr.grNumber} - ${new Date(gr.grDate).toLocaleDateString()}` : 'Select GR';
  };

  const getSelectedWorkText = () => {
    if (!formData.work) return 'Select Work';
    const work = works.find((w) => w.id === parseInt(formData.work));
    return work ? `${work.workName} (AA: ₹${Number(work.AA).toLocaleString('en-IN')})` : 'Select Work';
  };

  const getSelectedTenderText = () => {
    if (!formData.tender) return 'Select Tender';
    const tender = tenders.find((t) => t.id === parseInt(formData.tender));
    return tender ? `${tender.tenderNumber} - ${tender.tenderName || ''}` : 'Select Tender';
  };

  const getSelectedPaymentGRText = () => {
    if (!formData.payment_done_from_gr) return 'Select GR';
    const gr = grs.find((g) => g.id === parseInt(formData.payment_done_from_gr));
    return gr ? `${gr.grNumber} - ${new Date(gr.grDate).toLocaleDateString()}` : 'Select GR';
  };

  // Auto-fill logic: When tender is selected, auto-fill work and GR
  useEffect(() => {
    if (formData.tender && !editingBill) {
      const selectedTender = tenders.find(t => t.id === parseInt(formData.tender));
      if (selectedTender && selectedTender.workId) {
        const selectedWork = works.find(w => w.id === selectedTender.workId);
        if (selectedWork) {
          setFormData(prev => ({
            ...prev,
            work: selectedWork.id.toString(),
            gr: selectedWork.gr.toString()
          }));
        }
      }
    }
  }, [formData.tender]);

  // Auto-fill logic: When work is selected, auto-fill GR
  useEffect(() => {
    if (formData.work && !editingBill) {
      const selectedWork = works.find(w => w.id === parseInt(formData.work));
      if (selectedWork) {
        setFormData(prev => ({
          ...prev,
          gr: selectedWork.gr.toString()
        }));
      }
    }
  }, [formData.work]);

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      initializationRef.current = false;
    }
  }, [isOpen]);

  // ✅ INITIALIZE FORM WHEN EDITING
  useEffect(() => {
    if (editingBill && isOpen) {
      // First, ensure initialization flags are false to prevent calculations
      initializationRef.current = false;
      setIsInitialized(false);
      
      // Load ALL values from API exactly as stored (including overridden calculated fields)
      setFormData({
        gr: '',
        work: '',
        tender: editingBill.tenderId?.toString() || '',
        bill_number: editingBill.billNumber || '',
        date: editingBill.billDate || '',
        payment_done_from_gr: editingBill.paymentDoneFromGrId?.toString() || '',
        work_portion: editingBill.workPortion?.toString() || '',
        royalty_and_testing: editingBill.RoyaltyAndTesting?.toString() || '0',
        gst_percentage: editingBill.gstPercentage?.toString() || '18',
        reimbursement_of_insurance: editingBill.ReimbursementOfInsurance?.toString() || '0',
        security_deposit: editingBill.SecurityDeposit?.toString() || '0',
        tds_percentage: editingBill.tdsPercentage?.toString() || '2',
        gst_on_workportion_percentage: editingBill.gstOnWorkportionPercentage?.toString() || '2',
        lwc_percentage: editingBill.lwcPercentage?.toString() || '1',
        insurance: editingBill.Insurance?.toString() || '0',
        royalty: editingBill.Royalty?.toString() || '0',
      });

      // Initialize calculated values with actual API values (including overridden values)
      // Do NOT recalculate - just use the stored values exactly as they are in the database
      // Priority: Use the primary field names from the API response
      setCalculatedValues({
        gst: parseFloat(editingBill.gstAmount?.toString() || editingBill.gst?.toString() || '0') || 0,
        bill_total: parseFloat(editingBill.billTotal?.toString() || editingBill.bill_total?.toString() || '0') || 0,
        tds: parseFloat(editingBill.tdsAmount?.toString() || editingBill.tds?.toString() || '0') || 0,
        gst_on_workportion: parseFloat(editingBill.gstOnWorkPortion?.toString() || editingBill.gst_on_workportion?.toString() || '0') || 0,
        lwc: parseFloat(editingBill.lwcAmount?.toString() || editingBill.lwc?.toString() || '0') || 0,
        net_amount: parseFloat(editingBill.netAmount?.toString() || editingBill.net_amount?.toString() || '0') || 0,
      });

      // Set ALL override flags to FALSE when editing
      // This allows dynamic recalculation when user changes any field
      // If user manually edits a calculated field, that override will be set to true via the onChange handler
      setOverrides({
        gst: false,
        bill_total: false,
        tds: false,
        gst_on_workportion: false,
        lwc: false,
        net_amount: false,
      });

      // Mark as initialized AFTER all state is set
      // Use setTimeout to ensure all state updates are processed before marking as initialized
      // This prevents the calculation useEffect from running until after API values are set
      setTimeout(() => {
        initializationRef.current = true;
        setIsInitialized(true);
      }, 10);
    } else if (!editingBill && isOpen) {
      // Reset form for new entry
      setFormData({
        gr: '',
        work: '',
        tender: '',
        bill_number: '',
        date: '',
        payment_done_from_gr: '',
        work_portion: '',
        royalty_and_testing: '0',
        gst_percentage: '18',
        reimbursement_of_insurance: '0',
        security_deposit: '0',
        tds_percentage: '2',
        gst_on_workportion_percentage: '2',
        lwc_percentage: '1',
        insurance: '0',
        royalty: '0',
      });
      setCalculatedValues({
        gst: 0,
        bill_total: 0,
        tds: 0,
        gst_on_workportion: 0,
        lwc: 0,
        net_amount: 0,
      });
      setOverrides({
        gst: false,
        bill_total: false,
        tds: false,
        gst_on_workportion: false,
        lwc: false,
        net_amount: false,
      });
      initializationRef.current = true;
      setIsInitialized(true);
    }
  }, [editingBill, isOpen]);

  // ✅ DYNAMIC CALCULATIONS - Calculate all values whenever inputs change
  useEffect(() => {
    // Don't calculate until form is initialized (prevents overwriting values when editing)
    // Also check if formData has valid values (not empty strings)
    if (!isInitialized || !initializationRef.current) return;
    if (!formData.work_portion || formData.work_portion === '') return;

    const workPortion = parseFloat(formData.work_portion) || 0;
    const royaltyTesting = parseFloat(formData.royalty_and_testing) || 0;
    const gstPercentage = parseFloat(formData.gst_percentage) || 0;
    const reimbursement = parseFloat(formData.reimbursement_of_insurance) || 0;
    const securityDeposit = parseFloat(formData.security_deposit) || 0;
    const tdsPercentage = parseFloat(formData.tds_percentage) || 0;
    const gstWorkPortionPercentage = parseFloat(formData.gst_on_workportion_percentage) || 0;
    const lwcPercentage = parseFloat(formData.lwc_percentage) || 0;
    const insurance = parseFloat(formData.insurance) || 0;
    const royalty = parseFloat(formData.royalty) || 0;

    // Use functional update to read current state and preserve overridden values
    setCalculatedValues((prevValues) => {
      // GST calculated on work_portion only
      const gst = !overrides.gst
        ? Number((workPortion * gstPercentage) / 100)
        : Number(prevValues.gst);

      // Bill Total = work_portion + royalty_and_testing + gst + reimbursement_of_insurance
      // Use calculated gst if not overridden, otherwise use preserved gst
      const gstForBillTotal = !overrides.gst ? gst : prevValues.gst;
      const billTotal = !overrides.bill_total
        ? Number(workPortion + royaltyTesting + gstForBillTotal + reimbursement)
        : Number(prevValues.bill_total);

      // TDS on work_portion
      const tds = !overrides.tds
        ? Number((workPortion * tdsPercentage) / 100)
        : Math.abs(Number(prevValues.tds)); // Ensure positive if overridden

      // GST on work portion
      const gstOnWorkPortion = !overrides.gst_on_workportion
        ? Number((workPortion * gstWorkPortionPercentage) / 100)
        : Math.abs(Number(prevValues.gst_on_workportion)); // Ensure positive if overridden

      // LWC on (work_portion + royalty_and_testing)
      const lwc = !overrides.lwc
        ? Number(((workPortion + royaltyTesting) * lwcPercentage) / 100)
        : Math.abs(Number(prevValues.lwc)); // Ensure positive if overridden

      // Ensure all deduction values are positive (use abs to handle any negative values)
      const securityDepositAbs = Math.abs(securityDeposit);
      const insuranceAbs = Math.abs(insurance);
      const royaltyAbs = Math.abs(royalty);

      // Net Amount = bill_total - tds - gst_on_workportion - security_deposit - lwc - insurance - royalty
      // Use the actual billTotal (which may be overridden) for net amount calculation
      const netAmount = !overrides.net_amount
        ? (billTotal - tds - gstOnWorkPortion - securityDepositAbs - lwc - insuranceAbs - royaltyAbs)
        : (prevValues.net_amount);

      return {
        gst,
        bill_total: billTotal,
        tds,
        gst_on_workportion: gstOnWorkPortion,
        lwc,
        net_amount: netAmount,
      };
    });
  }, [
    formData.work_portion,
    formData.royalty_and_testing,
    formData.gst_percentage,
    formData.reimbursement_of_insurance,
    formData.security_deposit,
    formData.tds_percentage,
    formData.gst_on_workportion_percentage,
    formData.lwc_percentage,
    formData.insurance,
    formData.royalty,
    overrides.gst,
    overrides.bill_total,
    overrides.tds,
    overrides.gst_on_workportion,
    overrides.lwc,
    overrides.net_amount,
    // Note: isInitialized is NOT in dependency array - we only check it at the start
    // This prevents recalculation when initialization completes
  ]);

  const loadTenders = async () => {
    try {
      const data = await tenderService.fetchAllTenders(isDemoMode);
      setTenders(data);
    } catch (error) {
      console.error('Error loading tenders:', error);
      setError('Failed to load tenders');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      
      submitData.append('bill_number', formData.bill_number);
      if (formData.date) submitData.append('date', formData.date);
      submitData.append('work_portion', formData.work_portion);
      submitData.append('royalty_and_testing', formData.royalty_and_testing || '0');
      submitData.append('gst_percentage', formData.gst_percentage);
      submitData.append('reimbursement_of_insurance', formData.reimbursement_of_insurance || '0');
      submitData.append('security_deposit', formData.security_deposit || '0');
      submitData.append('tds_percentage', formData.tds_percentage);
      submitData.append('gst_on_workportion_percentage', formData.gst_on_workportion_percentage);
      submitData.append('lwc_percentage', formData.lwc_percentage);
      submitData.append('insurance', formData.insurance || '0');
      submitData.append('royalty', formData.royalty || '0');

      // Add tender for new bills only
      if (!editingBill) {
        submitData.append('tender', formData.tender);
      }

      // Add payment_done_from_gr if selected
      if (formData.payment_done_from_gr) {
        submitData.append('payment_done_from_gr', formData.payment_done_from_gr);
      }

      // Add overridden values if any
      if (overrides.gst) submitData.append('gst', calculatedValues.gst.toString());
      if (overrides.bill_total) submitData.append('bill_total', calculatedValues.bill_total.toString());
      if (overrides.tds) submitData.append('tds', calculatedValues.tds.toString());
      if (overrides.gst_on_workportion) submitData.append('gst_on_workportion', calculatedValues.gst_on_workportion.toString());
      if (overrides.lwc) submitData.append('lwc', calculatedValues.lwc.toString());
      if (overrides.net_amount) submitData.append('net_amount', calculatedValues.net_amount.toString());

      // Add file if selected
      if (file) {
        submitData.append('document', file);
      }

      if (editingBill) {
        await billService.updateBill(editingBill.id.toString(), submitData as any, isDemoMode);
      } else {
        await billService.createBill(submitData as any, isDemoMode);
      }

      await onSubmit();
      onClose();
      setFile(null);
    } catch (err: any) {
      console.error('Error saving bill:', err);
      setError(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingBill ? 'Edit Bill' : 'Add Bill'}
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

          {/* Searchable Dropdowns for GR, Work, and Tender */}
          {!editingBill && (
            <>
              {/* Select GR */}
              <div ref={grDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select GR (Government Resolution) <span className="text-red-500">*</span>
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
                          placeholder="Search GR number..."
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
                              setFormData({ ...formData, gr: gr.id.toString(), work: '', tender: '' });
                              setIsGrDropdownOpen(false);
                              setGrSearchQuery('');
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
                          {grSearchQuery ? `No GRs found matching "${grSearchQuery}"` : 'No GRs available'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Select Work */}
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
                                setFormData({ ...formData, work: work.id.toString(), tender: '' });
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
              </div>

              {/* Select Tender */}
              <div ref={tenderDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tender <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsTenderDropdownOpen(!isTenderDropdownOpen)}
                  disabled={loading || !formData.work}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={formData.tender ? 'text-gray-900' : 'text-gray-500'}>
                    {getSelectedTenderText()}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isTenderDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {isTenderDropdownOpen && formData.work && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={tenderSearchQuery}
                          onChange={(e) => setTenderSearchQuery(e.target.value)}
                          placeholder="Search tender number..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredTenders.length > 0 ? (
                        filteredTenders.map((tender) => (
                          <div
                            key={tender.id}
                            onClick={() => {
                              setFormData({ ...formData, tender: tender.id.toString() });
                              setIsTenderDropdownOpen(false);
                              setTenderSearchQuery('');
                            }}
                            className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                              formData.tender === tender.id.toString() ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{tender.tenderNumber}</span>
                              <span className="text-xs text-gray-500">{tender.tenderName || ''}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          {tenderSearchQuery ? `No tenders found matching "${tenderSearchQuery}"` : 'No tenders found for selected work'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Basic Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Number *
              </label>
              <input
                type="text"
                value={formData.bill_number}
                onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!editingBill}
                placeholder="Enter bill number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bill payment done from */}
          <div ref={paymentGrDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill payment done from
            </label>
            <button
              type="button"
              onClick={() => setIsPaymentGrDropdownOpen(!isPaymentGrDropdownOpen)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={formData.payment_done_from_gr ? 'text-gray-900' : 'text-gray-500'}>
                {getSelectedPaymentGRText()}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isPaymentGrDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isPaymentGrDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={paymentGrSearchQuery}
                      onChange={(e) => setPaymentGrSearchQuery(e.target.value)}
                      placeholder="Search GR number..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredPaymentGRs.length > 0 ? (
                    filteredPaymentGRs.map((gr) => (
                      <div
                        key={gr.id}
                        onClick={() => {
                          setFormData({ ...formData, payment_done_from_gr: gr.id.toString() });
                          setIsPaymentGrDropdownOpen(false);
                          setPaymentGrSearchQuery('');
                        }}
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                          formData.payment_done_from_gr === gr.id.toString() ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-900'
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
                      {paymentGrSearchQuery ? `No GRs found matching "${paymentGrSearchQuery}"` : 'No GRs available'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Base Input Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
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
                placeholder="Enter work portion amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Royalty & Testing
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.royalty_and_testing}
                onChange={(e) => setFormData({ ...formData, royalty_and_testing: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter royalty & testing amount"
              />
            </div>
          </div>

          {/* GST Section - FULL ROW */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">GST Calculation</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST % (default 18%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gst_percentage}
                  onChange={(e) => setFormData({ ...formData, gst_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(calculatedValues.gst || 0).toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, gst: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, gst: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${overrides.gst ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                />
                {overrides.gst && (
                  <span className="text-xs text-yellow-600">Overridden</span>
                )}
              </div>
            </div>
          </div>

          {/* Reimbursement of Insurance - FULL ROW */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reimbursement of Insurance
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.reimbursement_of_insurance}
              onChange={(e) => setFormData({ ...formData, reimbursement_of_insurance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reimbursement amount"
            />
          </div>

          {/* Bill Total - FULL ROW */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Bill Total</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Total (Calculated)
              </label>
              <input
                type="number"
                step="0.01"
                value={(calculatedValues.bill_total || 0).toFixed(2)}
                onChange={(e) => {
                  setCalculatedValues({ ...calculatedValues, bill_total: parseFloat(e.target.value) || 0 });
                  setOverrides({ ...overrides, bill_total: true });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${overrides.bill_total ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                  }`}
              />
              {overrides.bill_total && (
                <span className="text-xs text-yellow-600">Overridden</span>
              )}
            </div>
          </div>

          {/* TDS Section - FULL ROW */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">TDS</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TDS % (default 2%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tds_percentage}
                  onChange={(e) => setFormData({ ...formData, tds_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TDS Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(calculatedValues.tds || 0).toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, tds: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, tds: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${overrides.tds ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                />
                {overrides.tds && (
                  <span className="text-xs text-yellow-600">Overridden</span>
                )}
              </div>
            </div>
          </div>

          {/* GST on Work Portion Section - FULL ROW */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">GST on Work Portion</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST on Work Portion % (default 2%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gst_on_workportion_percentage}
                  onChange={(e) => setFormData({ ...formData, gst_on_workportion_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST on Work Portion Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(calculatedValues.gst_on_workportion || 0).toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, gst_on_workportion: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, gst_on_workportion: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${overrides.gst_on_workportion ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                />
                {overrides.gst_on_workportion && (
                  <span className="text-xs text-yellow-600">Overridden</span>
                )}
              </div>
            </div>
          </div>

          {/* Security Deposit - FULL ROW */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Deposit
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.security_deposit}
              onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter security deposit"
            />
          </div>

          {/* LWC Section - FULL ROW */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-indigo-900">LWC (Labour Welfare Cess)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LWC % (default 1%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lwc_percentage}
                  onChange={(e) => setFormData({ ...formData, lwc_percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LWC Amount (Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(calculatedValues.lwc || 0).toFixed(2)}
                  onChange={(e) => {
                    setCalculatedValues({ ...calculatedValues, lwc: parseFloat(e.target.value) || 0 });
                    setOverrides({ ...overrides, lwc: true });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${overrides.lwc ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                    }`}
                />
                {overrides.lwc && (
                  <span className="text-xs text-yellow-600">Overridden</span>
                )}
              </div>
            </div>
          </div>

          {/* Insurance and Royalty - TWO COLUMNS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter insurance amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Royalty
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.royalty}
                onChange={(e) => setFormData({ ...formData, royalty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter royalty amount"
              />
            </div>
          </div>

          {/* Net Amount - FULL ROW */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Totals</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Net Amount</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={(calculatedValues.net_amount || 0).toFixed(2)}
                    onChange={(e) => {
                      setCalculatedValues({ ...calculatedValues, net_amount: parseFloat(e.target.value) || 0 });
                      setOverrides({ ...overrides, net_amount: true });
                    }}
                    className={`px-3 py-2 text-lg font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${overrides.net_amount ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300'
                      }`}
                  />
                  {overrides.net_amount && (
                    <span className="text-xs text-yellow-600">Overridden</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Bill Document (PDF)
            </label>
            <div className="mt-1 flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
              {file && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {editingBill && editingBill.documentUrl && !file && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <FileText className="w-5 h-5" />
                  <a
                    href={getMediaUrl(editingBill.documentUrl) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    View existing document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingBill ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillFormModal;
